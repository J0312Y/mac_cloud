'use strict';

const { Server } = require('socket.io');
const jwt        = require('jsonwebtoken');
const logger     = require('../utils/logger');

let io = null;

/**
 * Initialise Socket.io on the HTTP server.
 * Called once from server.js.
 */
function initSocket(httpServer) {
  const origins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map(s => s.trim());

  io = new Server(httpServer, {
    cors: {
      origin: origins,
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout:  60_000,
    pingInterval: 25_000
  });

  // ── Auth middleware (optional — allows unauthenticated read-only) ──
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
        socket.user = payload;
      } catch {
        // allow connection without auth for public updates
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    logger.debug(`WS connected: ${socket.id} user=${socket.user?.email || 'anon'}`);

    // Client subscribes to a specific build room
    socket.on('subscribeBuild', (buildId) => {
      socket.join(`build:${buildId}`);
      logger.debug(`Socket ${socket.id} subscribed to build:${buildId}`);
    });

    socket.on('unsubscribeBuild', (buildId) => {
      socket.leave(`build:${buildId}`);
    });

    // Client subscribes to all their builds
    socket.on('subscribeUser', (userId) => {
      socket.join(`user:${userId}`);
    });

    // Admin subscribes to all builds
    socket.on('subscribeAdmin', () => {
      if (socket.user?.role === 'admin') {
        socket.join('admin');
      }
    });

    socket.on('disconnect', (reason) => {
      logger.debug(`WS disconnected: ${socket.id} reason=${reason}`);
    });
  });

  logger.info('Socket.io initialised');
  return io;
}

/** Get the io instance (must call initSocket first) */
function getIo() {
  if (!io) throw new Error('Socket.io not initialised — call initSocket(httpServer) first');
  return io;
}

// ── Emitter helpers ───────────────────────────────────────────────────────────

/**
 * Emit a build update to all subscribers.
 * @param {object} build  - full build object
 * @param {string} logLine - optional single log line
 */
function emitBuildUpdate(build, logLine = null) {
  if (!io) return;
  const payload = {
    id:            build.id,
    status:        build.status,
    project:       build.project,
    queuePosition: build.queue_position,
    startedAt:     build.started_at,
    finishedAt:    build.finished_at,
    durationMs:    build.duration_ms,
    errorReason:   build.error_reason,
    errorCode:     build.error_code,
    log:           logLine || null
  };

  // Broadcast to build room
  io.to(`build:${build.id}`).emit('buildUpdate', payload);
  // Broadcast to build owner
  io.to(`user:${build.user_id}`).emit('buildUpdate', payload);
  // Broadcast to admin room
  io.to('admin').emit('buildUpdate', payload);
}

/**
 * Emit a queue state snapshot.
 */
function emitQueueUpdate(queueSnapshot) {
  if (!io) return;
  io.emit('queueUpdate', queueSnapshot);
}

/**
 * Emit a single log line to a build's subscribers.
 */
function emitLogLine(buildId, logEntry) {
  if (!io) return;
  io.to(`build:${buildId}`).emit('logLine', { buildId, ...logEntry });
  io.to('admin').emit('logLine', { buildId, ...logEntry });
}

module.exports = { initSocket, getIo, emitBuildUpdate, emitQueueUpdate, emitLogLine };
