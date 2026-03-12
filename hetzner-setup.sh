#!/bin/bash
# ─────────────────────────────────────────────────────────────
# IBK TV — Hetzner Server Setup Script
# Run this ONCE on a fresh Ubuntu 22.04 Hetzner server:
#   bash hetzner-setup.sh
# ─────────────────────────────────────────────────────────────
set -e

DOMAIN="tv.fopstech.com"   # ← change if you want a different subdomain
REPO="git@github.com:ibkdev1/IBK-TV.git"
APP_DIR="/var/www/ibktv"
EMAIL="info@fopstech.com"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  IBK TV — Server Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. System update
echo "[1/8] Updating system..."
apt-get update -qq && apt-get upgrade -y -qq

# 2. Install Node.js 20
echo "[2/8] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null
apt-get install -y nodejs > /dev/null

# 3. Install Nginx + Certbot
echo "[3/8] Installing Nginx + Certbot..."
apt-get install -y nginx certbot python3-certbot-nginx > /dev/null

# 4. Install PM2
echo "[4/8] Installing PM2..."
npm install -g pm2 > /dev/null

# 5. Clone repo
echo "[5/8] Cloning IBK TV repo..."
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR" && git pull
else
  git clone "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"
npm install
npm run build

# 6. Start app with PM2
echo "[6/8] Starting app with PM2..."
pm2 delete ibktv 2>/dev/null || true
pm2 start proxy-server.cjs --name ibktv
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

# 7. Nginx config
echo "[7/8] Configuring Nginx..."
cat > /etc/nginx/sites-available/ibktv <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Large buffer for video streaming
    proxy_buffers 16 64k;
    proxy_buffer_size 128k;
    proxy_read_timeout 60s;

    location / {
        proxy_pass         http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf /etc/nginx/sites-available/ibktv /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 8. SSL Certificate
echo "[8/8] Getting SSL certificate for $DOMAIN..."
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅  IBK TV is live at https://$DOMAIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Monitor:  pm2 status"
echo "  Logs:     pm2 logs ibktv"
echo "  Restart:  pm2 restart ibktv"
echo ""
