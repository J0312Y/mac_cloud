// @ts-nocheck
import { useState, useEffect, memo, useCallback } from "react";
import Icon from "../ui/Icon.jsx";
import { C, CH } from "../ui/SharedUI.jsx";

const API = "http://213.156.133.182:3001/api";
const tok = () => localStorage.getItem("mbc_token");
const authH = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${tok()}` });
const EMPTY = { name:"", hours:"", price:"", currency:"XAF", popular:false, highlight:"", cta:"Acheter →" };

// ─── Formulaire nouveau pack ──────────────────────────────────────────────────
const NewPackForm = memo(function NewPackForm({ onCreated, addToast }) {
  const [p, setP]       = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const set = (k, v)    => setP(x => ({ ...x, [k]: v }));

  const submit = async () => {
    if (!p.name || !p.hours || !p.price) return addToast("Nom, heures et prix requis", "error");
    setBusy(true);
    try {
      const r = await fetch(`${API}/admin/hour-packs`, {
        method: "POST", headers: authH(),
        body: JSON.stringify({ ...p, hours: Number(p.hours), price: Number(p.price), popular: p.popular ? 1 : 0 }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      addToast(`✅ Pack ${p.name} créé`, "success");
      setP(EMPTY);
      onCreated();
    } catch (e) { addToast(`❌ ${e.message}`, "error"); }
    finally     { setBusy(false); }
  };

  return (
    <div className="p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {[
          ["Nom du pack",    "name",     "text",   "Pack 5h"],
          ["Heures",         "hours",    "number", "5"],
          ["Prix (XAF)",     "price",    "number", "2000"],
          ["Devise",         "currency", "text",   "XAF"],
        ].map(([label, field, type, placeholder]) => (
          <div key={field}>
            <label className="text-[9px] text-slate-500 block mb-1">{label}</label>
            <input value={p[field]} type={type} placeholder={placeholder}
              onChange={e => set(field, e.target.value)}
              className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)] transition-colors"/>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="np-popular" checked={!!p.popular}
          onChange={e => set("popular", e.target.checked)} className="w-3 h-3"/>
        <label htmlFor="np-popular" className="text-[10px] text-slate-400">Pack populaire</label>
      </div>
      <div>
        <label className="text-[9px] text-slate-500 block mb-1">Tagline (highlight)</label>
        <input value={p.highlight||""} type="text" placeholder="Idéal pour tester"
          onChange={e => set("highlight", e.target.value)}
          className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)] transition-colors"/>
      </div>
      <div>
        <label className="text-[9px] text-slate-500 block mb-1">Texte bouton (CTA)</label>
        <input value={p.cta||""} type="text" placeholder="Acheter →"
          onChange={e => set("cta", e.target.value)}
          className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)] transition-colors"/>
      </div>
      <button onClick={submit} disabled={busy}
        className="flex items-center gap-1.5 px-4 py-2 accent-bg-dyn text-white text-xs font-bold rounded-lg disabled:opacity-50">
        {busy ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Icon name="plus" size={12}/>}
        Créer le pack
      </button>
    </div>
  );
});

// ─── Carte pack existant ──────────────────────────────────────────────────────
const PackCard = memo(function PackCard({ pack, onSaved, onDeleted, addToast }) {
  const [p, setP]           = useState(pack);
  const [saving, setSaving] = useState(false);
  const [deleting, setDel]  = useState(false);
  const set = (k, v)        => setP(x => ({ ...x, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch(`${API}/admin/hour-packs/${p.id}`, {
        method: "PATCH", headers: authH(),
        body: JSON.stringify({ name: p.name, hours: Number(p.hours), price: Number(p.price), currency: p.currency, popular: p.popular ? 1 : 0, active: p.active ? 1 : 0, highlight: p.highlight || null, cta: p.cta || null }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      addToast(`✅ Pack ${p.name} sauvegardé`, "success");
      onSaved();
    } catch (e) { addToast(`❌ ${e.message}`, "error"); }
    finally     { setSaving(false); }
  };

  const del = async () => {
    if (!confirm(`Supprimer le pack "${p.name}" ?`)) return;
    setDel(true);
    try {
      const r = await fetch(`${API}/admin/hour-packs/${p.id}`, { method: "DELETE", headers: authH() });
      if (!r.ok) throw new Error((await r.json()).error);
      addToast(`Pack ${p.name} supprimé`, "warn");
      onDeleted(p.id);
    } catch (e) { addToast(`❌ ${e.message}`, "error"); }
    finally     { setDel(false); }
  };

  return (
    <C className="border border-white/[0.07]">
      <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-black text-slate-200">{p.name}</p>
          <p className="text-[9px] text-slate-500 mt-0.5">
            {p.hours}h · {Number(p.price).toLocaleString()} {p.currency}
            {p.popular ? <span className="ml-2 text-cyan-400 font-bold">★ Populaire</span> : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${p.active ? "bg-emerald-400" : "bg-red-400"}`}/>
          <button onClick={del} disabled={deleting}
            className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40">
            {deleting ? <span className="w-3 h-3 border border-red-400/40 border-t-red-400 rounded-full animate-spin block"/> : <Icon name="trash" size={12}/>}
          </button>
        </div>
      </div>
      <div className="p-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {[["Nom","name","text"],["Heures","hours","number"],["Prix","price","number"],["Devise","currency","text"]].map(([label,field,type]) => (
            <div key={field}>
              <label className="text-[9px] text-slate-500 block mb-1">{label}</label>
              <input value={p[field] ?? ""} type={type} onChange={e => set(field, e.target.value)}
                className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)] transition-colors"/>
            </div>
          ))}
        </div>
        {[["Tagline (highlight)","highlight"],["Texte bouton (CTA)","cta"]].map(([label,field]) => (
          <div key={field}>
            <label className="text-[9px] text-slate-500 block mb-1">{label}</label>
            <input value={p[field] ?? ""} type="text" onChange={e => set(field, e.target.value)}
              className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)] transition-colors"/>
          </div>
        ))}
        {[["Pack populaire","popular","bg-cyan-500"],["Pack actif","active","bg-emerald-500"]].map(([label,field,color]) => (<div key={field} className="flex items-center justify-between py-1">
            <span className="text-[9px] text-slate-500">{label}</span>
            <button onClick={() => set(field, p[field] ? 0 : 1)}
              className={`w-8 h-4 rounded-full transition-colors relative ${p[field] ? color : "bg-white/10"}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${p[field] ? "translate-x-4" : "translate-x-0.5"}`}/>
            </button>
          </div>
        ))}
        <button onClick={save} disabled={saving}
          className="w-full mt-1 py-2 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-white hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50">
          {saving ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Sauvegarde…</> : <><Icon name="save" size={11}/>Sauvegarder</>}
        </button>
      </div>
    </C>
  );
});

