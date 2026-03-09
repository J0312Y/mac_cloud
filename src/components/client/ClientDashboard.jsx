// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH, ErrRow } from "../ui/SharedUI.jsx";
import { Spark } from "../charts/index.jsx";
import { MY_BUILDS, NOTIFS } from "../../data/index.js";

const ClientDashboard = ({ setPage }) => {
  const success=MY_BUILDS.filter(b=>b.status==="success").length;
  const failed=MY_BUILDS.filter(b=>b.status==="failed").length;
  const running=MY_BUILDS.filter(b=>b.status==="running"||b.status==="queued").length;
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {l:"Total Builds", v:MY_BUILDS.length, tc:"text-violet-400",  spark:[3,5,4,5,4,5,4], sc:"#8b5cf6", bg:"from-violet-500/10 border-violet-500/15"},
          {l:"Succeeded",    v:success,           tc:"text-emerald-400", spark:[2,3,3,4,3,4,3], sc:"#10b981", bg:"from-emerald-500/10 border-emerald-500/15"},
          {l:"Failed",       v:failed,            tc:"text-red-400",     spark:[1,0,1,1,0,1,1], sc:"#ef4444", bg:"from-red-500/10 border-red-500/15"},
          {l:"In Progress",  v:running,           tc:"text-amber-400",   spark:[0,1,0,1,0,1,1], sc:"#f59e0b", bg:"from-amber-500/10 border-amber-500/15"},
        ].map(s=>(
          <div key={s.l} className={`bg-gradient-to-b ${s.bg} to-transparent border rounded-xl p-3`}>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{s.l}</p>
            <p className={`text-xl font-black font-mono ${s.tc}`}>{s.v}</p>
            <div className="mt-2"><Spark data={s.spark} color={s.sc} fill h={28} w={100}/></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <C><CH title="Recent Builds" action={<button onClick={()=>setPage("my-builds")} className="text-[9px] text-violet-400 font-bold hover:text-violet-300">All →</button>}/>
          {MY_BUILDS.map(b=>(
            <div key={b.id} className="px-4 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-2"><Badge s={b.status}/><span className="text-[11px] text-slate-300 font-semibold flex-1 truncate">{b.project}</span><span className="text-[10px] text-slate-500 font-mono hidden sm:block">{b.branch}</span><span className="text-[10px] text-slate-500 font-mono">{b.duration}</span>{b.status==="success"&&<button className="text-slate-600 hover:text-emerald-400 transition-colors"><Icon name="download" size={11}/></button>}</div>
              <ErrRow reason={b.errorReason} code={b.errorCode}/>
            </div>
          ))}
        </C>
        <C><CH title="Notifications" sub={`${NOTIFS.filter(n=>!n.read).length} unread`}>
          </CH>
          {NOTIFS.slice(0,5).map(n=>(
            <div key={n.id} className={`flex items-start gap-3 px-4 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors`}>
              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${n.type==="success"?"bg-emerald-400":n.type==="error"?"bg-red-400":n.type==="warning"?"bg-amber-400":"bg-blue-400"} ${n.read?"opacity-30":""}`}/>
              <div className="flex-1 min-w-0"><p className={`text-[11px] font-semibold ${n.read?"text-slate-400":"text-slate-200"} truncate`}>{n.title}</p><p className="text-[9px] text-slate-500 truncate">{n.body}</p></div>
              <span className="text-[9px] text-slate-600 flex-shrink-0">{n.time}</span>
            </div>
          ))}
        </C>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <C><CH title="Platform Status"/>
          <div className="p-4 space-y-2">
            {[["Build Service","operational"],["Mac Nodes (EU-West)","operational"],["Mac Nodes (US-East)","degraded"],["API / Webhooks","operational"],["Storage / IPA Export","operational"]].map(([s,st])=>(
              <div key={s} className="flex items-center justify-between py-1"><span className="text-[11px] text-slate-300">{s}</span><div className="flex items-center gap-1.5"><div className={`w-1.5 h-1.5 rounded-full ${st==="operational"?"bg-emerald-400":st==="degraded"?"bg-amber-400 animate-pulse":"bg-red-400"}`}/><span className={`text-[10px] font-semibold ${st==="operational"?"text-emerald-400":st==="degraded"?"text-amber-400":"text-red-400"}`}>{st}</span></div></div>
            ))}
          </div>
        </C>
        <C><CH title="Plan Usage — Pro" action={<button onClick={()=>setPage("billing")} className="text-[9px] text-violet-400 font-bold hover:text-violet-300">Upgrade →</button>}/>
          <div className="p-4 space-y-3">
            {[["Builds","34/200","bg-violet-400",34,200],["Mac Hours","12.5/50h","bg-rose-400",12.5,50],["Storage","1.2/5 GB","bg-sky-400",1.2,5],["Certs","2/5","bg-emerald-400",2,5]].map(([l,v,c,u,mx])=>(
              <div key={l}><div className="flex justify-between mb-1"><span className="text-[10px] text-slate-400">{l}</span><span className="text-[10px] font-mono text-slate-300">{v}</span></div><div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden"><div className={`h-full ${c} rounded-full`} style={{width:`${(u/mx)*100}%`}}/></div></div>
            ))}
          </div>
        </C>
      </div>
    </div>
  );
};


export default ClientDashboard;
