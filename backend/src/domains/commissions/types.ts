export type CommissionStatus = "pending" | "confirmed" | "paid" | "cancelled";

export interface CommissionRecord {
  id: number;
  affiliateId: number;
  affiliateName: string;
  affiliateCode: string;
  amount: number;
  percentage: number;
  level: number;
  status: CommissionStatus;
  source: string;
  sourceId: string;
  description: string;
  createdAt: Date;
  confirmedAt: Date | null;
  paidAt: Date | null;
}

export interface CommissionHistoryEntry {
  action: "created" | "confirmed" | "paid" | "cancelled";
  by: string;
  at: Date;
  notes: string;
}

export interface CommissionAuditRecord {
  domain: "commissions";
  action: string;
  performedBy: string;
  targetId?: number;
  targetIds?: number[];
  notes: string | null;
  metadata: Record<string, unknown> | null;
  performedAt: Date;
}

export interface CommissionListFilters {
  page: number;
  limit: number;
  status?: CommissionStatus;
  affiliateId?: number;
  startDate?: string;
  endDate?: string;
}

export interface CommissionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CommissionStatsSnapshot {
  total: number;
  pending: number;
  confirmed: number;
  paid: number;
  cancelled: number;
  count: {
    total: number;
    pending: number;
    confirmed: number;
    paid: number;
    cancelled: number;
  };
  byLevel: Record<string, number>;
  bySource: Record<string, number>;
  averageCommission: number;
}

export interface PendingCommissionSummary {
  affiliateId: number;
  pendingAmount: number;
  pendingCount: number;
  oldestPendingDate: Date | null;
}
