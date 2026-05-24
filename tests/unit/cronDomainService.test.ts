import { describe, expect, it, vi } from "vitest";

import {
  CronJobNotFoundError,
  calculateNextRun,
  createCronJob,
  deleteCronJob,
  getCronJobById,
  getCronSettings,
  getCronStats,
  getUpcomingCronExecutions,
  listCronJobHistory,
  listCronJobs,
  listCronTemplates,
  serializeJobPayload,
  updateCronJob,
  updateCronSettings,
  validateCronExpression,
} from "../../backend/src/domains/cron/service";

function buildCronValidator(now = new Date("2026-05-24T00:00:00.000Z")) {
  return {
    validate: vi.fn((expression: string) => expression === "0 * * * *"),
    sendAt: vi.fn(() => new Date(now.getTime() + 60 * 60 * 1000)),
  };
}

function buildDeps(overrides: Record<string, unknown> = {}) {
  const job = {
    id: 1,
    name: "Marketplace Sync",
    description: "Sync marketplace data",
    jobType: "marketplace_sync",
    queueName: "marketplace_sync_queue",
    jobPayload: JSON.stringify({ scope: "all" }),
    frequency: "hourly",
    cronExpression: "0 * * * *",
    enabled: true,
    nextRunAt: new Date("2026-05-24T01:00:00.000Z"),
    updatedAt: new Date("2026-05-23T00:00:00.000Z"),
  };

  const deps = {
    listCronJobsPage: vi.fn(async () => ({ rows: [job], total: 1 })),
    findCronJobById: vi.fn(async (id: number) => (id === job.id ? job : null)),
    insertCronJobRecord: vi.fn(async (values: any) => ({ ...job, ...values, id: 99 })),
    updateCronJobRecord: vi.fn(async (_id: number, data: any) => ({ ...job, ...data })),
    deleteCronJobRecord: vi.fn(async () => undefined),
    listCronJobHistoryPage: vi.fn(async () => ({
      history: [
        {
          id: 10,
          cronJobId: job.id,
          startedAt: new Date("2026-05-23T00:00:00.000Z"),
          completedAt: new Date("2026-05-23T00:01:00.000Z"),
          duration: 60000,
          status: "completed",
        },
      ],
      total: 1,
    })),
    computeCronStats: vi.fn(async () => ({
      totalJobs: 3,
      completedExecutions: 10,
      failedExecutions: 1,
      avgDurationMs: 1500,
    })),
    listCronSettings: vi.fn(async () => [
      { settingKey: "timezone", settingValue: "America/Sao_Paulo" },
      { settingKey: "alerts_channel", settingValue: "ops" },
    ]),
    upsertCronSetting: vi.fn(async () => undefined),
    listUpcomingCronExecutions: vi.fn(async () => [job]),
    cron: buildCronValidator(),
  };

  return { job, deps: { ...deps, ...overrides } };
}

