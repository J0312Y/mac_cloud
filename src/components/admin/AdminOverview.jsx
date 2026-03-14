// @ts-nocheck
import { useState, useEffect } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH, ErrRow } from "../ui/SharedUI.jsx";
import { Spark, SvgArea, SvgBar } from "../charts/index.jsx";
import { MACS, REVENUE } from "../../data/index.js";
import api from "../../lib/api.js";
import { useApp } from "../../i18n/AppContext.jsx";

const AdminOverview = ({ setPage, alerts }) => {
  const { t } = useApp();
  const [stats, setStats]   = useState(null);
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const unack = alerts.filter(a=>!a.ack).length;

  useEffect(() => {
    Promise.all([api.admin.stats(), api.admin.builds({ limit: 10 })])
      .then(([sr, br]) => { setStats(sr); setBuilds(br.builds || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const revenue = REVENUE[REVENUE.length-1].mrr;
  const buildsByHour = [3,5,8,6,9,12,10,8,14,11,9,7,5,6];
  const failed = builds.filter(b=>b.status==="failed");

  const fmtDuration = (ms) => {
    if (!ms) return "—";
    return `${Math.floor(ms/60000)}m ${Math.floor((ms%60000)/1000)}s`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {l:"Total Builds",  v: loading?"…": stats?.builds?.total ?? 0,         tc:"accent-text",  spark:[3,5,8,6,9,12,10,8], sc:"#8b5cf6", bg:"from-[var(--accent)]/10 accent-border"},
          {l:"Active Users",  v: loading?"…": stats?.users?.active ?? 0,          tc:"text-emerald-400", spark:[1,2,2,3,4,4,5,5],   sc:"#10b981", bg:"from-emerald-500/10 border-emerald-500/15"},
          {l:"Nodes Online",  v: MACS.filter(m=>m.status!=="offline").length,     tc:"text-sky-400",     spark:[3,3,3,4,3,3,3,3],   sc:"#0ea5e9", bg:"from-sky-500/10 border-sky-500/15"},
          {l:"MRR",           v:`$${(revenue/1000).toFixed(1)}k`,                 tc:"text-amber-400",   spark:REVENUE.map(r=>r.mrr), sc:"#f59e0b", bg:"from-amber-500/10 border-amber-500/15"},
        ].map(s=>(
          <div key={s.l} className={`bg-gradient-to-b ${s.bg} to-transparent border rounded-xl p-3`}>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{s.l}</p>
            <p className={`text-xl font-black font-mono ${s.tc}`}>{s.v}</p>
            <div className="mt-2"><Spark data={s.spark} color={s.sc} fill h={28} w={100}/></div>
          </div>
        ))}
      </div>

      {/* Build stats row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ["Running",  stats.builds?.running ?? 0, "text-amber-400",   "bg-amber-500/10 border-amber-500/15"],
            ["Queued",   stats.builds?.queued  ?? 0, "text-sky-400",     "bg-sky-500/10 border-sky-500/15"],
            ["Success",  stats.builds?.success ?? 0, "text-emerald-400", "bg-emerald-500/10 border-emerald-500/15"],
            ["Failed",   stats.builds?.failed  ?? 0, "accent-text-dyn",     "accent-bg-dyn/10 accent-bd-dyn"],
          ].map(([l,v,tc,bg])=>(
            <div key={l} className={`bg-gradient-to-b ${bg} to-transparent border rounded-xl px-3 py-2 flex items-center justify-between`}>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest">{l}</p>
              <p className={`text-lg font-black font-mono ${tc}`}>{v}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <C><CH title="Build Volume — 24h"/>
          <div className="px-4 pb-3">
            <SvgBar data={buildsByHour} labels={["0h","2h","4h","6h","8h","10h","12h","14h","16h","18h","20h","22h","23h","Now"]} color="#8b5cf6" h={180}/>
          </div>
        </C>

        <C>
          <CH title="Node Health" sub="Mock" action={<button onClick={()=>setPage("nodes")} className="text-[9px] accent-text-dyn font-bold hover:accent-text-dyn">All →</button>}/>
          <div className="p-3 space-y-2">
            {MACS.map(m=>(
              <div key={m.id} className="flex items-center gap-3 bg-black/20 border border-white/[0.04] rounded-lg px-3 py-2">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.status==="busy"?"bg-amber-400 animate-pulse":m.status==="idle"?"bg-emerald-400":"bg-slate-600"}`}/>
                <span className="text-[11px] text-slate-300 font-semibold flex-1">{m.name}</span>
                <Badge s={m.status}/>
                <span className="text-[10px] text-slate-500 font-mono">{m.cpu}% CPU</span>
              </div>
            ))}
          </div>
        </C>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <C>
          <CH title="Recent Failures" sub={`${failed.length} builds`} action={<button onClick={()=>setPage("builds")} className="text-[9px] accent-text-dyn font-bold hover:accent-text-dyn">All →</button>}/>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="w-5 h-5 border-2 accent-bd-dyn accent-spin-t-dyn rounded-full animate-spin"/>
            </div>
          ) : failed.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-[11px] text-slate-500">No failures 🎉</p>
            </div>
          ) : (
            failed.map(b=>(
              <div key={b.id} className="px-4 py-2.5 border-b border-white/[0.03] last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400">{b.id?.slice(0,12)}</span>
                  <span className="text-[11px] font-semibold text-slate-200 flex-1 truncate">{b.project}</span>
                  <span className="text-[10px] text-slate-500">{fmtDuration(b.duration_ms)}</span>
                </div>
                {b.error_reason && <ErrRow reason={b.error_reason} code={b.error_code}/>}
              </div>
            ))
          )}
        </C>

        <C>
          <CH title="Today's Stats"/>
          <div className="p-4 space-y-3">
            {stats ? [
              ["Builds today",   stats.today?.builds  ?? 0, "accent-text"],
              ["Succeeded",      stats.today?.success ?? 0, "text-emerald-400"],
              ["Failed",         (stats.today?.builds??0) - (stats.today?.success??0), "accent-text-dyn"],
              ["Total users",    stats.users?.total   ?? 0, "text-slate-300"],
            ].map(([l,v,c])=>(
              <div key={l} className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{l}</span>
                <span className={`text-sm font-black font-mono ${c}`}>{v}</span>
              </div>
            )) : (
              <div className="flex items-center justify-center py-4">
                <span className="w-5 h-5 border-2 accent-bd-dyn accent-spin-t-dyn rounded-full animate-spin"/>
              </div>
            )}
          </div>
        </C>
      </div>
    </div>
  );
};

export default AdminOverview;
