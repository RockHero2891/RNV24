import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, type AdminUserStats, type AppSettings } from '../services/api';

interface AdminUser {
  id: number; name: string; email: string; created_at: string;
  last_ip: string | null; last_login: string | null;
  session_count: number; completed_count: number; active_count: number;
  answered_count: number; correct_count: number; last_session_at: string | null;
}

export function AdminPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [resetting, setResetting] = useState<number | null>(null);
  const [selectedStats, setSelectedStats] = useState<AdminUserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    api.adminGetUsers()
      .then(({ users }) => setUsers(users))
      .catch(() => setError('No se pudo cargar la lista de usuarios'))
      .finally(() => setLoading(false));
  };

  const fetchSettings = () => {
    api.adminGetSettings()
      .then(({ settings }) => setSettings(settings))
      .catch(() => setError('No se pudo cargar la configuración del test'));
  };

  useEffect(() => {
    fetchUsers();
    fetchSettings();
  }, []);

  const handleSkipToggle = async () => {
    if (!settings || settingsSaving) return;
    const nextSettings = { ...settings, allowQuestionSkip: !settings.allowQuestionSkip };
    saveSettings(nextSettings);
  };

  const saveSettings = async (nextSettings: AppSettings) => {
    if (!settings || settingsSaving) return;
    setSettings(nextSettings);
    setSettingsSaving(true);
    try {
      const { settings: saved } = await api.adminUpdateSettings(nextSettings);
      setSettings(saved);
    } catch {
      setSettings(settings);
      setError('No se pudo guardar la configuración del test');
    } finally {
      setSettingsSaving(false);
    }
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    if (!settings) return;
    saveSettings({ ...settings, [key]: value });
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar la cuenta de ${name}? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    try {
      await api.adminDeleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      setError('No se pudo eliminar el usuario');
    } finally {
      setDeleting(null);
    }
  };

  const handleReset = async (id: number, name: string) => {
    if (!confirm(`¿Reiniciar el test activo de ${name}?`)) return;
    setResetting(id);
    try {
      await api.adminResetUserActiveSession(id);
      fetchUsers();
      if (selectedStats?.user.id === id) loadUserStats(id);
    } catch {
      setError('No se pudo reiniciar el test activo');
    } finally {
      setResetting(null);
    }
  };

  const loadUserStats = (id: number) => {
    setStatsLoading(true);
    api.adminGetUserStats(id)
      .then(setSelectedStats)
      .catch(() => setError('No se pudieron cargar las estadísticas del usuario'))
      .finally(() => setStatsLoading(false));
  };

  const fmt = (s: string | null) =>
    s ? new Date(s).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : '—';

  const totals = users.reduce(
    (acc, u) => ({
      sessions: acc.sessions + Number(u.session_count ?? 0),
      completed: acc.completed + Number(u.completed_count ?? 0),
      active: acc.active + Number(u.active_count ?? 0),
      answered: acc.answered + Number(u.answered_count ?? 0),
    }),
    { sessions: 0, completed: 0, active: 0, answered: 0 }
  );

  return (
    <div className="min-h-screen">
      <header className="border-b border-surface-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">RNV24</p>
            <h1 className="text-lg font-bold text-surface-900">Panel Administrador</h1>
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
              Volver
            </button>
            <button type="button" className="btn-secondary" onClick={() => { logout(); navigate('/login'); }}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-5 grid gap-3 sm:grid-cols-4">
          {[
            { label: 'Usuarios', value: users.length },
            { label: 'Tests activos', value: totals.active },
            { label: 'Tests completados', value: totals.completed },
            { label: 'Respuestas', value: totals.answered },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-surface-200 bg-white px-4 py-3">
              <p className="text-2xl font-bold text-surface-900">{item.value}</p>
              <p className="text-xs text-surface-500">{item.label}</p>
            </div>
          ))}
        </div>

        <section className="mb-6 rounded-lg border border-surface-200 bg-white px-5 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Configuración del test</p>
              <h2 className="mt-1 text-base font-bold text-surface-900">Permitir saltar preguntas</h2>
              <p className="mt-1 max-w-2xl text-sm text-surface-500">
                Cuando está activo, los participantes pueden avanzar sin responder una pregunta o enunciado.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings?.allowQuestionSkip ?? false}
              disabled={!settings || settingsSaving}
              onClick={handleSkipToggle}
              className={[
                'relative h-8 w-14 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                settings?.allowQuestionSkip ? 'bg-brand-600' : 'bg-surface-300',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform',
                  settings?.allowQuestionSkip ? 'translate-x-7' : 'translate-x-1',
                ].join(' ')}
              />
              <span className="sr-only">Permitir saltar preguntas</span>
            </button>
          </div>
        </section>

        <section className="mb-6 rounded-lg border border-surface-200 bg-white px-5 py-4">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Seguridad de registros</p>
            <h2 className="mt-1 text-base font-bold text-surface-900">Control de acceso para nuevos participantes</h2>
            <p className="mt-1 max-w-3xl text-sm text-surface-500">
              Ajusta el nivel de apertura del registro sin cambiar código. La nómina privada se mantiene solo en variables de entorno.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <label className="block">
              <span className="label">Modo de registro</span>
              <select
                className="input"
                value={settings?.registrationMode ?? 'open_strict'}
                disabled={!settings || settingsSaving}
                onChange={(e) => updateSetting('registrationMode', e.target.value as AppSettings['registrationMode'])}
              >
                <option value="private_roster">Privado por nómina</option>
                <option value="open_strict">Abierto estricto</option>
                <option value="open_review">Abierto con revisión suave</option>
                <option value="open">Libre básico</option>
              </select>
              <span className="mt-1 block text-xs text-surface-500">
                {settings?.hasPrivateRoster
                  ? 'La nómina privada está configurada en el servidor.'
                  : 'No hay nómina privada configurada en el servidor.'}
              </span>
            </label>

            <div className="space-y-3">
              {[
                {
                  key: 'validateSuspiciousNames' as const,
                  label: 'Bloquear nombres sospechosos',
                  description: 'Filtra datos como test, admin, demo o nombres claramente falsos.',
                },
                {
                  key: 'blockDisposableEmails' as const,
                  label: 'Bloquear correos temporales',
                  description: 'Rechaza dominios de prueba o correo desechable.',
                },
                {
                  key: 'limitRegistrationRate' as const,
                  label: 'Limitar creación de cuentas',
                  description: 'Frena registros masivos sin bloquear login por IP.',
                },
              ].map((item) => (
                <label key={item.key} className="flex items-start justify-between gap-4 rounded-lg border border-surface-200 bg-surface-50 px-4 py-3">
                  <span>
                    <span className="block text-sm font-semibold text-surface-800">{item.label}</span>
                    <span className="block text-xs text-surface-500">{item.description}</span>
                  </span>
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-brand-600"
                    checked={Boolean(settings?.[item.key])}
                    disabled={!settings || settingsSaving || settings?.registrationMode === 'open'}
                    onChange={(e) => updateSetting(item.key, e.target.checked)}
                  />
                </label>
              ))}
            </div>
          </div>
        </section>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-surface-900">
            Usuarios registrados ({users.length})
          </h2>
          <button type="button" className="btn-secondary text-sm" onClick={fetchUsers}>
            Actualizar
          </button>
        </div>

        {error && <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}

        {loading ? (
          <p className="text-surface-500">Cargando...</p>
        ) : users.length === 0 ? (
          <p className="text-surface-500">No hay usuarios registrados.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-surface-200">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 text-left text-xs font-semibold uppercase tracking-wide text-surface-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Registrado</th>
                  <th className="px-4 py-3">Último login</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3 text-center">Activos</th>
                  <th className="px-4 py-3 text-center">Tests</th>
                  <th className="px-4 py-3 text-center">Correctas</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 bg-white">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-50">
                    <td className="px-4 py-3 font-medium text-surface-900">{u.name}</td>
                    <td className="px-4 py-3 text-surface-600">{u.email}</td>
                    <td className="px-4 py-3 text-surface-500">{fmt(u.created_at)}</td>
                    <td className="px-4 py-3 text-surface-500">{fmt(u.last_login)}</td>
                    <td className="px-4 py-3 font-mono text-xs text-surface-500">{u.last_ip ?? '—'}</td>
                    <td className="px-4 py-3 text-center font-semibold text-brand-700">{u.active_count}</td>
                    <td className="px-4 py-3 text-center text-surface-700">{u.session_count}</td>
                    <td className="px-4 py-3 text-center text-emerald-700 font-semibold">{u.correct_count ?? 0}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="rounded px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                          onClick={() => loadUserStats(u.id)}
                        >
                          Estadísticas
                        </button>
                        <button
                          type="button"
                          className="rounded px-2 py-1 text-xs font-semibold text-surface-600 hover:bg-surface-100 disabled:opacity-40"
                          disabled={resetting === u.id || Number(u.active_count) === 0}
                          onClick={() => handleReset(u.id, u.name)}
                        >
                          {resetting === u.id ? 'Reiniciando...' : 'Reiniciar'}
                        </button>
                        <button
                          type="button"
                          className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                          disabled={deleting === u.id}
                          onClick={() => handleDelete(u.id, u.name)}
                        >
                          {deleting === u.id ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(selectedStats || statsLoading) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/50 px-4 backdrop-blur-sm">
            <div className="max-h-[86vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-surface-200 bg-white p-6 shadow-card-hover">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Detalle usuario</p>
                  <h3 className="text-lg font-bold text-surface-900">
                    {selectedStats ? selectedStats.user.name : 'Cargando...'}
                  </h3>
                  {selectedStats && (
                    <p className="text-sm text-surface-500">
                      {selectedStats.user.email} · IP: {selectedStats.user.last_ip ?? '—'}
                    </p>
                  )}
                </div>
                <button type="button" className="btn-ghost px-2 py-1" onClick={() => setSelectedStats(null)}>×</button>
              </div>

              {statsLoading || !selectedStats ? (
                <p className="text-surface-500">Cargando estadísticas...</p>
              ) : selectedStats.sessions.length === 0 ? (
                <p className="text-surface-500">Este usuario aún no tiene sesiones.</p>
              ) : (
                <div className="overflow-hidden rounded-lg border border-surface-200">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-50 text-left text-xs font-semibold uppercase tracking-wide text-surface-500">
                      <tr>
                        <th className="px-3 py-2">Inicio</th>
                        <th className="px-3 py-2">Estado</th>
                        <th className="px-3 py-2 text-center">Pregunta</th>
                        <th className="px-3 py-2 text-center">Respondidas</th>
                        <th className="px-3 py-2 text-center">Correctas</th>
                        <th className="px-3 py-2 text-center">Intentos código</th>
                        <th className="px-3 py-2 text-center">Alertas</th>
                        <th className="px-3 py-2 text-center">Puntaje</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {selectedStats.sessions.map((s) => (
                        <tr key={s.id}>
                          <td className="px-3 py-2 text-surface-600">{fmt(s.startedAt)}</td>
                          <td className="px-3 py-2 text-surface-700">{s.status}</td>
                          <td className="px-3 py-2 text-center">{s.currentQuestionId + 1}</td>
                          <td className="px-3 py-2 text-center">{s.answeredCount}</td>
                          <td className="px-3 py-2 text-center">{s.correctCount}</td>
                          <td className="px-3 py-2 text-center">{s.attemptsCount}</td>
                          <td className="px-3 py-2 text-center">{s.blurCount}</td>
                          <td className="px-3 py-2 text-center font-semibold text-brand-700">{s.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
