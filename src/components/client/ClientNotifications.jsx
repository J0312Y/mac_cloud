// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { C, CH } from "../ui/SharedUI.jsx";
import { useApp } from "../../i18n/AppContext.jsx";

const TYPE_ICON = {
  success:   { icon:"check",     color:"text-emerald-400", bg:"bg-emerald-500/15" },
  error:     { icon:"x",         color:"text-red-400",     bg:"bg-red-500/15"     },
  warning:   { icon:"alertTri",  color:"text-amber-400",   bg:"bg-amber-500/15"   },
  info:      { icon:"info",      color:"text-sky-400",     bg:"bg-sky-500/15"     },
  ticket:    { icon:"headset",   color:"accent-text-dyn",  bg:"accent-bg20-dyn"   },
  broadcast: { icon:"megaphone", color:"text-rose-400",    bg:"bg-rose-500/15"    },
};

/* ── Full-screen modal to read a notification ─────────────────────────────── */
const NotifModal = ({ notif, onClose, onAction, setPage }) => {
  const { t } = useApp();
  if (!notif) return null;
  const { icon, color, bg } = TYPE_ICON[notif.type] || TYPE_ICON.info;

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
         onClick={onClose}>
      <div className="bg-[#1a1728] border border-white/[0.1] rounded-2xl w-full max-w-md shadow-2xl"
           onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon name={icon} size={16} className={color}/>
            </div>
            <div>
              <p className="text-[13px] font-black text-white">{notif.title}</p>
              <p className="text-[9px] text-slate-500 mt-0.5">
                {notif.from ? `${notif.from} · ` : ""}{notif.time || "just now"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition-colors">
            <Icon name="x" size={15}/>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-[12px] text-slate-300 leading-relaxed whitespace-pre-wrap">
            {notif.body || notif.message || "Aucun contenu."}
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-2">
          {notif.action && (
            <button onClick={() => { onAction?.(); setPage?.(notif.action); onClose(); }}
              className="flex-1 py-2.5 accent-bg-dyn text-white text-[11px] font-bold rounded-xl transition-colors">
              {t("common.open") || "Ouvrir"} →
            </button>
          )}
          <button onClick={onClose}
            className="flex-1 py-2.5 bg-white/[0.05] text-slate-400 text-[11px] font-bold rounded-xl hover:text-slate-200 transition-colors">
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main notifications page ─────────────────────────────────────────────── */
const ClientNotifications = ({ notifs, setNotifs, broadcasts, setBroadcasts, setPage, addToast }) => {
  const { t } = useApp();
  const [tab, setTab]         = useState("all");
  const [selected, setSelected] = useState(null);

  const markAllRead = () => {
    setNotifs(n => n.map(x => ({ ...x, read: true })));
    setBroadcasts?.(b => b.map(x => ({ ...x, read: true })));
  };

  const markOneRead = (id, isBroadcast) => {
    if (isBroadcast) setBroadcasts?.(b => b.map(x => x.id === id ? { ...x, read: true } : x));
    else             setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  };

  const openNotif = (item, isBroadcast = false) => {
    markOneRead(item.id, isBroadcast);
    setSelected({ ...item, isBroadcast });
  };

  const unreadNotifs      = notifs.filter(n => !n.read).length;
  const unreadBroadcasts  = broadcasts.filter(b => !b.read).length;
  const totalUnread       = unreadNotifs + unreadBroadcasts;

  // Items to display per tab
  const allItems = [
    ...broadcasts.map(b => ({ ...b, _isBroadcast: true })),
    ...notifs,
  ];
  const unreadItems = allItems.filter(x => !x.read);
  const displayedItems =
    tab === "unread"    ? unreadItems :
    tab === "broadcast" ? broadcasts.map(b => ({ ...b, _isBroadcast: true })) :
    allItems;

  const TABS = [
    { id:"all",       label: t("notifPage.all") },
    { id:"unread",    label: `${t("notifPage.unread")}${totalUnread > 0 ? ` (${totalUnread})` : ""}` },
    { id:"broadcast", label: t("notifPage.broadcasts") },
  ];

  const renderItem = (item) => {
    const isBroadcast = !!item._isBroadcast;
    const type = item.type || (isBroadcast ? "broadcast" : "info");
    const { icon, color, bg } = TYPE_ICON[type] || TYPE_ICON.info;

    return (
      <button key={item.id}
        onClick={() => openNotif(item, isBroadcast)}
        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-all hover:bg-white/[0.03] ${item.read ? "opacity-50" : ""}`}>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
          <Icon name={icon} size={13} className={color}/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={`text-[11px] font-bold truncate ${item.read ? "text-slate-400" : "text-slate-200"}`}>
              {item.title}
            </p>
            {!item.read && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0 animate-pulse"/>
            )}
          </div>
          {/* Show full body — truncated to 2 lines */}
          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
            {item.body || item.message || ""}
          </p>
          <div className="flex items-center gap-2 mt-1">
            {isBroadcast && (
              <span className="text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded-full font-bold">
                {t("notifPage.from")}
              </span>
            )}
            <span className="text-[9px] text-slate-600">{item.time || "just now"}</span>
          </div>
        </div>
        <Icon name="chevronRight" size={11} className="text-slate-700 flex-shrink-0 mt-1"/>
      </button>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 max-w-2xl">

      {/* Tabs + Mark all */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="flex gap-1">
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors border ${
                tab === id
                  ? "accent-bg20-dyn accent-text-dyn accent-bd-dyn"
                  : "text-slate-500 hover:text-slate-300 border-transparent"
              }`}>
              {label}
            </button>
          ))}
        </div>
        {totalUnread > 0 && (
          <button onClick={markAllRead}
            className="text-[10px] accent-text-dyn font-bold hover:opacity-80 transition-opacity flex items-center gap-1">
            <Icon name="check" size={10}/> {t("common.markAllRead")}
          </button>
        )}
      </div>

      {/* List */}
      <C>
        {displayedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3">
            <Icon name="bell" size={28} className="text-slate-700"/>
            <p className="text-[11px] text-slate-500">
              {tab === "broadcast" ? t("notifPage.noBroadcasts") : t("notifPage.noNotifs")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {displayedItems.map(item => renderItem(item))}
          </div>
        )}
      </C>

      {/* Detail modal */}
      <NotifModal
        notif={selected}
        onClose={() => setSelected(null)}
        setPage={setPage}
        onAction={() => setSelected(null)}
      />
    </div>
  );
};

export default ClientNotifications;
