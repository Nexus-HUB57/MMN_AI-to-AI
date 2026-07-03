import { adminProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, desc, asc, and, gte, lte, count, sql, inArray } from "drizzle-orm";
import { users, affiliates, commissions, payments, network, orders, products } from "../../../database/schemas/schema-final";

/**
 * Admin Router - Painel Administrativo do MMN AI-to-AI
 *
 * Endpoints administrativos para gerenciamento de:
 * - Usuários e afiliados
 * - Comissões e pagamentos
 * - Configurações da plataforma
 * - Rede e uplines/downlines
 * - Analytics e relatórios
 */
export const adminRouter = router({
  // ============ USERS & AFFILIATES ============

  /**
   * Listar todos os usuários com paginação
   */
  listUsers: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      role: z.enum(["user", "admin"]).optional(),
      search: z.string().optional(),
      includeTestData: z.boolean().default(false),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const conditions = [];
      if (input.role) {
        conditions.push(eq(users.role, input.role));
      }
      if (input.search) {
        conditions.push(
          sql`(${users.name} LIKE ${`%${input.search}%`} OR ${users.email} LIKE ${`%${input.search}%`})`
        );
      }
      // FIX 01-07-2026: excluir test data por default
      if (!input.includeTestData) {
        conditions.push(sql`COALESCE("users"."is_test_data", FALSE) = FALSE`);
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [usersList, [{ total }]] = await Promise.all([
        ctx.db.select().from(users)
          .where(whereClause)
          .orderBy(desc(users.createdAt))
          .limit(input.limit)
          .offset(offset),
        ctx.db.select({ total: count() }).from(users).where(whereClause),
      ]);

      return {
        users: usersList.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          lastSignedIn: u.lastSignedIn,
        })),
        pagination: {
          page: input.page,
          limit: input.limit,
          total: Number(total),
          totalPages: Math.ceil(Number(total) / input.limit),
        },
      };
    }),

  /**
   * Buscar usuário por ID
   */
  getUser: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [user] = await ctx.db.select().from(users).where(eq(users.id, input.id));
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      // Buscar perfil de afiliado
      const [affiliate] = await ctx.db.select().from(affiliates).where(eq(affiliates.userId, input.id));

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastSignedIn: user.lastSignedIn,
        loginMethod: user.loginMethod,
        affiliate: affiliate ? {
          id: affiliate.id,
          affiliateCode: affiliate.affiliateCode,
          commissionPercentage: affiliate.commissionPercentage,
          status: affiliate.status,
          totalCommissions: affiliate.totalCommissions,
          pendingCommissions: affiliate.pendingCommissions,
        } : null,
      };
    }),

  /**
   * Atualizar usuário (role, status)
   */
  updateUser: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      email: z.string().email().optional(),
      role: z.enum(["user", "admin"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, role, ...updates } = input;

      const [existingUser] = await ctx.db.select().from(users).where(eq(users.id, id));
      if (!existingUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      if (role !== undefined && role !== existingUser.role) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Promoção ou alteração de papel administrativo foi bloqueada no backoffice. Use configuração protegida.",
        });
      }

      await ctx.db.update(users)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(users.id, id));

      return { success: true, message: "Usuário atualizado com sucesso" };
    }),

  /**
   * Suspender/reativar afiliado
   */
  toggleAffiliateStatus: adminProcedure
    .input(z.object({
      userId: z.number(),
      status: z.enum(["active", "inactive", "suspended"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const [affiliate] = await ctx.db.select().from(affiliates).where(eq(affiliates.userId, input.userId));
      if (!affiliate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Afiliado não encontrado" });
      }

      await ctx.db.update(affiliates)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(affiliates.userId, input.userId));

      return { success: true, message: `Status atualizado para ${input.status}` };
    }),

  // ============ COMMISSIONS ============

  /**
   * Listar comissões com filtros
   */
  listCommissions: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["pending", "confirmed", "paid", "cancelled"]).optional(),
      affiliateId: z.number().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const conditions = [];
      if (input.status) {
        conditions.push(eq(commissions.status, input.status));
      }
      if (input.affiliateId) {
        conditions.push(eq(commissions.affiliateId, input.affiliateId));
      }
      if (input.startDate) {
        conditions.push(gte(commissions.createdAt, input.startDate));
      }
      if (input.endDate) {
        conditions.push(lte(commissions.createdAt, input.endDate));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [commissionsList, [{ total }]] = await Promise.all([
        ctx.db.select().from(commissions)
          .where(whereClause)
          .orderBy(desc(commissions.createdAt))
          .limit(input.limit)
          .offset(offset),
        ctx.db.select({ total: count() }).from(commissions).where(whereClause),
      ]);

      return {
        commissions: commissionsList,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: Number(total),
          totalPages: Math.ceil(Number(total) / input.limit),
        },
      };
    }),

  /**
   * Aprovar/rejeitar comissão pendente
   */
  updateCommissionStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "confirmed", "paid", "cancelled"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const [commission] = await ctx.db.select().from(commissions).where(eq(commissions.id, input.id));
      if (!commission) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Comissão não encontrada" });
      }

      await ctx.db.update(commissions)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(commissions.id, input.id));

      // Atualizar saldo do afiliado
      if (input.status === "confirmed") {
        await ctx.db.update(affiliates)
          .set({
            totalCommissions: sql`totalCommissions + ${commission.amount}`,
            pendingCommissions: sql`pendingCommissions - ${commission.amount}`,
          })
          .where(eq(affiliates.id, commission.affiliateId));
      }

      return { success: true, message: `Comissão ${input.status === "cancelled" ? "rejeitada" : "atualizada"} com sucesso` };
    }),

  /**
   * Estatísticas de comissões
   */
  getCommissionStats: adminProcedure.query(async ({ ctx }) => {
    const allCommissions = await ctx.db.select().from(commissions);

    const stats = {
      total: allCommissions.reduce((sum, c) => sum + c.amount, 0),
      pending: allCommissions.filter(c => c.status === "pending").reduce((sum, c) => sum + c.amount, 0),
      confirmed: allCommissions.filter(c => c.status === "confirmed").reduce((sum, c) => sum + c.amount, 0),
      paid: allCommissions.filter(c => c.status === "paid").reduce((sum, c) => sum + c.amount, 0),
      count: {
        total: allCommissions.length,
        pending: allCommissions.filter(c => c.status === "pending").length,
        confirmed: allCommissions.filter(c => c.status === "confirmed").length,
        paid: allCommissions.filter(c => c.status === "paid").length,
      },
    };

    return stats;
  }),

  // ============ PAYMENTS ============

  /**
   * Listar pagamentos
   */
  listPayments: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["pending", "confirmed", "failed", "cancelled"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const conditions = input.status ? [eq(payments.status, input.status)] : [];
      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [paymentsList, [{ total }]] = await Promise.all([
        ctx.db.select().from(payments)
          .where(whereClause)
          .orderBy(desc(payments.createdAt))
          .limit(input.limit)
          .offset(offset),
        ctx.db.select({ total: count() }).from(payments).where(whereClause),
      ]);

      return {
        payments: paymentsList,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: Number(total),
          totalPages: Math.ceil(Number(total) / input.limit),
        },
      };
    }),

  /**
   * Processar pagamento (aprovar/rejeitar)
   */
  processPayment: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["pending", "confirmed", "failed", "cancelled"]),
      paymentDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [payment] = await ctx.db.select().from(payments).where(eq(payments.id, input.id));
      if (!payment) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pagamento não encontrado" });
      }

      const updateData: any = { status: input.status, updatedAt: new Date() };
      if (input.status === "confirmed" && input.paymentDate) {
        updateData.paymentDate = input.paymentDate;
        updateData.confirmedAt = new Date();
      }

      await ctx.db.update(payments).set(updateData).where(eq(payments.id, input.id));

      return { success: true, message: `Pagamento ${input.status}` };
    }),

  // ============ NETWORK ============

  /**
   * Visualizar árvore de rede
   */
  getNetworkTree: adminProcedure
    .input(z.object({
      rootAffiliateId: z.number().optional(),
      maxDepth: z.number().min(1).max(10).default(3),
    }).optional())
    .query(async ({ input }) => {
      const { Pool } = await import("pg");
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const client = await pool.connect();
      try {
        // Se não passar rootAffiliateId, usa Lucas (NX-FOUNDER-001)
        let rootId = input?.rootAffiliateId;
        if (!rootId) {
          const rootRes = await client.query(
            `SELECT id FROM affiliates WHERE "affiliateCode" = 'NX-FOUNDER-001' LIMIT 1`
          );
          rootId = rootRes.rows[0]?.id ?? null;
        }
        if (!rootId) return { root: null, nodes: [], totalNodes: 0, directs: 0 };

        const maxDepth = input?.maxDepth ?? 3;
        // Query recursiva (CTE) para pegar toda a árvore até maxDepth
        const treeRes = await client.query(`
          WITH RECURSIVE tree AS (
            SELECT a.id, a."affiliateCode", a."userId", a."sponsorId", 
                   u.name, u.email, 1 AS depth
            FROM affiliates a
            JOIN users u ON u.id = a."userId"
            WHERE a.id = $1
            UNION ALL
            SELECT a.id, a."affiliateCode", a."userId", a."sponsorId",
                   u.name, u.email, t.depth + 1
            FROM affiliates a
            JOIN users u ON u.id = a."userId"
            JOIN tree t ON a."sponsorId" = t.id
            WHERE t.depth < $2 AND a.is_test_data = false
          )
          SELECT id, "affiliateCode" AS code, "userId", "sponsorId", name, email, depth
          FROM tree
          ORDER BY depth, id
        `, [rootId, maxDepth]);

        const nodes = treeRes.rows;
        const root = nodes.find((n: any) => n.depth === 1) ?? null;
        const directs = nodes.filter((n: any) => n.depth === 2).length;
        return {
          root,
          nodes,
          totalNodes: nodes.length,
          directs,
        };
      } finally {
        client.release();
        await pool.end();
      }
    }),
});