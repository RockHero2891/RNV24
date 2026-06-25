import { getDb } from '../db/index.js';

export const SETTING_KEYS = {
  allowQuestionSkip: 'allow_question_skip',
  registrationMode: 'registration_mode',
  validateSuspiciousNames: 'validate_suspicious_names',
  blockDisposableEmails: 'block_disposable_emails',
  limitRegistrationRate: 'limit_registration_rate',
} as const;

export type RegistrationMode = 'private_roster' | 'open_strict' | 'open_review' | 'open';

export interface AppSettings {
  allowQuestionSkip: boolean;
  registrationMode: RegistrationMode;
  validateSuspiciousNames: boolean;
  blockDisposableEmails: boolean;
  limitRegistrationRate: boolean;
  hasPrivateRoster: boolean;
}

function toBool(value: unknown, fallback = false): boolean {
  if (value === undefined || value === null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

export async function getAppSettings(): Promise<AppSettings> {
  const db = getDb();
  const rows = await db.all<{ key: string; value: string }>(
    'SELECT key, value FROM app_settings'
  );

  const values = new Map(rows.map((row) => [row.key, row.value]));
  const hasPrivateRoster = Boolean(process.env.ALLOWED_REGISTRATION_NAMES?.trim());
  const rawMode = String(
    values.get(SETTING_KEYS.registrationMode) ||
    (hasPrivateRoster ? 'private_roster' : 'open_strict')
  );
  const registrationMode: RegistrationMode =
    ['private_roster', 'open_strict', 'open_review', 'open'].includes(rawMode)
      ? rawMode as RegistrationMode
      : hasPrivateRoster ? 'private_roster' : 'open_strict';

  return {
    allowQuestionSkip: toBool(values.get(SETTING_KEYS.allowQuestionSkip), false),
    registrationMode,
    validateSuspiciousNames: toBool(values.get(SETTING_KEYS.validateSuspiciousNames), true),
    blockDisposableEmails: toBool(values.get(SETTING_KEYS.blockDisposableEmails), true),
    limitRegistrationRate: toBool(values.get(SETTING_KEYS.limitRegistrationRate), true),
    hasPrivateRoster,
  };
}

export async function updateAppSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const db = getDb();
  const now = new Date().toISOString();

  const writeSetting = async (key: string, value: string) => {
    await db.run(
      `INSERT INTO app_settings (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         updated_at = excluded.updated_at`,
      [key, value, now]
    );
  };

  if (settings.allowQuestionSkip !== undefined) {
    await writeSetting(SETTING_KEYS.allowQuestionSkip, settings.allowQuestionSkip ? 'true' : 'false');
  }

  if (settings.registrationMode !== undefined) {
    if (['private_roster', 'open_strict', 'open_review', 'open'].includes(settings.registrationMode)) {
      await writeSetting(SETTING_KEYS.registrationMode, settings.registrationMode);
    }
  }

  if (settings.validateSuspiciousNames !== undefined) {
    await writeSetting(SETTING_KEYS.validateSuspiciousNames, settings.validateSuspiciousNames ? 'true' : 'false');
  }

  if (settings.blockDisposableEmails !== undefined) {
    await writeSetting(SETTING_KEYS.blockDisposableEmails, settings.blockDisposableEmails ? 'true' : 'false');
  }

  if (settings.limitRegistrationRate !== undefined) {
    await writeSetting(SETTING_KEYS.limitRegistrationRate, settings.limitRegistrationRate ? 'true' : 'false');
  }

  return getAppSettings();
}
