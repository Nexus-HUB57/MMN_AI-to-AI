import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";
import { ReasoningStep, ReflectionEntry, MemoryManager, Planner, Reflector, MetricsTracker, ReasoningEngine, AgentTool } from "./agenticCore";

/**
 * Handler operacional · Lifecycle Orchestrator v2 (Agentic)
 * -----------------------------------------------------------------------------
 * Orchestrates customer lifecycle: onboarding → activation → expansion.
 * Agora suporta Reasoning Trace, Reflexão e Memória.
 */

const LifecycleOrchestratorInputSchema = z.object({
  userId: z.string().min(1).max(80),
  userEmail: z.string().email(),
  plan: z.enum(["starter", "professional", "enterprise"]).default("starter"),
  currentStage: z.enum([
    "onboarding", "activation", "engagement", "expansion", "retention", "churned",
  ]).default("onboarding"),
  daysSinceSignup: z.number().int().nonnegative().default(0),
  engagementMetrics: z
    .object({
      loginsLast7Days: z.number().int().nonnegative().default(0),
      featuresUsed: z.number().int().nonnegative().default(0),
      lastActivity: z.string().optional(),
    })
    .optional(),
});

export type LifecycleOrchestratorInput = z.infer<typeof LifecycleOrchestratorInputSchema>;

export interface LifecycleStage {
  name: string;
  status: "pending" | "in_progress" | "completed";
  actionItems: string[];
  timeline: string;
  kpis: string[];
}

export interface LifecycleOrchestratorOutput {
  userId: string;
  currentStage: string;
  recommendedActions: LifecycleStage[];
  nextStage: string;
  estimatedDaysToNextStage: number;
  healthScore: number;
  churnRisk: "low" | "medium" | "high";
  intervention: string | null;
  reasoningTrace?: ReasoningStep[];
  reflection?: ReflectionEntry;
}

function calculateHealthScore(input: LifecycleOrchestratorInput): number {
  let score = 50;

  if (input.engagementMetrics) {
    const { loginsLast7Days, featuresUsed } = input.engagementMetrics;
    score += Math.min(25, loginsLast7Days * 5);
    score += Math.min(15, featuresUsed * 3);
  }

  if (input.daysSinceSignup > 7) score += 10;

  return Math.min(100, score);
}

function determineChurnRisk(
  currentStage: string,
  healthScore: number,
  daysSinceSignup: number,
): "low" | "medium" | "high" {
  if (currentStage === "churned") return "high";
  if (healthScore < 30) return "high";
  if (healthScore < 60 && daysSinceSignup > 14) return "medium";
  return "low";
}

function buildLifecyclePlan(input: LifecycleOrchestratorInput): LifecycleStage[] {
  const stages: LifecycleStage[] = [];

  if (input.currentStage === "onboarding") {
    stages.push({
      name: "Onboarding",
      status: input.daysSinceSignup < 3 ? "in_progress" : "completed",
      actionItems: [
        "Send welcome email sequence",
        "Schedule onboarding call",
        "Provide quick-start guide",
      ],
      timeline: "Dias 1-3",
      kpis: ["Onboarding completo", "Primeiro login"],
    });
  }

  if (["onboarding", "activation"].includes(input.currentStage)) {
    stages.push({
      name: "Activation",
      status: "pending",
      actionItems: [
        "Enable key feature (1ª acción)",
        "Complete profile setup",
        "Send activation milestone email",
      ],
      timeline: "Dias 7-14",
      kpis: ["Feature activada", "Login 3+ dias"],
    });
  }

  stages.push({
    name: "Engagement",
    status: "pending",
    actionItems: [
      "Send weekly tips email",
      "Recommend related features",
      "Run engagement survey",
    ],
    timeline: "Dias 14-30",
    kpis: ["Engagement score > 60", "Features 3+"],
  });

  if (input.plan !== "starter") {
    stages.push({
      name: "Expansion",
      status: "pending",
      actionItems: [
        "Present upgrade option",
        "Offer pilot for advanced features",
        "Schedule expansion call",
      ],
      timeline: "Dias 30-60",
      kpis: ["Upsell initiated", "Plan upgrade"],
    });
  }

  return stages;
}

