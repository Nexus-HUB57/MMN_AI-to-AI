/**
 * Partners domain service.
 *
 * Concentra:
 *  - O `GrowthAlgorithmEngine` (cálculos puros de crescimento exponencial).
 *  - Casos de uso do domínio Partners (registrar volume, aprovar/rejeitar
 *    parcerias, calcular benefícios, projetar promoções).
 *  - Publicação de eventos de domínio após cada mutação.
 *
 * Esta camada é a fonte de verdade da lógica de negócio. O router
 * legado (`routers/partnersRouter.ts`) delega a estes serviços.
 */

import type { PartnerTier, PartnershipStatus } from "./types";
import {
  createPartnerRecord,
  createPartnershipRecord,
  getPartnerRecordById,
  getPartnerTierConfig,
  getPartnershipRecordById,
  listPartnerRecords,
  listPartnerTierConfigs,
  listPartnershipRecords,
  listVolumeHistory,
  registerVolumeForPartner,
  updatePartnershipStatus,
  type CreatePartnerInput,
  type CreatePartnershipInput,
  type PartnerRecord,
  type PartnerTierConfigRecord,
  type PartnershipRecord,
  type PartnerVolumeHistoryEntry,
  type RegisterVolumeInput,
  type UpdatePartnershipStatusInput,
} from "./repository";
import {
  publishPartnerRegistered,
  publishPartnerTierPromoted,
  publishPartnerVolumeRegistered,
  publishPartnershipApproved,
  publishPartnershipCreated,
  publishPartnershipRejected,
  publishPartnershipTerminated,
} from "./events";

// ============================================================================
// Growth Algorithm Engine — cálculos puros
// ============================================================================

export interface GrowthPotential {
  potentialTier: PartnerTier;
  monthsToPromote: number;
  confidence: number;
}

export interface TieredReferralBonus {
  bonus: number;
  tier: "basic" | "standard" | "advanced" | "expert" | "master";
}

export interface RetentionInput {
  activeMonths: number;
  totalVolume: number;
  referralRate: number;
}

