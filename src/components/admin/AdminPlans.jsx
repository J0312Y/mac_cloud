// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { C, CH } from "../ui/SharedUI.jsx";
import { SvgPie } from "../charts/index.jsx";
import { USERS, PLANS } from "../../data/index.js";

const AdminPlans = ({ addToast }) => {
  const [plans, setPlans] = useState(PLANS);
  const [showNew, setShowNew] = useState(false);
  const [newPlan, setNewPlan] = useState({ name:"", price:"", builds:"", macHours:"", certs:"", apiCalls:"", seats:"" });

  const upd = (id, field, val) =>
    setPlans(ps => ps.map(p => p.id === id ? { ...p, [field]: isNaN(val) || val==="" ? val : Number(val) } : p));

  const save = (p) => addToast(`${p.name} saved ✓`, "success");

  const del = (id) => {
    const p = plans.find(x => x.id === id);
    const userCount = USERS.filter(u => u.plan === p.name).length;
    if (userCount > 0) return addToast(`Cannot delete — ${userCount} active user(s) on this plan`, "error");
    setPlans(ps => ps.filter(x => x.id !== id));
    addToast(`${p.name} plan deleted`, "warn");
  };

  const create = () => {
    if (!newPlan.name || !newPlan.price) return addToast("Name and price are required", "error");
    const id = newPlan.name.toLowerCase().replace(/\s+/g, "-");
    if (plans.find(p => p.id === id)) return addToast("A plan with this name already exists", "error");
    setPlans(ps => [...ps, { id, ...newPlan, price:+newPlan.price, builds:+newPlan.builds||0, macHours:+newPlan.macHours||0, certs:+newPlan.certs||0, apiCalls:+newPlan.apiCalls||0, seats:+newPlan.seats||1 }]);
    setNewPlan({ name:"", price:"", builds:"", macHours:"", certs:"", apiCalls:"", seats:"" });
    setShowNew(false);
    addToast(`${newPlan.name} plan created`, "success");
  };

  const accentColors = ["border-slate-500/20","border-violet-500/20","border-amber-500/20","border-sky-500/20","border-rose-500/20","border-emerald-500/20"];
  const barColors    = ["bg-slate-500/50","bg-violet-500/50","bg-amber-500/50","bg-sky-500/50","bg-rose-500/50","bg-emerald-500/50"];

  const Field = ({ label, field, pid, val }) => (
    <div>
      <label className="text-[9px] text-slate-500 block mb-1">{label}</label>
      <input
        key={`${pid}-${field}`}
        defaultValue={val}
        onBlur={e => upd(pid, field, e.target.value)}
        className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-rose-500/40 transition-colors"
      />
    </div>
  );

  const NewField = ({ label, field, placeholder="" }) => (
    <div>
      <label className="text-[9px] text-slate-500 block mb-1">{label}</label>
      <input
        value={newPlan[field]}
        onChange={e => setNewPlan(n => ({ ...n, [field]: e.target.value }))}
        placeholder={placeholder}
        className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-violet-500/40 transition-colors"
      />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-500">{plans.length} plan{plans.length!==1?"s":""} active</p>
        <button onClick={() => setShowNew(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition-colors">
          <Icon name={showNew ? "x" : "plus"} size={11}/>{showNew ? "Cancel" : "New Plan"}
        </button>
      </div>

      {/* New plan form */}
      {showNew && (
        <C className="border border-violet-500/20">
          <CH title="Create New Plan"/>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <NewField label="Plan Name *"   field="name"      placeholder="Enterprise"/>
              <NewField label="Price ($/mo) *" field="price"    placeholder="299"/>
              <NewField label="Builds / mo"    field="builds"   placeholder="5000"/>
              <NewField label="Mac Hours"      field="macHours" placeholder="500"/>
              <NewField label="Certificates"   field="certs"    placeholder="50"/>
              <NewField label="API Calls"      field="apiCalls" placeholder="200000"/>
              <NewField label="Seats"          field="seats"    placeholder="25"/>
            </div>
            <button onClick={create}
              className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors">
              <Icon name="plus" size={12}/>Create Plan
            </button>
          </div>
        </C>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {plans.map((p, i) => {
          const userCount = USERS.filter(u => u.plan === p.name).length;
          return (
            <C key={p.id} className={`border ${accentColors[i % accentColors.length]}`}>
              <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-black text-slate-200 uppercase tracking-widest">{p.name}</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">${p.price}/mo · <span className={userCount>0?"text-emerald-400":"text-slate-600"}>{userCount} user{userCount!==1?"s":""}</span></p>
                </div>
                <button
                  onClick={() => del(p.id)}
                  title={userCount>0?"Cannot delete — users active":"Delete plan"}
                  className={`p-1.5 rounded-lg transition-colors ${userCount>0?"text-slate-700 cursor-not-allowed":"text-slate-600 hover:text-red-400 hover:bg-red-500/10"}`}>
                  <Icon name="trash" size={12}/>
                </button>
              </div>
              <div className="p-4 space-y-2">
                <Field label="Price ($/mo)" field="price"    pid={p.id} val={p.price}/>
                <Field label="Builds / mo"  field="builds"   pid={p.id} val={p.builds}/>
                <Field label="Mac Hours"    field="macHours" pid={p.id} val={p.macHours}/>
                <Field label="Certificates" field="certs"    pid={p.id} val={p.certs}/>
                <Field label="API Calls"    field="apiCalls" pid={p.id} val={p.apiCalls}/>
                <Field label="Seats"        field="seats"    pid={p.id} val={p.seats}/>
                <button onClick={() => save(p)}
                  className="w-full mt-1 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-white hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-1.5">
                  <Icon name="save" size={11}/>Save Changes
                </button>
              </div>
            </C>
          );
        })}
      </div>

      {/* Distribution chart */}
      <C><CH title="Plan Distribution"/>
        <div className="p-4 flex items-end gap-3" style={{height:112}}>
          {plans.map((p, i) => {
            const count = USERS.filter(u => u.plan === p.name).length;
            const maxC  = Math.max(...plans.map(x => USERS.filter(u => u.plan === x.name).length)) || 1;
            return (
              <div key={p.id} className="flex-1 flex flex-col items-center gap-1">
                <div className={`w-full ${barColors[i % barColors.length]} rounded-t transition-all`} style={{height:`${(count/maxC)*72}px`}}/>
                <span className="text-[9px] text-slate-400 truncate w-full text-center">{p.name}</span>
                <span className="text-[9px] font-black text-slate-300">{count}</span>
              </div>
            );
          })}
        </div>
      </C>
    </div>
  );
};


export default AdminPlans;
