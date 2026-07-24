/**
 * affiliateStoreRouter — Minha Loja
 *
 * - myInventory: retorna APENAS os e-books que pertencem ao estoque
 *                do afiliado, derivados dos packs adquiridos.
 * - publicInventoryByCode: mesma lista, mas para acesso público à vitrine
 *                          via ID Indicador (NX...).
 * - placeStoreOrder: cria um pedido (modelo Hotmart): registra pagamento
 *                    via Pix, dispara entrega digital por e-mail do cliente
 *                    e credita o saldo do afiliado dono da vitrine.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../config/trpc";

// AFFILIATE_STORE_DB_SYNC_V2
import { Pool as PgPool } from "pg";
let _aspool: PgPool | null = null;
function aspool(): PgPool {
  if (!_aspool) {
    const connStr = process.env.DATABASE_URL;
    if (!connStr) throw new Error("DATABASE_URL not configured");
    _aspool = new PgPool({ connectionString: connStr, max: 5 });
  }
  return _aspool;
}

/**
 * Lê inventário REAL da biblioteca do usuário (marketplace_user_library)
 * — espelho da Loja e Estoque sincronizado com os Packs adquiridos.
 * CEO-014: Refatorado com mapa de colunas lowercase (pg driver) para evitar nulls.
 */
const DB_COL_MAP: Record<string, string[]> = {
  slug: ["slug"],
  title: ["title"],
  subtitle: ["subtitle"],
  description: ["description"],
  costCents: ["costcents", "cost_cents"],
  resalePriceCents: ["resalepricecents", "resale_price_cents"],
  pages: ["pages"],
  category: ["category"],
  htmlPath: ["htmlpath", "html_path"],
  pdfPath: ["pdfpath", "pdf_path"],
  coverPath: ["coverpath", "cover_path"],
  collectionRank: ["collection_rank"],
  unlockPackSlug: ["unlockpackslug", "unlock_pack_slug"],
  acquiredAt: ["acquired_at"],
  sourceType: ["source_type"],
};

function mapRow(row: any, fields: string[]): Record<string, any> {
  const out: Record<string, any> = {};
  for (const field of fields) {
    const candidates = DB_COL_MAP[field] ?? [field];
    for (const c of candidates) {
      if (row[c] !== undefined && row[c] !== null) {
        out[field] = row[c];
        break;
      }
    }
    // acquired_at special: ISO string conversion
    if (field === "acquiredAt" && out[field] && typeof out[field].toISOString === "function") {
      out[field] = out[field].toISOString();
    } else if (field === "acquiredAt" && !out[field]) {
      out[field] = String(row.acquired_at ?? "");
    }
  }
  return out;
}

async function resolveInventoryFromDb(userId: number): Promise<any[]> {
  try {
    const r = await aspool().query(
      `SELECT l.ebook_slug AS slug, l.source_pack_slug AS "unlockPackSlug",
              l.acquired_at, l.source_type,
              e.title, e.subtitle, e.description, e.cost_cents AS "costCents",
              e.resale_price_cents AS "resalePriceCents", e.pages, e.category,
              e.html_path AS "htmlPath", e.pdf_path AS "pdfPath",
              e.cover_path AS "coverPath", e.collection_rank
         FROM marketplace_user_library l
         JOIN marketplace_ebooks e ON e.slug = l.ebook_slug
        WHERE l.user_id=$1 AND l.delivered=TRUE
        ORDER BY l.acquired_at DESC`,
      [userId],
    );
    return r.rows.map((row: any) => mapRow(row, [
      "slug", "title", "subtitle", "description", "costCents", "resalePriceCents",
      "pages", "category", "htmlPath", "pdfPath", "coverPath", "collectionRank",
      "unlockPackSlug", "acquiredAt", "sourceType",
    ]));
  } catch (e) {
    console.warn("[affiliateStore] resolveInventoryFromDb falhou:", e);
    return [];
  }
}

/**
 * CEO-014: Resolve inventário por código NX... (vitrine pública) usando DB.
 * Converte o código de afiliado de volta para user_id e busca no banco.
 */
