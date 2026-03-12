#!/bin/bash
# ─────────────────────────────────────────────────────────────
# IBK TV — Deploy latest code to Hetzner
# Run this any time you push new code:
#   bash deploy.sh
# ─────────────────────────────────────────────────────────────
set -e

APP_DIR="/var/www/ibktv"

echo "🚀 Deploying IBK TV..."
cd "$APP_DIR"
git pull
npm install
npm run build
pm2 restart ibktv
echo "✅ Done — $(pm2 show ibktv | grep status)"
