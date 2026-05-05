import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDashboardStats, getAgentByUserId } from "./db";

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

  dashboard: router({
    getStats: protectedProcedure.query(async ({ ctx }) => {
      const stats = await getDashboardStats(ctx.user.id);
      return stats || {
        totalEarnings: 0,
        pendingCommissions: 0,
        directReferrals: 0,
        agent: null,
      };
    }),
    getAgent: protectedProcedure.query(async ({ ctx }) => {
      const agent = await getAgentByUserId(ctx.user.id);
      return agent || null;
    }),
  }),
});

export type AppRouter = typeof appRouter;
