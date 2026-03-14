'use strict';

/**
 * database.js — MySQL2 connection pool
 * Pure JS, zero native compilation, works on Windows + Linux
 */

const mysql  = require('mysql2/promise');
const logger = require('../utils/logger');

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host:               process.env.DB_HOST     || '127.0.0.1',
      port:           parseInt(process.env.DB_PORT || '3306'),
      user:               process.env.DB_USER     || 'macbuild',
      password:           process.env.DB_PASS     || '',
      database:           process.env.DB_NAME     || 'macbuild',
      waitForConnections: true,
      connectionLimit:    10,
      timezone:           '+00:00',
    });
    logger.info(`MySQL pool ready → ${process.env.DB_HOST || '127.0.0.1'}:${process.env.DB_PORT || 3306}/${process.env.DB_NAME || 'macbuild'}`);
  }
  return pool;
}

// Convenience: run a query and return rows
async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

// Return first row or null
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

// Run INSERT / UPDATE / DELETE, return result (insertId, affectedRows)
async function run(sql, params = []) {
  const [result] = await getPool().execute(sql, params);
  return result;
}

// Initialize schema + seed on first boot
async function initDb() {
  const db = getPool();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id          VARCHAR(36)  PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      email       VARCHAR(150) UNIQUE NOT NULL,
      password    VARCHAR(255) NOT NULL,
      role        ENUM('user','admin') NOT NULL DEFAULT 'user',
      plan        VARCHAR(50)  NOT NULL DEFAULT 'starter',
      status      ENUM('active','suspended') NOT NULL DEFAULT 'active',
      created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS builds (
      id              VARCHAR(36)  PRIMARY KEY,
      user_id         VARCHAR(36)  NOT NULL,
      project         VARCHAR(100) NOT NULL,
      repo_url        TEXT         NOT NULL,
      branch          VARCHAR(100) NOT NULL DEFAULT 'main',
      xcode_version   VARCHAR(20)  NOT NULL DEFAULT '15.3',
      region          VARCHAR(50)  NOT NULL DEFAULT 'EU-West',
      cert_id         VARCHAR(36),
      profile_id      VARCHAR(36),
      status          VARCHAR(30)  NOT NULL DEFAULT 'pending',
      queue_position  INT,
      started_at      DATETIME,
      finished_at     DATETIME,
      duration_ms     INT,
      ipa_size        VARCHAR(20),
      error_reason    TEXT,
      error_code      VARCHAR(50),
      mac_id          VARCHAR(50)  DEFAULT 'mac-01',
      created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS build_logs (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      build_id   VARCHAR(36) NOT NULL,
      ts         DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
      kind       VARCHAR(20) NOT NULL DEFAULT 'info',
      message    TEXT        NOT NULL,
      FOREIGN KEY (build_id) REFERENCES builds(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS artifacts (
      id         VARCHAR(36) PRIMARY KEY,
      build_id   VARCHAR(36) UNIQUE NOT NULL,
      filename   VARCHAR(255) NOT NULL,
      size_bytes INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (build_id) REFERENCES builds(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS api_tokens (
      id         VARCHAR(36)  PRIMARY KEY,
      user_id    VARCHAR(36)  NOT NULL,
      name       VARCHAR(100) NOT NULL,
      token_hash VARCHAR(255) NOT NULL,
      scopes     VARCHAR(255) NOT NULL DEFAULT 'builds:read',
      last_used  DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS webhooks (
      id         VARCHAR(36)  PRIMARY KEY,
      user_id    VARCHAR(36)  NOT NULL,
      url        TEXT         NOT NULL,
      events     VARCHAR(255) NOT NULL DEFAULT 'build.success,build.failed',
      secret     VARCHAR(128),
      status     VARCHAR(20)  NOT NULL DEFAULT 'active',
      last_sent  DATETIME,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Indexes (safe to run multiple times)
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_builds_user   ON builds(user_id)`).catch(()=>{});
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_builds_status ON builds(status)`).catch(()=>{});
  await db.execute(`CREATE INDEX IF NOT EXISTS idx_logs_build    ON build_logs(build_id)`).catch(()=>{});

  await seedDefaults();
  logger.info('MySQL schema ready');
}

async function seedDefaults() {
  const bcrypt       = require('bcryptjs');
  const { v4: uuid } = require('uuid');

  const existing = await queryOne('SELECT id FROM users WHERE email = ?', ['admin@macbuild.cloud']);
  if (existing) return;

  await run('INSERT INTO users (id,name,email,password,role,plan) VALUES (?,?,?,?,?,?)',
    [uuid(), 'Admin', 'admin@macbuild.cloud', bcrypt.hashSync('Admin1234!', 10), 'admin', 'team']);

  await run('INSERT INTO users (id,name,email,password,role,plan) VALUES (?,?,?,?,?,?)',
    [uuid(), 'Alex Martin', 'alex@company.io', bcrypt.hashSync('Demo1234!', 10), 'user', 'pro']);

  await run('INSERT INTO users (id,name,email,password,role,plan) VALUES (?,?,?,?,?,?)',
    [uuid(), 'Sara Kim', 'sara@startup.io', bcrypt.hashSync('Demo1234!', 10), 'user', 'starter']);

  logger.info('Seeded default admin + demo users');
}

module.exports = { getPool, query, queryOne, run, initDb };
