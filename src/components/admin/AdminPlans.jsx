// @ts-nocheck
import { useState, useEffect, memo, useCallback } from "react";
import Icon from "../ui/Icon.jsx";
import { C, CH } from "../ui/SharedUI.jsx";

const API = "http://213.156.133.182:3001/api";
const tok = () => localStorage.getItem("mbc_token");
const authH = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${tok()}` });
const EMPTY = { id:"", name:"", price_mo:"", price_yr:"", builds:"50", users_max:"1", parallel:"1", hardware:"Shared Mac mini M2", support:"Community", trial:"", popular:false, highlight:"", features:"", cta:"Get started →" };

// ─── Nouveau plan ─────────────────────────────────────────────────────────────
const NewPlanForm = memo(function NewPlanForm({ onCreated, addToast }) {
  const [p, setP]       = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const set = (k, v)    => setP(x => ({ ...x, [k]: v }));

  const submit = async () => {
    if (!p.id || !p.name || p.price_mo === "") return addToast("ID, nom et prix requis", "error");
    setBusy(true);
    try {
      const r = await fetch(`${API}/admin/plans`, {
        method: "POST", headers: authH(),
        body: JSON.stringify({
          ...p,
          price_mo: Number(p.price_mo), price_yr: Number(p.price_yr||0),
          builds: Number(p.builds||50), users_max: Number(p.users_max||1), parallel: Number(p.parallel||1),
          features: p.features ? p.features.split(',').map(f => f.trim()).filter(Boolean) : [],
        }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      addToast(`✅ Plan ${p.name} créé`, "success");
      setP(EMPTY);
      onCreated();
    } catch (e) { addToast(`❌ ${e.message}`, "error"); }
    finally     { setBusy(false); }
  };

  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {[
          ["ID (unique, ex: enterprise)", "id",        "text",   "enterprise"],
          ["Nom affiché",                 "name",      "text",   "Enterprise"],
          ["Prix mensuel (XAF)",          "price_mo",  "number", "299"],
          ["Prix annuel (XAF)",           "price_yr",  "number", "239"],
          ["Builds / mois",               "builds",    "number", "1000"],
          ["Membres max (-1 = illimité)", "users_max", "number", "-1"],
          ["Builds parallèles",           "parallel",  "number", "2"],
          ["Trial",                       "trial",     "text",   "7 days free"],
        ].map(([label, field, type, placeholder]) => (
          <div key={field}>
            <label className="text-[9px] text-slate-500 block mb-1">{label}</label>
            <input value={p[field]} type={type} placeholder={placeholder}
              onChange={e => set(field, e.target.value)}
              className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)] transition-colors"/>
          </div>
        ))}
      </div>
      {[["Hardware","hardware","Dedicated Mac mini M2 Pro"],["Support","support","Priority 24h"]].map(([label,field,placeholder]) => (
        <div key={field}>
          <label className="text-[9px] text-slate-500 block mb-1">{label}</label>
          <input value={p[field]} type="text" placeholder={placeholder}
            onChange={e => set(field, e.target.value)}
            className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)] transition-colors"/>
        </div>
      ))}
      <div>
        <label className="text-[9px] text-slate-500 block mb-1">Tagline (highlight)</label>
        <input value={p.highlight||""} type="text" placeholder="Pour les petites équipes"
          onChange={e => set("highlight", e.target.value)}
          className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)] transition-colors"/>
      </div>
      <div>
        <label className="text-[9px] text-slate-500 block mb-1">Texte bouton (CTA)</label>
        <input value={p.cta||""} type="text" placeholder="Get started →"
          onChange={e => set("cta", e.target.value)}
          className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)] transition-colors"/>
      </div>
      <div>
        <label className="text-[9px] text-slate-500 block mb-1">Features (séparées par virgule)</label>
        <textarea value={p.features||""} rows={3}
          placeholder="10 builds/mois, 1 parallel build, Support communauté"
          onChange={e => set("features", e.target.value)}
          className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)] transition-colors resize-none"/>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="np-popular" checked={!!p.popular}
          onChange={e => set("popular", e.target.checked)} className="w-3 h-3"/>
        <label htmlFor="np-popular" className="text-[10px] text-slate-400">Plan populaire</label>
      </div>
      <button onClick={submit} disabled={busy}
        className="flex items-center gap-1.5 px-4 py-2 accent-bg-dyn text-white text-xs font-bold rounded-lg disabled:opacity-50">
        {busy
          ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
          : <Icon name="plus" size={12}/>}
        Créer le plan
      </button>
    </div>
  );
});

// ─── Carte plan existant ──────────────────────────────────────────────────────
const PlanCard = memo(function PlanCard({ plan, onSaved, onDeleted, addToast, accent }) {
  const [p, setP]           = useState(plan);
  const [saving, setSaving] = useState(false);
  const [deleting, setDel]  = useState(false);
  const set = (k, v)        => setP(x => ({ ...x, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch(`${API}/admin/plans/${p.id}`, {
        method: "PATCH", headers: authH(),
        body: JSON.stringify({
          name: p.name, price_mo: Number(p.price_mo), price_yr: Number(p.price_yr),
          builds: Number(p.builds), users_max: Number(p.users_max), parallel: Number(p.parallel),
          features: typeof p.features === 'string'
            ? p.features.split(',').map(f => f.trim()).filter(Boolean)
            : (Array.isArray(p.features) ? p.features : []),
          popular: p.popular ? 1 : 0, trial: p.trial || null,
          hardware: p.hardware, support: p.support, active: p.active ? 1 : 0,
          highlight: p.highlight || null, cta: p.cta || null,
        }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      addToast(`✅ Plan ${p.name} sauvegardé`, "success");
      onSaved();
    } catch (e) { addToast(`❌ ${e.message}`, "error"); }
    finally     { setSaving(false); }
  };

  const del = async () => {
    if (!confirm(`Supprimer le plan "${p.name}" ?`)) return;
    setDel(true);
    try {
      const r = await fetch(`${API}/admin/plans/${p.id}`, { method: "DELETE", headers: authH() });
      if (!r.ok) throw new Error((await r.json()).error);
      addToast(`Plan ${p.name} supprimé`, "warn");
      onDeleted(p.id);
    } catch (e) { addToast(`❌ ${e.message}`, "error"); }
    finally     { setDel(false); }
  };

  return (
    <C className={`border ${accent}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-black text-slate-200 uppercase tracking-widest">{p.name}</p>
          <p className="text-[9px] text-slate-500 mt-0.5">
            {p.price_mo} XAF/mo · {p.price_yr} XAF/an
            {p.popular ? <span className="ml-2 text-cyan-400 font-bold">★ Popular</span> : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${p.active ? "bg-emerald-400" : "bg-red-400"}`}
            title={p.active ? "Actif" : "Inactif"}/>
          <button onClick={del} disabled={deleting}
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40">
            {deleting
              ? <span className="w-3 h-3 border border-red-400/40 border-t-red-400 rounded-full animate-spin block"/>
              : <Icon name="trash" size={12}/>}
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="p-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {[
            ["Prix mensuel (XAF)", "price_mo", "number"],
            ["Prix annuel (XAF)",  "price_yr", "number"],
            ["Builds / mois",      "builds",   "number"],
            ["Membres max",        "users_max","number"],
            ["Parallèles",         "parallel", "number"],
            ["Trial",              "trial",    "text"],
          ].map(([label, field, type]) => (
            <div key={field}>
              <label className="text-[9px] text-slate-500 block mb-1">{label}</label>
              <input value={p[field] ?? ""} type={type}
                onChange={e => set(field, e.target.value)}
                className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)] transition-colors"/>
            </div>
          ))}
        </div>
        {[["Hardware","hardware"],["Support","support"]].map(([label,field]) => (
          <div key={field}>
            <label className="text-[9px] text-slate-500 block mb-1">{label}</label>
            <input value={p[field] ?? ""} type="text"
              onChange={e => set(field, e.target.value)}
              className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)] transition-colors"/>
          </div>
        ))}
        <div>
          <label className="text-[9px] text-slate-500 block mb-1">Tagline (highlight)</label>
          <input value={p.highlight ?? ""} type="text" placeholder="Pour les petites équipes"
            onChange={e => set("highlight", e.target.value)}
            className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)] transition-colors"/>
        </div>
        <div>
          <label className="text-[9px] text-slate-500 block mb-1">Texte bouton (CTA)</label>
          <input value={p.cta ?? ""} type="text" placeholder="Get started →"
            onChange={e => set("cta", e.target.value)}
            className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)] transition-colors"/>
        </div>
        <div>
          <label className="text-[9px] text-slate-500 block mb-1">Features (séparées par virgule)</label>
          <textarea
            value={Array.isArray(p.features) ? p.features.join(', ') : (p.features ?? "")}
            rows={3} placeholder="10 builds/mois, 1 parallel build, Support communauté"
            onChange={e => set("features", e.target.value)}
            className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)] transition-colors resize-none"/>
        </div>

        {/* Toggles */}
        {[
          ["Plan populaire", "popular", "bg-cyan-500"],
          ["Plan actif",     "active",  "bg-emerald-500"],
        ].map(([label, field, color]) => (
          <div key={field} className="flex items-center justify-between py-1">
            <span className="text-[9px] text-slate-500">{label}</span>
            <button onClick={() => set(field, p[field] ? 0 : 1)}
              className={`w-8 h-4 rounded-full transition-colors relative ${p[field] ? color : "bg-white/10"}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${p[field] ? "translate-x-4" : "translate-x-0.5"}`}/>
            </button>
          </div>
        ))}

        <button onClick={save} disabled={saving}
          className="w-full mt-2 py-2 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-white hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
          {saving
            ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Sauvegarde…</>
            : <><Icon name="save" size={11}/>Sauvegarder</>}
        </button>
      </div>
    </C>
  );
});

// ─── Composant principal ──────────────────────────────────────────────────────
const ACCENTS = ["border-slate-500/20","accent-border","border-amber-500/20","border-sky-500/20","border-emerald-500/20"];

const AdminPlans = ({ addToast }) => {
  const [plans,   setPlans]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/plans`, { headers: authH() });
      const d = await r.json();
      setPlans(d.plans || []);
    } catch { addToast("Erreur chargement plans", "error"); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const handleSaved   = useCallback(() => load(), [load]);
  const handleDeleted = useCallback((id) => setPlans(ps => ps.filter(x => x.id !== id)), []);
  const handleCreated = useCallback(() => { setShowNew(false); load(); }, [load]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-500">
          {plans.length} plan{plans.length !== 1 ? "s" : ""} — données live depuis la DB
        </p>
        <button onClick={() => setShowNew(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 accent-bg-dyn text-white text-[10px] font-bold rounded-lg transition-colors">
          <Icon name={showNew ? "x" : "plus"} size={11}/>
          {showNew ? "Annuler" : "Nouveau plan"}
        </button>
      </div>

      {showNew && (
        <C className="border accent-border">
          <CH title="Créer un nouveau plan"/>
          <NewPlanForm addToast={addToast} onCreated={handleCreated}/>
        </C>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {plans.map((p, i) => (
          <PlanCard key={p.id} plan={p} accent={ACCENTS[i % ACCENTS.length]}
            addToast={addToast}
            onSaved={handleSaved}
            onDeleted={handleDeleted}/>
        ))}
      </div>
    </div>
  );
};

export default AdminPlans;
