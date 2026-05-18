import { nanoid } from "nanoid";
import { agentAuditStore } from "./audit";
import { agentCheckpointer } from "./checkpointer";
import { buildMarketingPlan, marketingWorkflowGraph } from "./graph";
import { vectorMemory } from "./memory/vectorMemory";
import { agentRuntimeQueue } from "./queue";
import { marketingAgent } from "./agents/marketingAgent";
import { listAgenticTools } from "./tools";
import type { AgenticChannel, AgenticSession } from "./types";

export class MarketingOrchestrator {
  private sessions = new Map<string, AgenticSession>();

  createSession(input: {
    userId?: number;
    goal: string;
    audience: string;
    offer: string;
    channel: AgenticChannel;
    brandVoice?: string;
    constraints?: string[];
    cta?: string;
  }): AgenticSession {
    const now = new Date().toISOString();
    const session: AgenticSession = {
      id: nanoid(),
      userId: input.userId,
      goal: input.goal,
      audience: input.audience,
      offer: input.offer,
      channel: input.channel,
      status: "planned",
      plan: buildMarketingPlan(input.channel),
      qualityScore: 0,
      checkpoints: 0,
      createdAt: now,
      updatedAt: now,
      metadata: {
        brandVoice: input.brandVoice,
        constraints: input.constraints || [],
        cta: input.cta,
      },
    };

    this.sessions.set(session.id, session);
    agentCheckpointer.save(session.id, "session-created", session as unknown as Record<string, unknown>);
    this.sessions.set(session.id, {
      ...session,
      checkpoints: agentCheckpointer.list(session.id).length,
    });
    return this.sessions.get(session.id)!;
  }

  async runSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Sessão agentic ${sessionId} não encontrada.`);
    }

    const queuedSession: AgenticSession = {
      ...session,
      status: "queued",
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(sessionId, queuedSession);

    const runningSession: AgenticSession = {
      ...queuedSession,
      status: "running",
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(sessionId, runningSession);

    const result = await marketingAgent.runCampaign(runningSession);
    this.sessions.set(sessionId, result.session);
    return result;
  }

  async launch(input: {
    userId?: number;
    goal: string;
    audience: string;
    offer: string;
    channel: AgenticChannel;
    brandVoice?: string;
    constraints?: string[];
    cta?: string;
  }) {
    const session = this.createSession(input);
    return this.runSession(session.id);
  }

  getSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    return {
      ...session,
      actions: agentAuditStore.listBySession(sessionId, 20),
      memories: vectorMemory.listBySession(sessionId, 10),
      checkpoints: agentCheckpointer.list(sessionId),
      queueJobs: agentRuntimeQueue.listBySession(sessionId, 10),
    };
  }

  listSessions(limit = 10) {
    return Array.from(this.sessions.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  getMonitor(limit = 5) {
    return {
      graph: marketingWorkflowGraph,
      tools: listAgenticTools(),
      queue: agentRuntimeQueue.getStats(),
      sessions: this.listSessions(limit),
      recentActions: agentAuditStore.listRecent(limit * 3),
      recentMemories: vectorMemory.listRecent(limit * 3),
      readiness: {
        judge: "llm-as-judge-ready",
        memory: "vector-memory-ready",
        audit: "action-audit-ready",
        channels: ["instagram", "whatsapp"],
      },
    };
  }

  searchMemories(query: string, sessionId?: string, limit = 5) {
    return vectorMemory.search(sessionId, query, limit);
  }
}

export const marketingOrchestrator = new MarketingOrchestrator();
