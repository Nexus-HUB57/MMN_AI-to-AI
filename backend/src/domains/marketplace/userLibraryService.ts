/**
 * userLibraryService — Marketplace Nexus
 *
 * Lógica de:
 *  - Listar catálogo (132 ebooks + 15 packs)
 *  - Adicionar / remover do carrinho
 *  - Criar pedido a partir do carrinho
 *  - Entregar itens pagos (purchase entrega imediata; pack faz sorteio aleatório)
 *  - Listar biblioteca pessoal do usuário
 *  - Marcar pedido como pago (webhook ou checkout síncrono)
 *
 * Tabelas Postgres usadas (criadas em migrations 0010 e 0011):
 *   marketplace_ebooks, marketplace_carts, marketplace_cart_items,
 *   marketplace_orders, marketplace_order_items, marketplace_user_library,
 *   marketplace_pack_drawings, activation_packs
 */

import crypto from "crypto";
import { Pool, type PoolClient } from "pg";

let pool: Pool | null = null;
function getPool(): Pool {
  if (!pool) {
    const connStr = process.env.DATABASE_URL;
    if (!connStr) throw new Error("DATABASE_URL not configured");
    pool = new Pool({ connectionString: connStr, max: 10 });
  }
  return pool;
}

// -----------------------------------------------------------------------------
// Tipos públicos
// -----------------------------------------------------------------------------
export interface MarketplaceEbook {
  slug: string;
  order: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  costCents: number;
  resalePriceCents: number;
  pages: number;
  category: string;
  coverGradient: string | null;
  htmlPath: string;
  pdfPath: string;
  coverPath: string | null;
  highlights: string[];
  unlockPackSlug: string;
  status: string;
}

export interface NexusPackPublic {
  id: number;
  code: string;
  name: string;
  description: string | null;
  type: string;
  priceCents: number;
  originalPriceCents: number;
  benefits: Record<string, unknown> | null;
  sortOrder: number;
  color: string | null;
  icon: string | null;
  ebookPoolSize: number;
  ebookQuotaIfPurchased: number;
}

export interface CartLine {
  id: number;
  itemType: "ebook" | "pack";
  itemSlug: string;
  title: string;
  unitPriceCents: number;
  quantity: number;
}

export interface OrderSummary {
  id: string;
  status: string;
  totalCents: number;
  createdAt: string;
  paidAt: string | null;
}

// Quanto cada pack libera (sorteio aleatório do pool unlock_pack_slug)
const PACK_EBOOK_QUOTA: Record<string, number> = {
  "pack-a2": 10,
  "pack-a2ii": 30,
  "pack-a2iii": 50,
  "pack-ag": 80,
  "pack-agii": 100,
  "pack-agiii": 110,
  "pack-agn": 120,
  "pack-agnii": 125,
  "pack-agniii": 130,
  "pack-ao": 132,
  "pack-aoii": 132,
  "pack-aoiii": 132,
  "pack-aa": 132,
  "pack-aaii": 132,
  "pack-aaiii": 132,
};

// -----------------------------------------------------------------------------
// Catálogo
// -----------------------------------------------------------------------------
export async function listEbooks(opts: { unlockPackSlug?: string } = {}): Promise<MarketplaceEbook[]> {
  const client = await getPool().connect();
  try {
    const where = opts.unlockPackSlug
      ? `WHERE status='active' AND unlock_pack_slug=$1`
      : `WHERE status='active'`;
    const params = opts.unlockPackSlug ? [opts.unlockPackSlug] : [];
    const r = await client.query(
      `SELECT slug, "order", title, subtitle, description, cost_cents, resale_price_cents,
              pages, category, cover_gradient, html_path, pdf_path, cover_path, highlights,
              unlock_pack_slug, status, collection_rank
         FROM marketplace_ebooks ${where} ORDER BY collection_rank ASC NULLS LAST, "order" ASC`,
      params,
    );
    return r.rows.map((row) => ({
      slug: row.slug,
      order: row.order,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      costCents: row.cost_cents,
      resalePriceCents: row.resale_price_cents,
      pages: row.pages,
      category: row.category,
      coverGradient: row.cover_gradient,
      htmlPath: row.html_path,
      pdfPath: row.pdf_path,
      coverPath: row.cover_path,
      highlights: row.highlights ?? [],
      unlockPackSlug: row.unlock_pack_slug,
      status: row.status,
    }));
  } finally {
    client.release();
  }
}

