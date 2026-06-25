import type { Request } from 'express';

const REGISTER_WINDOW_MS = 15 * 60 * 1000;
const MAX_REGISTRATIONS_PER_WINDOW = 3;

const RESERVED_NAME_WORDS = new Set([
  'admin',
  'administrador',
  'administrator',
  'root',
  'soporte',
  'support',
  'test',
  'testing',
  'prueba',
  'demo',
  'usuario',
  'user',
  'alumno',
  'estudiante',
  'invitado',
  'guest',
  'null',
  'undefined',
]);

const BLOCKED_EMAIL_LOCALS = new Set([
  'admin',
  'administrador',
  'administrator',
  'root',
  'test',
  'testing',
  'prueba',
  'demo',
  'usuario',
  'user',
  'fake',
  'falso',
  'correo',
  'email',
  'mail',
  'null',
  'undefined',
  'asdf',
  'qwerty',
]);

const DISPOSABLE_DOMAINS = new Set([
  '10minutemail.com',
  '20minutemail.com',
  'anonaddy.com',
  'dispostable.com',
  'fakeinbox.com',
  'guerrillamail.com',
  'maildrop.cc',
  'mailinator.com',
  'moakt.com',
  'sharklasers.com',
  'temp-mail.org',
  'tempmail.com',
  'throwawaymail.com',
  'trashmail.com',
  'yopmail.com',
]);

const RESERVED_EMAIL_DOMAINS = new Set([
  'example.com',
  'example.net',
  'example.org',
  'invalid.com',
  'localhost.com',
  'test.cl',
  'test.com',
]);

const TRUSTED_PERSONAL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'hotmail.com',
  'hotmail.cl',
  'hotmail.es',
  'icloud.com',
  'live.cl',
  'live.com',
  'live.es',
  'mac.com',
  'me.com',
  'msn.com',
  'outlook.cl',
  'outlook.com',
  'outlook.es',
  'pm.me',
  'proton.me',
  'protonmail.com',
  'rocketmail.com',
  'yahoo.cl',
  'yahoo.com',
  'yahoo.es',
  'ymail.com',
]);

const COMMON_PASSWORDS = new Set([
  '102030',
  '111111',
  '112233',
  '123123',
  '123456',
  '1234567',
  '12345678',
  '123456789',
  'abcdef',
  'admin123',
  'password',
  'qwerty',
  'qwerty123',
]);

const registrationAttempts = new Map<string, number[]>();
let allowedNamesCacheKey = '';
let allowedNamesCache = new Set<string>();

function normalizeText(value: string): string {
  return value
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function compact(value: string): string {
  return normalizeText(value).replace(/[^a-z0-9]/g, '');
}

function normalizeName(value: string): string {
  return normalizeText(value).replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

function getDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() ?? '';
}

function getAllowedNames(): Set<string> {
  const raw = process.env.ALLOWED_REGISTRATION_NAMES?.trim() ?? '';
  if (raw === allowedNamesCacheKey) return allowedNamesCache;

  allowedNamesCacheKey = raw;
  allowedNamesCache = new Set(
    raw
      .split(/\r?\n|;|\|/)
      .map(normalizeName)
      .filter(Boolean)
  );
  return allowedNamesCache;
}

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, () => Array<number>(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i += 1) dp[i][0] = i;
  for (let j = 0; j <= b.length; j += 1) dp[0][j] = j;

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[a.length][b.length];
}

function tokenMatches(inputToken: string, allowedToken: string): boolean {
  if (inputToken === allowedToken) return true;
  if (inputToken.length < 4 || allowedToken.length < 4) return false;
  const distance = editDistance(inputToken, allowedToken);
  return distance <= (Math.max(inputToken.length, allowedToken.length) >= 6 ? 2 : 1);
}

