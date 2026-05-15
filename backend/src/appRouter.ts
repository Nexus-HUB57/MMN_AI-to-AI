import { publicProcedure, router } from "./trpc/trpc";

export const appRouter = router({
  system: router({
    health: publicProcedure.query(() => ({
      ok: true,
      service: "mmn-ai-to-ai-backend",
      mode: "bootstrap",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    })),

    info: publicProcedure.query(() => ({
      name: "MMN AI-to-AI",
      mode: "bootstrap",
      runtime: "Node.js + Express + tRPC",
      database: process.env.DATABASE_URL ? "configured" : "not-configured",
      redis: process.env.REDIS_URL ? "configured" : "not-configured",
      notes: [
        "Bootstrap mínimo ativo para estabilizar o monorepo.",
        "Routers legados permanecem no repositório, mas não estão montados no runtime bootstrap.",
        "Próxima etapa: reintrodução gradual dos módulos existentes após saneamento de tipos e contratos.",
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
      genkit: "placeholder-ready",
    })),
  }),
});

export type AppRouter = typeof appRouter;
