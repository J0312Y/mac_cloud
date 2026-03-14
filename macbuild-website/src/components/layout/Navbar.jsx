import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isLoggedIn, DASHBOARD } from '../../lib/api';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how',      label: 'How it works' },
  { href: '#pricing',  label: 'Pricing' },
  { href: '#faq',      label: 'FAQ' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const onHome = loc.pathname === '/';
  const loggedIn = isLoggedIn();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 18);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = id => {
    setOpen(false);
    if (!onHome) { window.location.href = '/' + id; return; }
    document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 600,
          background: scrolled ? 'rgba(9,7,16,0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(24px) saturate(160%)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
          transition: 'background .3s, border-color .3s',
        }}
      >
        {/* Beam at top when scrolled */}
        {scrolled && <div className="beam-line" style={{ top: 0, left: 0 }} />}

        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg, #0891b2, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, boxShadow: '0 0 18px rgba(6,182,212,0.4)',
              flexShrink: 0,
            }}>⚡</div>
            <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-.02em' }}>
              Mac<span style={{ color: 'var(--cyan)' }}>Build</span><span style={{ color: 'var(--ghost)', fontWeight: 400, fontSize: 13 }}>.cloud</span>
            </span>
          </Link>

          {/* Center links — desktop only */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {onHome && NAV_LINKS.map(l => (
              <button key={l.href} onClick={() => scrollTo(l.href)}
                style={{ background: 'none', border: 'none', color: 'var(--sub)', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', padding: '6px 13px', borderRadius: 8, fontFamily: 'DM Sans,sans-serif', transition: 'color .18s, background .18s' }}
                onMouseEnter={e => { e.target.style.color = 'var(--text)'; e.target.style.background = 'rgba(255,255,255,.05)'; }}
                onMouseLeave={e => { e.target.style.color = 'var(--sub)'; e.target.style.background = 'none'; }}
              >{l.label}</button>
            ))}
          </div>

          {/* Right CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {loggedIn ? (
              <a href={DASHBOARD} className="btn-primary" style={{ fontSize: 13, padding: '8px 18px' }}>
                Dashboard →
              </a>
            ) : (
              <>
                <Link to="/login" style={{ fontSize: 13, fontWeight: 500, color: 'var(--sub)', textDecoration: 'none', padding: '8px 14px', transition: 'color .18s' }}
                  onMouseEnter={e => e.target.style.color = 'var(--text)'}
                  onMouseLeave={e => e.target.style.color = 'var(--sub)'}
                >Sign in</Link>
                <Link to="/register" className="btn-primary" style={{ fontSize: 13, padding: '8px 18px', textDecoration: 'none' }}>
                  Get started
                </Link>
              </>
            )}
            {/* Hamburger */}
            <button className="hide-desktop" onClick={() => setOpen(o => !o)}
              style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sub)', fontSize: 20, padding: 4 }}>
              {open ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div style={{
          position: 'fixed', top: 62, left: 0, right: 0, zIndex: 599,
          background: 'rgba(9,7,16,0.97)', backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(255,255,255,.07)',
          padding: '16px 28px 24px',
        }}>
          {onHome && NAV_LINKS.map(l => (
            <button key={l.href} onClick={() => scrollTo(l.href)}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'var(--sub)', fontSize: 15, fontWeight: 500, padding: '12px 0', cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
              {l.label}
            </button>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Link to="/login" className="btn-ghost" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }} onClick={() => setOpen(false)}>Sign in</Link>
            <Link to="/register" className="btn-primary" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }} onClick={() => setOpen(false)}>Get started</Link>
          </div>
        </div>
      )}
    </>
  );
}
