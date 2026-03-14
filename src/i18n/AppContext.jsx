// @ts-nocheck
import { createContext, useContext, useState, useEffect } from "react";
import translations from "./translations.js";

export const THEMES = {
  cyan:    { name:"Cyan",    hex:"#06b6d4", sidebar:"#060c10", header:"#080e13" },
  teal:    { name:"Teal",    hex:"#14b8a6", sidebar:"#06100e", header:"#080f0d" },
  violet:  { name:"Violet",  hex:"#8b5cf6", sidebar:"#0d0b1a", header:"#0e0b1c" },
  indigo:  { name:"Indigo",  hex:"#6366f1", sidebar:"#09091a", header:"#0a0a1c" },
  emerald: { name:"Vert",    hex:"#10b981", sidebar:"#06100c", header:"#080f0c" },
  rose:    { name:"Rose",    hex:"#f43f5e", sidebar:"#120810", header:"#140810" },
  orange:  { name:"Orange",  hex:"#f97316", sidebar:"#120d08", header:"#140e08" },
};

// Admin accent: fixed rose
const ADMIN_HEX = "#f43f5e";

function hexAlpha(hex, alpha) {
  // Convert hex + alpha (0-1) to rgba
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function applyVars(clientHex, clientSidebar, clientHeader, mode) {
  const r = document.documentElement;

  // ── Client accent vars ─────────────────────────────────
  r.style.setProperty("--ca",    clientHex);
  r.style.setProperty("--ca-10", hexAlpha(clientHex, 0.1));
  r.style.setProperty("--ca-20", hexAlpha(clientHex, 0.2));
  r.style.setProperty("--ca-40", hexAlpha(clientHex, 0.4));
  r.style.setProperty("--ca-80", hexAlpha(clientHex, 0.8));

  // ── Admin accent vars (fixed rose) ─────────────────────
  r.style.setProperty("--aa",    ADMIN_HEX);
  r.style.setProperty("--aa-10", hexAlpha(ADMIN_HEX, 0.1));
  r.style.setProperty("--aa-20", hexAlpha(ADMIN_HEX, 0.2));
  r.style.setProperty("--aa-40", hexAlpha(ADMIN_HEX, 0.4));
  r.style.setProperty("--aa-80", hexAlpha(ADMIN_HEX, 0.8));

  // ── Client sidebar/header ──────────────────────────────
  r.style.setProperty("--sidebar-c", mode === "light" ? "#ffffff" : clientSidebar);
  r.style.setProperty("--header-c",  mode === "light" ? "#f8fafc" : clientHeader);

  // ── Admin sidebar/header (fixed) ──────────────────────
  r.style.setProperty("--sidebar-a", "#0d0a15");
  r.style.setProperty("--header-a",  "#0e0b16");

  // ── Global background/text ─────────────────────────────
  if (mode === "light") {
    r.style.setProperty("--bg",   "#f1f5f9");
    r.style.setProperty("--card", "#ffffff");
    r.style.setProperty("--text", "#0f172a");
    r.style.setProperty("--sub",  "#64748b");
    document.body.style.background = "#f1f5f9";
    document.body.style.color      = "#0f172a";
  } else {
    r.style.setProperty("--bg",   "#090710");
    r.style.setProperty("--card", "#110f1e");
    r.style.setProperty("--text", "#e2e8f0");
    r.style.setProperty("--sub",  "#94a3b8");
    document.body.style.background = "#090710";
    document.body.style.color      = "#e2e8f0";
  }

  r.setAttribute("data-mode", mode);
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang,  setLangState]  = useState(() => localStorage.getItem("mbc_lang")  || "fr");
  const [theme, setThemeState] = useState(() => localStorage.getItem("mbc_theme") || "cyan");
  // Mode: saved preference > system preference > dark
  const [mode, setModeState] = useState(() => {
    const saved = localStorage.getItem("mbc_mode");
    if (saved) return saved;
    // Follow OS/browser dark mode preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const th = THEMES[theme] || THEMES.cyan;
    applyVars(th.hex, th.sidebar, th.header, mode);

    // Listen for OS theme changes (e.g. Chrome switches to dark mode)
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = (e) => {
      // Only auto-follow if user hasn't manually set a preference
      if (!localStorage.getItem("mbc_mode")) {
        const newMode = e.matches ? "dark" : "light";
        setModeState(newMode);
        const t = THEMES[theme] || THEMES.cyan;
        applyVars(t.hex, t.sidebar, t.header, newMode);
      }
    };
    mq.addEventListener("change", onSystemChange);
    return () => mq.removeEventListener("change", onSystemChange);
  }, []); // eslint-disable-line

  const setLang = (l) => { setLangState(l); localStorage.setItem("mbc_lang", l); };

  const setTheme = (key) => {
    setThemeState(key);
    localStorage.setItem("mbc_theme", key);
    const th = THEMES[key] || THEMES.cyan;
    applyVars(th.hex, th.sidebar, th.header, mode);
  };

  const setMode = (m) => {
    setModeState(m);
    localStorage.setItem("mbc_mode", m);
    const th = THEMES[theme] || THEMES.cyan;
    applyVars(th.hex, th.sidebar, th.header, m);
  };

  const t = (path) => {
    const parts = path.split(".");
    let val = translations[lang];
    for (const p of parts) val = val?.[p];
    if (!val) {
      let fb = translations.en;
      for (const p of parts) fb = fb?.[p];
      return fb || path;
    }
    return val;
  };

  const th = THEMES[theme] || THEMES.cyan;

  return (
    <AppContext.Provider value={{ lang, setLang, theme, setTheme, mode, setMode, t, th, THEMES }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

export default AppContext;
