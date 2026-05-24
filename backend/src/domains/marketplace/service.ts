import type {
  ConnectMarketplaceInput,
  MarketplaceAccountRecord,
  MarketplaceAccountView,
  MarketplaceAnalyticsView,
  MarketplaceMarginsView,
  MarketplaceProductView,
  QueueMarketplaceSyncInput,
  SupportedMarketplace,
} from "./types";

export class MarketplaceAccountAccessError extends Error {
  constructor() {
    super("Account not found");
    this.name = "MarketplaceAccountAccessError";
  }
}

export class MarketplaceProductAnalyticsNotFoundError extends Error {
  constructor() {
    super("Product trends not found");
    this.name = "MarketplaceProductAnalyticsNotFoundError";
  }
}

export interface MarketplaceQueueJob {
  id?: string | number;
}

export interface QueueMarketplaceSyncDeps {
  getAccountById: (accountId: number) => Promise<MarketplaceAccountRecord | null>;
  markSyncing: (accountId: number) => Promise<void>;
  enqueueSync: (input: {
    marketplace: SupportedMarketplace;
    syncType: "incremental";
    accountId: number;
    requestedByUserId: number;
  }) => Promise<MarketplaceQueueJob>;
}

export interface ConnectMarketplaceDeps {
  insertAccount: (input: ConnectMarketplaceInput) => Promise<number>;
}

export function mapMarketplaceAccount(account: MarketplaceAccountRecord): MarketplaceAccountView {
  return {
    id: account.id,
    marketplace: account.marketplace,
    accountName: account.accountName,
    isActive: account.isActive === 1,
    lastSyncAt: account.lastSyncAt,
    syncStatus: account.syncStatus,
    createdAt: account.createdAt,
  };
}

export function mapMarketplaceProduct(
  product: any,
  options?: { includeProductUrl?: boolean; includeCategory?: boolean },
): MarketplaceProductView {
  return {
    id: product.id,
    productName: product.productName,
    price: product.price,
    marketplace: product.marketplace,
    rating: product.rating,
    sales: product.sales,
    imageUrl: product.imageUrl ?? null,
    commissionPercentage: product.commissionPercentage,
    ...(options?.includeProductUrl ? { productUrl: product.productUrl ?? null } : {}),
    ...(options?.includeCategory ? { category: product.category ?? null } : {}),
  };
}

export async function connectMarketplaceAccount(
  input: ConnectMarketplaceInput,
  deps: ConnectMarketplaceDeps,
) {
  const accountId = await deps.insertAccount(input);

  return {
    success: true,
    accountId,
    marketplace: input.marketplace,
    accountName: input.accountName,
  };
}

export function listConnectedMarketplaceAccounts(accounts: MarketplaceAccountRecord[]) {
  return accounts.map(mapMarketplaceAccount);
}

export async function disconnectMarketplaceAccount(
  input: QueueMarketplaceSyncInput,
  deps: {
    getAccountById: (accountId: number) => Promise<MarketplaceAccountRecord | null>;
    deactivateAccount: (accountId: number) => Promise<void>;
  },
) {
  const account = await deps.getAccountById(input.accountId);
  if (!account || account.userId !== input.userId) {
    throw new MarketplaceAccountAccessError();
  }

  await deps.deactivateAccount(input.accountId);
  return { success: true };
}

export async function queueMarketplaceSync(
  input: QueueMarketplaceSyncInput,
  deps: QueueMarketplaceSyncDeps,
) {
  const account = await deps.getAccountById(input.accountId);
  if (!account || account.userId !== input.userId) {
    throw new MarketplaceAccountAccessError();
  }

  await deps.markSyncing(input.accountId);
  const syncJob = await deps.enqueueSync({
    marketplace: account.marketplace as SupportedMarketplace,
    syncType: "incremental",
    accountId: input.accountId,
    requestedByUserId: input.userId,
  });

  return {
    success: true,
    message: "Synchronization queued",
    accountId: input.accountId,
    jobId: String(syncJob.id),
    marketplace: account.marketplace,
  };
}

export function getTrendingMarketplaceProducts(products: any[]): MarketplaceProductView[] {
  return products.map((product) => mapMarketplaceProduct(product));
}

export function getRecommendedMarketplaceProducts(products: any[]): MarketplaceProductView[] {
  return products.map((product) =>
    mapMarketplaceProduct(product, { includeProductUrl: true }),
  );
}

export function getMarketplaceProductsByCategory(products: any[]): MarketplaceProductView[] {
  return products.map((product) =>
    mapMarketplaceProduct(product, { includeCategory: true }),
  );
}

export function getMarketplaceProductsByMarketplace(products: any[]): MarketplaceProductView[] {
  return products.map((product) => mapMarketplaceProduct(product));
}

export function getMarketplaceProductsByRecommendation(products: any[]): MarketplaceProductView[] {
  return products.map((product) => mapMarketplaceProduct(product));
}

export function buildAffiliateMarginsResponse(earnings: any): MarketplaceMarginsView {
  return {
    totalEarnings: earnings.totalEarnings,
    estimatedMonthlyEarnings: earnings.estimatedMonthlyEarnings,
    totalSales: earnings.totalSales,
    averageCommission: earnings.averageCommission,
  };
}

export function buildProductAnalyticsResponse(trends: any): MarketplaceAnalyticsView {
  if (!trends) {
    throw new MarketplaceProductAnalyticsNotFoundError();
  }

  return {
    trendingScore: trends.trendingScore,
    demandLevel: trends.demandLevel,
    competitionLevel: trends.competitionLevel,
    profitabilityScore: trends.profitabilityScore,
    recommendation: trends.recommendation,
    analyzedAt: trends.analyzedAt,
  };
}
