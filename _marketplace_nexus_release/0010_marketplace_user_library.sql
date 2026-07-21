-- =============================================================================
-- Migration 0010 — Marketplace Nexus: Loja Virtual, Carrinho, Checkout,
-- Estoque por usuário (biblioteca) e Alocação aleatória de ebooks por Pack.
--
-- Catálogo: 132 ebooks consolidados em frontend/src/lib/generated-marketplace-ebooks.ts
-- Custo (afiliado): R$ 0,50  ·  Preço público (consumidor): R$ 0,99
-- Margem afiliado: R$ 0,49 (~98%).
--
-- Modelo híbrido: coleção temática como rótulo (`category`) + biblioteca de pack
-- como gate de acesso (`unlock_pack_slug`).
-- =============================================================================

-- 1) Catálogo mestre de e-books (espelha generated-marketplace-ebooks.ts)
CREATE TABLE IF NOT EXISTS marketplace_ebooks (
    slug                 VARCHAR(180) PRIMARY KEY,
    "order"              INTEGER NOT NULL,
    title                VARCHAR(255) NOT NULL,
    subtitle             VARCHAR(255),
    description          TEXT,
    cost_cents           INTEGER NOT NULL DEFAULT 50,
    resale_price_cents   INTEGER NOT NULL DEFAULT 99,
    pages                INTEGER NOT NULL DEFAULT 18,
    category             VARCHAR(160) NOT NULL,
    cover_gradient       VARCHAR(120),
    html_path            VARCHAR(255) NOT NULL,
    pdf_path             VARCHAR(255) NOT NULL,
    cover_path           VARCHAR(255),
    highlights           JSONB NOT NULL DEFAULT '[]'::jsonb,
    source_markdown      VARCHAR(255),
    unlock_pack_slug     VARCHAR(40) NOT NULL,
    status               VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at           TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_ebooks_pack    ON marketplace_ebooks (unlock_pack_slug);
CREATE INDEX IF NOT EXISTS idx_marketplace_ebooks_category ON marketplace_ebooks (category);
CREATE INDEX IF NOT EXISTS idx_marketplace_ebooks_status  ON marketplace_ebooks (status);
CREATE INDEX IF NOT EXISTS idx_marketplace_ebooks_order   ON marketplace_ebooks ("order");

-- 2) Carrinho do usuário (loja virtual)
CREATE TABLE IF NOT EXISTS marketplace_carts (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'open', -- open | checkout | abandoned | converted
    currency     VARCHAR(3)  NOT NULL DEFAULT 'BRL',
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_marketplace_carts_user ON marketplace_carts (user_id, status);

CREATE TABLE IF NOT EXISTS marketplace_cart_items (
    id                  SERIAL PRIMARY KEY,
    cart_id             INTEGER NOT NULL REFERENCES marketplace_carts(id) ON DELETE CASCADE,
    item_type           VARCHAR(20) NOT NULL,           -- ebook | pack | bundle
    item_slug           VARCHAR(180) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    unit_price_cents    INTEGER NOT NULL,
    quantity            INTEGER NOT NULL DEFAULT 1,
    metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON marketplace_cart_items (cart_id);

-- 3) Pedidos (orders) + itens
CREATE TABLE IF NOT EXISTS marketplace_orders (
    id                  VARCHAR(36) PRIMARY KEY,
    user_id             INTEGER NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
        -- pending | paid | delivered | cancelled | refunded | failed
    subtotal_cents      INTEGER NOT NULL DEFAULT 0,
    discount_cents      INTEGER NOT NULL DEFAULT 0,
    total_cents         INTEGER NOT NULL DEFAULT 0,
    payment_method      VARCHAR(20),  -- pix | credit_card | mercado_pago | boleto
    payment_id          VARCHAR(128),
    payment_status      VARCHAR(20) NOT NULL DEFAULT 'pending',
    external_reference  VARCHAR(180),
    metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
    paid_at             TIMESTAMP,
    delivered_at        TIMESTAMP,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_user ON marketplace_orders (user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_status ON marketplace_orders (status);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_pay ON marketplace_orders (payment_id);

CREATE TABLE IF NOT EXISTS marketplace_order_items (
    id                  SERIAL PRIMARY KEY,
    order_id            VARCHAR(36) NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
    item_type           VARCHAR(20) NOT NULL,
    item_slug           VARCHAR(180) NOT NULL,
    title               VARCHAR(255) NOT NULL,
    unit_price_cents    INTEGER NOT NULL,
    quantity            INTEGER NOT NULL DEFAULT 1,
    -- Para item_type='pack', guarda quantos ebooks o pack libera:
    pack_ebook_quota    INTEGER,
    metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON marketplace_order_items (order_id);

-- 4) Biblioteca do usuário (estoque pessoal) — preenchida ao pagar
--    Quando o item adquirido é um Pack, o sistema sorteia aleatoriamente os
--    ebooks dentro do pool do pack (unlock_pack_slug) excluindo os que o usuário
--    já possui, gerando uma linha por ebook em marketplace_user_library.
CREATE TABLE IF NOT EXISTS marketplace_user_library (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL,
    ebook_slug          VARCHAR(180) NOT NULL,
    source_order_id     VARCHAR(36),
    source_type         VARCHAR(20) NOT NULL DEFAULT 'purchase',
        -- purchase | pack_random | gift | promotion
    source_pack_slug    VARCHAR(40),
    acquired_at         TIMESTAMP NOT NULL DEFAULT NOW(),
    delivered           BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_user_ebook UNIQUE (user_id, ebook_slug)
);
CREATE INDEX IF NOT EXISTS idx_user_library_user ON marketplace_user_library (user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_pack ON marketplace_user_library (source_pack_slug);

-- 5) Auditoria do sorteio aleatório por pack (compliance/transparência)
CREATE TABLE IF NOT EXISTS marketplace_pack_drawings (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER NOT NULL,
    order_id            VARCHAR(36) NOT NULL,
    pack_slug           VARCHAR(40) NOT NULL,
    pool_size           INTEGER NOT NULL,
    drawn_count         INTEGER NOT NULL,
    drawn_slugs         JSONB NOT NULL,        -- array de ebook_slug sorteados
    seed                VARCHAR(80) NOT NULL,  -- seed determinístico p/ auditoria
    created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pack_drawings_user ON marketplace_pack_drawings (user_id);
CREATE INDEX IF NOT EXISTS idx_pack_drawings_order ON marketplace_pack_drawings (order_id);
