// @ts-nocheck
import { useState, useEffect, Fragment } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH, ErrRow, exportCSV } from "../ui/SharedUI.jsx";
import LogModal from "../shared/LogModal.jsx";
import api from "../../lib/api.js";
import { useApp } from "../../i18n/AppContext.jsx";

const AdminBuilds = ({ addToast }) => {
  const { t } = useApp();
  const [builds, setBuilds]   = useState([]);
  const [filter, setFilter]   = useState("all");
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const [log, setLog]         = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.admin.builds({ limit: 200 });
      setBuilds(res.builds || []);
    } catch { addToast("Failed to load builds", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = builds.filter(b =>
    (filter === "all" || b.status === filter) &&
    (b.project + (b.user_name||"") + b.id).toLowerCase().includes(search.toLowerCase())
  );

  const fmtDuration = (ms) => {
    if (!ms) return "—";
    return `${Math.floor(ms/60000)}m ${Math.floor((ms%60000)/1000)}s`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {["all","running","queued","success","failed"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-[9px] capitalize font-bold transition-colors ${filter===f?"accent-bg-dyn/25 accent-text-dyn border accent-bd-dyn":"text-slate-500 hover:text-slate-300"}`}>
              {f} ({f==="all" ? builds.length : builds.filter(b=>b.status===f).length})
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Icon name="search" size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
              className="bg-black/30 border border-white/[0.07] rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-300 outline-none w-40"/>
          </div>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors">
            <Icon name="refresh" size={11}/>Refresh
          </button>
          <button onClick={()=>{ exportCSV(filtered,["id","project","user_name","status","branch","mac_id","xcode_version","created_at"],"builds.csv"); addToast("CSV exported","success"); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors">
            <Icon name="download" size={11}/>Export
          </button>
        </div>
      </div>
      <C>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="w-6 h-6 border-2 accent-bd-dyn accent-spin-t-dyn rounded-full animate-spin"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Icon name="zap" size={24} className="text-slate-700"/>
            <p className="text-[11px] text-slate-500">No builds found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Build ID","Project","User","Status","Branch","Mac","Xcode","Duration","Date",""].map(h=>(
                    <th key={h} className="px-3 py-2 text-left text-[9px] font-black text-slate-600 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b=>(
                  <Fragment key={b.id}>
                    <tr className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-3 py-2.5 text-[10px] font-mono text-slate-400">{b.id?.slice(0,12)}</td>
                      <td className="px-3 py-2.5 text-[11px] font-semibold text-slate-200">{b.project}</td>
                      <td className="px-3 py-2.5 text-[10px] text-slate-400 truncate max-w-[120px]">{b.user_name || b.user_email}</td>
                      <td className="px-3 py-2.5"><Badge s={b.status}/></td>
                      <td className="px-3 py-2.5 text-[10px] font-mono text-slate-500 truncate max-w-[100px]">{b.branch}</td>
                      <td className="px-3 py-2.5 text-[10px] text-slate-500">{b.mac_id}</td>
                      <td className="px-3 py-2.5 text-[10px] text-slate-500">{b.xcode_version}</td>
                      <td className="px-3 py-2.5 text-[10px] font-mono text-slate-400">{fmtDuration(b.duration_ms)}</td>
                      <td className="px-3 py-2.5 text-[10px] text-slate-500 whitespace-nowrap">{b.created_at?.slice(0,10)}</td>
                      <td className="px-3 py-2.5">
                        <button onClick={()=>setLog(b)} className="text-slate-600 hover:accent-text transition-colors">
                          <Icon name="terminal" size={12}/>
                        </button>
                      </td>
                    </tr>
                    {b.error_reason && (
                      <tr className="border-b border-white/[0.03]">
                        <td colSpan={10} className="px-3 pb-2.5">
                          <ErrRow reason={b.error_reason} code={b.error_code}/>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </C>
      {log && <LogModal build={log} onClose={()=>setLog(null)}/>}
    </div>
  );
};

export default AdminBuilds;