// ─── Composant principal ──────────────────────────────────────────────────────
const AdminHourPacks = ({ addToast }) => {
  const [packs,   setPacks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/hour-packs`, { headers: authH() });
      const d = await r.json();
      setPacks(d.packs || []);
    } catch { addToast("Erreur chargement packs", "error"); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const handleSaved   = useCallback(() => load(), [load]);
  const handleDeleted = useCallback((id) => setPacks(ps => ps.filter(x => x.id !== id)), []);
  const handleCreated = useCallback(() => { setShowNew(false); load(); }, [load]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-300">Packs horaires</p>
          <p className="text-[10px] text-slate-500">{packs.length} pack{packs.length !== 1 ? "s" : ""} configurés</p>
        </div>
        <button onClick={() => setShowNew(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 accent-bg-dyn text-white text-[10px] font-bold rounded-lg">
          <Icon name={showNew ? "x" : "plus"} size={11}/>{showNew ? "Annuler" : "Nouveau pack"}
        </button>
      </div>

      {showNew && (
        <C className="border accent-border">
          <CH title="Créer un nouveau pack horaire"/>
          <NewPackForm addToast={addToast} onCreated={handleCreated}/>
        </C>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {packs.map(p => (
          <PackCard key={p.id} pack={p} addToast={addToast} onSaved={handleSaved} onDeleted={handleDeleted}/>
        ))}
      </div>
    </div>
  );
};

export default AdminHourPacks;
