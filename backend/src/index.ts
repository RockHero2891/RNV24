import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { QUESTIONS, SECTIONS } from '@rnv24/shared';
import { initDatabase } from './db/index.js';
import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessions.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: process.env.DATABASE_URL ? 'postgresql' : 'sqlite',
    aiValidation: Boolean(process.env.OPENAI_API_KEY),
  });
});

app.get('/api/exam/metadata', (_req, res) => {
  res.json({
    title: 'Test RNV24 Certificación - Full Stack Javascript',
    sections: SECTIONS,
    totalQuestions: QUESTIONS.length,
    questions: QUESTIONS.map((q) => ({
      id: q.id,
      sectionId: q.sectionId,
      type: q.type,
      question: q.question,
      options: q.options,
      preview: q.preview,
      devTimeMinutes: q.devTimeMinutes,
      hints: q.hints,
    })),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);

const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'), (err) => {
    if (err) res.status(404).json({ error: 'Frontend no construido. Ejecuta npm run build.' });
  });
});

async function main() {
  await initDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RNV24 API escuchando en http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