export const GrowthAlgorithmEngine = {
  /**
   * Calcula multiplicador de volume baseado no tier atual e volume total.
   * Fator exponencial: a cada R$ 10k acima do mínimo do tier,
   * multiplicador aumenta 5%. Cap em 2x a comissão base.
   */
  calculateVolumeMultiplier(tier: PartnerTier, totalVolume: number): number {
    const config = getPartnerTierConfig(tier);
    const baseMultiplier = config.commissionRate;
    const excessVolume = Math.max(0, totalVolume - config.minVolume);
    const exponentialFactor = 1 + (excessVolume / 10_000) * 0.05;
    return Math.min(exponentialFactor * baseMultiplier, config.commissionRate * 2);
  },

  /**
   * Bônus de rede baseado no número de indicados e capacidade do tier.
   *  - 0.2% por indicação acima de 50% da capacidade máxima
   *  - Diamond: sem limite (progressivo puro)
   */
  calculateNetworkBonus(referralCount: number, tier: PartnerTier): number {
    const config = getPartnerTierConfig(tier);
    if (config.maxReferrals === null) {
      return referralCount * 0.002;
    }
    const threshold = config.maxReferrals * 0.5;
    const excess = Math.max(0, referralCount - threshold);
    return excess * 0.002;
  },

  /**
   * Score de retenção (0-100):
   *   - tempo na rede (peso 0.3)
   *   - volume gerado (peso 0.4)
   *   - taxa de indicação (peso 0.3)
   */
  calculateRetentionScore(metrics: RetentionInput): number {
    const timeScore = Math.min(metrics.activeMonths / 12, 1) * 0.3;
    const volumeScore = Math.min(metrics.totalVolume / 50_000, 1) * 0.4;
    const referralScore = Math.min(metrics.referralRate, 1) * 0.3;
    return (timeScore + volumeScore + referralScore) * 100;
  },

  /**
   * Projeção de promoção. Retorna o próximo tier alcançável,
   * meses estimados (com base no crescimento mensal) e confiança.
   */
  calculateGrowthPotential(
    currentTier: PartnerTier,
    currentVolume: number,
    monthlyGrowth: number,
    referralRate: number,
  ): GrowthPotential {
    const tiers: PartnerTier[] = ["silver", "gold", "platinum", "diamond"];
    const currentIndex = tiers.indexOf(currentTier);

    for (let i = currentIndex + 1; i < tiers.length; i++) {
      const requiredVolume = getPartnerTierConfig(tiers[i]).minVolume;
      if (currentVolume >= requiredVolume) continue;
      const volumeNeeded = requiredVolume - currentVolume;
      const monthsToPromote =
        monthlyGrowth > 0 ? volumeNeeded / monthlyGrowth : Number.POSITIVE_INFINITY;
      const confidence =
        Math.min(1, monthlyGrowth / 1_000) * Math.min(1, referralRate * 2);
      return {
        potentialTier: tiers[i],
        monthsToPromote: Number.isFinite(monthsToPromote) ? Math.round(monthsToPromote) : 999,
        confidence: Math.round(confidence * 100) / 100,
      };
    }

    return { potentialTier: "diamond", monthsToPromote: 0, confidence: 1 };
  },

  /**
   * Bônus escalonado por número de indicações.
   * Faixas: 5+ (standard 8%), 20+ (advanced 10%), 50+ (expert 12%),
   * 100+ (master 15%).
   */
  calculateTieredReferralBonus(referralCount: number): TieredReferralBonus {
    if (referralCount >= 100) return { bonus: 0.15, tier: "master" };
    if (referralCount >= 50) return { bonus: 0.12, tier: "expert" };
    if (referralCount >= 20) return { bonus: 0.10, tier: "advanced" };
    if (referralCount >= 5) return { bonus: 0.08, tier: "standard" };
    return { bonus: 0.05, tier: "basic" };
  },
};

// ============================================================================
// Métricas agregadas
// ============================================================================

export interface PartnerStatsSnapshot {
  totalPartners: number;
  activePartners: number;
  inactivePartners: number;
  totalVolume: number;
  totalCommissions: number;
  averageTier: PartnerTier;
  tierDistribution: Record<PartnerTier, number>;
  topPerformers: Array<{
    id: number;
    tier: PartnerTier;
    volume: number;
    referralCount: number;
  }>;
  growthRate: number;
  averageVolumePerPartner: number;
}

const TIER_ORDER: PartnerTier[] = ["silver", "gold", "platinum", "diamond"];

export function getPartnerStatsSnapshot(): PartnerStatsSnapshot {
  const partners = listPartnerRecords();
  const active = partners.filter((p) => p.status === "active");
  const totalVolume = partners.reduce((acc, p) => acc + Number(p.totalVolume), 0);
  const totalCommissions = partners.reduce(
    (acc, p) => acc + Number(p.commissionBalance),
    0,
  );

  const tierDistribution: Record<PartnerTier, number> = {
    silver: 0,
    gold: 0,
    platinum: 0,
    diamond: 0,
  };
  for (const p of partners) tierDistribution[p.tier]++;

  const dominantEntry = (Object.entries(tierDistribution) as [PartnerTier, number][])
    .sort((a, b) => b[1] - a[1])[0];

  const topPerformers = [...partners]
    .sort((a, b) => Number(b.totalVolume) - Number(a.totalVolume))
    .slice(0, 10)
    .map((p) => ({
      id: p.id,
      tier: p.tier,
      volume: Number(p.totalVolume),
      referralCount: p.referralCount,
    }));

  const baseline = partners.length * 1_000;
  const growthRate =
    totalVolume > 0 && baseline > 0
      ? Math.round(((totalVolume - baseline) / baseline) * 10_000) / 100
      : 0;

  return {
    totalPartners: partners.length,
    activePartners: active.length,
    inactivePartners: partners.length - active.length,
    totalVolume,
    totalCommissions,
    averageTier: dominantEntry?.[0] ?? "silver",
    tierDistribution,
    topPerformers,
    growthRate,
    averageVolumePerPartner: partners.length > 0 ? totalVolume / partners.length : 0,
  };
}

