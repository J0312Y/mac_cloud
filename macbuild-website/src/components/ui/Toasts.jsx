export default function Toasts({ toasts }) {
  if (!toasts.length) return null;
  const icons = { success: '✓', error: '✕', info: 'i' };
  const colors = {
    success: 'rgba(74,222,128,0.12)',
    error:   'rgba(248,113,113,0.12)',
    info:    'rgba(6,182,212,0.12)',
  };
  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className="toast" style={{ borderLeftColor: t.type === 'success' ? '#4ade80' : t.type === 'error' ? '#f87171' : '#06b6d4', borderLeftWidth: 3, background: colors[t.type] }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: t.type === 'success' ? '#4ade80' : t.type === 'error' ? '#f87171' : '#06b6d4' }}>{icons[t.type]}</span>
          <span style={{ color: 'var(--text)', fontSize: 13.5 }}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
