import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../config/trpc";
import { getDb } from "../../database/schemas/db";
import {
  getAffiliateByUserId,
  getAffiliateByCode,
  getAgentByUserId,
  getDirectReferrals,
  getNetworkTree,
  getTotalCommissions,
  getPendingCommissions,
  getOrdersByAffiliate,
  getTrendingProducts,
  getActiveUpgrades,
} from "../../database/schemas/db";
import { affiliates, agents, network, InsertAffiliate, InsertAgent } from "../../database/schemas/schema-final";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";

export const mmnRouter = router({
  /**\n   * Get current user's affiliate profile\n   */\n  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    if (!affiliate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Affiliate profile not found",
      });
    }
    return affiliate;
  }),

  /**\n   * Get affiliate by code (for mini-site)\n   */\n  getAffiliateByCode: publicProcedure
    .input(z.object({ code: z.string() }))
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

  /**\n   * Get user's AI agent\n   */\n  getAgent: protectedProcedure.query(async ({ ctx }) => {
    const agent = await getAgentByUserId(ctx.user.id);
    if (!agent) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Agent not found",
      });
    }
    return agent;
  }),

  /**\n   * Initialize AI agent for new user\n   */\n  initializeAgent: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const existingAgent = await getAgentByUserId(ctx.user.id);
    if (existingAgent) {
      return existingAgent;
    }

    const newAgent: InsertAgent = {
      userId: ctx.user.id,
      name: `Agent of ${ctx.user.name || "User"}`,
      status: "learning",
      contentStrategy: JSON.stringify({
        platforms: ["whatsapp", "instagram", "facebook"],
        postingFrequency: "daily",
        tone: "professional",
      }),
    };

    const result = await db.insert(agents).values(newAgent);
    return { id: result.insertId, ...newAgent };
  }),

  /**\n   * Get direct referrals\n   */\n  getDirectReferrals: protectedProcedure.query(async ({ ctx }) => {
    return await getDirectReferrals(ctx.user.id);
  }),

  /**\n   * Get network tree\n   */\n  getNetworkTree: protectedProcedure
    .input(z.object({ maxDepth: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return await getNetworkTree(ctx.user.id, input.maxDepth);
    }),

  /**\n   * Get total commissions\n   */\n  getTotalCommissions: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    if (!affiliate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Affiliate not found",
      });
    }
    return await getTotalCommissions(affiliate.id);
  }),

  /**\n   * Get pending commissions\n   */\n  getPendingCommissions: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    if (!affiliate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Affiliate not found",
      });
    }
    return await getPendingCommissions(affiliate.id);
  }),

  /**\n   * Get orders by affiliate\n   */\n  getOrders: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Affiliate not found",
        });
      }
      return await getOrdersByAffiliate(affiliate.id, input.limit);
    }),

  /**\n   * Get trending products\n   */\n  getTrendingProducts: publicProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input }) => {
      return await getTrendingProducts(input.limit);
    }),

  /**\n   * Get active upgrades\n   */\n  getActiveUpgrades: protectedProcedure.query(async ({ ctx }) => {
    const agent = await getAgentByUserId(ctx.user.id);
    if (!agent) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Agent not found",
      });
    }
    return await getActiveUpgrades(agent.id);
  }),

  /**\n   * Get dashboard summary metrics\n   */\n  getDashboardMetrics: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    const agent = await getAgentByUserId(ctx.user.id);

    if (!affiliate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Affiliate profile not found",
      });
    }

    const totalCommissions = await getTotalCommissions(affiliate.id);
    const pendingCommissions = await getPendingCommissions(affiliate.id);
    const recentOrders = await getOrdersByAffiliate(affiliate.id, 5);
    const directReferrals = await getDirectReferrals(ctx.user.id);

    return {
      commissions: {
        total: totalCommissions,
        pending: pendingCommissions,
      },
      agent: agent ? {
        id: agent.id,
        name: agent.name,
        status: agent.status,
        vitals: {
          energy: 85, // Mocked for now
          health: 92, // Mocked for now
        }
      } : null,
      network: {
        directCount: directReferrals.length,
      },
      recentOrders,
    };
  }),

  /**\n   * Request commission withdrawal\n   */\n  requestWithdraw: protectedProcedure
    .input(z.object({ amount: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Affiliate profile not found",
        });
      }

      const totalCommissions = await getTotalCommissions(affiliate.id);
      if (input.amount > totalCommissions) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Insufficient balance for withdrawal",
        });
      }

      // Here you would normally create a withdrawal record in the DB
      // For now we just return success
      return {
        success: true,
        requestId: nanoid(),
        amount: input.amount,
        status: "pending",
      };
    }),

  /**\n   * Create new affiliate (register with sponsor)\n   */\n  registerAffiliate: protectedProcedure
    .input(
      z.object({
        sponsorCode: z.string().optional(),
        commissionPercentage: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const existingAffiliate = await getAffiliateByUserId(ctx.user.id);
      if (existingAffiliate) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User already has an affiliate profile",
        });
      }

      let sponsorId: number | undefined;
      if (input.sponsorCode) {
        const sponsor = await getAffiliateByCode(input.sponsorCode);
        if (!sponsor) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Sponsor not found",
          });
        }
        sponsorId = sponsor.id;
      }

      const affiliateCode = nanoid(12);
      const newAffiliate: InsertAffiliate = {
        userId: ctx.user.id,
        sponsorId,
        affiliateCode,
        commissionPercentage: input.commissionPercentage || 10,
      };

      const result = await db.insert(affiliates).values(newAffiliate);
      const affiliateId = result.insertId;

      // Register in network if has sponsor
      if (sponsorId) {
        await db.insert(network).values({
          userId: ctx.user.id,
          sponsorId,
          level: 1,
        });
      }

      // Initialize agent
      const agentResult = await db.insert(agents).values({
        userId: ctx.user.id,
        name: `Agent of ${ctx.user.name || "User"}`,
        status: "learning",
      });

      return {
        id: affiliateId,
        ...newAffiliate,
      };
    }),
});
