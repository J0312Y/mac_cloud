// @ts-nocheck
import { useState } from "react";
import Icon from "../ui/Icon.jsx";
import { C, CH } from "../ui/SharedUI.jsx";
import api from "../../lib/api.js";
import { useApp } from "../../i18n/AppContext.jsx";

const ClientNewBuild = ({ addToast, setPage }) => {
  const { t } = useApp();
  const [project, setProject] = useState("");
  const [repo, setRepo]       = useState("");
  const [branch, setBranch]   = useState("main");
  const [xcode, setXcode]     = useState("15.3");
  const [region, setRegion]   = useState("EU-West");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!repo)     return addToast("Enter a repository URL", "error");
    if (!project)  return addToast("Enter a project name", "error");
    setLoading(true);
    try {
      const res = await api.builds.submit({ project, repo_url: repo, branch, xcode_version: xcode, region });
      addToast(`Build ${res.id} queued!`, "success");
      setPage("my-builds");
    } catch (err) {
      addToast(err.message || "Failed to submit build", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-xl space-y-4">
        <C><CH title="Project"/>
          <div className="p-4 space-y-3">
            <div>
              <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Project Name</label>
              <input value={project} onChange={e=>setProject(e.target.value)} placeholder="MyApp"
                className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:accent-border transition-colors"/>
            </div>
          </div>
        </C>
        <C><CH title="Repository"/>
          <div className="p-4 space-y-3">
            <div>
              <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Repository URL</label>
              <div className="relative">
                <Icon name="github" size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
                <input value={repo} onChange={e=>setRepo(e.target.value)} placeholder="https://github.com/you/MyApp.git"
                  className="w-full bg-black/30 border border-white/[0.07] rounded-lg pl-9 pr-3 py-2 text-xs text-slate-300 outline-none focus:accent-border transition-colors"/>
              </div>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Branch</label>
              <input value={branch} onChange={e=>setBranch(e.target.value)}
                className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:accent-border transition-colors"/>
            </div>
          </div>
        </C>
        <C><CH title="Build Configuration"/>
          <div className="p-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Xcode Version</label>
              <select value={xcode} onChange={e=>setXcode(e.target.value)}
                className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                {["15.3","15.2","15.1","14.3"].map(v=>(<option key={v} value={v}>{v}</option>))}
              </select>
            </div>
            <div>
              <label className="text-[9px] text-slate-500 uppercase tracking-widest block mb-1.5">Mac Region</label>
              <select value={region} onChange={e=>setRegion(e.target.value)}
                className="w-full bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 outline-none">
                <option value="EU-West">🇪🇺 EU-West (Paris)</option>
                <option value="US-East">🇺🇸 US-East (NYC)</option>
                <option value="US-West">🇺🇸 US-West (LA)</option>
              </select>
            </div>
          </div>
        </C>
        <button onClick={submit} disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 btn-accent text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60">
          {loading
            ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
            : <><Icon name="zap" size={13}/>Queue Build</>}
        </button>
      </div>
    </div>
  );
};

export default ClientNewBuild;
