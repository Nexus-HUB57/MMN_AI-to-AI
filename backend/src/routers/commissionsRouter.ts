import { adminProcedure, protectedProcedure, publicProcedure, router } from "../config/trpc";
import { z } from "zod";
import { eq, desc, count, sql, and, gte, lte } from "drizzle-orm";
import { commissions, affiliates, users } from "../../../database/schemas/schema-final";
import { TRPCError } from "@trpc/server";

/**
 * Commissions Router - Gestão de comissões
 *
 * Endpoints para visualização e gerenciamento de comissões de afiliados
 */
export const commissionsRouter = router({
  /**
   * Listar comissões com filtros
   */
  list: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(50),
      status: z.enum(["pending", "confirmed", "paid", "cancelled"]).optional(),
      affiliateId: z.number().optional(),
      startDate: z.string().optional(), // ISO date string
      endDate: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Para desenvolvimento, retornamos mock data
      // Em produção, buscaria do banco de dados
      const mockCommissions = [
        {
          id: 1,
          affiliateId: 101,
          affiliateName: "João Silva",
          affiliateCode: "JOAO001",
          amount: 500.00,
          percentage: 10,
          level: 1,
          status: "pending" as const,
          source: "sale",
          sourceId: "ORDER-001",
          createdAt: new Date("2026-05-15"),
          confirmedAt: null,
          paidAt: null,
        },
        {
          id: 2,
          affiliateId: 102,
          affiliateName: "Maria Santos",
          affiliateCode: "MARIA002",
          amount: 320.00,
          percentage: 8,
          level: 1,
          status: "confirmed" as const,
          source: "sale",
          sourceId: "ORDER-002",
          createdAt: new Date("2026-05-14"),
          confirmedAt: new Date("2026-05-16"),
          paidAt: null,
        },
        {
          id: 3,
          affiliateId: 103,
          affiliateName: "Pedro Costa",
          affiliateCode: "PEDRO003",
          amount: 750.00,
          percentage: 10,
          level: 1,
          status: "paid" as const,
          source: "sale",
          sourceId: "ORDER-003",
          createdAt: new Date("2026-05-10"),
          confirmedAt: new Date("2026-05-12"),
          paidAt: new Date("2026-05-18"),
        },
        {
          id: 4,
          affiliateId: 104,
          affiliateName: "Ana Oliveira",
          affiliateCode: "ANA004",
          amount: 180.00,
          percentage: 6,
          level: 2,
          status: "pending" as const,
          source: "sale",
          sourceId: "ORDER-004",
          createdAt: new Date("2026-05-18"),
          confirmedAt: null,
          paidAt: null,
        },
        {
          id: 5,
          affiliateId: 105,
          affiliateName: "Carlos Mendes",
          affiliateCode: "CARLOS005",
          amount: 420.00,
          percentage: 7,
          level: 1,
          status: "cancelled" as const,
          source: "sale",
          sourceId: "ORDER-005",
          createdAt: new Date("2026-05-08"),
          confirmedAt: null,
          paidAt: null,
        },
      ];

      // Filtrar mock data
      let filtered = mockCommissions;
      if (input.status) {
        filtered = filtered.filter(c => c.status === input.status);
      }
      if (input.affiliateId) {
        filtered = filtered.filter(c => c.affiliateId === input.affiliateId);
      }

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

  /**
   * Buscar comissão por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return {
        id: input.id,
        affiliateId: 101,
        affiliateName: "João Silva",
        affiliateCode: "JOAO001",
        amount: 500.00,
        percentage: 10,
        level: 1,
        status: "pending" as const,
        source: "sale",
        sourceId: "ORDER-001",
        description: "Comissão sobre venda no Mercado Livre",
        createdAt: new Date("2026-05-15"),
        confirmedAt: null,
        paidAt: null,
      };
    }),

  /**
   * Atualizar status da comissão (admin)
   */
  updateStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "confirmed", "paid", "cancelled"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: `Status da comissão atualizado para ${input.status}`,
      };
    }),

  /**
   * Aprovar múltiplas comissões (batch)
   */
  approveBatch: adminProcedure
    .input(z.object({
      ids: z.array(z.number()).min(1, "Pelo menos uma comissão é requerida"),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: `${input.ids.length} comissões aprovadas com sucesso`,
        updatedIds: input.ids,
      };
    }),

  /**
   * Estatísticas de comissões
   */
  getStats: publicProcedure.query(async () => {
    return {
      total: 250000.00,
      pending: 45000.00,
      confirmed: 80000.00,
      paid: 125000.00,
      cancelled: 0,
      count: {
        total: 1250,
        pending: 320,
        confirmed: 480,
        paid: 450,
        cancelled: 0,
      },
      byLevel: {
        "1": 150000.00,
        "2": 50000.00,
        "3": 30000.00,
        "4": 15000.00,
        "5+": 5000.00,
      },
      bySource: {
        sale: 200000.00,
        bonus: 30000.00,
        referral: 20000.00,
      },
      averageCommission: 200.00,
    };
  }),

  /**
   * Listar comissões por afiliado
   */
  getByAffiliate: protectedProcedure
    .input(z.object({
      affiliateId: z.number(),
      page: z.number().default(1),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      const mockAffiliateCommissions = [
        {
          id: 1,
          amount: 500.00,
          status: "pending" as const,
          source: "sale",
          createdAt: new Date("2026-05-15"),
        },
        {
          id: 2,
          amount: 320.00,
          status: "confirmed" as const,
          source: "sale",
          createdAt: new Date("2026-05-14"),
        },
        {
          id: 3,
          amount: 750.00,
          status: "paid" as const,
          source: "sale",
          createdAt: new Date("2026-05-10"),
        },
      ];

      return {
        commissions: mockAffiliateCommissions,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: mockAffiliateCommissions.length,
          totalPages: 1,
        },
      };
    }),

  /**
   * Calcular comissões pendentes de um afiliado
   */
  calculatePending: protectedProcedure
    .input(z.object({ affiliateId: z.number() }))
    .query(async ({ input }) => {
      return {
        affiliateId: input.affiliateId,
        pendingAmount: 1250.00,
        pendingCount: 5,
        oldestPendingDate: new Date("2026-05-01"),
      };
    }),
});