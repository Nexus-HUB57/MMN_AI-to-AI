import { index, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const agentSessions = mysqlTable(
  "agent_sessions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: int("userId"),
    goal: text("goal").notNull(),
    audience: text("audience").notNull(),
    offer: text("offer").notNull(),
    channel: mysqlEnum("channel", ["instagram", "whatsapp"]).notNull(),
    status: mysqlEnum("status", ["planned", "queued", "running", "completed", "failed"]).notNull(),
    plan: json("plan").$type<string[]>().notNull(),
    latestDraft: json("latestDraft").$type<Record<string, unknown> | null>(),
    summary: text("summary"),
    qualityScore: int("qualityScore").notNull().default(0),
    lastActionId: varchar("lastActionId", { length: 64 }),
    checkpointCount: int("checkpointCount").notNull().default(0),
    metadata: json("metadata").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    completedAt: timestamp("completedAt"),
  },
  (table) => ({
    userStatusIdx: index("agent_sessions_user_status_idx").on(table.userId, table.status),
    channelStatusIdx: index("agent_sessions_channel_status_idx").on(table.channel, table.status),
  }),
);

export const agentActionsAudit = mysqlTable(
  "agent_actions_audit",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    sessionId: varchar("sessionId", { length: 64 }).notNull(),
    actionKey: varchar("actionKey", { length: 64 }).notNull(),
    toolName: varchar("toolName", { length: 128 }).notNull(),
    status: mysqlEnum("status", ["queued", "running", "completed", "failed", "skipped"]).notNull(),
    judgeVerdict: mysqlEnum("judgeVerdict", ["pass", "revise", "fail"]),
    score: int("score").notNull().default(0),
    inputSummary: text("inputSummary").notNull(),
    outputSummary: text("outputSummary"),
    reasoning: text("reasoning"),
    latencyMs: int("latencyMs"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    sessionStatusIdx: index("agent_actions_session_status_idx").on(table.sessionId, table.status),
    toolIdx: index("agent_actions_tool_idx").on(table.toolName),
  }),
);

export const agentMemories = mysqlTable(
  "agent_memories",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    sessionId: varchar("sessionId", { length: 64 }).notNull(),
    memoryType: mysqlEnum("memoryType", ["brief", "strategy", "creative", "judge", "learning"]).notNull(),
    content: text("content").notNull(),
    tags: json("tags").$type<string[]>().notNull(),
    vector: json("vector").$type<number[]>().notNull(),
    importance: int("importance").notNull().default(50),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    sessionImportanceIdx: index("agent_memories_session_importance_idx").on(table.sessionId, table.importance),
    typeIdx: index("agent_memories_type_idx").on(table.memoryType),
  }),
);

export const agentCheckpoints = mysqlTable(
  "agent_checkpoints",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    sessionId: varchar("sessionId", { length: 64 }).notNull(),
    reason: varchar("reason", { length: 128 }).notNull(),
    snapshot: json("snapshot").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    sessionCreatedIdx: index("agent_checkpoints_session_created_idx").on(table.sessionId, table.createdAt),
    reasonIdx: index("agent_checkpoints_reason_idx").on(table.reason),
  }),
);

export const agentQueueJobs = mysqlTable(
  "agent_queue_jobs",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    sessionId: varchar("sessionId", { length: 64 }).notNull(),
    type: varchar("type", { length: 128 }).notNull(),
    status: mysqlEnum("status", ["queued", "running", "completed", "failed"]).notNull(),
    payload: json("payload").$type<Record<string, unknown>>().notNull(),
    result: json("result").$type<Record<string, unknown> | null>(),
    error: text("error"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
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
