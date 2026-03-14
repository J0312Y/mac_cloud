/**
 * Mac Build Cloud — Frontend API Client
 * ──────────────────────────────────────
 * Drop this file into your React project as src/lib/api.js
 * 
 * Usage:
 *   import api from '@/lib/api';
 *   const { token } = await api.login('alex@company.io', 'Demo1234!');
 *   const { builds } = await api.getBuilds();
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ── Token storage ────────────────────────────────────────────────────────────
let _token = localStorage.getItem('mbc_token') || null;

export function setToken(t) {
  _token = t;
  if (t) localStorage.setItem('mbc_token', t);
  else   localStorage.removeItem('mbc_token');
}
export function getToken() { return _token; }

// ── Core fetch wrapper ───────────────────────────────────────────────────────
async function request(method, path, body = null, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...opts
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw Object.assign(new Error(err.error || 'API error'), { status: res.status });
  }

  // download endpoints return binary
  if (opts.binary) return res.blob();
  return res.json();
}

const get    = (path)        => request('GET',    path);
const post   = (path, body)  => request('POST',   path, body);
const patch  = (path, body)  => request('PATCH',  path, body);
const del    = (path)        => request('DELETE', path);

// ── Auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  register: (name, email, password, plan = 'starter') =>
    post('/auth/register', { name, email, password, plan }),

  login: async (email, password) => {
    const res = await post('/auth/login', { email, password });
    if (res.token) setToken(res.token);
    return res;
  },

  logout: () => setToken(null),
  me:     () => get('/auth/me'),
};

// ── User ─────────────────────────────────────────────────────────────────────
export const user = {
  updateProfile:   (name)                          => patch('/user/profile', { name }),
  changePassword:  (current, password)             => post('/user/change-password', { current, password }),
  stats:           ()                              => get('/user/stats'),
};

// ── Builds ───────────────────────────────────────────────────────────────────
export const builds = {
  submit: (payload) => post('/build', payload),
  // payload: { project, repo_url, branch, xcode_version, region, cert_id, profile_id }

  list:   (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/builds${qs ? '?' + qs : ''}`);
  },

  get:      (id)  => get(`/build/${id}`),
  cancel:   (id)  => del(`/build/${id}`),
  logs:     (id)  => get(`/logs/${id}`),
  queue:    ()    => get('/queue'),

  download: (id)  => request('GET', `/download/${id}`, null, { binary: true }),
};

// ── Webhooks ─────────────────────────────────────────────────────────────────
export const webhooks = {
  list:   ()                     => get('/webhooks'),
  create: (url, events, secret)  => post('/webhooks', { url, events, secret }),
  remove: (id)                   => del(`/webhooks/${id}`),
  test:   (id)                   => post(`/webhooks/${id}/test`),
};

// ── API Tokens ───────────────────────────────────────────────────────────────
export const tokens = {
  list:   ()             => get('/tokens'),
  create: (name, scopes) => post('/tokens', { name, scopes }),
  revoke: (id)           => del(`/tokens/${id}`),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const admin = {
  stats:      ()          => get('/admin/stats'),
  users:      ()          => get('/admin/users'),
  builds:     (params={}) => {
    const qs = new URLSearchParams(params).toString();
    return get(`/admin/builds${qs ? '?' + qs : ''}`);
  },
  updateUser: (id, data)  => patch(`/admin/users/${id}`, data),
};

// ── Health ────────────────────────────────────────────────────────────────────
export const health = () => get('/health');

export default { auth, user, builds, webhooks, tokens, admin, health, setToken, getToken };
