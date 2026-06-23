/**
 * packEntitlementsRouter — endpoints tRPC para gestão de entregas de Pack.
 *
 * Caminhos:
 *   - listMyGrants        : grants do usuário logado
 *   - listMyLibrary       : ebooks recebidos via packs (visão consolidada)
 *   - confirmAndGrant     : (admin/manual) confirma um pagamento PIX manual e dispara grant
 *   - redeliver           : reentrega (sorteia mais do pool restante) — útil se faltou
 *   - simulateGrant       : admin-only — simula entrega sem pagamento (testes)
 */
import { z } from "zod";
import { adminProcedure, protectedProcedure, router } from "../config/trpc";
import { Pool } from "pg";
let _pool: Pool | null = null;
function getPool(): Pool {
  if (!_pool) {
    const connStr = process.env.DATABASE_URL;
    if (!connStr) throw new Error("DATABASE_URL not configured");
    _pool = new Pool({ connectionString: connStr, max: 10 });
  }
  return _pool;
}
import {
  grantPackToUser,
  listUserGrants,
  redeliverPackForUser,
  PACK_EBOOK_QUOTA,
} from "../services/packEntitlementService";

function ctxUserId(ctx: any): number {
  return ctx?.user?.id ?? 0;
}

export const packEntitlementsRouter = router({
  /**
   * Lista grants do usuário logado.
   */
  listMyGrants: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctxUserId(ctx);
    if (!userId) return { grants: [] };
    try {
      const grants = await listUserGrants(userId);
      return { grants, totalGrants: grants.length };
    } catch (e: any) {
      return { grants: [], error: e?.message };
    }
  }),

  /**
   * Lista ebooks do usuário entregues via Pack (visão consolidada para Loja/Estoque).
   */
  listMyLibrary: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctxUserId(ctx);
    if (!userId) return { items: [], total: 0 };
    const client = await getPool().connect();
    try {
      const r = await client.query(
        `SELECT l.ebook_slug, l.source_pack_slug, l.source_type, l.acquired_at,
                e.title, e.subtitle, e.category, e.pages, e.html_path, e.pdf_path, e.cover_path,
                e.collection_rank, e.resale_price_cents, e.cost_cents
           FROM marketplace_user_library l
           JOIN marketplace_ebooks e ON e.slug = l.ebook_slug
          WHERE l.user_id=$1 AND l.delivered=TRUE
          ORDER BY l.acquired_at DESC`,
        [userId],
      );
      const items = r.rows.map((row: any) => ({
        slug: row.ebook_slug,
        title: row.title,
        subtitle: row.subtitle,
        category: row.category,
        pages: row.pages,
        htmlPath: row.html_path,
        pdfPath: row.pdf_path,
        coverPath: row.cover_path,
        collectionRank: row.collection_rank,
        sourcePackSlug: row.source_pack_slug,
        sourceType: row.source_type,
        acquiredAt: row.acquired_at?.toISOString?.() ?? String(row.acquired_at),
        resalePriceCents: row.resale_price_cents,
        costCents: row.cost_cents,
      }));
      return { items, total: items.length };
    } finally {
      client.release();
    }
  }),

  /**
   * Confirma pagamento PIX manual (admin/affiliate confirma transferência recebida)
   * e dispara entrega do pack. Usado quando o webhook automático não chega.
   */
  confirmAndGrant: protectedProcedure
    .input(
      z.object({
        packSlug: z.string().min(2),
        paymentRef: z.string().min(2),
        amountCents: z.number().int().min(0).optional(),
        paymentMethod: z.string().optional().default("pix"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctxUserId(ctx);
      if (!userId) return { ok: false, message: "Usuário não autenticado" };
      const result = await grantPackToUser(userId, input.packSlug, {
        paymentRef: input.paymentRef,
        paymentMethod: input.paymentMethod ?? "pix",
        amountCents: input.amountCents,
      });
      return result;
    }),

  /**
   * Reentrega: tenta entregar mais ebooks do pool restante.
   */
  redeliver: protectedProcedure
    .input(z.object({ packSlug: z.string().min(2) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctxUserId(ctx);
      if (!userId) return { ok: false, message: "Usuário não autenticado" };
      return await redeliverPackForUser(userId, input.packSlug);
    }),

  /**
   * Quota table (público) — útil para frontend mostrar quantos ebooks cada pack entrega.
   */
  quotaTable: protectedProcedure.query(() => {
    return Object.entries(PACK_EBOOK_QUOTA).map(([slug, quota]) => ({ slug, quota }));
  }),

  /**
   * Admin-only: simula entrega de qualquer pack para qualquer userId.
   */
  adminGrant: adminProcedure
    .input(
      z.object({
        userId: z.number().int().min(1),
        packSlug: z.string().min(2),
        paymentRef: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return await grantPackToUser(input.userId, input.packSlug, {
        paymentRef: input.paymentRef ?? `admin:${Date.now()}`,
        paymentMethod: "admin",
      });
    }),
});
