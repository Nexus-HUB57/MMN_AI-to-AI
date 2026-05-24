import { TRPCError } from "@trpc/server";
import { z } from "zod";

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
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import {
  publishAffiliateActivated,
  publishAffiliateRegistered,
} from "../domains/affiliate/events";

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

const defaultContentStrategy = {
  platforms: ["instagram", "facebook", "whatsapp"],
  postingFrequency: "daily",
  tone: "professional",
  targetAudience: "general",
};

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
      const existingAffiliate = await getAffiliateByUserId(ctx.user.id);
      if (existingAffiliate) {
        return existingAffiliate;
      }

      const sponsor = await getAffiliateByCode(input.sponsorCode);
      if (!sponsor) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sponsor affiliate not found",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "SERVICE_UNAVAILABLE",
          message: "Database not available",
        });
      }

      const affiliateCode = nanoid(12).toUpperCase();

      await db.insert(affiliates).values({
        userId: ctx.user.id,
        affiliateCode,
        sponsorId: sponsor.id,
        commissionPercentage: input.commissionPercentage,
        status: "active",
        totalCommissions: 0,
        pendingCommissions: 0,
      });

      await db.insert(network).values({
        userId: ctx.user.id,
        sponsorId: sponsor.userId,
        level: 1,
      });

      const existingAgent = await getAgentByUserId(ctx.user.id);
      if (!existingAgent) {
        await createAgent({
          userId: ctx.user.id,
          name: `Agente ${ctx.user.name ?? ctx.user.id}`,
          status: "learning",
          contentStrategy: JSON.stringify(defaultContentStrategy),
          performanceScore: 0,
        });
      }

      const createdAffiliate = await getAffiliateByUserId(ctx.user.id);
      if (!createdAffiliate) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create affiliate profile",
        });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, ctx.user.id))
        .limit(1);

      await publishAffiliateRegistered(
        {
          affiliateId: String(createdAffiliate.id),
          sponsorId: sponsor.id ? String(sponsor.id) : undefined,
          email: user?.email ?? "",
          name: user?.name ?? createdAffiliate.affiliateCode,
          plan: "affiliate",
          rank: createdAffiliate.status,
        },
        {
          source: "mmn.registerAffiliate",
          userId: ctx.user.id,
          sponsorCode: input.sponsorCode,
          commissionPercentage: input.commissionPercentage,
        },
      );

      await publishAffiliateActivated(String(createdAffiliate.id), {
        source: "mmn.registerAffiliate",
        userId: ctx.user.id,
      });

      return createdAffiliate;
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
