import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSectionById, isDevQuestion, type QuestionType } from '@rnv24/shared';
import { api, type ExamMetadata, type ExamSession } from '../services/api';
import { ProctorBar, TimerBar } from '../components/ExamChrome';
import { BreakScreen } from '../components/BreakScreen';
import { QuestionView } from '../components/QuestionView';
import { useAntiCheat } from '../hooks/useAntiCheat';
import { useTimer } from '../hooks/useTimer';

interface ExamPageProps {
  initialSession: ExamSession;
  metadata: ExamMetadata;
}

const LOCAL_PROGRESS_KEY = 'rnv24_exam_local';

export function ExamPage({ initialSession, metadata }: ExamPageProps) {
  const navigate = useNavigate();
  const [session, setSession] = useState(initialSession);
  const [currentQuestionId, setCurrentQuestionId] = useState(session.currentQuestionId);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [onBreak, setOnBreak] = useState(false);
  const [breakSectionId, setBreakSectionId] = useState<number | null>(null);

  const currentQuestion = metadata.questions.find((q) => q.id === currentQuestionId);
  const currentSection = getSectionById(session.currentSectionId);
  const isDev = currentQuestion
    ? isDevQuestion(currentQuestion.type as QuestionType)
    : false;

  const sectionKey = String(session.currentSectionId);
  const sectionInitial =
    session.sectionTimeRemainingMs[sectionKey] ??
    (currentSection?.timeMinutes ?? 30) * 60 * 1000;

  const devInitial =
    currentQuestion && isDev
      ? session.devTimeRemainingMs[String(currentQuestion.id)] ??
        (currentQuestion.devTimeMinutes ?? 20) * 60 * 1000
      : undefined;

  const sessionTimer = useTimer(session.sessionTimeRemainingMs, !onBreak);
  const sectionTimer = useTimer(sectionInitial, !onBreak && !questionAnswered);
  const devTimer = useTimer(devInitial ?? 0, !onBreak && !questionAnswered && isDev);

  const handleBlur = useCallback(() => {
    setSession((prev) => {
      const blurCount = prev.blurCount + 1;
      const updated = { ...prev, blurCount };
      api.saveProgress(prev.id, { blurCount }).catch(() => {});
      return updated;
    });
  }, []);

  const { blurCount, isBlurred, fullscreen, requestFullscreen } = useAntiCheat(handleBlur);

  useEffect(() => {
    api
      .getActiveSession()
      .then(({ answers }) => {
        if (answers?.length) {
          const correct = answers.filter((a) => a.is_correct === 1).length;
          setCorrectCount(correct);
        }
      })
      .catch(() => {});
  }, []);

  const persistTimers = useCallback(() => {
    const sectionTimeRemainingMs = {
      ...session.sectionTimeRemainingMs,
      [sectionKey]: sectionTimer.getRemaining(),
    };
    const devTimeRemainingMs = { ...session.devTimeRemainingMs };
    if (currentQuestion && isDev) {
      devTimeRemainingMs[String(currentQuestion.id)] = devTimer.getRemaining();
    }

    const payload = {
      currentQuestionId,
      currentSectionId: session.currentSectionId,
      sectionTimeRemainingMs,
      devTimeRemainingMs,
      sessionTimeRemainingMs: sessionTimer.getRemaining(),
      blurCount: session.blurCount,
    };

    localStorage.setItem(
      LOCAL_PROGRESS_KEY,
      JSON.stringify({ sessionId: session.id, ...payload })
    );

    api.saveProgress(session.id, payload).then(({ session: updated }) => {
      setSession(updated);
    }).catch(() => {});
  }, [
    session,
    sectionKey,
    sectionTimer,
    devTimer,
    currentQuestion,
    isDev,
    currentQuestionId,
    sessionTimer,
  ]);

  useEffect(() => {
    const id = window.setInterval(persistTimers, 15000);
    return () => clearInterval(id);
  }, [persistTimers]);

  const progressPercent = useMemo(
    () => Math.round(((currentQuestionId + (questionAnswered ? 1 : 0)) / metadata.totalQuestions) * 100),
    [currentQuestionId, questionAnswered, metadata.totalQuestions]
  );

  const handleAnswered = async (
    isCorrect: boolean,
    answerText?: string,
    selectedIndex?: number,
    attempts?: number
  ) => {
    if (!currentQuestion) return;

    setQuestionAnswered(true);
    if (isCorrect) setCorrectCount((c) => c + 1);

    await api.saveAnswer(session.id, {
      questionId: currentQuestion.id,
      answerText,
      selectedIndex,
      isCorrect,
      attempts,
    });

    persistTimers();
  };

  const isLastQuestion = currentQuestionId >= metadata.totalQuestions - 1;
  const isLastInSection =
    currentSection?.questionIds[currentSection.questionIds.length - 1] === currentQuestionId;

  const handleNext = async () => {
    if (!questionAnswered) return;

    if (isLastQuestion) {
      await api.saveProgress(session.id, {
        status: 'completed',
        sessionTimeRemainingMs: sessionTimer.getRemaining(),
      });
      localStorage.removeItem(LOCAL_PROGRESS_KEY);
      navigate('/complete', { state: { sessionId: session.id } });
      return;
    }

    if (isLastInSection) {
      setOnBreak(true);
      setBreakSectionId(session.currentSectionId);
      persistTimers();
      return;
    }

    const nextId = currentQuestionId + 1;
    const nextQuestion = metadata.questions.find((q) => q.id === nextId);
    const nextSectionId = nextQuestion?.sectionId ?? session.currentSectionId;

    setCurrentQuestionId(nextId);
    setQuestionAnswered(false);
    setSession((prev) => ({ ...prev, currentQuestionId: nextId, currentSectionId: nextSectionId }));

    await api.saveProgress(session.id, {
      currentQuestionId: nextId,
      currentSectionId: nextSectionId,
      sessionTimeRemainingMs: sessionTimer.getRemaining(),
      sectionTimeRemainingMs: {
        ...session.sectionTimeRemainingMs,
        [sectionKey]: sectionTimer.getRemaining(),
      },
    });
  };

  const handleContinueBreak = () => {
    const nextId = currentQuestionId + 1;
    const nextQuestion = metadata.questions.find((q) => q.id === nextId);
    const nextSectionId = nextQuestion?.sectionId ?? session.currentSectionId;

    setOnBreak(false);
    setBreakSectionId(null);
    setCurrentQuestionId(nextId);
    setQuestionAnswered(false);
    setSession((prev) => ({
      ...prev,
      currentQuestionId: nextId,
      currentSectionId: nextSectionId,
    }));

    api.saveProgress(session.id, {
      currentQuestionId: nextId,
      currentSectionId: nextSectionId,
    }).catch(() => {});
  };

  const nextSection = getSectionById((breakSectionId ?? session.currentSectionId) + 1);

  if (onBreak && currentSection) {
    return (
      <div className="min-h-screen bg-surface-100">
        <ProctorBar
          blurCount={blurCount}
          isBlurred={isBlurred}
          fullscreen={fullscreen}
          onRequestFullscreen={requestFullscreen}
        />
        <main className="mx-auto max-w-5xl px-4 py-10">
          <BreakScreen
            sectionTitle={currentSection.title}
            nextSectionTitle={nextSection ? `${nextSection.id}. ${nextSection.title}` : 'Fin del examen'}
            onContinue={handleContinueBreak}
            onPause={() => {
              persistTimers();
              navigate('/dashboard');
            }}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100">
      <ProctorBar
        blurCount={blurCount}
        isBlurred={isBlurred}
        fullscreen={fullscreen}
        onRequestFullscreen={requestFullscreen}
      />

      <TimerBar
        sessionRemaining={sessionTimer.remaining}
        sectionRemaining={sectionTimer.remaining}
        devRemaining={isDev ? devTimer.remaining : undefined}
        sectionTitle={`Sección ${session.currentSectionId}: ${currentSection?.title ?? ''}`}
        questionIndex={currentQuestionId}
        totalQuestions={metadata.totalQuestions}
      />

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between text-sm text-surface-600">
          <span>Progreso general: {progressPercent}%</span>
          <span>
            Aciertos: <strong className="text-surface-900">{correctCount}</strong>
          </span>
        </div>
        <div className="mb-6 h-2 overflow-hidden rounded-full bg-surface-200">
          <div
            className="h-full bg-brand-600 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {currentQuestion && (
          <QuestionView
            key={currentQuestion.id}
            metadata={metadata}
            questionId={currentQuestion.id}
            sessionId={session.id}
            answered={questionAnswered}
            onAnswered={handleAnswered}
          />
        )}

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            className="btn-secondary px-4"
            onClick={() => {
              persistTimers();
              navigate('/dashboard');
            }}
          >
            ← Pausar y salir
          </button>
          <button
            type="button"
            className="btn-success px-6"
            disabled={!questionAnswered}
            onClick={handleNext}
          >
            {isLastQuestion ? 'Finalizar examen' : 'Siguiente pregunta'}
          </button>
        </div>
      </main>
    </div>
  );
}
