// @ts-nocheck
import { useState, useEffect } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH, ErrRow } from "../ui/SharedUI.jsx";
import { Spark } from "../charts/index.jsx";
import api from "../../lib/api.js";
import { useApp } from "../../i18n/AppContext.jsx";

const ClientDashboard = ({ setPage }) => {
  const { t } = useApp();
  const [builds, setBuilds] = useState([]);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.builds.list({ limit: 20 }), api.user.stats()])
      .then(([br, sr]) => {
        setBuilds(br.builds || []);
        setStats(sr.builds || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const total   = stats?.total   ?? builds.length;
  const success = stats?.success ?? builds.filter(b=>b.status==="success").length;
  const failed  = stats?.failed  ?? builds.filter(b=>b.status==="failed").length;
  const running = builds.filter(b=>["running","queued","compiling","packaging"].includes(b.status)).length;

  const fmtDuration = (ms) => {
    if (!ms) return "—";
    const m = Math.floor(ms/60000), s = Math.floor((ms%60000)/1000);
    return `${m}m ${s}s`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {l:"Total Builds", v:total,   tc:"accent-text",  spark:[3,5,4,5,4,5,total], sc:"#8b5cf6", bg:"from-[var(--accent)]/10 accent-border"},
          {l:"Succeeded",    v:success, tc:"text-emerald-400", spark:[2,3,3,4,3,4,success], sc:"#10b981", bg:"from-emerald-500/10 border-emerald-500/15"},
          {l:"Failed",       v:failed,  tc:"text-red-400",     spark:[1,0,1,1,0,1,failed], sc:"#ef4444", bg:"from-red-500/10 border-red-500/15"},
          {l:"In Progress",  v:running, tc:"text-amber-400",   spark:[0,1,0,1,0,1,running], sc:"#f59e0b", bg:"from-amber-500/10 border-amber-500/15"},
        ].map(s=>(
          <div key={s.l} className={`bg-gradient-to-b ${s.bg} to-transparent border rounded-xl p-3`}>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{s.l}</p>
            <p className={`text-xl font-black font-mono ${s.tc}`}>{loading ? "…" : s.v}</p>
            <div className="mt-2"><Spark data={s.spark} color={s.sc} fill h={28} w={100}/></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <C>
          <CH title="Recent Builds" action={<button onClick={()=>setPage("my-builds")} className="text-[9px] accent-text font-bold hover:accent-text">All →</button>}/>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <span className="w-5 h-5 border-2 accent-border border-t-cyan-500 rounded-full animate-spin"/>
            </div>
          ) : builds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <p className="text-[11px] text-slate-500">{t("builds.noBuilds")}</p>
              <button onClick={()=>setPage("new-build")} className="px-3 py-1.5 btn-accent text-white text-[10px] font-bold rounded-lg">
                Start your first build
              </button>
            </div>
          ) : (
            builds.slice(0,8).map(b=>(
              <div key={b.id} className="px-4 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-2">
                  <Badge s={b.status}/>
                  <span className="text-[11px] text-slate-300 font-semibold flex-1 truncate">{b.project}</span>
                  <span className="text-[10px] text-slate-500 font-mono hidden sm:block">{b.branch}</span>
                  <span className="text-[10px] text-slate-500 font-mono">{fmtDuration(b.duration_ms)}</span>
                </div>
                {b.error_reason && <ErrRow reason={b.error_reason} code={b.error_code}/>}
              </div>
            ))
          )}
        </C>

        <C>
          <CH title="Platform Status"/>
          <div className="p-4 space-y-2">
            {[
              ["Build Service",        "operational"],
              ["Mac Nodes (EU-West)",  "operational"],
              ["Mac Nodes (US-East)",  "degraded"],
              ["API / Webhooks",       "operational"],
              ["Storage / IPA Export", "operational"],
            ].map(([s,st])=>(
              <div key={s} className="flex items-center justify-between py-1">
                <span className="text-[11px] text-slate-300">{s}</span>
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${st==="operational"?"bg-emerald-400":st==="degraded"?"bg-amber-400 animate-pulse":"bg-red-400"}`}/>
                  <span className={`text-[10px] font-semibold ${st==="operational"?"text-emerald-400":st==="degraded"?"text-amber-400":"text-red-400"}`}>{st}</span>
                </div>
              </div>
            ))}
          </div>
        </C>
      </div>
    </div>
  );
};

export default ClientDashboard;
