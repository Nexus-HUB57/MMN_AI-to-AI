import { beforeEach, describe, expect, it, vi } from "vitest";

const accountsStore: Array<{
  id: number;
  userId: number;
  marketplace: "mercado_libre" | "shopee" | "hotmart";
  accountName: string;
  accessToken: string;
  refreshToken?: string;
  apiKey?: string;
  apiSecret?: string;
  isActive: number;
  syncStatus: string;
  lastSyncAt: Date | null;
  createdAt: Date;
}> = [];

let nextAccountId = 1;

function filterAccounts(condition?: { column?: { name?: string }; value?: unknown }) {
  if (!condition?.column?.name) return [...accountsStore];

  switch (condition.column.name) {
    case "id":
      return accountsStore.filter((account) => account.id === condition.value);
    case "userId":
      return accountsStore.filter((account) => account.userId === condition.value);
    default:
      return [...accountsStore];
  }
}

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    eq: (column: { name?: string }, value: unknown) => ({ column, value }),
  };
});

vi.mock("../../backend/src/config/queue", () => ({
  addMarketplaceSyncJob: vi.fn(async (job: { accountId?: number }) => ({
    id: `job-${job.accountId ?? "all"}`,
  })),
}));

vi.mock("../../backend/src/routers/marketplace-helpers", () => ({
  getTrendingProducts: vi.fn(async (_days: number, limit: number) =>
    [
      {
        id: 11,
        productName: "Kit Creator",
        price: 19990,
        marketplace: "mercado_libre",
        rating: 92,
        sales: 410,
        imageUrl: "https://example.com/ml-kit.jpg",
        commissionPercentage: 12,
      },
      {
        id: 12,
        productName: "Curso Hotmart Pro",
        price: 49700,
        marketplace: "hotmart",
        rating: 95,
        sales: 190,
        imageUrl: "https://example.com/hotmart-pro.jpg",
        commissionPercentage: 45,
      },
    ].slice(0, limit)
  ),
  getRecommendedProducts: vi.fn(async (limit: number) =>
    [
      {
        id: 21,
        productName: "Produto Recomendado",
        price: 25990,
        marketplace: "shopee",
        rating: 90,
        sales: 320,
        imageUrl: "https://example.com/shopee-rec.jpg",
        commissionPercentage: 18,
        productUrl: "https://example.com/product/21",
      },
    ].slice(0, limit)
  ),
  getProductsByCategory: vi.fn(async (category: string, limit: number) =>
    [
      {
        id: 31,
        productName: `Categoria ${category}`,
        category,
        price: 14990,
        marketplace: "mercado_libre",
        rating: 88,
        sales: 140,
        imageUrl: "https://example.com/category.jpg",
        commissionPercentage: 10,
      },
    ].slice(0, limit)
  ),
  getProductsByMarketplace: vi.fn(async (marketplace: string, limit: number) =>
    [
      {
        id: 41,
        productName: `${marketplace} hero`,
        price: 18990,
        marketplace,
        rating: 87,
        sales: 210,
        imageUrl: "https://example.com/marketplace.jpg",
        commissionPercentage: 11,
      },
    ].slice(0, limit)
  ),
  calculateAffiliateEarnings: vi.fn(async () => ({
    totalEarnings: 125000,
    estimatedMonthlyEarnings: 42000,
    totalSales: 73,
    averageCommission: 17,
  })),
  analyzeProductTrends: vi.fn(async (productId: number) => ({
    marketplaceProductId: productId,
    trendingScore: 84,
    demandLevel: "high",
    competitionLevel: "medium",
    profitabilityScore: 76,
    recommendation: "buy",
    analyzedAt: new Date("2026-05-23T00:00:00.000Z"),
  })),
  getProductsByRecommendation: vi.fn(async (recommendation: string, limit: number) =>
    [
      {
        id: 51,
        productName: `Rec ${recommendation}`,
        price: 21990,
        marketplace: "hotmart",
        rating: 94,
        sales: 280,
        imageUrl: "https://example.com/recommendation.jpg",
        commissionPercentage: 38,
      },
    ].slice(0, limit)
  ),
}));

vi.mock("../../backend/src/routers/db", () => ({
  getDb: vi.fn(async () => ({
    insert: (_table: unknown) => ({
      values: async (values: Record<string, unknown>) => {
        const account = {
          id: nextAccountId++,
          userId: values.userId as number,
          marketplace: values.marketplace as "mercado_libre" | "shopee" | "hotmart",
          accountName: values.accountName as string,
          accessToken: values.accessToken as string,
          refreshToken: values.refreshToken as string | undefined,
          apiKey: values.apiKey as string | undefined,
          apiSecret: values.apiSecret as string | undefined,
          isActive: 1,
          syncStatus: (values.syncStatus as string) ?? "pending",
          lastSyncAt: null,
          createdAt: new Date(),
        };

        accountsStore.push(account);
        return { insertId: account.id };
      },
    }),
    select: () => ({
      from: (_table: unknown) => ({
        where: (condition: { column?: { name?: string }; value?: unknown }) => {
          const rows = filterAccounts(condition);
          const promise = Promise.resolve(rows);
          return Object.assign(promise, {
            limit: async (limit: number) => rows.slice(0, limit),
          });
        },
      }),
    }),
    update: (_table: unknown) => ({
      set: (values: Record<string, unknown>) => ({
        where: async (condition: { column?: { name?: string }; value?: unknown }) => {
          const rows = filterAccounts(condition);
          rows.forEach((row) => Object.assign(row, values));
          return rows;
        },
      }),
    }),
  })),
}));

