import { randomUUID } from "node:crypto";
import { z } from "zod";

import { invokeLLM } from "../../services/llm-v2";
import { recordJudgeEvaluation } from "../runtimeTelemetry";
import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";
import { ReasoningStep } from "./agenticCore";

/**
 * Handler operacional · Judge Revisor v2 (Agentic)
 * -----------------------------------------------------------------------------
 * Agora suporta Reasoning Trace e Feedback Loop.
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
  reasoningTrace?: ReasoningStep[];
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
  version: "2.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): JudgeInput => JudgeInputSchema.parse(raw),
  execute: async (
    input: JudgeInput,
    context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<JudgeOutput>> => {
    const startedAt = Date.now();
    const artifact = input.artifact;

    const reasoningTrace: ReasoningStep[] = [
      {
        thought: "Iniciando auditoria de artefato.",
      }
    ];

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

    reasoningTrace.push({
      thought: `Pontuação heurística calculada: ${score}/100. Veredito: ${verdict}.`,
    });

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

    let finalScore = score;
    let finalVerdict = verdict;
    let finalReasoning = reasoning;
    let llmUsed = false;

    if (process.env.OPENAI_API_KEY) {
      reasoningTrace.push({
        thought: "Elevando auditoria para LLM-as-Judge para segunda opinião.",
      });
      try {
        const response = await invokeLLM({
          modelType: "gpt-4.1-mini",
          fallbackToGeneric: true,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "Você é um LLM-as-Judge para conteúdo de marketing de afiliados. Avalie clareza, intenção comercial, encaixe de canal, compliance publicitário e operacionalidade. Responda JSON: { score: 0-100, verdict: pass|revise|fail, reasoning: string }.",
            },
            {
              role: "user",
              content: JSON.stringify({ artifact, goal: input.goal, audience: input.audience, constraints: input.constraints }),
            },
          ],
        });
        const parsed = JSON.parse(response.content) as {
          score?: number;
          verdict?: JudgeOutput["verdict"];
          reasoning?: string;
        };
        if (parsed && typeof parsed.score === "number") {
          const llmScore = Math.max(0, Math.min(100, parsed.score));
          finalScore = Math.round(score * 0.6 + llmScore * 0.4);
          finalVerdict = verdictFor(finalScore);
          if (parsed.reasoning) {
            finalReasoning = `${reasoning} | LLM: ${parsed.reasoning}`;
          }
          llmUsed = true;
          reasoningTrace.push({
            thought: `Feedback do LLM integrado. Nova pontuação: ${finalScore}.`,
            observation: parsed.reasoning
          });
        }
      } catch (error) {
        console.warn("[judgeRevisor] Fallback heurístico — LLM indisponível:", error);
      }
    }

    recordJudgeEvaluation(finalScore);

    // Record Metrics
    await context.metrics.record({
      timestamp: new Date(),
      metricName: 'judge_score',
      value: finalScore,
      unit: 'points',
      skillSlug: 'judge-revisor'
    });

    const decision: SkillExecutionResult["decision"] =
      !context.autonomyAllowed || finalVerdict === "fail"
        ? "needs_review"
        : finalVerdict === "revise"
          ? "needs_review"
          : "auto";

    return {
      executionId: randomUUID(),
      skill: "judge-revisor",
      success: true,
      decision,
      latencyMs: Date.now() - startedAt,
      output: {
        score: finalScore,
        verdict: finalVerdict,
        rubric,
        reasoning: finalReasoning,
        suggestions,
        reasoningTrace,
      },
      warnings: suggestions,
      message: `Judge ${finalVerdict.toUpperCase()} (score ${finalScore})${llmUsed ? " · LLM ativo" : " · heurístico"}.`,
    };
  },
};
