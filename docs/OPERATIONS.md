# Operations Guide - The Transformation Engine

Quick reference for deploying and managing The Transformation Engine.

---

## Quick Commands

```bash
# Development
./manage.sh dev          # Start dev server (http://localhost:5173)

# Production
./manage.sh build        # Build for production
./manage.sh start        # Start with PM2 (http://localhost:7392)
./manage.sh stop         # Stop PM2 process
./manage.sh logs         # View logs
./manage.sh status       # Check status
```

---

## Configuration

### Environment Variables

```bash
# Custom port (default: 7392)
APP_PORT=8080 ./manage.sh start

# Bind to all interfaces (default: 127.0.0.1)
APP_HOST=0.0.0.0 ./manage.sh start

# Custom PM2 process name (default: transformation-engine)
APP_NAME=prod-engine ./manage.sh start

# All together
APP_NAME=prod-engine APP_PORT=8080 APP_HOST=0.0.0.0 ./manage.sh start
```

### Development Port

Edit `vite.config.ts` or use CLI flag:

```bash
npm run dev -- --port 3000 --host 0.0.0.0
```

---

## Production Deployment

### Option 1: Self-Hosted with PM2

**Requirements**:
- Node.js 18+
- PM2 (installed globally: `npm install -g pm2`)
- Serve (installed globally: `npm install -g serve`)

**Steps**:
```bash
# 1. Build
./manage.sh build

# 2. Start with PM2
./manage.sh start

# 3. Configure auto-restart on reboot
pm2 startup  # Run command it outputs
pm2 save

# 4. Monitor
./manage.sh status
./manage.sh logs
```

**File Locations**:
- Build output: `dist/`
- PM2 logs: `~/.pm2/logs/transformation-engine-*.log`
- PM2 config: `~/.pm2/`

---

### Option 2: Self-Hosted with Nginx

**Nginx Configuration** (`/etc/nginx/sites-available/transformation-engine`):

```nginx
# HTTP -> HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates (use certbot for Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Reverse proxy to PM2 app
    location / {
        proxy_pass http://127.0.0.1:7392;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

**Setup Steps**:
```bash
# 1. Create nginx config
sudo nano /etc/nginx/sites-available/transformation-engine
# (paste config above)

# 2. Enable site
sudo ln -s /etc/nginx/sites-available/transformation-engine /etc/nginx/sites-enabled/

# 3. Test config
sudo nginx -t

# 4. Install SSL certificate (certbot)
sudo apt install certbot python3-certbot-nginx  # Ubuntu/Debian
sudo certbot --nginx -d yourdomain.com

# 5. Reload nginx
sudo systemctl reload nginx

# 6. Start app
./manage.sh start

# 7. Verify
curl -I https://yourdomain.com
```

---

### Option 3: Static Hosting (Netlify/Cloudflare/AWS S3)

**Netlify** (Recommended):
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Build
./manage.sh build

# 3. Deploy
netlify deploy --prod --dir=dist

# Or use netlify.toml (already configured)
netlify deploy --prod
```

**Cloudflare Pages**:
```bash
# Build settings in Cloudflare dashboard:
# - Build command: npm run build
# - Build output directory: dist
```

**AWS S3 + CloudFront**:
```bash
# See DEPLOYMENT.md for full guide
# Quick: Upload dist/ to S3 bucket, enable static hosting
```

---

## Monitoring

### PM2 Commands

```bash
# View status
pm2 list

# View logs (live)
pm2 logs transformation-engine

# View logs (last 100 lines)
pm2 logs transformation-engine --lines 100

# Restart
pm2 restart transformation-engine

# Reload (zero-downtime)
pm2 reload transformation-engine

# Stop
pm2 stop transformation-engine

# Delete from PM2
pm2 delete transformation-engine

# View resource usage
pm2 monit
```

### System Logs

```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# System journal (systemd)
journalctl -u nginx -f
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 7392
lsof -i :7392

# Kill process
kill -9 <PID>

# Or use different port
APP_PORT=8080 ./manage.sh start
```

### PM2 Not Starting

```bash
# Check PM2 status
pm2 status

# View error logs
pm2 logs transformation-engine --err

# Delete and recreate
pm2 delete transformation-engine
./manage.sh start

# Check if serve is installed
which serve
npm list -g serve

# Reinstall serve
npm install -g serve
```

### Nginx 502 Bad Gateway

```bash
# Check if app is running
./manage.sh status

# Check if port is correct in nginx config
sudo nano /etc/nginx/sites-available/transformation-engine

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Check app is listening
netstat -tulpn | grep 7392
```

### Build Fails

```bash
# Clear dependencies
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite

# Check TypeScript
npx tsc --noEmit

# Try build again
./manage.sh build
```

### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal

# Check certificate expiry
sudo certbot certificates
```

---

## Maintenance

### Update Application

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build new version
./manage.sh build

# Reload PM2 (zero-downtime)
pm2 reload transformation-engine

# Or restart
./manage.sh stop
./manage.sh start
```

### Backup Data

Users' data is stored in browser IndexedDB, but you should backup the codebase:

```bash
# Backup repo
tar -czf transformation-engine-backup-$(date +%Y%m%d).tar.gz \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  .

# Backup nginx config
sudo cp /etc/nginx/sites-available/transformation-engine \
  /etc/nginx/sites-available/transformation-engine.bak
```

### SSL Auto-Renewal

Certbot sets up auto-renewal via cron/systemd timer. Verify:

```bash
# Check renewal timer
sudo systemctl status certbot.timer

# Check cron
sudo crontab -l | grep certbot

# Manual test
sudo certbot renew --dry-run
```

---

## Performance Tuning

### PM2 Cluster Mode

For high traffic, use cluster mode (multiple processes):

```bash
# Create ecosystem.config.js
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'transformation-engine',
    script: 'serve',
    args: 'dist -l 7392',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# Start with ecosystem
pm2 start ecosystem.config.js
pm2 save
```

### Nginx Caching

Add to nginx config for static asset caching:

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    proxy_pass http://127.0.0.1:7392;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Gzip Compression

Add to nginx http block:

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml+rss text/javascript;
gzip_min_length 1000;
```

---

## Security

### Firewall

```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block direct access to app port (optional, recommended)
sudo ufw deny 7392/tcp

# Enable firewall
sudo ufw enable
```

### Fail2Ban (Rate Limiting)

```bash
# Install fail2ban
sudo apt install fail2ban

# Create nginx jail
sudo nano /etc/fail2ban/jail.local

# Add:
# [nginx-limit-req]
# enabled = true
# filter = nginx-limit-req
# action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
# logpath = /var/log/nginx/error.log
# findtime = 600
# bantime = 7200
# maxretry = 10

# Restart fail2ban
sudo systemctl restart fail2ban
```

---

## Support

- **Documentation**: `docs/user_guide.md`
- **Architecture**: `ARCHITECTURE.md`
- **Deployment**: `DEPLOYMENT.md`
- **Issues**: Check browser console (F12) and PM2 logs
- **Source**: GitHub repository

---

**Last Updated**: 2025-10-12
**App Version**: Phase 9 (Intermediate Architecture)
