// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import Icon from "./Icon.jsx";
import { useApp } from "../../i18n/AppContext.jsx";

/* ═══ SHARED UI COMPONENTS ═══ */
const Badge = ({ s }) => {
  const m = {
    success:"bg-emerald-500/15 text-emerald-400 border-emerald-500/25",running:"bg-amber-500/15 text-amber-400 border-amber-500/25",
    failed:"bg-red-500/15 text-red-400 border-red-500/25",queued:"bg-slate-500/15 text-slate-400 border-slate-500/25",
    active:"bg-emerald-500/15 text-emerald-400 border-emerald-500/25",suspended:"bg-red-500/15 text-red-400 border-red-500/25",
    idle:"bg-emerald-500/15 text-emerald-400 border-emerald-500/25",busy:"bg-amber-500/15 text-amber-400 border-amber-500/25",
    offline:"bg-slate-500/15 text-slate-400 border-slate-500/25",critical:"bg-red-500/15 text-red-400 border-red-500/25",
    warning:"bg-amber-500/15 text-amber-400 border-amber-500/25",info:"bg-blue-500/15 text-blue-400 border-blue-500/25",
    active2:"bg-emerald-500/15 text-emerald-400 border-emerald-500/25",expired:"bg-red-500/15 text-red-400 border-red-500/25",
    open:"bg-amber-500/15 text-amber-400 border-amber-500/25",resolved:"bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    closed:"bg-slate-500/15 text-slate-400 border-slate-500/25",paid:"bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    high:"bg-red-500/15 text-red-400 border-red-500/25",medium:"bg-amber-500/15 text-amber-400 border-amber-500/25",
    low:"bg-slate-500/15 text-slate-400 border-slate-500/25",inactive:"bg-slate-500/15 text-slate-400 border-slate-500/25",
    Owner:"accent-badge-bg accent-text accent-border",Developer:"bg-sky-500/15 text-sky-400 border-sky-500/25",
    Viewer:"bg-slate-500/15 text-slate-400 border-slate-500/25",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${m[s]||m.info}`}>{s}</span>;
};

const C = ({ children, className="" }) => (
  <div className={`bg-[#13111f] border border-white/[0.06] rounded-xl ${className}`}>{children}</div>
);
const CH = ({ title, sub, action }) => (
  <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between gap-2 flex-wrap">
    <div><p className="text-[11px] font-black text-slate-200 uppercase tracking-widest">{title}</p>{sub&&<p className="text-[9px] text-slate-500 mt-0.5">{sub}</p>}</div>
    {action&&<div className="flex-shrink-0">{action}</div>}
  </div>
);

const ErrRow = ({ reason, code }) => !reason ? null : (
  <div className="mt-1.5 flex items-start gap-2 bg-red-950/40 border border-red-500/20 rounded-lg px-3 py-2">
    <Icon name="alertTri" size={10} className="text-red-400 flex-shrink-0 mt-0.5"/>
    <div className="flex-1 min-w-0">
      {code&&<span className="text-[9px] text-red-500 font-black font-mono mr-2">[{code}]</span>}
      <span className="text-[10px] text-red-300 font-mono break-all">{reason}</span>
    </div>
  </div>
);


const Toast = ({ toasts }) => (
  <div className="fixed bottom-5 right-5 z-[999] flex flex-col gap-2 pointer-events-none">
    {toasts.map(t=>(
      <div key={t.id} className="flex items-center gap-3 bg-[#1a1728] border border-white/10 rounded-xl px-4 py-3 shadow-2xl" style={{animation:"toastIn .2s ease-out"}}>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.tp==="success"?"bg-emerald-400":t.tp==="error"?"bg-red-400":t.tp==="warn"?"bg-amber-400":"bg-blue-400"}`}/>
        <span className="text-xs text-slate-200">{t.msg}</span>
      </div>
    ))}
  </div>
);

/* ═══ TOGGLE ═══ */
const Toggle = ({ on, onChange }) => (
  <div onClick={()=>onChange(!on)} className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative flex-shrink-0 ${on?"btn-accent":"bg-white/10"}`}>
    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow ${on?"translate-x-4":"translate-x-0.5"}`}/>
  </div>
);

/* ═══ EXPORT CSV HELPER ═══ */
const exportCSV = (rows, cols, filename) => {
  const csv = [cols.join(","), ...rows.map(r=>cols.map(c=>JSON.stringify(r[c]??"")))].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv"}));
  a.download = filename; a.click();
};

export { Badge, C, CH, ErrRow, Toast, Toggle, exportCSV };
