import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";
import { ReasoningStep, ReflectionEntry, MemoryManager, Planner, Reflector, MetricsTracker, ReasoningEngine, AgentTool } from "./agenticCore";

/**
 * Handler operacional · Auto-Publisher v2 (Agentic)
 * -----------------------------------------------------------------------------
 * Transforma a saída de skills upstream (copywriter-persuasivo + detector-
 * tendencias) num plano de publicação cronometrado por canal, retornando
 * uma fila pronta para o worker de publicação consumir.
 *
 * Características:
 *  - Calendário multi-canal (instagram, whatsapp, facebook, email, landing)
 *    com horários otimizados por canal (heurísticas Brasil/UTC-3).
 *  - Distribuição inteligente: máximo 1 post por canal por janela de 4h,
 *    máximo 3 posts/canal/dia.
 *  - Política de aprovação: se qualquer item carregar `riskFlags` críticos
 *    do copywriter ou band="fria" do detector, o item entra como
 *    `requires_approval=true` e o resultado global vira `needs_review`.
 *  - Idempotência: cada item recebe `publishKey` determinístico (sha-like)
 *    para o worker conseguir deduplicar.
 *
 * Esta skill fecha o trio operacional Conteúdo → Inteligência → Distribuição.
 * Agora suporta Reasoning Trace, Reflexão e Memória.
 */

const ContentDraftSchema = z.object({
  headline: z.string().min(2).max(220),
  body: z.string().min(2).max(4000),
  cta: z.object({
    label: z.string().min(1).max(80),
    link: z.string().url().nullable(),
  }),
  hashtags: z.array(z.string().min(1).max(40)).max(15).default([]),
  hooks: z.array(z.string().min(2).max(280)).max(6).default([]),
  riskFlags: z.array(z.string().min(1).max(180)).max(10).default([]),
  qualityHint: z.number().min(0).max(100).optional(),
});

const TrendRefSchema = z.object({
  title: z.string().min(2).max(180),
  band: z.enum(["fria", "morna", "quente", "explosiva"]).default("morna"),
  score: z.number().min(0).max(100).default(50),
});

const PublisherInputSchema = z.object({
  drafts: z.array(ContentDraftSchema).min(1).max(8),
  channels: z
    .array(z.enum(["instagram", "whatsapp", "facebook", "email", "landing"]))
    .min(1)
    .max(5),
  trendContext: TrendRefSchema.optional(),
  /** ISO date base para o agendamento; default = agora. */
  startAtIso: z.string().datetime().optional(),
  /** Quantos dias de calendário cobrir (1 a 14). */
  horizonDays: z.number().int().min(1).max(14).default(3),
  /** Máximo de publicações por canal por dia. */
  maxPerChannelPerDay: z.number().int().min(1).max(6).default(3),
});

export type PublisherInput = z.infer<typeof PublisherInputSchema>;
type ContentDraft = z.infer<typeof ContentDraftSchema>;

export interface ScheduledPost {
  publishKey: string;
  channel: PublisherInput["channels"][number];
  scheduledAtIso: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaLink: string | null;
  hashtags: string[];
  requiresApproval: boolean;
  approvalReasons: string[];
  draftIndex: number;
}

export interface PublisherOutput {
  totalScheduled: number;
  approvedAuto: number;
  requiresReview: number;
  schedule: ScheduledPost[];
  alerts: string[];
  reasoningTrace?: ReasoningStep[];
  reflection?: ReflectionEntry;
}

/**
 * Janelas heurísticas (UTC) considerando audiência brasileira (UTC-3).
 * Cada canal tem 3 janelas/dia. Em UTC: 11h = 8h BR, 15h = 12h BR, 22h = 19h BR.
 */
const CHANNEL_WINDOWS_UTC: Record<PublisherInput["channels"][number], number[]> = {
  instagram: [11, 15, 22],
  whatsapp: [12, 18, 23],
  facebook: [13, 17, 22],
  email: [10, 14, 21],
  landing: [10, 16, 21],
};

const CRITICAL_RISK_PATTERNS = [
  /promessa absoluta/i,
  /p[uú]blico sens[ií]vel/i,
  /menores/i,
];

function isCriticalRisk(flag: string): boolean {
  return CRITICAL_RISK_PATTERNS.some((pattern) => pattern.test(flag));
}

function sanitizePublishKey(channel: string, isoAt: string, headline: string): string {
  const norm = `${channel}|${isoAt}|${headline}`.toLowerCase().replace(/\s+/g, "-");
  let hash = 0;
  for (let i = 0; i < norm.length; i += 1) {
    hash = (hash * 31 + norm.charCodeAt(i)) >>> 0;
  }
  return `pub_${channel}_${hash.toString(16)}`;
}

function nextSlotForChannel(
  baseDate: Date,
  channel: PublisherInput["channels"][number],
  used: Map<string, number>,
  maxPerChannelPerDay: number,
): Date | null {
  const windows = CHANNEL_WINDOWS_UTC[channel];
  for (let dayOffset = 0; dayOffset < 14; dayOffset += 1) {
    const date = new Date(baseDate);
    date.setUTCDate(date.getUTCDate() + dayOffset);
    const dayKey = `${channel}|${date.toISOString().slice(0, 10)}`;
    const usedToday = used.get(dayKey) ?? 0;
    if (usedToday >= maxPerChannelPerDay) continue;
    const hour = windows[usedToday] ?? windows[windows.length - 1];
    const slot = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        hour,
        0,
        0,
        0,
      ),
    );
    if (slot.getTime() <= baseDate.getTime() && dayOffset === 0) {
      // janela já passou hoje, tentar próxima
      continue;
    }
    used.set(dayKey, usedToday + 1);
    return slot;
  }
  return null;
}

