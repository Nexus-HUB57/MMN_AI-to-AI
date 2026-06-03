import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";
import { PlanStep } from "./agenticCore";

/**
 * Handler operacional · Prospecção Outbound v2 (Agentic)
 * -----------------------------------------------------------------------------
 * Agora suporta Multi-step Planning e Tool Use.
 */

const ProspectSchema = z.object({
  id: z.string().min(1).max(80).optional(),
  name: z.string().min(2).max(120),
  audienceFit: z.number().min(0).max(100).default(50),
  recentEngagement: z.number().min(0).max(100).default(0),
  buyingPower: z.number().min(0).max(100).default(50),
  preferredChannel: z
    .enum(["whatsapp", "email", "instagram", "facebook", "linkedin", "sms"])
    .default("whatsapp"),
  optIn: z.boolean().default(false),
  contactHint: z.string().max(160).optional(),
  notes: z.string().max(400).optional(),
});

const ProspeccaoInputSchema = z.object({
  prospects: z.array(ProspectSchema).min(1).max(50),
  productName: z.string().min(2).max(160),
  productBenefit: z.string().min(2).max(240),
  trendContext: z
    .object({
      title: z.string().max(180),
      score: z.number().min(0).max(100),
      band: z.enum(["fria", "morna", "quente", "explosiva"]).default("morna"),
    })
    .optional(),
  allowedChannels: z
    .array(
      z.enum(["whatsapp", "email", "instagram", "facebook", "linkedin", "sms"]),
    )
    .min(1)
    .max(6)
    .default(["whatsapp", "email"]),
  brand: z.string().min(2).max(80).default("Nexus Affil'IA'te"),
});

export type ProspeccaoInput = z.infer<typeof ProspeccaoInputSchema>;
type Prospect = z.infer<typeof ProspectSchema>;

export interface ScoredProspect {
  id: string;
  name: string;
  leadScore: number;
  segment: "alta_intencao" | "morna" | "exploratorio";
  channel: Prospect["preferredChannel"];
  optIn: boolean;
  reasoning: string[];
}

export interface OutreachMessage {
  prospectId: string;
  step: 1 | 2 | 3;
  sendAtIso: string;
  channel: Prospect["preferredChannel"];
  subject: string | null;
  body: string;
  cta: string;
}

export interface ProspeccaoOutput {
  totalScored: number;
  segments: {
    alta_intencao: number;
    morna: number;
    exploratorio: number;
  };
  prospects: ScoredProspect[];
  messages: OutreachMessage[];
  complianceAlerts: string[];
  plan?: PlanStep[];
}

function segmentFor(score: number): ScoredProspect["segment"] {
  if (score >= 75) return "alta_intencao";
  if (score >= 50) return "morna";
  return "exploratorio";
}

function scoreProspect(
  prospect: Prospect,
  allowedChannels: ProspeccaoInput["allowedChannels"],
): { score: number; reasoning: string[] } {
  const reasoning: string[] = [];
  const channelActive = allowedChannels.includes(prospect.preferredChannel);
  const channelScore = channelActive ? 100 : 0;
  const optInScore = prospect.optIn ? 100 : 0;

  if (prospect.audienceFit >= 70) reasoning.push("Fit de público alto.");
  if (prospect.recentEngagement >= 60) reasoning.push("Engajamento recente forte.");
  if (prospect.buyingPower >= 60) reasoning.push("Poder de compra acima da média.");
  if (!channelActive) reasoning.push(`Canal preferido (${prospect.preferredChannel}) bloqueado.`);
  if (!prospect.optIn) reasoning.push("Sem opt-in declarado — checar LGPD.");

  const raw =
    prospect.audienceFit * 0.35 +
    prospect.recentEngagement * 0.25 +
    prospect.buyingPower * 0.2 +
    channelScore * 0.15 +
    optInScore * 0.05;

  return { score: Math.max(0, Math.min(100, Math.round(raw))), reasoning };
}

