// @ts-nocheck
import { useState, useEffect } from "react";
import Icon from "../ui/Icon.jsx";
import { Badge, C, CH } from "../ui/SharedUI.jsx";
import api from "../../lib/api.js";
import { useApp } from "../../i18n/AppContext.jsx";

const ROLES = ["admin","developer","viewer"];

const ClientTeam = ({ addToast }) => {
  const { t } = useApp();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail]     = useState("");
  const [name, setName]       = useState("");
  const [role, setRole]       = useState("developer");
  const [inviting, setInviting] = useState(false);

  const load = async () => {
    try { const r = await api.team.list(); setMembers(r.members||[]); }
    catch { addToast("Failed to load team","error"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const invite = async () => {
    if (!email) return addToast("Enter an email","error");
    setInviting(true);
    try {
      await api.team.invite({ email, name, role });
      setEmail(""); setName(""); setRole("developer");
      addToast(`Invite sent to ${email}`,"success");
      load();
    } catch(err) { addToast(err.message||"Failed to invite","error"); }
    finally { setInviting(false); }
  };

  const changeRole = async (id, newRole) => {
    try { await api.team.update(id, { role: newRole }); load(); }
    catch { addToast("Failed to update role","error"); }
  };

  const remove = async (id, memberEmail) => {
    try { await api.team.remove(id); addToast(`${memberEmail} removed`,"warn"); load(); }
    catch { addToast("Failed to remove","error"); }
  };

  const active  = members.filter(m=>m.status==="active").length;
  const pending = members.filter(m=>m.status==="pending").length;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div className="flex gap-3">
        {[["Active",active,"text-emerald-400"],["Pending",pending,"text-amber-400"],["Total",members.length,"text-slate-300"]].map(([l,v,c])=>(
          <div key={l} className="bg-[#13111f] border border-white/[0.06] rounded-lg px-3 py-2">
            <p className="text-[9px] text-slate-500">{l}</p>
            <p className={`text-lg font-black font-mono ${c}`}>{loading?"…":v}</p>
          </div>
        ))}
      </div>

      <C><CH title="Invite Team Member"/>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="colleague@company.com"
                className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:accent-border"/>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Name (optional)</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="John Doe"
                className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:accent-border"/>
            </div>
          </div>
          <div>
            <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Role</label>
            <div className="flex gap-2">
              {ROLES.map(r=>(
                <button key={r} onClick={()=>setRole(r)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize border transition-colors ${role===r?"accent-badge-bg accent-text accent-border":"text-slate-500 border-white/[0.07] hover:text-slate-300"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <button onClick={invite} disabled={inviting}
            className="flex items-center gap-1.5 px-4 py-2 btn-accent text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-60">
            {inviting ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Icon name="mail" size={11}/>}
            Send Invite
          </button>
        </div>
      </C>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="w-5 h-5 border-2 accent-border border-t-cyan-500 rounded-full animate-spin"/>
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Icon name="users" size={24} className="text-slate-700"/>
          <p className="text-[11px] text-slate-500">No team members yet</p>
        </div>
      ) : (
        <C>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead><tr className="border-b border-white/[0.05]">
                {["Member","Role","Status","Invited",""].map(h=>(
                  <th key={h} className="px-3 py-2 text-left text-[9px] font-black text-slate-600 uppercase tracking-widest">{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {members.map(m=>(
                  <tr key={m.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[var(--accent)] to-[var(--accent-80)] flex items-center justify-center text-[9px] font-black text-white">
                          {(m.name||m.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-200">{m.name||"—"}</p>
                          <p className="text-[9px] text-slate-500">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <select value={m.role} onChange={e=>changeRole(m.id,e.target.value)}
                        className="bg-black/30 border border-white/[0.07] rounded px-2 py-1 text-[10px] text-slate-300 outline-none">
                        {ROLES.map(r=>(<option key={r} value={r}>{r}</option>))}
                      </select>
                    </td>
                    <td className="px-3 py-2.5"><Badge s={m.status}/></td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-500">{m.invited_at?.slice(0,10)}</td>
                    <td className="px-3 py-2.5">
                      <button onClick={()=>remove(m.id,m.email)} className="text-slate-600 hover:text-red-400 transition-colors">
                        <Icon name="trash" size={12}/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </C>
      )}
    </div>
  );
};

export default ClientTeam;
