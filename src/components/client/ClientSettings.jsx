// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { C, CH, Toggle } from "../ui/SharedUI.jsx";

const ClientSettings = ({ addToast }) => {
  const [tfa, setTfa] = useState(false);
  const [notifToggles, setNotifToggles] = useState({emailSuccess:true,emailFail:true,emailCert:true,slack:false});
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-lg">
      <C><CH title="Profile"/>
        <div className="p-4 space-y-3">
          {[["Full Name","Alex Martin","text"],["Email","alex@company.io","email"],["Password","••••••••","password"]].map(([l,v,t])=>(
            <div key={l}><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">{l}</label><input type={t} defaultValue={v} className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-violet-500/40 transition-colors"/></div>
          ))}
          <button onClick={()=>addToast("Profile saved ✓","success")} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors">Save Changes</button>
        </div>
      </C>
      <C><CH title="Two-Factor Authentication"/>
        <div className="p-4">
          <div className="flex items-center justify-between py-1">
            <div><p className="text-xs text-slate-300 font-semibold">Authenticator App (TOTP)</p><p className="text-[10px] text-slate-500">Require 2FA on every login</p></div>
            <Toggle on={tfa} onChange={(v)=>{setTfa(v);addToast(v?"2FA enabled":"2FA disabled",v?"success":"warn");}}/>
          </div>
          {tfa&&<div className="mt-3 bg-violet-950/30 border border-violet-500/20 rounded-lg p-3"><p className="text-[10px] text-violet-300">Scan QR code with your authenticator app (Google Authenticator, Authy, etc.)</p><div className="w-20 h-20 bg-white/5 border border-white/10 rounded-lg mt-2 flex items-center justify-center"><span className="text-[9px] text-slate-500">QR code</span></div></div>}
        </div>
      </C>
      <C><CH title="Notifications"/>
        <div className="p-4 space-y-2">
          {[["emailSuccess","Email on build success"],["emailFail","Email on build failure"],["emailCert","Certificate expiry alerts"],["slack","Slack notifications"]].map(([k,l])=>(
            <label key={k} className="flex items-center justify-between py-1.5 cursor-pointer">
              <span className="text-xs text-slate-300">{l}</span>
              <Toggle on={notifToggles[k]} onChange={v=>setNotifToggles(n=>({...n,[k]:v}))}/>
            </label>
          ))}
        </div>
      </C>
      <C><CH title="Danger Zone"/>
        <div className="p-4 space-y-2">
          <button onClick={()=>addToast("Export started — email will be sent","info")} className="w-full py-2 bg-white/[0.04] border border-white/[0.07] text-slate-300 text-xs font-semibold rounded-lg hover:bg-white/[0.07] transition-colors">Export All Build Data</button>
          <button onClick={()=>addToast("Contact support to delete your account","warn")} className="w-full py-2 bg-red-900/20 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-900/30 transition-colors">Delete Account</button>
        </div>
      </C>
    </div>
  );
};


export default ClientSettings;
