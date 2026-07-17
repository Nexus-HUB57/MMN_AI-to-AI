#!/bin/bash
set -uo pipefail
cd /var/www/oneverso/current
PG=$(grep '^DATABASE_URL=' .env | head -1 | cut -d= -f2-)

echo "── [2.5] balances report ──"
psql "$PG" -t -c "SELECT 'balances_rows' AS metric, count(*)::text AS value FROM affiliate_balances UNION ALL SELECT 'with_money', count(*)::text FROM affiliate_balances WHERE \"availableBalance\">0 UNION ALL SELECT 'sum_available_brl', TO_CHAR(SUM(\"availableBalance\")::numeric/100,'FM999G999D00') FROM affiliate_balances UNION ALL SELECT 'sum_earned_brl', TO_CHAR(SUM(\"totalEarned\")::numeric/100,'FM999G999D00') FROM affiliate_balances;"

echo
echo "── [3] MP Sandbox webhook test ──"
ORDER_ID="ord_d16_pix_sandbox_$(date +%s)"
PAY_ID="MP-D16-SANDBOX-$(date +%s)"
EXT_REF="d16-sandbox-pix-$(date +%s)"

psql "$PG" -v ord="$ORDER_ID" -v ref="$EXT_REF" << SQLEOF
INSERT INTO marketplace_orders
  (id, user_id, status, subtotal_cents, discount_cents, total_cents,
   payment_method, payment_status, external_reference, metadata, created_at, updated_at)
VALUES
  (:'ord', 1, 'pending', 999, 0, 999, 'pix', 'pending', :'ref',
   '{"source":"d16-sandbox","type":"ebook","slug":"d16-test","name":"Sandbox Test"}'::jsonb,
   NOW(), NOW());

INSERT INTO marketplace_order_items (order_id, item_type, item_slug, title, unit_price_cents, quantity, metadata)
VALUES (:'ord', 'ebook', '57-o-codigo-vivo', 'O Código Vivo (D16 test)', 999, 1, '{}');
SQLEOF

echo "  Order: $ORDER_ID"
echo "  Disparando webhook..."
RESP=$(curl -s -X POST http://127.0.0.1:3001/webhooks/mercadopago \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"payment\",\"action\":\"payment.updated\",\"data\":{\"id\":\"$PAY_ID\"},\"id\":\"$PAY_ID\",\"status\":\"approved\",\"external_reference\":\"$EXT_REF\"}")
echo "  Resposta: $(echo $RESP | head -c 400)"
sleep 1
psql "$PG" -c "SELECT id, payment_status, paid_at IS NOT NULL AS confirmed, payment_id FROM marketplace_orders WHERE id='$ORDER_ID';"

echo
echo "── [4] BTC custody + tabelas ──"
psql "$PG" << 'SQLEOF'
CREATE TABLE IF NOT EXISTS btc_custody_addresses (
  id            serial PRIMARY KEY,
  user_id       integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address       varchar(120) NOT NULL,
  provider      varchar(40) NOT NULL DEFAULT 'binance',
  status        varchar(20) NOT NULL DEFAULT 'active',
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, address)
);

CREATE TABLE IF NOT EXISTS btc_deposits (
  id              serial PRIMARY KEY,
  user_id         integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount_brl      integer NOT NULL,
  amount_btc      numeric(18,8) NOT NULL,
  brl_per_btc     numeric(18,2) NOT NULL,
  source_address  varchar(120),
  tx_hash         varchar(80) UNIQUE,
  status          varchar(20) NOT NULL DEFAULT 'pending',
  created_at      timestamptz NOT NULL DEFAULT now(),
  confirmed_at    timestamptz
);
CREATE INDEX IF NOT EXISTS idx_btc_deposits_user   ON btc_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_btc_deposits_status ON btc_deposits(status);

INSERT INTO btc_custody_addresses (user_id, address, provider)
SELECT 1, 'bc1q0nev3rs0custody0d16binance0nexus000000000', 'binance'
WHERE NOT EXISTS (SELECT 1 FROM btc_custody_addresses WHERE user_id=1);

INSERT INTO btc_deposits (user_id, amount_brl, amount_btc, brl_per_btc, source_address, tx_hash, status, confirmed_at)
SELECT 1, 10000, 0.00033333, 300000.00,
       '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
       'd16_demo_tx_' || md5(now()::text),
       'confirmed', NOW()
WHERE NOT EXISTS (SELECT 1 FROM btc_deposits WHERE user_id=1 AND status='confirmed');
SQLEOF

psql "$PG" -t -c "SELECT 'btc_custody_rows',count(*) FROM btc_custody_addresses;"
psql "$PG" -t -c "SELECT 'btc_deposits_rows',count(*) FROM btc_deposits;"
psql "$PG" -c "SELECT user_id, address, provider, status FROM btc_custody_addresses LIMIT 3;"
psql "$PG" -c "SELECT user_id, amount_brl, amount_btc, tx_hash, status FROM btc_deposits LIMIT 3;"

echo
echo "── [5] Carga HTTP: 1000+500+200 req paralelas ──"
which ab >/dev/null 2>&1 || apt-get install -qq -y apache2-utils

echo
echo "  [a] /api/health (1000 req, 50 concurrent):"
ab -n 1000 -c 50 -q -k https://oneverso.com.br/api/health 2>&1 | grep -E '^(Requests per second|Time per request|Failed requests|Complete requests|Non-2xx)'

echo
echo "  [b] /api/trpc/marketplaceNexus.listEbooks (200 req, 20 conc) — cache hit?"
ab -n 200 -c 20 -q -k https://oneverso.com.br/api/trpc/marketplaceNexus.listEbooks 2>&1 | grep -E '^(Requests per second|Time per request|Failed requests|Complete requests|Non-2xx)'

echo
echo "  [c] /dashboard (500 req, 30 conc):"
ab -n 500 -c 30 -q -k https://oneverso.com.br/dashboard 2>&1 | grep -E '^(Requests per second|Time per request|Failed requests|Complete requests|Non-2xx)'

echo
echo "── [6] Build + deploy + health ──"
cd /var/www/oneverso/current/backend && npm run build 2>&1 | tail -4
pm2 reload mmn-api --update-env 2>&1 | tail -2
sleep 2
curl -sS http://127.0.0.1:3001/api/health; echo

echo
echo "── MÉTRICAS FINAIS ──"
psql "$PG" -c "
SELECT 'commissions_approved' AS metric, count(*)::text AS value FROM commissions WHERE status='approved'
UNION ALL SELECT 'commissions_pending', count(*)::text FROM commissions WHERE status='pending'
UNION ALL SELECT 'balances_with_money', count(*)::text FROM affiliate_balances WHERE \"availableBalance\">0
UNION ALL SELECT 'sum_available_brl', TO_CHAR(SUM(\"availableBalance\")::numeric/100,'FM999G999D00') FROM affiliate_balances
UNION ALL SELECT 'btc_custody_addrs', count(*)::text FROM btc_custody_addresses
UNION ALL SELECT 'btc_deposits', count(*)::text FROM btc_deposits
UNION ALL SELECT 'd16_orders_paid', count(*)::text FROM marketplace_orders WHERE id LIKE 'ord_d16_%' AND payment_status='paid';"

echo
echo "✅ D16 OK"
