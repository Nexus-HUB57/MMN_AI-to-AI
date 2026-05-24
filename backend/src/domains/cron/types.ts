import type { CronFrequency } from "../../../database/schemas/schema-cron";

export type CronJobFrequency = CronFrequency;

export interface CronJobInput {
  name: string;
  description?: string;
  jobType: string;
  queueName: string;
  jobPayload?: Record<string, unknown>;
  frequency: CronJobFrequency;
  cronExpression?: string;
  enabled: boolean;
}

export interface CronListFilters {
  enabled?: boolean;
  jobType?: string;
  page: number;
  limit: number;
}

export interface CronHistoryFilters {
  cronJobId: number;
  status?: "completed" | "failed" | "running";
  page: number;
  limit: number;
}

export interface CronPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CronJobUpdateInput {
  id: number;
  name?: string;
  description?: string;
  jobType?: string;
  queueName?: string;
  jobPayload?: Record<string, unknown>;
  frequency?: CronJobFrequency;
  cronExpression?: string;
  enabled?: boolean;
}

export interface CronStatsFilters {
  startDate?: Date;
  endDate?: Date;
}

export interface CronStatsView {
  totalJobs: number;
  completedExecutions: number;
  failedExecutions: number;
  avgDurationMs: number;
}