import { router } from "../../backend/src/config/trpc";
import { marketplacesRouter } from "../../backend/src/routers/marketplacesRouter";
import type { TrpcContext } from "./_core/context";

const appRouter = router({ marketplaces: marketplacesRouter });

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    ctx: {
      user,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    },
  };
}

describe("marketplaces router", () => {
  beforeEach(() => {
    accountsStore.length = 0;
    nextAccountId = 1;
    vi.clearAllMocks();
  });

  it("conecta conta e lista contas do usuário", async () => {
    const caller = appRouter.createCaller(createAuthContext(1).ctx);

    const connected = await caller.marketplaces.connectMarketplace({
      marketplace: "mercado_libre",
      accountName: "Minha Conta ML",
      accessToken: "token-ml",
      refreshToken: "refresh-ml",
    });

    expect(connected).toMatchObject({
      success: true,
      accountId: 1,
      marketplace: "mercado_libre",
      accountName: "Minha Conta ML",
    });

    const accounts = await caller.marketplaces.getMarketplaceAccounts();
    expect(accounts).toEqual([
      expect.objectContaining({
        id: 1,
        marketplace: "mercado_libre",
        accountName: "Minha Conta ML",
        isActive: true,
        syncStatus: "pending",
      }),
    ]);
  });

  it("enfileira sincronização manual com jobId e marketplace", async () => {
    const caller = appRouter.createCaller(createAuthContext(7).ctx);

    const connected = await caller.marketplaces.connectMarketplace({
      marketplace: "shopee",
      accountName: "Loja Teste",
      accessToken: "token-shopee",
    });

    const result = await caller.marketplaces.syncProducts({
      accountId: connected.accountId as number,
    });

    expect(result).toMatchObject({
      success: true,
      message: "Synchronization queued",
      accountId: connected.accountId,
      jobId: `job-${connected.accountId}`,
      marketplace: "shopee",
    });

    expect(accountsStore[0]?.syncStatus).toBe("syncing");
  });

  it("desconecta a conta e mantém histórico listável", async () => {
    const caller = appRouter.createCaller(createAuthContext(3).ctx);

    const connected = await caller.marketplaces.connectMarketplace({
      marketplace: "hotmart",
      accountName: "Conta Hotmart",
      accessToken: "token-hotmart",
    });

    const disconnected = await caller.marketplaces.disconnectMarketplace({
      accountId: connected.accountId as number,
    });

    expect(disconnected).toEqual({ success: true });

    const accounts = await caller.marketplaces.getMarketplaceAccounts();
    expect(accounts[0]?.isActive).toBe(false);
  });

  it("retorna produtos em tendência respeitando limit", async () => {
    const caller = appRouter.createCaller(createAuthContext(1).ctx);
    const products = await caller.marketplaces.getTrendingProducts({ days: 7, limit: 1 });

    expect(products).toHaveLength(1);
    expect(products[0]).toMatchObject({
      id: 11,
      productName: "Kit Creator",
      marketplace: "mercado_libre",
      commissionPercentage: 12,
    });
  });

  it("retorna produtos recomendados e analytics consolidados", async () => {
    const caller = appRouter.createCaller(createAuthContext(1).ctx);

    const recommended = await caller.marketplaces.getRecommendedProducts({
      limit: 10,
      minTrendingScore: 60,
    });

    const analytics = await caller.marketplaces.getProductAnalytics({ productId: 21 });

    expect(recommended[0]).toMatchObject({
      id: 21,
      productName: "Produto Recomendado",
      marketplace: "shopee",
      productUrl: "https://example.com/product/21",
    });

    expect(analytics).toMatchObject({
      trendingScore: 84,
      demandLevel: "high",
      competitionLevel: "medium",
      profitabilityScore: 76,
      recommendation: "buy",
    });
  });

  it("filtra produtos por marketplace, categoria e recomendação", async () => {
    const caller = appRouter.createCaller(createAuthContext(1).ctx);

    const byMarketplace = await caller.marketplaces.getProductsByMarketplace({
      marketplace: "mercado_libre",
      limit: 5,
    });
    const byCategory = await caller.marketplaces.getProductsByCategory({
      category: "electronics",
      limit: 5,
    });
    const byRecommendation = await caller.marketplaces.getProductsByRecommendation({
      recommendation: "buy",
      limit: 5,
    });

    expect(byMarketplace[0]?.marketplace).toBe("mercado_libre");
    expect(byCategory[0]).toMatchObject({
      category: "electronics",
      productName: "Categoria electronics",
    });
    expect(byRecommendation[0]).toMatchObject({
      productName: "Rec buy",
      marketplace: "hotmart",
    });
  });

  it("calcula margem agregada do afiliado", async () => {
    const caller = appRouter.createCaller(createAuthContext(1).ctx);
    const margins = await caller.marketplaces.getAffiliateMargins();

    expect(margins).toEqual({
      totalEarnings: 125000,
      estimatedMonthlyEarnings: 42000,
      totalSales: 73,
      averageCommission: 17,
    });
  });
});
