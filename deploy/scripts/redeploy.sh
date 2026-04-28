#!/usr/bin/env bash
# Pull latest main, rebuild, reload PM2.  Run as root on the VPS.
set -euo pipefail
cd /var/www/btl
git fetch --all
git reset --hard origin/main
pnpm install --frozen-lockfile
pnpm build
pm2 reload btl --update-env
echo "✅  Reloaded $(date -u +%FT%TZ)"
