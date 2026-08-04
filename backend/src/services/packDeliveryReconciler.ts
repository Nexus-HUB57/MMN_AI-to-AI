/**
 * packDeliveryReconciler — Sweep automatico de entrega de pack / ebooks.
 *
 * P0-FIX-2026-08-03: garante que TODO pedido marketplace_orders com
 * payment_status IN ('paid','approved') tenha:
 *   - marketplace_pack_grants (se metadata.type in {pack, subscription})
 *   - marketplace_user_library populado (para packs OU para ebooks avulsos
 *     enviados via metadata.items)
 *   - XP concedido (paridade R$1 = 1 XP, via grantPackToUser -> addXP)
 *
 * Roda tres vezes:
 *   1) uma vez no boot do backend, ~4s apos app.listen (para reparar pedidos
 *      que ficaram orfaos de deploys anteriores).
 *   2) a cada 5 minutos em background (net safety).
 *   3) explicitamente no final de handleMercadoPagoWebhook, focado no
 *      order_id que acabou de ser pago (fast-path).
 *
 * Idempotente:
 *   - grantPackToUser usa marketplace_pack_grants (uniq user+pack+payment_ref).
 *   - INSERTs de ebooks usam ON CONFLICT DO NOTHING.
 *   - addXP tem sourceId (paymentRef | orderId).
 */

import { Pool, type PoolClient } from "pg";

let _reconcPool: Pool | null = null;
function getPool(): Pool {
  if (!_reconcPool) {
    const connStr = process.env.DATABASE_URL;
    if (!connStr) throw new Error("DATABASE_URL not configured");
    _reconcPool = new Pool({ connectionString: connStr, max: 4 });
  }
  return _reconcPool;
}

export interface ReconcilerReport {
  scanned: number;
  packsGranted: number;
  ebooksDelivered: number;
  errors: number;
  focusedOrderId: string | null;
}

async function parseMeta(raw: unknown): Promise<any> {
  if (!raw) return {};
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return raw;
}

async function deliverEbookItems(
  c: PoolClient,
  userId: number,
  orderId: string,
  items: Array<{ slug?: string }>,
): Promise<number> {
  let n = 0;
  for (const it of items) {
    if (!it || typeof it.slug !== "string" || it.slug.length === 0) continue;
    const r = await c.query(
      `INSERT INTO marketplace_user_library
         (user_id, ebook_slug, source_order_id, source_type, delivered, acquired_at)
       VALUES ($1,$2,$3,'ebook',TRUE,NOW())
       ON CONFLICT DO NOTHING`,
      [userId, it.slug, orderId],
    );
    n += r.rowCount || 0;
  }
  return n;
}

async function reconcileOne(
  c: PoolClient,
  order: { id: string; user_id: number; metadata: any; total_cents: number; payment_id?: string | null },
): Promise<{ packsGranted: number; ebooksDelivered: number }> {
  const meta = await parseMeta(order.metadata);
  const orderType = String(meta?.type || "").toLowerCase();
  const orderSlug = String(meta?.slug || "");
  const paymentRef = order.payment_id ?? order.id;

  let packsGranted = 0;
  let ebooksDelivered = 0;

  // P0-FIX-2026-08-04: detecta pack pelo SLUG independente do type.
  // Pedidos pagos antes do patch do frontend (?pack=pack-a2) foram gravados
  // com metadata.type errado (ex.: "produto"), entao a condicao por type nunca
  // os alcancava — o sweep lia 21 pedidos e entregava 0. Qualquer pedido cujo
  // slug bate com um pack conhecido (pack-*) e' tratado como pack.
  const looksLikePack =
    /^pack-[a-z0-9]+$/i.test(orderSlug) ||
    orderType === "pack" ||
    orderType === "subscription";
  if (looksLikePack && orderSlug) {
    const existing = await c.query(
      `SELECT 1 FROM marketplace_pack_grants
        WHERE user_id=$1 AND pack_slug=$2
          AND (payment_ref IS NOT DISTINCT FROM $3 OR order_id=$4)
        LIMIT 1`,
      [order.user_id, orderSlug, paymentRef, order.id],
    );
    if (existing.rowCount === 0) {
      const { grantPackToUser } = await import("./packEntitlementService");
      const g = await grantPackToUser(order.user_id, orderSlug, {
        paymentRef,
        paymentMethod: "mercado_pago",
        amountCents: Number(order.total_cents || 0),
      });
      if (g?.ok) {
        packsGranted += 1;
        ebooksDelivered += Number(g?.delivered || 0);
      }
    }
  }

  // Ebooks avulsos (metadata.items) - fallback quando marketplace_order_items
  // esta vazio (checkout via MP que so gravou items no metadata).
  const items = Array.isArray(meta?.items) ? meta.items : [];
  if (items.length > 0) {
    // Se ja existem linhas em order_items, o webhook principal ja fez INSERT.
    // Aqui garantimos idempotencia com ON CONFLICT DO NOTHING.
    const delivered = await deliverEbookItems(c, order.user_id, order.id, items);
    ebooksDelivered += delivered;
  }

  return { packsGranted, ebooksDelivered };
}

