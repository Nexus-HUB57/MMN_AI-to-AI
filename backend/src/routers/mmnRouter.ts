import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { protectedProcedure, publicProcedure, router } from "../config/trpc";
import {
  createAgent,
  getActiveUpgrades as getAgentActiveUpgrades,
  getAffiliateByCode,
  getAffiliateByUserId,
  getAgentByUserId,
  getDb,
  getDirectReferrals,
  getNetworkTree,
  getOrdersByAffiliate,
  getPendingCommissions,
  getTotalCommissions,
  getTrendingProducts,
} from "../../../database/schemas/db";
import { affiliates, network, users } from "../../../database/schemas/schema-final";
import {
  AffiliateAlreadyExistsError,
  AffiliateCreationFailedError,
  SponsorNotFoundError,
  registerAffiliate as registerAffiliateService,
} from "../domains/affiliate/service";

const registerAffiliateInput = z.object({
  sponsorCode: z.string().trim().min(3).max(32),
  commissionPercentage: z.number().int().min(1).max(100).default(10),
});

const orderQueryInput = z
  .object({
    limit: z.number().int().min(1).max(100).default(10),
  })
  .optional();

const trendingProductsInput = z
  .object({
    limit: z.number().int().min(1).max(50).default(10),
  })
  .optional();

async function resolveAffiliateOrThrow(userId: number) {
  const affiliate = await getAffiliateByUserId(userId);
  if (!affiliate) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Affiliate profile not found",
    });
  }
  return affiliate;
}

async function resolveAgentOrThrow(userId: number) {
  const agent = await getAgentByUserId(userId);
  if (!agent) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Agent not found",
    });
  }
  return agent;
}

export const mmnRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    return resolveAffiliateOrThrow(ctx.user.id);
  }),

  getAffiliateByCode: publicProcedure
    .input(z.object({ code: z.string().trim().min(1) }))
    .query(async ({ input }) => {
      const affiliate = await getAffiliateByCode(input.code);
      if (!affiliate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Affiliate not found",
        });
      }
      return affiliate;
    }),

  getAgent: protectedProcedure.query(async ({ ctx }) => {
    return resolveAgentOrThrow(ctx.user.id);
  }),

  registerAffiliate: protectedProcedure
    .input(registerAffiliateInput)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "Database not available",
        });
      }

      try {
        const { affiliate } = await registerAffiliateService(
          {
            userId: ctx.user.id,
            userName: ctx.user.name ?? null,
            userEmail: (ctx.user as any).email ?? null,
            sponsorCode: input.sponsorCode,
            commissionPercentage: input.commissionPercentage,
          },
          {
            getAffiliateByUserId,
            getAffiliateByCode,
            getAgentByUserId,
            insertAffiliate: async (params) => {
              await db.insert(affiliates).values({
                userId: params.userId,
                affiliateCode: params.affiliateCode,
                sponsorId: params.sponsorId,
                commissionPercentage: params.commissionPercentage,
                status: "active",
                totalCommissions: 0,
                pendingCommissions: 0,
              });
            },
            insertNetworkLink: async (params) => {
              await db.insert(network).values({
                userId: params.userId,
                sponsorId: params.sponsorUserId,
                level: params.level,
              });
            },
            createAgent: async (params) => {
              await createAgent({
                userId: params.userId,
                name: params.name,
                status: "learning",
                contentStrategy: params.contentStrategy,
                performanceScore: 0,
              });
            },
            getUserById: async (userId) => {
              const [user] = await db
                .select()
                .from(users)
                .where(eq(users.id, userId))
                .limit(1);
              if (!user) return null;
              return {
                id: user.id,
                email: user.email ?? null,
                name: user.name ?? null,
              };
            },
          },
        );

        return affiliate;
      } catch (error) {
        if (error instanceof AffiliateAlreadyExistsError) {
          return error.existing;
        }
        if (error instanceof SponsorNotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Sponsor affiliate not found",
          });
        }
        if (error instanceof AffiliateCreationFailedError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create affiliate profile",
          });
        }
        throw error;
      }
    }),

  getDirectReferrals: protectedProcedure.query(async ({ ctx }) => {
    return getDirectReferrals(ctx.user.id);
  }),

  getNetworkTree: protectedProcedure.query(async ({ ctx }) => {
    return getNetworkTree(ctx.user.id);
  }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await resolveAffiliateOrThrow(ctx.user.id);
    const [total, pending] = await Promise.all([
      getTotalCommissions(affiliate.id),
      getPendingCommissions(affiliate.id),
    ]);

    return { total, pending };
  }),

  getTotalCommissions: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await resolveAffiliateOrThrow(ctx.user.id);
    return getTotalCommissions(affiliate.id);
  }),

  getPendingCommissions: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await resolveAffiliateOrThrow(ctx.user.id);
    return getPendingCommissions(affiliate.id);
  }),

  getRecentOrders: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await resolveAffiliateOrThrow(ctx.user.id);
    return getOrdersByAffiliate(affiliate.id, 10);
  }),

  getOrders: protectedProcedure
    .input(orderQueryInput)
    .query(async ({ ctx, input }) => {
      const affiliate = await resolveAffiliateOrThrow(ctx.user.id);
      return getOrdersByAffiliate(affiliate.id, input?.limit ?? 10);
    }),

  getTrendingProducts: publicProcedure
    .input(trendingProductsInput)
    .query(async ({ input }) => {
      return getTrendingProducts(input?.limit ?? 10);
    }),

  getUpgrades: protectedProcedure.query(async ({ ctx }) => {
    const agent = await resolveAgentOrThrow(ctx.user.id);
    return getAgentActiveUpgrades(agent.id);
  }),

  getActiveUpgrades: protectedProcedure.query(async ({ ctx }) => {
    const agent = await resolveAgentOrThrow(ctx.user.id);
    return getAgentActiveUpgrades(agent.id);
  }),
});
