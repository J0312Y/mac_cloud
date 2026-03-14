import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, DASHBOARD, isLoggedIn, setToken } from '../lib/api';
import OAuthButtons from '../components/ui/OAuthButtons';
import { useToast } from '../hooks';
import Toasts from '../components/ui/Toasts';

const TERMINAL = [
  { t: '$ macbuild auth login', c: '#e2e8f0' },
  { t: '→  Connecting to api.macbuild.cloud…', c: '#94a3b8' },
  { t: '✓  Authenticated successfully', c: '#4ade80' },
  { t: '✓  Dashboard ready at app.macbuild.cloud', c: '#4ade80' },
  { t: '$ macbuild builds list', c: '#e2e8f0' },
  { t: '  build-a3f7  ✓ success  1m52s  main', c: '#94a3b8' },
  { t: '  build-8b1c  ✓ success  1m44s  feat/auth', c: '#94a3b8' },
  { t: '  build-2d9e  ○ queued   —      release', c: '#475569' },
  { t: '$ _', c: '#06b6d4' },
];

export default function Login() {
  const navigate = useNavigate();
  const { toasts, toast } = useToast();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [lines, setLines] = useState([]);

  useEffect(() => { if (isLoggedIn()) navigate('/'); }, []);

  // Terminal animation
  useEffect(() => {
    let i = 0;
    const run = () => {
      if (i < TERMINAL.length) {
        setLines(p => [...p, TERMINAL[i++]]);
        setTimeout(run, 320 + Math.random() * 200);
      }
    };
    setTimeout(run, 600);
  }, []);

  const handleLogin = async e => {
    e?.preventDefault();
    if (!email || !pw) { toast('Fill in all fields', 'error'); return; }
    setLoading(true);
    try {
      const res = await auth.login(email, pw);
      toast('Welcome back! Redirecting…', 'success');
      sessionStorage.setItem('mbc_temp_pwd', pw);
      setTimeout(() => { window.location.href = DASHBOARD; }, 900);
    } catch (err) {
      toast(err.message || 'Invalid credentials', 'error');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <Toasts toasts={toasts} />

      {/* ─── LEFT: visual ─── */}
      <div style={{ background: 'var(--card)', borderRight: '1px solid var(--rim)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 56px', position: 'relative', overflow: 'hidden' }}>
        <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: .6 }} />
        <div style={{ position: 'absolute', top: '30%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,.08) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 400 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 48 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#0891b2,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 16, color: '#fff' }}>Mac<span style={{ color: 'var(--cyan)' }}>Build</span>.cloud</span>
          </Link>

          <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-.03em', lineHeight: 1.1, marginBottom: 14 }}>
            Build iOS apps<br /><span className="text-grad-cyan">faster than ever.</span>
          </h2>
          <p style={{ fontSize: 14, color: 'var(--sub)', lineHeight: 1.7, fontWeight: 300, marginBottom: 36 }}>
            Real Mac mini M2 Pro in the cloud — your iOS CI/CD pipeline, done in minutes.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 28, marginBottom: 40 }}>
            {[['1m 52s','avg build'],['99.9%','uptime SLA'],['8','regions']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-.03em' }}><span style={{ color: 'var(--cyan)' }}>{v}</span></div>
                <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Terminal */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--rim2)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}>
            <div style={{ display: 'flex', gap: 6, padding: '10px 14px', background: 'rgba(255,255,255,.02)', borderBottom: '1px solid var(--rim)' }}>
              {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
              <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: 'var(--muted)', marginLeft: 6 }}>macbuild cli</span>
            </div>
            <div style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono,monospace', fontSize: 11.5, lineHeight: 1.9 }}>
              {lines.map((l, i) => <div key={i} style={{ color: l.c }}>{l.t}</div>)}
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: form ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 56px', position: 'relative' }}>
        <div style={{ maxWidth: 380, width: '100%' }}>

          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-.025em', marginBottom: 8 }}>Sign in</h1>
            <p style={{ fontSize: 14, color: 'var(--sub)', fontWeight: 300 }}>Don't have an account? <Link to="/register" style={{ color: 'var(--cyan)', fontWeight: 500, textDecoration: 'none' }}>Create one free →</Link></p>
          </div>

          {/* OAuth */}
          <div style={{ marginBottom: 24 }}>
            <OAuthButtons
              loading={loading}
              setLoading={setLoading}
              onSuccess={(token) => {
                setToken(token);
                toast('Connecté ! Redirection…', 'success');
                setTimeout(() => { window.location.href = DASHBOARD; }, 800);
              }}
              onError={(msg) => toast(msg, 'error')}
            />
          </div>

          <div className="or-divider" style={{ marginBottom: 24 }}>or continue with email</div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>Email</label>
              <input className="field" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Password</label>
                <a href="/forgot-password" style={{ fontSize: 12, color: 'var(--cyan)', textDecoration: 'none', fontWeight: 500 }}>Forgot?</a>
              </div>
              <div style={{ position: 'relative' }}>
                <input className="field" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} style={{ paddingRight: 44 }} />
                <button onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sub)', fontSize: 15, padding: 2 }}>{showPw ? '🙈' : '👁'}</button>
              </div>
            </div>

            <button className="btn-primary" onClick={handleLogin} disabled={loading} style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '13px', marginTop: 6 }}>
              {loading ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.25)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} /> Signing in…</> : 'Sign in →'}
            </button>
          </div>

          {/* Demo accounts hint */}
          <div style={{ marginTop: 28, background: 'rgba(6,182,212,.05)', border: '1px solid rgba(6,182,212,.15)', borderRadius: 11, padding: '14px 16px', fontSize: 12.5, color: 'var(--muted)', lineHeight: 1.6 }}>
            <div style={{ fontWeight: 600, color: 'var(--sub)', marginBottom: 6 }}>🧪 Demo accounts</div>
            <div><span style={{ color: 'var(--text)' }}>admin@macbuild.cloud</span> / Admin1234!</div>
            <div><span style={{ color: 'var(--text)' }}>alex@company.io</span> / Demo1234!</div>
          </div>

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