function matchesAllowedRosterName(name: string, allowedNames: Set<string>): boolean {
  const inputTokens = normalizeName(name).split(' ').filter((token) => token.length >= 3);
  if (inputTokens.length === 0) return false;

  const exactMatchCounts = [...allowedNames].map((allowedName) => {
    const allowedTokens = new Set(allowedName.split(' ').filter((token) => token.length >= 3));
    return inputTokens.filter((inputToken) => allowedTokens.has(inputToken)).length;
  });
  const exactFullMatches = exactMatchCounts.filter((count) => count === inputTokens.length);
  if (exactFullMatches.length === 1) return true;

  const matchCounts = [...allowedNames].map((allowedName) => {
    const allowedTokens = allowedName.split(' ').filter((token) => token.length >= 3);
    return inputTokens.filter((inputToken) =>
      allowedTokens.some((allowedToken) => tokenMatches(inputToken, allowedToken))
    ).length;
  });

  const fullMatches = matchCounts.filter((count) => count === inputTokens.length);
  if (inputTokens.length === 1) return fullMatches.length === 1;
  return fullMatches.some((count) => count >= 2);
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.socket.remoteAddress ?? 'unknown';
}

export function canRegisterFromIp(ip: string, now = Date.now()): { allowed: boolean; retryAfterSeconds?: number } {
  const recentAttempts = (registrationAttempts.get(ip) ?? []).filter((ts) => now - ts < REGISTER_WINDOW_MS);
  registrationAttempts.set(ip, recentAttempts);

  if (recentAttempts.length >= MAX_REGISTRATIONS_PER_WINDOW) {
    const oldest = Math.min(...recentAttempts);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((REGISTER_WINDOW_MS - (now - oldest)) / 1000),
    };
  }

  return { allowed: true };
}

export function recordRegistrationAttempt(ip: string, now = Date.now()): void {
  const recentAttempts = (registrationAttempts.get(ip) ?? []).filter((ts) => now - ts < REGISTER_WINDOW_MS);
  recentAttempts.push(now);
  registrationAttempts.set(ip, recentAttempts);
}

export function validateRegistrationInput(input: {
  email: string;
  name: string;
  password: string;
}): string | null {
  const name = input.name.trim().replace(/\s+/g, ' ');
  const normalizedName = normalizeText(name);
  const nameWords = normalizedName.split(/\s+/).filter(Boolean);

  if (name.length < 4 || name.length > 80) {
    return 'Ingresa un nombre real.';
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ' -]+$/.test(name)) {
    return 'El nombre solo debe contener letras y espacios.';
  }

  if (nameWords.some((word) => RESERVED_NAME_WORDS.has(word))) {
    return 'Ese nombre no está permitido para registrarse.';
  }

  if (/^(.)\1{4,}$/.test(compact(name)) || /(test|prueba|demo|fake|falso)/.test(compact(name))) {
    return 'Ingresa datos reales para crear la cuenta.';
  }

  const allowedNames = getAllowedNames();
  if (allowedNames.size > 0 && !matchesAllowedRosterName(name, allowedNames)) {
    return 'El nombre ingresado no está habilitado para este curso.';
  }

  const email = input.email.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return 'Ingresa un email válido.';
  }

  const [local] = email.split('@');
  const localCompact = compact(local);
  const domain = getDomain(email);

  if (local.length < 3 || /^(.)\1{4,}$/.test(localCompact)) {
    return 'Ingresa un email personal válido.';
  }

  if (DISPOSABLE_DOMAINS.has(domain) || RESERVED_EMAIL_DOMAINS.has(domain)) {
    return 'No se permiten correos temporales o de prueba para registrarse.';
  }

  if (BLOCKED_EMAIL_LOCALS.has(localCompact) && !TRUSTED_PERSONAL_DOMAINS.has(domain)) {
    return 'Ingresa un email personal válido.';
  }

  if (input.password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }

  const passwordCompact = compact(input.password);
  if (
    COMMON_PASSWORDS.has(passwordCompact) ||
    passwordCompact === localCompact ||
    compact(name).includes(passwordCompact)
  ) {
    return 'Usa una contraseña menos obvia.';
  }

  return null;
}