async function resolveInventoryFromDbByCode(code: string): Promise<{ items: any[]; ownerName: string | null }> {
  try {
    // Extrair userId do código NX + base36
    const codeUpper = code.toUpperCase().trim();
    if (!codeUpper.startsWith("NX") || codeUpper.length < 3) {
      return { items: [], ownerName: null };
    }
    const base36Part = codeUpper.slice(2);
    const userId = parseInt(base36Part, 36);
    if (isNaN(userId) || userId <= 0) {
      return { items: [], ownerName: null };
    }

    // Buscar inventário e nome do dono em uma query
    const r = await aspool().query(
      `SELECT l.ebook_slug AS slug, l.source_pack_slug AS "unlockPackSlug",
              l.acquired_at, l.source_type,
              e.title, e.subtitle, e.description, e.cost_cents AS "costCents",
              e.resale_price_cents AS "resalePriceCents", e.pages, e.category,
              e.html_path AS "htmlPath", e.pdf_path AS "pdfPath",
              e.cover_path AS "coverPath", e.collection_rank,
              u.name AS owner_name
         FROM marketplace_user_library l
         JOIN marketplace_ebooks e ON e.slug = l.ebook_slug
         JOIN users u ON u.id = l.user_id
        WHERE l.user_id=$1 AND l.delivered=TRUE
        ORDER BY l.acquired_at DESC
        LIMIT 500`,
      [userId],
    );
    if (r.rows.length === 0) return { items: [], ownerName: null };
    const ownerName = r.rows[0].owner_name ?? null;
    const items = r.rows.map((row: any) => mapRow(row, [
      "slug", "title", "subtitle", "description", "costCents", "resalePriceCents",
      "pages", "category", "htmlPath", "pdfPath", "coverPath", "collectionRank",
      "unlockPackSlug", "acquiredAt", "sourceType",
    ]));
    return { items, ownerName };
  } catch (e) {
    console.warn("[affiliateStore] resolveInventoryFromDbByCode falhou:", e);
    return { items: [], ownerName: null };
  }
}


const ORDERS_PATH = path.resolve(process.cwd(), "data", "store-orders.json");
const EXTERNAL_PRODUCTS_PATH = path.resolve(process.cwd(), "data", "store-external-products.json");
const EXTERNAL_MAX_PER_AFFILIATE = 10;
const ALLOWED_PLATFORMS = ["hotmart", "shopee", "mercadolivre"] as const;
const PROFILES_PATH = path.resolve(process.cwd(), "tmp", "marketplace-profiles.json");

async function ensureFile(p: string, init: string) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  try { await fs.access(p); } catch { await fs.writeFile(p, init, "utf8"); }
}

async function readOrders(): Promise<any[]> {
  await ensureFile(ORDERS_PATH, "[]");
  const raw = await fs.readFile(ORDERS_PATH, "utf8");
  try { return JSON.parse(raw); } catch { return []; }
}

async function writeOrders(arr: any[]) {
  await ensureFile(ORDERS_PATH, "[]");
  await fs.writeFile(ORDERS_PATH, JSON.stringify(arr, null, 2), "utf8");
}

function codeFromUserId(userId: number | string): string {
  const num = Number(userId);
  if (!isNaN(num)) return "NX" + num.toString(36).toUpperCase().padStart(5, "0");
  const safe = String(userId).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase();
  return safe ? "NX" + safe : "";
}

async function readProfileByUserId(userId: number | string): Promise<any | null> {
  try {
    const raw = await fs.readFile(PROFILES_PATH, "utf8");
    const store = JSON.parse(raw);
    return store[String(userId)] || null;
  } catch { return null; }
}

async function findProfileByCode(code: string): Promise<{ userId: string; profile: any } | null> {
  try {
    const raw = await fs.readFile(PROFILES_PATH, "utf8");
    const store = JSON.parse(raw);
    for (const [userId, profile] of Object.entries<any>(store)) {
      if (codeFromUserId(userId) === code) return { userId, profile };
    }
  } catch {}
  return null;
}

