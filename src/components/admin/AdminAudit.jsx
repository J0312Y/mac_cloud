// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";
import { AUDIT } from "../../data/index.js";

const AdminAudit = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const filtered = AUDIT.filter(a=>(filter==="all"||a.kind===filter)&&(a.user+a.action+a.target).toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1">
          {["all","admin","user"].map(f=>(<button key={f} onClick={()=>setFilter(f)} className={`px-2.5 py-1 rounded-lg text-[9px] capitalize font-bold transition-colors ${filter===f?"bg-rose-600/25 text-rose-300 border border-rose-500/25":"text-slate-500 hover:text-slate-300"}`}>{f}</button>))}
        </div>
        <div className="relative"><Icon name="search" size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" className="bg-black/30 border border-white/[0.07] rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-300 outline-none w-44"/></div>
      </div>
      <C>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px]">
            <thead><tr className="border-b border-white/[0.05]">{["User","Action","Target","Time","IP"].map(h=>(<th key={h} className="px-3 py-2 text-left text-[9px] font-black text-slate-600 uppercase tracking-widest">{h}</th>))}</tr></thead>
            <tbody>
              {filtered.map(a=>(
                <tr key={a.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-2.5 text-[10px] text-slate-400">{a.user}</td>
                  <td className="px-3 py-2.5"><span className={`text-[10px] font-mono font-bold ${a.kind==="admin"?"text-rose-400":"text-violet-400"}`}>{a.action}</span></td>
                  <td className="px-3 py-2.5 text-[10px] text-slate-300">{a.target}</td>
                  <td className="px-3 py-2.5 text-[10px] text-slate-500 whitespace-nowrap">{a.time}</td>
                  <td className="px-3 py-2.5 text-[10px] font-mono text-slate-600">{a.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </C>
    </div>
  );
};


export default AdminAudit;
