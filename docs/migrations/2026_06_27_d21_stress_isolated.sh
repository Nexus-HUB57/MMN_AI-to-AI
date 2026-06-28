#!/bin/bash
# ===========================================================
# D21 Foundation Real — Stress 1000 Agentes em SCHEMA ISOLADO
# CMO/AI decision: zero contaminação em produção real
# ===========================================================
set -uo pipefail
cd /var/www/oneverso/current

# Extrai DATABASE_URL sem source do .env (que tem linhas problemáticas)
DB_URL=$(grep "^DATABASE_URL=" .env | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'")
echo "DB_URL_LEN=${#DB_URL}"

SCHEMA="stress_d21"

echo "===== STEP 1: Criar schema isolado ====="
psql "$DB_URL" -c "DROP SCHEMA IF EXISTS ${SCHEMA} CASCADE; CREATE SCHEMA ${SCHEMA};"

echo
echo "===== STEP 2: Espelhar estruturas mínimas ====="
psql "$DB_URL" <<SQL
CREATE TABLE ${SCHEMA}.agents (
  id SERIAL PRIMARY KEY,
  code VARCHAR(32) UNIQUE,
  email VARCHAR(160),
  status VARCHAR(20) DEFAULT 'active',
  total_xp INT DEFAULT 0,
  level INT DEFAULT 1,
  available_brl NUMERIC(12,2) DEFAULT 0,
  earned_brl NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ${SCHEMA}.orders (
  id SERIAL PRIMARY KEY,
  agent_id INT REFERENCES ${SCHEMA}.agents(id),
  amount_brl NUMERIC(10,2),
  status VARCHAR(20) DEFAULT 'paid',
  payment_method VARCHAR(20) DEFAULT 'pix_sandbox',
  external_ref VARCHAR(80),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ${SCHEMA}.commissions (
  id SERIAL PRIMARY KEY,
  agent_id INT REFERENCES ${SCHEMA}.agents(id),
  order_id INT REFERENCES ${SCHEMA}.orders(id),
  amount_brl NUMERIC(10,2),
  status VARCHAR(20) DEFAULT 'approved',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ${SCHEMA}.xp_events (
  id SERIAL PRIMARY KEY,
  agent_id INT REFERENCES ${SCHEMA}.agents(id),
  xp_delta INT,
  source VARCHAR(40),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ${SCHEMA}.activities (
  id SERIAL PRIMARY KEY,
  agent_id INT REFERENCES ${SCHEMA}.agents(id),
  activity_type VARCHAR(40),
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX ON ${SCHEMA}.orders(agent_id);
CREATE INDEX ON ${SCHEMA}.commissions(agent_id);
CREATE INDEX ON ${SCHEMA}.xp_events(agent_id);
CREATE INDEX ON ${SCHEMA}.activities(agent_id);
SQL

echo
echo "===== STEP 3: Injetar 1000 agentes simultaneamente ====="
T0=$(date +%s%N)

psql "$DB_URL" <<SQL
-- 1000 agentes
INSERT INTO ${SCHEMA}.agents (code, email, status)
SELECT
  'D21-' || lpad(g::text, 5, '0'),
  'agent_' || g || '@stress.d21.oneverso.com.br',
  'active'
FROM generate_series(1, 1000) AS g;

-- Cada agente faz 1 a 5 compras (média 3) — total ~3000 ordens
INSERT INTO ${SCHEMA}.orders (agent_id, amount_brl, status, payment_method, external_ref)
SELECT
  a.id,
  (random() * 200 + 10)::NUMERIC(10,2),
  'paid',
  'pix_sandbox',
  'd21-ord-' || a.id || '-' || g
FROM ${SCHEMA}.agents a
CROSS JOIN LATERAL generate_series(1, (1 + floor(random()*5))::int) AS g;

-- Comissão automática (15%) para cada ordem
INSERT INTO ${SCHEMA}.commissions (agent_id, order_id, amount_brl, status)
SELECT o.agent_id, o.id, ROUND(o.amount_brl * 0.15, 2), 'approved'
FROM ${SCHEMA}.orders o;

-- XP: 100 XP por R\$1
INSERT INTO ${SCHEMA}.xp_events (agent_id, xp_delta, source)
SELECT o.agent_id, (o.amount_brl * 100)::int, 'order_paid'
FROM ${SCHEMA}.orders o;

-- Atividades sintéticas: 6 tipos por agente (Pack, ebook, social, sale, upgrade, skill)
INSERT INTO ${SCHEMA}.activities (agent_id, activity_type, payload)
SELECT a.id, t,
  jsonb_build_object('ts', now(), 'random', random())
FROM ${SCHEMA}.agents a
CROSS JOIN unnest(ARRAY[
  'pack_acquired','ebook_purchased','social_posted',
  'sale_made','upgrade_done','skill_used'
]) AS t;

-- Consolidar saldos e XP no agent
UPDATE ${SCHEMA}.agents a SET
  earned_brl = COALESCE(c.total, 0),
  available_brl = COALESCE(c.total, 0),
  total_xp = COALESCE(x.total_xp, 0),
  level = LEAST(10, GREATEST(1, FLOOR(COALESCE(x.total_xp, 0)/5000)::int))
FROM (
  SELECT agent_id, SUM(amount_brl) AS total FROM ${SCHEMA}.commissions GROUP BY agent_id
) c,
(
  SELECT agent_id, SUM(xp_delta) AS total_xp FROM ${SCHEMA}.xp_events GROUP BY agent_id
) x
WHERE c.agent_id = a.id AND x.agent_id = a.id;
SQL

T1=$(date +%s%N)
DUR_MS=$(( (T1-T0)/1000000 ))
echo "SQL_DURATION_MS=${DUR_MS}"

echo
echo "===== STEP 4: Métricas reais do stress ====="
psql "$DB_URL" -At <<SQL
SELECT 'agents=' || count(*) FROM ${SCHEMA}.agents;
SELECT 'orders=' || count(*) || ' revenue=R\$ ' || SUM(amount_brl)::TEXT FROM ${SCHEMA}.orders;
SELECT 'commissions=' || count(*) || ' total_pago=R\$ ' || SUM(amount_brl)::TEXT FROM ${SCHEMA}.commissions;
SELECT 'xp_events=' || count(*) || ' xp_total=' || SUM(xp_delta) FROM ${SCHEMA}.xp_events;
SELECT 'activities=' || count(*) FROM ${SCHEMA}.activities;
SELECT 'top10_agents=' || string_agg(code || ':' || total_xp::text || ':L' || level::text, ', ')
  FROM (SELECT code, total_xp, level FROM ${SCHEMA}.agents ORDER BY total_xp DESC LIMIT 10) t;
SELECT 'avg_orders_per_agent=' || ROUND(AVG(cnt), 2) FROM (
  SELECT agent_id, COUNT(*) AS cnt FROM ${SCHEMA}.orders GROUP BY agent_id
) s;
SELECT 'top10_earners=' || string_agg(code || ':R\$' || earned_brl::text, ', ')
  FROM (SELECT code, earned_brl FROM ${SCHEMA}.agents ORDER BY earned_brl DESC LIMIT 10) t;
SQL

echo
echo "===== STEP 5: Throughput por segundo equivalente ====="
TOTAL_OPS=$(psql "$DB_URL" -At -c "
SELECT
  (SELECT count(*) FROM ${SCHEMA}.agents) +
  (SELECT count(*) FROM ${SCHEMA}.orders) +
  (SELECT count(*) FROM ${SCHEMA}.commissions) +
  (SELECT count(*) FROM ${SCHEMA}.xp_events) +
  (SELECT count(*) FROM ${SCHEMA}.activities);")
RPS=$(awk -v n=$TOTAL_OPS -v d=$DUR_MS 'BEGIN{printf "%.0f", n*1000/d}')
echo "TOTAL_DB_OPS=${TOTAL_OPS}"
echo "EQUIVALENT_RPS=${RPS}"

echo
echo "===== STEP 6: HTTP smoke paralelo durante o stress ====="
START=$(date +%s%N)
OK=0; FAIL=0
for i in $(seq 1 50); do
  CODE=$(curl -o /dev/null -s -w "%{http_code}" "https://oneverso.com.br/api/health" --max-time 5)
  [ "$CODE" = "200" ] && OK=$((OK+1)) || FAIL=$((FAIL+1))
done
END=$(date +%s%N)
HTTP_DUR_MS=$(( (END-START)/1000000 ))
echo "HEALTH_OK=$OK FAIL=$FAIL DUR_MS=$HTTP_DUR_MS"

START=$(date +%s%N)
OK=0; FAIL=0
for i in $(seq 1 100); do
  CODE=$(curl -o /dev/null -s -w "%{http_code}" "https://oneverso.com.br/api/trpc/marketplaceNexus.listEbooks?input=%7B%22json%22%3Anull%7D" --max-time 5)
  [ "$CODE" = "200" ] && OK=$((OK+1)) || FAIL=$((FAIL+1))
done
END=$(date +%s%N)
HTTP2_DUR_MS=$(( (END-START)/1000000 ))
echo "EBOOKS_OK=$OK FAIL=$FAIL DUR_MS=$HTTP2_DUR_MS"

echo
echo "===== STEP 7: Recursos do servidor durante o stress ====="
echo "CPU:"; uptime
echo "MEMORY:"; free -h | head -2
echo "POSTGRES_CONN:"; psql "$DB_URL" -At -c "SELECT count(*) FROM pg_stat_activity WHERE datname=current_database();"

echo
echo "===== STEP 8: DROP schema (limpeza)? ====="
echo "Schema ${SCHEMA} mantido para auditoria. Para limpar:"
echo "  psql \"\$DATABASE_URL\" -c \"DROP SCHEMA ${SCHEMA} CASCADE;\""

echo
echo "===== D21 STRESS REPORT — DONE ====="
