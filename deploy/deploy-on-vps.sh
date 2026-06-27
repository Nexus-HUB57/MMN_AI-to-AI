#!/usr/bin/env bash
# Academ'IA · script de deploy no VPS
# Uso (no VPS, como deploy ou root):
#   cd /var/www/oneverso/current
#   bash /tmp/deploy-on-vps.sh /tmp/academia-update.tar.gz
set -euo pipefail

PKG="${1:-/tmp/academia-update.tar.gz}"
APP_DIR="${APP_DIR:-/var/www/oneverso/current}"
BACKUP_DIR="${BACKUP_DIR:-/var/www/oneverso/backups}"
STAMP=$(date +%Y%m%d-%H%M%S)

if [ ! -f "$PKG" ]; then
  echo "ERRO: pacote nao encontrado em $PKG"
  exit 1
fi

echo "=== [1/6] Backup do estado atual ==="
mkdir -p "$BACKUP_DIR"
tar czf "$BACKUP_DIR/pre-academia-${STAMP}.tar.gz" \
  -C "$APP_DIR" \
  AcademIA backend/src/appRouter.ts frontend/src/App.tsx 2>/dev/null || true
echo "Backup: $BACKUP_DIR/pre-academia-${STAMP}.tar.gz"

echo "=== [2/6] Extraindo update no app dir ==="
cd "$APP_DIR"
tar xzf "$PKG"

echo "=== [3/6] Validando estrutura editorial ==="
if [ -f scripts/academia/validate.mjs ]; then
  node scripts/academia/validate.mjs || { echo "Validacao falhou"; exit 1; }
fi

echo "=== [4/6] Rebuild backend ==="
cd "$APP_DIR/backend"
npm install --omit=dev --no-audit --no-fund 2>&1 | tail -3
npm run build 2>&1 | tail -5

echo "=== [5/6] Rebuild frontend ==="
cd "$APP_DIR/frontend"
npm install --no-audit --no-fund 2>&1 | tail -3
npm run build 2>&1 | tail -5

echo "=== [6/6] Restart PM2 ==="
cd "$APP_DIR"
pm2 restart mmn-api || pm2 start ecosystem.config.js --only mmn-api
pm2 save
sleep 3

# Health check
echo ''
echo "=== Health check ==="
curl -fsS http://127.0.0.1:3001/api/health || echo "Health check falhou"
echo ''
curl -fsSI https://oneverso.com.br/api/health | head -3 || true

echo ''
echo "=== Deploy concluido em $(date) ==="
echo "PDFs publicados em $APP_DIR/AcademIA/producao/apostilas-pdf"
echo "Validar:"
echo "  - https://oneverso.com.br/academia"
echo "  - https://oneverso.com.br/admin/academia"
echo "  - https://oneverso.com.br/admin/meetings"
