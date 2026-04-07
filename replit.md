# QFS Wallet — Full Stack Platform

A full-stack crypto wallet and OTC trading platform built with React + Vite (frontend) and Express (backend), using **PostgreSQL** for the database.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite, port 5000 (dev)
- **Backend**: Express 5 API, port 4000 (dev) / `PORT` env var (production)
- **Database**: PostgreSQL via `pg` — auto-initialised on first boot, seeded automatically
- **Auth**: JWT-based with bcryptjs hashing, two-step (password + passcode)

## Key Routes

- `/` — Public marketing / landing pages
- `/login`, `/signup`, `/passcode` — Auth flows
- `/app` — User wallet and trading portal
- `/admin` — Operations dashboard
- `/ping` — Keepalive endpoint (returns `pong`, used by cron job)

## Database

PostgreSQL is used in all environments. On first boot the server:
1. Creates all tables (users, transactions, kyc_cases, settings)
2. Seeds the admin user and demo users if the DB is empty
3. No manual setup steps needed

**Connection**: Set `DATABASE_URL` environment variable.

## Scripts

- `npm run dev` — Runs Vite (port 5000) and Express API (port 4000) concurrently
- `npm run build` — TypeScript compile + Vite build
- `npm start` — Starts the Express server (auto-builds if `dist/` missing, then serves API + frontend)

## Deploying on Render (Free Tier) — Step by Step

### 1. Create a PostgreSQL database on Render
- Go to [render.com](https://render.com) → **New → PostgreSQL**
- Name: `zenvault-db`, Plan: **Free** → Create
- Copy the **Internal Database URL** (used in step 3)

### 2. Create a Web Service
- Go to **New → Web Service** → Connect your GitHub repo
- Render will detect `render.yaml` automatically

### 3. Set Environment Variables in the Render Dashboard
| Variable | Value |
|---|---|
| `DATABASE_URL` | Internal Database URL from step 1 |
| `JWT_SECRET` | Any random 40+ character string (generate at randomkeygen.com) |
| `NODE_ENV` | `production` |

> **Note**: If you use `render.yaml` to create the service fresh, `DATABASE_URL` is wired automatically from the linked database. Manual services need the env var set by hand.

### 4. Deploy
Click **Manual Deploy → Deploy latest commit**. Render will:
1. Run `npm install && npm run build`
2. Start with `npm start` → prestart auto-builds if dist is missing
3. Connect to PostgreSQL, initialise schema, seed data
4. Go live ✅

## Keeping the Site Alive (Cron Job)

Render's free tier spins down after 15 minutes of inactivity. Set up a free cron job to ping the server:

1. Go to [cron-job.org](https://cron-job.org) → Create free account
2. **New cronjob**:
   - URL: `https://your-service.onrender.com/ping`
   - Schedule: Every **14 minutes**
   - Enable → Save
3. Done — your server never sleeps

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | **Always** | PostgreSQL connection string |
| `JWT_SECRET` | **Always** | Min 32 chars, strong random string |
| `NODE_ENV` | Production | Set to `production` |
| `PORT` | Render auto | Set automatically by Render |
| `ACCESS_TOKEN_TTL` | Optional | JWT expiry (default `12h`) |
| `PENDING_TOKEN_TTL` | Optional | Pending token expiry (default `10m`) |

## Platform Detection

- `RENDER=1` (set by Render automatically) → uses `PORT`, allows `.onrender.com` CORS
- `REPLIT_DEV_DOMAIN` → dev mode, allows `.replit.dev` CORS

## Login Credentials (Seed Data)

| Account | Email | Password | Passcode |
|---|---|---|---|
| Admin | `support@developerplug.com` | `12345678` | `123456` |
| Power User | `ofofonobs@gmail.com` | `12345678` | `123456` |
| Review User | `c0d3g0d.01@gmail.com` | `12345678` | `123456` |
| Growth User | `ava.martins@qfstrading.com` | `12345678` | `123456` |

## Admin Features

- **User Management**: View, edit, fund wallets, manage KYC
- **Transaction Approval**: Approve / decline pending withdrawals
- **Admin Email Notifications**: Receives email when users submit withdrawals
- **Broadcast Email**: Send emails to all users or targeted users
- **Settings**: General branding, email (SMTP), wallet configuration
- **Live Price Feed**: CoinGecko prices updated every 60 seconds

## Known Limitations

- **Bots page**: Shows demo data with a "Preview Mode" banner — trading bot execution is not yet live
- **Email delivery**: Requires SMTP config in Admin > Settings > Email; all email failures are handled gracefully

## Bug Fixes Applied

- **Admin user creation**: PostgreSQL returns column aliases as lowercase — `AS nextId` was being read as `nextId` (undefined), causing every admin user create to attempt ID 100 and fail with a duplicate key error. Fixed by using `AS next_id` (lowercase) in both signup and admin create endpoints.
- **Portfolio USD showing 0**: When the admin funded assets via wallet API, assets were stored with `enabledByDefault: false` and `status: Paused`, causing `sumVisiblePortfolioValue()` to skip them. Fixed: admin wallet funding now sets `enabledByDefault = true` and `status = Enabled` when adding balance to a previously unfunded asset.
- **Swap page**: Was fully mocked; replaced with a real `/api/client/swap` endpoint that validates passcode, deducts from-asset, credits to-asset, and records the transaction.
- **Buy Crypto**: "Continue Purchase" button was a no-op; now navigates to `/app/deposit?asset={id}`.

## File Storage

All user-uploaded files (KYC documents, logos, favicons, profile images) are stored as binary data (`BYTEA`) in the `file_uploads` PostgreSQL table — never on disk. Files survive every restart and redeploy. Multer uses `memoryStorage()` so uploads never touch the filesystem.

## File Structure

```
server/
  index.mjs         — Express app (all API routes)
  db.mjs            — PostgreSQL pool + named-param query helpers
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
