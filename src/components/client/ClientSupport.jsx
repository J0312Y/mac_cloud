// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";
import api from "../../lib/api.js";
import { useApp } from "../../i18n/AppContext.jsx";

const PRIORITY_COLOR = {
  low:    "text-slate-400 bg-slate-800/50 border-slate-600/20",
  medium: "text-sky-400 bg-sky-900/20 border-sky-500/20",
  high:   "text-amber-400 bg-amber-900/20 border-amber-500/20",
  urgent: "text-red-400 bg-red-900/20 border-red-500/20",
};
const STATUS_BORDER = {
  open:        "border-amber-500/20",
  "in-progress":"border-sky-500/20",
  resolved:    "border-emerald-500/20",
  closed:      "border-slate-500/10",
};

const ClientSupport = ({ addToast, currentUser }) => {
  const { t } = useApp();
  const [tickets, setTickets]   = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [showNew, setShowNew]   = useState(false);
  const [replyText, setReplyText] = useState({});

  // New ticket form
  const [newTitle, setNewTitle]   = useState("");
  const [newCat,   setNewCat]     = useState("Build");
  const [newPrio,  setNewPrio]    = useState("medium");
  const [newDesc,  setNewDesc]    = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const res = await api.tickets.list();
      setTickets(res.tickets || []);
    } catch { addToast("Failed to load tickets", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!newTitle) return addToast("Enter a title", "error");
    setSubmitting(true);
    try {
      await api.tickets.create({ title: newTitle, category: newCat, priority: newPrio, description: newDesc });
      addToast("Ticket submitted — our team will respond shortly", "success");
      setNewTitle(""); setNewDesc(""); setShowNew(false);
      load();
    } catch (err) {
      addToast(err.message || "Failed to create ticket", "error");
    } finally { setSubmitting(false); }
  };

  const sendReply = async (ticketId) => {
    const text = replyText[ticketId]?.trim();
    if (!text) return;
    try {
      await api.tickets.reply(ticketId, text);
      setReplyText(r => ({ ...r, [ticketId]: "" }));
      load();
    } catch { addToast("Failed to send reply", "error"); }
  };

  const counts = {
    open:        tickets.filter(t=>t.status==="open").length,
    "in-progress": tickets.filter(t=>t.status==="in-progress").length,
    resolved:    tickets.filter(t=>t.status==="resolved").length,
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Stats row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-3">
          {[["open", counts.open, "text-amber-400"],["in-progress", counts["in-progress"], "text-sky-400"],["resolved", counts.resolved, "text-emerald-400"]].map(([l,v,c])=>(
            <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-lg px-3 py-2">
              <p className="text-[9px] text-slate-500 capitalize">{l}</p>
              <p className={`text-xl font-black font-mono ${c}`}>{v}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors">
            <Icon name="refresh" size={11}/>Refresh
          </button>
          <button onClick={()=>setShowNew(v=>!v)}
            className="flex items-center gap-1.5 px-3 py-1.5 btn-accent text-white text-[10px] font-bold rounded-lg transition-colors">
            <Icon name="plus" size={11}/>New Ticket
          </button>
        </div>
      </div>

      {/* New ticket form */}
      {showNew && (
        <C><CH title="New Support Ticket"/>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Category</label>
                <select value={newCat} onChange={e=>setNewCat(e.target.value)}
                  className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                  {["Build","Account","Billing","Platform","Webhook","Other"].map(c=>(<option key={c}>{c}</option>))}
                </select>
              </div>
              <div>
                <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Priority</label>
                <select value={newPrio} onChange={e=>setNewPrio(e.target.value)}
                  className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                  {["low","medium","high","urgent"].map(p=>(<option key={p}>{p}</option>))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Title</label>
              <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Describe your issue…"
                className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:accent-border transition-colors"/>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Description</label>
              <textarea value={newDesc} onChange={e=>setNewDesc(e.target.value)} rows={3}
                placeholder="Additional details…"
                className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:accent-border transition-colors resize-none"/>
            </div>
            <div className="flex gap-2">
              <button onClick={submit} disabled={submitting}
                className="px-4 py-2 btn-accent text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1.5">
                {submitting && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>}
                Submit
              </button>
              <button onClick={()=>setShowNew(false)} className="px-4 py-2 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-xs font-bold rounded-lg hover:text-slate-200 transition-colors">{t("common.cancel")}</button>
            </div>
          </div>
        </C>
      )}

      {/* Ticket list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="w-6 h-6 border-2 accent-border border-t-cyan-500 rounded-full animate-spin"/>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Icon name="headset" size={28} className="text-slate-700"/>
          <p className="text-[11px] text-slate-500">{t("support.noTickets")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map(t=>(
            <C key={t.id} className={`border ${STATUS_BORDER[t.status] || "border-white/[0.06]"}`}>
              <div className="px-4 py-3 cursor-pointer hover:bg-white/[0.01] transition-colors"
                onClick={()=>setExpanded(expanded===t.id?null:t.id)}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-mono text-slate-600">{t.id?.slice(0,8)}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span>
                  <Badge s={t.status}/>
                  <span className="text-[9px] bg-slate-800 border border-white/[0.05] text-slate-400 px-1.5 py-0.5 rounded">{t.category}</span>
                  <p className="text-[11px] font-semibold text-slate-200 flex-1 truncate min-w-0">{t.title}</p>
                  {t.msg_count > 0 && (
                    <span className="text-[9px] text-slate-500 flex items-center gap-1">
                      <Icon name="chat" size={9}/>{t.msg_count}
                    </span>
                  )}
                  <span className="text-[9px] text-slate-600">{t.created_at?.slice(0,10)}</span>
                  <Icon name="chevD" size={10} className={`text-slate-600 transition-transform ${expanded===t.id?"rotate-180":""}`}/>
                </div>
              </div>

              {expanded===t.id && (
                <div className="px-4 pb-4 border-t border-white/[0.04] pt-3 space-y-3">
                  {/* Messages */}
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {(!t.messages || t.messages.length === 0) ? (
                      <p className="text-[11px] text-slate-500 italic">No messages yet</p>
                    ) : (
                      (typeof t.messages === 'string' ? JSON.parse(t.messages) : t.messages).map((m,i)=>(
                        <div key={i} className={`flex gap-2 ${m.from_role==="admin"?"flex-row-reverse":""}`}>
                          <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] ${m.from_role==="admin"?"bg-rose-900/30 border border-rose-500/20 text-rose-100":"bg-white/[0.04] border border-white/[0.06] text-slate-300"}`}>
                            <p className={`text-[8px] font-black mb-1 ${m.from_role==="admin"?"text-rose-400":"text-slate-500"}`}>
                              {m.from_role==="admin"?"⚙ Support":"👤 You"} · {m.created_at?.slice(11,16)}
                            </p>
                            {m.text}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Reply box — only if not closed/resolved */}
                  {!["resolved","closed"].includes(t.status) && (
                    <div className="flex gap-2">
                      <input
                        value={replyText[t.id] || ""}
                        onChange={e=>setReplyText(r=>({...r,[t.id]:e.target.value}))}
                        onKeyDown={e=>e.key==="Enter"&&sendReply(t.id)}
                        placeholder="Type a reply…"
                        className="flex-1 bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:accent-border transition-colors"/>
                      <button onClick={()=>sendReply(t.id)}
                        className="px-3 py-2 btn-accent text-white text-[10px] font-bold rounded-lg transition-colors">
                        <Icon name="send" size={12}/>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </C>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientSupport;
