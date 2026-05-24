import { desc, eq, inArray } from 'drizzle-orm';
import { createNotification, getDb } from '../../../database/schemas/db';
import {
  cronAlerts,
  type ICronAlertRow,
} from '../../../database/schemas/schema-cron';
import { users } from '../../../database/schemas/schema-final';
import {
  computeCronSlaSnapshot,
  type JobSlaIndicator,
  type CronSlaSnapshot,
} from './cronSlaIndicators';

export type CronAlertSeverity = 'warning' | 'critical';
export type CronAlertType =
  | 'cron_critical_failures'
  | 'cron_stuck_job'
  | 'cron_degraded_success_rate';

export interface CronAlert {
  id: string;
  jobType: string;
  jobName?: string;
  alertType: CronAlertType;
  severity: CronAlertSeverity;
  title: string;
  message: string;
  detectedAt: string;
  acknowledgedAt?: string;
  metadata: Record<string, unknown>;
}

interface AlertCandidate extends CronAlert {
  bucket: string;
}

export interface EvaluateAlertsOptions {
  cooldownMinutes?: number;
  notifyAdmins?: boolean;
  successRateAlertThreshold?: number;
}

export interface EvaluateAlertsResult {
  evaluatedAt: string;
  totalAlerts: number;
  newAlerts: CronAlert[];
  activeAlerts: CronAlert[];
  acknowledgedAlerts: CronAlert[];
  snapshotSummary: {
    totalJobs: number;
    criticalJobs: number;
    degradedJobs: number;
    stuckJobs: number;
  };
}

const DEFAULT_COOLDOWN_MINUTES = 30;
const DEFAULT_SUCCESS_RATE_ALERT = 70;

let lastActiveAlerts: CronAlert[] = [];
let lastEvaluatedAt: string | null = null;

export async function evaluateCronAlerts(
  options: EvaluateAlertsOptions = {}
): Promise<EvaluateAlertsResult> {
  const cooldownMinutes = options.cooldownMinutes ?? DEFAULT_COOLDOWN_MINUTES;
  const successRateAlertThreshold = options.successRateAlertThreshold ?? DEFAULT_SUCCESS_RATE_ALERT;
  const notifyAdmins = options.notifyAdmins ?? true;

  const snapshot = await computeCronSlaSnapshot();
  const now = new Date();
  const candidates = snapshot.jobs.flatMap((indicator) =>
    buildAlertsForJob(indicator, snapshot, successRateAlertThreshold, now)
  );

  const db = await getDb();
  if (!db) {
    const fallbackAlerts = candidates.map(stripBucket);
    lastActiveAlerts = fallbackAlerts;
    lastEvaluatedAt = now.toISOString();

    if (notifyAdmins && fallbackAlerts.length > 0) {
      await persistNotifications(fallbackAlerts);
    }

    return buildEvaluateResult({
      evaluatedAt: lastEvaluatedAt,
      activeAlerts: fallbackAlerts,
      newAlerts: notifyAdmins ? fallbackAlerts : [],
      snapshot,
    });
  }

  const candidateKeys = candidates.map((candidate) => candidate.id);
  const [existingForKeys, existingActiveRows] = await Promise.all([
    candidateKeys.length > 0
      ? db.select().from(cronAlerts).where(inArray(cronAlerts.alertKey, candidateKeys))
      : Promise.resolve([] as ICronAlertRow[]),
    db.select().from(cronAlerts).where(eq(cronAlerts.active, true)).orderBy(desc(cronAlerts.detectedAt)),
  ]);

  const existingByKey = new Map(existingForKeys.map((row) => [row.alertKey, row]));
  const activeKeys = new Set(candidateKeys);
  const newAlerts: CronAlert[] = [];
  const activeAlerts: CronAlert[] = [];

  for (const candidate of candidates) {
    const persisted = await upsertAlertCandidate({
      candidate,
      existing: existingByKey.get(candidate.id),
      cooldownMinutes,
      notifyAdmins,
      now,
    });

    activeAlerts.push(persisted.alert);
    if (persisted.shouldNotify) {
      newAlerts.push(persisted.alert);
    }
  }

  const rowsToResolve = existingActiveRows.filter((row) => !activeKeys.has(row.alertKey));
  for (const row of rowsToResolve) {
    await db
      .update(cronAlerts)
      .set({
        active: false,
        resolvedAt: now,
        lastSeenAt: now,
      })
      .where(eq(cronAlerts.id, row.id));
  }

  lastActiveAlerts = activeAlerts;
  lastEvaluatedAt = now.toISOString();

  if (notifyAdmins && newAlerts.length > 0) {
    await persistNotifications(newAlerts);
  }

  return buildEvaluateResult({
    evaluatedAt: lastEvaluatedAt,
    activeAlerts,
    newAlerts,
    snapshot,
  });
}

