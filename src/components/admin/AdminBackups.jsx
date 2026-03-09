// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";
import { BACKUPS } from "../../data/index.js";

const AdminBackups = ({ addToast }) => {
  const [bups, setBups] = useState(BACKUPS);
  const trigger = () => { setBups(b=>[{id:`bk_new_${Date.now()}`,type:"Full Snapshot",size:"computing…",date:new Date().toISOString().slice(0,16).replace("T"," "),status:"success",retention:"30 days"},...b]); addToast("Backup started — users not notified","success"); };
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["Total Backups",bups.length,"text-slate-300"],["Successful",bups.filter(b=>b.status==="success").length,"text-emerald-400"],["Failed",bups.filter(b=>b.status==="failed").length,"text-red-400"],["Total Size","113.7 GB","text-violet-400"]].map(([l,v,c])=>(
          <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-xl px-4 py-3"><p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{l}</p><p className={`text-xl font-black font-mono ${c}`}>{v}</p></div>
        ))}
      </div>
      <C>
        <CH title="Backup History" sub="Silent mode — users never notified" action={<button onClick={trigger} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/20 border border-rose-500/20 text-rose-400 text-[10px] font-bold rounded-lg hover:bg-rose-600/30 transition-colors"><Icon name="database" size={11}/>Trigger Backup</button>}/>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px]">
            <thead><tr className="border-b border-white/[0.05]">{["Type","Size","Date","Status","Retention"].map(h=>(<th key={h} className="px-3 py-2 text-left text-[9px] font-black text-slate-600 uppercase tracking-widest">{h}</th>))}</tr></thead>
            <tbody>
              {bups.map(b=>(<tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"><td className="px-3 py-2.5 text-[11px] text-slate-300 font-semibold">{b.type}</td><td className="px-3 py-2.5 text-[10px] font-mono text-slate-400">{b.size}</td><td className="px-3 py-2.5 text-[10px] text-slate-500">{b.date}</td><td className="px-3 py-2.5"><Badge s={b.status}/></td><td className="px-3 py-2.5 text-[10px] text-slate-500">{b.retention}</td></tr>))}
            </tbody>
          </table>
        </div>
      </C>
    </div>
  );
};


export default AdminBackups;
