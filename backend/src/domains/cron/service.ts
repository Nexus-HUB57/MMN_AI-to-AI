import { CRON_JOB_CONFIGS } from "../../../../database/schemas/schema-cron";

import type {
  CronHistoryFilters,
  CronJobFrequency,
  CronJobInput,
  CronJobUpdateInput,
  CronListFilters,
  CronPagination,
  CronStatsFilters,
  CronStatsView,
} from "./types";

export class CronJobNotFoundError extends Error {
  constructor() {
    super("Cron job não encontrado");
    this.name = "CronJobNotFoundError";
  }
}

export interface CronValidator {
  validate: (expression: string) => boolean;
  sendAt: (expression: string) => Date;
}

export interface CronServiceDeps {
  listCronJobsPage: (filters: CronListFilters) => Promise<{ rows: any[]; total: number }>;
  findCronJobById: (id: number) => Promise<any | null>;
  insertCronJobRecord: (values: Record<string, unknown>) => Promise<any>;
  updateCronJobRecord: (id: number, data: Record<string, unknown>) => Promise<any | null>;
  deleteCronJobRecord: (id: number) => Promise<void>;
  listCronJobHistoryPage: (filters: CronHistoryFilters) => Promise<{ history: any[]; total: number }>;
  computeCronStats: (filters: CronStatsFilters) => Promise<CronStatsView>;
  listCronSettings: () => Promise<any[]>;
  upsertCronSetting: (input: { settingKey: string; settingValue: string }) => Promise<void>;
  listUpcomingCronExecutions: (limit: number) => Promise<any[]>;
  cron: CronValidator;
}

function buildPagination(page: number, limit: number, total: number): CronPagination {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

function safeParseJson<T>(value: string): T | undefined {
  try {
    return JSON.parse(value) as T;
  } catch {
    return undefined;
  }
}

export function normalizeCronJob<T extends { jobPayload?: unknown }>(job: T) {
  if (!job) return job;

  const rawPayload = typeof job.jobPayload === "string" ? job.jobPayload : undefined;
  return {
    ...job,
    jobPayload: rawPayload
      ? safeParseJson<Record<string, unknown>>(rawPayload)
      : job.jobPayload,
  };
}

export function serializeJobPayload(payload?: Record<string, unknown>) {
  if (!payload || Object.keys(payload).length === 0) return undefined;
  return JSON.stringify(payload);
}

export function calculateNextRun(
  frequency: CronJobFrequency | string,
  cronExpression: string | undefined,
  cron: CronValidator,
  now: Date = new Date(),
): Date {
  if (cronExpression && cron.validate(cronExpression)) {
    return cron.sendAt(cronExpression);
  }

  const next = new Date(now);

  switch (frequency) {
    case "minute":
      next.setMinutes(next.getMinutes() + 1);
      break;
    case "hourly":
      next.setHours(next.getHours() + 1, 0, 0, 0);
      break;
    case "daily":
      next.setDate(next.getDate() + 1);
      next.setHours(0, 0, 0, 0);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      next.setHours(0, 0, 0, 0);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      next.setHours(0, 0, 0, 0);
      break;
    default:
      next.setDate(next.getDate() + 1);
      next.setHours(0, 0, 0, 0);
      break;
  }

  return next;
}

export function listCronTemplates() {
  return Object.values(CRON_JOB_CONFIGS)
    .map((config) => ({
      name: config.name ?? "",
      description: config.description ?? "",
      jobType: config.jobType ?? "",
      queueName: config.queueName ?? "",
      frequency: config.frequency ?? "daily",
    }))
    .filter((template) => template.jobType && template.queueName)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function listCronJobs(filters: CronListFilters, deps: CronServiceDeps) {
  const { rows, total } = await deps.listCronJobsPage(filters);

  return {
    jobs: rows.map(normalizeCronJob),
    pagination: buildPagination(filters.page, filters.limit, total),
  };
}

export async function getCronJobById(id: number, deps: CronServiceDeps) {
  const job = await deps.findCronJobById(id);
  return job ? normalizeCronJob(job) : null;
}

export async function listCronJobHistory(
  filters: CronHistoryFilters,
  deps: CronServiceDeps,
) {
  const { history, total } = await deps.listCronJobHistoryPage(filters);

  return {
    history,
    pagination: buildPagination(filters.page, filters.limit, total),
  };
}

export async function createCronJob(
  params: { input: CronJobInput; createdBy?: number },
  deps: CronServiceDeps,
) {
  const nextRunAt = calculateNextRun(
    params.input.frequency,
    params.input.cronExpression,
    deps.cron,
  );

  const created = await deps.insertCronJobRecord({
    ...params.input,
    jobPayload: serializeJobPayload(params.input.jobPayload),
    nextRunAt,
    createdBy: params.createdBy,
  });

  return normalizeCronJob(created);
}

export async function updateCronJob(input: CronJobUpdateInput, deps: CronServiceDeps) {
  const existing = await deps.findCronJobById(input.id);
  if (!existing) {
    throw new CronJobNotFoundError();
  }

  const { id, ...updates } = input;
  const payloadUpdates: Record<string, unknown> = { ...updates };

  if ("jobPayload" in updates) {
    payloadUpdates.jobPayload = serializeJobPayload(updates.jobPayload);
  }

  if (updates.frequency !== undefined || updates.cronExpression !== undefined) {
    payloadUpdates.nextRunAt = calculateNextRun(
      updates.frequency ?? existing.frequency,
      updates.cronExpression ?? existing.cronExpression ?? undefined,
      deps.cron,
    );
  }

  const updated = await deps.updateCronJobRecord(id, payloadUpdates);
  if (!updated) {
    throw new CronJobNotFoundError();
  }

  return normalizeCronJob(updated);
}

export async function deleteCronJob(id: number, deps: CronServiceDeps) {
  await deps.deleteCronJobRecord(id);
  return { success: true };
}

export async function getCronStats(filters: CronStatsFilters, deps: CronServiceDeps) {
  return deps.computeCronStats(filters);
}

export async function getCronSettings(deps: CronServiceDeps) {
  const rows = await deps.listCronSettings();
  return rows.reduce<Record<string, string>>((acc, setting) => {
    acc[setting.settingKey] = setting.settingValue;
    return acc;
  }, {});
}

export async function updateCronSettings(
  settings: Record<string, string>,
  deps: CronServiceDeps,
) {
  await Promise.all(
    Object.entries(settings).map(([key, value]) =>
      deps.upsertCronSetting({ settingKey: key, settingValue: value }),
    ),
  );

  return { success: true };
}

export async function getUpcomingCronExecutions(limit: number, deps: CronServiceDeps) {
  const rows = await deps.listUpcomingCronExecutions(limit);
  return rows.map(normalizeCronJob);
}

export function validateCronExpression(expression: string, cron: CronValidator) {
  try {
    cron.validate(expression);
    return { valid: true } as const;
  } catch {
    return { valid: false, error: "Expressão cron inválida" } as const;
  }
}
