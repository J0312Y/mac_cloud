// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";
import { TICKETS } from "../../data/index.js";

const ClientSupport = ({ addToast }) => {
  const [tickets, setTickets] = useState(TICKETS);
  const [expanded, setExpanded] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newCat, setNewCat] = useState("Build");
  const [showNew, setShowNew] = useState(false);
  const submit = () => {
    if(!newTitle) return addToast("Enter a title","error");
    setTickets(ts=>[{id:`TK-${String(ts.length+1).padStart(3,"0")}`,title:newTitle,status:"open",priority:"medium",created:new Date().toISOString().slice(0,16).replace("T"," "),cat:newCat,note:"Your ticket is being reviewed by our support team."},...ts]);
    setNewTitle(""); setShowNew(false); addToast("Ticket submitted","success");
  };
  const sc={open:"border-amber-500/20",resolved:"border-emerald-500/20",closed:"border-slate-500/10"};
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-3">
          {[["open",TICKETS.filter(t=>t.status==="open").length,"text-amber-400"],["resolved",TICKETS.filter(t=>t.status==="resolved").length,"text-emerald-400"],["closed",TICKETS.filter(t=>t.status==="closed").length,"text-slate-400"]].map(([l,v,c])=>(
            <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-lg px-3 py-2"><p className="text-[9px] text-slate-500 capitalize">{l}</p><p className={`text-xl font-black font-mono ${c}`}>{v}</p></div>
          ))}
        </div>
        <button onClick={()=>setShowNew(v=>!v)} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-lg transition-colors"><Icon name="plus" size={11}/>New Ticket</button>
      </div>

      {showNew&&(
        <C><CH title="New Support Ticket"/>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Category</label>
                <select value={newCat} onChange={e=>setNewCat(e.target.value)} className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                  {["Build","Account","Billing","Platform","Webhook"].map(c=>(<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
            </div>
            <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Title</label><input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Describe your issue…" className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-violet-500/40 transition-colors"/></div>
            <div className="flex gap-2">
              <button onClick={submit} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors">Submit</button>
              <button onClick={()=>setShowNew(false)} className="px-4 py-2 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-xs font-bold rounded-lg hover:text-slate-200 transition-colors">Cancel</button>
            </div>
          </div>
        </C>
      )}

      <div className="space-y-2">
        {tickets.map(t=>(
          <C key={t.id} className={`border ${sc[t.status]}`}>
            <div className="px-4 py-3 cursor-pointer hover:bg-white/[0.01] transition-colors" onClick={()=>setExpanded(expanded===t.id?null:t.id)}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] font-mono text-slate-600">{t.id}</span>
                <Badge s={t.status}/><Badge s={t.priority}/>
                <span className="text-[9px] bg-slate-800 border border-white/[0.05] text-slate-400 px-1.5 py-0.5 rounded">{t.cat}</span>
                <p className="text-[11px] font-semibold text-slate-200 flex-1 truncate min-w-0">{t.title}</p>
                <span className="text-[9px] text-slate-600 flex-shrink-0">{t.created.slice(0,10)}</span>
                <Icon name="chevD" size={10} className={`text-slate-600 transition-transform ${expanded===t.id?"rotate-180":""}`}/>
              </div>
            </div>
            {expanded===t.id&&(
              <div className="px-4 pb-3 border-t border-white/[0.04]">
                <div className="mt-3 flex items-start gap-2 bg-blue-950/30 border border-blue-500/20 rounded-lg px-3 py-2.5">
                  <Icon name="headset" size={11} className="text-blue-400 flex-shrink-0 mt-0.5"/>
                  <div><p className="text-[9px] text-blue-400 font-black mb-0.5">Support Agent</p><p className="text-[10px] text-slate-300 leading-relaxed">{t.note}</p></div>
                </div>
              </div>
            )}
          </C>
        ))}
      </div>
    </div>
  );
};


export default ClientSupport;
