import { useState } from 'react';
import type { ExamMetadata } from '../services/api';
import { api } from '../services/api';
import { preventCopyPaste, preventContextMenu } from '../hooks/useAntiCheat';
import { MAX_DEV_ATTEMPTS, getQuestionById } from '@rnv24/shared';

interface QuestionViewProps {
  metadata: ExamMetadata;
  questionId: number;
  sessionId: number;
  answered: boolean;
  onAnswered: (isCorrect: boolean, answerText?: string, selectedIndex?: number, attempts?: number) => void;
}

export function QuestionView({ metadata, questionId, sessionId, answered, onAnswered }: QuestionViewProps) {
  const question = metadata.questions.find((q) => q.id === questionId);
  const [selected, setSelected] = useState<number | null>(null);
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hintIndex, setHintIndex] = useState(0);
  const [solution, setSolution] = useState<string | null>(null);

  if (!question) return null;
  const fullQuestion = getQuestionById(questionId);

  const isDev = question.type !== 'test';
  const typeLabels: Record<string, string> = {
    test: 'Teoría',
    html: 'Desarrollo HTML/CSS',
    codigo: 'Desarrollo JavaScript',
    sql: 'Desarrollo SQL',
  };

  const checkTest = () => {
    if (selected === null || answered || fullQuestion?.correctIndex === undefined) return;
    const correctIndex = fullQuestion?.correctIndex;
    if (correctIndex === undefined) return;

    const isCorrect = selected === correctIndex;
    const correctOption =
      question.options && correctIndex !== undefined
        ? `${String.fromCharCode(65 + correctIndex)}. ${question.options[correctIndex]}`
        : '';

    setFeedback({
      type: isCorrect ? 'success' : 'error',
      message: isCorrect
        ? 'Respuesta correcta.'
        : `Respuesta incorrecta. La opción correcta era: ${correctOption}`,
    });
    onAnswered(isCorrect, undefined, selected);
  };

  const checkCode = async () => {
    if (!code.trim() || answered || loading) return;

    setLoading(true);
    try {
      const result = await api.validateCode(sessionId, questionId, code);
      setAttempts(result.attempts);

      if (result.valid) {
        setFeedback({ type: 'success', message: result.feedback });
        if (result.solution) setSolution(result.solution);
        onAnswered(true, code, undefined, result.attempts);
      } else {
        setHintIndex((i) => Math.min(i + 1, (question.hints?.length ?? 1) - 1));
        setFeedback({
          type: 'error',
          message: `${result.feedback}\n\nPuntaje: ${result.score}/${result.total}. Intentos: ${result.attempts}/${result.maxAttempts}`,
        });

        if (result.attempts >= MAX_DEV_ATTEMPTS) {
          if (result.solution) setSolution(result.solution);
          onAnswered(false, code, undefined, result.attempts);
        }
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error al verificar el código',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">
          {typeLabels[question.type] || question.type}
        </span>
        <span className="text-sm text-surface-500">ID {question.id + 1}</span>
      </div>

      <div className="mb-6 whitespace-pre-wrap text-base font-medium leading-relaxed text-surface-900">
        {question.question}
      </div>

      {question.type === 'test' && question.options && (
        <div className="space-y-2">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              type="button"
              disabled={answered}
              onClick={() => setSelected(idx)}
              className={`w-full rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                selected === idx
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-surface-200 bg-surface-50 hover:bg-white'
              } ${answered ? 'cursor-default opacity-80' : ''}`}
            >
              <span className="font-semibold text-brand-700">{String.fromCharCode(65 + idx)}.</span> {opt}
            </button>
          ))}
        </div>
      )}

      {isDev && (
        <div className="space-y-3">
          <textarea
            value={code}
            disabled={answered}
            onChange={(e) => setCode(e.target.value)}
            onCopy={preventCopyPaste}
            onCut={preventCopyPaste}
            onPaste={preventCopyPaste}
            onContextMenu={preventContextMenu}
            placeholder={
              question.type === 'sql'
                ? 'Escribe tu consulta SQL aquí...'
                : 'Escribe tu código aquí...'
            }
            className="min-h-[180px] w-full resize-y rounded-md border border-surface-200 bg-surface-900 p-4 font-mono text-sm text-slate-100 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500"
            spellCheck={false}
          />

          <p className="text-sm text-surface-500">
            Intentos de verificación: <strong>{attempts}</strong> / {MAX_DEV_ATTEMPTS}
          </p>

          {question.hints && hintIndex > 0 && !answered && (
            <div className="rounded-md border-l-4 border-brand-500 bg-brand-50 px-4 py-3 text-sm text-brand-900">
              Pista: {question.hints[hintIndex - 1]}
            </div>
          )}
        </div>
      )}

      {feedback && (
        <div
          className={`mt-4 rounded-md px-4 py-3 text-sm whitespace-pre-wrap ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900'
              : feedback.type === 'error'
                ? 'bg-red-50 text-red-900'
                : 'bg-sky-50 text-sky-900'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {solution && (
        <div className="mt-4 rounded-md bg-surface-100 p-4">
          <p className="mb-2 text-sm font-semibold text-surface-800">Solución de referencia</p>
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-surface-800">{solution}</pre>
        </div>
      )}

      <div className="mt-6 flex justify-end gap-3">
        {!answered && (
          <button
            type="button"
            className="btn-primary"
            disabled={question.type === 'test' ? selected === null : !code.trim() || loading}
            onClick={question.type === 'test' ? checkTest : checkCode}
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        )}
      </div>
    </div>
  );
}
