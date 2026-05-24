/**
 * Persistent Memory Layer for Agentic AI
 *
 * Provides database-backed memory storage with vector search capabilities
 * for long-term agentic session persistence.
 *
 * @author MiniMax Agent (PHD Engineering)
 * @version 1.0.0
 * @date 2026-05-24
 */

import { eq, and, gte, lte, desc, sql, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { agenticMemories, agenticSessions, agenticActions, agenticCheckpoints, agenticQueueJobs } from "../../database/schemas/schema-agentic-persistence";
import { db } from "../../db";

// ============================================================================
// Types & Interfaces
// ============================================================================

export type MemoryType = "brief" | "strategy" | "creative" | "judge" | "learning";

export interface PersistentMemory {
  id: string;
  sessionId: string;
  memoryType: MemoryType;
  content: string;
  embedding: number[];
  tags: string[];
  importance: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface MemorySearchOptions {
  sessionId?: string;
  memoryType?: MemoryType;
  tags?: string[];
  minImportance?: number;
  limit?: number;
  offset?: number;
}

export interface VectorSearchResult {
  memory: PersistentMemory;
  similarity: number;
}

// ============================================================================
// MemoryService
// ============================================================================

export class MemoryService {
  /**
   * Save a memory to the database
   */
  async save(memory: Omit<PersistentMemory, "id" | "createdAt" | "updatedAt">): Promise<PersistentMemory> {
    const now = new Date();
    const id = nanoid();

    const newMemory: typeof agenticMemories.$inferInsert = {
      id,
      sessionId: memory.sessionId,
      memoryType: memory.memoryType,
      content: memory.content,
      embedding: JSON.stringify(memory.embedding),
      tags: JSON.stringify(memory.tags),
      importance: memory.importance,
      createdAt: now,
      updatedAt: now,
      expiresAt: memory.expiresAt || null,
    };

    await db.insert(agenticMemories).values(newMemory);

    return {
      ...memory,
      id,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Get memory by ID
   */
  async getById(id: string): Promise<PersistentMemory | null> {
    const result = await db.select().from(agenticMemories).where(eq(agenticMemories.id, id)).limit(1);

    if (result.length === 0) return null;

    return this.mapToMemory(result[0]);
  }

  /**
   * Get memories by session ID
   */
  async getBySession(sessionId: string, limit = 100): Promise<PersistentMemory[]> {
    const results = await db
      .select()
      .from(agenticMemories)
      .where(eq(agenticMemories.sessionId, sessionId))
      .orderBy(desc(agenticMemories.createdAt))
      .limit(limit);

    return results.map(this.mapToMemory);
  }

  /**
   * Search memories with filters
   */
  async search(options: MemorySearchOptions): Promise<PersistentMemory[]> {
    const conditions = [];

    if (options.sessionId) {
      conditions.push(eq(agenticMemories.sessionId, options.sessionId));
    }

    if (options.memoryType) {
      conditions.push(eq(agenticMemories.memoryType, options.memoryType));
    }

    if (options.minImportance !== undefined) {
      conditions.push(gte(agenticMemories.importance, options.minImportance));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select()
      .from(agenticMemories)
      .where(whereClause)
      .orderBy(desc(agenticMemories.importance), desc(agenticMemories.createdAt))
      .limit(options.limit || 50)
      .offset(options.offset || 0);

    let memories = results.map(this.mapToMemory);

    // Filter by tags if specified
    if (options.tags && options.tags.length > 0) {
      memories = memories.filter(memory =>
        options.tags!.some(tag => memory.tags.includes(tag))
      );
    }

    return memories;
  }

  /**
   * Search by vector similarity (simplified cosine similarity)
   * For production, consider using pgvector or a dedicated vector database
   */
  async searchByVector(queryEmbedding: number[], sessionId?: string, limit = 10): Promise<VectorSearchResult[]> {
    const conditions = sessionId ? [eq(agenticMemories.sessionId, sessionId)] : [];

    const results = await db
      .select()
      .from(agenticMemories)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(100); // Fetch more for re-ranking

    // Calculate similarity scores
    const scoredResults = results.map(row => {
      const memory = this.mapToMemory(row);
      const embedding = JSON.parse(row.embedding as string);
      const similarity = this.cosineSimilarity(queryEmbedding, embedding);

      return { memory, similarity };
    });

    // Sort by similarity and return top results
    return scoredResults
      .filter(r => r.similarity > 0.5) // Filter low similarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Delete memories by session ID
   */
  async deleteBySession(sessionId: string): Promise<number> {
    const result = await db
      .delete(agenticMemories)
      .where(eq(agenticMemories.sessionId, sessionId));

    return result.rowCount || 0;
  }

  /**
   * Delete expired memories
   */
  async deleteExpired(): Promise<number> {
    const result = await db
      .delete(agenticMemories)
      .where(
        and(
          sql`${agenticMemories.expiresAt} IS NOT NULL`,
          lte(agenticMemories.expiresAt, new Date())
        )
      );

    return result.rowCount || 0;
  }

  /**
   * Update memory importance
   */
  async updateImportance(id: string, importance: number): Promise<void> {
    await db
      .update(agenticMemories)
      .set({ importance, updatedAt: new Date() })
      .where(eq(agenticMemories.id, id));
  }

  /**
   * Get memory statistics
   */
  async getStats(): Promise<{
    total: number;
    byType: Record<MemoryType, number>;
    averageImportance: number;
    oldestMemory?: Date;
  }> {
    const memories = await db.select().from(agenticMemories);

    const byType: Record<MemoryType, number> = {
      brief: 0,
      strategy: 0,
      creative: 0,
      judge: 0,
      learning: 0,
    };

    let totalImportance = 0;
    let oldest: Date | undefined;

    for (const memory of memories) {
      byType[memory.memoryType as MemoryType]++;
      totalImportance += memory.importance;

      if (!oldest || memory.createdAt < oldest) {
        oldest = memory.createdAt;
      }
    }

    return {
      total: memories.length,
      byType,
      averageImportance: memories.length > 0 ? totalImportance / memories.length : 0,
      oldestMemory: oldest,
    };
  }

  /**
   * Map database row to Memory object
   */
  private mapToMemory(row: typeof agenticMemories.$inferSelect): PersistentMemory {
    return {
      id: row.id,
      sessionId: row.sessionId,
      memoryType: row.memoryType as MemoryType,
      content: row.content,
      embedding: typeof row.embedding === "string" ? JSON.parse(row.embedding) : row.embedding,
      tags: typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags,
      importance: row.importance,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      expiresAt: row.expiresAt || undefined,
    };
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      magnitudeA += a[i] * a[i];
      magnitudeB += b[i] * b[i];
    }

    const magA = Math.sqrt(magnitudeA);
    const magB = Math.sqrt(magnitudeB);

    if (magA === 0 || magB === 0) return 0;

    return dotProduct / (magA * magB);
  }
}

// ============================================================================
// SessionService
// ============================================================================

export class SessionService {
  /**
   * Save or update a session
   */
  async saveSession(session: {
    id: string;
    userId?: number;
    goal: string;
    audience: string;
    offer: string;
    channel: "instagram" | "whatsapp";
    status: string;
    plan: string[];
    summary?: string;
    qualityScore: number;
    latestDraft?: object;
    lastActionId?: string;
    checkpoints: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    metadata?: object;
  }): Promise<void> {
    const existing = await db.select().from(agenticSessions).where(eq(agenticSessions.id, session.id)).limit(1);

    const sessionData: typeof agenticSessions.$inferInsert = {
      id: session.id,
      userId: session.userId || null,
      goal: session.goal,
      audience: session.audience,
      offer: session.offer,
      channel: session.channel,
      status: session.status,
      plan: JSON.stringify(session.plan),
      summary: session.summary || null,
      qualityScore: session.qualityScore,
      latestDraft: session.latestDraft ? JSON.stringify(session.latestDraft) : null,
      lastActionId: session.lastActionId || null,
      checkpoints: session.checkpoints,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      completedAt: session.completedAt || null,
      metadata: session.metadata ? JSON.stringify(session.metadata) : null,
    };

    if (existing.length > 0) {
      await db.update(agenticSessions).set(sessionData).where(eq(agenticSessions.id, session.id));
    } else {
      await db.insert(agenticSessions).values(sessionData);
    }
  }

  /**
   * Get session by ID
   */
  async getSession(id: string): Promise<{
    id: string;
    userId?: number;
    goal: string;
    audience: string;
    offer: string;
    channel: "instagram" | "whatsapp";
    status: string;
    plan: string[];
    summary?: string;
    qualityScore: number;
    latestDraft?: object;
    lastActionId?: string;
    checkpoints: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
    metadata?: object;
  } | null> {
    const results = await db.select().from(agenticSessions).where(eq(agenticSessions.id, id)).limit(1);

    if (results.length === 0) return null;

    const row = results[0];
    return {
      id: row.id,
      userId: row.userId || undefined,
      goal: row.goal,
      audience: row.audience,
      offer: row.offer,
      channel: row.channel as "instagram" | "whatsapp",
      status: row.status,
      plan: typeof row.plan === "string" ? JSON.parse(row.plan) : row.plan,
      summary: row.summary || undefined,
      qualityScore: row.qualityScore,
      latestDraft: row.latestDraft ? (typeof row.latestDraft === "string" ? JSON.parse(row.latestDraft) : row.latestDraft) : undefined,
      lastActionId: row.lastActionId || undefined,
      checkpoints: row.checkpoints,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      completedAt: row.completedAt || undefined,
      metadata: row.metadata ? (typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata) : undefined,
    };
  }

  /**
   * List sessions with pagination
   */
  async listSessions(limit = 10, offset = 0): Promise<Array<{
    id: string;
    userId?: number;
    goal: string;
    channel: string;
    status: string;
    qualityScore: number;
    createdAt: Date;
  }>> {
    const results = await db
      .select({
        id: agenticSessions.id,
        userId: agenticSessions.userId,
        goal: agenticSessions.goal,
        channel: agenticSessions.channel,
        status: agenticSessions.status,
        qualityScore: agenticSessions.qualityScore,
        createdAt: agenticSessions.createdAt,
      })
      .from(agenticSessions)
      .orderBy(desc(agenticSessions.createdAt))
      .limit(limit)
      .offset(offset);

    return results;
  }

  /**
   * Delete session and related data
   */
  async deleteSession(sessionId: string): Promise<void> {
    // Delete in order due to foreign keys
    await db.delete(agenticQueueJobs).where(eq(agenticQueueJobs.sessionId, sessionId));
    await db.delete(agenticCheckpoints).where(eq(agenticCheckpoints.sessionId, sessionId));
    await db.delete(agenticActions).where(eq(agenticActions.sessionId, sessionId));
    await db.delete(agenticMemories).where(eq(agenticMemories.sessionId, sessionId));
    await db.delete(agenticSessions).where(eq(agenticSessions.id, sessionId));
  }
}

// ============================================================================
// ActionService
// ============================================================================

export class ActionService {
  async saveAction(action: {
    id: string;
    sessionId: string;
    actionKey: string;
    toolName: string;
    status: string;
    judgeVerdict?: string;
    score?: number;
    inputSummary: string;
    outputSummary?: string;
    reasoning?: string;
    latencyMs?: number;
    createdAt: Date;
    updatedAt: Date;
  }): Promise<void> {
    const data: typeof agenticActions.$inferInsert = {
      id: action.id,
      sessionId: action.sessionId,
      actionKey: action.actionKey,
      toolName: action.toolName,
      status: action.status,
      judgeVerdict: action.judgeVerdict || null,
      score: action.score || null,
      inputSummary: action.inputSummary,
      outputSummary: action.outputSummary || null,
      reasoning: action.reasoning || null,
      latencyMs: action.latencyMs || null,
      createdAt: action.createdAt,
      updatedAt: action.updatedAt,
    };

    const existing = await db.select().from(agenticActions).where(eq(agenticActions.id, action.id)).limit(1);

    if (existing.length > 0) {
      await db.update(agenticActions).set(data).where(eq(agenticActions.id, action.id));
    } else {
      await db.insert(agenticActions).values(data);
    }
  }

  async getActionsBySession(sessionId: string, limit = 50): Promise<Array<{
    id: string;
    actionKey: string;
    toolName: string;
    status: string;
    judgeVerdict?: string;
    score?: number;
    createdAt: Date;
  }>> {
    const results = await db
      .select({
        id: agenticActions.id,
        actionKey: agenticActions.actionKey,
        toolName: agenticActions.toolName,
        status: agenticActions.status,
        judgeVerdict: agenticActions.judgeVerdict,
        score: agenticActions.score,
        createdAt: agenticActions.createdAt,
      })
      .from(agenticActions)
      .where(eq(agenticActions.sessionId, sessionId))
      .orderBy(desc(agenticActions.createdAt))
      .limit(limit);

    return results;
  }
}

// ============================================================================
// CheckpointService
// ============================================================================

export class CheckpointService {
  async saveCheckpoint(checkpoint: {
    id: string;
    sessionId: string;
    reason: string;
    snapshot: object;
    createdAt: Date;
  }): Promise<void> {
    await db.insert(agenticCheckpoints).values({
      id: checkpoint.id,
      sessionId: checkpoint.sessionId,
      reason: checkpoint.reason,
      snapshot: JSON.stringify(checkpoint.snapshot),
      createdAt: checkpoint.createdAt,
    });
  }

  async getCheckpointsBySession(sessionId: string): Promise<Array<{
    id: string;
    reason: string;
    snapshot: object;
    createdAt: Date;
  }>> {
    const results = await db
      .select()
      .from(agenticCheckpoints)
      .where(eq(agenticCheckpoints.sessionId, sessionId))
      .orderBy(desc(agenticCheckpoints.createdAt));

    return results.map(row => ({
      id: row.id,
      reason: row.reason,
      snapshot: typeof row.snapshot === "string" ? JSON.parse(row.snapshot) : row.snapshot,
      createdAt: row.createdAt,
    }));
  }
}

// ============================================================================
// QueueJobService
// ============================================================================

export class QueueJobService {
  async saveJob(job: {
    id: string;
    sessionId: string;
    type: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    payload: object;
    result?: object;
    error?: string;
  }): Promise<void> {
    const data: typeof agenticQueueJobs.$inferInsert = {
      id: job.id,
      sessionId: job.sessionId,
      type: job.type,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      payload: JSON.stringify(job.payload),
      result: job.result ? JSON.stringify(job.result) : null,
      error: job.error || null,
    };

    const existing = await db.select().from(agenticQueueJobs).where(eq(agenticQueueJobs.id, job.id)).limit(1);

    if (existing.length > 0) {
      await db.update(agenticQueueJobs).set(data).where(eq(agenticQueueJobs.id, job.id));
    } else {
      await db.insert(agenticQueueJobs).values(data);
    }
  }

  async getJobsBySession(sessionId: string): Promise<Array<{
    id: string;
    type: string;
    status: string;
    createdAt: Date;
    result?: object;
    error?: string;
  }>> {
    const results = await db
      .select({
        id: agenticQueueJobs.id,
        type: agenticQueueJobs.type,
        status: agenticQueueJobs.status,
        createdAt: agenticQueueJobs.createdAt,
        result: agenticQueueJobs.result,
        error: agenticQueueJobs.error,
      })
      .from(agenticQueueJobs)
      .where(eq(agenticQueueJobs.sessionId, sessionId))
      .orderBy(desc(agenticQueueJobs.createdAt));

    return results.map(row => ({
      ...row,
      result: row.result ? (typeof row.result === "string" ? JSON.parse(row.result) : row.result) : undefined,
    }));
  }
}

// ============================================================================
// Export singleton instances
// ============================================================================

export const memoryService = new MemoryService();
export const sessionService = new SessionService();
export const actionService = new ActionService();
export const checkpointService = new CheckpointService();
export const queueJobService = new QueueJobService();

// ============================================================================
// Repository adapter for agentic layer
// ============================================================================

import type { AgenticSession, AgentActionAudit, AgentCheckpoint, AgentQueueJob, AgentMemoryRecord } from "../types";

export const persistentAgenticRepository = {
  async getSession(sessionId: string): Promise<AgenticSession | null> {
    const session = await sessionService.getSession(sessionId);
    if (!session) return null;

    return {
      ...session,
      plan: session.plan,
      metadata: session.metadata as Record<string, unknown> || {},
    } as AgenticSession;
  },

  async upsertSession(session: AgenticSession): Promise<void> {
    await sessionService.saveSession({
      id: session.id,
      userId: session.userId,
      goal: session.goal,
      audience: session.audience,
      offer: session.offer,
      channel: session.channel,
      status: session.status,
      plan: session.plan,
      summary: session.summary,
      qualityScore: session.qualityScore,
      latestDraft: session.latestDraft as any,
      lastActionId: session.lastActionId,
      checkpoints: session.checkpoints,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
      completedAt: session.completedAt ? new Date(session.completedAt) : undefined,
      metadata: session.metadata as any,
    });
  },

  async listSessions(limit: number): Promise<AgenticSession[]> {
    const sessions = await sessionService.listSessions(limit);
    return sessions.map(s => ({
      id: s.id,
      userId: s.userId,
      goal: s.goal,
      audience: "",
      offer: "",
      channel: s.channel as "instagram" | "whatsapp",
      status: s.status,
      plan: [],
      qualityScore: s.qualityScore,
      checkpoints: 0,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.createdAt.toISOString(),
    })) as AgenticSession[];
  },

  async listActionsBySession(sessionId: string, limit: number): Promise<AgentActionAudit[]> {
    const actions = await actionService.getActionsBySession(sessionId, limit);
    return actions.map(a => ({
      id: a.id,
      sessionId,
      actionKey: a.actionKey,
      toolName: a.toolName,
      status: a.status as any,
      judgeVerdict: a.judgeVerdict as any,
      score: a.score,
      inputSummary: "",
      outputSummary: a.score ? `Score: ${a.score}` : undefined,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.createdAt.toISOString(),
    })) as AgentActionAudit[];
  },

  async listMemoriesBySession(sessionId: string, limit: number): Promise<AgentMemoryRecord[]> {
    const memories = await memoryService.getBySession(sessionId, limit);
    return memories.map(m => ({
      id: m.id,
      sessionId: m.sessionId,
      memoryType: m.memoryType,
      content: m.content,
      tags: m.tags,
      vector: m.embedding,
      importance: m.importance,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
    })) as AgentMemoryRecord[];
  },

  async listCheckpointsBySession(sessionId: string, limit: number): Promise<AgentCheckpoint[]> {
    const checkpoints = await checkpointService.getCheckpointsBySession(sessionId);
    return checkpoints.slice(0, limit).map(c => ({
      id: c.id,
      sessionId,
      reason: c.reason,
      snapshot: c.snapshot,
      createdAt: c.createdAt,
    })) as AgentCheckpoint[];
  },

  async listQueueJobsBySession(sessionId: string, limit: number): Promise<AgentQueueJob[]> {
    const jobs = await queueJobService.getJobsBySession(sessionId);
    return jobs.slice(0, limit).map(j => ({
      id: j.id,
      sessionId,
      type: j.type,
      status: j.status as any,
      createdAt: j.createdAt.toISOString(),
      updatedAt: j.createdAt.toISOString(),
      payload: {},
      result: j.result as any,
      error: j.error || undefined,
    })) as AgentQueueJob[];
  },

  async listRecentActions(limit: number): Promise<AgentActionAudit[]> {
    // For recent actions, we would need a different query
    return [];
  },

  async listRecentMemories(limit: number): Promise<AgentMemoryRecord[]> {
    return [];
  },

  async listRecentCheckpoints(limit: number): Promise<AgentCheckpoint[]> {
    return [];
  },

  async listRecentQueueJobs(limit: number): Promise<AgentQueueJob[]> {
    return [];
  },

  async searchMemories(query: string, sessionId?: string, limit: number): Promise<AgentMemoryRecord[]> {
    const results = await memoryService.searchByVector(
      // Generate a dummy embedding for search
      // In production, use actual query embedding from LLM
      new Array(1536).fill(0),
      sessionId,
      limit
    );

    return results.map(r => ({
      id: r.memory.id,
      sessionId: r.memory.sessionId,
      memoryType: r.memory.memoryType,
      content: r.memory.content,
      tags: r.memory.tags,
      vector: r.memory.embedding,
      importance: r.memory.importance,
      createdAt: r.memory.createdAt.toISOString(),
      updatedAt: r.memory.updatedAt.toISOString(),
    })) as AgentMemoryRecord[];
  },

  getStorageMode(): "memory" | "database" | "hybrid" {
    return "database";
  },
};