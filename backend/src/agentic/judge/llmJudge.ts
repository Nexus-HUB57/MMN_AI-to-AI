import { invokeLLM } from "../../services/llm-v2";
import type { JudgeResult, MarketingDraft, AgenticChannel } from "../types";

function heuristicJudge(channel: AgenticChannel, draft: MarketingDraft, goal: string, constraints: string[] = []): JudgeResult {
  const rubric = {
    clarity: draft.body.length > 80 ? 24 : 16,
    cta: draft.cta.length > 6 ? 22 : 12,
    channelFit: channel === "instagram" ? (draft.hashtags.length >= 3 ? 22 : 14) : draft.hashtags.length === 0 ? 22 : 14,
    offerFit: draft.body.toLowerCase().includes(goal.toLowerCase().split(" ")[0]?.toLowerCase() || "") ? 18 : 12,
    constraints: constraints.every((constraint) => !constraint || draft.body.toLowerCase().includes(constraint.toLowerCase()) || draft.headline.toLowerCase().includes(constraint.toLowerCase())) ? 12 : 8,
  };

  const score = Math.max(0, Math.min(100, Object.values(rubric).reduce((sum, value) => sum + value, 0)));
  const verdict = score >= 78 ? "pass" : score >= 58 ? "revise" : "fail";
  const reasoning = verdict === "pass"
    ? "Copy clara, com CTA visível e aderente ao canal escolhido."
    : verdict === "revise"
      ? "A copy é promissora, mas precisa de mais especificidade de oferta ou melhor adaptação ao canal."
      : "A copy ainda está fraca em clareza e intenção comercial.";

  return { score, verdict, reasoning, rubric };
}

export class LLMJudge {
  async evaluate(input: {
    channel: AgenticChannel;
    goal: string;
    audience: string;
    offer: string;
    constraints?: string[];
    draft: MarketingDraft;
  }): Promise<JudgeResult> {
    if (!process.env.OPENAI_API_KEY) {
      return heuristicJudge(input.channel, input.draft, input.goal, input.constraints);
    }

    try {
      const response = await invokeLLM({
        modelType: "gpt-4.1-mini",
        fallbackToGeneric: true,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Você é um LLM-as-Judge para campanhas de marketing. Avalie clareza, CTA, aderência ao canal, fit com a oferta e respeito às restrições. Responda JSON com score (0-100), verdict (pass|revise|fail), reasoning e rubric.",
          },
          {
            role: "user",
            content: JSON.stringify(input),
          },
        ],
      });

      const parsed = JSON.parse(response.content);
      return {
        score: Number(parsed.score) || 0,
        verdict: parsed.verdict || "revise",
        reasoning: parsed.reasoning || "Sem justificativa retornada pelo juiz.",
        rubric: parsed.rubric || {},
      };
    } catch (error) {
      console.warn("[Agentic][Judge] Fallback heurístico acionado:", error);
      return heuristicJudge(input.channel, input.draft, input.goal, input.constraints);
    }
  }
}

export const llmJudge = new LLMJudge();
