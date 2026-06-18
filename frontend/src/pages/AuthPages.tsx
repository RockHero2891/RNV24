import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

// ── Login / Registro ──────────────────────────────────────────────────────────
export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">RNV24</p>
          <h1 className="mt-2 text-xl font-bold text-surface-900">
            Test Certificación Full Stack Javascript
          </h1>
          <p className="mt-2 text-sm text-surface-600">
            Simulador de examen para práctica del equipo
          </p>
          <p className="mt-3 text-xs text-surface-400">v1.0.0 &copy; 2026 RNV24</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="label" htmlFor="name">Nombre</label>
              <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label" htmlFor="password">Contraseña</label>
            <input id="password" type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Procesando...' : mode === 'login' ? 'Iniciar sesión' : 'Registrarse'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-surface-600">
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button type="button" className="font-semibold text-brand-600 hover:underline"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proctoringAccepted, setProctoringAccepted] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const startExam = async () => {
    if (!proctoringAccepted) { setError('Debes aceptar las condiciones de supervisión simulada.'); return; }
    setLoading(true);
    setError('');
    try { navigate('/exam'); } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar el examen');
    } finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await api.deleteMyAccount();
      logout();
      navigate('/login');
    } catch {
      setError('No se pudo eliminar la cuenta. Intenta de nuevo.');
      setShowDeleteConfirm(false);
    } finally { setDeleting(false); }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">RNV24</p>
            <h1 className="text-lg font-bold text-surface-900">Panel de certificación</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-surface-600">{user?.name}</span>
            {user?.isAdmin && (
              <button type="button" className="btn-secondary text-sm" onClick={() => navigate('/admin')}>
                Panel Admin
              </button>
            )}
            <button type="button" className="btn-secondary" onClick={() => { logout(); navigate('/login'); }}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-surface-900">
            Test RNV24 Certificación - Full Stack Javascript
          </h2>
          <p className="mt-3 max-w-2xl text-surface-600">
            Simulador del ambiente estricto de certificación: 7 secciones, temporizadores por sección y
            ejercicio, ventana total de 15 horas, supervisión simulada y verificación heurística de código.
          </p>

          <ul className="mt-6 grid gap-2 text-sm text-surface-700 sm:grid-cols-2">
            <li>65 preguntas en orden exacto del certamen</li>
            <li>7 secciones con pausas opcionales</li>
            <li>Ventana total de 15 horas</li>
            <li>Hasta 10 intentos por ejercicio de desarrollo</li>
            <li>Detección de cambio de ventana</li>
            <li>Copiar/pegar bloqueado en código</li>
          </ul>

          <div className="mt-6 rounded-md border border-surface-200 bg-surface-50 p-4">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-surface-700">
              <input type="checkbox" className="mt-1" checked={proctoringAccepted}
                onChange={(e) => setProctoringAccepted(e.target.checked)} />
              <span>
                Acepto el entorno de supervisión <strong>simulado</strong> (cámara, micrófono y
                pantalla compartida sin captura real, detección de foco y pantalla completa recomendada).
              </span>
            </label>
          </div>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          <div className="mt-8">
            <button type="button" className="btn-primary px-8 py-3" onClick={startExam} disabled={loading}>
              {loading ? 'Cargando...' : 'Iniciar o continuar examen'}
            </button>
          </div>
        </div>

        {!user?.isAdmin && (
          <div className="mt-6 text-center">
            {!showDeleteConfirm ? (
              <button type="button" className="text-xs text-red-400 hover:text-red-600 hover:underline"
                onClick={() => setShowDeleteConfirm(true)}>
                Eliminar mi cuenta
              </button>
            ) : (
              <div className="inline-flex items-center gap-3 rounded-md bg-red-50 px-4 py-2">
                <span className="text-xs text-red-800">¿Confirmas? Se borrarán todos tus datos.</span>
                <button type="button" className="text-xs font-semibold text-red-700 hover:underline"
                  disabled={deleting} onClick={handleDeleteAccount}>
                  {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
                <button type="button" className="text-xs text-surface-500 hover:underline"
                  onClick={() => setShowDeleteConfirm(false)}>
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ── Complete ──────────────────────────────────────────────────────────────────
export function CompletePage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<{
    correct: number; totalQuestions: number; percentage: number;
  } | null>(null);

  useEffect(() => {
    api.getActiveSession().then(async ({ session }) => {
      if (session) {
        const data = await api.getSummary(session.id);
        setSummary({ correct: data.correct, totalQuestions: data.totalQuestions, percentage: data.percentage });
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card max-w-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-surface-900">Examen completado</h1>
        <p className="mt-3 text-surface-600">Has finalizado las 7 secciones del simulador RNV24.</p>
        {summary && (
          <p className="mt-4 text-lg font-semibold text-brand-700">
            {summary.correct} aciertos de {summary.totalQuestions} ({summary.percentage}%)
          </p>
        )}
        <button type="button" className="btn-primary mt-8" onClick={() => navigate('/dashboard')}>
          Volver al panel
        </button>
      </div>
    </div>
  );
}
