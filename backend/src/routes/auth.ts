import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/index.js';
import { signToken, authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = Router();

function getClientIp(req: import('express').Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return String(forwarded).split(',')[0].trim();
  return req.socket.remoteAddress ?? 'unknown';
}

// ── Registro ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body as {
    email?: string; password?: string; name?: string;
  };

  if (!email?.trim() || !password || !name?.trim()) {
    res.status(400).json({ error: 'Email, nombre y contraseña son obligatorios' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    return;
  }

  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.get<{ id: number }>('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
  if (existing) { res.status(409).json({ error: 'El email ya está registrado' }); return; }

  const passwordHash = bcrypt.hashSync(password, 10);
  const ip = getClientIp(req);
  const result = await db.run(
    'INSERT INTO users (email, name, password_hash, last_ip) VALUES (?, ?, ?, ?)',
    [normalizedEmail, name.trim(), passwordHash, ip]
  );

  const token = signToken({ userId: result.lastInsertRowid, email: normalizedEmail, isAdmin: false });
  res.status(201).json({ token, user: { id: result.lastInsertRowid, email: normalizedEmail, name: name.trim(), isAdmin: false } });
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email?.trim() || !password) {
    res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    return;
  }

  // Comprobar credenciales de admin desde variables de entorno
  const adminEmail = process.env.ADMIN_EMAIL || 'admin';
  const adminPass  = process.env.ADMIN_PASSWORD || '1029qpAN';
  if (email.trim() === adminEmail && password === adminPass) {
    const token = signToken({ userId: 0, email: adminEmail, isAdmin: true });
    res.json({ token, user: { id: 0, email: adminEmail, name: 'Admin', isAdmin: true } });
    return;
  }

  const db = getDb();
  const user = await db.get<{ id: number; email: string; name: string; password_hash: string }>(
    'SELECT id, email, name, password_hash FROM users WHERE email = ?',
    [email.trim().toLowerCase()]
  );
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    res.status(401).json({ error: 'Credenciales incorrectas' });
    return;
  }

  // Actualizar última IP
  const ip = getClientIp(req);
  await db.run('UPDATE users SET last_ip = ?, last_login = ? WHERE id = ?', [ip, new Date().toISOString(), user.id]);

  const token = signToken({ userId: user.id, email: user.email, isAdmin: false });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, isAdmin: false } });
});

// ── Me ────────────────────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  if (req.user!.isAdmin) {
    res.json({ user: { id: 0, email: req.user!.email, name: 'Admin', isAdmin: true } });
    return;
  }
  const db = getDb();
  const user = await db.get<{ id: number; email: string; name: string; created_at: string }>(
    'SELECT id, email, name, created_at FROM users WHERE id = ?',
    [req.user!.userId]
  );
  if (!user) { res.status(404).json({ error: 'Usuario no encontrado' }); return; }
  res.json({ user: { ...user, isAdmin: false } });
});

// ── Borrar mi cuenta ──────────────────────────────────────────────────────────
router.delete('/me', authMiddleware, async (req, res) => {
  if (req.user!.isAdmin) { res.status(400).json({ error: 'No se puede borrar la cuenta admin así' }); return; }
  const db = getDb();
  await db.run('DELETE FROM users WHERE id = ?', [req.user!.userId]);
  res.json({ ok: true });
});

// ── Admin: listar usuarios ────────────────────────────────────────────────────
router.get('/admin/users', adminMiddleware, async (_req, res) => {
  const db = getDb();
  const users = await db.all<{
    id: number; name: string; email: string; created_at: string; last_ip: string | null; last_login: string | null;
    session_count: number; completed_count: number;
  }>(`
    SELECT u.id, u.name, u.email, u.created_at, u.last_ip, u.last_login,
           COUNT(DISTINCT es.id) AS session_count,
           COUNT(DISTINCT CASE WHEN es.status = 'completed' THEN es.id END) AS completed_count
    FROM users u
    LEFT JOIN exam_sessions es ON es.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `);
  res.json({ users });
});

// ── Admin: borrar usuario ─────────────────────────────────────────────────────
router.delete('/admin/users/:id', adminMiddleware, async (req, res) => {
  const db = getDb();
  await db.run('DELETE FROM users WHERE id = ?', [Number(req.params.id)]);
  res.json({ ok: true });
});

export default router;
