import { publicProcedure, router } from "./trpc/trpc";
import { agentsRouter } from "./routers/agentsRouter";
import { aiContentHubRouter } from "./routers/aiContentHubRouter";
import { mmnRouter } from "./routers/mmnRouter";
import { getAffiliateByUserId, getAgentByUserId, getDirectReferrals, getNetworkTree, getTotalCommissions, getPendingCommissions, getOrdersByAffiliate, getTrendingProducts, getActiveUpgrades, getAffiliateByCode } from "../database/schemas/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const appRouter = router({
  system: router({
    health: publicProcedure.query(() => ({
      ok: true,
      service: "mmn-ai-to-ai-backend",
      mode: "full",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    })),

    info: publicProcedure.query(() => ({
      name: "MMN AI-to-AI",
      mode: "full",
      runtime: "Node.js + Express + tRPC v11",
      database: process.env.DATABASE_URL ? "configured" : "not-configured",
      redis: process.env.REDIS_URL ? "configured" : "not-configured",
      features: [
        "AI Content Hub",
        "MMN Engine",
        "Agent Management",
        "Marketplace Integration",
        "Commission Tracking",
        "Social Media Scheduling",
        "Analytics Dashboard",
      ],
    })),
  }),

  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user ?? null),

    logout: publicProcedure.mutation(({ ctx }) => {
      if (ctx.res) {
        ctx.res.clearCookie("app_session_id", {
          secure: false,
          sameSite: "lax",
          httpOnly: true,
          path: "/",
        });
      }
      return { success: true } as const;
    }),
  }),

  bootstrap: router({
    status: publicProcedure.query(() => ({
      frontend: "vite-ready",
      backend: "express-trpc-ready",
      genkit: "configured",
      routers: {
        agents: true,
        aiContentHub: true,
        mmn: true,
        system: true,
      },
    })),
  }),

  // ============ AGENTS ROUTER ============
  agents: router({
    initialize: publicProcedure.mutation(async () => {
      return { success: true, message: "Agent initialization endpoint ready" };
    }),

    get: publicProcedure
      .input(z.object({ userId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        const userId = input?.userId;
        if (!userId) return null;
        const agent = await getAgentByUserId(userId);
        return agent || null;
      }),

    configure: publicProcedure
      .input(z.object({
        userId: z.number(),
        name: z.string().optional(),
        status: z.enum(["learning", "active", "paused", "inactive"]).optional(),
        contentStrategy: z.record(z.any()).optional(),
        performanceScore: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return { success: true, message: "Agent configuration endpoint ready" };
      }),

    getState: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const agent = await getAgentByUserId(input.userId);
        if (!agent) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
        }
        return {
          id: agent.id,
          userId: agent.userId,
          name: agent.name,
          status: agent.status,
          performanceScore: agent.performanceScore,
          contentStrategy: agent.contentStrategy ? JSON.parse(agent.contentStrategy) : null,
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt,
        };
      }),

    updateState: publicProcedure
      .input(z.object({
        userId: z.number(),
        performanceScore: z.number().optional(),
        contentStrategy: z.record(z.any()).optional(),
      }))
      .mutation(async () => {
        return { success: true };
      }),
  }),

  // ============ MMN ROUTER ============
  mmn: router({
    getProfile: publicProcedure
      .input(z.object({ userId: z.number() }).optional())
      .query(async ({ input }) => {
        if (!input?.userId) return null;
        const affiliate = await getAffiliateByUserId(input.userId);
        return affiliate || null;
      }),

    getAffiliateByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const affiliate = await getAffiliateByCode(input.code);
        if (!affiliate) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Affiliate not found" });
        }
        return affiliate;
      }),

    getAgent: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const agent = await getAgentByUserId(input.userId);
        if (!agent) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found" });
        }
        return agent;
      }),

    getDirectReferrals: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return getDirectReferrals(input.userId);
      }),

    getNetworkTree: publicProcedure
      .input(z.object({ userId: z.number(), maxDepth: z.number().optional() }))
      .query(async ({ input }) => {
        return getNetworkTree(input.userId, input.maxDepth || 3);
      }),

    getStats: publicProcedure
      .input(z.object({ affiliateId: z.number() }))
      .query(async ({ input }) => {
        const [total, pending] = await Promise.all([
          getTotalCommissions(input.affiliateId),
          getPendingCommissions(input.affiliateId),
        ]);
        return { total, pending };
      }),

    getRecentOrders: publicProcedure
      .input(z.object({ affiliateId: z.number(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return getOrdersByAffiliate(input.affiliateId, input.limit || 10);
      }),

    getTrendingProducts: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return getTrendingProducts(input.limit || 10);
      }),

    getUpgrades: publicProcedure
      .input(z.object({ agentId: z.number() }))
      .query(async ({ input }) => {
        return getActiveUpgrades(input.agentId);
      }),
  }),

  // ============ AI CONTENT HUB ROUTER ============
  aiContentHub: aiContentHubRouter,
});

export type AppRouter = typeof appRouter;
