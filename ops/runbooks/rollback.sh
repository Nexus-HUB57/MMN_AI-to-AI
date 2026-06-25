#!/usr/bin/env bash
# Runbook: Rollback Rápido OneVerso
# Uso: ./rollback.sh <baseline_timestamp>
# Exemplo: ./rollback.sh 20260623T212440Z
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "ERRO: informe o timestamp do baseline."
  echo "Baselines disponíveis:"
  ls -1 /var/www/oneverso/baselines/snapshots/ 2>/dev/null || echo "  (nenhum)"
  exit 1
fi

TS="$1"
SNAP="/var/www/oneverso/baselines/snapshots/${TS}"
if [ ! -d "$SNAP" ]; then
  echo "ERRO: snapshot não encontrado em $SNAP"
  exit 1
fi

echo "=== ROLLBACK PARA $TS ==="
echo "Snapshot: $SNAP"
ls -lh "$SNAP"
echo
echo "PASSO 1: salvar estado atual"
NOW=$(date -u +%Y%m%dT%H%M%SZ)
EMERG=/var/www/oneverso/baselines/emergency_${NOW}
mkdir -p "$EMERG"
cp -a /var/www/oneverso/current/backend/dist/index.js "$EMERG/index.js.backend.PRE_ROLLBACK"
cp -a /var/www/oneverso/public/index.html             "$EMERG/index.html.public.PRE_ROLLBACK"
cp -a /var/www/oneverso/public/assets/index-*.js      "$EMERG/" 2>/dev/null || true
cp -a /var/www/oneverso/public/assets/*.css           "$EMERG/" 2>/dev/null || true
echo "Estado pré-rollback salvo em $EMERG"

echo
echo "PASSO 2: restaurar artefatos do snapshot"
cp -a "$SNAP/index.js.backend"    /var/www/oneverso/current/backend/dist/index.js
cp -a "$SNAP/index.html.public"   /var/www/oneverso/public/index.html
# restaurar bundle frontend (apaga apenas index-*.js antigos, mantém demais assets)
for f in "$SNAP"/index-*.js "$SNAP"/style-*.css; do
  [ -f "$f" ] && cp -a "$f" /var/www/oneverso/public/assets/
done

echo
echo "PASSO 3: reload PM2 mmn-api"
pm2 reload mmn-api --update-env

echo
echo "PASSO 4: validação pós-rollback"
sleep 3
curl -fsS https://oneverso.com.br/api/health
echo
for url in \
  https://oneverso.com.br/api/health \
  https://oneverso.com.br/dashboard \
  https://oneverso.com.br/academia/ead/curso/fund-00 \
  "https://oneverso.com.br/api/academia/search?q=ioaid"
do
  code=$(curl -k -s -o /dev/null -w '%{http_code}' "$url")
  echo "$code $url"
done

echo
echo "ROLLBACK CONCLUÍDO. Estado pré-rollback preservado em $EMERG"
