/**
 * Hotmart Commission Service
 * -----------------------------------------------------------------------------
 * Handles commission splitting and affiliate payments.
 */

import { randomUUID } from "node:crypto";

import { fetchHotmartAffiliates, fetchHotmartSales } from "./hotmartClient";

export interface CommissionRecord {
  id: string;
  saleId: string;
  transactionId: string;
  affiliateId: string;
  affiliateEmail: string;
  affiliateName: string;
  grossAmount: number;
  commissionAmount: number;
  commissionPercentage: number;
  currency: string;
  productId: string;
  productName: string;
  status: "PENDING" | "APPROVED" | "PAID" | "CANCELLED";
  createdAt: string;
  paidAt: string | null;
}

export interface CommissionSplitConfig {
  defaultPercentage: number;
  tiers: {
    volume: number;
    percentage: number;
  }[];
}

/**
 * Default commission configuration
 */
const DEFAULT_COMMISSION_CONFIG: CommissionSplitConfig = {
  defaultPercentage: 0.3, // 30%
  tiers: [
    { volume: 5000, percentage: 0.35 }, // 35% for R$ 5k+
    { volume: 15000, percentage: 0.40 }, // 40% for R$ 15k+
    { volume: 50000, percentage: 0.45 }, // 45% for R$ 50k+
  ],
};

/**
 * Calculate commission for an affiliate sale
 */
export function calculateCommission(
  saleAmount: number,
  commissionConfig: CommissionSplitConfig = DEFAULT_COMMISSION_CONFIG,
): { percentage: number; amount: number } {
  let percentage = commissionConfig.defaultPercentage;

  // Apply tiered percentage based on affiliate volume
  for (const tier of commissionConfig.tiers) {
    // In real implementation, this would check the affiliate's actual volume
    percentage = tier.percentage;
  }

  return {
    percentage,
    amount: saleAmount * percentage,
  };
}

/**
 * Generate commission records from Hotmart sales
 */
export async function generateCommissionRecords(
  options: {
    startDate?: string;
    endDate?: string;
    affiliateId?: string;
  } = {},
): Promise<CommissionRecord[]> {
  const records: CommissionRecord[] = [];

  try {
    const sales = await fetchHotmartSales({
      startDate: options.startDate,
      endDate: options.endDate,
      status: "COMPLETED",
    });

    for (const sale of sales) {
      if (!sale.affiliateId) continue;
      if (options.affiliateId && sale.affiliateId !== options.affiliateId) continue;

      const commission = calculateCommission(sale.amount);

      records.push({
        id: randomUUID(),
        saleId: sale.id,
        transactionId: sale.transaction,
        affiliateId: sale.affiliateId,
        affiliateEmail: sale.affiliateEmail ?? "",
        affiliateName: sale.affiliateEmail?.split("@")[0] ?? "Unknown",
        grossAmount: sale.amount,
        commissionAmount: commission.amount,
        commissionPercentage: commission.percentage,
        currency: sale.currency,
        productId: sale.productId,
        productName: sale.productName,
        status: "PENDING",
        createdAt: sale.createdAt,
        paidAt: null,
      });
    }
  } catch (error) {
    console.error("[Hotmart Commission] Failed to generate records:", error);
  }

  return records;
}

/**
 * Calculate affiliate performance metrics
 */
export async function calculateAffiliateMetrics(
  affiliateId: string,
  options: {
    startDate?: string;
    endDate?: string;
  } = {},
): Promise<{
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  conversionRate: number;
  topProducts: { productId: string; productName: string; sales: number }[];
}> {
  const sales = await fetchHotmartSales({
    startDate: options.startDate,
    endDate: options.endDate,
    status: "COMPLETED",
  });

  const affiliateSales = sales.filter((s) => s.affiliateId === affiliateId);

  let totalRevenue = 0;
  const productSales: Record<string, number> = {};

  for (const sale of affiliateSales) {
    totalRevenue += sale.amount;
    productSales[sale.productId] = (productSales[sale.productId] ?? 0) + 1;
  }

  const allSales = await fetchHotmartSales({
    startDate: options.startDate,
    endDate: options.endDate,
  });
  const totalPotentialSales = allSales.length;
  const conversionRate =
    totalPotentialSales > 0 ? affiliateSales.length / totalPotentialSales : 0;

  const topProducts = Object.entries(productSales)
    .map(([productId, salesCount]) => ({
      productId,
      productName:
        affiliateSales.find((s) => s.productId === productId)?.productName ?? productId,
      sales: salesCount,
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  const totalCommission = totalRevenue * DEFAULT_COMMISSION_CONFIG.defaultPercentage;

  return {
    totalSales: affiliateSales.length,
    totalRevenue,
    totalCommission,
    conversionRate,
    topProducts,
  };
}
