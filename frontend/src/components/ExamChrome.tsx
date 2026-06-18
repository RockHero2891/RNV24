import { formatTime } from '../services/api';

interface ProctorBarProps {
  blurCount: number;
  isBlurred: boolean;
  fullscreen: boolean;
  onRequestFullscreen: () => void;
}

export function ProctorBar({ blurCount, isBlurred, fullscreen, onRequestFullscreen }: ProctorBarProps) {
  return (
    <div className="border-b border-surface-200 bg-surface-900 px-4 py-2 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-xs">
        <div className="font-semibold tracking-wide uppercase text-surface-200">
          Supervisión simulada
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <StatusItem label="Cámara" status="Conectada (simulada)" ok />
          <StatusItem label="Micrófono" status="Activo (simulado)" ok />
          <StatusItem label="Pantalla" status="Compartida (simulada)" ok />
          <StatusItem
            label="Enfoque"
            status={isBlurred ? 'Ventana perdida' : 'En examen'}
            ok={!isBlurred}
          />
          {blurCount > 0 && (
            <span className="rounded bg-amber-600/20 px-2 py-0.5 text-amber-200">
              Alertas: {blurCount}
            </span>
          )}
        </div>

        {!fullscreen && (
          <button type="button" onClick={onRequestFullscreen} className="btn-secondary text-xs">
            Pantalla completa
          </button>
        )}
      </div>
    </div>
  );
}

function StatusItem({ label, status, ok }: { label: string; status: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`}
        aria-hidden
      />
      <span className="text-surface-300">{label}:</span>
      <span className={ok ? 'text-white' : 'text-red-300'}>{status}</span>
    </div>
  );
}

interface TimerBarProps {
  sessionRemaining: number;
  sectionRemaining: number;
  devRemaining?: number;
  sectionTitle: string;
  questionIndex: number;
  totalQuestions: number;
}

export function TimerBar({
  sessionRemaining,
  sectionRemaining,
  devRemaining,
  sectionTitle,
  questionIndex,
  totalQuestions,
}: TimerBarProps) {
  const sessionLow = sessionRemaining < 60 * 60 * 1000;
  const sectionLow = sectionRemaining < 5 * 60 * 1000;

  return (
    <div className="border-b border-surface-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
            {sectionTitle}
          </p>
          <p className="text-sm text-surface-800">
            Pregunta {questionIndex + 1} de {totalQuestions}
          </p>
        </div>

        <div className="flex flex-wrap gap-6 text-sm">
          <Timer label="Sesión (15 h)" value={formatTime(sessionRemaining)} warning={sessionLow} />
          <Timer label="Sección" value={formatTime(sectionRemaining)} warning={sectionLow} />
          {devRemaining !== undefined && (
            <Timer label="Ejercicio" value={formatTime(devRemaining)} warning={devRemaining < 3 * 60 * 1000} />
          )}
        </div>
      </div>
    </div>
  );
}

function Timer({ label, value, warning }: { label: string; value: string; warning: boolean }) {
  return (
    <div className="text-right">
      <p className="text-xs text-surface-500">{label}</p>
      <p className={`font-mono text-lg font-semibold ${warning ? 'text-red-600' : 'text-surface-900'}`}>
        {value}
      </p>
    </div>
  );
}
