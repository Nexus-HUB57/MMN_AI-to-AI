import { mysqlTable, varchar, text, timestamp, int, boolean, enum } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

/**
 * Cron Jobs Schema
 * Sistema de automação Cron para tarefas recorrentes
 */

// Enum para status do cron job
export const cronJobStatusEnum = ['scheduled', 'running', 'completed', 'failed', 'cancelled'] as const;
export type CronJobStatus = typeof cronJobStatusEnum[number];

// Enum para frequência do cron
export const cronFrequencyEnum = ['minute', 'hourly', 'daily', 'weekly', 'monthly'] as const;
export type CronFrequency = typeof cronFrequencyEnum[number];

// Tabela principal de cron jobs
export const cronJobs = mysqlTable('cron_jobs', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  jobType: varchar('job_type', { length: 100 }).notNull(), // Tipo do job (invoice_overdue, marketplace_sync, etc)
  queueName: varchar('queue_name', { length: 100 }).notNull(), // Nome da fila BullMQ
  jobPayload: text('job_payload'), // Payload JSON para o job
  frequency: varchar('frequency', { length: 20 }).notNull().default('daily'), // Frequência
  cronExpression: varchar('cron_expression', { length: 100 }), // Expressão cron (opcional, sobrescreve frequency)
  enabled: boolean('enabled').notNull().default(true),
  lastRunAt: timestamp('last_run_at'),
  lastRunDuration: int('last_run_duration'), // Duração em ms
  lastRunStatus: varchar('last_run_status', { length: 20 }), // completed, failed
  lastRunError: text('last_run_error'),
  nextRunAt: timestamp('next_run_at'),
  runCount: int('run_count').notNull().default(0),
  successCount: int('success_count').notNull().default(0),
  failureCount: int('failure_count').notNull().default(0),
  createdBy: int('created_by'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// Histórico de execuções de cron jobs
export const cronJobHistory = mysqlTable('cron_job_history', {
  id: int('id').primaryKey().autoincrement(),
  cronJobId: int('cron_job_id').notNull().references(() => cronJobs.id),
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  duration: int('duration'), // Duração em ms
  status: varchar('status', { length: 20 }).notNull(), // running, completed, failed
  errorMessage: text('error_message'),
  jobId: varchar('job_id', { length: 100 }), // ID do job na fila
  metadata: text('metadata'), // JSON com metadados adicionais
});

// Configurações globais de cron
export const cronSettings = mysqlTable('cron_settings', {
  id: int('id').primaryKey().autoincrement(),
  settingKey: varchar('setting_key', { length: 100 }).notNull().unique(),
  settingValue: text('setting_value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// Relações
export const cronJobsRelations = relations(cronJobs, ({ one, many }) => ({
  history: many(cronJobHistory),
  creator: one(users, {
    fields: [cronJobs.createdBy],
    references: [users.id],
  }),
}));

export const cronJobHistoryRelations = relations(cronJobHistory, ({ one }) => ({
  cronJob: one(cronJobs, {
    fields: [cronJobHistory.cronJobId],
    references: [cronJobs.id],
  }),
}));

// Referência para users (simplificada)
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  email: varchar('email', { length: 255 }),
  name: varchar('name', { length: 255 }),
});

// Tipos para uso interno
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
  status: 'running' | 'completed' | 'failed';
  errorMessage?: string;
  jobId?: string;
  metadata?: Record<string, unknown>;
}

// Tipos pré-definidos de cron jobs
export const CRON_JOB_TYPES = {
  // Billing/Financeiro
  INVOICE_OVERDUE_CHECK: 'invoice_overdue_check',
  INVOICE_REMINDER: 'invoice_reminder',
  PAYMENT_PROCESSING: 'payment_processing',

  // Marketplace
  MARKETPLACE_SYNC: 'marketplace_sync',
  MARKETPLACE_PRICE_UPDATE: 'marketplace_price_update',
  MARKETPLACE_INVENTORY_SYNC: 'marketplace_inventory_sync',

  // Comissões
  COMMISSION_CALCULATION: 'commission_calculation',
  COMMISSION_DISTRIBUTION: 'commission_distribution',

  // Rede/Afiliados
  NETWORK_HEALTH_CHECK: 'network_health_check',
  AFFILIATE_ACTIVATION: 'affiliate_activation',

  //Conteúdo
  CONTENT_SCHEDULING: 'content_scheduling',
  SOCIAL_POST_PUBLISH: 'social_post_publish',

  // Sistema
  DATABASE_CLEANUP: 'database_cleanup',
  CACHE_WARMING: 'cache_warming',
  REPORT_GENERATION: 'report_generation',
  SESSION_CLEANUP: 'session_cleanup',

  // XP/Carreiras
  XP_RECALCULATION: 'xp_recalculation',
  CAREER_PROGRESSION: 'career_progression',
  LEADERBOARD_UPDATE: 'leaderboard_update',
} as const;

export type CronJobType = typeof CRON_JOB_TYPES[keyof typeof CRON_JOB_TYPES];

// Configurações padrão para cada tipo de job
export const CRON_JOB_CONFIGS: Record<CronJobType, Partial<ICronJob>> = {
  [CRON_JOB_TYPES.INVOICE_OVERDUE_CHECK]: {
    name: 'Verificação de Faturas Vencidas',
    description: 'Verifica e atualiza status de faturas vencidas',
    jobType: CRON_JOB_TYPES.INVOICE_OVERDUE_CHECK,
    queueName: 'billing_queue',
    frequency: 'hourly',
  },
  [CRON_JOB_TYPES.INVOICE_REMINDER]: {
    name: 'Lembrete de Faturas',
    description: 'Envia lembretes de faturas pendentes',
    jobType: CRON_JOB_TYPES.INVOICE_REMINDER,
    queueName: 'notifications_queue',
    frequency: 'daily',
  },
  [CRON_JOB_TYPES.PAYMENT_PROCESSING]: {
    name: 'Processamento de Pagamentos',
    description: 'Processa pagamentos pendentes',
    jobType: CRON_JOB_TYPES.PAYMENT_PROCESSING,
    queueName: 'payments_queue',
    frequency: 'hourly',
  },
  [CRON_JOB_TYPES.MARKETPLACE_SYNC]: {
    name: 'Sincronização de Marketplace',
    description: 'Sincroniza produtos com marketplaces externos',
    jobType: CRON_JOB_TYPES.MARKETPLACE_SYNC,
    queueName: 'marketplace_sync_queue',
    frequency: 'hourly',
  },
  [CRON_JOB_TYPES.MARKETPLACE_PRICE_UPDATE]: {
    name: 'Atualização de Preços',
    description: 'Atualiza preços de produtos nos marketplaces',
    jobType: CRON_JOB_TYPES.MARKETPLACE_PRICE_UPDATE,
    queueName: 'marketplace_sync_queue',
    frequency: 'daily',
  },
  [CRON_JOB_TYPES.MARKETPLACE_INVENTORY_SYNC]: {
    name: 'Sincronização de Inventário',
    description: 'Sincroniza níveis de estoque',
    jobType: CRON_JOB_TYPES.MARKETPLACE_INVENTORY_SYNC,
    queueName: 'marketplace_sync_queue',
    frequency: 'hourly',
  },
  [CRON_JOB_TYPES.COMMISSION_CALCULATION]: {
    name: 'Cálculo de Comissões',
    description: 'Calcula comissões para a rede',
    jobType: CRON_JOB_TYPES.COMMISSION_CALCULATION,
    queueName: 'commission_processing_queue',
    frequency: 'daily',
  },
  [CRON_JOB_TYPES.COMMISSION_DISTRIBUTION]: {
    name: 'Distribuição de Comissões',
    description: 'Distribui comissões calculadas',
    jobType: CRON_JOB_TYPES.COMMISSION_DISTRIBUTION,
    queueName: 'commission_processing_queue',
    frequency: 'weekly',
  },
  [CRON_JOB_TYPES.NETWORK_HEALTH_CHECK]: {
    name: 'Verificação de Saúde da Rede',
    description: 'Verifica consistência da rede MMN',
    jobType: CRON_JOB_TYPES.NETWORK_HEALTH_CHECK,
    queueName: 'maintenance_queue',
    frequency: 'daily',
  },
  [CRON_JOB_TYPES.AFFILIATE_ACTIVATION]: {
    name: 'Ativação de Afiliados',
    description: 'Processa ativação de afiliados pendentes',
    jobType: CRON_JOB_TYPES.AFFILIATE_ACTIVATION,
    queueName: 'affiliates_queue',
    frequency: 'hourly',
  },
  [CRON_JOB_TYPES.CONTENT_SCHEDULING]: {
    name: 'Agendamento de Conteúdo',
    description: 'Agenda conteúdo para publicação',
    jobType: CRON_JOB_TYPES.CONTENT_SCHEDULING,
    queueName: 'content_generation_queue',
    frequency: 'hourly',
  },
  [CRON_JOB_TYPES.SOCIAL_POST_PUBLISH]: {
    name: 'Publicação de Posts Sociais',
    description: 'Publica posts agendados nas redes sociais',
    jobType: CRON_JOB_TYPES.SOCIAL_POST_PUBLISH,
    queueName: 'social_queue',
    frequency: 'hourly',
  },
  [CRON_JOB_TYPES.DATABASE_CLEANUP]: {
    name: 'Limpeza de Banco de Dados',
    description: 'Remove dados temporários e logs antigos',
    jobType: CRON_JOB_TYPES.DATABASE_CLEANUP,
    queueName: 'maintenance_queue',
    frequency: 'weekly',
  },
  [CRON_JOB_TYPES.CACHE_WARMING]: {
    name: 'Preparação de Cache',
    description: 'Prepara cache para dados frequentemente acessados',
    jobType: CRON_JOB_TYPES.CACHE_WARMING,
    queueName: 'cache_queue',
    frequency: 'hourly',
  },
  [CRON_JOB_TYPES.REPORT_GENERATION]: {
    name: 'Geração de Relatórios',
    description: 'Gera relatórios periódicos',
    jobType: CRON_JOB_TYPES.REPORT_GENERATION,
    queueName: 'reports_queue',
    frequency: 'daily',
  },
  [CRON_JOB_TYPES.SESSION_CLEANUP]: {
    name: 'Limpeza de Sessões',
    description: 'Remove sessões expiradas',
    jobType: CRON_JOB_TYPES.SESSION_CLEANUP,
    queueName: 'maintenance_queue',
    frequency: 'hourly',
  },
  [CRON_JOB_TYPES.XP_RECALCULATION]: {
    name: 'Recalculação de XP',
    description: 'Recalcula XP dos afiliados',
    jobType: CRON_JOB_TYPES.XP_RECALCULATION,
    queueName: 'xp_queue',
    frequency: 'daily',
  },
  [CRON_JOB_TYPES.CAREER_PROGRESSION]: {
    name: 'Progressão de Carreira',
    description: 'Atualiza níveis de carreira',
    jobType: CRON_JOB_TYPES.CAREER_PROGRESSION,
    queueName: 'xp_queue',
    frequency: 'daily',
  },
  [CRON_JOB_TYPES.LEADERBOARD_UPDATE]: {
    name: 'Atualização de Leaderboard',
    description: 'Atualiza rankings do leaderboard',
    jobType: CRON_JOB_TYPES.LEADERBOARD_UPDATE,
    queueName: 'xp_queue',
    frequency: 'hourly',
  },
};