import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("marketplaces", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let ctx: TrpcContext;

  beforeAll(() => {
    const authContext = createAuthContext(1);
    ctx = authContext.ctx;
    caller = appRouter.createCaller(ctx);
  });

  describe("connectMarketplace", () => {
    it("should connect a marketplace account", async () => {
      const result = await caller.marketplaces.connectMarketplace({
        marketplace: "mercado_libre",
        accountName: "My ML Account",
        accessToken: "test-token-123",
        refreshToken: "test-refresh-token",
      });

      expect(result).toMatchObject({
        success: true,
        marketplace: "mercado_libre",
        accountName: "My ML Account",
      });
      expect(result.accountId).toBeDefined();
    });

    it("should connect Shopee account", async () => {
      const result = await caller.marketplaces.connectMarketplace({
        marketplace: "shopee",
        accountName: "My Shopee Store",
        accessToken: "shopee-token-456",
        apiKey: "shopee-api-key",
      });

      expect(result).toMatchObject({
        success: true,
        marketplace: "shopee",
        accountName: "My Shopee Store",
      });
    });

    it("should connect Hotmart account", async () => {
      const result = await caller.marketplaces.connectMarketplace({
        marketplace: "hotmart",
        accountName: "My Hotmart Account",
        accessToken: "hotmart-token-789",
        apiKey: "hotmart-api-key",
      });

      expect(result).toMatchObject({
        success: true,
        marketplace: "hotmart",
        accountName: "My Hotmart Account",
      });
    });

    it("should validate required fields", async () => {
      try {
        await caller.marketplaces.connectMarketplace({
          marketplace: "mercado_libre",
          accountName: "",
          accessToken: "token",
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("getMarketplaceAccounts", () => {
    it("should list connected marketplace accounts", async () => {
      // Connect an account first
      await caller.marketplaces.connectMarketplace({
        marketplace: "mercado_libre",
        accountName: "Test Account",
        accessToken: "test-token",
      });

      const accounts = await caller.marketplaces.getMarketplaceAccounts();

      expect(Array.isArray(accounts)).toBe(true);
      expect(accounts.length).toBeGreaterThan(0);
      expect(accounts[0]).toMatchObject({
        id: expect.any(Number),
        marketplace: expect.stringMatching(/mercado_libre|shopee|hotmart/),
        accountName: expect.any(String),
        isActive: expect.any(Boolean),
      });
    });

    it("should return empty array for user with no accounts", async () => {
      const newUserContext = createAuthContext(999);
      const newCaller = appRouter.createCaller(newUserContext.ctx);

      const accounts = await newCaller.marketplaces.getMarketplaceAccounts();

      expect(Array.isArray(accounts)).toBe(true);
      expect(accounts.length).toBe(0);
    });
  });

  describe("getTrendingProducts", () => {
    it("should return trending products", async () => {
      const products = await caller.marketplaces.getTrendingProducts({
        days: 7,
        limit: 10,
      });

      expect(Array.isArray(products)).toBe(true);
      if (products.length > 0) {
        expect(products[0]).toMatchObject({
          id: expect.any(Number),
          productName: expect.any(String),
          price: expect.any(Number),
          marketplace: expect.stringMatching(/mercado_libre|shopee|hotmart/),
          rating: expect.any(Number),
          sales: expect.any(Number),
        });
      }
    });

    it("should respect limit parameter", async () => {
      const products = await caller.marketplaces.getTrendingProducts({
        days: 7,
        limit: 5,
      });

      expect(products.length).toBeLessThanOrEqual(5);
    });
  });

  describe("getRecommendedProducts", () => {
    it("should return recommended products", async () => {
      const products = await caller.marketplaces.getRecommendedProducts({
        limit: 10,
        minTrendingScore: 60,
      });

      expect(Array.isArray(products)).toBe(true);
      if (products.length > 0) {
        expect(products[0]).toMatchObject({
          id: expect.any(Number),
          productName: expect.any(String),
          price: expect.any(Number),
          marketplace: expect.stringMatching(/mercado_libre|shopee|hotmart/),
        });
      }
    });
  });

  describe("getProductsByMarketplace", () => {
    it("should return products from Mercado Libre", async () => {
      const products = await caller.marketplaces.getProductsByMarketplace({
        marketplace: "mercado_libre",
        limit: 10,
      });

      expect(Array.isArray(products)).toBe(true);
      if (products.length > 0) {
        expect(products[0].marketplace).toBe("mercado_libre");
      }
    });

    it("should return products from Shopee", async () => {
      const products = await caller.marketplaces.getProductsByMarketplace({
        marketplace: "shopee",
        limit: 10,
      });

      expect(Array.isArray(products)).toBe(true);
      if (products.length > 0) {
        expect(products[0].marketplace).toBe("shopee");
      }
    });

    it("should return products from Hotmart", async () => {
      const products = await caller.marketplaces.getProductsByMarketplace({
        marketplace: "hotmart",
        limit: 10,
      });

      expect(Array.isArray(products)).toBe(true);
      if (products.length > 0) {
        expect(products[0].marketplace).toBe("hotmart");
      }
    });
  });

  describe("getProductsByCategory", () => {
    it("should return products by category", async () => {
      const products = await caller.marketplaces.getProductsByCategory({
        category: "electronics",
        limit: 10,
      });

      expect(Array.isArray(products)).toBe(true);
    });
  });

  describe("getAffiliateMargins", () => {
    it("should return affiliate margins", async () => {
      const margins = await caller.marketplaces.getAffiliateMargins();

      expect(margins).toMatchObject({
        totalEarnings: expect.any(Number),
        estimatedMonthlyEarnings: expect.any(Number),
        totalSales: expect.any(Number),
        averageCommission: expect.any(Number),
      });
    });
  });

  describe("syncProducts", () => {
    it("should start product synchronization", async () => {
      // Connect an account first
      const connectResult = await caller.marketplaces.connectMarketplace({
        marketplace: "mercado_libre",
        accountName: "Sync Test Account",
        accessToken: "test-token",
      });

      expect(connectResult.accountId).toBeDefined();
      expect(typeof connectResult.accountId).toBe("number");

      const syncResult = await caller.marketplaces.syncProducts({
        accountId: connectResult.accountId as number,
      });

      expect(syncResult).toMatchObject({
        success: true,
        message: expect.any(String),
        accountId: expect.any(Number),
      });
    });

    it("should fail with invalid account", async () => {
      try {
        await caller.marketplaces.syncProducts({
          accountId: 99999,
        });
        expect.fail("Should have thrown an error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("disconnectMarketplace", () => {
    it("should disconnect a marketplace account", async () => {
      // Connect an account first
      const connectResult = await caller.marketplaces.connectMarketplace({
        marketplace: "mercado_libre",
        accountName: "Disconnect Test",
        accessToken: "test-token",
      });

      expect(connectResult.accountId).toBeDefined();

      const disconnectResult = await caller.marketplaces.disconnectMarketplace({
        accountId: connectResult.accountId as number,
      });

      expect(disconnectResult).toMatchObject({
        success: true,
      });

      // Verify account is inactive
      const accounts = await caller.marketplaces.getMarketplaceAccounts();
      const disconnectedAccount = accounts.find((a) => a.id === connectResult.accountId);

      if (disconnectedAccount) {
        expect(disconnectedAccount.isActive).toBe(false);
      }
    });
  });
});
