// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import Icon from "../ui/Icon.jsx";
import { MY_BUILDS, TICKETS } from "../../data/index.js";

/* ═══ CLIENT NAV ═══ */
const CNAV = [
  {id:"dashboard",    label:"Dashboard",       icon:"grid",     group:"Main"},
  {id:"my-builds",    label:"My Builds",       icon:"layers",   group:"Main"},
  {id:"new-build",    label:"New Build",       icon:"plus",     group:"Main"},
  {id:"certificates", label:"Certificates",    icon:"shield",   group:"Security"},
  {id:"profiles",     label:"Prov. Profiles",  icon:"package",  group:"Security"},
  {id:"webhooks",     label:"Webhooks",        icon:"link",     group:"Integrations"},
  {id:"api-tokens",   label:"API Tokens",      icon:"key",      group:"Integrations"},
  {id:"team",         label:"Team",            icon:"users",    group:"Account"},
  {id:"billing",      label:"Billing",         icon:"card",     group:"Account"},
  {id:"support",      label:"Support",         icon:"headset",  group:"Help"},
  {id:"settings",     label:"Settings",        icon:"settings", group:"Account"},
];

const ClientSidebar = ({ page, setPage, notifs, collapsed, setCollapsed, onSignOut }) => {
  const groups = [...new Set(CNAV.map(n=>n.group))];
  const unread = notifs.filter(n=>!n.read).length;
  const openTix = TICKETS.filter(t=>t.status==="open").length;
  const planUsed = Math.round((MY_BUILDS.filter(b=>b.status==="success").length/200)*100);
  return (
    <aside className={`flex-shrink-0 h-screen bg-[#0d0b1a] border-r border-white/[0.05] flex flex-col transition-all duration-300 ${collapsed?"w-14":"w-52"}`}>
      <div className="px-3 py-3 border-b border-white/[0.05] flex items-center gap-2 justify-between">
        {!collapsed&&(<div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0"><Icon name="zap" size={12} className="text-white"/></div>
          <div className="min-w-0"><p className="text-[11px] font-black text-white tracking-tight">MAC BUILD</p><p className="text-[9px] text-violet-400 font-black uppercase tracking-widest">My Panel</p></div>
        </div>)}
        {collapsed&&(<div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg mx-auto"><Icon name="zap" size={12} className="text-white"/></div>)}
        {!collapsed&&(<button onClick={()=>setCollapsed(true)} className="text-slate-600 hover:text-slate-400 transition-colors"><Icon name="chevL" size={13}/></button>)}
      </div>
      {collapsed&&(<button onClick={()=>setCollapsed(false)} className="mx-auto mt-2 text-slate-600 hover:text-slate-400 transition-colors"><Icon name="menu" size={13}/></button>)}
      <nav className="flex-1 px-2 py-2 overflow-y-auto min-h-0">
        {groups.map(g=>(
          <div key={g} className="mb-3">
            {!collapsed&&<p className="text-[8px] text-slate-700 uppercase tracking-widest px-2 mb-1 font-black">{g}</p>}
            {CNAV.filter(n=>n.group===g).map(({id,label,icon})=>(
              <button key={id} onClick={()=>setPage(id)} title={collapsed?label:undefined}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[11px] transition-all mb-0.5 ${page===id?"bg-violet-600/20 text-violet-300 border border-violet-500/20 font-bold":"text-slate-400 hover:text-white hover:bg-white/[0.04]"} ${collapsed?"justify-center":""}`}>
                <div className="relative flex-shrink-0">
                  <Icon name={icon} size={13}/>
                  {id==="support"&&openTix>0&&(<span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-amber-500 rounded-full text-[7px] flex items-center justify-center text-white font-black">{openTix}</span>)}
                </div>
                {!collapsed&&<span className="flex-1 text-left truncate">{label}</span>}
                {!collapsed&&id==="support"&&openTix>0&&(<span className="text-[8px] bg-amber-500/20 border border-amber-500/25 text-amber-300 px-1.5 py-0.5 rounded-full font-black">{openTix}</span>)}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="flex-shrink-0">
        {!collapsed&&(
          <div className="px-3 pt-2 border-t border-white/[0.05]">
            <div className="mb-1">
              <div className="flex justify-between mb-1"><span className="text-[9px] text-slate-500">Builds this month</span><span className="text-[9px] font-mono text-slate-400">34/200</span></div>
              <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden"><div className="h-full bg-violet-500 rounded-full" style={{width:`${planUsed}%`}}/></div>
            </div>
          </div>
        )}
        <ClientProfileWidget collapsed={collapsed} setPage={setPage} onSignOut={onSignOut}/>
      </div>
    </aside>
  );
};

const ClientProfileWidget = ({ collapsed, setPage, onSignOut }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("Alex Martin");
  const [email] = useState("alex@company.io");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("Alex Martin");
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const save = () => { setName(draft); setEditing(false); };
  return (
    <div className="px-3 py-2.5 relative" ref={ref}>
      {!collapsed && (
        <button onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors group">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-black text-white">{name[0]}</span>
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-[10px] font-bold text-slate-300 truncate">{name}</p>
            <p className="text-[9px] text-violet-500 font-semibold">Pro Plan</p>
          </div>
          <Icon name="chevD" size={11} className={`text-slate-600 flex-shrink-0 transition-transform ${open?"rotate-180":""}`}/>
        </button>
      )}
      {collapsed && (
        <button onClick={() => setOpen(o => !o)} className="mx-auto flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700">
          <span className="text-[9px] font-black text-white">{name[0]}</span>
        </button>
      )}
      {open && (
        <div className="absolute bottom-full left-2 right-2 mb-2 bg-[#1a1728] border border-white/[0.08] rounded-xl shadow-2xl z-[999]">
          <div className="px-4 py-3 border-b border-white/[0.05]">
            {editing ? (
              <div className="space-y-2">
                <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()}
                  className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-violet-500/50"/>
                <p className="text-[9px] text-slate-500 font-mono">{email}</p>
                <div className="flex gap-2">
                  <button onClick={save} className="flex-1 py-1 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-lg transition-colors">Save</button>
                  <button onClick={() => { setEditing(false); setDraft(name); }} className="flex-1 py-1 bg-white/[0.05] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-black text-white">{name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-200">{name}</p>
                  <p className="text-[9px] text-slate-500">{email}</p>
                  <span className="text-[8px] bg-violet-500/15 border border-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded-full font-bold">Pro Plan</span>
                </div>
                <button onClick={() => setEditing(true)} className="text-slate-600 hover:text-violet-400 transition-colors flex-shrink-0" title="Edit name">
                  <Icon name="edit" size={12}/>
                </button>
              </div>
            )}
          </div>
          <div className="py-1">
            {[
              { icon:"settings",  label:"Settings",        action: () => setPage("settings") },
              { icon:"card",      label:"Billing",         action: () => setPage("billing") },
              { icon:"users",     label:"Team",            action: () => setPage("team") },
              { icon:"lock",      label:"Change Password", action: () => setPage("settings") },
              { icon:"headset",   label:"Support",         action: () => setPage("support") },
            ].map(item => (
              <button key={item.label} onClick={() => { item.action(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors">
                <Icon name={item.icon} size={12}/>{item.label}
              </button>
            ))}
            <div className="border-t border-white/[0.05] mt-1 pt-1">
              <button onClick={() => { setOpen(false); onSignOut && onSignOut(); }}
                className="w-full flex items-center gap-3 px-4 py-2 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-colors">
                <Icon name="logOut" size={12}/>Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { CNAV, ClientSidebar, ClientProfileWidget };
