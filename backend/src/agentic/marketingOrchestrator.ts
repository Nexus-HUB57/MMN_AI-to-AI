import { nanoid } from "nanoid";
import { agentAuditStore } from "./audit";
import { agentCheckpointer } from "./checkpointer";
import { buildMarketingPlan, marketingWorkflowGraph } from "./graph";
import { vectorMemory } from "./memory/vectorMemory";
import { agentRuntimeQueue } from "./queue";
import { marketingAgent } from "./agents/marketingAgent";
import { agenticRepository } from "./repository";
import { listAgenticTools } from "./tools";
import type {
  AgentActionAudit,
  AgentCheckpoint,
  AgentMemoryRecord,
  AgentQueueJob,
  AgenticChannel,
  AgenticSession,
  AgenticSessionDetail,
} from "./types";

function mergeById<T extends { id: string }>(primary: T[], secondary: T[], limit: number) {
  const merged = new Map<string, T>();
  for (const item of [...primary, ...secondary]) {
    if (!merged.has(item.id)) {
      merged.set(item.id, item);
    }
  }
  return Array.from(merged.values()).slice(0, limit);
}

function mergeQueueStats(memoryJobs: AgentQueueJob[], persistedJobs: AgentQueueJob[]) {
  const jobs = mergeById(memoryJobs, persistedJobs, Math.max(memoryJobs.length, persistedJobs.length, 200));
  return {
    queued: jobs.filter((job) => job.status === "queued").length,
    running: jobs.filter((job) => job.status === "running").length,
    completed: jobs.filter((job) => job.status === "completed").length,
    failed: jobs.filter((job) => job.status === "failed").length,
    total: jobs.length,
  };
}

export class MarketingOrchestrator {
  private sessions = new Map<string, AgenticSession>();

  async createSession(input: {
    userId?: number;
    goal: string;
    audience: string;
    offer: string;
    channel: AgenticChannel;
    brandVoice?: string;
    constraints?: string[];
    cta?: string;
  }): Promise<AgenticSession> {
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

    const persisted: AgenticSession = {
      ...session,
      checkpoints: agentCheckpointer.list(session.id).length,
    };

    this.sessions.set(session.id, persisted);
    await agenticRepository.upsertSession(persisted);
    return persisted;
  }

  async runSession(sessionId: string) {
    const memorySession = this.sessions.get(sessionId);
    const session = memorySession || (await agenticRepository.getSession(sessionId));
    if (!session) {
      throw new Error(`Sessão agentic ${sessionId} não encontrada.`);
    }

    const queuedSession: AgenticSession = {
      ...session,
      status: "queued",
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(sessionId, queuedSession);
    await agenticRepository.upsertSession(queuedSession);

    const runningSession: AgenticSession = {
      ...queuedSession,
      status: "running",
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(sessionId, runningSession);
    await agenticRepository.upsertSession(runningSession);

    try {
      const result = await marketingAgent.runCampaign(runningSession);
      this.sessions.set(sessionId, result.session);
      await agenticRepository.upsertSession(result.session);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha inesperada na execução da sessão agentic.";
      const failedAt = new Date().toISOString();
      const failedSession: AgenticSession = {
        ...runningSession,
        status: "failed",
        summary: `Sessão interrompida por erro: ${message}`,
        updatedAt: failedAt,
        completedAt: failedAt,
        checkpoints: agentCheckpointer.list(sessionId).length,
      };
      agentCheckpointer.save(sessionId, "session-failed", { error: message, sessionId });
      this.sessions.set(sessionId, failedSession);
      await agenticRepository.upsertSession(failedSession);
      throw error;
    }
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
    const session = await this.createSession(input);
    return this.runSession(session.id);
  }

  async getSession(sessionId: string): Promise<AgenticSessionDetail | null> {
    const session = this.sessions.get(sessionId) || (await agenticRepository.getSession(sessionId));
    if (!session) return null;

    const memoryActions = agentAuditStore.listBySession(sessionId, 20);
    const persistedActions = await agenticRepository.listActionsBySession(sessionId, 20);
    const memoryRecords = vectorMemory.listBySession(sessionId, 10);
    const persistedMemories = await agenticRepository.listMemoriesBySession(sessionId, 10);
    const memoryCheckpoints = agentCheckpointer.list(sessionId);
    const persistedCheckpoints = await agenticRepository.listCheckpointsBySession(sessionId, 10);
    const memoryQueueJobs = agentRuntimeQueue.listBySession(sessionId, 10);
    const persistedQueueJobs = await agenticRepository.listQueueJobsBySession(sessionId, 10);

    return {
      ...session,
      actions: mergeById<AgentActionAudit>(memoryActions, persistedActions, 20),
      memories: mergeById<AgentMemoryRecord>(memoryRecords, persistedMemories, 10),
      checkpointsList: mergeById<AgentCheckpoint>(memoryCheckpoints, persistedCheckpoints, 10),
      queueJobs: mergeById<AgentQueueJob>(memoryQueueJobs, persistedQueueJobs, 10),
    };
  }

  async listSessions(limit = 10) {
    const memorySessions = Array.from(this.sessions.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const persistedSessions = await agenticRepository.listSessions(limit);

    return mergeById<AgenticSession>(memorySessions, persistedSessions, limit).sort(
      (a, b) => b.createdAt.localeCompare(a.createdAt),
    );
  }

  async getMonitor(limit = 5) {
    const sessions = await this.listSessions(limit);
    const recentActions = mergeById<AgentActionAudit>(
      agentAuditStore.listRecent(limit * 3),
      await agenticRepository.listRecentActions(limit * 3),
      limit * 3,
    );
    const recentMemories = mergeById<AgentMemoryRecord>(
      vectorMemory.listRecent(limit * 3),
      await agenticRepository.listRecentMemories(limit * 3),
      limit * 3,
    );
    const recentCheckpoints = mergeById<AgentCheckpoint>(
      agentCheckpointer.listRecent(limit * 3),
      await agenticRepository.listRecentCheckpoints(limit * 3),
      limit * 3,
    );
    const recentQueueJobs = mergeById<AgentQueueJob>(
      agentRuntimeQueue.listRecent(limit * 5),
      await agenticRepository.listRecentQueueJobs(limit * 5),
      limit * 5,
    );

    return {
      graph: marketingWorkflowGraph,
      tools: listAgenticTools(),
      queue: mergeQueueStats(agentRuntimeQueue.listRecent(200), recentQueueJobs),
      sessions,
      recentActions,
      recentMemories,
      recentCheckpoints,
      recentQueueJobs,
      readiness: {
        judge: "llm-as-judge-ready",
        memory: "vector-memory-ready",
        audit: "action-audit-ready",
        storage: agenticRepository.getStorageMode(),
        channels: ["instagram", "whatsapp"],
      },
    };
  }

  async searchMemories(query: string, sessionId?: string, limit = 5) {
    const vectorResults = vectorMemory.search(sessionId, query, limit);
    const persistedResults = await agenticRepository.searchMemories(query, sessionId, limit);

    const merged = mergeById<AgentMemoryRecord & { similarity?: number }>(vectorResults, persistedResults, limit)
      .map((item) => ({
        ...item,
        similarity: typeof item.similarity === "number" ? item.similarity : undefined,
      }))
      .sort((a, b) => {
        const simA = typeof a.similarity === "number" ? a.similarity : -1;
        const simB = typeof b.similarity === "number" ? b.similarity : -1;
        if (simB === simA) return (b.importance || 0) - (a.importance || 0);
        return simB - simA;
      });

    return merged.slice(0, limit);
  }
}

export const marketingOrchestrator = new MarketingOrchestrator();
