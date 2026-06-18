const API_URL = import.meta.env.VITE_API_URL || '';

function getToken(): string | null {
  return localStorage.getItem('rnv24_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status}`);
  }

  return data as T;
}

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface ExamSession {
  id: number;
  userId: number;
  startedAt: string;
  expiresAt: string;
  currentQuestionId: number;
  currentSectionId: number;
  status: string;
  sectionTimeRemainingMs: Record<string, number>;
  devTimeRemainingMs: Record<string, number>;
  sessionTimeRemainingMs: number;
  blurCount: number;
  completedAt?: string;
}

export interface ExamMetadata {
  title: string;
  sections: Array<{
    id: number;
    title: string;
    subtitle: string;
    timeMinutes: number;
    questionIds: number[];
  }>;
  totalQuestions: number;
  questions: Array<{
    id: number;
    sectionId: number;
    type: string;
    question: string;
    options?: string[];
    preview?: boolean;
    devTimeMinutes?: number;
    hints?: string[];
  }>;
}

export interface ValidationResponse {
  valid: boolean;
  feedback: string;
  score: number;
  total: number;
  attempts: number;
  maxAttempts: number;
  attemptsRemaining: number;
  solution?: string;
}

export const api = {
  register: (email: string, password: string, name: string) =>
    request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    }),

  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<{ user: User }>('/api/auth/me'),

  getMetadata: () => request<ExamMetadata>('/api/exam/metadata'),

  startSession: () =>
    request<{ session: ExamSession; resumed: boolean }>('/api/sessions/start', { method: 'POST' }),

  getActiveSession: () =>
    request<{
      session: ExamSession | null;
      answers?: Array<{
        question_id: number;
        answer_text: string | null;
        selected_index: number | null;
        is_correct: number;
        attempts: number;
      }>;
    }>('/api/sessions/active'),

  saveProgress: (sessionId: number, data: Partial<ExamSession> & { status?: string }) =>
    request<{ session: ExamSession }>(`/api/sessions/${sessionId}/progress`, {
      method: 'PUT',
      body: JSON.stringify({
        currentQuestionId: data.currentQuestionId,
        currentSectionId: data.currentSectionId,
        sectionTimeRemainingMs: data.sectionTimeRemainingMs,
        devTimeRemainingMs: data.devTimeRemainingMs,
        sessionTimeRemainingMs: data.sessionTimeRemainingMs,
        blurCount: data.blurCount,
        status: data.status,
      }),
    }),

  saveAnswer: (
    sessionId: number,
    data: {
      questionId: number;
      answerText?: string;
      selectedIndex?: number;
      isCorrect: boolean;
      attempts?: number;
    }
  ) =>
    request<{ ok: boolean }>(`/api/sessions/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  validateCode: (sessionId: number, questionId: number, code: string) =>
    request<ValidationResponse>('/api/sessions/validate-code', {
      method: 'POST',
      body: JSON.stringify({ sessionId, questionId, code }),
    }),

  getSummary: (sessionId: number) =>
    request<{
      session: ExamSession;
      totalQuestions: number;
      answered: number;
      correct: number;
      percentage: number;
    }>(`/api/sessions/${sessionId}/summary`),

  deleteMyAccount: () =>
    request<{ ok: boolean }>('/api/auth/me', { method: 'DELETE' }),

  adminGetUsers: () =>
    request<{ users: Array<{
      id: number; name: string; email: string; created_at: string;
      last_ip: string | null; last_login: string | null;
      session_count: number; completed_count: number;
    }> }>('/api/auth/admin/users'),

  adminDeleteUser: (id: number) =>
    request<{ ok: boolean }>(`/api/auth/admin/users/${id}`, { method: 'DELETE' }),
};

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem('rnv24_token', token);
  else localStorage.removeItem('rnv24_token');
}

export function formatTime(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}
