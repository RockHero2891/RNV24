import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/index.js';
import { signToken, authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body as {
    email?: string;
    password?: string;
    name?: string;
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
  if (existing) {
    res.status(409).json({ error: 'El email ya está registrado' });
    return;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = await db.run('INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)', [
    normalizedEmail,
    name.trim(),
    passwordHash,
  ]);

  const token = signToken({ userId: result.lastInsertRowid, email: normalizedEmail });
  res.status(201).json({
    token,
    user: { id: result.lastInsertRowid, email: normalizedEmail, name: name.trim() },
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email?.trim() || !password) {
    res.status(400).json({ error: 'Email y contraseña son obligatorios' });
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

  const token = signToken({ userId: user.id, email: user.email });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

router.get('/me', authMiddleware, async (req, res) => {
  const db = getDb();
  const user = await db.get<{ id: number; email: string; name: string; created_at: string }>(
    'SELECT id, email, name, created_at FROM users WHERE id = ?',
    [req.user!.userId]
  );

  if (!user) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }

  res.json({ user });
});

export default router;
