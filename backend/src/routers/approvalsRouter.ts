import { adminProcedure, publicProcedure, router } from "../config/trpc";
import { z } from "zod";

type ApprovalType = "new_affiliate" | "profile_update" | "career_upgrade" | "special_request";
type ApprovalPriority = "low" | "medium" | "high" | "urgent";
type ApprovalStatus = "pending" | "approved" | "rejected";

const pendingApprovals = [
  {
    id: 1,
    type: "new_affiliate" as ApprovalType,
    priority: "medium" as ApprovalPriority,
    status: "pending" as const,
    userId: 201,
    userName: "Roberto Almeida",
    userEmail: "roberto@example.com",
    affiliateCode: "ROBERTO006",
    sponsorName: "João Silva",
    sponsorCode: "JOAO001",
    submittedAt: new Date("2026-05-18T10:00:00Z"),
    data: {
      plan: "premium",
      initialInvestment: 500.0,
      documentNumber: "123.456.789-00",
      phone: "(11) 99999-9999",
    },
  },
  {
    id: 2,
    type: "career_upgrade" as ApprovalType,
    priority: "high" as ApprovalPriority,
    status: "pending" as const,
    userId: 202,
    userName: "Fernanda Lima",
    userEmail: "fernanda@example.com",
    affiliateCode: "FERNANDA007",
    sponsorName: "Maria Santos",
    sponsorCode: "MARIA002",
    submittedAt: new Date("2026-05-17T14:30:00Z"),
    data: {
      currentLevel: 3,
      requestedLevel: 4,
      achievements: ["100 sales", "5 downline members"],
    },
  },
  {
    id: 3,
    type: "profile_update" as ApprovalType,
    priority: "low" as ApprovalPriority,
    status: "pending" as const,
    userId: 203,
    userName: "Marcos Pereira",
    userEmail: "marcos@example.com",
    affiliateCode: "MARCOS008",
    sponsorName: "Pedro Costa",
    sponsorCode: "PEDRO003",
    submittedAt: new Date("2026-05-16T09:15:00Z"),
    data: {
      field: "bank_account",
      oldValue: "Banco do Brasil",
      newValue: "NuBank",
    },
  },
  {
    id: 4,
    type: "special_request" as ApprovalType,
    priority: "urgent" as ApprovalPriority,
    status: "pending" as const,
    userId: 204,
    userName: "Julia Costa",
    userEmail: "julia@example.com",
    affiliateCode: "JULIA009",
    sponsorName: "Ana Oliveira",
    sponsorCode: "ANA004",
    submittedAt: new Date("2026-05-19T08:45:00Z"),
    data: {
      requestType: "custom_commission",
      requestedPercentage: 15,
      justification: "Alto volume de vendas",
    },
  },
  {
    id: 5,
    type: "new_affiliate" as ApprovalType,
    priority: "medium" as ApprovalPriority,
    status: "pending" as const,
    userId: 205,
    userName: "Ricardo Souza",
    userEmail: "ricardo@example.com",
    affiliateCode: "RICARDO010",
    sponsorName: "Carlos Mendes",
    sponsorCode: "CARLOS005",
    submittedAt: new Date("2026-05-19T16:00:00Z"),
    data: {
      plan: "basic",
      initialInvestment: 200.0,
    },
  },
];

const processedApprovals = [
  {
    id: 101,
    type: "new_affiliate" as ApprovalType,
    priority: "medium" as ApprovalPriority,
    status: "approved" as const,
    userId: 101,
    userName: "João Silva",
    userEmail: "joao@example.com",
    affiliateCode: "JOAO001",
    sponsorName: "Nexus Prime",
    sponsorCode: "NEXUS000",
    submittedAt: new Date("2026-05-13T11:00:00Z"),
    processedBy: "admin@nexus.com",
    processedAt: new Date("2026-05-15T10:30:00Z"),
    notes: "Documentação verificada",
    data: {
      plan: "premium",
      initialInvestment: 500.0,
    },
  },
  {
    id: 102,
    type: "career_upgrade" as ApprovalType,
    priority: "high" as ApprovalPriority,
    status: "rejected" as const,
    userId: 102,
    userName: "Maria Santos",
    userEmail: "maria@example.com",
    affiliateCode: "MARIA002",
    sponsorName: "João Silva",
    sponsorCode: "JOAO001",
    submittedAt: new Date("2026-05-12T09:00:00Z"),
    processedBy: "admin@nexus.com",
    processedAt: new Date("2026-05-14T18:15:00Z"),
    notes: "Não atende aos requisitos mínimos",
    data: {
      currentLevel: 2,
      requestedLevel: 4,
    },
  },
];

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
      at: approval.submittedAt || new Date("2026-05-18T10:00:00Z"),
      notes: "Solicitação recebida e enviada para triagem administrativa",
    },
    {
      action: "review_queue",
      by: "backoffice.bot",
      at: approval.submittedAt || new Date("2026-05-18T10:15:00Z"),
      notes: "Item classificado para fila operacional",
    },
  ];

  if (approval.status === "approved") {
    history.push({
      action: "approved",
      by: approval.processedBy || "admin@nexus.com",
      at: approval.processedAt || new Date("2026-05-15T10:30:00Z"),
      notes: approval.notes || "Solicitação aprovada",
    });
  }

  if (approval.status === "rejected") {
    history.push({
      action: "rejected",
      by: approval.processedBy || "admin@nexus.com",
      at: approval.processedAt || new Date("2026-05-14T18:15:00Z"),
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
