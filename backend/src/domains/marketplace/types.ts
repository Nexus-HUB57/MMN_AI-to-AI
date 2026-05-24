import type { MarketplaceAccount } from "../../drizzle/schema";

export type SupportedMarketplace = "mercado_libre" | "shopee" | "hotmart";

export interface ConnectMarketplaceInput {
  userId: number;
  marketplace: SupportedMarketplace;
  accountName: string;
  accessToken: string;
  refreshToken?: string;
  apiKey?: string;
  apiSecret?: string;
}

export interface MarketplaceAccountView {
  id: number;
  marketplace: string;
  accountName: string;
  isActive: boolean;
  lastSyncAt: Date | null;
  syncStatus: string;
  createdAt: Date;
}

export interface QueueMarketplaceSyncInput {
  userId: number;
  accountId: number;
}

export interface MarketplaceProductView {
  id: number;
  productName: string;
  price: number;
  marketplace: string;
  rating: number;
  sales: number;
  imageUrl: string | null;
  commissionPercentage: number;
  productUrl?: string | null;
  category?: string | null;
}

export interface MarketplaceMarginsView {
  totalEarnings: number;
  estimatedMonthlyEarnings: number;
  totalSales: number;
  averageCommission: number;
}

export interface MarketplaceAnalyticsView {
  trendingScore: number;
  demandLevel: string;
  competitionLevel: string;
  profitabilityScore: number;
  recommendation: string;
  analyzedAt: Date;
}

export type MarketplaceAccountRecord = MarketplaceAccount;
