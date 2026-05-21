import { publicProcedure, router } from "./trpc/trpc";
import { agenticRouter } from "./routers/agenticRouter";
import { agentsRouter } from "./routers/agentsRouter";
import { authRouter } from "./routers/authRouter";
import { aiContentHubRouter } from "./routers/aiContentHubRouter";
import { contentGenerationRouter } from "./routers/contentGenerationRouter";
import { dashboardRouter } from "./routers/dashboardRouter";
import { dropshippingRouter } from "./routers/dropshippingRouter";
import { logRouter } from "./routers/logRouter";
import { marketplacesRouter } from "./routers/marketplacesRouter";
import { mmnRouter } from "./routers/mmnRouter";
import { observabilityRouter } from "./routers/observabilityRouter";
import { orchestrationRouter } from "./routers/orchestrationRouter";
import { paymentsRouter } from "./routers/paymentsRouter";
import { bankingRouter } from "./routers/bankingRouter";
import { socialRouter } from "./routers/socialRouter";
import { xpRouter } from "./routers/xpRouter";
import { upgradesRouter } from "./routers/upgradesRouter";
import { newsletterRouter } from "./routers/newsletterRouter";
import { cmsRouter } from "./routers/cmsRouter";
import { adminRouter } from "./routers/adminRouter";
import { billingRouter } from "./routers/billingRouter";
import { usersRouter } from "./routers/usersRouter";
import { materialsRouter } from "./routers/materialsRouter";
import { networkRouter } from "./routers/networkRouter";
import { delinquentsRouter } from "./routers/delinquentsRouter";
import { commissionsRouter } from "./routers/commissionsRouter";
import { approvalsRouter } from "./routers/approvalsRouter";
import { cronRouter } from "./routers/cronRouter";
import { getAffiliateByUserId, getAgentByUserId, getDirectReferrals, getNetworkTree, getTotalCommissions, getPendingCommissions, getOrdersByAffiliate, getTrendingProducts, getActiveUpgrades, getAffiliateByCode } from "../../database/schemas/db";
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
        "Agentic Marketing Layer",
        "Marketplace Integration",
        "Commission Tracking",
        "Social Media Scheduling",
        "Analytics Dashboard",
        "Orchestrator System",
      ],
      notes: [
        "Core transacional preservado e camada agentic em evolução incremental.",
        "Graph agentic com queue runtime, LLM-as-Judge, audit trail e vector memory já expostos via tRPC.",
        "Fila de orquestração e dashboards administrativos já disponíveis para expansão gradual.",
        "Autonomia plena depende de policy, observabilidade e validação operacional em produção.",
      ],
    })),
  }),

  auth: authRouter,

  bootstrap: router({
    status: publicProcedure.query(() => ({
      frontend: "vite-ready",
      backend: "express-trpc-ready",
      genkit: "configured",
      routers: {
        agentic: true,
        agents: true,
        aiContentHub: true,
        content: true,
        dashboard: true,
        dropshipping: true,
        logs: true,
        marketplaces: true,
        mmn: true,
        orchestration: true,
        payments: true,
        xp: true,
        system: true,
        upgrades: true,
        newsletter: true,
        cms: true,
        billing: true,
        admin: true,
        users: true,
        materials: true,
        network: true,
        delinquents: true,
        commissions: true,
        approvals: true,
        cron: true,
      },
    })),
  }),

  // ============ AGENTIC ROUTER ============
  agentic: agenticRouter,

  // ============ AGENTS ROUTER ============
  agents: agentsRouter,

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

  // ============ CONTENT GENERATION ROUTER ============
  content: contentGenerationRouter,

  // ============ DASHBOARD ROUTER ============
  dashboard: dashboardRouter,

  // ============ DROPSHIPPING ROUTER ============
  dropshipping: dropshippingRouter,

  // ============ LOG ROUTER ============
  logs: logRouter,

  // ============ MARKETPLACES ROUTER ============
  marketplaces: marketplacesRouter,

  // ============ ORCHESTRATION ROUTER ============
  orchestration: orchestrationRouter,

  // ============ OBSERVABILITY ROUTER ============
  observability: observabilityRouter,

  // ============ PAYMENTS ROUTER ============
  payments: paymentsRouter,

  // ============ BANKING ROUTER ============
  banking: bankingRouter,

  // ============ SOCIAL ROUTER ============
  social: socialRouter,

  // ============ XP ROUTER ============
  xp: xpRouter,

  // ============ UPGRADES ROUTER ============
  upgrades: upgradesRouter,

  // ============ NEWSLETTER ROUTER ============
  newsletter: newsletterRouter,

  // ============ CMS ROUTER ============
  cms: cmsRouter,

  // ============ BILLING ROUTER ============
  billing: billingRouter,

  // ============ ADMIN ROUTER ============
  admin: adminRouter,

  // ============ USERS ROUTER ============
  users: usersRouter,

  // ============ MATERIALS ROUTER ============
  materials: materialsRouter,

  // ============ NETWORK ROUTER ============
  network: networkRouter,

  // ============ DELINQUENTS ROUTER ============
  delinquents: delinquentsRouter,

  // ============ COMMISSIONS ROUTER ============
  commissions: commissionsRouter,

  // ============ APPROVALS ROUTER ============
  approvals: approvalsRouter,

  // ============ CRON ROUTER ============
  cron: cronRouter,
});

export type AppRouter = typeof appRouter;
