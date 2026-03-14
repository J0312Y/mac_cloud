'use strict';

const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (status >= 500) logger.error(`${req.method} ${req.path} → ${status}: ${err.stack}`);
  else               logger.warn(`${req.method} ${req.path} → ${status}: ${message}`);

  res.status(status).json({
    error:  message,
    ...(process.env.NODE_ENV !== 'production' && status >= 500 && { stack: err.stack })
  });
}

function notFound(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
}

module.exports = { errorHandler, notFound };
