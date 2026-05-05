import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

// Mock context for testing
function createMockContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: 'test-user',
      email: 'test@example.com',
      name: 'Test User',
      loginMethod: 'manus',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext['res'],
  };
}

describe('Marketplaces Router', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  describe('getRecommendedProducts', () => {
    it('should return recommended products', async () => {
      const result = await caller.marketplaces.getRecommendedProducts({
        limit: 10,
        minScore: 0,
      });

      expect(Array.isArray(result)).toBe(true);
      // Products should have required fields
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('title');
        expect(result[0]).toHaveProperty('price');
        expect(result[0]).toHaveProperty('commissionPercentage');
        expect(result[0]).toHaveProperty('marketplace');
      }
    });

    it('should filter by minimum score', async () => {
      const result = await caller.marketplaces.getRecommendedProducts({
        limit: 50,
        minScore: 80,
      });

      expect(Array.isArray(result)).toBe(true);
      // All products should have score >= 80
      result.forEach(product => {
        expect(product.trendingScore).toBeGreaterThanOrEqual(80);
      });
    });

    it('should respect limit parameter', async () => {
      const result = await caller.marketplaces.getRecommendedProducts({
        limit: 5,
        minScore: 0,
      });

      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getTrendingProducts', () => {
    it('should return trending products', async () => {
      const result = await caller.marketplaces.getTrendingProducts({
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('title');
        expect(result[0]).toHaveProperty('trendingScore');
        expect(result[0]).toHaveProperty('demandLevel');
        expect(result[0]).toHaveProperty('competitionLevel');
      }
    });

    it('should filter by marketplace', async () => {
      const result = await caller.marketplaces.getTrendingProducts({
        marketplace: 'Mercado Livre',
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
      result.forEach(product => {
        expect(product.marketplace).toBe('Mercado Livre');
      });
    });
  });

  describe('getProductsByMarketplace', () => {
    it('should return products for specific marketplace', async () => {
      const result = await caller.marketplaces.getProductsByMarketplace({
        marketplace: 'Shopee',
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
      result.forEach(product => {
        expect(product.marketplace).toBe('Shopee');
      });
    });

    it('should handle all supported marketplaces', async () => {
      const marketplaces = ['Mercado Livre', 'Shopee', 'Hotmart'] as const;

      for (const marketplace of marketplaces) {
        const result = await caller.marketplaces.getProductsByMarketplace({
          marketplace,
          limit: 5,
        });

        expect(Array.isArray(result)).toBe(true);
      }
    });
  });

  describe('getProductById', () => {
    it('should return null for non-existent product', async () => {
      const result = await caller.marketplaces.getProductById({
        productId: 999999,
      });

      expect(result).toBeNull();
    });

    it('should return product details when found', async () => {
      // First get a product
      const products = await caller.marketplaces.getRecommendedProducts({
        limit: 1,
      });

      if (products.length > 0) {
        const productId = products[0].id;
        const result = await caller.marketplaces.getProductById({
          productId,
        });

        expect(result).not.toBeNull();
        if (result) {
          expect(result.id).toBe(productId);
          expect(result).toHaveProperty('title');
          expect(result).toHaveProperty('price');
        }
      }
    });
  });
});
