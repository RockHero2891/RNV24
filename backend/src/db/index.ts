import type { DbClient } from './types.js';
import { createSqliteClient, initSqliteSchema } from './sqlite.js';
import { createPostgresClient, initPostgresSchema } from './postgres.js';

export { POSTGRES_SCHEMA } from './postgres.js';
export type { DbClient } from './types.js';

let dbClient: DbClient | null = null;

export function getDb(): DbClient {
  if (!dbClient) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return dbClient;
}

export async function initDatabase(): Promise<DbClient> {
  if (dbClient) return dbClient;

  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    console.log('Using PostgreSQL (DATABASE_URL)');
    dbClient = createPostgresClient(databaseUrl);
    await initPostgresSchema(dbClient);
  } else {
    console.log('Using SQLite (local development)');
    dbClient = createSqliteClient();
    await initSqliteSchema(dbClient);
  }

  return dbClient;
}

export async function closeDatabase(): Promise<void> {
  if (dbClient) {
    await dbClient.close();
    dbClient = null;
  }
}
