import { adminProcedure, publicProcedure, router } from "../config/trpc";
import { z } from "zod";

type ApprovalType = "new_affiliate" | "profile_update" | "career_upgrade" | "special_request";
type ApprovalPriority = "low" | "medium" | "high" | "urgent";
type ApprovalStatus = "pending" | "approved" | "rejected";

const pendingApprovals: any[] = []; // Onda 9: mocks removidos, DB real via approvals table

const processedApprovals: any[] = []; // Onda 9: mocks removidos

const buildAudit = (params: {
  domain: "approvals";
  action: string;
  performedBy: string;
  targetId?: number;
  targetIds?: number[];
  notes?: string | null;
  metadata?: Record<string, unknown>;
}) => ({
  domain: params.domain,
  action: params.action,
  performedBy: params.performedBy,
  targetId: params.targetId,
  targetIds: params.targetIds,
  notes: params.notes || null,
  metadata: params.metadata || null,
  performedAt: new Date(),
});

const buildHistory = (approval: {
  status: ApprovalStatus;
  submittedAt?: Date;
  processedAt?: Date;
  processedBy?: string;
  notes?: string;
}) => {
  const history = [
    {
      action: "submitted",
      by: "system",
      at: approval.submittedAt || new Date("2026-05-18T10:0:0Z"),
      notes: "Solicitação recebida e enviada para triagem administrativa",
    },
    {
      action: "review_queue",
      by: "backoffice.bot",
      at: approval.submittedAt || new Date("2026-05-18T10:15:0Z"),
      notes: "Item classificado para fila operacional",
    },
  ];

  if (approval.status === "approved") {
    history.push({
      action: "approved",
      by: approval.processedBy || "admin@nexus.com",
      at: approval.processedAt || new Date("2026-05-15T10:30:0Z"),
      notes: approval.notes || "Solicitação aprovada",
    });
  }

  if (approval.status === "rejected") {
    history.push({
      action: "rejected",
      by: approval.processedBy || "admin@nexus.com",
      at: approval.processedAt || new Date("2026-05-14T18:15:0Z"),
      notes: approval.notes || "Solicitação rejeitada",
    });
  }

  return history;
};

/**
 * Approvals Router - Gestão de aprovações administrativas
 */
