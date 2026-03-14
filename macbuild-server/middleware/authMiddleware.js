'use strict';

const { verifyToken } = require('../auth/authService');

/**
 * requireAuth — verifies JWT from Authorization header.
 * Attaches req.user = { id, email, role, plan }
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = header.slice(7);
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token expired or invalid' });
  }
}

/**
 * requireAdmin — extends requireAuth, checks role === 'admin'
 */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

/**
 * optionalAuth — attaches req.user if token present, does NOT block
 */
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      req.user = verifyToken(header.slice(7));
    } catch {}
  }
  next();
}

module.exports = { requireAuth, requireAdmin, optionalAuth };
