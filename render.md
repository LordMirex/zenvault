# Render Deployment Guide

## Overview

Render was the original hosting platform for Zenvault. The app has since been migrated to a VPS (see `vps.md`), but the Render-hosted **PostgreSQL database** is still in use as the production database.

---

## Render PostgreSQL Database

The production database remains on Render and is accessed remotely from the VPS via the external connection URL.

### Connecting
Use the **External Database URL** from your Render dashboard:

1. Go to [render.com](https://render.com) → **Dashboard**
2. Open your PostgreSQL service
3. Copy the **External Database URL**
4. Set it in your `.env` as `DATABASE_URL`

```env
DATABASE_URL=postgresql://user:password@host.render.com/dbname
```

> The VPS app connects to this database over the internet. Render allows external connections by default on paid database plans.

---

## Known Render Limitations

### SMTP / Email
Render **blocks outbound SMTP connections** at the network level. This means email sending (Gmail, custom SMTP) will silently fail or time out when deployed on Render — regardless of your SMTP config being correct.

**Resolution:** Email works correctly from the VPS deployment. This was a primary reason for migrating.

### Environment Variables on Render
If you ever need to redeploy on Render, set these in the Render dashboard under **Environment**:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Render Postgres internal URL |
| `JWT_SECRET` | Your JWT secret |
| `CLIENT_ORIGIN` | Your frontend origin URL |
| `PORT` | `10000` (or Render's assigned port) |

---

## Original Render Deployment Steps (for reference)

If you need to redeploy the web service on Render:

1. Connect your GitHub repo in the Render dashboard
2. Create a new **Web Service**
3. Set **Build Command:** `npm run build`
4. Set **Start Command:** `node dist/server/index.mjs`
5. Add all environment variables listed above
6. Deploy

---

## Migrating Away from Render Database

When you are ready to move the database off Render (recommended for production stability):

1. Export your data from Render:
   ```bash
   pg_dump $RENDER_DATABASE_URL > zenvault_backup.sql
   ```

2. Provision a new PostgreSQL instance (on your VPS or a managed provider like Supabase, Neon, or Railway)

3. Import the dump:
   ```bash
   psql $NEW_DATABASE_URL < zenvault_backup.sql
   ```

4. Update `DATABASE_URL` in `/www/wwwroot/zenvault/.env` on the VPS

5. Restart the app:
   ```bash
   export PATH="$PATH:$(npm config get prefix)/bin"
   pm2 restart zenvault
   ```
