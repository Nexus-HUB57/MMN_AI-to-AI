import { index, integer, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const agentSessions = pgTable(
  "agent_sessions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: integer("userId"),
    goal: text("goal").notNull(),
    audience: text("audience").notNull(),
    offer: text("offer").notNull(),
    channel: varchar("channel", { length: 20 }).notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    plan: jsonb("plan").$type<string[]>().notNull(),
    latestDraft: jsonb("latestDraft").$type<Record<string, unknown> | null>(),
    summary: text("summary"),
    qualityScore: integer("qualityScore").notNull().default(0),
    lastActionId: varchar("lastActionId", { length: 64 }),
    checkpointCount: integer("checkpointCount").notNull().default(0),
    metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
  },
  (table) => ({
    userStatusIdx: index("agent_sessions_user_status_idx").on(table.userId, table.status),
    channelStatusIdx: index("agent_sessions_channel_status_idx").on(table.channel, table.status),
  }),
);

export const agentActionsAudit = pgTable(
  "agent_actions_audit",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    sessionId: varchar("sessionId", { length: 64 }).notNull(),
    actionKey: varchar("actionKey", { length: 64 }).notNull(),
    toolName: varchar("toolName", { length: 128 }).notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    judgeVerdict: varchar("judgeVerdict", { length: 10 }),
    score: integer("score").notNull().default(0),
    inputSummary: text("inputSummary").notNull(),
    outputSummary: text("outputSummary"),
    reasoning: text("reasoning"),
    latencyMs: integer("latencyMs"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    sessionStatusIdx: index("agent_actions_session_status_idx").on(table.sessionId, table.status),
    toolIdx: index("agent_actions_tool_idx").on(table.toolName),
  }),
);

export const agentMemories = pgTable(
  "agent_memories",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    sessionId: varchar("sessionId", { length: 64 }).notNull(),
    memoryType: varchar("memoryType", { length: 20 }).notNull(),
    content: text("content").notNull(),
    tags: jsonb("tags").$type<string[]>().notNull(),
    vector: jsonb("vector").$type<number[]>().notNull(),
    importance: integer("importance").notNull().default(50),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    sessionImportanceIdx: index("agent_memories_session_importance_idx").on(table.sessionId, table.importance),
    typeIdx: index("agent_memories_type_idx").on(table.memoryType),
  }),
);

export const agentCheckpoints = pgTable(
  "agent_checkpoints",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    sessionId: varchar("sessionId", { length: 64 }).notNull(),
    reason: varchar("reason", { length: 128 }).notNull(),
    snapshot: jsonb("snapshot").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    sessionCreatedIdx: index("agent_checkpoints_session_created_idx").on(table.sessionId, table.createdAt),
    reasonIdx: index("agent_checkpoints_reason_idx").on(table.reason),
  }),
);

export const agentQueueJobs = pgTable(
  "agent_queue_jobs",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    sessionId: varchar("sessionId", { length: 64 }).notNull(),
    type: varchar("type", { length: 128 }).notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    result: jsonb("result").$type<Record<string, unknown> | null>(),
    error: text("error"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    sessionStatusIdx: index("agent_queue_jobs_session_status_idx").on(table.sessionId, table.status),
    typeIdx: index("agent_queue_jobs_type_idx").on(table.type),
  }),
);

export type AgentSession = typeof agentSessions.$inferSelect;
export type InsertAgentSession = typeof agentSessions.$inferInsert;
export type AgentActionsAudit = typeof agentActionsAudit.$inferSelect;
export type InsertAgentActionsAudit = typeof agentActionsAudit.$inferInsert;
export type AgentMemory = typeof agentMemories.$inferSelect;
export type InsertAgentMemory = typeof agentMemories.$inferInsert;
export type AgentCheckpointRow = typeof agentCheckpoints.$inferSelect;
export type InsertAgentCheckpoint = typeof agentCheckpoints.$inferInsert;
export type AgentQueueJobRow = typeof agentQueueJobs.$inferSelect;
export type InsertAgentQueueJob = typeof agentQueueJobs.$inferInsert;
