// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import api                               from "./lib/api.js";
import { useApp }                        from "./i18n/AppContext.jsx";
import ThemePicker                       from "./components/shared/ThemePicker.jsx";
import { useSocket }                     from "./hooks/useSocket.js";
import Icon                              from "./components/ui/Icon.jsx";
import { Toast }                         from "./components/ui/SharedUI.jsx";
import Login                             from "./components/shared/Login.jsx";
import RoleBanner                        from "./components/shared/RoleBanner.jsx";
import SubscriptionGuard                 from "./components/shared/SubscriptionGuard.jsx";
import { getANAV, AdminSidebar }         from "./components/admin/AdminSidebar.jsx";
import AdminOverview                     from "./components/admin/AdminOverview.jsx";
import AdminBuilds                       from "./components/admin/AdminBuilds.jsx";
import AdminUsers                        from "./components/admin/AdminUsers.jsx";
import AdminNodes                        from "./components/admin/AdminNodes.jsx";
import AdminNodeDetail                   from "./components/admin/AdminNodeDetail.jsx";
import AdminAlerts                       from "./components/admin/AdminAlerts.jsx";
import AdminAudit                        from "./components/admin/AdminAudit.jsx";
import AdminBroadcast                    from "./components/admin/AdminBroadcast.jsx";
import AdminPlans                        from "./components/admin/AdminPlans.jsx";
import AdminBillingPending               from "./components/admin/AdminBillingPending.jsx";
import AdminHourPacks                    from "./components/admin/AdminHourPacks.jsx";
import AdminWebsite                      from "./components/admin/AdminWebsite.jsx";
import AdminSettings                     from "./components/admin/AdminSettings.jsx";
import ClientCredits                     from "./components/client/ClientCredits.jsx";
import AdminBackups                      from "./components/admin/AdminBackups.jsx";
import AdminAnalytics                    from "./components/admin/AdminAnalytics.jsx";
import AdminSupport                      from "./components/admin/AdminSupport.jsx";
import { getCNAV, ClientSidebar }        from "./components/client/ClientSidebar.jsx";
import ClientDashboard                   from "./components/client/ClientDashboard.jsx";
import ClientBuilds                      from "./components/client/ClientBuilds.jsx";
import ClientNewBuild                    from "./components/client/ClientNewBuild.jsx";
import ClientCerts                       from "./components/client/ClientCerts.jsx";
import ClientProfiles                    from "./components/client/ClientProfiles.jsx";
import ClientWebhooks                    from "./components/client/ClientWebhooks.jsx";
import ClientTokens                      from "./components/client/ClientTokens.jsx";
import ClientTeam                        from "./components/client/ClientTeam.jsx";
import ClientBilling                     from "./components/client/ClientBilling.jsx";
import ClientSupport                     from "./components/client/ClientSupport.jsx";
import ClientSettings                    from "./components/client/ClientSettings.jsx";
import ClientNotifications               from "./components/client/ClientNotifications.jsx";
import ClientChatbot                     from "./components/client/ClientChatbot.jsx";

const API = "http://213.156.133.182:3001/api";

