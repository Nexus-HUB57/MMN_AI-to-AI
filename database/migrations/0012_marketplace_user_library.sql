-- =============================================================================
-- Migration 0012 · Marketplace Nexus — biblioteca do usuário + catálogo
-- =============================================================================
-- Engine: PostgreSQL >= 13.
-- Idempotente: usa IF NOT EXISTS.
-- Pareada a backend/src/domains/marketplace/userLibraryService.ts.
--
-- Tabelas:
--   - marketplace_ebooks       : catálogo canônico (132 ebooks publicados)
--   - marketplace_carts        : carrinho ativo por usuário
--   - marketplace_cart_items   : itens do carrinho (ebook | pack)
--   - marketplace_orders       : ordens de compra
--   - marketplace_order_items  : itens da ordem (ebook | pack)
--   - marketplace_user_library : entitlements (ebooks adquiridos)
--   - marketplace_pack_drawings: histórico de sorteios de packs
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1) Catálogo
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS marketplace_ebooks (
  slug              VARCHAR(64) PRIMARY KEY,
  "order"           INTEGER NOT NULL,
  title             TEXT NOT NULL,
  subtitle          TEXT,
  description       TEXT,
  cost_cents        INTEGER NOT NULL DEFAULT 50,
  resale_price_cents INTEGER NOT NULL DEFAULT 99,
  pages             INTEGER NOT NULL DEFAULT 18,
  category          TEXT,
  cover_gradient    TEXT,
  html_path         TEXT,
  pdf_path          TEXT,
  cover_path        TEXT,
  highlights        TEXT[],
  unlock_pack_slug  VARCHAR(64),
  status            VARCHAR(16) NOT NULL DEFAULT 'active',
  collection_rank   INTEGER,
  source_markdown   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS marketplace_ebooks_pack_idx
  ON marketplace_ebooks(unlock_pack_slug);
CREATE INDEX IF NOT EXISTS marketplace_ebooks_status_idx
  ON marketplace_ebooks(status);

-- ---------------------------------------------------------------------------
-- 2) Carrinho
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS marketplace_carts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     VARCHAR(64) NOT NULL,
  status      VARCHAR(16) NOT NULL DEFAULT 'active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS marketplace_carts_user_idx
  ON marketplace_carts(user_id, status);

CREATE TABLE IF NOT EXISTS marketplace_cart_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id         UUID NOT NULL REFERENCES marketplace_carts(id) ON DELETE CASCADE,
  item_type       VARCHAR(16) NOT NULL,
  item_slug       VARCHAR(64) NOT NULL,
  title           TEXT NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, item_type, item_slug)
);

CREATE INDEX IF NOT EXISTS marketplace_cart_items_cart_idx
  ON marketplace_cart_items(cart_id);

-- ---------------------------------------------------------------------------
-- 3) Ordens
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         VARCHAR(64) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending',
  total_cents     INTEGER NOT NULL,
  payment_id      VARCHAR(128),
  payment_method  VARCHAR(32),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at         TIMESTAMPTZ,
  delivered_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS marketplace_orders_user_idx
  ON marketplace_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS marketplace_orders_status_idx
  ON marketplace_orders(status);

CREATE TABLE IF NOT EXISTS marketplace_order_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        UUID NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  item_type       VARCHAR(16) NOT NULL,
  item_slug       VARCHAR(64) NOT NULL,
  title           TEXT NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  quantity        INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS marketplace_order_items_order_idx
  ON marketplace_order_items(order_id);

-- ---------------------------------------------------------------------------
-- 4) Biblioteca do usuário
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS marketplace_user_library (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           VARCHAR(64) NOT NULL,
  ebook_slug        VARCHAR(64) NOT NULL REFERENCES marketplace_ebooks(slug),
  source_type       VARCHAR(16) NOT NULL,
  source_pack_slug  VARCHAR(64),
  source_order_id   UUID REFERENCES marketplace_orders(id) ON DELETE SET NULL,
  acquired_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, ebook_slug)
);

CREATE INDEX IF NOT EXISTS marketplace_user_library_user_idx
  ON marketplace_user_library(user_id, acquired_at DESC);

-- ---------------------------------------------------------------------------
-- 5) Sorteios de pack
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS marketplace_pack_drawings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         VARCHAR(64) NOT NULL,
  order_id        UUID REFERENCES marketplace_orders(id) ON DELETE SET NULL,
  pack_slug       VARCHAR(64) NOT NULL,
  drawn_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ebook_slugs     TEXT[] NOT NULL,
  rng_seed        VARCHAR(64)
);

CREATE INDEX IF NOT EXISTS marketplace_pack_drawings_user_idx
  ON marketplace_pack_drawings(user_id, drawn_at DESC);

COMMIT;
