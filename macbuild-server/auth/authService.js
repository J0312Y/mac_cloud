'use strict';

const bcrypt          = require('bcryptjs');
const jwt             = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query, queryOne, run } = require('../storage/database');
const logger          = require('../utils/logger');

const SECRET  = () => process.env.JWT_SECRET  || 'dev_secret_change_in_prod';
const EXPIRES = () => process.env.JWT_EXPIRES_IN || '7d';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, plan: user.plan },
    SECRET(), { expiresIn: EXPIRES() }
  );
}

function verifyToken(token) {
  return jwt.verify(token, SECRET());
}

async function register({ name, email, password, plan = 'starter' }) {
  const existing = await queryOne('SELECT id FROM users WHERE email=?', [email]);
  if (existing) throw Object.assign(new Error('Email already in use'), { status: 409 });

  const hash = await bcrypt.hash(password, 12);
  const id   = uuidv4();
  await run('INSERT INTO users (id,name,email,password,role,plan) VALUES (?,?,?,?,?,?)',
    [id, name, email, hash, 'user', plan]);

  const user = await queryOne('SELECT * FROM users WHERE id=?', [id]);
  logger.info(`New user registered: ${email}`);
  return { user: sanitize(user), token: generateToken(user) };
}

async function login({ email, password }) {
  const user = await queryOne('SELECT * FROM users WHERE email=?', [email]);
  if (!user) throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  if (user.status === 'suspended')
    throw Object.assign(new Error('Account suspended'), { status: 403 });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw Object.assign(new Error('Invalid credentials'), { status: 401 });

  logger.info(`User logged in: ${email}`);
  return { user: sanitize(user), token: generateToken(user) };
}

async function getUserById(id) {
  const user = await queryOne('SELECT * FROM users WHERE id=?', [id]);
  return sanitize(user);
}

function sanitize(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

module.exports = { generateToken, verifyToken, register, login, getUserById, sanitize };
