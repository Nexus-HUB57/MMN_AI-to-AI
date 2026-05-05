import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  affiliate: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const affiliate = await db.getAffiliateByUserId(ctx.user.id);
      if (!affiliate) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Affiliate profile not found" });
      }
      return affiliate;
    }),

    getTotalCommissions: protectedProcedure.query(async ({ ctx }) => {
      const affiliate = await db.getAffiliateByUserId(ctx.user.id);
      if (!affiliate) return "0.00";
      return await db.getTotalCommissionsByAffiliate(affiliate.id);
    }),

    getPendingCommissions: protectedProcedure.query(async ({ ctx }) => {
      const affiliate = await db.getAffiliateByUserId(ctx.user.id);
      if (!affiliate) return "0.00";
      return await db.getPendingCommissionsByAffiliate(affiliate.id);
    }),

    getDirectReferrals: protectedProcedure.query(async ({ ctx }) => {
      const affiliate = await db.getAffiliateByUserId(ctx.user.id);
      if (!affiliate) return [];
      return await db.getDirectReferrals(affiliate.id);
    }),

    getNetwork: protectedProcedure.query(async ({ ctx }) => {
      const affiliate = await db.getAffiliateByUserId(ctx.user.id);
      if (!affiliate) return [];
      return await db.getNetworkByAffiliate(affiliate.id);
    }),

    getCommissionHistory: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        const affiliate = await db.getAffiliateByUserId(ctx.user.id);
        if (!affiliate) return [];
        return await db.getCommissionHistory(affiliate.id, input.limit);
      }),

    getAffiliateByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        return await db.getAffiliateByCode(input.code);
      }),
  }),

  agent: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const agent = await db.getAgentByUserId(ctx.user.id);
      if (!agent) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agent profile not found" });
      }
      return agent;
    }),
  }),

  upgrades: router({
    listAvailable: protectedProcedure.query(async () => {
      return await db.getAvailableUpgrades();
    }),

    listActive: protectedProcedure.query(async ({ ctx }) => {
      const agent = await db.getAgentByUserId(ctx.user.id);
      if (!agent) return [];
      return await db.getActiveUpgradesByAgent(agent.id);
    }),

    activateUpgrade: protectedProcedure
      .input(z.object({ upgradeId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const agent = await db.getAgentByUserId(ctx.user.id);
        if (!agent) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
        }
        // TODO: Implement upgrade activation logic
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
