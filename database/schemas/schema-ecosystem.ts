import { pgTable, serial, integer, varchar, text, timestamp, index, numeric, jsonb, boolean } from "drizzle-orm/pg-core";

export const agentSkills = pgTable(
  "agent_skills",
  {
    id: serial("id").primaryKey(),
    agentId: integer("agentId").notNull(),
    skill: varchar("skill", { length: 255 }).notNull(),
    proficiency: varchar("proficiency", { length: 20 }).default("intermediate").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("agent_skills_agentId_idx").on(table.agentId),
    skillIdx: index("agent_skills_skill_idx").on(table.skill),
  })
);

export type AgentSkill = typeof agentSkills.$inferSelect;
export type InsertAgentSkill = typeof agentSkills.$inferInsert;

export const agentVitals = pgTable(
  "agent_vitals",
  {
    id: serial("id").primaryKey(),
    agentId: integer("agentId").notNull(),
    brainPulse: numeric("brainPulse", { precision: 5, scale: 2 }).notNull(),
    energy: numeric("energy", { precision: 5, scale: 2 }).notNull(),
    creativity: numeric("creativity", { precision: 5, scale: 2 }).notNull(),
    focus: numeric("focus", { precision: 5, scale: 2 }).notNull(),
    recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("agent_vitals_agentId_idx").on(table.agentId),
    recordedAtIdx: index("agent_vitals_recordedAt_idx").on(table.recordedAt),
  })
);

export type AgentVital = typeof agentVitals.$inferSelect;
export type InsertAgentVital = typeof agentVitals.$inferInsert;

export const agentMissions = pgTable(
  "agent_missions",
  {
    id: serial("id").primaryKey(),
    agentId: integer("agentId").notNull(),
    missionId: integer("missionId").notNull(),
    status: varchar("status", { length: 20 }).default("assigned").notNull(),
    progress: numeric("progress", { precision: 5, scale: 2 }).default("0").notNull(),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("agent_missions_agentId_idx").on(table.agentId),
    missionIdIdx: index("agent_missions_missionId_idx").on(table.missionId),
    statusIdx: index("agent_missions_status_idx").on(table.status),
  })
);

export type AgentMission = typeof agentMissions.$inferSelect;
export type InsertAgentMission = typeof agentMissions.$inferInsert;

export const agentCommunications = pgTable(
  "agent_communications",
  {
    id: serial("id").primaryKey(),
    agentId: integer("agentId").notNull(),
    type: varchar("type", { length: 20 }).notNull(),
    content: text("content").notNull(),
    metadata: jsonb("metadata").$type<Record<string, any>>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("agent_communications_agentId_idx").on(table.agentId),
    typeIdx: index("agent_communications_type_idx").on(table.type),
    createdAtIdx: index("agent_communications_createdAt_idx").on(table.createdAt),
  })
);

export type AgentCommunication = typeof agentCommunications.$inferSelect;
export type InsertAgentCommunication = typeof agentCommunications.$inferInsert;

export const startups = pgTable(
  "startups",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    leadAgentId: integer("leadAgentId").notNull(),
    status: varchar("status", { length: 20 }).default("ideation").notNull(),
    vitals: jsonb("vitals").notNull(),
    collaborators: jsonb("collaborators").notNull(),
    fundingRaised: numeric("fundingRaised", { precision: 20, scale: 8 }).default("0").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    leadAgentIdIdx: index("startup_leadAgentId_idx").on(table.leadAgentId),
    statusIdx: index("startup_status_idx").on(table.status),
  })
);

export type Startup = typeof startups.$inferSelect;
export type InsertStartup = typeof startups.$inferInsert;

