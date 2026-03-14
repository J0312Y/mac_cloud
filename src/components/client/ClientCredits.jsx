// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import Icon from "../ui/Icon.jsx";
import { C, CH } from "../ui/SharedUI.jsx";
import { useSocket } from "../../hooks/useSocket.js";

const API = import.meta.env.VITE_API_URL || "http://213.156.133.182:3001/api";
const tok = () => localStorage.getItem("mbc_token");
const authH = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${tok()}` });

const fmt = (s) => {
  if (!s) return "0h00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h${m.toString().padStart(2, "0")}`;
};

const ClientCredits = ({ addToast }) => {
  const [credits, setCredits] = useState(null);
  const [packs,   setPacks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected,setSelected]= useState(null);
  const [msisdn,  setMsisdn]  = useState("");
  const [paying,  setPaying]  = useState(false);
  const [result,  setResult]  = useState(null);
  const { on, off } = useSocket();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cr, pk] = await Promise.all([
        fetch(`${API}/credits`,       { headers: authH() }).then(r => r.json()),
        fetch(`${API}/credits/packs`, { headers: authH() }).then(r => r.json()),
      ]);
      setCredits(cr);
      setPacks(pk.packs || []);
    } catch { addToast("Erreur chargement crédits", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const onConfirmed = (data) => {
      addToast(`✅ ${data.pack_name} activé — +${data.added_display} crédits !`, "success");
      setCredits(c => c ? { ...c, credits_seconds: data.total_seconds, credits_display: data.total_display } : c);
    };
    const onLow = (data) => {
      addToast(`⚠️ Crédits faibles — ${data.remaining_display} restant`, "warn");
    };
    const onExhausted = () => {
      addToast("❌ Crédits épuisés — build arrêté", "error");
      load();
    };
    on("credits_confirmed", onConfirmed);
    on("credits_low",       onLow);
    on("credits_exhausted", onExhausted);
    return () => {
      off("credits_confirmed", onConfirmed);
      off("credits_low",       onLow);
      off("credits_exhausted", onExhausted);
    };
  }, []);

  const buy = async () => {
    if (!selected) return addToast("Sélectionnez un pack", "error");
    if (!msisdn.trim()) return addToast("Entrez votre numéro Airtel Money", "error");
    setPaying(true);
    setResult(null);
    try {
      const r = await fetch(`${API}/credits/buy`, {
        method: "POST", headers: authH(),
        body: JSON.stringify({ pack_id: selected.id, msisdn: msisdn.trim() }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setResult({ ok: true, msg: d.message });
      setMsisdn("");
      setSelected(null);
    } catch (e) {
      setResult({ ok: false, msg: e.message });
    } finally {
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"/>
    </div>
  );

  const isSubscribed = credits?.plan && credits.plan !== "starter";

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-2xl">

      {/* Solde actuel */}
      <C className="border accent-border">
        <div className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl accent-bg-dyn flex items-center justify-center">
            <Icon name="clock" size={22} className="text-white"/>
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Crédits disponibles</p>
            <p className="text-3xl font-black text-white">{credits?.credits_display ?? "0h00"}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{credits?.credits_seconds ?? 0} secondes</p>
          </div>
          {credits?.credits_seconds > 0 && credits?.credits_seconds <= 900 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <Icon name="alert-triangle" size={12} className="text-amber-400"/>
              <span className="text-[10px] text-amber-400 font-bold">Crédits faibles</span>
            </div>
          )}
        </div>
      </C>

      {/* Message si abonnement actif */}
      {isSubscribed ? (
        <C className="border border-sky-500/20">
          <div className="p-5 flex items-center gap-3">
            <Icon name="info" size={16} className="text-sky-400 shrink-0"/>
            <p className="text-xs text-slate-400">
              Vous avez un abonnement <span className="text-white font-bold">{credits.plan}</span> actif.
              Les crédits horaires sont réservés aux comptes sans abonnement mensuel.
            </p>
          </div>
        </C>
      ) : (
        <>
          {/* Packs */}
          <C>
            <CH title="Recharger des crédits" subtitle="Packs disponibles — paiement via Airtel Money"/>
            <div className="p-4 grid grid-cols-2 gap-3">
              {packs.map(p => (
                <button key={p.id}
                  onClick={() => setSelected(selected?.id === p.id ? null : p)}
                  className={`relative p-4 rounded-xl border text-left transition-all ${
                    selected?.id === p.id
                      ? "accent-border accent-bg-dyn/10 ring-1 ring-[var(--ca)]"
                      : "border-white/[0.07] bg-white/[0.03] hover:bg-white/[0.06]"
                  }`}>
                  {p.popular ? (
                    <span className="absolute -top-2 left-3 text-[9px] font-bold px-2 py-0.5 accent-bg-dyn text-white rounded-full">
                      Populaire
                    </span>
                  ) : null}
                  <p className="text-lg font-black text-white">{p.hours}h</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{p.name}</p>
                  <p className="text-sm font-bold accent-text-dyn mt-2">
                    {p.price.toLocaleString()} {p.currency}
                  </p>
                  <p className="text-[9px] text-slate-600 mt-0.5">
                    {Math.round(p.price / p.hours).toLocaleString()} {p.currency}/h
                  </p>
                  {selected?.id === p.id && (
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full accent-bg-dyn flex items-center justify-center">
                      <Icon name="check" size={9} className="text-white"/>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Formulaire paiement */}
            {selected && (
              <div className="px-4 pb-4 space-y-3">
                <div className="h-px bg-white/[0.05]"/>
                <p className="text-[10px] text-slate-400">
                  Pack sélectionné : <span className="text-white font-bold">{selected.name}</span> —{" "}
                  <span className="accent-text-dyn font-bold">{selected.price.toLocaleString()} {selected.currency}</span>
                </p>
                <div>
                  <label className="text-[9px] text-slate-500 block mb-1">Numéro Airtel Money</label>
                  <input value={msisdn} onChange={e => setMsisdn(e.target.value)}
                    placeholder="050489037" type="tel"
                    className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-slate-300 outline-none focus:border-[var(--ca)] transition-colors"/>
                </div>

                {result && (
                  <div className={`flex items-start gap-2 p-3 rounded-lg text-xs ${
                    result.ok ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                              : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}>
                    <Icon name={result.ok ? "check-circle" : "x-circle"} size={13} className="mt-0.5 shrink-0"/>
                    {result.msg}
                  </div>
                )}

                <button onClick={buy} disabled={paying}
                  className="w-full py-2.5 accent-bg-dyn text-white text-xs font-bold rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity">
                  {paying
                    ? <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Traitement…</>
                    : <><Icon name="credit-card" size={13}/>Payer {selected.price.toLocaleString()} {selected.currency}</>
                  }
                </button>
                <p className="text-[9px] text-slate-600 text-center">
                  Les crédits seront activés après confirmation de l'administrateur
                </p>
              </div>
            )}
          </C>
        </>
      )}
    </div>
  );
};

export default ClientCredits;
