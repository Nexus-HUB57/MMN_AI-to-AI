import { randomUUID } from "node:crypto";
import { z } from "zod";

import { getTelemetry } from "../runtimeTelemetry";
import { listRegisteredSkillHandlers } from "./dispatcher";
import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";

/**
 * Handler operacional · Analytics Reporter
 * -----------------------------------------------------------------------------
 * Gera um relatório executivo (formato JSON estruturado + sumário textual)
 * consolidando a telemetria do runtime, cobertura de skills, e indicadores
 * de saúde da operação agentic.
 *
 * Não depende de input específico: lê o estado atual do runtime. Aceita
 * janela e formato como parâmetros opcionais.
 *
 * Esta skill alimenta dashboards executivos, relatórios diários por e-mail
 * e o backbone do `agent_telemetry` quando o Postgres estiver online.
 */

const AnalyticsInputSchema = z.object({
  windowHours: z.number().int().min(1).max(720).default(24),
  includeRecommendations: z.boolean().default(true),
  format: z.enum(["executive", "operational", "audit"]).default("executive"),
});

export type AnalyticsInput = z.infer<typeof AnalyticsInputSchema>;

export interface AnalyticsOutput {
  generatedAt: string;
  windowHours: number;
  format: AnalyticsInput["format"];
  summary: string;
  metrics: {
    handlersOperational: number;
    handlersCatalog: number;
    coveragePct: number;
    sampleSize: number;
    autonomousTasksPct: number;
    manualApprovalPct: number;
    avgLatencyMs: number;
    activeChannels: number;
    judgeAccuracyPct: number | null;
    judgeSampleSize: number;
  };
  healthSignals: Array<{ severity: "ok" | "warn" | "critical"; message: string }>;
  recommendations: string[];
  topSkills: string[];
}

function buildSummary(metrics: AnalyticsOutput["metrics"]): string {
  const judge =
    metrics.judgeAccuracyPct !== null
      ? `${metrics.judgeAccuracyPct}% acurácia do judge`
      : "judge ainda sem amostras suficientes";
  return [
    `Runtime com ${metrics.handlersOperational}/${metrics.handlersCatalog} skills operacionais (${metrics.coveragePct}% do catálogo).`,
    `${metrics.sampleSize} execuções na janela: ${metrics.autonomousTasksPct}% autônomas, ${metrics.manualApprovalPct}% aprovadas sem ressalvas.`,
    `Latência média ${metrics.avgLatencyMs}ms · ${metrics.activeChannels} canais ativos · ${judge}.`,
  ].join(" ");
}

function buildHealthSignals(metrics: AnalyticsOutput["metrics"]): AnalyticsOutput["healthSignals"] {
  const signals: AnalyticsOutput["healthSignals"] = [];
  if (metrics.coveragePct < 15) {
    signals.push({
      severity: "warn",
      message: `Cobertura operacional baixa (${metrics.coveragePct}%) — acelerar entrega de novos handlers.`,
    });
  } else if (metrics.coveragePct >= 50) {
    signals.push({ severity: "ok", message: "Cobertura operacional saudável." });
  }

  if (metrics.avgLatencyMs > 4000) {
    signals.push({
      severity: "critical",
      message: `Latência média acima do alvo (${metrics.avgLatencyMs}ms > 4000ms).`,
    });
  } else if (metrics.avgLatencyMs > 0 && metrics.avgLatencyMs <= 2000) {
    signals.push({ severity: "ok", message: "Latência dentro do alvo (≤2s)." });
  }

  if (metrics.sampleSize === 0) {
    signals.push({
      severity: "warn",
      message: "Janela sem execuções registradas — runtime ocioso.",
    });
  }
  if (metrics.judgeAccuracyPct !== null && metrics.judgeAccuracyPct < 60) {
    signals.push({
      severity: "critical",
      message: `Acurácia do judge abaixo do limiar (${metrics.judgeAccuracyPct}%).`,
    });
  }

  if (metrics.activeChannels === 0 && metrics.sampleSize > 0) {
    signals.push({
      severity: "warn",
      message: "Execuções sem canal declarado — visibilidade de distribuição prejudicada.",
    });
  }

  return signals.length > 0 ? signals : [{ severity: "ok", message: "Sem sinais relevantes na janela." }];
}