export async function listActiveCronAlerts(): Promise<{
  evaluatedAt: string;
  alerts: CronAlert[];
}> {
  if (!lastEvaluatedAt) {
    await evaluateCronAlerts({ notifyAdmins: false });
  }

  const db = await getDb();
  if (!db) {
    return {
      evaluatedAt: lastEvaluatedAt ?? new Date().toISOString(),
      alerts: lastActiveAlerts,
    };
  }

  const rows = await db
    .select()
    .from(cronAlerts)
    .where(eq(cronAlerts.active, true))
    .orderBy(desc(cronAlerts.severity), desc(cronAlerts.detectedAt));

  const alerts = rows.map(mapRowToAlert);
  if (rows.length > 0) {
    lastActiveAlerts = alerts;
    lastEvaluatedAt = rows[0]?.lastSeenAt ? toIso(rows[0].lastSeenAt) : lastEvaluatedAt;
  }

  return {
    evaluatedAt: lastEvaluatedAt ?? new Date().toISOString(),
    alerts,
  };
}

export async function acknowledgeCronAlert(
  alertId: string,
  acknowledgedBy?: number | null
): Promise<CronAlert | null> {
  const db = await getDb();
  const acknowledgedAt = new Date();

  if (!db) {
    const target = lastActiveAlerts.find((alert) => alert.id === alertId);
    if (!target) return null;

    const updated: CronAlert = {
      ...target,
      acknowledgedAt: acknowledgedAt.toISOString(),
    };

    lastActiveAlerts = lastActiveAlerts.map((alert) =>
      alert.id === alertId ? updated : alert
    );

    return updated;
  }

  const existing = await db
    .select()
    .from(cronAlerts)
    .where(eq(cronAlerts.alertKey, alertId))
    .limit(1);

  if (!existing[0] || !existing[0].active) {
    return null;
  }

  await db
    .update(cronAlerts)
    .set({
      acknowledgedAt,
      acknowledgedBy: acknowledgedBy ?? null,
      lastSeenAt: acknowledgedAt,
    })
    .where(eq(cronAlerts.id, existing[0].id));

  const updated = mapRowToAlert({
    ...existing[0],
    acknowledgedAt,
    acknowledgedBy: acknowledgedBy ?? null,
    lastSeenAt: acknowledgedAt,
  });

  lastActiveAlerts = lastActiveAlerts.map((alert) =>
    alert.id === alertId ? updated : alert
  );

  return updated;
}

export async function clearAcknowledgement(alertId: string): Promise<boolean> {
  const db = await getDb();

  if (!db) {
    const found = lastActiveAlerts.some((alert) => alert.id === alertId);
    if (!found) return false;

    lastActiveAlerts = lastActiveAlerts.map((alert) =>
      alert.id === alertId ? { ...alert, acknowledgedAt: undefined } : alert
    );

    return true;
  }

  const existing = await db
    .select()
    .from(cronAlerts)
    .where(eq(cronAlerts.alertKey, alertId))
    .limit(1);

  if (!existing[0]) {
    return false;
  }

  await db
    .update(cronAlerts)
    .set({
      acknowledgedAt: null,
      acknowledgedBy: null,
    })
    .where(eq(cronAlerts.id, existing[0].id));

  lastActiveAlerts = lastActiveAlerts.map((alert) =>
    alert.id === alertId ? { ...alert, acknowledgedAt: undefined } : alert
  );

  return true;
}

export function resetCronAlertsState(): void {
  lastActiveAlerts = [];
  lastEvaluatedAt = null;
}

