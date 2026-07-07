import { useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ExamMetadata } from '../services/api';
import { api } from '../services/api';
import { CodeEditor } from './CodeEditor';
import { MAX_DEV_ATTEMPTS, getQuestionById } from '@rnv24/shared';

interface QuestionViewProps {
  metadata: ExamMetadata;
  questionId: number;
  sessionId: number;
  answered: boolean;
  onAnswered: (isCorrect: boolean, answerText?: string, selectedIndex?: number, attempts?: number) => void;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  test:   { label: 'Teoría',               color: 'badge-slate' },
  html:   { label: 'Desarrollo HTML/CSS',  color: 'badge-blue'  },
  codigo: { label: 'Desarrollo JavaScript', color: 'badge-amber' },
  sql:    { label: 'Desarrollo SQL',        color: 'badge-green' },
};

function AttemptsBar({ used, max }: { used: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-1">
        {Array.from({ length: max }).map((_, i) => (
          <div key={i}
            className={`h-1.5 w-4 rounded-full transition-colors ${i < used ? 'bg-brand-500' : 'bg-surface-200'}`}
          />
        ))}
      </div>
      <span className="text-xs text-surface-500">{used}/{max} intentos</span>
    </div>
  );
}

function QuestionMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      className="question-markdown"
      components={{
        code({ className, children }) {
          const isBlock = className?.startsWith('language-');
          if (!isBlock) {
            return <code className="rounded bg-surface-100 px-1.5 py-0.5 font-mono text-[0.92em] text-brand-800">{children}</code>;
          }
          return <code className={className}>{children}</code>;
        },
      }}
    >
      {children}
    </ReactMarkdown>
  );
}

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function seedFromParts(...parts: Array<string | number>) {
  const input = parts.join(':');
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

function shuffleOptions(options: string[], seed: number) {
  const random = seededRandom(seed);
  const items = options.map((text, originalIndex) => ({ text, originalIndex }));
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function QuestionView({ metadata, questionId, sessionId, answered, onAnswered }: QuestionViewProps) {
  const question     = metadata.questions.find((q) => q.id === questionId);
  const fullQuestion = getQuestionById(questionId);

  const [selected, setSelected]   = useState<number | null>(null);
  const [code, setCode]           = useState('');
  const [feedback, setFeedback]   = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading]     = useState(false);
  const [attempts, setAttempts]   = useState(0);
  const [hintIndex, setHintIndex] = useState(0);
  const [solution, setSolution]   = useState<string | null>(null);

  useEffect(() => {
    if (!question) return;
    setCode(question.starterCode ?? '');
    setSelected(null);
    setFeedback(null);
    setAttempts(0);
    setHintIndex(0);
    setSolution(null);
  }, [question?.id, question?.starterCode]);

  const shuffledOptions = useMemo(
    () => question?.options ? shuffleOptions(question.options, seedFromParts(sessionId, question.id)) : [],
    [question?.id, question?.options, sessionId]
  );

  if (!question) return null;

  const isDev = question.type !== 'test';
  const typeInfo = TYPE_LABELS[question.type] ?? { label: question.type, color: 'badge-slate' };

  const checkTest = () => {
    if (selected === null || answered || fullQuestion?.correctIndex === undefined) return;
    const selectedOption = shuffledOptions[selected];
    const correctDisplayIndex = shuffledOptions.findIndex((opt) => opt.originalIndex === fullQuestion.correctIndex);
    const isCorrect  = selectedOption?.originalIndex === fullQuestion.correctIndex;
    const correctOpt = correctDisplayIndex >= 0
      ? `${String.fromCharCode(65 + correctDisplayIndex)}. ${shuffledOptions[correctDisplayIndex].text}`
      : '';
    setFeedback({
      type: isCorrect ? 'success' : 'error',
      message: isCorrect
        ? '¡Correcto!'
        : `Incorrecto. La respuesta era: ${correctOpt}`,
    });
    onAnswered(isCorrect, undefined, selectedOption?.originalIndex ?? selected);
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
          message: `${result.feedback}  ·  Puntaje: ${result.score}/${result.total}`,
        });
        if (result.attempts >= MAX_DEV_ATTEMPTS) {
          if (result.solution) setSolution(result.solution);
          onAnswered(false, code, undefined, result.attempts);
        }
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err instanceof Error ? err.message : 'Error al verificar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 animate-fade-in">
      {/* Cabecera */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={typeInfo.color}>{typeInfo.label}</span>
          {isDev && question.devTimeMinutes && (
            <span className="badge-amber">⏱ {question.devTimeMinutes} min</span>
          )}
        </div>
        <span className="font-mono text-xs text-surface-400">#{questionId + 1}</span>
      </div>

      {/* Enunciado */}
      <QuestionMarkdown>{question.question}</QuestionMarkdown>

      {/* Test */}
      {question.type === 'test' && question.options && (
        <div className="space-y-2">
          {shuffledOptions.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrect  = answered && fullQuestion?.correctIndex === opt.originalIndex;
            const isWrong    = answered && selected === idx && fullQuestion?.correctIndex !== opt.originalIndex;
            return (
              <button key={idx} type="button" disabled={answered} onClick={() => setSelected(idx)}
                className={[
                  'flex w-full items-start rounded-lg border px-3.5 py-2.5 text-left text-sm transition-all duration-150',
                  isCorrect ? 'border-green-400 bg-green-50 text-green-900' :
                  isWrong   ? 'border-red-400 bg-red-50 text-red-900' :
                  isSelected ? 'border-brand-500 bg-brand-50 text-brand-900' :
                  'border-surface-200 bg-surface-50 hover:border-surface-300 hover:bg-white',
                  answered ? 'cursor-default' : 'cursor-pointer',
                ].join(' ')}>
                <span className="mr-2.5 mt-0.5 shrink-0 font-bold text-surface-400">
                  {String.fromCharCode(65 + idx)}.
                </span>
                <span className="leading-6">{opt.text}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Dev */}
      {isDev && (
        <div className="space-y-4">
          <CodeEditor
            value={code}
            onChange={setCode}
            disabled={answered}
            language={question.type === 'sql' ? 'sql' : question.type === 'html' ? 'html' : 'codigo'}
            placeholder={question.type === 'sql' ? 'Escribe tu consulta SQL aquí...' : 'Escribe tu código aquí...'}
          />

          <div className="flex items-center justify-between">
            <AttemptsBar used={attempts} max={MAX_DEV_ATTEMPTS} />
            {question.hints && hintIndex > 0 && !answered && (
              <span className="text-xs text-brand-600 font-medium">
                Pista {hintIndex}/{question.hints.length}
              </span>
            )}
          </div>

          {question.hints && hintIndex > 0 && !answered && (
            <div className="alert alert-info text-xs animate-slide-in">
              💡 {question.hints[hintIndex - 1]}
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className={`mt-4 alert animate-slide-in ${feedback.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {feedback.type === 'success' ? '✓ ' : '✗ '}{feedback.message}
        </div>
      )}

      {/* Solución de referencia */}
      {solution && (
        <div className="mt-4 rounded-lg border border-surface-200 bg-surface-900 p-4 animate-slide-in">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-surface-400">
            Solución de referencia
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs text-slate-200 leading-relaxed">
            {solution}
          </pre>
        </div>
      )}

      {/* Acción */}
      {!answered && (
        <div className="mt-6 flex justify-end">
          <button type="button" className="btn-primary"
            disabled={isDev ? !code.trim() || loading : selected === null}
            onClick={isDev ? checkCode : checkTest}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"/>
                Verificando...
              </span>
            ) : 'Verificar respuesta'}
          </button>
        </div>
      )}
    </div>
  );
}
