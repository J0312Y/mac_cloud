// @ts-nocheck
import { useState, useEffect } from "react";
import Icon from "../ui/Icon.jsx";
import { C, CH, exportCSV } from "../ui/SharedUI.jsx";
import { SvgBar, SvgGroupBar, SvgArea, SvgPie } from "../charts/index.jsx";
import api from "../../lib/api.js";
import { useApp } from "../../i18n/AppContext.jsx";

const AdminAnalytics = ({ addToast }) => {
  const { t } = useApp();
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.stats()
      .then(r => setStats(r))
      .catch(() => addToast("Failed to load analytics","error"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="w-6 h-6 border-2 accent-bd-dyn accent-spin-t-dyn rounded-full animate-spin"/>
    </div>
  );

  const builds = stats?.builds || {};
  const users  = stats?.users  || {};
  const today  = stats?.today  || {};

  // Build status pie
  const pieData = [
    { name:"Success", value: builds.success||0 },
    { name:"Failed",  value: builds.failed||0  },
    { name:"Running", value: builds.running||0 },
    { name:"Queued",  value: builds.queued||0  },
  ].filter(d => d.value > 0);

  // User growth data (7 simulated periods based on total)
  const total = users.total || 1;
  const growthData = [
    { m:"W-6", users: Math.max(1, total-6) },
    { m:"W-5", users: Math.max(1, total-5) },
    { m:"W-4", users: Math.max(1, total-4) },
    { m:"W-3", users: Math.max(1, total-3) },
    { m:"W-2", users: Math.max(1, total-2) },
    { m:"W-1", users: Math.max(1, total-1) },
    { m:"Now", users: total },
  ];

  // Build stats bar
  const buildBarData  = [builds.success||0, builds.failed||0, builds.running||0, builds.queued||0];
  const buildBarLabels = ["Success","Failed","Running","Queued"];

  const successRate = builds.total ? Math.round((builds.success||0)/builds.total*100) : 0;
  const failRate    = builds.total ? Math.round((builds.failed||0)/builds.total*100) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { l:"Total Builds", v: builds.total||0,    sub:`${today.builds||0} today`,     tc:"accent-text" },
          { l:"Success Rate", v: `${successRate}%`,  sub:`${builds.success||0} succeeded`,tc:"text-emerald-400" },
          { l:"Total Users",  v: users.total||0,     sub:`${users.active||0} active`,     tc:"text-sky-400" },
          { l:"Fail Rate",    v: `${failRate}%`,     sub:`${builds.failed||0} failed`,    tc:"accent-text-dyn" },
        ].map(s=>(
          <div key={s.l} className="bg-[#13111f] border border-white/[0.06] rounded-xl px-4 py-3">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{s.l}</p>
            <p className={`text-xl font-black font-mono ${s.tc}`}>{s.v}</p>
            <p className="text-[9px] text-slate-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* User Growth — SvgArea expects data=[{key:val}], dataKeys=["users"], labels */}
        <C><CH title="User Growth" sub="Last 7 periods"/>
          <div className="px-4 pb-3">
            <SvgArea
              data={growthData}
              dataKeys={["users"]}
              labels={growthData.map(d=>d.m)}
              colors={["#8b5cf6"]}
              h={200}
            />
          </div>
        </C>

        {/* Build Status Pie */}
        <C><CH title="Build Status Distribution"/>
          <div className="px-4 pb-3">
            {pieData.length > 0 ? (
              <SvgPie
                data={pieData}
                colors={["#10b981","#ef4444","#f59e0b","#64748b"]}
                h={200}
              />
            ) : (
              <div className="flex items-center justify-center h-48">
                <p className="text-[11px] text-slate-500">No build data yet</p>
              </div>
            )}
          </div>
        </C>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Builds by status bar */}
        <C>
          <CH title="Builds by Status" action={
            <button onClick={()=>{ exportCSV([builds],["total","success","failed","running","queued"],"builds_stats.csv"); addToast("CSV exported","success"); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200">
              <Icon name="download" size={11}/>CSV
            </button>
          }/>
          <div className="px-4 pb-3">
            <SvgBar
              data={buildBarData}
              labels={buildBarLabels}
              color="#8b5cf6"
              h={180}
            />
          </div>
        </C>

        {/* Today */}
        <C><CH title="Today's Activity"/>
          <div className="p-4 space-y-3">
            {[
              ["Builds today",    today.builds||0,                                "accent-text"],
              ["Succeeded",       today.success||0,                               "text-emerald-400"],
              ["Failed",          (today.builds||0)-(today.success||0),           "accent-text-dyn"],
              ["Active users",    users.active||0,                                "text-sky-400"],
              ["Suspended users", users.suspended||0,                             "text-amber-400"],
            ].map(([l,v,c])=>(
              <div key={l} className="flex items-center justify-between py-1 border-b border-white/[0.03] last:border-0">
                <span className="text-[11px] text-slate-400">{l}</span>
                <span className={`text-sm font-black font-mono ${c}`}>{v}</span>
              </div>
            ))}
          </div>
        </C>
      </div>
    </div>
  );
};

export default AdminAnalytics;
