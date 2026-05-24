import { describe, expect, it, vi } from "vitest";

import {
  MarketplaceAccountAccessError,
  MarketplaceProductAnalyticsNotFoundError,
  buildAffiliateMarginsResponse,
  buildProductAnalyticsResponse,
  connectMarketplaceAccount,
  disconnectMarketplaceAccount,
  getMarketplaceProductsByCategory,
  getRecommendedMarketplaceProducts,
  listConnectedMarketplaceAccounts,
  queueMarketplaceSync,
} from "../../backend/src/domains/marketplace/service";

describe("marketplace domain service", () => {
  it("conecta conta de marketplace com payload padronizado", async () => {
    const result = await connectMarketplaceAccount(
      {
        userId: 1,
        marketplace: "mercado_libre",
        accountName: "Conta ML",
        accessToken: "token",
      },
      {
        insertAccount: vi.fn(async () => 42),
      },
    );

    expect(result).toEqual({
      success: true,
      accountId: 42,
      marketplace: "mercado_libre",
      accountName: "Conta ML",
    });
  });

  it("lista contas conectadas convertendo isActive para boolean", () => {
    const result = listConnectedMarketplaceAccounts([
      {
        id: 1,
        userId: 5,
        marketplace: "hotmart",
        accountName: "Conta Hotmart",
        accessToken: "token",
        refreshToken: null,
        apiKey: null,
        apiSecret: null,
        isActive: 1,
        syncStatus: "pending",
        lastSyncAt: null,
        createdAt: new Date("2026-05-24T00:00:00.000Z"),
        updatedAt: new Date("2026-05-24T00:00:00.000Z"),
      },
    ] as any);

    expect(result).toEqual([
      expect.objectContaining({
        id: 1,
        marketplace: "hotmart",
        accountName: "Conta Hotmart",
        isActive: true,
      }),
    ]);
  });

  it("enfileira sync manual para conta autorizada", async () => {
    const result = await queueMarketplaceSync(
      {
        userId: 7,
        accountId: 2,
      },
      {
        getAccountById: vi.fn(async () => ({ id: 2, userId: 7, marketplace: "shopee" } as any)),
        markSyncing: vi.fn(async () => undefined),
        enqueueSync: vi.fn(async () => ({ id: "job-2" })),
      },
    );

    expect(result).toEqual({
      success: true,
      message: "Synchronization queued",
      accountId: 2,
      jobId: "job-2",
      marketplace: "shopee",
    });
  });

  it("bloqueia acesso a conta de outro usuário ao desconectar ou sincronizar", async () => {
    await expect(
      disconnectMarketplaceAccount(
        { userId: 10, accountId: 3 },
        {
          getAccountById: vi.fn(async () => ({ id: 3, userId: 999 } as any)),
          deactivateAccount: vi.fn(async () => undefined),
        },
      ),
    ).rejects.toBeInstanceOf(MarketplaceAccountAccessError);

    await expect(
      queueMarketplaceSync(
        { userId: 10, accountId: 3 },
        {
          getAccountById: vi.fn(async () => ({ id: 3, userId: 999 } as any)),
          markSyncing: vi.fn(async () => undefined),
          enqueueSync: vi.fn(async () => ({ id: "job-3" })),
        },
      ),
    ).rejects.toBeInstanceOf(MarketplaceAccountAccessError);
  });

  it("mapeia produtos recomendados e por categoria", () => {
    const recommended = getRecommendedMarketplaceProducts([
      {
        id: 21,
        productName: "Produto Recomendado",
        price: 25990,
        marketplace: "shopee",
        rating: 90,
        sales: 320,
        imageUrl: "https://example.com/product.jpg",
        commissionPercentage: 18,
        productUrl: "https://example.com/product/21",
      },
    ]);

    const category = getMarketplaceProductsByCategory([
      {
        id: 31,
        productName: "Categoria electronics",
        price: 14990,
        marketplace: "mercado_libre",
        rating: 88,
        sales: 140,
        imageUrl: "https://example.com/category.jpg",
        commissionPercentage: 10,
        category: "electronics",
      },
    ]);

    expect(recommended[0]).toMatchObject({
      productName: "Produto Recomendado",
      productUrl: "https://example.com/product/21",
    });
    expect(category[0]).toMatchObject({ category: "electronics" });
  });

  it("normaliza margens e analytics do produto", () => {
    const margins = buildAffiliateMarginsResponse({
      totalEarnings: 125000,
      estimatedMonthlyEarnings: 42000,
      totalSales: 73,
      averageCommission: 17,
    });

    const analytics = buildProductAnalyticsResponse({
      trendingScore: 84,
      demandLevel: "high",
      competitionLevel: "medium",
      profitabilityScore: 76,
      recommendation: "buy",
      analyzedAt: new Date("2026-05-23T00:00:00.000Z"),
    });

    expect(margins.averageCommission).toBe(17);
    expect(analytics.recommendation).toBe("buy");
  });

  it("lança erro tipado quando analytics não existem", () => {
    expect(() => buildProductAnalyticsResponse(null)).toThrow(
      MarketplaceProductAnalyticsNotFoundError,
    );
  });
});
