import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface AdminUser {
  id: number; name: string; email: string; created_at: string;
  last_ip: string | null; last_login: string | null;
  session_count: number; completed_count: number;
}

export function AdminPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    api.adminGetUsers()
      .then(({ users }) => setUsers(users))
      .catch(() => setError('No se pudo cargar la lista de usuarios'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

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

  const fmt = (s: string | null) =>
    s ? new Date(s).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : '—';

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
                  <th className="px-4 py-3 text-center">Sesiones</th>
                  <th className="px-4 py-3 text-center">Completados</th>
                  <th className="px-4 py-3"></th>
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
                    <td className="px-4 py-3 text-center text-surface-700">{u.session_count}</td>
                    <td className="px-4 py-3 text-center text-emerald-700 font-semibold">{u.completed_count}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                        disabled={deleting === u.id}
                        onClick={() => handleDelete(u.id, u.name)}
                      >
                        {deleting === u.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
