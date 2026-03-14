 // @ts-nocheck
import { useState, useEffect } from "react";
import Icon from "../ui/Icon.jsx";
import { C, CH } from "../ui/SharedUI.jsx";
import api from "../../lib/api.js";

const EVENTS = ["build.success","build.failed","build.queued"];

const EVENT_DESC = {
  "build.success": "Déclenché quand un build réussit et l'IPA est prêt",
  "build.failed":  "Déclenché quand un build échoue avec le code d'erreur",
  "build.queued":  "Déclenché quand un build est ajouté à la file",
};

// ── Guide ─────────────────────────────────────────────────────────────────────
const TutoSection = () => {
  const [open, setOpen] = useState(false);
  return (
    <C>
      <button onClick={() => setOpen(v => !v)}
        className="w-full px-4 py-3 flex items-center gap-2.5 hover:bg-white/[0.02] transition-colors">
        <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
          <Icon name="book" size={13} className="text-purple-400"/>
        </div>
        <div className="flex-1 text-left">
          <p className="text-[11px] font-bold text-slate-200">Guide d'utilisation — Webhooks</p>
          <p className="text-[9px] text-slate-500">Recevez des notifications automatiques dans vos outils</p>
        </div>
        <Icon name={open ? "chevronUp" : "chevronDown"} size={13} className="text-slate-600"/>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/[0.05]">

          <div className="pt-3">
            <p className="text-[10px] font-black text-slate-300 mb-2 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 text-[9px] flex items-center justify-center font-black">1</span>
              Format du payload envoyé
            </p>
            <div className="bg-black/50 border border-white/[0.07] rounded-xl p-3">
              <p className="text-[9px] text-slate-500 mb-2 font-mono"># POST vers votre URL à chaque événement</p>
              <pre className="text-[10px] text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">{`{
  "event": "build.success",
  "build_id": "bld_abc123",
  "project": "MonApp",
  "branch": "main",
  "status": "success",
  "duration_ms": 187432,
  "ipa_size": "42.3 MB",
  "triggered_by": "john@example.com",
  "timestamp": "2026-03-13T10:22:00Z"
}`}</pre>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-slate-300 mb-2 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 text-[9px] flex items-center justify-center font-black">2</span>
              Intégration Slack
            </p>
            <div className="bg-black/50 border border-white/[0.07] rounded-xl p-3">
              <p className="text-[9px] text-slate-500 mb-2 font-mono"># Créez un Incoming Webhook dans Slack</p>
              <pre className="text-[10px] text-cyan-300 font-mono whitespace-pre-wrap leading-relaxed">{`1. Allez sur api.slack.com/apps
2. Créez une app → Incoming Webhooks → ON
3. Copiez l'URL: https://hooks.slack.com/services/xxx
4. Collez-la dans le champ URL ci-dessous
5. Sélectionnez build.success et build.failed`}</pre>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-slate-300 mb-2 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 text-[9px] flex items-center justify-center font-black">3</span>
              Recevoir dans votre propre serveur (Node.js)
            </p>
            <div className="bg-black/50 border border-white/[0.07] rounded-xl p-3">
              <pre className="text-[10px] text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">{`const express = require('express');
const crypto  = require('crypto');
const app = express();

app.post('/webhook', express.json(), (req, res) => {
  // Vérifier la signature (si secret configuré)
  const sig = req.headers['x-macbuild-signature'];
  const expected = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
  if (sig !== expected) return res.status(401).end();

  const { event, project, status, build_id } = req.body;
  
  if (event === 'build.success') {
    console.log(\`✅ \${project} build ready: \${build_id}\`);
    // Télécharger l'IPA, envoyer sur TestFlight, etc.
  }
  
  res.status(200).json({ ok: true });
});`}</pre>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-black text-slate-300 mb-2 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 text-[9px] flex items-center justify-center font-black">4</span>
              Discord
            </p>
            <div className="bg-black/50 border border-white/[0.07] rounded-xl p-3">
              <pre className="text-[10px] text-cyan-300 font-mono whitespace-pre-wrap leading-relaxed">{`1. Paramètres du canal Discord → Intégrations
2. Webhooks → Nouveau webhook
3. Copiez l'URL Discord
4. Ajoutez /slack à la fin de l'URL:
   https://discord.com/api/webhooks/xxx/yyy/slack
5. Collez dans le champ URL ci-dessous`}</pre>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
            <p className="text-[10px] text-blue-400 font-bold mb-1">💡 Conseils</p>
            <ul className="text-[9px] text-slate-400 space-y-1">
              <li>• Utilisez le bouton "Test" pour vérifier que votre endpoint répond</li>
              <li>• Le secret signe le payload avec HMAC-SHA256 pour vérifier l'authenticité</li>
              <li>• Votre endpoint doit répondre en moins de 5 secondes</li>
              <li>• En cas d'échec, le webhook est retenté 3 fois</li>
            </ul>
          </div>
        </div>
      )}
    </C>
  );
};

