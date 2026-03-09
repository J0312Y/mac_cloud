// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { C, CH } from "../ui/SharedUI.jsx";
import { SvgBar, SvgGroupBar, SvgArea, SvgPie } from "../charts/index.jsx";
import { BUILDS, USERS, PLANS, REVENUE } from "../../data/index.js";

const AdminAnalytics = ({ addToast }) => {
  const mrr = REVENUE[REVENUE.length-1].mrr;
  const prevMrr = REVENUE[REVENUE.length-2].mrr;
  const mrrGrowth = (((mrr-prevMrr)/prevMrr)*100).toFixed(1);
  const arpu = Math.round(mrr/USERS.filter(u=>u.status==="active").length);
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {l:"MRR",    v:`$${mrr.toLocaleString()}`,  sub:`+${mrrGrowth}% MoM`, tc:"text-emerald-400"},
          {l:"ARPU",   v:`$${arpu}`,                   sub:"per active user",    tc:"text-violet-400"},
          {l:"Churn",  v:"0%",                          sub:"this month",         tc:"text-sky-400"},
          {l:"LTV",    v:"$948",                        sub:"avg per user",        tc:"text-amber-400"},
        ].map(s=>(
          <div key={s.l} className="bg-[#13111f] border border-white/[0.06] rounded-xl px-4 py-3">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{s.l}</p>
            <p className={`text-xl font-black font-mono ${s.tc}`}>{s.v}</p>
            <p className="text-[9px] text-slate-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <C><CH title="MRR Growth" sub="Last 7 months" action={<button onClick={()=>{exportCSV(REVENUE,["m","mrr","profit"],"revenue.csv");addToast("CSV exported","success");}} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors"><Icon name="download" size={11}/>CSV</button>}/>
          <div className="px-4 pb-3">
            <SvgBar data={REVENUE.map(r=>r.mrr)} labels={REVENUE.map(r=>r.m)} color="#8b5cf6" h={200}/>
          </div>
        </C>

        <C><CH title="Revenue vs Profit"/>
          <div className="px-4 pb-3">
            <SvgGroupBar data={REVENUE.map(r=>({...r,month:r.m}))} keys={["mrr","profit"]} colors={["#8b5cf6","#10b981"]} h={200}/>
          </div>
        </C>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <C><CH title="Plan Distribution"/>
          <div className="px-4 pb-3">
            <SvgPie
              data={PLANS.map(p=>({name:p.name,value:USERS.filter(u=>u.plan===p.name).length}))}
              colors={["#64748b","#8b5cf6","#f59e0b"]}
              h={200}
            />
          </div>
        </C>
        <C><CH title="Build Success Rate"/>
          <div className="px-4 pb-3">
            <SvgPie
              data={[
                {name:"Success", value:BUILDS.filter(b=>b.status==="success").length},
                {name:"Failed",  value:BUILDS.filter(b=>b.status==="failed").length},
                {name:"Running", value:BUILDS.filter(b=>b.status==="running").length},
                {name:"Queued",  value:BUILDS.filter(b=>b.status==="queued").length},
              ]}
              colors={["#10b981","#ef4444","#f59e0b","#64748b"]}
              h={200}
            />
          </div>
        </C>
      </div>
    </div>
  );
};


export default AdminAnalytics;
