import { desc, eq, inArray } from 'drizzle-orm';
import { getDb } from '../../../database/schemas/db';
import { cronAlerts, cronJobHistory, cronJobs } from '../../../database/schemas/schema-cron';
import { jobLogs } from '../../../database/schemas/schema-final';
import type { CronAlertSeverity, CronAlertType } from './cronAlerts';

export interface CronAlertContextJob {
  id: number;
  name: string;
  queueName: string;
  enabled: boolean;
  nextRunAt?: string;
  lastRunAt?: string;
  lastRunStatus?: string | null;
}

export interface CronAlertContextExecution {
  historyId: number;
  cronJobId: number;
  jobName: string;
  queueName: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  duration?: number | null;
  errorMessage?: string | null;
  dispatcherJobId?: string | null;
}

export interface CronAlertContextLog {
  id: string;
  jobId: string;
  queueName: string;
  jobType: string;
  status: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  error?: string | null;
}

export interface CronAlertContext {
  alert: {
    id: string;
    jobType: string;
    jobName?: string;
    alertType: CronAlertType;
    severity: CronAlertSeverity;
    title: string;
    message: string;
    active: boolean;
    detectedAt: string;
    lastSeenAt: string;
    acknowledgedAt?: string;
    resolvedAt?: string;
    metadata: Record<string, unknown>;
  };
  impactedJobs: CronAlertContextJob[];
  recentExecutions: CronAlertContextExecution[];
  recentLogs: CronAlertContextLog[];
  summary: {
    impactedJobsCount: number;
    recentExecutionsCount: number;
    recentLogsCount: number;
    failedExecutionsCount: number;
    failedLogsCount: number;
    lastExecutionAt?: string;
    lastLogAt?: string;
  };
}

export async function getCronAlertContext(alertId: string, limit = 5): Promise<CronAlertContext | null> {
  const db = await getDb();
  if (!db) return null;

  const [alertRow] = await db.select().from(cronAlerts).where(eq(cronAlerts.alertKey, alertId)).limit(1);
  if (!alertRow) return null;

  const impactedJobsRows = await db
    .select({
      id: cronJobs.id,
      name: cronJobs.name,
      queueName: cronJobs.queueName,
      enabled: cronJobs.enabled,
      nextRunAt: cronJobs.nextRunAt,
      lastRunAt: cronJobs.lastRunAt,
      lastRunStatus: cronJobs.lastRunStatus,
    })
    .from(cronJobs)
    .where(eq(cronJobs.jobType, alertRow.jobType))
    .orderBy(desc(cronJobs.updatedAt))
    .limit(12);

  const impactedJobIds = impactedJobsRows.map((job) => job.id);
  const jobsById = new Map(impactedJobsRows.map((job) => [job.id, job]));

  const recentExecutionRows = impactedJobIds.length
    ? await db
        .select()
        .from(cronJobHistory)
        .where(inArray(cronJobHistory.cronJobId, impactedJobIds))
        .orderBy(desc(cronJobHistory.startedAt))
        .limit(limit)
    : [];

  const recentLogRows = await db
    .select()
    .from(jobLogs)
    .where(eq(jobLogs.jobType, alertRow.jobType))
    .orderBy(desc(jobLogs.createdAt))
    .limit(limit);

  const impactedJobs: CronAlertContextJob[] = impactedJobsRows.map((job) => ({
    id: job.id,
    name: job.name,
    queueName: job.queueName,
    enabled: job.enabled,
    nextRunAt: job.nextRunAt?.toISOString(),
    lastRunAt: job.lastRunAt?.toISOString(),
    lastRunStatus: job.lastRunStatus,
  }));

  const recentExecutions: CronAlertContextExecution[] = recentExecutionRows.map((row) => {
    const job = jobsById.get(row.cronJobId);
    return {
      historyId: row.id,
      cronJobId: row.cronJobId,
      jobName: job?.name ?? alertRow.jobName ?? alertRow.jobType,
      queueName: job?.queueName ?? '—',
      status: row.status,
      startedAt: row.startedAt.toISOString(),
      completedAt: row.completedAt?.toISOString(),
      duration: row.duration ?? null,
      errorMessage: row.errorMessage ?? null,
      dispatcherJobId: row.jobId ?? null,
    };
  });

  const recentLogs: CronAlertContextLog[] = recentLogRows.map((row) => ({
    id: row.id,
    jobId: row.jobId,
    queueName: row.queueName,
    jobType: row.jobType,
    status: row.status,
    startedAt: row.startedAt?.toISOString(),
    completedAt: row.completedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    error: row.error ?? null,
  }));

  return {
    alert: {
      id: alertRow.alertKey,
      jobType: alertRow.jobType,
      jobName: alertRow.jobName ?? undefined,
      alertType: alertRow.alertType as CronAlertType,
      severity: alertRow.severity as CronAlertSeverity,
      title: alertRow.title,
      message: alertRow.message,
      active: alertRow.active,
      detectedAt: alertRow.detectedAt.toISOString(),
      lastSeenAt: alertRow.lastSeenAt.toISOString(),
      acknowledgedAt: alertRow.acknowledgedAt?.toISOString(),
      resolvedAt: alertRow.resolvedAt?.toISOString(),
      metadata: parseMetadata(alertRow.metadata),
    },
    impactedJobs,
    recentExecutions,
    recentLogs,
    summary: {
      impactedJobsCount: impactedJobs.length,
      recentExecutionsCount: recentExecutions.length,
      recentLogsCount: recentLogs.length,
      failedExecutionsCount: recentExecutions.filter((item) => item.status === 'failed').length,
      failedLogsCount: recentLogs.filter((item) => item.status === 'failed').length,
      lastExecutionAt: recentExecutions[0]?.startedAt,
      lastLogAt: recentLogs[0]?.createdAt,
    },
  };
}

function parseMetadata(value?: string | null): Record<string, unknown> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}
