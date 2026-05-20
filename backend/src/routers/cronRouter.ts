import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc/trpc';
import { getDb } from '../../../database/schemas/db';
import { cronJobs, cronJobHistory, cronSettings, type CRON_JOB_TYPES, type CronJobType } from '../../../database/schemas/schema-cron';
import { eq, desc, and, sql, gte, lte } from 'drizzle-orm';
import cron from 'node-cron';

/**
 * Cron Jobs Router
 * Gerenciamento de automação Cron para tarefas recorrentes
 */

export const cronRouter = router({
  // Listar todos os cron jobs
  list: publicProcedure
    .input(z.object({
      enabled: z.boolean().optional(),
      jobType: z.string().optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

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
        db.select().from(cronJobs)
          .where(where)
          .orderBy(desc(cronJobs.updatedAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(cronJobs).where(where),
      ]);

      return {
        jobs,
        pagination: {
          page,
          limit,
          total: countResult[0]?.count ?? 0,
          totalPages: Math.ceil((countResult[0]?.count ?? 0) / limit),
        },
      };
    }),

  // Obter cron job por ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const job = await db.select().from(cronJobs).where(eq(cronJobs.id, input.id)).limit(1);
      return job[0] ?? null;
    }),

  // Obter histórico de um cron job
  getHistory: publicProcedure
    .input(z.object({
      cronJobId: z.number(),
      status: z.enum(['completed', 'failed', 'running']).optional(),
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(100).default(20),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const page = input.page;
      const limit = input.limit;
      const offset = (page - 1) * limit;

      const conditions = [eq(cronJobHistory.cronJobId, input.cronJobId)];
      if (input.status) {
        conditions.push(eq(cronJobHistory.status, input.status));
      }

      const [history, countResult] = await Promise.all([
        db.select().from(cronJobHistory)
          .where(and(...conditions))
          .orderBy(desc(cronJobHistory.startedAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(cronJobHistory)
          .where(and(...conditions)),
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

  // Criar novo cron job (admin)
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      jobType: z.string().min(1).max(100),
      queueName: z.string().min(1).max(100),
      jobPayload: z.record(z.unknown()).optional(),
      frequency: z.enum(['minute', 'hourly', 'daily', 'weekly', 'monthly']),
      cronExpression: z.string().optional(),
      enabled: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const nextRunAt = calculateNextRun(input.frequency, input.cronExpression);

      const [created] = await db.insert(cronJobs).values({
        ...input,
        nextRunAt,
        createdBy: ctx.user?.id,
      }).returning();

      return created;
    }),

  // Atualizar cron job (admin)
  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      jobType: z.string().min(1).max(100).optional(),
      queueName: z.string().min(1).max(100).optional(),
      jobPayload: z.record(z.unknown()).optional(),
      frequency: z.enum(['minute', 'hourly', 'daily', 'weekly', 'monthly']).optional(),
      cronExpression: z.string().optional(),
      enabled: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { id, ...updates } = input;

      // Recalcular próxima execução se frequência ou expressão mudou
      if (updates.frequency || updates.cronExpression) {
        updates.nextRunAt = calculateNextRun(
          updates.frequency ?? 'daily',
          updates.cronExpression
        );
      }

      const [updated] = await db.update(cronJobs)
        .set(updates)
        .where(eq(cronJobs.id, id))
        .returning();

      return updated;
    }),

  // Deletar cron job (admin)
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(cronJobHistory).where(eq(cronJobHistory.cronJobId, input.id));
      await db.delete(cronJobs).where(eq(cronJobs.id, input.id));

      return { success: true };
    }),

  // Executar cron job manualmente (admin)
  runNow: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const job = await db.select().from(cronJobs).where(eq(cronJobs.id, input.id)).limit(1);
      if (!job[0]) throw new Error("Cron job not found");

      // Criar registro de execução
      const [historyEntry] = await db.insert(cronJobHistory).values({
        cronJobId: input.id,
        startedAt: new Date(),
        status: 'running',
      }).returning();

      return {
        success: true,
        jobId: input.id,
        historyId: historyEntry.id,
      };
    }),

  // Obter estatísticas de execução
  getStats: publicProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const conditions = [];
      if (input?.startDate) {
        conditions.push(gte(cronJobHistory.startedAt, input.startDate));
      }
      if (input?.endDate) {
        conditions.push(lte(cronJobHistory.startedAt, input.endDate));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const [completedCount, failedCount, totalJobs] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(cronJobHistory)
          .where(and(...conditions, eq(cronJobHistory.status, 'completed'))),
        db.select({ count: sql<number>`count(*)` }).from(cronJobHistory)
          .where(and(...conditions, eq(cronJobHistory.status, 'failed'))),
        db.select({ count: sql<number>`count(*)` }).from(cronJobs),
      ]);

      const avgDuration = await db.select({
        avgDuration: sql<number>`avg(duration)`,
      }).from(cronJobHistory).where(and(...conditions, eq(cronJobHistory.status, 'completed')));

      return {
        totalJobs: totalJobs[0]?.count ?? 0,
        completedExecutions: completedCount[0]?.count ?? 0,
        failedExecutions: failedCount[0]?.count ?? 0,
        avgDurationMs: Math.round(avgDuration[0]?.avgDuration ?? 0),
      };
    }),

  // Obter configurações globais
  getSettings: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const settings = await db.select().from(cronSettings);
      return settings.reduce((acc, s) => {
        (acc as Record<string, string>)[s.settingKey] = s.settingValue;
        return acc;
      }, {});
    }),

  // Atualizar configurações globais (admin)
  updateSettings: adminProcedure
    .input(z.object({
      settings: z.record(z.string()),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      for (const [key, value] of Object.entries(input.settings)) {
        await db.insert(cronSettings)
          .values({
            settingKey: key,
            settingValue: value,
          })
          .onDuplicateKeyUpdate({
            settingValue: value,
          });
      }

      return { success: true };
    }),

  // Obter próximas execuções
  getUpcomingExecutions: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const limit = input?.limit ?? 10;
      const now = new Date();

      const jobs = await db.select().from(cronJobs)
        .where(and(
          eq(cronJobs.enabled, true),
          sql`${cronJobs.nextRunAt} > ${now}`
        ))
        .orderBy(cronJobs.nextRunAt)
        .limit(limit);

      return jobs;
    }),

  // Verificar se expressão cron é válida
  validateCronExpression: publicProcedure
    .input(z.object({
      expression: z.string(),
    }))
    .query(async ({ input }) => {
      try {
        cron.validate(input.expression);
        return { valid: true };
      } catch {
        return { valid: false, error: 'Expressão cron inválida' };
      }
    }),
});

/**
 * Calcula a próxima data de execução baseada na frequência
 */
function calculateNextRun(frequency: string, cronExpression?: string): Date {
  const now = new Date();

  if (cronExpression && cron.validate(cronExpression)) {
    // Se tem expressão cron, calcular próxima execução
    const nextDates = cron.sendAt(cronExpression);
    return nextDates;
  }

  // Calcular baseado na frequência
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

// Exportar tipos
export type CronRouter = typeof cronRouter;