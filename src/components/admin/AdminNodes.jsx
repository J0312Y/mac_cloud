// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";
import { Spark } from "../charts/index.jsx";
import { useApp } from "../../i18n/AppContext.jsx";
import { useSocket } from "../../hooks/useSocket.js";

const API = "http://213.156.133.182:3001/api";
const tok = () => localStorage.getItem("mbc_token");
const authH = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${tok()}` });

const STATUS_COLOR = { busy: "bg-amber-400 animate-pulse", idle: "bg-emerald-400", offline: "bg-slate-600", maintenance: "bg-red-400" };
const STATUS_TEXT  = { busy: "text-amber-400", idle: "text-emerald-400", offline: "text-slate-500", maintenance: "text-red-400" };

const Bar = ({ label, value, color, suffix = "%" }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="text-[9px] text-slate-500">{label}</span>
      <span className="text-[9px] font-mono text-slate-300">{value}{suffix}</span>
    </div>
    <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(value, 100)}%` }}/>
    </div>
  </div>
);

const AdminNodes = ({ setPage, setSelNode, addToast }) => {
  const { t }              = useApp();
  const [nodes,   setNodes]  = useState([]);
  const [loading, setLoading]= useState(true);
  const [showAdd, setShowAdd]= useState(false);
  const [newNode, setNewNode]= useState({ id:"", name:"", ip:"", region:"EU-West", model:"Mac mini M2 Pro", os_version:"14.3", xcode:"15.3" });
  const [adding,  setAdding] = useState(false);
  const { on, off } = useSocket();

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${API}/admin/nodes`, { headers: authH() });
      const d = await r.json();
      setNodes(d.nodes || []);
    } catch { addToast("Erreur chargement nodes", "error"); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const onUpdate = (node) => setNodes(ns => ns.map(n => n.id === node.id ? node : n));
    on("nodeUpdate", onUpdate);
    return () => off("nodeUpdate", onUpdate);
  }, []);

  const reboot = async (id) => {
    try {
      await fetch(`${API}/admin/nodes/${id}`, { method: "PATCH", headers: authH(), body: JSON.stringify({ status: "idle" }) });
      setNodes(ns => ns.map(n => n.id === id ? { ...n, status: "idle" } : n));
      addToast(`Node ${id} redémarré`, "warn");
    } catch { addToast("Erreur reboot", "error"); }
  };

  const setMaintenance = async (id, on_) => {
    try {
      await fetch(`${API}/admin/nodes/${id}`, { method: "PATCH", headers: authH(), body: JSON.stringify({ status: on_ ? "maintenance" : "idle" }) });
      setNodes(ns => ns.map(n => n.id === id ? { ...n, status: on_ ? "maintenance" : "idle" } : n));
      addToast(`Node ${id} → ${on_ ? "maintenance" : "idle"}`, "success");
    } catch { addToast("Erreur", "error"); }
  };

  const addNode = async () => {
    if (!newNode.id || !newNode.name) return addToast("ID et nom requis", "error");
    setAdding(true);
    try {
      const r = await fetch(`${API}/admin/nodes`, { method: "POST", headers: authH(), body: JSON.stringify(newNode) });
      if (!r.ok) throw new Error((await r.json()).error);
      addToast(`Node ${newNode.name} ajouté`, "success");
      setShowAdd(false);
      setNewNode({ id:"", name:"", ip:"", region:"EU-West", model:"Mac mini M2 Pro", os_version:"14.3", xcode:"15.3" });
      load();
    } catch (e) { addToast(`❌ ${e.message}`, "error"); }
    finally     { setAdding(false); }
  };

  const removeNode = async (id) => {
    if (!confirm(`Supprimer le node ${id} ?`)) return;
    try {
      const r = await fetch(`${API}/admin/nodes/${id}`, { method: "DELETE", headers: authH() });
      if (!r.ok) throw new Error((await r.json()).error);
      setNodes(ns => ns.filter(n => n.id !== id));
      addToast(`Node ${id} supprimé`, "warn");
    } catch (e) { addToast(`❌ ${e.message}`, "error"); }
  };

  const total   = nodes.length;
  const busy    = nodes.filter(n => n.status === "busy").length;
  const idle    = nodes.filter(n => n.status === "idle").length;
  const offline = nodes.filter(n => n.status === "offline" || n.status === "maintenance").length;

  if (loading) return <div className="flex-1 flex items-center justify-center"><span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"/></div>;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[["Total", total,"text-slate-300"],["Busy",busy,"text-amber-400"],["Idle",idle,"text-emerald-400"],["Hors ligne",offline,"accent-text-dyn"]].map(([l,v,c])=>(
          <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-xl px-4 py-3">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest mb-1">{l}</p>
            <p className={`text-2xl font-black font-mono ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-slate-500">{total} node{total !== 1 ? "s" : ""} — données live</p>
        <button onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 accent-bg-dyn text-white text-[10px] font-bold rounded-lg">
          <Icon name={showAdd ? "x" : "plus"} size={11}/>{showAdd ? "Annuler" : "Ajouter un node"}
        </button>
      </div>

      {/* Add node form */}
      {showAdd && (
        <C className="border accent-border">
          <CH title="Ajouter un Mac mini"/>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[["ID (ex: mac-04)","id"],["Nom","name"],["IP","ip"],["Région","region"],["Modèle","model"],["macOS","os_version"],["Xcode","xcode"]].map(([label,field])=>(
                <div key={field}>
                  <label className="text-[9px] text-slate-500 block mb-1">{label}</label>
                  <input value={newNode[field]} onChange={e=>setNewNode(n=>({...n,[field]:e.target.value}))}
                    className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-[var(--ca)]"/>
                </div>
              ))}
            </div>
            <button onClick={addNode} disabled={adding}
              className="flex items-center gap-1.5 px-4 py-2 accent-bg-dyn text-white text-xs font-bold rounded-lg disabled:opacity-50">
              {adding ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Icon name="plus" size={12}/>}
              Ajouter
            </button>
          </div>
        </C>
      )}

      {/* Node cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {nodes.map(n => (
          <C key={n.id} className={n.status === "offline" ? "opacity-60" : ""}>
            <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_COLOR[n.status] || "bg-slate-600"}`}/>
                <div>
                  <p className="text-[11px] font-black text-slate-200">{n.name}</p>
                  <p className="text-[9px] text-slate-500 font-mono">{n.ip || "N/A"} · {n.region}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-bold ${STATUS_TEXT[n.status]}`}>{n.status?.toUpperCase()}</span>
                <button onClick={() => removeNode(n.id)} className="p-1 text-slate-600 hover:text-red-400 transition-colors">
                  <Icon name="trash" size={11}/>
                </button>
              </div>
            </div>

            <div className="p-4 space-y-2.5">
              <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-500 mb-2">
                <span>🖥 {n.model || "Mac mini M2 Pro"}</span>
                <span>macOS {n.os_version}</span>
                <span>Xcode {n.xcode}</span>
                {n.build && <span className="text-amber-400 truncate">▶ {n.build.project}</span>}
              </div>

              <Bar label="CPU"  value={n.cpu  || 0} color="bg-cyan-500"/>
              <Bar label="RAM"  value={n.ram  || 0} color="bg-sky-500"/>
              <Bar label="Disk" value={n.disk || 0} color="bg-emerald-500"/>
              <Bar label="Temp" value={n.temp || 45} color="bg-orange-500" suffix="°"/>

              <p className="text-[8px] text-slate-600">
                Vu le {n.last_seen ? new Date(n.last_seen).toLocaleString("fr-FR") : "N/A"}
              </p>

              <div className="flex gap-2 pt-1">
                <button onClick={() => { setSelNode(n); setPage("node-detail"); }}
                  className="flex-1 py-1.5 bg-white/[0.04] border border-white/[0.07] text-slate-400 text-[10px] font-bold rounded-lg hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5">
                  <Icon name="monitor" size={11}/>Détails
                </button>
                <button onClick={() => reboot(n.id)} disabled={n.status === "offline"}
                  className="flex-1 py-1.5 bg-amber-900/20 border border-amber-500/20 text-amber-400 text-[10px] font-bold rounded-lg hover:bg-amber-900/30 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-30">
                  <Icon name="refresh" size={11}/>Reboot
                </button>
                <button onClick={() => setMaintenance(n.id, n.status !== "maintenance")}
                  className={`flex-1 py-1.5 border text-[10px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${n.status === "maintenance" ? "bg-red-900/20 border-red-500/20 text-red-400" : "bg-white/[0.04] border-white/[0.07] text-slate-400 hover:text-slate-200"}`}>
                  <Icon name="alertTri" size={11}/>{n.status === "maintenance" ? "Activer" : "Maintenance"}
                </button>
              </div>
            </div>
          </C>
        ))}
      </div>
    </div>
  );
};

export default AdminNodes;
