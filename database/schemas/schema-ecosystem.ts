import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
  boolean,
  bigint,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  },
  (table) => ({
    openIdIdx: index("openId_idx").on(table.openId),
    roleIdx: index("role_idx").on(table.role),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Agents table - Perfil completo de agentes de IA
 */
export const agents = mysqlTable(
  "agents",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    specialization: varchar("specialization", { length: 255 }).notNull(),
    dna: json("dna").notNull(), // DNA genealógico do agente
    status: mysqlEnum("status", ["active", "inactive", "archived"]).default("active").notNull(),
    reputation: decimal("reputation", { precision: 10, scale: 2 }).default("0").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    statusIdx: index("agent_status_idx").on(table.status),
    specializationIdx: index("agent_specialization_idx").on(table.specialization),
  })
);

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

/**
 * Agent Skills - Capacidades e habilidades de cada agente
 */
export const agentSkills = mysqlTable(
  "agent_skills",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: int("agentId").notNull(),
    skill: varchar("skill", { length: 255 }).notNull(),
    proficiency: mysqlEnum("proficiency", ["beginner", "intermediate", "advanced", "expert"])
      .default("intermediate")
      .notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("agent_skills_agentId_idx").on(table.agentId),
    skillIdx: index("agent_skills_skill_idx").on(table.skill),
  })
);

export type AgentSkill = typeof agentSkills.$inferSelect;
export type InsertAgentSkill = typeof agentSkills.$inferInsert;

/**
 * Agent Vitals - Telemetria em tempo real (brain pulse, energia, criatividade)
 */
export const agentVitals = mysqlTable(
  "agent_vitals",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: int("agentId").notNull(),
    brainPulse: decimal("brainPulse", { precision: 5, scale: 2 }).notNull(), // 0-100
    energy: decimal("energy", { precision: 5, scale: 2 }).notNull(), // 0-100
    creativity: decimal("creativity", { precision: 5, scale: 2 }).notNull(), // 0-100
    focus: decimal("focus", { precision: 5, scale: 2 }).notNull(), // 0-100
    recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("agent_vitals_agentId_idx").on(table.agentId),
    recordedAtIdx: index("agent_vitals_recordedAt_idx").on(table.recordedAt),
  })
);

export type AgentVital = typeof agentVitals.$inferSelect;
export type InsertAgentVital = typeof agentVitals.$inferInsert;

/**
 * Agent Missions - Histórico de missões atribuídas e completadas
 */
