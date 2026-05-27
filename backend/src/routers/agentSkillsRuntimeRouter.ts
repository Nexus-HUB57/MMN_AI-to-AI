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

    return computeAutonomyScore({
      totalSkills,
      operationalSkills: operationalSkills ?? listRegisteredSkillHandlers().length,
      autonomousTasksPct: hasRealTelemetry ? telemetry.autonomousTasksPct : 65,
      judgeAccuracyPct: 78,
      avgLatencyMs: hasRealTelemetry ? telemetry.avgLatencyMs : 1850,
      manualApprovalPct: hasRealTelemetry ? telemetry.manualApprovalPct : 82,
      activeChannels: hasRealTelemetry ? Math.max(telemetry.activeChannels, 1) : 2,
    });
  }),
});
