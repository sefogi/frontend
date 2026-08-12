import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LogIn, LogOut, ShieldCheck } from 'lucide-react';

import HomePage from './pages/HomePage';
import ReportsPage from './pages/ReportsPage';
import CentersPage from './pages/CentersPage';
import DonationsPage from './pages/DonationsPage';
import MapPage from './pages/MapPage';
import AuthPage from './pages/AuthPage';
import AdminPage from './pages/AdminPage';
import NeedHelpPage from './pages/NeedHelpPage';
import ProtectedRoute from './components/ProtectedRoute';
import { authService } from './services/auth';

const adminRoles = ['SUPER_ADMIN', 'CENTER_ADMIN'];

function LogoMark() {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-label="Red de Ayuda logo"
      className="h-8 w-8 shrink-0"
      role="img"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
      </defs>
      <path
        d="M32 8C25.4 8 19.8 12.7 18 18.6c-1.2 4.1-.7 8.9 1.8 12.6L32 51l12.2-19.8c2.5-3.7 3-8.5 1.8-12.6C44.2 12.7 38.6 8 32 8Z"
        fill="url(#logoGradient)"
      />
      <path
        d="M32 18.5c-2.6 0-4.8 2.2-4.8 4.9 0 1.8 1 3.2 2.3 4.5l2.5 2.3 2.5-2.3c1.3-1.3 2.3-2.7 2.3-4.5 0-2.7-2.2-4.9-4.8-4.9Zm-5.2 12.9h10.4v3H26.8v-3Zm0 5.5h10.4v3H26.8v-3Z"
        fill="#fffaf5"
      />
      <path
        d="M14 14.5a4.5 4.5 0 0 1 4.5-4.5h26.8A4.5 4.5 0 0 1 50 14.5v30.8A4.5 4.5 0 0 1 45.3 50H18.5A4.5 4.5 0 0 1 14 45.5V14.5Z"
        fill="none"
        stroke="#0f172a"
        strokeWidth="2.2"
        opacity="0.18"
      />
    </svg>
  );
}

function LogoBrand() {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed) {
    return <LogoMark />;
  }

  return (
    <img
      src="/src/logo.png"
      alt="Red de Ayuda logo"
      className="h-8 w-8 rounded-md object-contain"
      onError={() => setImageFailed(true)}
    />
  );
}

const App = () => {
  const [user, setUser] = useState(authService.getCurrentUser());
  const canAccessAdmin = !!user && adminRoles.includes(user.role);

  useEffect(() => {
    const handleAuthChange = () => setUser(authService.getCurrentUser());
    window.addEventListener('auth:change', handleAuthChange);
    return () => window.removeEventListener('auth:change', handleAuthChange);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
        <div className="bg-red-600 text-white text-center py-2 px-4 font-bold text-sm">
          ⚠️ Si estás en peligro inmediato, contacta con los servicios de emergencia de tu zona. 112
        </div>

        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-blue-900 sm:text-xl">
                <LogoBrand />
                Red de Ayuda S.O.S. Colombia
              </Link>

              <nav className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-slate-600">
                <NavLink to="/" label="Inicio" />
                <NavLink to="/need-help" label="Necesito Ayuda" />
                <NavLink to="/centers" label="Centros" />
                <NavLink to="/donations" label="Donaciones" />
                <NavLink to="/reports/missing" label="Desaparecidos" />
                <NavLink to="/reports/found" label="Encontrados" />
                <NavLink to="/map" label="Mapa" />

                {canAccessAdmin && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    <ShieldCheck size={16} />
                    Admin
                  </Link>
                )}
              </nav>

              {user ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <span className="truncate text-sm font-medium text-slate-700">{user.email}</span>
                  <button
                    type="button"
                    onClick={() => authService.logout()}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    <LogOut size={16} />
                    Salir
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                >
                  <LogIn size={16} />
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/need-help" element={<NeedHelpPage />} />
            <Route path="/centers" element={<CentersPage />} />
            <Route path="/donations" element={<DonationsPage />} />
            <Route path="/reports/missing" element={<ReportsPage type="missing" />} />
            <Route path="/reports/found" element={<ReportsPage type="found" />} />
            <Route path="/map" element={<MapPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireRole={['SUPER_ADMIN', 'CENTER_ADMIN']}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

function NavLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="rounded-lg px-3 py-2 transition hover:bg-blue-50 hover:text-blue-700"
    >
      {label}
    </Link>
  );
}

export default App;