export async function listPacksPublic(): Promise<NexusPackPublic[]> {
  const client = await getPool().connect();
  try {
    const r = await client.query(
      `SELECT id, code, name, description, type, price, "originalPrice", benefits,
              sort_order, color, icon
         FROM activation_packs
        WHERE status='active'
        ORDER BY sort_order ASC`,
    );
    const counts = await client.query(
      `SELECT unlock_pack_slug, COUNT(*)::int AS n
         FROM marketplace_ebooks WHERE status='active' GROUP BY unlock_pack_slug`,
    );
    const countMap = new Map<string, number>();
    counts.rows.forEach((c) => countMap.set(c.unlock_pack_slug, c.n));
    return r.rows.map((row) => ({
      id: row.id,
      code: row.code,
      name: row.name,
      description: row.description,
      type: row.type,
      priceCents: row.price,
      originalPriceCents: row.originalPrice,
      benefits: row.benefits,
      sortOrder: row.sort_order,
      color: row.color,
      icon: row.icon,
      ebookPoolSize: countMap.get(row.code) ?? 0,
      ebookQuotaIfPurchased: PACK_EBOOK_QUOTA[row.code] ?? 0,
    }));
  } finally {
    client.release();
  }
}

// -----------------------------------------------------------------------------
// Carrinho
// -----------------------------------------------------------------------------
async function ensureCart(client: PoolClient, userId: number): Promise<number> {
  const existing = await client.query(
    `SELECT id FROM marketplace_carts WHERE user_id=$1 AND status='active' LIMIT 1`,
    [userId],
  );
  if (existing.rows[0]) return existing.rows[0].id;
  const ins = await client.query(
    `INSERT INTO marketplace_carts (user_id, status) VALUES ($1, 'active') RETURNING id`,
    [userId],
  );
  return ins.rows[0].id;
}

export async function getCart(userId: number): Promise<{ id: number; lines: CartLine[]; totalCents: number }> {
  const client = await getPool().connect();
  try {
    const cartId = await ensureCart(client, userId);
    const r = await client.query(
      `SELECT id, item_type, item_slug, title, unit_price_cents, quantity
         FROM marketplace_cart_items
        WHERE cart_id=$1
        ORDER BY id ASC`,
      [cartId],
    );
    const lines: CartLine[] = r.rows.map((row) => ({
      id: row.id,
      itemType: row.item_type as "ebook" | "pack",
      itemSlug: row.item_slug,
      title: row.title,
      unitPriceCents: row.unit_price_cents,
      quantity: row.quantity,
    }));
    const totalCents = lines.reduce((s, l) => s + l.unitPriceCents * l.quantity, 0);
    return { id: cartId, lines, totalCents };
  } finally {
    client.release();
  }
}

export async function addToCart(
  userId: number,
  input: { itemType: "ebook" | "pack"; itemSlug: string },
): Promise<{ id: number; lines: CartLine[]; totalCents: number }> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const cartId = await ensureCart(client, userId);

    let title = "";
    let unitPriceCents = 0;
    if (input.itemType === "ebook") {
      const ebook = await client.query(
        `SELECT title, resale_price_cents FROM marketplace_ebooks WHERE slug=$1 AND status='active'`,
        [input.itemSlug],
      );
      if (!ebook.rows[0]) throw new Error("E-book não encontrado");
      title = ebook.rows[0].title;
      unitPriceCents = ebook.rows[0].resale_price_cents;
    } else {
      const pack = await client.query(
        `SELECT name, price FROM activation_packs WHERE code=$1 AND status='active'`,
        [input.itemSlug],
      );
      if (!pack.rows[0]) throw new Error("Pack não encontrado");
      title = pack.rows[0].name;
      unitPriceCents = pack.rows[0].price;
    }

    // Não duplicar a mesma linha — incrementar quantidade
    const existing = await client.query(
      `SELECT id, quantity FROM marketplace_cart_items
        WHERE cart_id=$1 AND item_type=$2 AND item_slug=$3`,
      [cartId, input.itemType, input.itemSlug],
    );
    if (existing.rows[0]) {
      // Para ebook/pack digital quantidade fixa = 1 (não acumula)
      await client.query(
        `UPDATE marketplace_cart_items SET quantity=1 WHERE id=$1`,
        [existing.rows[0].id],
      );
    } else {
      await client.query(
        `INSERT INTO marketplace_cart_items (cart_id, item_type, item_slug, title, unit_price_cents, quantity)
         VALUES ($1, $2, $3, $4, $5, 1)`,
        [cartId, input.itemType, input.itemSlug, title, unitPriceCents],
      );
    }
    await client.query("COMMIT");
    return getCart(userId);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function removeFromCart(userId: number, cartItemId: number) {
  const client = await getPool().connect();
  try {
    const r = await client.query(
      `DELETE FROM marketplace_cart_items
        WHERE id=$1 AND cart_id IN (SELECT id FROM marketplace_carts WHERE user_id=$2 AND status='active')`,
      [cartItemId, userId],
    );
    if (!r.rowCount) throw new Error("Item do carrinho não encontrado");
    return getCart(userId);
  } finally {
    client.release();
  }
}

