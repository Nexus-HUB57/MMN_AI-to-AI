import { adminProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, desc, and, gte, lte, count, sql, inArray } from "drizzle-orm";
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
      userId: z.number().optional(),
      affiliateId: z.number().optional(),
      maxDepth: z.number().default(3),
    }))
    .query(async ({ ctx, input }) => {
      const getUserId = async () => {
        if (input.userId) return input.userId;
        if (input.affiliateId) {
          const [aff] = await ctx.db.select().from(affiliates).where(eq(affiliates.id, input.affiliateId));
          return aff?.userId;
        }
        return null;
      };

      const sponsorId = await getUserId();
      if (!sponsorId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "userId ou affiliateId requerido" });
      }

      const buildTree = async (sponsorId: number, depth: number): Promise<any[]> => {
        if (depth > (input.maxDepth || 3)) return [];

        const downline = await ctx.db.select({
          userId: network.userId,
          level: network.level,
        }).from(network).where(eq(network.sponsorId, sponsorId));

        const tree = [];
        for (const member of downline) {
          const [user] = await ctx.db.select().from(users).where(eq(users.id, member.userId));
          const [affiliate] = await ctx.db.select().from(affiliates).where(eq(affiliates.userId, member.userId));

          tree.push({
            userId: member.userId,
            name: user?.name || "Unknown",
            email: user?.email,
            level: member.level,
            affiliateCode: affiliate?.affiliateCode,
            status: affiliate?.status,
            children: await buildTree(member.userId, depth + 1),
          });
        }

        return tree;
      };

      return buildTree(sponsorId, 0);
    }),

  /**
   * Estatísticas da rede
   */
  getNetworkStats: adminProcedure.query(async ({ ctx }) => {
    const [totalUsers] = await ctx.db.select({ count: count() }).from(users);
    const [totalAffiliates] = await ctx.db.select({ count: count() }).from(affiliates);
    const [activeAffiliates] = await ctx.db.select({ count: count() }).from(affiliates).where(eq(affiliates.status, "active"));

    // Calcular uplines únicos (sponsors)
    const allNetwork = await ctx.db.select().from(network);
    const uniqueSponsors = new Set(allNetwork.map(n => n.sponsorId));

    return {
      totalUsers: Number(totalUsers.count),
      totalAffiliates: Number(totalAffiliates.count),
      activeAffiliates: Number(activeAffiliates.count),
      totalConnections: allNetwork.length,
      uniqueSponsors: uniqueSponsors.size,
    };
  }),

  // ============ ORDERS & PRODUCTS ============

  /**
   * Listar pedidos
   */
  listOrders: adminProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(20),
      status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"]).optional(),
      marketplace: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.limit;

      const conditions = [];
      if (input.status) conditions.push(eq(orders.status, input.status));
      if (input.marketplace) conditions.push(eq(orders.marketplace, input.marketplace));

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [ordersList, [{ total }]] = await Promise.all([
        ctx.db.select().from(orders)
          .where(whereClause)
          .orderBy(desc(orders.createdAt))
          .limit(input.limit)
          .offset(offset),
        ctx.db.select({ total: count() }).from(orders).where(whereClause),
      ]);

      return {
        orders: ordersList,
        pagination: {
          page: input.page,
          limit: input.limit,
          total: Number(total),
          totalPages: Math.ceil(Number(total) / input.limit),
        },
      };
    }),

  /**
   * Estatísticas de vendas
   */
  getSalesStats: adminProcedure.query(async ({ ctx }) => {
    const allOrders = await ctx.db.select().from(orders);

    const byMarketplace = allOrders.reduce((acc, o) => {
      acc[o.marketplace] = (acc[o.marketplace] || 0) + o.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders: allOrders.length,
      totalRevenue: allOrders.reduce((sum, o) => sum + o.amount, 0),
      totalCommissions: allOrders.reduce((sum, o) => sum + o.commissionAmount, 0),
      byStatus: {
        pending: allOrders.filter(o => o.status === "pending").length,
        confirmed: allOrders.filter(o => o.status === "confirmed").length,
        shipped: allOrders.filter(o => o.status === "shipped").length,
        delivered: allOrders.filter(o => o.status === "delivered").length,
        cancelled: allOrders.filter(o => o.status === "cancelled").length,
      },
      byMarketplace,
    };
  }),

  // ============ PLATFORM SETTINGS ============

  /**
   * Buscar configurações da plataforma
   */
  getSettings: adminProcedure.query(async ({ ctx }) => {
    // -----------------------------------------------------------------------
    // Nexus SaaS · IOAID — Regramento oficial de comissionamento
    // Fonte: docs/planning/Age.txt (Clube de Vantagens · Revenda Multilevel)
    // -----------------------------------------------------------------------
    // Estrutura: Matriz Forçada com profundidade máxima de 5 Níveis.
    // Sem percentual padrão: cada nível tem seu próprio percentual oficial.
    // -----------------------------------------------------------------------
    return {
      platformName: "Nexus SaaS · IOAID",
      supportEmail: "suporte@nexus-saas.com.br",
      // Sem comissão padrão — cada nível é regido pelo regramento oficial
      defaultCommission: null,
      networkModel: "forced_matrix",
      commissionLevels: [
        {
          level: 1,
          percentage: 20,
          label: "1º Nível",
          description: "20% de Participação sobre Resultados do N.O 1º Nível (Multilevel)",
        },
        {
          level: 2,
          percentage: 10,
          label: "2º Nível",
          description: "10% de Participação sobre Resultados do N.O 2º Nível (Multilevel)",
        },
        {
          level: 3,
          percentage: 5,
          label: "3º Nível",
          description: "5% de Participação sobre Resultados do N.O 3º Nível (Multilevel)",
        },
        {
          level: 4,
          percentage: 2.5,
          label: "4º Nível",
          description: "2,5% de Participação sobre Resultados do N.O 4º Nível (Multilevel)",
        },
        {
          level: 5,
          percentage: 1,
          label: "5º Nível",
          description: "1% de Participação sobre Resultados do N.O 5º Nível (Multilevel)",
        },
      ],
      // Matriz Forçada padronizada em 5 níveis
      maxNetworkDepth: 5,
      compressionEnabled: true,
      apiStatus: {
        gemini: Boolean(process.env.GEMINI_API_KEY),
        openai: Boolean(process.env.OPENAI_API_KEY),
        database: Boolean(process.env.DATABASE_URL),
        redis: Boolean(process.env.REDIS_URL),
        hotmart: Boolean(process.env.HOTMART_CLIENT_ID),
        shopee: Boolean((process.env.SHOPEE_AFFILIATE_ID && process.env.SHOPEE_AFFILIATE_USERNAME) || (process.env.SHOPEE_PARTNER_ID && process.env.SHOPEE_PARTNER_KEY && (process.env.SHOPEE_REDIRECT_URI || process.env.SHOPEE_PUSH_CALLBACK_URL))),
      },
    };
  }),

  /**
   * Atualizar configurações
   */
  updateSettings: adminProcedure
    .input(z.object({
      platformName: z.string().optional(),
      supportEmail: z.string().email().optional(),
      defaultCommission: z.number().min(0).max(100).nullable().optional(),
      maxNetworkDepth: z.number().min(1).max(20).optional(),
      compressionEnabled: z.boolean().optional(),
      commissionLevels: z
        .array(
          z.object({
            level: z.number().int().min(1).max(20),
            percentage: z.number().min(0).max(100),
            label: z.string().optional(),
            description: z.string().optional(),
          }),
        )
        .optional(),
    }))
    .mutation(async ({ input }) => {
      // Em produção, salvaria em tabela de configurações
      console.log("Settings updated:", input);
      return { success: true, message: "Configurações atualizadas" };
    }),

  /**
   * Limpar cache de runtime (seguro para produção).
   */
  clearRuntimeCache: adminProcedure
    .mutation(async () => {
      const clearedAt = new Date().toISOString();
      (globalThis as any).__ONEVERSO_ADMIN_CACHE_CLEARED_AT = clearedAt;
      return {
        success: true,
        clearedAt,
        message: "Cache de runtime invalidado com sucesso. Se necessário, atualize o navegador com Ctrl+F5.",
      };
    }),

  /**
   * Prévia do reset operacional de go-live.
   * Escopo: comissões, saldos, pedidos de teste (admin/zero), progresso e views.
   */
  previewGoLiveReset: adminProcedure
    .mutation(async ({ ctx }) => {
      const raw: any = await ctx.db.execute(sql`
        SELECT
          (SELECT count(*)::int FROM public.commissions) AS commissions,
          (SELECT count(*)::int FROM public.affiliate_balances) AS affiliate_balances,
          (SELECT count(*)::int FROM public.affiliate_performance) AS affiliate_performance,
          (SELECT count(*)::int FROM public.affiliate_xp) AS affiliate_xp,
          (SELECT count(*)::int FROM public.lesson_progress) AS lesson_progress,
          (SELECT count(*)::int FROM public.lesson_views) AS lesson_views,
          (SELECT count(*)::int FROM public.lesson_completion_stats) AS lesson_completion_stats,
          (SELECT count(*)::int FROM public.payments WHERE LOWER(COALESCE(method, '')) LIKE '%homolog%') AS payments_homolog,
          (SELECT count(*)::int FROM public.marketplace_orders WHERE payment_method = 'admin' AND COALESCE(total_cents, 0) = 0) AS marketplace_orders_test,
          (SELECT count(*)::int FROM public.marketplace_order_items WHERE order_id IN (SELECT id FROM public.marketplace_orders WHERE payment_method = 'admin' AND COALESCE(total_cents, 0) = 0)) AS marketplace_order_items_test,
          (SELECT count(*)::int FROM public.marketplace_user_library WHERE source_order_id IN (SELECT id FROM public.marketplace_orders WHERE payment_method = 'admin' AND COALESCE(total_cents, 0) = 0)) AS marketplace_user_library_test
      `);
      const row: any = Array.isArray(raw) ? raw[0] : (raw?.rows?.[0] ?? {});
      const getNum = (key: string) => Number(row?.[key] ?? 0);
      return {
        success: true,
        scope: 'Somente dados operacionais de teste',
        confirmationText: 'RESETAR GO LIVE',
        callbackUrl: process.env.SHOPEE_PUSH_CALLBACK_URL || 'https://oneverso.com.br/webhooks/shopee',
        counts: {
          commissions: getNum('commissions'),
          affiliateBalances: getNum('affiliate_balances'),
          affiliatePerformance: getNum('affiliate_performance'),
          affiliateXp: getNum('affiliate_xp'),
          lessonProgress: getNum('lesson_progress'),
          lessonViews: getNum('lesson_views'),
          lessonCompletionStats: getNum('lesson_completion_stats'),
          paymentsHomolog: getNum('payments_homolog'),
          marketplaceOrdersTest: getNum('marketplace_orders_test'),
          marketplaceOrderItemsTest: getNum('marketplace_order_items_test'),
          marketplaceUserLibraryTest: getNum('marketplace_user_library_test'),
        },
      };
    }),

  /**
   * Reset controlado para go-live real.
   * Preserva usuários/admins/config-base; remove apenas dados operacionais de teste.
   */
  resetGoLiveOperationalData: adminProcedure
    .input(z.object({ confirmationText: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if ((input.confirmationText || '').trim() !== 'RESETAR GO LIVE') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Digite exatamente RESETAR GO LIVE para confirmar.' });
      }
      const previewRaw: any = await ctx.db.execute(sql`
        SELECT
          (SELECT count(*)::int FROM public.commissions) AS commissions,
          (SELECT count(*)::int FROM public.affiliate_balances) AS affiliate_balances,
          (SELECT count(*)::int FROM public.affiliate_performance) AS affiliate_performance,
          (SELECT count(*)::int FROM public.affiliate_xp) AS affiliate_xp,
          (SELECT count(*)::int FROM public.lesson_progress) AS lesson_progress,
          (SELECT count(*)::int FROM public.lesson_views) AS lesson_views,
          (SELECT count(*)::int FROM public.lesson_completion_stats) AS lesson_completion_stats,
          (SELECT count(*)::int FROM public.payments WHERE LOWER(COALESCE(method, '')) LIKE '%homolog%') AS payments_homolog,
          (SELECT count(*)::int FROM public.marketplace_orders WHERE payment_method = 'admin' AND COALESCE(total_cents, 0) = 0) AS marketplace_orders_test,
          (SELECT count(*)::int FROM public.marketplace_order_items WHERE order_id IN (SELECT id FROM public.marketplace_orders WHERE payment_method = 'admin' AND COALESCE(total_cents, 0) = 0)) AS marketplace_order_items_test,
          (SELECT count(*)::int FROM public.marketplace_user_library WHERE source_order_id IN (SELECT id FROM public.marketplace_orders WHERE payment_method = 'admin' AND COALESCE(total_cents, 0) = 0)) AS marketplace_user_library_test
      `);
      const row: any = Array.isArray(previewRaw) ? previewRaw[0] : (previewRaw?.rows?.[0] ?? {});
      const getNum = (key: string) => Number(row?.[key] ?? 0);

      await ctx.db.execute(sql`DELETE FROM public.marketplace_user_library WHERE source_order_id IN (SELECT id FROM public.marketplace_orders WHERE payment_method = 'admin' AND COALESCE(total_cents, 0) = 0)`);
      await ctx.db.execute(sql`DELETE FROM public.marketplace_order_items WHERE order_id IN (SELECT id FROM public.marketplace_orders WHERE payment_method = 'admin' AND COALESCE(total_cents, 0) = 0)`);
      await ctx.db.execute(sql`DELETE FROM public.marketplace_orders WHERE payment_method = 'admin' AND COALESCE(total_cents, 0) = 0`);
      await ctx.db.execute(sql`DELETE FROM public.payments WHERE LOWER(COALESCE(method, '')) LIKE '%homolog%'`);
      await ctx.db.execute(sql`DELETE FROM public.lesson_views`);
      await ctx.db.execute(sql`DELETE FROM public.lesson_progress`);
      await ctx.db.execute(sql`DELETE FROM public.commissions`);
      await ctx.db.execute(sql`DELETE FROM public.affiliate_balances`);
      await ctx.db.execute(sql`DELETE FROM public.affiliate_performance`);
      await ctx.db.execute(sql`DELETE FROM public.affiliate_xp`);

      return {
        success: true,
        resetAt: new Date().toISOString(),
        scope: 'Somente dados operacionais de teste',
        deleted: {
          commissions: getNum('commissions'),
          affiliateBalances: getNum('affiliate_balances'),
          affiliatePerformance: getNum('affiliate_performance'),
          affiliateXp: getNum('affiliate_xp'),
          lessonProgress: getNum('lesson_progress'),
          lessonViews: getNum('lesson_views'),
          lessonCompletionStats: getNum('lesson_completion_stats'),
          paymentsHomolog: getNum('payments_homolog'),
          marketplaceOrdersTest: getNum('marketplace_orders_test'),
          marketplaceOrderItemsTest: getNum('marketplace_order_items_test'),
          marketplaceUserLibraryTest: getNum('marketplace_user_library_test'),
        },
      };
    }),

  // ============ DASHBOARD ============

  /**
   * Métricas do dashboard admin
   */
  getDashboardMetrics: adminProcedure.query(async ({ ctx }) => {
    const [
      [totalUsers],
      [totalAffiliates],
      [activeAffiliates],
    ] = await Promise.all([
      ctx.db.select({ count: count() }).from(users),
      ctx.db.select({ count: count() }).from(affiliates),
      ctx.db.select({ count: count() }).from(affiliates).where(eq(affiliates.status, "active")),
    ]);

    const allCommissions = await ctx.db.select().from(commissions);
    const allPayments = await ctx.db.select().from(payments);

    return {
      totalUsers: Number(totalUsers.count),
      totalAffiliates: Number(totalAffiliates.count),
      activeAffiliates: Number(activeAffiliates.count),
      totalCommissionsPending: allCommissions.filter(c => c.status === "pending").reduce((sum, c) => sum + c.amount, 0),
      totalCommissionsPaid: allPayments.filter(p => p.status === "confirmed").reduce((sum, p) => sum + p.amount, 0),
      recentJoins: allAffiliates.length, // Simplificado
    };
  }),
});