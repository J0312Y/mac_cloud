// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import Icon from "../ui/Icon.jsx";

/* ═══ ADMIN NAV ═══ */
const ANAV = [
  {id:"overview",      label:"Overview",        icon:"grid",     group:"Platform"},
  {id:"builds",        label:"All Builds",      icon:"layers",   group:"Platform"},
  {id:"users",         label:"Users",           icon:"users",    group:"Platform"},
  {id:"nodes",         label:"Mac Nodes",       icon:"server",   group:"Infra"},
  {id:"node-detail",   label:"Node Detail",     icon:"monitor",  group:"Infra",   hidden:true},
  {id:"alerts",        label:"Alerts",          icon:"alertTri", group:"System"},
  {id:"audit",         label:"Audit Trail",     icon:"fileText", group:"System"},
  {id:"broadcast",     label:"Broadcast",       icon:"send",     group:"System"},
  {id:"plans",         label:"Plans & Pricing", icon:"dollar",   group:"Config"},
  {id:"backups",       label:"Backups",         icon:"database", group:"Config"},
  {id:"analytics",     label:"Analytics",       icon:"barChart", group:"Config"},
];

const AdminSidebar = ({ page, setPage, alerts, collapsed, setCollapsed, onSignOut }) => {
  const groups = [...new Set(ANAV.filter(n=>!n.hidden).map(n=>n.group))];
  const unack = alerts.filter(a=>!a.ack).length;
  return (
    <aside className={`flex-shrink-0 h-screen bg-[#0d0a15] border-r border-white/[0.05] flex flex-col transition-all duration-300 ${collapsed?"w-14":"w-52"}`}>
      <div className="px-3 py-3 border-b border-white/[0.05] flex items-center gap-2 justify-between">
        {!collapsed&&(<div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/30 flex-shrink-0"><Icon name="crown" size={12} className="text-white"/></div>
          <div className="min-w-0"><p className="text-[11px] font-black text-white tracking-tight">MAC BUILD</p><p className="text-[9px] text-rose-400 font-black uppercase tracking-widest">Admin</p></div>
        </div>)}
        {collapsed&&(<div className="w-7 h-7 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg mx-auto"><Icon name="crown" size={12} className="text-white"/></div>)}
        {!collapsed&&(<button onClick={()=>setCollapsed(true)} className="text-slate-600 hover:text-slate-400 transition-colors"><Icon name="chevL" size={13}/></button>)}
      </div>
      {collapsed&&(<button onClick={()=>setCollapsed(false)} className="mx-auto mt-2 text-slate-600 hover:text-slate-400 transition-colors"><Icon name="menu" size={13}/></button>)}
      <nav className="flex-1 px-2 py-2 overflow-y-auto min-h-0">
        {groups.map(g=>(
          <div key={g} className="mb-3">
            {!collapsed&&<p className="text-[8px] text-slate-700 uppercase tracking-widest px-2 mb-1 font-black">{g}</p>}
            {ANAV.filter(n=>n.group===g&&!n.hidden).map(({id,label,icon})=>(
              <button key={id} onClick={()=>setPage(id)} title={collapsed?label:undefined}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[11px] transition-all mb-0.5 ${page===id?"bg-rose-600/20 text-rose-300 border border-rose-500/20 font-bold":"text-slate-400 hover:text-white hover:bg-white/[0.04]"} ${collapsed?"justify-center":""}`}>
                <div className="relative flex-shrink-0">
                  <Icon name={icon} size={13}/>
                  {id==="alerts"&&unack>0&&(<span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full text-[7px] flex items-center justify-center text-white font-black">{unack}</span>)}
                </div>
                {!collapsed&&<span className="flex-1 text-left truncate">{label}</span>}
                {!collapsed&&id==="alerts"&&unack>0&&(<span className="text-[8px] bg-red-500/20 border border-red-500/25 text-red-400 px-1.5 py-0.5 rounded-full font-black">{unack}</span>)}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <div className="flex-shrink-0"><AdminProfileWidget collapsed={collapsed} setPage={setPage} onSignOut={onSignOut}/></div>
    </aside>
  );
};

const AdminProfileWidget = ({ collapsed, setPage, onSignOut }) => {
  const [open, setOpen]       = useState(false);
  const [name, setName]       = useState("Admin");
  const [email]               = useState("admin@macbuild.cloud");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft]     = useState("Admin");
  const [modal, setModal]     = useState(null);
  const [pw, setPw]           = useState({ current:"", next:"", confirm:"" });
  const [pwErr, setPwErr]     = useState("");
  const [pwOk, setPwOk]       = useState(false);
  const [twoFA, setTwoFA]     = useState(false);
  const [sessions]            = useState([
    { id:1, device:"Chrome · macOS",  ip:"82.45.12.3",   last:"Now",    current:true  },
    { id:2, device:"Safari · iPhone", ip:"82.45.12.3",   last:"2h ago", current:false },
    { id:3, device:"VSCode · macOS",  ip:"190.12.44.21", last:"12h ago",current:false },
  ]);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const save = () => { setName(draft); setEditing(false); };
  const submitPw = () => {
    if (!pw.current)            return setPwErr("Enter current password");
    if (pw.next.length < 8)     return setPwErr("New password must be 8+ chars");
    if (pw.next !== pw.confirm) return setPwErr("Passwords don't match");
    setPwErr(""); setPwOk(true);
    setTimeout(() => { setPwOk(false); setPw({current:"",next:"",confirm:""}); setModal(null); }, 1500);
  };
  return (
    <>
      {modal === "password" && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={()=>setModal(null)}>
          <div className="bg-[#1a1728] border border-white/[0.08] rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[13px] font-black text-white uppercase tracking-widest">Change Password</p>
              <button onClick={()=>setModal(null)} className="text-slate-600 hover:text-slate-300 transition-colors"><Icon name="x" size={14}/></button>
            </div>
            <div className="space-y-3">
              {[["Current password","current","••••••••"],["New password","next","8+ characters"],["Confirm new","confirm","Repeat new password"]].map(([label,key,ph])=>(
                <div key={key}>
                  <p className="text-[10px] text-slate-500 mb-1.5 font-semibold">{label}</p>
                  <input type="password" placeholder={ph} value={pw[key]} onChange={e=>setPw(p=>({...p,[key]:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&submitPw()}
                    className="w-full bg-black/40 border border-white/[0.08] rounded-xl px-3 py-2.5 text-[11px] text-slate-200 outline-none focus:border-rose-500/50 transition-colors placeholder:text-slate-700"/>
                </div>
              ))}
              {pwErr && <p className="text-[10px] text-red-400 font-semibold">{pwErr}</p>}
              {pwOk  && <p className="text-[10px] text-emerald-400 font-semibold">✓ Password updated!</p>}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={()=>setModal(null)} className="flex-1 py-2.5 bg-white/[0.04] text-slate-400 text-[11px] font-bold rounded-xl hover:text-slate-200 transition-colors">Cancel</button>
              <button onClick={submitPw} className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold rounded-xl transition-colors">Update Password</button>
            </div>
          </div>
        </div>
      )}
      {modal === "security" && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={()=>setModal(null)}>
          <div className="bg-[#1a1728] border border-white/[0.08] rounded-2xl w-full max-w-sm p-6 shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[13px] font-black text-white uppercase tracking-widest">Security</p>
              <button onClick={()=>setModal(null)} className="text-slate-600 hover:text-slate-300 transition-colors"><Icon name="x" size={14}/></button>
            </div>
            <div className="bg-black/30 border border-white/[0.06] rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-200">Two-Factor Auth (2FA)</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">Authenticator app (TOTP)</p>
                </div>
                <button onClick={()=>setTwoFA(v=>!v)} className={`w-10 h-5 rounded-full transition-all relative flex-shrink-0 ${twoFA?"bg-rose-500":"bg-white/[0.08]"}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${twoFA?"left-5":"left-0.5"}`}/>
                </button>
              </div>
              {twoFA && <p className="text-[9px] text-emerald-400 mt-2 font-semibold">✓ 2FA is now enabled</p>}
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-black">Active Sessions</p>
            <div className="space-y-2 mb-4">
              {sessions.map(s=>(
                <div key={s.id} className="flex items-center gap-3 bg-black/20 border border-white/[0.05] rounded-xl px-3 py-2.5">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.current?"bg-emerald-400 animate-pulse":"bg-slate-600"}`}/>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-300 font-semibold">{s.device}</p>
                    <p className="text-[9px] text-slate-600 font-mono">{s.ip} · {s.last}</p>
                  </div>
                  {s.current
                    ? <span className="text-[8px] bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">This device</span>
                    : <button className="text-[9px] text-red-400 hover:text-red-300 font-bold transition-colors flex-shrink-0">Revoke</button>}
                </div>
              ))}
            </div>
            <button onClick={()=>setModal(null)} className="w-full py-2.5 bg-white/[0.04] text-slate-400 text-[11px] font-bold rounded-xl hover:text-slate-200 transition-colors">Close</button>
          </div>
        </div>
      )}
      <div className="px-3 py-2.5 border-t border-white/[0.05] relative" ref={ref}>
        {!collapsed && (
          <button onClick={() => setOpen(o => !o)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors group">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-black text-white">{name[0]}</span>
            </div>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-[10px] font-bold text-slate-300 truncate">{name}</p>
              <p className="text-[9px] text-slate-600 truncate">{email}</p>
            </div>
            <Icon name="chevD" size={11} className={`text-slate-600 flex-shrink-0 transition-transform ${open?"rotate-180":""}`}/>
          </button>
        )}
        {collapsed && (
          <button onClick={() => setOpen(o => !o)} className="mx-auto flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-rose-600 to-red-700">
            <span className="text-[9px] font-black text-white">{name[0]}</span>
          </button>
        )}
        {open && (
          <div className="absolute bottom-full left-2 right-2 mb-2 bg-[#1a1728] border border-white/[0.08] rounded-xl shadow-2xl z-[999]">
            <div className="px-4 py-3 border-b border-white/[0.05]">
              {editing ? (
                <div className="space-y-2">
                  <input value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>e.key==="Enter"&&save()}
                    className="w-full bg-black/40 border border-white/[0.1] rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-rose-500/50"/>
                  <p className="text-[9px] text-slate-500 font-mono">{email}</p>
                  <div className="flex gap-2">
                    <button onClick={save} className="flex-1 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition-colors">Save</button>
                    <button onClick={()=>{setEditing(false);setDraft(name);}} className="flex-1 py-1 bg-white/[0.05] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-black text-white">{name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-200">{name}</p>
                    <p className="text-[9px] text-slate-500">{email}</p>
                  </div>
                  <button onClick={()=>setEditing(true)} className="text-slate-600 hover:text-rose-400 transition-colors flex-shrink-0"><Icon name="edit" size={12}/></button>
                </div>
              )}
            </div>
            <div className="py-1">
              {[
                { icon:"lock",     label:"Change Password", action: ()=>{ setOpen(false); setModal("password"); } },
                { icon:"shieldOk", label:"Security",        action: ()=>{ setOpen(false); setModal("security"); } },
                { icon:"activity", label:"Activity Log",    action: ()=>{ setOpen(false); setPage("audit"); } },
                { icon:"barChart", label:"Analytics",       action: ()=>{ setOpen(false); setPage("analytics"); } },
              ].map(item=>(
                <button key={item.label} onClick={item.action}
                  className="w-full flex items-center gap-3 px-4 py-2 text-[11px] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors">
                  <Icon name={item.icon} size={12}/>{item.label}
                </button>
              ))}
              <div className="border-t border-white/[0.05] mt-1 pt-1">
                <button onClick={()=>{ setOpen(false); onSignOut && onSignOut(); }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-colors">
                  <Icon name="logOut" size={12}/>Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export { ANAV, AdminSidebar, AdminProfileWidget };
