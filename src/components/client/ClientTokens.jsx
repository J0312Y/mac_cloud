// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { C, CH } from "../ui/SharedUI.jsx";
import { TOKENS_DATA } from "../../data/index.js";

const ClientTokens = ({ addToast }) => {
  const [tokens, setTokens] = useState(TOKENS_DATA);
  const [revealed, setRevealed] = useState({});
  const [name, setName] = useState("");
  const copy = (t) => { navigator.clipboard?.writeText(t.token); addToast("Token copied to clipboard","success"); };
  const regen = (id) => { addToast("Token regenerated — old token revoked","warn"); };
  const create = () => {
    if(!name) return addToast("Enter token name","error");
    setTokens(ts=>[...ts,{id:`t${Date.now()}`,name,created:new Date().toISOString().slice(0,10),lastUsed:"never",scopes:["builds:read"]}]);
    setName(""); addToast("API token created","success");
  };
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <C><CH title="Create Token"/>
        <div className="p-4 flex gap-2">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Token name (e.g. CI Pipeline)" className="flex-1 bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-violet-500/40 transition-colors"/>
          <button onClick={create} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"><Icon name="plus" size={11}/>Create</button>
        </div>
      </C>
      <div className="space-y-2">
        {tokens.map(t=>(
          <C key={t.id}><div className="px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0"><Icon name="key" size={13} className="text-violet-400"/></div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-200">{t.name}</p>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5">{revealed[t.id]?"mbc_live_sk_Hj3kL9mN…":"mbc_live_sk_••••••••••••"}</p>
              <div className="flex gap-1 mt-1">{t.scopes.map(s=>(<span key={s} className="text-[8px] bg-violet-500/10 border border-violet-500/15 text-violet-400 px-1.5 py-0.5 rounded font-mono">{s}</span>))}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>setRevealed(r=>({...r,[t.id]:!r[t.id]}))} className="text-slate-600 hover:text-slate-300 transition-colors"><Icon name={revealed[t.id]?"eyeOff":"eye"} size={12}/></button>
              <button onClick={()=>copy(t)} className="text-slate-600 hover:text-violet-400 transition-colors"><Icon name="copy" size={12}/></button>
              <button onClick={()=>regen(t.id)} className="text-slate-600 hover:text-amber-400 transition-colors"><Icon name="refresh" size={12}/></button>
              <button onClick={()=>{setTokens(ts=>ts.filter(x=>x.id!==t.id));addToast("Token revoked","warn");}} className="text-slate-600 hover:text-red-400 transition-colors"><Icon name="trash" size={12}/></button>
            </div>
          </div></C>
        ))}
      </div>
    </div>
  );
};


export default ClientTokens;
