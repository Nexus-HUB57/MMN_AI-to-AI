/**
 * Observability Router - Dashboards and metrics endpoints (EPIC-06, AG-34)
 * Provides observability data for monitoring and alerting
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../trpc/trpc";
import * as db from "../../../database/schemas/db";

// System metrics structure
interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  uptime: number;
  timestamp: string;
}

// Application metrics structure
interface AppMetrics {
  requests: {
    total: number;
    success: number;
    errors: number;
  };
  database: {
    connections: number;
    queries: number;
    avgQueryTime: number;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  agents: {
    total: number;
    active: number;
    idle: number;
    learning: number;
  };
}

export const observabilityRouter = router({
  // ============ HEALTH CHECKS ============

  // Basic health check
  health: publicProcedure.query(() => ({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })),

  // Detailed health check with dependencies
  healthDetailed: publicProcedure.query(async () => {
    const checks = {
      database: await checkDatabase(),
      redis: await checkRedis(),
    };

    const allHealthy = Object.values(checks).every(c => c.status === "ok");

    return {
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks,
    };
  }),

  // ============ SYSTEM METRICS ============

  // Get system metrics
  getSystemMetrics: publicProcedure.query(() => {
    const memUsage = process.memoryUsage();
    const cpuUsage = getCpuUsage();

    return {
      cpu: {
        usage: cpuUsage,
        cores: require("os").cpus().length,
      },
      memory: {
        total: memUsage.heapTotal,
        used: memUsage.heapUsed,
        free: memUsage.heapTotal - memUsage.heapUsed,
        usagePercent: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    } as SystemMetrics;
  }),

  // Get application metrics
  getAppMetrics: adminProcedure.query(async () => {
    // Get agent counts from database
    const agents = await db.listAgents(1000, 0);

    const agentStats = {
      total: agents.length,
      active: agents.filter(a => a.status === "active").length,
      idle: agents.filter(a => a.status === "inactive" || a.status === "paused").length,
      learning: agents.filter(a => a.status === "learning").length,
    };

    return {
      requests: {
        total: 0, // Would come from request counter middleware
        success: 0,
        errors: 0,
      },
      database: {
        connections: 0, // Would come from pool stats
        queries: 0,
        avgQueryTime: 0,
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0,
      },
      agents: agentStats,
    } as AppMetrics;
  }),

  // ============ AGENT METRICS ============

  // Get agent performance metrics
  getAgentMetrics: adminProcedure
    .input(z.object({ agentId: z.number().optional() }))
    .query(async ({ input }) => {
      if (input.agentId) {
        const agent = await db.getAgentById(input.agentId);
        if (!agent) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
        }
        return {
          agentId: input.agentId,
          status: agent.status,
          performanceScore: agent.performanceScore,
          lastUpdated: agent.updatedAt,
        };
      }

      // Return aggregated metrics for all agents
      const agents = await db.listAgents(1000, 0);

      const metrics = {
        total: agents.length,
        byStatus: {
          active: agents.filter(a => a.status === "active").length,
          learning: agents.filter(a => a.status === "learning").length,
          paused: agents.filter(a => a.status === "paused").length,
          inactive: agents.filter(a => a.status === "inactive").length,
        },
        avgPerformanceScore: Math.round(
          agents.reduce((sum, a) => sum + (a.performanceScore || 0), 0) / (agents.length || 1)
        ),
        topPerformers: agents
          .filter(a => a.performanceScore >= 80)
          .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
          .slice(0, 10)
          .map(a => ({ id: a.id, name: a.name, score: a.performanceScore })),
      };

      return metrics;
    }),

  // Get agent activity timeline
  getAgentActivity: publicProcedure
    .input(z.object({
      agentId: z.number(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const activities = await db.getAgentActions(input.agentId, input.limit);
      return activities;
    }),

  // ============ NETWORK METRICS ============

  // Get network statistics
  getNetworkMetrics: adminProcedure
    .input(z.object({ affiliateId: z.number() }))
    .query(async ({ input }) => {
      const directReferrals = await db.getDirectReferrals(input.affiliateId);
      const networkTree = await db.getNetworkTree(input.affiliateId, 5);

      return {
        directReferrals: directReferrals.length,
        totalNetwork: networkTree.length,
        networkDepth: calculateNetworkDepth(networkTree),
        topPerformers: await getTopNetworkPerformers(input.affiliateId),
      };
    }),

  // Get affiliate performance metrics
  getAffiliateMetrics: adminProcedure
    .input(z.object({ affiliateId: z.number() }))
    .query(async ({ input }) => {
      const [total, pending] = await Promise.all([
        db.getTotalCommissions(input.affiliateId),
        db.getPendingCommissions(input.affiliateId),
      ]);

      const orders = await db.getOrdersByAffiliate(input.affiliateId, 100);
      const recentOrders = orders.slice(0, 30);

      return {
        affiliateId: input.affiliateId,
        totalCommissions: total,
        pendingCommissions: pending,
        totalOrders: orders.length,
        recentOrders: recentOrders.length,
        avgOrderValue: recentOrders.length > 0
          ? Math.round(recentOrders.reduce((sum, o) => sum + o.amount, 0) / recentOrders.length)
          : 0,
        conversionRate: 0, // Would require additional tracking
      };
    }),

  // ============ QUEUE METRICS ============

  // Get queue statistics (EPIC-04)
  getQueueMetrics: adminProcedure.query(async () => {
    // This would integrate with BullMQ stats
    return {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      averageWaitTime: 0,
      averageProcessingTime: 0,
    };
  }),

  // Get failed jobs
  getFailedJobs: adminProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async () => {
      // Would query BullMQ for failed jobs
      return [];
    }),

  // Retry failed job
  retryJob: adminProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ input }) => {
      // Would retry job in BullMQ
      return { success: true, jobId: input.jobId };
    }),

  // ============ ALERTS & NOTIFICATIONS ============

  // Get active alerts
  getAlerts: adminProcedure
    .input(z.object({
      severity: z.enum(["critical", "high", "medium", "low"]).optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      // Would query alerts from database
      return [];
    }),

  // Create alert
  createAlert: adminProcedure
    .input(z.object({
      severity: z.enum(["critical", "high", "medium", "low"]),
      title: z.string(),
      message: z.string(),
      source: z.string(),
      metadata: z.record(z.any()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Would create alert in database
      await db.createNotification({
        userId: ctx.user.id,
        type: "alert",
        title: input.title,
        content: input.message,
      });

      return { success: true };
    }),

  // Acknowledge alert
  acknowledgeAlert: adminProcedure
    .input(z.object({ alertId: z.number() }))
    .mutation(async ({ input }) => {
      // Would update alert status
      return { success: true };
    }),

  // ============ PERFORMANCE DASHBOARD ============

  // Get dashboard summary
  getDashboardSummary: adminProcedure.query(async () => {
    const agents = await db.listAgents(1000, 0);

    return {
      overview: {
        totalAgents: agents.length,
        activeAgents: agents.filter(a => a.status === "active").length,
        avgPerformance: Math.round(
          agents.reduce((sum, a) => sum + (a.performanceScore || 0), 0) / (agents.length || 1)
        ),
        uptime: process.uptime(),
      },
      trends: {
        // Would contain time-series data for charts
        agentActivity: [],
        commissions: [],
        orders: [],
      },
      recentAlerts: [],
      topAgents: agents
        .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
        .slice(0, 5)
        .map(a => ({ id: a.id, name: a.name, score: a.performanceScore })),
    };
  }),
});

// ============ HELPER FUNCTIONS ============

async function checkDatabase(): Promise<{ status: string; latency?: number; error?: string }> {
  try {
    const start = Date.now();
    const dbInstance = await db.getDb();
    if (dbInstance) {
      return { status: "ok", latency: Date.now() - start };
    }
    return { status: "unavailable" };
  } catch (error) {
    return { status: "error", error: (error as Error).message };
  }
}

async function checkRedis(): Promise<{ status: string; latency?: number; error?: string }> {
  // Would check Redis connection
  return { status: "ok" };
}

function getCpuUsage(): number {
  // Simplified CPU usage calculation
  const cpus = require("os").cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach((cpu: any) => {
    for (const type in cpu.times) {
      totalTick += (cpu.times as any)[type];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - (100 * idle / total);

  return Math.round(usage * 100) / 100;
}

function calculateNetworkDepth(nodes: any[]): number {
  if (nodes.length === 0) return 0;
  return Math.max(...nodes.map(n => n.level || 0));
}

async function getTopNetworkPerformers(affiliateId: number): Promise<any[]> {
  const referrals = await db.getDirectReferrals(affiliateId);
  // Would calculate performance based on their commissions and orders
  return referrals.slice(0, 5).map(r => ({
    userId: r.userId,
    level: r.level,
  }));
}