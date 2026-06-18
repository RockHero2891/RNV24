import { Router } from 'express';
import {
  SECTIONS,
  QUESTIONS,
  TOTAL_SESSION_MS,
  getQuestionById,
  isDevQuestion,
} from '@rnv24/shared';
import { getDb } from '../db/index.js';
import { parseJsonField, isTruthyDbFlag } from '../db/sql.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  validateCode,
  canAttempt,
  getAttemptCount,
  getQuestionValidationContext,
} from '../services/validation.js';

const router = Router();

function buildInitialTimers() {
  const sectionTimeRemainingMs: Record<string, number> = {};
  const devTimeRemainingMs: Record<string, number> = {};

  for (const section of SECTIONS) {
    sectionTimeRemainingMs[String(section.id)] = section.timeMinutes * 60 * 1000;
  }

  for (const q of QUESTIONS) {
    if (isDevQuestion(q.type) && q.devTimeMinutes) {
      devTimeRemainingMs[String(q.id)] = q.devTimeMinutes * 60 * 1000;
    }
  }

  return { sectionTimeRemainingMs, devTimeRemainingMs };
}

function mapSession(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    startedAt: row.started_at,
    expiresAt: row.expires_at,
    currentQuestionId: row.current_question_id,
    currentSectionId: row.current_section_id,
    status: row.status,
    sectionTimeRemainingMs: parseJsonField(row.section_time_remaining_ms),
    devTimeRemainingMs: parseJsonField(row.dev_time_remaining_ms),
    sessionTimeRemainingMs: row.session_time_remaining_ms,
    blurCount: row.blur_count,
    completedAt: row.completed_at,
  };
}

router.post('/start', authMiddleware, async (req, res) => {
  const userId = req.user!.userId;
  const db = getDb();

  const active = await db.get<Record<string, unknown>>(
    "SELECT * FROM exam_sessions WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1",
    [userId]
  );

  if (active) {
    res.json({ session: mapSession(active), resumed: true });
    return;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + TOTAL_SESSION_MS);
  const timers = buildInitialTimers();

  const result = await db.run(
    `INSERT INTO exam_sessions (
      user_id, started_at, expires_at, current_question_id, current_section_id,
      section_time_remaining_ms, dev_time_remaining_ms, session_time_remaining_ms
    ) VALUES (?, ?, ?, 0, 1, ?, ?, ?)`,
    [
      userId,
      now.toISOString(),
      expiresAt.toISOString(),
      JSON.stringify(timers.sectionTimeRemainingMs),
      JSON.stringify(timers.devTimeRemainingMs),
      TOTAL_SESSION_MS,
    ]
  );

  const session = await db.get<Record<string, unknown>>('SELECT * FROM exam_sessions WHERE id = ?', [
    result.lastInsertRowid,
  ]);

  res.status(201).json({ session: mapSession(session!), resumed: false });
});

router.get('/active', authMiddleware, async (req, res) => {
  const db = getDb();
  const session = await db.get<Record<string, unknown>>(
    "SELECT * FROM exam_sessions WHERE user_id = ? AND status = 'active' ORDER BY id DESC LIMIT 1",
    [req.user!.userId]
  );

  if (!session) {
    res.json({ session: null });
    return;
  }

  const answers = await db.all(
    'SELECT question_id, answer_text, selected_index, is_correct, attempts FROM answers WHERE session_id = ?',
    [session.id]
  );

  res.json({ session: mapSession(session), answers });
});

router.put('/:sessionId/progress', authMiddleware, async (req, res) => {
  const sessionId = Number(req.params.sessionId);
  const {
    currentQuestionId,
    currentSectionId,
    sectionTimeRemainingMs,
    devTimeRemainingMs,
    sessionTimeRemainingMs,
    blurCount,
    status,
  } = req.body;

  const db = getDb();
  const session = await db.get<Record<string, unknown>>(
    'SELECT * FROM exam_sessions WHERE id = ? AND user_id = ?',
    [sessionId, req.user!.userId]
  );

  if (!session) {
    res.status(404).json({ error: 'Sesión no encontrada' });
    return;
  }

  const now = new Date().toISOString();

  await db.run(
    `UPDATE exam_sessions SET
      current_question_id = COALESCE(?, current_question_id),
      current_section_id = COALESCE(?, current_section_id),
      section_time_remaining_ms = COALESCE(?, section_time_remaining_ms),
      dev_time_remaining_ms = COALESCE(?, dev_time_remaining_ms),
      session_time_remaining_ms = COALESCE(?, session_time_remaining_ms),
      blur_count = COALESCE(?, blur_count),
      status = COALESCE(?, status),
      completed_at = CASE WHEN ? = 'completed' THEN ? ELSE completed_at END,
      updated_at = ?
    WHERE id = ?`,
    [
      currentQuestionId ?? null,
      currentSectionId ?? null,
      sectionTimeRemainingMs ? JSON.stringify(sectionTimeRemainingMs) : null,
      devTimeRemainingMs ? JSON.stringify(devTimeRemainingMs) : null,
      sessionTimeRemainingMs ?? null,
      blurCount ?? null,
      status ?? null,
      status ?? null,
      now,
      now,
      sessionId,
    ]
  );

  const updated = await db.get<Record<string, unknown>>('SELECT * FROM exam_sessions WHERE id = ?', [sessionId]);
  res.json({ session: mapSession(updated!) });
});

