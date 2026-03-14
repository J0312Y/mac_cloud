import { useContent } from '../../hooks';

const DEFAULT_FEATURES = [
  { icon:'🖥️', title:'Dedicated Apple Silicon', desc:'Each build runs on a real Mac mini M2 Pro — no VMs, no shared cores. Native arm64 compilation up to 5× faster than x86 cloud runners.', tag:'Hardware', tagColor:'badge-cyan' },
  { icon:'⚡', title:'Sub-2-minute Builds', desc:'Pre-warmed nodes, aggressive dependency caching, and parallel build support. Average iOS build completes in 1m 52s.', tag:'Performance', tagColor:'badge-green' },
  { icon:'📡', title:'Live Build Logs', desc:'Stream your build output in real time via WebSocket. Filter by phase, jump to errors, download the full log at any time.', tag:'Observability', tagColor:'badge-cyan' },
  { icon:'🔐', title:'Managed Code Signing', desc:'Upload your certificates and provisioning profiles once. Auto-rotation with 30-day expiry alerts. AES-256 encrypted, isolated per account.', tag:'Security', tagColor:'badge-amber' },
  { icon:'📦', title:'IPA Artifact Download', desc:'Signed IPA files ready to distribute. One-click TestFlight upload, App Store Connect integration, or download directly via the API.', tag:'Distribution', tagColor:'badge-purple' },
  { icon:'🔗', title:'CI/CD Integrations', desc:'GitHub Actions, GitLab CI, Bitbucket, Jenkins, CircleCI — any platform that can send a webhook. YAML config in under 10 lines.', tag:'Integration', tagColor:'badge-cyan' },
];

const CODE_SNIPPET = `# .github/workflows/ios.yml
- name: Trigger MacBuild
  uses: macbuild/action@v2
  with:
    api-token: \${{ secrets.MACBUILD_TOKEN }}
    scheme: MyApp
    configuration: Release
    upload-testflight: true`;

export default function Features() {
  const { content } = useContent();
  const f = content?.features || {};
  const badge    = f.badge    || 'Platform';
  const title    = f.title    || 'Everything a serious iOS CI/CD needs.';
  const subtitle = f.subtitle || 'From bare metal builds to managed certificates — MacBuild handles every layer of the iOS build pipeline.';
  const items    = f.items    || DEFAULT_FEATURES;

  return (
    <section id="features" style={{ padding: '100px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(to bottom, var(--bg), transparent)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 1 }}>
        <div className="reveal" style={{ marginBottom: 60 }}>
          <span className="badge badge-cyan" style={{ marginBottom: 16 }}>{badge}</span>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,50px)', letterSpacing: '-.03em', color: '#fff', lineHeight: 1.08, marginBottom: 14 }}>{title}</h2>
          <p style={{ fontSize: 16, color: 'var(--sub)', maxWidth: 460, fontWeight: 300, lineHeight: 1.72 }}>{subtitle}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, background: 'var(--rim)', border: '1px solid var(--rim)', borderRadius: 20, overflow: 'hidden', marginBottom: 24 }}>
          {items.map((feat, i) => (
            <div key={i} className={`card-lift reveal d${(i % 3) + 1}`}
              style={{ background: 'var(--card)', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ fontSize: 34, lineHeight: 1 }}>{feat.icon}</div>
                <span className={`badge ${feat.tagColor || 'badge-cyan'}`}>{feat.tag}</span>
              </div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 12, lineHeight: 1.25 }}>{feat.title}</div>
              <div style={{ fontSize: 13.5, color: 'var(--sub)', lineHeight: 1.72, fontWeight: 300, flex: 1 }}>{feat.desc}</div>
            </div>
          ))}
        </div>

        {/* Code snippet card */}
        <div className="reveal" style={{ background: 'var(--card)', border: '1px solid var(--rim2)', borderRadius: 18, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '12px 18px', borderBottom: '1px solid var(--rim)', background: 'rgba(255,255,255,.02)' }}>
            {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
            <span style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>.github/workflows/ios.yml</span>
          </div>
          <pre style={{ margin: 0, padding: '22px 24px', fontFamily: 'JetBrains Mono,monospace', fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.85, overflowX: 'auto' }}>{CODE_SNIPPET}</pre>
        </div>
      </div>
    </section>
  );
}
