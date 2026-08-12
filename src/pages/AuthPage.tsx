import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, UserPlus } from 'lucide-react';
import { authService } from '../services/auth';

const AuthPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType] = useState<'CENTER_ADMIN'>('CENTER_ADMIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await authService.login(email, password);
      } else {
        await authService.register(email, password, accountType);
        await authService.login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'No se pudo completar la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4 py-12">
      <div className="grid w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-8 text-white">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium backdrop-blur-sm">
            <ShieldCheck size={16} />
            Acceso seguro
          </div>
          <h1 className="mb-4 text-3xl font-bold">Red de Ayuda</h1>
          <p className="text-blue-100">
            Gestiona centros, recursos y reportes con una cuenta autorizada. La información crítica debe estar verificada antes de publicarse.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-blue-50">
            <li>• Control de acceso por roles</li>
            <li>• Verificación de información</li>
            <li>• Actualización rápida de recursos</li>
          </ul>
        </div>

        <div className="p-8">
          <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold ${mode === 'login' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'}`}
              onClick={() => setMode('login')}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold ${mode === 'register' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'}`}
              onClick={() => setMode('register')}
            >
              Registrarse
            </button>
          </div>

          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-emerald-700">Tipo de acceso</span>
              <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                Centro de acopio
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none"
                placeholder="usuario@ejemplo.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:outline-none"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Registro permitido</label>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700">
                  Centro de acopio
                </div>
                <input type="hidden" value={accountType} />
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Procesando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
              <UserPlus size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

type AuthUserRole = 'CENTER_ADMIN';

export default AuthPage;