// ── Composant principal ───────────────────────────────────────────────────────
const ClientWebhooks = ({ addToast }) => {
  const [webhooks, setWebhooks] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [url,      setUrl]      = useState("");
  const [secret,   setSecret]   = useState("");
  const [events,   setEvents]   = useState(["build.success","build.failed"]);
  const [adding,   setAdding]   = useState(false);
  const [testing,  setTesting]  = useState({});

  const load = async () => {
    try { const r = await api.webhooks.list(); setWebhooks(r.webhooks || []); }
    catch { addToast("Failed to load webhooks", "error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!url) return addToast("Entrez une URL", "error");
    if (!url.startsWith("http")) return addToast("L'URL doit commencer par http(s)://", "error");
    setAdding(true);
    try {
      await api.webhooks.create(url, events, secret || undefined);
      setUrl(""); setSecret(""); setEvents(["build.success","build.failed"]);
      addToast("Webhook ajouté ✓", "success");
      load();
    } catch(err) { addToast(err.message || "Failed to add", "error"); }
    finally { setAdding(false); }
  };

  const remove = async (id) => {
    try { await api.webhooks.remove(id); addToast("Webhook supprimé", "warn"); load(); }
    catch { addToast("Failed to remove", "error"); }
  };

  const test = async (w) => {
    setTesting(t => ({ ...t, [w.id]: true }));
    try {
      await api.webhooks.test(w.id);
      addToast("Webhook a répondu 200 OK ✓", "success");
    } catch {
      addToast("Le webhook n'a pas répondu correctement", "error");
    } finally {
      setTesting(t => ({ ...t, [w.id]: false }));
    }
  };

  const toggleEvent = (e) => setEvents(ev => ev.includes(e) ? ev.filter(x => x !== e) : [...ev, e]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl">

      <TutoSection/>

      <C><CH title="Ajouter un Webhook"/>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">URL de destination</label>
            <input value={url} onChange={e => setUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/... ou votre serveur"
              className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:accent-border transition-colors"/>
          </div>
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">
              Secret de signature <span className="text-slate-600 normal-case">(optionnel — recommandé)</span>
            </label>
            <input value={secret} onChange={e => setSecret(e.target.value)}
              placeholder="Clé secrète pour vérifier l'authenticité"
              type="password"
              className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:accent-border transition-colors"/>
          </div>
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Événements</label>
            <div className="space-y-1.5">
              {EVENTS.map(e => (
                <label key={e} onClick={() => toggleEvent(e)}
                  className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                    events.includes(e) ? "bg-purple-500 border-transparent" : "border-white/20 group-hover:border-white/40"
                  }`}>
                    {events.includes(e) && <Icon name="check" size={8} className="text-white"/>}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-300">{e}</span>
                  <span className="text-[9px] text-slate-600">{EVENT_DESC[e]}</span>
                </label>
              ))}
            </div>
          </div>
          <button onClick={add} disabled={adding}
            className="flex items-center gap-1.5 px-4 py-2 btn-accent text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60">
            {adding
              ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : <Icon name="plus" size={11}/>}
            Ajouter
          </button>
        </div>
      </C>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="w-5 h-5 border-2 accent-border border-t-cyan-500 rounded-full animate-spin"/>
        </div>
      ) : webhooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <Icon name="send" size={24} className="text-slate-700"/>
          <p className="text-[11px] text-slate-500">Aucun webhook — ajoutez-en un ci-dessus</p>
        </div>
      ) : (
        <div className="space-y-2">
          {webhooks.map(w => (
            <C key={w.id}>
              <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${w.status === "active" ? "bg-emerald-400" : "bg-slate-600"}`}/>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-mono text-slate-300 truncate">{w.url}</p>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    {(w.events || []).join(" · ")} · dernier envoi: {w.last_sent || "jamais"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => test(w)} disabled={testing[w.id]}
                    className="px-2.5 py-1 accent-badge-bg border accent-border accent-text text-[10px] font-bold rounded-lg disabled:opacity-60">
                    {testing[w.id] ? "Test…" : "Test"}
                  </button>
                  <button onClick={() => remove(w.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                    <Icon name="trash" size={12}/>
                  </button>
                </div>
              </div>
            </C>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientWebhooks;