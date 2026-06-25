import pg from 'pg';
import type { DbClient, RunResult } from './types.js';
import { toPgParams } from './sql.js';

const { Pool } = pg;

export const POSTGRES_SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  last_ip VARCHAR(100),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migraciones seguras (columnas que pueden no existir en DBs viejas)
DO $mig$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_ip') THEN
    ALTER TABLE users ADD COLUMN last_ip VARCHAR(100);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='last_login') THEN
    ALTER TABLE users ADD COLUMN last_login TIMESTAMPTZ;
  END IF;
END $mig$;

CREATE TABLE IF NOT EXISTS exam_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  current_question_id INTEGER NOT NULL DEFAULT 0,
  current_section_id INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  section_time_remaining_ms JSONB NOT NULL DEFAULT '{}',
  dev_time_remaining_ms JSONB NOT NULL DEFAULT '{}',
  session_time_remaining_ms BIGINT NOT NULL,
  blur_count INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS answers (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  answer_text TEXT,
  selected_index INTEGER,
  is_correct BOOLEAN,
  attempts INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, question_id)
);

CREATE TABLE IF NOT EXISTS validation_attempts (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES exam_sessions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  code_submitted TEXT NOT NULL,
  is_valid BOOLEAN NOT NULL,
  feedback TEXT,
  score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS app_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO app_settings (key, value)
VALUES ('allow_question_skip', 'false')
ON CONFLICT (key) DO NOTHING;
`;

export function createPostgresClient(connectionString: string): DbClient {
  const pool = new Pool({
    connectionString,
    ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : undefined,
  });

  return {
    dialect: 'postgres',

    async get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
      const { text, values } = toPgParams(sql, params);
      const result = await pool.query(text, values);
      return result.rows[0] as T | undefined;
    },

    async all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
      const { text, values } = toPgParams(sql, params);
      const result = await pool.query(text, values);
      return result.rows as T[];
    },

    async run(sql: string, params: unknown[] = []): Promise<RunResult> {
      const isInsert = /^\s*INSERT/i.test(sql);
      let query = sql;
      if (isInsert && !/RETURNING/i.test(sql)) {
        query = `${sql.trim().replace(/;?\s*$/, '')} RETURNING id`;
      }

      const { text, values } = toPgParams(query, params);
      const result = await pool.query(text, values);
      return {
        lastInsertRowid: Number(result.rows[0]?.id ?? 0),
        changes: result.rowCount ?? 0,
      };
    },

    async exec(sql: string): Promise<void> {
      await pool.query(sql);
    },

    async close(): Promise<void> {
      await pool.end();
    },
  };
}

export async function initPostgresSchema(client: DbClient): Promise<void> {
  await client.exec(POSTGRES_SCHEMA);
}
