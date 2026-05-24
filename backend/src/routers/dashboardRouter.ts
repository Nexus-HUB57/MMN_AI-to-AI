import { protectedProcedure, publicProcedure, router } from "../trpc/trpc";
import { getAffiliateByUserId, getAgentByUserId, getTotalCommissions, getOrdersByAffiliate, getDirectReferrals } from "../../../database/schemas/db";
import { getQueueLogs, getJobLogs } from "../services/jobLogger";
import { getXPDetails } from "../services/xpService";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { affiliateXP, commissions, orders, dashboardMetrics } from "../../../database/schemas";

export const dashboardRouter = router({
  /**
   * Get comprehensive dashboard metrics for the authenticated affiliate
   */
  getMyDashboard: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await getAffiliateByUserId(ctx.user.id);
    const agent = await getAgentByUserId(ctx.user.id);

    if (!affiliate) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Affiliate profile not found",
      });
    }

    // Get real metrics from database
    const [xpData] = await ctx.db.select().from(affiliateXP).where(eq(affiliateXP.affiliateId, affiliate.id)).limit(1);
    const [totalCommissions] = await ctx.db.select().from(commissions).where(eq(commissions.affiliateId, affiliate.id));
    const directReferrals = await getDirectReferrals(ctx.user.id);

    // Calculate total earnings from commissions
    const allCommissions = await ctx.db.select().from(commissions).where(eq(commissions.affiliateId, affiliate.id));
    const totalEarnings = allCommissions.reduce((sum, c) => sum + (c.status === 'confirmed' || c.status === 'paid' ? c.amount : 0), 0);
    const pendingCommissions = allCommissions.reduce((sum, c) => sum + (c.status === 'pending' ? c.amount : 0), 0);

    // Get recent orders
    const recentOrders = await ctx.db.select().from(orders)
      .where(eq(orders.affiliateId, affiliate.id))
      .orderBy(desc(orders.createdAt))
      .limit(10);

    // Calculate network size (total downline)
    const networkSize = await calculateNetworkSize(affiliate.id);

    return {
      affiliate: {
        id: affiliate.id,
        affiliateCode: affiliate.affiliateCode,
        commissionPercentage: affiliate.commissionPercentage,
        status: affiliate.status,
      },
      xp: xpData ? {
        totalXp: xpData.totalXp,
        currentLevel: xpData.currentLevel,
        monthlyXp: xpData.monthlyXp,
      } : { totalXp: 0, currentLevel: 1, monthlyXp: 0 },
      earnings: {
        totalEarnings,
        pendingCommissions,
      },
      network: {
        directReferrals: directReferrals.length,
        networkSize,
      },
      agent: agent ? {
        id: agent.id,
        name: agent.name,
        status: agent.status,
        performanceScore: agent.performanceScore,
      } : null,
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        externalOrderId: o.externalOrderId,
        amount: o.amount,
        commissionAmount: o.commissionAmount,
        status: o.status,
        marketplace: o.marketplace,
        createdAt: o.createdAt,
      })),
    };
  }),

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
    const xpDetails = await getXPDetails(affiliate.id);

    return {
      commissions: {
        total: totalCommissions,
      },
      xp: {
        currentLevel: xpDetails.xp.currentLevel,
        totalXp: xpDetails.xp.totalXp,
        progressToNextLevel: xpDetails.progressToNextLevel,
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

  /**
   * Get execution logs for a specific queue (Phase 7)
   */
  getQueueLogs: protectedProcedure
    .input(z.object({ 
      queueName: z.string(),
      limit: z.number().optional().default(50)
    }))
    .query(async ({ input }) => {
      return await getQueueLogs(input.queueName, input.limit);
    }),

  /**
   * Get logs for a specific job (Phase 7)
   */
  getJobLogs: protectedProcedure
    .input(z.object({
      jobId: z.string()
    }))
    .query(async ({ input }) => {
      return await getJobLogs(input.jobId);
    }),
});

/**
 * Calculate total network size (recursive count of downline)
 */
async function calculateNetworkSize(affiliateId: number): Promise<number> {
  const { getDb } = await import("../../../database/schemas/db");
  const { network } = await import("../../../database/schemas/schema-final");

  const db = await getDb();
  if (!db) return 0;

  const directDownline = await db.select().from(network).where(eq(network.sponsorId, affiliateId));

  let totalCount = directDownline.length;

  for (const member of directDownline) {
    totalCount += await calculateNetworkSize(member.userId);
  }

  return totalCount;
}
