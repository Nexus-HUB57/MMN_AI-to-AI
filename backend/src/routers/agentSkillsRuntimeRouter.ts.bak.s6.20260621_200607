import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../trpc/trpc";
import {
  executeSkill,
  hasSkillHandler,
  listRegisteredSkillHandlers,
} from "../agentic/skills/dispatcher";
import { computeAutonomyScore } from "../agentic/autonomyScore";
import { addExecution, getTelemetry } from "../agentic/runtimeTelemetry";
import {
  enqueueScheduledPosts,
  getAutoPublisherStats,
  getDispatcherStatus,
  startAutoPublisherWorker,
} from "../workers/autoPublisherWorker";
import {
  decideApproval,
  enqueueApproval,
  getApprovalStats,
  listApprovals,
} from "../agentic/approvalsQueue";
import {
  getExecution,
  getExecutionStats,
  listExecutions,
  recordExecution,
} from "../agentic/executionHistory";
import {
  getAnalyticsCronStatus,
  getLatestAnalyticsReport,
  listAnalyticsReports,
  startAnalyticsCron,
  triggerAnalyticsReportNow,
} from "../agentic/analyticsCron";
import {
  deriveRuntimeScopes,
  hasRuntimeScope,
} from "../agentic/runtimeRbac";

startAnalyticsCron();

// Inicializa o worker uma vez quando o router é carregado.
startAutoPublisherWorker();
import {
  findAgentByUserId,
  insertAgentRuntimeAudit,
  listActiveUpgradesByAgentId,
} from "../domains/agent-runtime/repository";

/**
 * Router operacional para Skills com handler real + Autonomy Score.
 * -----------------------------------------------------------------------------
 * Endpoints:
 *  - `runtime.listHandlers` (público)  → lista skills com handler registrado
 *  - `runtime.execute` (protegido)     → executa skill operacional
 *  - `runtime.autonomyScore` (público) → calcula score 0-100 dado o input;
 *                                         endpoint público porque o cálculo
 *                                         é determinístico e o input é
 *                                         controlado pelo chamador.
 *  - `runtime.myAutonomyScore` (prot.) → score consolidado do usuário logado
 */
