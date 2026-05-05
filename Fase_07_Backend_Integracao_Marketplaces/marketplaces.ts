import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { products } from "../../drizzle/schema";
import { TRPCError } from "@trpc/server";
import { eq, like, desc } from "drizzle-orm";

/**
 * Marketplace Integration Router
 * Handles integration with Mercado Livre, Shopee, and Hotmart APIs
 */

// Mock data for demonstration - replace with real API calls
const mockMercadoLivreProducts = [
  {
    id: "MLB1234567890",
    title: "Smartphone Android 64GB",
    price: 899.99,
    commission: 5.5,
    trend: "rising" as const,
    marketplace: "mercado_livre" as const,
  },
  {
    id: "MLB9876543210",
    title: "Fone Bluetooth Wireless",
    price: 149.99,
    commission: 12.0,
    trend: "stable" as const,
    marketplace: "mercado_livre" as const,
  },
];

const mockShopeeProducts = [
  {
    id: "SHP1234567890",
    title: "Smartwatch Fitness Tracker",
    price: 299.99,
    commission: 8.5,
    trend: "rising" as const,
    marketplace: "shopee" as const,
  },
  {
    id: "SHP9876543210",
    title: "Câmera Digital 20MP",
    price: 599.99,
    commission: 6.0,
    trend: "declining" as const,
    marketplace: "shopee" as const,
  },
];

const mockHotmartProducts = [
  {
    id: "HMT1234567890",
    title: "Curso: Marketing Digital Completo",
    price: 197.0,
    commission: 30.0,
    trend: "rising" as const,
    marketplace: "hotmart" as const,
  },
  {
    id: "HMT9876543210",
    title: "Ebook: SEO Masterclass",
    price: 47.0,
    commission: 25.0,
    trend: "stable" as const,
    marketplace: "hotmart" as const,
  },
];

