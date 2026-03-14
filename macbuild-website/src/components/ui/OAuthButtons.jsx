const API = import.meta.env.VITE_API_URL || 'http://213.156.133.182:3001/api';

export default function OAuthButtons({ onSuccess, onError, loading, setLoading }) {
  const openOAuth = (provider) => {
    if (loading) return;
    setLoading?.(true);

    // Nettoyer les clés précédentes
    localStorage.removeItem('mbc_oauth_token');
    localStorage.removeItem('mbc_oauth_error');

    const url   = `${API}/auth/${provider}`;
    const popup = window.open(url, `oauth_${provider}`, 'width=520,height=640,scrollbars=yes,resizable=yes');

    if (!popup) {
      onError?.('Popup bloquée — autorisez les popups pour ce site');
      setLoading?.(false);
      return;
    }

    // Polling localStorage (fonctionne même cross-origin)
    const poll = setInterval(() => {
      // Popup fermée manuellement
      if (popup.closed) {
        clearInterval(poll);
        window.removeEventListener('message', onMsg);
        // Vérifier une dernière fois si token présent
        const t = localStorage.getItem('mbc_oauth_token');
        const e = localStorage.getItem('mbc_oauth_error');
        if (t) { localStorage.removeItem('mbc_oauth_token'); onSuccess?.(t); }
        else if (e) { localStorage.removeItem('mbc_oauth_error'); onError?.(e); }
        else setLoading?.(false);
        return;
      }

      const token = localStorage.getItem('mbc_oauth_token');
      const error = localStorage.getItem('mbc_oauth_error');

      if (token) {
        clearInterval(poll);
        window.removeEventListener('message', onMsg);
        localStorage.removeItem('mbc_oauth_token');
        onSuccess?.(token);
      } else if (error) {
        clearInterval(poll);
        window.removeEventListener('message', onMsg);
        localStorage.removeItem('mbc_oauth_error');
        onError?.(error);
        setLoading?.(false);
      }
    }, 500);

    // postMessage fallback (marche si même origine)
    const onMsg = (e) => {
      if (e.data?.type === 'oauth_success') {
        clearInterval(poll);
        window.removeEventListener('message', onMsg);
        onSuccess?.(e.data.token);
      } else if (e.data?.type === 'oauth_error') {
        clearInterval(poll);
        window.removeEventListener('message', onMsg);
        onError?.(e.data.error);
        setLoading?.(false);
      }
    };
    window.addEventListener('message', onMsg);

    // Timeout sécurité 5 min
    setTimeout(() => {
      clearInterval(poll);
      window.removeEventListener('message', onMsg);
      setLoading?.(false);
    }, 5 * 60 * 1000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <button onClick={() => openOAuth('github')} disabled={!!loading}
        className="btn-ghost"
        style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 14, opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        Continue with GitHub
      </button>
      <button onClick={() => openOAuth('gitlab')} disabled={!!loading}
        className="btn-ghost"
        style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 14, opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fc6d26">
          <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z"/>
        </svg>
        Continue with GitLab
      </button>
    </div>
  );
}
