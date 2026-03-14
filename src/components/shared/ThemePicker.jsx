// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import { useApp } from "../../i18n/AppContext.jsx";

const ThemePicker = ({ isAdmin }) => {
  const { theme, setTheme, lang, setLang, mode, setMode, th, THEMES } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      {/* Trigger */}
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/[0.06] transition-colors"
        title="Langue & Thème">
        <span className="text-[13px]">{lang === "fr" ? "🇫🇷" : "🇬🇧"}</span>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-60 bg-[#1a1728] border border-white/[0.1] rounded-xl shadow-2xl z-[600] p-3 space-y-3"
          style={{ background: mode === "light" ? "#ffffff" : "#1a1728", borderColor: mode === "light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)" }}>

          {/* ── Langue ── */}
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 font-black">
              Langue / Language
            </p>
            <div className="flex gap-1.5">
              {[["fr","🇫🇷 Français"],["en","🇬🇧 English"]].map(([code, label]) => (
                <button key={code} onClick={() => { setLang(code); }}
                  className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border"
                  style={lang === code
                    ? { background: `${th.hex}22`, color: th.hex, borderColor: `${th.hex}55` }
                    : { background: "transparent", color: "#64748b", borderColor: "rgba(128,128,128,0.2)" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Mode fond ── */}
          <div>
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 font-black">
              Fond / Background
            </p>
            <div className="flex gap-1.5">
              {[["dark","🌙 Sombre","#0d0b1a"],["light","☀️ Clair","#f1f5f9"]].map(([m, label, bg]) => (
                <button key={m} onClick={() => setMode(m)}
                  className="flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-center gap-1"
                  style={mode === m
                    ? { background: `${th.hex}22`, color: th.hex, borderColor: `${th.hex}55` }
                    : { background: bg, color: m === "light" ? "#334155" : "#94a3b8", borderColor: "rgba(128,128,128,0.2)" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Couleur thème (client only) ── */}
          {!isAdmin && (
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1.5 font-black">
                Couleur / Color
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {Object.entries(THEMES).map(([key, t]) => (
                  <button key={key} onClick={() => setTheme(key)} title={t.name}
                    className="flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all border"
                    style={theme === key
                      ? { background: `${t.hex}20`, borderColor: `${t.hex}66`, outline: `2px solid ${t.hex}`, outlineOffset: "1px" }
                      : { background: "rgba(128,128,128,0.08)", borderColor: "transparent" }}>
                    <span className="w-5 h-5 rounded-full"
                      style={{ background: t.hex, boxShadow: theme === key ? `0 0 8px ${t.hex}` : "none" }}/>
                    <span className="text-[8px] font-bold" style={{ color: theme === key ? t.hex : "#64748b" }}>
                      {t.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isAdmin && (
            <p className="text-[9px] text-slate-500 italic">Couleur admin : Rose (fixe)</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ThemePicker;
