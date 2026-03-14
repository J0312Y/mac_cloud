// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import Icon from "../ui/Icon.jsx";
import { useApp } from "../../i18n/AppContext.jsx";
import api from "../../lib/api.js";

const getCNAV = (t) => [
  {id:"dashboard",    label:t("nav.dashboard"),       icon:"grid",     group:"Main"},
  {id:"my-builds",    label:t("nav.myBuilds"),       icon:"layers",   group:"Main"},
  {id:"new-build",    label:t("nav.newBuild"),       icon:"plus",     group:"Main"},
  {id:"certificates", label:t("nav.certificates"),    icon:"shield",   group:"Security"},
  {id:"profiles",     label:t("nav.profiles"),  icon:"package",  group:"Security"},
  {id:"webhooks",     label:t("nav.webhooks"),        icon:"link",     group:"Integrations"},
  {id:"api-tokens",   label:t("nav.apiTokens"),      icon:"key",      group:"Integrations"},
  {id:"team",         label:t("nav.team"),            icon:"users",    group:"Account"},
  {id:"billing",      label:t("nav.billing"),         icon:"card",     group:"Account"},
  {id:"credits",      label:"Crédits horaires",       icon:"clock",    group:"Account"},
  {id:"notifications",label:t("nav.notifications"),   icon:"bell",     group:"Help"},
  {id:"support",      label:t("nav.support"),         icon:"headset",  group:"Help"},
  {id:"settings",     label:t("nav.settings"),        icon:"settings", group:"Account"},
];

