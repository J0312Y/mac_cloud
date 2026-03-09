// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";

const AdminAlerts = ({ alerts, setAlerts, addToast }) => {
  const [filter, setFilter] = useState("all");
  const ack = (id) => { setAlerts(as=>as.map(a=>a.id===id?{...a,ack:true}:a)); addToast("Alert acknowledged","success"); };
  const ackAll = () => { setAlerts(as=>as.map(a=>({...a,ack:true}))); addToast("All alerts acknowledged","success"); };
  const filtered = filter==="all"?alerts:filter==="unack"?alerts.filter(a=>!a.ack):alerts.filter(a=>a.type===filter);
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1 flex-wrap">
          {["all","unack","critical","warning","info"].map(f=>(<button key={f} onClick={()=>setFilter(f)} className={`px-2.5 py-1 rounded-lg text-[9px] capitalize font-bold transition-colors ${filter===f?"bg-rose-600/25 text-rose-300 border border-rose-500/25":"text-slate-500 hover:text-slate-300"}`}>{f}</button>))}
        </div>
        <button onClick={ackAll} className="px-3 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors flex items-center gap-1.5"><Icon name="check" size={10}/>Ack All</button>
      </div>
      <div className="space-y-2">
        {filtered.map(a=>(
          <div key={a.id} className={`bg-[#13111f] border rounded-xl px-4 py-3 flex items-start gap-3 transition-opacity ${a.ack?"opacity-50":"border-white/[0.06]"} ${a.type==="critical"&&!a.ack?"border-red-500/20":""}`}>
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.type==="critical"?"bg-red-400 animate-pulse":a.type==="warning"?"bg-amber-400":"bg-blue-400"}`}/>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5"><Badge s={a.type}/><p className="text-[11px] font-bold text-slate-200">{a.title}</p></div>
              <p className="text-[10px] text-slate-400">{a.msg}</p>
              <p className="text-[9px] text-slate-600 mt-1">{a.time}</p>
            </div>
            {!a.ack&&<button onClick={()=>ack(a.id)} className="text-[10px] text-rose-400 font-bold hover:text-rose-300 transition-colors flex-shrink-0">Ack</button>}
            {a.ack&&<span className="text-[9px] text-slate-600">Acked</span>}
          </div>
        ))}
      </div>
    </div>
  );
};


export default AdminAlerts;
