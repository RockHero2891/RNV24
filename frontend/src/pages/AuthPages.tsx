import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useAdminAccess } from '../hooks/useAdminAccess';
import { AdminButton } from '../components/AdminButton';

// ── Login / Registro ──────────────────────────────────────────────────────────
export function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const adminAccess = useAdminAccess();
  const [mode, setMode] = useState<'login' | 'register' | 'admin'>('login');
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
      if (mode === 'login' || mode === 'admin') await login(email, password);
      else await register(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Panel izquierdo — identidad */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-center bg-brand-950 px-12 py-12">
        <div className="animate-fade-in">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-brand-400">
            Certificación Full Stack
          </p>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Prepárate para el<br/>certamen real.
          </h1>
          <p className="mt-5 max-w-sm text-base leading-relaxed text-surface-400">
            7 secciones · 65 preguntas · temporizadores exactos · verificación de código.
            El mismo ambiente del examen oficial.
          </p>
           <div className="mt-10 grid grid-cols-2 gap-4">
             {[
               { n: '65', label: 'Preguntas' },
               { n: '7',  label: 'Secciones' },
               { n: '15h', label: 'Ventana total' },
               { n: '×10', label: 'Intentos por ejercicio' },
             ].map(({ n, label }) => (
               <div key={label} className="rounded-lg border border-surface-700 bg-surface-800/40 px-4 py-3 cursor-pointer hover:bg-surface-800/60 transition-colors"
                 onClick={() => label === 'Secciones' && adminAccess.handleSevenClick()}>
                 <p className="text-2xl font-bold text-white">{n}</p>
                 <p className="text-xs text-surface-400">{label}</p>
               </div>
             ))}
           </div>
          {adminAccess.showAdminButton && (
            <div className="mt-6">
              <AdminButton
                active={mode === 'admin'}
                onClick={() => {
                  setMode('admin');
                  setEmail('');
                  setPassword('');
                  setError('');
                }}
              />
            </div>
          )}
        </div>
        <p className="absolute bottom-8 left-12 text-xs text-surface-600">
          v{__APP_VERSION__} · © {new Date().getFullYear()} RNV24
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in">
          <h2 className="text-2xl font-bold text-surface-900">
            {mode === 'register' ? 'Crear cuenta' : mode === 'admin' ? 'Acceso administrador' : 'Iniciar sesión'}
          </h2>
          <p className="mt-1 text-sm text-surface-500">
            {mode === 'register'
              ? 'Regístrate para comenzar'
              : mode === 'admin'
                ? 'Ingresa las credenciales administrativas'
                : 'Ingresa para continuar tu simulacro'}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === 'register' && (
              <div className="animate-slide-in">
                <label className="label" htmlFor="name">Nombre completo</label>
                <input id="name" className="input" placeholder="Tu nombre"
                  value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
            )}
            <div>
              <label className="label" htmlFor="email">
                {mode === 'admin' ? 'Usuario admin' : 'Email'}
              </label>
              <input
                id="email"
                type={mode === 'register' ? 'email' : 'text'}
                className="input"
                placeholder={mode === 'admin' ? 'Usuario configurado en Render' : 'tu@email.com'}
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label" htmlFor="password">Contraseña</label>
              <input id="password" type="password" className="input" placeholder="••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>

            {error && (
              <div className="alert alert-error animate-slide-in">{error}</div>
            )}

            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Procesando...
                </span>
              ) : mode === 'register' ? 'Registrarme' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            {mode === 'register' ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
            <button type="button" className="font-semibold text-brand-600 hover:underline"
              onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setError(''); }}>
              {mode === 'register' ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </p>

          {adminAccess.showAdminButton && (
            <div className="mt-4 flex justify-center">
              <AdminButton
                active={mode === 'admin'}
                onClick={() => {
                  setMode(mode === 'admin' ? 'login' : 'admin');
                  setEmail('');
                  setPassword('');
                  setError('');
                }}
              />
            </div>
          )}

          {/* Versión en móvil */}
          <p className="mt-10 text-center text-xs text-surface-400 lg:hidden">
            v{__APP_VERSION__} · © {new Date().getFullYear()} RNV24
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const adminAccess = useAdminAccess();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proctoringAccepted, setProctoringAccepted] = useState(() => {
    // Load from localStorage if user already accepted
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`rnv24_proctoring_accepted_${user?.id}`);
      return stored === 'true';
    }
    return false;
  });
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const startExam = async () => {
    if (!proctoringAccepted) { setError('Acepta las condiciones de supervisión para continuar.'); return; }
    setLoading(true); setError('');
    
    // Request fullscreen to simulate exam environment
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (fsErr) {
      console.warn('Fullscreen request failed:', fsErr);
    }
    
    try { navigate('/exam'); }
    catch (err) { setError(err instanceof Error ? err.message : 'No se pudo iniciar el examen'); }
    finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try { await api.deleteMyAccount(); logout(); navigate('/login'); }
    catch { setError('No se pudo eliminar la cuenta.'); setShowDelete(false); }
    finally { setDeleting(false); }
  };

  const sections = [
    { id: 1, title: 'HTML / CSS',          mins: 35,  q: 3  },
    { id: 2, title: 'JavaScript Básico',    mins: 40,  q: 3  },
    { id: 3, title: 'JavaScript Avanzado',  mins: 90,  q: 16 },
    { id: 4, title: 'SQL',                  mins: 60,  q: 10 },
    { id: 5, title: 'Modelo ER',            mins: 20,  q: 4  },
    { id: 6, title: 'Express / Node.js',    mins: 45,  q: 13 },
    { id: 7, title: 'ORM / REST / JWT',     mins: 45,  q: 16 },
  ];

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-surface-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h10M3 8h7M3 12h5" stroke="white" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-xs text-surface-500 leading-none">v{__APP_VERSION__}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-sm text-surface-600 font-medium">{user?.name}</span>
            {user?.isAdmin && (
              <button type="button" className="btn-secondary text-xs px-3 py-1.5"
                onClick={() => navigate('/admin')}>
                ⚙ Admin
              </button>
            )}
            <button type="button" className="btn-ghost text-xs px-3 py-1.5"
              onClick={() => { logout(); navigate('/login'); }}>
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 animate-fade-in">
        {/* Hero card */}
        <div className="card overflow-hidden">
          <div className="bg-brand-950 px-6 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">Simulador oficial</p>
            <h1 className="mt-1 text-xl font-bold text-white">
              Test RNV24 Certificación · Full Stack Javascript
            </h1>
            <p className="mt-1 text-sm text-surface-400 max-w-xl">
              Ambiente estricto con temporizadores reales, supervisión simulada y verificación heurística de código.
            </p>
          </div>

          <div className="px-6 py-4">
            {/* Secciones */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {[
                { value: '65', label: 'Preguntas' },
                { value: '7',  label: 'Secciones' },
                { value: '15 h', label: 'Ventana total' },
                { value: '×10', label: 'Intentos / ejercicio' },
              ].map(({ value, label }) => (
                <div key={label} className="rounded-lg bg-surface-50 border border-surface-200 px-3 py-2 text-center cursor-pointer hover:bg-surface-100 transition-colors"
                  onClick={() => label === 'Secciones' && adminAccess.handleSevenClick()}>
                  <p className="text-lg font-bold text-brand-700">{value}</p>
                  <p className="text-xs text-surface-500">{label}</p>
                </div>
              ))}
            </div>

            {/* Tabla de secciones */}
            <div className="overflow-hidden rounded-lg border border-surface-200 mb-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-surface-50 text-left text-xs font-semibold uppercase tracking-wide text-surface-500">
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Sección</th>
                    <th className="px-3 py-2 text-center">Preguntas</th>
                    <th className="px-3 py-2 text-right">Tiempo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {sections.map((s) => (
                    <tr key={s.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-3 py-2 text-surface-400 font-mono text-xs">{String(s.id).padStart(2,'0')}</td>
                      <td className="px-3 py-2 font-medium text-surface-800">{s.title}</td>
                      <td className="px-3 py-2 text-center text-surface-600">{s.q}</td>
                      <td className="px-3 py-2 text-right text-surface-600">{s.mins} min</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Supervisión */}
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-surface-200 bg-surface-50 p-3 transition-colors hover:bg-white">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-600"
                checked={proctoringAccepted}
                onChange={(e) => { 
                  setProctoringAccepted(e.target.checked); 
                  setError('');
                  // Persist to localStorage
                  if (user?.id && e.target.checked) {
                    localStorage.setItem(`rnv24_proctoring_accepted_${user.id}`, 'true');
                  }
                }} />
              <span className="text-sm text-surface-700 leading-relaxed">
                Acepto el entorno de <strong className="text-surface-900">supervisión simulada</strong> —
                cámara, micrófono y pantalla compartida sin captura real.
                Se registrará el cambio de ventana y se recomienda pantalla completa.
              </span>
            </label>

            {error && <div className="alert alert-error mt-3">{error}</div>}

            <div className="mt-4 flex items-center gap-3">
              <button type="button" className="btn-primary px-6 py-2.5"
                onClick={startExam} disabled={loading || !proctoringAccepted}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>
                    Cargando...
                  </span>
                ) : 'Iniciar / continuar examen →'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        {!user?.isAdmin && (
          <div className="mt-8 text-center">
            {!showDelete ? (
              <button type="button" className="text-xs text-surface-400 hover:text-danger-600 transition-colors"
                onClick={() => setShowDelete(true)}>
                Eliminar mi cuenta
              </button>
            ) : (
              <div className="inline-flex items-center gap-3 rounded-lg bg-danger-50 border border-danger-200 px-4 py-2.5">
                <span className="text-xs text-danger-800">¿Confirmas? Se borrarán todos tus datos permanentemente.</span>
                <button type="button" className="text-xs font-semibold text-danger-700 hover:underline"
                  disabled={deleting} onClick={handleDeleteAccount}>
                  {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
                <button type="button" className="text-xs text-surface-500 hover:underline"
                  onClick={() => setShowDelete(false)}>Cancelar</button>
              </div>
            )}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-surface-400">
          v{__APP_VERSION__} · © {new Date().getFullYear()} RNV24
        </p>
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

  const pct = summary?.percentage ?? 0;
  const passed = pct >= 70;

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
      <div className="card max-w-lg w-full p-8 text-center animate-fade-in">
        <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl
          ${passed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {passed ? '✓' : '○'}
        </div>
        <h1 className="text-2xl font-bold text-surface-900">Simulacro completado</h1>
        <p className="mt-2 text-surface-500">Has finalizado las 7 secciones del test RNV24.</p>

        {summary ? (
          <div className="mt-6">
            <p className="text-5xl font-bold text-brand-700">{pct}%</p>
            <p className="mt-1 text-sm text-surface-500">
              {summary.correct} aciertos de {summary.totalQuestions} preguntas
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-200">
              <div className={`h-full rounded-full transition-all duration-700 ${passed ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{ width: `${pct}%` }} />
            </div>
            <p className={`mt-2 text-sm font-semibold ${passed ? 'text-green-700' : 'text-amber-700'}`}>
              {passed ? '¡Por encima del umbral de aprobación!' : 'Por debajo del 70% — sigue practicando.'}
            </p>
          </div>
        ) : (
          <div className="mt-6 skeleton h-20" />
        )}

        <button type="button" className="btn-primary mt-8 px-6" onClick={() => navigate('/dashboard')}>
          Volver al panel
        </button>
      </div>
    </div>
  );
}
