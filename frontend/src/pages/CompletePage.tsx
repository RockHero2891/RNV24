import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function CompletePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = (location.state as { sessionId?: number } | null)?.sessionId;
  const [summary, setSummary] = useState<{
    correct: number;
    totalQuestions: number;
    percentage: number;
    blurCount: number;
  } | null>(null);

  useEffect(() => {
    if (!sessionId) {
      navigate('/dashboard');
      return;
    }

    api
      .getSummary(sessionId)
      .then((data) => {
        setSummary({
          correct: data.correct,
          totalQuestions: data.totalQuestions,
          percentage: data.percentage,
          blurCount: data.session.blurCount,
        });
      })
      .catch(() => navigate('/dashboard'));
  }, [sessionId, navigate]);

  if (!summary) {
    return (
      <div className="flex min-h-screen items-center justify-center text-surface-600">
        Cargando resultados...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card max-w-lg p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Examen finalizado</p>
        <h1 className="mt-2 text-2xl font-bold text-surface-900">Resultados del simulador</h1>
        <p className="mt-6 text-3xl font-bold text-brand-700">
          {summary.correct} / {summary.totalQuestions}
        </p>
        <p className="mt-1 text-surface-600">{summary.percentage}% de aciertos</p>
        <p className="mt-4 text-sm text-surface-500">
          Alertas de enfoque registradas: {summary.blurCount}
        </p>
        <button type="button" className="btn-primary mt-8" onClick={() => navigate('/dashboard')}>
          Volver al panel
        </button>
      </div>
    </div>
  );
}
