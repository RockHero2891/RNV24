import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import type { DbClient, RunResult } from './types.js';

const SQLITE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    last_ip TEXT,
    last_login TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  -- Migraciones seguras
  CREATE TABLE IF NOT EXISTS _migrations (id INTEGER PRIMARY KEY, name TEXT UNIQUE);
  INSERT OR IGNORE INTO _migrations VALUES (1, 'add_last_ip');
  INSERT OR IGNORE INTO _migrations VALUES (2, 'add_last_login');

  CREATE TABLE IF NOT EXISTS exam_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    started_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    current_question_id INTEGER NOT NULL DEFAULT 0,
    current_section_id INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active',
    section_time_remaining_ms TEXT NOT NULL DEFAULT '{}',
    dev_time_remaining_ms TEXT NOT NULL DEFAULT '{}',
    session_time_remaining_ms INTEGER NOT NULL,
    blur_count INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    answer_text TEXT,
    selected_index INTEGER,
    is_correct INTEGER,
    attempts INTEGER NOT NULL DEFAULT 0,
    answered_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES exam_sessions(id) ON DELETE CASCADE,
    UNIQUE(session_id, question_id)
  );

  CREATE TABLE IF NOT EXISTS validation_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    question_id INTEGER NOT NULL,
    code_submitted TEXT NOT NULL,
    is_valid INTEGER NOT NULL,
    feedback TEXT,
    score INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES exam_sessions(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  INSERT OR IGNORE INTO app_settings (key, value) VALUES ('allow_question_skip', 'false');
`;

export function createSqliteClient(): DbClient {
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'rnv24.db');
  const dbDir = path.dirname(dbPath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  return {
    dialect: 'sqlite',

    async get<T>(sql: string, params: unknown[] = []): Promise<T | undefined> {
      return sqlite.prepare(sql).get(...params) as T | undefined;
    },

    async all<T>(sql: string, params: unknown[] = []): Promise<T[]> {
      return sqlite.prepare(sql).all(...params) as T[];
    },

    async run(sql: string, params: unknown[] = []): Promise<RunResult> {
      const result = sqlite.prepare(sql).run(...params);
      return {
        lastInsertRowid: Number(result.lastInsertRowid),
        changes: result.changes,
      };
    },

    async exec(sql: string): Promise<void> {
      sqlite.exec(sql);
    },

    async close(): Promise<void> {
      sqlite.close();
    },
  };
}

export async function initSqliteSchema(client: DbClient): Promise<void> {
  await client.exec(SQLITE_SCHEMA);
}
