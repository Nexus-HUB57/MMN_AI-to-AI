/**
 * packEntitlementService — Entrega automática de Pack/Upgrade
 *
 * Acoplado ao fluxo PIX: ao confirmar pagamento de um Pack (A², A²II, A²III,
 * AG, AGII, AGIII, AGN, AGNII, AGNIII, AO, AOII, AOIII, AA, AAII, AAIII),
 * sorteia N ebooks (Fisher-Yates auditável) e adiciona à biblioteca do usuário
 * + estoque da Loja.
 *
 * CEO-014: Sincronizado com Protocolo_Pack (docs/planning/Protocolo_Pack).
 * As quotas oficiais de ebooks agora vêm de packProtocolService.
 *
 * Idempotente via tabela marketplace_pack_grants (uniq user+pack+payment_ref).
 * Usa Pool nativo do PG para evitar acoplamento com drizzle.
 */
import crypto from "node:crypto";
import { Pool } from "pg";
import { PACK_PROTOCOL, getOfficialEbookQuota } from "./packProtocolService";
let _pool: Pool | null = null;
function getPool(): Pool {
  if (!_pool) {
    const connStr = process.env.DATABASE_URL;
    if (!connStr) throw new Error("DATABASE_URL not configured");
    _pool = new Pool({ connectionString: connStr, max: 10 });
  }
  return _pool;
}

/**
 * CEO-014: Quota oficial de e-books por pack — SINCRONIZADA com Protocolo_Pack.
 * Fonte de verdade: packProtocolService.ts → docs/planning/Protocolo_Pack
 *
 * Mantido para compatibilidade com affiliateStoreRouter e outros consumidores.
 * Antes: quotas divergentes (AGN=1100 vs oficial=1000, etc.).
 */
export const PACK_EBOOK_QUOTA: Record<string, number> = Object.fromEntries(
  Object.entries(PACK_PROTOCOL).map(([slug, p]) => [slug, p.ebookQuota]),
);

// Re-export para consumo externo
export { PACK_PROTOCOL, getPackProtocol, getAllPackSlugs, PACK_QUOTA_DIVERGENCES } from "./packProtocolService";

export interface GrantResult {
  ok: boolean;
  alreadyGranted: boolean;
  packSlug: string;
  userId: number;
  delivered: number;
  poolSize: number;
  drawnSlugs: string[];
  seed?: string;
  grantId?: number;
  orderId?: string;
  message: string;
}

