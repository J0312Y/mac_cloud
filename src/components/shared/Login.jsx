// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import api from "../../lib/api.js";
import { useApp } from "../../i18n/AppContext.jsx";

const Login = ({ onLogin }) => {
  const { t, lang, setLang } = useApp();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const go = async () => {
    if (!email || !password) return setError("Email and password required");
    setLoading(true); setError("");
    try {
      const res = await api.auth.login(email, password);
      // Role is determined entirely by the server JWT — no choice here
      onLogin(res.user.role === "admin" ? "admin" : "client", res.user);
    } catch (err) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090710] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-600/5 rounded-full blur-3xl"/>
      </div>

      <div className="relative z-10 w-80 px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-80)] flex items-center justify-center mx-auto mb-4 shadow-2xl accent-glow">
            <Icon name="zap" size={26} className="text-white"/>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Mac Build Cloud</h1>
          <p className="text-xs text-slate-500 mt-1">iOS CI/CD Platform</p>
        </div>

        {/* Form */}
        <div className="bg-[#12101e] border border-white/[0.07] rounded-2xl p-6 space-y-4 shadow-2xl">
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && go()}
              placeholder="you@company.com"
              className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:accent-border transition-colors placeholder-slate-700"
            />
          </div>
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && go()}
              placeholder="••••••••"
              className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:accent-border transition-colors placeholder-slate-700"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/20 rounded-lg px-3 py-2">
              <Icon name="alertTri" size={11} className="text-red-400 flex-shrink-0"/>
              <p className="text-[11px] text-red-300">{error}</p>
            </div>
          )}

          <button onClick={go} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 btn-accent text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 mt-2">
            {loading
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : "Sign in"
            }
          </button>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.05]"/></div>
            <div className="relative flex justify-center"><span className="text-[9px] text-slate-600 bg-[#12101e] px-2 uppercase tracking-widest">ou</span></div>
          </div>

          <div className="flex flex-col gap-2">
            {[['github','🐙 GitHub'],['gitlab','🦊 GitLab']].map(([provider, label]) => (
              <button key={provider} disabled={loading}
                onClick={() => {
                  setLoading(true);
                  const popup = window.open(`${import.meta.env.VITE_API_URL || 'http://213.156.133.182:3001/api'}/auth/${provider}`, `oauth_${provider}`, 'width=520,height=640');
                  if (!popup) { setError('Popup bloquée'); setLoading(false); return; }
                  // Polling localStorage (cross-origin safe)
                  localStorage.removeItem('mbc_oauth_token');
                  localStorage.removeItem('mbc_oauth_error');
                  const poll = setInterval(() => {
                    const t = localStorage.getItem('mbc_oauth_token');
                    const e2 = localStorage.getItem('mbc_oauth_error');
                    if (t) {
                      clearInterval(poll);
                      localStorage.removeItem('mbc_oauth_token');
                      localStorage.setItem('mbc_token', t);
                      const payload = JSON.parse(atob(t.split('.')[1]));
                      onLogin(payload.role === 'admin' ? 'admin' : 'client', payload);
                      setLoading(false);
                    } else if (e2) {
                      clearInterval(poll);
                      localStorage.removeItem('mbc_oauth_error');
                      setError(e2);
                      setLoading(false);
                    } else if (popup.closed) {
                      clearInterval(poll);
                      setLoading(false);
                    }
                  }, 500);
                }}
                className="w-full py-2.5 bg-white/[0.04] border border-white/[0.07] rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/[0.07] transition-colors flex items-center justify-center gap-2 disabled:opacity-40">
                {label}
              </button>
            ))}
          </div>
        </div>

        <ServerStatus/>
      </div>
    </div>
  );
};

const ServerStatus = () => {
  const [status, setStatus] = useState("checking");
  useState(() => {
    api.health().then(() => setStatus("online")).catch(() => setStatus("offline"));
  });
  return (
    <div className="mt-5 flex items-center justify-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${status==="online"?"bg-emerald-400":status==="offline"?"bg-red-400":"bg-amber-400 animate-pulse"}`}/>
      <span className="text-[10px] text-slate-600">
        {status==="online" ? "Connected · 213.156.133.182" : status==="offline" ? "Server offline" : "Connecting..."}
      </span>
    </div>
  );
};

export default Login;
