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
      // Nexus SaaS · IOAID — categoria de inadimplência operacional
      // monthly_activation: falha na Ativação Mensal (01-10 de cada mês)
      // pack:               atraso na renovação/aquisição do Pack vigente
      // skill:              parcelas em atraso de Skills/Upgrades do Agente IA
      // ebook:              pendências da revenda Marketplace Nexus (ebooks/PREU)
      // commission:         saldo retido por desqualificação ou estorno
      category: z
        .enum(["all", "monthly_activation", "pack", "skill", "ebook", "commission"])
        .optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Para desenvolvimento, retornamos mock data
      // Em produção, buscaria afiliados com pagamentos pendentes há mais de X dias
      const mockDelinquents: any[] = []; // Onda 9: mocks removidos

      // Filtrar mock data
      let filtered = mockDelinquents;
      if (input.minDaysOverdue) {
        filtered = filtered.filter(d => d.daysOverdue >= input.minDaysOverdue!);
      }
      if (input.status) {
        filtered = filtered.filter(d => d.status === input.status);
      }
      if (input.category && input.category !== "all") {
        filtered = filtered.filter(d => d.category === input.category);
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
  getStats: adminProcedure.query(async () => {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const client = await pool.connect();
    try {
      const res = await client.query(`SELECT COUNT(*)::int AS total FROM delinquents`);
      const total = res.rows[0]?.total ?? 0;
      return {
        totalDelinquents: total,
        totalOutstanding: 0,
        byDaysOverdue: { "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 },
        byStatus: { active: 0, suspended: 0 },
        byCategory: { monthly_activation: 0, pack: 0, skill: 0, ebook: 0, commission: 0 },
        averageDaysOverdue: 0,
        recoveryRate: 0,
      };
    } finally {
      client.release();
      await pool.end();
    }
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