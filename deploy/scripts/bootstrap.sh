#!/usr/bin/env bash
# =============================================================================
# BREAK THE LOOP — VPS bootstrap script (Ubuntu 24.04, IONOS)
# Run AS ROOT, ONCE, on a fresh VPS:
#   curl -sSL https://raw.githubusercontent.com/.../deploy/scripts/bootstrap.sh | bash
# Or scp it over and: bash bootstrap.sh
# =============================================================================
set -euo pipefail

DOMAIN="breaktheloop.fr"
APP_DIR="/var/www/btl"
LOG_DIR="/var/log/btl"
ENV_DIR="/etc/btl"
GIT_REPO="${BTL_REPO:-https://github.com/CHANGE_ME/breaktheloop.git}"
GIT_REF="${BTL_REF:-main}"

echo "==> [1/9] System updates + base tooling"
apt update && apt upgrade -y
apt install -y curl ca-certificates gnupg ufw fail2ban git nginx \
               certbot python3-certbot-nginx jq

echo "==> [2/9] Node 20 + pnpm + PM2"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm i -g pnpm@10.33.0 pm2

echo "==> [3/9] Firewall (allow 22, 80, 443)"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "==> [4/9] Directories + env file template"
mkdir -p "$APP_DIR" "$LOG_DIR" "$ENV_DIR"
chmod 750 "$ENV_DIR"
if [ ! -f "$ENV_DIR/cron.env" ]; then
  cat > "$ENV_DIR/cron.env" <<EOF
# Edit AFTER bootstrap (chmod 600).  Used by btl-cron@*.service.
CRON_SECRET=$(openssl rand -hex 32)
EOF
  chmod 600 "$ENV_DIR/cron.env"
  echo "    cron.env created — note this CRON_SECRET, you'll paste it into .env.production"
  cat "$ENV_DIR/cron.env"
fi

echo "==> [5/9] Clone repo (or update)"
if [ ! -d "$APP_DIR/.git" ]; then
  git clone "$GIT_REPO" "$APP_DIR"
fi
cd "$APP_DIR"
git fetch --all
git checkout "$GIT_REF"
git reset --hard "origin/$GIT_REF"

echo "==> [6/9] App build (pnpm install + build)"
if [ ! -f "$APP_DIR/.env.production" ]; then
  cp "$APP_DIR/.env.example" "$APP_DIR/.env.production"
  chmod 600 "$APP_DIR/.env.production"
  echo "  ⚠️  $APP_DIR/.env.production created from template — FILL IT IN before next step:"
  echo "      vim $APP_DIR/.env.production"
  echo ""
  echo "  Then re-run:  cd $APP_DIR && pnpm install --frozen-lockfile && pnpm build"
  exit 0
fi
pnpm install --frozen-lockfile
pnpm build

echo "==> [7/9] PM2 setup"
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash || true

echo "==> [8/9] Nginx + TLS"
cp deploy/nginx/breaktheloop.conf /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/breaktheloop.conf /etc/nginx/sites-enabled/breaktheloop.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# certbot — non-interactive issuance
certbot --nginx -n --agree-tos -m "camille@$DOMAIN" \
        -d "$DOMAIN" -d "www.$DOMAIN" \
        --redirect

echo "==> [9/9] systemd cron timers"
cp deploy/systemd/btl-cron.service /etc/systemd/system/
cp deploy/systemd/btl-cron@.timer /etc/systemd/system/btl-cron@.timer

mkdir -p /etc/systemd/system/btl-cron@refresh-leaderboard.timer.d
cp deploy/systemd/refresh-leaderboard.timer.conf \
   /etc/systemd/system/btl-cron@refresh-leaderboard.timer.d/override.conf

mkdir -p /etc/systemd/system/btl-cron@sync-challenges.timer.d
cp deploy/systemd/sync-challenges.timer.conf \
   /etc/systemd/system/btl-cron@sync-challenges.timer.d/override.conf

systemctl daemon-reload
systemctl enable --now btl-cron@refresh-leaderboard.timer
systemctl enable --now btl-cron@sync-challenges.timer

echo ""
echo "✅  Bootstrap done."
echo "    App  : https://$DOMAIN"
echo "    Logs : pm2 logs btl"
echo "    Cron : systemctl list-timers 'btl-*'"
