// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge } from "../ui/SharedUI.jsx";
import { SUCCESS_LOG, FAILED_LOG } from "../../data/index.js";

const LogModal = ({ build, onClose }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const lines = build?.status==="failed" ? FAILED_LOG : SUCCESS_LOG;
  useEffect(()=>{ setCount(0); const t=setInterval(()=>setCount(c=>{if(c>=lines.length){clearInterval(t);return c;}return c+1;}),130); return()=>clearInterval(t); },[build]);
  useEffect(()=>{ ref.current?.scrollIntoView({behavior:"smooth"}); },[count]);
  const tc={info:"text-slate-400",success:"text-emerald-400",warn:"text-amber-400",error:"text-red-400"};
  if(!build) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl bg-[#0b0917] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl flex flex-col" style={{maxHeight:"82vh"}} onClick={e=>e.stopPropagation()}>
        <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-white/[0.06] bg-[#0e0c1a] flex-shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"/><div className="w-2.5 h-2.5 rounded-full bg-amber-500/60"/><div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"/>
          <span className="text-[10px] text-slate-500 font-mono flex-1 truncate ml-1">{build.project} · {build.id} · {build.branch}</span>
          <Badge s={build.status}/>
          {count<lines.length&&<span className="text-[9px] text-amber-400 animate-pulse font-bold">● LIVE</span>}
          {count>=lines.length&&build.status==="success"&&<span className="text-[9px] text-emerald-400 font-bold">✓ OK</span>}
          {count>=lines.length&&build.status!=="success"&&<span className="text-[9px] text-red-400 font-bold">✗ FAIL</span>}
          <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition-colors ml-1"><Icon name="x" size={13}/></button>
        </div>
        {build.errorReason&&(
          <div className="flex items-start gap-2 px-4 py-2.5 bg-red-950/40 border-b border-red-500/20 flex-shrink-0">
            <Icon name="alertTri" size={11} className="text-red-400 flex-shrink-0 mt-0.5"/>
            <div><span className="text-[9px] text-red-500 font-black font-mono mr-2">[{build.errorCode}]</span><span className="text-[10px] text-red-300 font-mono">{build.errorReason}</span></div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 space-y-0.5 font-mono text-[11px]">
          {lines.slice(0,count).map((l,i)=>(
            <div key={i} className="flex gap-3 hover:bg-white/[0.02] rounded px-1 py-0.5">
              <span className="text-slate-700 w-10 flex-shrink-0 select-none">{l.t}</span>
              <span className={tc[l.k]}>{l.x}</span>
            </div>
          ))}
          {count<lines.length&&<div className="flex gap-3 px-1"><span className="text-slate-700 w-10"/><span className="text-slate-600 animate-pulse">▌</span></div>}
          <div ref={ref}/>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.05] bg-[#0e0c1a] flex-shrink-0">
          <div className="flex gap-3">
            <span className="text-[9px] text-slate-600 font-mono">Mac: {build.mac}</span>
            <span className="text-[9px] text-slate-600 font-mono">Xcode: {build.xcode}</span>
            <span className="text-[9px] text-slate-600 font-mono">Region: {build.region}</span>
          </div>
          {build.status==="success"&&(
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-600/30 transition-colors">
              <Icon name="download" size={10}/>Download IPA ({build.size})
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogModal;
