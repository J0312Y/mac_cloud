'use strict';

/**
 * MockMacMiniWorker
 * ─────────────────
 * Simulates one Mac mini build machine.
 *
 * Contract:
 *   - Only ONE build runs at a time.
 *   - Exposes the same interface that a real MacMiniAgent will use.
 *   - All state mutations go through the DB + WebSocket emitters.
 *
 * Future replacement:
 *   Replace this class with RealMacMiniAgent that connects via SSH/HTTP
 *   to an actual Mac mini. The BuildQueue remains untouched.
 */

const EventEmitter = require('events');
const { getDb }    = require('../storage/database');
const { emitBuildUpdate, emitLogLine } = require('../websocket/socketManager');
const { steps, randomSize }            = require('./buildScripts');
const logger = require('../utils/logger');

const SPEED = () => parseFloat(process.env.BUILD_SPEED_MULTIPLIER || '1');

// Failure simulation: 15% chance of failure (change to 0 to always succeed)
const FAILURE_RATE = parseFloat(process.env.FAILURE_RATE || '0.15');

class MockMacMiniWorker extends EventEmitter {
  constructor(id = 'mac-01') {
    super();
    this.id      = id;
    this.busy    = false;
    this.current = null; // current build id
  }

  get isAvailable() { return !this.busy; }

  /**
   * Run a build.
   * Called by BuildQueue when the worker is free.
   * @param {object} build - build row from DB
   */
  async run(build) {
    if (this.busy) throw new Error(`Worker ${this.id} is already busy`);
    this.busy    = true;
    this.current = build.id;

    const startMs = Date.now();
    logger.info(`[Worker:${this.id}] Starting build ${build.id} — ${build.project}`);

    try {
      await this._updateStatus(build, 'running');

      // Decide whether this build will succeed or fail (and how)
      const failRoll = Math.random();
      const willFail = failRoll < FAILURE_RATE;
      const failType = failRoll < FAILURE_RATE / 2 ? 'cs' : 'xc'; // CS-001 or XC-065

      // ── Phase 1: Preparing ──────────────────────────────────────────
      await this._runPhase(build, steps.preparing(build));

      // ── Phase 2: Cloning ────────────────────────────────────────────
      await this._runPhase(build, steps.cloning(build));

      // ── Phase 3: Dependencies ───────────────────────────────────────
      await this._runPhase(build, steps.dependencies(build));

      // ── Phase 4: Compiling ──────────────────────────────────────────
      await this._updateStatus(build, 'compiling');

      if (willFail) {
        const failSteps = failType === 'cs' ? steps.failed_cs(build) : steps.failed_xc(build);
        await this._runPhase(build, failSteps);

        const elapsed = this._elapsed(startMs);
        const [errorCode, errorReason] = failType === 'cs'
          ? ['CS-001', "Code signing failed: provisioning profile expired (ITMS-90168)"]
          : ['XC-065', `xcodebuild exit 65 — Swift compile error: module 'Alamofire' not found`];

        await this._finishFailed(build, { errorCode, errorReason, elapsed, startMs });
        return;
      }

      await this._runPhase(build, steps.compiling(build));

      // ── Phase 5: Packaging ──────────────────────────────────────────
      await this._updateStatus(build, 'packaging');
      await this._runPhase(build, steps.packaging(build));

      // ── Phase 6: Success ────────────────────────────────────────────
      const elapsed = this._elapsed(startMs);
      build._elapsed = elapsed;
      await this._runPhase(build, steps.success(build));
      await this._finishSuccess(build, { elapsed, startMs });

    } catch (err) {
      logger.error(`[Worker:${this.id}] Unexpected error in build ${build.id}: ${err.message}`);
      await this._finishFailed(build, {
        errorCode:   'SYS-500',
        errorReason: `Internal worker error: ${err.message}`,
        elapsed:     this._elapsed(startMs),
        startMs
      });
    } finally {
      this.busy    = false;
      this.current = null;
      logger.info(`[Worker:${this.id}] Build ${build.id} complete — worker free`);
      this.emit('free', this.id);
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  async _runPhase(build, logLines) {
    const db = getDb();
    const insertLog = db.prepare(`
      INSERT INTO build_logs (build_id, ts, kind, message)
      VALUES (?, datetime('now'), ?, ?)
    `);

    for (const line of logLines) {
      const entry = {
        ts:      new Date().toISOString(),
        kind:    line.kind,
        message: line.text
      };
      insertLog.run(build.id, line.kind, line.text);
      emitLogLine(build.id, entry);
      emitBuildUpdate(build, line.text);

      if (line.delayMs > 0) {
        await sleep(line.delayMs * SPEED());
      }
    }
  }

  async _updateStatus(build, status) {
    const db = getDb();
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE builds
      SET status = ?, updated_at = ?, started_at = COALESCE(started_at, ?)
      WHERE id = ?
    `).run(status, now, now, build.id);

    build.status     = status;
    build.started_at = build.started_at || now;

    emitBuildUpdate(build);
    logger.debug(`Build ${build.id} → ${status}`);
  }

  async _finishSuccess(build, { elapsed, startMs }) {
    const db  = getDb();
    const now = new Date().toISOString();
    const ipaSize = randomSize();
    const durationMs = Date.now() - startMs;

    db.prepare(`
      UPDATE builds
      SET status='success', finished_at=?, duration_ms=?, ipa_size=?, updated_at=?
      WHERE id=?
    `).run(now, durationMs, ipaSize, now, build.id);

    // Create artifact record
    const { v4: uuidv4 } = require('uuid');
    db.prepare(`
      INSERT OR IGNORE INTO artifacts (id, build_id, filename, size_bytes)
      VALUES (?, ?, ?, ?)
    `).run(
      uuidv4(),
      build.id,
      `${build.project}_release.ipa`,
      Math.round(parseFloat(ipaSize) * 1_048_576)
    );

    build.status      = 'success';
    build.finished_at = now;
    build.duration_ms = durationMs;
    build.ipa_size    = ipaSize;

    const webhookSvc = require('../services/webhookService');
    webhookSvc.fire('build.success', build).catch(() => {});
    emitBuildUpdate(build);
    this.emit('buildSuccess', build);
    logger.info(`✅ Build ${build.id} succeeded in ${elapsed}`);
  }

  async _finishFailed(build, { errorCode, errorReason, elapsed, startMs }) {
    const db = getDb();
    const now = new Date().toISOString();
    const durationMs = Date.now() - startMs;

    db.prepare(`
      UPDATE builds
      SET status='failed', finished_at=?, duration_ms=?, error_code=?, error_reason=?, updated_at=?
      WHERE id=?
    `).run(now, durationMs, errorCode, errorReason, now, build.id);

    build.status       = 'failed';
    build.finished_at  = now;
    build.duration_ms  = durationMs;
    build.error_code   = errorCode;
    build.error_reason = errorReason;

    const webhookSvc = require('../services/webhookService');
    webhookSvc.fire('build.failed', build).catch(() => {});
    emitBuildUpdate(build);
    this.emit('buildFailed', build);
    logger.warn(`❌ Build ${build.id} failed [${errorCode}] in ${elapsed}`);
  }

  _elapsed(startMs) {
    const ms = Date.now() - startMs;
    const m  = Math.floor(ms / 60_000);
    const s  = Math.floor((ms % 60_000) / 1000);
    return `${m}m ${s}s`;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = MockMacMiniWorker;
