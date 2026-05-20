import { adminProcedure, protectedProcedure, publicProcedure, router } from "../config/trpc";
import { z } from "zod";
import { eq, desc, count, sql, and, gt, gte } from "drizzle-orm";
import { affiliates, users, payments } from "../../../database/schemas/schema-final";
import { TRPCError } from "@trpc/server";

/**
 * Delinquents Router - Gestão de inadimplentes
 *
 * Endpoints para visualização e gerenciamento de afiliados com pagamentos em atraso
 */
export const delinquentsRouter = router({
  /**
   * Listar inadimplentes
   */
  list: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(50),
      minDaysOverdue: z.number().optional(),
      status: z.enum(["active", "inactive", "suspended"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Para desenvolvimento, retornamos mock data
      // Em produção, buscaria afiliados com pagamentos pendentes há mais de X dias
      const mockDelinquents = [
        {
          id: 1,
          userId: 101,
          name: "João Silva",
          email: "joao@example.com",
          affiliateCode: "JOAO001",
          outstandingAmount: 2500.00,
          daysOverdue: 45,
          lastPaymentDate: new Date("2026-04-05"),
          status: "active" as const,
          contactAttempts: 3,
        },
        {
          id: 2,
          userId: 102,
          name: "Maria Santos",
          email: "maria@example.com",
          affiliateCode: "MARIA002",
          outstandingAmount: 1800.00,
          daysOverdue: 30,
          lastPaymentDate: new Date("2026-04-20"),
          status: "active" as const,
          contactAttempts: 1,
        },
        {
          id: 3,
          userId: 103,
          name: "Pedro Costa",
          email: "pedro@example.com",
          affiliateCode: "PEDRO003",
          outstandingAmount: 3200.00,
          daysOverdue: 90,
          lastPaymentDate: new Date("2026-03-01"),
          status: "suspended" as const,
          contactAttempts: 5,
        },
        {
          id: 4,
          userId: 104,
          name: "Ana Oliveira",
          email: "ana@example.com",
          affiliateCode: "ANA004",
          outstandingAmount: 950.00,
          daysOverdue: 15,
          lastPaymentDate: new Date("2026-05-05"),
          status: "active" as const,
          contactAttempts: 0,
        },
        {
          id: 5,
          userId: 105,
          name: "Carlos Mendes",
          email: "carlos@example.com",
          affiliateCode: "CARLOS005",
          outstandingAmount: 4500.00,
          daysOverdue: 120,
          lastPaymentDate: new Date("2026-02-01"),
          status: "suspended" as const,
          contactAttempts: 8,
        },
      ];

      // Filtrar mock data
      let filtered = mockDelinquents;
      if (input.minDaysOverdue) {
        filtered = filtered.filter(d => d.daysOverdue >= input.minDaysOverdue!);
      }
      if (input.status) {
        filtered = filtered.filter(d => d.status === input.status);
      }

      return filtered;
    }),

  /**
   * Buscar inadimplente por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      // Mock data
      const mockDelinquent = {
        id: input.id,
        userId: 101,
        name: "João Silva",
        email: "joao@example.com",
        affiliateCode: "JOAO001",
        outstandingAmount: 2500.00,
        daysOverdue: 45,
        lastPaymentDate: new Date("2026-04-05"),
        status: "active" as const,
        contactAttempts: 3,
        paymentHistory: [
          { date: new Date("2026-04-05"), amount: 500.00, status: "pending" },
          { date: new Date("2026-03-05"), amount: 500.00, status: "paid" },
          { date: new Date("2026-02-05"), amount: 500.00, status: "paid" },
        ],
        notes: [
          { date: new Date("2026-05-10"), note: "Contato via email realizado", author: "admin" },
          { date: new Date("2026-05-15"), note: "Cliente informou que fará pagamento na próxima semana", author: "admin" },
        ],
      };

      return mockDelinquent;
    }),

  /**
   * Atualizar status do inadimplente
   */
  updateStatus: adminProcedure
    .input(z.object({
      delinquentId: z.number(),
      status: z.enum(["active", "inactive", "suspended"]),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Em produção, atualizaria no banco
      return {
        success: true,
        message: `Status do inadimplente atualizado para ${input.status}`,
      };
    }),

  /**
   * Registrar tentativa de contato
   */
  addContactAttempt: adminProcedure
    .input(z.object({
      delinquentId: z.number(),
      method: z.enum(["email", "phone", "whatsapp", "sms"]),
      result: z.enum(["answered", "no_answer", "not_interested", "promise_to_pay"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Tentativa de contato registrada",
        contactId: Date.now(),
      };
    }),

  /**
   * Adicionar nota ao inadimplente
   */
  addNote: adminProcedure
    .input(z.object({
      delinquentId: z.number(),
      note: z.string().min(1, "Nota é obrigatória"),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Nota adicionada com sucesso",
        noteId: Date.now(),
      };
    }),

  /**
   * Estatísticas de inadimplência
   */
  getStats: publicProcedure.query(async () => {
    return {
      totalDelinquents: 156,
      totalOutstanding: 125000.00,
      byDaysOverdue: {
        "0-30": 45,
        "31-60": 38,
        "61-90": 32,
        "90+": 41,
      },
      byStatus: {
        active: 89,
        suspended: 67,
      },
      averageDaysOverdue: 52,
      recoveryRate: 0.35,
    };
  }),

  /**
   * Enviar lembrete de pagamento
   */
  sendReminder: adminProcedure
    .input(z.object({
      delinquentId: z.number(),
      template: z.enum(["first", "second", "final", "custom"]),
      customMessage: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return {
        success: true,
        message: "Lembrete enviado com sucesso",
        sentAt: new Date(),
      };
    }),
});