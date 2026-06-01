-- Migration 0004 · Nexus Partners Pack
-- Adiciona persistência para o domínio de Parceiros Estratégicos.
-- Compatível com Postgres.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) partners · cadastro principal de parceiros
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "partners" (
  "id"                  SERIAL PRIMARY KEY,
  "userId"              INTEGER       NOT NULL UNIQUE,
  "tier"                VARCHAR(20)   NOT NULL DEFAULT 'silver',
  "referral_code"       VARCHAR(50)   NOT NULL UNIQUE,
  "referral_count"      INTEGER       NOT NULL DEFAULT 0,
  "total_volume"        NUMERIC(15,2) NOT NULL DEFAULT 0,
  "commission_balance"  NUMERIC(15,2) NOT NULL DEFAULT 0,
  "status"              VARCHAR(20)   NOT NULL DEFAULT 'active',
  "benefits"            JSONB         DEFAULT '[]',
  "metadata"            JSONB,
  "created_at"          TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updated_at"          TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "partner_tier_idx"
  ON "partners" ("tier");
CREATE INDEX IF NOT EXISTS "partner_status_idx"
  ON "partners" ("status");
CREATE INDEX IF NOT EXISTS "partner_user_id_idx"
  ON "partners" ("userId");

-- -----------------------------------------------------------------------------
-- 2) partnerships · acordos de parceria
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "partnerships" (
  "id"                SERIAL PRIMARY KEY,
  "partner_id"        INTEGER       NOT NULL,
  "partner_name"      VARCHAR(255)  NOT NULL,
  "partner_email"     VARCHAR(320),
  "partner_company"   VARCHAR(255),
  "status"            VARCHAR(20)   NOT NULL DEFAULT 'pending',
  "commission_rate"   NUMERIC(5,2)  NOT NULL DEFAULT 0.05,
  "benefits"          JSONB         DEFAULT '[]',
  "notes"             TEXT,
  "started_at"        TIMESTAMP,
  "ended_at"          TIMESTAMP,
  "approved_by"       INTEGER,
  "approved_at"       TIMESTAMP,
  "rejection_reason"  TEXT,
  "created_at"        TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updated_at"        TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "partnership_partner_id_idx"
  ON "partnerships" ("partner_id");
CREATE INDEX IF NOT EXISTS "partnership_status_idx"
  ON "partnerships" ("status");
CREATE INDEX IF NOT EXISTS "partnership_created_idx"
  ON "partnerships" ("created_at");

-- -----------------------------------------------------------------------------
-- 3) partner_tier_configs · configuração editável de tiers
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "partner_tier_configs" (
  "id"               SERIAL PRIMARY KEY,
  "tier"             VARCHAR(20)   NOT NULL UNIQUE,
  "min_volume"       NUMERIC(15,2) NOT NULL DEFAULT 0,
  "commission_rate"  NUMERIC(5,2)  NOT NULL DEFAULT 0.05,
  "max_referrals"    INTEGER,
  "benefits"         JSONB         DEFAULT '[]',
  "features"         JSONB         DEFAULT '[]',
  "color"            VARCHAR(20),
  "icon"             VARCHAR(50),
  "sort_order"       INTEGER       NOT NULL DEFAULT 0,
  "is_active"        BOOLEAN       NOT NULL DEFAULT TRUE,
  "created_at"       TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "partner_tier_configs_active_idx"
  ON "partner_tier_configs" ("is_active");

-- Seed: 4 tiers default
INSERT INTO "partner_tier_configs"
  ("tier", "min_volume", "commission_rate", "max_referrals", "benefits",
   "features", "color", "icon", "sort_order", "is_active")
VALUES
  ('silver',   0,       0.05, 50,   '["dashboard_basic","reports_weekly","email_support"]',
    '["basic_analytics","weekly_digest"]', '#C0C0C0', 'shield', 1, TRUE),
  ('gold',     5000,    0.08, 200,  '["dashboard_advanced","reports_daily","priority_support","marketing_materials"]',
    '["advanced_analytics","daily_digest","marketing_kit"]', '#FFD700', 'star', 2, TRUE),
  ('platinum', 20000,   0.12, 500,  '["dashboard_advanced","reports_realtime","priority_support","marketing_materials","api_access","custom_integrations"]',
    '["realtime_analytics","api_v1","custom_integrations"]', '#E5E4E2', 'crown', 3, TRUE),
  ('diamond',  100000,  0.15, NULL, '["all_features","dedicated_account_manager","custom_reporting","early_access","beta_features","volume_discounts"]',
    '["all_integrations","white_glove","beta_access"]', '#B9F2FF', 'diamond', 4, TRUE)
ON CONFLICT ("tier") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 4) partner_metrics · snapshots periódicos
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "partner_metrics" (
  "id"               SERIAL PRIMARY KEY,
  "partner_id"       INTEGER       NOT NULL,
  "period"           VARCHAR(20)   NOT NULL,
  "period_start"     TIMESTAMP     NOT NULL,
  "period_end"       TIMESTAMP     NOT NULL,
  "new_referrals"    INTEGER       NOT NULL DEFAULT 0,
  "total_sales"      NUMERIC(15,2) NOT NULL DEFAULT 0,
  "commission_earned" NUMERIC(15,2) NOT NULL DEFAULT 0,
  "conversion_rate"  NUMERIC(5,2)  NOT NULL DEFAULT 0,
  "active_partners"  INTEGER       NOT NULL DEFAULT 0,
  "nps"              INTEGER,
  "metadata"         JSONB,
  "created_at"       TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "partner_metrics_partner_id_idx"
  ON "partner_metrics" ("partner_id");
CREATE INDEX IF NOT EXISTS "partner_metrics_period_idx"
  ON "partner_metrics" ("period");

-- -----------------------------------------------------------------------------
-- 5) partner_benefits · benefícios granulares ativos
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "partner_benefits" (
  "id"            SERIAL PRIMARY KEY,
  "partner_id"    INTEGER       NOT NULL,
  "benefit_code"  VARCHAR(100)  NOT NULL,
  "benefit_name"  VARCHAR(255)  NOT NULL,
  "benefit_type"  VARCHAR(50)   NOT NULL,
  "is_enabled"    BOOLEAN       NOT NULL DEFAULT TRUE,
  "usage_limit"   INTEGER,
  "used_count"    INTEGER       NOT NULL DEFAULT 0,
  "valid_from"    TIMESTAMP     NOT NULL,
  "valid_until"   TIMESTAMP,
  "created_at"    TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "partner_benefit_partner_id_idx"
  ON "partner_benefits" ("partner_id");
CREATE INDEX IF NOT EXISTS "partner_benefit_code_idx"
  ON "partner_benefits" ("benefit_code");

-- -----------------------------------------------------------------------------
-- 6) partner_volume_history · audit trail de volume
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "partner_volume_history" (
  "id"          SERIAL PRIMARY KEY,
  "partner_id"  INTEGER       NOT NULL,
  "volume"      NUMERIC(15,2) NOT NULL,
  "volume_type" VARCHAR(50)   NOT NULL,
  "source"      VARCHAR(100),
  "source_id"   INTEGER,
  "description" TEXT,
  "created_at"  TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "partner_volume_partner_idx"
  ON "partner_volume_history" ("partner_id");
CREATE INDEX IF NOT EXISTS "partner_volume_created_idx"
  ON "partner_volume_history" ("created_at");

-- -----------------------------------------------------------------------------
-- 7) growth_algorithms · definição de algoritmos de crescimento
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "growth_algorithms" (
  "id"                SERIAL PRIMARY KEY,
  "name"              VARCHAR(100)  NOT NULL UNIQUE,
  "type"              VARCHAR(50)   NOT NULL,
  "base_multiplier"   NUMERIC(10,4) NOT NULL DEFAULT 1.0,
  "exponential_factor" NUMERIC(10,4) NOT NULL DEFAULT 1.0,
  "max_multiplier"    NUMERIC(10,4) NOT NULL DEFAULT 10.0,
  "conditions"        JSONB,
  "is_active"         BOOLEAN       NOT NULL DEFAULT TRUE,
  "created_at"        TIMESTAMP     NOT NULL DEFAULT NOW(),
  "updated_at"        TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "growth_algorithms_active_idx"
  ON "growth_algorithms" ("is_active");

-- Seed: 4 algoritmos default
INSERT INTO "growth_algorithms"
  ("name", "type", "base_multiplier", "exponential_factor", "max_multiplier", "conditions", "is_active")
VALUES
  ('volume_multiplier', 'volume',  1.0000, 1.0500, 2.0000, '{"minVolume": 0, "minReferrals": 0, "tierRequirements": []}', TRUE),
  ('network_bonus',     'network', 1.0000, 1.0020, 1.5000, '{"minVolume": 0, "minReferrals": 25, "tierRequirements": ["gold","platinum","diamond"]}', TRUE),
  ('referral_tiered',   'referral', 1.0000, 1.0000, 1.1500, '{"minVolume": 0, "minReferrals": 5,  "tierRequirements": []}', TRUE),
  ('retention_score',   'retention', 1.0000, 1.0000, 1.2000, '{"minVolume": 0, "minReferrals": 0, "tierRequirements": []}', TRUE)
ON CONFLICT ("name") DO NOTHING;

-- -----------------------------------------------------------------------------
-- 8) algorithm_executions · histórico de execuções
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "algorithm_executions" (
  "id"                SERIAL PRIMARY KEY,
  "algorithm_id"      INTEGER       NOT NULL,
  "partner_id"        INTEGER,
  "input_data"        JSONB,
  "output_data"       JSONB,
  "execution_time_ms" INTEGER,
  "status"            VARCHAR(20)   NOT NULL DEFAULT 'success',
  "error_message"     TEXT,
  "created_at"        TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "algo_exec_algorithm_idx"
  ON "algorithm_executions" ("algorithm_id");
CREATE INDEX IF NOT EXISTS "algo_exec_partner_idx"
  ON "algorithm_executions" ("partner_id");
CREATE INDEX IF NOT EXISTS "algo_exec_created_idx"
  ON "algorithm_executions" ("created_at");
