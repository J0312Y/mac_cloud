import { useContent } from '../../hooks';

const DEFAULT_STEPS = [
  { num:'01', icon:'🔗', title:'Connect your repository', desc:'Link GitHub, GitLab, or Bitbucket. Add our webhook URL or use the MacBuild GitHub Action — your YAML config is 8 lines.', detail:'Supports all major CI/CD platforms. Zero-config mode available for standard iOS projects.' },
  { num:'02', icon:'⚙️', title:'Mac mini builds your app', desc:'A dedicated M2 Pro node picks up your job instantly. Cache restored in milliseconds. Parallel builds available on Pro+.', detail:'Live logs via WebSocket. Xcode 14/15/16 available. Custom schemes, targets, and configurations.' },
  { num:'03', icon:'📲', title:'Download or ship directly', desc:'Your signed IPA is ready. Download via the dashboard, the CLI, or trigger an automatic TestFlight upload on success.', detail:'Artifacts kept for 30 days. Direct App Store Connect integration on Team plan.' },
];

export default function HowItWorks() {
  const { content } = useContent();
  const h = content?.how_it_works || {};
  const badge    = h.badge    || 'How it works';
  const title    = h.title    || 'Operational in 5 minutes.';
  const subtitle = h.subtitle || 'From zero to a signed IPA in under five minutes — no Mac, no Xcode installation, no certificate gymnastics.';
  const steps    = h.steps    || DEFAULT_STEPS;

  return (
    <section id="how" style={{ padding: '100px 0', background: 'var(--card)', borderTop: '1px solid var(--rim)', borderBottom: '1px solid var(--rim)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 400, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(6,182,212,.04) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 1 }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
          <span className="badge badge-cyan" style={{ marginBottom: 16 }}>{badge}</span>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,50px)', letterSpacing: '-.03em', color: '#fff', lineHeight: 1.08 }}>{title}</h2>
          <p style={{ fontSize: 16, color: 'var(--sub)', fontWeight: 300, marginTop: 14, maxWidth: 420, margin: '14px auto 0' }}>{subtitle}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {steps.map((step, i) => (
            <div key={i} className={`reveal d${i + 1}`}
              style={{ background: 'var(--bg)', border: '1px solid var(--rim2)', borderRadius: 18, padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 18, transition: 'border-color .22s, transform .22s, box-shadow .22s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(6,182,212,.3)'; e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 20px 60px rgba(0,0,0,.4)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='var(--rim2)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 40, fontWeight: 800, color: 'rgba(255,255,255,.06)', letterSpacing: '-.04em', lineHeight: 1 }}>{step.num}</span>
                <span style={{ fontSize: 30 }}>{step.icon}</span>
              </div>
              <div>
                <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 10, lineHeight: 1.25 }}>{step.title}</div>
                <p style={{ fontSize: 13.5, color: 'var(--sub)', lineHeight: 1.7, fontWeight: 300, margin: 0 }}>{step.desc}</p>
              </div>
              {step.detail && (
                <div style={{ fontSize: 12, color: 'var(--muted)', background: 'rgba(6,182,212,.04)', border: '1px solid rgba(6,182,212,.1)', borderRadius: 10, padding: '10px 14px', lineHeight: 1.65 }}>
                  {step.detail}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
