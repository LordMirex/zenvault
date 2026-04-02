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

Originally MySQL/MariaDB. Migrated to SQLite for portability across environments. The `server/db.mjs` layer uses a named-param converter that translates `:param` style queries to better-sqlite3's `@param` named params.

The database file lives at `server/data/qfs_wallet.db` and is excluded from git (see `.gitignore`). To set up the database in a fresh environment, run `npm run db:setup`.

## Scripts

- `npm run dev` — Runs Vite (port 5000) and Express API (port 4000) concurrently
- `npm run db:setup` — Drops and recreates tables, seeds data (destructive!)
- `npm run build` — TypeScript compile + Vite build

## Environment Variables

- `JWT_SECRET` — Required, min 32 chars
- `SQLITE_DB_PATH` — Optional, path to SQLite file (defaults to `server/data/qfs_wallet.db`)
- `API_PORT` — Express port (default 4000)
- `CLIENT_ORIGIN` — CORS origin (required in production)
- `ACCESS_TOKEN_TTL` — JWT expiry (default 12h)
- `PENDING_TOKEN_TTL` — Pending token expiry (default 10m)

## GitHub / Portability

The SQLite database file is gitignored. When cloning to a new environment:
1. Set `JWT_SECRET` in your environment
2. Run `npm install`
3. Run `npm run db:setup`
4. Run `npm run dev`

## Seed Accounts

- User: `ofofonobs@gmail.com` / `12345678` / passcode `123456`
- Admin: `support@developerplug.com` / `12345678` / passcode `123456`
