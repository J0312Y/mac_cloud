const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

let _token = localStorage.getItem('mbc_token') || null;

export function setToken(t) {
  _token = t;
  if (t) localStorage.setItem('mbc_token', t);
  else   localStorage.removeItem('mbc_token');
}
export function getToken() { return _token; }

async function request(method, path, body = null, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (_token) headers['Authorization'] = `Bearer ${_token}`;
  const res = await fetch(`${BASE}${path}`, {
    method, headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
    ...opts
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw Object.assign(new Error(err.error || 'API error'), { status: res.status });
  }
  if (opts.binary) return res.blob();
  return res.json();
}

const get   = (path)       => request('GET',    path);
const post  = (path, body) => request('POST',   path, body);
const patch = (path, body) => request('PATCH',  path, body);
const del   = (path)       => request('DELETE', path);

export const auth = {
  register: (name, email, password, plan='starter') => post('/auth/register', { name, email, password, plan }),
  login: async (email, password) => {
    const res = await post('/auth/login', { email, password });
    if (res.token) setToken(res.token);
    return res;
  },
  logout: () => setToken(null),
  me:     () => get('/auth/me'),
};

export const user = {
  updateProfile:  (name)              => patch('/user/profile', { name }),
  changePassword: (current, password) => post('/user/change-password', { current, password }),
  stats:          ()                  => get('/user/stats'),
};

export const builds = {
  submit:   (payload)     => post('/build', payload),
  list:     (params={})   => { const qs=new URLSearchParams(params).toString(); return get(`/builds${qs?'?'+qs:''}`); },
  get:      (id)          => get(`/build/${id}`),
  cancel:   (id)          => del(`/build/${id}`),
  logs:     (id)          => get(`/logs/${id}`),
  queue:    ()            => get('/queue'),
  download: (id)          => request('GET', `/download/${id}`, null, { binary: true }),
};

export const webhooks = {
  list:   ()                    => get('/webhooks'),
  create: (url, events, secret) => post('/webhooks', { url, events, secret }),
  remove: (id)                  => del(`/webhooks/${id}`),
  test:   (id)                  => post(`/webhooks/${id}/test`),
};

export const tokens = {
  list:   ()             => get('/tokens'),
  create: (name, scopes) => post('/tokens', { name, scopes }),
  revoke: (id)           => del(`/tokens/${id}`),
};

export const certs = {
  list:   ()       => get('/certs'),
  create: (data)   => post('/certs', data),
  remove: (id)     => del(`/certs/${id}`),
};

export const profiles = {
  list:   ()       => get('/profiles'),
  create: (data)   => post('/profiles', data),
  remove: (id)     => del(`/profiles/${id}`),
};

export const team = {
  list:   ()           => get('/team'),
  invite: (data)       => post('/team', data),
  update: (id, data)   => patch(`/team/${id}`, data),
  remove: (id)         => del(`/team/${id}`),
};

export const billing = {
  info:       ()                        => get('/billing'),
  checkout:   (plan, billing_cycle, msisdn) => post('/billing/checkout', { plan, billing_cycle, msisdn }),
  changePlan: (plan, billing_cycle='monthly') => post('/billing/plan', { plan, billing_cycle }),
  invoices:   ()                        => get('/billing/invoices'),
};

export const subscription = {
  status: ()                               => get('/subscription'),
  renew:  (plan, duration, msisdn)        => post('/subscription/renew', { plan, duration, msisdn }),
};

export const tickets = {
  list:      ()            => get('/tickets'),
  create:    (payload)     => post('/tickets', payload),
  get:       (id)          => get(`/tickets/${id}`),
  reply:     (id, text)    => post(`/tickets/${id}/reply`, { text }),
  update:    (id, data)    => patch(`/tickets/${id}`, data),
  adminList: (params={})   => { const qs=new URLSearchParams(params).toString(); return get(`/admin/tickets${qs?'?'+qs:''}`); },
};

export const admin = {
  stats:      ()          => get('/admin/stats'),
  users:      ()          => get('/admin/users'),
  builds:     (params={}) => { const qs=new URLSearchParams(params).toString(); return get(`/admin/builds${qs?'?'+qs:''}`); },
  updateUser: (id, data)  => patch(`/admin/users/${id}`, data),
};

export const health = () => get('/health');

export const broadcast = {
  send: (data) => post('/broadcast', data),
  list: ()     => get('/broadcast'),
};

export default { auth, user, builds, webhooks, tokens, certs, profiles, team, billing, subscription, tickets, admin, broadcast, health, setToken, getToken };

