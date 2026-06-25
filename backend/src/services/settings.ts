import { getDb } from '../db/index.js';

export const SETTING_KEYS = {
  allowQuestionSkip: 'allow_question_skip',
} as const;

export interface AppSettings {
  allowQuestionSkip: boolean;
}

function toBool(value: unknown, fallback = false): boolean {
  if (value === undefined || value === null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

export async function getAppSettings(): Promise<AppSettings> {
  const db = getDb();
  const rows = await db.all<{ key: string; value: string }>(
    'SELECT key, value FROM app_settings WHERE key = ?',
    [SETTING_KEYS.allowQuestionSkip]
  );

  const values = new Map(rows.map((row) => [row.key, row.value]));
  return {
    allowQuestionSkip: toBool(values.get(SETTING_KEYS.allowQuestionSkip), false),
  };
}

export async function updateAppSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const db = getDb();

  if (settings.allowQuestionSkip !== undefined) {
    await db.run(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at`,
      [
        SETTING_KEYS.allowQuestionSkip,
        settings.allowQuestionSkip ? 'true' : 'false',
        new Date().toISOString(),
      ]
    );
  }

  return getAppSettings();
}
