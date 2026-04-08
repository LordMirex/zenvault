# QFS Wallet — Agent Reference

> **Main documentation is in `README.md`** — that is the source of truth for setup, deployment, environment variables, and configuration. Always update `README.md` when making changes, not this file.

## Architecture (Quick Reference)

- **Frontend**: React 18 + TypeScript + Vite, port 5000 (dev)
- **Backend**: Express 5 API, port 4000 (dev) / `PORT` env var (production)
- **Database**: PostgreSQL — auto-initialised and seeded on first boot
- **Auth**: JWT-based, two-step (password + 6-digit passcode)

## Key Routes

- `/` — Public marketing / landing pages
- `/login`, `/signup`, `/passcode` — Auth flows
- `/app` — User wallet and trading portal
- `/admin` — Operations dashboard
- `/ping` — Keepalive endpoint (returns `pong`)

## File Structure

```
server/
  index.mjs         — Express app (all API routes)
  db.mjs            — PostgreSQL pool + query helpers
  schema.mjs        — Table creation + seeding on startup
  auth.mjs          — JWT + bcrypt helpers
  config.mjs        — Environment config
  mailer.mjs        — Branded email builder + SMTP client
  price-feed.mjs    — CoinGecko price polling
  assets.mjs        — Wallet asset and holdings helpers
  wallets.mjs       — Wallet configuration
  settings.mjs      — General settings helpers
  session-utils.mjs — Session management
  data/seed.mjs     — Seed data (users, transactions, settings)
src/                — React frontend (TypeScript + Vite)
scripts/
  prestart.cjs      — Auto-build check before server starts
```

## Dev Commands

- `npm run dev` — Vite (port 5000) + Express API (port 4000) concurrently
- `npm run build` — TypeScript compile + Vite build
- `npm start` — Start Express server (requires `dist/`)
