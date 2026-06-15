#!/usr/bin/env bash
# =============================================================================
# 03-deploy-app.sh — Build + PM2 + publicação do frontend
# Executa em /var/www/oneverso/current ou na raiz do repositório.
# =============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/oneverso/current}"
PUBLIC_DIR="${PUBLIC_DIR:-/var/www/oneverso/public}"
LOG_DIR="${LOG_DIR:-/var/www/oneverso/logs}"

cd "$APP_DIR"
mkdir -p "$PUBLIC_DIR" "$LOG_DIR"

echo ">>> [1/6] Dependências (somente backend + frontend)"
# Mobile/Expo não entra no deploy do VPS web.
# Preferência por pnpm para reduzir consumo de memória no VPS.
if command -v pnpm >/dev/null 2>&1; then
  pnpm install --dir frontend --ignore-workspace --no-frozen-lockfile --reporter append-only
  pnpm install --dir backend --ignore-workspace --child-concurrency=1 --network-concurrency=1 --reporter append-only
else
  npx --yes pnpm@9.15.0 install --dir frontend --ignore-workspace --reporter append-only
  npx --yes pnpm@9.15.0 install --dir backend --ignore-workspace --child-concurrency=1 --network-concurrency=1 --reporter append-only
fi

echo ">>> [2/6] Build produção (frontend + backend + workers)"
npm run build:production

echo ">>> [3/6] Publicar frontend estático"
rm -rf "$PUBLIC_DIR"/*
cp -R frontend/dist/. "$PUBLIC_DIR/"

echo ">>> [4/6] Criar logs locais"
mkdir -p logs

echo ">>> [5/6] Subir serviços PM2"
pm2 startOrReload ecosystem.config.js --env production
pm2 save

echo ">>> [6/6] Health check local"
sleep 3
curl -fsS http://127.0.0.1:3001/api/health || true

echo "✅ Deploy da aplicação concluído"