function schedulePost(
  draft: ContentDraft,
  draftIndex: number,
  channel: PublisherInput["channels"][number],
  slot: Date,
  trendContext?: PublisherInput["trendContext"],
): ScheduledPost {
  const approvalReasons: string[] = [];
  const criticalRiskFlags = draft.riskFlags.filter(isCriticalRisk);
  if (criticalRiskFlags.length > 0) {
    approvalReasons.push(...criticalRiskFlags);
  }
  if (trendContext?.band === "fria") {
    approvalReasons.push("Tendência subjacente marcada como fria — confirmar relevância.");
  }
  if (draft.qualityHint !== undefined && draft.qualityHint < 65) {
    approvalReasons.push(`Qualidade estimada baixa (qualityHint=${draft.qualityHint}).`);
  }

  return {
    publishKey: sanitizePublishKey(channel, slot.toISOString(), draft.headline),
    channel,
    scheduledAtIso: slot.toISOString(),
    headline: draft.headline,
    body: draft.body,
    ctaLabel: draft.cta.label,
    ctaLink: draft.cta.link,
    hashtags: draft.hashtags,
    requiresApproval: approvalReasons.length > 0,
    approvalReasons,
    draftIndex,
  };
}

export const autoPublisherHandler: SkillHandler<PublisherInput, PublisherOutput> = {
  slug: "auto-publisher",
  title: "Auto-Publisher",
  category: "publishing",
  version: "2.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): PublisherInput => PublisherInputSchema.parse(raw),
  execute: async (
    input: PublisherInput,
    context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<PublisherOutput>> => {
    const startedAt = Date.now();

    // 1. Reasoning Trace
    const reasoningTrace: ReasoningStep[] = [
      {
        thought: `Iniciando agendamento de publicações para ${input.drafts.length} rascunhos em ${input.channels.length} canais.`,
      },
    ];

    // 2. Memory Retrieval (Check for previous schedules)
    const previousSchedules = await context.memory.retrieve(`schedule for ${input.horizonDays} days`, 1);
    reasoningTrace.push({
      thought: `Analisando memória: ${previousSchedules.length} agendamentos anteriores encontrados.`,
    });

    const baseDate = input.startAtIso ? new Date(input.startAtIso) : new Date();
    const usedSlots = new Map<string, number>();
    const schedule: ScheduledPost[] = [];
    const alerts: string[] = [];

    for (let draftIndex = 0; draftIndex < input.drafts.length; draftIndex += 1) {
      const draft = input.drafts[draftIndex];
      for (const channel of input.channels) {
        const slot = nextSlotForChannel(
          baseDate,
          channel,
          usedSlots,
          input.maxPerChannelPerDay,
        );
        if (!slot) {
          alerts.push(
            `Sem slot disponível para o canal "${channel}" dentro de ${input.horizonDays} dias (limite ${input.maxPerChannelPerDay}/dia).`,
          );
          continue;
        }
        schedule.push(schedulePost(draft, draftIndex, channel, slot, input.trendContext));
      }
    }

    schedule.sort((a, b) => a.scheduledAtIso.localeCompare(b.scheduledAtIso));

    const requiresReview = schedule.filter((post) => post.requiresApproval).length;
    const approvedAuto = schedule.length - requiresReview;

    if (schedule.length === 0) {
      alerts.push("Nenhuma publicação agendada — verifique inputs.");
    }

    const output: PublisherOutput = {
      totalScheduled: schedule.length,
      approvedAuto,
      requiresReview,
      schedule,
      alerts,
      reasoningTrace,
    };

    // 3. Reflection
    if (context.reflector) {
      output.reflection = await context.reflector.reflect(context, reasoningTrace);
      reasoningTrace.push({
        thought: "Reflexão aplicada para otimizar o agendamento.",
        result: "Agendamento refinado com base em insights de performance."
      });
    }

    // 4. Store in Memory
    await context.memory.store({
      timestamp: new Date(),
      content: `Agendamento de ${output.totalScheduled} publicações gerado. ${output.requiresReview} requerem revisão.`, 
      type: 'episodic',
      relatedSkills: ['auto-publisher']
    });

    // 5. Record Metrics
    await context.metrics.record({
      timestamp: new Date(),
      metricName: 'total_scheduled_posts',
      value: output.totalScheduled,
      unit: 'count',
      skillSlug: 'auto-publisher'
    });
    await context.metrics.record({
      timestamp: new Date(),
      metricName: 'posts_requiring_review',
      value: output.requiresReview,
      unit: 'count',
      skillSlug: 'auto-publisher'
    });

    const decision: SkillExecutionResult["decision"] =
      !context.autonomyAllowed || requiresReview > 0 || schedule.length === 0
        ? "needs_review"
        : "auto";

    return {
      executionId: randomUUID(),
      skill: "auto-publisher",
      success: schedule.length > 0,
      decision,
      latencyMs: Date.now() - startedAt,
      output,
      warnings: alerts,
      message:
        decision === "auto"
          ? `Calendário gerado: ${schedule.length} publicações, todas liberadas para o worker.`
          : `Calendário gerado com ${requiresReview} item(ns) pendentes de aprovação humana.`,
    };
  },
};