function buildMessageStep(
  step: 1 | 2 | 3,
  prospect: ScoredProspect,
  input: ProspeccaoInput,
  baseDate: Date,
): OutreachMessage {
  const dayOffsets = { 1: 0, 2: 2, 3: 5 } as const;
  const sendAt = new Date(baseDate);
  sendAt.setUTCDate(sendAt.getUTCDate() + dayOffsets[step]);

  const trendLine = input.trendContext
    ? `Estamos vendo movimentação ${input.trendContext.band} em "${input.trendContext.title}".`
    : `Estamos acompanhando padrões relevantes para o seu perfil.`;

  const subjectByStep = {
    1: `${prospect.name.split(" ")[0] || "Olá"}, abrindo conversa`,
    2: `${prospect.name.split(" ")[0] || "Olá"}, complemento da semana`,
    3: `${prospect.name.split(" ")[0] || "Olá"}, último toque desta sequência`,
  } as const;

  const bodyByStep = {
    1: [
      `Olá ${prospect.name.split(" ")[0] || ""}, aqui é da ${input.brand}.`,
      trendLine,
      `${input.productName} resolve isso direto: ${input.productBenefit}.`,
      `Posso te mandar o material em 1 minuto?`,
    ].join("\n\n"),
    2: [
      `Sem pressa, ${prospect.name.split(" ")[0] || ""}, só completando o que mandei.`,
      `Os resultados mais comuns com ${input.productName} aparecem nas primeiras semanas: ${input.productBenefit}.`,
      `Se quiser, te envio um exemplo concreto agora.`,
    ].join("\n\n"),
    3: [
      `${prospect.name.split(" ")[0] || "Olá"}, último toque desta linha.`,
      `Se ${input.productName} fizer sentido nesse momento, eu deixo o acesso preparado.`,
      `Se não fizer, sem problema — encerro a sequência aqui.`,
    ].join("\n\n"),
  } as const;

  const ctaByStep = {
    1: "Quero o material",
    2: "Me manda o exemplo",
    3: "Pode preparar meu acesso",
  } as const;

  return {
    prospectId: prospect.id,
    step,
    sendAtIso: sendAt.toISOString(),
    channel: prospect.channel,
    subject: prospect.channel === "email" ? subjectByStep[step] : null,
    body: bodyByStep[step],
    cta: ctaByStep[step],
  };
}

export const prospeccaoOutboundHandler: SkillHandler<
  ProspeccaoInput,
  ProspeccaoOutput
> = {
  slug: "prospeccao-outbound",
  title: "Prospecção Outbound",
  category: "sales",
  version: "2.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): ProspeccaoInput => ProspeccaoInputSchema.parse(raw),
  execute: async (
    input: ProspeccaoInput,
    context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<ProspeccaoOutput>> => {
    const startedAt = Date.now();
    const baseDate = new Date();

    // 1. Create Plan
    const plan = await context.planner.createPlan(
      `Executar prospecção outbound para ${input.prospects.length} prospects do produto ${input.productName}`,
      context
    );

    // Step 1: Lead Scoring
    const scored: ScoredProspect[] = input.prospects
      .map((prospect) => {
        const { score, reasoning } = scoreProspect(prospect, input.allowedChannels);
        return {
          id: prospect.id ?? randomUUID(),
          name: prospect.name,
          leadScore: score,
          segment: segmentFor(score),
          channel: prospect.preferredChannel,
          optIn: prospect.optIn,
          reasoning,
        } satisfies ScoredProspect;
      })
      .sort((a, b) => b.leadScore - a.leadScore);

    // Step 2: Enriquecimento (Tool Use Example)
    if (context.tools['lead-enricher']) {
      for (const p of scored.filter(p => p.leadScore > 80)) {
        await context.tools['lead-enricher'].execute({ prospectId: p.id }, context);
      }
    }

    const segments = scored.reduce(
      (acc, prospect) => {
        acc[prospect.segment] += 1;
        return acc;
      },
      { alta_intencao: 0, morna: 0, exploratorio: 0 },
    );

    const messages: OutreachMessage[] = [];
    for (const prospect of scored) {
      if (prospect.segment === "exploratorio") continue;
      for (const step of [1, 2, 3] as const) {
        messages.push(buildMessageStep(step, prospect, input, baseDate));
      }
    }

    const complianceAlerts: string[] = [];
    const noOptInCount = scored.filter((p) => !p.optIn).length;
    if (noOptInCount > 0) {
      complianceAlerts.push(
        `${noOptInCount} prospect(s) sem opt-in declarado — confirmar base legítima LGPD antes do envio.`,
      );
    }

    // Record Metrics
    await context.metrics.record({
      timestamp: new Date(),
      metricName: 'high_intent_leads',
      value: segments.alta_intencao,
      unit: 'leads',
      skillSlug: 'prospeccao-outbound'
    });

    const decision: SkillExecutionResult["decision"] =
      !context.autonomyAllowed ||
      noOptInCount > 0 ||
      input.trendContext?.band === "fria"
        ? "needs_review"
        : "auto";

    const output: ProspeccaoOutput = {
      totalScored: scored.length,
      segments,
      prospects: scored,
      messages,
      complianceAlerts,
      plan,
    };

    return {
      executionId: randomUUID(),
      skill: "prospeccao-outbound",
      success: scored.length > 0,
      decision,
      latencyMs: Date.now() - startedAt,
      output,
      warnings: complianceAlerts,
      message:
        decision === "auto"
          ? `Sequência outbound pronta para disparar: ${scored.length} prospects, ${messages.length} mensagens em 3 toques.`
          : `Sequência outbound preparada com ${complianceAlerts.length} alerta(s) — revisar antes de disparar.`,
    };
  },
};
