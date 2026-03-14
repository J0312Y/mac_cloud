// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge } from "../ui/SharedUI.jsx";
import api from "../../lib/api.js";
import { useBuildUpdates } from "../../hooks/useSocket.js";

const KIND_COLOR = {
  info:    "text-slate-400",
  success: "text-emerald-400",
  warn:    "text-amber-400",
  error:   "text-red-400",
};

const LogModal = ({ build, onClose }) => {
  const [lines,   setLines]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [live,    setLive]    = useState(false);
  const ref = useRef(null);

  // Charger les vrais logs depuis l'API
  useEffect(() => {
    if (!build) return;
    setLines([]);
    setLoading(true);
    setLive(["running","compiling","packaging","queued"].includes(build.status));

    api.builds.logs(build.id)
      .then(res => {
        const logs = res.logs || res || [];
        setLines(logs);
      })
      .catch(() => setLines([]))
      .finally(() => setLoading(false));
  }, [build?.id]);

  // Recevoir les nouveaux logs en temps réel via WebSocket
  useBuildUpdates(
    build?.id,
    (updated) => {
      if (updated?.status && ["success","failed"].includes(updated.status)) {
        setLive(false);
      }
    },
    (logLine) => {
      setLines(prev => [...prev, logLine]);
    }
  );

  // Auto-scroll
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines.length]);

  if (!build) return null;

  const isLive    = live && ["running","compiling","packaging"].includes(build.status);
  const isDone    = build.status === "success";
  const isFailed  = build.status === "failed";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
         onClick={onClose}>
      <div className="w-full max-w-2xl bg-[#0b0917] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
           style={{ maxHeight: "82vh" }}
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-white/[0.06] bg-[#0e0c1a] flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"/>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60"/>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"/>
          <span className="text-[10px] text-slate-500 font-mono flex-1 truncate ml-1">
            {build.project} · {build.id} · {build.branch}
          </span>
          <Badge s={build.status}/>
          {isLive && <span className="text-[9px] text-amber-400 animate-pulse font-bold">● LIVE</span>}
          {isDone && <span className="text-[9px] text-emerald-400 font-bold">✓ OK</span>}
          {isFailed && <span className="text-[9px] text-red-400 font-bold">✗ FAIL</span>}
          <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition-colors ml-1">
            <Icon name="x" size={13}/>
          </button>
        </div>

        {/* Error banner */}
        {build.error_reason && (
          <div className="flex items-start gap-2 px-4 py-2.5 bg-red-950/40 border-b border-red-500/20 flex-shrink-0">
            <Icon name="alertTri" size={11} className="text-red-400 flex-shrink-0 mt-0.5"/>
            <div>
              <span className="text-[9px] text-red-500 font-black font-mono mr-2">[{build.error_code}]</span>
              <span className="text-[10px] text-red-300 font-mono">{build.error_reason}</span>
            </div>
          </div>
        )}

        {/* Logs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-0.5 font-mono text-[11px]">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <span className="w-5 h-5 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin"/>
            </div>
          ) : lines.length === 0 ? (
            <p className="text-slate-600 text-center py-10">No logs available</p>
          ) : (
            lines.map((l, i) => {
              const kind    = l.kind || l.k || "info";
              const message = l.message || l.x || "";
              const ts      = l.created_at
                ? new Date(l.created_at).toISOString().slice(11, 19)
                : (l.t || "");
              return (
                <div key={i} className="flex gap-3 hover:bg-white/[0.02] rounded px-1 py-0.5">
                  <span className="text-slate-700 w-14 flex-shrink-0 select-none">{ts}</span>
                  <span className={KIND_COLOR[kind] || "text-slate-400"}>{message}</span>
                </div>
              );
            })
          )}
          {isLive && (
            <div className="flex gap-3 px-1">
              <span className="text-slate-700 w-14"/>
              <span className="text-slate-600 animate-pulse">▌</span>
            </div>
          )}
          <div ref={ref}/>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.05] bg-[#0e0c1a] flex-shrink-0">
          <div className="flex gap-3">
            <span className="text-[9px] text-slate-600 font-mono">Mac: {build.mac_id || "—"}</span>
            <span className="text-[9px] text-slate-600 font-mono">Xcode: {build.xcode_version || "—"}</span>
            <span className="text-[9px] text-slate-600 font-mono">Region: {build.region || "—"}</span>
          </div>
          {build.status === "success" && (
            <button
              onClick={async () => {
                try {
                  const blob = await api.builds.download(build.id);
                  const url  = URL.createObjectURL(blob);
                  const a    = document.createElement("a");
                  a.href     = url;
                  a.download = `${build.project}.ipa`;
                  a.click();
                } catch { /* silent */ }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-600/30 transition-colors">
              <Icon name="download" size={10}/>Download IPA
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogModal;