// @ts-nocheck
// RoleBanner — read-only, no switch button
// Role is determined solely by the JWT from the server
const RoleBanner = ({ isAdmin }) => (
  <div className={`flex items-center px-4 py-1.5 text-[10px] font-bold flex-shrink-0 ${isAdmin ? "bg-rose-900/30 border-b border-rose-500/20 text-rose-300" : "bg-cyan-500/20 border-b accent-border accent-text"}`}>
    <span>{isAdmin ? "⚙ Admin Console" : "👤 Client Panel"}</span>
  </div>
);

export default RoleBanner;