function buildAlertsForJob(
  indicator: JobSlaIndicator,
  snapshot: CronSlaSnapshot,
  successRateAlertThreshold: number,
  now: Date
): AlertCandidate[] {
  const alerts: AlertCandidate[] = [];

  if (indicator.isStuck) {
    const bucket = bucketize(indicator.stuckSinceMinutes ?? 0);
    alerts.push({
      id: makeAlertId(indicator.jobType, 'cron_stuck_job', bucket),
      bucket,
      jobType: indicator.jobType,
      jobName: indicator.jobName,
      alertType: 'cron_stuck_job',
      severity: 'critical',
      title: `Cron travado: ${indicator.jobName ?? indicator.jobType}`,
      message: `Job em execução há ${indicator.stuckSinceMinutes ?? '?'} minutos (limite ${snapshot.options.stuckThresholdMinutes} min).`,
      detectedAt: now.toISOString(),
      metadata: {
        stuckSinceMinutes: indicator.stuckSinceMinutes ?? null,
        threshold: snapshot.options.stuckThresholdMinutes,
        queueName: indicator.queueName,
      },
    });
  }

  if (indicator.consecutiveFailures >= snapshot.options.consecutiveFailuresAlertThreshold) {
    const bucket = bucketize(indicator.consecutiveFailures);
    alerts.push({
      id: makeAlertId(indicator.jobType, 'cron_critical_failures', bucket),
      bucket,
      jobType: indicator.jobType,
      jobName: indicator.jobName,
      alertType: 'cron_critical_failures',
      severity: 'critical',
      title: `Falhas consecutivas em ${indicator.jobName ?? indicator.jobType}`,
      message: `${indicator.consecutiveFailures} falhas consecutivas detectadas (threshold ${snapshot.options.consecutiveFailuresAlertThreshold}).`,
      detectedAt: now.toISOString(),
      metadata: {
        consecutiveFailures: indicator.consecutiveFailures,
        threshold: snapshot.options.consecutiveFailuresAlertThreshold,
        failureCount7d: indicator.failureCount7d,
      },
    });
  }

  if (indicator.totalRuns7d > 0 && indicator.successRate7d < successRateAlertThreshold) {
    const bucket = bucketize(100 - indicator.successRate7d);
    alerts.push({
      id: makeAlertId(indicator.jobType, 'cron_degraded_success_rate', bucket),
      bucket,
      jobType: indicator.jobType,
      jobName: indicator.jobName,
      alertType: 'cron_degraded_success_rate',
      severity: 'warning',
      title: `Sucesso degradado em ${indicator.jobName ?? indicator.jobType}`,
      message: `Taxa de sucesso 7d em ${indicator.successRate7d.toFixed(1)}% (limite ${successRateAlertThreshold}%).`,
      detectedAt: now.toISOString(),
      metadata: {
        successRate7d: indicator.successRate7d,
        successRate30d: indicator.successRate30d,
        threshold: successRateAlertThreshold,
        totalRuns7d: indicator.totalRuns7d,
        failureCount7d: indicator.failureCount7d,
      },
    });
  }

  return alerts;
}

async function upsertAlertCandidate(args: {
  candidate: AlertCandidate;
  existing?: ICronAlertRow;
  cooldownMinutes: number;
  notifyAdmins: boolean;
  now: Date;
}): Promise<{ alert: CronAlert; shouldNotify: boolean }> {
  const db = await getDb();
  if (!db) {
    return {
      alert: stripBucket(args.candidate),
      shouldNotify: args.notifyAdmins,
    };
  }

  const { candidate, existing, cooldownMinutes, notifyAdmins, now } = args;
  const shouldNotify =
    notifyAdmins &&
    shouldEmitNotification({
      existing,
      cooldownMinutes,
      now,
    });

  if (existing) {
    const continuingIncident = existing.active && !existing.resolvedAt;
    await db
      .update(cronAlerts)
      .set({
        alertType: candidate.alertType,
        severity: candidate.severity,
        jobType: candidate.jobType,
        jobName: candidate.jobName ?? null,
        bucket: candidate.bucket,
        title: candidate.title,
        message: candidate.message,
        metadata: serializeMetadata(candidate.metadata),
        active: true,
        lastSeenAt: now,
        detectedAt: continuingIncident ? existing.detectedAt : now,
        resolvedAt: null,
        acknowledgedAt: continuingIncident ? existing.acknowledgedAt : null,
        acknowledgedBy: continuingIncident ? existing.acknowledgedBy : null,
        notifiedAt: shouldNotify ? now : existing.notifiedAt,
      })
      .where(eq(cronAlerts.id, existing.id));

    return {
      alert: {
        ...stripBucket(candidate),
        detectedAt: continuingIncident ? toIso(existing.detectedAt) : now.toISOString(),
        acknowledgedAt: continuingIncident ? optionalIso(existing.acknowledgedAt) : undefined,
      },
      shouldNotify,
    };
  }

  await db.insert(cronAlerts).values({
    alertKey: candidate.id,
    alertType: candidate.alertType,
    severity: candidate.severity,
    jobType: candidate.jobType,
    jobName: candidate.jobName ?? null,
    bucket: candidate.bucket,
    title: candidate.title,
    message: candidate.message,
    metadata: serializeMetadata(candidate.metadata),
    detectedAt: now,
    lastSeenAt: now,
    notifiedAt: shouldNotify ? now : null,
    acknowledgedAt: null,
    acknowledgedBy: null,
    resolvedAt: null,
    active: true,
  });

  return {
    alert: {
      ...stripBucket(candidate),
      detectedAt: now.toISOString(),
      acknowledgedAt: undefined,
    },
    shouldNotify,
  };
}

