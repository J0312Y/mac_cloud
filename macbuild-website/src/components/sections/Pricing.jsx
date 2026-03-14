import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePlans, useHourPacks } from '../../hooks';

const CHECK = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="6.5" r="6.5" fill="rgba(6,182,212,0.15)" />
    <path d="M3.5 6.5L5.5 8.5L9.5 4.5" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CLOCK = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

function PlanCard({ plan, billing, delay }) {
  const price = billing === 'yearly' ? plan.price_yr : plan.price_mo;
  const isFree = price === 0;
  const isPop = plan.popular;

  return (
    <div className={`reveal d${delay}`}
      style={{
        background: isPop ? 'var(--card2)' : 'var(--card)',
        border: isPop ? '1px solid rgba(6,182,212,.35)' : '1px solid var(--rim2)',
        borderRadius: 20, padding: '32px 26px', display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden',
        transition: 'transform .22s ease, box-shadow .22s ease',
        boxShadow: isPop ? '0 0 0 1px rgba(6,182,212,.2), 0 20px 60px rgba(6,182,212,.08)' : 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = isPop ? '0 28px 80px rgba(6,182,212,.15)' : '0 20px 60px rgba(0,0,0,.4)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isPop ? '0 0 0 1px rgba(6,182,212,.2), 0 20px 60px rgba(6,182,212,.08)' : 'none'; }}
    >
      {isPop && <div className="beam-line" style={{ top: 0, left: 0 }} />}
      {isPop && (
        <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#fff', background: 'linear-gradient(90deg,#0891b2,#06b6d4)', padding: '4px 18px', borderRadius: '0 0 11px 11px', whiteSpace: 'nowrap' }}>
          ★ Most popular
        </div>
      )}
      {plan.trial && (
        <div style={{ background: 'rgba(74,222,128,.1)', border: '1px solid rgba(74,222,128,.22)', borderRadius: 8, padding: '7px 12px', fontSize: 12, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 7, marginBottom: 20 }}>
          🎁 <strong>Trial available:</strong> {plan.trial}
        </div>
      )}
      <div style={{ fontSize: 12, fontWeight: 700, color: isPop ? 'var(--cyan)' : 'var(--sub)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>{plan.name}</div>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 52, fontWeight: 800, color: '#fff', letterSpacing: '-.05em', lineHeight: 1 }}>
          <sup style={{ fontSize: 20, verticalAlign: 'super', marginTop: 10, display: 'inline-block', color: 'var(--sub)', fontWeight: 500 }}>XAF</sup>
          {price}
        </span>
        <span style={{ fontSize: 13, color: 'var(--muted)', marginLeft: 4 }}>/mo</span>
      </div>
      {billing === 'yearly' && plan.price_mo > 0 && (
        <div style={{ fontSize: 12, color: '#4ade80', marginBottom: 4, fontWeight: 600 }}>
          Save {(plan.price_mo - plan.price_yr) * 12} XAF/year
        </div>
      )}
      <div style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 24, fontWeight: 300, lineHeight: 1.5 }}>{plan.highlight || ''}</div>
      <hr style={{ border: 'none', borderTop: '1px solid var(--rim)', marginBottom: 24 }} />
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11, flex: 1, marginBottom: 28 }}>
        {(plan.features || []).map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5, color: 'var(--sub)', fontWeight: 300 }}>
            <CHECK />{f}
          </li>
        ))}
      </ul>
      <Link to={plan.id === 'team' ? '/register?plan=team' : `/register?plan=${plan.id}`} style={{ textDecoration: 'none' }}>
        <button className={isPop ? 'btn-primary' : 'btn-ghost'} style={{ width: '100%', justifyContent: 'center', fontSize: 14, padding: '13px' }}>
          {plan.cta || 'Get started →'}
        </button>
      </Link>
    </div>
  );
}

function HourPackCard({ pack, delay }) {
  const pricePerHour = Math.round(pack.price / pack.hours).toLocaleString();
  return (
    <div className={`reveal d${delay}`}
      style={{
        background: pack.popular ? 'rgba(167,139,250,0.08)' : 'rgba(255,255,255,0.03)',
        border: pack.popular ? '1px solid rgba(167,139,250,.4)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '24px 22px', display: 'flex', flexDirection: 'column',
        position: 'relative', transition: 'transform .22s ease, box-shadow .22s ease',
        boxShadow: pack.popular ? '0 0 0 1px rgba(167,139,250,.15), 0 20px 60px rgba(167,139,250,.08)' : 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,.5)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = pack.popular ? '0 0 0 1px rgba(167,139,250,.2), 0 20px 60px rgba(167,139,250,.06)' : 'none'; }}
    >
      {pack.popular && (
        <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', color: '#fff', background: 'linear-gradient(90deg,#7c3aed,#a78bfa)', padding: '4px 16px', borderRadius: '0 0 10px 10px', whiteSpace: 'nowrap' }}>
          ★ Best value
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(167,139,250,.1)', border: '1px solid rgba(167,139,250,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CLOCK />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '.08em' }}>{pack.name}</div>
        </div>
      </div>
      <div style={{ marginBottom: 6 }}>
        <span style={{ fontFamily: 'Syne,sans-serif', fontSize: 40, fontWeight: 800, color: '#fff', letterSpacing: '-.04em', lineHeight: 1 }}>
          {pack.hours}
        </span>
        <span style={{ fontSize: 16, color: 'var(--sub)', marginLeft: 4 }}>heures</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#a78bfa', marginBottom: 4 }}>
        {Number(pack.price).toLocaleString()} {pack.currency}
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
        {pricePerHour} {pack.currency}/heure
      </div>
      <div style={{ fontSize: 13, color: 'var(--sub)', marginBottom: 20, fontWeight: 300, lineHeight: 1.5, minHeight: 20 }}>
        {pack.highlight || ''}
      </div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 9, flex: 1, marginBottom: 20 }}>
        {['Paiement Airtel Money', 'Activation après confirmation', 'Valable pour tous les builds', 'Pas d\'abonnement requis'].map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--sub)', fontWeight: 300 }}>
            <CLOCK />{f}
          </li>
        ))}
      </ul>
      <Link to="/register?plan=starter" style={{ textDecoration: 'none' }}>
        <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: 13, padding: '11px', borderColor: 'rgba(167,139,250,.3)', color: '#a78bfa' }}>
          {pack.cta || 'Acheter →'}
        </button>
      </Link>
    </div>
  );
}

