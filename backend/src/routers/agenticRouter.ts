import { z } from "zod";
import { publicProcedure, router } from "../config/trpc";
import { marketingOrchestrator } from "../agentic/marketingOrchestrator";

export const agenticRouter = router({
  getMonitor: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(5) }).optional())
    .query(async ({ input }) => {
      return marketingOrchestrator.getMonitor(input?.limit || 5);
    }),

  listSessions: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }).optional())
    .query(async ({ input }) => {
      return marketingOrchestrator.listSessions(input?.limit || 10);
    }),

  getSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      return marketingOrchestrator.getSession(input.sessionId);
    }),

  searchMemories: publicProcedure
    .input(
      z.object({
        query: z.string().min(2),
        sessionId: z.string().optional(),
        limit: z.number().min(1).max(20).default(5).optional(),
      }),
    )
    .query(async ({ input }) => {
      return marketingOrchestrator.searchMemories(input.query, input.sessionId, input.limit || 5);
    }),

  createSession: publicProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        goal: z.string().min(3),
        audience: z.string().min(3),
        offer: z.string().min(3),
        channel: z.enum(["instagram", "whatsapp"]),
        brandVoice: z.string().optional(),
        constraints: z.array(z.string()).optional(),
        cta: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return marketingOrchestrator.createSession({
        ...input,
        userId: input.userId || ctx.user?.id,
      });
    }),

  runSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      return marketingOrchestrator.runSession(input.sessionId);
    }),

  launchCampaign: publicProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        goal: z.string().min(3),
        audience: z.string().min(3),
        offer: z.string().min(3),
        channel: z.enum(["instagram", "whatsapp"]),
        brandVoice: z.string().optional(),
        constraints: z.array(z.string()).optional(),
        cta: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      return marketingOrchestrator.launch({
        ...input,
        userId: input.userId || ctx.user?.id,
      });
    }),
});
