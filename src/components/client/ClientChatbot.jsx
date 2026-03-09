// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import Icon from "../ui/Icon.jsx";

/* ═══ CLIENT CHATBOT ═══ */
const CHAT_SUGGESTIONS = [
  "How do I submit a new build?",
  "Why did my build fail with CS-001?",
  "How do I add a provisioning profile?",
  "How do I invite team members?",
  "What's the difference between plans?",
  "How do I set up webhooks?",
  "How do I get my API token?",
];

const CHAT_KB = {
  "submit":      { answer: "Go to **New Build** in the sidebar. Paste your GitHub/GitLab repo URL, select your branch, Xcode version and region, attach a certificate + provisioning profile, then click **Start Build**. Your build will be queued and start automatically." },
  "cs-001":      { answer: "Error **CS-001** means your code signing certificate or provisioning profile has expired. Go to **Certificates** and **Provisioning Profiles** to upload fresh ones, then resubmit your build." },
  "xc-065":      { answer: "Error **XC-065** means xcodebuild exited with code 65 — usually a missing dependency (e.g. a CocoaPod not in Podfile.lock). Check that your Podfile is committed and all pods are resolved before building." },
  "profile":     { answer: "Go to **Security → Prov. Profiles** in the sidebar, click **Upload Profile**, and select your `.mobileprovision` file. It will be available when submitting your next build." },
  "certificate": { answer: "Go to **Security → Certificates**, click **Upload Certificate**, and upload your `.p12` file with its password. Make sure it hasn't expired — expiry is shown in the list." },
  "team":        { answer: "Open **Account → Team** in the sidebar. Enter a teammate's email, select their role (Developer or Viewer), and click **Send Invite**. They'll receive an email with a login link." },
  "webhook":     { answer: "Go to **Integrations → Webhooks**, paste your endpoint URL, select which events to receive (`build.success`, `build.failed`, etc.), and click **Add Webhook**. Use the **Test** button to fire a test payload." },
  "token":       { answer: "Go to **Integrations → API Tokens**, click **New Token**, give it a name and select scopes. Your token is shown **once** — copy it immediately. Use it in the `Authorization: Bearer <token>` header." },
  "plan":        { answer: "**Starter** ($29/mo) — 200 builds, 20 Mac hours. **Pro** ($79/mo) — 1000 builds, 100 Mac hours, priority queue. **Team** ($199/mo) — unlimited builds, 500 Mac hours, 25 seats. Upgrade in **Billing**." },
  "billing":     { answer: "Open **Account → Billing** to see your current plan, manage your payment method, and download invoices. Click **Upgrade** to switch to a higher plan instantly." },
  "queue":       { answer: "There is one shared Mac mini build machine. If it's busy, your build enters a queue. You can see your queue position and estimated start time on the **Dashboard** and in the **My Builds** list." },
  "log":         { answer: "Click the terminal icon (⌨) next to any build in **My Builds** to open the full build log. You can download the raw log or — for successful builds — download the `.ipa` artifact." },
  "ipa":         { answer: "Once a build succeeds, a download icon (⬇) appears next to it in **My Builds**. Click it to download the `.ipa` file directly to your computer." },
  "support":     { answer: "Open **Help → Support** to create a ticket. Our team responds within 24 hours. For urgent issues, add **priority: high** when submitting the ticket." },
  "default":     { answer: "I can help with builds, certificates, provisioning profiles, team management, webhooks, API tokens, plans, and billing. Try asking something like *\"Why did my build fail?\"* or *\"How do I add a team member?\"*" },
};

