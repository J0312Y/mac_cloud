// @ts-nocheck
import { useState, useEffect, Fragment } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH, ErrRow, exportCSV } from "../ui/SharedUI.jsx";
import LogModal from "../shared/LogModal.jsx";
import api from "../../lib/api.js";
import { useBuildUpdates } from "../../hooks/useSocket.js";
import { useApp } from "../../i18n/AppContext.jsx";

const ClientBuilds = ({ setPage, addToast }) => {
  const { t } = useApp();
  const [builds, setBuilds]   = useState([]);
  const [filter, setFilter]   = useState("all");
  const [loading, setLoading] = useState(true);
  const [log, setLog]         = useState(null);

  const load = async () => {
    try {
      const res = await api.builds.list({ limit: 100 });
      setBuilds(res.builds || []);
    } catch { addToast("Failed to load builds", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useBuildUpdates(null, (updated) => {
    setBuilds(prev => prev.map(b => b.id === updated.id ? { ...b, ...updated } : b));
  });

  const filtered = filter === "all" ? builds : builds.filter(b => b.status === filter);

  const fmtDuration = (ms) => {
    if (!ms) return "—";
    const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
    return `${m}m ${s}s`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {["all","running","queued","success","failed"].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-[9px] capitalize font-bold transition-colors ${filter===f?"accent-badge-bg accent-text border accent-border":"text-slate-500 hover:text-slate-300"}`}>
              {f} {f==="all" ? `(${builds.length})` : `(${builds.filter(b=>b.status===f).length})`}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors">
            <Icon name="refresh" size={11}/>Refresh
          </button>
          <button onClick={()=>setPage("new-build")}
            className="flex items-center gap-1.5 px-3 py-1.5 btn-accent text-white text-[10px] font-bold rounded-lg transition-colors">
            <Icon name="plus" size={11}/>New Build
          </button>
        </div>
      </div>
      <C>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="w-6 h-6 border-2 accent-border border-t-cyan-500 rounded-full animate-spin"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Icon name="zap" size={24} className="text-slate-700"/>
            <p className="text-[11px] text-slate-500">{t("builds.noBuilds")}</p>
            <button onClick={()=>setPage("new-build")} className="mt-2 px-4 py-2 btn-accent text-white text-[10px] font-bold rounded-lg transition-colors">
              Submit your first build
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Build ID","Project","Status","Branch","Duration","Mac","Date","Actions"].map(h=>(
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
                      <td className="px-3 py-2.5"><Badge s={b.status}/></td>
                      <td className="px-3 py-2.5 text-[10px] font-mono text-slate-500 truncate max-w-[100px]">{b.branch}</td>
                      <td className="px-3 py-2.5 text-[10px] font-mono text-slate-400">{fmtDuration(b.duration_ms)}</td>
                      <td className="px-3 py-2.5 text-[10px] text-slate-500">{b.mac_id || "mac-01"}</td>
                      <td className="px-3 py-2.5 text-[10px] text-slate-500 whitespace-nowrap">{b.created_at?.slice(0,10)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <button onClick={()=>setLog(b)} className="text-slate-600 hover:accent-text transition-colors" title="View logs">
                            <Icon name="terminal" size={12}/>
                          </button>
                          {b.status==="success" && (
                            <button onClick={async()=>{
                              try { const blob = await api.builds.download(b.id); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download=`${b.project}.ipa`; a.click(); }
                              catch { addToast("Download failed","error"); }
                            }} className="text-slate-600 hover:text-emerald-400 transition-colors" title="Download IPA">
                              <Icon name="download" size={12}/>
                            </button>
                          )}
                          {["pending","queued"].includes(b.status) && (
                            <button onClick={async()=>{
                              try { await api.builds.cancel(b.id); addToast("Build cancelled","warn"); load(); }
                              catch { addToast("Cannot cancel","error"); }
                            }} className="text-slate-600 hover:text-red-400 transition-colors" title="Cancel">
                              <Icon name="x" size={12}/>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {b.error_reason && (
                      <tr className="border-b border-white/[0.03]">
                        <td colSpan={8} className="px-3 pb-2.5">
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

export default ClientBuilds;
