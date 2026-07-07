import { adminProcedure, protectedProcedure, publicProcedure, router } from "../config/trpc";
import { z } from "zod";
import { eq, desc, count, sql, or, like } from "drizzle-orm";
import { users, affiliates } from "../../../database/schemas/schema-final";
import { TRPCError } from "@trpc/server";

/**
 * Users Router - Gestão de usuários
 *
 * Endpoints públicos e protegidos para listagem e gerenciamento de usuários
 */
export const usersRouter = router({
  /**
   * Listar todos os usuários (protegido)
   */
  list: protectedProcedure
    .input(z.object({
      offset: z.number().default(0),
      limit: z.number().default(50),
      search: z.string().optional(),
      role: z.enum(["user", "admin"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input.search) {
        conditions.push(
          or(
            like(users.name, `%${input.search}%`),
            like(users.email, `%${input.search}%`)
          )
        );
      }

      if (input.role) {
        conditions.push(eq(users.role, input.role));
      }

      const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : undefined;

      const [usersList, [{ total }]] = await Promise.all([
        ctx.db.select({
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
          createdAt: users.createdAt,
          lastSignedIn: users.lastSignedIn,
          loginMethod: users.loginMethod,
        })
        .from(users)
        .where(whereClause)
        .orderBy(desc(users.createdAt))
        .limit(input.limit)
        .offset(input.offset),
        ctx.db.select({ total: count() }).from(users).where(whereClause),
      ]);

      return usersList;
    }),

  /**
   * Buscar usuário por ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const [user] = await ctx.db.select().from(users).where(eq(users.id, input.id));

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      const [affiliate] = await ctx.db.select().from(affiliates).where(eq(affiliates.userId, input.id));

      return {
        ...user,
        affiliate: affiliate || null,
      };
    }),

  /**
   * Atualizar papel do usuário (admin)
   */
  updateRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["user", "admin"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const [user] = await ctx.db.select().from(users).where(eq(users.id, input.userId));

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Alteração de papel administrativo desabilitada. Use configuração protegida para qualquer ajuste de acesso admin.",
      });
    }),

  /**
   * Atualizar status do usuário (admin)
   */
  updateStatus: adminProcedure
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

  /**
   * Estatísticas de usuários
   */
  getStats: publicProcedure.query(async ({ ctx }) => {
    const [[totalUsers], [totalAffiliates], [activeAffiliates]] = await Promise.all([
      ctx.db.select({ count: count() }).from(users),
      ctx.db.select({ count: count() }).from(affiliates),
      ctx.db.select({ count: count() }).from(affiliates).where(eq(affiliates.status, "active")),
    ]);

    return {
      totalUsers: Number(totalUsers.count),
      totalAffiliates: Number(totalAffiliates.count),
      activeAffiliates: Number(activeAffiliates.count),
    };
  }),
  /**
   * ID Indicador único do afiliado (referralCode)
   * Gera um identificador estável e único por usuário a partir do user.id
   */
  getReferral: protectedProcedure.query(async ({ ctx }) => {
    const userId = (ctx as any)?.user?.id ?? (ctx as any)?.userId ?? null;
    if (!userId) {
      return { code: "", url: "", userId: null };
    }
    // Gerar código estável a partir do id (base36 + prefixo NX)
    const num = Number(userId);
    const safe = isNaN(num)
      ? String(userId).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase()
      : num.toString(36).toUpperCase().padStart(5, "0");
    const code = `NX${safe}`;
    const url = `https://oneverso.com.br/cadastro?ref=${code}`;
    return { code, url, userId };
  }),


  /**
   * Link público da Minha Loja do afiliado (vitrine compartilhável)
   */
  myStoreLink: protectedProcedure.query(async ({ ctx }) => {
    const userId = (ctx as any)?.user?.id ?? (ctx as any)?.userId ?? null;
    if (!userId) return { url: "", code: "" };
    const num = Number(userId);
    const safe = isNaN(num)
      ? String(userId).replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase()
      : num.toString(36).toUpperCase().padStart(5, "0");
    const code = `NX${safe}`;
    return { url: `https://oneverso.com.br/minha-loja/${code}`, code };
  }),

});