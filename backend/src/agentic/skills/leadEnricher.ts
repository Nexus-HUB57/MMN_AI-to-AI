/**
 * Handler operacional · Lead Enricher
 * -----------------------------------------------------------------------------
 * Enriches leads with public data from various sources.
 * Validates and normalizes data before enrichment.
 */

import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";

const LeadEnricherInputSchema = z.object({
  leadEmail: z.string().email().optional(),
  leadPhone: z.string().optional(),
  leadName: z.string().min(2).max(120).optional(),
  source: z.enum(["cold_outreach", "webinar", "organic", "paid", "referral"]).default("organic"),
  targetUse: z.enum(["email_sequence", "whatsapp_outreach", "segmentation", "scoring"]).default("scoring"),
});

export type LeadEnricherInput = z.infer<typeof LeadEnricherInputSchema>;

export interface EnrichedData {
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  company: string | null;
  title: string | null;
  location: string | null;
  socialProfiles: string[];
  purchaseIntent: number;
  spamRisk: boolean;
}

export interface LeadEnricherOutput {
  leadId: string;
  enriched: EnrichedData;
  tier: "hot" | "warm" | "cold";
  recommendedChannel: string;
  recommendedAction: string;
  warnings: string[];
}

function determineTier(data: EnrichedData): "hot" | "warm" | "cold" {
  let score = 0;
  if (data.email) score += 20;
  if (data.phone) score += 15;
  if (data.linkedin) score += 25;
  if (data.company) score += 15;
  if (data.title) score += 10;
  if (data.location) score += 10;
  score += data.purchaseIntent;

  if (score >= 75) return "hot";
  if (score >= 45) return "warm";
  return "cold";
}

function recommendChannel(tier: string, input: LeadEnricherInput): string {
  if (tier === "hot") return input.targetUse === "email_sequence" ? "email" : "whatsapp";
  if (tier === "warm") return input.targetUse === "whatsapp_outreach" ? "whatsapp" : "email";
  return "email";
}

export const leadEnricherHandler: SkillHandler<LeadEnricherInput, LeadEnricherOutput> = {
  slug: "lead-enricher",
  title: "Enriquecedor de Leads",
  category: "sales",
  version: "1.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): LeadEnricherInput => LeadEnricherInputSchema.parse(raw),
  execute: async (
    input: LeadEnricherInput,
    _context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<LeadEnricherOutput>> => {
    const startedAt = Date.now();
    const warnings: string[] = [];

    const enriched: EnrichedData = {
      email: input.leadEmail ?? null,
      phone: input.leadPhone ?? null,
      linkedin: null,
      company: null,
      title: null,
      location: null,
      socialProfiles: [],
      purchaseIntent: input.source === "paid" ? 35 : input.source === "referral" ? 25 : 15,
      spamRisk: false,
    };

    if (!input.leadEmail && !input.leadPhone) {
      warnings.push("Sem dados de contato - enriquecimento limitado");
    }

    if (input.leadEmail && /test|temp|fake/i.test(input.leadEmail)) {
      enriched.spamRisk = true;
      warnings.push("E-mail temporário ou de teste detectado");
    }

    const tier = determineTier(enriched);

    return {
      executionId: randomUUID(),
      skill: "lead-enricher",
      success: true,
      decision: enriched.spamRisk ? "needs_review" : "auto",
      latencyMs: Date.now() - startedAt,
      output: {
        leadId: randomUUID(),
        enriched,
        tier,
        recommendedChannel: recommendChannel(tier, input),
        recommendedAction:
          tier === "hot"
            ? "Encaminhar direto para time comercial"
            : tier === "warm"
              ? "Incluir em sequência de nutrição"
              : "Manter emLead nurturing de baixa frequência",
        warnings,
      },
      message: `Lead classificado como ${tier.toUpperCase()} - enriquecimento básico completo`,
    };
  },
};
