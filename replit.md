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
- `npm start` — Starts the Express server (serves API + built frontend)
- `npm run db:setup` — Wipes and recreates tables with seed data (destructive!)
- `npm run db:import <dump.sql>` — Sync data from a MySQL dump into SQLite (safe upsert)

## Deploying on Render (Free Tier)

Render runs a real persistent server — SQLite works fully, all data persists while the service is live.

### Steps:
1. Push repo to GitHub
2. Go to [render.com](https://render.com) → **New → Web Service**
3. Connect your GitHub repo — Render auto-detects `render.yaml`
4. In the Render dashboard, set this one environment variable:
   - `JWT_SECRET` — any random string of 40+ characters
5. Click **Deploy**

Everything else (`PORT`, `NODE_ENV=production`, CORS for `.onrender.com`) is handled automatically.

> **Free tier note**: Service sleeps after 15 min of inactivity (30s wake-up on first request). SQLite data persists while running but resets to the bundled DB on redeploy.

## VPS Deployment (AAPanel / NodePanel)

1. Clone/pull the repo — database is already included
2. Set environment variables: `JWT_SECRET` (min 32 chars), `CLIENT_ORIGIN` (e.g. `https://zenvault.one`), `NODE_ENV=production`
3. Run `npm install && npm run build`
4. **Start command**: `npm start` | **Port**: `4000`

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | Always | Min 32 chars, random string |
| `NODE_ENV` | Production | Set to `production` |
| `CLIENT_ORIGIN` | VPS only | Your domain, e.g. `https://zenvault.one`. Auto-detected on Render. |
| `PORT` | Render only | Set automatically by Render |
| `API_PORT` | Optional | Express port override (default 4000) |
| `ACCESS_TOKEN_TTL` | Optional | JWT expiry (default `12h`) |
| `PENDING_TOKEN_TTL` | Optional | Pending token expiry (default `10m`) |

## Platform Detection

- `RENDER=1` (set by Render automatically) → uses `PORT`, allows `.onrender.com` CORS, `CLIENT_ORIGIN` optional
- `REPLIT_DEV_DOMAIN` → dev mode, allows `.replit.dev` CORS

## Admin Features

- **User Detail Edit**: PUT /api/admin/users/:userId
- **Dashboard Alerts**: POST/DELETE /api/admin/alerts
- **Crypto Records Live Prices**: polls /api/prices every 30s
- **Wallet Address**: per-user deposit addresses via crypto records page
- **Broadcast / Email**: POST /api/admin/broadcasts
- **Send Transaction Alert**: POST /api/admin/users/:userId/notify
- **Cards Quick-Access**: CreditCard icon on user list table
- **Wallet Funding**: PUT /api/admin/users/:userId/assets/:assetId

## Live Price Feed

Crypto prices fetched from CoinGecko every 60 seconds for 19 supported assets. Field: `asset.change` (24h percent change).

## Important Notes for Server Edits

- `server/index.mjs` has mixed CRLF/LF line endings — use `node -e` bash scripts for reliable modifications (not the edit tool).

## Login Credentials

- User: `ofofonobs@gmail.com` / `12345678` / passcode `123456`
- Admin: `support@developerplug.com` / `12345678` / passcode `123456`
