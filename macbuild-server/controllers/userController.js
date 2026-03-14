'use strict';

const Joi  = require('joi');
const bcrypt = require('bcryptjs');
const { query, queryOne, run } = require('../storage/database');

async function updateProfile(req, res, next) {
  try {
    const { error, value } = Joi.object({ name: Joi.string().min(1).max(100).required() }).validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    await run("UPDATE users SET name=?, updated_at=NOW() WHERE id=?", [value.name, req.user.id]);
    const user = await queryOne('SELECT id,name,email,role,plan,status FROM users WHERE id=?', [req.user.id]);
    res.json({ user });
  } catch (err) { next(err); }
}

async function changePassword(req, res, next) {
  try {
    const { current, password } = req.body;
    if (!current || !password) return res.status(400).json({ error: 'current and password required' });
    const user = await queryOne('SELECT * FROM users WHERE id=?', [req.user.id]);
    const ok   = await bcrypt.compare(current, user.password);
    if (!ok) return res.status(401).json({ error: 'Current password incorrect' });
    const hash = await bcrypt.hash(password, 12);
    await run("UPDATE users SET password=?, updated_at=NOW() WHERE id=?", [hash, req.user.id]);
    res.json({ message: 'Password updated' });
  } catch (err) { next(err); }
}

async function myStats(req, res, next) {
  try {
    const uid = req.user.id;
    const [total]     = await query("SELECT COUNT(*) as n FROM builds WHERE user_id=?", [uid]);
    const [success]   = await query("SELECT COUNT(*) as n FROM builds WHERE user_id=? AND status='success'", [uid]);
    const [failed]    = await query("SELECT COUNT(*) as n FROM builds WHERE user_id=? AND status='failed'", [uid]);
    const [thisMonth] = await query("SELECT COUNT(*) as n FROM builds WHERE user_id=? AND DATE_FORMAT(created_at,'%Y-%m')=DATE_FORMAT(NOW(),'%Y-%m')", [uid]);
    res.json({ builds: { total: total.n, success: success.n, failed: failed.n, thisMonth: thisMonth.n } });
  } catch (err) { next(err); }
}

module.exports = { updateProfile, changePassword, myStats };
