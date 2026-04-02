# QFS Wallet Full Stack

## Important

`npm run db:setup` is destructive.

It drops and recreates application tables for a fresh local seed. Do not run it against a live or shared database.

## Run Guide

Use the local Node installation explicitly. MySQL/MariaDB should be running first.

```powershell
& "C:\nodejs\npm.cmd" install
& "C:\nodejs\node.exe" .\server\scripts\setup-db.mjs
& "C:\nodejs\npm.cmd" run api:dev
& "C:\nodejs\npm.cmd" run dev
```

## Build

```powershell
& "C:\nodejs\npm.cmd" run build
```

If `npm run build` fails on Windows with `'node' is not recognized`, add `C:\nodejs` to `PATH` before running npm scripts.

## Environment

Copy `.env.example` to `.env` before first run and replace the placeholder secrets and database credentials.

- `API_PORT=4000`
- `DB_HOST=127.0.0.1`
- `DB_PORT=3306`
- `DB_USER=qfs_wallet_app`
- `DB_PASSWORD=replace-with-a-strong-db-password`
- `DB_NAME=qfs_wallet`
- `JWT_SECRET=replace-with-your-own-64-character-random-secret`
- `CLIENT_ORIGIN=http://localhost:5173`
- `VITE_API_BASE_URL=http://127.0.0.1:4000`
- `ACCESS_TOKEN_TTL=12h`
- `PENDING_TOKEN_TTL=10m`

SMTP delivery is read from the `email` record in the `settings` table through the admin settings screen.

## Deployment

Set `CLIENT_ORIGIN` to the public frontend origin the API should allow through CORS.

Set `VITE_API_BASE_URL` only when the frontend talks to a different origin than the page itself.

If the frontend and API are served from the same origin, leave `VITE_API_BASE_URL` empty so the client uses relative `/api/...` requests.

Confirm SMTP settings from the admin email settings screen before relying on signup or operational email delivery.

Run `npm run lint`, `npm test`, and `npm run build` before release.

The API now fails fast when `JWT_SECRET` is missing or weak, and production startup also rejects `DB_USER=root` or an empty `DB_PASSWORD`.

Run `npm run build` and start the API with `npm start` on the target host only after the production `.env` values are in place.

## Seed Accounts

- User: `ofofonobs@gmail.com` / `12345678` / passcode `123456`
- Admin: `support@developerplug.com` / `12345678` / passcode `123456`

## Structure

- `/` public marketing and landing pages
- `/login`, `/signup`, and `/passcode` two-step auth flows
- `/app` user wallet and trading portal backed by the Express API
- `/admin` operations dashboard backed by MySQL
- `/server` Express API, auth, seed data, and database setup scripts