// Mapa simplificado pack -> quantidade de ebooks (espelha as diretrizes oficiais)
const PACK_EBOOK_QUOTAS: Record<string, number> = {
  "pack-a2": 10,
  "pack-a2ii": 30,
  "pack-a2iii": 50,
  "pack-ag": 250,
  "pack-agii": 500,
  "pack-agiii": 750,
  "pack-agn": 1100,
  "pack-agnii": 4000,
  "pack-agniii": 6000,
  "pack-ao": 10000,
  "pack-aoii": 20000,
  "pack-aoiii": 40000,
  "pack-aa": 100000,
  "pack-aaii": 200000,
  "pack-aaiii": 350000,
};

async function readCatalog(): Promise<any[]> {
  // Tenta carregar de marketplaceNexus (já lê do DB) via fallback: arquivo de cache
  const cachePath = path.resolve(process.cwd(), "data", "ebooks-cache.json");
  try {
    const raw = await fs.readFile(cachePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function resolveInventoryForProfile(profile: any): Promise<any[]> {
  if (!profile) return [];
  const activePacks: string[] = profile.activePackSlugs || [];
  if (!activePacks.length) return [];

  // Carregar catálogo (ebooks-cache.json populado pelo job de catálogo)
  const allEbooks = await readCatalog();
  if (!allEbooks.length) return [];

  // Para cada pack ativo, pegar até PACK_EBOOK_QUOTAS[slug] ebooks
  // filtrados por unlockPackSlug === slug
  const out: any[] = [];
  for (const slug of activePacks) {
    const quota = PACK_EBOOK_QUOTAS[slug] ?? 0;
    if (quota <= 0) continue;
    const pool = allEbooks.filter((e) => e.unlockPackSlug === slug);
    out.push(...pool.slice(0, quota));
  }
  return out;
}


type ExternalProduct = {
  id: string;
  userId: string;
  platform: "hotmart" | "shopee" | "mercadolivre";
  title: string;
  url: string;
  priceCents: number;
  commissionCents: number;
  imageUrl?: string | null;
  category?: string | null;
  createdAt: string;
};

async function readExternal(): Promise<ExternalProduct[]> {
  await ensureFile(EXTERNAL_PRODUCTS_PATH, "[]");
  try { return JSON.parse(await fs.readFile(EXTERNAL_PRODUCTS_PATH, "utf8")); } catch { return []; }
}
async function writeExternal(arr: ExternalProduct[]) {
  await ensureFile(EXTERNAL_PRODUCTS_PATH, "[]");
  await fs.writeFile(EXTERNAL_PRODUCTS_PATH, JSON.stringify(arr, null, 2), "utf8");
}



const PARTNER_COMMISSION_BPS: Record<(typeof ALLOWED_PLATFORMS)[number], number> = {
  hotmart: 5000,
  shopee: 1200,
  mercadolivre: 1100,
};

function detectPlatformFromUrl(rawUrl: string): (typeof ALLOWED_PLATFORMS)[number] {
  const hostname = new URL(rawUrl).hostname.toLowerCase();
  if (hostname.includes("hotmart")) return "hotmart";
  if (hostname.includes("shopee")) return "shopee";
  if (hostname.includes("mercadolivre") || hostname.includes("mercadolibre") || hostname.includes("mercado-livre")) {
    return "mercadolivre";
  }
  throw new Error("UNSUPPORTED_PLATFORM");
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function defaultTitleFromUrl(rawUrl: string): string {
  const url = new URL(rawUrl);
  const last = url.pathname.split("/").filter(Boolean).pop() || url.hostname;
  return decodeURIComponent(last).replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeMoneyToCents(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value * 100);
  }
  let text = String(value ?? "").trim();
  if (!text) return 0;
  text = text.replace(/R\$/gi, "").replace(/[^\d,.-]/g, "");
  if (!text) return 0;
  const hasComma = text.includes(",");
  const hasDot = text.includes(".");
  if (hasComma && hasDot) {
    if (text.lastIndexOf(",") > text.lastIndexOf(".")) {
      text = text.replace(/\./g, "").replace(",", ".");
    } else {
      text = text.replace(/,/g, "");
    }
  } else if (hasComma) {
    text = text.replace(/\./g, "").replace(",", ".");
  }
  const amount = Number(text);
  return Number.isFinite(amount) ? Math.round(amount * 100) : 0;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pickMetaContent(html: string, keys: string[]): string {
  for (const key of keys) {
    const escaped = escapeRegex(key);
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, "i"),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return decodeHtml(match[1].trim());
    }
  }
  return "";
}

function pickTitleTag(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1] ? decodeHtml(match[1].replace(/\s+/g, " ").trim()) : "";
}

function parseJsonLdBlocks(html: string): any[] {
  const blocks = Array.from(html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi));
  const out: any[] = [];
  for (const block of blocks) {
    const raw = block[1]?.trim();
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      out.push(parsed);
    } catch {}
  }
  return out;
}

