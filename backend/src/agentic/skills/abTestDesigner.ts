/**
 * Handler operacional · A/B Test Designer
 * -----------------------------------------------------------------------------
 * Designs A/B test variations with metrics and sample size calculation.
 */

import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";

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
          description: "Inclui的社会证明",
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
  version: "1.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): ABTestDesignerInput =>
    ABTestDesignerInputSchema.parse(raw),
  execute: async (
    input: ABTestDesignerInput,
    _context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<ABTestDesignerOutput>> => {
    const startedAt = Date.now();
    const variations = generateVariations(input);
    const sampleSize = calculateSampleSize(
      input.baselineConversion,
      input.minimumDetectableEffect,
    );
    const trafficPerDay = input.dailyTraffic;
    const daysNeeded = Math.ceil((sampleSize * 2) / trafficPerDay);

    return {
      executionId: randomUUID(),
      skill: "ab-test-designer",
      success: true,
      decision: "auto",
      latencyMs: Date.now() - startedAt,
      output: {
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
      },
      message: `Teste desenhado: ${variations.length} variações, ${sampleSize} amostras/variante, ${daysNeeded} dias`,
    };
  },
};