function buildRecommendations(metrics: AnalyticsOutput["metrics"]): string[] {
  const recommendations: string[] = [];
  if (metrics.coveragePct < 25) {
    recommendations.push("Priorizar implementação de novos handlers operacionais para acelerar cobertura.");
  }
  if (metrics.manualApprovalPct < 70 && metrics.sampleSize >= 5) {
    recommendations.push("Investigar causas de revisões manuais — possíveis ajustes em prompts ou policies.");
  }
  if (metrics.avgLatencyMs > 3000) {
    recommendations.push("Otimizar handlers críticos — alvo de latência média ≤2s.");
  }
  if (metrics.activeChannels < 3 && metrics.sampleSize >= 5) {
    recommendations.push("Diversificar canais de execução para reduzir concentração de risco.");
  }
  if (metrics.judgeSampleSize < 3) {
    recommendations.push("Aumentar uso do `judge-revisor` para alimentar a média móvel de qualidade.");
  }
  return recommendations;
}

export const analyticsReporterHandler: SkillHandler<AnalyticsInput, AnalyticsOutput> = {
  slug: "analytics-reporter",
  title: "Analytics Reporter",
  category: "analytics",
  version: "1.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): AnalyticsInput =>
    AnalyticsInputSchema.parse(raw ?? {}),
  execute: async (
    input: AnalyticsInput,
    context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<AnalyticsOutput>> => {
    const startedAt = Date.now();
    const telemetry = getTelemetry();
    const handlersCount = listRegisteredSkillHandlers().length;
    const catalogSize = 45;

    const metrics: AnalyticsOutput["metrics"] = {
      handlersOperational: handlersCount,
      handlersCatalog: catalogSize,
      coveragePct: Math.round((handlersCount / catalogSize) * 100),
      sampleSize: telemetry.sampleSize,
      autonomousTasksPct: telemetry.autonomousTasksPct,
      manualApprovalPct: telemetry.manualApprovalPct,
      avgLatencyMs: telemetry.avgLatencyMs,
      activeChannels: telemetry.activeChannels,
      judgeAccuracyPct: telemetry.judgeAccuracyPct,
      judgeSampleSize: telemetry.judgeSampleSize,
    };

    const summary = buildSummary(metrics);
    const healthSignals = buildHealthSignals(metrics);
    const recommendations = input.includeRecommendations ? buildRecommendations(metrics) : [];

    const output: AnalyticsOutput = {
      generatedAt: new Date().toISOString(),
      windowHours: input.windowHours,
      format: input.format,
      summary,
      metrics,
      healthSignals,
      recommendations,
      topSkills: telemetry.skillsExercised.slice(0, 5),
    };

    const criticalSignals = healthSignals.filter((signal) => signal.severity === "critical").length;
    const decision: SkillExecutionResult["decision"] =
      !context.autonomyAllowed || criticalSignals > 0 ? "needs_review" : "auto";

    return {
      executionId: randomUUID(),
      skill: "analytics-reporter",
      success: true,
      decision,
      latencyMs: Date.now() - startedAt,
      output,
      warnings: healthSignals
        .filter((signal) => signal.severity !== "ok")
        .map((signal) => `[${signal.severity}] ${signal.message}`),
      message:
        decision === "auto"
          ? `Relatório ${input.format} gerado: ${healthSignals.length} sinais avaliados.`
          : `Relatório gerado com ${criticalSignals} sinal(is) crítico(s) — revisar.`,
    };
  },
};
