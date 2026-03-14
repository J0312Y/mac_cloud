'use strict';

const Joi             = require('joi');
const { v4: uuidv4 } = require('uuid');
const { query, queryOne, run } = require('../storage/database');
const buildQueue      = require('../queue/BuildQueue');
const logger          = require('../utils/logger');

const submitSchema = Joi.object({
  project:       Joi.string().min(1).max(100).required(),
  repo_url:      Joi.string().uri().required(),
  branch:        Joi.string().default('main'),
  xcode_version: Joi.string().default('15.3'),
  region:        Joi.string().valid('EU-West','US-East','US-West').default('EU-West'),
  cert_id:       Joi.string().optional(),
  profile_id:    Joi.string().optional(),
});

async function submitBuild(req, res, next) {
  try {
    const { error, value } = submitSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const id  = `bld_${uuidv4().replace(/-/g,'').slice(0,8)}`;
    const now = new Date().toISOString().slice(0,19).replace('T',' ');

    await run(`
      INSERT INTO builds (id,user_id,project,repo_url,branch,xcode_version,region,cert_id,profile_id,status,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,'pending',?,?)`,
      [id, req.user.id, value.project, value.repo_url, value.branch,
       value.xcode_version, value.region, value.cert_id||null, value.profile_id||null, now, now]
    );

    const build = await queryOne('SELECT * FROM builds WHERE id=?', [id]);
    buildQueue.enqueue(build);

    logger.info(`Build ${id} submitted by ${req.user.email}`);
    res.status(201).json({ id, status: build.status });
  } catch (err) { next(err); }
}

async function getBuilds(req, res, next) {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    const isAdmin = req.user.role === 'admin';
    const params  = [];
    const conds   = [];

    if (!isAdmin) { conds.push('b.user_id=?'); params.push(req.user.id); }
    if (status)   { conds.push('b.status=?');  params.push(status); }

    const where = conds.length ? ' WHERE ' + conds.join(' AND ') : '';
    const sql   = `SELECT b.*, u.name as user_name, u.email as user_email
                   FROM builds b JOIN users u ON b.user_id=u.id${where}
                   ORDER BY b.created_at DESC LIMIT ? OFFSET ?`;

    const builds = await query(sql, [...params, parseInt(limit), parseInt(offset)]);
    const countSql = `SELECT COUNT(*) as n FROM builds${!isAdmin?' WHERE user_id=?':''}`;
    const [{ n: total }] = await query(countSql, !isAdmin ? [req.user.id] : []);

    res.json({ builds, total, limit: +limit, offset: +offset });
  } catch (err) { next(err); }
}

async function getBuild(req, res, next) {
  try {
    const build = await queryOne(
      'SELECT b.*, u.name as user_name, u.email as user_email FROM builds b JOIN users u ON b.user_id=u.id WHERE b.id=?',
      [req.params.id]
    );
    if (!build) return res.status(404).json({ error: 'Build not found' });
    if (req.user.role !== 'admin' && build.user_id !== req.user.id)
      return res.status(403).json({ error: 'Access denied' });
    res.json({ build });
  } catch (err) { next(err); }
}

async function getLogs(req, res, next) {
  try {
    const build = await queryOne('SELECT user_id FROM builds WHERE id=?', [req.params.id]);
    if (!build) return res.status(404).json({ error: 'Build not found' });
    if (req.user.role !== 'admin' && build.user_id !== req.user.id)
      return res.status(403).json({ error: 'Access denied' });

    const logs = await query(
      'SELECT id, ts, kind, message FROM build_logs WHERE build_id=? ORDER BY id ASC',
      [req.params.id]
    );
    res.json({ buildId: req.params.id, logs });
  } catch (err) { next(err); }
}

async function downloadIpa(req, res, next) {
  try {
    const build = await queryOne('SELECT * FROM builds WHERE id=?', [req.params.id]);
    if (!build) return res.status(404).json({ error: 'Build not found' });
    if (req.user.role !== 'admin' && build.user_id !== req.user.id)
      return res.status(403).json({ error: 'Access denied' });
    if (build.status !== 'success')
      return res.status(400).json({ error: 'IPA only available for successful builds' });

    const artifact = await queryOne('SELECT * FROM artifacts WHERE build_id=?', [build.id]);
    if (!artifact) return res.status(404).json({ error: 'Artifact not found' });

    const mockIpa = generateMockIpa(build, artifact);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${artifact.filename}"`);
    res.setHeader('Content-Length', mockIpa.length);
    res.send(mockIpa);
    logger.info(`IPA downloaded: ${artifact.filename} by ${req.user.email}`);
  } catch (err) { next(err); }
}

function getQueue(req, res) { res.json(buildQueue.getState()); }

async function cancelBuild(req, res, next) {
  try {
    const build = await queryOne('SELECT * FROM builds WHERE id=?', [req.params.id]);
    if (!build) return res.status(404).json({ error: 'Build not found' });
    if (req.user.role !== 'admin' && build.user_id !== req.user.id)
      return res.status(403).json({ error: 'Access denied' });
    if (!['pending','queued'].includes(build.status))
      return res.status(400).json({ error: `Cannot cancel a build with status '${build.status}'` });

    const idx = buildQueue.queue.findIndex(b => b.id === build.id);
    if (idx !== -1) buildQueue.queue.splice(idx, 1);

    await run(`UPDATE builds SET status='failed', error_code='CANCELLED',
               error_reason='Cancelled by user', finished_at=NOW(), updated_at=NOW() WHERE id=?`,
      [build.id]);

    res.json({ id: build.id, status: 'failed', message: 'Build cancelled' });
  } catch (err) { next(err); }
}

function generateMockIpa(build, artifact) {
  const header = Buffer.from('504B0304', 'hex');
  const meta   = Buffer.from(JSON.stringify({ macBuildCloud: true, buildId: build.id, project: build.project }, null, 2));
  const pad    = Buffer.alloc(Math.min(artifact.size_bytes, 2 * 1024 * 1024), 0xAA);
  return Buffer.concat([header, meta, pad]);
}

module.exports = { submitBuild, getBuilds, getBuild, getLogs, downloadIpa, getQueue, cancelBuild };
