import { adminProcedure, protectedProcedure, publicProcedure, router } from "../config/trpc";
import { z } from "zod";
import {
  publishCommissionApproved,
  publishCommissionPaid,
  publishCommissionRejected,
} from "../domains/commissions/events";

type CommissionStatus = "pending" | "confirmed" | "paid" | "cancelled";

const mockCommissions = [
  {
    id: 1,
    affiliateId: 101,
    affiliateName: "João Silva",
    affiliateCode: "JOAO001",
    amount: 500.0,
    percentage: 10,
    level: 1,
    status: "pending" as const,
    source: "sale",
    sourceId: "ORDER-001",
    description: "Comissão sobre venda no Mercado Livre",
    createdAt: new Date("2026-05-15T12:00:00Z"),
    confirmedAt: null,
    paidAt: null,
  },
  {
    id: 2,
    affiliateId: 102,
    affiliateName: "Maria Santos",
    affiliateCode: "MARIA002",
    amount: 320.0,
    percentage: 8,
    level: 1,
    status: "confirmed" as const,
    source: "sale",
    sourceId: "ORDER-002",
    description: "Comissão confirmada após conciliação financeira",
    createdAt: new Date("2026-05-14T14:00:00Z"),
    confirmedAt: new Date("2026-05-16T10:00:00Z"),
    paidAt: null,
  },
  {
    id: 3,
    affiliateId: 103,
    affiliateName: "Pedro Costa",
    affiliateCode: "PEDRO003",
    amount: 750.0,
    percentage: 10,
    level: 1,
    status: "paid" as const,
    source: "sale",
    sourceId: "ORDER-003",
    description: "Comissão liquidada em ciclo semanal",
    createdAt: new Date("2026-05-10T09:00:00Z"),
    confirmedAt: new Date("2026-05-12T11:30:00Z"),
    paidAt: new Date("2026-05-18T15:00:00Z"),
  },
  {
    id: 4,
    affiliateId: 104,
    affiliateName: "Ana Oliveira",
    affiliateCode: "ANA004",
    amount: 180.0,
    percentage: 6,
    level: 2,
    status: "pending" as const,
    source: "sale",
    sourceId: "ORDER-004",
    description: "Comissão de segundo nível aguardando validação",
    createdAt: new Date("2026-05-18T17:45:00Z"),
    confirmedAt: null,
    paidAt: null,
  },
  {
    id: 5,
    affiliateId: 105,
    affiliateName: "Carlos Mendes",
    affiliateCode: "CARLOS005",
    amount: 420.0,
    percentage: 7,
    level: 1,
    status: "cancelled" as const,
    source: "sale",
    sourceId: "ORDER-005",
    description: "Comissão cancelada por estorno da origem",
    createdAt: new Date("2026-05-08T13:20:00Z"),
    confirmedAt: null,
    paidAt: null,
  },
];

