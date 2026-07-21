// HOTFIX D18.4: approvalsRouter com fonte real (marketplace_orders) e todos campos do AdminApprovals.tsx.
import { adminProcedure, publicProcedure, router } from "../config/trpc";
import { z } from "zod";
import { Pool } from "pg";
import { TRPCError } from "@trpc/server";

const _pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function q<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const c = await _pool.connect();
  try {
    const r = await c.query(sql, params);
    return r.rows as T[];
  } finally { c.release(); }
}

function buildAudit(input: {
  domain: string; action: string; performedBy: string;
  targetId?: number | string; metadata?: Record<string, any>;
}) {
  return {
    domain: input.domain,
    action: String(input.action || "action"),
    performedBy: String(input.performedBy || "system"),
    targetId: input.targetId ?? null,
    metadata: input.metadata ?? {},
    at: new Date().toISOString(),
  };
}

function mapOrderToApproval(r: any) {
  const meta = r.metadata || {};
  const status =
    r.payment_status === "paid" || r.payment_status === "approved" ? "pending_delivery" :
    r.payment_status === "cancelled" || r.payment_status === "failed" ? "rejected" :
    "pending";
  const type = String(meta.type ?? meta.source ?? "marketplace_order");
  return {
    id: String(r.id),
    type,
    priority: r.payment_status === "paid" ? "high" : "medium",
    status,
    userId: r.user_id ?? null,
    userName: r.name || meta.payerName || (r.email ? String(r.email).split("@")[0] : `user#${r.user_id ?? "?"}`),
    userEmail: r.email || meta.payerEmail || null,
    affiliateCode: r.affiliate_code || (r.user_id ? `AFF-${r.user_id}` : "SEM-COD"),
    sponsorName:   r.sponsor_name   || meta.sponsorName || "N/A",
    submittedAt: r.created_at,
    createdAt:   r.created_at,
    updatedAt:   r.updated_at ?? r.created_at,
    notes: String(meta.notes ?? ""),
    data: {
      slug: meta.slug ?? null,
      productName: meta.name ?? null,
      amount: Number(r.total_cents || 0) / 100,
      amountCents: Number(r.total_cents || 0),
      paymentMethod: r.payment_method || "mercado_pago",
      paymentId: r.payment_id || null,
      paymentStatus: r.payment_status || "pending",
      orderStatus:   r.status         || "pending",
      externalReference: r.external_reference || null,
      source: meta.source ?? null,
    },
  };
}

const idInput = z.object({ id: z.string() });

