import { adminProcedure, protectedProcedure, publicProcedure, router } from "../config/trpc";
import { z } from "zod";
import { eq, count, sql, desc } from "drizzle-orm";
import { affiliates, users, network } from "../../../database/schemas/schema-final";
import { TRPCError } from "@trpc/server";

/**
 * Network Router - Gestão da rede MMN
 *
 * Endpoints para visualização e gerenciamento da rede de afiliados
 */
export const networkRouter = router({
  /**
   * Obter árvore de rede de um afiliado
   */
  getTree: protectedProcedure
    .input(z.object({
      affiliateId: z.number().optional(),
      userId: z.number().optional(),
      maxDepth: z.number().default(3),
    }))
    .query(async ({ ctx, input }) => {
      // Determinar o affiliateId
      let targetAffiliateId = input.affiliateId;

      if (!targetAffiliateId && input.userId) {
        const [affiliate] = await ctx.db.select().from(affiliates).where(eq(affiliates.userId, input.userId));
        targetAffiliateId = affiliate?.id;
      }

      if (!targetAffiliateId) {
        // Se não passou nenhum ID, usar o próprio usuário
        const [affiliate] = await ctx.db.select().from(affiliates).where(eq(affiliates.userId, ctx.user.id));
        targetAffiliateId = affiliate?.id;
      }

      if (!targetAffiliateId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Afiliado não encontrado" });
      }

      // Buscar sponsor (upline)
      const [sponsor] = await ctx.db.select().from(affiliates).where(eq(affiliates.id, targetAffiliateId));
      const [sponsorUser] = sponsor?.sponsorId
        ? await ctx.db.select().from(affiliates).where(eq(affiliates.id, sponsor.sponsorId))
        : [];

      // Construir árvore recursiva
      const buildTree = async (affiliateId: number, depth: number): Promise<any[]> => {
        if (depth > (input.maxDepth || 3)) return [];

        const downlines = await ctx.db.select().from(network).where(eq(network.sponsorId, affiliateId));
        const tree = [];

        for (const downline of downlines) {
          const [user] = await ctx.db.select().from(users).where(eq(users.id, downline.userId));
          const [aff] = await ctx.db.select().from(affiliates).where(eq(affiliates.userId, downline.userId));

          tree.push({
            id: aff?.id,
            userId: downline.userId,
            name: user?.name || "Desconhecido",
            email: user?.email,
            affiliateCode: aff?.affiliateCode,
            level: downline.level,
            status: aff?.status,
            joinedAt: aff?.createdAt,
            children: await buildTree(downline.userId, depth + 1),
          });
        }

        return tree;
      };

      return buildTree(targetAffiliateId, 0);
    }),

  /**
   * Obter downlines diretos (referências diretas)
   */
  getDirectReferrals: protectedProcedure
    .input(z.object({
      affiliateId: z.number().optional(),
      userId: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // Determinar o affiliateId
      let targetAffiliateId = input.affiliateId;

      if (!targetAffiliateId && input.userId) {
        const [affiliate] = await ctx.db.select().from(affiliates).where(eq(affiliates.userId, input.userId));
        targetAffiliateId = affiliate?.id;
      }

      if (!targetAffiliateId && ctx.user) {
        const [affiliate] = await ctx.db.select().from(affiliates).where(eq(affiliates.userId, ctx.user.id));
        targetAffiliateId = affiliate?.id;
      }

      if (!targetAffiliateId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Afiliado não encontrado" });
      }

      // Buscar sponsor do usuário atual
      const [currentAffiliate] = await ctx.db.select().from(affiliates).where(eq(affiliates.id, targetAffiliateId));
      if (!currentAffiliate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Afiliado não encontrado" });
      }

      // Buscar downlines diretos (nível 1)
      const directDownlines = await ctx.db.select().from(network).where(eq(network.sponsorId, targetAffiliateId));

      const referrals = [];
      for (const downline of directDownlines) {
        const [user] = await ctx.db.select().from(users).where(eq(users.id, downline.userId));
        const [aff] = await ctx.db.select().from(affiliates).where(eq(affiliates.userId, downline.userId));

        referrals.push({
          id: aff?.id,
          userId: downline.userId,
          name: user?.name || "Desconhecido",
          email: user?.email,
          affiliateCode: aff?.affiliateCode,
          level: downline.level,
          status: aff?.status,
          joinedAt: aff?.createdAt,
          totalDownline: 0, // Será calculado
        });
      }

      // Ordenar por data de cadastro
      referrals.sort((a, b) => new Date(b.joinedAt || 0).getTime() - new Date(a.joinedAt || 0).getTime());

      return referrals;
    }),

  /**
   * Obter estatísticas da rede (para admin)
   */
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [[totalAffiliates], [activeAffiliates]] = await Promise.all([
      ctx.db.select({ count: count() }).from(affiliates),
      ctx.db.select({ count: count() }).from(affiliates).where(eq(affiliates.status, "active")),
    ]);

    const allNetwork = await ctx.db.select().from(network);
    const uniqueSponsors = new Set(allNetwork.map(n => n.sponsorId));

    return {
      totalAffiliates: Number(totalAffiliates.count),
      activeAffiliates: Number(activeAffiliates.count),
      totalConnections: allNetwork.length,
      uniqueSponsors: uniqueSponsors.size,
      averageDepth: allNetwork.length > 0
        ? allNetwork.reduce((sum, n) => sum + n.level, 0) / allNetwork.length
        : 0,
    };
  }),

  /**
   * Obter rede por afiliado (admin)
   */
  getByAffiliate: adminProcedure
    .input(z.object({
      affiliateId: z.number(),
      maxDepth: z.number().default(3),
    }))
    .query(async ({ ctx, input }) => {
      const [affiliate] = await ctx.db.select().from(affiliates).where(eq(affiliates.id, input.affiliateId));

      if (!affiliate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Afiliado não encontrado" });
      }

      const [user] = await ctx.db.select().from(users).where(eq(users.id, affiliate.userId));

      return {
        affiliate: {
          id: affiliate.id,
          userId: affiliate.userId,
          name: user?.name,
          email: user?.email,
          affiliateCode: affiliate.affiliateCode,
          status: affiliate.status,
          createdAt: affiliate.createdAt,
        },
        tree: await networkRouter.createCaller(ctx).getTree({ affiliateId: input.affiliateId, maxDepth: input.maxDepth }),
      };
    }),

  /**
   * Listar top afiliados por volume de rede
   */
  getTopSponsors: protectedProcedure
    .input(z.object({
      limit: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      const allNetwork = await ctx.db.select().from(network);

      // Agrupar por sponsor e contar downlines
      const sponsorCounts = allNetwork.reduce((acc, n) => {
        acc[n.sponsorId] = (acc[n.sponsorId] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // Ordenar por volume
      const sorted = Object.entries(sponsorCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, input.limit);

      const topSponsors = [];
      for (const [sponsorId, count] of sorted) {
        const [aff] = await ctx.db.select().from(affiliates).where(eq(affiliates.id, Number(sponsorId)));
        if (aff) {
          const [user] = await ctx.db.select().from(users).where(eq(users.id, aff.userId));
          topSponsors.push({
            id: aff.id,
            name: user?.name || "Desconhecido",
            email: user?.email,
            affiliateCode: aff.affiliateCode,
            downlineCount: count,
          });
        }
      }

      return topSponsors;
    }),

  /**
   * Buscar upline (patrocinador) de um afiliado
   */
  getUpline: protectedProcedure
    .input(z.object({
      affiliateId: z.number(),
    }))
    .query(async ({ ctx, input }) => {
      const [affiliate] = await ctx.db.select().from(affiliates).where(eq(affiliates.id, input.affiliateId));

      if (!affiliate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Afiliado não encontrado" });
      }

      if (!affiliate.sponsorId) {
        return null; // Sem upline (raiz da rede)
      }

      const [sponsor] = await ctx.db.select().from(affiliates).where(eq(affiliates.id, affiliate.sponsorId));

      if (!sponsor) {
        return null;
      }

      const [user] = await ctx.db.select().from(users).where(eq(users.id, sponsor.userId));

      return {
        id: sponsor.id,
        name: user?.name || "Desconhecido",
        email: user?.email,
        affiliateCode: sponsor.affiliateCode,
        status: sponsor.status,
      };
    }),
});