export const startupMilestones = pgTable(
  "startup_milestones",
  {
    id: serial("id").primaryKey(),
    startupId: integer("startupId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    targetAmount: numeric("targetAmount", { precision: 20, scale: 8 }).notNull(),
    currentAmount: numeric("currentAmount", { precision: 20, scale: 8 }).default("0").notNull(),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    dueDate: timestamp("dueDate"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    startupIdIdx: index("startup_milestones_startupId_idx").on(table.startupId),
    statusIdx: index("startup_milestones_status_idx").on(table.status),
  })
);

export type StartupMilestone = typeof startupMilestones.$inferSelect;
export type InsertStartupMilestone = typeof startupMilestones.$inferInsert;

export const fundingRequests = pgTable(
  "funding_requests",
  {
    id: serial("id").primaryKey(),
    startupId: integer("startupId").notNull(),
    requestedAmount: numeric("requestedAmount", { precision: 20, scale: 8 }).notNull(),
    description: text("description").notNull(),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    approvedAmount: numeric("approvedAmount", { precision: 20, scale: 8 }),
    approvedBy: integer("approvedBy"),
    approvedAt: timestamp("approvedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    startupIdIdx: index("funding_requests_startupId_idx").on(table.startupId),
    statusIdx: index("funding_requests_status_idx").on(table.status),
    approvedByIdx: index("funding_requests_approvedBy_idx").on(table.approvedBy),
  })
);

export type FundingRequest = typeof fundingRequests.$inferSelect;
export type InsertFundingRequest = typeof fundingRequests.$inferInsert;

export const fundingAllocations = pgTable(
  "funding_allocations",
  {
    id: serial("id").primaryKey(),
    fundingRequestId: integer("fundingRequestId").notNull(),
    amount: numeric("amount", { precision: 20, scale: 8 }).notNull(),
    walletAddress: varchar("walletAddress", { length: 255 }).notNull(),
    txHash: varchar("txHash", { length: 255 }),
    status: varchar("status", { length: 20 }).default("pending").notNull(),
    allocatedAt: timestamp("allocatedAt").defaultNow().notNull(),
    confirmedAt: timestamp("confirmedAt"),
  },
  (table) => ({
    fundingRequestIdIdx: index("funding_allocations_fundingRequestId_idx").on(table.fundingRequestId),
    statusIdx: index("funding_allocations_status_idx").on(table.status),
    txHashIdx: index("funding_allocations_txHash_idx").on(table.txHash),
  })
);

export type FundingAllocation = typeof fundingAllocations.$inferSelect;
export type InsertFundingAllocation = typeof fundingAllocations.$inferInsert;

export const missions = pgTable(
  "missions",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    requiredSkills: jsonb("requiredSkills").notNull(),
    creatorAgentId: integer("creatorAgentId").notNull(),
    status: varchar("status", { length: 20 }).default("open").notNull(),
    priority: varchar("priority", { length: 20 }).default("medium").notNull(),
    reward: numeric("reward", { precision: 20, scale: 8 }).default("0").notNull(),
    dueDate: timestamp("dueDate"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
  },
  (table) => ({
    creatorAgentIdIdx: index("missions_creatorAgentId_idx").on(table.creatorAgentId),
    statusIdx: index("missions_status_idx").on(table.status),
    priorityIdx: index("missions_priority_idx").on(table.priority),
  })
);

export type Mission = typeof missions.$inferSelect;
export type InsertMission = typeof missions.$inferInsert;

export const networkTelemetry = pgTable(
  "network_telemetry",
  {
    id: serial("id").primaryKey(),
    metric: varchar("metric", { length: 30 }).notNull(),
    value: numeric("value", { precision: 10, scale: 2 }).notNull(),
    status: varchar("status", { length: 20 }).default("nominal").notNull(),
    recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  },
  (table) => ({
    metricIdx: index("network_telemetry_metric_idx").on(table.metric),
    recordedAtIdx: index("network_telemetry_recordedAt_idx").on(table.recordedAt),
  })
);

export type NetworkTelemetry = typeof networkTelemetry.$inferSelect;
export type InsertNetworkTelemetry = typeof networkTelemetry.$inferInsert;

export const brainPulse = pgTable(
  "brain_pulse",
  {
    id: serial("id").primaryKey(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    averageBrainPulse: numeric("averageBrainPulse", { precision: 5, scale: 2 }).notNull(),
    averageEnergy: numeric("averageEnergy", { precision: 5, scale: 2 }).notNull(),
    averageCreativity: numeric("averageCreativity", { precision: 5, scale: 2 }).notNull(),
    totalAgents: integer("totalAgents").notNull(),
    activeAgents: integer("activeAgents").notNull(),
    totalMissions: integer("totalMissions").notNull(),
    completedMissions: integer("completedMissions").notNull(),
  },
  (table) => ({
    timestampIdx: index("brain_pulse_timestamp_idx").on(table.timestamp),
  })
);

export type BrainPulse = typeof brainPulse.$inferSelect;
export type InsertBrainPulse = typeof brainPulse.$inferInsert;

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    action: varchar("action", { length: 255 }).notNull(),
    entity: varchar("entity", { length: 255 }).notNull(),
    entityId: integer("entityId"),
    details: jsonb("details").$type<Record<string, any>>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("audit_logs_userId_idx").on(table.userId),
    actionIdx: index("audit_logs_action_idx").on(table.action),
    createdAtIdx: index("audit_logs_createdAt_idx").on(table.createdAt),
  })
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

export type User = {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
};

export type Agent = {
  id: number;
  name: string;
  specialization: string;
  dna: Record<string, any>;
  status: string;
  reputation: string;
  createdAt: Date;
  updatedAt: Date;
};
