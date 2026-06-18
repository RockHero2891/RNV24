import { validateByKey, getQuestionById, MAX_DEV_ATTEMPTS } from '@rnv24/shared';
import type { ValidationResult } from '@rnv24/shared';
import { getDb } from '../db/index.js';

export async function validateCode(
  validationKey: string,
  code: string,
): Promise<ValidationResult> {
  const heuristic = validateByKey(validationKey, code);
  if (heuristic) return heuristic;
  return { valid: false, feedback: 'No se encontró validador para esta pregunta.', score: 0, total: 1 };
}

export async function getAttemptCount(sessionId: number, questionId: number): Promise<number> {
  const db = getDb();
  const row = await db.get<{ count: number }>(
    'SELECT COUNT(*) as count FROM validation_attempts WHERE session_id = ? AND question_id = ?',
    [sessionId, questionId]
  );
  return Number(row?.count ?? 0);
}

export async function canAttempt(sessionId: number, questionId: number): Promise<boolean> {
  return (await getAttemptCount(sessionId, questionId)) < MAX_DEV_ATTEMPTS;
}

export function getQuestionValidationContext(questionId: number): {
  validationKey: string; questionContext: string; solution?: string;
} | null {
  const question = getQuestionById(questionId);
  if (!question?.validationKey) return null;
  return { validationKey: question.validationKey, questionContext: question.question, solution: question.solution };
}
