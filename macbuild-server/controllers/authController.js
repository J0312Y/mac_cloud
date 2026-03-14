'use strict';

const auth = require('../auth/authService');

async function register(req, res, next) {
  try {
    const { name, email, password, plan } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'name, email and password required' });
    const result = await auth.register({ name, email, password, plan });
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'email and password required' });
    const result = await auth.login({ email, password });
    res.json(result);
  } catch (err) { next(err); }
}

async function me(req, res, next) {
  try {
    const user = await auth.getUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) { next(err); }
}

module.exports = { register, login, me };
