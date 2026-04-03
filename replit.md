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
- `npm run start` — Starts API server only (requires `dist/` to already exist)
- `npm run start:prod` — **Full production start**: builds frontend, sets up DB, then starts server (use this on VPS)

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

## VPS Deployment (AAPanel / NodePanel)

The app is a unified Node.js server in production. The Express server builds the React frontend into `dist/` and serves it as static files, with a catch-all for React Router SPA navigation.

**Steps on VPS:**
1. Pull latest code from GitHub
2. Set environment variables: `JWT_SECRET`, `CLIENT_ORIGIN` (your domain), `NODE_ENV=production`
3. Run `npm install`
4. In the panel, set **Run opt** to `start:prod` — this runs build + db setup + server in one step
5. Set **Port** to `4000` (the Express API/static server port)
6. Save and boot

**Why `start:prod` and not `start`?**  
`start` only runs the Express server but requires `dist/` to exist already. `start:prod` builds the frontend first, so a blank white page will never happen due to a missing build.

## Live Price Feed

Crypto prices are fetched from CoinGecko (Binance attempted first but is blocked in Replit — CoinGecko is the reliable fallback). Prices update every 60 seconds on the server.

- `GET /api/prices` — public endpoint, returns all cached live prices
- On login, `getClientBootstrap` applies live prices from the feed to each user wallet asset before returning
- The frontend polls `/api/prices` every 30 seconds while authenticated and patches `clientWalletAssets` in-memory
- Navbar live ticker only shows assets with `price > 0` (filters out misconfigured rails with no price data)

Symbols covered: BTC, ETH, USDT, SOL, BNB, DOT, TRX, LTC, BCH, XLM, DASH

## Seed Accounts

- User: `ofofonobs@gmail.com` / `12345678` / passcode `123456`
- Admin: `support@developerplug.com` / `12345678` / passcode `123456`
