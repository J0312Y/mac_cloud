import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTypewriter, useCountUp, useStats, useContent } from '../../hooks';

const TERMINAL_LINES = [
  { text: '$ git push origin main', cls: 'muted' },
  { text: '→  Webhook received · MacBuild Cloud', cls: 'sub' },
  { text: '→  Node assigned: node-07 (M2 Pro · EU-West)', cls: 'sub' },
  { text: '→  Cache restored (94%) · Cloning main@a3f7e91', cls: 'sub' },
  { text: '', cls: 'muted' },
  { text: '⚙  xcodebuild -scheme MyApp \\', cls: 'amber' },
  { text: '       -destination generic/platform=iOS', cls: 'amber' },
  { text: '   Compiling 1,204 Swift files…', cls: 'muted' },
  { text: '   Linking MyApp…', cls: 'muted' },
  { text: '', cls: '' },
  { text: '✓  Build succeeded in 1m 52s', cls: 'green' },
  { text: '✓  IPA signed · Uploading to TestFlight…', cls: 'green' },
  { text: '✓  Artifact available: MyApp-2.4.1.ipa', cls: 'green' },
];

const COLOR = { muted: 'var(--muted)', sub: 'var(--sub)', green: '#4ade80', amber: '#fbbf24', cyan: '#06b6d4', '': '' };

function TerminalLine({ line }) {
  return (
    <div style={{ color: COLOR[line.cls] || 'var(--sub)', fontSize: 12, lineHeight: 1.85, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre' }}>
      {line.text || '\u00A0'}
    </div>
  );
}

function StatPill({ label, value, suffix = '' }) {
  const [inView, setInView] = useState(false);
  useEffect(() => { setTimeout(() => setInView(true), 800); }, []);
  const v = useCountUp(value, 1600, inView);
  const display = value >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v.toLocaleString();
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: '-.03em', lineHeight: 1 }}>
        {display}<span style={{ color: 'var(--cyan)', fontSize: 18 }}>{suffix}</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 5 }}>{label}</div>
    </div>
  );
}

