// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import Icon from "../ui/Icon.jsx";
import { C, CH } from "../ui/SharedUI.jsx";

const API = "http://213.156.133.182:3001/api";
const tok = () => localStorage.getItem("mbc_token");

const AdminBillingPending = ({ addToast }) => {
  const [invoices, setInvoices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [acting,   setActing]   = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/billing/pending`, {
        headers: { Authorization: `Bearer ${tok()}` }
      });
      const d = await r.json();
      setInvoices(d.invoices || []);
    } catch { addToast("Erreur chargement", "error"); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, []);

  const confirm = async (id) => {
    setActing(a => ({ ...a, [id]: "confirming" }));
    try {
      const r = await fetch(`${API}/admin/billing/confirm/${id}`, {
        method: "PATCH", headers: { Authorization: `Bearer ${tok()}` }
      });
      if (!r.ok) throw new Error((await r.json()).error);
      addToast("✅ Paiement confirmé — plan activé", "success");
      setInvoices(iv => iv.filter(i => i.id !== id));
    } catch (e) { addToast(`❌ ${e.message}`, "error"); }
    finally     { setActing(a => ({ ...a, [id]: null })); }
  };

  const reject = async (id) => {
    setActing(a => ({ ...a, [id]: "rejecting" }));
    try {
      const r = await fetch(`${API}/admin/billing/reject/${id}`, {
        method: "PATCH", headers: { Authorization: `Bearer ${tok()}` }
      });
      if (!r.ok) throw new Error((await r.json()).error);
      addToast("Paiement rejeté", "warn");
      setInvoices(iv => iv.filter(i => i.id !== id));
    } catch (e) { addToast(`❌ ${e.message}`, "error"); }
    finally     { setActing(a => ({ ...a, [id]: null })); }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-black text-white uppercase tracking-widest">Paiements en attente</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Confirmez manuellement les paiements Airtel Money</p>
        </div>
        <div className="flex items-center gap-2">
          {invoices.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full animate-pulse">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400"/>
              <span className="text-[9px] text-amber-400 font-bold">{invoices.length} en attente</span>
            </div>
          )}
          <button onClick={load} className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors">
            <Icon name="refresh" size={13} className="text-slate-500"/>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"/>
        </div>
      ) : invoices.length === 0 ? (
        <C>
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Icon name="check" size={20} className="text-emerald-400"/>
            </div>
            <p className="text-[12px] text-slate-400 font-semibold">Aucun paiement en attente</p>
            <p className="text-[10px] text-slate-600">Tous les paiements ont été traités</p>
          </div>
        </C>
      ) : (
        <div className="space-y-3">
          {invoices.map(inv => (
            <C key={inv.id} className="border border-amber-500/15">
              <div className="p-4 flex items-start gap-4">
                {/* Icône */}
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="card" size={16} className="text-amber-400"/>
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[12px] font-black text-white">{inv.user_name}</p>
                    <span className="text-[9px] text-slate-500">{inv.user_email}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[10px] text-slate-400">
                    <span>Plan : <strong className="text-slate-200 capitalize">{inv.plan}</strong></span>
                    <span>Montant : <strong className="text-amber-400">{inv.amount} {inv.currency || "XAF"}</strong></span>
                    <span>Numéro : <strong className="text-slate-200 font-mono">{inv.msisdn}</strong></span>
                    <span>Cycle : <strong className="text-slate-200">{inv.billing_cycle}</strong></span>
                  </div>
                  {inv.transaction_id && (
                    <p className="text-[9px] text-slate-600 font-mono mt-1">TXN: {inv.transaction_id}</p>
                  )}
                  <p className="text-[9px] text-slate-600 mt-0.5">
                    {new Date(inv.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => confirm(inv.id)}
                    disabled={!!acting[inv.id]}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold rounded-lg hover:bg-emerald-500/25 transition-colors disabled:opacity-50">
                    {acting[inv.id] === "confirming"
                      ? <span className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"/>
                      : <Icon name="check" size={11}/>
                    }
                    Confirmer
                  </button>
                  <button
                    onClick={() => reject(inv.id)}
                    disabled={!!acting[inv.id]}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50">
                    {acting[inv.id] === "rejecting"
                      ? <span className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"/>
                      : <Icon name="x" size={11}/>
                    }
                    Rejeter
                  </button>
                </div>
              </div>
            </C>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBillingPending;
