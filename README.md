# QFS Wallet

Full-stack crypto wallet and OTC trading platform — React frontend, Express API, PostgreSQL database.

---

## Tech Stack

- **Frontend** — React 18 + TypeScript + Vite (port 5000 in dev)
- **API** — Express 5 server (port 4000 in dev / `PORT` env var in production)
- **Database** — PostgreSQL (all environments). Schema and seed data are applied automatically on first boot.
- **Auth** — JWT-based, two-step (password + 6-digit passcode)
- **File storage** — User uploads (KYC documents, logos, favicons) are stored as binary data in PostgreSQL — they survive every restart and redeploy.

---

## Local Development

```bash
npm install
npm run dev
```

Vite runs on port 5000, the API on port 4000. Vite proxies `/api` requests automatically.

**Required environment variable:**

```
DATABASE_URL=postgresql://user:password@localhost:5432/qfs_wallet
JWT_SECRET=replace-with-a-strong-random-secret-at-least-32-chars
```

Copy `.env.example` to `.env` and fill in your values.

---

## Deploying on Render (Free Tier)

### 1. Create a PostgreSQL database on Render
- Go to [render.com](https://render.com) → **New → PostgreSQL**
- Name: `zenvault-db`, Plan: **Free** → Create

### 2. Create a Web Service
- **New → Web Service** → connect your GitHub repo
- Render detects `render.yaml` automatically — `DATABASE_URL` is wired in for you

### 3. Set remaining environment variables
| Variable | Value |
|---|---|
| `JWT_SECRET` | Random 40+ character string |
| `NODE_ENV` | `production` |

### 4. Confirm build & start commands

> `render.yaml` sets these automatically, but verify in the Render dashboard under **Settings**:

| Setting | Value |
|---|---|
| **Build Command** | `npm install --include=dev && npm run build` |
| **Start Command** | `node ./server/index.mjs` |

> `--include=dev` is required because `NODE_ENV=production` would otherwise skip TypeScript, Vite, and type packages needed to compile the frontend.

### 5. Deploy
Click **Manual Deploy → Deploy latest commit**.

Render will: install all dependencies → build frontend → start server → connect to PostgreSQL → seed data → go live ✅

---

## Deploying on VPS with AAPanel

| Field | Value |
|---|---|
| Run opt | `start:prod` |
| Port | `4000` |
| Boot | ✅ tick so it auto-starts on server reboot |

**Environment variables (Node project → Config):**

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `JWT_SECRET` | Any random string, at least 32 characters |
| `CLIENT_ORIGIN` | Your domain e.g. `https://zenvault.one` |
| `NODE_ENV` | `production` |

Pull the repo, `npm install`, set those variables, boot — site is live.

---

## Keeping the Site Alive (Render Free Tier)

Render's free tier spins down after 15 minutes of inactivity. Use a free cron job to prevent this:

1. Go to [cron-job.org](https://cron-job.org) → create free account
2. New cronjob → URL: `https://your-service.onrender.com/ping` → Schedule: every **14 minutes**
3. Done — server stays awake

---

## Login Credentials (Seed Data)

| Role | Email | Password | Passcode |
|---|---|---|---|
| Admin | support@developerplug.com | 12345678 | 123456 |
| Power User | ofofonobs@gmail.com | 12345678 | 123456 |
| Review User | c0d3g0d.01@gmail.com | 12345678 | 123456 |
| Growth User | ava.martins@qfstrading.com | 12345678 | 123456 |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run Vite + Express API concurrently (dev) |
| `npm run build` | TypeScript compile + Vite build (produces `dist/`) |
| `npm start` | Start Express server — requires `dist/` to exist |
| `npm run start:prod` | Full build then start (safe for a manual VPS restart) |

> On **Render**, the build command handles `npm install --include=dev && npm run build`, and the start command is `node ./server/index.mjs`. Do not use `npm run start:prod` as the Render start command — it would rebuild on every cold start and time out.
