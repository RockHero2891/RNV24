import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, type ExamMetadata, type ExamSession } from '../services/api';
import { ExamPage } from './ExamPage';

export function ExamRoute() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [metadata, setMetadata] = useState<ExamMetadata | null>(null);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    async function load() {
      try {
        const meta = await api.getMetadata();
        setMetadata(meta);

        let active = await api.getActiveSession();
        if (!active.session) {
          const started = await api.startSession();
          active = { session: started.session };
        }
        setSession(active.session);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar el examen');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-surface-600">
        Cargando examen...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-600">{error}</p>
        <button type="button" className="btn-primary" onClick={() => navigate('/dashboard')}>
          Volver al panel
        </button>
      </div>
    );
  }

  if (!metadata || !session) {
    return <Navigate to="/dashboard" replace />;
  }

  if (session.status === 'completed') {
    return <Navigate to="/complete" state={{ sessionId: session.id }} replace />;
  }

  return <ExamPage initialSession={session} metadata={metadata} />;
}