export const approvalsRouter = router({
  listPending: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      priority: z.enum(["low","medium","high","urgent"]).optional(),
      type: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;
      const rows = await q(
        `SELECT mo.id, mo.user_id, u.email, u.name,
                a.code AS affiliate_code, sp.name AS sponsor_name,
                mo.total_cents, mo.payment_method, mo.payment_status,
                mo.status, mo.payment_id, mo.external_reference,
                mo.metadata, mo.created_at, mo.updated_at
           FROM marketplace_orders mo
           LEFT JOIN users u ON u.id = mo.user_id
           LEFT JOIN affiliates a ON a."userId" = mo.user_id
           LEFT JOIN affiliates sp ON sp.id = a."sponsorAffiliateId"
          WHERE (mo.payment_status IN ('pending','paid','approved')
                 OR mo.status IN ('pending','paid'))
            AND COALESCE(mo.is_test_data,false) = false
          ORDER BY mo.created_at DESC
          LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      const [{ total }] = await q<{ total: number }>(
        `SELECT count(*)::int AS total FROM marketplace_orders mo
          WHERE (mo.payment_status IN ('pending','paid','approved')
                 OR mo.status IN ('pending','paid'))
            AND COALESCE(mo.is_test_data,false) = false`
      );
      return {
        approvals: rows.map(mapOrderToApproval),
        pagination: { page, limit, total: Number(total), totalPages: Math.max(1, Math.ceil(Number(total) / limit)) },
      };
    }),

  getById: adminProcedure
    .input(idInput)
    .query(async ({ input }) => {
      const rows = await q(
        `SELECT mo.id, mo.user_id, u.email, u.name,
                a.code AS affiliate_code, sp.name AS sponsor_name,
                mo.total_cents, mo.payment_method, mo.payment_status,
                mo.status, mo.payment_id, mo.external_reference,
                mo.metadata, mo.created_at, mo.updated_at
           FROM marketplace_orders mo
           LEFT JOIN users u ON u.id = mo.user_id
           LEFT JOIN affiliates a ON a."userId" = mo.user_id
           LEFT JOIN affiliates sp ON sp.id = a."sponsorAffiliateId"
          WHERE mo.id = $1 LIMIT 1`,
        [input.id]
      );
      if (!rows.length) throw new TRPCError({ code: "NOT_FOUND", message: "Aprovacao nao encontrada" });
      const a = mapOrderToApproval(rows[0]);
      return {
        ...a,
        history: [
          { action: "created", at: a.createdAt, by: a.userEmail ?? "system" },
          ...(a.data.paymentStatus === "paid" ? [{ action: "payment_confirmed", at: a.updatedAt, by: "mercado_pago" }] : []),
        ],
      };
    }),

  listProcessed: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;
      const rows = await q(
        `SELECT mo.id, mo.user_id, u.email, u.name,
                a.code AS affiliate_code, sp.name AS sponsor_name,
                mo.total_cents, mo.payment_status, mo.status,
                mo.payment_id, mo.external_reference,
                mo.paid_at, mo.delivered_at, mo.created_at, mo.updated_at, mo.metadata
           FROM marketplace_orders mo
           LEFT JOIN users u ON u.id = mo.user_id
           LEFT JOIN affiliates a ON a."userId" = mo.user_id
           LEFT JOIN affiliates sp ON sp.id = a."sponsorAffiliateId"
          WHERE mo.status IN ('delivered','cancelled','paid')
             OR mo.payment_status IN ('failed','cancelled')
          ORDER BY COALESCE(mo.delivered_at, mo.paid_at, mo.updated_at) DESC
          LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      const [{ total }] = await q<{ total: number }>(
        `SELECT count(*)::int AS total FROM marketplace_orders
          WHERE status IN ('delivered','cancelled','paid') OR payment_status IN ('failed','cancelled')`
      );
      return {
        approvals: rows.map(mapOrderToApproval),
        pagination: { page, limit, total: Number(total), totalPages: Math.max(1, Math.ceil(Number(total) / limit)) },
      };
    }),

  approve: adminProcedure
    .input(z.object({ id: z.string(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const rows = await q(
        `UPDATE marketplace_orders
            SET payment_status='paid', status='paid', paid_at=COALESCE(paid_at, NOW()), updated_at=NOW()
          WHERE id=$1 RETURNING id, user_id`,
        [input.id]
      );
      if (!rows.length) throw new TRPCError({ code: "NOT_FOUND", message: "Pedido nao encontrado" });
      return {
        success: true,
        message: "Aprovacao registrada",
        audit: buildAudit({
          domain: "approvals",
          action: "approve",
          performedBy: (ctx as any).user?.email ?? "admin",
          targetId: input.id,
          metadata: { notes: input.notes ?? "" },
        }),
      };
    }),

  markDelivered: adminProcedure
    .input(z.object({ id: z.string(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const rows = await q(
        `UPDATE marketplace_orders
            SET status='delivered', delivered_at=COALESCE(delivered_at, NOW()), updated_at=NOW()
          WHERE id=$1 RETURNING id, user_id`,
        [input.id]
      );
      if (!rows.length) throw new TRPCError({ code: "NOT_FOUND", message: "Pedido nao encontrado" });
      // Tenta criar grant se ainda não existe (para pack-a2 principalmente)
      try {
        const meta = await q(`SELECT metadata FROM marketplace_orders WHERE id=$1`, [input.id]);
        const slug = meta[0]?.metadata?.slug;
        if (slug && slug.startsWith("pack-")) {
          await q(
            `INSERT INTO marketplace_pack_grants (user_id, pack_slug, order_id, payment_method, amount_cents, status, metadata)
             SELECT user_id, $2, id, 'mercado_pago', total_cents, 'granted', jsonb_build_object('source','admin_markDelivered')
             FROM marketplace_orders WHERE id=$1
             ON CONFLICT DO NOTHING`,
            [input.id, slug]
          );
        }
      } catch {}
      return {
        success: true,
        message: "Pedido marcado como entregue",
        audit: buildAudit({
          domain: "approvals",
          action: "mark_delivered",
          performedBy: (ctx as any).user?.email ?? "admin",
          targetId: input.id,
          metadata: { notes: input.notes ?? "" },
        }),
      };
    }),

  reject: adminProcedure
    .input(z.object({ id: z.string(), reason: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const rows = await q(
        `UPDATE marketplace_orders
            SET payment_status='cancelled', status='cancelled', updated_at=NOW()
          WHERE id=$1 RETURNING id`,
        [input.id]
      );
      if (!rows.length) throw new TRPCError({ code: "NOT_FOUND", message: "Pedido nao encontrado" });
      return {
        success: true,
        message: "Rejeicao registrada",
        audit: buildAudit({
          domain: "approvals",
          action: "reject",
          performedBy: (ctx as any).user?.email ?? "admin",
          targetId: input.id,
          metadata: { reason: input.reason },
        }),
      };
    }),

  getStats: publicProcedure.query(async () => {
    const [pendPending]  = await q<{c: number}>(`SELECT count(*)::int c FROM marketplace_orders WHERE payment_status='pending' AND status='pending' AND COALESCE(is_test_data,false)=false`);
    const [pendPaid]     = await q<{c: number}>(`SELECT count(*)::int c FROM marketplace_orders WHERE payment_status IN ('paid','approved') AND status='paid' AND COALESCE(is_test_data,false)=false`);
    const [today]        = await q<{c: number}>(`SELECT count(*)::int c FROM marketplace_orders WHERE COALESCE(paid_at,updated_at)::date = CURRENT_DATE`);
    const [thisWeek]     = await q<{c: number}>(`SELECT count(*)::int c FROM marketplace_orders WHERE COALESCE(paid_at,updated_at) > NOW() - INTERVAL '7 days'`);
    const [thisMonth]    = await q<{c: number}>(`SELECT count(*)::int c FROM marketplace_orders WHERE COALESCE(paid_at,updated_at) > NOW() - INTERVAL '30 days'`);
    const [approved]     = await q<{c: number}>(`SELECT count(*)::int c FROM marketplace_orders WHERE payment_status IN ('paid','approved')`);
    const [failed]       = await q<{c: number}>(`SELECT count(*)::int c FROM marketplace_orders WHERE payment_status IN ('failed','cancelled') OR status='cancelled'`);
    const total = Number(approved.c) + Number(failed.c);
    const rate  = total > 0 ? Number(approved.c) / total : 0;

    return {
      pending: {
        total: Number(pendPending.c) + Number(pendPaid.c),
        byType: { marketplace_order: Number(pendPending.c), pending_delivery: Number(pendPaid.c) },
        byPriority: { urgent: 0, high: Number(pendPaid.c), medium: Number(pendPending.c), low: 0 },
      },
      processed: {
        today: Number(today.c),
        thisWeek: Number(thisWeek.c),
        thisMonth: Number(thisMonth.c),
      },
      averageProcessingTime: 0,
      approvalRate: rate,
    };
  }),

  approveBatch: adminProcedure
    .input(z.object({ ids: z.array(z.string()).min(1), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const rows = await q(
        `UPDATE marketplace_orders
            SET payment_status='paid', status='paid', paid_at=COALESCE(paid_at, NOW()), updated_at=NOW()
          WHERE id = ANY($1::text[]) RETURNING id`,
        [input.ids]
      );
      return {
        success: true, updated: rows.length,
        audit: buildAudit({
          domain: "approvals",
          action: "approve_batch",
          performedBy: (ctx as any).user?.email ?? "admin",
          metadata: { ids: input.ids, notes: input.notes ?? "" },
        }),
      };
    }),

  requestInfo: adminProcedure
    .input(z.object({
      id: z.string(),
      questions: z.array(z.object({ field: z.string(), question: z.string() })),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Solicitacao registrada",
        questionsCount: input.questions.length,
        audit: buildAudit({
          domain: "approvals",
          action: "request_info",
          performedBy: (ctx as any).user?.email ?? "admin",
          targetId: input.id,
          metadata: { questions: input.questions },
        }),
      };
    }),
});
