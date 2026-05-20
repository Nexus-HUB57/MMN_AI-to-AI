import { adminProcedure, protectedProcedure, publicProcedure, router } from "../config/trpc";
import { z } from "zod";
import { eq, desc, count, and, gte } from "drizzle-orm";
import { users, affiliates } from "../../../database/schemas/schema-final";
import { TRPCError } from "@trpc/server";

/**
 * Approvals Router - Gestão de aprovações administrativas
 *
 * Endpoints para revisão e aprovação de:
 * - Novos afiliados
 * - Alterações de perfil
 * - Solicitações especiais
 * - Upgrades de carreira
 */
export const approvalsRouter = router({
  /**
   * Listar aprovações pendentes
   */
  listPending: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(50),
      type: z.enum(["new_affiliate", "profile_update", "career_upgrade", "special_request"]).optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Mock data de aprovações pendentes
      const mockApprovals = [
        {
          id: 1,
          type: "new_affiliate" as const,
          priority: "medium" as const,
          status: "pending" as const,
          userId: 201,
          userName: "Roberto Almeida",
          userEmail: "roberto@example.com",
          affiliateCode: "ROBERTO006",
          sponsorName: "João Silva",
          submittedAt: new Date("2026-05-18"),
          data: {
            plan: "premium",
            initialInvestment: 500.00,
          },
        },
        {
          id: 2,
          type: "career_upgrade" as const,
          priority: "high" as const,
          status: "pending" as const,
          userId: 202,
          userName: "Fernanda Lima",
          userEmail: "fernanda@example.com",
          affiliateCode: "FERNANDA007",
          sponsorName: "Maria Santos",
          submittedAt: new Date("2026-05-17"),
          data: {
            currentLevel: 3,
            requestedLevel: 4,
            achievements: ["100 sales", "5 downline members"],
          },
        },
        {
          id: 3,
          type: "profile_update" as const,
          priority: "low" as const,
          status: "pending" as const,
          userId: 203,
          userName: "Marcos Pereira",
          userEmail: "marcos@example.com",
          affiliateCode: "MARCOS008",
          sponsorName: "Pedro Costa",
          submittedAt: new Date("2026-05-16"),
          data: {
            field: "bank_account",
            oldValue: "Banco do Brasil",
            newValue: "NuBank",
          },
        },
        {
          id: 4,
          type: "special_request" as const,
          priority: "urgent" as const,
          status: "pending" as const,
          userId: 204,
          userName: "Julia Costa",
          userEmail: "julia@example.com",
          affiliateCode: "JULIA009",
          sponsorName: "Ana Oliveira",
          submittedAt: new Date("2026-05-19"),
          data: {
            requestType: "custom_commission",
            requestedPercentage: 15,
            justification: "Alto volume de vendas",
          },
        },
        {
          id: 5,
          type: "new_affiliate" as const,
          priority: "medium" as const,
          status: "pending" as const,
          userId: 205,
          userName: "Ricardo Souza",
          userEmail: "ricardo@example.com",
          affiliateCode: "RICARDO010",
          sponsorName: "Carlos Mendes",
          submittedAt: new Date("2026-05-19"),
          data: {
            plan: "basic",
            initialInvestment: 200.00,
          },
        },
      ];

      // Filtrar mock data
      let filtered = mockApprovals;
      if (input.type) {
        filtered = filtered.filter(a => a.type === input.type);
      }
      if (input.priority) {
        filtered = filtered.filter(a => a.priority === input.priority);
      }

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

  /**
   * Listar aprovações processadas
   */
  listProcessed: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(50),
      status: z.enum(["approved", "rejected"]).optional(),
    }))
    .query(async ({ input }) => {
      const mockProcessed = [
        {
          id: 101,
          type: "new_affiliate",
          status: "approved" as const,
          userId: 101,
          userName: "João Silva",
          userEmail: "joao@example.com",
          processedBy: "admin@nexus.com",
          processedAt: new Date("2026-05-15"),
          notes: "Documentação verificada",
        },
        {
          id: 102,
          type: "career_upgrade",
          status: "rejected" as const,
          userId: 102,
          userName: "Maria Santos",
          userEmail: "maria@example.com",
          processedBy: "admin@nexus.com",
          processedAt: new Date("2026-05-14"),
          notes: "Não atende aos requisitos mínimos",
        },
      ];

      let filtered = mockProcessed;
      if (input.status) {
        filtered = filtered.filter(a => a.status === input.status);
      }

      return {
        approvals: filtered,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: filtered.length,
          totalPages: 1,
        },
      };
    }),

  /**
   * Buscar detalhes de uma aprovação
   */
  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return {
        id: input.id,
        type: "new_affiliate",
        priority: "medium",
        status: "pending",
        userId: 201,
        userName: "Roberto Almeida",
        userEmail: "roberto@example.com",
        affiliateCode: "ROBERTO006",
        sponsorName: "João Silva",
        sponsorCode: "JOAO001",
        submittedAt: new Date("2026-05-18"),
        data: {
          plan: "premium",
          initialInvestment: 500.00,
          documentNumber: "123.456.789-00",
          phone: "(11) 99999-9999",
          address: {
            street: "Rua Example",
            number: "123",
            city: "São Paulo",
            state: "SP",
            zipCode: "01234-567",
          },
        },
        history: [
          {
            action: "submitted",
            by: "system",
            at: new Date("2026-05-18"),
            notes: "Aguardando revisão",
          },
        ],
      };
    }),

  /**
   * Aprovar solicitação
   */
  approve: adminProcedure
    .input(z.object({
      id: z.number(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Solicitação aprovada com sucesso",
        approvedBy: ctx.user.email,
        approvedAt: new Date(),
      };
    }),

  /**
   * Rejeitar solicitação
   */
  reject: adminProcedure
    .input(z.object({
      id: z.number(),
      reason: z.string().min(1, "Motivo da rejeição é obrigatório"),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: "Solicitação rejeitada",
        rejectedBy: ctx.user.email,
        rejectedAt: new Date(),
        reason: input.reason,
      };
    }),

  /**
   * Solicitar mais informações
   */
  requestInfo: adminProcedure
    .input(z.object({
      id: z.number(),
      questions: z.array(z.object({
        field: z.string(),
        question: z.string(),
      })),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Solicitação de informações enviada",
        questionsCount: input.questions.length,
      };
    }),

  /**
   * Estatísticas de aprovações
   */
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
      averageProcessingTime: 4.5, // horas
      approvalRate: 0.85,
    };
  }),

  /**
   * Aprovar múltiplas solicitações (batch)
   */
  approveBatch: adminProcedure
    .input(z.object({
      ids: z.array(z.number()).min(1),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return {
        success: true,
        message: `${input.ids.length} solicitações aprovadas`,
        approvedIds: input.ids,
        approvedBy: ctx.user.email,
        approvedAt: new Date(),
      };
    }),
});