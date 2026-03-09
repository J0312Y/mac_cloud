// @ts-nocheck
import { useState, useEffect, useRef } from "react";

// ── UI & Shared ──────────────────────────────────────────────────────────────
import Icon                          from "./components/ui/Icon.jsx";
import { Toast }                     from "./components/ui/SharedUI.jsx";
import Login                         from "./components/shared/Login.jsx";
import RoleBanner                    from "./components/shared/RoleBanner.jsx";

// ── Admin ────────────────────────────────────────────────────────────────────
import { ANAV, AdminSidebar }        from "./components/admin/AdminSidebar.jsx";
import AdminOverview                 from "./components/admin/AdminOverview.jsx";
import AdminBuilds                   from "./components/admin/AdminBuilds.jsx";
import AdminUsers                    from "./components/admin/AdminUsers.jsx";
import AdminNodes                    from "./components/admin/AdminNodes.jsx";
import AdminNodeDetail               from "./components/admin/AdminNodeDetail.jsx";
import AdminAlerts                   from "./components/admin/AdminAlerts.jsx";
import AdminAudit                    from "./components/admin/AdminAudit.jsx";
import AdminBroadcast                from "./components/admin/AdminBroadcast.jsx";
import AdminPlans                    from "./components/admin/AdminPlans.jsx";
import AdminBackups                  from "./components/admin/AdminBackups.jsx";
import AdminAnalytics                from "./components/admin/AdminAnalytics.jsx";

// ── Client ───────────────────────────────────────────────────────────────────
import { CNAV, ClientSidebar }       from "./components/client/ClientSidebar.jsx";
import ClientDashboard               from "./components/client/ClientDashboard.jsx";
import ClientBuilds                  from "./components/client/ClientBuilds.jsx";
import ClientNewBuild                from "./components/client/ClientNewBuild.jsx";
import ClientCerts                   from "./components/client/ClientCerts.jsx";
import ClientProfiles                from "./components/client/ClientProfiles.jsx";
import ClientWebhooks                from "./components/client/ClientWebhooks.jsx";
import ClientTokens                  from "./components/client/ClientTokens.jsx";
import ClientTeam                    from "./components/client/ClientTeam.jsx";
import ClientBilling                 from "./components/client/ClientBilling.jsx";
import ClientSupport                 from "./components/client/ClientSupport.jsx";
import ClientSettings                from "./components/client/ClientSettings.jsx";
import ClientChatbot                 from "./components/client/ClientChatbot.jsx";

// ── Data ─────────────────────────────────────────────────────────────────────
import { ALERTS, NOTIFS }            from "./data/index.js";

// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [loggedIn, setLoggedIn]         = useState(false);
  const [isAdmin, setIsAdmin]           = useState(false);
  const [adminPage, setAdminPage]       = useState("overview");
  const [clientPage, setClientPage]     = useState("dashboard");
  const [alerts, setAlerts]             = useState(ALERTS);
  const [toasts, setToasts]             = useState([]);
  const [selNode, setSelNode]           = useState(null);
  const [notifs, setNotifs]             = useState(NOTIFS);
  const [adminCollapsed, setAdminCol]   = useState(false);
  const [clientCollapsed, setClientCol] = useState(false);
  const [mobileNav, setMobileNav]       = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const notifRef = useRef(null);

  // Close notification dropdown on outside click
  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const addToast = (msg, tp = "info") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, tp }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };

  const signOut = () => {
    setLoggedIn(false);
    setAdminPage("overview");
    setClientPage("dashboard");
    setMobileNav(false);
  };

  const handleLogin = (role) => {
    setIsAdmin(role === "admin");
    setLoggedIn(true);
  };

  const unackAlerts  = alerts.filter((a) => !a.ack).length;
  const unreadNotifs = notifs.filter((n) => !n.read).length;
  const pageTitle    = isAdmin
    ? ANAV.find((n) => n.id === adminPage)?.label
    : CNAV.find((n) => n.id === clientPage)?.label;

  const renderAdminPage = () => {
    switch (adminPage) {
      case "overview":    return <AdminOverview setPage={setAdminPage} alerts={alerts}/>;
      case "builds":      return <AdminBuilds addToast={addToast}/>;
      case "users":       return <AdminUsers addToast={addToast}/>;
      case "nodes":       return <AdminNodes setPage={setAdminPage} setSelNode={setSelNode} addToast={addToast}/>;
      case "node-detail": return <AdminNodeDetail node={selNode} setPage={setAdminPage} addToast={addToast}/>;
      case "alerts":      return <AdminAlerts alerts={alerts} setAlerts={setAlerts} addToast={addToast}/>;
      case "audit":       return <AdminAudit/>;
      case "broadcast":   return <AdminBroadcast addToast={addToast}/>;
      case "plans":       return <AdminPlans addToast={addToast}/>;
      case "backups":     return <AdminBackups addToast={addToast}/>;
      case "analytics":   return <AdminAnalytics addToast={addToast}/>;
      default: return null;
    }
  };

  const renderClientPage = () => {
    switch (clientPage) {
      case "dashboard":    return <ClientDashboard setPage={setClientPage}/>;
      case "my-builds":    return <ClientBuilds setPage={setClientPage} addToast={addToast}/>;
      case "new-build":    return <ClientNewBuild addToast={addToast} setPage={setClientPage}/>;
      case "certificates": return <ClientCerts addToast={addToast}/>;
      case "profiles":     return <ClientProfiles addToast={addToast}/>;
      case "webhooks":     return <ClientWebhooks addToast={addToast}/>;
      case "api-tokens":   return <ClientTokens addToast={addToast}/>;
      case "team":         return <ClientTeam addToast={addToast}/>;
      case "billing":      return <ClientBilling addToast={addToast}/>;
      case "support":      return <ClientSupport addToast={addToast}/>;
      case "settings":     return <ClientSettings addToast={addToast}/>;
      default: return null;
    }
  };

  if (!loggedIn) return <Login onLogin={handleLogin}/>;

  return (
    <div className="flex flex-col h-screen bg-[#090710] overflow-hidden">

      {/* Role switcher banner */}
      <RoleBanner isAdmin={isAdmin} setIsAdmin={setIsAdmin}/>

      <div className="flex flex-1 overflow-hidden">

        {/* Desktop sidebar */}
        <div className="hidden lg:flex">
          {isAdmin
            ? <AdminSidebar page={adminPage} setPage={setAdminPage} alerts={alerts} collapsed={adminCollapsed} setCollapsed={setAdminCol} onSignOut={signOut}/>
            : <ClientSidebar page={clientPage} setPage={setClientPage} notifs={notifs} collapsed={clientCollapsed} setCollapsed={setClientCol} onSignOut={signOut}/>
          }
        </div>

        {/* Mobile sidebar overlay */}
        {mobileNav && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileNav(false)}/>
            <div className="relative z-50 flex h-full">
              {isAdmin
                ? <AdminSidebar page={adminPage} setPage={(p) => { setAdminPage(p); setMobileNav(false); }} alerts={alerts} collapsed={false} setCollapsed={() => {}} onSignOut={signOut}/>
                : <ClientSidebar page={clientPage} setPage={(p) => { setClientPage(p); setMobileNav(false); }} notifs={notifs} collapsed={false} setCollapsed={() => {}} onSignOut={signOut}/>
              }
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Topbar */}
          <header className={`flex items-center gap-3 px-4 h-11 border-b flex-shrink-0 ${isAdmin ? "border-rose-500/10 bg-[#0e0a18]" : "border-violet-500/10 bg-[#0e0b1c]"}`}>

            <button onClick={() => setMobileNav((v) => !v)} className="lg:hidden text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0">
              <Icon name="menu" size={16}/>
            </button>

            <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider truncate flex-1">
              {pageTitle}
            </span>

            {/* Platform status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
              <span className="text-[9px] text-emerald-400 font-bold">Operational</span>
            </div>

            {/* Admin: unacknowledged alerts badge */}
            {isAdmin && unackAlerts > 0 && (
              <button onClick={() => setAdminPage("alerts")}
                className="hidden sm:flex items-center gap-1 text-[9px] text-rose-300 bg-rose-900/30 border border-rose-500/25 px-2 py-0.5 rounded-full animate-pulse font-bold flex-shrink-0">
                <Icon name="alertTri" size={9}/>{unackAlerts}
              </button>
            )}

            {/* Client: notification bell with dropdown */}
            {!isAdmin && (
              <div className="relative flex-shrink-0" ref={notifRef}>
                <button onClick={() => setNotifOpen((o) => !o)}
                  className="relative flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/[0.06] transition-colors">
                  <Icon name="bell" size={14} className={unreadNotifs > 0 ? "text-violet-400" : "text-slate-500"}/>
                  {unreadNotifs > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-violet-500 rounded-full text-[7px] flex items-center justify-center text-white font-black animate-pulse">
                      {unreadNotifs}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-[#1a1728] border border-white/[0.08] rounded-xl shadow-2xl z-[500]">
                    <div className="px-4 py-2.5 border-b border-white/[0.05] flex items-center justify-between">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Notifications</p>
                      {unreadNotifs > 0 && (
                        <button onClick={() => setNotifs((n) => n.map((x) => ({ ...x, read: true })))}
                          className="text-[9px] text-violet-400 font-bold hover:text-violet-300 transition-colors">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifs.length === 0 && (
                        <p className="px-4 py-6 text-[11px] text-slate-500 text-center">No notifications</p>
                      )}
                      {notifs.map((n) => (
                        <button key={n.id}
                          onClick={() => setNotifs((ns) => ns.map((x) => x.id === n.id ? { ...x, read: true } : x))}
                          className={`w-full flex items-start gap-3 px-4 py-3 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.03] transition-colors text-left ${n.read ? "opacity-50" : ""}`}>
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${n.read ? "bg-transparent" : n.type === "error" ? "bg-red-400" : n.type === "warning" ? "bg-amber-400" : n.type === "success" ? "bg-emerald-400" : "bg-violet-400"}`}/>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-slate-300 font-semibold truncate">{n.title}</p>
                            <p className="text-[9px] text-slate-500 mt-0.5 truncate">{n.body}</p>
                            <p className="text-[8px] text-slate-700 mt-1">{n.time}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </header>

          {/* Page content */}
          {isAdmin ? renderAdminPage() : renderClientPage()}
        </div>
      </div>

      {/* Global toast notifications */}
      <Toast toasts={toasts}/>

      {/* Client-only chatbot */}
      {!isAdmin && loggedIn && <ClientChatbot setPage={setClientPage}/>}
    </div>
  );
}
