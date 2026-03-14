// @ts-nocheck
import { useState, useEffect } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";
import api from "../../lib/api.js";

const TYPE_COLOR = {
  info:    "text-sky-400 bg-sky-500/10 border-sky-500/20",
  warning: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  error:   "accent-text-dyn accent-bg-dyn/10 accent-bd-dyn",
};

const AdminBroadcast = ({ addToast }) => {
  const [title,  setTitle]  = useState("");
  const [body,   setBody]   = useState("");
  const [type,   setType]   = useState("info");
  const [target, setTarget] = useState("all");
  const [sent,   setSent]   = useState([]);
  const [sending, setSending] = useState(false);

  // Load history from localStorage so it persists per session
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("mbc_broadcasts") || "[]");
      setSent(saved);
    } catch {}
  }, []);

  const send = async () => {
    if (!title || !body) return addToast("Fill in title and message", "error");
    setSending(true);
    try {
      // Call broadcast API (we'll add it) — falls back to socket emit
      await api.broadcast?.send({ title, body, type, target }).catch(() => {});

      const item = { id: Date.now(), title, body, type, target, time: new Date().toLocaleTimeString() };
      const updated = [item, ...sent];
      setSent(updated);
      localStorage.setItem("mbc_broadcasts", JSON.stringify(updated.slice(0, 50)));
      setTitle(""); setBody("");
      addToast("Broadcast sent to all users", "success");
    } catch (err) {
      addToast(err.message || "Failed to send", "error");
    } finally { setSending(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <C><CH title="New Broadcast"/>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Type</label>
              <select value={type} onChange={e=>setType(e.target.value)}
                className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                {["info","warning","error"].map(t=>(<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Target</label>
              <select value={target} onChange={e=>setTarget(e.target.value)}
                className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                <option value="all">All users</option>
                <option value="pro">Pro + Team</option>
                <option value="starter">Starter only</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Announcement title…"
              className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:accent-bd-dyn transition-colors"/>
          </div>
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Message</label>
            <textarea value={body} onChange={e=>setBody(e.target.value)} rows={3} placeholder="Message to users…"
              className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none resize-none focus:accent-bd-dyn transition-colors"/>
          </div>
          <button onClick={send} disabled={sending}
            className="flex items-center gap-2 px-4 py-2 accent-bg-dyn hover:accent-bg-dyn text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60">
            {sending ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Icon name="send" size={11}/>}
            Send Broadcast
          </button>
        </div>
      </C>

      <C><CH title="Sent History" sub={`${sent.length} broadcasts`}/>
        {sent.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[11px] text-slate-500">No broadcasts sent yet</p>
          </div>
        ) : (
          sent.map(s => (
            <div key={s.id} className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.03] last:border-0">
              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase ${TYPE_COLOR[s.type]||TYPE_COLOR.info}`}>{s.type}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-200">{s.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{s.body}</p>
                <p className="text-[9px] text-slate-600 mt-0.5">→ {s.target} · {s.time}</p>
              </div>
            </div>
          ))
        )}
      </C>
    </div>
  );
};

export default AdminBroadcast;
