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

## VPS Deployment (AAPanel / NodePanel)

1. Clone/pull the repo — database is already included
2. Set environment variables: `JWT_SECRET` (min 32 chars), `CLIENT_ORIGIN` (e.g. `https://zenvault.one`), `NODE_ENV=production`
3. Run `npm install`
4. **Run opt**: `start:prod` | **Port**: `4000`
5. Save and boot

## Environment Variables

- `JWT_SECRET` — Required, min 32 chars
- `CLIENT_ORIGIN` — CORS origin for production (e.g. `https://zenvault.one`)
- `NODE_ENV` — Set to `production` on VPS
- `SQLITE_DB_PATH` — Optional, custom path to SQLite file
- `API_PORT` — Express port (default 4000)
- `ACCESS_TOKEN_TTL` — JWT expiry (default 12h)
- `PENDING_TOKEN_TTL` — Pending token expiry (default 10m)

## Live Price Feed

Crypto prices fetched from CoinGecko every 60 seconds. Symbols: BTC, ETH, USDT, SOL, BNB, DOT, TRX, LTC, BCH, XLM, DASH

## Login Credentials

- User: `ofofonobs@gmail.com` / `12345678` / passcode `123456`
- Admin: `support@developerplug.com` / `12345678` / passcode `123456`
