import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../../hooks';

const DEFAULT_FAQS = [
  { q: 'Do I need to own a Mac to use MacBuild?', a: 'No. MacBuild Cloud runs entirely in our infrastructure. You push your code from any OS — Windows, Linux, or another Mac — and we handle compilation on our dedicated Apple Silicon machines.' },
  { q: 'What Xcode versions are available?', a: 'We support Xcode 14.x, 15.x, and 16.x. Specify your version in your build configuration YAML or via the dashboard.' },
  { q: 'How does code signing work?', a: 'Upload your distribution certificate and provisioning profile once through the dashboard. MacBuild stores them AES-256 encrypted in an isolated vault per account.' },
  { q: 'Can I use my own GitHub Actions workflow?', a: 'Absolutely. We provide a first-party GitHub Action (macbuild/action@v2) as well as a generic webhook endpoint that any CI/CD system can call.' },
  { q: 'How are builds billed?', a: 'Each build that starts consumes one build credit from your monthly quota. Builds that fail during setup are not charged. Quota resets on your billing anniversary date.' },
  { q: 'What happens when I hit my build limit?', a: 'Builds queue and you receive an in-app and email notification. You can upgrade your plan instantly or wait for your quota to reset.' },
  { q: 'Is my source code stored on your servers?', a: 'No. MacBuild streams your repository directly to the build node at the start of each build. No source is persisted after the build completes.' },
];

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--rim)', borderRadius: 14, overflow: 'hidden', transition: 'border-color .2s' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--rim2)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--rim)'}
    >
      <button onClick={() => setOpen(o => !o)}
        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '18px 22px', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, cursor: 'pointer', fontFamily: 'DM Sans,sans-serif', fontSize: 14, fontWeight: 600 }}>
        {item.q}
        <div style={{ width: 26, height: 26, borderRadius: '50%', background: open ? 'rgba(6,182,212,.15)' : 'rgba(255,255,255,.05)', border: `1px solid ${open ? 'rgba(6,182,212,.3)' : 'var(--rim2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: open ? 'var(--cyan)' : 'var(--sub)', fontSize: 16, transform: open ? 'rotate(45deg)' : 'none', transition: 'all .25s' }}>+</div>
      </button>
      <div style={{ maxHeight: open ? 300 : 0, overflow: 'hidden', transition: 'max-height .35s ease' }}>
        <div style={{ padding: '0 22px 20px', fontSize: 13.5, color: 'var(--sub)', lineHeight: 1.72, fontWeight: 300 }}>{item.a}</div>
      </div>
    </div>
  );
}

export function FAQ() {
  const { content } = useContent();
  const f = content?.faq || {};
  const badge = f.badge || 'FAQ';
  const title = f.title || 'Common questions.';
  const items = f.items || DEFAULT_FAQS;

  return (
    <section id="faq" style={{ padding: '100px 0', background: 'var(--card)', borderTop: '1px solid var(--rim)', borderBottom: '1px solid var(--rim)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 28px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 52 }}>
          <span className="badge badge-cyan" style={{ marginBottom: 16 }}>{badge}</span>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,48px)', letterSpacing: '-.03em', color: '#fff' }}>{title}</h2>
        </div>
        <div className="reveal" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item, i) => <FaqItem key={i} item={item} />)}
        </div>
      </div>
    </section>
  );
}

export function CTA() {
  const { content } = useContent();
  const c = content?.cta || {};
  const title    = c.title    || 'Start building iOS apps in the cloud.';
  const subtitle = c.subtitle || 'Join 1,200+ teams. No Mac required. Operational in 5 minutes.';
  const cta1     = c.cta1     || 'Start for free →';
  const cta2     = c.cta2     || 'Talk to sales';

  return (
    <section style={{ padding: '120px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(6,182,212,.06) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div className="bg-grid" style={{ position: 'absolute', inset: 0, opacity: .5, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="reveal">
          <span className="badge badge-green" style={{ marginBottom: 22 }}>Get started</span>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(32px,4.5vw,58px)', letterSpacing: '-.04em', color: '#fff', lineHeight: 1.06, maxWidth: 700, margin: '0 auto 18px' }}>{title}</h2>
          <p style={{ fontSize: 17, color: 'var(--sub)', fontWeight: 300, maxWidth: 440, margin: '0 auto 38px', lineHeight: 1.7 }}>{subtitle}</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary" style={{ fontSize: 16, padding: '14px 30px', textDecoration: 'none' }}>{cta1}</Link>
            <a href="mailto:sales@macbuild.cloud" className="btn-ghost" style={{ fontSize: 16, padding: '14px 30px' }}>{cta2}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