function determineIntervention(
  churnRisk: "low" | "medium" | "high",
  currentStage: string,
): string | null {
  if (churnRisk === "high") return "IMEDIATO: Contato pessoal + oferta de reativação";
  if (churnRisk === "medium" && currentStage !== "retention")
    return "PRIORIDADE: Enviar sequência de reengajamento";
  return null;
}

export const lifecycleOrchestratorHandler: SkillHandler<
  LifecycleOrchestratorInput,
  LifecycleOrchestratorOutput
> = {
  slug: "lifecycle-orchestrator",
  title: "Orquestrador de Ciclo de Vida",
  category: "retention",
  version: "2.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): LifecycleOrchestratorInput =>
    LifecycleOrchestratorInputSchema.parse(raw),
  execute: async (
    input: LifecycleOrchestratorInput,
    context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<LifecycleOrchestratorOutput>> => {
    const startedAt = Date.now();

    // 1. Reasoning Trace
    const reasoningTrace: ReasoningStep[] = [
      {
        thought: `Iniciando orquestração do ciclo de vida para o usuário ${input.userId} no estágio ${input.currentStage}.`,
      },
    ];

    // 2. Memory Retrieval (Check for previous similar orchestrations)
    const previousOrchestrations = await context.memory.retrieve(`lifecycle orchestration for user ${input.userId} in stage ${input.currentStage}`, 1);
    reasoningTrace.push({
      thought: `Analisando memória: ${previousOrchestrations.length} orquestrações anteriores encontradas.`,
    });

    const healthScore = calculateHealthScore(input);
    reasoningTrace.push({
      thought: `Calculado Health Score: ${healthScore}.`,
      result: `Health Score: ${healthScore}.`
    });

    const churnRisk = determineChurnRisk(
      input.currentStage,
      healthScore,
      input.daysSinceSignup,
    );
    reasoningTrace.push({
      thought: `Determinado risco de churn: ${churnRisk}.`,
      result: `Risco de Churn: ${churnRisk}.`
    });

    const plan = buildLifecyclePlan(input);
    reasoningTrace.push({
      thought: `Plano de ciclo de vida construído com ${plan.length} estágios.`,
      result: `Plano de ciclo de vida gerado.`
    });

    const stageOrder = ["onboarding", "activation", "engagement", "expansion", "retention"];
    const currentIdx = stageOrder.indexOf(input.currentStage);
    const nextStage =
      currentIdx < stageOrder.length - 1 ? stageOrder[currentIdx + 1] : "retention";

    const output: LifecycleOrchestratorOutput = {
      userId: input.userId,
      currentStage: input.currentStage,
      recommendedActions: plan,
      nextStage,
      estimatedDaysToNextStage: 7,
      healthScore,
      churnRisk,
      intervention: determineIntervention(churnRisk, input.currentStage),
      reasoningTrace,
    };

    // 3. Reflection
    if (context.reflector) {
      output.reflection = await context.reflector.reflect(context, reasoningTrace);
      reasoningTrace.push({
        thought: "Reflexão aplicada para otimizar a orquestração do ciclo de vida.",
        result: "Orquestração do ciclo de vida refinada com base em insights de performance."
      });
    }

    // 4. Store in Memory
    await context.memory.store({
      timestamp: new Date(),
      content: `Orquestração de ciclo de vida para usuário ${input.userId} concluída. Estágio: ${output.currentStage}, Próximo: ${output.nextStage}.`,
      type: 'episodic',
      relatedSkills: ["lifecycle-orchestrator"]
    });

    // 5. Record Metrics
    await context.metrics.record({
      timestamp: new Date(),
      metricName: 'user_health_score',
      value: output.healthScore,
      unit: 'points',
      skillSlug: "lifecycle-orchestrator"
    });
    await context.metrics.record({
      timestamp: new Date(),
      metricName: 'user_churn_risk',
      value: churnRisk === "high" ? 3 : (churnRisk === "medium" ? 2 : 1),
      unit: 'level',
      skillSlug: "lifecycle-orchestrator"
    });

    return {
      executionId: randomUUID(),
      skill: "lifecycle-orchestrator",
      success: true,
      decision: churnRisk === "high" ? "needs_review" : "auto",
      latencyMs: Date.now() - startedAt,
      output,
      message: `Ciclo de vida orquestrado: ${input.currentStage} → ${nextStage} (saúde: ${healthScore}%)`,
    };
  },
};
