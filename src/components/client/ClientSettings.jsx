// @ts-nocheck
import { useState, useEffect } from "react";
import Icon from "../ui/Icon.jsx";
import { C, CH, Toggle } from "../ui/SharedUI.jsx";
import api from "../../lib/api.js";
import { useApp } from "../../i18n/AppContext.jsx";

const ClientSettings = ({ addToast }) => {
  const { t, lang, setLang, theme, setTheme, mode, setMode, th, THEMES } = useApp();

  const [name,          setName]          = useState("");
  const [email,         setEmail]         = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [curPw,         setCurPw]         = useState("");
  const [newPw,         setNewPw]         = useState("");
  const [confPw,        setConfPw]        = useState("");
  const [savingPw,      setSavingPw]      = useState(false);
  const [tfa,           setTfa]           = useState(false);
  const [notifs,        setNotifs]        = useState({ emailSuccess:true, emailFail:true, emailCert:true, slack:false });

  useEffect(() => {
    api.auth.me().then(r => {
      setName(r.user?.name || "");
      setEmail(r.user?.email || "");
    }).catch(() => {});
  }, []);

  const saveProfile = async () => {
    if (!name) return addToast(t("settings.fullName") + "requis", "error");
    setSavingProfile(true);
    try { await api.user.updateProfile(name); addToast(t("settings.saveChanges") + "✓", "success"); }
    catch (err) { addToast(err.message || "Erreur", "error"); }
    finally { setSavingProfile(false); }
  };

  const savePassword = async () => {
    if (!curPw)           return addToast(t("settings.currentPw") + "requis", "error");
    if (newPw.length < 8) return addToast("8+ caractères requis", "error");
    if (newPw !== confPw) return addToast("Mots de passe différents", "error");
    setSavingPw(true);
    try { await api.user.changePassword(curPw, newPw); setCurPw(""); setNewPw(""); setConfPw(""); addToast(t("settings.updatePw") + "✓", "success"); }
    catch (err) { addToast(err.message || "Erreur", "error"); }
    finally { setSavingPw(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-lg">

      {/* ── Langue & Apparence ── */}
      <C><CH title={t("settings.language") + "&" + t("settings.appearance")}/>
        <div className="p-4 space-y-4">

          {/* Langue */}
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-2">{t("settings.language")}</label>
            <div className="flex gap-2">
              {[["fr","🇫🇷 Français"],["en","🇬🇧 English"]].map(([code, label]) => (
                <button key={code} onClick={() => setLang(code)}
                  className="px-4 py-2 rounded-lg text-xs font-bold border transition-all"
                  style={lang === code
                    ? { background: `${th.hex}22`, color: th.hex, borderColor: `${th.hex}44` }
                    : { background: "transparent", color: "#64748b", borderColor: "rgba(255,255,255,0.07)" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Mode fond */}
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-2">{t("settings.appearance")}</label>
            <div className="flex gap-2">
              {[["dark","🌙" + t("settings.darkMode")],["light","☀️" + t("settings.lightMode")]].map(([m, label]) => (
                <button key={m} onClick={() => setMode(m)}
                  className="px-4 py-2 rounded-lg text-xs font-bold border transition-all"
                  style={mode === m
                    ? { background: `${th.hex}22`, color: th.hex, borderColor: `${th.hex}44` }
                    : { background: "transparent", color: "#64748b", borderColor: "rgba(255,255,255,0.07)" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Couleur thème */}
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-2">{t("settings.theme")}</label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(THEMES).map(([key, t_]) => (
                <button key={key} onClick={() => setTheme(key)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all"
                  style={theme === key
                    ? { background: `${t_.hex}22`, color: t_.hex, borderColor: `${t_.hex}55`, outline: `2px solid ${t_.hex}`, outlineOffset:"1px" }
                    : { background: "rgba(255,255,255,0.03)", color: "#64748b", borderColor: "rgba(255,255,255,0.06)" }}>
                  <span className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: t_.hex, boxShadow: theme === key ? `0 0 6px ${t_.hex}` : "none" }}/>
                  {t_.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </C>

      {/* ── Profil ── */}
      <C><CH title={t("settings.profile")}/>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">{t("settings.fullName")}</label>
            <input value={name} onChange={e=>setName(e.target.value)}
              className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none input-accent transition-colors"/>
          </div>
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">{t("settings.email")}</label>
            <input value={email} disabled className="w-full bg-black/20 border border-white/[0.04] rounded-lg px-3 py-2 text-xs text-slate-500 cursor-not-allowed"/>
          </div>
          <button onClick={saveProfile} disabled={savingProfile}
            className="flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60 btn-accent">
            {savingProfile && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
            {t("settings.saveChanges")}
          </button>
        </div>
      </C>

      {/* ── Mot de passe ── */}
      <C><CH title={t("settings.password")}/>
        <div className="p-4 space-y-3">
          {[[t("settings.currentPw"),curPw,setCurPw],[t("settings.newPw"),newPw,setNewPw],[t("settings.confirmPw"),confPw,setConfPw]].map(([l,v,set])=>(
            <div key={l}>
              <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">{l}</label>
              <input type="password" value={v} onChange={e=>set(e.target.value)} placeholder="••••••••"
                className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none input-accent transition-colors"/>
            </div>
          ))}
          <button onClick={savePassword} disabled={savingPw}
            className="flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60 btn-accent">
            {savingPw && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
            {t("settings.updatePw")}
          </button>
        </div>
      </C>

      {/* ── 2FA ── */}
      <C><CH title={t("settings.twoFA")}/>
        <div className="p-4">
          <div className="flex items-center justify-between py-1">
            <div>
              <p className="text-xs text-slate-300 font-semibold">Authenticator App (TOTP)</p>
              <p className="text-[10px] text-slate-500">Activer le 2FA à chaque connexion</p>
            </div>
            <Toggle on={tfa} onChange={v=>{ setTfa(v); addToast(v?"2FA activé":"2FA désactivé", v?"success":"warn"); }}/>
          </div>
        </div>
      </C>

      {/* ── Notifications ── */}
      <C><CH title={t("settings.notifications")}/>
        <div className="p-4 space-y-2">
          {[[t("settings.emailSuccess"),"emailSuccess"],[t("settings.emailFail"),"emailFail"],[t("settings.emailCert"),"emailCert"],[t("settings.slack"),"slack"]].map(([l,k])=>(
            <label key={k} className="flex items-center justify-between py-1.5 cursor-pointer">
              <span className="text-xs text-slate-300">{l}</span>
              <Toggle on={notifs[k]} onChange={v=>setNotifs(n=>({...n,[k]:v}))}/>
            </label>
          ))}
        </div>
      </C>

      {/* ── Zone dangereuse ── */}
      <C><CH title={t("settings.dangerZone")}/>
        <div className="p-4 space-y-2">
          <button onClick={()=>addToast(t("settings.exportData") + "— email envoyé","info")}
            className="w-full py-2 bg-white/[0.04] border border-white/[0.07] text-slate-300 text-xs font-semibold rounded-lg hover:bg-white/[0.07] transition-colors">
            {t("settings.exportData")}
          </button>
          <button onClick={()=>addToast("Contactez le support pour supprimer votre compte","warn")}
            className="w-full py-2 bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-950/30 transition-colors">
            {t("settings.deleteAccount")}
          </button>
        </div>
      </C>
    </div>
  );
};

export default ClientSettings;
