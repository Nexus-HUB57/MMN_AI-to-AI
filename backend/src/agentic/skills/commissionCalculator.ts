/**
 * Handler operacional · Commission Calculator
 * -----------------------------------------------------------------------------
 * Calculates commissions based on attribution rules (first/last/decay).
 */

import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";

const CommissionCalculatorInputSchema = z.object({
  saleAmount: z.number().positive(),
  productId: z.string().min(1).max(80),
  productCommission: z.number().min(0.01).max(1),
  touchpoints: z
    .array(
      z.object({
        affiliateId: z.string(),
        affiliateName: z.string(),
        channel: z.enum(["organic", "paid_ads", "social", "email", "referral"]),
        touchDate: z.string(),
        conversionCredit: z.number().min(0).max(1),
      }),
    )
    .min(1),
  attributionRule: z.enum(["first", "last", "decay", "linear"]).default("last"),
});

export type CommissionCalculatorInput = z.infer<typeof CommissionCalculatorInputSchema>;

export interface CommissionBreakdown {
  affiliateId: string;
  affiliateName: string;
  commissionAmount: number;
  percentage: number;
  touchpoints: number;
  notes: string;
}

export interface CommissionCalculatorOutput {
  saleId: string;
  saleAmount: number;
  productCommission: number;
  attributionRule: string;
  totalCommission: number;
  breakdown: CommissionBreakdown[];
  disputed: boolean;
  disputeReason: string | null;
}

function calculateFirstTouch(data: CommissionCalculatorInput): CommissionBreakdown[] {
  const sorted = [...data.touchpoints].sort(
    (a, b) => new Date(a.touchDate).getTime() - new Date(b.touchDate).getTime(),
  );
  const first = sorted[0];
  const commission = data.saleAmount * data.productCommission;

  return [
    {
      affiliateId: first.affiliateId,
      affiliateName: first.affiliateName,
      commissionAmount: commission,
      percentage: 100,
      touchpoints: 1,
      notes: "Primeiro toque recebe 100% da comissão",
    },
  ];
}

function calculateLastTouch(data: CommissionCalculatorInput): CommissionBreakdown[] {
  const sorted = [...data.touchpoints].sort(
    (a, b) => new Date(b.touchDate).getTime() - new Date(a.touchDate).getTime(),
  );
  const last = sorted[0];
  const commission = data.saleAmount * data.productCommission;

  return [
    {
      affiliateId: last.affiliateId,
      affiliateName: last.affiliateName,
      commissionAmount: commission,
      percentage: 100,
      touchpoints: 1,
      notes: "Último toque recebe 100% da comissão",
    },
  ];
}

function calculateDecayTouch(data: CommissionCalculatorInput): CommissionBreakdown[] {
  const sorted = [...data.touchpoints].sort(
    (a, b) => new Date(a.touchDate).getTime() - new Date(b.touchDate).getTime(),
  );
  const totalBase = sorted.reduce((sum, _, idx) => sum + Math.pow(0.5, idx), 0);
  const commission = data.saleAmount * data.productCommission;

  return sorted.map((tp, idx) => ({
    affiliateId: tp.affiliateId,
    affiliateName: tp.affiliateName,
    commissionAmount: Math.round((commission * Math.pow(0.5, idx)) / totalBase * 100) / 100,
    percentage: Math.round((Math.pow(0.5, idx) / totalBase) * 100 * 100) / 100,
    touchpoints: 1,
    notes: `Peso de decaimento: ${Math.pow(0.5, idx).toFixed(2)}`,
  }));
}

function calculateLinearTouch(data: CommissionCalculatorInput): CommissionBreakdown[] {
  const uniqueAffiliates = Array.from(
    new Set(data.touchpoints.map((tp: any) => tp.affiliateId)),
  );
  const commission = data.saleAmount * data.productCommission;
  const perAffiliate = commission / uniqueAffiliates.length;

  return uniqueAffiliates.map((affId) => {
    const tp = data.touchpoints.find((t: any) => t.affiliateId === affId);
    return {
      affiliateId: affId,
      affiliateName: tp?.affiliateName ?? affId,
      commissionAmount: Math.round(perAffiliate * 100) / 100,
      percentage: Math.round((1 / uniqueAffiliates.length) * 10000) / 100,
      touchpoints: data.touchpoints.filter((t: any) => t.affiliateId === affId).length,
      notes: "Comissão dividida igualmente entre afetados",
    };
  });
}

export const commissionCalculatorHandler: SkillHandler<
  CommissionCalculatorInput,
  CommissionCalculatorOutput
> = {
  slug: "commission-calculator",
  title: "Calculador de Comissão",
  category: "finance",
  version: "1.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): CommissionCalculatorInput =>
    CommissionCalculatorInputSchema.parse(raw),
  execute: async (
    input: CommissionCalculatorInput,
    _context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<CommissionCalculatorOutput>> => {
    const startedAt = Date.now();

    let breakdown: CommissionBreakdown[];
    switch (input.attributionRule) {
      case "first":
        breakdown = calculateFirstTouch(input);
        break;
      case "decay":
        breakdown = calculateDecayTouch(input);
        break;
      case "linear":
        breakdown = calculateLinearTouch(input);
        break;
      case "last":
      default:
        breakdown = calculateLastTouch(input);
    }

    const totalCommission = breakdown.reduce((sum, b) => sum + b.commissionAmount, 0);
    const disputed = totalCommission > input.saleAmount * input.productCommission * 1.5;

    return {
      executionId: randomUUID(),
      skill: "commission-calculator",
      success: true,
      decision: disputed ? "needs_review" : "auto",
      latencyMs: Date.now() - startedAt,
      output: {
        saleId: randomUUID(),
        saleAmount: input.saleAmount,
        productCommission: input.productCommission,
        attributionRule: input.attributionRule,
        totalCommission,
        breakdown,
        disputed,
        disputeReason: disputed ? "Comissão total excede limite esperado" : null,
      },
      message: `Comissão calculada: R$ ${totalCommission.toFixed(2)} com regra '${input.attributionRule}'`,
    };
  },
};
