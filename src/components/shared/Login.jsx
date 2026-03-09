// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";

const Login = ({ onLogin }) => {
  const [role, setRole] = useState("client");
  const [loading, setLoading] = useState(false);
  const go = () => { setLoading(true); setTimeout(()=>onLogin(role),900); };
  return (
    <div className="min-h-screen bg-[#090710] flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-800/5 rounded-full blur-3xl"/>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-rose-800/5 rounded-full blur-3xl"/>
      </div>
      <div className="relative z-10 w-72 px-4">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-2xl shadow-violet-500/30"><Icon name="zap" size={22} className="text-white"/></div>
          <h1 className="text-xl font-black text-white">Mac Build Cloud</h1>
          <p className="text-xs text-slate-500 mt-0.5">iOS CI/CD Platform</p>
        </div>
        <div className="flex gap-1.5 mb-4 bg-black/30 border border-white/[0.07] rounded-xl p-1">
          {[["client","👤 User"],["admin","⚙ Admin"]].map(([r,l])=>(
            <button key={r} onClick={()=>setRole(r)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${role===r?(r==="admin"?"bg-rose-600/30 text-rose-300 border border-rose-500/30":"bg-violet-600/30 text-violet-300 border border-violet-500/30"):"text-slate-500 hover:text-slate-300"}`}>{l}</button>
          ))}
        </div>
        <div className="bg-[#12101e] border border-white/[0.07] rounded-2xl p-4 space-y-3 shadow-2xl">
          <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1">Email</label>
            <input key={role} defaultValue={role==="admin"?"admin@macbuild.cloud":"alex@company.io"} className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"/></div>
          <div><label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1">Password</label>
            <input type="password" defaultValue="password" className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"/></div>
          <button onClick={go} disabled={loading} className={`w-full flex items-center justify-center gap-2 py-2.5 text-white text-xs font-black rounded-lg transition-colors disabled:opacity-60 ${role==="admin"?"bg-rose-600 hover:bg-rose-500":"bg-violet-600 hover:bg-violet-500"}`}>
            {loading?<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:`Sign in as ${role==="admin"?"Admin":"User"}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
