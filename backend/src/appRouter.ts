import { publicProcedure, router } from "./config/trpc";
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
import { packsRouter } from "./routers/packsRouter";
import { skillsRouter } from "./routers/skillsRouter";
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
        "Pack Marketplace Sync",
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
        packs: true,
        skills: true,
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

  agentic: agenticRouter,
  agents: agentsRouter,
  mmn: mmnRouter,
  aiContentHub: aiContentHubRouter,
  content: contentGenerationRouter,
  dashboard: dashboardRouter,
  dropshipping: dropshippingRouter,
  logs: logRouter,
  marketplaces: marketplacesRouter,
  orchestration: orchestrationRouter,
  observability: observabilityRouter,
  payments: paymentsRouter,
  banking: bankingRouter,
  social: socialRouter,
  xp: xpRouter,
  upgrades: upgradesRouter,
  packs: packsRouter,
  skills: skillsRouter,
  newsletter: newsletterRouter,
  cms: cmsRouter,
  billing: billingRouter,
  admin: adminRouter,
  users: usersRouter,
  materials: materialsRouter,
  network: networkRouter,
  delinquents: delinquentsRouter,
  commissions: commissionsRouter,
  approvals: approvalsRouter,
  cron: cronRouter,
});

export type AppRouter = typeof appRouter;
