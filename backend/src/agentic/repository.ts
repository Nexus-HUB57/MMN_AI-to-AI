import { and, desc, eq, like } from "drizzle-orm";
import { getDb } from "../database/schemas/db";
import {
  agentActionsAudit,
  agentCheckpoints,
  agentMemories,
  agentQueueJobs,
  agentSessions,
} from "../database/schemas/schema";
import type {
  AgentActionAudit,
  AgentCheckpoint,
  AgentMemoryRecord,
  AgentQueueJob,
  AgenticSession,
} from "./types";

function toIso(value: unknown) {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return new Date(String(value)).toISOString();
}

function mapSession(row: typeof agentSessions.$inferSelect): AgenticSession {
  return {
    id: row.id,
    userId: row.userId ?? undefined,
    goal: row.goal,
    audience: row.audience,
    offer: row.offer,
    channel: row.channel as AgenticSession["channel"],
    status: row.status as AgenticSession["status"],
    plan: row.plan || [],
    latestDraft: (row.latestDraft as unknown as AgenticSession["latestDraft"]) || undefined,
    summary: row.summary || undefined,
    qualityScore: row.qualityScore || 0,
    lastActionId: row.lastActionId || undefined,
    checkpoints: row.checkpointCount || 0,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    completedAt: row.completedAt ? toIso(row.completedAt) : undefined,
    metadata: (row.metadata as Record<string, unknown>) || undefined,
  };
}

