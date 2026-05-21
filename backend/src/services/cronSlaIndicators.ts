/**
 * Cron SLA Indicators
 *
 * Calcula indicadores operacionais de SLA para o domínio Cron a partir
 * de `cron_jobs` e `cron_job_history`. Responsabilidade isolada do
 * router para facilitar testes e reuso (ex.: dashboards de observabilidade,
 * alertas automáticos).
 *
 * Indicadores fornecidos:
 * - taxa de sucesso por jobType nas janelas 7d/30d
 * - p95 de duração calculado em memória (compatível com MySQL sem
 *   PERCENTILE_CONT, usando ordenação + índice)
 * - jobs travados (status `running` há mais que `stuckThresholdMinutes`)
 * - falhas consecutivas atuais (streak desde a última execução com sucesso)
 * - classificação de saúde (`healthy`, `degraded`, `critical`)
 */
import { and, asc, desc, eq, gte, sql } from 'drizzle-orm';
import type { drizzle } from 'drizzle-orm/mysql2';
import { getDb } from '../../../database/schemas/db';
import { cronJobs, cronJobHistory } from '../../../database/schemas/schema-cron';

type Db = NonNullable<Awaited<ReturnType<typeof getDb>>>;

export interface SlaIndicatorOptions {
  stuckThresholdMinutes?: number;
  consecutiveFailuresAlertThreshold?: number;
  windowDaysShort?: number;
  windowDaysLong?: number;
  perJobLimit?: number;
}

export interface JobSlaIndicator {
  jobType: string;
  jobName?: string;
  queueName?: string;
  enabled: boolean;
  lastRunStatus?: string | null;
  totalRuns7d: number;
  totalRuns30d: number;
  successRate7d: number;
  successRate30d: number;
  failureCount7d: number;
  failureCount30d: number;
  p95DurationMs7d: number | null;
  p95DurationMs30d: number | null;
  avgDurationMs30d: number | null;
  consecutiveFailures: number;
  isStuck: boolean;
  stuckSinceMinutes?: number;
  healthStatus: 'healthy' | 'degraded' | 'critical' | 'idle';
  healthReason?: string;
}

export interface GlobalSlaIndicators {
  totalJobs: number;
  enabledJobs: number;
  stuckJobs: number;
  criticalJobs: number;
  degradedJobs: number;
  healthyJobs: number;
  totalRuns30d: number;
  failureRate30d: number;
  avgSuccessRate30d: number;
}

export interface CronSlaSnapshot {
  generatedAt: string;
  options: Required<SlaIndicatorOptions>;
  global: GlobalSlaIndicators;
  jobs: JobSlaIndicator[];
}

const DEFAULT_OPTIONS: Required<SlaIndicatorOptions> = {
  stuckThresholdMinutes: 15,
  consecutiveFailuresAlertThreshold: 3,
  windowDaysShort: 7,
  windowDaysLong: 30,
  perJobLimit: 500,
};

export async function computeCronSlaSnapshot(
  options: SlaIndicatorOptions = {}
): Promise<CronSlaSnapshot> {
  const merged: Required<SlaIndicatorOptions> = { ...DEFAULT_OPTIONS, ...options };
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - merged.windowDaysShort * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - merged.windowDaysLong * 24 * 60 * 60 * 1000);
  const stuckCutoff = new Date(now.getTime() - merged.stuckThresholdMinutes * 60 * 1000);

  const jobs = await db.select().from(cronJobs).orderBy(asc(cronJobs.jobType));

  const indicators: JobSlaIndicator[] = [];

  for (const job of jobs) {
    const indicator = await buildJobIndicator(db, job, {
      now,
      sevenDaysAgo,
      thirtyDaysAgo,
      stuckCutoff,
      stuckThresholdMinutes: merged.stuckThresholdMinutes,
      consecutiveFailuresAlertThreshold: merged.consecutiveFailuresAlertThreshold,
      perJobLimit: merged.perJobLimit,
    });

    indicators.push(indicator);
  }

  const global = buildGlobalIndicators(indicators);

  return {
    generatedAt: now.toISOString(),
    options: merged,
    global,
    jobs: indicators,
  };
}

