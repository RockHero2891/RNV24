# RNV24 Deployment Guide

Deploy the certification platform as a **single Render service** (Node.js API + static frontend) backed by **Neon PostgreSQL**.

## Architecture

```
Browser → Render (Node.js :PORT) → Neon PostgreSQL
                    ↓
              OpenAI API (code validation)
```

The backend serves `frontend/dist` in production, so you do **not** need a separate frontend service unless you want a CDN.

---

## 1. Neon PostgreSQL

### Create project (console)

1. Sign in at [console.neon.tech](https://console.neon.tech)
2. **New Project** → name: `rnv24` (or similar), region closest to your Render region
3. Open the project → **Dashboard** → copy the **connection string** (pooled recommended for serverless/containers)

Format:

```
postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
```

### Apply database schema

**Option A — on first deploy (automatic):**  
When `DATABASE_URL` is set, the backend runs `POSTGRES_SCHEMA` on startup.

**Option B — Neon SQL Editor (manual):**

1. Neon project → **SQL Editor**
2. Paste the contents of `backend/src/db/postgres.ts` (`POSTGRES_SCHEMA`) or run locally:

```bash
# After setting DATABASE_URL in .env
npm run db:init -w backend
```

### Neon MCP (Cursor)

The Neon MCP server requires authentication. In Cursor, authenticate the **Neon Postgres** plugin, then you can create projects/branches from the agent. If MCP is unavailable, use the console steps above.

---

## 2. Environment variables

### Local development (`.env`)

| Variable | Value | Notes |
|----------|-------|-------|
| `PORT` | `3001` | API port |
| `NODE_ENV` | `development` | |
| `JWT_SECRET` | random 64+ char string | See generation below |
| `DATABASE_PATH` | `./data/rnv24.db` | SQLite only; omit `DATABASE_URL` locally |
| `OPENAI_API_KEY` | `sk-...` | Your OpenAI key |
| `OPENAI_MODEL` | `gpt-4o-mini` | Cheap, sufficient for code checks |
| `VITE_API_URL` | `http://localhost:5173` proxy or `http://localhost:3001` | Dev: leave empty to use Vite proxy |

**Do not commit `.env`.**

Generate a JWT secret (PowerShell):

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Production (Render dashboard)

| Variable | Required | Example / notes |
|----------|----------|-----------------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | Auto | Render sets this; app reads `process.env.PORT` |
| `JWT_SECRET` | Yes | Strong random string (same as local, but unique for prod) |
| `DATABASE_URL` | Yes | Neon pooled connection string with `?sslmode=require` |
| `OPENAI_API_KEY` | Recommended | Enables AI code validation |
| `OPENAI_MODEL` | No | `gpt-4o-mini` (default) |

**Do not set** `DATABASE_PATH` in production when using Neon.

**Do not set** `VITE_API_URL` for the Docker build unless API and frontend are on different domains. The default single-service setup serves both from the same origin.

---

## 3. Render deployment

### Create project

1. [Render](https://render.com) → **New project** → name `rnv24`
2. **Create new service** → **Combined** or **Deployment**
3. **Source:** GitHub → `RockHero2891/RNV24` → branch `main`

### Build settings (Dockerfile — recommended)

| Setting | Value |
|---------|-------|
| Build type | Dockerfile |
| Dockerfile path | `Dockerfile` |
| Build context | `/` (repo root) |
| Port | `3001` (or match `PORT` env) |
| Health check | `GET /api/health` |

Render injects `PORT`; the app binds to `0.0.0.0`.

### Build settings (without Docker — buildpack)

| Setting | Value |
|---------|-------|
| Build command | `npm ci && npm run build` |
| Start command | `npm start` |
| Port | `3001` |

### Runtime

- **Replicas:** 1+ (Neon pooled URL handles multiple connections)
- **Resources:** 0.5–1 CPU, 512MB–1GB RAM is enough for a team exam simulator

### After deploy

1. Open the Render public URL
2. Register a test user
3. `GET https://<your-url>/api/health` should return `"database": "postgresql"` when `DATABASE_URL` is set

---

## 4. OpenAI code validation

Endpoint: `POST /api/sessions/validate-code` (authenticated)

- **Without** `OPENAI_API_KEY`: heuristic validators in `@rnv24/shared` (regex/structure)
- **With** `OPENAI_API_KEY`: OpenAI evaluates student code; falls back to heuristics on API errors

**Recommended model:** `gpt-4o-mini`

**Estimated cost:** ~$0.0002–0.001 per validation (short prompts). With 10 attempts × ~7 dev questions × few users, expect **well under $1** for a typical team session.

---

## 5. Verify locally

```bash
# SQLite (default)
npm install
npm run build
npm start
# → http://localhost:3001

# PostgreSQL (optional local test against Neon)
# Set DATABASE_URL in .env, then:
npm run db:init -w backend
npm run build
npm start
```

---

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| `Frontend no construido` | Run `npm run build` before `npm start` |
| DB connection fails | Use Neon **pooled** URL; ensure `sslmode=require` |
| AI validation not used | Check `OPENAI_API_KEY` and `/api/health` → `aiValidation: true` |
| CORS errors with split deploy | Set `VITE_API_URL` at **build time** to the API URL |

---

## Files reference

| File | Purpose |
|------|---------|
| `Dockerfile` | Production image (API + frontend) |
| `.env.example` | Documented env template |
| `backend/src/db/postgres.ts` | PostgreSQL schema + adapter |
| `backend/scripts/init-postgres.ts` | Manual schema init against Neon |
