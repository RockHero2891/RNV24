export type QuestionType = 'test' | 'html' | 'codigo' | 'sql';

export interface Question {
  id: number;
  sectionId: number;
  type: QuestionType;
  question: string;
  options?: string[];
  correctIndex?: number;
  solution?: string;
  hints?: string[];
  preview?: boolean;
  devTimeMinutes?: number;
  validationKey?: string;
}

export interface Section {
  id: number;
  title: string;
  subtitle: string;
  timeMinutes: number;
  questionIds: number[];
}

export interface ValidationResult {
  valid: boolean;
  feedback: string;
  score: number;
  total: number;
}

export const TOTAL_SESSION_HOURS = 15;
export const MAX_DEV_ATTEMPTS = 10;
export const TOTAL_SESSION_MS = TOTAL_SESSION_HOURS * 60 * 60 * 1000;
