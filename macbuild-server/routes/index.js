'use strict';

const express = require('express');
const router  = express.Router();

const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const authCtrl    = require('../controllers/authController');
const buildCtrl   = require('../controllers/buildController');
const adminCtrl   = require('../controllers/adminController');
const webhookCtrl = require('../controllers/webhookController');
const tokenCtrl   = require('../controllers/tokenController');
const userCtrl    = require('../controllers/userController');

// ── Health ───────────────────────────────────────────────────────────────────
router.get('/health', (req, res) => res.json({
  status: 'ok', version: '1.0.0',
  uptime: Math.floor(process.uptime()), ts: new Date().toISOString()
}));

// ── Auth ─────────────────────────────────────────────────────────────────────
router.post('/auth/register', authCtrl.register);
router.post('/auth/login',    authCtrl.login);
router.get( '/auth/me',       requireAuth, authCtrl.me);

// ── User ─────────────────────────────────────────────────────────────────────
router.patch('/user/profile',         requireAuth, userCtrl.updateProfile);
router.post( '/user/change-password', requireAuth, userCtrl.changePassword);
router.get(  '/user/stats',           requireAuth, userCtrl.myStats);

// ── Builds ───────────────────────────────────────────────────────────────────
router.post(  '/build',        requireAuth, buildCtrl.submitBuild);
router.get(   '/builds',       requireAuth, buildCtrl.getBuilds);
router.get(   '/build/:id',    requireAuth, buildCtrl.getBuild);
router.delete('/build/:id',    requireAuth, buildCtrl.cancelBuild);
router.get(   '/logs/:id',     requireAuth, buildCtrl.getLogs);
router.get(   '/download/:id', requireAuth, buildCtrl.downloadIpa);
router.get(   '/queue',        requireAuth, buildCtrl.getQueue);

// ── Webhooks ─────────────────────────────────────────────────────────────────
router.get(   '/webhooks',          requireAuth, webhookCtrl.list);
router.post(  '/webhooks',          requireAuth, webhookCtrl.create);
router.delete('/webhooks/:id',      requireAuth, webhookCtrl.remove);
router.post(  '/webhooks/:id/test', requireAuth, webhookCtrl.test);

// ── API Tokens ───────────────────────────────────────────────────────────────
router.get(   '/tokens',     requireAuth, tokenCtrl.list);
router.post(  '/tokens',     requireAuth, tokenCtrl.create);
router.delete('/tokens/:id', requireAuth, tokenCtrl.revoke);

// ── Admin ────────────────────────────────────────────────────────────────────
router.get(  '/admin/stats',     requireAdmin, adminCtrl.getStats);
router.get(  '/admin/users',     requireAdmin, adminCtrl.getUsers);
router.patch('/admin/users/:id', requireAdmin, adminCtrl.updateUser);
router.get(  '/admin/builds',    requireAdmin, adminCtrl.getAllBuilds);

module.exports = router;
