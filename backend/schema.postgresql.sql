-- Esquema PostgreSQL para Neon (producción)
-- Ejecutar en la consola SQL de Neon antes del despliegue

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exam_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'in_progress',
  current_index INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  session_started_at TIMESTAMPTZ NOT NULL,
  session_expires_at TIMESTAMPTZ NOT NULL,
  section_timers JSONB NOT NULL DEFAULT '{}',
  dev_timers JSONB NOT NULL DEFAULT '{}',
  blur_events INTEGER NOT NULL DEFAULT 0,
  proctoring_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  completed_sections JSONB NOT NULL DEFAULT '[]',
  on_break BOOLEAN NOT NULL DEFAULT FALSE,
  break_after_section INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
  question_id VARCHAR(50) NOT NULL,
  question_index INTEGER NOT NULL,
  answer_type VARCHAR(20) NOT NULL,
  selected_option INTEGER,
  code_answer TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  attempts INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, question_id)
);

CREATE TABLE IF NOT EXISTS validation_attempts (
  id UUID PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
  question_id VARCHAR(50) NOT NULL,
  attempt_number INTEGER NOT NULL,
  user_code TEXT NOT NULL,
  is_valid BOOLEAN NOT NULL DEFAULT FALSE,
  feedback TEXT,
  score INTEGER,
  method VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON exam_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_session ON answers(session_id);
