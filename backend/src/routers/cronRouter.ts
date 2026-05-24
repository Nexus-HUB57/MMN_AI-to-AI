import { TRPCError } from "@trpc/server";
import { z } from "zod";
import cron from "node-cron";

import { router, publicProcedure, adminProcedure } from "../trpc/trpc";
import { getDb } from "../../../database/schemas/db";
import {
  CRON_JOB_CONFIGS,
  type CronJobType,
} from "../../../database/schemas/schema-cron";
import {
  computeCronStats,
  deleteCronJobRecord,
  findCronJobById,
  insertCronJobRecord,
  listCronJobsPage,
  listCronJobHistoryPage,
  listCronSettings,
  listUpcomingCronExecutions,
  updateCronJobRecord,
  upsertCronSetting,
} from "../domains/cron/repository";
import {
  CronJobNotFoundError,
  createCronJob,
  deleteCronJob,
  getCronJobById,
  getCronSettings,
  getCronStats,
  getUpcomingCronExecutions,
  listCronJobHistory,
  listCronJobs,
  listCronTemplates,
  updateCronJob,
  updateCronSettings,
  validateCronExpression,
  type CronServiceDeps,
} from "../domains/cron/service";
import { executeCronJob } from "../services/cronScheduler";
import { listSupportedCronJobTypes } from "../services/cronDispatcher";
import { computeCronSlaSnapshot } from "../services/cronSlaIndicators";
import {
  acknowledgeCronAlert,
  evaluateCronAlerts,
  listActiveCronAlerts,
} from "../services/cronAlerts";
import { getCronAlertContext } from "../services/cronAlertContext";
import {
  getCronAlertInsightSnapshot,
  listCronAlertHistory,
} from "../services/cronAlertHistory";

const cronFrequencySchema = z.enum(["minute", "hourly", "daily", "weekly", "monthly"]);

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

const cronValidator = {
  validate: (expression: string) => cron.validate(expression),
  sendAt: (expression: string) => (cron as any).sendAt(expression),
};

async function getDbOrThrow() {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available",
    });
  }
  return db;
}

function buildCronDeps(db: unknown): CronServiceDeps {
  return {
    listCronJobsPage: (filters) => listCronJobsPage(db, filters),
    findCronJobById: (id) => findCronJobById(db, id),
    insertCronJobRecord: (values) => insertCronJobRecord(db, values),
    updateCronJobRecord: (id, data) => updateCronJobRecord(db, id, data),
    deleteCronJobRecord: (id) => deleteCronJobRecord(db, id),
    listCronJobHistoryPage: (filters) => listCronJobHistoryPage(db, filters),
    computeCronStats: (filters) => computeCronStats(db, filters),
    listCronSettings: () => listCronSettings(db),
    upsertCronSetting: (input) => upsertCronSetting(db, input),
    listUpcomingCronExecutions: (limit) => listUpcomingCronExecutions(db, limit),
    cron: cronValidator,
  };
}

function handleCronError(
  error: unknown,
  options: { operation: string; internalMessage: string },
): never {
  if (error instanceof CronJobNotFoundError) {
    throw new TRPCError({ code: "NOT_FOUND", message: error.message });
  }

  console.error(`[cronRouter] ${options.operation}:`, error);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: options.internalMessage,
  });
}

/**
 * Cron Jobs Router
 * Camada de transporte; lógica de listagem/CRUD/SLA delegada ao domínio
 * `backend/src/domains/cron/`.
 */
