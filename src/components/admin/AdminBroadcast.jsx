// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";

const AdminBroadcast = ({ addToast }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("info");
  const [target, setTarget] = useState("all");
  const [sent, setSent] = useState([
    {id:1, title:"Maintenance 2026-03-10", body:"Platform downtime 02:00–02:30 UTC", type:"warning", target:"all", time:"2d ago"},
    {id:2, title:"Xcode 15.3 deployed",    body:"All nodes updated to Xcode 15.3",   type:"info",    target:"all", time:"5d ago"},
  ]);
  const send = () => {
    if(!title||!body) return addToast("Fill in title and message","error");
    setSent(s=>[{id:Date.now(),title,body,type,target,time:"just now"},...s]);
    setTitle(""); setBody(""); addToast("Broadcast sent","success");
  };
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <C><CH title="New Broadcast"/>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Type</label>
              <select value={type} onChange={e=>setType(e.target.value)} className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                {["info","warning","error"].map(t=>(<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Target</label>
              <select value={target} onChange={e=>setTarget(e.target.value)} className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                <option value="all">All users</option>
                <option value="pro">Pro + Team</option>
                <option value="starter">Starter only</option>
              </select>
            </div>
          </div>
          <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Title</label><input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Announcement title…" className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-rose-500/40 transition-colors"/></div>
          <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Message</label><textarea value={body} onChange={e=>setBody(e.target.value)} rows={3} placeholder="Message to users…" className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none resize-none focus:border-rose-500/40 transition-colors"/></div>
          <button onClick={send} className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors"><Icon name="send" size={11}/>Send Broadcast</button>
        </div>
      </C>
      <C><CH title="Sent History"/>
        {sent.map(s=>(
          <div key={s.id} className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.03] last:border-0">
            <Badge s={s.type}/><div className="flex-1 min-w-0"><p className="text-[11px] font-bold text-slate-200">{s.title}</p><p className="text-[10px] text-slate-400">{s.body}</p></div><span className="text-[9px] text-slate-600 flex-shrink-0">{s.time}</span>
          </div>
        ))}
      </C>
    </div>
  );
};


export default AdminBroadcast;
