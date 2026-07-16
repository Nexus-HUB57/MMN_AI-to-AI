import type {
  CommissionRecord,
  CommissionStatsSnapshot,
  PendingCommissionSummary,
} from "./types";

// Go-Live: repository nunca injeta comissões demonstrativas. A fonte de verdade
// deve ser o banco e, quando indisponível, o painel mostra estado vazio honesto.
const mockCommissions: CommissionRecord[] = [];

const statsSnapshot: CommissionStatsSnapshot = {
  total: 0,
  pending: 0,
  confirmed: 0,
  paid: 0,
  cancelled: 0,
  count: {
    total: 0,
    pending: 0,
    confirmed: 0,
    paid: 0,
    cancelled: 0,
  },
  byLevel: {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5+": 0,
  },
  bySource: {
    sale: 0,
    bonus: 0,
    referral: 0,
  },
  averageCommission: 0,
};

export function listCommissionRecords(): CommissionRecord[] {
  return [...mockCommissions];
}

export function getCommissionRecordById(id: number): CommissionRecord | undefined {
  return mockCommissions.find((item) => item.id === id);
}

export function getCommissionStatsSnapshot(): CommissionStatsSnapshot {
  return { ...statsSnapshot };
}

export function getPendingCommissionSummary(affiliateId: number): PendingCommissionSummary {
  return {
    affiliateId,
    pendingAmount: 0,
    pendingCount: 0,
    oldestPendingDate: null,
  };
}