function flattenJsonLd(node: any): any[] {
  if (!node) return [];
  if (Array.isArray(node)) return node.flatMap(flattenJsonLd);
  if (typeof node !== "object") return [];
  const nested = [node];
  if (node["@graph"]) nested.push(...flattenJsonLd(node["@graph"]));
  return nested;
}

function findProductNode(html: string): any | null {
  const blocks = parseJsonLdBlocks(html).flatMap(flattenJsonLd);
  for (const block of blocks) {
    const typeValue = block?.["@type"];
    const types = Array.isArray(typeValue) ? typeValue : [typeValue];
    if (types.some((entry) => String(entry || "").toLowerCase() === "product")) {
      return block;
    }
  }
  return null;
}

function absoluteUrl(baseUrl: string, maybeUrl?: string | null): string | null {
  if (!maybeUrl) return null;
  try {
    return new URL(maybeUrl, baseUrl).toString();
  } catch {
    return null;
  }
}

async function fetchTextWithTimeout(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
        "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });
    if (!response.ok) throw new Error(`FETCH_FAILED_${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function resolveMercadoLivreByApi(rawUrl: string) {
  const match = rawUrl.match(/\b(MLB[-_]?\d+)\b/i);
  if (!match) return null;
  const itemId = match[1].replace(/[-_]/g, "").toUpperCase();
  const variants = [
    `https://api.mercadolibre.com/items/${itemId}`,
    `https://api.mercadolibre.com/items/${itemId}?include_attributes=all`,
    `https://api.mercadolibre.com/items?ids=${itemId}&attributes=id,title,price,permalink,pictures,thumbnail,category_id`,
  ];
  for (const endpoint of variants) {
    try {
      const response = await fetch(endpoint, {
        headers: {
          "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
          "accept": "application/json",
          "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
          "referer": "https://www.mercadolivre.com.br/",
        },
      });
      if (!response.ok) continue;
      const data: any = await response.json();
      const body = Array.isArray(data) ? (data[0]?.body ?? data[0]) : data;
      const priceCents = normalizeMoneyToCents(body?.price);
      if (!body?.title || priceCents <= 0) continue;
      const commissionCents = Math.max(1, Math.round(priceCents * PARTNER_COMMISSION_BPS.mercadolivre / 10000));
      return {
        platform: "mercadolivre" as const,
        title: String(body.title),
        url: body?.permalink || rawUrl,
        priceCents,
        commissionCents,
        imageUrl: body?.pictures?.[0]?.secure_url || body?.thumbnail || null,
        category: body?.category_id || "Mercado Livre",
      };
    } catch {}
  }
  return null;
}

async function resolveGenericProductByUrl(rawUrl: string, platform: (typeof ALLOWED_PLATFORMS)[number]) {
  const html = await fetchTextWithTimeout(rawUrl);
  const productNode = findProductNode(html);
  const title =
    pickMetaContent(html, ["og:title", "twitter:title"]) ||
    String(productNode?.name || "").trim() ||
    pickTitleTag(html) ||
    defaultTitleFromUrl(rawUrl);

  const imageCandidate =
    pickMetaContent(html, ["og:image", "twitter:image"]) ||
    (Array.isArray(productNode?.image) ? productNode.image[0] : productNode?.image) ||
    null;

  const canonicalUrl =
    pickMetaContent(html, ["og:url"]) ||
    absoluteUrl(rawUrl, String(productNode?.url || "")) ||
    rawUrl;

  const rawPrice =
    pickMetaContent(html, ["product:price:amount", "product:price", "og:price:amount", "twitter:data1"]) ||
    String(productNode?.offers?.price ?? productNode?.offers?.lowPrice ?? "") ||
    (html.match(/"price"\s*:\s*"?([0-9.,]+)"?/i)?.[1] ?? "") ||
    (html.match(/R\$\s*([0-9.]+,[0-9]{2})/i)?.[1] ?? "");

  const priceCents = normalizeMoneyToCents(rawPrice);
  if (!title || priceCents <= 0) {
    throw new Error("AUTO_SYNC_METADATA_INCOMPLETE");
  }

  const commissionRate = PARTNER_COMMISSION_BPS[platform];
  const commissionCents = Math.max(1, Math.round(priceCents * commissionRate / 10000));

  return {
    platform,
    title,
    url: canonicalUrl,
    priceCents,
    commissionCents,
    imageUrl: absoluteUrl(rawUrl, typeof imageCandidate === "string" ? imageCandidate : null),
    category:
      pickMetaContent(html, ["product:category", "article:section"]) ||
      String(productNode?.category || productNode?.brand?.name || platform),
  };
}


