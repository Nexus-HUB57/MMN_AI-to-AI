/**
 * Handler operacional · Pricing Optimizer
 * -----------------------------------------------------------------------------
 * Analyzes price elasticity and suggests optimal pricing by segment.
 */

import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";

const PricingOptimizerInputSchema = z.object({
  productName: z.string().min(2).max(160),
  productType: z.enum(["digital", "physical", "service", "subscription"]).default("digital"),
  currentPrice: z.number().positive(),
  costPerUnit: z.number().min(0).optional(),
  competitorPrices: z.array(z.number().positive()).optional(),
  targetMargin: z.number().min(0.1).max(0.9).default(0.6),
  salesHistory: z
    .object({
      unitsSold: z.number().int().nonnegative(),
      period: z.enum(["week", "month", "quarter"]),
    })
    .optional(),
});

export type PricingOptimizerInput = z.infer<typeof PricingOptimizerInputSchema>;

export interface PricingSuggestion {
  price: number;
  strategy: string;
  rationale: string;
  expectedLift: number;
  elasticityScore: number;
}

export interface PricingOptimizerOutput {
  productName: string;
  currentPrice: number;
  suggestions: PricingSuggestion[];
  optimalPrice: number;
  confidence: number;
  riskFactors: string[];
  recommendations: string[];
}

function calculateElasticity(
  currentPrice: number,
  competitorPrices: number[],
): number {
  if (competitorPrices.length === 0) return 50;
  const avgCompetitor = competitorPrices.reduce((a, b) => a + b) / competitorPrices.length;
  const ratio = currentPrice / avgCompetitor;

  if (ratio < 0.7) return 30;
  if (ratio < 0.9) return 50;
  if (ratio < 1.1) return 70;
  if (ratio < 1.3) return 60;
  return 40;
}

function generateStrategies(
  input: PricingOptimizerInput,
  optimal: number,
): PricingSuggestion[] {
  const baseElasticity = calculateElasticity(
    input.currentPrice,
    input.competitorPrices ?? [],
  );

  return [
    {
      price: Math.round((input.currentPrice * 0.9) * 100) / 100,
      strategy: "Penetração",
      rationale: "Aumenta volume mantendo margem saudável",
      expectedLift: 25,
      elasticityScore: 80,
    },
    {
      price: input.currentPrice,
      strategy: "Manutenção",
      rationale: "Mantém posicionamento atual",
      expectedLift: 0,
      elasticityScore: 50,
    },
    {
      price: Math.round((input.currentPrice * 1.15) * 100) / 100,
      strategy: "Premiumização suave",
      rationale: "Aumenta percebeis de valor",
      expectedLift: -5,
      elasticityScore: 60,
    },
    {
      price: optimal,
      strategy: "Otimizado por dados",
      rationale: "Equilíbrio entre volume e margem",
      expectedLift: 15,
      elasticityScore: baseElasticity,
    },
  ];
}

function findOptimalPrice(
  input: PricingOptimizerInput,
  competitorPrices: number[],
): number {
  const elasticity = calculateElasticity(input.currentPrice, competitorPrices);
  const optimalRatio = 0.9 + (elasticity / 200);
  return Math.round(input.currentPrice * optimalRatio * 100) / 100;
}

export const pricingOptimizerHandler: SkillHandler<
  PricingOptimizerInput,
  PricingOptimizerOutput
> = {
  slug: "pricing-optimizer",
  title: "Otimizador de Preço",
  category: "finance",
  version: "1.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): PricingOptimizerInput =>
    PricingOptimizerInputSchema.parse(raw),
  execute: async (
    input: PricingOptimizerInput,
    _context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<PricingOptimizerOutput>> => {
    const startedAt = Date.now();
    const competitorPrices = input.competitorPrices ?? [];
    const optimalPrice = findOptimalPrice(input, competitorPrices);
    const suggestions = generateStrategies(input, optimalPrice);

    const riskFactors: string[] = [];
    if (competitorPrices.length === 0) {
      riskFactors.push("Ausência de dados competitivos - usar com cautela");
    }
    if (input.costPerUnit && input.costPerUnit >= optimalPrice * 0.5) {
      riskFactors.push("Margem potencial abaixo de 50%");
    }

    return {
      executionId: randomUUID(),
      skill: "pricing-optimizer",
      success: true,
      decision: "auto",
      latencyMs: Date.now() - startedAt,
      output: {
        productName: input.productName,
        currentPrice: input.currentPrice,
        suggestions,
        optimalPrice,
        confidence: competitorPrices.length > 3 ? 85 : 60,
        riskFactors,
        recommendations: [
          "Testar preço em segment pequeño antes de aplicar globalmente",
          "Monitorar conversão por 2 semanas após mudança",
          "Considerar psicólogos de precificação (9,90 vs 10,00)",
        ],
      },
      message: `Preço otimizado calculado: R$ ${optimalPrice.toFixed(2)} (confiança ${competitorPrices.length > 3 ? "85" : "60"}%)`,
    };
  },
};
