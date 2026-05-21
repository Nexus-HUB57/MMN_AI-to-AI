import { z } from 'zod';
import { router, publicProcedure, adminProcedure } from '../trpc/trpc';
import { getDb } from '../../../database/schemas/db';
import {
  cronJobs,
  cronJobHistory,
  cronSettings,
  CRON_JOB_CONFIGS,
  type CronJobType,
} from '../../../database/schemas/schema-cron';
import { eq, desc, and, sql, gte, lte } from 'drizzle-orm';
import cron from 'node-cron';
import { executeCronJob } from '../services/cronScheduler';
import { listSupportedCronJobTypes } from '../services/cronDispatcher';
import { computeCronSlaSnapshot } from '../services/cronSlaIndicators';

const cronFrequencySchema = z.enum(['minute', 'hourly', 'daily', 'weekly', 'monthly']);

const cronJobInputSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  jobType: z.string().min(1).max(100),
  queueName: z.string().min(1).max(100),
  jobPayload: z.record(z.unknown()).optional(),
  frequency: cronFrequencySchema,
  cronExpression: z.string().optional(),
  enabled: z.boolean().default(true),
});

const cronSettingsSchema = z.record(z.string());

/**
 * Cron Jobs Router
 * Gerenciamento de automação Cron para tarefas recorrentes
 */
export const cronRouter = router({
  getTemplates: publicProcedure.query(async () => {
    return Object.values(CRON_JOB_CONFIGS)
      .map((config) => ({
        name: config.name ?? '',
        description: config.description ?? '',
        jobType: config.jobType ?? '',
        queueName: config.queueName ?? '',
        frequency: config.frequency ?? 'daily',
      }))
      .filter((template) => template.jobType && template.queueName)
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }),

  list: publicProcedure
    .input(
      z
        .object({
          enabled: z.boolean().optional(),
          jobType: z.string().optional(),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(20),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const page = input?.page ?? 1;
      const limit = input?.limit ?? 20;
      const offset = (page - 1) * limit;

      const conditions = [];
      if (input?.enabled !== undefined) {
        conditions.push(eq(cronJobs.enabled, input.enabled));
      }
      if (input?.jobType) {
        conditions.push(eq(cronJobs.jobType, input.jobType));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [jobs, countResult] = await Promise.all([
        db.select().from(cronJobs).where(where).orderBy(desc(cronJobs.updatedAt)).limit(limit).offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(cronJobs).where(where),
      ]);

      return {
        jobs: jobs.map(normalizeCronJob),
        pagination: {
          page,
          limit,
          total: countResult[0]?.count ?? 0,
          totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
        },
      };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const job = await db.select().from(cronJobs).where(eq(cronJobs.id, input.id)).limit(1);
      return job[0] ? normalizeCronJob(job[0]) : null;
    }),

  getHistory: publicProcedure
    .input(
      z.object({
        cronJobId: z.number(),
        status: z.enum(['completed', 'failed', 'running']).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const page = input.page;
      const limit = input.limit;
      const offset = (page - 1) * limit;

      const conditions = [eq(cronJobHistory.cronJobId, input.cronJobId)];
      if (input.status) {
        conditions.push(eq(cronJobHistory.status, input.status));
      }

      const [history, countResult] = await Promise.all([
        db.select().from(cronJobHistory).where(and(...conditions)).orderBy(desc(cronJobHistory.startedAt)).limit(limit).offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(cronJobHistory).where(and(...conditions)),
      ]);

      return {
        history,
        pagination: {
          page,
          limit,
          total: countResult[0]?.count ?? 0,
          totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
        },
      };
    }),

  create: adminProcedure.input(cronJobInputSchema).mutation(async ({ input, ctx }) => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const nextRunAt = calculateNextRun(input.frequency, input.cronExpression);

    const [created] = await db
      .insert(cronJobs)
      .values({
        ...input,
        jobPayload: serializeJobPayload(input.jobPayload),
        nextRunAt,
        createdBy: ctx.user?.id,
      })
      .returning();

    return normalizeCronJob(created);
  }),

  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        jobType: z.string().min(1).max(100).optional(),
        queueName: z.string().min(1).max(100).optional(),
        jobPayload: z.record(z.unknown()).optional(),
        frequency: cronFrequencySchema.optional(),
        cronExpression: z.string().optional(),
        enabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const { id, ...updates } = input;
      const existing = await db.select().from(cronJobs).where(eq(cronJobs.id, id)).limit(1);
      if (!existing[0]) {
        throw new Error('Cron job not found');
      }

      const currentJob = existing[0];
      const payloadUpdates: Record<string, unknown> = { ...updates };

      if ('jobPayload' in updates) {
        payloadUpdates.jobPayload = serializeJobPayload(updates.jobPayload);
      }

      if (updates.frequency !== undefined || updates.cronExpression !== undefined) {
        payloadUpdates.nextRunAt = calculateNextRun(
          updates.frequency ?? currentJob.frequency,
          updates.cronExpression ?? currentJob.cronExpression ?? undefined
        );
      }

      const [updated] = await db.update(cronJobs).set(payloadUpdates).where(eq(cronJobs.id, id)).returning();
      return normalizeCronJob(updated);
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await db.delete(cronJobHistory).where(eq(cronJobHistory.cronJobId, input.id));
      await db.delete(cronJobs).where(eq(cronJobs.id, input.id));

      return { success: true };
    }),

  runNow: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const job = await db.select().from(cronJobs).where(eq(cronJobs.id, input.id)).limit(1);
      if (!job[0]) throw new Error('Cron job not found');

      // Execução real: o scheduler cria o histórico, despacha o job
      // (BullMQ ou handler inline) e atualiza status, duração e metadata.
      const historyEntry = await executeCronJob(input.id);

      if (!historyEntry) {
        throw new Error('Falha ao executar o cron job (cronScheduler retornou null)');
      }

      return {
        success: true,
        jobId: input.id,
        historyId: historyEntry.id,
      };
    }),

  // Tipos de cron jobs suportados nativamente pelo dispatcher
  getSupportedJobTypes: publicProcedure.query(async () => {
    return listSupportedCronJobTypes().sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }),

  // Snapshot de SLA por jobType + indicadores globais
  getSlaSnapshot: publicProcedure
    .input(
      z
        .object({
          stuckThresholdMinutes: z.number().int().min(1).max(360).optional(),
          consecutiveFailuresAlertThreshold: z.number().int().min(1).max(50).optional(),
          windowDaysShort: z.number().int().min(1).max(30).optional(),
          windowDaysLong: z.number().int().min(1).max(180).optional(),
          perJobLimit: z.number().int().min(50).max(5000).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return computeCronSlaSnapshot(input ?? {});
    }),

  getStats: publicProcedure
    .input(
      z
        .object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const conditions = [];
      if (input?.startDate) {
        conditions.push(gte(cronJobHistory.startedAt, input.startDate));
      }
      if (input?.endDate) {
        conditions.push(lte(cronJobHistory.startedAt, input.endDate));
      }

      const [completedCount, failedCount, totalJobs] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(cronJobHistory).where(and(...conditions, eq(cronJobHistory.status, 'completed'))),
        db.select({ count: sql<number>`count(*)` }).from(cronJobHistory).where(and(...conditions, eq(cronJobHistory.status, 'failed'))),
        db.select({ count: sql<number>`count(*)` }).from(cronJobs),
      ]);

      const avgDuration = await db
        .select({
          avgDuration: sql<number>`avg(duration)`,
        })
        .from(cronJobHistory)
        .where(and(...conditions, eq(cronJobHistory.status, 'completed')));

      return {
        totalJobs: totalJobs[0]?.count ?? 0,
        completedExecutions: completedCount[0]?.count ?? 0,
        failedExecutions: failedCount[0]?.count ?? 0,
        avgDurationMs: Math.round(avgDuration[0]?.avgDuration ?? 0),
      };
    }),

  getSettings: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const settings = await db.select().from(cronSettings).orderBy(cronSettings.settingKey);
    return settings.reduce<Record<string, string>>((acc, setting) => {
      acc[setting.settingKey] = setting.settingValue;
      return acc;
    }, {});
  }),

  updateSettings: adminProcedure
    .input(z.object({ settings: cronSettingsSchema }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      await Promise.all(
        Object.entries(input.settings).map(([key, value]) =>
          db
            .insert(cronSettings)
            .values({
              settingKey: key,
              settingValue: value,
              updatedAt: new Date(),
            })
            .onDuplicateKeyUpdate({
              set: {
                settingValue: value,
                updatedAt: new Date(),
              },
            })
        )
      );

      return { success: true };
    }),

  getUpcomingExecutions: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(10),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error('Database not available');

      const limit = input?.limit ?? 10;
      const now = new Date();

      const jobs = await db
        .select()
        .from(cronJobs)
        .where(and(eq(cronJobs.enabled, true), sql`${cronJobs.nextRunAt} > ${now}`))
        .orderBy(cronJobs.nextRunAt)
        .limit(limit);

      return jobs.map(normalizeCronJob);
    }),

  validateCronExpression: publicProcedure
    .input(
      z.object({
        expression: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        cron.validate(input.expression);
        return { valid: true };
      } catch {
        return { valid: false, error: 'Expressão cron inválida' };
      }
    }),
});

