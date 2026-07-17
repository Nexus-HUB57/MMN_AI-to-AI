-- ONDA 8 · Go-Live Foundations
-- Objetivo: persistência de settings, feed de meetings, trilha de auditoria,
-- isolamento de dados de teste e correção do admin canônico.
-- Segurança: este arquivo NÃO apaga transações reais. A limpeza é explicitamente
-- acionada pelo endpoint administrativo controlado, sempre filtrando is_test_data.

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_test_data BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS is_test_data BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS is_test_data BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS is_test_data BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS platform_settings (
  setting_key TEXT PRIMARY KEY,
  setting_value JSONB NOT NULL,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_audit_events (
  id BIGSERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  actor_email TEXT,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_admin_audit_events_created_at ON admin_audit_events(created_at DESC);

CREATE TABLE IF NOT EXISTS meeting_threads (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'archived')),
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS meeting_messages (
  id BIGSERIAL PRIMARY KEY,
  thread_id BIGINT NOT NULL REFERENCES meeting_threads(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  body TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'note' CHECK (kind IN ('note', 'decision', 'action', 'signal')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_meeting_messages_thread_created ON meeting_messages(thread_id, created_at ASC);

-- Correção de autoridade administrativa: apenas o e-mail canônico é elevado.
-- A conta pessoal alternativa permanece usuária comum, preservando cadastro e histórico.
UPDATE users
SET role = 'admin', "updatedAt" = NOW()
WHERE lower(coalesce(email, '')) = 'lucasmpthomaz@gmail.com';

UPDATE users
SET role = 'user', "updatedAt" = NOW()
WHERE lower(coalesce(email, '')) = 'lucasmpthomaz2@gmail.com'
  AND role = 'admin';

INSERT INTO platform_settings (setting_key, setting_value, updated_by)
VALUES (
  'go_live',
  '{
    "platformName":"Nexus SaaS · IOAID",
    "supportEmail":"suporte@nexus-saas.com.br",
    "maxNetworkDepth":5,
    "compressionEnabled":true,
    "matrix":{"maxDirectsPerNode":2,"maxDepth":5,"compressionEnabled":true},
    "commissionLevels":[
      {"level":1,"percentage":20,"label":"1º Nível","description":"20% N.O 1º Nível"},
      {"level":2,"percentage":10,"label":"2º Nível","description":"10% N.O 2º Nível"},
      {"level":3,"percentage":5,"label":"3º Nível","description":"5% N.O 3º Nível"},
      {"level":4,"percentage":2.5,"label":"4º Nível","description":"2,5% N.O 4º Nível"},
      {"level":5,"percentage":1,"label":"5º Nível","description":"1% N.O 5º Nível"}
    ]
  }'::jsonb,
  'onda8-bootstrap'
)
ON CONFLICT (setting_key) DO NOTHING;

COMMIT;
