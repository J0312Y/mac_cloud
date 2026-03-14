const BASE = import.meta.env.VITE_API_URL || 'http://213.156.133.182:3001/api';
export const DASHBOARD = import.meta.env.VITE_DASHBOARD_URL || 'http://localhost:5173';

let _token = localStorage.getItem('mbc_token') || null;
export const setToken = t => { _token = t; t ? localStorage.setItem('mbc_token', t) : localStorage.removeItem('mbc_token'); };
export const getToken = () => _token;
export const isLoggedIn = () => !!localStorage.getItem('mbc_token');

async function req(method, path, body) {
  const h = { 'Content-Type': 'application/json' };
  if (_token) h['Authorization'] = `Bearer ${_token}`;
  const r = await fetch(`${BASE}${path}`, { method, headers: h, ...(body ? { body: JSON.stringify(body) } : {}) });
  const d = await r.json().catch(() => ({ error: r.statusText }));
  if (!r.ok) throw Object.assign(new Error(d.error || 'Error'), { status: r.status, data: d });
  return d;
}

export const auth = {
  login:    async (email, pw) => { const r = await req('POST','/auth/login',{email,password:pw}); if (r.token) setToken(r.token); return r; },
  register: (name, email, pw, plan='starter') => req('POST','/auth/register',{name,email,password:pw,plan}),
  me:       () => req('GET','/auth/me'),
};
export const pub = {
  plans:     () => req('GET','/public/plans').catch(() => ({ plans: null })),
  stats:     () => req('GET','/public/stats').catch(() => ({})),
  hourPacks: () => fetch(`${BASE}/credits/packs`).then(r => r.json()).catch(() => ({ packs: [] })),
};
export const user = {
  changePassword: (current, password) => req('POST','/user/change-password',{current,password}),
};
