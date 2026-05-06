import { protectedProcedure, router } from "../config/trpc";
import { getAffiliateByUserId, getAgentByUserId, getTotalCommissions, getOrdersByAffiliate } from "../../database/schemas/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const dashboardRouter = router({
  /**
   * Get dashboard summary metrics (commissions and agent status)
   */
  getMetrics: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    const agent = await getAgentByUserId(ctx.user.id);

    if (!affiliate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Affiliate profile not found",
      });
    }

    const totalCommissions = await getTotalCommissions(affiliate.id);

    return {
      commissions: {
        total: totalCommissions,
      },
      agent: agent ? {
        id: agent.id,
        name: agent.name,
        status: agent.status,
        vitals: {
          energy: 85,
          health: 92,
        }
      } : null,
    };
  }),

  /**
   * Get recent sales/orders for the dashboard
   */
  getRecentSales: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Affiliate profile not found",
        });
      }
      return await getOrdersByAffiliate(affiliate.id, input.limit);
    }),
});
