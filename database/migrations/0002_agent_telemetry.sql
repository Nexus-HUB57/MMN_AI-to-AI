-- Migration · Telemetria persistida de execuções de skills
-- Compatível com Postgres (Render). Drizzle pode regenerar via `db:push`.
-- =============================================================================

CREATE TABLE IF NOT EXISTS "agent_telemetry" (
  "id"              VARCHAR(64)   PRIMARY KEY,
  "skill"           VARCHAR(80)   NOT NULL,
  "decision"        VARCHAR(20)   NOT NULL,
  "success"         BOOLEAN       NOT NULL,
  "latencyMs"       INTEGER       NOT NULL,
  "channel"         VARCHAR(40),
  "warningsCount"   INTEGER       NOT NULL DEFAULT 0,
  "judgeScore"      INTEGER,
  "judgeVerdict"    VARCHAR(12),
  "metadata"        JSONB,
  "occurredAt"      TIMESTAMP     NOT NULL DEFAULT NOW(),
  "createdAt"       TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "agent_telemetry_skill_idx"      ON "agent_telemetry" ("skill");
CREATE INDEX IF NOT EXISTS "agent_telemetry_decision_idx"   ON "agent_telemetry" ("decision");
CREATE INDEX IF NOT EXISTS "agent_telemetry_occurredAt_idx" ON "agent_telemetry" ("occurredAt");