export default function App() {
  const [loggedIn, setLoggedIn]         = useState(false);
  const [isAdmin, setIsAdmin]           = useState(false);
  const [currentUser, setCurrentUser]   = useState(null);
  const [adminPage, setAdminPage]       = useState("overview");
  const [clientPage, setClientPage]     = useState("dashboard");
  const [alerts, setAlerts]             = useState([]);
  const [toasts, setToasts]             = useState([]);
  const [selNode, setSelNode]           = useState(null);
  const [notifs, setNotifs]             = useState([]);
  const [broadcasts, setBroadcasts]     = useState([]);
  const [adminCollapsed, setAdminCol]   = useState(false);
  const [clientCollapsed, setClientCol] = useState(false);
  const [mobileNav, setMobileNav]       = useState(false);
  const [notifOpen, setNotifOpen]       = useState(false);
  const [newTicketBadge, setNewTicketBadge]   = useState(0);
  const [paymentBadge, setPaymentBadge]       = useState(0);
  const [planVersion, setPlanVersion]   = useState(0);
  const [billingVersion, setBillingVersion] = useState(0);
  const notifRef = useRef(null);
  const { th, t } = useApp();

  const { connected, subscribeAdmin, subscribeUser, on, off } = useSocket();
  const [everConnected, setEverConnected] = useState(false);
  useEffect(() => { if (connected) setEverConnected(true); }, [connected]);

  // Charger le nombre de paiements pending pour l'admin
  const loadPaymentBadge = async () => {
    try {
      const r = await fetch(`${API}/admin/billing/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("mbc_token")}` }
      });
      const d = await r.json();
      setPaymentBadge(d.count || 0);
    } catch {}
  };

  useEffect(() => {
    if (!loggedIn || !isAdmin) return;
    loadPaymentBadge();
    // Rafraîchir toutes les 2 minutes
    const iv = setInterval(loadPaymentBadge, 120000);
    return () => clearInterval(iv);
  }, [loggedIn, isAdmin]);

  useEffect(() => {
    if (!loggedIn) return;
    if (isAdmin) subscribeAdmin();
    else if (currentUser?.id) subscribeUser(currentUser.id);

    const onBuildUpdate = (data) => {
      const finalStates = ["success", "failed"];
      if (!finalStates.includes(data.status)) return;
      const project = data.project || data.project_name || data.name || "Build";
      const branch  = data.branch  || data.branch_name  || "";
      const body    = branch ? `${project} · ${branch}` : project;
      if (data.status === "success") addToast(`✅ ${project} — build réussi`, "success");
      if (data.status === "failed")  addToast(`❌ ${project} — build échoué`, "error");
      setNotifs(n => {
        const exists = n.find(x => x.buildId === data.id);
        if (exists) return n.map(x => x.buildId === data.id ? { ...x, title: `Build ${data.status}`, body, type: data.status === "success" ? "success" : "error", read: false, time: new Date().toLocaleTimeString() } : x);
        return [{ id: Date.now(), buildId: data.id, title: `Build ${data.status}`, body, time: new Date().toLocaleTimeString(), type: data.status === "success" ? "success" : "error", read: false, action: "my-builds" }, ...n];
      });
    };

    const onNewTicket = (data) => {
      setNewTicketBadge(b => b + 1);
      addToast(`🎫 New ticket from ${data.user?.name || data.user?.email}: "${data.ticket?.title}"`, "info");
      setAlerts(a => [{ id: Date.now(), type: "ticket", level: "warn", msg: `New support ticket: ${data.ticket?.title}`, ack: false }, ...a]);
    };

    const onClientReplied = (data) => {
      setNewTicketBadge(b => b + 1);
      addToast(`💬 Client replied to ticket: "${data.ticket?.title}"`, "info");
      setAlerts(a => [{ id: Date.now(), type: "ticket", level: "info", msg: `Client replied: ${data.ticket?.title}`, ack: false }, ...a]);
    };

    const onTicketReply = (data) => {
      addToast(`💬 Support replied to your ticket — click the bell to view`, "info");
      setNotifs(n => [{ id: Date.now(), title: "Support replied to your ticket", body: data.ticket?.title || "View your ticket for the reply", time: "just now", type: "info", read: false, action: "support" }, ...n]);
    };

    const onTicketUpdated = (data) => {
      addToast(`📋 Your ticket status changed to "${data.status}"`, "info");
      setNotifs(n => [{ id: Date.now(), title: `Ticket ${data.status}`, body: data.ticket?.title || "Ticket status updated", time: "just now", type: data.status === "resolved" ? "success" : "info", read: false, action: "support" }, ...n]);
    };

    const onBroadcast = (data) => {
      addToast(`📢 ${data.title}`, data.type === "error" ? "error" : data.type === "warning" ? "warn" : "info");
      setBroadcasts(bs => [{ id: data.id || Date.now(), title: data.title, body: data.body, type: data.type || "info", time: new Date().toLocaleTimeString(), read: false }, ...bs]);
    };

    // Nouveau paiement pending → badge admin
    const onPaymentPending = (data) => {
      setPaymentBadge(b => b + 1);
      addToast(`💳 Nouveau paiement en attente — ${data.amount} XAF (${data.plan})`, "warn");
      setAlerts(a => [{ id: Date.now(), type: "payment", level: "warn", msg: `Paiement pending: ${data.amount} XAF — plan ${data.plan}`, ack: false }, ...a]);
    };

    // Paiement confirmé → notif client
    const onPaymentConfirmed = (data) => {
      addToast(`✅ Votre plan ${data.plan} a été activé !`, "success");
      setBillingVersion(v => v + 1);
      setPlanVersion(v => v + 1);
      setNotifs(n => [{ id: Date.now(), title: `Plan ${data.plan} activé`, body: `Votre abonnement est actif jusqu'au ${new Date(data.expires_at).toLocaleDateString("fr-FR")}`, time: "just now", type: "success", read: false, action: "billing" }, ...n]);
    };

    on("buildUpdate",       onBuildUpdate);
    on("broadcast",         onBroadcast);
    on("newTicket",         onNewTicket);
    on("clientReplied",     onClientReplied);
    on("ticketReply",       onTicketReply);
    on("ticketUpdated",     onTicketUpdated);
    on("payment_pending",   onPaymentPending);
    on("payment_confirmed", onPaymentConfirmed);
    return () => {
      off("buildUpdate",       onBuildUpdate);
      off("broadcast",         onBroadcast);
      off("newTicket",         onNewTicket);
      off("clientReplied",     onClientReplied);
      off("ticketReply",       onTicketReply);
      off("ticketUpdated",     onTicketUpdated);
      off("payment_pending",   onPaymentPending);
      off("payment_confirmed", onPaymentConfirmed);
    };
  }, [loggedIn, isAdmin]);

  useEffect(() => {
    const h = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("mbc_token");
    if (!token) return;
    api.auth.me()
      .then(res => { setCurrentUser(res.user); setIsAdmin(res.user.role === "admin"); setLoggedIn(true); })
      .catch(() => localStorage.removeItem("mbc_token"));
  }, []);

  const addToast = (msg, tp = "info") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, tp }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  };

  const signOut = () => {
    api.auth.logout();
    setLoggedIn(false); setCurrentUser(null); setIsAdmin(false);
    setAdminPage("overview"); setClientPage("dashboard"); setMobileNav(false);
    setNewTicketBadge(0); setPaymentBadge(0);
  };

  const handleLogin = (role, user) => { setIsAdmin(role === "admin"); setCurrentUser(user); setLoggedIn(true); };

  const unackAlerts  = alerts.filter(a => !a.ack).length;
  const unreadNotifs = notifs.filter(n => !n.read).length + broadcasts.filter(b => !b.read).length;
  const pageTitle    = isAdmin
    ? getANAV(t).find(n => n.id === adminPage)?.label
    : getCNAV(t).find(n => n.id === clientPage)?.label;

  const renderAdminPage = () => {
    switch (adminPage) {
      case "overview":        return <AdminOverview setPage={setAdminPage} alerts={alerts}/>;
      case "builds":          return <AdminBuilds addToast={addToast}/>;
      case "users":           return <AdminUsers addToast={addToast}/>;
      case "nodes":           return <AdminNodes setPage={setAdminPage} setSelNode={setSelNode} addToast={addToast}/>;
      case "node-detail":     return <AdminNodeDetail node={selNode} setPage={setAdminPage} addToast={addToast}/>;
      case "alerts":          return <AdminAlerts alerts={alerts} setAlerts={setAlerts} addToast={addToast}/>;
      case "audit":           return <AdminAudit/>;
      case "broadcast":       return <AdminBroadcast addToast={addToast}/>;
      case "plans":           return <AdminPlans addToast={addToast}/>;
      case "billing-pending": return <AdminBillingPending addToast={addToast} onAction={()=>{ setPaymentBadge(0); loadPaymentBadge(); }}/>;
      case "hour-packs":      return <AdminHourPacks addToast={addToast}/>;
      case "website":         return <AdminWebsite addToast={addToast}/>;
      case "settings":        return <AdminSettings addToast={addToast} currentUser={currentUser}/>;
      case "backups":         return <AdminBackups addToast={addToast}/>;
      case "analytics":       return <AdminAnalytics addToast={addToast}/>;
      case "support":         return <AdminSupport addToast={addToast} onOpen={()=>setNewTicketBadge(0)}/>;
      default: return null;
    }
  };

  const renderClientPage = () => {
    switch (clientPage) {
      case "dashboard":     return <ClientDashboard setPage={setClientPage}/>;
      case "my-builds":     return <ClientBuilds setPage={setClientPage} addToast={addToast}/>;
      case "new-build":     return <ClientNewBuild addToast={addToast} setPage={setClientPage}/>;
      case "certificates":  return <ClientCerts addToast={addToast}/>;
      case "profiles":      return <ClientProfiles addToast={addToast}/>;
      case "webhooks":      return <ClientWebhooks addToast={addToast}/>;
      case "api-tokens":    return <ClientTokens addToast={addToast}/>;
      case "team":          return <ClientTeam addToast={addToast}/>;
      case "billing":       return <ClientBilling key={billingVersion} addToast={addToast} onPlanChange={()=>setPlanVersion(v=>v+1)}/>;
      case "credits":       return <ClientCredits addToast={addToast}/>;
      case "support":       return <ClientSupport addToast={addToast} currentUser={currentUser}/>;
      case "settings":      return <ClientSettings addToast={addToast}/>;
      case "notifications": return <ClientNotifications notifs={notifs} setNotifs={setNotifs} broadcasts={broadcasts} setBroadcasts={setBroadcasts} setPage={setClientPage} addToast={addToast}/>;
      default: return null;
    }
  };

  if (!loggedIn) return <Login onLogin={handleLogin}/>;

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${isAdmin ? "a-context" : "c-context"}`} style={{background:"var(--bg)"}}>
      <RoleBanner isAdmin={isAdmin}/>
      {!isAdmin && <SubscriptionGuard onLogout={signOut} addToast={addToast}/>}

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:flex">
          {isAdmin
            ? <AdminSidebar page={adminPage} setPage={p=>{setAdminPage(p);if(p==="support")setNewTicketBadge(0);if(p==="billing-pending")setPaymentBadge(0);}} alerts={alerts} collapsed={adminCollapsed} setCollapsed={setAdminCol} onSignOut={signOut} ticketBadge={newTicketBadge} paymentBadge={paymentBadge}/>
            : <ClientSidebar key={planVersion} page={clientPage} setPage={setClientPage} notifs={notifs} broadcasts={broadcasts} collapsed={clientCollapsed} setCollapsed={setClientCol} onSignOut={signOut}/>
          }
        </div>

        {mobileNav && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={()=>setMobileNav(false)}/>
            <div className="relative z-50 flex h-full">
              {isAdmin
                ? <AdminSidebar page={adminPage} setPage={p=>{setAdminPage(p);setMobileNav(false);if(p==="support")setNewTicketBadge(0);if(p==="billing-pending")setPaymentBadge(0);}} alerts={alerts} collapsed={false} setCollapsed={()=>{}} onSignOut={signOut} ticketBadge={newTicketBadge} paymentBadge={paymentBadge}/>
                : <ClientSidebar key={planVersion} page={clientPage} setPage={p=>{setClientPage(p);setMobileNav(false);}} notifs={notifs} broadcasts={broadcasts} collapsed={false} setCollapsed={()=>{}} onSignOut={signOut}/>
              }
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <header className={`flex items-center gap-3 px-4 h-11 border-b flex-shrink-0 ${isAdmin ? "header-admin" : "header-client"}`}>
            <button onClick={()=>setMobileNav(v=>!v)} className="lg:hidden text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0">
              <Icon name="menu" size={16}/>
            </button>
            <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider truncate flex-1">{pageTitle}</span>
            {currentUser && <span className="hidden sm:block text-[10px] text-slate-500 truncate max-w-[140px]">{currentUser.email}</span>}
            {(connected || everConnected) && (
              <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className={`w-1.5 h-1.5 rounded-full ${connected?"bg-emerald-400":"bg-amber-400 animate-pulse"}`}/>
                <span className={`text-[9px] font-bold ${connected?"text-emerald-400":"text-amber-400"}`}>{connected ? "Live" : "Reconnecting…"}</span>
              </div>
            )}
            {isAdmin && (unackAlerts > 0 || newTicketBadge > 0 || paymentBadge > 0) && (
              <div className="hidden sm:flex items-center gap-2">
                {unackAlerts > 0 && (
                  <button onClick={()=>setAdminPage("alerts")}
                    className="flex items-center gap-1 text-[9px] text-rose-300 bg-rose-900/30 border border-rose-500/25 px-2 py-0.5 rounded-full animate-pulse font-bold">
                    <Icon name="alertTri" size={9}/>{unackAlerts}
                  </button>
                )}
                {paymentBadge > 0 && (
                  <button onClick={()=>{setAdminPage("billing-pending");setPaymentBadge(0);}}
                    className="flex items-center gap-1 text-[9px] text-amber-300 bg-amber-900/30 border border-amber-500/25 px-2 py-0.5 rounded-full animate-pulse font-bold">
                    <Icon name="card" size={9}/>{paymentBadge} paiement{paymentBadge>1?"s":""}
                  </button>
                )}
                {newTicketBadge > 0 && (
                  <button onClick={()=>{setAdminPage("support");setNewTicketBadge(0);}}
                    className="flex items-center gap-1 text-[9px] text-amber-300 bg-amber-900/30 border border-amber-500/25 px-2 py-0.5 rounded-full animate-pulse font-bold">
                    <Icon name="headset" size={9}/>{newTicketBadge} new
                  </button>
                )}
              </div>
            )}
            {!isAdmin && (
              <>
                <ThemePicker isAdmin={isAdmin}/>
                <div className="relative flex-shrink-0" ref={notifRef}>
                  <button onClick={()=>setNotifOpen(o=>!o)}
                    className="relative flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/[0.06] transition-colors">
                    <Icon name="bell" size={14} className={unreadNotifs>0?"accent-text-dyn":"text-slate-500"}/>
                    {unreadNotifs > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-[7px] flex items-center justify-center text-white font-black animate-pulse accent-bg-dyn">
                        {unreadNotifs}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute top-full right-0 mt-2 w-80 border border-white/[0.1] rounded-2xl shadow-2xl z-[600] overflow-hidden" style={{background:"var(--card)"}}>
                      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                        <p className="text-[11px] font-black text-white uppercase tracking-widest">Notifications</p>
                        {unreadNotifs > 0 && (
                          <button onClick={()=>{ setNotifs(n=>n.map(x=>({...x,read:true}))); setBroadcasts(b=>b.map(x=>({...x,read:true}))); }}
                            className="text-[9px] accent-text-dyn font-bold hover:opacity-80">Tout lire</button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
                        {[...broadcasts.map(b=>({...b,_bc:true})),...notifs].slice(0,6).length === 0 ? (
                          <div className="flex items-center justify-center py-8"><p className="text-[11px] text-slate-500">Aucune notification</p></div>
                        ) : (
                          [...broadcasts.map(b=>({...b,_bc:true})),...notifs].slice(0,6).map(item => {
                            const colors = {success:"text-emerald-400 bg-emerald-500/15",error:"text-red-400 bg-red-500/15",warning:"text-amber-400 bg-amber-500/15",info:"text-sky-400 bg-sky-500/15",ticket:"accent-text-dyn accent-bg20-dyn",broadcast:"text-rose-400 bg-rose-500/15"};
                            const icons  = {success:"check",error:"x",warning:"alertTri",info:"info",ticket:"headset",broadcast:"megaphone"};
                            const type   = item.type||(item._bc?"broadcast":"info");
                            return (
                              <button key={item.id}
                                onClick={()=>{ setNotifOpen(false); setClientPage("notifications"); if(!item._bc) setNotifs(n=>n.map(x=>x.id===item.id?{...x,read:true}:x)); else setBroadcasts(b=>b.map(x=>x.id===item.id?{...x,read:true}:x)); }}
                                className={`w-full flex items-start gap-3 px-4 py-2.5 text-left hover:bg-white/[0.03] transition-colors ${item.read?"opacity-50":""}`}>
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colors[type]||colors.info}`}>
                                  <Icon name={icons[type]||"info"} size={11}/>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-[10px] font-bold text-slate-200 truncate">{item.title}</p>
                                    {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0"/>}
                                  </div>
                                  <p className="text-[9px] text-slate-500 truncate mt-0.5">{item.body||item.message||""}</p>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                      <button onClick={()=>{ setNotifOpen(false); setClientPage("notifications"); }}
                        className="w-full px-4 py-2.5 border-t border-white/[0.06] text-[10px] accent-text-dyn font-bold hover:bg-white/[0.03] transition-colors text-center">
                        Voir toutes les notifications →
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            {isAdmin && <ThemePicker isAdmin={true}/>}
          </header>
          {isAdmin ? renderAdminPage() : renderClientPage()}
        </div>
      </div>
      <Toast toasts={toasts}/>
      {!isAdmin && loggedIn && <ClientChatbot setPage={setClientPage}/>}
    </div>
  );
}
