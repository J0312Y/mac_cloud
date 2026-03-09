// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";
import { PROFILES } from "../../data/index.js";

const ClientProfiles = ({ addToast }) => {
  const [profiles, setProfiles] = useState(PROFILES);
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-[10px] text-slate-500">{profiles.filter(p=>p.status==="active").length} active profiles</p>
        <button onClick={()=>addToast("Upload .mobileprovision file","info")} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-[10px] font-bold rounded-lg transition-colors"><Icon name="upload" size={11}/>Upload Profile</button>
      </div>
      <div className="space-y-2">
        {profiles.map(p=>(
          <C key={p.id} className={p.status==="expired"?"opacity-60":""}>
            <div className="px-4 py-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${p.status==="active"?"bg-violet-500/15":"bg-red-500/15"}`}><Icon name="package" size={14} className={p.status==="active"?"text-violet-400":"text-red-400"}/></div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-200 truncate">{p.name}</p>
                <p className="text-[9px] text-slate-500 font-mono">{p.appId} · {p.type}</p>
              </div>
              <div className="text-right flex-shrink-0 space-y-1">
                <Badge s={p.status}/>
                {p.devices>0&&<p className="text-[9px] text-slate-500">{p.devices} devices</p>}
                <p className="text-[9px] text-slate-500">{p.expires}</p>
              </div>
              <button onClick={()=>{setProfiles(ps=>ps.filter(x=>x.id!==p.id));addToast("Profile deleted","success");}} className="text-slate-700 hover:text-red-400 transition-colors ml-2"><Icon name="trash" size={12}/></button>
            </div>
          </C>
        ))}
      </div>
    </div>
  );
};


export default ClientProfiles;
