// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import Icon from "../ui/Icon.jsx";
import { C } from "../ui/SharedUI.jsx";
import { useApp } from "../../i18n/AppContext.jsx";

const API = "http://213.156.133.182:3001/api";
const tok = () => localStorage.getItem("mbc_token");
const authH = () => ({ Authorization: `Bearer ${tok()}` });

const ACTION_COLOR = {
  "billing.confirm": "text-emerald-400",
  "billing.reject":  "text-red-400",
  "build.submit":    "text-cyan-400",
  "user.suspend":    "text-red-400",
  "user.update":     "text-amber-400",
  "plan.update":     "text-purple-400",
  "node.update":     "text-sky-400",
};

const AdminAudit = () => {
  const { t } = useApp();
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all");
  const [search,  setSearch]  = useState("");
  const [total,   setTotal]   = useState(0);
  const [offset,  setOffset]  = useState(0);
  const LIMIT = 50;

  const load = useCallback(async (off = 0, fil = filter, s = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ role: fil, search: s, limit: LIMIT, offset: off });
      const r = await fetch(`${API}/admin/audit?${params}`, { headers: authH() });
      const d = await r.json();
      setLogs(d.logs || []);
      setTotal(d.total || 0);
      setOffset(off);
    } catch {}
    finally { setLoading(false); }
  }, [filter, search]);

  useEffect(() => { load(0, filter, search); }, []);

  const doSearch = (e) => {
    e.preventDefault();
    load(0, filter, search);
  };

  const fmt = (dt) => {
    const d = new Date(dt);
    return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1">
          {["all","admin","user"].map(f => (
            <button key={f} onClick={() => { setFilter(f); load(0, f, search); }}
              className={`px-2.5 py-1 rounded-lg text-[9px] capitalize font-bold transition-colors ${filter===f ? "accent-bg-dyn/25 accent-text-dyn border accent-bd-dyn" : "text-slate-500 hover:text-slate-300"}`}>
              {f === "all" ? "Tous" : f}
            </button>
          ))}
        </div>
        <form onSubmit={doSearch} className="flex gap-2">
          <div className="relative">
            <Icon name="search" size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Chercher…"
              className="bg-black/30 border border-white/[0.07] rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-300 outline-none w-44"/>
          </div>
          <button type="submit" className="px-3 py-1.5 accent-bg-dyn text-white text-[10px] font-bold rounded-lg">
            OK
          </button>
          <button type="button" onClick={() => load(0)}
            className="p-1.5 text-slate-500 hover:text-slate-300 border border-white/[0.07] rounded-lg transition-colors" title="Rafraîchir">
            <Icon name="refresh" size={11}/>
          </button>
        </form>
      </div>

      <p className="text-[10px] text-slate-500">{total} entrée{total !== 1 ? "s" : ""}</p>

      <C>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"/>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Icon name="fileText" size={24} className="text-slate-700"/>
            <p className="text-[11px] text-slate-500">Aucun log</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Utilisateur","Action","Cible","IP","Date"].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-[9px] font-black text-slate-600 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="text-[10px] text-slate-300">{log.user_email || "—"}</div>
                      <div className={`text-[8px] font-bold ${log.user_role === "admin" ? "accent-text-dyn" : "text-slate-500"}`}>
                        {log.user_role}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[10px] font-mono font-bold ${ACTION_COLOR[log.action] || "text-slate-400"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-300 max-w-[160px] truncate" title={log.target}>
                      {log.target || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-[10px] font-mono text-slate-600">
                      {log.ip || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-500 whitespace-nowrap">
                      {fmt(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </C>

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-500">
            {offset + 1}–{Math.min(offset + LIMIT, total)} sur {total}
          </p>
          <div className="flex gap-2">
            <button onClick={() => load(Math.max(0, offset - LIMIT))} disabled={offset === 0}
              className="px-3 py-1.5 text-[10px] border border-white/[0.07] text-slate-400 rounded-lg hover:text-white disabled:opacity-30">
              ← Précédent
            </button>
            <button onClick={() => load(offset + LIMIT)} disabled={offset + LIMIT >= total}
              className="px-3 py-1.5 text-[10px] border border-white/[0.07] text-slate-400 rounded-lg hover:text-white disabled:opacity-30">
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAudit;
