// @ts-nocheck
import { useState, useRef } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH, exportCSV } from "../ui/SharedUI.jsx";
import LogModal from "../shared/LogModal.jsx";
import { ErrRow } from "../ui/SharedUI.jsx";
import { BUILDS } from "../../data/index.js";

const AdminBuilds = ({ addToast }) => {
  const [filter, setFilter] = useState("all");
  const [log, setLog] = useState(null);
  const [search, setSearch] = useState("");
  const filtered = BUILDS.filter(b=>(filter==="all"||b.status===filter)&&(b.project+b.user+b.id).toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {["all","running","queued","success","failed"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className={`px-2.5 py-1 rounded-lg text-[9px] capitalize font-bold transition-colors ${filter===f?"bg-rose-600/25 text-rose-300 border border-rose-500/25":"text-slate-500 hover:text-slate-300"}`}>{f}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative"><Icon name="search" size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" className="bg-black/30 border border-white/[0.07] rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-300 outline-none w-40"/></div>
          <button onClick={()=>{exportCSV(filtered,["id","project","user","status","date","branch","mac","xcode"],"builds.csv");addToast("CSV exported","success");}} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors"><Icon name="download" size={11}/>Export</button>
        </div>
      </div>
      <C>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead><tr className="border-b border-white/[0.05]">{["Build ID","Project","User","Status","Branch","Mac","Xcode","Date",""].map(h=>(<th key={h} className="px-3 py-2 text-left text-[9px] font-black text-slate-600 uppercase tracking-widest">{h}</th>))}</tr></thead>
            <tbody>
              {filtered.map(b=>(
                <>
                  <tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 py-2.5 text-[10px] font-mono text-slate-400">{b.id}</td>
                    <td className="px-3 py-2.5 text-[11px] font-semibold text-slate-200">{b.project}</td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-400 truncate max-w-[120px]">{b.user}</td>
                    <td className="px-3 py-2.5"><Badge s={b.status}/></td>
                    <td className="px-3 py-2.5 text-[10px] font-mono text-slate-500 truncate max-w-[100px]">{b.branch}</td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-500">{b.mac}</td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-500">{b.xcode}</td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-500 whitespace-nowrap">{b.date}</td>
                    <td className="px-3 py-2.5">
                      <button onClick={()=>setLog(b)} className="text-slate-600 hover:text-violet-400 transition-colors" title="View log"><Icon name="terminal" size={12}/></button>
                    </td>
                  </tr>
                  {b.errorReason&&(<tr key={b.id+"e"} className="border-b border-white/[0.03]"><td colSpan={9} className="px-3 pb-2.5"><ErrRow reason={b.errorReason} code={b.errorCode}/></td></tr>)}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </C>
      {log&&<LogModal build={log} onClose={()=>setLog(null)}/>}
    </div>
  );
};


export default AdminBuilds;
