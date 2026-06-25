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

function getDomain(email: string): string {
  return email.split('@')[1]?.toLowerCase() ?? '';
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

  if (name.length < 5 || name.length > 80) {
    return 'Ingresa tu nombre completo real.';
  }

  if (nameWords.length < 2) {
    return 'Ingresa nombre y apellido para crear la cuenta.';
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
