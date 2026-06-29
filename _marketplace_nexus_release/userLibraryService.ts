/**
 * Marketplace Nexus · Serviço de Biblioteca + Sorteio Aleatório por Pack
 * ----------------------------------------------------------------------
 * Quando o usuário adquire um Pack (A², A²II, A²III, AG, etc.), o sistema sorteia
 * aleatoriamente N ebooks dentro do pool do pack (ebooks com unlock_pack_slug
 * <= ordem do pack) excluindo os que o usuário já possui, e materializa cada
 * sorteio em `marketplace_user_library`. Todo sorteio é auditável em
 * `marketplace_pack_drawings`.
 *
 * Quando o item é um e-book avulso, vai direto para a biblioteca.
 *
 * Integração:
 *   - pixRouter.createMarketplaceCheckout  → cria order pending
 *   - PIX webhook (`pix.webhook`)           → marca como paid + chama deliverOrder
 *   - deliverOrder() → expande os itens (sorteia se for pack) e popula a library.
 */
import crypto from "node:crypto";
import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "../../db";
import {
  marketplaceEbooks,
  marketplaceOrders,
  marketplaceOrderItems,
  marketplaceUserLibrary,
  marketplacePackDrawings,
} from "../../drizzle/schema";

// Ordem oficial dos packs (espelha frontend/src/lib/nexus-marketplace.ts)
const PACK_ORDER: Record<string, number> = {
  "pack-a2":     1,
  "pack-a2ii":   2,
  "pack-a2iii":  3,
  "pack-ag":     4,
  "pack-agii":   5,
  "pack-agiii":  6,
  "pack-agn":    7,
  "pack-agnii":  8,
  "pack-agniii": 9,
  "pack-ao":     10,
  "pack-aoii":   11,
  "pack-aoiii":  12,
  "pack-aa":     13,
  "pack-aaii":   14,
  "pack-aaiii":  15,
};

// Quantos ebooks cada pack libera no sorteio aleatório.
// Espelha os campos `ebooks` da definição de NEXUS_PACKS.
export const PACK_EBOOK_QUOTA: Record<string, number> = {
  "pack-a2":     10,
  "pack-a2ii":   30,
  "pack-a2iii":  50,
  "pack-ag":     250,
  "pack-agii":   500,
  "pack-agiii":  750,
  "pack-agn":    1100,
  "pack-agnii":  4000,
  "pack-agniii": 6000,
  "pack-ao":     10000,
  "pack-aoii":   20000,
  "pack-aoiii":  40000,
  "pack-aa":     100000,
  "pack-aaii":   200000,
  "pack-aaiii":  350000,
};

/** Determina o pool de ebooks elegíveis a um pack (cumulativo por ordem). */
async function getEligiblePool(packSlug: string): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];
  const order = PACK_ORDER[packSlug] ?? 99;
  const eligibleSlugs: string[] = Object.entries(PACK_ORDER)
    .filter(([, o]) => o <= order)
    .map(([slug]) => slug);

  const rows = await db
    .select({ slug: marketplaceEbooks.slug })
    .from(marketplaceEbooks)
    .where(
      and(
        inArray(marketplaceEbooks.unlockPackSlug, eligibleSlugs),
        eq(marketplaceEbooks.status, "active"),
      ),
    );
  return rows.map((r) => r.slug);
}

