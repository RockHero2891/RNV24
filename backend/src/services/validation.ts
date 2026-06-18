import { validateByKey, getQuestionById, MAX_DEV_ATTEMPTS } from '@rnv24/shared';
import type { ValidationResult } from '@rnv24/shared';
import { getDb } from '../db/index.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

export async function validateCode(
  validationKey: string,
  code: string,
  questionContext: string,
  solution?: string
): Promise<ValidationResult> {
  if (OPENAI_API_KEY) {
    try {
      const aiResult = await validateWithOpenAI(validationKey, code, questionContext, solution);
      if (aiResult) return aiResult;
    } catch (err) {
      console.warn('AI validation failed, using heuristic fallback:', err);
    }
  }

  const heuristic = validateByKey(validationKey, code);
  if (heuristic) return heuristic;

  return {
    valid: false,
    feedback: 'No se encontró validador para esta pregunta.',
    score: 0,
    total: 1,
  };
}

async function validateWithOpenAI(
  validationKey: string,
  code: string,
  questionContext: string,
  solution?: string
): Promise<ValidationResult | null> {
  const prompt = `Eres un evaluador de código para un examen de certificación Full Stack JavaScript.
Evalúa si el código del estudiante cumple los requisitos. Acepta soluciones alternativas válidas, no solo la solución de referencia.

Pregunta:
${questionContext}

Clave de validación: ${validationKey}

Solución de referencia (puede haber otras válidas):
${solution || 'N/A'}

Código del estudiante:
${code}

Responde SOLO con JSON válido en este formato:
{"valid": boolean, "feedback": "explicación breve en español", "score": number, "total": number}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: 'Respondes únicamente con JSON válido.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content) as ValidationResult;
  return {
    valid: Boolean(parsed.valid),
    feedback: String(parsed.feedback || ''),
    score: Number(parsed.score) || 0,
    total: Number(parsed.total) || 5,
  };
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
  validationKey: string;
  questionContext: string;
  solution?: string;
} | null {
  const question = getQuestionById(questionId);
  if (!question?.validationKey) return null;
  return {
    validationKey: question.validationKey,
    questionContext: question.question,
    solution: question.solution,
  };
}
