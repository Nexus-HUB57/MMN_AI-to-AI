/**
 * Nexus Affil'IA'te · M4 · Governance Loop · tRPC Router
 *
 * Expõe os endpoints do loop fechado de governança:
 *   - propose: CEO/AI propõe uma ação governada (skill.publish, agent.promote, …)
 *   - list:    lista registros auditáveis (filtros: kind, decision, limit)
 *   - get:     consulta por actionId
 *   - stats:   métricas (total, approved/blocked/review, executed, approvalRate)
 *   - markExecuted / markRolledBack: side-effect aplicado/reversão
 *
 * @module agentic/governance-loop/router
 * @author Niko Nexus · CEO/AI
 */
import { z } from "zod";
import {
  adminProcedure,
  publicProcedure,
  router,
} from "../../config/trpc";
import { GovernanceLoop } from "./orchestrator";
import { governedActionKindSchema } from "./types";
import { computeLearning, getCalibratedHeuristic } from "./feedbackLearner";

export const governanceLoopRouter = router({
  /** Saúde + estatísticas */
  status: publicProcedure.query(async () => {
    const stats = await GovernanceLoop.stats();
    return {
      ok: true,
      service: "governance-loop",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      stats,
    };
  }),

  /** Lista pública (sem PII) */
  list: publicProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(200).default(50),
          kind: governedActionKindSchema.optional(),
          decision: z.enum(["approved", "review", "blocked"]).optional(),
        })
        .default({ limit: 50 }),
    )
    .query(async ({ input }) => {
      const records = await GovernanceLoop.list({
        limit: input.limit,
        kind: input.kind,
        decision: input.decision,
      });
      return { ok: true, count: records.length, records };
    }),

  /** Consulta por actionId */
  get: publicProcedure
    .input(z.object({ actionId: z.string().min(1) }))
    .query(async ({ input }) => {
      const record = await GovernanceLoop.getByActionId(input.actionId);
      return { ok: record !== null, record };
    }),

  /** Estatísticas detalhadas */
  stats: publicProcedure.query(async () => {
    const stats = await GovernanceLoop.stats();
    return { ok: true, stats };
  }),

  /** CEO/AI propõe uma nova ação governada (admin-only) */
  propose: adminProcedure
    .input(
      z.object({
        kind: governedActionKindSchema,
        initiator: z.string().min(1).default("ceo-ai:niko-nexus"),
        subject: z.string().min(1),
        payload: z.record(z.any()).default({}),
        rationale: z.string().min(10).max(1024),
        policyMode: z
          .enum(["simple-majority", "super-majority", "unanimous"])
          .default("super-majority"),
        minVoters: z.number().int().min(1).max(7).default(3),
      }),
    )
    .mutation(async ({ input }) => {
      const result = await GovernanceLoop.propose(input);
      return {
        ok: true,
        actionId: result.record.action.actionId,
        finalDecision: result.record.decision.finalDecision,
        consensus: result.record.decision.consensus,
        avgQuality: result.record.decision.avgQuality,
        avgRisk: result.record.decision.avgRisk,
        auditDigest: result.record.decision.auditDigest,
        trace: result.trace,
        record: result.record,
      };
    }),

  /** Marca uma ação como executada (side-effect aplicado) */
  markExecuted: adminProcedure
    .input(
      z.object({
        actionId: z.string().min(1),
        log: z.string().max(2048).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const updated = await GovernanceLoop.markExecuted(input.actionId, input.log);
      return { ok: updated !== null, record: updated };
    }),

  /** Marca uma ação como revertida */
  markRolledBack: adminProcedure
    .input(
      z.object({
        actionId: z.string().min(1),
        log: z.string().max(2048).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const updated = await GovernanceLoop.markRolledBack(input.actionId, input.log);
      return { ok: updated !== null, record: updated };
    }),

  /** M5 · Aprendizado consolidado do Niko Nexus (público para o dashboard) */
  learning: publicProcedure.query(async () => {
    const learning = await computeLearning();
    return { ok: true, learning };
  }),

  /** M5 · Heurística calibrada para um kind específico */
  heuristic: publicProcedure
    .input(z.object({ kind: governedActionKindSchema }))
    .query(async ({ input }) => {
      const heuristic = await getCalibratedHeuristic(input.kind);
      return { ok: true, kind: input.kind, heuristic };
    }),
});