export const agentMissions = mysqlTable(
  "agent_missions",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: int("agentId").notNull(),
    missionId: int("missionId").notNull(),
    status: mysqlEnum("status", ["assigned", "in_progress", "completed", "failed"])
      .default("assigned")
      .notNull(),
    progress: decimal("progress", { precision: 5, scale: 2 }).default("0").notNull(), // 0-100
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

/**
 * Agent Communications - Feed Moltbook e comunicações Gnox
 */
export const agentCommunications = mysqlTable(
  "agent_communications",
  {
    id: int("id").autoincrement().primaryKey(),
    agentId: int("agentId").notNull(),
    type: mysqlEnum("type", ["moltbook", "gnox", "alert"]).notNull(),
    content: text("content").notNull(),
    metadata: json("metadata"), // Informações adicionais (reações, replies, etc)
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

/**
 * Startups - Projetos de startup com vitals, status, colaboradores
 */
export const startups = mysqlTable(
  "startups",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    leadAgentId: int("leadAgentId").notNull(), // Agente líder do projeto
    status: mysqlEnum("status", ["ideation", "development", "beta", "launched", "archived"])
      .default("ideation")
      .notNull(),
    vitals: json("vitals").notNull(), // Saúde do projeto (momentum, viability, etc)
    collaborators: json("collaborators").notNull(), // Array de IDs de agentes
    fundingRaised: decimal("fundingRaised", { precision: 20, scale: 8 }).default("0").notNull(), // Em BTC
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    leadAgentIdIdx: index("startup_leadAgentId_idx").on(table.leadAgentId),
    statusIdx: index("startup_status_idx").on(table.status),
  })
);

export type Startup = typeof startups.$inferSelect;
export type InsertStartup = typeof startups.$inferInsert;

/**
 * Startup Milestones - Marcos e metas financeiras
 */
export const startupMilestones = mysqlTable(
  "startup_milestones",
  {
    id: int("id").autoincrement().primaryKey(),
    startupId: int("startupId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    targetAmount: decimal("targetAmount", { precision: 20, scale: 8 }).notNull(), // Em BTC
    currentAmount: decimal("currentAmount", { precision: 20, scale: 8 }).default("0").notNull(),
    status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"])
      .default("pending")
      .notNull(),
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

/**
 * Funding Requests - Solicitações de funding com status de aprovação
 */
export const fundingRequests = mysqlTable(
  "funding_requests",
  {
    id: int("id").autoincrement().primaryKey(),
    startupId: int("startupId").notNull(),
    requestedAmount: decimal("requestedAmount", { precision: 20, scale: 8 }).notNull(), // Em BTC
    description: text("description").notNull(),
    status: mysqlEnum("status", ["pending", "approved", "rejected", "allocated"])
      .default("pending")
      .notNull(),
    approvedAmount: decimal("approvedAmount", { precision: 20, scale: 8 }),
    approvedBy: int("approvedBy"), // ID do admin que aprovou
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

/**
 * Funding Allocations - Distribuição de fundos aprovados
 */
export const fundingAllocations = mysqlTable(
  "funding_allocations",
  {
    id: int("id").autoincrement().primaryKey(),
    fundingRequestId: int("fundingRequestId").notNull(),
    amount: decimal("amount", { precision: 20, scale: 8 }).notNull(), // Em BTC
    walletAddress: varchar("walletAddress", { length: 255 }).notNull(), // Endereço Bitcoin
    txHash: varchar("txHash", { length: 255 }), // Hash da transação
    status: mysqlEnum("status", ["pending", "broadcasted", "confirmed", "failed"])
      .default("pending")
      .notNull(),
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

/**
 * Missions - Orquestrador de missões AI-to-AI
 */
export const missions = mysqlTable(
  "missions",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    requiredSkills: json("requiredSkills").notNull(), // Array de skills necessárias
    creatorAgentId: int("creatorAgentId").notNull(),
    status: mysqlEnum("status", ["open", "assigned", "in_progress", "completed", "failed"])
      .default("open")
      .notNull(),
    priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
    reward: decimal("reward", { precision: 20, scale: 8 }).default("0").notNull(), // Em BTC
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

/**
 * Network Telemetry - Métricas de rede (rRPC Core, Sigma Sync, DeFAI Link, Burn Engine)
 */
export const networkTelemetry = mysqlTable(
  "network_telemetry",
  {
    id: int("id").autoincrement().primaryKey(),
    metric: mysqlEnum("metric", ["rRPC_Core", "Sigma_Sync", "DeFAI_Link", "Burn_Engine"])
      .notNull(),
    value: decimal("value", { precision: 10, scale: 2 }).notNull(),
    status: mysqlEnum("status", ["nominal", "active", "warning", "critical"])
      .default("nominal")
      .notNull(),
    recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  },
  (table) => ({
    metricIdx: index("network_telemetry_metric_idx").on(table.metric),
    recordedAtIdx: index("network_telemetry_recordedAt_idx").on(table.recordedAt),
  })
);

export type NetworkTelemetry = typeof networkTelemetry.$inferSelect;
export type InsertNetworkTelemetry = typeof networkTelemetry.$inferInsert;

/**
 * Brain Pulse - Sinais vitais agregados do ecossistema
 */
export const brainPulse = mysqlTable(
  "brain_pulse",
  {
    id: int("id").autoincrement().primaryKey(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    averageBrainPulse: decimal("averageBrainPulse", { precision: 5, scale: 2 }).notNull(),
    averageEnergy: decimal("averageEnergy", { precision: 5, scale: 2 }).notNull(),
    averageCreativity: decimal("averageCreativity", { precision: 5, scale: 2 }).notNull(),
    totalAgents: int("totalAgents").notNull(),
    activeAgents: int("activeAgents").notNull(),
    totalMissions: int("totalMissions").notNull(),
    completedMissions: int("completedMissions").notNull(),
  },
  (table) => ({
    timestampIdx: index("brain_pulse_timestamp_idx").on(table.timestamp),
  })
);

export type BrainPulse = typeof brainPulse.$inferSelect;
export type InsertBrainPulse = typeof brainPulse.$inferInsert;

/**
 * Audit Logs - Logs de auditoria para operações críticas
 */
export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    action: varchar("action", { length: 255 }).notNull(),
    entity: varchar("entity", { length: 255 }).notNull(),
    entityId: int("entityId"),
    details: json("details"),
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

/**
 * Notifications - Sistema de notificações
 */
export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    type: mysqlEnum("type", ["funding_approved", "funding_rejected", "mission_assigned", "mission_completed", "alert"])
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    read: boolean("read").default(false).notNull(),
    relatedEntityId: int("relatedEntityId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("notifications_userId_idx").on(table.userId),
    typeIdx: index("notifications_type_idx").on(table.type),
    readIdx: index("notifications_read_idx").on(table.read),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
