'use strict';

/**
 * WebhookService
 * ──────────────
 * Fires HTTP POST requests to user-defined webhook URLs
 * when build events occur (build.success, build.failed, build.started).
 *
 * Uses Node's built-in https/http — no extra dependencies.
 */

const https  = require('https');
const http   = require('http');
const crypto = require('crypto');
const { getDb } = require('../storage/database');
const logger    = require('../utils/logger');

/**
 * Fire all webhooks for a given event + build.
 * @param {string} event  - 'build.success' | 'build.failed' | 'build.started'
 * @param {object} build
 */
async function fire(event, build) {
  const db = getDb();
  const hooks = db.prepare(`
    SELECT * FROM webhooks
    WHERE user_id=? AND status='active' AND events LIKE ?
  `).all(build.user_id, `%${event}%`);

  if (!hooks.length) return;

  const payload = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    build: {
      id:          build.id,
      project:     build.project,
      status:      build.status,
      branch:      build.branch,
      duration_ms: build.duration_ms,
      error_code:  build.error_code   || null,
      error_reason:build.error_reason || null
    }
  });

  await Promise.allSettled(hooks.map(hook => deliverHook(hook, event, payload, db)));
}

async function deliverHook(hook, event, payload, db) {
  try {
    const sig = sign(payload, hook.secret);
    await postJson(hook.url, payload, sig);

    db.prepare(`
      UPDATE webhooks SET last_sent=datetime('now') WHERE id=?
    `).run(hook.id);

    logger.info(`Webhook ${hook.id} fired: ${event} → ${hook.url}`);
  } catch (err) {
    logger.warn(`Webhook ${hook.id} failed: ${err.message}`);
  }
}

function sign(body, secret) {
  if (!secret) return null;
  return 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
}

function postJson(url, body, signature) {
  return new Promise((resolve, reject) => {
    const parsed  = new URL(url);
    const lib     = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname,
      port:     parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path:     parsed.pathname + parsed.search,
      method:   'POST',
      headers: {
        'Content-Type':    'application/json',
        'Content-Length':  Buffer.byteLength(body),
        'User-Agent':      'MacBuildCloud-Webhook/1.0',
        'X-MBC-Event':     'build',
        ...(signature ? { 'X-MBC-Signature': signature } : {})
      },
      timeout: 10_000
    };

    const req = lib.request(options, res => {
      if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.statusCode);
      else reject(new Error(`HTTP ${res.statusCode}`));
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error',   reject);
    req.write(body);
    req.end();
  });
}

module.exports = { fire };