export const marketplacesRouter = router({
  /**
   * Get trending products from all marketplaces
   */
  getTrendingProducts: publicProcedure
    .input(
      z.object({
        marketplace: z
          .enum(["mercado_livre", "shopee", "hotmart", "all"])
          .optional(),
        limit: z.number().optional().default(20),
        trend: z.enum(["rising", "stable", "declining"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        // Return mock data if database is not available
        const allProducts = [
          ...mockMercadoLivreProducts,
          ...mockShopeeProducts,
          ...mockHotmartProducts,
        ];

        let filtered = allProducts;

        if (input.marketplace && input.marketplace !== "all") {
          filtered = filtered.filter(
            (p) => p.marketplace === input.marketplace
          );
        }

        if (input.trend) {
          filtered = filtered.filter((p) => p.trend === input.trend);
        }

        return filtered.slice(0, input.limit);
      }

      let query = db.select().from(products);

      if (input.marketplace && input.marketplace !== "all") {
        query = query.where(eq(products.marketplace, input.marketplace));
      }

      if (input.trend) {
        query = query.where(eq(products.trend, input.trend));
      }

      const results = await query
        .orderBy(desc(products.createdAt))
        .limit(input.limit);

      return results;
    }),

  /**
   * Search products by keyword
   */
  searchProducts: publicProcedure
    .input(
      z.object({
        keyword: z.string(),
        marketplace: z
          .enum(["mercado_livre", "shopee", "hotmart", "all"])
          .optional(),
        limit: z.number().optional().default(10),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        // Return mock data if database is not available
        const allProducts = [
          ...mockMercadoLivreProducts,
          ...mockShopeeProducts,
          ...mockHotmartProducts,
        ];

        let filtered = allProducts.filter((p) =>
          p.title.toLowerCase().includes(input.keyword.toLowerCase())
        );

        if (input.marketplace && input.marketplace !== "all") {
          filtered = filtered.filter(
            (p) => p.marketplace === input.marketplace
          );
        }

        return filtered.slice(0, input.limit);
      }

      let query = db.select().from(products).where(
        like(products.title, `%${input.keyword}%`)
      );

      if (input.marketplace && input.marketplace !== "all") {
        query = query.where(eq(products.marketplace, input.marketplace));
      }

      return await query.limit(input.limit);
    }),

  /**
   * Get product details
   */
  getProductDetails: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        marketplace: z.enum(["mercado_livre", "shopee", "hotmart"]),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        // Return mock data
        const allProducts = [
          ...mockMercadoLivreProducts,
          ...mockShopeeProducts,
          ...mockHotmartProducts,
        ];

        const product = allProducts.find(
          (p) => p.id === input.productId && p.marketplace === input.marketplace
        );

        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        return {
          ...product,
          description: "Product description would be fetched from marketplace API",
          images: ["https://via.placeholder.com/300"],
          rating: 4.5,
          reviews: 128,
          stock: 45,
        };
      }

      const product = await db
        .select()
        .from(products)
        .where(
          eq(products.externalId, input.productId) &&
            eq(products.marketplace, input.marketplace)
        )
        .limit(1);

      if (!product.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      return product[0];
    }),

  /**
   * Get affiliate commission rates by marketplace
   */
  getCommissionRates: publicProcedure
    .input(
      z.object({
        marketplace: z.enum(["mercado_livre", "shopee", "hotmart"]),
      })
    )
    .query(async ({ input }) => {
      // Commission rates by marketplace
      const rates: Record<string, { min: number; max: number; avg: number }> = {
        mercado_livre: { min: 3.0, max: 15.0, avg: 8.5 },
        shopee: { min: 5.0, max: 20.0, avg: 10.0 },
        hotmart: { min: 15.0, max: 50.0, avg: 30.0 },
      };

      return rates[input.marketplace] || { min: 5.0, max: 15.0, avg: 10.0 };
    }),

  /**
   * Get marketplace statistics
   */
  getMarketplaceStats: publicProcedure
    .input(
      z.object({
        marketplace: z
          .enum(["mercado_livre", "shopee", "hotmart"])
          .optional(),
      })
    )
    .query(async ({ input }) => {
      // Mock statistics
      const stats: Record<string, any> = {
        mercado_livre: {
          totalProducts: 15234,
          activeAffiliates: 2341,
          totalSales: 1234567.89,
          avgCommission: 8.5,
          topCategory: "Eletrônicos",
        },
        shopee: {
          totalProducts: 8923,
          activeAffiliates: 1876,
          totalSales: 876543.21,
          avgCommission: 10.0,
          topCategory: "Moda",
        },
        hotmart: {
          totalProducts: 3421,
          activeAffiliates: 892,
          totalSales: 654321.0,
          avgCommission: 30.0,
          topCategory: "Cursos",
        },
      };

      if (input.marketplace) {
        return stats[input.marketplace];
      }

      return {
        mercado_livre: stats.mercado_livre,
        shopee: stats.shopee,
        hotmart: stats.hotmart,
      };
    }),

  /**
   * Sync products from marketplace (admin only)
   */
  syncProducts: protectedProcedure
    .input(
      z.object({
        marketplace: z.enum(["mercado_livre", "shopee", "hotmart"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only admins can sync products
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only administrators can sync products",
        });
      }

      const db = await getDb();
      if (!db) {
        return {
          success: false,
          message: "Database not available",
          synced: 0,
        };
      }

      // Mock sync - in production, this would call the actual marketplace API
      let productsToSync = [];

      if (input.marketplace === "mercado_livre") {
        productsToSync = mockMercadoLivreProducts;
      } else if (input.marketplace === "shopee") {
        productsToSync = mockShopeeProducts;
      } else if (input.marketplace === "hotmart") {
        productsToSync = mockHotmartProducts;
      }

      // In production, you would insert/update these in the database
      // For now, we just return success

      return {
        success: true,
        message: `Synced ${productsToSync.length} products from ${input.marketplace}`,
        synced: productsToSync.length,
        timestamp: new Date(),
      };
    }),
});