interface BuildContext {
  now: Date;
  sevenDaysAgo: Date;
  thirtyDaysAgo: Date;
  stuckCutoff: Date;
  stuckThresholdMinutes: number;
  consecutiveFailuresAlertThreshold: number;
  perJobLimit: number;
}

async function buildJobIndicator(
  db: Db,
  job: typeof cronJobs.$inferSelect,
  ctx: BuildContext
): Promise<JobSlaIndicator> {
  const baseFilters = [eq(cronJobHistory.cronJobId, job.id)];

  // Janela 7d
  const [counts7d, durations7d] = await Promise.all([
    db
      .select({
        status: cronJobHistory.status,
        count: sql<number>`count(*)`,
      })
      .from(cronJobHistory)
      .where(and(...baseFilters, gte(cronJobHistory.startedAt, ctx.sevenDaysAgo)))
      .groupBy(cronJobHistory.status),
    db
      .select({ duration: cronJobHistory.duration })
      .from(cronJobHistory)
      .where(
        and(
          ...baseFilters,
          gte(cronJobHistory.startedAt, ctx.sevenDaysAgo),
          eq(cronJobHistory.status, 'completed')
        )
      )
      .orderBy(asc(cronJobHistory.duration))
      .limit(ctx.perJobLimit),
  ]);

  // Janela 30d
  const [counts30d, durations30d, avg30d] = await Promise.all([
    db
      .select({
        status: cronJobHistory.status,
        count: sql<number>`count(*)`,
      })
      .from(cronJobHistory)
      .where(and(...baseFilters, gte(cronJobHistory.startedAt, ctx.thirtyDaysAgo)))
      .groupBy(cronJobHistory.status),
    db
      .select({ duration: cronJobHistory.duration })
      .from(cronJobHistory)
      .where(
        and(
          ...baseFilters,
          gte(cronJobHistory.startedAt, ctx.thirtyDaysAgo),
          eq(cronJobHistory.status, 'completed')
        )
      )
      .orderBy(asc(cronJobHistory.duration))
      .limit(ctx.perJobLimit),
    db
      .select({ avg: sql<number>`avg(duration)` })
      .from(cronJobHistory)
      .where(
        and(
          ...baseFilters,
          gte(cronJobHistory.startedAt, ctx.thirtyDaysAgo),
          eq(cronJobHistory.status, 'completed')
        )
      ),
  ]);

  // Falhas consecutivas (a partir da execução mais recente)
  const recentExecutions = await db
    .select({ status: cronJobHistory.status })
    .from(cronJobHistory)
    .where(eq(cronJobHistory.cronJobId, job.id))
    .orderBy(desc(cronJobHistory.startedAt))
    .limit(20);

  let consecutiveFailures = 0;
  for (const exec of recentExecutions) {
    if (exec.status === 'failed') {
      consecutiveFailures += 1;
    } else if (exec.status === 'completed') {
      break;
    }
  }

  // Stuck detection
  const stuckEntries = await db
    .select({ startedAt: cronJobHistory.startedAt })
    .from(cronJobHistory)
    .where(
      and(
        eq(cronJobHistory.cronJobId, job.id),
        eq(cronJobHistory.status, 'running')
      )
    )
    .orderBy(asc(cronJobHistory.startedAt))
    .limit(5);

  const oldestStuck = stuckEntries.find(
    (entry) => entry.startedAt && new Date(entry.startedAt) < ctx.stuckCutoff
  );
  const isStuck = Boolean(oldestStuck);
  const stuckSinceMinutes = oldestStuck?.startedAt
    ? Math.round(
        (ctx.now.getTime() - new Date(oldestStuck.startedAt).getTime()) / (60 * 1000)
      )
    : undefined;

  const totals7d = aggregateCounts(counts7d);
  const totals30d = aggregateCounts(counts30d);

  const indicator: JobSlaIndicator = {
    jobType: job.jobType,
    jobName: job.name,
    queueName: job.queueName,
    enabled: Boolean(job.enabled),
    lastRunStatus: job.lastRunStatus ?? null,
    totalRuns7d: totals7d.total,
    totalRuns30d: totals30d.total,
    successRate7d: rate(totals7d.completed, totals7d.total),
    successRate30d: rate(totals30d.completed, totals30d.total),
    failureCount7d: totals7d.failed,
    failureCount30d: totals30d.failed,
    p95DurationMs7d: percentile95(durations7d.map((d) => d.duration)),
    p95DurationMs30d: percentile95(durations30d.map((d) => d.duration)),
    avgDurationMs30d: avg30d[0]?.avg ? Math.round(avg30d[0].avg) : null,
    consecutiveFailures,
    isStuck,
    stuckSinceMinutes,
    healthStatus: 'healthy',
  };

  const { status, reason } = classifyHealth(indicator, ctx);
  indicator.healthStatus = status;
  indicator.healthReason = reason;

  return indicator;
}