function shouldEmitNotification(args: {
  existing?: ICronAlertRow;
  cooldownMinutes: number;
  now: Date;
}): boolean {
  const { existing, cooldownMinutes, now } = args;

  if (!existing) return true;
  if (!existing.active || existing.resolvedAt) return true;
  if (existing.acknowledgedAt) return false;
  if (!existing.notifiedAt) return true;

  const ageMinutes = (now.getTime() - existing.notifiedAt.getTime()) / (60 * 1000);
  return ageMinutes >= cooldownMinutes;
}

function mapRowToAlert(row: ICronAlertRow): CronAlert {
  return {
    id: row.alertKey,
    jobType: row.jobType,
    jobName: row.jobName ?? undefined,
    alertType: row.alertType as CronAlertType,
    severity: row.severity as CronAlertSeverity,
    title: row.title,
    message: row.message,
    detectedAt: toIso(row.detectedAt),
    acknowledgedAt: optionalIso(row.acknowledgedAt),
    metadata: parseMetadata(row.metadata),
  };
}

function stripBucket(alert: AlertCandidate): CronAlert {
  const { bucket: _bucket, ...plainAlert } = alert;
  return plainAlert;
}

function buildEvaluateResult(args: {
  evaluatedAt: string;
  activeAlerts: CronAlert[];
  newAlerts: CronAlert[];
  snapshot: CronSlaSnapshot;
}): EvaluateAlertsResult {
  return {
    evaluatedAt: args.evaluatedAt,
    totalAlerts: args.activeAlerts.length,
    newAlerts: args.newAlerts,
    activeAlerts: args.activeAlerts,
    acknowledgedAlerts: args.activeAlerts.filter((alert) => Boolean(alert.acknowledgedAt)),
    snapshotSummary: {
      totalJobs: args.snapshot.global.totalJobs,
      criticalJobs: args.snapshot.global.criticalJobs,
      degradedJobs: args.snapshot.global.degradedJobs,
      stuckJobs: args.snapshot.global.stuckJobs,
    },
  };
}

function persistNotifications(alerts: CronAlert[]): Promise<void> {
  return (async () => {
    try {
      const db = await getDb();
      if (!db) return;

      const admins = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.role, 'admin'))
        .limit(50);

      if (!admins.length) {
        console.warn('[CronAlerts] Nenhum admin encontrado para receber notificações');
        return;
      }

      for (const alert of alerts) {
        for (const admin of admins) {
          await createNotification({
            userId: admin.id,
            type: `cron_alert:${alert.alertType}`,
            title: alert.title,
            content: alert.message,
          });
        }
      }

      console.log(`[CronAlerts] ${alerts.length} alerta(s) propagados a ${admins.length} admin(s)`);
    } catch (error) {
      console.error('[CronAlerts] Falha ao persistir notificações de alerta:', error);
    }
  })();
}

function makeAlertId(jobType: string, type: CronAlertType, suffix: string): string {
  return `${type}:${jobType}:${suffix}`;
}

function bucketize(value: number): string {
  if (value <= 5) return '0-5';
  if (value <= 10) return '6-10';
  if (value <= 20) return '11-20';
  if (value <= 50) return '21-50';
  return '50+';
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

function serializeMetadata(value: Record<string, unknown>): string {
  try {
    return JSON.stringify(value ?? {});
  } catch {
    return '{}';
  }
}

function toIso(value: Date): string {
  return value.toISOString();
}

function optionalIso(value?: Date | null): string | undefined {
  return value ? value.toISOString() : undefined;
}
