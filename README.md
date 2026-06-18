# Test RNV24 Certificación - Full Stack Javascript

Simulador profesional de examen de certificación para el equipo. Reproduce un ambiente estricto (supervisión simulada, temporizadores, progreso persistente) con 65 preguntas en 7 secciones.

## Estructura del proyecto

```
RNV24/
├── frontend/          # React + Vite + Tailwind
├── backend/           # Express + SQLite (dev) / PostgreSQL via Neon (prod)
├── shared/            # Preguntas, secciones y validadores heurísticos
├── package.json       # Monorepo npm workspaces
├── .env.example
└── README.md
```

## Requisitos

- Node.js 18+
- npm 9+

## Instalación y desarrollo local

```bash
cd C:\Users\gabri\Projects\RNV24
cp .env.example .env   # En Windows: copy .env.example .env
npm install
npm run dev
```

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

El frontend en desarrollo hace proxy de `/api` al backend.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Backend + frontend en paralelo |
| `npm run build` | Compila shared, frontend y backend |
| `npm start` | Sirve backend (y frontend estático si está compilado) |

## Variables de entorno

Copia `.env.example` a `.env` en la raíz del proyecto:

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `PORT` | No | Puerto del API (default: 3001) |
| `NODE_ENV` | No | `development` o `production` |
| `JWT_SECRET` | Sí (prod) | Secreto para tokens de sesión |
| `DATABASE_PATH` | No | SQLite local (solo si no hay `DATABASE_URL`) |
| `DATABASE_URL` | Sí (prod) | Connection string Neon PostgreSQL |
| `OPENAI_API_KEY` | No | Habilita validación IA de código |
| `OPENAI_MODEL` | No | Modelo OpenAI (default: `gpt-4o-mini`) |
| `VITE_API_URL` | No | URL del API en producción (vacío = mismo origen) |

Ver `.env.example` y [DEPLOYMENT.md](./DEPLOYMENT.md) para despliegue completo.

### Validación de código con IA

Sin `OPENAI_API_KEY`, el endpoint `/api/sessions/validate-code` usa validadores heurísticos (regex/estructura) del paquete `shared`.

Con `OPENAI_API_KEY`, se envía el enunciado + código del estudiante a OpenAI y se aceptan soluciones alternativas válidas.

## Funcionalidades implementadas

- 7 secciones con orden exacto de preguntas del certamen original
- Teoría (test) + desarrollo (HTML, JS, SQL)
- Temporizadores: sesión (15 h), sección y ejercicio de desarrollo
- Pausas entre secciones con progreso persistente
- Autenticación email/contraseña
- Persistencia en SQLite: usuarios, sesiones, respuestas, intentos de validación
- Supervisión simulada: cámara/mic/pantalla (indicadores), detección blur, pantalla completa
- Bloqueo copiar/pegar en áreas de código
- Máximo 10 intentos de verificación por ejercicio de desarrollo
- UI en español, diseño sobrio sin emojis

## Despliegue (GitHub + Render + Neon)

Guía detallada: **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### Resumen

1. **GitHub:** https://github.com/RockHero2891/RNV24
2. **Neon:** crear proyecto PostgreSQL, copiar `DATABASE_URL` (pooled, `sslmode=require`)
3. **Render:** conectar repo, usar `Dockerfile`, configurar variables de entorno
4. **OpenAI:** opcional, `OPENAI_API_KEY` + `OPENAI_MODEL=gpt-4o-mini`

El backend usa **SQLite** en local (sin `DATABASE_URL`) y **PostgreSQL** en producción (con `DATABASE_URL`). El esquema se aplica automáticamente al arrancar.

**Servicio único recomendado:** API + frontend estático en un solo contenedor (`Dockerfile` incluido).

## Preguntas de desarrollo con validación IA

| ID | Tipo | Tema |
|----|------|------|
| 2 | HTML | 3 divs 100×100 horizontal, gap 10px |
| 5 | JS | `analizarTemperaturas` |
| 21 | JS | `procesarPedidos` |
| 29-31 | SQL | Ventas por categoría, CTE >500, INSERT productos |

## Licencia

Uso interno del equipo RNV24.