function calculateNextRun(frequency: string, cronExpression?: string): Date {
  const now = new Date();

  if (cronExpression && cron.validate(cronExpression)) {
    return cron.sendAt(cronExpression);
  }

  const next = new Date(now);

  switch (frequency) {
    case 'minute':
      next.setMinutes(next.getMinutes() + 1);
      break;
    case 'hourly':
      next.setHours(next.getHours() + 1, 0, 0, 0);
      break;
    case 'daily':
      next.setDate(next.getDate() + 1);
      next.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      next.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      next.setHours(0, 0, 0, 0);
      break;
  }

  return next;
}

function serializeJobPayload(payload?: Record<string, unknown>) {
  if (!payload || Object.keys(payload).length === 0) return undefined;
  return JSON.stringify(payload);
}

function normalizeCronJob<T extends { jobPayload?: unknown }>(job: T) {
  if (!job) return job;

  const rawPayload = typeof job.jobPayload === 'string' ? job.jobPayload : undefined;
  return {
    ...job,
    jobPayload: rawPayload ? safeParseJson<Record<string, unknown>>(rawPayload) : job.jobPayload,
  };
}

function safeParseJson<T>(value: string): T | undefined {
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

export type CronRouter = typeof cronRouter;
export type CronTemplate = (typeof CRON_JOB_CONFIGS)[keyof typeof CRON_JOB_CONFIGS] & { jobType?: CronJobType };
