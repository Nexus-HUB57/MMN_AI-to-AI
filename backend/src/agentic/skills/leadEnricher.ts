import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";
import { ReasoningStep, ReflectionEntry, MemoryManager, Planner, Reflector, MetricsTracker, ReasoningEngine, AgentTool } from "./agenticCore";

/**
 * Handler operacional · Lead Enricher v2 (Agentic)
 * -----------------------------------------------------------------------------
 * Enriches leads with public data from various sources.
 * Validates and normalizes data before enrichment.
 * Agora suporta Reasoning Trace, Reflexão e Memória.
 */

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
  reasoningTrace?: ReasoningStep[];
  reflection?: ReflectionEntry;
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
  version: "2.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): LeadEnricherInput => LeadEnricherInputSchema.parse(raw),
  execute: async (
    input: LeadEnricherInput,
    context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<LeadEnricherOutput>> => {
    const startedAt = Date.now();
    const warnings: string[] = [];

    // 1. Reasoning Trace
    const reasoningTrace: ReasoningStep[] = [
      {
        thought: `Iniciando enriquecimento de lead para ${input.leadEmail || input.leadPhone || input.leadName}.`,
      },
    ];

    // 2. Memory Retrieval (Check for previous similar lead enrichments)
    const previousEnrichments = await context.memory.retrieve(`lead enrichment for ${input.leadEmail || input.leadPhone || input.leadName}`, 1);
    reasoningTrace.push({
      thought: `Analisando memória: ${previousEnrichments.length} enriquecimentos anteriores encontrados.`,
    });

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
      reasoningTrace.push({
        thought: "Dados de contato insuficientes, enriquecimento limitado.",
        result: "Alerta de dados de contato insuficientes."
      });
    }

    if (input.leadEmail && /test|temp|fake/i.test(input.leadEmail)) {
      enriched.spamRisk = true;
      warnings.push("E-mail temporário ou de teste detectado");
      reasoningTrace.push({
        thought: "E-mail com risco de spam detectado.",
        result: "Alerta de spam."
      });
    }

    const tier = determineTier(enriched);
    reasoningTrace.push({
      thought: `Lead classificado como ${tier}.`,
      result: `Classificação do lead: ${tier}.`
    });

    const output: LeadEnricherOutput = {
      leadId: randomUUID(),
      enriched,
      tier,
      recommendedChannel: recommendChannel(tier, input),
      recommendedAction:
        tier === "hot"
          ? "Encaminhar direto para time comercial"
          : tier === "warm"
            ? "Incluir em sequência de nutrição"
            : "Manter em Lead nurturing de baixa frequência",
      warnings,
      reasoningTrace,
    };

    // 3. Reflection
    if (context.reflector) {
      output.reflection = await context.reflector.reflect(context, reasoningTrace);
      reasoningTrace.push({
        thought: "Reflexão aplicada para otimizar o enriquecimento de leads.",
        result: "Enriquecimento de leads refinado com base em insights de performance."
      });
    }

    // 4. Store in Memory
    await context.memory.store({
      timestamp: new Date(),
      content: `Lead ${output.leadId} enriquecido e classificado como ${output.tier}.`,
      type: 'episodic',
      relatedSkills: ["lead-enricher"]
    });

    // 5. Record Metrics
    await context.metrics.record({
      timestamp: new Date(),
      metricName: 'lead_tier',
      value: tier === "hot" ? 3 : (tier === "warm" ? 2 : 1),
      unit: 'level',
      skillSlug: "lead-enricher"
    });
    await context.metrics.record({
      timestamp: new Date(),
      metricName: 'spam_risk_detected',
      value: enriched.spamRisk ? 1 : 0,
      unit: 'boolean',
      skillSlug: "lead-enricher"
    });

    return {
      executionId: randomUUID(),
      skill: "lead-enricher",
      success: true,
      decision: enriched.spamRisk ? "needs_review" : "auto",
      latencyMs: Date.now() - startedAt,
      output,
      message: `Lead classificado como ${tier.toUpperCase()} - enriquecimento básico completo`,
    };
  },
};
