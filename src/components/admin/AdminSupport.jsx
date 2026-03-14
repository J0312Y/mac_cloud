// @ts-nocheck
import { useState, useEffect } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";
import api from "../../lib/api.js";
import { useApp } from "../../i18n/AppContext.jsx";

const PRIORITY_COLOR = {
  low:    "text-slate-400 bg-slate-800/50 border-slate-600/20",
  medium: "text-sky-400 bg-sky-900/20 border-sky-500/20",
  high:   "text-amber-400 bg-amber-900/20 border-amber-500/20",
  urgent: "accent-text-dyn bg-red-900/20 accent-bd-dyn",
};
const STATUS_BORDER = {
  open:          "border-amber-500/20",
  "in-progress": "border-sky-500/20",
  resolved:      "border-emerald-500/20",
  closed:        "border-slate-500/10",
};
const STATUSES = ["open","in-progress","resolved","closed"];

const AdminSupport = ({ addToast }) => {
  const { t } = useApp();
  const [tickets, setTickets]   = useState([]);
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [replyText, setReplyText] = useState({});
  const [updating, setUpdating]   = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.tickets.adminList({ limit: 200 });
      setTickets(res.tickets || []);
    } catch { addToast("Failed to load tickets", "error"); }
    finally { setLoading(false); }
  };

  const loadTicketMessages = async (ticketId) => {
    try {
      const res = await api.tickets.get(ticketId);
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, messages: res.ticket.messages } : t));
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const sendReply = async (ticketId) => {
    const text = replyText[ticketId]?.trim();
    if (!text) return;
    try {
      await api.tickets.reply(ticketId, text);
      setReplyText(r => ({ ...r, [ticketId]: "" }));
      addToast("Reply sent", "success");
      await loadTicketMessages(ticketId);
      load();
    } catch { addToast("Failed to send reply", "error"); }
  };

  const changeStatus = async (ticketId, status) => {
    setUpdating(u => ({ ...u, [ticketId]: true }));
    try {
      await api.tickets.update(ticketId, { status });
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
      addToast(`Ticket ${status}`, "success");
    } catch { addToast("Failed to update", "error"); }
    finally { setUpdating(u => ({ ...u, [ticketId]: false })); }
  };

  const filtered = tickets.filter(t =>
    (filter === "all" || t.status === filter) &&
    (t.title + (t.user_name||"") + (t.user_email||"")).toLowerCase().includes(search.toLowerCase())
  );

  const counts = Object.fromEntries(
    STATUSES.map(s => [s, tickets.filter(t => t.status === s).length])
  );
  const openCount = counts["open"] + (counts["in-progress"]||0);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Stats */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-3 flex-wrap">
          {[["open","text-amber-400"],["in-progress","text-sky-400"],["resolved","text-emerald-400"],["closed","text-slate-400"]].map(([s,c])=>(
            <div key={s} className="bg-[#13111f] border border-white/[0.06] rounded-lg px-3 py-2">
              <p className="text-[9px] text-slate-500 capitalize">{s}</p>
              <p className={`text-xl font-black font-mono ${c}`}>{loading?"…":counts[s]||0}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Icon name="search" size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-600"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…"
              className="bg-black/30 border border-white/[0.07] rounded-lg pl-7 pr-3 py-1.5 text-xs text-slate-300 outline-none w-44"/>
          </div>
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.05] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors">
            <Icon name="refresh" size={11}/>Refresh
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {["all",...STATUSES].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            className={`px-2.5 py-1 rounded-lg text-[9px] capitalize font-bold transition-colors ${filter===f?"accent-bg-dyn/25 accent-text-dyn border accent-bd-dyn":"text-slate-500 hover:text-slate-300"}`}>
            {f} ({f==="all" ? tickets.length : counts[f]||0})
          </button>
        ))}
      </div>

      {/* Ticket list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="w-6 h-6 border-2 accent-bd-dyn accent-spin-t-dyn rounded-full animate-spin"/>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Icon name="headset" size={28} className="text-slate-700"/>
          <p className="text-[11px] text-slate-500">No tickets {filter !== "all" ? `with status "${filter}"` : ""}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(t=>(
            <C key={t.id} className={`border ${STATUS_BORDER[t.status] || "border-white/[0.06]"}`}>
              {/* Header */}
              <div className="px-4 py-3 cursor-pointer hover:bg-white/[0.01] transition-colors"
                onClick={async()=>{ const open=expanded!==t.id; setExpanded(open?t.id:null); if(open) await loadTicketMessages(t.id); }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-mono text-slate-600">{t.id?.slice(0,8)}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${PRIORITY_COLOR[t.priority]}`}>{t.priority}</span>
                  <Badge s={t.status}/>
                  <span className="text-[9px] bg-slate-800 border border-white/[0.05] text-slate-400 px-1.5 py-0.5 rounded">{t.category}</span>
                  <p className="text-[11px] font-semibold text-slate-200 flex-1 truncate min-w-0">{t.title}</p>
                  <div className="flex items-center gap-1 text-[9px] text-slate-500">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-[var(--accent)] to-[var(--accent-80)] flex items-center justify-center text-[7px] font-black text-white">{t.user_name?.[0]}</div>
                    {t.user_name || t.user_email}
                  </div>
                  {t.msg_count > 0 && (
                    <span className="text-[9px] text-slate-500 flex items-center gap-1">
                      <Icon name="chat" size={9}/>{t.msg_count}
                    </span>
                  )}
                  <span className="text-[9px] text-slate-600">{t.created_at?.slice(0,10)}</span>
                  <Icon name="chevD" size={10} className={`text-slate-600 transition-transform ${expanded===t.id?"rotate-180":""}`}/>
                </div>
              </div>

              {/* Expanded */}
              {expanded===t.id && (
                <div className="px-4 pb-4 border-t border-white/[0.04] pt-3 space-y-3">
                  {/* Status + Assign controls */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest">Status:</span>
                      <div className="flex gap-1">
                        {STATUSES.map(s=>(
                          <button key={s} onClick={()=>changeStatus(t.id,s)} disabled={updating[t.id]}
                            className={`px-2 py-0.5 rounded text-[9px] font-bold transition-colors border ${t.status===s?"accent-bg-dyn/25 accent-text-dyn accent-bd-dyn":"text-slate-500 border-white/[0.07] hover:text-slate-300"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500">
                      <Icon name="mail" size={9}/>{t.user_email}
                    </div>
                  </div>

                  {/* Messages thread */}
                  <div className="space-y-2 max-h-80 overflow-y-auto bg-black/20 rounded-xl p-3">
                    {!t.messages || t.messages.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic text-center py-4">No messages yet</p>
                    ) : (
                      t.messages.map((m,i)=>(
                        <div key={i} className={`flex gap-2 ${m.from_role==="admin"?"flex-row-reverse":""}`}>
                          <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] ${m.from_role==="admin"?"bg-rose-900/30 border accent-bd-dyn text-rose-100":"bg-white/[0.04] border border-white/[0.06] text-slate-300"}`}>
                            <p className={`text-[8px] font-black mb-1 ${m.from_role==="admin"?"accent-text-dyn":"text-slate-500"}`}>
                              {m.from_role==="admin"?"⚙ Support":"👤"+t.user_name} · {m.created_at?.slice(11,16)}
                            </p>
                            {m.text}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Admin reply box */}
                  <div className="flex gap-2">
                    <input
                      value={replyText[t.id] || ""}
                      onChange={e=>setReplyText(r=>({...r,[t.id]:e.target.value}))}
                      onKeyDown={e=>e.key==="Enter"&&sendReply(t.id)}
                      placeholder="Reply to user…"
                      className="flex-1 bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:accent-bd-dyn transition-colors"/>
                    <button onClick={()=>sendReply(t.id)}
                      className="px-3 py-2 accent-bg-dyn hover:accent-bg-dyn text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1.5">
                      <Icon name="send" size={12}/>Send
                    </button>
                  </div>
                </div>
              )}
            </C>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSupport;