// ============================================================================
// Casos de uso — Parceiros
// ============================================================================

export interface RegisterPartnerResult {
  partner: PartnerRecord;
  tierConfig: PartnerTierConfigRecord;
}

export async function registerPartner(
  input: CreatePartnerInput,
): Promise<RegisterPartnerResult> {
  const partner = createPartnerRecord(input);
  const tierConfig = getPartnerTierConfig(partner.tier);

  await publishPartnerRegistered({
    partnerId: String(partner.id),
    userId: partner.userId,
    tier: partner.tier,
    referralCode: partner.referralCode,
    metadata: { source: "partners.register" },
  });

  return { partner, tierConfig };
}

export interface PartnerBenefitsBreakdown {
  partnerId: number;
  tier: PartnerTier;
  tierBenefits: string[];
  volumeMultiplier: number;
  networkBonus: number;
  referralBonus: number;
  referralTier: TieredReferralBonus["tier"];
  totalCommissionRate: number;
}

export function calculatePartnerBenefits(
  partnerId: number,
): PartnerBenefitsBreakdown | null {
  const partner = getPartnerRecordById(partnerId);
  if (!partner) return null;

  const tierConfig = getPartnerTierConfig(partner.tier);
  const volumeMultiplier = GrowthAlgorithmEngine.calculateVolumeMultiplier(
    partner.tier,
    Number(partner.totalVolume),
  );
  const networkBonus = GrowthAlgorithmEngine.calculateNetworkBonus(
    partner.referralCount,
    partner.tier,
  );
  const referralBonus = GrowthAlgorithmEngine.calculateTieredReferralBonus(
    partner.referralCount,
  );

  return {
    partnerId,
    tier: partner.tier,
    tierBenefits: tierConfig.benefits,
    volumeMultiplier,
    networkBonus,
    referralBonus: referralBonus.bonus,
    referralTier: referralBonus.tier,
    totalCommissionRate:
      (tierConfig.commissionRate + networkBonus + referralBonus.bonus) * volumeMultiplier,
  };
}

export interface PartnerGrowthAnalysis {
  partner: PartnerRecord;
  retentionScore: number;
  growthPotential: GrowthPotential;
  benefits: PartnerBenefitsBreakdown;
}

export function analyzePartnerGrowth(partnerId: number): PartnerGrowthAnalysis | null {
  const partner = getPartnerRecordById(partnerId);
  if (!partner) return null;

  const now = new Date();
  const activeMonths = Math.max(
    1,
    (now.getTime() - partner.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30),
  );

  // Estima taxa de indicação e crescimento mensal via histórico
  const history = listVolumeHistory(partnerId);
  const totalSales = history
    .filter((h) => h.volumeType === "sale")
    .reduce((acc, h) => acc + Number(h.volume), 0);
  const referralRate = partner.referralCount / Math.max(activeMonths, 1);
  const monthlyGrowth = activeMonths > 0 ? Number(partner.totalVolume) / activeMonths : 0;

  const retentionScore = GrowthAlgorithmEngine.calculateRetentionScore({
    activeMonths,
    totalVolume: Number(partner.totalVolume),
    referralRate,
  });

  const growthPotential = GrowthAlgorithmEngine.calculateGrowthPotential(
    partner.tier,
    Number(partner.totalVolume),
    monthlyGrowth,
    referralRate,
  );

  const benefits = calculatePartnerBenefits(partnerId);
  if (!benefits) return null;

  return {
    partner,
    retentionScore,
    growthPotential,
    benefits,
  };
}

// ============================================================================
// Casos de uso — Volume / Promoção
// ============================================================================