export const cronRouter = router({
  getTemplates: publicProcedure.query(async () => listCronTemplates()),

  list: publicProcedure
    .input(
      z
        .object({
          enabled: z.boolean().optional(),
          jobType: z.string().optional(),
          page: z.number().min(1).default(1),
          limit: z.number().min(1).max(100).default(20),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getDbOrThrow();
      try {
        return await listCronJobs(
          {
            enabled: input?.enabled,
            jobType: input?.jobType,
            page: input?.page ?? 1,
            limit: input?.limit ?? 20,
          },
          buildCronDeps(db),
        );
      } catch (error) {
        handleCronError(error, {
          operation: "Error listing cron jobs",
          internalMessage: "Falha ao listar cron jobs",
        });
      }
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await getDbOrThrow();
      try {
        return await getCronJobById(input.id, buildCronDeps(db));
      } catch (error) {
        handleCronError(error, {
          operation: "Error fetching cron job",
          internalMessage: "Falha ao buscar cron job",
        });
      }
    }),

  getHistory: publicProcedure
    .input(
      z.object({
        cronJobId: z.number(),
        status: z.enum(["completed", "failed", "running"]).optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ input }) => {
      const db = await getDbOrThrow();
      try {
        return await listCronJobHistory(input, buildCronDeps(db));
      } catch (error) {
        handleCronError(error, {
          operation: "Error fetching cron history",
          internalMessage: "Falha ao buscar histórico do cron",
        });
      }
    }),

  create: adminProcedure
    .input(cronJobInputSchema)
    .mutation(async ({ input, ctx }) => {
      const db = await getDbOrThrow();
      try {
        return await createCronJob(
          { input, createdBy: ctx.user?.id },
          buildCronDeps(db),
        );
      } catch (error) {
        handleCronError(error, {
          operation: "Error creating cron job",
          internalMessage: "Falha ao criar cron job",
        });
      }
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
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDbOrThrow();
      try {
        return await updateCronJob(input, buildCronDeps(db));
      } catch (error) {
        handleCronError(error, {
          operation: "Error updating cron job",
          internalMessage: "Falha ao atualizar cron job",
        });
      }
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDbOrThrow();
      try {
        return await deleteCronJob(input.id, buildCronDeps(db));
      } catch (error) {
        handleCronError(error, {
          operation: "Error deleting cron job",
          internalMessage: "Falha ao remover cron job",
        });
      }
    }),

  runNow: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDbOrThrow();
      const job = await findCronJobById(db, input.id);
      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cron job não encontrado" });
      }

      const historyEntry = await executeCronJob(input.id);
      if (!historyEntry) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao executar o cron job (cronScheduler retornou null)",
        });
      }

      return {
        success: true,
        jobId: input.id,
        historyId: historyEntry.id,
      };
    }),

  // Tipos de cron jobs suportados nativamente pelo dispatcher
  getSupportedJobTypes: publicProcedure.query(async () => {
    return listSupportedCronJobTypes().sort((a, b) => a.localeCompare(b, "pt-BR"));
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
        .optional(),
    )
    .query(async ({ input }) => computeCronSlaSnapshot(input ?? {})),

  getActiveAlerts: publicProcedure.query(async () => listActiveCronAlerts()),

  getAlertHistory: adminProcedure
    .input(
      z
        .object({
          page: z.number().int().min(1).default(1),
          limit: z.number().int().min(1).max(50).default(8),
          state: z.enum(["all", "active", "resolved"]).optional(),
          severity: z.enum(["warning", "critical"]).optional(),
          alertType: z
            .enum([
              "cron_critical_failures",
              "cron_stuck_job",
              "cron_degraded_success_rate",
            ])
            .optional(),
          jobType: z.string().min(1).optional(),
          acknowledgement: z.enum(["all", "acknowledged", "unacknowledged"]).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => listCronAlertHistory(input ?? {})),

  getAlertInsights: adminProcedure
    .input(
      z
        .object({
          days: z.number().int().min(1).max(180).default(30),
        })
        .optional(),
    )
    .query(async ({ input }) => getCronAlertInsightSnapshot(input?.days ?? 30)),

  getAlertContext: adminProcedure
    .input(
      z.object({
        alertId: z.string().min(1),
        limit: z.number().int().min(1).max(10).default(5).optional(),
      }),
    )
    .query(async ({ input }) => getCronAlertContext(input.alertId, input.limit ?? 5)),

  evaluateAlerts: adminProcedure
    .input(
      z
        .object({
          cooldownMinutes: z.number().int().min(1).max(720).optional(),
          notifyAdmins: z.boolean().optional(),
          successRateAlertThreshold: z.number().int().min(1).max(100).optional(),
        })
        .optional(),
    )
    .mutation(async ({ input }) => evaluateCronAlerts(input ?? {})),

  acknowledgeAlert: adminProcedure
    .input(z.object({ alertId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const acknowledged = await acknowledgeCronAlert(input.alertId, ctx.user?.id);
      if (!acknowledged) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Alerta não encontrado entre os ativos",
        });
      }
      return acknowledged;
    }),

  getStats: publicProcedure
    .input(
      z
        .object({
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getDbOrThrow();
      try {
        return await getCronStats(
          {
            startDate: input?.startDate,
            endDate: input?.endDate,
          },
          buildCronDeps(db),
        );
      } catch (error) {
        handleCronError(error, {
          operation: "Error computing cron stats",
          internalMessage: "Falha ao calcular estatísticas",
        });
      }
    }),

  getSettings: publicProcedure.query(async () => {
    const db = await getDbOrThrow();
    try {
      return await getCronSettings(buildCronDeps(db));
    } catch (error) {
      handleCronError(error, {
        operation: "Error reading cron settings",
        internalMessage: "Falha ao buscar configurações",
      });
    }
  }),

  updateSettings: adminProcedure
    .input(z.object({ settings: cronSettingsSchema }))
    .mutation(async ({ input }) => {
      const db = await getDbOrThrow();
      try {
        return await updateCronSettings(input.settings, buildCronDeps(db));
      } catch (error) {
        handleCronError(error, {
          operation: "Error updating cron settings",
          internalMessage: "Falha ao atualizar configurações",
        });
      }
    }),

  getUpcomingExecutions: publicProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(50).default(10),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = await getDbOrThrow();
      try {
        return await getUpcomingCronExecutions(input?.limit ?? 10, buildCronDeps(db));
      } catch (error) {
        handleCronError(error, {
          operation: "Error fetching upcoming executions",
          internalMessage: "Falha ao buscar próximas execuções",
        });
      }
    }),

  validateCronExpression: publicProcedure
    .input(
      z.object({
        expression: z.string(),
      }),
    )
    .query(async ({ input }) => validateCronExpression(input.expression, cronValidator)),
});

export type CronRouter = typeof cronRouter;
export type CronTemplate = (typeof CRON_JOB_CONFIGS)[keyof typeof CRON_JOB_CONFIGS] & {
  jobType?: CronJobType;
};
