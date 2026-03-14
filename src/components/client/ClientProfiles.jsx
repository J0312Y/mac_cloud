// @ts-nocheck
import { useState, useEffect } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";
import api from "../../lib/api.js";
import { useApp } from "../../i18n/AppContext.jsx";

const ClientProfiles = ({ addToast }) => {
  const { t } = useApp();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showAdd, setShowAdd]   = useState(false);
  const [form, setForm]         = useState({ name:"", bundle_id:"*", type:"AppStore", expires_at:"" });
  const [adding, setAdding]     = useState(false);

  const load = async () => {
    try { const r = await api.profiles.list(); setProfiles(r.profiles||[]); }
    catch { addToast("Failed to load profiles","error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const daysLeft = (exp) => Math.ceil((new Date(exp) - new Date()) / (1000*86400));

  const add = async () => {
    if (!form.name || !form.expires_at) return addToast("Name and expiry required","error");
    setAdding(true);
    try {
      await api.profiles.create(form);
      setForm({ name:"", bundle_id:"*", type:"AppStore", expires_at:"" });
      setShowAdd(false);
      addToast("Profile added","success");
      load();
    } catch(err) { addToast(err.message||"Failed to add","error"); }
    finally { setAdding(false); }
  };

  const remove = async (id) => {
    try { await api.profiles.remove(id); addToast("Profile removed","warn"); load(); }
    catch { addToast("Failed to remove","error"); }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-500">{profiles.filter(p=>p.status==="active").length} active · {profiles.length}/10 slots</p>
        <button onClick={()=>setShowAdd(v=>!v)}
          className="flex items-center gap-1.5 px-3 py-1.5 btn-accent text-white text-[10px] font-bold rounded-lg transition-colors">
          <Icon name="plus" size={11}/>Add Profile
        </button>
      </div>

      {showAdd && (
        <C><CH title="Add Provisioning Profile"/>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Name</label>
                <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="MyApp AppStore"
                  className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:accent-border"/>
              </div>
              <div>
                <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Type</label>
                <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}
                  className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                  {["AppStore","AdHoc","Development","Enterprise"].map(t=>(<option key={t}>{t}</option>))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Bundle ID</label>
              <input value={form.bundle_id} onChange={e=>setForm(f=>({...f,bundle_id:e.target.value}))} placeholder="com.company.app"
                className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:accent-border"/>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Expiry Date</label>
              <input type="date" value={form.expires_at} onChange={e=>setForm(f=>({...f,expires_at:e.target.value}))}
                className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:accent-border"/>
            </div>
            <div className="flex gap-2">
              <button onClick={add} disabled={adding}
                className="px-4 py-2 btn-accent text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1.5">
                {adding && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}Add
              </button>
              <button onClick={()=>setShowAdd(false)} className="px-4 py-2 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-xs font-bold rounded-lg hover:text-slate-200">{t("common.cancel")}</button>
            </div>
          </div>
        </C>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="w-5 h-5 border-2 accent-border border-t-cyan-500 rounded-full animate-spin"/>
        </div>
      ) : profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Icon name="fileText" size={24} className="text-slate-700"/>
          <p className="text-[11px] text-slate-500">No provisioning profiles yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {profiles.map(p=>{
            const days = daysLeft(p.expires_at);
            return (
              <C key={p.id}>
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/15 flex items-center justify-center flex-shrink-0">
                    <Icon name="fileText" size={14} className="text-sky-400"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-200 truncate">{p.name}</p>
                    <p className="text-[9px] text-slate-500 font-mono">{p.bundle_id} · {p.type}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge s={p.status}/>
                    <p className={`text-[9px] mt-1 font-mono ${days<0?"text-red-400":days<60?"text-amber-400":"text-slate-500"}`}>
                      {days<0?"Expired":`${days}d left`}
                    </p>
                  </div>
                  <button onClick={()=>remove(p.id)} className="text-slate-600 hover:text-red-400 transition-colors ml-2">
                    <Icon name="trash" size={12}/>
                  </button>
                </div>
              </C>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientProfiles;
