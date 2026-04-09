# VPS Deployment Guide (zenvault.one)

## Server Details
- **VPS IP:** 194.163.185.51
- **Domain:** zenvault.one
- **App path:** `/www/wwwroot/zenvault`
- **PM2 process name:** `zenvault`
- **App port:** 10000
- **Panel:** aaPanel (Apache web server)

---

## Prerequisites
- VPS running Ubuntu/Debian
- aaPanel installed (Apache variant)
- Node.js installed via aaPanel
- Domain DNS A record pointing to `194.163.185.51`

---

## 1. Clone the App

```bash
cd /www/wwwroot
git clone <your-repo-url> zenvault
cd zenvault
npm install
npm run build
```

---

## 2. Configure Environment Variables

```bash
nano /www/wwwroot/zenvault/.env
```

Set the following:

```env
PORT=10000
DATABASE_URL=<your-render-postgres-external-url>
JWT_SECRET=<your-jwt-secret>
CLIENT_ORIGIN=https://zenvault.one
```

---

## 3. Start the App with PM2

```bash
# PM2 may need PATH fix each new session
export PATH="$PATH:$(npm config get prefix)/bin"

pm2 start dist/server/index.mjs --name zenvault
pm2 save
pm2 startup
```

---

## 4. Seed Email Settings (first run only)

If the database `settings` table is empty, seed the Gmail SMTP config:

```bash
node -e "
import('./server/data/seed.mjs').then(m => m.seedEmailSettings({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  user: 'your@gmail.com',
  pass: 'your-app-password',
  from: 'your@gmail.com'
}));
"
```

> This is safe — it only seeds when the table is empty and won't overwrite existing settings.

---

## 5. Configure Apache Reverse Proxy

Create a vhost config for Apache (aaPanel manages Apache, not Nginx):

```bash
nano /www/server/panel/vhost/apache/zenvault.one.conf
```

Paste:

```apache
<VirtualHost *:80>
    ServerName zenvault.one
    ServerAlias www.zenvault.one

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:10000/
    ProxyPassReverse / http://127.0.0.1:10000/

    ErrorLog /www/wwwlogs/zenvault.one.error.log
    CustomLog /www/wwwlogs/zenvault.one.log combined
</VirtualHost>
```

Verify proxy modules are loaded:

```bash
/www/server/apache/bin/httpd -M | grep proxy
```

Restart Apache:

```bash
/etc/init.d/httpd restart
```

---

## 6. SSL Certificate (Let's Encrypt)

Make sure DNS has propagated first:

```bash
 -s "https://dns.google/resolve?name=zenvault.one&type=A" | grep -o '"data":"[^"]*"'
```

Then run Certbot:

```bash
certbot --apache -d zenvault.one -d www.zenvault.one
```

Follow the prompts. Certbot will automatically update the Apache config for HTTPS.

---

## 7. Update CLIENT_ORIGIN After SSL

```bash
nano /www/wwwroot/zenvault/.env
```

Change:
```env
CLIENT_ORIGIN=https://zenvault.one
```

Restart the app:

```bash
export PATH="$PATH:$(npm config get prefix)/bin"
pm2 restart zenvault
```

---

## Deploying Updates

Each time you push new code:

```bash
cd /www/wwwroot/zenvault
git pull
npm run build
export PATH="$PATH:$(npm config get prefix)/bin"
pm2 restart zenvault
```

---

## Common Issues

### PM2 not found
```bash
export PATH="$PATH:$(npm config get prefix)/bin"
```
Run this at the start of every new SSH session before using PM2.

### Apache not starting (port conflict)
Check what's on port 80:
```bash
ss -tlnp | grep ':80'
```
aaPanel runs `httpd` (Apache) on port 80 — do not install a separate Nginx. Use aaPanel's Apache config directory instead.

### Email not sending (SMTP TLS errors)
The mailer is configured with `tls: { rejectUnauthorized: false }` to bypass expired certificate errors on the SMTP provider. This is intentional.

### Email not sending (connection refused on Render)
Render blocks outbound SMTP at the network level. Email only works from the VPS — this is expected behavior.