export async function clearCart(userId: number) {
  const client = await getPool().connect();
  try {
    await client.query(
      `DELETE FROM marketplace_cart_items
        WHERE cart_id IN (SELECT id FROM marketplace_carts WHERE user_id=$1 AND status='active')`,
      [userId],
    );
    return getCart(userId);
  } finally {
    client.release();
  }
}

// -----------------------------------------------------------------------------
// Pedido + Entrega
// -----------------------------------------------------------------------------
function makeOrderId() {
  return crypto.randomUUID();
}

export async function createOrderFromCart(
  userId: number,
  paymentMethod: "pix" | "mercado_pago" | "credit_card" | "boleto" | "manual" = "pix",
): Promise<{ orderId: string; totalCents: number; status: string }> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const cart = await getCart(userId);
    if (!cart.lines.length) throw new Error("Carrinho vazio");

    const orderId = makeOrderId();
    await client.query(
      `INSERT INTO marketplace_orders (id, user_id, status, subtotal_cents, total_cents, payment_method, payment_status)
       VALUES ($1, $2, 'pending', $3, $3, $4, 'pending')`,
      [orderId, userId, cart.totalCents, paymentMethod],
    );
    for (const line of cart.lines) {
      const quota = line.itemType === "pack" ? PACK_EBOOK_QUOTA[line.itemSlug] ?? 0 : null;
      await client.query(
        `INSERT INTO marketplace_order_items
           (order_id, item_type, item_slug, title, unit_price_cents, quantity, pack_ebook_quota)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, line.itemType, line.itemSlug, line.title, line.unitPriceCents, line.quantity, quota],
      );
    }
    // limpa carrinho ao gerar pedido
    await client.query(
      `DELETE FROM marketplace_cart_items
        WHERE cart_id IN (SELECT id FROM marketplace_carts WHERE user_id=$1 AND status='active')`,
      [userId],
    );
    await client.query("COMMIT");
    return { orderId, totalCents: cart.totalCents, status: "pending" };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

/**
 * Sorteio aleatório determinístico para Pack — Fisher-Yates com seed sha256.
 * Auditável: grava o seed e a lista sorteada em marketplace_pack_drawings.
 */
function fisherYatesShuffle<T>(arr: T[], seedHex: string): T[] {
  const out = [...arr];
  let cursor = 0;
  const nextByte = () => {
    const b = parseInt(seedHex.slice(cursor, cursor + 2), 16);
    cursor += 2;
    if (cursor >= seedHex.length) {
      // re-hash para estender entropia caso esgote (pack max 132 itens, raramente esgota)
      const more = crypto.createHash("sha256").update(seedHex).digest("hex");
      seedHex = seedHex + more;
    }
    return b;
  };
  for (let i = out.length - 1; i > 0; i--) {
    const r = (nextByte() << 8) | nextByte();
    const j = r % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export async function deliverOrder(orderId: string): Promise<{ delivered: number; drawings: number }> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const orderRes = await client.query(
      `SELECT id, user_id, status, payment_status FROM marketplace_orders WHERE id=$1 FOR UPDATE`,
      [orderId],
    );
    const order = orderRes.rows[0];
    if (!order) throw new Error("Pedido não encontrado");
    if (order.status === "delivered") {
      await client.query("COMMIT");
      return { delivered: 0, drawings: 0 };
    }
    if (order.payment_status !== "paid") throw new Error("Pedido ainda não foi pago");

    const items = await client.query(
      `SELECT id, item_type, item_slug, pack_ebook_quota FROM marketplace_order_items WHERE order_id=$1`,
      [orderId],
    );
    let delivered = 0;
    let drawings = 0;

    for (const it of items.rows) {
      if (it.item_type === "ebook") {
        const ins = await client.query(
          `INSERT INTO marketplace_user_library (user_id, ebook_slug, source_order_id, source_type, delivered)
           VALUES ($1, $2, $3, 'purchase', TRUE)
           ON CONFLICT (user_id, ebook_slug) DO NOTHING
           RETURNING id`,
          [order.user_id, it.item_slug, orderId],
        );
        delivered += ins.rowCount ?? 0;
      } else if (it.item_type === "pack") {
        const quota = it.pack_ebook_quota || PACK_EBOOK_QUOTA[it.item_slug] || 0;
        // Pool: todos os ebooks do pack que o usuário AINDA NÃO POSSUI
        const pool = await client.query(
          `SELECT slug FROM marketplace_ebooks
            WHERE unlock_pack_slug=$1 AND status='active'
              AND slug NOT IN (SELECT ebook_slug FROM marketplace_user_library WHERE user_id=$2)`,
          [it.item_slug, order.user_id],
        );
        const poolSlugs = pool.rows.map((r) => r.slug as string);
        const seed = crypto
          .createHash("sha256")
          .update(`${order.user_id}:${orderId}:${it.item_slug}:${Date.now()}`)
          .digest("hex");
        const shuffled = fisherYatesShuffle(poolSlugs, seed);
        const drawn = shuffled.slice(0, Math.min(quota, shuffled.length));
        for (const slug of drawn) {
          await client.query(
            `INSERT INTO marketplace_user_library (user_id, ebook_slug, source_order_id, source_type, source_pack_slug, delivered)
             VALUES ($1, $2, $3, 'pack_random', $4, TRUE)
             ON CONFLICT (user_id, ebook_slug) DO NOTHING`,
            [order.user_id, slug, orderId, it.item_slug],
          );
          delivered++;
        }
        await client.query(
          `INSERT INTO marketplace_pack_drawings (user_id, order_id, pack_slug, pool_size, drawn_count, drawn_slugs, seed)
           VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
          [order.user_id, orderId, it.item_slug, poolSlugs.length, drawn.length, JSON.stringify(drawn), seed],
        );
        drawings++;
      }
    }

    await client.query(
      `UPDATE marketplace_orders SET status='delivered', delivered_at=NOW(), updated_at=NOW() WHERE id=$1`,
      [orderId],
    );
    await client.query("COMMIT");
    return { delivered, drawings };
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function markOrderAsPaid(
  orderId: string,
  opts: { paymentId?: string; paymentMethod?: string } = {},
): Promise<{ delivered: number; drawings: number }> {
  const client = await getPool().connect();
  try {
    await client.query(
      `UPDATE marketplace_orders
          SET status='paid', payment_status='paid', paid_at=NOW(), updated_at=NOW(),
              payment_id=COALESCE($2, payment_id),
              payment_method=COALESCE($3, payment_method)
        WHERE id=$1 AND status='pending'`,
      [orderId, opts.paymentId ?? null, opts.paymentMethod ?? null],
    );
  } finally {
    client.release();
  }
  return deliverOrder(orderId);
}