describe("cron domain service", () => {
  it("lista templates configurados ordenados em pt-BR", () => {
    const templates = listCronTemplates();
    expect(templates.length).toBeGreaterThan(5);
    expect(templates.every((tpl) => tpl.jobType && tpl.queueName)).toBe(true);
  });

  it("calcula próxima execução usando expressão cron válida", () => {
    const deps = buildDeps().deps;
    const result = calculateNextRun("hourly", "0 * * * *", deps.cron);
    expect(deps.cron.sendAt).toHaveBeenCalled();
    expect(result).toBeInstanceOf(Date);
  });

  it("calcula próxima execução com fallback por frequência quando expressão é inválida", () => {
    const cron = buildCronValidator();
    cron.validate = vi.fn(() => false);
    const now = new Date("2026-05-24T10:30:00.000Z");
    const result = calculateNextRun("daily", undefined, cron, now);
    expect(result.toISOString()).toBe("2026-05-25T00:00:00.000Z");
  });

  it("lista cron jobs com paginação e desserializa jobPayload", async () => {
    const { deps } = buildDeps();
    const result = await listCronJobs({ page: 1, limit: 20 }, deps as any);
    expect(result.jobs).toHaveLength(1);
    expect(result.jobs[0].jobPayload).toEqual({ scope: "all" });
    expect(result.pagination).toEqual({
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });
  });

  it("busca cron job por id e retorna null quando ausente", async () => {
    const { deps } = buildDeps();
    const found = await getCronJobById(1, deps as any);
    expect(found?.id).toBe(1);

    const missing = await getCronJobById(404, deps as any);
    expect(missing).toBeNull();
  });

  it("cria cron job calculando nextRunAt e serializando payload", async () => {
    const { deps } = buildDeps();
    const created = await createCronJob(
      {
        createdBy: 7,
        input: {
          name: "Daily report",
          jobType: "report_generation",
          queueName: "reports_queue",
          frequency: "daily",
          enabled: true,
          jobPayload: { format: "pdf" },
        },
      },
      deps as any,
    );

    expect(created.id).toBe(99);
    const inserted = (deps.insertCronJobRecord as any).mock.calls[0][0];
    expect(inserted.jobPayload).toBe(JSON.stringify({ format: "pdf" }));
    expect(inserted.nextRunAt).toBeInstanceOf(Date);
    expect(inserted.createdBy).toBe(7);
  });

  it("atualiza cron job e relança erro quando não encontrado", async () => {
    const { deps } = buildDeps();
    const updated = await updateCronJob(
      {
        id: 1,
        frequency: "daily",
        jobPayload: { foo: "bar" },
      },
      deps as any,
    );

    expect(updated.frequency).toBe("daily");
    const updateData = (deps.updateCronJobRecord as any).mock.calls[0][1];
    expect(updateData.jobPayload).toBe(JSON.stringify({ foo: "bar" }));
    expect(updateData.nextRunAt).toBeInstanceOf(Date);

    const missingDeps = buildDeps({
      findCronJobById: vi.fn(async () => null),
    }).deps;

    await expect(
      updateCronJob({ id: 999, enabled: false }, missingDeps as any),
    ).rejects.toBeInstanceOf(CronJobNotFoundError);
  });

  it("deleta cron job retornando success", async () => {
    const { deps } = buildDeps();
    const result = await deleteCronJob(1, deps as any);
    expect(result).toEqual({ success: true });
    expect(deps.deleteCronJobRecord).toHaveBeenCalledWith(1);
  });

  it("lista histórico, estatísticas e configurações com formatos esperados", async () => {
    const { deps } = buildDeps();
    const history = await listCronJobHistory(
      { cronJobId: 1, page: 1, limit: 10 },
      deps as any,
    );
    expect(history.history).toHaveLength(1);
    expect(history.pagination).toEqual({
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    });

    const stats = await getCronStats({}, deps as any);
    expect(stats).toMatchObject({
      totalJobs: 3,
      completedExecutions: 10,
      failedExecutions: 1,
      avgDurationMs: 1500,
    });

    const settings = await getCronSettings(deps as any);
    expect(settings).toEqual({
      timezone: "America/Sao_Paulo",
      alerts_channel: "ops",
    });
  });

  it("atualiza configurações em lote usando upsert", async () => {
    const { deps } = buildDeps();
    const result = await updateCronSettings(
      {
        timezone: "America/Bahia",
        maintenance_window: "02:00-04:00",
      },
      deps as any,
    );
    expect(result).toEqual({ success: true });
    expect(deps.upsertCronSetting).toHaveBeenCalledTimes(2);
  });

  it("lista próximas execuções e valida expressão cron", async () => {
    const { deps } = buildDeps();
    const upcoming = await getUpcomingCronExecutions(5, deps as any);
    expect(upcoming).toHaveLength(1);

    const ok = validateCronExpression("0 * * * *", deps.cron);
    expect(ok).toEqual({ valid: true });

    const invalidCron = {
      validate: vi.fn(() => {
        throw new Error("invalid");
      }),
      sendAt: vi.fn(() => new Date()),
    };
    const bad = validateCronExpression("not-valid", invalidCron);
    expect(bad).toEqual({ valid: false, error: "Expressão cron inválida" });
  });

  it("serializeJobPayload retorna undefined para payload vazio", () => {
    expect(serializeJobPayload(undefined)).toBeUndefined();
    expect(serializeJobPayload({})).toBeUndefined();
    expect(serializeJobPayload({ x: 1 })).toBe(JSON.stringify({ x: 1 }));
  });
});