function chatAnswer(msg) {
  const m = msg.toLowerCase();
  if (m.includes("submit") || m.includes("new build") || m.includes("start build")) return CHAT_KB.submit;
  if (m.includes("cs-001") || m.includes("code sign") || m.includes("signing")) return CHAT_KB["cs-001"];
  if (m.includes("xc-065") || m.includes("exit 65") || m.includes("xcodebuild")) return CHAT_KB["xc-065"];
  if (m.includes("profile") || m.includes("mobileprovision")) return CHAT_KB.profile;
  if (m.includes("cert")) return CHAT_KB.certificate;
  if (m.includes("team") || m.includes("invite") || m.includes("member")) return CHAT_KB.team;
  if (m.includes("webhook")) return CHAT_KB.webhook;
  if (m.includes("token") || m.includes("api key")) return CHAT_KB.token;
  if (m.includes("plan") || m.includes("starter") || m.includes("pro") || m.includes("pricing")) return CHAT_KB.plan;
  if (m.includes("bill") || m.includes("invoice") || m.includes("upgrade") || m.includes("payment")) return CHAT_KB.billing;
  if (m.includes("queue") || m.includes("wait") || m.includes("position")) return CHAT_KB.queue;
  if (m.includes("log") || m.includes("output") || m.includes("console")) return CHAT_KB.log;
  if (m.includes("ipa") || m.includes("download") || m.includes("artifact")) return CHAT_KB.ipa;
  if (m.includes("support") || m.includes("ticket") || m.includes("help") || m.includes("contact")) return CHAT_KB.support;
  return CHAT_KB.default;
}

function renderMd(text) {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
}

const ClientChatbot = ({ setPage }) => {
  const [open, setOpen]   = useState(false);
  const [msgs, setMsgs]   = useState([
    { id:1, from:"bot", text:"👋 Hi! I'm the Mac Build Cloud assistant. Ask me anything about builds, certificates, billing, or your account." }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, typing]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  const send = (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput("");
    const uid = Date.now();
    setMsgs(m => [...m, { id: uid, from:"user", text: q }]);
    setTyping(true);
    setTimeout(() => {
      const kb = chatAnswer(q);
      setMsgs(m => [...m, { id: uid+1, from:"bot", text: kb.answer, action: kb.action }]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-5 z-[1000] w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        title="AI Assistant"
      >
        {open
          ? <Icon name="x" size={18} className="text-white"/>
          : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        }
        {!open && msgs.filter(m=>m.from==="bot").length > 1 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet-400 rounded-full text-[8px] flex items-center justify-center text-white font-black animate-pulse">
            {msgs.filter(m=>m.from==="bot").length}
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-20 right-5 z-[999] w-80 flex flex-col bg-[#13111f] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
          style={{height:420}}>
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-violet-600/20 to-indigo-600/10 border-b border-white/[0.06]">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div>
              <p className="text-[11px] font-black text-white">Build Assistant</p>
              <p className="text-[9px] text-violet-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"/>Online</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-slate-600 hover:text-slate-300 transition-colors"><Icon name="x" size={13}/></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {msgs.map(msg => (
              <div key={msg.id} className={`flex ${msg.from==="user"?"justify-end":"justify-start"}`}>
                {msg.from==="bot" && (
                  <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mr-1.5 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                )}
                <div className={`max-w-[78%] rounded-xl px-3 py-2 text-[11px] leading-relaxed ${msg.from==="user" ? "bg-violet-600 text-white rounded-br-sm" : "bg-[#1e1b2e] border border-white/[0.06] text-slate-300 rounded-bl-sm"}`}>
                  <span dangerouslySetInnerHTML={{ __html: renderMd(msg.text) }}/>
                  {msg.action && (
                    <button onClick={() => { msg.action(setPage); setOpen(false); }}
                      className="mt-1.5 flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 font-bold transition-colors">
                      <Icon name="arrowR" size={9}/>Go there
                    </button>
                  )}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center mr-1.5 mt-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div className="bg-[#1e1b2e] border border-white/[0.06] rounded-xl rounded-bl-sm px-3 py-2 flex gap-1 items-center">
                  {[0,1,2].map(i=><span key={i} className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Quick suggestions */}
          <div className="px-3 pb-1 flex gap-1.5 overflow-x-auto scrollbar-none">
            {CHAT_SUGGESTIONS.slice(0,3).map(s=>(
              <button key={s} onClick={()=>send(s)}
                className="flex-shrink-0 text-[9px] bg-white/[0.04] border border-white/[0.06] text-slate-500 hover:text-violet-400 hover:border-violet-500/30 px-2 py-1 rounded-full transition-colors whitespace-nowrap">
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-3 pt-1 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&send()}
              placeholder="Ask anything…"
              className="flex-1 bg-black/30 border border-white/[0.07] rounded-xl px-3 py-2 text-[11px] text-slate-300 outline-none focus:border-violet-500/40 transition-colors placeholder:text-slate-700"
            />
            <button onClick={()=>send()}
              disabled={!input.trim()}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ClientChatbot;
