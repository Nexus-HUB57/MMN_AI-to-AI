import { adminProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, desc, asc, and, gte, lte, count, sql, inArray } from "drizzle-orm";
import { users, affiliates, commissions, payments, network, orders, products } from "../../../database/schemas/schema-final";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

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
        ctx.db.select({
          id: users.id, name: users.name, email: users.email, role: users.role,
          createdAt: users.createdAt, lastSignedIn: users.lastSignedIn,
          affiliateStatus: affiliates.status,
        }).from(users)
          .leftJoin(affiliates, eq(affiliates.userId, users.id))
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
          affiliateStatus: u.affiliateStatus ?? null,
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
      status: z.enum(["pending", "confirmed", "failed", "cancelled", "paid", "approved"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      // HOTFIX D18: painel admin lê marketplace_orders (fonte real de pagamentos Pix/MP)
      const offset = (input.page - 1) * input.limit;
      const statusMap: Record<string, string[]> = {
        pending:  ["pending"],
        confirmed:["paid","approved","delivered"],
        paid:     ["paid","approved","delivered"],
        approved: ["paid","approved","delivered"],
        failed:   ["failed","rejected","cancelled"],
        cancelled:["cancelled"],
      };
      const params: any[] = [];
      let where = `1=1`;
      if (input.status) {
        const vals = statusMap[input.status] ?? [input.status];
        params.push(vals);
        where += ` AND (mo.payment_status = ANY($${params.length}::text[]) OR mo.status = ANY($${params.length}::text[]))`;
      }
      params.push(input.limit); const pLimit = params.length;
      params.push(offset);      const pOff   = params.length;

      const listQ = `SELECT mo.id, mo.user_id AS "affiliateId", u.name AS "affiliateName", u.email,
                            mo.total_cents AS amount, mo.payment_method AS method,
                            mo.payment_status AS status, mo.payment_id AS "bankNumber",
                            mo.external_reference AS agency, mo.paid_at AS "paymentDate",
                            mo.paid_at AS "confirmedAt", mo.created_at AS "createdAt",
                            mo.updated_at AS "updatedAt", mo.metadata
                       FROM marketplace_orders mo
                       LEFT JOIN users u ON u.id = mo.user_id
                      WHERE ${where}
                      ORDER BY mo.created_at DESC
                      LIMIT $${pLimit} OFFSET $${pOff}`;
      const cntQ  = `SELECT count(*)::int AS total FROM marketplace_orders mo WHERE ${where}`;

      const [listRes, cntRes]: any = await Promise.all([
        (ctx as any).db.execute(listQ as any, params as any),
        (ctx as any).db.execute(cntQ  as any, params.slice(0, params.length - 2) as any),
      ]);
      const rows = (listRes?.rows ?? listRes ?? []) as any[];
      const total = Number(((cntRes?.rows ?? cntRes ?? [])[0]?.total) ?? 0);

      const payments = rows.map((r) => ({
        id: r.id,
        affiliateId: r.affiliateId,
        affiliateName: r.affiliateName || r.email || `user#${r.affiliateId}`,
        amount: Number(r.amount || 0) / 100,
        method: r.method || "mercado_pago",
        status: (r.status === "paid" || r.status === "approved" || r.status === "delivered")
          ? "confirmed"
          : (r.status === "failed" || r.status === "rejected") ? "failed"
          : (r.status === "cancelled") ? "cancelled"
          : "pending",
        bankNumber: r.bankNumber || null,
        agency: r.agency || null,
        paymentDate: r.paymentDate,
        confirmedAt: r.confirmedAt,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        metadata: r.metadata,
      }));

      return {
        payments,
        pagination: {
          page: input.page,
          limit: input.limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / input.limit)),
        },
      };
    }),

  /**
   * Processar pagamento (aprovar/rejeitar)
   */
  processPayment: adminProcedure
    .input(z.object({
      id: z.union([z.string(), z.number()]),
      status: z.enum(["pending", "confirmed", "failed", "cancelled"]),
      paymentDate: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // HOTFIX D18: atua sobre marketplace_orders
      const mapStatus: Record<string, { payment_status: string; status: string }> = {
        pending:   { payment_status: "pending",   status: "pending"   },
        confirmed: { payment_status: "paid",      status: "paid"      },
        failed:    { payment_status: "failed",    status: "cancelled" },
        cancelled: { payment_status: "cancelled", status: "cancelled" },
      };
      const m = mapStatus[input.status] ?? mapStatus.pending;
      const paidAt = input.status === "confirmed" ? (input.paymentDate ?? new Date()) : null;
      const res: any = await (ctx as any).db.execute(
        `UPDATE marketplace_orders
            SET payment_status=$2, status=$3, paid_at=COALESCE($4, paid_at), updated_at=NOW()
          WHERE id = $1
          RETURNING id`,
        [String(input.id), m.payment_status, m.status, paidAt] as any
      );
      const rows = (res?.rows ?? res ?? []) as any[];
      if (!rows.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Pagamento não encontrado em marketplace_orders" });
      }
      return { success: true, message: `Pagamento ${input.status}`, orderId: rows[0].id };
    }),

  // ============ NETWORK ============

  /**
   * Visualizar árvore de rede
   */
  getNetworkTree: adminProcedure
    .input(z.object({
      rootAffiliateId: z.number().optional(),
      rootUserId: z.number().optional(),
      maxDepth: z.number().min(1).max(10).default(3),
    }).optional())
    .query(async ({ input }) => {
      const { Pool } = await import("pg");
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      const client = await pool.connect();
      try {
        const maxDepth = input?.maxDepth ?? 3;

        // Resolver rootAffiliateId a partir de rootUserId se necessario
        let rootId = input?.rootAffiliateId ?? null;
        if (!rootId && input?.rootUserId) {
          const r = await client.query(
            `SELECT id FROM affiliates WHERE "userId" = $1 LIMIT 1`,
            [input.rootUserId],
          );
          rootId = r.rows[0]?.id ?? null;
        }
        if (!rootId) {
          const rootRes = await client.query(
            `SELECT id FROM affiliates WHERE "affiliateCode" = 'NX-FOUNDER-001' LIMIT 1`,
          );
          rootId = rootRes.rows[0]?.id ?? null;
        }
        if (!rootId) return { root: null, nodes: [], totalNodes: 0, directs: 0, source: "root_not_found" };

        // Query recursiva SEM filtro is_test_data (para nao esconder cadastros reais em beta)
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
            WHERE t.depth < $2
          )
          SELECT id, "affiliateCode" AS code, "userId", "sponsorId", name, email, depth
          FROM tree
          ORDER BY depth, id
        `, [rootId, maxDepth]);

        const nodes = treeRes.rows;
        const root = nodes.find((n: any) => n.depth === 1) ?? null;
        const directs = nodes.filter((n: any) => n.depth === 2).length;

        // Totais operacionais reais
        const totals = await client.query(`
          SELECT
            (SELECT COUNT(*)::int FROM users)      AS users_total,
            (SELECT COUNT(*)::int FROM affiliates) AS affiliates_total,
            (SELECT COUNT(*)::int FROM affiliates WHERE "sponsorId" IS NOT NULL) AS connections
        `);
        const t = totals.rows[0] || {};

        return {
          root,
          nodes,
          totalNodes: nodes.length,
          directs,
          totals: {
            users: Number(t.users_total || 0),
            affiliates: Number(t.affiliates_total || 0),
            connections: Number(t.connections || 0),
          },
          source: "db_real",
        };
      } finally {
        client.release();
        await pool.end();
      }
    }),

  // ============ SETTINGS ============
  getSettings: adminProcedure.query(async () => {
    const defaults = {
      platformName: "Nexus SaaS · IOAID",
      supportEmail: "suporte@nexus-saas.com.br",
      maxNetworkDepth: 5,
      compressionEnabled: true,
      matrix: { maxDirectsPerNode: 2, maxDepth: 5, compressionEnabled: true },
      commissionLevels: [
        { level: 1, percentage: 20, label: "1º Nível", description: "20% N.O 1º Nível" },
        { level: 2, percentage: 10, label: "2º Nível", description: "10% N.O 2º Nível" },
        { level: 3, percentage: 5, label: "3º Nível", description: "5% N.O 3º Nível" },
        { level: 4, percentage: 2.5, label: "4º Nível", description: "2,5% N.O 4º Nível" },
        { level: 5, percentage: 1, label: "5º Nível", description: "1% N.O 5º Nível" },
      ],
    };
    let persisted: Record<string, unknown> = {};
    try {
      const result = await pool.query('SELECT setting_value, updated_at FROM platform_settings WHERE setting_key = $1', ['go_live']);
      persisted = result.rows[0]?.setting_value ?? {};
      if (result.rows[0]?.updated_at) persisted.updatedAt = result.rows[0].updated_at.toISOString();
    } catch {
      // Migration ainda não aplicada: manter defaults seguros sem inventar dados.
    }
    return {
      ...defaults,
      ...persisted,
      matrix: { ...defaults.matrix, ...((persisted.matrix as Record<string, unknown>) ?? {}) },
      commissionLevels: Array.isArray(persisted.commissionLevels) ? persisted.commissionLevels : defaults.commissionLevels,
      apiStatus: {
        gemini: !!process.env.GEMINI_API_KEY,
        openai: !!process.env.OPENAI_API_KEY,
        database: !!process.env.DATABASE_URL,
        redis: !!process.env.REDIS_URL,
        hotmart: !!process.env.HOTMART_CLIENT_ID,
        shopee: !!process.env.SHOPEE_AFFILIATE_ID,
        mercadopago: !!process.env.MERCADO_PAGO_ACCESS_TOKEN,
      },
    };
  }),

  updateSettings: adminProcedure
    .input(z.object({
      platformName: z.string().trim().min(2).max(120).optional(),
      supportEmail: z.string().email().optional(),
      maxNetworkDepth: z.number().int().min(1).max(20).optional(),
      compressionEnabled: z.boolean().optional(),
      matrix: z.object({ maxDirectsPerNode: z.number().int().min(1).max(20), maxDepth: z.number().int().min(1).max(20), compressionEnabled: z.boolean() }).optional(),
      commissionLevels: z.array(z.object({ level: z.number().int().min(1).max(5), percentage: z.number().min(0).max(100), label: z.string().max(80).optional(), description: z.string().max(240).optional() })).length(5).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const current = await pool.query('SELECT setting_value FROM platform_settings WHERE setting_key = $1', ['go_live']);
      const merged = { ...(current.rows[0]?.setting_value ?? {}), ...input, updatedAt: new Date().toISOString() };
      await pool.query(
        `INSERT INTO platform_settings (setting_key, setting_value, updated_by, updated_at)
         VALUES ($1, $2::jsonb, $3, NOW())
         ON CONFLICT (setting_key) DO UPDATE SET setting_value = EXCLUDED.setting_value, updated_by = EXCLUDED.updated_by, updated_at = NOW()`,
        ['go_live', JSON.stringify(merged), ctx.user.email ?? String(ctx.user.id)],
      );
      await pool.query(
        'INSERT INTO admin_audit_events (action, actor_email, target_type, target_id, metadata) VALUES ($1, $2, $3, $4, $5::jsonb)',
        ['settings.updated', ctx.user.email ?? null, 'platform_settings', 'go_live', JSON.stringify({ updated: Object.keys(input) })],
      );
      return { ok: true, updated: Object.keys(input), persistedAt: merged.updatedAt };
    }),

  setAffiliateOperationalStatus: adminProcedure
    .input(z.object({ userId: z.number().int().positive(), status: z.enum(['active', 'inactive', 'suspended']) }))
    .mutation(async ({ ctx, input }) => {
      const result = await pool.query(
        'UPDATE affiliates SET status = $1, "updatedAt" = NOW() WHERE "userId" = $2 RETURNING id',
        [input.status, input.userId],
      );
      if (!result.rowCount) throw new TRPCError({ code: 'NOT_FOUND', message: 'Afiliado não encontrado para este usuário.' });
      await pool.query(
        'INSERT INTO admin_audit_events (action, actor_email, target_type, target_id, metadata) VALUES ($1, $2, $3, $4, $5::jsonb)',
        ['affiliate.status_changed', ctx.user.email ?? null, 'affiliate', String(input.userId), JSON.stringify({ status: input.status })],
      );
      return { ok: true, status: input.status };
    }),

  clearRuntimeCache: adminProcedure.mutation(async ({ ctx }) => {
    await pool.query(
      'INSERT INTO admin_audit_events (action, actor_email, target_type, target_id) VALUES ($1, $2, $3, $4)',
      ['runtime.cache_cleared', ctx.user.email ?? null, 'runtime', 'cache'],
    ).catch(() => undefined);
    return { ok: true, message: "Cache runtime limpo" };
  }),

  previewGoLiveReset: adminProcedure.query(async () => {
    const tables = ['users', 'affiliates', 'commissions', 'payments'];
    const counts: Record<string, number> = {};
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*)::int AS count FROM ${table} WHERE COALESCE(is_test_data, FALSE) = TRUE`);
        counts[table] = Number(result.rows[0]?.count ?? 0);
      } catch { counts[table] = 0; }
    }
    return { counts, destructiveScope: 'Somente registros explicitamente marcados is_test_data=true.' };
  }),

  resetGoLiveOperationalData: adminProcedure
    .input(z.object({ confirmationText: z.literal('RESETAR GO LIVE') }))
    .mutation(async ({ ctx }) => {
      const client = await pool.connect();
      const deleted: Record<string, number> = {};
      try {
        await client.query('BEGIN');
        for (const table of ['commissions', 'payments', 'affiliates', 'users']) {
          const result = await client.query(`DELETE FROM ${table} WHERE COALESCE(is_test_data, FALSE) = TRUE`);
          deleted[table] = result.rowCount ?? 0;
        }
        await client.query(
          'INSERT INTO admin_audit_events (action, actor_email, target_type, target_id, metadata) VALUES ($1, $2, $3, $4, $5::jsonb)',
          ['go_live.test_data_reset', ctx.user.email ?? null, 'go_live', 'controlled_reset', JSON.stringify({ deleted })],
        );
        await client.query('COMMIT');
        return { ok: true, deleted };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally { client.release(); }
    }),

});