export const agentSkillsRuntimeRouter = router({
  listHandlers: publicProcedure.query(() => {
    const handlers = listRegisteredSkillHandlers();
    return {
      total: handlers.length,
      handlers,
    };
  }),

  execute: protectedProcedure
    .input(
      z.object({
        slug: z.string().min(2).max(80),
        input: z.unknown(),
        autonomyAllowed: z.boolean().optional().default(true),
        channelHint: z.string().max(40).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!hasSkillHandler(input.slug)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Skill "${input.slug}" ainda não possui handler operacional.`,
        });
      }

      let agent: Awaited<ReturnType<typeof findAgentByUserId>> | null = null;
      try {
        agent = await findAgentByUserId(ctx.user.id);
      } catch (error) {
        console.warn("[agentSkillsRuntime] DB indisponível, usando fallback de runtime:", error);
      }

      const context = {
        agentId: agent?.id ?? -1,
        userId: ctx.user.id,
        agentName: agent?.name ?? "Agente Nexus",
        performanceScore: agent?.performanceScore ?? 50,
        autonomyAllowed: input.autonomyAllowed ?? true,
        channelHint: input.channelHint,
      };

      const result = await executeSkill({
        slug: input.slug,
        rawInput: input.input,
        context,
      });

      // Telemetria in-memory (alimenta Autonomy Score real)
      addExecution({
        skill: input.slug,
        decision: result.decision,
        success: result.success,
        latencyMs: result.latencyMs,
        channel: input.channelHint,
        warningsCount: result.warnings?.length ?? 0,
      });

      // Histórico com replay
      recordExecution({
        executionId: result.executionId,
        skill: input.slug,
        success: result.success,
        decision: result.decision,
        latencyMs: result.latencyMs,
        warningsCount: result.warnings?.length ?? 0,
        input: input.input,
        output: result.output,
        channelHint: input.channelHint,
        triggeredBy: `user:${ctx.user.id}`,
      });

      // Quando a política determina needs_review, cria entrada na fila de
      // aprovações para o admin revisar antes de qualquer acionamento real.
      if (result.decision === "needs_review") {
        enqueueApproval({
          executionId: result.executionId,
          skill: input.slug,
          warnings: result.warnings ?? [],
          output: result.output,
          channelHint: input.channelHint,
        });
      }

      // Auto-enqueue: quando o auto-publisher gera schedule e a política permite,
      // a fila do worker recebe os jobs prontos para distribuição real.
      if (input.slug === "auto-publisher" && result.success && result.decision === "auto") {
        const output = (result.output as any) ?? {};
        const schedule = Array.isArray(output.schedule) ? output.schedule : [];
        if (schedule.length > 0) {
          enqueueScheduledPosts(
            schedule.map((post: any) => ({
              publishKey: post.publishKey,
              channel: post.channel,
              scheduledAtIso: post.scheduledAtIso,
              headline: post.headline,
              body: post.body,
              ctaLabel: post.ctaLabel,
              ctaLink: post.ctaLink,
              hashtags: post.hashtags ?? [],
              requiresApproval: Boolean(post.requiresApproval),
            })),
          );
        }
      }

      // Auditoria best-effort (não bloqueia resposta)
      try {
        await insertAgentRuntimeAudit({
          id: result.executionId,
          userId: ctx.user.id,
          sessionId: `skill-runtime-${input.slug}`,
          action: `skill.${input.slug}.execute`,
          metadata: {
            slug: input.slug,
            decision: result.decision,
            success: result.success,
            latencyMs: result.latencyMs,
            warningsCount: result.warnings?.length ?? 0,
          },
        });
      } catch (error) {
        console.warn("[agentSkillsRuntime] Falha ao registrar auditoria:", error);
      }

      return result;
    }),

  telemetry: publicProcedure.query(() => {
    return getTelemetry();
  }),

  workerStats: publicProcedure.query(() => {
    return getAutoPublisherStats();
  }),

  dispatcherStatus: publicProcedure.query(() => {
    return getDispatcherStatus();
  }),

  approvalsList: publicProcedure
    .input(
      z
        .object({
          status: z.enum(["pending", "approved", "rejected"]).optional(),
          limit: z.number().int().min(1).max(200).optional(),
        })
        .optional(),
    )
    .query(({ input }) => ({
      stats: getApprovalStats(),
      items: listApprovals({ status: input?.status, limit: input?.limit }),
    })),

  approvalsDecide: protectedProcedure
    .input(
      z.object({
        id: z.string().min(3).max(120),
        decision: z.enum(["approved", "rejected"]),
        note: z.string().max(500).optional(),
      }),
    )
    .mutation(({ ctx, input }) => {
      // RBAC granular: requer escopo específico por tipo de decisão.
      const requiredScope = input.decision === "approved" ? "runtime:approve" : "runtime:reject";
      if (!hasRuntimeScope(ctx, requiredScope)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Permissão insuficiente: requer escopo ${requiredScope}.`,
        });
      }
      const resolvedBy = `user:${ctx.user.id}`;
      const item = decideApproval(input.id, input.decision, resolvedBy, input.note);
      if (!item) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Aprovação ${input.id} não encontrada ou já resolvida.`,
        });
      }
      return item;
    }),

  myScopes: protectedProcedure.query(({ ctx }) => ({
    scopes: deriveRuntimeScopes(ctx),
    role: ctx.user.role ?? null,
  })),

  executionHistory: publicProcedure
    .input(
      z
        .object({
          skill: z.string().min(2).max(80).optional(),
          limit: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .query(({ input }) => ({
      stats: getExecutionStats(),
      items: listExecutions({ skill: input?.skill, limit: input?.limit }),
    })),

  executionReplay: protectedProcedure
    .input(z.object({ id: z.string().min(5).max(120) }))
    .mutation(async ({ ctx, input }) => {
      if (!hasRuntimeScope(ctx, "runtime:rerun")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Permissão insuficiente: requer escopo runtime:rerun.",
        });
      }
      const original = getExecution(input.id);
      if (!original) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Execução ${input.id} não encontrada no histórico.`,
        });
      }
      if (!hasSkillHandler(original.skill)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Handler ${original.skill} não mais disponível.`,
        });
      }
      const replayResult = await executeSkill({
        slug: original.skill,
        rawInput: original.input,
        context: {
          agentId: -1,
          userId: ctx.user.id,
          agentName: "Replay",
          performanceScore: 50,
          autonomyAllowed: true,
          channelHint: original.channelHint,
        },
      });
      addExecution({
        skill: original.skill,
        decision: replayResult.decision,
        success: replayResult.success,
        latencyMs: replayResult.latencyMs,
        channel: original.channelHint,
        warningsCount: replayResult.warnings?.length ?? 0,
      });
      recordExecution({
        executionId: replayResult.executionId,
        skill: original.skill,
        success: replayResult.success,
        decision: replayResult.decision,
        latencyMs: replayResult.latencyMs,
        warningsCount: replayResult.warnings?.length ?? 0,
        input: original.input,
        output: replayResult.output,
        channelHint: original.channelHint,
        triggeredBy: `replay:user:${ctx.user.id}`,
      });
      return { original: original.id, replay: replayResult };
    }),

  analyticsLatest: publicProcedure.query(() => ({
    status: getAnalyticsCronStatus(),
    latest: getLatestAnalyticsReport(),
  })),

  analyticsReports: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(20).optional() }).optional())
    .query(({ input }) => listAnalyticsReports(input?.limit ?? 10)),

  analyticsTrigger: protectedProcedure
    .input(z.object({}).optional())
    .mutation(async ({ ctx }) => {
      if (!hasRuntimeScope(ctx, "runtime:execute")) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Permissão insuficiente: requer escopo runtime:execute.",
        });
      }
      const report = await triggerAnalyticsReportNow();
      return report;
    }),

  autonomyScore: publicProcedure
    .input(
      z
        .object({
          autonomousTasksPct: z.number().min(0).max(100).optional(),
          judgeAccuracyPct: z.number().min(0).max(100).optional(),
          totalSkills: z.number().int().min(0).optional(),
          operationalSkills: z.number().int().min(0).optional(),
          avgLatencyMs: z.number().min(0).optional(),
          manualApprovalPct: z.number().min(0).max(100).optional(),
          activeChannels: z.number().int().min(0).max(50).optional(),
        })
        .optional(),
    )
    .query(({ input }) => {
      return computeAutonomyScore(input ?? {});
    }),

  myAutonomyScore: protectedProcedure.query(async ({ ctx }) => {
    let totalSkills: number | undefined;
    let operationalSkills: number | undefined;

    try {
      const agent = await findAgentByUserId(ctx.user.id);
      if (agent) {
        const upgrades = await listActiveUpgradesByAgentId(agent.id);
        totalSkills = upgrades.length;
        operationalSkills = listRegisteredSkillHandlers().length;
      }
    } catch (error) {
      console.warn("[agentSkillsRuntime] DB indisponível p/ score do agente:", error);
    }

    const telemetry = getTelemetry();
    const hasRealTelemetry = telemetry.sampleSize >= 5;
    const judgeAccuracyPct =
      telemetry.judgeAccuracyPct !== null && telemetry.judgeSampleSize >= 3
        ? telemetry.judgeAccuracyPct
        : 78;

    return computeAutonomyScore({
      totalSkills,
      operationalSkills: operationalSkills ?? listRegisteredSkillHandlers().length,
      autonomousTasksPct: hasRealTelemetry ? telemetry.autonomousTasksPct : 65,
      judgeAccuracyPct,
      avgLatencyMs: hasRealTelemetry ? telemetry.avgLatencyMs : 1850,
      manualApprovalPct: hasRealTelemetry ? telemetry.manualApprovalPct : 82,
      activeChannels: hasRealTelemetry ? Math.max(telemetry.activeChannels, 1) : 2,
    });
  }),
});
