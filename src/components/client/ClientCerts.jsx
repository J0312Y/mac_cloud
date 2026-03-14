// @ts-nocheck
import { useState, useEffect, useRef } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";
import api from "../../lib/api.js";
import { useApp } from "../../i18n/AppContext.jsx";

const API = import.meta.env.VITE_API_URL || "http://213.156.133.182:3001/api";
const tok = () => localStorage.getItem("mbc_token");

const ClientCerts = ({ addToast }) => {
  const { t } = useApp();
  const [certs,   setCerts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [tab,     setTab]     = useState("file"); // "file" | "manual"
  const [adding,  setAdding]  = useState(false);
  const [progress,setProgress]= useState(0);
  const fileRef = useRef(null);

  // Formulaire upload
  const [file,     setFile]     = useState(null);
  const [form, setForm] = useState({
    name: "", type: "distribution", expires_at: "", p12_password: "", team_id: "", bundle_id: ""
  });

  const load = async () => {
    try { const r = await api.certs.list(); setCerts(r.certs||[]); }
    catch { addToast("Failed to load certificates", "error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const daysLeft = (exp) => exp ? Math.ceil((new Date(exp) - new Date()) / (1000*86400)) : null;

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (!form.name) setForm(x => ({ ...x, name: f.name.replace(/\.[^.]+$/, "") }));
  };

  // Upload réel avec FormData
  const uploadFile = async () => {
    if (!file) return addToast("Sélectionnez un fichier .p12", "error");
    if (!form.name) return addToast("Nom requis", "error");
    setAdding(true);
    setProgress(0);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", form.name);
      fd.append("type", form.type);
      if (form.expires_at)   fd.append("expires_at", form.expires_at);
      if (form.p12_password) fd.append("p12_password", form.p12_password);
      if (form.team_id)      fd.append("team_id", form.team_id);
      if (form.bundle_id)    fd.append("bundle_id", form.bundle_id);

      // XHR pour la progress bar
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
          else reject(new Error(JSON.parse(xhr.responseText)?.error || "Upload failed"));
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.open("POST", `${API}/certs/upload`);
        xhr.setRequestHeader("Authorization", `Bearer ${tok()}`);
        xhr.send(fd);
      });

      addToast("✅ Certificat uploadé et chiffré", "success");
      setFile(null);
      setForm({ name:"", type:"distribution", expires_at:"", p12_password:"", team_id:"", bundle_id:"" });
      setShowAdd(false);
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (err) {
      addToast(err.message || "Upload échoué", "error");
    } finally {
      setAdding(false);
      setProgress(0);
    }
  };

  // Ajout manuel (sans fichier)
  const addManual = async () => {
    if (!form.name || !form.expires_at) return addToast("Nom et date d'expiration requis", "error");
    setAdding(true);
    try {
      await api.certs.create({ name: form.name, type: form.type, expires_at: form.expires_at, team_id: form.team_id, bundle_id: form.bundle_id });
      addToast("Certificat ajouté", "success");
      setForm({ name:"", type:"distribution", expires_at:"", p12_password:"", team_id:"", bundle_id:"" });
      setShowAdd(false);
      load();
    } catch (err) { addToast(err.message || "Erreur", "error"); }
    finally { setAdding(false); }
  };

  const download = async (cert) => {
    try {
      const r = await fetch(`${API}/certs/${cert.id}/download`, { headers: { Authorization: `Bearer ${tok()}` } });
      if (!r.ok) throw new Error("Download failed");
      const blob = await r.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url; a.download = `${cert.name}.p12`; a.click();
      URL.revokeObjectURL(url);
    } catch { addToast("Téléchargement échoué", "error"); }
  };

  const remove = async (id) => {
    try { await api.certs.remove(id); addToast("Certificat supprimé", "warn"); load(); }
    catch { addToast("Échec suppression", "error"); }
  };

  const fmtSize = (b) => b ? (b > 1024*1024 ? `${(b/1024/1024).toFixed(1)} MB` : `${Math.round(b/1024)} KB`) : null;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-[10px] text-slate-500">{certs.length}/5 slots · {certs.filter(c=>c.has_file).length} avec fichier</p>
        <button onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 accent-bg-dyn text-white text-[10px] font-bold rounded-lg">
          <Icon name={showAdd ? "x" : "plus"} size={11}/>{showAdd ? "Annuler" : "Ajouter un certificat"}
        </button>
      </div>

      {showAdd && (
        <C>
          <CH title="Ajouter un certificat"/>
          {/* Tabs */}
          <div className="flex border-b border-white/[0.05]">
            {[["file","📁 Upload .p12"],["manual","✏️ Manuel"]].map(([k,label]) => (
              <button key={k} onClick={() => setTab(k)}
                className={`px-4 py-2.5 text-[11px] font-bold transition-colors ${tab===k ? "accent-text-dyn border-b-2 accent-border-dyn" : "text-slate-500 hover:text-slate-300"}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-3">
            {tab === "file" ? (
              <>
                {/* Zone de drop */}
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setFile(f); if (!form.name) setForm(x=>({...x,name:f.name.replace(/\.[^.]+$/,"")})); } }}
                  className="border-2 border-dashed border-white/[0.1] hover:border-[var(--ca)] rounded-xl p-6 text-center cursor-pointer transition-colors">
                  <input ref={fileRef} type="file" accept=".p12,.pfx,.cer,.pem" onChange={handleFile} className="hidden"/>
                  {file ? (
                    <div className="flex items-center justify-center gap-3">
                      <Icon name="shield" size={20} className="accent-text-dyn"/>
                      <div className="text-left">
                        <p className="text-xs font-bold text-slate-200">{file.name}</p>
                        <p className="text-[10px] text-slate-500">{fmtSize(file.size)}</p>
                      </div>
                      <button onClick={e=>{e.stopPropagation();setFile(null);if(fileRef.current)fileRef.current.value="";}}
                        className="text-slate-600 hover:text-red-400 ml-2"><Icon name="x" size={12}/></button>
                    </div>
                  ) : (
                    <>
                      <Icon name="upload" size={24} className="text-slate-600 mx-auto mb-2"/>
                      <p className="text-xs text-slate-400">Glisser-déposer ou cliquer</p>
                      <p className="text-[10px] text-slate-600 mt-1">.p12 · .pfx · .cer · .pem — max 10MB</p>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-1">Nom</label>
                    <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="iPhone Distribution"
                      className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-[var(--ca)]"/>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-1">Type</label>
                    <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}
                      className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                      {["distribution","development","enterprise","adhoc"].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-1">Mot de passe .p12</label>
                    <input type="password" value={form.p12_password} onChange={e=>setForm(f=>({...f,p12_password:e.target.value}))} placeholder="optionnel"
                      className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-[var(--ca)]"/>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-1">Date d'expiration</label>
                    <input type="date" value={form.expires_at} onChange={e=>setForm(f=>({...f,expires_at:e.target.value}))}
                      className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-[var(--ca)]"/>
                  </div>
                </div>

                {progress > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-500">
                      <span>Upload en cours...</span><span>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <div className="h-full accent-bg-dyn transition-all duration-300" style={{width:`${progress}%`}}/>
                    </div>
                  </div>
                )}

                <button onClick={uploadFile} disabled={adding || !file}
                  className="flex items-center gap-1.5 px-4 py-2 accent-bg-dyn text-white text-xs font-bold rounded-lg disabled:opacity-50">
                  {adding ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Icon name="upload" size={12}/>}
                  {adding ? "Upload en cours..." : "Uploader et chiffrer"}
                </button>
                <p className="text-[9px] text-slate-600">🔐 Stocké chiffré AES-256-GCM — jamais transmis en clair</p>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-1">Nom</label>
                    <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="iPhone Distribution"
                      className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-[var(--ca)]"/>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-1">Type</label>
                    <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}
                      className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                      {["distribution","development","enterprise","adhoc"].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-1">Team ID</label>
                    <input value={form.team_id} onChange={e=>setForm(f=>({...f,team_id:e.target.value}))} placeholder="ABCD123456"
                      className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-[var(--ca)]"/>
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 block mb-1">Date d'expiration</label>
                    <input type="date" value={form.expires_at} onChange={e=>setForm(f=>({...f,expires_at:e.target.value}))}
                      className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-[var(--ca)]"/>
                  </div>
                </div>
                <button onClick={addManual} disabled={adding}
                  className="flex items-center gap-1.5 px-4 py-2 accent-bg-dyn text-white text-xs font-bold rounded-lg disabled:opacity-50">
                  {adding ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Icon name="plus" size={12}/>}
                  Ajouter
                </button>
              </>
            )}
          </div>
        </C>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="w-5 h-5 border-2 accent-border border-t-cyan-500 rounded-full animate-spin"/>
        </div>
      ) : certs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Icon name="shield" size={24} className="text-slate-700"/>
          <p className="text-[11px] text-slate-500">Aucun certificat — uploadez votre .p12</p>
        </div>
      ) : (
        <div className="space-y-2">
          {certs.map(c => {
            const days   = daysLeft(c.expires_at);
            const urgent = days !== null && days > 0 && days < 60;
            return (
              <C key={c.id}>
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${c.has_file ? "bg-emerald-500/15" : "bg-white/[0.05]"}`}>
                    <Icon name="shield" size={15} className={c.has_file ? "text-emerald-400" : "text-slate-500"}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] font-bold text-slate-200 truncate">{c.name}</p>
                      {c.has_file && <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full font-bold">🔐 Fichier</span>}
                    </div>
                    <p className="text-[9px] text-slate-500">
                      {c.type} {c.fingerprint ? `· ${c.fingerprint.slice(0,20)}…` : ""} {c.file_size ? `· ${fmtSize(c.file_size)}` : ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-1">
                    {days !== null && (
                      <p className={`text-[9px] font-mono ${days < 0 ? "text-red-400" : urgent ? "text-amber-400 font-bold" : "text-slate-500"}`}>
                        {days < 0 ? "Expiré" : `${days}j restants`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    {c.has_file && (
                      <button onClick={() => download(c)} title="Télécharger .p12"
                        className="p-1.5 rounded-lg text-slate-600 hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                        <Icon name="download" size={12}/>
                      </button>
                    )}
                    <button onClick={() => remove(c.id)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Icon name="trash" size={12}/>
                    </button>
                  </div>
                </div>
              </C>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientCerts;
