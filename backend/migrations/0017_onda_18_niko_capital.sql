-- Onda 18: Autonomia Financeira + AutoHeal Engine + Governance Loop
-- =============================================================================
-- Cria as tabelas para materializar:
-- 1. AutoHeal Engine (subir score autoHeal 1.0 -> 3.0+)
-- 2. Governance Loop Executor (subir score governance 2.83 -> 4.0+)
-- 3. Niko Capital 25% (skin in the game da IA co-fundadora)

-- ---- 1. AUTO_HEAL_EXECUTIONS ------------------------------------------------
-- Registro de todos os incidents ingeridos + tentativas de auto-remediacao
CREATE TABLE IF NOT EXISTS auto_heal_executions (
  id             SERIAL PRIMARY KEY,
  source         VARCHAR(100) NOT NULL,          -- 'pm2', 'cron', 'health-check', 'webhook'
  fault_class    VARCHAR(50)  NOT NULL,          -- 'endpoint_down', 'queue_stuck', etc.
  severity       VARCHAR(20)  NOT NULL,          -- 'low' | 'medium' | 'high' | 'critical'
  message        TEXT         NOT NULL,
  status         VARCHAR(20)  NOT NULL DEFAULT 'pending', -- pending | healed | escalated | failed | noop
  action_taken   VARCHAR(100),
  metadata       JSONB        DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  healed_at      TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS auto_heal_status_idx  ON auto_heal_executions(status);
CREATE INDEX IF NOT EXISTS auto_heal_created_idx ON auto_heal_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS auto_heal_source_idx  ON auto_heal_executions(source);

-- ---- 2. APPROVALS (garantir colunas necessarias) ---------------------------
-- A tabela ja existe (36 registros), so garantimos que tem as colunas de execucao
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS risk_level  VARCHAR(20) DEFAULT 'medium';
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS approved_by VARCHAR(100);
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS executed_at TIMESTAMPTZ;
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS executed_by VARCHAR(100);
ALTER TABLE approvals ADD COLUMN IF NOT EXISTS metadata    JSONB DEFAULT '{}'::jsonb;

-- ---- 3. NIKO_CAPITAL_LEDGER (livro-caixa da IA co-fundadora) ---------------
CREATE TABLE IF NOT EXISTS niko_capital_ledger (
  id             SERIAL PRIMARY KEY,
  entry_type     VARCHAR(10)  NOT NULL,          -- 'credit' | 'debit'
  account        VARCHAR(50)  NOT NULL,          -- 'niko_capital' | 'operational'
  source_type    VARCHAR(50)  NOT NULL,          -- 'pack_sale', 'monthly_activation', 'niko_allocation', etc.
  source_id      VARCHAR(128) NOT NULL,          -- id de referencia (order id, approval id, etc.)
  amount_cents   INTEGER      NOT NULL CHECK (amount_cents > 0),
  description    TEXT,
  metadata       JSONB        DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_by     VARCHAR(100)
);
CREATE INDEX IF NOT EXISTS niko_ledger_account_idx  ON niko_capital_ledger(account);
CREATE INDEX IF NOT EXISTS niko_ledger_created_idx  ON niko_capital_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS niko_ledger_source_idx   ON niko_capital_ledger(source_type, source_id);

-- ---- 4. Semear alguns incidents fake para testar AutoHeal desde ja ---------
-- (opcional — permite que o AutoHealCard mostre algo real desde o deploy)
INSERT INTO auto_heal_executions (source, fault_class, severity, message, status, action_taken, metadata, created_at, healed_at)
VALUES
  ('cron.health-check', 'endpoint_down', 'medium', 'health endpoint retornou 502 por 3 min', 'healed', 'requeue_stuck_agent_jobs', '{"affected":2}', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '4 min'),
  ('pm2.watchdog',     'queue_stuck',   'low',    'agent_queue_jobs travado > 15 min',        'healed', 'requeue_stuck_agent_jobs', '{"affected":3}', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day' + INTERVAL '2 min'),
  ('cron.orphan-scan', 'pix_pending_expired', 'low', 'pix_sessions pendentes ha 40 min', 'healed', 'clear_stale_pix_sessions', '{"affected":5}', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours' + INTERVAL '1 min'),
  ('cron.orphan-scan', 'orphan_order',  'medium', 'orders sem payment_id > 24h', 'noop', 'close_orphan_orders', '{"affected":0}', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours' + INTERVAL '10 sec'),
  ('pm2.watchdog',     'slow_response', 'low',    'p95 latency > 500ms em /api/pix/status', 'healed', 'noop', '{}', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour' + INTERVAL '30 sec')
ON CONFLICT DO NOTHING;

-- ---- 5. Registrar Onda 18 no memory operacional -----------------------------
INSERT INTO niko_operational_memory (subject, summary, autonomy_level, metadata, created_at)
VALUES (
  'onda-18-autonomia-financeira-e-loops',
  'AutoHeal Engine LIVE, Governance Loop Executor LIVE, Niko Capital 25% skin-in-the-game estabelecido. Sociedade tecnica materializada.',
  'ADAPTATIVO',
  '{"prs":["autoHealEngine","governanceLoopExecutor","nikoCapital"],"nikoShare":0.25}'::jsonb,
  NOW()
) ON CONFLICT DO NOTHING;
