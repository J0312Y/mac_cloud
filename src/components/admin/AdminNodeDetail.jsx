// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";
import { Spark, SvgCpuHistory } from "../charts/index.jsx";
import { BUILDS } from "../../data/index.js";

const AdminNodeDetail = ({ node, setPage, addToast }) => {
  if(!node) return <div className="flex-1 flex items-center justify-center"><div className="text-slate-500 text-sm">No node selected.<br/><button onClick={()=>setPage("nodes")} className="text-rose-400 mt-2 font-bold text-xs">← Back to nodes</button></div></div>;
  const nodeBuilds = BUILDS.filter(b=>b.mac===node.id);
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={()=>setPage("nodes")} className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"><Icon name="chevL" size={12}/>Mac Nodes</button>
        <span className="text-slate-700">/</span>
        <span className="text-[10px] font-bold text-slate-300">{node.name}</span>
        <Badge s={node.status}/>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["OS",node.os],["Xcode",node.xcode],["Region",node.region],["Uptime",node.uptime]].map(([l,v])=>(
          <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-xl px-4 py-3"><p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{l}</p><p className="text-xs font-black text-slate-200">{v}</p></div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <C><CH title="System Resources"/>
          <div className="p-4 space-y-3">
            {[["CPU Usage",node.cpu,"bg-violet-500"],["RAM Usage",node.ram,"bg-sky-500"],["Temperature",node.temp,"bg-orange-500","°",100],["Disk Usage",node.disk,"bg-emerald-500"]].map(([l,v,c,suf="%",mx=100])=>(
              <div key={l}>
                <div className="flex justify-between mb-1.5"><span className="text-[10px] text-slate-400">{l}</span><span className="text-[11px] font-mono font-bold text-slate-200">{v}{suf}</span></div>
                <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden"><div className={`h-full ${c} rounded-full`} style={{width:`${(v/mx)*100}%`}}/></div>
              </div>
            ))}
          </div>
        </C>

        <C><CH title="CPU History — 24h"/>
          <div className="px-4 pb-3 pt-1">
            <Spark data={[...node.history,...node.history.slice(-4)]} color={node.status==="busy"?"#f59e0b":"#10b981"} fill h={160} w={500}/>
          </div>
        </C>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[["IP Address",node.ip,"font-mono"],["Last Reboot",node.lastReboot,""],["OS Version",node.os,""],["Xcode Version",node.xcode,"font-mono"]].map(([l,v,cls])=>(
          <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="text-[10px] text-slate-500">{l}</span>
            <span className={`text-[11px] text-slate-200 font-semibold ${cls}`}>{v}</span>
          </div>
        ))}
      </div>

      <C><CH title={`Build History on ${node.name}`} sub={`${nodeBuilds.length} builds`}/>
        {nodeBuilds.length===0&&<p className="px-4 py-6 text-[11px] text-slate-500 text-center">No builds on this node</p>}
        {nodeBuilds.map(b=>(
          <div key={b.id} className="px-4 py-2.5 border-b border-white/[0.03] last:border-0">
            <div className="flex items-center gap-2"><Badge s={b.status}/><span className="text-[11px] font-semibold text-slate-300 flex-1">{b.project}</span><span className="text-[10px] text-slate-500 font-mono">{b.duration}</span></div>
            <ErrRow reason={b.errorReason} code={b.errorCode}/>
          </div>
        ))}
      </C>

      <div className="flex gap-3">
        <button onClick={()=>addToast(`Rebooting ${node.name}…`,"warn")} className="px-4 py-2 bg-amber-900/20 border border-amber-500/20 text-amber-400 text-xs font-bold rounded-lg hover:bg-amber-900/30 transition-colors flex items-center gap-2"><Icon name="refresh" size={12}/>Reboot Node</button>
        <button onClick={()=>addToast(`Draining ${node.name} from queue…`,"info")} className="px-4 py-2 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-xs font-bold rounded-lg hover:text-slate-200 transition-colors flex items-center gap-2"><Icon name="power" size={12}/>Drain from Queue</button>
        <button onClick={()=>addToast(`Deprovisioning ${node.name}…`,"error")} className="px-4 py-2 bg-red-900/20 border border-red-500/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-900/30 transition-colors flex items-center gap-2"><Icon name="trash" size={12}/>Deprovision</button>
      </div>
    </div>
  );
};


export default AdminNodeDetail;