router.post('/:sessionId/answer', authMiddleware, async (req, res) => {
  const sessionId = Number(req.params.sessionId);
  const { questionId, answerText, selectedIndex, isCorrect, attempts } = req.body;

  const db = getDb();
  const session = await db.get('SELECT id FROM exam_sessions WHERE id = ? AND user_id = ?', [
    sessionId,
    req.user!.userId,
  ]);

  if (!session) {
    res.status(404).json({ error: 'Sesión no encontrada' });
    return;
  }

  const now = new Date().toISOString();

  await db.run(
    `INSERT INTO answers (session_id, question_id, answer_text, selected_index, is_correct, attempts, answered_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(session_id, question_id) DO UPDATE SET
       answer_text = excluded.answer_text,
       selected_index = excluded.selected_index,
       is_correct = excluded.is_correct,
       attempts = excluded.attempts,
       answered_at = excluded.answered_at`,
    [sessionId, questionId, answerText ?? null, selectedIndex ?? null, Boolean(isCorrect), attempts ?? 0, now]
  );

  res.json({ ok: true });
});

router.post('/validate-code', authMiddleware, async (req, res) => {
  const { sessionId, questionId, code } = req.body as {
    sessionId?: number;
    questionId?: number;
    code?: string;
  };

  if (!sessionId || questionId === undefined || !code?.trim()) {
    res.status(400).json({ error: 'sessionId, questionId y code son obligatorios' });
    return;
  }

  const db = getDb();
  const session = await db.get('SELECT id FROM exam_sessions WHERE id = ? AND user_id = ?', [
    sessionId,
    req.user!.userId,
  ]);

  if (!session) {
    res.status(404).json({ error: 'Sesión no encontrada' });
    return;
  }

  if (!(await canAttempt(sessionId, questionId))) {
    res.status(429).json({
      error: 'Has agotado los 10 intentos de verificación',
      attempts: await getAttemptCount(sessionId, questionId),
      maxAttempts: 10,
    });
    return;
  }

  const ctx = getQuestionValidationContext(questionId);
  if (!ctx) {
    res.status(400).json({ error: 'Pregunta no válida para verificación de código' });
    return;
  }

  const result = await validateCode(ctx.validationKey, code.trim());

  await db.run(
    `INSERT INTO validation_attempts (session_id, question_id, code_submitted, is_valid, feedback, score)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [sessionId, questionId, code.trim(), result.valid, result.feedback, result.score]
  );

  const attempts = await getAttemptCount(sessionId, questionId);
  const question = getQuestionById(questionId);

  res.json({
    valid: result.valid,
    feedback: result.feedback,
    score: result.score,
    total: result.total,
    attempts,
    maxAttempts: 10,
    attemptsRemaining: Math.max(0, 10 - attempts),
    solution: result.valid || attempts >= 10 ? question?.solution : undefined,
  });
});

router.get('/:sessionId/summary', authMiddleware, async (req, res) => {
  const sessionId = Number(req.params.sessionId);
  const db = getDb();

  const session = await db.get<Record<string, unknown>>(
    'SELECT * FROM exam_sessions WHERE id = ? AND user_id = ?',
    [sessionId, req.user!.userId]
  );

  if (!session) {
    res.status(404).json({ error: 'Sesión no encontrada' });
    return;
  }

  const answers = await db.all<{ question_id: number; is_correct: unknown }>(
    'SELECT question_id, is_correct FROM answers WHERE session_id = ?',
    [sessionId]
  );

  const correct = answers.filter((a) => isTruthyDbFlag(a.is_correct)).length;

  res.json({
    session: mapSession(session),
    totalQuestions: QUESTIONS.length,
    answered: answers.length,
    correct,
    percentage: answers.length ? Math.round((correct / QUESTIONS.length) * 100) : 0,
  });
});

export default router;
