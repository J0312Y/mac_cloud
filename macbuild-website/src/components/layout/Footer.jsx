import { Link } from 'react-router-dom';
import { useContent } from '../../hooks';

const DEFAULT_COLS = [
  { title: 'Product', links: [{ label:'Features', href:'#features' },{ label:'Pricing', href:'#pricing' },{ label:'Changelog', href:'#' },{ label:'Roadmap', href:'#' },{ label:'Status', href:'#' }] },
  { title: 'Developers', links: [{ label:'Documentation', href:'#' },{ label:'API Reference', href:'#' },{ label:'CLI Guide', href:'#' },{ label:'GitHub Actions', href:'#' },{ label:'Fastlane Plugin', href:'#' }] },
  { title: 'Company', links: [{ label:'About', href:'#' },{ label:'Blog', href:'#' },{ label:'Careers', href:'#' },{ label:'Contact', href:'#' },{ label:'Privacy', href:'#' }] },
];

export default function Footer() {
  const { content } = useContent();
  const f = content?.footer || {};
  const brandDesc  = f.brand_desc  || 'iOS CI/CD on dedicated Apple Silicon. Build, sign, and ship — without owning a Mac.';
  const copyright  = f.copyright   || '© 2025 MacBuild Cloud SAS. All rights reserved.';
  const statusText = f.status_text || 'All systems operational';
  const cols       = f.cols        || DEFAULT_COLS;

  return (
    <footer style={{ borderTop: '1px solid var(--rim)', background: 'var(--bg)', padding: '72px 0 40px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: -60, left: '10%', width: 400, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `2fr ${cols.map(() => '1fr').join(' ')}`, gap: 48, marginBottom: 56 }}>
          <div>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 18 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#0891b2,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⚡</div>
              <span style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 15, color: '#fff' }}>Mac<span style={{ color: 'var(--cyan)' }}>Build</span>.cloud</span>
            </Link>
            <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.7, maxWidth: 240 }}>{brandDesc}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              {['𝕏', 'gh', 'in', 'dc'].map(s => (
                <a key={s} href="#" style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,.04)', border: '1px solid var(--rim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--sub)', textDecoration: 'none', transition: 'all .18s' }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(6,182,212,.1)'; e.currentTarget.style.borderColor='rgba(6,182,212,.3)'; e.currentTarget.style.color='var(--cyan)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.04)'; e.currentTarget.style.borderColor='var(--rim)'; e.currentTarget.style.color='var(--sub)'; }}
                >{s}</a>
              ))}
            </div>
          </div>
          {cols.map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '.09em', marginBottom: 18 }}>{col.title}</div>
              {(col.links || []).map(l => (
                <a key={l.label} href={l.href} style={{ display: 'block', fontSize: 13.5, color: 'var(--muted)', textDecoration: 'none', marginBottom: 11, transition: 'color .18s' }}
                  onMouseEnter={e => e.target.style.color='var(--text)'}
                  onMouseLeave={e => e.target.style.color='var(--muted)'}
                >{l.label}</a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingTop: 28, borderTop: '1px solid var(--rim)', fontSize: 12, color: 'var(--muted)' }}>
          <span>{copyright}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'pulseSlow 2.5s ease-in-out infinite' }} />
            <span style={{ color: '#4ade80', fontWeight: 500 }}>{statusText}</span>
          </div>
          <div style={{ display: 'flex', gap: 18 }}>
            {['Privacy', 'Terms', 'Security'].map(l => (
              <a key={l} href="#" style={{ color: 'var(--muted)', textDecoration: 'none' }}
                onMouseEnter={e => e.target.style.color='var(--text)'}
                onMouseLeave={e => e.target.style.color='var(--muted)'}
              >{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
