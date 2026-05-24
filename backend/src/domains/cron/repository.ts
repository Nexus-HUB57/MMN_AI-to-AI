import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import {
  cronJobHistory,
  cronJobs,
  cronSettings,
} from "../../../database/schemas/schema-cron";
import type {
  CronHistoryFilters,
  CronJobInput,
  CronListFilters,
  CronStatsFilters,
} from "./types";

function paginate<T>(rows: T[], page: number, limit: number) {
  return rows.slice((page - 1) * limit, (page - 1) * limit + limit);
}

export async function listCronJobsPage(db: any, filters: CronListFilters) {
  const conditions: any[] = [];
  if (filters.enabled !== undefined) conditions.push(eq(cronJobs.enabled, filters.enabled));
  if (filters.jobType) conditions.push(eq(cronJobs.jobType, filters.jobType));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (filters.page - 1) * filters.limit;

  const [rows, countRows] = await Promise.all([
    db.select().from(cronJobs).where(where).orderBy(desc(cronJobs.updatedAt)).limit(filters.limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(cronJobs).where(where),
  ]);

  return { rows, total: countRows[0]?.count ?? 0 };
}

export async function findCronJobById(db: any, id: number) {
  const rows = await db.select().from(cronJobs).where(eq(cronJobs.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function insertCronJobRecord(
  db: any,
  values: Record<string, unknown>,
) {
  const [created] = await db.insert(cronJobs).values(values).returning();
  return created;
}

export async function updateCronJobRecord(
  db: any,
  id: number,
  data: Record<string, unknown>,
) {
  const [updated] = await db
    .update(cronJobs)
    .set(data)
    .where(eq(cronJobs.id, id))
    .returning();
  return updated ?? null;
}

export async function deleteCronJobRecord(db: any, id: number) {
  await db.delete(cronJobHistory).where(eq(cronJobHistory.cronJobId, id));
  await db.delete(cronJobs).where(eq(cronJobs.id, id));
}

export async function listCronJobHistoryPage(db: any, filters: CronHistoryFilters) {
  const conditions: any[] = [eq(cronJobHistory.cronJobId, filters.cronJobId)];
  if (filters.status) conditions.push(eq(cronJobHistory.status, filters.status));

  const offset = (filters.page - 1) * filters.limit;

  const [history, countRows] = await Promise.all([
    db
      .select()
      .from(cronJobHistory)
      .where(and(...conditions))
      .orderBy(desc(cronJobHistory.startedAt))
      .limit(filters.limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(cronJobHistory)
      .where(and(...conditions)),
  ]);

  return { history, total: countRows[0]?.count ?? 0 };
}

export async function computeCronStats(db: any, filters: CronStatsFilters) {
  const conditions: any[] = [];
  if (filters.startDate) conditions.push(gte(cronJobHistory.startedAt, filters.startDate));
  if (filters.endDate) conditions.push(lte(cronJobHistory.startedAt, filters.endDate));

  const [completedCount, failedCount, totalJobs, avgDuration] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(cronJobHistory)
      .where(and(...conditions, eq(cronJobHistory.status, "completed"))),
    db
      .select({ count: sql<number>`count(*)` })
      .from(cronJobHistory)
      .where(and(...conditions, eq(cronJobHistory.status, "failed"))),
    db.select({ count: sql<number>`count(*)` }).from(cronJobs),
    db
      .select({ avgDuration: sql<number>`avg(duration)` })
      .from(cronJobHistory)
      .where(and(...conditions, eq(cronJobHistory.status, "completed"))),
  ]);

  return {
    totalJobs: totalJobs[0]?.count ?? 0,
    completedExecutions: completedCount[0]?.count ?? 0,
    failedExecutions: failedCount[0]?.count ?? 0,
    avgDurationMs: Math.round(avgDuration[0]?.avgDuration ?? 0),
  };
}

export async function listCronSettings(db: any) {
  return db.select().from(cronSettings).orderBy(cronSettings.settingKey);
}

export async function upsertCronSetting(
  db: any,
  input: { settingKey: string; settingValue: string },
) {
  await db
    .insert(cronSettings)
    .values({
      settingKey: input.settingKey,
      settingValue: input.settingValue,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: cronSettings.settingKey,
      set: {
        settingValue: input.settingValue,
        updatedAt: new Date(),
      },
    });
}

export async function listUpcomingCronExecutions(db: any, limit: number) {
  const now = new Date();
  return db
    .select()
    .from(cronJobs)
    .where(and(eq(cronJobs.enabled, true), sql`${cronJobs.nextRunAt} > ${now}`))
    .orderBy(cronJobs.nextRunAt)
    .limit(limit);
}