// -----------------------------------------------------------------------------
// Biblioteca do usuário
// -----------------------------------------------------------------------------
export async function getUserLibrary(userId: number) {
  const client = await getPool().connect();
  try {
    const r = await client.query(
      `SELECT l.id, l.ebook_slug, l.source_type, l.source_pack_slug, l.acquired_at,
              e.title, e.subtitle, e.pages, e.category, e.html_path, e.pdf_path, e.cover_path
         FROM marketplace_user_library l
         JOIN marketplace_ebooks e ON e.slug = l.ebook_slug
        WHERE l.user_id=$1 AND l.delivered=TRUE
        ORDER BY l.acquired_at DESC`,
      [userId],
    );
    return r.rows.map((row) => ({
      id: row.id,
      ebookSlug: row.ebook_slug,
      sourceType: row.source_type,
      sourcePackSlug: row.source_pack_slug,
      acquiredAt: row.acquired_at,
      title: row.title,
      subtitle: row.subtitle,
      pages: row.pages,
      category: row.category,
      htmlPath: row.html_path,
      pdfPath: row.pdf_path,
      coverPath: row.cover_path,
    }));
  } finally {
    client.release();
  }
}

export async function listUserOrders(userId: number): Promise<OrderSummary[]> {
  const client = await getPool().connect();
  try {
    const r = await client.query(
      `SELECT id, status, total_cents, created_at, paid_at FROM marketplace_orders
        WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50`,
      [userId],
    );
    return r.rows.map((row) => ({
      id: row.id,
      status: row.status,
      totalCents: row.total_cents,
      createdAt: row.created_at.toISOString?.() ?? String(row.created_at),
      paidAt: row.paid_at ? row.paid_at.toISOString?.() ?? String(row.paid_at) : null,
    }));
  } finally {
    client.release();
  }
}
