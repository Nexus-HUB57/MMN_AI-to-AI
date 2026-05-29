/**
 * Revenue Share Service
 * -----------------------------------------------------------------------------
 * Handles revenue sharing with skill creators.
 */

import { randomUUID } from "node:crypto";

import type { RevenueShare, MarketplaceOrder, CreatorRegistration } from "./types";

/**
 * Revenue share configuration
 */
const REVENUE_SHARE_CONFIG = {
  platformFee: 0.15, // 15% FTM平台佣金
  authorShare: 0.70, // 70% 给作者
  affiliateShare: 0.15, // 15% 给分销推荐人 (if any)
};

/**
 * Get revenue share for a skill
 */
export async function getSkillRevenueShare(
  skillId: string,
): Promise<RevenueShare | null> {
  return {
    skillId,
    authorId: "author-001",
    totalRevenue: 15000,
    totalSubscriptions: 45,
    currentPeriodRevenue: 2300,
    payoutStatus: "pending",
    lastPayoutDate: "2026-04-30T00:00:00Z",
    nextPayoutDate: "2026-05-31T00:00:00Z",
  };
}

/**
 * Calculate revenue split for an order
 */
export function calculateRevenueSplit(
  orderAmount: number,
  hasAffiliation: boolean = false,
): {
  platformFee: number;
  authorShare: number;
  affiliateShare: number;
} {
  const platformFee = Math.round(orderAmount * REVENUE_SHARE_CONFIG.platformFee * 100) / 100;
  let authorShare = Math.round(
    orderAmount * REVENUE_SHARE_CONFIG.authorShare * 100,
  ) / 100;
  let affiliateShare = 0;

  if (hasAffiliation) {
    const affiliateAmount = Math.round(
      orderAmount * REVENUE_SHARE_CONFIG.affiliateShare * 100,
    ) / 100;
    authorShare = Math.round(authorShare * 100 - affiliateAmount * 100) / 100;
    affiliateShare = affiliateAmount;
  }

  return {
    platformFee,
    authorShare,
    affiliateShare,
  };
}

/**
 * Register creator for marketplace
 */
export async function registerCreator(
  registration: Omit<CreatorRegistration, "id" | "createdAt">,
): Promise<{
  success: boolean;
  creatorId?: string;
  error?: string;
}> {
  // Validate required fields
  if (!registration.userId || !registration.displayName) {
    return { success: false, error: "Missing required fields" };
  }

  // TODO: Store in database

  return {
    success: true,
    creatorId: randomUUID(),
  };
}

/**
 * Get creator registration status
 */
export async function getCreatorStatus(
  userId: string,
): Promise<CreatorRegistration | null> {
  return {
    id: "creator-001",
    userId,
    displayName: "Nexus AI Creator",
    bio: "Expert in AI-powered automation",
    website: "https://oneverso.com.br",
    expertise: ["copywriting", "automation", "analytics"],
    verificationStatus: "verified",
    payoutInfo: {
      bank: "001",
      agency: "0001",
      account: "12345678",
      accountType: "checking",
      document: "12345678900",
    },
    createdAt: "2026-01-01T00:00:00Z",
  };
}

/**
 * Get earnings summary for a creator
 */
export async function getCreatorEarnings(
  authorId: string,
  period: "week" | "month" | "quarter" = "month",
): Promise<{
  totalEarnings: number;
  pendingPayout: number;
  paidOut: number;
  orderCount: number;
  skillsCount: number;
  chartData: { date: string; amount: number }[];
}> {
  return {
    totalEarnings: 15000,
    pendingPayout: 2300,
    paidOut: 12700,
    orderCount: 45,
    skillsCount: 3,
    chartData: [
      { date: "2026-01", amount: 3200 },
      { date: "2026-02", amount: 3800 },
      { date: "2026-03", amount: 4500 },
      { date: "2026-04", amount: 3500 },
    ],
  };
}

/**
 * Process payout to creator
 */
export async function processPayout(
  authorId: string,
  amount: number,
): Promise<{
  success: boolean;
  transactionId?: string;
  error?: string;
}> {
  if (amount <= 0) {
    return { success: false, error: "Invalid payout amount" };
  }

  // TODO: Integrate with payment provider (PIX/Bank transfer)
  console.info(`[RevenueShare] Processing payout of R$ ${amount} to author ${authorId}`);

  return {
    success: true,
    transactionId: randomUUID(),
  };
}

/**
 * Get payout history
 */
export async function getPayoutHistory(
  authorId: string,
  limit: number = 20,
): Promise<{
  transactions: {
    id: string;
    amount: number;
    status: "pending" | "completed" | "failed";
    createdAt: string;
    processedAt: string | null;
  }[];
}> {
  return {
    transactions: [
      {
        id: "payout-001",
        amount: 4500,
        status: "completed",
        createdAt: "2026-04-25T00:00:00Z",
        processedAt: "2026-04-30T00:00:00Z",
      },
      {
        id: "payout-002",
        amount: 3200,
        status: "completed",
        createdAt: "2026-03-25T00:00:00Z",
        processedAt: "2026-03-31T00:00:00Z",
      },
    ],
  };
}

/**
 * Update creator payout info
 */
export async function updatePayoutInfo(
  authorId: string,
  payoutInfo: CreatorRegistration["payoutInfo"],
): Promise<{
  success: boolean;
  error?: string;
}> {
  // TODO: Validate bank account
  // TODO: Store in database

  return { success: true };
}
