-- Pack Grants — rastreamento idempotente de entrega de packs/upgrades.

CREATE TABLE IF NOT EXISTS marketplace_pack_grants (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL,
  pack_slug       VARCHAR(80) NOT NULL,
  order_id        VARCHAR(80),
  payment_ref     VARCHAR(255),
  payment_method  VARCHAR(40),
  amount_cents    INTEGER,
  delivered_count INTEGER NOT NULL DEFAULT 0,
  pool_size       INTEGER NOT NULL DEFAULT 0,
  status          VARCHAR(20) NOT NULL DEFAULT 'granted',  -- granted/redelivered/voided
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMP NOT NULL DEFAULT now(),
  updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pack_grants_user
  ON marketplace_pack_grants(user_id);

CREATE INDEX IF NOT EXISTS idx_pack_grants_pack
  ON marketplace_pack_grants(pack_slug);

-- Idempotência forte: um pagamento (ref) por usuário/pack só gera 1 grant
CREATE UNIQUE INDEX IF NOT EXISTS uniq_pack_grants_user_pack_payment
  ON marketplace_pack_grants(user_id, pack_slug, payment_ref)
  WHERE payment_ref IS NOT NULL;

-- Verifica
SELECT
  'marketplace_pack_grants' AS table_name,
  (SELECT COUNT(*) FROM marketplace_pack_grants) AS row_count,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name='marketplace_pack_grants') AS column_count;