export default function Pricing() {
  const [billing, setBilling] = useState('monthly');
  const { plans, loading }         = usePlans();
  const { packs, loading: loadingP } = useHourPacks();

  return (
    <section id="pricing" style={{ padding: '100px 0', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(6,182,212,.04) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 28px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 52 }}>
          <span className="badge badge-cyan" style={{ marginBottom: 16 }}>Pricing</span>
          <h2 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(28px,4vw,50px)', letterSpacing: '-.03em', color: '#fff', lineHeight: 1.08 }}>
            Simple, transparent pricing.
          </h2>
          <p style={{ fontSize: 16, color: 'var(--sub)', fontWeight: 300, marginTop: 14, maxWidth: 420, margin: '14px auto 0' }}>
            No hidden fees. Cancel any time. Plans update live when our team adjusts them.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="reveal" style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', background: 'var(--card)', border: '1px solid var(--rim2)', borderRadius: 12, padding: 5 }}>
            {['monthly', 'yearly'].map(m => (
              <button key={m} onClick={() => setBilling(m)}
                style={{
                  background: billing === m ? 'var(--card2)' : 'none',
                  border: billing === m ? '1px solid var(--rim2)' : '1px solid transparent',
                  color: billing === m ? 'var(--text)' : 'var(--sub)',
                  borderRadius: 9, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'DM Sans,sans-serif', transition: 'all .2s', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
                {m === 'yearly' && <span style={{ fontSize: 11, color: '#4ade80', fontWeight: 700 }}>−20%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
          {loading
            ? [1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 520, borderRadius: 20 }} />)
            : plans.map((p, i) => <PlanCard key={p.id} plan={p} billing={billing} delay={i + 1} />)
          }
        </div>

        {/* Pay as you go section */}
        <div className="reveal" style={{ marginTop: 72 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(167,139,250,.08)', border: '1px solid rgba(167,139,250,.2)', borderRadius: 999, padding: '6px 16px', fontSize: 11, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>
              ⏱ Pay as you go
            </div>
            <h3 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 'clamp(22px,3vw,36px)', letterSpacing: '-.03em', color: '#fff', marginBottom: 12 }}>
              Pas d'abonnement ? Pas de problème.
            </h3>
            <p style={{ fontSize: 15, color: 'var(--sub)', fontWeight: 300, maxWidth: 440, margin: '0 auto' }}>
              Achetez des crédits horaires et buildez à la demande. Parfait pour les projets occasionnels.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 14 }}>
            {loadingP
              ? [1,2,3,4].map(i => <div key={i} className="shimmer" style={{ height: 260, borderRadius: 16 }} />)
              : packs.map((p, i) => <HourPackCard key={p.id} pack={p} delay={i + 1} />)
            }
          </div>

          <div style={{ marginTop: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>
              ✓ Paiement via Airtel Money &nbsp;·&nbsp; ✓ Activation après confirmation admin &nbsp;·&nbsp; ✓ Build stoppé automatiquement si crédits épuisés
            </p>
          </div>
        </div>

        {/* Feature comparison note */}
        <div className="reveal" style={{ marginTop: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            ✓ No credit card required for Starter &nbsp;·&nbsp; ✓ Cancel any time &nbsp;·&nbsp; ✓ Data hosted in EU &nbsp;·&nbsp;
            <a href="#faq" style={{ color: 'var(--cyan)', textDecoration: 'none' }} onClick={e => { e.preventDefault(); document.querySelector('#faq')?.scrollIntoView({ behavior: 'smooth' }); }}>
              FAQ →
            </a>
          </p>
        </div>

        {/* Enterprise banner */}
        <div className="reveal" style={{ marginTop: 20, background: 'var(--card)', border: '1px solid var(--rim2)', borderRadius: 16, padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 48, height: 48, borderRadius: 13, background: 'rgba(129,140,248,.1)', border: '1px solid rgba(129,140,248,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🏢</div>
            <div>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 5 }}>Enterprise — Custom volume</div>
              <div style={{ fontSize: 13.5, color: 'var(--sub)', fontWeight: 300 }}>Dedicated clusters, custom SLAs, SSO, invoicing, and white-glove onboarding.</div>
            </div>
          </div>
          <a href="mailto:enterprise@macbuild.cloud" className="btn-ghost" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>Contact sales →</a>
        </div>

      </div>
    </section>
  );
}
