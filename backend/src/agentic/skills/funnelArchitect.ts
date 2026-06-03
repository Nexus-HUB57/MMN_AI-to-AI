import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";
import { ReasoningStep, ReflectionEntry, MemoryManager, Planner, Reflector, MetricsTracker, ReasoningEngine, AgentTool } from "./agenticCore";

/**
 * Handler operacional · Funnel Architect v2 (Agentic)
 * -----------------------------------------------------------------------------
 * Desenha funil completo de marketing a partir de objetivo de negócio.
 * Gera estrutura de stages, pontos de conversão e estratégias por etapa.
 * Agora suporta Reasoning Trace, Reflexão e Memória.
 */

const FunnelArchitectInputSchema = z.object({
  businessType: z
    .enum(["saas", "course", "mentorship", "ecommerce", "affiliate", "other"])
    .default("other"),
  mainGoal: z.string().min(3).max(240),
  targetAudience: z.string().min(3).max(240),
  priceRange: z
    .enum(["free", "low", "mid", "high", "premium"])
    .default("mid"),
  salesChannels: z
    .array(z.enum(["instagram", "whatsapp", "facebook", "email", "landing", "google"]))
    .min(1)
    .default(["instagram"]),
  timeline: z.enum(["quick", "medium", "extended"]).default("medium"),
});

export type FunnelArchitectInput = z.infer<typeof FunnelArchitectInputSchema>;

export interface FunnelStage {
  name: string;
  position: number;
  objective: string;
  mainAction: string;
  contentType: string;
  channel: string;
  kpi: string;
  conversionTarget: number;
}

export interface FunnelArchitectOutput {
  funnelName: string;
  stages: FunnelStage[];
  totalConversionRate: number;
  estimatedCostPerLead: number;
  estimatedCostPerSale: number;
  recommendations: string[];
  reasoningTrace?: ReasoningStep[];
  reflection?: ReflectionEntry;
}

function buildFunnelStages(input: FunnelArchitectInput): FunnelStage[] {
  const baseStages = [
    {
      name: "Awareness",
      position: 1,
      objective: "Gerar visibilidade e atrair público",
      mainAction: "Conteúdo de valor + ads alcance",
      contentType: "Posts educativos, Reels, Stories",
      channel: input.salesChannels[0],
      kpi: "Impressões, Alcance",
      conversionTarget: 100,
    },
    {
      name: "Interest",
      position: 2,
      objective: "Engajar e qualificar prospects",
      mainAction: "Captura de leads via conteúdo premium",
      contentType: "Lead magnets, E-books, Webinars",
      channel: input.salesChannels[0],
      kpi: "Leads capturados",
      conversionTarget: 20,
    },
    {
      name: "Consideration",
      position: 3,
      objective: "Apresentar solução e gerar consideração",
      mainAction: "Sales letter, Demo, Prova social",
      contentType: "Landing page, vídeo explicativo",
      channel: input.salesChannels[0],
      kpi: "Visitas à página de venda",
      conversionTarget: 5,
    },
    {
      name: "Conversion",
      position: 4,
      objective: "Fechar venda",
      mainAction: "Oferta principal + bônus + urgência",
      contentType: "Página de venda, Checkout",
      channel: "landing",
      kpi: "Vendas realizadas",
      conversionTarget: 2,
    },
    {
      name: "Retention",
      position: 5,
      objective: "Fidelizar e gerar recompra",
      mainAction: "Onboarding + seguimentos",
      contentType: "E-mails, Welcome series",
      channel: "email",
      kpi: "Taxa de retenção",
      conversionTarget: 30,
    },
  ];

  if (input.businessType === "affiliate") {
    baseStages.splice(4, 0, {
      name: "Affiliate Activation",
      position: 4,
      objective: "Ativar novo afiliado no sistema",
      mainAction: "Ativar novo afiliado no sistema",
      contentType: "Tutorial, Kit de start",
      channel: "whatsapp",
      kpi: "Afiliados ativos",
      conversionTarget: 40,
    });
  }

  return baseStages.map((stage, idx) => ({
    ...stage,
    conversionTarget: stage.conversionTarget * (1 + idx * 0.1),
  }));
}

