import {
  getCommissionRecordById,
  getCommissionStatsSnapshot,
  getPendingCommissionSummary,
  listCommissionRecords,
} from "./repository";
import type {
  CommissionAuditRecord,
  CommissionHistoryEntry,
  CommissionListFilters,
  CommissionRecord,
  CommissionStatsSnapshot,
  PendingCommissionSummary,
} from "./types";

function buildCommissionAudit(params: {
  domain: "commissions";
  action: string;
  performedBy: string;
  targetId?: number;
  targetIds?: number[];
  notes?: string | null;
  metadata?: Record<string, unknown>;
}): CommissionAuditRecord {
  return {
    domain: params.domain,
    action: params.action,
    performedBy: params.performedBy,
    targetId: params.targetId,
    targetIds: params.targetIds,
    notes: params.notes || null,
    metadata: params.metadata || null,
    performedAt: new Date(),
  };
}

export function buildCommissionHistory(commission: {
  createdAt?: Date;
  confirmedAt?: Date | null;
  paidAt?: Date | null;
  status: CommissionRecord["status"];
  description?: string;
}): CommissionHistoryEntry[] {
  const history: CommissionHistoryEntry[] = [
    {
      action: "created",
      by: "system",
      at: commission.createdAt || new Date("2026-05-15T12:00:00Z"),
      notes: commission.description || "Comissão gerada",
    },
  ];

  if (commission.confirmedAt) {
    history.push({
      action: "confirmed",
      by: "finance@nexus.com",
      at: commission.confirmedAt,
      notes: "Comissão validada para processamento financeiro",
    });
  }

  if (commission.paidAt) {
    history.push({
      action: "paid",
      by: "finance@nexus.com",
      at: commission.paidAt,
      notes: "Comissão liquidada ao afiliado",
    });
  }

  if (commission.status === "cancelled") {
    history.push({
      action: "cancelled",
      by: "finance@nexus.com",
      at: new Date("2026-05-09T10:00:00Z"),
      notes: "Origem cancelada ou estornada",
    });
  }

  return history;
}

export function listCommissions(filters: CommissionListFilters) {
  let filtered = listCommissionRecords();

  if (filters.status) {
    filtered = filtered.filter((item) => item.status === filters.status);
  }

  if (filters.affiliateId) {
    filtered = filtered.filter((item) => item.affiliateId === filters.affiliateId);
  }

  return {
    commissions: filtered,
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / filters.limit)),
    },
  };
}

export function getCommissionDetails(id: number) {
  const commission = getCommissionRecordById(id) || listCommissionRecords()[0];

  return {
    ...commission,
    history: buildCommissionHistory(commission),
    auditSummary: {
      currentStatus: commission.status,
      confirmedAt: commission.confirmedAt,
      paidAt: commission.paidAt,
    },
  };
}

export function createUpdateStatusAudit(params: {
  id: number;
  status: CommissionRecord["status"];
  performedBy: string;
  notes?: string;
}) {
  return buildCommissionAudit({
    domain: "commissions",
    action: "update_status",
    performedBy: params.performedBy,
    targetId: params.id,
    notes: params.notes || null,
    metadata: { status: params.status },
  });
}

export function createApproveBatchAudit(params: {
  ids: number[];
  performedBy: string;
  notes?: string;
}) {
  return buildCommissionAudit({
    domain: "commissions",
    action: "approve_batch",
    performedBy: params.performedBy,
    targetIds: params.ids,
    notes: params.notes || null,
  });
}

export function getCommissionAmount(id: number): number {
  return getCommissionRecordById(id)?.amount ?? 0;
}

export function getCommissionStats(): CommissionStatsSnapshot {
  return getCommissionStatsSnapshot();
}

export function getAffiliateCommissions(params: { affiliateId: number; page: number; limit: number }) {
  const affiliateCommissions = listCommissionRecords().filter(
    (item) => item.affiliateId === params.affiliateId,
  );

  return {
    commissions: affiliateCommissions,
    pagination: {
      page: params.page,
      limit: params.limit,
      total: affiliateCommissions.length,
      totalPages: Math.max(1, Math.ceil(affiliateCommissions.length / params.limit)),
    },
  };
}

export function calculatePendingCommissionSummary(affiliateId: number): PendingCommissionSummary {
  return getPendingCommissionSummary(affiliateId);
}
