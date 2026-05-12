import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela para histórico de metas de orquestração
export const orchestrationGoals = mysqlTable('orchestration_goals', {
  id: varchar('id', { length: 64 }).primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  priority: mysqlEnum('priority', ['low', 'medium', 'high']).notNull(),
  status: mysqlEnum('status', ['pending', 'executing', 'completed', 'failed']).notNull(),
  targetMetrics: text('targetMetrics'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type OrchestrationGoal = typeof orchestrationGoals.$inferSelect;
export type InsertOrchestrationGoal = typeof orchestrationGoals.$inferInsert;

// Tabela para logs de execução de jobs
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
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type JobLog = typeof jobLogs.$inferSelect;
export type InsertJobLog = typeof jobLogs.$inferInsert;

// Tabela para tarefas de orquestração
export const orchestrationTasks = mysqlTable('orchestration_tasks', {
  id: varchar('id', { length: 64 }).primaryKey(),
  goalId: varchar('goalId', { length: 64 }).notNull(),
  taskId: varchar('taskId', { length: 64 }).notNull(),
  type: mysqlEnum('type', ['content_generation', 'marketplace_sync', 'order_processing', 'commission_processing']).notNull(),
  description: text('description').notNull(),
  parameters: text('parameters'),
  status: mysqlEnum('status', ['pending', 'dispatched', 'completed', 'failed']).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  dispatchedAt: timestamp('dispatchedAt'),
  completedAt: timestamp('completedAt'),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type OrchestrationTask = typeof orchestrationTasks.$inferSelect;
export type InsertOrchestrationTask = typeof orchestrationTasks.$inferInsert;

// Tabela para métricas de desempenho
export const performanceMetrics = mysqlTable('performance_metrics', {
  id: varchar('id', { length: 64 }).primaryKey(),
  queueName: varchar('queueName', { length: 64 }).notNull(),
  totalJobs: int('totalJobs').default(0).notNull(),
  successfulJobs: int('successfulJobs').default(0).notNull(),
  failedJobs: int('failedJobs').default(0).notNull(),
  averageExecutionTime: int('averageExecutionTime').default(0).notNull(),
  successRate: varchar('successRate', { length: 10 }).default('0%').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = typeof performanceMetrics.$inferInsert;