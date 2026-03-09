// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH, ErrRow, exportCSV } from "../ui/SharedUI.jsx";
import LogModal from "../shared/LogModal.jsx";
import { MY_BUILDS } from "../../data/index.js";

const ClientBuilds = ({ setPage, addToast }) => {
  const [filter, setFilter] = useState("all");
  const [log, setLog] = useState(null);
  const filtered = filter==="all"?MY_BUILDS:MY_BUILDS.filter(b=>b.status===filter);
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {["all","running","queued","success","failed"].map(f=>(<button key={f} onClick={()=>setFilter(f)} className={`px-2.5 py-1 rounded-lg text-[9px] capitalize font-bold transition-colors ${filter===f?"bg-violet-600/25 text-violet-300 border border-violet-500/25":"text-slate-500 hover:text-slate-300"}`}>{f}</button>))}
        </div>
        <button onClick={()=>setPage("new-build")} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-lg transition-colors"><Icon name="plus" size={11}/>New Build</button>
      </div>
      <C>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead><tr className="border-b border-white/[0.05]">{["Build ID","Project","Status","Branch","Duration","Mac","Date","Actions"].map(h=>(<th key={h} className="px-3 py-2 text-left text-[9px] font-black text-slate-600 uppercase tracking-widest">{h}</th>))}</tr></thead>
            <tbody>
              {filtered.map(b=>(
                <>
                  <tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 py-2.5 text-[10px] font-mono text-slate-400">{b.id}</td>
                    <td className="px-3 py-2.5 text-[11px] font-semibold text-slate-200">{b.project}</td>
                    <td className="px-3 py-2.5"><Badge s={b.status}/></td>
                    <td className="px-3 py-2.5 text-[10px] font-mono text-slate-500 truncate max-w-[100px]">{b.branch}</td>
                    <td className="px-3 py-2.5 text-[10px] font-mono text-slate-400">{b.duration}</td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-500">{b.mac}</td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-500 whitespace-nowrap">{b.date.slice(0,10)}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <button onClick={()=>setLog(b)} className="text-slate-600 hover:text-violet-400 transition-colors" title="View logs"><Icon name="terminal" size={12}/></button>
                        {b.status==="success"&&<button onClick={()=>addToast(`Downloading ${b.project}.ipa…`,"success")} className="text-slate-600 hover:text-emerald-400 transition-colors" title={`Download IPA (${b.size})`}><Icon name="download" size={12}/></button>}
                        {b.status==="failed"&&<button onClick={()=>{setPage("support");}} className="text-slate-600 hover:text-amber-400 transition-colors" title="Open support ticket"><Icon name="headset" size={12}/></button>}
                      </div>
                    </td>
                  </tr>
                  {b.errorReason&&(<tr key={b.id+"e"} className="border-b border-white/[0.03]"><td colSpan={8} className="px-3 pb-2.5"><ErrRow reason={b.errorReason} code={b.errorCode}/></td></tr>)}
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


export default ClientBuilds;
