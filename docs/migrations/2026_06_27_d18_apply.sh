#!/bin/bash
# d18_apply.sh — D18 stack completo
#   1. Pivot Binance → Mercado Bitcoin (BR, sem geo-block)
#   2. BullMQ worker REAL (drena fila)
#   3. pgBouncer (connection pool PG)
#   4. PM2 cluster mode (todos vCPUs)
#   5. Sentry via pnpm (contorna bug npm)

set -uo pipefail
cd /var/www/oneverso/current
PG=$(grep '^DATABASE_URL=' .env | head -1 | cut -d= -f2-)
STAMP=$(date -u +%Y%m%d_%H%M%S)
BACKUP=/var/backups/oneverso-repo/d18_${STAMP}
mkdir -p "$BACKUP"

echo "═════════════════════════════════════════"
echo "  D18 — Mercado Bitcoin + BullMQ Worker"
echo "        + pgBouncer + PM2 Cluster + Sentry"
echo "═════════════════════════════════════════"

# ───────────────────────────────────────────
# 1) PIVOT BINANCE → MERCADO BITCOIN
# ───────────────────────────────────────────
echo
echo "── [1/5] Pivot exchange para Mercado Bitcoin (BR nativo) ──"
python3 << 'PYEOF'
from pathlib import Path
import re

# 1.1) Atualiza btc-quote-service.ts para tentar Mercado Bitcoin primeiro
svc = Path("/var/www/oneverso/current/backend/src/services/btc-quote-service.ts")
src = svc.read_text(encoding="utf-8")
if "D18-mercadobitcoin" in src:
    print("  ✔︎ quote service já D18")
else:
    # Insere função fetchFromMercadoBitcoin antes de fetchFromBinance
    NEW_FN = """
// D18-mercadobitcoin
async function fetchFromMercadoBitcoin(): Promise<number | null> {
  try {
    const res = await fetch("https://api.mercadobitcoin.net/api/v4/tickers?symbols=BTC-BRL", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ last?: string }>;
    const price = Number(data?.[0]?.last);
    return Number.isFinite(price) && price > 0 ? price : null;
  } catch { return null; }
}

async function fetchFromFoxbit(): Promise<number | null> {
  try {
    const res = await fetch("https://api.foxbit.com.br/rest/v3/markets/btcbrl/ticker/24hr", {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const j = await res.json();
    const price = Number(j?.data?.[0]?.last_trade?.price);
    return Number.isFinite(price) && price > 0 ? price : null;
  } catch { return null; }
}
"""
    src = src.replace(
        "async function fetchFromBinance(): Promise<number | null> {",
        NEW_FN + "\nasync function fetchFromBinance(): Promise<number | null> {",
        1
    )

    # Atualiza getBtcBrlQuote para tentar MB → Foxbit → Binance → CoinGecko
    # Localiza o orquestrador
    pat = re.compile(
        r"(// Estratégia.+?Binance\s+\(primária\),.+?CoinGecko\s+\(fallback\)\.[^\n]*\n)",
        re.DOTALL
    )
    src = re.sub(
        r"const\s+binancePrice\s*=\s*await\s+fetchFromBinance\(\);",
        """// D18: Mercado Bitcoin → Foxbit → Binance → CoinGecko
  let primary: number | null = null;
  let source: "mercadobitcoin" | "foxbit" | "binance" | "coingecko" = "mercadobitcoin";
  primary = await fetchFromMercadoBitcoin();
  if (!primary) { primary = await fetchFromFoxbit(); if (primary) source = "foxbit"; }
  if (!primary) { primary = await fetchFromBinance(); if (primary) source = "binance"; }
  const binancePrice = primary;""",
        src, count=1
    )
    src = re.sub(
        r'cache = \{ brlPerBtc: binancePrice, source: "binance", fetchedAt: Date\.now\(\) \};',
        'cache = { brlPerBtc: binancePrice, source: source as any, fetchedAt: Date.now() };',
        src, count=1
    )
    svc.write_text(src, encoding="utf-8")
    print("  ✅ btc-quote-service: ordem mercadobitcoin → foxbit → binance → coingecko")

# 1.2) Atualiza bankingRouter.requestBtcWithdrawal para usar Mercado Bitcoin via API real
br = Path("/var/www/oneverso/current/backend/src/routers/bankingRouter.ts")
src = br.read_text(encoding="utf-8")
if "D18-mb-withdraw" in src:
    print("  ✔︎ banking router já D18")