const ClientSidebar = ({ page, setPage, notifs=[], broadcasts=[], openTickets=0, collapsed, setCollapsed, onSignOut }) => {
  const { t } = useApp();
  const CNAV = getCNAV(t);
  const [stats, setStats] = useState({ buildsMonth: 0, buildsLimit: 200, plan: "Starter" });

  useEffect(() => {
    Promise.all([api.user.stats(), api.auth.me()]).then(([r, me]) => {
      const plan = me?.user?.plan || "starter";
      const limits = { starter: 50, pro: 200, team: 500, enterprise: 9999 };
      setStats({
        buildsMonth: r.builds?.thisMonth ?? 0,
        buildsLimit: limits[plan] ?? 200,
        plan: plan.charAt(0).toUpperCase() + plan.slice(1),
      });
    }).catch(() => {});
  }, []);
  const groups = [...new Set(CNAV.map(n => n.group))];
  const unread = (notifs.filter(n=>!n.read).length) + (broadcasts.filter(b=>!b.read).length);

  return (
    <aside className={`sidebar-client flex-shrink-0 h-screen border-r border-white/[0.05] flex flex-col transition-all duration-300 ${collapsed?"w-14":"w-52"}`}>
      {/* Logo */}
      <div className="px-3 py-3 border-b border-white/[0.05] flex items-center gap-2 justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{background:"var(--accent)", boxShadow:"0 4px 14px var(--accent-50)"}}>
              <Icon name="zap" size={12} className="text-white"/>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-white tracking-tight">MAC BUILD</p>
              <p className="text-[9px] font-black uppercase tracking-widest accent-text">My Panel</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-xl flex items-center justify-center mx-auto"
            style={{background:"var(--accent)", boxShadow:"0 4px 14px var(--accent-50)"}}>
            <Icon name="zap" size={12} className="text-white"/>
          </div>
        )}
        {!collapsed && (
          <button onClick={()=>setCollapsed(true)} className="text-slate-600 hover:text-slate-400 transition-colors">
            <Icon name="chevL" size={13}/>
          </button>
        )}
      </div>
      {collapsed && (
        <button onClick={()=>setCollapsed(false)} className="mx-auto mt-2 text-slate-600 hover:text-slate-400">
          <Icon name="menu" size={13}/>
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 overflow-y-auto min-h-0">
        {groups.map(g => (
          <div key={g} className="mb-3">
            {!collapsed && <p className="text-[8px] text-slate-700 uppercase tracking-widest px-2 mb-1 font-black">{g}</p>}
            {CNAV.filter(n=>n.group===g).map(({id,label,icon})=>(
              <button key={id} onClick={()=>setPage(id)} title={collapsed?label:undefined}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[11px] transition-all mb-0.5 ${collapsed?"justify-center":""} ${page===id?"nav-active border":"text-slate-400 hover:text-white hover:bg-white/[0.04]"}`}>
                <div className="relative flex-shrink-0">
                  <Icon name={icon} size={13}/>
                  {id==="notifications" && unread>0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full text-[7px] flex items-center justify-center text-white font-black animate-pulse accent-bg">{unread}</span>
                  )}
                  {id==="support" && openTickets>0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-500 rounded-full text-[7px] flex items-center justify-center text-white font-black">{openTickets}</span>
                  )}
                </div>
                {!collapsed && <span className="flex-1 text-left truncate">{label}</span>}
                {!collapsed && id==="notifications" && unread>0 && (
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full font-black animate-pulse nav-badge">{unread}</span>
                )}
                {!collapsed && id==="support" && openTickets>0 && (
                  <span className="text-[8px] bg-amber-500/20 border border-amber-500/25 text-amber-300 px-1.5 py-0.5 rounded-full font-black">{openTickets}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* Plan bar */}
      <div className="flex-shrink-0">
        {!collapsed && (
          <div className="px-3 pt-2 border-t border-white/[0.05]">
            <div className="mb-1">
              <div className="flex justify-between mb-1">
                <span className="text-[9px] text-slate-500">Builds this month</span>
                <span className="text-[9px] font-mono text-slate-400">{stats.buildsMonth}/{stats.buildsLimit}</span>
              </div>
              <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full rounded-full plan-bar" style={{width:`${Math.min(100,(stats.buildsMonth/stats.buildsLimit)*100).toFixed(1)}%`}}/>
              </div>
            </div>
          </div>
        )}
        <ClientProfileWidget collapsed={collapsed} setPage={setPage} onSignOut={onSignOut}/>
      </div>
    </aside>
  );
};

const ClientProfileWidget = ({ collapsed, setPage, onSignOut }) => {
  const { t } = useApp();
  const [open, setOpen]       = useState(false);
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [plan, setPlan]       = useState("Starter");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState("");
  const ref = useRef(null);

  useEffect(() => {
    api.auth.me().then(res => {
      const u = res?.user;
      if (!u) return;
      setName(u.name || "");
      setEmail(u.email || "");
      setDraft(u.name || "");
      setPlan((u.plan || "starter").charAt(0).toUpperCase() + (u.plan || "starter").slice(1));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const save = () => {
    api.user.updateProfile(draft)
      .then(() => { setName(draft); setEditing(false); })
      .catch(() => setEditing(false));
  };

  return (
    <div className="px-3 py-2.5 relative" ref={ref}>
      {!collapsed && (
        <button onClick={()=>setOpen(o=>!o)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 accent-bg">
            <span className="text-[9px] font-black text-white">{name[0]}</span>
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[10px] font-bold text-slate-300 truncate">{name}</p>
            <p className="text-[9px] font-semibold accent-text">{plan} Plan</p>
          </div>
          <Icon name="chevD" size={11} className={`text-slate-600 flex-shrink-0 transition-transform ${open?"rotate-180":""}`}/>
        </button>
      )}
      {collapsed && (
        <button onClick={()=>setOpen(o=>!o)} className="mx-auto flex items-center justify-center w-7 h-7 rounded-lg accent-bg">
          <span className="text-[9px] font-black text-white">{name[0]}</span>
        </button>
      )}
      {open && (
        <div className="absolute bottom-full left-2 right-2 mb-2 bg-[#1a1728] border border-white/[0.08] rounded-xl shadow-2xl z-[999]">
          <div className="px-4 py-3 border-b border-white/[0.05]">
            {editing ? (
              <div className="space-y-2">
                <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()}
                  className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none input-accent"/>
                <p className="text-[9px] text-slate-500 font-mono">{email}</p>
                <div className="flex gap-2">
                  <button onClick={save} className="flex-1 py-1 text-white text-[10px] font-bold rounded-lg btn-accent">Enregistrer</button>
                  <button onClick={()=>{setEditing(false);setDraft(name);}} className="flex-1 py-1 bg-white/[0.05] text-slate-400 text-[10px] font-bold rounded-lg">Annuler</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 accent-bg">
                  <span className="text-[11px] font-black text-white">{name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-200">{name}</p>
                  <p className="text-[9px] text-slate-500">{email}</p>
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold nav-badge">{plan} Plan</span>
                </div>
                <button onClick={()=>setEditing(true)} className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0">
                  <Icon name="edit" size={12}/>
                </button>
              </div>
            )}
          </div>
          <div className="py-1">
            {[
              {icon:"bell",     label:t("nav.notifications"), action:()=>setPage("notifications")},
              {icon:"settings", label:t("nav.settings"),    action:()=>setPage("settings")},
              {icon:"card",     label:t("nav.billing"),   action:()=>setPage("billing")},
              {icon:"headset",  label:t("nav.support"),       action:()=>setPage("support")},
            ].map(item=>(
              <button key={item.label} onClick={()=>{item.action();setOpen(false);}}
                className="w-full flex items-center gap-3 px-4 py-2 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors">
                <Icon name={item.icon} size={12}/>{item.label}
              </button>
            ))}
            <div className="border-t border-white/[0.05] mt-1 pt-1">
              <button onClick={()=>{setOpen(false);onSignOut?.();}}
                className="w-full flex items-center gap-3 px-4 py-2 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-colors">
                <Icon name="logOut" size={12}/>Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { getCNAV, ClientSidebar, ClientProfileWidget };