function mapAction(row: typeof agentActionsAudit.$inferSelect): AgentActionAudit {
  return {
    id: row.id,
    sessionId: row.sessionId,
    actionKey: row.actionKey,
    toolName: row.toolName,
    status: row.status as AgentActionAudit["status"],
    judgeVerdict: (row.judgeVerdict || undefined) as AgentActionAudit["judgeVerdict"],
    score: row.score || undefined,
    inputSummary: row.inputSummary,
    outputSummary: row.outputSummary || undefined,
    reasoning: row.reasoning || undefined,
    latencyMs: row.latencyMs || undefined,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapMemory(row: typeof agentMemories.$inferSelect): AgentMemoryRecord {
  return {
    id: row.id,
    sessionId: row.sessionId,
    memoryType: row.memoryType as AgentMemoryRecord["memoryType"],
    content: row.content,
    tags: row.tags || [],
    vector: row.vector || [],
    importance: row.importance || 0,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

function mapCheckpoint(row: typeof agentCheckpoints.$inferSelect): AgentCheckpoint {
  return {
    id: row.id,
    sessionId: row.sessionId,
    reason: row.reason,
    snapshot: (row.snapshot as Record<string, unknown>) || {},
    createdAt: toIso(row.createdAt),
  };
}

function mapQueueJob(row: typeof agentQueueJobs.$inferSelect): AgentQueueJob {
  return {
    id: row.id,
    sessionId: row.sessionId,
    type: row.type as AgentQueueJob["type"],
    status: row.status as AgentQueueJob["status"],
    payload: (row.payload as Record<string, unknown>) || {},
    result: (row.result as Record<string, unknown>) || undefined,
    error: row.error || undefined,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export class AgenticRepository {
  private unavailableUntil = 0;
  private lastWarning = { signature: "", at: 0 };

  getStorageMode() {
    if (!process.env.DATABASE_URL) return "memory-fallback-mode";
    if (Date.now() < this.unavailableUntil) return "pg-unreachable-fallback-mode";
    return "pg-persistence-enabled";
  }

  private async getDbOrNull() {
    if (!process.env.DATABASE_URL) return null;
    if (Date.now() < this.unavailableUntil) return null;

    try {
      return await getDb();
    } catch (error) {
      this.handleError("falha ao inicializar conexão com PostgreSQL", error);
      return null;
    }
  }

  private handleError(action: string, error: unknown) {
    const message = this.extractErrorMessage(error);

    if (this.isConnectivityError(error)) {
      this.unavailableUntil = Date.now() + 30_000;
      const signature = `${action}:${message}`;
      if (this.lastWarning.signature !== signature || Date.now() - this.lastWarning.at > 30_000) {
        this.lastWarning = { signature, at: Date.now() };
        console.warn(`[AgenticRepository] ${action}: PostgreSQL indisponível, fallback em memória por 30s (${message})`);
      }
      return;
    }

    console.error(`[AgenticRepository] ${action}:`, error);
  }

  private extractErrorMessage(error: unknown) {
    const record = error as { message?: string; cause?: { message?: string } };
    return String(record?.cause?.message || record?.message || "erro desconhecido");
  }

  private isConnectivityError(error: unknown) {
    const record = error as { code?: string; message?: string; cause?: { code?: string; message?: string } };
    const code = String(record?.code || record?.cause?.code || "");
    const message = String(record?.message || record?.cause?.message || "");
    return ["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "PROTOCOL_CONNECTION_LOST"].includes(code)
      || /ECONNREFUSED|connect|timeout|connection lost/i.test(message);
  }
  async upsertSession(session: AgenticSession): Promise<void> {
    const db = await this.getDbOrNull();
    if (!db) return;

    try {
      await db.insert(agentSessions).values({
        id: session.id,
        userId: session.userId,
        goal: session.goal,
        audience: session.audience,
        offer: session.offer,
        channel: session.channel,
        status: session.status,
        plan: session.plan,
        latestDraft: (session.latestDraft || null) as any,
        summary: session.summary || null,
        qualityScore: session.qualityScore,
        lastActionId: session.lastActionId || null,
        checkpointCount: session.checkpoints,
        metadata: (session.metadata || null) as any,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        completedAt: session.completedAt ? new Date(session.completedAt) : null,
      }).onConflictDoUpdate({
        target: agentSessions.id,
        set: {
          userId: session.userId,
          goal: session.goal,
          audience: session.audience,
          offer: session.offer,
          channel: session.channel,
          status: session.status,
          plan: session.plan,
          latestDraft: (session.latestDraft || null) as any,
          summary: session.summary || null,
          qualityScore: session.qualityScore,
          lastActionId: session.lastActionId || null,
          checkpointCount: session.checkpoints,
          metadata: (session.metadata || null) as any,
          updatedAt: new Date(session.updatedAt),
          completedAt: session.completedAt ? new Date(session.completedAt) : null,
        },
      });
    } catch (error) {
      this.handleError("falha ao persistir sessão agentic", error);
    }
  }

  async upsertAction(action: AgentActionAudit): Promise<void> {
    const db = await this.getDbOrNull();
    if (!db) return;

    try {
      await db.insert(agentActionsAudit).values({
        id: action.id,
        sessionId: action.sessionId,
        actionKey: action.actionKey,
        toolName: action.toolName,
        status: action.status,
        judgeVerdict: action.judgeVerdict || null,
        score: action.score || 0,
        inputSummary: action.inputSummary,
        outputSummary: action.outputSummary || null,
        reasoning: action.reasoning || null,
        latencyMs: action.latencyMs || null,
        createdAt: new Date(action.createdAt),
        updatedAt: new Date(action.updatedAt),
      }).onConflictDoUpdate({
        target: agentActionsAudit.id,
        set: {
          status: action.status,
          judgeVerdict: action.judgeVerdict || null,
          score: action.score || 0,
          outputSummary: action.outputSummary || null,
          reasoning: action.reasoning || null,
          latencyMs: action.latencyMs || null,
          updatedAt: new Date(action.updatedAt),
        },
      });
    } catch (error) {
      this.handleError("falha ao persistir ação auditada", error);
    }
  }

  async upsertMemory(memory: AgentMemoryRecord): Promise<void> {
    const db = await this.getDbOrNull();
    if (!db) return;

    try {
      await db.insert(agentMemories).values({
        id: memory.id,
        sessionId: memory.sessionId,
        memoryType: memory.memoryType,
        content: memory.content,
        tags: memory.tags,
        vector: memory.vector,
        importance: memory.importance,
        createdAt: new Date(memory.createdAt),
        updatedAt: new Date(memory.updatedAt),
      }).onConflictDoUpdate({
        target: agentMemories.id,
        set: {
          content: memory.content,
          tags: memory.tags,
          vector: memory.vector,
          importance: memory.importance,
          updatedAt: new Date(memory.updatedAt),
        },
      });
    } catch (error) {
      this.handleError("falha ao persistir memória vetorial", error);
    }
  }

  async insertCheckpoint(checkpoint: AgentCheckpoint): Promise<void> {
    const db = await this.getDbOrNull();
    if (!db) return;

    try {
      await db.insert(agentCheckpoints).values({
        id: checkpoint.id,
        sessionId: checkpoint.sessionId,
        reason: checkpoint.reason,
        snapshot: checkpoint.snapshot,
        createdAt: new Date(checkpoint.createdAt),
      }).onConflictDoUpdate({
        target: agentCheckpoints.id,
        set: {
          reason: checkpoint.reason,
          snapshot: checkpoint.snapshot,
        },
      });
    } catch (error) {
      this.handleError("falha ao persistir checkpoint", error);
    }
  }

  async upsertQueueJob(job: AgentQueueJob): Promise<void> {
    const db = await this.getDbOrNull();
    if (!db) return;

    try {
      await db.insert(agentQueueJobs).values({
        id: job.id,
        sessionId: job.sessionId,
        type: job.type,
        status: job.status,
        payload: job.payload,
        result: (job.result || null) as any,
        error: job.error || null,
        createdAt: new Date(job.createdAt),
        updatedAt: new Date(job.updatedAt),
      }).onConflictDoUpdate({
        target: agentQueueJobs.id,
        set: {
          status: job.status,
          payload: job.payload,
          result: (job.result || null) as any,
          error: job.error || null,
          updatedAt: new Date(job.updatedAt),
        },
      });
    } catch (error) {
      this.handleError("falha ao persistir queue job", error);
    }
  }

  async getSession(sessionId: string): Promise<AgenticSession | null> {
    const db = await this.getDbOrNull();
    if (!db) return null;

    try {
      const rows = await db.select().from(agentSessions).where(eq(agentSessions.id, sessionId)).limit(1);
      return rows[0] ? mapSession(rows[0]) : null;
    } catch (error) {
      this.handleError("falha ao buscar sessão agentic", error);
      return null;
    }
  }

  async listSessions(limit = 10): Promise<AgenticSession[]> {
    const db = await this.getDbOrNull();
    if (!db) return [];

    try {
      const rows = await db.select().from(agentSessions).orderBy(desc(agentSessions.createdAt)).limit(limit);
      return rows.map(mapSession);
    } catch (error) {
      this.handleError("falha ao listar sessões agentic", error);
      return [];
    }
  }

  async listActionsBySession(sessionId: string, limit = 20): Promise<AgentActionAudit[]> {
    const db = await this.getDbOrNull();
    if (!db) return [];

    try {
      const rows = await db
        .select()
        .from(agentActionsAudit)
        .where(eq(agentActionsAudit.sessionId, sessionId))
        .orderBy(desc(agentActionsAudit.createdAt))
        .limit(limit);
      return rows.map(mapAction);
    } catch (error) {
      this.handleError("falha ao listar ações da sessão", error);
      return [];
    }
  }

  async listRecentActions(limit = 20): Promise<AgentActionAudit[]> {
    const db = await this.getDbOrNull();
    if (!db) return [];

    try {
      const rows = await db.select().from(agentActionsAudit).orderBy(desc(agentActionsAudit.createdAt)).limit(limit);
      return rows.map(mapAction);
    } catch (error) {
      this.handleError("falha ao listar ações recentes", error);
      return [];
    }
  }

  async listMemoriesBySession(sessionId: string, limit = 20): Promise<AgentMemoryRecord[]> {
    const db = await this.getDbOrNull();
    if (!db) return [];

    try {
      const rows = await db
        .select()
        .from(agentMemories)
        .where(eq(agentMemories.sessionId, sessionId))
        .orderBy(desc(agentMemories.createdAt))
        .limit(limit);
      return rows.map(mapMemory);
    } catch (error) {
      this.handleError("falha ao listar memórias da sessão", error);
      return [];
    }
  }

  async listRecentMemories(limit = 20): Promise<AgentMemoryRecord[]> {
    const db = await this.getDbOrNull();
    if (!db) return [];

    try {
      const rows = await db.select().from(agentMemories).orderBy(desc(agentMemories.createdAt)).limit(limit);
      return rows.map(mapMemory);
    } catch (error) {
      this.handleError("falha ao listar memórias recentes", error);
      return [];
    }
  }

  async searchMemories(query: string, sessionId?: string, limit = 5): Promise<AgentMemoryRecord[]> {
    const db = await this.getDbOrNull();
    if (!db) return [];

    try {
      const pattern = `%${query}%`;
      const rows = sessionId
        ? await db
            .select()
            .from(agentMemories)
            .where(and(eq(agentMemories.sessionId, sessionId), like(agentMemories.content, pattern)))
            .orderBy(desc(agentMemories.importance), desc(agentMemories.createdAt))
            .limit(limit)
        : await db
            .select()
            .from(agentMemories)
            .where(like(agentMemories.content, pattern))
            .orderBy(desc(agentMemories.importance), desc(agentMemories.createdAt))
            .limit(limit);
      return rows.map(mapMemory);
    } catch (error) {
      this.handleError("falha ao pesquisar memórias", error);
      return [];
    }
  }

  async listCheckpointsBySession(sessionId: string, limit = 20): Promise<AgentCheckpoint[]> {
    const db = await this.getDbOrNull();
    if (!db) return [];

    try {
      const rows = await db
        .select()
        .from(agentCheckpoints)
        .where(eq(agentCheckpoints.sessionId, sessionId))
        .orderBy(desc(agentCheckpoints.createdAt))
        .limit(limit);
      return rows.map(mapCheckpoint);
    } catch (error) {
      this.handleError("falha ao listar checkpoints da sessão", error);
      return [];
    }
  }

  async listRecentCheckpoints(limit = 50): Promise<AgentCheckpoint[]> {
    const db = await this.getDbOrNull();
    if (!db) return [];

    try {
      const rows = await db.select().from(agentCheckpoints).orderBy(desc(agentCheckpoints.createdAt)).limit(limit);
      return rows.map(mapCheckpoint);
    } catch (error) {
      this.handleError("falha ao listar checkpoints recentes", error);
      return [];
    }
  }

  async listQueueJobsBySession(sessionId: string, limit = 20): Promise<AgentQueueJob[]> {
    const db = await this.getDbOrNull();
    if (!db) return [];

    try {
      const rows = await db
        .select()
        .from(agentQueueJobs)
        .where(eq(agentQueueJobs.sessionId, sessionId))
        .orderBy(desc(agentQueueJobs.createdAt))
        .limit(limit);
      return rows.map(mapQueueJob);
    } catch (error) {
      this.handleError("falha ao listar queue jobs da sessão", error);
      return [];
    }
  }

  async listRecentQueueJobs(limit = 50): Promise<AgentQueueJob[]> {
    const db = await this.getDbOrNull();
    if (!db) return [];

    try {
      const rows = await db.select().from(agentQueueJobs).orderBy(desc(agentQueueJobs.createdAt)).limit(limit);
      return rows.map(mapQueueJob);
    } catch (error) {
      this.handleError("falha ao listar queue jobs recentes", error);
      return [];
    }
  }
}

export const agenticRepository = new AgenticRepository();
