/**
 * Partners domain repository — in-memory facade.
 *
 * Fornece uma camada de acesso a dados determinística para o domínio
 * Partners. Enquanto o router legado (`routers/partnersRouter.ts`)
 * continua sendo a fonte primária via Drizzle, este repository serve:
 *
 *  - Cálculos puros (sem I/O) que rodam em jobs, webhooks, ou em
 *    modos degradados sem DB disponível.
 *  - Snapshots estáticos para dashboards, auditoria e testes.
 *  - Integração com o service para decisões autônomas
 *    (promoção de tier, bônus, retenção).
 *
 * Os dados aqui são intencionalmente separados do Drizzle para
 * evitar acoplamento com o schema e manter a camada service testável.
 */

import type { PartnerTier, PartnershipStatus } from "./types";

// ---------------------------------------------------------------------------
// Records canônicos
// ---------------------------------------------------------------------------

export interface PartnerRecord {
  id: number;
  userId: number;
  tier: PartnerTier;
  referralCode: string;
  referralCount: number;
  totalVolume: number;
  commissionBalance: number;
  status: "active" | "inactive" | "suspended";
  benefits: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnershipRecord {
  id: number;
  partnerId: number;
  partnerName: string;
  partnerEmail?: string | null;
  partnerCompany?: string | null;
  status: PartnershipStatus;
  commissionRate: number;
  benefits: string[];
  notes?: string | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  approvedBy?: number | null;
  approvedAt?: Date | null;
  rejectionReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnerVolumeHistoryEntry {
  id: number;
  partnerId: number;
  volume: number;
  volumeType: "sale" | "commission" | "referral" | "bonus";
  source?: string | null;
  sourceId?: number | null;
  description?: string | null;
  createdAt: Date;
}

export interface PartnerTierConfigRecord {
  tier: PartnerTier;
  minVolume: number;
  commissionRate: number;
  maxReferrals: number | null;
  benefits: string[];
  features: string[];
  color: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// Seed data — fallback determinístico (sem DB)
// ---------------------------------------------------------------------------

const partnerTierConfigSeed: Record<PartnerTier, PartnerTierConfigRecord> = {
  silver: {
    tier: "silver",
    minVolume: 0,
    commissionRate: 0.05,
    maxReferrals: 50,
    benefits: ["dashboard_basic", "reports_weekly", "email_support"],
    features: ["basic_analytics", "weekly_digest"],
    color: "#C0C0C0",
    icon: "shield",
    sortOrder: 1,
    isActive: true,
  },
  gold: {
    tier: "gold",
    minVolume: 5_000,
    commissionRate: 0.08,
    maxReferrals: 200,
    benefits: [
      "dashboard_advanced",
      "reports_daily",
      "priority_support",
      "marketing_materials",
    ],
    features: ["advanced_analytics", "daily_digest", "marketing_kit"],
    color: "#FFD700",
    icon: "star",
    sortOrder: 2,
    isActive: true,
  },
  platinum: {
    tier: "platinum",
    minVolume: 20_000,
    commissionRate: 0.12,
    maxReferrals: 500,
    benefits: [
      "dashboard_advanced",
      "reports_realtime",
      "priority_support",
      "marketing_materials",
      "api_access",
      "custom_integrations",
    ],
    features: ["realtime_analytics", "api_v1", "custom_integrations"],
    color: "#E5E4E2",
    icon: "crown",
    sortOrder: 3,
    isActive: true,
  },
  diamond: {
    tier: "diamond",
    minVolume: 100_000,
    commissionRate: 0.15,
    maxReferrals: null,
    benefits: [
      "all_features",
      "dedicated_account_manager",
      "custom_reporting",
      "early_access",
      "beta_features",
      "volume_discounts",
    ],
    features: ["all_integrations", "white_glove", "beta_access"],
    color: "#B9F2FF",
    icon: "diamond",
    sortOrder: 4,
    isActive: true,
  },
};

const mockPartners: PartnerRecord[] = [
  {
    id: 1001,
    userId: 501,
    tier: "silver",
    referralCode: "NEXUS-SILVER-A1B2",
    referralCount: 4,
    totalVolume: 1_250,
    commissionBalance: 62.5,
    status: "active",
    benefits: ["dashboard_basic", "reports_weekly", "email_support"],
    createdAt: new Date("2026-01-12T10:00:00Z"),
    updatedAt: new Date("2026-05-20T10:00:00Z"),
  },
  {
    id: 1002,
    userId: 502,
    tier: "gold",
    referralCode: "NEXUS-GOLD-C3D4",
    referralCount: 28,
    totalVolume: 12_400,
    commissionBalance: 992.0,
    status: "active",
    benefits: [
      "dashboard_advanced",
      "reports_daily",
      "priority_support",
      "marketing_materials",
    ],
    createdAt: new Date("2025-11-04T08:00:00Z"),
    updatedAt: new Date("2026-05-25T08:00:00Z"),
  },
  {
    id: 1003,
    userId: 503,
    tier: "platinum",
    referralCode: "NEXUS-PLATINUM-E5F6",
    referralCount: 87,
    totalVolume: 41_300,
    commissionBalance: 4_956.0,
    status: "active",
    benefits: [
      "dashboard_advanced",
      "reports_realtime",
      "priority_support",
      "marketing_materials",
      "api_access",
      "custom_integrations",
    ],
    createdAt: new Date("2025-08-19T12:00:00Z"),
    updatedAt: new Date("2026-05-28T12:00:00Z"),
  },
  {
    id: 1004,
    userId: 504,
    tier: "diamond",
    referralCode: "NEXUS-DIAMOND-G7H8",
    referralCount: 312,
    totalVolume: 187_000,
    commissionBalance: 28_050.0,
    status: "active",
    benefits: [
      "all_features",
      "dedicated_account_manager",
      "custom_reporting",
      "early_access",
      "beta_features",
      "volume_discounts",
    ],
    createdAt: new Date("2025-03-07T09:00:00Z"),
    updatedAt: new Date("2026-05-29T09:00:00Z"),
  },
];

const mockPartnerships: PartnershipRecord[] = [
  {
    id: 9001,
    partnerId: 1002,
    partnerName: "Camila Rocha",
    partnerEmail: "camila@example.com",
    partnerCompany: "CamilaDigital LTDA",
    status: "active",
    commissionRate: 0.08,
    benefits: ["co_branded_landing", "joint_newsletter"],
    notes: "Parceria de conteúdo mensal",
    startedAt: new Date("2026-02-01T00:00:00Z"),
    endedAt: null,
    approvedBy: 1,
    approvedAt: new Date("2026-02-02T00:00:00Z"),
    rejectionReason: null,
    createdAt: new Date("2026-01-25T10:00:00Z"),
    updatedAt: new Date("2026-02-02T00:00:00Z"),
  },
  {
    id: 9002,
    partnerId: 1003,
    partnerName: "Bruno Tavares",
    partnerEmail: "bruno@example.com",
    partnerCompany: "Tavares Media",
    status: "active",
    commissionRate: 0.12,
    benefits: ["white_label_pilot", "api_access"],
    notes: "White-label piloto em produção",
    startedAt: new Date("2026-03-15T00:00:00Z"),
    endedAt: null,
    approvedBy: 1,
    approvedAt: new Date("2026-03-16T00:00:00Z"),
    rejectionReason: null,
    createdAt: new Date("2026-03-10T10:00:00Z"),
    updatedAt: new Date("2026-03-16T00:00:00Z"),
  },
  {
    id: 9003,
    partnerId: 1004,
    partnerName: "Larissa Prado",
    partnerEmail: "larissa@example.com",
    partnerCompany: "Prado Group",
    status: "active",
    commissionRate: 0.15,
    benefits: ["dedicated_am", "beta_access"],
    notes: "Tier Diamond — early access a packs v2",
    startedAt: new Date("2026-04-01T00:00:00Z"),
    endedAt: null,
    approvedBy: 1,
    approvedAt: new Date("2026-04-01T00:00:00Z"),
    rejectionReason: null,
    createdAt: new Date("2026-03-25T10:00:00Z"),
    updatedAt: new Date("2026-04-01T00:00:00Z"),
  },
  {
    id: 9004,
    partnerId: 1001,
    partnerName: "Henrique Souza",
    partnerEmail: "henrique@example.com",
    partnerCompany: null,
    status: "pending",
    commissionRate: 0.05,
    benefits: [],
    notes: null,
    startedAt: null,
    endedAt: null,
    approvedBy: null,
    approvedAt: null,
    rejectionReason: null,
    createdAt: new Date("2026-05-28T10:00:00Z"),
    updatedAt: new Date("2026-05-28T10:00:00Z"),
  },
];

const mockVolumeHistory: PartnerVolumeHistoryEntry[] = [
  {
    id: 7001,
    partnerId: 1002,
    volume: 1_200,
    volumeType: "sale",
    source: "hotmart",
    sourceId: 501,
    description: "Venda direta (cursos)",
    createdAt: new Date("2026-05-10T12:00:00Z"),
  },
  {
    id: 7002,
    partnerId: 1002,
    volume: 320,
    volumeType: "commission",
    source: "shopee_affiliates",
    sourceId: 7788,
    description: "Comissão indireta nível 1",
    createdAt: new Date("2026-05-15T16:30:00Z"),
  },
  {
    id: 7003,
    partnerId: 1003,
    volume: 4_800,
    volumeType: "sale",
    source: "mercado_livre",
    sourceId: 9001,
    description: "Venda atacado",
    createdAt: new Date("2026-05-22T09:00:00Z"),
  },
  {
    id: 7004,
    partnerId: 1004,
    volume: 12_500,
    volumeType: "sale",
    source: "hotmart",
    sourceId: 9301,
    description: "Funil de lançamento",
    createdAt: new Date("2026-05-26T11:15:00Z"),
  },
  {
    id: 7005,
    partnerId: 1003,
    volume: 220,
    volumeType: "referral",
    source: "internal",
    sourceId: 1003,
    description: "Indicação qualificada",
    createdAt: new Date("2026-05-29T13:00:00Z"),
  },
];

// ---------------------------------------------------------------------------
// Snapshots de seed — usados por `resetPartnerRepository` para que
// testes possam restaurar o estado determinístico a cada caso.
// ---------------------------------------------------------------------------

const REVIVE_KEYS = ["createdAt", "updatedAt", "startedAt", "endedAt", "approvedAt"] as const;
function reviveDates(_key: string, value: unknown) {
  if (typeof value === "string" && REVIVE_KEYS.includes(_key as (typeof REVIVE_KEYS)[number])) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return value;
}

const initialPartnersSnapshot: PartnerRecord[] = JSON.parse(
  JSON.stringify(mockPartners),
  reviveDates,
);
const initialPartnershipsSnapshot: PartnershipRecord[] = JSON.parse(
  JSON.stringify(mockPartnerships),
  reviveDates,
);
const initialVolumeHistorySnapshot: PartnerVolumeHistoryEntry[] = JSON.parse(
  JSON.stringify(mockVolumeHistory),
  reviveDates,
);

/**
 * Restaura os arrays in-memory ao estado de seed e zera os
 * contadores de ID. Útil para testes e para jobs de reconciliação
 * que precisem reiniciar o estado.
 */
export function resetPartnerRepository(): void {
  mockPartners.length = 0;
  mockPartners.push(...JSON.parse(JSON.stringify(initialPartnersSnapshot), reviveDates));

  mockPartnerships.length = 0;
  mockPartnerships.push(
    ...JSON.parse(JSON.stringify(initialPartnershipsSnapshot), reviveDates),
  );

  mockVolumeHistory.length = 0;
  mockVolumeHistory.push(
    ...JSON.parse(JSON.stringify(initialVolumeHistorySnapshot), reviveDates),
  );

  nextPartnerId = 100_000;
  nextPartnershipId = 100_000;
  nextVolumeId = 100_000;
}

// ---------------------------------------------------------------------------
// Funções de leitura
// ---------------------------------------------------------------------------

export function listPartnerRecords(): PartnerRecord[] {
  return [...mockPartners];
}

export function getPartnerRecordById(id: number): PartnerRecord | undefined {
  return mockPartners.find((p) => p.id === id);
}

export function getPartnerRecordByUserId(userId: number): PartnerRecord | undefined {
  return mockPartners.find((p) => p.userId === userId);
}

export function listPartnershipRecords(): PartnershipRecord[] {
  return [...mockPartnerships];
}

export function getPartnershipRecordById(id: number): PartnershipRecord | undefined {
  return mockPartnerships.find((p) => p.id === id);
}

export function listPartnershipsByPartner(partnerId: number): PartnershipRecord[] {
  return mockPartnerships.filter((p) => p.partnerId === partnerId);
}

export function listVolumeHistory(partnerId: number): PartnerVolumeHistoryEntry[] {
  return mockVolumeHistory.filter((v) => v.partnerId === partnerId);
}

export function getPartnerTierConfig(tier: PartnerTier): PartnerTierConfigRecord {
  return partnerTierConfigSeed[tier];
}

export function listPartnerTierConfigs(): PartnerTierConfigRecord[] {
  return (Object.values(partnerTierConfigSeed) as PartnerTierConfigRecord[])
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

// ---------------------------------------------------------------------------
// Funções de escrita (mutam o estado in-memory)
// ---------------------------------------------------------------------------

let nextPartnerId = 100_000;
let nextPartnershipId = 100_000;
let nextVolumeId = 100_000;

export interface CreatePartnerInput {
  userId: number;
  tier: PartnerTier;
  referralCode?: string;
  benefits?: string[];
}

export function createPartnerRecord(input: CreatePartnerInput): PartnerRecord {
  const tier = input.tier;
  const referralCode =
    input.referralCode || `NEXUS-${tier.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const benefits = input.benefits ?? partnerTierConfigSeed[tier].benefits;

  const record: PartnerRecord = {
    id: nextPartnerId++,
    userId: input.userId,
    tier,
    referralCode,
    referralCount: 0,
    totalVolume: 0,
    commissionBalance: 0,
    status: "active",
    benefits,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockPartners.push(record);
  return record;
}

export interface CreatePartnershipInput {
  partnerId: number;
  partnerName: string;
  partnerEmail?: string;
  partnerCompany?: string;
  commissionRate: number;
  benefits?: string[];
  notes?: string;
}

export function createPartnershipRecord(input: CreatePartnershipInput): PartnershipRecord {
  const record: PartnershipRecord = {
    id: nextPartnershipId++,
    partnerId: input.partnerId,
    partnerName: input.partnerName,
    partnerEmail: input.partnerEmail ?? null,
    partnerCompany: input.partnerCompany ?? null,
    status: "pending",
    commissionRate: input.commissionRate,
    benefits: input.benefits ?? [],
    notes: input.notes ?? null,
    startedAt: null,
    endedAt: null,
    approvedBy: null,
    approvedAt: null,
    rejectionReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  mockPartnerships.push(record);
  return record;
}

export interface RegisterVolumeInput {
  partnerId: number;
  volume: number;
  volumeType: "sale" | "commission" | "referral" | "bonus";
  source?: string;
  sourceId?: number;
  description?: string;
}

export interface RegisterVolumeResult {
  historyEntry: PartnerVolumeHistoryEntry;
  newTotalVolume: number;
  promoted: boolean;
  previousTier: PartnerTier;
  newTier: PartnerTier;
}

export function registerVolumeForPartner(
  input: RegisterVolumeInput,
): RegisterVolumeResult | null {
  const partner = getPartnerRecordById(input.partnerId);
  if (!partner) return null;

  const historyEntry: PartnerVolumeHistoryEntry = {
    id: nextVolumeId++,
    partnerId: input.partnerId,
    volume: input.volume,
    volumeType: input.volumeType,
    source: input.source ?? null,
    sourceId: input.sourceId ?? null,
    description: input.description ?? null,
    createdAt: new Date(),
  };
  mockVolumeHistory.push(historyEntry);

  const previousTier = partner.tier;
  partner.totalVolume = Number(partner.totalVolume) + Number(input.volume);
  partner.updatedAt = new Date();

  // Verifica promoção para o próximo tier
  const tiers: PartnerTier[] = ["silver", "gold", "platinum", "diamond"];
  const currentIndex = tiers.indexOf(partner.tier);
  let newTier: PartnerTier = partner.tier;

  for (let i = tiers.length - 1; i > currentIndex; i--) {
    if (partner.totalVolume >= partnerTierConfigSeed[tiers[i]].minVolume) {
      newTier = tiers[i];
      break;
    }
  }

  let promoted = false;
  if (newTier !== previousTier) {
    partner.tier = newTier;
    partner.benefits = partnerTierConfigSeed[newTier].benefits;
    promoted = true;
  }

  return {
    historyEntry,
    newTotalVolume: partner.totalVolume,
    promoted,
    previousTier,
    newTier,
  };
}

export interface UpdatePartnershipStatusInput {
  id: number;
  status: PartnershipStatus;
  approvedBy?: number;
  reason?: string;
}

export function updatePartnershipStatus(
  input: UpdatePartnershipStatusInput,
): PartnershipRecord | null {
  const partnership = getPartnershipRecordById(input.id);
  if (!partnership) return null;

  partnership.status = input.status;
  partnership.updatedAt = new Date();

  if (input.status === "active") {
    partnership.approvedBy = input.approvedBy ?? null;
    partnership.approvedAt = new Date();
    partnership.startedAt = partnership.startedAt ?? new Date();
  } else if (input.status === "rejected" || input.status === "terminated") {
    partnership.endedAt = new Date();
    if (input.reason) partnership.rejectionReason = input.reason;
  }

  return partnership;
}