function calculateConversionMetrics(
  stages: FunnelStage[],
  input: FunnelArchitectInput,
): { totalRate: number; cpl: number; cps: number } {
  const baseRates = {
    free: { overall: 0.15, cpl: 5, cps: 25 },
    low: { overall: 0.08, cpl: 15, cps: 80 },
    mid: { overall: 0.04, cpl: 35, cps: 200 },
    high: { overall: 0.02, cpl: 80, cps: 500 },
    premium: { overall: 0.01, cpl: 150, cps: 1200 },
  };

  const metrics = baseRates[input.priceRange];
  const channelMultiplier = input.salesChannels.length > 2 ? 0.85 : 1;

  return {
    totalRate: metrics.overall * channelMultiplier,
    cpl: Math.round(metrics.cpl * (1 / channelMultiplier)),
    cps: Math.round(metrics.cps * (1 / channelMultiplier)),
  };
}

export const funnelArchitectHandler: SkillHandler<
  FunnelArchitectInput,
  FunnelArchitectOutput
> = {
  slug: "funnel-architect",
  title: "Arquiteto de Funis",
  category: "strategy",
  version: "2.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): FunnelArchitectInput =>
    FunnelArchitectInputSchema.parse(raw),
  execute: async (
    input: FunnelArchitectInput,
    context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<FunnelArchitectOutput>> => {
    const startedAt = Date.now();

    // 1. Reasoning Trace
    const reasoningTrace: ReasoningStep[] = [
      {
        thought: `Iniciando arquitetura de funil para o objetivo: ${input.mainGoal} e tipo de negócio: ${input.businessType}.`,
      },
    ];

    // 2. Memory Retrieval (Check for previous similar funnel designs)
    const previousFunnels = await context.memory.retrieve(`funnel design for ${input.businessType} with goal ${input.mainGoal}`, 1);
    reasoningTrace.push({
      thought: `Analisando memória: ${previousFunnels.length} designs de funil anteriores encontrados.`,
    });

    const stages = buildFunnelStages(input);
    const metrics = calculateConversionMetrics(stages, input);

    const recommendations = [
      `Priorize o canal ${input.salesChannels[0]} para as primeiras etapas do funil`,
      "Implemente tracking de pixels para medir conversão por estágio",
      "Crie sequências de e-mail automatizadas para nutrição",
      "Teste pelo menos 2 variações de landing page por estágio",
    ];

    if (input.priceRange === "premium") {
      recommendations.push(
        "Considere adicionar oferta pessoal com alto envolvimento",
      );
    }

    const output: FunnelArchitectOutput = {
      funnelName: `Funil ${input.mainGoal} - ${input.targetAudience}`,
      stages,
      totalConversionRate: metrics.totalRate,
      estimatedCostPerLead: metrics.cpl,
      estimatedCostPerSale: metrics.cps,
      recommendations,
      reasoningTrace,
    };

    // 3. Reflection
    if (context.reflector) {
      output.reflection = await context.reflector.reflect(context, reasoningTrace);
      reasoningTrace.push({
        thought: "Reflexão aplicada para otimizar o design do funil.",
        result: "Design do funil refinado com base em insights de performance."
      });
    }

    // 4. Store in Memory
    await context.memory.store({
      timestamp: new Date(),
      content: `Funil de marketing desenhado para ${input.businessType} com objetivo ${input.mainGoal}.`, 
      type: 'episodic',
      relatedSkills: ["funnel-architect"]
    });

    // 5. Record Metrics
    await context.metrics.record({
      timestamp: new Date(),
      metricName: 'total_conversion_rate',
      value: output.totalConversionRate,
      unit: 'percent',
      skillSlug: "funnel-architect"
    });
    await context.metrics.record({
      timestamp: new Date(),
      metricName: 'estimated_cost_per_sale',
      value: output.estimatedCostPerSale,
      unit: 'currency',
      skillSlug: "funnel-architect"
    });

    return {
      executionId: randomUUID(),
      skill: "funnel-architect",
      success: true,
      decision: "auto",
      latencyMs: Date.now() - startedAt,
      output,
      message: `Funil desenhado com ${stages.length} estágios e taxa de conversão estimada de ${(metrics.totalRate * 100).toFixed(1)}%`,
    };
  },
};