const buildAudit = (params: {
  domain: "commissions";
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

const buildHistory = (commission: {
  createdAt?: Date;
  confirmedAt?: Date | null;
  paidAt?: Date | null;
  status: CommissionStatus;
  description?: string;
}) => {
  const history = [
    {
      action: "created",
      by: "system",
      at: commission.createdAt || new Date("2026-05-15T12:00:00Z"),
      notes: commission.description || "Comissão gerada",
    },
  ];

  if (commission.confirmedAt) {
    history.push({
      action: "confirmed",
      by: "finance@nexus.com",
      at: commission.confirmedAt,
      notes: "Comissão validada para processamento financeiro",
    });
  }

  if (commission.paidAt) {
    history.push({
      action: "paid",
      by: "finance@nexus.com",
      at: commission.paidAt,
      notes: "Comissão liquidada ao afiliado",
    });
  }

  if (commission.status === "cancelled") {
    history.push({
      action: "cancelled",
      by: "finance@nexus.com",
      at: new Date("2026-05-09T10:00:00Z"),
      notes: "Origem cancelada ou estornada",
    });
  }

  return history;
};

/**
 * Commissions Router - Gestão de comissões
 */
export const commissionsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(50),
        status: z.enum(["pending", "confirmed", "paid", "cancelled"]).optional(),
        affiliateId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      let filtered = mockCommissions;
      if (input.status) filtered = filtered.filter((item) => item.status === input.status);
      if (input.affiliateId) filtered = filtered.filter((item) => item.affiliateId === input.affiliateId);

      return {
        commissions: filtered,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / input.limit),
        },
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const commission = mockCommissions.find((item) => item.id === input.id) || mockCommissions[0];

      return {
        ...commission,
        history: buildHistory(commission),
        auditSummary: {
          currentStatus: commission.status,
          confirmedAt: commission.confirmedAt,
          paidAt: commission.paidAt,
        },
      };
    }),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "paid", "cancelled"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const audit = buildAudit({
        domain: "commissions",
        action: "update_status",
        performedBy: ctx.user.email,
        targetId: input.id,
        notes: input.notes || null,
        metadata: { status: input.status },
      });

      if (input.status === "confirmed") {
        await publishCommissionApproved(String(input.id), String(ctx.user.id), {
          source: "commissions.updateStatus",
          notes: input.notes,
        });
      } else if (input.status === "paid") {
        const commission = mockCommissions.find((item) => item.id === input.id);
        await publishCommissionPaid(
          String(input.id),
          `manual-${input.id}`,
          commission?.amount ?? 0,
          {
            source: "commissions.updateStatus",
            notes: input.notes,
          },
        );
      } else if (input.status === "cancelled") {
        await publishCommissionRejected(String(input.id), input.notes || "cancelled", {
          source: "commissions.updateStatus",
        });
      }

      return {
        success: true,
        message: `Status da comissão atualizado para ${input.status}`,
        audit,
      };
    }),

  approveBatch: adminProcedure
    .input(
      z.object({
        ids: z.array(z.number()).min(1, "Pelo menos uma comissão é requerida"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const audit = buildAudit({
        domain: "commissions",
        action: "approve_batch",
        performedBy: ctx.user.email,
        targetIds: input.ids,
        notes: input.notes || null,
      });

      await Promise.all(
        input.ids.map((id) =>
          publishCommissionApproved(String(id), String(ctx.user.id), {
            source: "commissions.approveBatch",
            notes: input.notes,
          }),
        ),
      );

      return {
        success: true,
        message: `${input.ids.length} comissões aprovadas com sucesso`,
        updatedIds: input.ids,
        audit,
      };
    }),

  getStats: publicProcedure.query(async () => {
    return {
      total: 250000.0,
      pending: 45000.0,
      confirmed: 80000.0,
      paid: 125000.0,
      cancelled: 0,
      count: {
        total: 1250,
        pending: 320,
        confirmed: 480,
        paid: 450,
        cancelled: 0,
      },
      byLevel: {
        "1": 150000.0,
        "2": 50000.0,
        "3": 30000.0,
        "4": 15000.0,
        "5+": 5000.0,
      },
      bySource: {
        sale: 200000.0,
        bonus: 30000.0,
        referral: 20000.0,
      },
      averageCommission: 200.0,
    };
  }),

  getByAffiliate: protectedProcedure
    .input(
      z.object({
        affiliateId: z.number(),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const affiliateCommissions = mockCommissions.filter((item) => item.affiliateId === input.affiliateId);

      return {
        commissions: affiliateCommissions,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: affiliateCommissions.length,
          totalPages: Math.max(1, Math.ceil(affiliateCommissions.length / input.limit)),
        },
      };
    }),

  calculatePending: protectedProcedure
    .input(z.object({ affiliateId: z.number() }))
    .query(async ({ input }) => {
      return {
        affiliateId: input.affiliateId,
        pendingAmount: 1250.0,
        pendingCount: 5,
        oldestPendingDate: new Date("2026-05-01T09:00:00Z"),
      };
    }),
});
