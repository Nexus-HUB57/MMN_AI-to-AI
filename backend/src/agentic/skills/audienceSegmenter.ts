import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";

/**
 * Handler operacional · Audience Segmenter
 * -----------------------------------------------------------------------------
 * Segmentação multidimensional de audiências para alimentar
 * prospeccao-outbound e follow-up-strategist.
 *
 * Recebe um lote de contatos com atributos (demográficos, comportamentais,
 * comerciais) e devolve:
 *   - clusters automáticos baseados em RFM modificado
 *     (Recency · Frequency · Monetary + EngagementSignal)
 *   - personas inferidas com tags semânticas
 *   - playbook recomendado por segmento (qual handler downstream rodar)
 *   - distribuição estatística por dimensão
 *
 * Algoritmo:
 *   - Normaliza cada métrica para 0-1
 *   - Calcula RFM-E score ponderado (R 30% · F 25% · M 25% · E 20%)
 *   - Atribui segmento por faixa de score:
 *       >= 0.75  → "champions"
 *       0.55-0.74 → "loyal"
 *       0.35-0.54 → "growing"
 *       0.15-0.34 → "at_risk"
 *       < 0.15   → "dormant"
 *   - Tags semânticas inferidas (high_ticket / digital_native / etc.)
 *   - Playbook automático por segmento
 */

const ContactAttributesSchema = z.object({
  id: z.string().min(1).max(80).optional(),
  name: z.string().min(2).max(160),
  daysSinceLastTouch: z.number().int().min(0).max(3650).default(365),
  interactionsLast90d: z.number().int().min(0).max(10000).default(0),
  totalSpend: z.number().min(0).max(10_000_000).default(0),
  avgTicket: z.number().min(0).max(1_000_000).default(0),
  engagementScore: z.number().min(0).max(100).default(0),
  preferredChannel: z
    .enum(["whatsapp", "email", "instagram", "facebook", "linkedin", "sms"])
    .default("whatsapp"),
  ageBracket: z.enum(["18-24", "25-34", "35-44", "45-54", "55+"]).optional(),
  region: z.string().max(80).optional(),
  hasOptIn: z.boolean().default(false),
});

const SegmenterInputSchema = z.object({
  contacts: z.array(ContactAttributesSchema).min(1).max(200),
  /** Pesos customizáveis (devem somar ~1). */
  weights: z
    .object({
      recency: z.number().min(0).max(1).default(0.3),
      frequency: z.number().min(0).max(1).default(0.25),
      monetary: z.number().min(0).max(1).default(0.25),
      engagement: z.number().min(0).max(1).default(0.2),
    })
    .default({ recency: 0.3, frequency: 0.25, monetary: 0.25, engagement: 0.2 }),
});

export type SegmenterInput = z.infer<typeof SegmenterInputSchema>;
type ContactAttrs = z.infer<typeof ContactAttributesSchema>;
type Segment = "champions" | "loyal" | "growing" | "at_risk" | "dormant";

export interface SegmentedContact {
  id: string;
  name: string;
  segment: Segment;
  rfmeScore: number;
  components: {
    recency: number;
    frequency: number;
    monetary: number;
    engagement: number;
  };
  tags: string[];
  recommendedPlaybook: string[];
}

export interface SegmenterOutput {
  totalContacts: number;
  distribution: Record<Segment, number>;
  contacts: SegmentedContact[];
  insights: string[];
  topPersonas: Array<{ tag: string; count: number }>;
}

const SEGMENT_PLAYBOOKS: Record<Segment, string[]> = {
  champions: ["follow-up-strategist", "analytics-reporter"],
  loyal: ["copywriter-persuasivo", "auto-publisher"],
  growing: ["prospeccao-outbound", "copywriter-persuasivo"],
  at_risk: ["follow-up-strategist", "judge-revisor"],
  dormant: ["follow-up-strategist"],
};

const SEGMENT_LABELS: Record<Segment, string> = {
  champions: "Campeões",
  loyal: "Leais",
  growing: "Em crescimento",
  at_risk: "Em risco",
  dormant: "Dormentes",
};

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function normalizeRecency(days: number): number {
  // Recência: 0 dias = 1.0, 365 dias = 0.0 (linear)
  return clamp01(1 - days / 365);
}

function normalizeFrequency(interactions: number): number {
  // Saturação log: 0=0 / 10=~0.5 / 100+=~1.0
  if (interactions <= 0) return 0;
  return clamp01(Math.log10(interactions + 1) / Math.log10(100));
}

function normalizeMonetary(totalSpend: number): number {
  // Log scale para suavizar caudas: R$ 0 = 0, R$ 1k ~ 0.5, R$ 100k+ ~ 1.0
  if (totalSpend <= 0) return 0;
  return clamp01(Math.log10(totalSpend + 1) / Math.log10(100_000));
}

function normalizeEngagement(score: number): number {
  return clamp01(score / 100);
}

