// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import Icon from "../ui/Icon.jsx";
import { C, CH } from "../ui/SharedUI.jsx";

const API = "http://213.156.133.182:3001/api";
const tok = () => localStorage.getItem("mbc_token");
const authH = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${tok()}` });

// ─── Sous-éditeurs par section ────────────────────────────────────────────────

const Field = ({ label, value, onChange, multiline = false, type = "text" }) => (
  <div>
    <label className="text-[9px] text-slate-500 block mb-1">{label}</label>
    {multiline
      ? <textarea value={value || ""} rows={3} onChange={e => onChange(e.target.value)}
          className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)] transition-colors resize-none"/>
      : <input value={value || ""} type={type} onChange={e => onChange(e.target.value)}
          className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)] transition-colors"/>
    }
  </div>
);

// Éditeur Hero
const HeroEditor = ({ data, onChange }) => {
  const u = (k, v) => onChange({ ...data, [k]: v });
  const updateIntegration = (i, v) => { const arr = [...(data.integrations||[])]; arr[i]=v; u("integrations", arr); };
  const addIntegration = () => u("integrations", [...(data.integrations||[]), ""]);
  const removeIntegration = i => u("integrations", (data.integrations||[]).filter((_,idx)=>idx!==i));
  const updateStat = (i, k, v) => { const arr = [...(data.stats||[])]; arr[i]={...arr[i],[k]:v}; u("stats", arr); };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Eyebrow (badge)" value={data.eyebrow} onChange={v => u("eyebrow", v)}/>
        <Field label="Trust text" value={data.trust_text} onChange={v => u("trust_text", v)}/>
        <Field label="Titre ligne 1" value={data.title_line1} onChange={v => u("title_line1", v)}/>
        <Field label="Titre ligne 2 (gradient)" value={data.title_line2} onChange={v => u("title_line2", v)}/>
        <Field label="CTA principal" value={data.cta_primary} onChange={v => u("cta_primary", v)}/>
        <Field label="CTA secondaire" value={data.cta_secondary} onChange={v => u("cta_secondary", v)}/>
      </div>
      <Field label="Sous-titre" value={data.subtitle} onChange={v => u("subtitle", v)} multiline/>

      <div>
        <p className="text-[9px] text-slate-500 mb-2">Intégrations (badges ticker)</p>
        {(data.integrations||[]).map((t,i) => (
          <div key={i} className="flex gap-2 mb-1.5">
            <input value={t} onChange={e => updateIntegration(i, e.target.value)}
              className="flex-1 bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)]"/>
            <button onClick={() => removeIntegration(i)} className="text-red-400 hover:text-red-300 text-xs px-2">×</button>
          </div>
        ))}
        <button onClick={addIntegration} className="text-[10px] text-slate-500 hover:text-slate-300 mt-1">+ Ajouter</button>
      </div>

      <div>
        <p className="text-[9px] text-slate-500 mb-2">Stats terminal (3 cases)</p>
        <div className="grid grid-cols-3 gap-2">
          {(data.stats||[]).map((s,i) => (
            <div key={i} className="space-y-1">
              <input value={s.label} placeholder="Label" onChange={e => updateStat(i,"label",e.target.value)}
                className="w-full bg-black/30 border border-white/[0.07] rounded px-2 py-1 text-[10px] text-slate-300 outline-none"/>
              <input value={s.value} placeholder="Valeur" onChange={e => updateStat(i,"value",e.target.value)}
                className="w-full bg-black/30 border border-white/[0.07] rounded px-2 py-1 text-[10px] text-slate-300 outline-none"/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Éditeur Features
const FeaturesEditor = ({ data, onChange }) => {
  const u = (k, v) => onChange({ ...data, [k]: v });
  const updateItem = (i, k, v) => { const arr = [...(data.items||[])]; arr[i]={...arr[i],[k]:v}; u("items", arr); };
  const addItem = () => u("items", [...(data.items||[]), { icon:"⭐", title:"Nouvelle feature", desc:"Description", tag:"Feature", tagColor:"badge-cyan" }]);
  const removeItem = i => u("items", (data.items||[]).filter((_,idx)=>idx!==i));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Badge" value={data.badge} onChange={v => u("badge", v)}/>
        <Field label="Titre" value={data.title} onChange={v => u("title", v)}/>
      </div>
      <Field label="Sous-titre" value={data.subtitle} onChange={v => u("subtitle", v)} multiline/>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] text-slate-500">Features ({(data.items||[]).length})</p>
          <button onClick={addItem} className="text-[10px] accent-text-dyn hover:underline">+ Ajouter</button>
        </div>
        <div className="space-y-3">
          {(data.items||[]).map((item,i) => (
            <div key={i} className="bg-black/20 border border-white/[0.05] rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400">Feature {i+1}</span>
                <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-300 text-xs">Supprimer</button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Field label="Icône (emoji)" value={item.icon} onChange={v => updateItem(i,"icon",v)}/>
                <Field label="Tag" value={item.tag} onChange={v => updateItem(i,"tag",v)}/>
                <div className="col-span-2"><Field label="Titre" value={item.title} onChange={v => updateItem(i,"title",v)}/></div>
              </div>
              <Field label="Description" value={item.desc} onChange={v => updateItem(i,"desc",v)} multiline/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Éditeur HowItWorks
const HowEditor = ({ data, onChange }) => {
  const u = (k, v) => onChange({ ...data, [k]: v });
  const updateStep = (i, k, v) => { const arr = [...(data.steps||[])]; arr[i]={...arr[i],[k]:v}; u("steps", arr); };
  const addStep = () => u("steps", [...(data.steps||[]), { num:String((data.steps||[]).length+1).padStart(2,"0"), icon:"🔧", title:"Nouvelle étape", desc:"Description", detail:"Détail" }]);
  const removeStep = i => u("steps", (data.steps||[]).filter((_,idx)=>idx!==i));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Badge" value={data.badge} onChange={v => u("badge", v)}/>
        <Field label="Titre" value={data.title} onChange={v => u("title", v)}/>
      </div>
      <Field label="Sous-titre" value={data.subtitle} onChange={v => u("subtitle", v)} multiline/>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] text-slate-500">Étapes ({(data.steps||[]).length})</p>
          <button onClick={addStep} className="text-[10px] accent-text-dyn hover:underline">+ Ajouter</button>
        </div>
        {(data.steps||[]).map((step,i) => (
          <div key={i} className="bg-black/20 border border-white/[0.05] rounded-lg p-3 space-y-2 mb-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400">Étape {step.num}</span>
              <button onClick={() => removeStep(i)} className="text-red-400 text-xs">Supprimer</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Numéro" value={step.num} onChange={v => updateStep(i,"num",v)}/>
              <Field label="Icône" value={step.icon} onChange={v => updateStep(i,"icon",v)}/>
              <Field label="Titre" value={step.title} onChange={v => updateStep(i,"title",v)}/>
            </div>
            <Field label="Description" value={step.desc} onChange={v => updateStep(i,"desc",v)} multiline/>
            <Field label="Détail (petit encadré)" value={step.detail} onChange={v => updateStep(i,"detail",v)}/>
          </div>
        ))}
      </div>
    </div>
  );
};

// Éditeur FAQ
const FAQEditor = ({ data, onChange }) => {
  const u = (k, v) => onChange({ ...data, [k]: v });
  const updateItem = (i, k, v) => { const arr = [...(data.items||[])]; arr[i]={...arr[i],[k]:v}; u("items", arr); };
  const addItem = () => u("items", [...(data.items||[]), { q:"Nouvelle question ?", a:"Réponse ici." }]);
  const removeItem = i => u("items", (data.items||[]).filter((_,idx)=>idx!==i));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Badge" value={data.badge} onChange={v => u("badge", v)}/>
        <Field label="Titre" value={data.title} onChange={v => u("title", v)}/>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] text-slate-500">Questions ({(data.items||[]).length})</p>
          <button onClick={addItem} className="text-[10px] accent-text-dyn hover:underline">+ Ajouter</button>
        </div>
        {(data.items||[]).map((item,i) => (
          <div key={i} className="bg-black/20 border border-white/[0.05] rounded-lg p-3 space-y-2 mb-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400">Q{i+1}</span>
              <button onClick={() => removeItem(i)} className="text-red-400 text-xs">Supprimer</button>
            </div>
            <Field label="Question" value={item.q} onChange={v => updateItem(i,"q",v)}/>
            <Field label="Réponse" value={item.a} onChange={v => updateItem(i,"a",v)} multiline/>
          </div>
        ))}
      </div>
    </div>
  );
};

// Éditeur Footer
const FooterEditor = ({ data, onChange }) => {
  const u = (k, v) => onChange({ ...data, [k]: v });
  const updateCol = (ci, field, val) => { const cols=[...(data.cols||[])]; cols[ci]={...cols[ci],[field]:val}; u("cols",cols); };
  const updateLink = (ci, li, field, val) => { const cols=[...(data.cols||[])]; const links=[...(cols[ci].links||[])]; links[li]={...links[li],[field]:val}; cols[ci]={...cols[ci],links}; u("cols",cols); };
  const addLink = (ci) => { const cols=[...(data.cols||[])]; cols[ci]={...cols[ci],links:[...(cols[ci].links||[]),{label:"Nouveau lien",href:"#"}]}; u("cols",cols); };
  const removeLink = (ci,li) => { const cols=[...(data.cols||[])]; cols[ci]={...cols[ci],links:(cols[ci].links||[]).filter((_,i)=>i!==li)}; u("cols",cols); };
  const addCol = () => u("cols",[...(data.cols||[]),{title:"Nouvelle colonne",links:[]}]);
  const removeCol = ci => u("cols",(data.cols||[]).filter((_,i)=>i!==ci));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Copyright" value={data.copyright} onChange={v => u("copyright", v)}/>
        <Field label="Texte statut" value={data.status_text} onChange={v => u("status_text", v)}/>
      </div>
      <Field label="Description marque" value={data.brand_desc} onChange={v => u("brand_desc", v)} multiline/>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[9px] text-slate-500">Colonnes footer</p>
          <button onClick={addCol} className="text-[10px] accent-text-dyn hover:underline">+ Colonne</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {(data.cols||[]).map((col,ci) => (
            <div key={ci} className="bg-black/20 border border-white/[0.05] rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <Field label="Titre colonne" value={col.title} onChange={v => updateCol(ci,"title",v)}/>
                <button onClick={() => removeCol(ci)} className="text-red-400 text-xs ml-2 mt-4">×</button>
              </div>
              {(col.links||[]).map((link,li) => (
                <div key={li} className="flex gap-1 items-center">
                  <input value={link.label} placeholder="Label" onChange={e => updateLink(ci,li,"label",e.target.value)}
                    className="flex-1 bg-black/30 border border-white/[0.07] rounded px-2 py-1 text-[10px] text-slate-300 outline-none"/>
                  <input value={link.href} placeholder="URL" onChange={e => updateLink(ci,li,"href",e.target.value)}
                    className="flex-1 bg-black/30 border border-white/[0.07] rounded px-2 py-1 text-[10px] text-slate-300 outline-none"/>
                  <button onClick={() => removeLink(ci,li)} className="text-red-400 text-xs">×</button>
                </div>
              ))}
              <button onClick={() => addLink(ci)} className="text-[9px] text-slate-600 hover:text-slate-400">+ lien</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Éditeur CTA
const CTAEditor = ({ data, onChange }) => {
  const u = (k, v) => onChange({ ...data, [k]: v });
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="CTA 1 (bouton principal)" value={data.cta1} onChange={v => u("cta1", v)}/>
        <Field label="CTA 2 (bouton secondaire)" value={data.cta2} onChange={v => u("cta2", v)}/>
      </div>
      <Field label="Titre" value={data.title} onChange={v => u("title", v)}/>
      <Field label="Sous-titre" value={data.subtitle} onChange={v => u("subtitle", v)} multiline/>
    </div>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────
const SECTIONS = [
  { key: "hero",        label: "Hero",          icon: "home",     Editor: HeroEditor },
  { key: "features",    label: "Features",      icon: "layers",   Editor: FeaturesEditor },
  { key: "how_it_works",label: "How it works",  icon: "list",     Editor: HowEditor },
  { key: "faq",         label: "FAQ",           icon: "help",     Editor: FAQEditor },
  { key: "footer",      label: "Footer",        icon: "columns",  Editor: FooterEditor },
  { key: "cta",         label: "CTA final",     icon: "zap",      Editor: CTAEditor },
];

const AdminWebsite = ({ addToast }) => {
  const [content,  setContent]  = useState({});
  const [loading,  setLoading]  = useState(true);
  const [active,   setActive]   = useState("hero");
  const [saving,   setSaving]   = useState(false);
  const [draft,    setDraft]    = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/content`, { headers: authH() });
      const d = await r.json();
      const parsed = {};
      for (const [k, v] of Object.entries(d.content || {})) {
        parsed[k] = v.data || v;
      }
      setContent(parsed);
      setDraft(parsed);
    } catch { addToast("Erreur chargement contenu", "error"); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch(`${API}/admin/content/${active}`, {
        method: "PATCH", headers: authH(),
        body: JSON.stringify(draft[active] || {}),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      setContent(c => ({ ...c, [active]: draft[active] }));
      addToast(`✅ Section "${active}" sauvegardée`, "success");
    } catch (e) { addToast(`❌ ${e.message}`, "error"); }
    finally     { setSaving(false); }
  };

  const reset = () => setDraft(d => ({ ...d, [active]: content[active] }));

  const section = SECTIONS.find(s => s.key === active);
  const Editor  = section?.Editor;
  const isDirty = JSON.stringify(draft[active]) !== JSON.stringify(content[active]);

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar sections */}
      <div className="w-44 flex-shrink-0 border-r border-white/[0.05] overflow-y-auto py-2">
        {SECTIONS.map(s => (
          <button key={s.key} onClick={() => setActive(s.key)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 text-[11px] transition-all ${active === s.key ? "nav-active border text-white" : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"}`}>
            <Icon name={s.icon} size={12}/>
            <span>{s.label}</span>
            {active !== s.key && draft[s.key] && JSON.stringify(draft[s.key]) !== JSON.stringify(content[s.key]) && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400"/>
            )}
          </button>
        ))}
      </div>

      {/* Editor area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
          <div>
            <p className="text-xs font-bold text-slate-200">{section?.label}</p>
            <p className="text-[10px] text-slate-500">Modifie le site web en direct</p>
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <button onClick={reset} className="px-3 py-1.5 text-[10px] text-slate-500 hover:text-slate-300 border border-white/[0.07] rounded-lg">
                Annuler
              </button>
            )}
            <button onClick={save} disabled={saving || !isDirty}
              className="flex items-center gap-1.5 px-3 py-1.5 accent-bg-dyn text-white text-[10px] font-bold rounded-lg disabled:opacity-40 transition-opacity">
              {saving ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Icon name="save" size={11}/>}
              Publier
            </button>
          </div>
        </div>

        {/* Editor content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"/>
            </div>
          ) : Editor ? (
            <Editor
              data={draft[active] || {}}
              onChange={data => setDraft(d => ({ ...d, [active]: data }))}
            />
          ) : (
            <p className="text-slate-500 text-sm">Sélectionne une section</p>
          )}
        </div>

        {isDirty && (
          <div className="px-4 py-2 border-t border-amber-500/20 bg-amber-500/5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"/>
            <p className="text-[10px] text-amber-400">Modifications non publiées — cliquez "Publier" pour mettre à jour le site</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWebsite;
