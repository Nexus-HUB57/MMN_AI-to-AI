/**
 * Agentic Persistence Schema
 *
 * Database schemas for persistent storage of agentic AI layer data.
 * Provides long-term storage for sessions, memories, actions, checkpoints, and queue jobs.
 *
 * @author MiniMax Agent (PHD Engineering)
 * @version 1.0.0
 * @date 2026-05-24
 */

import { mysqlTable, varchar, text, int, timestamp, json, index, uniqueIndex } from "drizzle-orm/mysql-core";

// ============================================================================
// Agentic Memories Table
// ============================================================================

export const agenticMemories = mysqlTable(
  "agentic_memories",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    sessionId: varchar("session_id", { length: 36 }).notNull().index("idx_memory_session"),
    memoryType: varchar("memory_type", { length: 20 }).notNull().index("idx_memory_type"),
    content: text("content").notNull(),
    embedding: json("embedding").notNull(), // Array of floats for vector search
    tags: json("tags").notNull(), // Array of strings
    importance: int("importance").default(50).index("idx_importance"),
    createdAt: timestamp("created_at").defaultCurrent().index("idx_created"),
    updatedAt: timestamp("updated_at").defaultCurrent(),
    expiresAt: timestamp("expires_at"),
  },
  (table) => [
    index("idx_memory_session_type").on(table.sessionId, table.memoryType),
    index("idx_memory_session_importance").on(table.sessionId, table.importance),
  ]
);

// ============================================================================
// Agentic Sessions Table
// ============================================================================

export const agenticSessions = mysqlTable(
  "agentic_sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    userId: int("user_id").index("idx_session_user"),
    goal: text("goal").notNull(),
    audience: text("audience").notNull(),
    offer: text("offer").notNull(),
    channel: varchar("channel", { length: 20 }).notNull().index("idx_channel"),
    status: varchar("status", { length: 20 }).notNull().index("idx_status"),
    plan: json("plan").notNull(), // Array of plan steps
    summary: text("summary"),
    qualityScore: int("quality_score").default(0),
    latestDraft: json("latest_draft"),
    lastActionId: varchar("last_action_id", { length: 36 }),
    checkpoints: int("checkpoints").default(0),
    createdAt: timestamp("created_at").defaultCurrent().index("idx_created"),
    updatedAt: timestamp("updated_at").defaultCurrent(),
    completedAt: timestamp("completed_at"),
    metadata: json("metadata"),
  },
  (table) => [
    index("idx_session_user_status").on(table.userId, table.status),
    index("idx_session_channel_status").on(table.channel, table.status),
  ]
);

// ============================================================================
// Agentic Actions Table
// ============================================================================

export const agenticActions = mysqlTable(
  "agentic_actions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    sessionId: varchar("session_id", { length: 36 }).notNull().index("idx_action_session"),
    actionKey: varchar("action_key", { length: 50 }).notNull(),
    toolName: varchar("tool_name", { length: 100 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().index("idx_action_status"),
    judgeVerdict: varchar("judge_verdict", { length: 20 }),
    score: int("score"),
    inputSummary: text("input_summary").notNull(),
    outputSummary: text("output_summary"),
    reasoning: text("reasoning"),
    latencyMs: int("latency_ms"),
    createdAt: timestamp("created_at").defaultCurrent().index("idx_action_created"),
    updatedAt: timestamp("updated_at").defaultCurrent(),
  },
  (table) => [
    index("idx_action_session_key").on(table.sessionId, table.actionKey),
  ]
);

// ============================================================================
// Agentic Checkpoints Table
// ============================================================================

export const agenticCheckpoints = mysqlTable(
  "agentic_checkpoints",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    sessionId: varchar("session_id", { length: 36 }).notNull().index("idx_checkpoint_session"),
    reason: varchar("reason", { length: 255 }).notNull(),
    snapshot: json("snapshot").notNull(),
    createdAt: timestamp("created_at").defaultCurrent().index("idx_checkpoint_created"),
  },
  (table) => []
);

// ============================================================================
// Agentic Queue Jobs Table
// ============================================================================

export const agenticQueueJobs = mysqlTable(
  "agentic_queue_jobs",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    sessionId: varchar("session_id", { length: 36 }).notNull().index("idx_job_session"),
    type: varchar("type", { length: 50 }).notNull(),
    status: varchar("status", { length: 20 }).notNull().index("idx_job_status"),
    createdAt: timestamp("created_at").defaultCurrent().index("idx_job_created"),
    updatedAt: timestamp("updated_at").defaultCurrent(),
    payload: json("payload").notNull(),
    result: json("result"),
    error: text("error"),
  },
  (table) => [
    index("idx_job_session_status").on(table.sessionId, table.status),
  ]
);

// ============================================================================
// Type Exports for Drizzle
// ============================================================================

export type AgenticMemory = typeof agenticMemories.$inferInsert;
export type AgenticSession = typeof agenticSessions.$inferInsert;
export type AgenticAction = typeof agenticActions.$inferInsert;
export type AgenticCheckpoint = typeof agenticCheckpoints.$inferInsert;
export type AgenticQueueJob = typeof agenticQueueJobs.$inferInsert;