// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH, ErrRow } from "../ui/SharedUI.jsx";
import { Spark, SvgArea, SvgBar } from "../charts/index.jsx";
import { BUILDS, MACS, USERS, REVENUE, ALERTS } from "../../data/index.js";

const AdminOverview = ({ setPage, alerts }) => {
  const unack = alerts.filter(a=>!a.ack).length;
  const failed = BUILDS.filter(b=>b.status==="failed");
  const revenue = REVENUE[REVENUE.length-1].mrr;
  const buildsByHour = [3,5,8,6,9,12,10,8,14,11,9,7,5,6];
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {l:"Total Builds",  v:BUILDS.length,                          tc:"text-violet-400",  spark:[3,5,8,6,9,12,10,8], sc:"#8b5cf6", bg:"from-violet-500/10 border-violet-500/15"},
          {l:"Active Users",  v:USERS.filter(u=>u.status==="active").length, tc:"text-emerald-400", spark:[1,2,2,3,4,4,5,5],   sc:"#10b981", bg:"from-emerald-500/10 border-emerald-500/15"},
          {l:"Nodes Online",  v:MACS.filter(m=>m.status!=="offline").length, tc:"text-sky-400",     spark:[3,3,3,4,3,3,3,3],   sc:"#0ea5e9", bg:"from-sky-500/10 border-sky-500/15"},
          {l:"MRR",           v:`$${(revenue/1000).toFixed(1)}k`,         tc:"text-amber-400",   spark:REVENUE.map(r=>r.mrr), sc:"#f59e0b", bg:"from-amber-500/10 border-amber-500/15"},
        ].map(s=>(
          <div key={s.l} className={`bg-gradient-to-b ${s.bg} to-transparent border rounded-xl p-3`}>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{s.l}</p>
            <p className={`text-xl font-black font-mono ${s.tc}`}>{s.v}</p>
            <div className="mt-2"><Spark data={s.spark} color={s.sc} fill h={28} w={100}/></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Build volume chart */}
        <C><CH title="Build Volume — 24h"/>
          <div className="px-4 pb-3">
            <SvgBar data={buildsByHour} labels={["0h","2h","4h","6h","8h","10h","12h","14h","16h","18h","20h","22h","23h","Now"]} color="#8b5cf6" h={180}/>
          </div>
        </C>

        {/* Node Health */}
        <C><CH title="Node Health" sub="Live" action={<button onClick={()=>setPage("nodes")} className="text-[9px] text-rose-400 font-bold hover:text-rose-300">All →</button>}/>
          <div className="p-3 space-y-2">
            {MACS.map(m=>(
              <div key={m.id} className="flex items-center gap-3 bg-black/20 border border-white/[0.04] rounded-lg px-3 py-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.status==="busy"?"bg-amber-400 animate-pulse":m.status==="idle"?"bg-emerald-400":"bg-slate-600"}`}/>
                <span className="text-[11px] text-slate-300 font-semibold flex-1">{m.name}</span>
                <Badge s={m.status}/>
                <span className="text-[10px] text-slate-500 font-mono">{m.cpu}% CPU</span>
                <span className="text-[10px] text-slate-500 font-mono">{m.temp}°</span>
              </div>
            ))}
          </div>
        </C>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Recent failures */}
        <C><CH title="Recent Failures" sub={`${failed.length} builds`} action={<button onClick={()=>setPage("builds")} className="text-[9px] text-rose-400 font-bold hover:text-rose-300">All →</button>}/>
          {failed.map(b=>(
            <div key={b.id} className="px-4 py-2.5 border-b border-white/[0.03] last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-300 font-semibold flex-1 truncate">{b.project}</span>
                <span className="text-[10px] text-slate-500 hidden sm:block">{b.user}</span>
                <span className="text-[9px] text-rose-400 font-mono">{b.errorCode}</span>
              </div>
              <ErrRow reason={b.errorReason} code={null}/>
            </div>
          ))}
        </C>

        {/* Alerts */}
        <C><CH title="Active Alerts" sub={`${unack} unacknowledged`} action={<button onClick={()=>setPage("alerts")} className="text-[9px] text-rose-400 font-bold hover:text-rose-300">All →</button>}/>
          {alerts.filter(a=>!a.ack).slice(0,4).map(a=>(
            <div key={a.id} className="flex items-start gap-3 px-4 py-2.5 border-b border-white/[0.03] last:border-0">
              <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${a.type==="critical"?"bg-red-400 animate-pulse":a.type==="warning"?"bg-amber-400":"bg-blue-400"}`}/>
              <div className="flex-1 min-w-0"><p className="text-[11px] text-slate-300 font-semibold truncate">{a.title}</p><p className="text-[9px] text-slate-500 truncate">{a.msg}</p></div>
              <Badge s={a.type}/>
            </div>
          ))}
        </C>
      </div>

      {/* Revenue trend */}
      <C><CH title="Revenue Trend — MRR vs Profit" sub="Last 7 months"/>
        <div className="px-4 pb-3">
          <SvgArea
            data={REVENUE.map(r=>({...r,month:r.m}))}
            dataKeys={["mrr","profit"]}
            colors={["#8b5cf6","#10b981"]}
            labels={REVENUE.map(r=>r.m)}
            h={220}
          />
        </div>
      </C>
    </div>
  );
};


export default AdminOverview;