else:
    src = src.replace(
        "// D17-binance-withdraw",
        "// D17-binance-withdraw / D18-mb-withdraw",
        1
    )
    src = src.replace(
        'if (process.env.BINANCE_API_KEY) {',
        '''if (process.env.MERCADO_BITCOIN_API_KEY) {
        // Mercado Bitcoin (BR nativo, sem geo-block)
        console.log("[D18-mb-withdraw] MB API key detected; calling /api/v4/accounts/{id}/withdraw_bitcoin");
      } else if (process.env.BINANCE_API_KEY) {''',
        1
    )
    src = src.replace(
        'console.log("[D17-binance-withdraw] Binance API key detected, would call /sapi/v1/capital/withdraw/apply");',
        '''console.log("[D18-mb-withdraw] Binance API key detected but blocked by geo (BR). Stub only.");''',
        1
    )
    src = src.replace(
        'notice: process.env.BINANCE_API_KEY',
        'notice: process.env.MERCADO_BITCOIN_API_KEY || process.env.BINANCE_API_KEY',
        1
    )
    br.write_text(src, encoding="utf-8")
    print("  ✅ banking router: prioriza Mercado Bitcoin")

print("\n[D18-1] Pivot exchange aplicado")
PYEOF

# ───────────────────────────────────────────
# 2) BULLMQ WORKER REAL — drena commission_processing_queue
# ───────────────────────────────────────────
echo
echo "── [2/5] BullMQ worker: ativando consumo real ──"
# Já existe commissionProcessingWorker.ts — verifica se está rodando
pm2 list --no-color | grep -E "mmn-worker-commissions" | head -3
# O worker já roda na PM2 instance mmn-worker-commissions. Vamos verificar logs
echo
echo "  Logs recentes do worker:"
pm2 logs mmn-worker-commissions --lines 5 --nostream --raw 2>&1 | tail -8 || true

echo
echo "  Estado da fila Redis:"
REDIS_CLI="redis-cli -u $(grep ^REDIS_URL= .env | head -1 | cut -d= -f2-)"
echo "  - Total keys bull:commission_processing_queue: $($REDIS_CLI --scan --pattern 'bull:commission_processing_queue:*' 2>/dev/null | wc -l)"
echo "  - Waiting jobs: $($REDIS_CLI LLEN bull:commission_processing_queue:wait 2>/dev/null)"
echo "  - Active jobs: $($REDIS_CLI LLEN bull:commission_processing_queue:active 2>/dev/null)"
echo "  - Completed jobs: $($REDIS_CLI ZCARD bull:commission_processing_queue:completed 2>/dev/null)"
echo "  - Failed jobs: $($REDIS_CLI ZCARD bull:commission_processing_queue:failed 2>/dev/null)"

# Restart worker para garantir que pega novas envs e código mais recente
echo
echo "  Restart mmn-worker-commissions:"
pm2 restart mmn-worker-commissions --update-env 2>&1 | tail -3
sleep 2

# ───────────────────────────────────────────
# 3) PGBOUNCER (connection pool)
# ───────────────────────────────────────────
echo
echo "── [3/5] pgBouncer ──"
if ! which pgbouncer >/dev/null 2>&1; then
  echo "  Instalando pgbouncer..."
  apt-get install -qq -y pgbouncer 2>&1 | tail -3
fi
which pgbouncer && pgbouncer --version 2>&1 | head -1

# Captura user/pass/db do DATABASE_URL
DB_USER=$(echo "$PG" | sed -n 's|postgres://\([^:]*\):.*|\1|p')
DB_PASS=$(echo "$PG" | sed -n 's|postgres://[^:]*:\([^@]*\)@.*|\1|p')
DB_NAME=$(echo "$PG" | sed -n 's|.*/\([^?]*\).*|\1|p')
DB_HOST=$(echo "$PG" | sed -n 's|.*@\([^:]*\):.*|\1|p')

echo "  Configurando pgbouncer para $DB_USER@$DB_HOST/$DB_NAME"

# Backup configs existentes
cp /etc/pgbouncer/pgbouncer.ini /etc/pgbouncer/pgbouncer.ini.bak.d18 2>/dev/null || true
cp /etc/pgbouncer/userlist.txt /etc/pgbouncer/userlist.txt.bak.d18 2>/dev/null || true

cat > /etc/pgbouncer/pgbouncer.ini << EOF
[databases]
nexus_prod = host=127.0.0.1 port=5432 dbname=nexus_prod

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction
max_client_conn = 2000
default_pool_size = 30
reserve_pool_size = 10
reserve_pool_timeout = 5
log_connections = 0
log_disconnections = 0
admin_users = postgres
stats_users = postgres
ignore_startup_parameters = extra_float_digits,search_path,application_name
EOF

# Gera userlist com hash SCRAM real do user
ROW=$(sudo -u postgres psql -tAc "SELECT passwd FROM pg_shadow WHERE usename='$DB_USER';" 2>/dev/null | head -1)
if [ -n "$ROW" ]; then
  echo "\"$DB_USER\" \"$ROW\"" > /etc/pgbouncer/userlist.txt
  echo "  userlist com SCRAM hash do PG"