/** RNG determinístico Fisher–Yates baseado em SHA-256(seed) — auditável. */
function deterministicShuffle<T>(items: T[], seed: string): T[] {
  const arr = [...items];
  let counter = 0;
  function next(): number {
    const h = crypto.createHash("sha256")
      .update(`${seed}:${counter++}`)
      .digest();
    // converte 8 bytes em uint para gerar float em [0,1)
    const n = h.readBigUInt64BE(0);
    return Number(n) / Number(0xffffffffffffffffn);
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Sorteia aleatoriamente `count` ebooks do pool do pack, excluindo os que o
 * usuário já possui na biblioteca. Registra a tirada em marketplace_pack_drawings.
 */
export async function drawPackEbooksForUser(opts: {
  userId: number;
  orderId: string;
  packSlug: string;
  count?: number;
}): Promise<string[]> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const quota = opts.count ?? PACK_EBOOK_QUOTA[opts.packSlug] ?? 10;
  const pool = await getEligiblePool(opts.packSlug);

  const owned = await db
    .select({ slug: marketplaceUserLibrary.ebookSlug })
    .from(marketplaceUserLibrary)
    .where(eq(marketplaceUserLibrary.userId, opts.userId));
  const ownedSet = new Set(owned.map((r) => r.slug));

  const available = pool.filter((s) => !ownedSet.has(s));
  const effectiveCount = Math.min(quota, available.length);

  const seed = `${opts.userId}:${opts.orderId}:${opts.packSlug}:${Date.now()}`;
  const drawn = deterministicShuffle(available, seed).slice(0, effectiveCount);

  if (drawn.length > 0) {
    await db.insert(marketplaceUserLibrary).values(
      drawn.map((slug) => ({
        userId: opts.userId,
        ebookSlug: slug,
        sourceOrderId: opts.orderId,
        sourceType: "pack_random" as const,
        sourcePackSlug: opts.packSlug,
        delivered: true,
      })),
    ).onConflictDoNothing();
  }

  await db.insert(marketplacePackDrawings).values({
    userId: opts.userId,
    orderId: opts.orderId,
    packSlug: opts.packSlug,
    poolSize: pool.length,
    drawnCount: drawn.length,
    drawnSlugs: drawn,
    seed,
  });

  return drawn;
}

/** Adiciona um e-book avulso à biblioteca do usuário (idempotente). */
export async function grantEbookToUser(opts: {
  userId: number;
  orderId: string;
  ebookSlug: string;
  source?: "purchase" | "gift" | "promotion";
}) {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  await db.insert(marketplaceUserLibrary).values({
    userId: opts.userId,
    ebookSlug: opts.ebookSlug,
    sourceOrderId: opts.orderId,
    sourceType: opts.source ?? "purchase",
    delivered: true,
  }).onConflictDoNothing();
}

/**
 * Entrega de pedido: percorre os itens da order e, para cada um:
 *   - item_type='ebook'  → grantEbookToUser
 *   - item_type='pack'   → drawPackEbooksForUser (sorteia quota aleatória)
 *   - item_type='bundle' → idem pack, usando metadata.unlockPackSlug
 */
export async function deliverOrder(orderId: string): Promise<{
  delivered: number;
  details: Array<{ itemType: string; itemSlug: string; granted: string[] }>;
}> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível.");
  const order = await db
    .select()
    .from(marketplaceOrders)
    .where(eq(marketplaceOrders.id, orderId))
    .limit(1);
  if (!order[0]) throw new Error(`Pedido ${orderId} não encontrado.`);
  if (order[0].status === "delivered") return { delivered: 0, details: [] };

  const items = await db
    .select()
    .from(marketplaceOrderItems)
    .where(eq(marketplaceOrderItems.orderId, orderId));

  const details: Array<{ itemType: string; itemSlug: string; granted: string[] }> = [];
  let total = 0;

  for (const it of items) {
    if (it.itemType === "ebook") {
      await grantEbookToUser({
        userId: order[0].userId,
        orderId,
        ebookSlug: it.itemSlug,
      });
      details.push({ itemType: "ebook", itemSlug: it.itemSlug, granted: [it.itemSlug] });
      total += 1;
    } else if (it.itemType === "pack" || it.itemType === "bundle") {
      const packSlug =
        it.itemType === "pack"
          ? it.itemSlug
          : ((it.metadata as { unlockPackSlug?: string })?.unlockPackSlug ?? it.itemSlug);
      const quota = it.packEbookQuota ?? PACK_EBOOK_QUOTA[packSlug] ?? 10;
      const granted = await drawPackEbooksForUser({
        userId: order[0].userId,
        orderId,
        packSlug,
        count: quota,
      });
      details.push({ itemType: it.itemType, itemSlug: it.itemSlug, granted });
      total += granted.length;
    }
  }

  await db
    .update(marketplaceOrders)
    .set({ status: "delivered", deliveredAt: new Date(), updatedAt: new Date() })
    .where(eq(marketplaceOrders.id, orderId));

  return { delivered: total, details };
}

/** Estoque do usuário (sua biblioteca completa). */
export async function listUserLibrary(userId: number, limit = 200, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      ebookSlug: marketplaceUserLibrary.ebookSlug,
      acquiredAt: marketplaceUserLibrary.acquiredAt,
      sourceType: marketplaceUserLibrary.sourceType,
      sourcePackSlug: marketplaceUserLibrary.sourcePackSlug,
      title: marketplaceEbooks.title,
      subtitle: marketplaceEbooks.subtitle,
      category: marketplaceEbooks.category,
      pdfPath: marketplaceEbooks.pdfPath,
      htmlPath: marketplaceEbooks.htmlPath,
      coverPath: marketplaceEbooks.coverPath,
    })
    .from(marketplaceUserLibrary)
    .leftJoin(
      marketplaceEbooks,
      eq(marketplaceUserLibrary.ebookSlug, marketplaceEbooks.slug),
    )
    .where(eq(marketplaceUserLibrary.userId, userId))
    .orderBy(sql`${marketplaceUserLibrary.acquiredAt} DESC`)
    .limit(limit)
    .offset(offset);
}
