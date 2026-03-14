'use strict';

const Joi             = require('joi');
const { v4: uuidv4 } = require('uuid');
const { query, queryOne, run } = require('../storage/database');
const webhookService  = require('../services/webhookService');

const schema = Joi.object({
  url:    Joi.string().uri().required(),
  events: Joi.string().default('build.success,build.failed'),
  secret: Joi.string().max(128).allow('', null).default(null),
});

async function list(req, res, next) {
  try {
    const hooks = await query(
      'SELECT id,url,events,status,last_sent,created_at FROM webhooks WHERE user_id=? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ webhooks: hooks });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const id = uuidv4();
    await run('INSERT INTO webhooks (id,user_id,url,events,secret) VALUES (?,?,?,?,?)',
      [id, req.user.id, value.url, value.events, value.secret]);
    res.status(201).json({ id, ...value });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    const hook = await queryOne('SELECT user_id FROM webhooks WHERE id=?', [req.params.id]);
    if (!hook) return res.status(404).json({ error: 'Webhook not found' });
    if (hook.user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Access denied' });
    await run('DELETE FROM webhooks WHERE id=?', [req.params.id]);
    res.json({ message: 'Webhook deleted' });
  } catch (err) { next(err); }
}

async function test(req, res, next) {
  try {
    const hook = await queryOne('SELECT * FROM webhooks WHERE id=?', [req.params.id]);
    if (!hook) return res.status(404).json({ error: 'Webhook not found' });
    await webhookService.deliver(hook, { event: 'test', ts: new Date().toISOString() });
    res.json({ message: 'Test payload sent' });
  } catch (err) { next(err); }
}

module.exports = { list, create, remove, test };
