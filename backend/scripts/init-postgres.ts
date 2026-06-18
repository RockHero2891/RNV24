import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPostgresClient, initPostgresSchema, POSTGRES_SCHEMA } from '../src/db/postgres.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.error('DATABASE_URL is required. Set it in .env or pass as environment variable.');
  process.exit(1);
}

async function main() {
  console.log('Initializing PostgreSQL schema...');
  const client = createPostgresClient(databaseUrl);
  try {
    await initPostgresSchema(client);
    console.log('Schema applied successfully.');
    console.log('\nTables created: users, exam_sessions, answers, validation_attempts');
  } catch (err) {
    console.error('Failed to apply schema:', err);
    console.error('\nYou can also paste this SQL in the Neon SQL Editor:\n');
    console.log(POSTGRES_SCHEMA);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
