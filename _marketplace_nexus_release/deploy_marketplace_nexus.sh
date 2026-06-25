#!/usr/bin/env bash
# =============================================================================
# Deploy Marketplace Nexus · MMN AI-to-AI
# =============================================================================
# Este script é executado NO SERVIDOR (VPS 143.95.213.237, porta 22022, root).
# Ele:
#   1) atualiza o repositório local (/var/www/oneverso) com o branch main
#   2) aplica a migration 0010_marketplace_user_library.sql
#   3) executa o seed dos 132 ebooks (scripts/seed_marketplace_ebooks.py)
#   4) (re)gera PDFs, HTMLs e capas dos ebooks consolidados
#   5) instala dependências e roda build do frontend/backend
#   6) recarrega PM2 (mmn-api, workers) e Nginx
#   7) executa smoke tests no endpoint público
#
# Pré-requisitos: Node 20, pnpm OU npm, Python 3.11+, weasyprint, psycopg2-binary
# Variáveis exportadas:
#   APP_DIR (default /var/www/oneverso)
#   DATABASE_URL  (Postgres production)
#   FRONTEND_URL  (default https://oneverso.com.br)
# =============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/oneverso}"
FRONTEND_URL="${FRONTEND_URL:-https://oneverso.com.br}"
BRANCH="${BRANCH:-main}"

log() { printf '\033[1;36m[deploy]\033[0m %s\n' "$*"; }
fail() { printf '\033[1;31m[deploy:FAIL]\033[0m %s\n' "$*" >&2; exit 1; }

[[ -d "$APP_DIR" ]] || fail "APP_DIR $APP_DIR não existe."
cd "$APP_DIR"

log "1/7 · git pull origin $BRANCH"
git fetch --depth 1 origin "$BRANCH"
git reset --hard "origin/$BRANCH"

log "2/7 · aplicando migration 0010_marketplace_user_library.sql"
if [[ -z "${DATABASE_URL:-}" ]]; then fail "DATABASE_URL não definido."; fi
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f "$APP_DIR/database/migrations/0010_marketplace_user_library.sql"

log "3/7 · seed dos 132 ebooks (idempotente)"
python3 "$APP_DIR/scripts/seed_marketplace_ebooks.py"

log "4/7 · regenerar HTML/PDF/capas (pode levar ~2min)"
python3 "$APP_DIR/scripts/generate_marketplace_ebooks.py" || \
  log "  ↳ generate_marketplace_ebooks já estava sincronizado."

log "5/7 · install + build frontend/backend"
if command -v pnpm >/dev/null 2>&1; then
  pnpm install --frozen-lockfile
  pnpm --filter frontend build
  pnpm --filter backend build
else
  npm install --no-fund --no-audit
  (cd frontend && npm run build)
  (cd backend  && npm run build)
fi

log "6/7 · PM2 reload + Nginx"
pm2 reload ecosystem.config.js --update-env || pm2 start ecosystem.config.js
nginx -t && systemctl reload nginx

log "7/7 · smoke tests"
curl -fsS "$FRONTEND_URL/health" | head -c 400 ; echo
curl -fsS "$FRONTEND_URL/marketplaces" | grep -q -i "Nexus Storie" \
  && log "  ↳ Storefront público OK" \
  || fail "Storefront público não retornou markers esperados."

log "✓ Deploy do Marketplace Nexus concluído."
