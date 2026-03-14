'use strict';

const Joi             = require('joi');
const crypto          = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { query, queryOne, run } = require('../storage/database');

const schema = Joi.object({
  name:   Joi.string().min(1).max(80).required(),
  scopes: Joi.string().default('builds:read'),
});

async function list(req, res, next) {
  try {
    const tokens = await query(
      'SELECT id,name,scopes,last_used,created_at FROM api_tokens WHERE user_id=? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ tokens });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const id    = uuidv4();
    const raw   = `mbc_${crypto.randomBytes(24).toString('hex')}`;
    const hash  = crypto.createHash('sha256').update(raw).digest('hex');
    await run('INSERT INTO api_tokens (id,user_id,name,token_hash,scopes) VALUES (?,?,?,?,?)',
      [id, req.user.id, value.name, hash, value.scopes]);
    res.status(201).json({ id, token: raw, name: value.name, scopes: value.scopes });
  } catch (err) { next(err); }
}

async function revoke(req, res, next) {
  try {
    const token = await queryOne('SELECT user_id FROM api_tokens WHERE id=?', [req.params.id]);
    if (!token) return res.status(404).json({ error: 'Token not found' });
    if (token.user_id !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ error: 'Access denied' });
    await run('DELETE FROM api_tokens WHERE id=?', [req.params.id]);
    res.json({ message: 'Token revoked' });
  } catch (err) { next(err); }
}

module.exports = { list, create, revoke };
