'use strict';

const { query, queryOne, run } = require('../storage/database');

async function getStats(req, res, next) {
  try {
    const [uTotal]   = await query("SELECT COUNT(*) as n FROM users");
    const [uActive]  = await query("SELECT COUNT(*) as n FROM users WHERE status='active'");
    const [uSusp]    = await query("SELECT COUNT(*) as n FROM users WHERE status='suspended'");
    const [bTotal]   = await query("SELECT COUNT(*) as n FROM builds");
    const [bSuccess] = await query("SELECT COUNT(*) as n FROM builds WHERE status='success'");
    const [bFailed]  = await query("SELECT COUNT(*) as n FROM builds WHERE status='failed'");
    const [bRunning] = await query("SELECT COUNT(*) as n FROM builds WHERE status IN ('running','compiling','packaging')");
    const [bQueued]  = await query("SELECT COUNT(*) as n FROM builds WHERE status='queued'");
    const [bToday]   = await query("SELECT COUNT(*) as n FROM builds WHERE DATE(created_at)=CURDATE()");
    const [bTodayOk] = await query("SELECT COUNT(*) as n FROM builds WHERE status='success' AND DATE(created_at)=CURDATE()");

    res.json({
      users:  { total: uTotal.n, active: uActive.n, suspended: uSusp.n },
      builds: { total: bTotal.n, success: bSuccess.n, failed: bFailed.n, running: bRunning.n, queued: bQueued.n },
      today:  { builds: bToday.n, success: bTodayOk.n },
    });
  } catch (err) { next(err); }
}

async function getUsers(req, res, next) {
  try {
    const users = await query('SELECT id,name,email,role,plan,status,created_at FROM users ORDER BY created_at DESC');
    res.json({ users });
  } catch (err) { next(err); }
}

async function updateUser(req, res, next) {
  try {
    const allowed = ['name','plan','status','role'];
    const sets = [], vals = [];
    for (const k of allowed) {
      if (req.body[k] !== undefined) { sets.push(`${k}=?`); vals.push(req.body[k]); }
    }
    if (!sets.length) return res.status(400).json({ error: 'Nothing to update' });

    vals.push(req.params.id);
    await run(`UPDATE users SET ${sets.join(',')}, updated_at=NOW() WHERE id=?`, vals);

    const user = await queryOne('SELECT id,name,email,role,plan,status FROM users WHERE id=?', [req.params.id]);
    res.json({ user });
  } catch (err) { next(err); }
}

async function getAllBuilds(req, res, next) {
  try {
    const { status, user_id, limit = 50, offset = 0 } = req.query;
    const conds = [], params = [];
    if (status)  { conds.push('b.status=?');  params.push(status); }
    if (user_id) { conds.push('b.user_id=?'); params.push(user_id); }
    const where = conds.length ? ' WHERE ' + conds.join(' AND ') : '';
    const builds = await query(
      `SELECT b.*, u.name as user_name, u.email as user_email
       FROM builds b JOIN users u ON b.user_id=u.id${where}
       ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), parseInt(offset)]
    );
    res.json({ builds });
  } catch (err) { next(err); }
}

module.exports = { getStats, getUsers, updateUser, getAllBuilds };