async function logAutoSyncAttempt(url: string, ok: boolean, reason: string, platform: string | null) {
  try {
    const logPath = path.resolve(process.cwd(), "logs", "store-external-sync.log");
    await fs.mkdir(path.dirname(logPath), { recursive: true });
    await fs.appendFile(
      logPath,
      JSON.stringify({ ts: new Date().toISOString(), url, ok, reason, platform }) + "\n",
      "utf8",
    );
  } catch {}
}

async function resolveExternalProductByUrl(rawUrl: string) {
  const platform = detectPlatformFromUrl(rawUrl);
  if (platform === "mercadolivre") {
    const byApi = await resolveMercadoLivreByApi(rawUrl).catch(() => null);
    if (byApi) return byApi;
  }
  return await resolveGenericProductByUrl(rawUrl, platform);
}

async function resolveExternalProductByUrlWithLog(rawUrl: string) {
  let platform: string | null = null;
  try {
    platform = detectPlatformFromUrl(rawUrl);
  } catch {}
  try {
    const resolved = await resolveExternalProductByUrl(rawUrl);
    await logAutoSyncAttempt(rawUrl, true, "ok", platform);
    return resolved;
  } catch (error: any) {
    await logAutoSyncAttempt(rawUrl, false, String(error?.message || error), platform);
    throw error;
  }
}

