# ZenVault Wallet

Full-stack crypto wallet platform — React frontend, Express API, SQLite database.

---

## Deploying on VPS with AAPanel

**Fill in the form exactly like this:**

| Field | Value |
|---|---|
| Run opt | `start:prod` |
| Port | `4000` |
| Boot | ✅ tick this so it auto-starts when your server reboots |

**Environment variables to set (Node project → Config):**

| Variable | Value |
|---|---|
| `JWT_SECRET` | Any random string, at least 32 characters long |
| `CLIENT_ORIGIN` | Your domain e.g. `https://zenvault.one` |
| `NODE_ENV` | `production` |

That's it. Pull the repo, `npm install`, set those 3 variables, boot — site is live.

---

## How It Works

- **Frontend** — React app (login, wallet dashboard, admin panel, public site)
- **API** — Express server handling auth, transactions, wallet data, emails, live prices
- **Database** — SQLite file at `server/data/qfs_wallet.db`, included in the repo — no setup needed
- **In production** — one process on port 4000 serves both the API and the frontend
- **In dev** — Vite runs on port 5000, API on 4000, Vite proxies `/api` requests automatically

---

## Local Development

```bash
npm install
npm run dev
```

---

## Login Credentials

| Role | Email | Password | Passcode |
|---|---|---|---|
| Admin | support@developerplug.com | 12345678 | 123456 |
| User | ofofonobs@gmail.com | 12345678 | 123456 |
