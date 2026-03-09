// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";
import { TEAM_DATA } from "../../data/index.js";

const ClientTeam = ({ addToast }) => {
  const [team, setTeam] = useState(TEAM_DATA);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Developer");
  const invite = () => {
    if(!inviteEmail) return addToast("Enter email address","error");
    setTeam(t=>[...t,{id:`tm${Date.now()}`,name:inviteEmail.split("@")[0],email:inviteEmail,role:inviteRole,joined:new Date().toISOString().slice(0,10),lastSeen:"just now",av:inviteEmail[0].toUpperCase(),color:"from-slate-400 to-slate-600"}]);
    setInviteEmail(""); addToast(`Invite sent to ${inviteEmail}`,"success");
  };
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[["Team Size",`${team.length}/3 seats`,"text-violet-400"],["Owners",team.filter(m=>m.role==="Owner").length,"text-amber-400"],["Seats Left",`${3-team.length} remaining`,"text-slate-300"]].map(([l,v,c])=>(
          <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-xl px-4 py-3"><p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{l}</p><p className={`text-sm font-black ${c}`}>{v}</p></div>
        ))}
      </div>
      <C><CH title="Invite Member"/>
        <div className="p-4 flex gap-2 flex-wrap">
          <input value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="colleague@company.io" className="flex-1 min-w-0 bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-violet-500/40 transition-colors"/>
          <select value={inviteRole} onChange={e=>setInviteRole(e.target.value)} className="bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
            {["Developer","Viewer"].map(r=>(<option key={r} value={r}>{r}</option>))}
          </select>
          <button onClick={invite} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"><Icon name="userPlus" size={11}/>Invite</button>
        </div>
      </C>
      <div className="space-y-2">
        {team.map(m=>(
          <C key={m.id}><div className="px-4 py-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center flex-shrink-0 text-sm font-black text-white shadow-lg`}>{m.av}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-200">{m.name}</p>
              <p className="text-[9px] text-slate-500">{m.email} · last seen {m.lastSeen}</p>
            </div>
            <Badge s={m.role}/>
            {m.role!=="Owner"&&(
              <button onClick={()=>{setTeam(t=>t.filter(x=>x.id!==m.id));addToast(`${m.name} removed from team`,"warn");}} className="text-slate-600 hover:text-red-400 transition-colors ml-2"><Icon name="trash" size={12}/></button>
            )}
          </div></C>
        ))}
      </div>
    </div>
  );
};


export default ClientTeam;
