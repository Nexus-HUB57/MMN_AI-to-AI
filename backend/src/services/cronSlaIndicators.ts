/**
 * Cron SLA Indicators
 *
 * Calcula indicadores operacionais de SLA para o domínio Cron a partir
 * de `cron_jobs` e `cron_job_history`.
 */
import { and, asc, desc, eq, gte, sql } from 'drizzle-orm';
import type { drizzle } from 'drizzle-orm/node-postgres';
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

export interface JobSuccessRate {
  jobType: string;
  window7d: { total: number; success: number; rate: number };
  window30d: { total: number; success: number; rate: number };
}

export interface StuckJob {
  id: number;
  name: string;
  jobType: string;
  lastRunAt: Date | null;
  stuckMinutes: number;
}

export interface ConsecutiveFailures {
  jobType: string;
  streak: number;
  lastSuccessAt: Date | null;
}

export interface SlaReport {
  generatedAt: Date;
  successRates: JobSuccessRate[];
  stuckJobs: StuckJob[];
  consecutiveFailures: ConsecutiveFailures[];
  health: 'healthy' | 'degraded' | 'critical';
}

export const computeCronSlaSnapshot = getCronSlaReport;

export async function getCronSlaReport(options: SlaIndicatorOptions = {}): Promise<SlaReport | null> {
  const db = await getDb();
  if (!db) return null;

  const {
    stuckThresholdMinutes = 30,
    consecutiveFailuresAlertThreshold = 3,
    windowDaysShort = 7,
    windowDaysLong = 30,
    perJobLimit = 100,
  } = options;

  const now = new Date();
  const cutoff7d = new Date(now.getTime() - windowDaysShort * 24 * 60 * 60 * 1000);
  const cutoff30d = new Date(now.getTime() - windowDaysLong * 24 * 60 * 60 * 1000);

  const allJobs = await db.select().from(cronJobs).where(eq(cronJobs.enabled, true));

  const successRates: JobSuccessRate[] = [];
  const stuckJobs: StuckJob[] = [];
  const consecutiveFailures: ConsecutiveFailures[] = [];

  for (const job of allJobs) {
    const history7d = await db.select()
      .from(cronJobHistory)
      .where(and(eq(cronJobHistory.cronJobId, job.id), gte(cronJobHistory.startedAt, cutoff7d)))
      .limit(perJobLimit);

    const history30d = await db.select()
      .from(cronJobHistory)
      .where(and(eq(cronJobHistory.cronJobId, job.id), gte(cronJobHistory.startedAt, cutoff30d)))
      .limit(perJobLimit);

    const calc = (hist: typeof history7d) => {
      const total = hist.length;
      const success = hist.filter(h => h.status === 'completed').length;
      return { total, success, rate: total > 0 ? Math.round((success / total) * 100) / 100 : 0 };
    };

    successRates.push({ jobType: job.jobType, window7d: calc(history7d), window30d: calc(history30d) });

    if (job.lastRunStatus === 'running' && job.lastRunAt) {
      const stuckMinutes = Math.floor((now.getTime() - new Date(job.lastRunAt).getTime()) / 60000);
      if (stuckMinutes >= stuckThresholdMinutes) {
        stuckJobs.push({ id: job.id, name: job.name, jobType: job.jobType, lastRunAt: job.lastRunAt, stuckMinutes });
      }
    }

    const recentHistory = await db.select()
      .from(cronJobHistory)
      .where(eq(cronJobHistory.cronJobId, job.id))
      .orderBy(desc(cronJobHistory.startedAt))
      .limit(20);

    let streak = 0;
    let lastSuccessAt: Date | null = null;
    for (const h of recentHistory) {
      if (h.status === 'completed') { lastSuccessAt = h.startedAt; break; }
      if (h.status === 'failed') streak++;
    }
    if (streak >= consecutiveFailuresAlertThreshold) {
      consecutiveFailures.push({ jobType: job.jobType, streak, lastSuccessAt });
    }
  }

  const hasCritical = stuckJobs.length > 0 || consecutiveFailures.some(f => f.streak >= 5);
  const hasDegraded = consecutiveFailures.length > 0 || successRates.some(r => r.window7d.rate < 0.8);
  const health = hasCritical ? 'critical' : hasDegraded ? 'degraded' : 'healthy';

  return { generatedAt: now, successRates, stuckJobs, consecutiveFailures, health };
}
