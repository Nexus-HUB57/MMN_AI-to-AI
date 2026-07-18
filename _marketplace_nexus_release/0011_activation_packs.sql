-- =============================================================================
-- Migration 0011 — Activation Packs (catálogo dos 15 Packs Nexus)
-- Cria as tabelas activation_packs e pack_activations conforme schema-packs.ts.
-- =============================================================================

CREATE TABLE IF NOT EXISTS "activation_packs" (
  "id"                 SERIAL PRIMARY KEY,
  "code"               VARCHAR(50)  NOT NULL UNIQUE,
  "name"               VARCHAR(255) NOT NULL,
  "description"        TEXT,
  "type"               VARCHAR(20)  NOT NULL,
  "price"              INTEGER      NOT NULL DEFAULT 0,
  "originalPrice"      INTEGER      NOT NULL DEFAULT 0,
  "activation_type"    VARCHAR(20)  NOT NULL DEFAULT 'instant',
  "trial_days"         INTEGER      DEFAULT 0,
  "status"             VARCHAR(20)  NOT NULL DEFAULT 'available',
  "benefits"           JSONB,
  "requires_pack_id"   INTEGER,
  "max_purchases"      INTEGER      DEFAULT 1,
  "sort_order"         INTEGER      NOT NULL DEFAULT 0,
  "icon"               VARCHAR(50),
  "color"              VARCHAR(20),
  "valid_from"         TIMESTAMP,
  "valid_until"        TIMESTAMP,
  "created_at"         TIMESTAMP    NOT NULL DEFAULT NOW(),
  "updated_at"         TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "activation_pack_type_idx"   ON "activation_packs" ("type");
CREATE INDEX IF NOT EXISTS "activation_pack_status_idx" ON "activation_packs" ("status");
CREATE INDEX IF NOT EXISTS "activation_pack_sort_idx"   ON "activation_packs" ("sort_order");

CREATE TABLE IF NOT EXISTS "pack_activations" (
  "id"                       SERIAL PRIMARY KEY,
  "affiliate_id"             INTEGER     NOT NULL,
  "pack_id"                  INTEGER     NOT NULL,
  "status"                   VARCHAR(20) NOT NULL DEFAULT 'pending',
  "payment_id"               VARCHAR(64),
  "payment_method"           VARCHAR(50),
  "transaction_id"           VARCHAR(128),
  "amount_paid"              INTEGER     NOT NULL DEFAULT 0,
  "currency"                 VARCHAR(3)  DEFAULT 'BRL',
  "activated_at"             TIMESTAMP,
  "expires_at"               TIMESTAMP,
  "is_recurring"             BOOLEAN     DEFAULT FALSE,
  "billing_cycle"            VARCHAR(20) DEFAULT 'monthly',
  "next_billing_date"        TIMESTAMP,
  "auto_renew"               BOOLEAN     DEFAULT TRUE,
  "qualifies_for_bonuses"    BOOLEAN     DEFAULT FALSE,
  "bonus_qualification_date" TIMESTAMP,
  "metadata"                 JSONB,
  "notes"                    TEXT,
  "created_at"               TIMESTAMP   NOT NULL DEFAULT NOW(),
  "updated_at"               TIMESTAMP   NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS "pack_activation_affiliate_idx" ON "pack_activations" ("affiliate_id");
CREATE INDEX IF NOT EXISTS "pack_activation_pack_idx"      ON "pack_activations" ("pack_id");
CREATE INDEX IF NOT EXISTS "pack_activation_status_idx"    ON "pack_activations" ("status");
CREATE INDEX IF NOT EXISTS "pack_activation_expires_idx"   ON "pack_activations" ("expires_at");

-- =====================================================================
-- SEED dos 15 Packs Nexus (carreira completa)
-- Custo público e benefícios mínimos. Atualizável depois via UI admin.
-- =====================================================================

INSERT INTO "activation_packs" (
  "code", "name", "description", "type", "price", "originalPrice",
  "activation_type", "status", "benefits", "sort_order", "color", "icon"
) VALUES
  -- Afiliado (3)
  ('pack-a2', 'Pack Agente Afiliado A²', 'Ativação do Agente IA essencial + 2 Skills Nível I + 10 e-books revenda', 'affiliate', 1000, 1500, 'instant', 'active',
    '{"xpBonus":1000,"commissionBonus":0,"agentSlots":1,"aiCredits":1000,"features":["agent_basic","ebooks_pool"],"maxNetworkDepth":1,"accessLevel":"basico"}'::jsonb, 1, '#22c55e', 'shield'),
  ('pack-a2ii', 'Pack Agente Afiliado A²II', 'Upgrade A²II — amplia frente de vendas + 3 Skills + 30 e-books', 'affiliate', 3000, 4500, 'instant', 'active',
    '{"xpBonus":5000,"commissionBonus":2,"agentSlots":1,"aiCredits":3000,"features":["agent_basic","ebooks_pool","sisu_a2"],"maxNetworkDepth":2,"accessLevel":"basico"}'::jsonb, 2, '#10b981', 'shield-check'),
  ('pack-a2iii', 'Pack Agente Afiliado A²III', 'Upgrade A²III — destaque na rede direta + benefícios premium', 'affiliate', 6000, 9000, 'instant', 'active',
    '{"xpBonus":12000,"commissionBonus":4,"agentSlots":2,"aiCredits":8000,"features":["agent_basic","ebooks_pool","sisu_a2","premium_support"],"maxNetworkDepth":3,"accessLevel":"intermediario"}'::jsonb, 3, '#06b6d4', 'shield-star'),

  -- Predictive SCC (3)
  ('pack-ag', 'Pack Escala Comercial AG', 'Pack AG — entrada profissional comercial + previsibilidade', 'predictive', 12000, 18000, 'instant', 'active',
    '{"xpBonus":25000,"commissionBonus":6,"agentSlots":3,"aiCredits":20000,"features":["agent_pro","ebooks_full","analytics_basic"],"maxNetworkDepth":5,"accessLevel":"intermediario"}'::jsonb, 4, '#3b82f6', 'trending-up'),
  ('pack-agii', 'Pack Escala Comercial AGII', 'Pack AGII — mais alcance e potência de vendas', 'predictive', 25000, 35000, 'instant', 'active',
    '{"xpBonus":50000,"commissionBonus":8,"agentSlots":4,"aiCredits":40000,"features":["agent_pro","ebooks_full","analytics_pro"],"maxNetworkDepth":7,"accessLevel":"intermediario"}'::jsonb, 5, '#2563eb', 'trending-up'),
  ('pack-agiii', 'Pack Escala Comercial AGIII', 'Pack AGIII — consolida expansão e margem comercial', 'predictive', 50000, 70000, 'instant', 'active',
    '{"xpBonus":100000,"commissionBonus":10,"agentSlots":5,"aiCredits":80000,"features":["agent_pro","ebooks_full","analytics_pro","priority_support"],"maxNetworkDepth":10,"accessLevel":"avancado"}'::jsonb, 6, '#1d4ed8', 'trending-up'),

  -- Generative SCC (3)
  ('pack-agn', 'Pack Criação Estratégica AGN', 'Pack AGN — fase de criação e escala profissional', 'generative', 80000, 110000, 'instant', 'active',
    '{"xpBonus":200000,"commissionBonus":12,"agentSlots":6,"aiCredits":150000,"features":["agent_advanced","creative_studio"],"maxNetworkDepth":15,"accessLevel":"avancado"}'::jsonb, 7, '#a855f7', 'sparkles'),
  ('pack-agnii', 'Pack Criação Estratégica AGNII', 'Pack AGNII — amplia produção, distribuição e ganhos', 'generative', 150000, 200000, 'instant', 'active',
    '{"xpBonus":400000,"commissionBonus":14,"agentSlots":8,"aiCredits":300000,"features":["agent_advanced","creative_studio","distribution_pro"],"maxNetworkDepth":20,"accessLevel":"avancado"}'::jsonb, 8, '#9333ea', 'sparkles'),
  ('pack-agniii', 'Pack Criação Estratégica AGNIII', 'Pack AGNIII — patamar de liderança criativa', 'generative', 300000, 400000, 'instant', 'active',
    '{"xpBonus":800000,"commissionBonus":16,"agentSlots":10,"aiCredits":600000,"features":["agent_advanced","creative_studio","distribution_pro","brand_studio"],"maxNetworkDepth":30,"accessLevel":"avancado"}'::jsonb, 9, '#7e22ce', 'sparkles'),

  -- Orchestrator SCC (3)
  ('pack-ao', 'Pack Orquestração AO', 'Pack AO — coordena múltiplas frentes e amplia estrutura', 'orchestrator', 500000, 700000, 'instant', 'active',
    '{"xpBonus":1500000,"commissionBonus":18,"agentSlots":15,"aiCredits":1000000,"features":["agent_orchestrator","multi_brand"],"maxNetworkDepth":50,"accessLevel":"avancado"}'::jsonb, 10, '#f59e0b', 'layout-grid'),
  ('pack-aoii', 'Pack Orquestração AOII', 'Pack AOII — organiza operação maior com mais controle e escala', 'orchestrator', 900000, 1200000, 'instant', 'active',
    '{"xpBonus":3000000,"commissionBonus":20,"agentSlots":20,"aiCredits":2000000,"features":["agent_orchestrator","multi_brand","holding_tools"],"maxNetworkDepth":100,"accessLevel":"avancado"}'::jsonb, 11, '#d97706', 'layout-grid'),
  ('pack-aoiii', 'Pack Orquestração AOIII', 'Pack AOIII — coordenação completa nível enterprise', 'orchestrator', 1500000, 2000000, 'instant', 'active',
    '{"xpBonus":6000000,"commissionBonus":22,"agentSlots":30,"aiCredits":4000000,"features":["agent_orchestrator","multi_brand","holding_tools","enterprise_support"],"maxNetworkDepth":250,"accessLevel":"avancado"}'::jsonb, 12, '#b45309', 'layout-grid'),

  -- Agentic IA SCC+ (3)
  ('pack-aa', 'Pack Liderança Estratégica AA', 'Pack AA — entrada em camada de benefícios e visão estratégica', 'agentic', 2500000, 3500000, 'instant', 'active',
    '{"xpBonus":12000000,"commissionBonus":25,"agentSlots":50,"aiCredits":8000000,"features":["agent_agentic","strategic_access"],"maxNetworkDepth":500,"accessLevel":"avancado"}'::jsonb, 13, '#ef4444', 'crown'),
  ('pack-aaii', 'Pack Liderança Estratégica AAII', 'Pack AAII — receitas especiais e vantagens recorrentes', 'agentic', 5000000, 7000000, 'instant', 'active',
    '{"xpBonus":25000000,"commissionBonus":28,"agentSlots":100,"aiCredits":20000000,"features":["agent_agentic","strategic_access","revenue_share"],"maxNetworkDepth":1000,"accessLevel":"avancado"}'::jsonb, 14, '#dc2626', 'crown'),
  ('pack-aaiii', 'Pack Liderança Estratégica AAIII', 'Pack AAIII — acesso completo ao ecossistema + benefícios máximos', 'agentic', 10000000, 14000000, 'instant', 'active',
    '{"xpBonus":50000000,"commissionBonus":30,"agentSlots":250,"aiCredits":50000000,"features":["agent_agentic","strategic_access","revenue_share","ecosystem_full"],"maxNetworkDepth":-1,"accessLevel":"avancado"}'::jsonb, 15, '#b91c1c', 'crown')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  "originalPrice" = EXCLUDED."originalPrice",
  benefits = EXCLUDED.benefits,
  sort_order = EXCLUDED.sort_order,
  status = 'active',
  updated_at = NOW();
