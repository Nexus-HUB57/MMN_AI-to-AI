import { pgTable, varchar, text, timestamp, integer, boolean, uniqueIndex, index, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const cronJobStatusEnum = ["scheduled", "running", "completed", "failed", "cancelled"] as const;
export type CronJobStatus = typeof cronJobStatusEnum[number];

export const cronFrequencyEnum = ["minute", "hourly", "daily", "weekly", "monthly"] as const;
export type CronFrequency = typeof cronFrequencyEnum[number];

export const cronJobs = pgTable("cron_jobs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  jobType: varchar("job_type", { length: 100 }).notNull(),
  queueName: varchar("queue_name", { length: 100 }).notNull(),
  jobPayload: text("job_payload"),
  frequency: varchar("frequency", { length: 20 }).notNull().default("daily"),
  cronExpression: varchar("cron_expression", { length: 100 }),
  enabled: boolean("enabled").notNull().default(true),
  lastRunAt: timestamp("last_run_at"),
  lastRunDuration: integer("last_run_duration"),
  lastRunStatus: varchar("last_run_status", { length: 20 }),
  lastRunError: text("last_run_error"),
  nextRunAt: timestamp("next_run_at"),
  runCount: integer("run_count").notNull().default(0),
  successCount: integer("success_count").notNull().default(0),
  failureCount: integer("failure_count").notNull().default(0),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const cronJobHistory = pgTable("cron_job_history", {
  id: serial("id").primaryKey(),
  cronJobId: integer("cron_job_id").notNull().references(() => cronJobs.id),
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at"),
  duration: integer("duration"),
  status: varchar("status", { length: 20 }).notNull(),
  errorMessage: text("error_message"),
  jobId: varchar("job_id", { length: 100 }),
  metadata: text("metadata"),
});

export const cronAlerts = pgTable(
  "cron_alerts",
  {
    id: serial("id").primaryKey(),
    alertKey: varchar("alert_key", { length: 255 }).notNull(),
    alertType: varchar("alert_type", { length: 64 }).notNull(),
    severity: varchar("severity", { length: 20 }).notNull(),
    jobType: varchar("job_type", { length: 100 }).notNull(),
    jobName: varchar("job_name", { length: 255 }),
    bucket: varchar("bucket", { length: 32 }).notNull(),
    title: varchar("title", { length: 256 }).notNull(),
    message: text("message").notNull(),
    metadata: text("metadata"),
    detectedAt: timestamp("detected_at").notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
    notifiedAt: timestamp("notified_at"),
    acknowledgedAt: timestamp("acknowledged_at"),
    acknowledgedBy: integer("acknowledged_by"),
    resolvedAt: timestamp("resolved_at"),
    active: boolean("active").notNull().default(true),
  },
  (table) => ({
    alertKeyUniq: uniqueIndex("cron_alerts_alert_key_uniq").on(table.alertKey),
    activeIdx: index("cron_alerts_active_idx").on(table.active, table.severity),
    jobTypeIdx: index("cron_alerts_job_type_idx").on(table.jobType, table.alertType),
  })
);

export const cronSettings = pgTable("cron_settings", {
  id: serial("id").primaryKey(),
  settingKey: varchar("setting_key", { length: 100 }).notNull().unique(),
  settingValue: text("setting_value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ICronAlertRow = typeof cronAlerts.$inferSelect;
export type ICronAlertInsert = typeof cronAlerts.$inferInsert;

export const cronJobsRelations = relations(cronJobs, ({ many }) => ({
  history: many(cronJobHistory),
}));

export const cronJobHistoryRelations = relations(cronJobHistory, ({ one }) => ({
  cronJob: one(cronJobs, {
    fields: [cronJobHistory.cronJobId],
    references: [cronJobs.id],
  }),
}));

export interface ICronJob {
  id: number;
  name: string;
  description?: string;
  jobType: string;
  queueName: string;
  jobPayload?: Record<string, unknown>;
  frequency: CronFrequency;
  cronExpression?: string;
  enabled: boolean;
  lastRunAt?: Date;
  lastRunDuration?: number;
  lastRunStatus?: CronJobStatus;
  lastRunError?: string;
  nextRunAt?: Date;
  runCount: number;
  successCount: number;
  failureCount: number;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICronJobHistory {
  id: number;
  cronJobId: number;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  status: "running" | "completed" | "failed";
  errorMessage?: string;
  jobId?: string;
  metadata?: Record<string, unknown>;
}

export const CRON_JOB_TYPES = {
  INVOICE_OVERDUE_CHECK: "invoice_overdue_check",
  INVOICE_REMINDER: "invoice_reminder",
  PAYMENT_PROCESSING: "payment_processing",
  MARKETPLACE_SYNC: "marketplace_sync",
  MARKETPLACE_PRICE_UPDATE: "marketplace_price_update",
  MARKETPLACE_INVENTORY_SYNC: "marketplace_inventory_sync",
  COMMISSION_CALCULATION: "commission_calculation",
  COMMISSION_DISTRIBUTION: "commission_distribution",
  NETWORK_HEALTH_CHECK: "network_health_check",
  AFFILIATE_ACTIVATION: "affiliate_activation",
  CONTENT_SCHEDULING: "content_scheduling",
  SOCIAL_POST_PUBLISH: "social_post_publish",
  DATABASE_CLEANUP: "database_cleanup",
  CACHE_WARMING: "cache_warming",
  REPORT_GENERATION: "report_generation",
  SESSION_CLEANUP: "session_cleanup",
  XP_RECALCULATION: "xp_recalculation",
  CAREER_PROGRESSION: "career_progression",
  LEADERBOARD_UPDATE: "leaderboard_update",
} as const;

export type CronJobType = typeof CRON_JOB_TYPES[keyof typeof CRON_JOB_TYPES];

export const CRON_JOB_CONFIGS: Record<CronJobType, Partial<ICronJob>> = {
  [CRON_JOB_TYPES.INVOICE_OVERDUE_CHECK]: { name: "Verificação de Faturas Vencidas", jobType: CRON_JOB_TYPES.INVOICE_OVERDUE_CHECK, queueName: "billing_queue", frequency: "hourly" },
  [CRON_JOB_TYPES.INVOICE_REMINDER]: { name: "Lembrete de Faturas", jobType: CRON_JOB_TYPES.INVOICE_REMINDER, queueName: "notifications_queue", frequency: "daily" },
  [CRON_JOB_TYPES.PAYMENT_PROCESSING]: { name: "Processamento de Pagamentos", jobType: CRON_JOB_TYPES.PAYMENT_PROCESSING, queueName: "payments_queue", frequency: "hourly" },
  [CRON_JOB_TYPES.MARKETPLACE_SYNC]: { name: "Sincronização de Marketplace", jobType: CRON_JOB_TYPES.MARKETPLACE_SYNC, queueName: "marketplace_sync_queue", frequency: "hourly" },
  [CRON_JOB_TYPES.MARKETPLACE_PRICE_UPDATE]: { name: "Atualização de Preços", jobType: CRON_JOB_TYPES.MARKETPLACE_PRICE_UPDATE, queueName: "marketplace_sync_queue", frequency: "daily" },
  [CRON_JOB_TYPES.MARKETPLACE_INVENTORY_SYNC]: { name: "Sincronização de Inventário", jobType: CRON_JOB_TYPES.MARKETPLACE_INVENTORY_SYNC, queueName: "marketplace_sync_queue", frequency: "hourly" },
  [CRON_JOB_TYPES.COMMISSION_CALCULATION]: { name: "Cálculo de Comissões", jobType: CRON_JOB_TYPES.COMMISSION_CALCULATION, queueName: "commission_processing_queue", frequency: "daily" },
  [CRON_JOB_TYPES.COMMISSION_DISTRIBUTION]: { name: "Distribuição de Comissões", jobType: CRON_JOB_TYPES.COMMISSION_DISTRIBUTION, queueName: "commission_processing_queue", frequency: "weekly" },
  [CRON_JOB_TYPES.NETWORK_HEALTH_CHECK]: { name: "Verificação de Saúde da Rede", jobType: CRON_JOB_TYPES.NETWORK_HEALTH_CHECK, queueName: "maintenance_queue", frequency: "daily" },
  [CRON_JOB_TYPES.AFFILIATE_ACTIVATION]: { name: "Ativação de Afiliados", jobType: CRON_JOB_TYPES.AFFILIATE_ACTIVATION, queueName: "affiliates_queue", frequency: "hourly" },
  [CRON_JOB_TYPES.CONTENT_SCHEDULING]: { name: "Agendamento de Conteúdo", jobType: CRON_JOB_TYPES.CONTENT_SCHEDULING, queueName: "content_generation_queue", frequency: "hourly" },
  [CRON_JOB_TYPES.SOCIAL_POST_PUBLISH]: { name: "Publicação de Posts Sociais", jobType: CRON_JOB_TYPES.SOCIAL_POST_PUBLISH, queueName: "social_queue", frequency: "hourly" },
  [CRON_JOB_TYPES.DATABASE_CLEANUP]: { name: "Limpeza de Banco de Dados", jobType: CRON_JOB_TYPES.DATABASE_CLEANUP, queueName: "maintenance_queue", frequency: "weekly" },
  [CRON_JOB_TYPES.CACHE_WARMING]: { name: "Preparação de Cache", jobType: CRON_JOB_TYPES.CACHE_WARMING, queueName: "cache_queue", frequency: "hourly" },
  [CRON_JOB_TYPES.REPORT_GENERATION]: { name: "Geração de Relatórios", jobType: CRON_JOB_TYPES.REPORT_GENERATION, queueName: "reports_queue", frequency: "daily" },
  [CRON_JOB_TYPES.SESSION_CLEANUP]: { name: "Limpeza de Sessões", jobType: CRON_JOB_TYPES.SESSION_CLEANUP, queueName: "maintenance_queue", frequency: "hourly" },
  [CRON_JOB_TYPES.XP_RECALCULATION]: { name: "Recalculação de XP", jobType: CRON_JOB_TYPES.XP_RECALCULATION, queueName: "xp_queue", frequency: "daily" },
  [CRON_JOB_TYPES.CAREER_PROGRESSION]: { name: "Progressão de Carreira", jobType: CRON_JOB_TYPES.CAREER_PROGRESSION, queueName: "xp_queue", frequency: "daily" },
  [CRON_JOB_TYPES.LEADERBOARD_UPDATE]: { name: "Atualização de Leaderboard", jobType: CRON_JOB_TYPES.LEADERBOARD_UPDATE, queueName: "xp_queue", frequency: "hourly" },
};