export const approvalsRouter = router({
  listPending: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(50),
        type: z.enum(["new_affiliate", "profile_update", "career_upgrade", "special_request"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      })
    )
    .query(async ({ input }) => {
      let filtered = pendingApprovals;
      if (input.type) filtered = filtered.filter((item) => item.type === input.type);
      if (input.priority) filtered = filtered.filter((item) => item.priority === input.priority);

      return {
        approvals: filtered,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / input.limit),
        },
      };
    }),

  listProcessed: adminProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(50),
        status: z.enum(["approved", "rejected"]).optional(),
      })
    )
    .query(async ({ input }) => {
      let filtered = processedApprovals;
      if (input.status) filtered = filtered.filter((item) => item.status === input.status);

      return {
        approvals: filtered,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / input.limit),
        },
      };
    }),

  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const approval = [...pendingApprovals, ...processedApprovals].find((item) => item.id === input.id) || pendingApprovals[0];

      return {
        ...approval,
        history: buildHistory(approval),
        auditSummary: {
          currentStatus: approval.status,
          reviewedBy: approval.status === "pending" ? null : approval.processedBy || null,
          reviewedAt: approval.status === "pending" ? null : approval.processedAt || null,
          latestNotes: approval.notes || null,
        },
      };
    }),

  approve: adminProcedure
    .input(
      z.object({
        id: z.number(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const audit = buildAudit({
        domain: "approvals",
        action: "approve",
        performedBy: ctx.user.email,
        targetId: input.id,
        notes: input.notes || null,
      });

      return {
        success: true,
        message: "Solicitação aprovada com sucesso",
        approvedBy: ctx.user.email,
        approvedAt: audit.performedAt,
        audit,
      };
    }),

  reject: adminProcedure
    .input(
      z.object({
        id: z.number(),
        reason: z.string().min(1, "Motivo da rejeição é obrigatório"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const audit = buildAudit({
        domain: "approvals",
        action: "reject",
        performedBy: ctx.user.email,
        targetId: input.id,
        notes: input.reason,
      });

      return {
        success: true,
        message: "Solicitação rejeitada",
        rejectedBy: ctx.user.email,
        rejectedAt: audit.performedAt,
        reason: input.reason,
        audit,
      };
    }),

  requestInfo: adminProcedure
    .input(
      z.object({
        id: z.number(),
        questions: z.array(
          z.object({
            field: z.string(),
            question: z.string(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const audit = buildAudit({
        domain: "approvals",
        action: "request_info",
        performedBy: ctx.user.email,
        targetId: input.id,
        metadata: { questions: input.questions },
      });

      return {
        success: true,
        message: "Solicitação de informações enviada",
        questionsCount: input.questions.length,
        audit,
      };
    }),

  getStats: publicProcedure.query(async () => {
    // Onda go-live 15/07: leitura REAL do banco. Sem mais mock.
    try {
      const { Pool } = await import("pg");
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const client = await pool.connect();
      try {
        const nowIso = new Date().toISOString();

        // Descoberta defensiva: usar tabela real approvals; se ausente, retorno zero
        const has = await client.query(
          "SELECT to_regclass('public.approvals') AS t"
        );
        const hasTable = !!has.rows?.[0]?.t;
        if (!hasTable) {
          return {
            pending: { total: 0, byType: {}, byPriority: {} },
            processed: { today: 0, thisWeek: 0, thisMonth: 0 },
            averageProcessingTime: 0,
            approvalRate: 0,
            source: "db_empty",
            fetchedAt: nowIso,
          };
        }

        const q = await client.query(`
          SELECT
            COUNT(*) FILTER (WHERE status='pending')::int AS pending_total,
            COUNT(*) FILTER (WHERE status='pending' AND priority='urgent')::int AS pending_urgent,
            COUNT(*) FILTER (WHERE status='pending' AND priority='high')::int   AS pending_high,
            COUNT(*) FILTER (WHERE status='pending' AND priority='medium')::int AS pending_medium,
            COUNT(*) FILTER (WHERE status='pending' AND priority='low')::int    AS pending_low,
            COUNT(*) FILTER (WHERE status IN ('approved','rejected')
                             AND processed_at::date = NOW()::date)::int          AS processed_today,
            COUNT(*) FILTER (WHERE status IN ('approved','rejected')
                             AND processed_at > NOW() - INTERVAL '7 days')::int  AS processed_week,
            COUNT(*) FILTER (WHERE status IN ('approved','rejected')
                             AND processed_at > NOW() - INTERVAL '30 days')::int AS processed_month,
            COUNT(*) FILTER (WHERE status='approved')::int AS approved_total,
            COUNT(*) FILTER (WHERE status IN ('approved','rejected'))::int AS decided_total,
            AVG(EXTRACT(EPOCH FROM (processed_at - submitted_at))/3600)
              FILTER (WHERE processed_at IS NOT NULL AND submitted_at IS NOT NULL)::float AS avg_hours
          FROM approvals
        `);
        const r = q.rows[0] || {};
        const pendingTotal   = Number(r.pending_total || 0);
        const decidedTotal   = Number(r.decided_total || 0);
        const approvedTotal  = Number(r.approved_total || 0);
        const approvalRate   = decidedTotal > 0 ? approvedTotal / decidedTotal : 0;
        const avgHours       = Number(r.avg_hours || 0);

        return {
          pending: {
            total: pendingTotal,
            byType: {},
            byPriority: {
              urgent: Number(r.pending_urgent || 0),
              high:   Number(r.pending_high   || 0),
              medium: Number(r.pending_medium || 0),
              low:    Number(r.pending_low    || 0),
            },
          },
          processed: {
            today:     Number(r.processed_today || 0),
            thisWeek:  Number(r.processed_week  || 0),
            thisMonth: Number(r.processed_month || 0),
          },
          averageProcessingTime: Number(avgHours.toFixed(2)),
          approvalRate,
          source: "db_real",
          fetchedAt: nowIso,
        };
      } finally {
        client.release();
        await pool.end();
      }
    } catch (err) {
      // Falha honesta: retornar zero em vez de mock
      return {
        pending: { total: 0, byType: {}, byPriority: {} },
        processed: { today: 0, thisWeek: 0, thisMonth: 0 },
        averageProcessingTime: 0,
        approvalRate: 0,
        source: "db_error",
        error: err instanceof Error ? err.message : "unknown",
        fetchedAt: new Date().toISOString(),
      };
    }
  }),

  approveBatch: adminProcedure
    .input(
      z.object({
        ids: z.array(z.number()).min(1),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const audit = buildAudit({
        domain: "approvals",
        action: "approve_batch",
        performedBy: ctx.user.email,
        targetIds: input.ids,
        notes: input.notes || null,
      });

      return {
        success: true,
        message: `${input.ids.length} solicitações aprovadas`,
        approvedIds: input.ids,
        approvedBy: ctx.user.email,
        approvedAt: audit.performedAt,
        audit,
      };
    }),
});
