import { randomUUID } from "node:crypto";
import { z } from "zod";

import { recordJudgeEvaluation } from "../runtimeTelemetry";
import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";

/**
 * Handler operacional · Judge Revisor (LLM-as-Judge generalista)
 * -----------------------------------------------------------------------------
 * Avalia saídas de qualquer handler downstream com base em uma rubrica
 * heurística determinística (sem LLM) ou, se OPENAI_API_KEY estiver disponível,
 * pode ser elevado a usar o LLM. Esta versão usa rubrica heurística para
 * garantir 100% de disponibilidade offline e auditabilidade.
 *
 * Rubrica (0-100):
 *  - clarity        20pts → headline curta, body com parágrafos.
 *  - intent         20pts → presença de CTA explícito + link operacional.
 *  - channelFit     20pts → respeito aos requisitos do canal (hashtags em IG,
 *                            ausência em WhatsApp/email).
 *  - compliance     20pts → ausência de risk flags críticos.
 *  - operationalFit 20pts → estrutura compatível com auto-publisher (campos
 *                            obrigatórios presentes).
 *
 * Decisão:
 *  - pass    → score ≥ 78
 *  - revise  → 55 ≤ score < 78
 *  - fail    → score < 55
 *
 * Side-effect:
 *  - chama `recordJudgeEvaluation(score)` que alimenta o snapshot de
 *    telemetria com `judgeAccuracyPct` real.
 */

const ContentArtifactSchema = z.object({
  kind: z
    .enum(["copywriter-output", "publisher-item", "generic-content"])
    .default("generic-content"),
  headline: z.string().min(1).max(220),
  body: z.string().min(1).max(4000),
  cta: z
    .object({
      label: z.string().min(1).max(80),
      link: z.string().url().nullable().optional(),
    })
    .optional(),
  hashtags: z.array(z.string().min(1).max(40)).max(15).default([]),
  riskFlags: z.array(z.string().min(1).max(180)).max(10).default([]),
  channel: z
    .enum(["instagram", "whatsapp", "facebook", "email", "landing", "tiktok", "google"])
    .optional(),
});

const JudgeInputSchema = z.object({
  artifact: ContentArtifactSchema,
  goal: z.string().min(2).max(240).optional(),
  audience: z.string().min(2).max(240).optional(),
  constraints: z.array(z.string().min(1).max(160)).max(10).default([]),
});

export type JudgeInput = z.infer<typeof JudgeInputSchema>;
type ContentArtifact = z.infer<typeof ContentArtifactSchema>;

export interface JudgeRubric {
  clarity: number;
  intent: number;
  channelFit: number;
  compliance: number;
  operationalFit: number;
}

export interface JudgeOutput {
  score: number;
  verdict: "pass" | "revise" | "fail";
  rubric: JudgeRubric;
  reasoning: string;
  suggestions: string[];
}

const CRITICAL_RISK = [
  /promessa absoluta/i,
  /p[uú]blico sens[ií]vel/i,
  /menores/i,
  /cura/i,
];

function scoreClarity(artifact: ContentArtifact): { score: number; note?: string } {
  const headlineLen = artifact.headline.length;
  const paragraphs = artifact.body.split(/\n\n+/).length;
  let score = 20;
  let note: string | undefined;
  if (headlineLen > 90) {
    score -= 6;
    note = "Headline acima de 90 caracteres reduz legibilidade.";
  }
  if (paragraphs < 2 && artifact.body.length > 280) {
    score -= 6;
    note = "Body longo sem parágrafos prejudica leitura.";
  }
  return { score: Math.max(0, score), note };
}

function scoreIntent(artifact: ContentArtifact): { score: number; note?: string } {
  if (!artifact.cta) return { score: 6, note: "Sem CTA explícito." };
  let score = 12;
  if (artifact.cta.label.length >= 4) score += 4;
  if (artifact.cta.link) score += 4;
  return {
    score: Math.min(20, score),
    note: artifact.cta.link ? undefined : "CTA sem link rastreável reduz operacionalidade.",
  };
}

