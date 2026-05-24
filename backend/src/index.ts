import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./appRouter";
import type { Context } from "./trpc/context";
import { startCronScheduler, initializeDefaultJobs, getSchedulerStatus } from "./services/cronScheduler";
import { registerAuditSubscribers } from "./_core/events/auditSubscribers";

const PORT = Number(process.env.PORT || 3000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

function createContext(opts: { req: express.Request; res: express.Response }): Context {
  const userId = opts.req.header("x-user-id");
  const userRole = opts.req.header("x-user-role") || "user";

  return {
    req: opts.req,
    res: opts.res,
    user: userId
      ? {
          id: Number(userId),
          role: userRole,
        }
      : undefined,
  };
}

const app = express();

app.use(express.json({ limit: "2mb" }));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", FRONTEND_ORIGIN);
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, x-user-id, x-user-role"
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.get("/", (_req, res) => {
  res.json({
    name: "MMN AI-to-AI",
    service: "backend",
    mode: "full",
    trpc: "/trpc",
    health: "/health",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "mmn-ai-to-ai-backend",
    mode: "full",
    timestamp: new Date().toISOString(),
  });
});

app.get("/cron/status", (_req, res) => {
  res.json(getSchedulerStatus());
});

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Inicializar Cron Scheduler
async function initializeCron() {
  try {
    console.log('[CronScheduler] Inicializando...');
    await initializeDefaultJobs();
    await startCronScheduler();
    console.log('[CronScheduler] Inicializado com sucesso');
  } catch (error) {
    console.error('[CronScheduler] Erro na inicialização:', error);
  }
}

// Registrar subscribers de auditoria do eventBus antes de qualquer publish
registerAuditSubscribers();

// Inicializar cron ao iniciar o servidor
initializeCron();

app.listen(PORT, () => {
  console.log(`MMN AI-to-AI backend full ativo em http://localhost:${PORT}`);
});
