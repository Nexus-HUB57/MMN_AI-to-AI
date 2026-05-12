import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../config/trpc";
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
  /** Get current user's affiliate profile */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    if (!affiliate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Affiliate profile not found",
      });
    }
    return affiliate;
  }),

  /** Get affiliate by code (for mini-site) */
  getAffiliateByCode: publicProcedure
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

  /** Get user's AI agent */
  getAgent: protectedProcedure.query(async ({ ctx }) => {
    const agent = await getAgentByUserId(ctx.user.id);
    if (!agent) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Agent not found",
      });
    }
    return agent;
  }),

  /** Get direct referrals */
  getDirectReferrals: protectedProcedure.query(async ({ ctx }) => {
    return getDirectReferrals(ctx.user.id);
  }),

  /** Get full network tree */
  getNetworkTree: protectedProcedure.query(async ({ ctx }) => {
    return getNetworkTree(ctx.user.id);
  }),

  /** Get commission statistics */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [total, pending] = await Promise.all([
      getTotalCommissions(ctx.user.id),
      getPendingCommissions(ctx.user.id),
    ]);
    return { total, pending };
  }),

  /** Get recent orders */
  getRecentOrders: protectedProcedure.query(async ({ ctx }) => {
    return getOrdersByAffiliate(ctx.user.id, 10);
  }),

  /** Get trending products for the agent */
  getTrendingProducts: protectedProcedure.query(async () => {
    return getTrendingProducts(10);
  }),

  /** Get active upgrades */
  getUpgrades: protectedProcedure.query(async ({ ctx }) => {
    return getActiveUpgrades(ctx.user.id);
  }),
});