function scoreChannelFit(artifact: ContentArtifact): { score: number; note?: string } {
  const channel = artifact.channel;
  if (!channel) return { score: 12, note: "Canal não declarado — pontuação parcial." };
  const hashtags = artifact.hashtags.length;
  if (channel === "instagram") {
    if (hashtags >= 3) return { score: 20 };
    return { score: 12, note: "Instagram: recomendado ≥3 hashtags." };
  }
  if (channel === "whatsapp" || channel === "email") {
    if (hashtags === 0) return { score: 20 };
    return { score: 12, note: `${channel}: hashtags reduzem profissionalismo.` };
  }
  if (channel === "facebook" || channel === "landing") {
    if (hashtags <= 5) return { score: 18 };
    return { score: 12, note: `${channel}: excesso de hashtags.` };
  }
  return { score: 14 };
}

function scoreCompliance(artifact: ContentArtifact): { score: number; note?: string } {
  const critical = artifact.riskFlags.filter((flag) =>
    CRITICAL_RISK.some((pattern) => pattern.test(flag)),
  );
  if (critical.length > 0) {
    return {
      score: 4,
      note: `Risk flags críticos detectados (${critical.length}).`,
    };
  }
  if (artifact.riskFlags.length > 0) {
    return { score: 14, note: "Risk flags não-críticos presentes — revisar." };
  }
  return { score: 20 };
}

function scoreOperationalFit(artifact: ContentArtifact): {
  score: number;
  note?: string;
} {
  let score = 14;
  if (artifact.cta?.link) score += 3;
  if (artifact.channel) score += 3;
  return { score: Math.min(20, score) };
}

function verdictFor(score: number): JudgeOutput["verdict"] {
  if (score >= 78) return "pass";
  if (score >= 55) return "revise";
  return "fail";
}

export const judgeRevisorHandler: SkillHandler<JudgeInput, JudgeOutput> = {
  slug: "judge-revisor",
  title: "LLM-as-Judge · Revisor",
  category: "decision",
  version: "1.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): JudgeInput => JudgeInputSchema.parse(raw),
  execute: async (
    input: JudgeInput,
    context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<JudgeOutput>> => {
    const startedAt = Date.now();
    const artifact = input.artifact;

    const clarity = scoreClarity(artifact);
    const intent = scoreIntent(artifact);
    const channelFit = scoreChannelFit(artifact);
    const compliance = scoreCompliance(artifact);
    const operational = scoreOperationalFit(artifact);

    const rubric: JudgeRubric = {
      clarity: clarity.score,
      intent: intent.score,
      channelFit: channelFit.score,
      compliance: compliance.score,
      operationalFit: operational.score,
    };

    const score = Math.max(
      0,
      Math.min(
        100,
        rubric.clarity +
          rubric.intent +
          rubric.channelFit +
          rubric.compliance +
          rubric.operationalFit,
      ),
    );
    const verdict = verdictFor(score);

    const suggestions = [
      clarity.note,
      intent.note,
      channelFit.note,
      compliance.note,
      operational.note,
    ].filter((value): value is string => Boolean(value));

    const reasoning =
      verdict === "pass"
        ? "Artefato aderente: clareza, intenção, encaixe de canal e compliance dentro do esperado."
        : verdict === "revise"
          ? "Artefato promissor, mas com lacunas operacionais ou de canal — recomendar ajuste antes de publicar."
          : "Artefato reprovado: risco de compliance e/ou ausência de elementos operacionais essenciais.";

    // Registra na telemetria para alimentar Autonomy Score real (judgeAccuracyPct).
    recordJudgeEvaluation(score);

    const decision: SkillExecutionResult["decision"] =
      !context.autonomyAllowed || verdict === "fail"
        ? "needs_review"
        : verdict === "revise"
          ? "needs_review"
          : "auto";

    return {
      executionId: randomUUID(),
      skill: "judge-revisor",
      success: true,
      decision,
      latencyMs: Date.now() - startedAt,
      output: {
        score,
        verdict,
        rubric,
        reasoning,
        suggestions,
      },
      warnings: suggestions,
      message: `Judge ${verdict.toUpperCase()} (score ${score}).`,
    };
  },
};