function aggregateCounts(rows: Array<{ status: string | null; count: number }>) {
  let total = 0;
  let completed = 0;
  let failed = 0;
  let running = 0;
  for (const row of rows) {
    const value = Number(row.count) || 0;
    total += value;
    if (row.status === 'completed') completed += value;
    else if (row.status === 'failed') failed += value;
    else if (row.status === 'running') running += value;
  }
  return { total, completed, failed, running };
}

function rate(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 1000) / 10; // 1 casa decimal
}

function percentile95(durations: Array<number | null | undefined>): number | null {
  const sanitized = durations
    .map((value) => (typeof value === 'number' && value > 0 ? value : null))
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);

  if (!sanitized.length) return null;
  if (sanitized.length === 1) return sanitized[0];

  const idx = Math.ceil(sanitized.length * 0.95) - 1;
  const safeIdx = Math.min(Math.max(idx, 0), sanitized.length - 1);
  return Math.round(sanitized[safeIdx]);
}

function classifyHealth(
  indicator: JobSlaIndicator,
  ctx: BuildContext
): { status: JobSlaIndicator['healthStatus']; reason?: string } {
  if (indicator.isStuck) {
    return {
      status: 'critical',
      reason: `Job em execução há ${indicator.stuckSinceMinutes ?? '?'} min (acima do threshold de ${ctx.stuckThresholdMinutes} min)`,
    };
  }

  if (indicator.consecutiveFailures >= ctx.consecutiveFailuresAlertThreshold) {
    return {
      status: 'critical',
      reason: `${indicator.consecutiveFailures} falhas consecutivas (threshold ${ctx.consecutiveFailuresAlertThreshold})`,
    };
  }

  if (indicator.totalRuns7d === 0 && indicator.totalRuns30d === 0) {
    return { status: 'idle', reason: 'Sem execuções recentes registradas' };
  }

  if (indicator.successRate7d < 80 || indicator.successRate30d < 90) {
    return {
      status: 'degraded',
      reason: `Taxa de sucesso baixa (7d: ${indicator.successRate7d}%, 30d: ${indicator.successRate30d}%)`,
    };
  }

  if (indicator.consecutiveFailures > 0) {
    return {
      status: 'degraded',
      reason: `${indicator.consecutiveFailures} falha(s) recente(s) desde o último sucesso`,
    };
  }

  return { status: 'healthy' };
}

function buildGlobalIndicators(indicators: JobSlaIndicator[]): GlobalSlaIndicators {
  const total = indicators.length;
  const enabled = indicators.filter((i) => i.enabled).length;
  const stuck = indicators.filter((i) => i.isStuck).length;
  const critical = indicators.filter((i) => i.healthStatus === 'critical').length;
  const degraded = indicators.filter((i) => i.healthStatus === 'degraded').length;
  const healthy = indicators.filter((i) => i.healthStatus === 'healthy').length;

  const totalRuns30d = indicators.reduce((acc, i) => acc + i.totalRuns30d, 0);
  const totalFailures30d = indicators.reduce((acc, i) => acc + i.failureCount30d, 0);
  const failureRate30d = rate(totalFailures30d, totalRuns30d);

  const runsForAvg = indicators.filter((i) => i.totalRuns30d > 0);
  const avgSuccessRate30d = runsForAvg.length
    ? Math.round(
        (runsForAvg.reduce((acc, i) => acc + i.successRate30d, 0) / runsForAvg.length) * 10
      ) / 10
    : 0;

  return {
    totalJobs: total,
    enabledJobs: enabled,
    stuckJobs: stuck,
    criticalJobs: critical,
    degradedJobs: degraded,
    healthyJobs: healthy,
    totalRuns30d,
    failureRate30d,
    avgSuccessRate30d,
  };
}
