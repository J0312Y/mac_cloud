'use strict';

const { createLogger, format, transports } = require('winston');
const path = require('path');
const fs   = require('fs');

const logDir = path.join(__dirname, '..', 'storage', 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const { combine, timestamp, printf, colorize, errors } = format;

const logFmt = printf(({ level, message, timestamp, stack }) =>
  `${timestamp} [${level}] ${stack || message}`
);

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFmt
  ),
  transports: [
    new transports.Console({
      format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), logFmt)
    }),
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5_000_000,
      maxFiles: 3
    }),
    new transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10_000_000,
      maxFiles: 5
    })
  ]
});

module.exports = logger;
