import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { marketplaceAccounts, marketplaceProductsExt as marketplaceProducts } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import * as marketplaceHelpers from "./marketplace-helpers";
import * as mercadoLibre from "./integrations/mercadoLibre";
import * as shopee from "./integrations/shopee";
import * as hotmart from "./integrations/hotmart";

/**
 * Marketplaces Router
 * Procedures para gerenciar integrações com marketplaces
 */

export const marketplacesRouter = router({
  /**
   * Conectar conta de marketplace
   */
  connectMarketplace: protectedProcedure
    .input(
      z.object({
        marketplace: z.enum(["mercado_libre", "shopee", "hotmart"]),
        accountName: z.string().min(1).max(128),
        accessToken: z.string().min(1),
        refreshToken: z.string().optional(),
        apiKey: z.string().optional(),
        apiSecret: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        const result = await db.insert(marketplaceAccounts).values({
          userId: ctx.user.id,
          marketplace: input.marketplace,
          accountName: input.accountName,
          accessToken: input.accessToken,
          refreshToken: input.refreshToken,
          apiKey: input.apiKey,
          apiSecret: input.apiSecret,
          isActive: 1,
          syncStatus: "pending",
        });

        return {
          success: true,
          accountId: (result as any).insertId,
          marketplace: input.marketplace,
          accountName: input.accountName,
        };
      } catch (error) {
        console.error("[marketplacesRouter] Error connecting marketplace:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to connect marketplace account",
        });
      }
    }),

  /**
   * Desconectar conta de marketplace
   */
  disconnectMarketplace: protectedProcedure
    .input(z.object({ accountId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        const account = await db
          .select()
          .from(marketplaceAccounts)
          .where(eq(marketplaceAccounts.id, input.accountId))
          .limit(1);

        if (account.length === 0 || account[0].userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Account not found" });
        }

        await db.update(marketplaceAccounts).set({ isActive: 0 }).where(eq(marketplaceAccounts.id, input.accountId));

        return { success: true };
      } catch (error) {
        console.error("[marketplacesRouter] Error disconnecting marketplace:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to disconnect marketplace account",
        });
      }
    }),

  /**
   * Listar contas de marketplace conectadas
   */
  getMarketplaceAccounts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    try {
      const accounts = await db
        .select()
        .from(marketplaceAccounts)
        .where(eq(marketplaceAccounts.userId, ctx.user.id));

      return accounts.map((account) => ({
        id: account.id,
        marketplace: account.marketplace,
        accountName: account.accountName,
        isActive: account.isActive === 1,
        lastSyncAt: account.lastSyncAt,
        syncStatus: account.syncStatus,
        createdAt: account.createdAt,
      }));
    } catch (error) {
      console.error("[marketplacesRouter] Error getting marketplace accounts:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get marketplace accounts",
      });
    }
  }),

  /**
   * Sincronizar produtos manualmente
   */
  syncProducts: protectedProcedure
    .input(z.object({ accountId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      try {
        const account = await db
          .select()
          .from(marketplaceAccounts)
          .where(eq(marketplaceAccounts.id, input.accountId))
          .limit(1);

        if (account.length === 0 || account[0].userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Account not found" });
        }

        // Atualizar status para sincronizando
        await db
          .update(marketplaceAccounts)
          .set({ syncStatus: "syncing" })
          .where(eq(marketplaceAccounts.id, input.accountId));

        return {
          success: true,
          message: "Synchronization started",
          accountId: input.accountId,
        };
      } catch (error) {
        console.error("[marketplacesRouter] Error syncing products:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync products",
        });
      }
    }),

  /**
   * Listar produtos em tendência
   */
  getTrendingProducts: protectedProcedure
    .input(
      z.object({
        days: z.number().default(7),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const products = await marketplaceHelpers.getTrendingProducts(input.days, input.limit);

        return products.map((product) => ({
          id: product.id,
          productName: product.productName,
          price: product.price,
          marketplace: product.marketplace,
          rating: product.rating,
          sales: product.sales,
          imageUrl: product.imageUrl,
          commissionPercentage: product.commissionPercentage,
        }));
      } catch (error) {
        console.error("[marketplacesRouter] Error getting trending products:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get trending products",
        });
      }
    }),

  /**
   * Listar produtos recomendados
   */
  getRecommendedProducts: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        minTrendingScore: z.number().default(60),
      })
    )
    .query(async ({ input }) => {
      try {
        const products = await marketplaceHelpers.getRecommendedProducts(input.limit, input.minTrendingScore);

        return products.map((product) => ({
          id: product.id,
          productName: product.productName,
          price: product.price,
          marketplace: product.marketplace,
          rating: product.rating,
          sales: product.sales,
          imageUrl: product.imageUrl,
          commissionPercentage: product.commissionPercentage,
          productUrl: product.productUrl,
        }));
      } catch (error) {
        console.error("[marketplacesRouter] Error getting recommended products:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get recommended products",
        });
      }
    }),

  /**
   * Buscar produtos por categoria
   */
  getProductsByCategory: protectedProcedure
    .input(
      z.object({
        category: z.string(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const products = await marketplaceHelpers.getProductsByCategory(input.category, input.limit);

        return products.map((product) => ({
          id: product.id,
          productName: product.productName,
          price: product.price,
          marketplace: product.marketplace,
          category: product.category,
          rating: product.rating,
          sales: product.sales,
          imageUrl: product.imageUrl,
          commissionPercentage: product.commissionPercentage,
        }));
      } catch (error) {
        console.error("[marketplacesRouter] Error getting products by category:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get products by category",
        });
      }
    }),

  /**
   * Buscar produtos por marketplace
   */
  getProductsByMarketplace: protectedProcedure
    .input(
      z.object({
        marketplace: z.enum(["mercado_libre", "shopee", "hotmart"]),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      try {
        const products = await marketplaceHelpers.getProductsByMarketplace(input.marketplace, input.limit);

        return products.map((product) => ({
          id: product.id,
          productName: product.productName,
          price: product.price,
          marketplace: product.marketplace,
          rating: product.rating,
          sales: product.sales,
          imageUrl: product.imageUrl,
          commissionPercentage: product.commissionPercentage,
        }));
      } catch (error) {
        console.error("[marketplacesRouter] Error getting products by marketplace:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get products by marketplace",
        });
      }
    }),

  /**
   * Obter margens de afiliado
   */
  getAffiliateMargins: protectedProcedure.query(async ({ ctx }) => {
    try {
      const earnings = await marketplaceHelpers.calculateAffiliateEarnings(ctx.user.id);

      return {
        totalEarnings: earnings.totalEarnings,
        estimatedMonthlyEarnings: earnings.estimatedMonthlyEarnings,
        totalSales: earnings.totalSales,
        averageCommission: earnings.averageCommission,
      };
    } catch (error) {
      console.error("[marketplacesRouter] Error getting affiliate margins:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get affiliate margins",
      });
    }
  }),

  /**
   * Obter análise de produto
   */
  getProductAnalytics: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      try {
        const trends = await marketplaceHelpers.analyzeProductTrends(input.productId);

        if (!trends) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product trends not found" });
        }

        return {
          trendingScore: trends.trendingScore,
          demandLevel: trends.demandLevel,
          competitionLevel: trends.competitionLevel,
          profitabilityScore: trends.profitabilityScore,
          recommendation: trends.recommendation,
          analyzedAt: trends.analyzedAt,
        };
      } catch (error) {
        console.error("[marketplacesRouter] Error getting product analytics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get product analytics",
        });
      }
    }),

  /**
   * Buscar produtos por recomendação
   */
  getProductsByRecommendation: protectedProcedure
    .input(
      z.object({
        recommendation: z.enum(["buy", "hold", "sell", "avoid"]),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      try {
        const products = await marketplaceHelpers.getProductsByRecommendation(
          input.recommendation,
          input.limit
        );

        return products.map((product) => ({
          id: product.id,
          productName: product.productName,
          price: product.price,
          marketplace: product.marketplace,
          rating: product.rating,
          sales: product.sales,
          imageUrl: product.imageUrl,
          commissionPercentage: product.commissionPercentage,
        }));
      } catch (error) {
        console.error("[marketplacesRouter] Error getting products by recommendation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get products by recommendation",
        });
      }
    }),
});
