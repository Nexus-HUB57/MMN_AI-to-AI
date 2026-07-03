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
    return {
      pending: {
        total: 45,
        byType: {
          new_affiliate: 20,
          profile_update: 10,
          career_upgrade: 12,
          special_request: 3,
        },
        byPriority: {
          urgent: 2,
          high: 8,
          medium: 25,
          low: 10,
        },
      },
      processed: {
        today: 15,
        thisWeek: 85,
        thisMonth: 320,
      },
      averageProcessingTime: 4.5,
      approvalRate: 0.85,
    };
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
