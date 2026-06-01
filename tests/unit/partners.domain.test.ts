import { describe, expect, it } from "vitest";
import {
  GrowthAlgorithmEngine,
  calculatePartnerBenefits,
  getPartnerStatsSnapshot,
  listPartners,
  listPartnerTiersSorted,
} from "../../backend/src/domains/partners/service";

describe("partners domain service", () => {
  it("expõe tiers em ordem crescente de evolução", () => {
    expect(listPartnerTiersSorted()).toEqual(["silver", "gold", "platinum", "diamond"]);
  });

  it("retorna snapshot agregado consistente a partir do seed determinístico", () => {
    const snapshot = getPartnerStatsSnapshot();

    expect(snapshot.totalPartners).toBeGreaterThanOrEqual(4);
    expect(snapshot.activePartners).toBeGreaterThanOrEqual(4);
    expect(snapshot.totalVolume).toBeGreaterThan(0);
    expect(snapshot.topPerformers[0]?.tier).toBe("diamond");
    expect(snapshot.topPerformers[0]?.volume).toBeGreaterThan(snapshot.topPerformers[1]?.volume ?? 0);
  });

  it("calcula benefícios para parceiro seeded sem retornar nulo", () => {
    const partner = listPartners()[1];
    expect(partner).toBeDefined();

    const benefits = calculatePartnerBenefits(partner.id);
    expect(benefits).not.toBeNull();
    expect(benefits?.partnerId).toBe(partner.id);
    expect(benefits?.totalCommissionRate).toBeGreaterThan(0);
    expect(Array.isArray(benefits?.tierBenefits)).toBe(true);
  });

  it("aumenta bônus de rede conforme referral count cresce", () => {
    const low = GrowthAlgorithmEngine.calculateNetworkBonus(10, "gold");
    const high = GrowthAlgorithmEngine.calculateNetworkBonus(180, "gold");

    expect(high).toBeGreaterThanOrEqual(low);
  });

  it("projeta promoção futura com crescimento mensal positivo", () => {
    const growth = GrowthAlgorithmEngine.calculateGrowthPotential("silver", 1000, 1200, 0.4);

    expect(["gold", "platinum", "diamond"]).toContain(growth.potentialTier);
    expect(growth.monthsToPromote).toBeGreaterThan(0);
    expect(growth.confidence).toBeGreaterThanOrEqual(0);
    expect(growth.confidence).toBeLessThanOrEqual(1);
  });
});