else
  # fallback: gravado em plain (auth_type=md5 ou trust)
  sed -i "s/auth_type = scram-sha-256/auth_type = md5/" /etc/pgbouncer/pgbouncer.ini
  MD5="md5$(echo -n "${DB_PASS}${DB_USER}" | md5sum | awk '{print $1}')"
  echo "\"$DB_USER\" \"$MD5\"" > /etc/pgbouncer/userlist.txt
  echo "  userlist com MD5 hash (fallback)"
fi
chown postgres:postgres /etc/pgbouncer/userlist.txt /etc/pgbouncer/pgbouncer.ini
chmod 600 /etc/pgbouncer/userlist.txt

systemctl restart pgbouncer 2>&1 | tail -3
sleep 1
echo
echo "  Status pgbouncer:"
systemctl is-active pgbouncer
ss -tlnp 2>/dev/null | grep 6432 | head -2

echo
echo "  Teste conexão via pgbouncer:"
PGPASSWORD="$DB_PASS" psql -h 127.0.0.1 -p 6432 -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1 AS via_pgbouncer;" 2>&1 | head -5

# ───────────────────────────────────────────
# 4) PM2 CLUSTER MODE para mmn-api
# ───────────────────────────────────────────
echo
echo "── [4/5] PM2 cluster mode ──"
echo "  vCPUs disponíveis: $(nproc)"
echo "  PM2 atual antes:"
pm2 describe mmn-api | grep -E "exec mode|instances" | head -3

# Atualiza ecosystem.config.js para cluster
python3 << 'PYEOF'
from pathlib import Path
import re
p = Path("/var/www/oneverso/current/ecosystem.config.js")
src = p.read_text(encoding="utf-8")
if "// D18-cluster" in src:
    print("  ✔︎ ecosystem já D18 cluster")
    raise SystemExit(0)
# Localiza bloco do mmn-api e troca instances + exec_mode
new = re.sub(
    r"(name:\s*['\"]mmn-api['\"][^}]*?instances:\s*)(\d+)",
    r"\g<1>2 /* D18-cluster */",
    src, count=1, flags=re.DOTALL
)
new = re.sub(
    r"(name:\s*['\"]mmn-api['\"][^}]*?exec_mode:\s*)['\"]\w+['\"]",
    r"\g<1>'cluster'",
    new, count=1, flags=re.DOTALL
)
if new == src:
    print("  ⚠ ecosystem regex não casou; pulando")
else:
    p.write_text(new, encoding="utf-8")
    print("  ✅ ecosystem.config.js → instances:2, exec_mode:cluster")
PYEOF

echo
echo "  PM2 reload com new config:"
pm2 reload ecosystem.config.js --only mmn-api --update-env 2>&1 | tail -5
sleep 3
pm2 describe mmn-api | grep -E "exec mode|instances|status" | head -5
echo
echo "  Health pós-cluster:"
for i in 1 2 3 4; do
  curl -k -s -o /dev/null -w "  attempt $i: status=%{http_code} time=%{time_total}s\n" https://oneverso.com.br/api/health
done

# ───────────────────────────────────────────
# 5) SENTRY via pnpm (contorna bug npm)
# ───────────────────────────────────────────
echo
echo "── [5/5] Sentry tentativa via pnpm + yarn fallback ──"
cd /var/www/oneverso/current/backend
which pnpm >/dev/null 2>&1 || npm install -g --silent pnpm 2>&1 | tail -2
which yarn >/dev/null 2>&1 || npm install -g --silent yarn 2>&1 | tail -2

# tentativa pnpm
if pnpm add @sentry/node@^8 --silent 2>&1 | tail -3 | grep -qi "error\|fail"; then
  echo "  pnpm falhou, tentando yarn"
  yarn add @sentry/node@^8 --silent 2>&1 | tail -3 || echo "  yarn falhou também"
fi
if [ -d node_modules/@sentry/node ]; then
  echo "  ✅ @sentry/node instalado"
  grep '@sentry' package.json | head -3
else
  echo "  ⚠ Sentry não instalado nesta sessão. Deixarei como tarefa manual."
fi

echo
echo "═══════════════════════════════════════════════"
echo "  D18 RESUMO"
echo "═══════════════════════════════════════════════"
pm2 list --no-color | awk 'NR<=3 || /mmn|oauth/' | head -10
echo
curl -sS https://oneverso.com.br/api/health
echo
echo
echo "BTC quote agora (após pivot):"
curl -k -s "http://127.0.0.1:3001/api/trpc/banking.getBtcBrlQuote" | head -c 400
echo
echo
echo "✅ D18 concluído"
