// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";
import api from "../../lib/api.js";
import { useApp } from "../../i18n/AppContext.jsx";

const PLAN_COLORS = { starter:"text-slate-300", pro:"accent-text-dyn", team:"text-amber-400" };

const ClientBilling = ({ addToast, onPlanChange }) => {
  const { t } = useApp();
  const [info,        setInfo]       = useState(null);
  const [plans,       setPlans]      = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [billing,     setBilling]    = useState("monthly");
  const [confirm,     setConfirm]    = useState(null);
  const [payModal,    setPayModal]   = useState(null);
  const [msisdn,      setMsisdn]     = useState("");
  const [paying,      setPaying]     = useState(false);
  const [payResult,   setPayResult]  = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://213.156.133.182:3001/api';
      const [billingRes, plansRes] = await Promise.all([
        api.billing.info(),
        fetch(`${apiUrl}/public/plans`).then(r => r.json()).catch(() => ({ plans: [] })),
      ]);
      setInfo(billingRes);
      if (billingRes.billing_cycle) setBilling(billingRes.billing_cycle);
      if (plansRes?.plans?.length) setPlans(plansRes.plans);
    } catch {
      addToast("Impossible de charger la facturation", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  // Downgrade gratuit (vers starter) — pas de paiement
  const doDowngrade = async (planId) => {
    setConfirm(null);
    try {
      await api.billing.changePlan(planId, billing);
      addToast(`Plan changé → ${planId} ✓`, "success");
      await load();
      onPlanChange?.();
    } catch (err) {
      addToast(err.message || "Erreur", "error");
    }
  };

  // Upgrade payant → ouvrir modal Airtel Money
  const openPayModal = (plan) => {
    setConfirm(null);
    setPayResult(null);
    setMsisdn("");
    setPayModal(plan);
  };

  const doPayment = async () => {
    if (!msisdn.trim()) return addToast("Entrez votre numéro Airtel Money", "error");
    setPaying(true);
    setPayResult(null);
    try {
      const r = await api.billing.checkout(payModal.id, billing, msisdn.trim());
      setPayResult({ success: true, message: r.message, amount: r.amount, invoice_id: r.invoice_id });
      addToast(`✅ ${r.message}`, "success");
      await load();
      onPlanChange?.();
    } catch (err) {
      const msg = err.data?.error || err.message || "Paiement échoué";
      setPayResult({ success: false, message: msg });
      addToast(`❌ ${msg}`, "error");
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="w-6 h-6 border-2 accent-bd-dyn border-t-[var(--ca)] rounded-full animate-spin"/>
    </div>
  );

  const currentPlanId = info?.user?.plan || "starter";
  const currentPlan   = plans.find(p => p.id === currentPlanId) || plans[0] || { name:'Starter', price_mo:0, price_yr:0, builds:50, id:'starter' };
  const invoices      = info?.invoices || [];
  const totalSpent    = info?.totalSpent || 0;

  const price = (p) => billing === "yearly" ? (p.price_yr || 0) : (p.price_mo || 0);
  const features = (p) => Array.isArray(p.features) ? p.features : [];

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Plan actuel",   `${currentPlan.name} · ${price(currentPlan) === 0 ? "Gratuit" : `${price(currentPlan)} XAF/mo`}`, "accent-text-dyn"],
          ["Builds inclus", `${currentPlan.builds}/mois`, "text-slate-300"],
          ["Total payé",    `${totalSpent.toFixed(0)} XAF`, "text-emerald-400"],
        ].map(([l, v, c]) => (
          <div key={l} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{l}</p>
            <p className={`text-sm font-black ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      {/* Billing cycle toggle */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-500">Facturation :</span>
        {["monthly","yearly"].map(cycle => (
          <button key={cycle} onClick={() => setBilling(cycle)}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${billing === cycle ? "accent-bg-dyn text-white" : "bg-white/[0.05] text-slate-400 hover:text-slate-200"}`}>
            {cycle === "monthly" ? "Mensuelle" : "Annuelle −20%"}
          </button>
        ))}
      </div>

      {/* Plan cards */}
      <C><CH title="Choisir un plan"/>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {plans.map(p => {
            const isCurrent = p.id === currentPlanId;
            const isUpgrade = price(p) > price(currentPlan);
            const isFree    = price(p) === 0;
            const color     = PLAN_COLORS[p.id] || "text-slate-300";
            return (
              <div key={p.id} className={`relative border rounded-xl p-4 transition-all ${
                isCurrent ? "accent-bg20-dyn accent-bd-dyn" : "border-white/[0.06] bg-black/20 hover:border-white/[0.12]"
              }`}>
                {p.id === "pro" && !isCurrent && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] font-black px-2 py-0.5 rounded-full accent-bg-dyn text-white">
                    POPULAIRE
                  </span>
                )}
                <div className="flex items-start justify-between mb-2">
                  <p className={`text-sm font-black ${color}`}>{p.name}</p>
                  {isCurrent && (
                    <span className="text-[8px] accent-text-dyn accent-bg20-dyn border accent-bd-dyn px-1.5 py-0.5 rounded-full font-black">Actuel</span>
                  )}
                </div>
                <p className="text-2xl font-black text-white">
                  {isFree ? "Gratuit" : `${price(p)} XAF`}
                  {!isFree && <span className="text-[10px] text-slate-500 font-normal">/mo</span>}
                </p>
                <div className="mt-3 space-y-1.5 mb-4">
                  {features(p).map(f => (
                    <div key={f} className="flex items-center gap-1.5">
                      <Icon name="check" size={9} className="text-emerald-400 flex-shrink-0"/>
                      <p className="text-[10px] text-slate-400">{f}</p>
                    </div>
                  ))}
                </div>
                {isCurrent ? (
                  <div className="w-full py-2 text-center text-[10px] font-bold accent-text-dyn accent-bg20-dyn rounded-lg border accent-bd-dyn">
                    Plan actuel
                  </div>
                ) : (
                  <button onClick={() => setConfirm(p)}
                    className="w-full py-2 text-[10px] font-bold text-white accent-bg-dyn rounded-lg transition-all flex items-center justify-center gap-1.5">
                    {isUpgrade ? "⬆ Upgrade" : "⬇ Downgrade"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </C>

      {/* Invoices */}
      <C><CH title="Historique des paiements"/>
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <Icon name="fileText" size={24} className="text-slate-700"/>
            <p className="text-[11px] text-slate-500">Aucun paiement pour l'instant</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.03]">
            {invoices.map(inv => (
              <div key={inv.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{background: inv.status === 'paid' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}}>
                  <Icon name={inv.status === 'paid' ? 'check' : 'x'} size={11}
                    className={inv.status === 'paid' ? 'text-emerald-400' : 'text-red-400'}/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-200 capitalize">{inv.plan} Plan · {inv.period}</p>
                  <p className="text-[9px] text-slate-500 font-mono">{inv.msisdn} · #{inv.id?.slice(0,12)}</p>
                </div>
                <span className="text-[11px] font-mono font-bold text-slate-300">{inv.amount} XAF</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                  inv.status === 'paid' ? 'bg-emerald-500/15 text-emerald-400' :
                  inv.status === 'failed' ? 'bg-red-500/15 text-red-400' :
                  'bg-amber-500/15 text-amber-400'
                }`}>{inv.status}</span>
              </div>
            ))}
          </div>
        )}
      </C>

      {/* Confirm modal */}
      {confirm && (
        <div className="fixed inset-0 z-[800] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
             onClick={() => setConfirm(null)}>
          <div className="bg-[#1a1728] border border-white/[0.1] rounded-2xl w-full max-w-sm p-6 shadow-2xl"
               onClick={e => e.stopPropagation()}>
            <p className="text-[13px] font-black text-white mb-2">
              {price(confirm) > price(currentPlan) ? "Upgrade" : "Downgrade"} vers {confirm.name} ?
            </p>
            <p className="text-[11px] text-slate-400 mb-5">
              {price(confirm) === 0
                ? `Vous passerez au plan gratuit. Certaines fonctionnalités seront désactivées.`
                : price(confirm) > price(currentPlan)
                ? `Un paiement de ${price(confirm)} XAF sera initié via Airtel Money.`
                : `Vous passerez au plan ${confirm.name}. Certaines fonctionnalités seront limitées.`
              }
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirm(null)}
                className="flex-1 py-2.5 bg-white/[0.05] text-slate-400 text-[11px] font-bold rounded-xl hover:text-slate-200 transition-colors">
                Annuler
              </button>
              <button onClick={() => price(confirm) > 0 ? openPayModal(confirm) : doDowngrade(confirm.id)}
                className="flex-1 py-2.5 accent-bg-dyn text-white text-[11px] font-bold rounded-xl transition-colors">
                {price(confirm) > 0 ? "Payer maintenant" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Airtel Money payment modal */}
      {payModal && (
        <div className="fixed inset-0 z-[900] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a1728] border border-white/[0.1] rounded-2xl w-full max-w-sm p-6 shadow-2xl">

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{background:"linear-gradient(135deg,#e8001a,#ff4d4d)"}}>
                <Icon name="card" size={18} className="text-white"/>
              </div>
              <div>
                <p className="text-[13px] font-black text-white">Paiement Airtel Money</p>
                <p className="text-[10px] text-slate-400">Plan {payModal.name} · {price(payModal)} XAF/{billing === "yearly" ? "an" : "mois"}</p>
              </div>
            </div>

            {payResult ? (
              /* Résultat paiement */
              <div className={`rounded-xl p-4 mb-4 ${payResult.success ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={payResult.success ? "check" : "x"} size={14} className={payResult.success ? "text-emerald-400" : "text-red-400"}/>
                  <p className={`text-[12px] font-bold ${payResult.success ? "text-emerald-400" : "text-red-400"}`}>
                    {payResult.success ? "Paiement réussi !" : "Paiement échoué"}
                  </p>
                </div>
                <p className="text-[10px] text-slate-400">{payResult.message}</p>
                {payResult.invoice_id && (
                  <p className="text-[9px] text-slate-500 font-mono mt-1">Réf: #{payResult.invoice_id}</p>
                )}
              </div>
            ) : (
              /* Formulaire */
              <div className="space-y-3 mb-5">
                <div>
                  <label className="text-[10px] text-slate-400 font-bold mb-1.5 block">
                    Numéro Airtel Money
                  </label>
                  <div className="flex items-center gap-2 bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2.5 focus-within:border-[var(--ca)] transition-colors">
                    <span className="text-[11px] text-slate-400 font-mono">+242</span>
                    <div className="w-px h-4 bg-white/10"/>
                    <input
                      value={msisdn}
                      onChange={e => setMsisdn(e.target.value.replace(/\D/g,''))}
                      placeholder="05 XXX XX XX"
                      maxLength={9}
                      className="flex-1 bg-transparent text-[12px] text-slate-200 outline-none placeholder-slate-600 font-mono"
                    />
                  </div>
                  <p className="text-[9px] text-slate-600 mt-1">Une demande de confirmation sera envoyée sur ce numéro</p>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-500">Plan</span>
                    <span className="text-[10px] text-slate-300 font-bold">{payModal.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-slate-500">Période</span>
                    <span className="text-[10px] text-slate-300">{billing === "yearly" ? "Annuelle" : "Mensuelle"}</span>
                  </div>
                  <div className="border-t border-white/[0.05] pt-1.5 flex justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">Total</span>
                    <span className="text-[12px] text-white font-black">{price(payModal)} XAF</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => { setPayModal(null); setPayResult(null); }}
                className="flex-1 py-2.5 bg-white/[0.05] text-slate-400 text-[11px] font-bold rounded-xl hover:text-slate-200 transition-colors">
                {payResult?.success ? "Fermer" : "Annuler"}
              </button>
              {!payResult && (
                <button onClick={doPayment} disabled={paying || !msisdn.trim()}
                  className="flex-1 py-2.5 text-white text-[11px] font-bold rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{background:"linear-gradient(135deg,#e8001a,#ff4d4d)"}}>
                  {paying ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                      Traitement…
                    </>
                  ) : (
                    <>
                      <Icon name="card" size={12}/>
                      Payer {price(payModal)} XAF
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Note simulation */}
            <p className="text-center text-[8px] text-slate-700 mt-3">
              🔧 Mode simulation — aucun vrai débit effectué
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientBilling;
