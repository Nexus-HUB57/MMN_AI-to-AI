-- Migration · Extensões do domínio de agentes
-- Adiciona persistência para imagens geradas, skills runtime,
-- histórico evolutivo e produtos recomendados.
-- Compatível com Postgres.
-- =============================================================================

CREATE TABLE IF NOT EXISTS "generated_images" (
  "id"         SERIAL PRIMARY KEY,
  "agentId"    INTEGER      NOT NULL,
  "prompt"     TEXT         NOT NULL,
  "imageUrl"   TEXT         NOT NULL,
  "storageKey" VARCHAR(255),
  "createdAt"  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "generated_images_agent_idx"
  ON "generated_images" ("agentId");
CREATE INDEX IF NOT EXISTS "generated_images_created_idx"
  ON "generated_images" ("createdAt");

-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "recommended_products" (
  "id"             SERIAL PRIMARY KEY,
  "agentId"        INTEGER        NOT NULL,
  "productName"    VARCHAR(255)   NOT NULL,
  "description"    TEXT,
  "marketplace"    VARCHAR(50)    NOT NULL,
  "relevanceScore" INTEGER        NOT NULL DEFAULT 50,
  "affiliateLink"  TEXT           NOT NULL,
  "productUrl"     TEXT,
  "price"          NUMERIC(12, 2),
  "commission"     NUMERIC(5, 2),
  "imageUrl"       TEXT,
  "createdAt"      TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "recommended_products_agent_idx"
  ON "recommended_products" ("agentId");
CREATE INDEX IF NOT EXISTS "recommended_products_marketplace_idx"
  ON "recommended_products" ("marketplace");

-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "agent_skills_runtime" (
  "id"          SERIAL PRIMARY KEY,
  "agentId"     INTEGER        NOT NULL,
  "skillName"   VARCHAR(150)   NOT NULL,
  "description" TEXT,
  "status"      VARCHAR(20)    NOT NULL DEFAULT 'locked',
  "proficiency" INTEGER        NOT NULL DEFAULT 0,
  "cost"        INTEGER        NOT NULL DEFAULT 0,
  "acquiredAt"  TIMESTAMP,
  "createdAt"   TIMESTAMP      NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "agent_skills_runtime_agent_idx"
  ON "agent_skills_runtime" ("agentId");
CREATE INDEX IF NOT EXISTS "agent_skills_runtime_status_idx"
  ON "agent_skills_runtime" ("status");

-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS "agent_evolution_history" (
  "id"          SERIAL PRIMARY KEY,
  "agentId"     INTEGER       NOT NULL,
  "eventType"   VARCHAR(80)   NOT NULL,
  "description" TEXT,
  "createdAt"   TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "agent_evolution_history_agent_idx"
  ON "agent_evolution_history" ("agentId");
CREATE INDEX IF NOT EXISTS "agent_evolution_history_created_idx"
  ON "agent_evolution_history" ("createdAt");
