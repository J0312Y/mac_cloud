// @ts-nocheck
import { useState, useEffect } from "react";
import Icon from "../ui/Icon.jsx";
import { C, CH } from "../ui/SharedUI.jsx";
import api from "../../lib/api.js";

const SCOPES = ["builds:read","builds:write","webhooks:read","webhooks:write","tokens:read"];

const SCOPE_DESC = {
  "builds:read":    "Lire la liste et les logs des builds",
  "builds:write":   "Soumettre et annuler des builds",
  "webhooks:read":  "Lire la liste des webhooks",
  "webhooks:write": "Créer/supprimer des webhooks",
  "tokens:read":    "Lire la liste des tokens",
};

// ── Guide tutoriel ────────────────────────────────────────────────────────────
const TutoSection = () => {
  const [open, setOpen] = useState(false);
  return (
    <C>
      <button onClick={() => setOpen(v => !v)}
        className="w-full px-4 py-3 flex items-center gap-2.5 hover:bg-white/[0.02] transition-colors">
        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
          <Icon name="book" size={13} className="text-cyan-400"/>
        </div>
        <div className="flex-1 text-left">
          <p className="text-[11px] font-bold text-slate-200">Guide d'utilisation — API Token</p>
          <p className="text-[9px] text-slate-500">Comment utiliser votre token dans vos pipelines CI/CD</p>
        </div>
        <Icon name={open ? "chevronUp" : "chevronDown"} size={13} className="text-slate-600"/>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-white/[0.05]">

          {/* Étape 1 */}
          <div className="pt-3">
            <p className="text-[10px] font-black text-slate-300 mb-2 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[9px] flex items-center justify-center font-black">1</span>
              Créer un token
            </p>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Donnez un nom descriptif à votre token (ex: "GitHub Actions", "Jenkins") et sélectionnez 
              uniquement les scopes nécessaires. Copiez le token immédiatement — il ne sera plus affiché.
            </p>
          </div>

          {/* Étape 2 */}
          <div>
            <p className="text-[10px] font-black text-slate-300 mb-2 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[9px] flex items-center justify-center font-black">2</span>
              Utiliser avec curl
            </p>
            <div className="bg-black/50 border border-white/[0.07] rounded-xl p-3 space-y-1">
              <p className="text-[9px] text-slate-500 mb-2 font-mono"># Soumettre un build via API</p>
              <pre className="text-[10px] text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">{`curl -X POST https://macbuild.cloud/api/build \\
  -H "Authorization: Bearer mbc_VOTRE_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "project": "MonApp",
    "repo_url": "https://github.com/vous/MonApp.git",
    "branch": "main",
    "xcode_version": "15.3"
  }'`}</pre>
            </div>
          </div>

          {/* Étape 3 */}
          <div>
            <p className="text-[10px] font-black text-slate-300 mb-2 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[9px] flex items-center justify-center font-black">3</span>
              GitHub Actions
            </p>
            <div className="bg-black/50 border border-white/[0.07] rounded-xl p-3">
              <p className="text-[9px] text-slate-500 mb-2 font-mono"># .github/workflows/ios-build.yml</p>
              <pre className="text-[10px] text-cyan-300 font-mono whitespace-pre-wrap leading-relaxed">
{[
  "name: iOS Build",
  "on:",
  "  push:",
  "    branches: [main]",
  "",
  "jobs:",
  "  build:",
  "    runs-on: ubuntu-latest",
  "    steps:",
  "      - name: Trigger Mac Build Cloud",
  "        run: |",
  "          curl -X POST \\",
  "            -H \"Authorization: Bearer $" + "{{ secrets.MACBUILD_TOKEN }}\" \\",
  "            -H \"Content-Type: application/json\" \\",
  "            -d '{\"project\":\"MonApp\",\"branch\":\"main\"}' \\",
  "            https://macbuild.cloud/api/build",
].join("\n")}
</pre>
            </div>
            <p className="text-[9px] text-slate-500 mt-2">
              💡 Ajoutez <code className="text-amber-400 font-mono">MACBUILD_TOKEN</code> dans vos secrets GitHub 
              (Settings → Secrets → Actions)
            </p>
          </div>

          {/* Étape 4 */}
          <div>
            <p className="text-[10px] font-black text-slate-300 mb-2 flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 text-[9px] flex items-center justify-center font-black">4</span>
              Vérifier le statut d'un build
            </p>
            <div className="bg-black/50 border border-white/[0.07] rounded-xl p-3">
              <pre className="text-[10px] text-emerald-400 font-mono whitespace-pre-wrap leading-relaxed">{`# Récupérer le statut
curl https://macbuild.cloud/api/build/BUILD_ID \\
  -H "Authorization: Bearer mbc_VOTRE_TOKEN"

# Réponse:
# { "id": "bld_xxx", "status": "success", "ipa_size": "42.3 MB" }`}</pre>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            <p className="text-[10px] text-amber-400 font-bold mb-1">⚠ Bonnes pratiques</p>
            <ul className="text-[9px] text-slate-400 space-y-1">
              <li>• Ne commitez jamais votre token dans votre code source</li>
              <li>• Créez un token par environnement (dev, staging, prod)</li>
              <li>• Révoquez immédiatement tout token compromis</li>
              <li>• Donnez le minimum de scopes nécessaires</li>
            </ul>
          </div>
        </div>
      )}
    </C>
  );
};

