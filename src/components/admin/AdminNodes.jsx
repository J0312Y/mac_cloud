// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";
import { Spark } from "../charts/index.jsx";
import { MACS } from "../../data/index.js";

const AdminNodes = ({ setPage, setSelNode, addToast }) => {
  const [macs, setMacs] = useState(MACS);
  const reboot = (id) => { setMacs(ms=>ms.map(m=>m.id===id?{...m,status:"idle"}:m)); addToast(`${id} rebooting…`,"warn"); };
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["Total",macs.length,"text-slate-300"],["Busy",macs.filter(m=>m.status==="busy").length,"text-amber-400"],["Idle",macs.filter(m=>m.status==="idle").length,"text-emerald-400"],["Offline",macs.filter(m=>m.status==="offline").length,"text-red-400"]].map(([l,v,c])=>(
          <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-xl px-4 py-3"><p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{l}</p><p className={`text-2xl font-black font-mono ${c}`}>{v}</p></div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {macs.map(m=>(
          <C key={m.id} className={m.status==="offline"?"opacity-60":""}>
            <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${m.status==="busy"?"bg-amber-400 animate-pulse":m.status==="idle"?"bg-emerald-400":"bg-slate-600"}`}/>
                <div><p className="text-[11px] font-black text-slate-200">{m.name}</p><p className="text-[9px] text-slate-500 font-mono">{m.ip} · {m.region}</p></div>
              </div>
              <Badge s={m.status}/>
            </div>
            <div className="p-4 space-y-2.5">
              {[["CPU",m.cpu,"bg-violet-500"],["RAM",m.ram,"bg-sky-500"],["Temp",m.temp,"bg-orange-500",100],["Disk",m.disk,"bg-emerald-500"]].map(([l,v,c,mx=100])=>(
                <div key={l}><div className="flex justify-between mb-1"><span className="text-[9px] text-slate-500">{l}</span><span className="text-[9px] font-mono text-slate-300">{v}{l==="Temp"?"°":"%"}</span></div><div className="h-1 bg-white/[0.05] rounded-full overflow-hidden"><div className={`h-full ${c} rounded-full transition-all`} style={{width:`${(v/mx)*100}%`}}/></div></div>
              ))}
              <div className="mt-1">
                <Spark data={m.history} color={m.status==="offline"?"#475569":m.status==="busy"?"#f59e0b":"#10b981"} fill h={40} w={200}/>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={()=>{setSelNode(m);setPage("node-detail");}} className="flex-1 py-1.5 bg-white/[0.04] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5"><Icon name="monitor" size={11}/>Details</button>
                <button onClick={()=>reboot(m.id)} disabled={m.status==="offline"} className="flex-1 py-1.5 bg-amber-900/20 border border-amber-500/20 text-amber-400 text-[10px] font-bold rounded-lg hover:bg-amber-900/30 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-30"><Icon name="refresh" size={11}/>Reboot</button>
              </div>
            </div>
          </C>
        ))}
      </div>
    </div>
  );
};


export default AdminNodes;
