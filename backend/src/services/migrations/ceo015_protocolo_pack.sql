/**
 * Migration: Cria tabelas para Protocolo_Pack sync (CEO-015)
 * 
 * Tabelas:
 * - user_pack_access: Access flags (academia, lab_nexus, lib_nexus, hall_socios, vip)
 * - pne_sisu_subaccounts: Tracking de sub-contas sustentáveis
 * - user_monthly_activation: Config e status de ativação mensal
 */

-- 1) user_pack_access: flags de acesso por tipo de recurso
CREATE TABLE IF NOT EXISTS user_pack_access (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pack_slug VARCHAR(100) NOT NULL,
  access_type VARCHAR(50) NOT NULL,
  access_level VARCHAR(50),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, access_type)
);
CREATE INDEX IF NOT EXISTS idx_upa_user ON user_pack_access(user_id);
CREATE INDEX IF NOT EXISTS idx_upa_type ON user_pack_access(access_type);

-- 2) pne_sisu_subaccounts: tracking de sub-contas PNE (Pack A² SiSu)
CREATE TABLE IF NOT EXISTS pne_sisu_subaccounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pack_slug VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'allocated',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pack_slug)
);
CREATE INDEX IF NOT EXISTS idx_pne_user ON pne_sisu_subaccounts(user_id);

-- 3) user_monthly_activation: config e status de ativação mensal
CREATE TABLE IF NOT EXISTS user_monthly_activation (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pack_slug VARCHAR(100) NOT NULL,
  cycle_label VARCHAR(50) NOT NULL,
  cost_cents INTEGER NOT NULL DEFAULT 0,
  packs_compensation INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'configured',
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cycle_label)
);
CREATE INDEX IF NOT EXISTS idx_uma_user ON user_monthly_activation(user_id);
CREATE INDEX IF NOT EXISTS idx_uma_cycle ON user_monthly_activation(cycle_label);

-- 4) Garantir coluna prompt_level na tabela agents (para Skills delivery)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agents' AND column_name = 'prompt_level'
  ) THEN
    ALTER TABLE agents ADD COLUMN prompt_level VARCHAR(50) DEFAULT 'basic';
  END IF;
END $$;

-- 5) Garantir coluna source na tabela agent_skills (para rastrear origem)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agent_skills' AND column_name = 'source'
  ) THEN
    ALTER TABLE agent_skills ADD COLUMN source VARCHAR(50) DEFAULT 'manual';
  END IF;
END $$;

-- 6) xp_transactions: log de transações XP (se não existe)
CREATE TABLE IF NOT EXISTS xp_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  source_type VARCHAR(50) NOT NULL,
  source_ref VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_xpt_user ON xp_transactions(user_id);
