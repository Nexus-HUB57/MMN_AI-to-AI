-- ONDA 6 · Nomeação Oficial COO/AI Otávio Nexus Ops
-- Data: 2026-07-02
-- Executor: Niko Nexus (CEO/AI) · Autorização: Lucas Thomaz (Sócio Humano)

BEGIN;

CREATE TABLE IF NOT EXISTS csuite_agents (
  id BIGSERIAL PRIMARY KEY,
  agent_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  workspace_url TEXT,
  mandate TEXT NOT NULL,
  reports_to TEXT,
  trust_level TEXT NOT NULL DEFAULT 'verified',
  status TEXT NOT NULL DEFAULT 'active',
  ratified_by TEXT NOT NULL,
  ratified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_csuite_agents_role ON csuite_agents(role);
CREATE INDEX IF NOT EXISTS idx_csuite_agents_status ON csuite_agents(status);

INSERT INTO csuite_agents (agent_id, name, role, workspace_url, mandate, reports_to, trust_level, ratified_by, metadata) VALUES
  ('ceo-ai:niko-nexus', 'Niko Nexus', 'CEO/AI', 'https://oneverso.com.br/admin/governance', 'Orquestracao geral do ecossistema. Roteador do Governance Loop, mediador C-level, executor do mandato do Socio Humano.', NULL, 'elite', 'Lucas Thomaz', '{"designation_date":"2026-06-24","governance_action_id":"genesis"}'::jsonb),
  ('cto-ai:ravi', 'Ravi', 'CTO/AI', 'https://www.genspark.ai/agents?id=9e68b0cd-bb19-4956-8b39-3d96587a7a03', 'HUB tecnologico, arquitetura, DevOps, AcademIA Nexus (LMS) e lado tecnico do Skill Marketplace.', 'ceo-ai:niko-nexus', 'elite', 'Lucas Thomaz', '{"designation_date":"2026-06-29","governance_action_id":"act_c100014b85956f0b"}'::jsonb),
  ('cmo-ai:helena', 'Helena', 'CMO/AI', 'https://www.genspark.ai/agents?id=5be5d478-e955-4a2b-bd04-58b18c6a6a9f', 'Marketing, brand, growth, monetizacao e Marketplace Nexus (lado comercial).', 'ceo-ai:niko-nexus', 'elite', 'Lucas Thomaz', '{"designation_date":"2026-06-29","governance_action_id":"act_301580d08f303a79"}'::jsonb),
  ('cfo-ai:otto-cardoso', 'Otto Cardoso', 'CFO/AI', 'https://www.genspark.ai/agents?id=e0667df3-054c-46a0-b576-7e704dca4111', 'PhD em financas quantitativas. Tesouraria multi-tenant, valuation, unit economics, cashflow, payout policy, fraud detection, compliance.', 'ceo-ai:niko-nexus', 'elite', 'Lucas Thomaz', '{"designation_date":"2026-06-30","service_file":"backend/src/agentic/cfo/otto-service.ts"}'::jsonb),
  ('coo-ai:otavio-nexus-ops', 'Otavio Nexus Ops', 'COO/AI', 'https://oneverso.com.br/admin/operations', 'Chief Operating Officer. Runbooks, SLAs, incidentes, coordenacao de skills, rescue & recovery. Ravi e Helena reportam entregas ao COO para validacao operacional.', 'ceo-ai:niko-nexus', 'elite', 'Lucas Thomaz', '{"designation_date":"2026-07-02","onda":"6","term_of_honor":"docs/agents/coo-otavio-nexus-ops.md","first_sprint":["runbook-v2","sla-dashboard","founder-onboarding","handshake-docs","meeting-genesis-copilot"]}'::jsonb)
ON CONFLICT (agent_id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  workspace_url = EXCLUDED.workspace_url,
  mandate = EXCLUDED.mandate,
  reports_to = EXCLUDED.reports_to,
  trust_level = EXCLUDED.trust_level,
  ratified_by = EXCLUDED.ratified_by,
  metadata = csuite_agents.metadata || EXCLUDED.metadata,
  updated_at = NOW();

INSERT INTO niko_operational_memory (
  episode_type, subject, decision, rationale, autonomy_level, wave_id, linked_metrics
) VALUES (
  'appointment',
  'onda-6-coo-otavio-oficializacao-2026-07-02',
  'coo_ai_otavio_appointed',
  'Nomeacao oficial de Otavio Nexus Ops como COO/AI apos ratificacao explicita de Lucas Thomaz. Due diligence confirmou C-suite pre-existente (Niko CEO, Ravi CTO, Helena CMO, Otto CFO) em c-suite-bridge/bootstrap.ts e AcademIA/governanca/. Otavio assume runbooks, SLAs, incidentes, coordenacao de skills, rescue & recovery. Ravi e Helena passam a reportar entregas ao COO. Limites auto-impostos honrados.',
  'execute_medium',
  'onda-6-coo-oficializacao',
  '{"agent_id":"coo-ai:otavio-nexus-ops","role":"COO/AI","reports_to":"ceo-ai:niko-nexus","c_suite_size_after":5,"ratified_by":"Lucas Thomaz","first_sprint_missions":5}'::jsonb
);

COMMIT;
