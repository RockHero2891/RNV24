export interface RunResult {
  lastInsertRowid: number;
  changes: number;
}

export type DbDialect = 'sqlite' | 'postgres';

export interface DbClient {
  dialect: DbDialect;
  get<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T | undefined>;
  all<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<T[]>;
  run(sql: string, params?: unknown[]): Promise<RunResult>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
}
