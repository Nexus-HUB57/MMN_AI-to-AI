import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getAgentByUserId } from "./db";
import { getAgentPerformanceMetrics, getSystemHealthMetrics, getRecentActivityLogs } from "../services/performance-monitor";
import { TRPCError } from "@trpc/server";

export const performanceRouter = router({
  /**
   * Get current user's agent performance metrics
   */
  getMyAgentMetrics: protectedProcedure.query(async ({ ctx }) => {
    const agent = await getAgentByUserId(ctx.user.id);
    if (!agent) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Agent not found for this user",
      });
    }

    const metrics = await getAgentPerformanceMetrics(agent.id);
    if (!metrics) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve metrics",
      });
    }

    return metrics;
  }),

  /**
   * Get system-wide health metrics (public)
   */
  getSystemHealth: publicProcedure.query(async () => {
    return await getSystemHealthMetrics();
  }),

  /**
   * Get recent activity logs for current user's agent
   */
  getMyRecentActivity: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const agent = await getAgentByUserId(ctx.user.id);
      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found for this user",
        });
      }

      const limit = input?.limit || 50;
      return await getRecentActivityLogs(agent.id, limit);
    }),

  /**
   * Get performance comparison with network peers
   */
  getNetworkComparison: protectedProcedure.query(async ({ ctx }) => {
    const agent = await getAgentByUserId(ctx.user.id);
    if (!agent) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Agent not found for this user",
      });
    }

    const myMetrics = await getAgentPerformanceMetrics(agent.id);
    const systemHealth = await getSystemHealthMetrics();

    if (!myMetrics) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve metrics",
      });
    }

    // Calculate percentile
    const myScore = myMetrics.averageResponseTime > 0
      ? 100 - (myMetrics.averageResponseTime / 1000)
      : 50;

    const percentile = Math.min(100, Math.max(0, myScore));

    return {
      myMetrics: {
        totalActions: myMetrics.totalActions,
        successRate: myMetrics.totalActions > 0
          ? (myMetrics.successfulActions / myMetrics.totalActions) * 100
          : 0,
        averageResponseTime: myMetrics.averageResponseTime,
        skillsCount: myMetrics.skillsUsage.length,
        performancePercentile: percentile,
      },
      networkAverages: {
        averageActions: systemHealth.totalAgents > 0
          ? Math.round(myMetrics.totalActions / systemHealth.totalAgents * 10) / 10
          : 0,
        averageResponseTime: 500, // Simulated network average
        averageSkills: systemHealth.activeSkills / Math.max(1, systemHealth.totalAgents),
      },
      systemHealth: {
        totalAgents: systemHealth.totalAgents,
        activeAgents: systemHealth.activeAgents,
        averagePerformance: systemHealth.averagePerformance,
      },
    };
  }),

  /**
   * Get detailed skill analytics for current user's agent
   */
  getSkillAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const agent = await getAgentByUserId(ctx.user.id);
    if (!agent) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Agent not found for this user",
      });
    }

    const metrics = await getAgentPerformanceMetrics(agent.id);
    if (!metrics) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve metrics",
      });
    }

    // Calculate skill effectiveness scores
    const skillAnalytics = metrics.skillsUsage.map(skill => {
      const effectiveness = (skill.successRate * 0.7) +
        ((1000 - skill.averageDuration) / 1000 * 0.3);

      return {
        skillId: skill.skillId,
        skillName: skill.skillName,
        usageCount: skill.usageCount,
        successRate: Math.round(skill.successRate * 100) / 100,
        averageDuration: Math.round(skill.averageDuration),
        effectiveness: Math.round(effectiveness * 100) / 100,
        grade: effectiveness >= 0.9 ? "A" :
               effectiveness >= 0.75 ? "B" :
               effectiveness >= 0.6 ? "C" : "D",
      };
    });

    // Sort by effectiveness
    skillAnalytics.sort((a, b) => b.effectiveness - a.effectiveness);

    const summary = {
      totalSkillsUsed: skillAnalytics.length,
      averageEffectiveness: skillAnalytics.length > 0
        ? skillAnalytics.reduce((sum, s) => sum + s.effectiveness, 0) / skillAnalytics.length
        : 0,
      topPerforming: skillAnalytics.slice(0, 3),
      needsImprovement: skillAnalytics.filter(s => s.effectiveness < 0.6),
    };

    return {
      skills: skillAnalytics,
      summary: {
        ...summary,
        averageEffectiveness: Math.round(summary.averageEffectiveness * 100) / 100,
      },
    };
  }),
});