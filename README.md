# Zenvault Wallet

Full-stack crypto wallet and OTC trading platform — React frontend, Express API, PostgreSQL database.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| API | Express 5 |
| Database | PostgreSQL (auto-schema + auto-seed on first boot) |
| Auth | JWT-based, two-step: password + 6-digit passcode |
| File Storage | User uploads stored as binary in PostgreSQL — survive every restart/redeploy |

---

## Local Development

```bash
npm install
npm run dev
```

Vite runs on port 5000, API on port 4000. Vite proxies all `/api` requests automatically.

Create a `.env` file in the project root:

```
DATABASE_URL=postgresql://user:password@localhost:5432/zenvault
JWT_SECRET=replace-with-a-strong-random-secret-at-least-32-chars
```

---

## Deploying on Render (Free Tier)

> **Important**: `render.yaml` sets the build/start commands only. It does **not** create a database or set `DATABASE_URL` automatically — you must do all of the steps below yourself.

### Step 1 — Create a PostgreSQL database on Render

1. Go to [render.com](https://render.com) → **New → PostgreSQL**
2. Give it any name (e.g. `zenvault-db`), select **Free** plan → **Create Database**
3. Once created, open the database and copy the **External Database URL** (or Internal URL if your web service is on the same Render account)

### Step 2 — Create a Web Service

1. Go to **New → Web Service** → connect your GitHub repo
2. Render will detect `render.yaml` and pre-fill the build and start commands — leave them as-is

### Step 3 — Set all environment variables manually

In your web service on Render, go to **Environment** → **Add Environment Variable** and add each of these:

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | Paste the connection string from Step 1 | **Required** — deployment will fail without this |
| `JWT_SECRET` | Any random 40+ character string | Generate one at [randomkeygen.com](https://randomkeygen.com) |
| `NODE_ENV` | `production` | Required |
| `ALLOWED_ORIGINS` | Your custom domain(s) — see note below | Only needed if using a custom domain |

> **About `ALLOWED_ORIGINS`**: Your Render subdomain (e.g. `https://zenvault.onrender.com`) is automatically allowed — you do not need to add it here. Only add this variable when you connect a custom domain (e.g. `https://zenvault.one`). If you have both `www` and non-`www`, include both separated by a comma:
> ```
> https://zenvault.one,https://www.zenvault.one
> ```

### Step 4 — Confirm build and start commands

In your service **Settings**, verify these are set:

| Setting | Value |
|---|---|
| Build Command | `npm install --include=dev && npm run build` |
| Start Command | `node ./server/index.mjs` |

> `--include=dev` is required even in production because TypeScript and Vite are dev dependencies needed to compile the frontend.

### Step 5 — Deploy

Click **Manual Deploy → Deploy latest commit**.

Render will: install dependencies → build frontend → start server → connect to PostgreSQL → create schema → seed admin account → go live ✅

---

## Custom Domain Setup

After your site is live on the Render subdomain and you want to point a custom domain (e.g. `zenvault.one`):

**1. Add the domain in Render**
Go to your web service → **Settings → Custom Domains** → add your domain and follow the DNS instructions.

**2. Add `ALLOWED_ORIGINS` environment variable**
Go to **Environment** → **Add Environment Variable**:

| Key | Value |
|---|---|
| `ALLOWED_ORIGINS` | `https://zenvault.one,https://www.zenvault.one` |

**3. Update Site URL in the Admin panel**
Once the site loads, go to **Admin → Settings → General** → set **Site URL** to `https://zenvault.one`.
This makes email links (welcome emails, login notifications, etc.) point to your custom domain.

**4. Redeploy**
Trigger **Manual Deploy → Deploy latest commit** so the new env var is picked up.

---

## Keeping the Site Alive (Render Free Tier)

Render free tier spins down after 15 minutes of inactivity. Set up a free cron job to prevent this:

1. Go to [cron-job.org](https://cron-job.org) → create a free account
2. New cronjob → URL: `https://your-service.onrender.com/ping` → Schedule: every **14 minutes**
3. Done — server stays awake

---

## Deploying on VPS with AAPanel

| Field | Value |
|---|---|
| Run opt | `start:prod` |
| Port | `4000` |
| Boot | Tick "auto-start on server reboot" |

**Environment variables to set in the Node project config:**

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `JWT_SECRET` | Any random string, at least 32 characters |
| `ALLOWED_ORIGINS` | Your domain e.g. `https://zenvault.one,https://www.zenvault.one` |
| `NODE_ENV` | `production` |

Pull the repo, `npm install`, set the variables, start — site is live.

---

## Login Credentials (Seeded on First Boot)

Only the admin account is created automatically. No demo or test users are seeded.

| Role | Email | Password | Passcode |
|---|---|---|---|
| Admin | wilburpace01@gmail.com | 12345678 | 123456 |

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Run Vite + Express concurrently (development) |
| `npm run build` | TypeScript compile + Vite build → outputs `dist/` |
| `npm start` | Start Express server (requires `dist/` to already exist) |
| `npm run start:prod` | Full build then start — use for manual VPS restarts only |

> Do **not** use `npm run start:prod` as the Render start command — it rebuilds on every cold start and will time out.

---

## Project Structure

```
server/
  index.mjs         — Express app + all API routes
  db.mjs            — PostgreSQL pool + query helpers
  schema.mjs        — Table creation + seeding on startup
  auth.mjs          — JWT + bcrypt helpers
  config.mjs        — Environment config
  mailer.mjs        — Email builder + SMTP client
  price-feed.mjs    — CoinGecko live price polling
  assets.mjs        — Wallet asset and holdings helpers
  wallets.mjs       — Wallet configuration
  settings.mjs      — General settings helpers
  session-utils.mjs — Session management
  data/seed.mjs     — Seed data (admin user + default settings)
src/                — React frontend (TypeScript + Vite)
scripts/
  prestart.cjs      — Auto-build check before server starts
```

---

## Admin Features

- **User Management** — view, edit, fund wallets, manage KYC
- **Transaction Approval** — approve or decline pending withdrawals
- **Email Notifications** — admin is emailed when users submit withdrawals
- **Broadcast Email** — send to all users or specific users
- **Settings** — branding, SMTP config, wallet assets
- **Live Prices** — CoinGecko feed updated every 60 seconds
