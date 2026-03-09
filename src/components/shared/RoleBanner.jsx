// @ts-nocheck

const RoleBanner = ({ isAdmin, setIsAdmin }) => (
  <div className={`flex items-center justify-between px-4 py-1.5 text-[10px] font-bold flex-shrink-0 ${isAdmin?"bg-rose-900/30 border-b border-rose-500/20 text-rose-300":"bg-violet-900/20 border-b border-violet-500/15 text-violet-300"}`}>
    <span>{isAdmin?"⚙ Admin Console":"👤 Client Panel"}</span>
    <button onClick={()=>setIsAdmin(a=>!a)} className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black transition-colors ${isAdmin?"border-rose-500/30 hover:bg-rose-500/10":"border-violet-500/30 hover:bg-violet-500/10"}`}>
      Switch to {isAdmin?"User Panel":"Admin Console"}
    </button>
  </div>
);

export default RoleBanner;