export default function Hero() {
  const { output, blink } = useTypewriter(TERMINAL_LINES, 105, 700);
  const stats = useStats();
  const { content } = useContent();
  const h = content?.hero || {};

  const eyebrow     = h.eyebrow     || '8 regions · Apple Silicon M2 Pro';
  const title1      = h.title_line1 || 'Build iOS Apps';
  const title2      = h.title_line2 || 'Without Owning a Mac.';
  const subtitle    = h.subtitle    || 'Compile, sign, and deploy your iOS apps using dedicated Mac mini M2 Pro machines in the cloud. No hardware needed — operational in 5 minutes.';
  const ctaPrimary  = h.cta_primary  || 'Start building free →';
  const ctaSecondary= h.cta_secondary|| 'View docs';
  const trustText   = h.trust_text   || '1,200+ teams building on MacBuild';
  const integrations= h.integrations || ['GitHub Actions','GitLab CI','Bitbucket','Fastlane','Xcode 16','TestFlight','Jenkins','CircleCI'];
  const termStats   = h.stats || [{ label:'Build time',value:'1m 52s' },{ label:'Queue',value:'0 jobs' },{ label:'Node load',value:'47%' }];

  return (
    <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '100px 0 60px', position: 'relative', overflow: 'hidden' }}>
      <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '20%', left: '5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '30%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,140,248,.05) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px', width: '100%', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

          {/* LEFT */}
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 99, padding: '5px 14px', marginBottom: 28, animation: 'fadeUp .5s ease both' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', animation: 'pulseSlow 2s infinite', flexShrink: 0 }} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--cyan)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{eyebrow}</span>
            </div>

            <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(40px, 5.5vw, 68px)', letterSpacing: '-.045em', lineHeight: 1.02, color: '#fff', animation: 'fadeUp .55s .06s ease both' }}>
              {title1}<br /><span className="text-grad">{title2}</span>
            </h1>

            <p style={{ fontSize: 17, fontWeight: 300, color: 'var(--sub)', lineHeight: 1.72, marginTop: 22, maxWidth: 440, animation: 'fadeUp .55s .12s ease both' }}>{subtitle}</p>

            <div style={{ display: 'flex', gap: 12, marginTop: 34, flexWrap: 'wrap', animation: 'fadeUp .55s .18s ease both' }}>
              <Link to="/register" className="btn-primary" style={{ fontSize: 15, padding: '13px 26px', textDecoration: 'none' }}>{ctaPrimary}</Link>
              <a href="#how" className="btn-ghost" style={{ fontSize: 15, padding: '13px 26px' }}
                onClick={e => { e.preventDefault(); document.querySelector('#how')?.scrollIntoView({ behavior: 'smooth' }); }}>{ctaSecondary}</a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 36, animation: 'fadeUp .55s .24s ease both' }}>
              <div style={{ display: 'flex' }}>
                {['A','S','R','M','+'].map((l, i) => (
                  <div key={i} style={{ width: 27, height: 27, borderRadius: '50%', background: `hsl(${i * 42 + 180},70%,45%)`, border: '2px solid var(--bg)', marginLeft: i === 0 ? 0 : -8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>{l}</div>
                ))}
              </div>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}><strong style={{ color: 'var(--text)' }}>{trustText}</strong></span>
              <span style={{ color: 'var(--muted)', fontSize: 12 }}>|</span>
              <span style={{ color: '#fbbf24', fontSize: 12, letterSpacing: 2 }}>★★★★★</span>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>4.9/5</span>
            </div>
          </div>

          {/* RIGHT TERMINAL */}
          <div style={{ animation: 'fadeUp .6s .2s ease both' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--rim2)', borderRadius: 18, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,.6)', position: 'relative' }}>
              <div className="beam-line" style={{ top: 0, left: 0 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 16px', background: 'rgba(255,255,255,.02)', borderBottom: '1px solid var(--rim)' }}>
                {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5, color: 'var(--muted)', marginLeft: 8 }}>macbuild — pipeline · main</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--cyan)' }}>● live</span>
              </div>
              <div style={{ padding: '18px 20px', minHeight: 272, overflowY: 'auto' }}>
                {output.map((line, i) => <TerminalLine key={i} line={line} />)}
                {output.length < TERMINAL_LINES.length && (
                  <span style={{ display: 'inline-block', width: 7, height: 13, borderRadius: 2, background: blink ? 'var(--cyan)' : 'transparent', verticalAlign: 'text-bottom', marginLeft: 2 }} />
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid var(--rim)', background: 'var(--bg)' }}>
                {termStats.map((s, i) => (
                  <div key={i} style={{ padding: '13px 16px', borderRight: '1px solid var(--rim)' }}>
                    <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 13, fontWeight: 600, color: '#4ade80' }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              {integrations.slice(0, 4).map(t => (
                <span key={t} style={{ fontSize: 11.5, fontWeight: 500, color: 'var(--sub)', background: 'rgba(255,255,255,.04)', border: '1px solid var(--rim)', borderRadius: 8, padding: '5px 11px' }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, marginTop: 72, background: 'rgba(16,14,28,.7)', border: '1px solid var(--rim2)', borderRadius: 16, overflow: 'hidden', animation: 'fadeUp .55s .36s ease both', backdropFilter: 'blur(12px)' }}>
          {[
            { label: 'Builds executed', value: stats.totalBuilds, suffix: '+' },
            { label: 'Avg build time',  value: null, raw: '1m 52s' },
            { label: 'Uptime SLA',      value: null, raw: '99.9%' },
            { label: 'Active teams',    value: stats.totalUsers, suffix: '+' },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: '26px 28px', borderRight: i < 3 ? '1px solid var(--rim)' : 'none', position: 'relative', overflow: 'hidden' }}>
              {i === 0 && <div className="beam-line" style={{ bottom: 0, left: 0 }} />}
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 30, fontWeight: 800, color: '#fff', letterSpacing: '-.04em', lineHeight: 1 }}>
                {s.value != null ? <><CountUp val={s.value}/><span style={{ color: 'var(--cyan)', fontSize: 18 }}>{s.suffix}</span></> : <span style={{ color: 'var(--cyan)' }}>{s.raw}</span>}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 7 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Integration ticker */}
        <div style={{ marginTop: 48, overflow: 'hidden', position: 'relative', animation: 'fadeUp .55s .42s ease both' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14, textAlign: 'center' }}>Works with your stack</div>
          <div style={{ display: 'flex', gap: 12, animation: 'ticker 28s linear infinite' }}>
            {[...integrations, ...integrations].map((t, i) => (
              <div key={i} style={{ flexShrink: 0, background: 'rgba(255,255,255,.04)', border: '1px solid var(--rim)', borderRadius: 9, padding: '8px 16px', fontSize: 13, fontWeight: 500, color: 'var(--sub)', whiteSpace: 'nowrap' }}>{t}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CountUp({ val }) {
  const [inView, setInView] = useState(false);
  useEffect(() => { setTimeout(() => setInView(true), 800); }, []);
  const v = useCountUp(val, 1800, inView);
  return <>{val >= 1_000_000 ? `${(v/1_000_000).toFixed(1)}M` : v.toLocaleString()}</>;
}
