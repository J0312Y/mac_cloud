// @ts-nocheck
import { useState, useEffect } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH, exportCSV } from "../ui/SharedUI.jsx";
import api from "../../lib/api.js";
import { useApp } from "../../i18n/AppContext.jsx";

const AdminUsers = ({ addToast }) => {
  const { t } = useApp();
  const [users, setUsers]     = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await api.admin.users();
      setUsers(res.users || []);
    } catch { addToast("Failed to load users","error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (u) => {
    const newStatus = u.status === "active" ? "suspended" : "active";
    try {
      await api.admin.updateUser(u.id, { status: newStatus });
      setUsers(us => us.map(x => x.id === u.id ? { ...x, status: newStatus } : x));
      addToast(`${u.name} ${newStatus === "suspended" ? "suspended" : "reactivated"}`, newStatus === "suspended" ? "warn" : "success");
    } catch { addToast("Update failed","error"); }
  };

  const filtered = users.filter(u => (u.name+u.email).toLowerCase().includes(search.toLowerCase()));
  const active    = users.filter(u => u.status === "active").length;
  const suspended = users.filter(u => u.status === "suspended").length;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-3">
          {[["Active", active, "text-emerald-400"], ["Suspended", suspended, "accent-text-dyn"], ["Total", users.length, "text-slate-300"]].map(([l,v,c])=>(
            <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-lg px-3 py-2">
              <p className="text-[9px] text-slate-500 capitalize">{l}</p>
              <p className={`text-sm font-black font-mono ${c}`}>{loading ? "…" : v}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Icon name="search" size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
              className="bg-black/30 border border-white/[0.07] rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-300 outline-none w-40"/>
          </div>
          <button onClick={()=>{ exportCSV(filtered,["id","name","email","role","plan","status","created_at"],"users.csv"); addToast("CSV exported","success"); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors">
            <Icon name="download" size={11}/>Export
          </button>
        </div>
      </div>
      <C>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="w-6 h-6 border-2 accent-bd-dyn accent-spin-t-dyn rounded-full animate-spin"/>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["User","Email","Plan","Role","Joined","Status",""].map(h=>(
                    <th key={h} className="px-3 py-2 text-left text-[9px] font-black text-slate-600 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u=>(
                  <>
                    <tr key={u.id} className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer ${u.status==="suspended"?"opacity-50":""}`}
                      onClick={()=>setExpanded(expanded===u.id?null:u.id)}>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-80)] flex items-center justify-center text-[9px] font-black text-white">
                            {u.name?.[0]}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-200">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[10px] text-slate-400">{u.email}</td>
                      <td className="px-3 py-2.5"><Badge s={u.plan}/></td>
                      <td className="px-3 py-2.5"><Badge s={u.role}/></td>
                      <td className="px-3 py-2.5 text-[10px] text-slate-500">{u.created_at?.slice(0,10)}</td>
                      <td className="px-3 py-2.5"><Badge s={u.status}/></td>
                      <td className="px-3 py-2.5 text-slate-600"><Icon name="chevD" size={10}/></td>
                    </tr>
                    {expanded===u.id && (
                      <tr key={u.id+"x"} className="border-b border-white/[0.03] bg-black/20">
                        <td colSpan={7} className="px-4 py-3">
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex gap-4">
                              <div><p className="text-[9px] text-slate-500">User ID</p><p className="text-xs font-mono text-slate-400">{u.id}</p></div>
                              <div><p className="text-[9px] text-slate-500">Role</p><p className="text-xs font-bold text-slate-300">{u.role}</p></div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={()=>{ addToast(`Email sent to ${u.email}`,"info"); }}
                                className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors flex items-center gap-1.5">
                                <Icon name="mail" size={11}/>Email
                              </button>
                              <button onClick={()=>toggle(u)}
                                className={`px-3 py-1.5 border text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1.5 ${u.status==="active"?"bg-red-900/20 accent-bd-dyn accent-text-dyn hover:bg-red-900/30":"bg-emerald-900/20 border-emerald-500/20 text-emerald-400 hover:bg-emerald-900/30"}`}>
                                <Icon name="power" size={11}/>{u.status==="active"?"Suspend":"Reactivate"}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </C>
    </div>
  );
};

export default AdminUsers;
