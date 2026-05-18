/**
 * Schema Consolidado - MMN AI-to-AI
 *
 * Este arquivo consolida todos os schemas do sistema.
 * Para adicionar novas tabelas, edite apenas este arquivo.
 *
 * Estrutura:
 * - Core (users, affiliates, network, etc.)
 * - MMN (comissions, payments, bonuses)
 * - Content (templates, posts, analytics)
 * - AI (agents, models, recommendations)
 * - Marketplace (products, orders)
 * - Infrastructure (jobs, logs, orchestration)
 */

// Re-export all schemas from schema-final as the single source of truth
export * from "./schema-final";

import { mysqlTable, int, varchar, text, mysqlEnum, timestamp, index, decimal, json, bigint } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// =============================================================================
// INFRAESTRUTURA
// =============================================================================

/**
 * Logs de execução de jobs
 */
export const jobLogs = mysqlTable('job_logs', {
  id: varchar('id', { length: 64 }).primaryKey(),
  jobId: varchar('jobId', { length: 64 }).notNull(),
  queueName: varchar('queueName', { length: 64 }).notNull(),
  jobType: varchar('jobType', { length: 64 }).notNull(),
  status: mysqlEnum('status', ['pending', 'processing', 'completed', 'failed']).notNull(),
  input: text('input'),
  output: text('output'),
  error: text('error'),
  startedAt: timestamp('startedAt'),
  completedAt: timestamp('completedAt'),
  createdAt: timestamp('createdAt').default(sql`now()`).notNull(),
  updatedAt: timestamp('updatedAt').default(sql`now()`).onUpdateNow().notNull(),
}, (table) => ({
  jobIdIdx: index('job_logs_job_id_idx').on(table.jobId),
  queueNameIdx: index('job_logs_queue_idx').on(table.queueName),
  statusIdx: index('job_logs_status_idx').on(table.status),
}));

export type JobLog = typeof jobLogs.$inferSelect;
export type InsertJobLog = typeof jobLogs.$inferInsert;

/**
 * Metricas de desempenho de workers
 */
export const performanceMetrics = mysqlTable('performance_metrics', {
  id: varchar('id', { length: 64 }).primaryKey(),
  queueName: varchar('queueName', { length: 64 }).notNull(),
  totalJobs: int('totalJobs').default(0).notNull(),
  successfulJobs: int('successfulJobs').default(0).notNull(),
  failedJobs: int('failedJobs').default(0).notNull(),
  averageExecutionTime: int('averageExecutionTime').default(0).notNull(),
  successRate: varchar('successRate', { length: 10 }).default('0%').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (table) => ({
  queueNameIdx: index('perf_queue_idx').on(table.queueName),
  timestampIdx: index('perf_timestamp_idx').on(table.timestamp),
}));

export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = typeof performanceMetrics.$inferInsert;

// =============================================================================
// FASE 3: MIDIA E ANALISE DE SENTIMENTO
// =============================================================================

/**
 * Media Files - Arquivos de midia (imagens e videos)
 */
export const mediaFiles = mysqlTable("media_files", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: mysqlEnum("fileType", ["image", "video"]).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  s3Key: varchar("s3Key", { length: 500 }).notNull(),
  s3Url: varchar("s3Url", { length: 500 }).notNull(),
  fileSize: int("fileSize").notNull(),
  width: int("width"),
  height: int("height"),
  duration: int("duration"),
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("media_user_idx").on(table.userId),
  fileTypeIdx: index("media_type_idx").on(table.fileType),
}));

export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = typeof mediaFiles.$inferInsert;

/**
 * Content Sentiment Analysis - Analise de sentimento de conteudo
 */
export const contentSentimentAnalysis = mysqlTable("content_sentiment_analysis", {
  id: varchar("id", { length: 36 }).primaryKey(),
  contentId: varchar("contentId", { length: 36 }).notNull(),
  userId: int("userId").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(),
  classification: mysqlEnum("classification", ["positive", "neutral", "negative"]).notNull(),
  explanation: text("explanation"),
  keywords: json("keywords").$type<string[]>(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
  analyzedAt: timestamp("analyzedAt").defaultNow().notNull(),
}, (table) => ({
  contentIdIdx: index("sentiment_content_idx").on(table.contentId),
  userIdIdx: index("sentiment_user_idx").on(table.userId),
  classificationIdx: index("sentiment_class_idx").on(table.classification),
}));

export type ContentSentimentAnalysis = typeof contentSentimentAnalysis.$inferSelect;
export type InsertContentSentimentAnalysis = typeof contentSentimentAnalysis.$inferInsert;

// =============================================================================
// ECOSSISTEMA AGENTIC
// =============================================================================

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
    brainPulse: decimal("brainPulse", { precision: 5, scale: 2 }).notNull(),
    energy: decimal("energy", { precision: 5, scale: 2 }).notNull(),
    creativity: decimal("creativity", { precision: 5, scale: 2 }).notNull(),
    focus: decimal("focus", { precision: 5, scale: 2 }).notNull(),
    recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  },
  (table) => ({
    agentIdIdx: index("agent_vitals_agentId_idx").on(table.agentId),
    recordedAtIdx: index("agent_vitals_recorded_idx").on(table.recordedAt),
  })
);

