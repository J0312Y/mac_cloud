// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH, exportCSV } from "../ui/SharedUI.jsx";
import { USERS, BUILDS } from "../../data/index.js";

const AdminUsers = ({ addToast }) => {
  const [users, setUsers] = useState(USERS);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");
  const filtered = users.filter(u=>(u.name+u.email).toLowerCase().includes(search.toLowerCase()));
  const toggle = (id) => setUsers(us=>us.map(u=>u.id===id?{...u,status:u.status==="active"?"suspended":"active"}:u));
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-3">
          {[["active",USERS.filter(u=>u.status==="active").length,"text-emerald-400"],["suspended",USERS.filter(u=>u.status==="suspended").length,"text-red-400"],["revenue",`$${USERS.reduce((s,u)=>s+u.revenue,0)}/mo`,"text-amber-400"]].map(([l,v,c])=>(
            <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-lg px-3 py-2">
              <p className="text-[9px] text-slate-500 capitalize">{l}</p>
              <p className={`text-sm font-black font-mono ${c}`}>{v}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative"><Icon name="search" size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" className="bg-black/30 border border-white/[0.07] rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-300 outline-none w-40"/></div>
          <button onClick={()=>{exportCSV(filtered,["id","name","email","plan","status","builds","revenue","joined"],"users.csv");addToast("CSV exported","success");}} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors"><Icon name="download" size={11}/>Export</button>
        </div>
      </div>
      <C>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead><tr className="border-b border-white/[0.05]">{["User","Email","Plan","Builds","Revenue","Joined","Status",""].map(h=>(<th key={h} className="px-3 py-2 text-left text-[9px] font-black text-slate-600 uppercase tracking-widest">{h}</th>))}</tr></thead>
            <tbody>
              {filtered.map(u=>(
                <>
                  <tr key={u.id} className={`border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors cursor-pointer ${u.status==="suspended"?"opacity-50":""}`} onClick={()=>setExpanded(expanded===u.id?null:u.id)}>
                    <td className="px-3 py-2.5"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-[9px] font-black text-white">{u.name[0]}</div><span className="text-[11px] font-semibold text-slate-200">{u.name}</span></div></td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-400">{u.email}</td>
                    <td className="px-3 py-2.5"><Badge s={u.plan}/></td>
                    <td className="px-3 py-2.5 text-[11px] font-mono text-slate-300">{u.builds}</td>
                    <td className="px-3 py-2.5 text-[11px] font-mono text-emerald-400">${u.revenue}/mo</td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-500">{u.joined}</td>
                    <td className="px-3 py-2.5"><Badge s={u.status}/></td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-600">{u.country} <Icon name="chevD" size={10}/></td>
                  </tr>
                  {expanded===u.id&&(
                    <tr key={u.id+"x"} className="border-b border-white/[0.03] bg-black/20">
                      <td colSpan={8} className="px-4 py-3">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex gap-4">
                            <div><p className="text-[9px] text-slate-500">Storage</p><p className="text-xs font-bold text-slate-300">{u.storage}</p></div>
                            <div><p className="text-[9px] text-slate-500">Last seen</p><p className="text-xs font-bold text-slate-300">{u.lastSeen}</p></div>
                            <div><p className="text-[9px] text-slate-500">Country</p><p className="text-xs font-bold text-slate-300">{u.country}</p></div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={()=>{addToast(`Email sent to ${u.email}`,"info");}} className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors flex items-center gap-1.5"><Icon name="mail" size={11}/>Email</button>
                            <button onClick={()=>{toggle(u.id);addToast(u.status==="active"?`${u.name} suspended`:`${u.name} reactivated`,u.status==="active"?"warn":"success");}} className={`px-3 py-1.5 border text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1.5 ${u.status==="active"?"bg-red-900/20 border-red-500/20 text-red-400 hover:bg-red-900/30":"bg-emerald-900/20 border-emerald-500/20 text-emerald-400 hover:bg-emerald-900/30"}`}><Icon name="power" size={11}/>{u.status==="active"?"Suspend":"Reactivate"}</button>
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
      </C>
    </div>
  );
};


export default AdminUsers;
