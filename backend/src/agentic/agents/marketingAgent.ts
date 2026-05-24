import { BaseAgent, type AgentRunResult } from "./baseAgent";
import { agentAuditStore } from "../audit";
import { agentCheckpointer } from "../checkpointer";
import { llmJudge } from "../judge/llmJudge";
import { vectorMemory } from "../memory/vectorMemory";
import { agentRuntimeQueue } from "../queue";
import { getToolByChannel } from "../tools";
import type { AgenticSession, MarketingDraft } from "../types";

function reviseDraft(draft: MarketingDraft, feedback: string): MarketingDraft {
  return {
    ...draft,
    body: `${draft.body} Ajuste sugerido pelo judge: ${feedback}`,
    cta: draft.cta.includes("agora") ? draft.cta : `${draft.cta} agora.`,
    hashtags: draft.channel === "instagram"
      ? Array.from(new Set([...draft.hashtags, "#Oferta", "#Conversao"]))
      : [],
  };
}

export class MarketingAgent extends BaseAgent {
  constructor() {
    super("marketing-agent", "campaign-orchestrator");
  }

  async runCampaign(session: AgenticSession): Promise<AgentRunResult> {
    const queueJob = agentRuntimeQueue.enqueue(session.id, "marketing-campaign", {
      channel: session.channel,
      goal: session.goal,
    });

    let activeActionId: string | undefined;

    try {
      const briefAction = agentAuditStore.record({
        sessionId: session.id,
        actionKey: "brief",
        toolName: "briefing-engine",
        status: "running",
        inputSummary: `${session.goal} | ${session.audience} | ${session.offer}`,
      });
      activeActionId = briefAction.id;

      vectorMemory.remember({
        sessionId: session.id,
        memoryType: "brief",
        content: `Objetivo: ${session.goal}. Público: ${session.audience}. Oferta: ${session.offer}.`,
        tags: [session.channel, "campaign-brief"],
        importance: 75,
      });

      agentAuditStore.complete(briefAction.id, "Brief consolidado para execução", 100, "pass", "Brief mínimo criado.");
      activeActionId = undefined;
      agentCheckpointer.save(session.id, "brief-ready", {
        goal: session.goal,
        audience: session.audience,
        offer: session.offer,
        channel: session.channel,
      });

      agentRuntimeQueue.start(queueJob.id);

      const tool = getToolByChannel(session.channel);
      const draftAction = agentAuditStore.record({
        sessionId: session.id,
        actionKey: "draft",
        toolName: tool.name,
        status: "running",
        inputSummary: `Gerando copy para ${session.channel}`,
      });
      activeActionId = draftAction.id;

      const toolStartedAt = Date.now();
      const toolOutput = await tool.run({
        sessionId: session.id,
        goal: session.goal,
        audience: session.audience,
        offer: session.offer,
        brandVoice: String(session.metadata?.brandVoice || ""),
        constraints: Array.isArray(session.metadata?.constraints)
          ? (session.metadata?.constraints as string[])
          : [],
        cta: typeof session.metadata?.cta === "string" ? String(session.metadata?.cta) : undefined,
      });

      agentAuditStore.complete(
        draftAction.id,
        `Copy inicial criada com preview ${toolOutput.previewUrl}`,
        undefined,
        undefined,
        undefined,
        Date.now() - toolStartedAt,
      );
      activeActionId = undefined;

      const judgeAction = agentAuditStore.record({
        sessionId: session.id,
        actionKey: "judge",
        toolName: "llm-judge",
        status: "running",
        inputSummary: `Avaliando draft ${toolOutput.toolName}`,
      });
      activeActionId = judgeAction.id;

      let judge = await llmJudge.evaluate({
        channel: session.channel,
        goal: session.goal,
        audience: session.audience,
        offer: session.offer,
        constraints: Array.isArray(session.metadata?.constraints)
          ? (session.metadata?.constraints as string[])
          : [],
        draft: toolOutput.draft,
      });

      if (judge.verdict !== "pass") {
        toolOutput.draft = reviseDraft(toolOutput.draft, judge.reasoning);
        judge = await llmJudge.evaluate({
          channel: session.channel,
          goal: session.goal,
          audience: session.audience,
          offer: session.offer,
          constraints: Array.isArray(session.metadata?.constraints)
            ? (session.metadata?.constraints as string[])
            : [],
          draft: toolOutput.draft,
        });
      }

      vectorMemory.remember({
        sessionId: session.id,
        memoryType: "creative",
        content: `${toolOutput.draft.headline} ${toolOutput.draft.body}`,
        tags: [session.channel, "draft"],
        importance: judge.score,
      });

      vectorMemory.remember({
        sessionId: session.id,
        memoryType: "judge",
        content: `Judge verdict: ${judge.verdict}. Score: ${judge.score}. ${judge.reasoning}`,
        tags: ["judge", judge.verdict],
        importance: judge.score,
      });

      agentAuditStore.complete(
        judgeAction.id,
        `Veredito ${judge.verdict} com score ${judge.score}`,
        judge.score,
        judge.verdict,
        judge.reasoning,
      );
      activeActionId = undefined;

      const previewAction = agentAuditStore.record({
        sessionId: session.id,
        actionKey: "preview",
        toolName: `${tool.name}-preview`,
        status: "completed",
        inputSummary: "Gerando preview operacional",
      });

      agentAuditStore.update(previewAction.id, {
        outputSummary: `Preview disponível em ${toolOutput.previewUrl}`,
        score: judge.score,
        judgeVerdict: judge.verdict,
      });

      agentCheckpointer.save(session.id, "campaign-finished", {
        judge,
        previewUrl: toolOutput.previewUrl,
        draft: toolOutput.draft,
      });

      agentRuntimeQueue.complete(queueJob.id, {
        judgeScore: judge.score,
        previewUrl: toolOutput.previewUrl,
      });

      const now = new Date().toISOString();
      return {
        session: {
          ...session,
          status: judge.verdict === "fail" ? "failed" : "completed",
          summary: `Campanha ${session.channel} concluída com score ${judge.score}.`,
          latestDraft: toolOutput.draft,
          qualityScore: judge.score,
          lastActionId: judgeAction.id,
          checkpoints: agentCheckpointer.list(session.id).length,
          updatedAt: now,
          completedAt: now,
        },
        judge,
        toolOutput,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha inesperada na execução da campanha agentic.";
      if (activeActionId) {
        agentAuditStore.fail(activeActionId, message);
      }
      agentRuntimeQueue.fail(queueJob.id, message);
      vectorMemory.remember({
        sessionId: session.id,
        memoryType: "learning",
        content: `Falha na execução da campanha: ${message}`,
        tags: [session.channel, "error"],
        importance: 35,
      });
      agentCheckpointer.save(session.id, "campaign-failed", {
        error: message,
        sessionId: session.id,
        channel: session.channel,
      });
      throw error instanceof Error ? error : new Error(message);
    }
  }
}

export const marketingAgent = new MarketingAgent();
