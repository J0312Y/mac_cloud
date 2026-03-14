// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import Icon from "../ui/Icon.jsx";
import { C, CH } from "../ui/SharedUI.jsx";

const API = "http://213.156.133.182:3001/api";
const tok = () => localStorage.getItem("mbc_token");
const authH = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${tok()}` });

// ─── Champ générique ──────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, type = "text", placeholder = "", hint = "" }) => (
  <div>
    <label className="text-[9px] text-slate-500 block mb-1 uppercase tracking-widest">{label}</label>
    <input value={value || ""} type={type} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-[var(--ca)] transition-colors"/>
    {hint && <p className="text-[9px] text-slate-600 mt-1">{hint}</p>}
  </div>
);

// ─── Bloc de sauvegarde ───────────────────────────────────────────────────────
const SaveBar = ({ onSave, saving, dirty }) => (
  dirty ? (
    <div className="flex items-center justify-between py-2 px-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
      <p className="text-[10px] text-amber-400 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"/>
        Modifications non sauvegardées
      </p>
      <button onClick={onSave} disabled={saving}
        className="flex items-center gap-1.5 px-3 py-1.5 accent-bg-dyn text-white text-[10px] font-bold rounded-lg disabled:opacity-50">
        {saving ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Icon name="save" size={11}/>}
        Sauvegarder
      </button>
    </div>
  ) : null
);

// ─── Onglets ──────────────────────────────────────────────────────────────────
const TABS = [
  { key: "account",  label: "Mon compte",   icon: "user"     },
  { key: "general",  label: "Général",      icon: "settings" },
  { key: "smtp",     label: "SMTP / Email", icon: "mail"     },
  { key: "oauth",    label: "OAuth",        icon: "link"     },
  { key: "build",    label: "Build engine", icon: "zap"      },
  { key: "security", label: "Sécurité",     icon: "shieldOk" },
  { key: "danger",   label: "Zone danger",  icon: "alertTri" },
];

// ─── Composant principal ──────────────────────────────────────────────────────
const AdminSettings = ({ addToast, currentUser }) => {
  const [tab,      setTab]     = useState("account");
  const [settings, setSettings]= useState(null);
  const [loading,  setLoading] = useState(true);
  const [saving,   setSaving]  = useState(false);

  // Drafts par section
  const [account,  setAccount] = useState({ name:"", email:"", current_password:"", new_password:"", confirm_password:"" });
  const [general,  setGeneral] = useState({});
  const [smtp,     setSmtp]    = useState({});
  const [oauth,    setOAuth]   = useState({});
  const [build,    setBuild]   = useState({});
  const [security, setSecurity]= useState({});
  const [dirty,    setDirty]   = useState({});
  const [testEmail,setTestEmail]= useState("");
  const [testing,  setTesting] = useState(false);
  const [restarting,setRestarting] = useState(false);

  const mark = (section) => setDirty(d => ({ ...d, [section]: true }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/settings`, { headers: authH() });
      const d = await r.json();
      setSettings(d);
      setGeneral(d.general  || {});
      setSmtp(d.smtp        || {});
      setOAuth(d.oauth      || {});
      setBuild(d.build      || {});
      setSecurity(d.security|| {});
      setAccount(a => ({ ...a, name: currentUser?.name || "", email: currentUser?.email || "" }));
    } catch { addToast("Erreur chargement settings", "error"); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const save = async (section, data, endpoint) => {
    setSaving(true);
    try {
      const r = await fetch(`${API}/admin/settings/${endpoint}`, {
        method: "PATCH", headers: authH(), body: JSON.stringify(data),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      addToast(`✅ ${d.message}`, "success");
      setDirty(x => ({ ...x, [section]: false }));
      await load();
    } catch (e) { addToast(`❌ ${e.message}`, "error"); }
    finally     { setSaving(false); }
  };

  const saveAccount = async () => {
    if (account.new_password && account.new_password !== account.confirm_password) {
      return addToast("Les mots de passe ne correspondent pas", "error");
    }
    await save("account", {
      name:             account.name,
      email:            account.email,
      current_password: account.current_password || undefined,
      new_password:     account.new_password     || undefined,
    }, "account");
    setAccount(a => ({ ...a, current_password:"", new_password:"", confirm_password:"" }));
  };

  const sendTest = async () => {
    if (!testEmail) return addToast("Entrez un email de test", "error");
    setTesting(true);
    try {
      const r = await fetch(`${API}/admin/settings/smtp/test`, {
        method: "POST", headers: authH(), body: JSON.stringify({ to: testEmail }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      addToast(`✅ ${d.message}`, "success");
    } catch (e) { addToast(`❌ ${e.message}`, "error"); }
    finally     { setTesting(false); }
  };

  const restart = async () => {
    if (!confirm("Redémarrer le serveur ? Tous les builds en cours seront interrompus.")) return;
    setRestarting(true);
    try {
      await fetch(`${API}/admin/settings/restart`, { method: "POST", headers: authH() });
      addToast("Serveur en cours de redémarrage…", "warn");
      setTimeout(() => { setRestarting(false); load(); }, 3000);
    } catch { setRestarting(false); }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"/>
    </div>
  );

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar tabs */}
      <div className="w-44 flex-shrink-0 border-r border-white/[0.05] overflow-y-auto py-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`w-full flex items-center gap-2 px-3 py-2.5 text-[11px] transition-all ${tab===t.key ? "nav-active border text-white" : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]"} ${t.key==="danger" ? "text-red-500 hover:text-red-400" : ""}`}>
            <Icon name={t.icon} size={12}/>
            <span>{t.label}</span>
            {dirty[t.key] && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400"/>}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 max-w-2xl">

        {/* ── MON COMPTE ── */}
        {tab === "account" && (
          <>
            <CH title="Mon compte" subtitle="Modifier vos informations administrateur"/>
            <C>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nom" value={account.name} onChange={v=>{setAccount(a=>({...a,name:v}));mark("account");}}/>
                  <Field label="Email" value={account.email} type="email" onChange={v=>{setAccount(a=>({...a,email:v}));mark("account");}}/>
                </div>
                <div className="border-t border-white/[0.05] pt-3">
                  <p className="text-[10px] font-bold text-slate-400 mb-3">Changer le mot de passe</p>
                  <div className="space-y-2">
                    <Field label="Mot de passe actuel" type="password" value={account.current_password} onChange={v=>{setAccount(a=>({...a,current_password:v}));mark("account");}}/>
                    <Field label="Nouveau mot de passe" type="password" value={account.new_password} onChange={v=>{setAccount(a=>({...a,new_password:v}));mark("account");}} hint="8 caractères minimum"/>
                    <Field label="Confirmer" type="password" value={account.confirm_password} onChange={v=>{setAccount(a=>({...a,confirm_password:v}));mark("account");}}/>
                  </div>
                </div>
                <SaveBar onSave={saveAccount} saving={saving} dirty={dirty.account}/>
              </div>
            </C>
          </>
        )}

        {/* ── GÉNÉRAL ── */}
        {tab === "general" && (
          <>
            <CH title="Paramètres généraux" subtitle="URLs et configuration de base"/>
            <C>
              <div className="p-4 space-y-3">
                <Field label="Nom du site" value={general.site_name} onChange={v=>{setGeneral(g=>({...g,site_name:v}));mark("general");}} placeholder="MacBuild Cloud"/>
                <Field label="URL Dashboard" value={general.dashboard_url} onChange={v=>{setGeneral(g=>({...g,dashboard_url:v}));mark("general");}} placeholder="http://213.156.133.182"/>
                <Field label="URL API" value={general.api_url} onChange={v=>{setGeneral(g=>({...g,api_url:v}));mark("general");}} placeholder="http://213.156.133.182:3001/api"/>
                <Field label="CORS Origins (séparés par virgule)" value={general.allowed_origins} onChange={v=>{setGeneral(g=>({...g,allowed_origins:v}));mark("general");}}
                  hint="Ex: http://localhost:5173,http://213.156.133.182"/>
                <SaveBar onSave={() => save("general", general, "general")} saving={saving} dirty={dirty.general}/>
              </div>
            </C>
          </>
        )}

        {/* ── SMTP ── */}
        {tab === "smtp" && (
          <>
            <CH title="Configuration SMTP" subtitle="Emails transactionnels (welcome, builds, paiements…)"/>
            <C>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="SMTP Host" value={smtp.host} onChange={v=>{setSmtp(s=>({...s,host:v}));mark("smtp");}} placeholder="smtp.ovh.net"/>
                  <Field label="Port" value={smtp.port} onChange={v=>{setSmtp(s=>({...s,port:v}));mark("smtp");}} placeholder="587"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Utilisateur" value={smtp.user} onChange={v=>{setSmtp(s=>({...s,user:v}));mark("smtp");}} placeholder="noreply@macbuild.cloud"/>
                  <Field label="Mot de passe" type="password" value={smtp.pass} onChange={v=>{setSmtp(s=>({...s,pass:v}));mark("smtp");}} placeholder={smtp.has_pass ? "••••••••" : "Entrez le mot de passe"}/>
                </div>
                <Field label="Adresse From" value={smtp.from} onChange={v=>{setSmtp(s=>({...s,from:v}));mark("smtp");}} placeholder="MacBuild Cloud <noreply@macbuild.cloud>"/>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="smtp-secure" checked={smtp.secure === "true" || smtp.secure === true}
                    onChange={e=>{setSmtp(s=>({...s,secure:String(e.target.checked)}));mark("smtp");}} className="w-3 h-3"/>
                  <label htmlFor="smtp-secure" className="text-[10px] text-slate-400">TLS/SSL (port 465)</label>
                </div>
                <SaveBar onSave={() => save("smtp", smtp, "smtp")} saving={saving} dirty={dirty.smtp}/>
              </div>
            </C>

            <C>
              <div className="p-4 space-y-3">
                <p className="text-[10px] font-bold text-slate-300">Tester la configuration</p>
                <div className="flex gap-2">
                  <input value={testEmail} onChange={e=>setTestEmail(e.target.value)} type="email"
                    placeholder="votre@email.com"
                    className="flex-1 bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-[var(--ca)]"/>
                  <button onClick={sendTest} disabled={testing}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600/80 text-white text-xs font-bold rounded-lg disabled:opacity-50">
                    {testing ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Icon name="send" size={11}/>}
                    Tester
                  </button>
                </div>
                <p className="text-[9px] text-slate-600">Un email de test sera envoyé à l'adresse ci-dessus</p>
              </div>
            </C>
          </>
        )}

        {/* ── OAUTH ── */}
        {tab === "oauth" && (
          <>
            <CH title="OAuth GitHub & GitLab" subtitle="Connexion sociale"/>
            <C>
              <div className="p-4 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm">🐙</span>
                    <p className="text-[11px] font-bold text-slate-300">GitHub OAuth</p>
                    {oauth.github_configured
                      ? <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Configuré</span>
                      : <span className="text-[8px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Non configuré</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Client ID" value={oauth.github_client_id} onChange={v=>{setOAuth(o=>({...o,github_client_id:v}));mark("oauth");}} placeholder="Gh..."/>
                    <Field label="Client Secret" type="password" value={oauth.github_client_secret || ""} onChange={v=>{setOAuth(o=>({...o,github_client_secret:v}));mark("oauth");}} placeholder="Entrez le secret"/>
                  </div>
                  <p className="text-[9px] text-slate-600 mt-1">
                    Callback URL: <code className="text-slate-400">{settings?.general?.api_url || "http://213.156.133.182:3001/api"}/auth/github/callback</code>
                  </p>
                </div>

                <div className="border-t border-white/[0.05] pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm">🦊</span>
                    <p className="text-[11px] font-bold text-slate-300">GitLab OAuth</p>
                    {oauth.gitlab_configured
                      ? <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">Configuré</span>
                      : <span className="text-[8px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Non configuré</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Client ID" value={oauth.gitlab_client_id} onChange={v=>{setOAuth(o=>({...o,gitlab_client_id:v}));mark("oauth");}} placeholder="Gl..."/>
                    <Field label="Client Secret" type="password" value={oauth.gitlab_client_secret || ""} onChange={v=>{setOAuth(o=>({...o,gitlab_client_secret:v}));mark("oauth");}} placeholder="Entrez le secret"/>
                  </div>
                  <p className="text-[9px] text-slate-600 mt-1">
                    Callback URL: <code className="text-slate-400">{settings?.general?.api_url || "http://213.156.133.182:3001/api"}/auth/gitlab/callback</code>
                  </p>
                </div>

                <SaveBar onSave={() => save("oauth", oauth, "oauth")} saving={saving} dirty={dirty.oauth}/>
              </div>
            </C>
          </>
        )}

        {/* ── BUILD ENGINE ── */}
        {tab === "build" && (
          <>
            <CH title="Build engine" subtitle="Paramètres de simulation des builds"/>
            <C>
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-2">
                    Taux d'échec simulé — actuel: {Math.round((parseFloat(build.failure_rate)||0.15)*100)}%
                  </label>
                  <input type="range" min="0" max="1" step="0.05"
                    value={build.failure_rate || 0.15}
                    onChange={e=>{setBuild(b=>({...b,failure_rate:e.target.value}));mark("build");}}
                    className="w-full accent-cyan-500"/>
                  <div className="flex justify-between text-[8px] text-slate-600 mt-1">
                    <span>0% (jamais)</span><span>50%</span><span>100% (toujours)</span>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-2">
                    Vitesse de build — actuel: {build.speed_mult || 1}× (1 = normal, 0.1 = 10× plus rapide)
                  </label>
                  <input type="range" min="0.1" max="5" step="0.1"
                    value={build.speed_mult || 1}
                    onChange={e=>{setBuild(b=>({...b,speed_mult:e.target.value}));mark("build");}}
                    className="w-full accent-cyan-500"/>
                  <div className="flex justify-between text-[8px] text-slate-600 mt-1">
                    <span>0.1× (rapide)</span><span>1× (normal)</span><span>5× (lent)</span>
                  </div>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-[10px] text-amber-400">⚠️ Ces paramètres affectent les builds simulés en temps réel — pas de redémarrage nécessaire.</p>
                </div>

                <SaveBar onSave={() => save("build", { failure_rate: build.failure_rate, speed_mult: build.speed_mult }, "build")} saving={saving} dirty={dirty.build}/>
              </div>
            </C>
          </>
        )}

        {/* ── SÉCURITÉ ── */}
        {tab === "security" && (
          <>
            <CH title="Sécurité" subtitle="JWT et sessions"/>
            <C>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1">Durée des tokens JWT</label>
                  <select value={security.jwt_expires || "7d"}
                    onChange={e=>{setSecurity(s=>({...s,jwt_expires:e.target.value}));mark("security");}}
                    className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                    {["1h","6h","12h","1d","3d","7d","14d","30d"].map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <p className="text-[9px] text-slate-600 mt-1">Après modification, les utilisateurs devront se reconnecter</p>
                </div>
                <SaveBar onSave={() => save("security", security, "security")} saving={saving} dirty={dirty.security}/>
              </div>
            </C>
          </>
        )}

        {/* ── DANGER ZONE ── */}
        {tab === "danger" && (
          <>
            <CH title="Zone de danger" subtitle="Actions irréversibles"/>
            <div className="space-y-3">
              <C className="border border-red-500/20">
                <div className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold text-white">Redémarrer le serveur</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">PM2 relancera automatiquement. Builds interrompus.</p>
                  </div>
                  <button onClick={restart} disabled={restarting}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-600/80 text-white text-xs font-bold rounded-lg disabled:opacity-50 whitespace-nowrap">
                    {restarting ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Icon name="refresh" size={11}/>}
                    Redémarrer
                  </button>
                </div>
              </C>

              <C className="border border-red-500/20">
                <div className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold text-white">Vider les logs d'audit</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Supprime tous les logs. Irréversible.</p>
                  </div>
                  <button onClick={async () => {
                    if (!confirm("Vider tous les logs d'audit ?")) return;
                    try {
                      const r = await fetch(`${API}/admin/audit/clear`, { method: "DELETE", headers: authH() });
                      if (r.ok) addToast("Logs vidés", "warn");
                    } catch { addToast("Erreur", "error"); }
                  }}
                    className="px-4 py-2 bg-red-600/80 text-white text-xs font-bold rounded-lg whitespace-nowrap">
                    Vider les logs
                  </button>
                </div>
              </C>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
