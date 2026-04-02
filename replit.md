# QFS Wallet Full Stack

A full-stack crypto wallet and OTC trading platform built with React + Vite (frontend) and Express (backend), using PostgreSQL for the database.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite, running on port 5000
- **Backend**: Express 5 API, running on port 4000
- **Database**: PostgreSQL (Replit built-in)
- **Auth**: JWT-based with bcryptjs hashing, two-step (password + passcode)

## Key Routes

- `/` — Public marketing / landing pages
- `/login`, `/signup`, `/passcode` — Auth flows
- `/app` — User wallet and trading portal
- `/admin` — Operations dashboard

## Database

Originally MySQL/MariaDB, ported to PostgreSQL for Replit compatibility. The `db.mjs` layer uses a named-param converter to translate `:param` style queries to PostgreSQL's `$1, $2` positional params.

## Scripts

- `npm run dev` — Runs Vite (port 5000) and Express API (port 4000) concurrently
- `npm run db:setup` — Drops and recreates tables, seeds data (destructive!)
- `npm run build` — TypeScript compile + Vite build

## Environment Variables

- `JWT_SECRET` — Required, min 32 chars (set in development env)
- `DATABASE_URL` — Auto-set by Replit PostgreSQL
- `API_PORT` — Express port (default 4000)
- `CLIENT_ORIGIN` — CORS origin for production
- `ACCESS_TOKEN_TTL` — JWT expiry (default 12h)
- `PENDING_TOKEN_TTL` — Pending token expiry (default 10m)

## Seed Accounts

- User: `ofofonobs@gmail.com` / `12345678` / passcode `123456`
- Admin: `support@developerplug.com` / `12345678` / passcode `123456`
