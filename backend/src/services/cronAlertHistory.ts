import { desc, eq } from 'drizzle-orm';
import { getDb } from '../../../database/schemas/db';
import { cronAlerts, type ICronAlertRow } from '../../../database/schemas/schema-cron';
import type { CronAlertSeverity, CronAlertType } from './cronAlerts';

export type CronAlertStateFilter = 'all' | 'active' | 'resolved';
export type CronAlertAcknowledgementFilter = 'all' | 'acknowledged' | 'unacknowledged';

export interface CronAlertHistoryItem {
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
  notifiedAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: number | null;
  resolvedAt?: string;
  metadata: Record<string, unknown>;
  timeToAcknowledgeMs?: number | null;
  timeToResolveMs?: number | null;
  openDurationMs?: number | null;
}

export interface ListCronAlertHistoryOptions {
  page?: number;
  limit?: number;
  state?: CronAlertStateFilter;
  severity?: CronAlertSeverity;
  alertType?: CronAlertType;
  jobType?: string;
  acknowledgement?: CronAlertAcknowledgementFilter;
}

export interface CronAlertHistoryResult {
  alerts: CronAlertHistoryItem[];
  availableJobTypes: string[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CronAlertInsightSnapshot {
  windowDays: number;
  totalTracked: number;
  activeCount: number;
  criticalActiveCount: number;
  warningActiveCount: number;
  activeUnacknowledgedCount: number;
  resolvedCountWindow: number;
  acknowledgedCountWindow: number;
  avgTimeToAcknowledgeMs: number | null;
  avgTimeToResolveMs: number | null;
}

export async function listCronAlertHistory(
  options: ListCronAlertHistoryOptions = {}
): Promise<CronAlertHistoryResult> {
  const db = await getDb();
  const page = options.page ?? 1;
  const limit = options.limit ?? 8;

  if (!db) {
    return {
      alerts: [],
      availableJobTypes: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const rows = await db.select().from(cronAlerts).orderBy(desc(cronAlerts.detectedAt));
  const availableJobTypes = Array.from(new Set(rows.map((row) => row.jobType))).sort((a, b) =>
    a.localeCompare(b, 'pt-BR')
  );

  const filtered = rows.filter((row) => matchesHistoryFilters(row, options));
  const total = filtered.length;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit).map(mapHistoryRow);

  return {
    alerts: paginated,
    availableJobTypes,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export async function getCronAlertInsightSnapshot(days = 30): Promise<CronAlertInsightSnapshot> {
  const db = await getDb();
  if (!db) {
    return {
      windowDays: days,
      totalTracked: 0,
      activeCount: 0,
      criticalActiveCount: 0,
      warningActiveCount: 0,
      activeUnacknowledgedCount: 0,
      resolvedCountWindow: 0,
      acknowledgedCountWindow: 0,
      avgTimeToAcknowledgeMs: null,
      avgTimeToResolveMs: null,
    };
  }

  const rows = await db.select().from(cronAlerts).orderBy(desc(cronAlerts.detectedAt));
  const now = Date.now();
  const cutoff = now - days * 24 * 60 * 60 * 1000;

  const activeRows = rows.filter((row) => row.active);
  const recentRows = rows.filter((row) => row.detectedAt.getTime() >= cutoff);
  const resolvedWindowRows = recentRows.filter((row) => Boolean(row.resolvedAt));
  const acknowledgedWindowRows = recentRows.filter((row) => Boolean(row.acknowledgedAt));

  return {
    windowDays: days,
    totalTracked: rows.length,
    activeCount: activeRows.length,
    criticalActiveCount: activeRows.filter((row) => row.severity === 'critical').length,
    warningActiveCount: activeRows.filter((row) => row.severity === 'warning').length,
    activeUnacknowledgedCount: activeRows.filter((row) => !row.acknowledgedAt).length,
    resolvedCountWindow: resolvedWindowRows.length,
    acknowledgedCountWindow: acknowledgedWindowRows.length,
    avgTimeToAcknowledgeMs: average(
      acknowledgedWindowRows
        .filter((row) => row.acknowledgedAt)
        .map((row) => row.acknowledgedAt!.getTime() - row.detectedAt.getTime())
    ),
    avgTimeToResolveMs: average(
      resolvedWindowRows
        .filter((row) => row.resolvedAt)
        .map((row) => row.resolvedAt!.getTime() - row.detectedAt.getTime())
    ),
  };
}

function matchesHistoryFilters(
  row: ICronAlertRow,
  options: ListCronAlertHistoryOptions
): boolean {
  if (options.state === 'active' && !row.active) return false;
  if (options.state === 'resolved' && row.active) return false;
  if (options.severity && row.severity !== options.severity) return false;
  if (options.alertType && row.alertType !== options.alertType) return false;
  if (options.jobType && row.jobType !== options.jobType) return false;
  if (options.acknowledgement === 'acknowledged' && !row.acknowledgedAt) return false;
  if (options.acknowledgement === 'unacknowledged' && row.acknowledgedAt) return false;
  return true;
}

function mapHistoryRow(row: ICronAlertRow): CronAlertHistoryItem {
  const now = Date.now();
  const detectedAtMs = row.detectedAt.getTime();
  const acknowledgedAtMs = row.acknowledgedAt?.getTime();
  const resolvedAtMs = row.resolvedAt?.getTime();

  return {
    id: row.alertKey,
    jobType: row.jobType,
    jobName: row.jobName ?? undefined,
    alertType: row.alertType as CronAlertType,
    severity: row.severity as CronAlertSeverity,
    title: row.title,
    message: row.message,
    active: row.active,
    detectedAt: row.detectedAt.toISOString(),
    lastSeenAt: row.lastSeenAt.toISOString(),
    notifiedAt: row.notifiedAt?.toISOString(),
    acknowledgedAt: row.acknowledgedAt?.toISOString(),
    acknowledgedBy: row.acknowledgedBy ?? null,
    resolvedAt: row.resolvedAt?.toISOString(),
    metadata: parseMetadata(row.metadata),
    timeToAcknowledgeMs: acknowledgedAtMs ? acknowledgedAtMs - detectedAtMs : null,
    timeToResolveMs: resolvedAtMs ? resolvedAtMs - detectedAtMs : null,
    openDurationMs: row.active ? now - detectedAtMs : null,
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

function average(values: number[]): number | null {
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