function fisherYatesShuffle<T>(arr: T[], seedHex: string): T[] {
  const out = [...arr];
  let cursor = 0;
  let entropy = seedHex;
  const nextByte = () => {
    const b = parseInt(entropy.slice(cursor, cursor + 2), 16);
    cursor += 2;
    if (cursor >= entropy.length) {
      entropy = entropy + crypto.createHash("sha256").update(entropy).digest("hex");
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

function makeOrderId(): string {
  return `gr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Entrega um Pack a um usuário: sorteia N ebooks do pool elegível e adiciona
 * à biblioteca. Idempotente por (user, pack, paymentRef).
 *
 * @param userId        ID do usuário (FK users.id)
 * @param packSlug      slug do pack (ex.: "pack-a2")
 * @param opts.paymentRef  identificador único do pagamento (txid/endToEndId/payment_id)
 * @param opts.paymentMethod  "pix" | "card" | "manual" | ...
 * @param opts.amountCents    valor pago em centavos
 */
export async function grantPackToUser(
  userId: number,
  packSlug: string,
  opts: { paymentRef?: string; paymentMethod?: string; amountCents?: number } = {},
): Promise<GrantResult> {
  if (!userId || !packSlug) {
    return {
      ok: false,
      alreadyGranted: false,
      packSlug,
      userId,
      delivered: 0,
      poolSize: 0,
      drawnSlugs: [],
      message: "userId e packSlug são obrigatórios",
    };
  }

  const quota = PACK_EBOOK_QUOTA[packSlug] ?? 0;
  if (quota <= 0) {
    return {
      ok: false,
      alreadyGranted: false,
      packSlug,
      userId,
      delivered: 0,
      poolSize: 0,
      drawnSlugs: [],
      message: `Pack ${packSlug} não possui quota de e-books definida`,
    };
  }

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");

    // Idempotência: já existe grant para esta combinação?
    if (opts.paymentRef) {
      const exist = await client.query(
        `SELECT id, delivered_count, pool_size FROM marketplace_pack_grants
          WHERE user_id=$1 AND pack_slug=$2 AND payment_ref=$3
          LIMIT 1`,
        [userId, packSlug, opts.paymentRef],
      );
      if (exist.rows.length > 0) {
        await client.query("ROLLBACK");
        return {
          ok: true,
          alreadyGranted: true,
          packSlug,
          userId,
          delivered: exist.rows[0].delivered_count,
          poolSize: exist.rows[0].pool_size,
          drawnSlugs: [],
          grantId: exist.rows[0].id,
          message: "Grant já existente para esta referência de pagamento",
        };
      }
    }

    // Pool: ebooks ativos do pack que o usuário AINDA NÃO possui
    const pool = await client.query(
      `SELECT slug FROM marketplace_ebooks
        WHERE unlock_pack_slug=$1 AND status='active'
          AND slug NOT IN (SELECT ebook_slug FROM marketplace_user_library WHERE user_id=$2)`,
      [packSlug, userId],
    );
    const poolSlugs = pool.rows.map((r: any) => r.slug as string);

    // CEO-014: Se o pool está vazio mas o usuário já possui os livros (ex.: pack-founder cobre pack-a2),
    // registrar o grant anyway e atualizar source_pack_slug na library para atribuir corretamente.
    if (poolSlugs.length === 0) {
      // Contar quantos livros do pack o usuário já possui
      const ownedCount = await client.query(
        `SELECT COUNT(*) as cnt FROM marketplace_user_library
          WHERE user_id=$1 AND ebook_slug IN (
            SELECT slug FROM marketplace_ebooks WHERE unlock_pack_slug=$2 AND status='active'
          )`,
        [userId, packSlug],
      );
      const alreadyOwned = Number(ownedCount.rows[0]?.cnt ?? 0);

      if (alreadyOwned > 0) {
        // CEO-014: Atualizar source_pack_slug dos livros existentes para incluir este pack
        await client.query(
          `UPDATE marketplace_user_library
             SET source_pack_slug = $1,
                 source_type = 'pack_grant',
                 delivered = TRUE
           WHERE user_id=$2
             AND ebook_slug IN (
               SELECT slug FROM marketplace_ebooks WHERE unlock_pack_slug=$3 AND status='active'
             )
             AND (source_pack_slug IS NULL OR source_pack_slug != $1)`,
          [packSlug, userId, packSlug],
        );

        // Registrar o grant mesmo assim (com delivered_count = já possuídos)
        const orderId = makeOrderId();
        await client.query(
          `INSERT INTO marketplace_orders (id, user_id, status, subtotal_cents, total_cents,
                                           payment_method, payment_status, payment_id, paid_at)
           VALUES ($1, $2, 'paid', $3, $3, $4, 'paid', $5, NOW())`,
          [orderId, userId, opts.amountCents ?? 0, opts.paymentMethod ?? "pix", opts.paymentRef ?? null],
        );
        await client.query(
          `INSERT INTO marketplace_order_items
             (order_id, item_type, item_slug, title, unit_price_cents, quantity, pack_ebook_quota)
           VALUES ($1, 'pack', $2, $3, $4, 1, $5)`,
          [orderId, packSlug, `Pack ${packSlug}`, opts.amountCents ?? 0, quota],
        );

        const grantInsert = await client.query(
          `INSERT INTO marketplace_pack_grants
             (user_id, pack_slug, order_id, payment_ref, payment_method, amount_cents,
              delivered_count, pool_size, status, metadata)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'granted', $9::jsonb)
           RETURNING id`,
          [
            userId, packSlug, orderId, opts.paymentRef ?? null,
            opts.paymentMethod ?? "pix", opts.amountCents ?? 0,
            alreadyOwned, alreadyOwned,
            JSON.stringify({ ceo014: true, alreadyOwnedFromHigherTier: true, message: `Usuario ja possuia ${alreadyOwned} ebooks do pack ${packSlug} de um pacote superior` }),
          ],
        );

        await client.query("COMMIT");
        return {
          ok: true,
          alreadyGranted: false,
          packSlug,
          userId,
          delivered: alreadyOwned,
          poolSize: alreadyOwned,
          drawnSlugs: [],
          grantId: grantInsert.rows[0].id,
          orderId,
          message: `CEO-014: Pack ${packSlug} registrado — usuario ja possuia ${alreadyOwned} ebooks (pack superior). Atribuicao atualizada.`,
        };
      }

      await client.query("ROLLBACK");
      return {
        ok: true,
        alreadyGranted: true,
        packSlug,
        userId,
        delivered: 0,
        poolSize: 0,
        drawnSlugs: [],
        message: "Pool vazio: usuario ja possui todos os e-books do pack",
      };
    }

    const seed = crypto
      .createHash("sha256")
      .update(`${userId}:${packSlug}:${opts.paymentRef ?? "auto"}:${Date.now()}`)
      .digest("hex");
    const shuffled = fisherYatesShuffle(poolSlugs, seed);
    const drawn = shuffled.slice(0, Math.min(quota, shuffled.length));

    // Cria order virtual para auditoria
    const orderId = makeOrderId();
    await client.query(
      `INSERT INTO marketplace_orders (id, user_id, status, subtotal_cents, total_cents,
                                       payment_method, payment_status, payment_id, paid_at)
       VALUES ($1, $2, 'paid', $3, $3, $4, 'paid', $5, NOW())`,
      [
        orderId,
        userId,
        opts.amountCents ?? 0,
        opts.paymentMethod ?? "pix",
        opts.paymentRef ?? null,
      ],
    );
    await client.query(
      `INSERT INTO marketplace_order_items
         (order_id, item_type, item_slug, title, unit_price_cents, quantity, pack_ebook_quota)
       VALUES ($1, 'pack', $2, $3, $4, 1, $5)`,
      [orderId, packSlug, `Pack ${packSlug}`, opts.amountCents ?? 0, quota],
    );

    // Insere na biblioteca
    let delivered = 0;
    for (const slug of drawn) {
      await client.query(
        `INSERT INTO marketplace_user_library
           (user_id, ebook_slug, source_order_id, source_type, source_pack_slug, delivered)
         VALUES ($1, $2, $3, 'pack_grant', $4, TRUE)
         ON CONFLICT (user_id, ebook_slug) DO NOTHING`,
        [userId, slug, orderId, packSlug],
      );
      delivered++;
    }

    // Registra auditoria do sorteio
    await client.query(
      `INSERT INTO marketplace_pack_drawings
         (user_id, order_id, pack_slug, pool_size, drawn_count, drawn_slugs, seed)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
      [userId, orderId, packSlug, poolSlugs.length, drawn.length, JSON.stringify(drawn), seed],
    );

    // Registra o grant
    const grantInsert = await client.query(
      `INSERT INTO marketplace_pack_grants
         (user_id, pack_slug, order_id, payment_ref, payment_method, amount_cents,
          delivered_count, pool_size, status, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'granted', $9::jsonb)
       RETURNING id`,
      [
        userId,
        packSlug,
        orderId,
        opts.paymentRef ?? null,
        opts.paymentMethod ?? "pix",
        opts.amountCents ?? 0,
        delivered,
        poolSlugs.length,
        JSON.stringify({ drawnSlugs: drawn, seed }),
      ],
    );

    await client.query("COMMIT");

    return {
      ok: true,
      alreadyGranted: false,
      packSlug,
      userId,
      delivered,
      poolSize: poolSlugs.length,
      drawnSlugs: drawn,
      seed,
      grantId: grantInsert.rows[0].id,
      orderId,
      message: `Pack ${packSlug} entregue: ${delivered} e-books sorteados de pool ${poolSlugs.length}`,
    };
  } catch (e: any) {
    await client.query("ROLLBACK").catch(() => undefined);
    return {
      ok: false,
      alreadyGranted: false,
      packSlug,
      userId,
      delivered: 0,
      poolSize: 0,
      drawnSlugs: [],
      message: `Erro ao entregar pack: ${e?.message ?? String(e)}`,
    };
  } finally {
    client.release();
  }
}

