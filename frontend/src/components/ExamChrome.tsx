import { formatTime } from '../services/api';

// ── Proctor Bar ───────────────────────────────────────────────────────────────
interface ProctorBarProps {
  blurCount: number;
  isBlurred: boolean;
  fullscreen: boolean;
  onRequestFullscreen: () => void;
}

export function ProctorBar({ blurCount, isBlurred, fullscreen, onRequestFullscreen }: ProctorBarProps) {
  return (
    <div className="border-b border-surface-800 bg-surface-950 px-4 py-2 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse2" />
          <span className="font-semibold tracking-wide uppercase text-surface-300">Supervisión simulada</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Dot label="Cámara" ok />
          <Dot label="Micrófono" ok />
          <Dot label="Pantalla" ok />
          <Dot label={isBlurred ? 'Foco perdido' : 'En examen'} ok={!isBlurred} />
          {blurCount > 0 && (
            <span className="rounded-full bg-warning-500/20 px-2.5 py-0.5 text-xs font-medium text-warning-400">
              {blurCount} alerta{blurCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {!fullscreen && (
          <button type="button" onClick={onRequestFullscreen}
            className="rounded-md border border-surface-700 px-3 py-1 text-xs text-surface-300 hover:bg-surface-800 transition-colors">
            ⛶ Pantalla completa
          </button>
        )}
      </div>
    </div>
  );
}

function Dot({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-green-400' : 'bg-red-400 animate-pulse2'}`} />
      <span className={ok ? 'text-surface-400' : 'text-red-400'}>{label}</span>
    </div>
  );
}

// ── Timer Bar + Progress Signature ───────────────────────────────────────────
interface TimerBarProps {
  sessionRemaining: number;
  sectionRemaining: number;
  devRemaining?: number;
  sectionTitle: string;
  questionIndex: number;
  totalQuestions: number;
}

export function TimerBar({
  sessionRemaining, sectionRemaining, devRemaining,
  sectionTitle, questionIndex, totalQuestions,
}: TimerBarProps) {
  const sessionLow = sessionRemaining < 60 * 60 * 1000;
  const sectionLow = sectionRemaining < 5 * 60 * 1000;
  const devLow     = devRemaining !== undefined && devRemaining < 3 * 60 * 1000;
  const pct        = Math.min(100, Math.round(((questionIndex + 1) / totalQuestions) * 100));

  return (
    <div className="border-b border-surface-200 bg-white">
      {/* Barra de progreso animada — firma visual */}
      <div className="relative h-1 w-full overflow-hidden bg-surface-100">
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #2563eb, #60a5fa, #2563eb)',
            backgroundSize: '200% 100%',
            animation: 'progress-shine 2.5s linear infinite',
          }}
        />
      </div>

      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{sectionTitle}</p>
          <p className="text-sm text-surface-600">
            Pregunta <span className="font-semibold text-surface-900">{questionIndex + 1}</span>
            {' '}de {totalQuestions}
            <span className="ml-2 text-surface-400 text-xs">({pct}%)</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-5">
          <ClockItem label="Sesión" value={formatTime(sessionRemaining)} low={sessionLow} />
          <ClockItem label="Sección" value={formatTime(sectionRemaining)} low={sectionLow} />
          {devRemaining !== undefined && (
            <ClockItem label="Ejercicio" value={formatTime(devRemaining)} low={devLow} />
          )}
        </div>
      </div>
    </div>
  );
}

function ClockItem({ label, value, low }: { label: string; value: string; low: boolean }) {
  return (
    <div className="text-right">
      <p className="text-[10px] font-medium uppercase tracking-widest text-surface-400">{label}</p>
      <p className={`font-mono text-base font-semibold tabular-nums leading-none mt-0.5
        ${low ? 'text-red-600 animate-pulse2' : 'text-surface-900'}`}>
        {value}
      </p>
    </div>
  );
}
