# QFS Wallet Full Stack

A full-stack crypto wallet and OTC trading platform built with React + Vite (frontend) and Express (backend), using SQLite for the database.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite, running on port 5000
- **Backend**: Express 5 API, running on port 4000
- **Database**: SQLite via `better-sqlite3` (file: `server/data/qfs_wallet.db`)
- **Auth**: JWT-based with bcryptjs hashing, two-step (password + passcode)

## Key Routes

- `/` — Public marketing / landing pages
- `/login`, `/signup`, `/passcode` — Auth flows
- `/app` — User wallet and trading portal
- `/admin` — Operations dashboard

## Database

SQLite file at `server/data/qfs_wallet.db` — committed to the repo so it travels with the code. No setup steps needed on a fresh clone.

If you ever need to wipe and reseed from scratch: `npm run db:setup` (destructive).
If you need to sync data from a MySQL dump: `npm run db:import path/to/dump.sql`

## Scripts

- `npm run dev` — Runs Vite (port 5000) and Express API (port 4000) concurrently
- `npm run build` — TypeScript compile + Vite build
- `npm run start:prod` — **Production**: builds frontend then starts server on port 4000
- `npm run db:setup` — Wipes and recreates tables with seed data (destructive!)
- `npm run db:import <dump.sql>` — Sync data from a MySQL dump into SQLite (safe upsert)

## Deploying on Render (Recommended — Free Tier)

Render runs a real server (not serverless), so SQLite works fully with data persisting for the lifetime of the running instance.

### Steps:
1. Push the repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo — Render will auto-detect `render.yaml`
4. Set **one** environment variable manually in the Render dashboard:
   - `JWT_SECRET` — any random string of 40+ characters (e.g. generate with `openssl rand -hex 32`)
   - *(Optional)* `CLIENT_ORIGIN` — your custom domain if you have one (e.g. `https://zenvault.one`)
5. Click **Deploy** — Render builds and starts automatically

Render auto-detects `PORT`, `NODE_ENV=production`, and `RENDER_EXTERNAL_URL` (used for CORS). No further config needed.

> **Note on free tier**: Render's free tier spins the service down after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up. SQLite data persists while the service is running but resets to the bundled database on redeploy or restart.

## Deploying on Vercel (Frontend + API)

Vercel is serverless — the API works but SQLite data does **not persist** between function invocations. Suitable only if you only need read access to the bundled DB.

### Steps:
1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Set environment variables in Vercel dashboard:
   - `JWT_SECRET` — same as above
   - `NODE_ENV=production`
4. Deploy — `vercel.json` handles all routing automatically

## VPS Deployment (AAPanel / NodePanel)

1. Clone/pull the repo — database is already included
2. Set environment variables: `JWT_SECRET` (min 32 chars), `CLIENT_ORIGIN` (e.g. `https://zenvault.one`), `NODE_ENV=production`
3. Run `npm install`
4. **Run opt**: `start:prod` | **Port**: `4000`
5. Save and boot

## Environment Variables

- `JWT_SECRET` — Required, min 32 chars
- `CLIENT_ORIGIN` — CORS origin for production (e.g. `https://zenvault.one`). Auto-detected on Render/Vercel.
- `NODE_ENV` — Set to `production` on VPS
- `PORT` — Used by Render automatically
- `API_PORT` — Express port override (default 4000)
- `ACCESS_TOKEN_TTL` — JWT expiry (default 12h)
- `PENDING_TOKEN_TTL` — Pending token expiry (default 10m)

## Managed Platform Detection

The server auto-detects its environment and adjusts accordingly:
- `VERCEL=1` → serverless mode, SQLite copied to `/tmp`, `.vercel.app` origins allowed
- `RENDER=1` → `PORT` env used, `.onrender.com` origins allowed, `CLIENT_ORIGIN` optional
- `REPLIT_DEV_DOMAIN` → dev mode allows `.replit.dev` origins

## Admin Features

- **User Detail Edit**: Admin can edit user profile fields (name, email, country, tier, status, KYC status, risk level, plan, desk label, note) via PUT /api/admin/users/:userId
- **Dashboard Alerts**: Admin can add and dismiss alerts from the dashboard (POST/DELETE /api/admin/alerts)
- **Crypto Records Live Prices**: Admin crypto records page polls /api/prices every 30s and shows live price + 24h change per asset
- **Wallet Address**: Admin can set per-user deposit addresses via the crypto records page; address saved to user's holdings_json
- **Broadcast / Email**: Admin header has a Megaphone quick-access button linking to the Broadcasts page (POST /api/admin/broadcasts)
- **Send Transaction Alert**: Admin crypto records page has a "Send Transaction Alert" form — sends in-app notification + branded email to the user and optionally creates a transaction record (POST /api/admin/users/:userId/notify)
- **Cards Quick-Access**: Admin user list table now has a CreditCard icon action linking directly to the user's card management page
- **Wallet Funding**: Admin can top-up or debit any user coin holding directly from the crypto records page (PUT /api/admin/users/:userId/assets/:assetId)

## Live Price Feed

Crypto prices fetched from CoinGecko every 60 seconds for 19 supported assets. Field name is `change` (not `changePercent24h`) for 24h percent change.

## Important Notes for Server Edits

- `server/index.mjs` has Windows CRLF line endings — edits via the `edit` tool can fail. Use `write` (full rewrite) or `node -e` bash scripts for reliable modifications.
- Price feed asset field: `asset.change` (not `asset.changePercent24h`)

## Login Credentials

- User: `ofofonobs@gmail.com` / `12345678` / passcode `123456`
- Admin: `support@developerplug.com` / `12345678` / passcode `123456`
