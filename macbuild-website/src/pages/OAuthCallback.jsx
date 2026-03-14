import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { setToken, DASHBOARD } from '../lib/api';

export default function OAuthCallback() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [error,  setError]  = useState('');

  useEffect(() => {
    const token = params.get('token');
    const err   = params.get('error');

    if (err) {
      setError(decodeURIComponent(err));
      setStatus('error');
      // Transmettre l'erreur à la fenêtre parent si popup
      if (window.opener) {
        window.opener.postMessage({ type: 'oauth_error', error: decodeURIComponent(err) }, '*');
        setTimeout(() => window.close(), 2000);
      }
      return;
    }

    if (token) {
      setToken(token);
      setStatus('success');
      // Si popup → envoyer token au parent et fermer
      if (window.opener) {
        window.opener.postMessage({ type: 'oauth_success', token }, '*');
        setTimeout(() => window.close(), 1000);
      } else {
        // Redirection directe
        setTimeout(() => { window.location.href = DASHBOARD; }, 800);
      }
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0812' }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg,#0891b2,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 20px' }}>⚡</div>

        {status === 'processing' && (
          <>
            <div style={{ width: 28, height: 28, border: '3px solid rgba(6,182,212,.2)', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 16px' }}/>
            <p style={{ color: '#94a3b8', fontSize: 14 }}>Connexion en cours…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
            <h2 style={{ color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Connecté !</h2>
            <p style={{ color: '#94a3b8', fontSize: 14 }}>Redirection vers le dashboard…</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 32, marginBottom: 12 }}>❌</div>
            <h2 style={{ color: '#fff', fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Erreur OAuth</h2>
            <p style={{ color: '#f87171', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>{error}</p>
            <a href="/login" style={{ color: '#06b6d4', fontSize: 13, textDecoration: 'none' }}>← Retour au login</a>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
