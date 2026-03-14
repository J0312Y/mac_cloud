import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Pages that use the full marketing layout (navbar + footer)
function MarketingLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

// Auth pages: no nav, no footer
function AuthLayout({ children }) {
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <MarketingLayout><Landing /></MarketingLayout>
        } />
        <Route path="/login" element={
          <AuthLayout><Login /></AuthLayout>
        } />
        <Route path="/register" element={
          <AuthLayout><Register /></AuthLayout>
        } />
        {/* Fallback */}
        <Route path="*" element={
          <MarketingLayout>
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div style={{ fontFamily: 'Syne,sans-serif', fontSize: 80, fontWeight: 800, color: 'var(--rim2)' }}>404</div>
              <div style={{ color: 'var(--sub)', fontSize: 16 }}>Page not found</div>
              <a href="/" className="btn-primary" style={{ marginTop: 8, textDecoration: 'none' }}>← Back to home</a>
            </div>
          </MarketingLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
