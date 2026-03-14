import { useEffect, useState, useCallback } from 'react';
import { pub } from '../lib/api';

const BASE = import.meta.env.VITE_API_URL || 'http://213.156.133.182:3001/api';

export function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.08 }
    );

    const observe = () => {
      document.querySelectorAll('.reveal:not(.in)').forEach(e => io.observe(e));
    };

    observe();

    // Observer les nouveaux éléments ajoutés dynamiquement (ex: après fetch)
    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => { io.disconnect(); mo.disconnect(); };
  });
}

export function useCountUp(target, dur = 1800, active = true) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!active || !target) return;
    let start;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setV(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, active]);
  return v;
}

export function useStats() {
  const [stats, setStats] = useState({ totalBuilds: 2100000, totalUsers: 1247, successRate: 98.4, uptime: 99.9 });
  useEffect(() => { pub.stats().then(d => { if (d?.totalBuilds) setStats(d); }); }, []);
  return stats;
}

export const DEFAULT_PLANS = [
  {
    id: 'starter', name: 'Starter', price_mo: 0, price_yr: 0, builds: 50, popular: false, trial: null,
    highlight: 'Perfect to explore the platform',
    features: ['50 builds / month','Shared Mac mini M2','GitHub Actions','Xcode 16','Live build logs','1 team member','Community support'],
    cta: 'Start for free',
  },
  {
    id: 'pro', name: 'Pro', price_mo: 79, price_yr: 63, builds: 200, popular: true, trial: '24h for $0.99',
    highlight: 'For teams shipping regularly',
    features: ['200 builds / month','Dedicated Mac mini M2 Pro','GitHub · GitLab · Bitbucket','Managed iOS certificates','Fastlane + code signing','3 team members','Priority support 24h','TestFlight auto-upload'],
    cta: 'Start trial →',
  },
  {
    id: 'team', name: 'Team', price_mo: 199, price_yr: 159, builds: 1000, popular: false, trial: null,
    highlight: 'Unlimited scale for large orgs',
    features: ['1,000 builds / month','Exclusive M2 Pro nodes','4× parallel builds','Unlimited team members','SSO + Audit log','Dedicated SLA 4h','Custom webhooks'],
    cta: 'Contact sales',
  },
];

export function useContent() {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch(`${BASE}/public/content`)
      .then(r => r.json())
      .then(d => { if (d?.content) setContent(d.content); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  return { content, loading };
}

export function usePlans() {
  const [plans, setPlans] = useState(DEFAULT_PLANS);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    pub.plans().then(d => {
      if (d?.plans?.length) {
        setPlans(d.plans.map(p => {
          const def = DEFAULT_PLANS.find(dp => dp.id === p.id) || {};
          return {
            ...def,
            ...p,
            features:  Array.isArray(p.features) && p.features.length ? p.features : def.features,
            popular:   p.popular === 1 || p.popular === true || def.popular,
            highlight: p.highlight || def.highlight || '',
            cta:       p.cta || def.cta || 'Get started →',
          };
        }));
      }
    }).finally(() => setLoading(false));
  }, []);
  return { plans, loading };
}

export function useHourPacks() {
  const [packs, setPacks]   = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    pub.hourPacks().then(d => {
      if (d?.packs?.length) setPacks(d.packs);
    }).finally(() => setLoading(false));
  }, []);
  return { packs, loading };
}

export function useTypewriter(lines, lineDelay = 110, startDelay = 500) {
  const [output, setOutput] = useState([]);
  const [blink, setBlink] = useState(true);
  useEffect(() => {
    let t;
    const run = async () => {
      for (let i = 0; i < lines.length; i++) {
        await new Promise(r => { t = setTimeout(r, i === 0 ? startDelay : lineDelay + Math.random() * 160); });
        setOutput(p => [...p, lines[i]]);
      }
    };
    run();
    const iv = setInterval(() => setBlink(b => !b), 540);
    return () => { clearTimeout(t); clearInterval(iv); };
  }, []);
  return { output, blink };
}

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4200);
  }, []);
  return { toasts, toast: add };
}