export type AgentVital = typeof agentVitals.$inferSelect;
export type InsertAgentVital = typeof agentVitals.$inferInsert;

/**
 * Agent Memory - Memorias de curto e longo prazo dos agentes
 */
export const agentMemory = mysqlTable(
  "agent_memory",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    agentId: int("agentId").notNull(),
    memoryType: mysqlEnum("memoryType", ["short_term", "long_term", "episodic", "semantic"]).notNull(),
    content: text("content").notNull(),
    importance: decimal("importance", { precision: 3, scale: 2 }).default("0.5").notNull(),
    embedding: text("embedding"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    expiresAt: timestamp("expiresAt"),
  },
  (table) => ({
    agentIdIdx: index("agent_memory_agentId_idx").on(table.agentId),
    memoryTypeIdx: index("agent_memory_type_idx").on(table.memoryType),
  })
);

export type AgentMemory = typeof agentMemory.$inferSelect;
export type InsertAgentMemory = typeof agentMemory.$inferInsert;

/**
 * Agent Tasks - Tarefas pendentes e em execucao dos agentes
 */
export const agentTasks = mysqlTable(
  "agent_tasks",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    agentId: int("agentId").notNull(),
    taskType: varchar("taskType", { length: 100 }).notNull(),
    description: text("description").notNull(),
    priority: mysqlEnum("priority", ["low", "medium", "high", "critical"]).default("medium").notNull(),
    status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending").notNull(),
    parameters: json("parameters").$type<Record<string, any>>(),
    result: text("result"),
    error: text("error"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    startedAt: timestamp("startedAt"),
    completedAt: timestamp("completedAt"),
  },
  (table) => ({
    agentIdIdx: index("agent_tasks_agentId_idx").on(table.agentId),
    statusIdx: index("agent_tasks_status_idx").on(table.status),
    priorityIdx: index("agent_tasks_priority_idx").on(table.priority),
  })
);

export type AgentTask = typeof agentTasks.$inferSelect;
export type InsertAgentTask = typeof agentTasks.$inferInsert;

/**
 * Social Media Accounts - Contas de redes sociais conectadas
 */
export const socialMediaAccounts = mysqlTable("social_media_accounts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  platform: mysqlEnum("platform", ["instagram", "twitter", "linkedin", "tiktok", "facebook", "youtube"]).notNull(),
  accountId: varchar("accountId", { length: 255 }).notNull(),
  accountName: varchar("accountName", { length: 255 }).notNull(),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  followers: int("followers").default(0),
  lastSyncedAt: timestamp("lastSyncedAt"),
  connectedAt: timestamp("connectedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("social_user_idx").on(table.userId),
  platformIdx: index("social_platform_idx").on(table.platform),
}));

export type SocialMediaAccount = typeof socialMediaAccounts.$inferSelect;
export type InsertSocialMediaAccount = typeof socialMediaAccounts.$inferInsert;

// =============================================================================
// TYPE HELPERS
// =============================================================================

/**
 * Helper para tipar campos computados que nao existem no banco
 */
export interface AffiliateProfileComputed {
  directReferrals: number;
  totalEarnings: number;
  totalNetworkSize: number;
}

/**
 * Helper para tipar retorno expandido de perfil
 */
export interface ExpandedAffiliateProfile {
  id: number;
  userId: number;
  affiliateCode: string;
  sponsorId: number | null;
  commissionPercentage: number;
  status: "active" | "inactive" | "suspended";
  totalCommissions: number;
  pendingCommissions: number;
  createdAt: Date;
  updatedAt: Date;
  // Campos computados (nao existem no DB, sao calculados em tempo real)
  directReferrals: number;
  totalEarnings: number;
  totalNetworkSize: number;
}