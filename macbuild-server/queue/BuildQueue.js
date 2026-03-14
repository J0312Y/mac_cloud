'use strict';

/**
 * BuildQueue
 * ──────────
 * Manages a FIFO queue of pending builds.
 * Dispatches builds to the MockMacMiniWorker (or future real agents).
 *
 * Architecture:
 *   API → BuildQueue.enqueue(build)
 *      → worker free? → dispatch immediately
 *      → worker busy? → hold in queue, dispatch when worker emits 'free'
 */

const EventEmitter        = require('events');
const { getDb }           = require('../storage/database');
const { emitQueueUpdate, emitBuildUpdate } = require('../websocket/socketManager');
const MockMacMiniWorker   = require('../buildEngine/MockMacMiniWorker');
const logger              = require('../utils/logger');

// Average build duration in ms (used for estimated start time)
const AVG_BUILD_MS = 5 * 60 * 1000; // 5 minutes

class BuildQueue extends EventEmitter {
  constructor() {
    super();
    this.queue  = []; // array of build objects waiting
    this.worker = new MockMacMiniWorker('mac-01');

    // When worker finishes, process next in queue
    this.worker.on('free', () => this._processNext());

    // Recover any interrupted builds on startup
    this._recoverOnStartup();
  }

  /**
   * Add a build to the queue.
   * @param {object} build - full build row from DB
   */
  enqueue(build) {
    const db = getDb();

    if (this.worker.isAvailable && this.queue.length === 0) {
      // Dispatch immediately — no waiting needed
      this._dispatch(build);
    } else {
      // Add to waiting queue
      this.queue.push(build);
      const position = this.queue.length; // 1-based

      db.prepare(`
        UPDATE builds SET status='queued', queue_position=?, updated_at=datetime('now')
        WHERE id=?
      `).run(position, build.id);

      build.status         = 'queued';
      build.queue_position = position;

      emitBuildUpdate(build);
      logger.info(`Build ${build.id} queued at position ${position}`);
    }

    this._broadcastQueueState();
  }

  /**
   * Get a snapshot of the current queue state.
   */
  getState() {
    const workerBuild = this.worker.current
      ? getDb().prepare('SELECT * FROM builds WHERE id=?').get(this.worker.current)
      : null;

    return {
      workerBusy:    !this.worker.isAvailable,
      currentBuild:  workerBuild || null,
      queueLength:   this.queue.length,
      queue: this.queue.map((b, i) => ({
        id:                b.id,
        project:           b.project,
        position:          i + 1,
        estimatedStartMs:  this._estimateStart(i)
      }))
    };
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  _dispatch(build) {
    const db = getDb();
    db.prepare(`
      UPDATE builds SET status='running', queue_position=NULL, updated_at=datetime('now')
      WHERE id=?
    `).run(build.id);
    build.status = 'running';
    emitBuildUpdate(build);
    logger.info(`Dispatching build ${build.id} to worker ${this.worker.id}`);
    this.worker.run(build).catch(err => {
      logger.error(`Worker run() threw unexpectedly: ${err.message}`);
    });
  }

  _processNext() {
    if (this.queue.length === 0) {
      logger.debug('Queue empty — worker idle');
      this._broadcastQueueState();
      return;
    }

    const next = this.queue.shift();

    // Re-number remaining queue positions
    this._renumberQueue();
    this._broadcastQueueState();
    this._dispatch(next);
  }

  _renumberQueue() {
    const db = getDb();
    const update = db.prepare(`
      UPDATE builds SET queue_position=?, updated_at=datetime('now') WHERE id=?
    `);
    this.queue.forEach((b, i) => {
      const pos = i + 1;
      b.queue_position = pos;
      update.run(pos, b.id);
      emitBuildUpdate(b);
    });
  }

  _estimateStart(index) {
    // index 0 = next after current build finishes
    const speed = parseFloat(process.env.BUILD_SPEED_MULTIPLIER || '1');
    return (index + 1) * AVG_BUILD_MS * speed;
  }

  _broadcastQueueState() {
    emitQueueUpdate(this.getState());
  }

  _recoverOnStartup() {
    // On restart, any build stuck in 'running' gets reset to 'queued'
    try {
      const db = getDb();
      const stuck = db.prepare(
        `SELECT * FROM builds WHERE status IN ('running','compiling','packaging')`
      ).all();

      for (const b of stuck) {
        db.prepare(
          `UPDATE builds SET status='queued', started_at=NULL, updated_at=datetime('now') WHERE id=?`
        ).run(b.id);
        logger.warn(`Recovered stuck build ${b.id} → queued`);
        this.queue.push(b);
      }

      if (stuck.length > 0) {
        this._renumberQueue();
        this._processNext();
      }
    } catch (err) {
      logger.error(`Queue recovery error: ${err.message}`);
    }
  }
}

// Singleton
const buildQueue = new BuildQueue();
module.exports   = buildQueue;
