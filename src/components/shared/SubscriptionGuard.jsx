// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import Icon from "../ui/Icon.jsx";
import api from "../../lib/api.js";

const DURATIONS = [
  { months: 1,  label: "1 mois",  discount: 0 },
  { months: 3,  label: "3 mois",  discount: 10 },
  { months: 12, label: "1 an",    discount: 20 },
];

/**
 * SubscriptionGuard — à placer en haut du layout du dashboard client.
 * Vérifie l'abonnement toutes les heures + au chargement.
 * Affiche un pop-up 3 jours avant expiration.
 * Déconnecte si expiré et refus de paiement.
 */
const SubscriptionGuard = ({ onLogout, addToast }) => {
  const [status,    setStatus]    = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [duration,  setDuration]  = useState(1);
  const [msisdn,    setMsisdn]    = useState("");
  const [paying,    setPaying]    = useState(false);
  const [payResult, setPayResult] = useState(null);

  const checkSubscription = useCallback(async () => {
    try {
      const s = await api.subscription.status();
      setStatus(s);

      // Afficher le pop-up si expiration dans 3 jours ou déjà expiré
      if (!s.active || s.expire_soon) {
        setShowModal(true);
      }
    } catch {
      // Silencieux — ne pas bloquer si l'API échoue
    }
  }, []);

  useEffect(() => {
    checkSubscription();
    // Vérifier toutes les heures
    const interval = setInterval(checkSubscription, 3600000);
    return () => clearInterval(interval);
  }, []);

  const doRenew = async () => {
    if (!msisdn.trim()) return addToast("Entrez votre numéro Airtel Money", "error");
    setPaying(true);
    setPayResult(null);
    try {
      const r = await api.subscription.renew(status?.plan || "pro", duration, msisdn.trim());
      setPayResult({ success: true, message: r.message, expires_at: r.expires_at });
      addToast(`✅ ${r.message}`, "success");
      await checkSubscription();
      // Fermer après 3 secondes si succès
      setTimeout(() => setShowModal(false), 3000);
    } catch (err) {
      const msg = err.data?.error || err.message || "Paiement échoué";
      setPayResult({ success: false, message: msg });
      addToast(`❌ ${msg}`, "error");
    } finally {
      setPaying(false);
    }
  };

  const handleDismiss = () => {
    if (!status?.active) {
      // Abonnement expiré — déconnecter
      addToast("Abonnement expiré. Vous avez été déconnecté.", "error");
      onLogout?.();
    } else {
      // Expire bientôt — peut fermer mais reviendra
      setShowModal(false);
    }
  };

  if (!showModal || !status) return null;

  const isExpired  = !status.active;
  const daysLeft   = status.days_left || 0;
  const planRow    = status.plan_details;
  const pricePerMo = parseInt(planRow?.price_mo || 0);

  const getAmount = (months) => {
    const disc = months === 12 ? 0.8 : months === 3 ? 0.9 : 1;
    return Math.round(pricePerMo * months * disc);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md bg-[#0e0c1a] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className={`px-6 py-4 flex items-center gap-3 ${isExpired ? "bg-red-950/40 border-b border-red-500/20" : "bg-amber-950/30 border-b border-amber-500/20"}`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isExpired ? "bg-red-500/20" : "bg-amber-500/20"}`}>
            <Icon name={isExpired ? "x" : "alertTri"} size={20} className={isExpired ? "text-red-400" : "text-amber-400"}/>
          </div>
          <div>
            <p className={`text-[13px] font-black ${isExpired ? "text-red-400" : "text-amber-400"}`}>
              {isExpired ? "Abonnement expiré" : `Abonnement expire dans ${daysLeft} jour${daysLeft > 1 ? "s" : ""}`}
            </p>
            <p className="text-[10px] text-slate-400">
              {isExpired
                ? "Renouvelez maintenant pour continuer à utiliser Mac Build Cloud"
                : "Renouvelez maintenant pour ne pas perdre l'accès"}
            </p>
          </div>
        </div>

        {payResult ? (
          /* Résultat */
          <div className="p-6">
            <div className={`rounded-xl p-4 mb-4 ${payResult.success ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon name={payResult.success ? "check" : "x"} size={14} className={payResult.success ? "text-emerald-400" : "text-red-400"}/>
                <p className={`text-[12px] font-bold ${payResult.success ? "text-emerald-400" : "text-red-400"}`}>
                  {payResult.success ? "Paiement réussi !" : "Paiement échoué"}
                </p>
              </div>
              <p className="text-[10px] text-slate-400">{payResult.message}</p>
              {payResult.expires_at && (
                <p className="text-[9px] text-slate-500 mt-1">
                  Nouveau terme : {new Date(payResult.expires_at).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" })}
                </p>
              )}
            </div>
            {!payResult.success && (
              <button onClick={() => setPayResult(null)}
                className="w-full py-2.5 accent-bg-dyn text-white text-[11px] font-bold rounded-xl">
                Réessayer
              </button>
            )}
          </div>
        ) : (
          /* Formulaire */
          <div className="p-6 space-y-4">

            {/* Durée */}
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Durée de renouvellement</p>
              <div className="grid grid-cols-3 gap-2">
                {DURATIONS.map(d => {
                  const amt = getAmount(d.months);
                  return (
                    <button key={d.months} onClick={() => setDuration(d.months)}
                      className={`p-3 rounded-xl border text-center transition-all ${duration === d.months ? "accent-bg20-dyn accent-bd-dyn" : "border-white/[0.07] bg-black/20 hover:border-white/20"}`}>
                      <p className="text-[11px] font-black text-slate-200">{d.label}</p>
                      <p className="text-[10px] font-bold accent-text-dyn mt-0.5">{amt} XAF</p>
                      {d.discount > 0 && (
                        <p className="text-[8px] text-emerald-400 font-bold">−{d.discount}%</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Numéro Airtel */}
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Numéro Airtel Money</p>
              <div className="flex items-center gap-2 bg-black/40 border border-white/[0.1] rounded-xl px-3 py-2.5 focus-within:border-[var(--ca)] transition-colors">
                <span className="text-[11px] text-slate-400 font-mono">+242</span>
                <div className="w-px h-4 bg-white/10"/>
                <input
                  value={msisdn}
                  onChange={e => setMsisdn(e.target.value.replace(/\D/g, ""))}
                  placeholder="05 XXX XX XX"
                  maxLength={9}
                  className="flex-1 bg-transparent text-[12px] text-slate-200 outline-none placeholder-slate-600 font-mono"
                />
              </div>
            </div>

            {/* Récapitulatif */}
            <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="text-[10px] text-slate-400">Plan {planRow?.name || status?.plan}</p>
                <p className="text-[9px] text-slate-600">{DURATIONS.find(d=>d.months===duration)?.label}</p>
              </div>
              <p className="text-[16px] font-black text-white">{getAmount(duration)} <span className="text-[11px] text-slate-400">XAF</span></p>
            </div>

            {/* Boutons */}
            <div className="flex gap-2">
              {!isExpired && (
                <button onClick={handleDismiss}
                  className="flex-1 py-2.5 bg-white/[0.05] text-slate-400 text-[11px] font-bold rounded-xl hover:text-slate-200 transition-colors">
                  Plus tard
                </button>
              )}
              <button onClick={doRenew} disabled={paying || !msisdn.trim()}
                className="flex-1 py-2.5 accent-bg-dyn text-white text-[11px] font-bold rounded-xl disabled:opacity-60 flex items-center justify-center gap-2">
                {paying ? (
                  <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Traitement…</>
                ) : (
                  <><Icon name="card" size={12}/>Payer {getAmount(duration)} XAF</>
                )}
              </button>
            </div>

            {isExpired && (
              <button onClick={handleDismiss}
                className="w-full text-center text-[9px] text-slate-600 hover:text-slate-400 transition-colors">
                Se déconnecter
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionGuard;