/**
 * Reconcilia todos os pedidos pagos que ainda nao tem entrega registrada.
 * Usa uma janela (default 60 dias) para evitar varrer historico enorme.
 */
export async function reconcileMarketplaceDeliveries(opts?: {
  windowDays?: number;
  orderId?: string;
}): Promise<ReconcilerReport> {
  const report: ReconcilerReport = {
    scanned: 0,
    packsGranted: 0,
    ebooksDelivered: 0,
    errors: 0,
    focusedOrderId: opts?.orderId ?? null,
  };

  const window = Number(opts?.windowDays ?? 60);
  const client = await getPool().connect();
  try {
    // Pedidos candidatos:
    //   - payment_status IN ('paid','approved')
    //   - NOT (status='delivered')  (deixamos os "delivered" quando ja rodaram)
    //   - dentro da janela
    //   - OU order_id especifico (fast-path do webhook)
    const params: any[] = [];
    let where = `WHERE (payment_status IN ('paid','approved') OR status='paid')`;
    if (opts?.orderId) {
      params.push(opts.orderId);
      where += ` AND id = $${params.length}`;
    } else {
      params.push(window);
      where += ` AND created_at > NOW() - ($${params.length}::text || ' days')::interval`;
    }

    const rs = await client.query(
      `SELECT id, user_id, metadata, total_cents, payment_id, status
         FROM marketplace_orders
        ${where}
        ORDER BY created_at ASC
        LIMIT 2000`,
      params,
    );
    for (const row of rs.rows) {
      report.scanned += 1;
      try {
        const r = await reconcileOne(client, row);
        report.packsGranted += r.packsGranted;
        report.ebooksDelivered += r.ebooksDelivered;
        if ((r.packsGranted > 0 || r.ebooksDelivered > 0) && row.status !== "delivered") {
          await client
            .query(
              `UPDATE marketplace_orders
                  SET status = CASE WHEN status='paid' THEN 'delivered' ELSE status END,
                      delivered_at = COALESCE(delivered_at, NOW()),
                      updated_at = NOW()
                WHERE id=$1`,
              [row.id],
            )
            .catch(() => undefined);
        }
      } catch (e: any) {
        report.errors += 1;
        console.warn(`[packDeliveryReconciler] falha em ${row.id}:`, e?.message);
      }
    }
  } catch (e: any) {
    report.errors += 1;
    console.warn("[packDeliveryReconciler] scan falhou:", e?.message);
  } finally {
    client.release();
  }

  return report;
}

let _timer: NodeJS.Timeout | null = null;

/**
 * Boot hook — dispara sweep inicial ~4s apos boot e a cada 5 minutos depois.
 * Chamado uma vez em backend/src/index.ts.
 */
export function startPackDeliveryReconciler(): void {
  if (_timer) return;
  const bootDelayMs = 4_000;
  const intervalMs = 5 * 60_000;

  setTimeout(() => {
    reconcileMarketplaceDeliveries()
      .then((r) => {
        console.log(
          `[packDeliveryReconciler] boot sweep: scanned=${r.scanned} packs=${r.packsGranted} ebooks=${r.ebooksDelivered} errors=${r.errors}`,
        );
      })
      .catch((e) => console.warn("[packDeliveryReconciler] boot sweep err:", e?.message));
  }, bootDelayMs);

  _timer = setInterval(() => {
    reconcileMarketplaceDeliveries()
      .then((r) => {
        if (r.packsGranted > 0 || r.ebooksDelivered > 0 || r.errors > 0) {
          console.log(
            `[packDeliveryReconciler] periodic sweep: scanned=${r.scanned} packs=${r.packsGranted} ebooks=${r.ebooksDelivered} errors=${r.errors}`,
          );
        }
      })
      .catch((e) => console.warn("[packDeliveryReconciler] periodic err:", e?.message));
  }, intervalMs);
}
