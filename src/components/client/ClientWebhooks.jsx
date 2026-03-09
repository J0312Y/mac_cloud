// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";
import { WEBHOOKS_DATA } from "../../data/index.js";

const ClientWebhooks = ({ addToast }) => {
  const [webhooks, setWebhooks] = useState(WEBHOOKS_DATA);
  const [url, setUrl] = useState("");
  const test = (w) => { addToast(`Testing ${w.url.slice(0,30)}…`,"info"); setTimeout(()=>addToast("Webhook responded 200 OK ✓","success"),1200); };
  const add = () => {
    if(!url) return addToast("Enter a URL","error");
    setWebhooks(ws=>[...ws,{id:`w${Date.now()}`,url,events:["build.success","build.failed"],status:"active",lastSent:"never"}]);
    setUrl(""); addToast("Webhook added","success");
  };
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <C><CH title="Add Webhook"/>
        <div className="p-4 flex gap-2">
          <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://your-server.com/webhook" className="flex-1 bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-violet-500/40 transition-colors"/>
          <button onClick={add} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"><Icon name="plus" size={11}/>Add</button>
        </div>
      </C>
      <div className="space-y-2">
        {webhooks.map(w=>(
          <C key={w.id}>
            <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${w.status==="active"?"bg-emerald-400":"bg-slate-600"}`}/>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-mono text-slate-300 truncate">{w.url}</p>
                <p className="text-[9px] text-slate-500 mt-0.5">{w.events.join(" · ")} · last: {w.lastSent}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>test(w)} className="px-2.5 py-1 bg-violet-600/20 border border-violet-500/20 text-violet-400 text-[10px] font-bold rounded-lg hover:bg-violet-600/30 transition-colors">Test</button>
                <button onClick={()=>{setWebhooks(ws=>ws.filter(x=>x.id!==w.id));addToast("Webhook removed","success");}} className="text-slate-600 hover:text-red-400 transition-colors"><Icon name="trash" size={12}/></button>
              </div>
            </div>
          </C>
        ))}
      </div>
    </div>
  );
};


export default ClientWebhooks;
