import { and, desc, eq, like } from "drizzle-orm";
import { getDb } from "../database/schemas/db";
import { agentActionsAudit, agentMemories, agentSessions } from "../database/schemas/schema";
import type { AgentActionAudit, AgentMemoryRecord, AgenticSession } from "./types";

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
    channel: row.channel,
    status: row.status,
    plan: row.plan || [],
    latestDraft: (row.latestDraft as AgenticSession["latestDraft"]) || undefined,
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
    status: row.status,
    judgeVerdict: row.judgeVerdict || undefined,
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
    memoryType: row.memoryType,
    content: row.content,
    tags: row.tags || [],
    vector: row.vector || [],
    importance: row.importance || 0,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export class AgenticRepository {
  async upsertSession(session: AgenticSession): Promise<void> {
    const db = await getDb();
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
        latestDraft: session.latestDraft || null,
        summary: session.summary || null,
        qualityScore: session.qualityScore,
        lastActionId: session.lastActionId || null,
        checkpointCount: session.checkpoints,
        metadata: session.metadata || null,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        completedAt: session.completedAt ? new Date(session.completedAt) : null,
      }).onDuplicateKeyUpdate({
        set: {
          userId: session.userId,
          goal: session.goal,
          audience: session.audience,
          offer: session.offer,
          channel: session.channel,
          status: session.status,
          plan: session.plan,
          latestDraft: session.latestDraft || null,
          summary: session.summary || null,
          qualityScore: session.qualityScore,
          lastActionId: session.lastActionId || null,
          checkpointCount: session.checkpoints,
          metadata: session.metadata || null,
          updatedAt: new Date(session.updatedAt),
          completedAt: session.completedAt ? new Date(session.completedAt) : null,
        },
      });
    } catch (error) {
      console.error("[AgenticRepository] Failed to upsert session:", error);
    }
  }

  async upsertAction(action: AgentActionAudit): Promise<void> {
    const db = await getDb();
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
      }).onDuplicateKeyUpdate({
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
      console.error("[AgenticRepository] Failed to upsert action:", error);
    }
  }

  async upsertMemory(memory: AgentMemoryRecord): Promise<void> {
    const db = await getDb();
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
      }).onDuplicateKeyUpdate({
        set: {
          content: memory.content,
          tags: memory.tags,
          vector: memory.vector,
          importance: memory.importance,
          updatedAt: new Date(memory.updatedAt),
        },
      });
    } catch (error) {
      console.error("[AgenticRepository] Failed to upsert memory:", error);
    }
  }

  async getSession(sessionId: string): Promise<AgenticSession | null> {
    const db = await getDb();
    if (!db) return null;

    try {
      const rows = await db.select().from(agentSessions).where(eq(agentSessions.id, sessionId)).limit(1);
      return rows[0] ? mapSession(rows[0]) : null;
    } catch (error) {
      console.error("[AgenticRepository] Failed to fetch session:", error);
      return null;
    }
  }

  async listSessions(limit = 10): Promise<AgenticSession[]> {
    const db = await getDb();
    if (!db) return [];

    try {
      const rows = await db.select().from(agentSessions).orderBy(desc(agentSessions.createdAt)).limit(limit);
      return rows.map(mapSession);
    } catch (error) {
      console.error("[AgenticRepository] Failed to list sessions:", error);
      return [];
    }
  }

  async listActionsBySession(sessionId: string, limit = 20): Promise<AgentActionAudit[]> {
    const db = await getDb();
    if (!db) return [];

    try {
      const rows = await db.select().from(agentActionsAudit).where(eq(agentActionsAudit.sessionId, sessionId)).orderBy(desc(agentActionsAudit.createdAt)).limit(limit);
      return rows.map(mapAction);
    } catch (error) {
      console.error("[AgenticRepository] Failed to list session actions:", error);
      return [];
    }
  }

  async listRecentActions(limit = 20): Promise<AgentActionAudit[]> {
    const db = await getDb();
    if (!db) return [];

    try {
      const rows = await db.select().from(agentActionsAudit).orderBy(desc(agentActionsAudit.createdAt)).limit(limit);
      return rows.map(mapAction);
    } catch (error) {
      console.error("[AgenticRepository] Failed to list actions:", error);
      return [];
    }
  }

  async listMemoriesBySession(sessionId: string, limit = 20): Promise<AgentMemoryRecord[]> {
    const db = await getDb();
    if (!db) return [];

    try {
      const rows = await db.select().from(agentMemories).where(eq(agentMemories.sessionId, sessionId)).orderBy(desc(agentMemories.createdAt)).limit(limit);
      return rows.map(mapMemory);
    } catch (error) {
      console.error("[AgenticRepository] Failed to list session memories:", error);
      return [];
    }
  }

  async listRecentMemories(limit = 20): Promise<AgentMemoryRecord[]> {
    const db = await getDb();
    if (!db) return [];

    try {
      const rows = await db.select().from(agentMemories).orderBy(desc(agentMemories.createdAt)).limit(limit);
      return rows.map(mapMemory);
    } catch (error) {
      console.error("[AgenticRepository] Failed to list memories:", error);
      return [];
    }
  }

  async searchMemories(query: string, sessionId?: string, limit = 5): Promise<AgentMemoryRecord[]> {
    const db = await getDb();
    if (!db) return [];

    try {
      const pattern = `%${query}%`;
      const rows = sessionId
        ? await db.select().from(agentMemories).where(and(eq(agentMemories.sessionId, sessionId), like(agentMemories.content, pattern))).orderBy(desc(agentMemories.importance), desc(agentMemories.createdAt)).limit(limit)
        : await db.select().from(agentMemories).where(like(agentMemories.content, pattern)).orderBy(desc(agentMemories.importance), desc(agentMemories.createdAt)).limit(limit);
      return rows.map(mapMemory);
    } catch (error) {
      console.error("[AgenticRepository] Failed to search memories:", error);
      return [];
    }
  }
}

export const agenticRepository = new AgenticRepository();
