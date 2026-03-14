'use strict';

require('dotenv').config();

const express    = require('express');
const http       = require('http');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

const { initSocket }             = require('./websocket/socketManager');
const { initDb }                 = require('./storage/database');
const routes                     = require('./routes/index');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const logger                     = require('./utils/logger');

const app    = express();
const server = http.createServer(app);

const origins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',').map(s => s.trim());

app.use(cors({ origin: origins, credentials: true, methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'] }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max:      parseInt(process.env.RATE_LIMIT_MAX       || '200'),
  standardHeaders: true, legacyHeaders: false,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('[:date[iso]] :method :url :status :response-time ms',
  { stream: { write: msg => logger.info(msg.trim()) } }));

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

initSocket(server);

const PORT = parseInt(process.env.PORT || '3001');

// ── Boot: connect MySQL then start HTTP ─────────────────────────────────────
initDb()
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      logger.info(`🚀 Mac Build Cloud API running on :${PORT}`);
      logger.info(`   DB:   MySQL → ${process.env.DB_HOST||'127.0.0.1'}/${process.env.DB_NAME||'macbuild'}`);
      logger.info(`   CORS: ${origins.join(', ')}`);
      logger.info(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    });
  })
  .catch(err => {
    logger.error(`Failed to connect to MySQL: ${err.message}`);
    logger.error(`Check your .env DB_HOST / DB_USER / DB_PASS / DB_NAME`);
    process.exit(1);
  });

function shutdown(signal) {
  logger.info(`${signal} — shutting down`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10_000);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
process.on('uncaughtException',  err => logger.error(`Uncaught: ${err.stack}`));
process.on('unhandledRejection', err => logger.error(`Unhandled: ${err}`));
