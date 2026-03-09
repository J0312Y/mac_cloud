// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";
import { CERTS } from "../../data/index.js";

const ClientCerts = ({ addToast }) => {
  const [certs, setCerts] = useState(CERTS);
  const daysLeft = (exp) => { const d=Math.ceil((new Date(exp)-new Date())/(1000*86400)); return d; };
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-[10px] text-slate-500">{certs.filter(c=>c.status==="active").length} active · {certs.filter(c=>c.status==="expired").length} expired · 2/5 slots used (Pro)</p>
        <button onClick={()=>addToast("Upload dialog — attach .p12 file","info")} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-lg transition-colors"><Icon name="upload" size={11}/>Upload Cert</button>
      </div>
      <div className="space-y-2">
        {certs.map(c=>{
          const days=daysLeft(c.expires);
          const urgent=days>0&&days<60;
          return (
            <C key={c.id} className={c.status==="expired"?"opacity-60":""}>
              <div className="px-4 py-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${c.status==="active"?"bg-emerald-500/15":"bg-red-500/15"}`}><Icon name="shield" size={15} className={c.status==="active"?"text-emerald-400":"text-red-400"}/></div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-200 truncate">{c.name}</p>
                  <p className="text-[9px] text-slate-500 font-mono">{c.fp}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <Badge s={c.status==="active"?days>0?"active":"expired":"expired"}/>
                  <p className={`text-[9px] mt-1 font-mono ${days<0?"text-red-400":urgent?"text-amber-400 font-bold":"text-slate-500"}`}>
                    {days<0?`Expired ${-days}d ago`:`${days}d left`}
                  </p>
                </div>
                <button onClick={()=>{setCerts(cs=>cs.filter(x=>x.id!==c.id));addToast("Certificate deleted","success");}} className="text-slate-700 hover:text-red-400 transition-colors ml-2"><Icon name="trash" size={12}/></button>
              </div>
              {urgent&&<div className="px-4 pb-3"><div className="flex items-center gap-2 bg-amber-950/40 border border-amber-500/20 rounded-lg px-3 py-1.5"><Icon name="alertTri" size={10} className="text-amber-400"/><span className="text-[10px] text-amber-300">Expires in {days} days — renew before builds start failing</span></div></div>}
            </C>
          );
        })}
      </div>
    </div>
  );
};


export default ClientCerts;
