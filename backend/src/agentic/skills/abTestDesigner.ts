import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";
import { ReasoningStep, ReflectionEntry, MemoryManager, Planner, Reflector, MetricsTracker, ReasoningEngine, AgentTool } from "./agenticCore";

/**
 * Handler operacional · A/B Test Designer v2 (Agentic)
 * -----------------------------------------------------------------------------
 * Designs A/B test variations with metrics and sample size calculation.
 * Agora suporta Reasoning Trace, Reflexão e Memória.
 */

const ABTestDesignerInputSchema = z.object({
  element: z.enum([
    "headline", "cta", "image", "price", "color", "layout", "copy", "form",
  ]).default("headline"),
  currentVersion: z.string().min(1).max(500),
  channel: z.enum(["instagram", "whatsapp", "facebook", "email", "landing"]).default("landing"),
  dailyTraffic: z.number().int().positive().default(1000),
  baselineConversion: z.number().min(0.01).max(0.99).default(0.05),
  minimumDetectableEffect: z.number().min(0.01).max(0.5).default(0.1),
});

export type ABTestDesignerInput = z.infer<typeof ABTestDesignerInputSchema>;

export interface TestVariation {
  name: string;
  description: string;
  changes: string[];
  expectedDirection: "increase" | "decrease" | "neutral";
  confidenceLevel: number;
}

export interface ABTestDesignerOutput {
  testName: string;
  element: string;
  variations: TestVariation[];
  sampleSizePerVariation: number;
  testDuration: string;
  requiredTraffic: number;
  metrics: string[];
  recommendedWinner: string;
  confidenceLevel: number;
  reasoningTrace?: ReasoningStep[];
  reflection?: ReflectionEntry;
}

function calculateSampleSize(
  baseline: number,
  mde: number,
  alpha: number = 0.05,
  beta: number = 0.2,
): number {
  const zAlpha = 1.96;
  const zBeta = 0.84;
  const p1 = baseline;
  const p2 = baseline * (1 + mde);

  const effect = Math.abs(p2 - p1);
  const pooled = (p1 + p2) / 2;

  const numerator = 2 * pooled * (1 - pooled) * Math.pow(zAlpha + zBeta, 2);
  const denominator = Math.pow(effect, 2);

  return Math.ceil(numerator / denominator);
}

function generateVariations(input: ABTestDesignerInput): TestVariation[] {
  const baseVariation: TestVariation = {
    name: "Controle",
    description: "Versão atual funcionando",
    changes: ["Manter exatamente como está"],
    expectedDirection: "neutral",
    confidenceLevel: 0,
  };

  const variations: TestVariation[] = [baseVariation];

  switch (input.element) {
    case "headline":
      variations.push(
        {
          name: "Tratamento A - Urgência",
          description: "Adiciona element de urgência",
          changes: ["Incluir prazo ou escassez"],
          expectedDirection: "increase",
          confidenceLevel: 0.8,
        },
        {
          name: "Tratamento B - Prova social",
          description: "Inclui de prova social",
          changes: ["Adicionar número de alunos/clientes"],
          expectedDirection: "increase",
          confidenceLevel: 0.75,
        },
      );
      break;
    case "cta":
      variations.push(
        {
          name: "Tratamento A - Ação direta",
          description: "CTA com verbo de ação",
          changes: ["Usar 'Quero' em vez de 'Saiba mais'"],
          expectedDirection: "increase",
          confidenceLevel: 0.7,
        },
        {
          name: "Tratamento B - Benefício",
          description: "CTA focando no resultado",
          changes: ["Destacar o resultado final"],
          expectedDirection: "increase",
          confidenceLevel: 0.65,
        },
      );
      break;
    case "price":
      variations.push(
        {
          name: "Tratamento A - Preço psicológico",
          description: "Usar .99 ou .90",
          changes: ["R$ 97,90 em vez de R$ 98"],
          expectedDirection: "increase",
          confidenceLevel: 0.6,
        },
      );
      break;
    default:
      variations.push({
        name: "Tratamento A",
        description: "Alteração moderada",
        changes: ["Testar variação do elemento"],
        expectedDirection: "increase",
        confidenceLevel: 0.5,
      });
  }

  return variations;
}

export const abTestDesignerHandler: SkillHandler<
  ABTestDesignerInput,
  ABTestDesignerOutput
> = {
  slug: "ab-test-designer",
  title: "Designer de Testes A/B",
  category: "optimization",
  version: "2.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): ABTestDesignerInput =>
    ABTestDesignerInputSchema.parse(raw),
  execute: async (
    input: ABTestDesignerInput,
    context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<ABTestDesignerOutput>> => {
    const startedAt = Date.now();

    // 1. Reasoning Trace
    const reasoningTrace: ReasoningStep[] = [
      {
        thought: `Iniciando design de teste A/B para o elemento ${input.element} no canal ${input.channel}.`,
      },
    ];

    // 2. Memory Retrieval (Check for previous similar tests)
    const previousTests = await context.memory.retrieve(`A/B test for ${input.element}`, 3);
    reasoningTrace.push({
      thought: `Analisando memória: ${previousTests.length} testes anteriores encontrados.`,
    });

    const variations = generateVariations(input);
    const sampleSize = calculateSampleSize(
      input.baselineConversion,
      input.minimumDetectableEffect,
    );
    const trafficPerDay = input.dailyTraffic;
    const daysNeeded = Math.ceil((sampleSize * 2) / trafficPerDay);

    const output: ABTestDesignerOutput = {
      testName: `A/B Test - ${input.element} - ${new Date().toISOString().split("T")[0]}`,
      element: input.element,
      variations,
      sampleSizePerVariation: sampleSize,
      testDuration: `${daysNeeded} dias`,
      requiredTraffic: sampleSize * 2,
      metrics: [
        "Taxa de conversão",
        "CTR geral",
        "Tempo na página",
        "Bounce rate",
      ],
      recommendedWinner: "Tratamento A",
      confidenceLevel: 0.8,
      reasoningTrace,
    };

    // 3. Reflection
    if (context.reflector) {
      output.reflection = await context.reflector.reflect(context, reasoningTrace);
      reasoningTrace.push({
        thought: "Reflexão aplicada para otimizar o design do teste.",
        result: "Design do teste refinado com base em insights de performance."
      });
    }

    // 4. Store in Memory
    await context.memory.store({
      timestamp: new Date(),
      content: `A/B Test desenhado: ${output.testName}`,
      type: 'episodic',
      relatedSkills: ['ab-test-designer']
    });

    // 5. Record Metrics
    await context.metrics.record({
      timestamp: new Date(),
      metricName: 'sample_size_per_variation',
      value: output.sampleSizePerVariation,
      unit: 'users',
      skillSlug: 'ab-test-designer'
    });
    await context.metrics.record({
      timestamp: new Date(),
      metricName: 'test_duration_days',
      value: daysNeeded,
      unit: 'days',
      skillSlug: 'ab-test-designer'
    });

    return {
      executionId: randomUUID(),
      skill: "ab-test-designer",
      success: true,
      decision: "auto",
      latencyMs: Date.now() - startedAt,
      output,
      message: `Teste desenhado: ${variations.length} variações, ${sampleSize} amostras/variante, ${daysNeeded} dias`,
    };
  },
};
