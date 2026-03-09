// @ts-nocheck
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";
import { INVOICES } from "../../data/index.js";

const ClientBilling = ({ addToast }) => (
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {[["Current Plan","Pro · $79/mo","text-violet-400"],["Next Billing","2026-04-01","text-slate-300"],["Total Paid","$316.00","text-emerald-400"]].map(([l,v,c])=>(
        <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-xl px-4 py-3"><p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{l}</p><p className={`text-sm font-black ${c}`}>{v}</p></div>
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <C><CH title="Payment Method"/>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 bg-black/20 border border-white/[0.06] rounded-lg px-4 py-3">
            <Icon name="card" size={16} className="text-slate-400"/>
            <div><p className="text-xs text-slate-200 font-semibold">Visa •••• 4242</p><p className="text-[10px] text-slate-500">Expires 12/2027</p></div>
            <button onClick={()=>{}} className="ml-auto text-[10px] text-violet-400 font-bold hover:text-violet-300">Change</button>
          </div>
          <button onClick={()=>{}} className="w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg transition-all">Upgrade to Team Plan →</button>
        </div>
      </C>
      <C><CH title="Invoice History"/>
        {INVOICES.map(inv=>(
          <div key={inv.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors">
            <div className="flex-1 min-w-0"><p className="text-[11px] font-semibold text-slate-200">{inv.period}</p><p className="text-[9px] text-slate-500">{inv.date} · {inv.id}</p></div>
            <span className="text-[11px] font-mono text-slate-300">${inv.amount}</span>
            <Badge s={inv.status}/>
            <button onClick={()=>{}} className="text-slate-600 hover:text-slate-200 transition-colors"><Icon name="download" size={11}/></button>
          </div>
        ))}
      </C>
    </div>
  </div>
);


export default ClientBilling;
