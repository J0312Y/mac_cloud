import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { auth, DASHBOARD, isLoggedIn } from '../lib/api';
import { useToast, usePlans } from '../hooks';
import Toasts from '../components/ui/Toasts';

function PwdStrength({ pw }) {
  const score = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^a-zA-Z0-9]/.test(pw)].filter(Boolean).length;
  const colors = ['', '#f87171', '#fbbf24', '#06b6d4', '#4ade80'];
  const labels = ['', 'Too short', 'Weak', 'Good', 'Strong ✓'];
  return pw.length > 0 ? (
    <div style={{ marginTop: 8 }}>
      <div className="pwd-bars">
        {[1,2,3,4].map(i => <div key={i} className="pwd-bar" style={{ background: i <= score ? colors[score] : 'var(--rim2)' }} />)}
      </div>
      <div style={{ fontSize: 11, color: colors[score] || 'var(--muted)', marginTop: 5, fontWeight: 600 }}>{labels[score]}</div>
    </div>
  ) : null;
}

const PLAN_ICONS = { starter: '🆓', pro: '⚡', team: '🏢' };

export default function Register() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { toasts, toast } = useToast();
  const { plans } = usePlans();

  const [step, setStep] = useState(1); // 1=account, 2=plan confirm
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [plan, setPlan] = useState(params.get('plan') || 'starter');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (isLoggedIn()) navigate('/'); }, []);

  const pwScore = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^a-zA-Z0-9]/.test(pw)].filter(Boolean).length;

  const handleRegister = async () => {
    if (!name.trim()) { toast('Enter your name', 'error'); return; }
    if (!email.includes('@')) { toast('Enter a valid email', 'error'); return; }
    if (pwScore < 2) { toast('Choose a stronger password', 'error'); return; }
    if (!agree) { toast('Please accept the terms', 'error'); return; }
    setLoading(true);
    try {
      const res = await auth.register(name.trim(), email.trim(), pw, plan);
      if (res.token) {
        toast('Account created! Redirecting to dashboard…', 'success');
        setTimeout(() => { window.location.href = DASHBOARD; }, 1100);
      }
    } catch (err) {
      toast(err.message || 'Registration failed', 'error');
      setLoading(false);
    }
  };

  const selectedPlan = plans.find(p => p.id === plan) || plans[0];

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 480px' }}>
      <Toasts toasts={toasts} />

      {/* ─── LEFT: Form ─── */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 56px', position: 'relative' }}>
        <div style={{ maxWidth: 420, width: '100%' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#0891b2,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⚡</div>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 15, color: '#fff' }}>Mac<span style={{ color: 'var(--cyan)' }}>Build</span>.cloud</span>
          </Link>

          <h1 style={{ fontFamily: 'Syne,sans-serif', fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-.025em', marginBottom: 8 }}>Create your account</h1>
          <p style={{ fontSize: 14, color: 'var(--sub)', fontWeight: 300, marginBottom: 32 }}>
            Already have one? <Link to="/login" style={{ color: 'var(--cyan)', fontWeight: 500, textDecoration: 'none' }}>Sign in →</Link>
          </p>

          {/* OAuth */}
          <div style={{ display: 'flex', gap: 9, marginBottom: 22 }}>
            {[['🐙','GitHub'],['🦊','GitLab']].map(([ico, lbl]) => (
              <button key={lbl} className="btn-ghost" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}
                onClick={() => toast('OAuth coming soon — use email below', 'info')}>
                {ico} {lbl}
              </button>
            ))}
          </div>

          <div className="or-divider" style={{ marginBottom: 22 }}>or with email</div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>Full name</label>
              <input className="field" type="text" placeholder="Alexandre Moreau" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>Work email</label>
              <input className="field" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="field" type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters" value={pw} onChange={e => setPw(e.target.value)} style={{ paddingRight: 44 }} />
                <button onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sub)', fontSize: 15, padding: 2 }}>{showPw ? '🙈' : '👁'}</button>
              </div>
              <PwdStrength pw={pw} />
            </div>

            {/* Terms */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} style={{ marginTop: 2, accentColor: 'var(--cyan)', width: 15, height: 15, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--sub)', lineHeight: 1.5, fontWeight: 300 }}>
                I agree to the <a href="#" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>Terms of Service</a> and <a href="#" style={{ color: 'var(--cyan)', textDecoration: 'none' }}>Privacy Policy</a>
              </span>
            </label>

            <button className="btn-primary" onClick={handleRegister} disabled={loading || !agree} style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '13px', marginTop: 4 }}>
              {loading
                ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.25)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .7s linear infinite', display: 'inline-block' }} /> Creating account…</>
                : `Create ${selectedPlan?.name || 'Starter'} account →`}
            </button>
          </div>

          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 16, textAlign: 'center' }}>
            ✓ No credit card for Starter &nbsp;·&nbsp; ✓ Cancel any time
          </p>
        </div>
      </div>

      {/* ─── RIGHT: Plan chooser ─── */}
      <div style={{ background: 'var(--card)', borderLeft: '1px solid var(--rim)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 40px', position: 'relative', overflow: 'hidden' }}>
        <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: .5 }} />
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 18 }}>Choose your plan</div>

          {/* Plan selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {plans.map(p => (
              <div key={p.id} onClick={() => setPlan(p.id)}
                style={{
                  background: plan === p.id ? 'rgba(6,182,212,.07)' : 'var(--bg)',
                  border: `2px solid ${plan === p.id ? 'rgba(6,182,212,.4)' : 'var(--rim)'}`,
                  borderRadius: 14, padding: '16px 18px', cursor: 'pointer',
                  transition: 'all .18s', position: 'relative',
                }}>
                {p.popular && <span style={{ position: 'absolute', top: -9, right: 14, fontSize: 10, fontWeight: 700, color: '#fff', background: 'linear-gradient(90deg,#0891b2,#06b6d4)', padding: '2px 10px', borderRadius: 99, letterSpacing: '.06em', textTransform: 'uppercase' }}>Popular</span>}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{PLAN_ICONS[p.id]}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: plan === p.id ? '#fff' : 'var(--text)' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{p.builds} builds/month</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 20, fontWeight: 800, color: plan === p.id ? 'var(--cyan)' : 'var(--sub)' }}>
                      {p.price_mo === 0 ? 'Free' : `$${p.price_mo}`}
                    </div>
                    {p.price_mo > 0 && <div style={{ fontSize: 10, color: 'var(--muted)' }}>/mo</div>}
                  </div>
                </div>
                {p.trial && <div style={{ marginTop: 8, fontSize: 11.5, color: '#4ade80', fontWeight: 500 }}>🎁 Trial: {p.trial}</div>}
              </div>
            ))}
          </div>

          {/* Selected plan summary */}
          {selectedPlan && (
            <div style={{ background: 'var(--bg)', border: '1px solid var(--rim2)', borderRadius: 12, padding: '18px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 12 }}>Included in {selectedPlan.name}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {selectedPlan.features?.slice(0,5).map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'var(--sub)' }}>
                    <span style={{ color: 'var(--cyan)', fontSize: 12, flexShrink: 0 }}>✓</span>{f}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 20, fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
            You can upgrade, downgrade, or cancel at any time from your account settings.
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
