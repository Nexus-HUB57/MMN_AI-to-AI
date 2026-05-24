import type {
  CommissionRecord,
  CommissionStatsSnapshot,
  PendingCommissionSummary,
} from "./types";

const mockCommissions: CommissionRecord[] = [
  {
    id: 1,
    affiliateId: 101,
    affiliateName: "João Silva",
    affiliateCode: "JOAO001",
    amount: 500.0,
    percentage: 10,
    level: 1,
    status: "pending",
    source: "sale",
    sourceId: "ORDER-001",
    description: "Comissão sobre venda no Mercado Livre",
    createdAt: new Date("2026-05-15T12:00:00Z"),
    confirmedAt: null,
    paidAt: null,
  },
  {
    id: 2,
    affiliateId: 102,
    affiliateName: "Maria Santos",
    affiliateCode: "MARIA002",
    amount: 320.0,
    percentage: 8,
    level: 1,
    status: "confirmed",
    source: "sale",
    sourceId: "ORDER-002",
    description: "Comissão confirmada após conciliação financeira",
    createdAt: new Date("2026-05-14T14:00:00Z"),
    confirmedAt: new Date("2026-05-16T10:00:00Z"),
    paidAt: null,
  },
  {
    id: 3,
    affiliateId: 103,
    affiliateName: "Pedro Costa",
    affiliateCode: "PEDRO003",
    amount: 750.0,
    percentage: 10,
    level: 1,
    status: "paid",
    source: "sale",
    sourceId: "ORDER-003",
    description: "Comissão liquidada em ciclo semanal",
    createdAt: new Date("2026-05-10T09:00:00Z"),
    confirmedAt: new Date("2026-05-12T11:30:00Z"),
    paidAt: new Date("2026-05-18T15:00:00Z"),
  },
  {
    id: 4,
    affiliateId: 104,
    affiliateName: "Ana Oliveira",
    affiliateCode: "ANA004",
    amount: 180.0,
    percentage: 6,
    level: 2,
    status: "pending",
    source: "sale",
    sourceId: "ORDER-004",
    description: "Comissão de segundo nível aguardando validação",
    createdAt: new Date("2026-05-18T17:45:00Z"),
    confirmedAt: null,
    paidAt: null,
  },
  {
    id: 5,
    affiliateId: 105,
    affiliateName: "Carlos Mendes",
    affiliateCode: "CARLOS005",
    amount: 420.0,
    percentage: 7,
    level: 1,
    status: "cancelled",
    source: "sale",
    sourceId: "ORDER-005",
    description: "Comissão cancelada por estorno da origem",
    createdAt: new Date("2026-05-08T13:20:00Z"),
    confirmedAt: null,
    paidAt: null,
  },
];

const statsSnapshot: CommissionStatsSnapshot = {
  total: 250000.0,
  pending: 45000.0,
  confirmed: 80000.0,
  paid: 125000.0,
  cancelled: 0,
  count: {
    total: 1250,
    pending: 320,
    confirmed: 480,
    paid: 450,
    cancelled: 0,
  },
  byLevel: {
    "1": 150000.0,
    "2": 50000.0,
    "3": 30000.0,
    "4": 15000.0,
    "5+": 5000.0,
  },
  bySource: {
    sale: 200000.0,
    bonus: 30000.0,
    referral: 20000.0,
  },
  averageCommission: 200.0,
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
    pendingAmount: 1250.0,
    pendingCount: 5,
    oldestPendingDate: new Date("2026-05-01T09:00:00Z"),
  };
}