function segmentFor(score: number): Segment {
  if (score >= 0.75) return "champions";
  if (score >= 0.55) return "loyal";
  if (score >= 0.35) return "growing";
  if (score >= 0.15) return "at_risk";
  return "dormant";
}

function inferTags(contact: ContactAttrs, segment: Segment): string[] {
  const tags: string[] = [];
  if (contact.avgTicket >= 1000) tags.push("high_ticket");
  else if (contact.avgTicket >= 200) tags.push("mid_ticket");
  else if (contact.avgTicket > 0) tags.push("low_ticket");

  if (contact.ageBracket === "18-24" || contact.ageBracket === "25-34") {
    tags.push("digital_native");
  }
  if (contact.preferredChannel === "whatsapp" || contact.preferredChannel === "sms") {
    tags.push("mobile_first");
  }
  if (contact.preferredChannel === "linkedin") tags.push("b2b_signal");
  if (contact.engagementScore >= 70) tags.push("high_engagement");
  if (!contact.hasOptIn) tags.push("no_optin");
  if (segment === "champions" || segment === "loyal") tags.push("retention_target");
  if (segment === "growing") tags.push("expansion_target");
  if (segment === "at_risk" || segment === "dormant") tags.push("reactivation_target");

  return tags;
}

export const audienceSegmenterHandler: SkillHandler<SegmenterInput, SegmenterOutput> = {
  slug: "audience-segmenter",
  title: "Audience Segmenter",
  category: "intelligence",
  version: "1.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): SegmenterInput => SegmenterInputSchema.parse(raw),
  execute: async (
    input: SegmenterInput,
    context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<SegmenterOutput>> => {
    const startedAt = Date.now();
    const weights = input.weights;

    const segmented: SegmentedContact[] = input.contacts.map((contact) => {
      const r = normalizeRecency(contact.daysSinceLastTouch);
      const f = normalizeFrequency(contact.interactionsLast90d);
      const m = normalizeMonetary(contact.totalSpend);
      const e = normalizeEngagement(contact.engagementScore);
      const score = clamp01(
        r * weights.recency + f * weights.frequency + m * weights.monetary + e * weights.engagement,
      );
      const segment = segmentFor(score);
      const tags = inferTags(contact, segment);

      return {
        id: contact.id ?? randomUUID(),
        name: contact.name,
        segment,
        rfmeScore: Math.round(score * 100) / 100,
        components: {
          recency: Math.round(r * 100) / 100,
          frequency: Math.round(f * 100) / 100,
          monetary: Math.round(m * 100) / 100,
          engagement: Math.round(e * 100) / 100,
        },
        tags,
        recommendedPlaybook: SEGMENT_PLAYBOOKS[segment],
      };
    });

    const distribution: Record<Segment, number> = {
      champions: 0,
      loyal: 0,
      growing: 0,
      at_risk: 0,
      dormant: 0,
    };
    const tagCounts = new Map<string, number>();
    for (const entry of segmented) {
      distribution[entry.segment] += 1;
      for (const tag of entry.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }

    const topPersonas = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const insights: string[] = [];
    const total = segmented.length;
    const championPct = Math.round((distribution.champions / total) * 100);
    const dormantPct = Math.round((distribution.dormant / total) * 100);
    if (championPct >= 20) {
      insights.push(`${championPct}% da base são campeões — ativo estratégico para expansão.`);
    }
    if (dormantPct >= 30) {
      insights.push(`${dormantPct}% da base está dormente — priorizar reativação automática.`);
    }
    if (distribution.at_risk > distribution.loyal) {
      insights.push("At-risk maior que loyal — sinal de retenção fraca, acionar follow-up.");
    }
    if (topPersonas[0]?.tag === "no_optin") {
      insights.push("Maioria sem opt-in — risco de compliance LGPD em campanhas.");
    }
    if (insights.length === 0) {
      insights.push(`Distribuição balanceada: ${SEGMENT_LABELS.champions} ${distribution.champions} · ${SEGMENT_LABELS.loyal} ${distribution.loyal} · ${SEGMENT_LABELS.growing} ${distribution.growing}.`);
    }

    const noOptInCount = tagCounts.get("no_optin") ?? 0;
    const decision: SkillExecutionResult["decision"] =
      !context.autonomyAllowed || noOptInCount > total / 2 ? "needs_review" : "auto";

    return {
      executionId: randomUUID(),
      skill: "audience-segmenter",
      success: true,
      decision,
      latencyMs: Date.now() - startedAt,
      output: {
        totalContacts: total,
        distribution,
        contacts: segmented,
        insights,
        topPersonas,
      },
      warnings: noOptInCount > 0 ? [`${noOptInCount} contato(s) sem opt-in.`] : [],
      message:
        decision === "auto"
          ? `Segmentação concluída: ${total} contatos em 5 clusters.`
          : `Segmentação concluída com alerta de compliance — revisar antes de acionar.`,
    };
  },
};