export async function recordPartnerVolume(
  input: RegisterVolumeInput,
): Promise<{
  history: PartnerVolumeHistoryEntry;
  promoted: boolean;
  newTotalVolume: number;
  previousTier: PartnerTier;
  newTier: PartnerTier;
} | null> {
  const result = registerVolumeForPartner(input);
  if (!result) return null;

  await publishPartnerVolumeRegistered({
    partnerId: String(input.partnerId),
    volume: input.volume,
    volumeType: input.volumeType,
    totalVolumeAfter: result.newTotalVolume,
    source: input.source,
    triggeredPromotion: result.promoted,
  });

  if (result.promoted) {
    await publishPartnerTierPromoted({
      partnerId: String(input.partnerId),
      previousTier: result.previousTier,
      newTier: result.newTier,
      totalVolume: result.newTotalVolume,
      newCommissionRate: getPartnerTierConfig(result.newTier).commissionRate,
      triggeredBy: "volume_threshold",
    });
  }

  return {
    history: result.historyEntry,
    promoted: result.promoted,
    newTotalVolume: result.newTotalVolume,
    previousTier: result.previousTier,
    newTier: result.newTier,
  };
}

// ============================================================================
// Casos de uso — Parcerias
// ============================================================================

export async function openPartnership(
  input: CreatePartnershipInput,
): Promise<PartnershipRecord | null> {
  const partnership = createPartnershipRecord(input);
  if (!partnership) return null;

  await publishPartnershipCreated({
    partnershipId: String(partnership.id),
    partnerId: String(partnership.partnerId),
    partnerName: partnership.partnerName,
    status: partnership.status,
  });

  return partnership;
}

export async function approvePartnership(
  id: number,
  approverId: number,
): Promise<PartnershipRecord | null> {
  const updated = updatePartnershipStatus({
    id,
    status: "active",
    approvedBy: approverId,
  });
  if (!updated) return null;

  await publishPartnershipApproved({
    partnershipId: String(updated.id),
    partnerId: String(updated.partnerId),
    partnerName: updated.partnerName,
    status: updated.status,
    approvedBy: approverId,
  });

  return updated;
}

export async function rejectPartnership(
  id: number,
  reason?: string,
): Promise<PartnershipRecord | null> {
  const updated = updatePartnershipStatus({
    id,
    status: "rejected",
    reason,
  });
  if (!updated) return null;

  await publishPartnershipRejected({
    partnershipId: String(updated.id),
    partnerId: String(updated.partnerId),
    partnerName: updated.partnerName,
    status: updated.status,
    reason,
  });

  return updated;
}

export async function terminatePartnership(
  id: number,
  reason?: string,
): Promise<PartnershipRecord | null> {
  const updated = updatePartnershipStatus({
    id,
    status: "terminated",
    reason,
  });
  if (!updated) return null;

  await publishPartnershipTerminated({
    partnershipId: String(updated.id),
    partnerId: String(updated.partnerId),
    partnerName: updated.partnerName,
    status: updated.status,
    reason,
  });

  return updated;
}

// ============================================================================
// Read-only helpers (composição de queries)
// ============================================================================

export function getPartnerById(id: number): PartnerRecord | undefined {
  return getPartnerRecordById(id);
}

export function listPartners(): PartnerRecord[] {
  return listPartnerRecords();
}

export function listPartnerships(): PartnershipRecord[] {
  return listPartnershipRecords();
}

export function listTiers(): PartnerTierConfigRecord[] {
  return listPartnerTierConfigs();
}

export function getPartnershipById(id: number): PartnershipRecord | undefined {
  return getPartnershipRecordById(id);
}

export function getPartnerVolumeHistory(partnerId: number): PartnerVolumeHistoryEntry[] {
  return listVolumeHistory(partnerId);
}

export function listPartnerTiersSorted(): PartnerTier[] {
  return [...TIER_ORDER];
}
