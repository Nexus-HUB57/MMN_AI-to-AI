#!/usr/bin/env bash
# Runbook: Abertura Diária OneVerso
# Uso: ./daily-open.sh
# Saída: relatório de prontidão do dia
set -euo pipefail

TS=$(date -u +%Y%m%dT%H%M%SZ)
LOG=/var/www/oneverso/runbooks/logs
mkdir -p "$LOG"
OUT="$LOG/daily-open-${TS}.log"

echo "=== ABERTURA DIÁRIA OneVerso - ${TS} ===" | tee "$OUT"

echo "" | tee -a "$OUT"
echo "--- 1. PM2 (esperado: 6 online em fork) ---" | tee -a "$OUT"
pm2 list --no-color | awk 'NR>=4 && NR<=12 {print}' | tee -a "$OUT"

echo "" | tee -a "$OUT"
echo "--- 2. Health backend ---" | tee -a "$OUT"
curl -fsS https://oneverso.com.br/api/health | tee -a "$OUT"
echo "" | tee -a "$OUT"

echo "" | tee -a "$OUT"
echo "--- 3. Rotas críticas públicas (esperado: todas 200) ---" | tee -a "$OUT"
FAIL=0
for url in \
  https://oneverso.com.br/api/health \
  https://oneverso.com.br/login \
  https://oneverso.com.br/dashboard \
  https://oneverso.com.br/academia/ead/curso \
  https://oneverso.com.br/academia/ead/curso/fund-00 \
  https://oneverso.com.br/api/academia/catalog \
  "https://oneverso.com.br/api/academia/search?q=ioaid" \
  "https://oneverso.com.br/api/academia/whats-new?limit=5" \
  "https://oneverso.com.br/api/academia/stats/popular?days=30" \
  https://oneverso.com.br/api/academia/lesson/fund-00 \
  https://oneverso.com.br/api/academia/lesson/fund-00/next-suggested \
  "https://oneverso.com.br/api/academia/lesson-progress/me?userId=1" \
  https://oneverso.com.br/api/youtube/snapshot \
  https://oneverso.com.br/oauth/health
do
  code=$(curl -k -s -o /dev/null -w '%{http_code}' "$url")
  echo "$code $url" | tee -a "$OUT"
  if [ "$code" != "200" ]; then FAIL=$((FAIL+1)); fi
done
echo "rotas_falhando=$FAIL" | tee -a "$OUT"

echo "" | tee -a "$OUT"
echo "--- 4. Rotas protegidas (esperado: 401) ---" | tee -a "$OUT"
PFAIL=0
for url in \
  https://oneverso.com.br/api/academia/admin/cleanup-views \
  https://oneverso.com.br/api/academia/admin/translate-bulk
do
  code=$(curl -k -s -o /dev/null -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{}' "$url")
  echo "$code $url" | tee -a "$OUT"
  if [ "$code" != "401" ]; then PFAIL=$((PFAIL+1)); fi
done
echo "protegidas_inseguras=$PFAIL" | tee -a "$OUT"

echo "" | tee -a "$OUT"
echo "--- 5. Logs recentes mmn-api (últimas 20 linhas) ---" | tee -a "$OUT"
tail -n 20 /var/www/oneverso/current/logs/api-error.log 2>/dev/null | tee -a "$OUT" || echo "sem erros recentes" | tee -a "$OUT"

echo "" | tee -a "$OUT"
echo "--- 6. Recursos do servidor ---" | tee -a "$OUT"
uptime | tee -a "$OUT"
free -m | sed -n '1,3p' | tee -a "$OUT"
df -h / | sed -n '1,2p' | tee -a "$OUT"

echo "" | tee -a "$OUT"
echo "=== VEREDITO ===" | tee -a "$OUT"
if [ "$FAIL" -eq 0 ] && [ "$PFAIL" -eq 0 ]; then
  echo "STATUS: VERDE — Pode operar o dia normalmente" | tee -a "$OUT"
else
  echo "STATUS: ATENÇÃO — rotas_falhando=$FAIL  protegidas_inseguras=$PFAIL" | tee -a "$OUT"
  echo "AÇÃO: investigar antes de operar" | tee -a "$OUT"
fi

echo ""
echo "Relatório salvo em: $OUT"