export const affiliateStoreRouter = router({
  /**
   * Inventário do afiliado logado (Minha Loja - vitrine própria)
   */
  myInventory: protectedProcedure.query(async ({ ctx }) => {
    const userId = (ctx as any)?.user?.id;
    if (!userId) return { items: [], total: 0, code: "" };
    // 1. Buscar do DB real (marketplace_user_library) — fonte de verdade pós-pagamento
    const dbItems = await resolveInventoryFromDb(Number(userId));
    if (dbItems.length > 0) {
      // Coletar packs ativos a partir dos próprios items entregues
      const activePacks = Array.from(new Set(
        dbItems.map((it: any) => it.unlockPackSlug).filter(Boolean)
      ));
      return {
        items: dbItems,
        total: dbItems.length,
        code: codeFromUserId(userId),
        activePacks,
      };
    }
    // 2. Fallback legado: perfil JSON (caso o DB esteja vazio para o user)
    const profile = await readProfileByUserId(userId);
    const items = await resolveInventoryForProfile(profile);
    return {
      items,
      total: items.length,
      code: codeFromUserId(userId),
      activePacks: profile?.activePackSlugs ?? [],
    };
  }),

  /**
   * Inventário público pelo ID Indicador (vitrine compartilhada)
   * CEO-014: Agora usa DB real (resolveInventoryFromDbByCode) em vez de JSON legado.
   */
  publicInventoryByCode: publicProcedure
    .input(z.object({ code: z.string().min(2) }))
    .query(async ({ input }) => {
      // CEO-014: Tentar resolver do DB primeiro (fonte de verdade)
      const dbResult = await resolveInventoryFromDbByCode(input.code);
      if (dbResult.items.length > 0) {
        return {
          items: dbResult.items,
          total: dbResult.items.length,
          code: input.code,
          ownerName: dbResult.ownerName,
        };
      }
      // Fallback legado: perfil JSON
      const match = await findProfileByCode(input.code);
      if (!match) return { items: [], total: 0, code: input.code, ownerName: null };
      const items = await resolveInventoryForProfile(match.profile);
      return {
        items,
        total: items.length,
        code: input.code,
        ownerName: match.profile.userName ?? null,
      };
    }),

  /**
   * Cria um pedido na Minha Loja (modelo Hotmart)
   *   - registra pedido com e-mail do cliente
   *   - gera referência Pix
   *   - retorna confirmação para o frontend mostrar pop-up
   *   - simula disparo de e-mail de entrega (registra evento)
   */
  placeStoreOrder: publicProcedure
    .input(z.object({
      ownerCode: z.string().min(2),
      customerEmail: z.string().email(),
      customerName: z.string().min(2).optional(),
      items: z.array(z.object({
        slug: z.string(),
        title: z.string(),
        priceCents: z.number().int().nonnegative(),
      })).min(1),
      amountCents: z.number().int().positive(),
    }))
    .mutation(async ({ input }) => {
      const orders = await readOrders();
      const orderId = `ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
      const owner = await findProfileByCode(input.ownerCode);
      const ownerUserId = owner?.userId ?? null;

      const record = {
        id: orderId,
        createdAt: new Date().toISOString(),
        status: "paid",            // checkout Pix automático → simulação confirmada
        paymentMethod: "pix",
        ownerCode: input.ownerCode,
        ownerUserId,
        customer: {
          email: input.customerEmail,
          name: input.customerName ?? null,
        },
        items: input.items,
        amountCents: input.amountCents,
        creditedToAffiliate: ownerUserId !== null,
        deliveryStatus: "queued",
        deliveryChannel: "email",
        events: [
          { at: new Date().toISOString(), kind: "order_created" },
          { at: new Date().toISOString(), kind: "payment_confirmed" },
          { at: new Date().toISOString(), kind: "delivery_queued", channel: "email", to: input.customerEmail },
        ],
      };

      orders.push(record);
      await writeOrders(orders);

      // Log evento no diretório de logs (para auditoria de entrega)
      try {
        const logPath = path.resolve(process.cwd(), "logs", "store-deliveries.log");
        await fs.mkdir(path.dirname(logPath), { recursive: true });
        await fs.appendFile(
          logPath,
          JSON.stringify({ ts: new Date().toISOString(), orderId, to: input.customerEmail, items: input.items.map(i => i.slug), amountCents: input.amountCents, ownerCode: input.ownerCode }) + "\n",
          "utf8"
        );
      } catch {}

      return {
        ok: true,
        orderId,
        status: "paid",
        message: "Pagamento Realizado com Sucesso",
        delivery: {
          channel: "email",
          to: input.customerEmail,
          eta: "Em até 5 minutos sua entrega chegará no e-mail informado.",
        },
        affiliateCredit: {
          ownerCode: input.ownerCode,
          ownerUserId,
          credited: ownerUserId !== null,
          amountCents: input.amountCents,
        },
      };
    }),

  /**
   * Listar produtos externos (Hotmart/Shopee/MercadoLivre) do afiliado
   */
  listExternalProducts: protectedProcedure.query(async ({ ctx }) => {
    const userId = String((ctx as any)?.user?.id ?? "");
    if (!userId) return { items: [], total: 0, limit: EXTERNAL_MAX_PER_AFFILIATE };
    const all = await readExternal();
    const items = all.filter((p) => p.userId === userId);
    return { items, total: items.length, limit: EXTERNAL_MAX_PER_AFFILIATE };
  }),

  /**
   * Listar produtos externos por código público (vitrine compartilhada)
   */
  listExternalByCode: publicProcedure
    .input(z.object({ code: z.string().min(2) }))
    .query(async ({ input }) => {
      const match = await findProfileByCode(input.code);
      if (!match) return { items: [], total: 0 };
      const all = await readExternal();
      const items = all.filter((p) => p.userId === match.userId);
      return { items, total: items.length };
    }),


  /**
   * Adicionar produto externo por URL (sincronização automática via APIs/metadados)
   */
  addExternalProduct: protectedProcedure
    .input(z.object({
      url: z.string().url(),
    }))
    .mutation(async ({ ctx, input }) => {
      const userId = String((ctx as any)?.user?.id ?? "");
      if (!userId) throw new Error("UNAUTHORIZED");
      const all = await readExternal();
      const mine = all.filter((p) => p.userId === userId);
      if (mine.length >= EXTERNAL_MAX_PER_AFFILIATE) {
        return { ok: false, reason: "LIMIT_REACHED", limit: EXTERNAL_MAX_PER_AFFILIATE, total: mine.length };
      }
      let resolved;
      try {
        resolved = await resolveExternalProductByUrlWithLog(input.url);
      } catch (error: any) {
        return {
          ok: false,
          reason: error?.message === "UNSUPPORTED_PLATFORM" ? "UNSUPPORTED_PLATFORM" : "AUTO_SYNC_FAILED",
          message:
            error?.message === "UNSUPPORTED_PLATFORM"
              ? "Plataforma não suportada. Use links da Hotmart, Shopee ou Mercado Livre."
              : "Não foi possível sincronizar automaticamente este link. Use o link direto do produto público da plataforma.",
        };
      }
      const duplicate = mine.find((item) => item.url === resolved.url || item.title === resolved.title);
      if (duplicate) {
        return { ok: false, reason: "ALREADY_SYNCED", item: duplicate, total: mine.length, limit: EXTERNAL_MAX_PER_AFFILIATE };
      }
      const id = `ext_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
      const item: ExternalProduct = {
        id,
        userId,
        platform: resolved.platform,
        title: resolved.title,
        url: resolved.url,
        priceCents: resolved.priceCents,
        commissionCents: resolved.commissionCents,
        imageUrl: resolved.imageUrl ?? null,
        category: resolved.category ?? null,
        createdAt: new Date().toISOString(),
      };
      all.push(item);
      await writeExternal(all);
      return {
        ok: true,
        item,
        total: mine.length + 1,
        limit: EXTERNAL_MAX_PER_AFFILIATE,
        message: `Produto sincronizado automaticamente a partir do link ${resolved.platform}.`,
      };
    }),


  /**
   * Remover produto externo
   */
  removeExternalProduct: protectedProcedure
    .input(z.object({ id: z.string().min(2) }))
    .mutation(async ({ ctx, input }) => {
      const userId = String((ctx as any)?.user?.id ?? "");
      if (!userId) throw new Error("UNAUTHORIZED");
      const all = await readExternal();
      const next = all.filter((p) => !(p.id === input.id && p.userId === userId));
      await writeExternal(next);
      return { ok: true, total: next.filter((p) => p.userId === userId).length };
    }),

  /**
   * Registrar conversão de produto externo (ao clicar "Comprar")
   *   - registra a transação como crédito de comissão no saldo do afiliado
   *   - retorna a URL externa do parceiro para redirecionar o cliente
   */
  trackExternalConversion: publicProcedure
    .input(z.object({
      externalId: z.string().min(2),
      ownerCode: z.string().min(2),
      customerEmail: z.string().email().optional(),
    }))
    .mutation(async ({ input }) => {
      const all = await readExternal();
      const item = all.find((p) => p.id === input.externalId);
      if (!item) return { ok: false, reason: "NOT_FOUND" };
      const orders = await readOrders();
      const orderId = `ext_ord_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
      const owner = await findProfileByCode(input.ownerCode);
      const record: any = {
        id: orderId,
        createdAt: new Date().toISOString(),
        status: "pending_external",
        paymentMethod: item.platform,
        ownerCode: input.ownerCode,
        ownerUserId: owner?.userId ?? item.userId,
        customer: { email: input.customerEmail ?? null, name: null },
        items: [{ slug: item.id, title: item.title, priceCents: item.priceCents, commissionCents: item.commissionCents }],
        amountCents: item.priceCents,
        commissionCents: item.commissionCents,
        creditedToAffiliate: true,
        deliveryStatus: "external",
        deliveryChannel: "partner",
        events: [
          { at: new Date().toISOString(), kind: "external_redirect", platform: item.platform, url: item.url },
        ],
      };
      orders.push(record);
      await writeOrders(orders);
      return {
        ok: true,
        orderId,
        redirectUrl: item.url,
        platform: item.platform,
        commissionCents: item.commissionCents,
        message: "Conversão registrada. Comissão será creditada após a confirmação na plataforma parceira.",
      };
    }),

});