/**
 * Lista todos os grants ativos do usuário.
 */
export async function listUserGrants(userId: number) {
  const client = await getPool().connect();
  try {
    const r = await client.query(
      `SELECT pg.id, pg.pack_slug, pg.order_id, pg.payment_ref, pg.payment_method,
              pg.amount_cents, pg.delivered_count, pg.pool_size, pg.status, pg.created_at,
              (SELECT COUNT(*) FROM marketplace_user_library
                WHERE user_id=pg.user_id AND source_pack_slug=pg.pack_slug AND delivered=TRUE) AS owned_count
         FROM marketplace_pack_grants pg
        WHERE pg.user_id=$1
        ORDER BY pg.created_at DESC`,
      [userId],
    );
    return r.rows.map((row: any) => ({
      id: row.id,
      packSlug: row.pack_slug,
      orderId: row.order_id,
      paymentRef: row.payment_ref,
      paymentMethod: row.payment_method,
      amountCents: row.amount_cents,
      deliveredCount: row.delivered_count,
      poolSize: row.pool_size,
      ownedCount: Number(row.owned_count),
      expectedQuota: PACK_EBOOK_QUOTA[row.pack_slug] ?? 0,
      status: row.status,
      createdAt: row.created_at.toISOString?.() ?? String(row.created_at),
    }));
  } finally {
    client.release();
  }
}

/**
 * Reentrega: sorteia mais ebooks do pool restante (útil se houve falha
 * no sorteio inicial ou se o pool aumentou).
 */
export async function redeliverPackForUser(
  userId: number,
  packSlug: string,
): Promise<GrantResult> {
  return grantPackToUser(userId, packSlug, {
    paymentRef: `redeliver:${Date.now()}`,
    paymentMethod: "redeliver",
  });
}
