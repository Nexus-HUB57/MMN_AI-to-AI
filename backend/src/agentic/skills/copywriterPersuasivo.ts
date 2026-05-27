import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";

/**
 * Handler operacional · Copywriter Persuasivo
 * -----------------------------------------------------------------------------
 * Recebe contexto de produto/oferta + público-alvo e devolve uma estrutura
 * pronta para publicação contendo:
 *  - headline persuasiva
 *  - subheadline com gatilho de urgência ou prova social
 *  - 3 hooks alternativos para teste A/B
 *  - bloco CTA com sugestão de link
 *  - flags de risco para LLM-as-Judge revisar antes de publicar
 *
 * Operacionalmente serve como base para skills downstream (auto-publisher,
 * follow-up, prospecção) e é o primeiro handler de ponta a ponta entregue.
 */

const CopywriterInputSchema = z.object({
  productName: z.string().min(2).max(160),
  productType: z
    .enum(["ebook", "curso", "mentoria", "pack", "skill", "marketplace", "outro"])
    .default("outro"),
  audience: z.string().min(2).max(240),
  pain: z.string().min(2).max(240),
  outcome: z.string().min(2).max(240),
  priceLabel: z.string().max(40).optional(),
  affiliateLink: z.string().url().optional(),
  tone: z
    .enum(["professional", "casual", "persuasive", "humorous", "authority"])
    .default("persuasive"),
  channel: z
    .enum(["instagram", "whatsapp", "facebook", "email", "landing"])
    .default("instagram"),
});

export type CopywriterInput = z.infer<typeof CopywriterInputSchema>;

export interface CopywriterOutput {
  headline: string;
  subheadline: string;
  hooks: string[];
  body: string;
  cta: {
    label: string;
    link: string | null;
  };
  hashtags: string[];
  riskFlags: string[];
  qualityHint: number;
}

const TONE_TEMPLATES: Record<CopywriterInput["tone"], { adj: string; trigger: string }> = {
  professional: { adj: "comprovado", trigger: "Resultados consistentes" },
  casual: { adj: "simples", trigger: "Sem complicação" },
  persuasive: { adj: "definitivo", trigger: "Não fique para trás" },
  humorous: { adj: "irresistível", trigger: "Sem mais desculpas" },
  authority: { adj: "estratégico", trigger: "Decisão de quem opera no topo" },
};

const CHANNEL_HASHTAGS: Record<CopywriterInput["channel"], string[]> = {
  instagram: ["#NexusAffilIAte", "#IOAID", "#Afiliados"],
  whatsapp: [],
  facebook: ["#NexusAffilIAte", "#NegóciosDigitais"],
  email: [],
  landing: ["nexus-affil-ia-te", "ioaid-saas"],
};

function buildHeadline(input: CopywriterInput): string {
  const { adj } = TONE_TEMPLATES[input.tone];
  return `${input.outcome} — método ${adj} para ${input.audience}`;
}

function buildSubheadline(input: CopywriterInput): string {
  const { trigger } = TONE_TEMPLATES[input.tone];
  return `${trigger}. Vamos resolver ${input.pain} com ${input.productName}.`;
}

function buildHooks(input: CopywriterInput): string[] {
  return [
    `Você ainda está lidando com ${input.pain}? ${input.productName} foi feito para virar esse jogo.`,
    `Imagine ${input.outcome} acontecendo nas próximas semanas — ${input.productName} é o atalho.`,
    `Enquanto outros adiam, ${input.audience} que decidem ${input.outcome} já estão dentro do ${input.productName}.`,
  ];
}

function buildBody(input: CopywriterInput): string {
  const priceLine = input.priceLabel
    ? `Investimento: ${input.priceLabel}.`
    : "Investimento sob consulta direta.";

  return [
    `Para ${input.audience} que querem ${input.outcome}:`,
    `${input.productName} resolve ${input.pain} com método aplicável imediatamente.`,
    "Você sai do diagnóstico e entra em execução — sem rodeios, sem teoria solta.",
    priceLine,
    "Decisão: aplicar agora ou continuar onde está.",
  ].join("\n\n");
}

function buildCta(input: CopywriterInput): CopywriterOutput["cta"] {
  return {
    label:
      input.channel === "whatsapp"
        ? "Falar agora no WhatsApp"
        : input.channel === "email"
          ? "Garantir acesso"
          : "Quero meu acesso",
    link: input.affiliateLink ?? null,
  };
}

function detectRiskFlags(input: CopywriterInput): string[] {
  const flags: string[] = [];
  const promiseWords = /(garant(ido|ia)|sem esforço|cura|emagrec\w*\s+r[áa]pid\w*|enriquec\w*)/i;
  const sensitiveAudience = /(menores|crian[çc]as|adolescentes)/i;

  if (promiseWords.test(input.outcome) || promiseWords.test(input.pain)) {
    flags.push("Possível promessa absoluta — revisar conformidade publicitária.");
  }
  if (sensitiveAudience.test(input.audience)) {
    flags.push("Público sensível detectado — exigir revisão humana.");
  }
  if (!input.affiliateLink) {
    flags.push("Link de afiliado ausente — CTA será publicado sem destino rastreável.");
  }
  return flags;
}

function estimateQuality(input: CopywriterInput, output: CopywriterOutput): number {
  let score = 70;
  if (output.cta.link) score += 8;
  if (input.priceLabel) score += 4;
  if (output.riskFlags.length === 0) score += 10;
  if (output.hooks.every((hook) => hook.length >= 40 && hook.length <= 220)) score += 4;
  if (output.headline.length <= 80) score += 4;
  return Math.max(0, Math.min(100, score));
}

export const copywriterPersuasivoHandler: SkillHandler<CopywriterInput, CopywriterOutput> = {
  slug: "copywriter-persuasivo",
  title: "Copywriter Persuasivo",
  category: "content",
  version: "1.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): CopywriterInput => CopywriterInputSchema.parse(raw),
  execute: async (
    input: CopywriterInput,
    context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<CopywriterOutput>> => {
    const startedAt = Date.now();

    const output: CopywriterOutput = {
      headline: buildHeadline(input),
      subheadline: buildSubheadline(input),
      hooks: buildHooks(input),
      body: buildBody(input),
      cta: buildCta(input),
      hashtags: CHANNEL_HASHTAGS[input.channel],
      riskFlags: detectRiskFlags(input),
      qualityHint: 0,
    };

    output.qualityHint = estimateQuality(input, output);

    const hasCriticalRisk = output.riskFlags.some(
      (flag) => flag.includes("promessa absoluta") || flag.includes("Público sensível"),
    );
    const decision: SkillExecutionResult["decision"] =
      !context.autonomyAllowed || hasCriticalRisk ? "needs_review" : "auto";

    const latencyMs = Date.now() - startedAt;

    return {
      executionId: randomUUID(),
      skill: "copywriter-persuasivo",
      success: true,
      decision,
      latencyMs,
      output,
      warnings: output.riskFlags,
      message:
        decision === "auto"
          ? `Copy gerada pronta para publicação no canal ${input.channel}.`
          : `Copy gerada com bloqueio de policy — requer revisão humana antes de publicar.`,
    };
  },
};