// ── Composant principal ───────────────────────────────────────────────────────
const ClientTokens = ({ addToast }) => {
  const [tokens,   setTokens]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [name,     setName]     = useState("");
  const [scopes,   setScopes]   = useState(["builds:read","builds:write"]);
  const [creating, setCreating] = useState(false);
  const [newToken, setNewToken] = useState(null);
  const [copied,   setCopied]   = useState(false);

  const load = async () => {
    try { const r = await api.tokens.list(); setTokens(r.tokens || []); }
    catch { addToast("Failed to load tokens", "error"); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name) return addToast("Enter a token name", "error");
    setCreating(true);
    try {
      const r = await api.tokens.create(name, scopes);
      setNewToken(r.token?.raw || r.raw || r.token?.token);
      setName(""); setScopes(["builds:read","builds:write"]);
      addToast("Token créé — copiez-le maintenant !", "warn");
      load();
    } catch(err) { addToast(err.message || "Failed to create", "error"); }
    finally { setCreating(false); }
  };

  const revoke = async (id) => {
    try { await api.tokens.revoke(id); addToast("Token révoqué", "warn"); load(); }
    catch { addToast("Failed to revoke", "error"); }
  };

  const copy = (val) => {
    navigator.clipboard?.writeText(val);
    setCopied(true);
    addToast("Token copié !", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleScope = (s) => setScopes(sc => sc.includes(s) ? sc.filter(x => x !== s) : [...sc, s]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl">

      {/* Guide */}
      <TutoSection/>

      {/* Token affiché une seule fois */}
      {newToken && (
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-4 space-y-2">
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
            ⚠ Copiez votre token maintenant — il ne sera plus affiché
          </p>
          <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-2.5">
            <code className="text-[11px] font-mono text-amber-300 flex-1 break-all">{newToken}</code>
            <button onClick={() => copy(newToken)} className="text-amber-400 hover:text-amber-300 transition-colors flex-shrink-0">
              <Icon name={copied ? "check" : "copy"} size={14}/>
            </button>
          </div>
          <button onClick={() => setNewToken(null)} className="text-[10px] text-slate-500 hover:text-slate-300">
            J'ai sauvegardé, fermer
          </button>
        </div>
      )}

      {/* Créer un token */}
      <C><CH title="Créer un token API"/>
        <div className="p-4 space-y-3">
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Nom du token</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="ex: GitHub Actions, Jenkins, CI Pipeline"
              className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:accent-border transition-colors"/>
          </div>
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Permissions (scopes)</label>
            <div className="space-y-1.5">
              {SCOPES.map(s => (
                <label key={s} onClick={() => toggleScope(s)}
                  className="flex items-center gap-2.5 cursor-pointer group">
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
                    scopes.includes(s) ? "accent-bg-dyn border-transparent" : "border-white/20 group-hover:border-white/40"
                  }`}>
                    {scopes.includes(s) && <Icon name="check" size={8} className="text-white"/>}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-slate-300">{s}</span>
                  <span className="text-[9px] text-slate-600">{SCOPE_DESC[s]}</span>
                </label>
              ))}
            </div>
          </div>
          <button onClick={create} disabled={creating}
            className="flex items-center gap-1.5 px-4 py-2 btn-accent text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60">
            {creating
              ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              : <Icon name="plus" size={11}/>}
            Créer le token
          </button>
        </div>
      </C>

      {/* Liste tokens */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="w-5 h-5 border-2 accent-border border-t-cyan-500 rounded-full animate-spin"/>
        </div>
      ) : tokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <Icon name="key" size={24} className="text-slate-700"/>
          <p className="text-[11px] text-slate-500">Aucun token — créez-en un ci-dessus</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tokens.map(tk => (
            <C key={tk.id}>
              <div className="px-4 py-3 flex items-center gap-3 flex-wrap">
                <div className="w-8 h-8 rounded-lg accent-badge-bg flex items-center justify-center flex-shrink-0">
                  <Icon name="key" size={14} className="accent-text"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-slate-200">{tk.name}</p>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                    mbc_••••••••  · Dernier usage: {tk.last_used || "jamais"}
                  </p>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {(tk.scopes || []).map(s => (
                      <span key={s} className="text-[8px] accent-badge-bg border accent-border accent-text px-1.5 py-0.5 rounded font-mono">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-slate-600">{tk.created_at?.slice(0,10)}</span>
                  <button onClick={() => revoke(tk.id)} className="text-slate-600 hover:text-red-400 transition-colors" title="Révoquer">
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

export default ClientTokens;