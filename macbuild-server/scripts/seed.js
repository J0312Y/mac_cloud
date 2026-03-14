#!/usr/bin/env node
'use strict';
/**
 * Seed script — populates the DB with realistic demo data.
 * Run once: node scripts/seed.js
 */

require('dotenv').config();
const { getDb }  = require('../storage/database');
const bcrypt     = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const db = getDb();

console.log('🌱 Seeding demo data…');

// ── Extra users ───────────────────────────────────────────────────────────────
const users = [
  { name: 'Sara Wilson',   email: 'sara@startup.io',   plan: 'team',    role: 'user' },
  { name: 'John Dev',      email: 'john@dev.io',        plan: 'starter', role: 'user' },
  { name: 'Priya Sharma',  email: 'priya@mobile.io',    plan: 'pro',     role: 'user' },
  { name: 'Tom Builder',   email: 'tom@builder.io',     plan: 'starter', role: 'user', status: 'suspended' },
];

const userIds = {};
for (const u of users) {
  const existing = db.prepare('SELECT id FROM users WHERE email=?').get(u.email);
  if (existing) { userIds[u.email] = existing.id; continue; }
  const id   = uuidv4();
  const hash = bcrypt.hashSync('Demo1234!', 10);
  db.prepare(`INSERT INTO users (id,name,email,password,role,plan,status) VALUES (?,?,?,?,?,?,?)`)
    .run(id, u.name, u.email, hash, u.role || 'user', u.plan, u.status || 'active');
  userIds[u.email] = id;
  console.log(`  ✅ User: ${u.email}`);
}

// Get alex's id
const alex = db.prepare("SELECT id FROM users WHERE email='alex@company.io'").get();
if (!alex) { console.error('❌ alex@company.io not found — run the server first to seed defaults'); process.exit(1); }
userIds['alex@company.io'] = alex.id;

// ── Sample builds ─────────────────────────────────────────────────────────────
const statuses = [
  { status: 'success', durationMs: 252000, ipaSize: '42.3 MB' },
  { status: 'success', durationMs: 187000, ipaSize: '38.1 MB' },
  { status: 'failed',  durationMs: 94000,  errorCode: 'CS-001', errorReason: 'Code signing failed: provisioning profile expired' },
  { status: 'success', durationMs: 312000, ipaSize: '51.7 MB' },
  { status: 'failed',  durationMs: 61000,  errorCode: 'XC-065', errorReason: "xcodebuild exit 65 — module 'Alamofire' not found" },
  { status: 'success', durationMs: 228000, ipaSize: '44.9 MB' },
];

const projects = ['MyApp iOS','ShopApp','ChatPro','WeatherKit','FinanceApp','TravelApp'];
const emails   = Object.keys(userIds);

const insertBuild = db.prepare(`
  INSERT INTO builds (id,user_id,project,repo_url,branch,xcode_version,region,status,started_at,finished_at,duration_ms,ipa_size,error_code,error_reason,created_at,updated_at)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`);
const insertArtifact = db.prepare(`
  INSERT OR IGNORE INTO artifacts (id,build_id,filename,size_bytes) VALUES (?,?,?,?)
`);
const insertLog = db.prepare(`INSERT INTO build_logs (build_id,kind,message) VALUES (?,?,?)`);

const now = Date.now();
for (let i = 0; i < 12; i++) {
  const s       = statuses[i % statuses.length];
  const email   = emails[i % emails.length];
  const project = projects[i % projects.length];
  const id      = `bld_seed_${String(i).padStart(3,'0')}`;
  const created = new Date(now - (12 - i) * 3600_000).toISOString();
  const started = new Date(now - (12 - i) * 3600_000 + 5000).toISOString();
  const finished= s.durationMs ? new Date(now - (12 - i) * 3600_000 + 5000 + s.durationMs).toISOString() : null;

  const existing = db.prepare('SELECT id FROM builds WHERE id=?').get(id);
  if (existing) continue;

  insertBuild.run(
    id, userIds[email], project,
    `https://github.com/example/${project.toLowerCase().replace(/\s/g,'-')}.git`,
    'main', '15.3', 'EU-West',
    s.status, started, finished, s.durationMs || null,
    s.ipaSize || null, s.errorCode || null, s.errorReason || null,
    created, created
  );

  // Sample logs
  insertLog.run(id, 'info',    `[1/6] Preparing environment…`);
  insertLog.run(id, 'info',    `[2/6] Cloning repository…`);
  insertLog.run(id, 'info',    `[3/6] Installing dependencies…`);
  if (s.status === 'success') {
    insertLog.run(id, 'info',    `[4/6] Running xcodebuild…`);
    insertLog.run(id, 'info',    `[5/6] Packaging IPA…`);
    insertLog.run(id, 'success', `🎉 BUILD SUCCESSFUL — ${s.ipaSize}`);
    insertArtifact.run(uuidv4(), id, `${project.replace(/\s/g,'')}_release.ipa`,
      Math.round(parseFloat(s.ipaSize) * 1_048_576));
  } else {
    insertLog.run(id, 'error', `Build failed: ${s.errorReason}`);
    insertLog.run(id, 'error', `💥 BUILD FAILED [${s.errorCode}]`);
  }
  console.log(`  ✅ Build: ${id} (${project}, ${s.status})`);
}

console.log('\n✅ Seed complete!\n');
console.log('Default accounts:');
console.log('  admin@macbuild.cloud / Admin1234!  (role: admin)');
console.log('  alex@company.io      / Demo1234!   (role: user)');
console.log('  sara@startup.io      / Demo1234!   (role: user)');
