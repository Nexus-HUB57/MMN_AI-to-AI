-- Onda 19: Bugs visuais + Rede binária + Custódia BTC + Anti-recompra
-- =============================================================================

-- 1. btc_deposits — histórico de aportes com hash
CREATE TABLE IF NOT EXISTS btc_deposits (
  id                     SERIAL PRIMARY KEY,
  user_id                INTEGER NOT NULL,
  amount_brl_cents       INTEGER NOT NULL CHECK (amount_brl_cents > 0),
  amount_btc             NUMERIC(18, 8) NOT NULL,
  btc_quote_brl          NUMERIC(14, 2) NOT NULL,
  custody_address        VARCHAR(128) NOT NULL,
  network                VARCHAR(32)  DEFAULT 'BTC',
  tx_hash                VARCHAR(80),
  status                 VARCHAR(32)  NOT NULL DEFAULT 'awaiting_hash',
    -- awaiting_hash | pending_confirmation | confirmed | failed | cancelled
  hash_submitted_at      TIMESTAMPTZ,
  confirmed_at           TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS btc_deposits_user_idx    ON btc_deposits(user_id);
CREATE INDEX IF NOT EXISTS btc_deposits_status_idx  ON btc_deposits(status);
CREATE INDEX IF NOT EXISTS btc_deposits_hash_idx    ON btc_deposits(tx_hash);

-- 2. Garantir que activation_packs tem o Pack A2 registrado
INSERT INTO activation_packs (code, name, description, type, price, activation_type, status, sort_order)
VALUES
  ('A2', 'Pack Agente Afiliado A2',
   'Pack de entrada. Ativa seu Agente IA, libera o primeiro catalogo e fica disponivel assim que o cadastro e concluido.',
   'entry', 1000, 'instant', 'available', 1)
ON CONFLICT (code) DO NOTHING;

-- 3. Garantir integridade da network table
CREATE UNIQUE INDEX IF NOT EXISTS network_parent_child_unique_idx
  ON network(parent_affiliate_id, child_affiliate_id, level);

-- 4. Registrar Onda 19 na memoria operacional
INSERT INTO niko_operational_memory (subject, summary, autonomy_level, metadata, created_at)
VALUES (
  'onda-19-bugs-visuais-e-custodia-btc',
  'Bugs visuais corrigidos: Network real com luzes, Payments com custodia Binance+hash, PixCheckout com gate anti-recompra Pack A2.',
  'ADAPTATIVO',
  '{"fixes":["network-real","btc-custody-flow","packA2-gate","dashboard-lights"]}'::jsonb,
  NOW()
) ON CONFLICT DO NOTHING;
