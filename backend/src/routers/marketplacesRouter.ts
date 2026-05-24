import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { addMarketplaceSyncJob } from "../config/queue";
import * as marketplaceHelpers from "./marketplace-helpers";
import {
  deactivateMarketplaceAccount,
  findMarketplaceAccountById,
  insertMarketplaceAccount,
  listMarketplaceAccountsByUserId,
  markMarketplaceAccountSyncing,
} from "../domains/marketplace/repository";
import {
  MarketplaceAccountAccessError,
  MarketplaceProductAnalyticsNotFoundError,
  buildAffiliateMarginsResponse,
  buildProductAnalyticsResponse,
  connectMarketplaceAccount,
  disconnectMarketplaceAccount,
  getMarketplaceProductsByCategory,
  getMarketplaceProductsByMarketplace,
  getMarketplaceProductsByRecommendation,
  getRecommendedMarketplaceProducts,
  getTrendingMarketplaceProducts,
  listConnectedMarketplaceAccounts,
  queueMarketplaceSync,
} from "../domains/marketplace/service";

async function getDbOrThrow() {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available",
    });
  }
  return db;
}

/**
 * Marketplaces Router
 * Procedures para gerenciar integrações com marketplaces
 */
export const marketplacesRouter = router({
  connectMarketplace: protectedProcedure
    .input(
      z.object({
        marketplace: z.enum(["mercado_libre", "shopee", "hotmart"]),
        accountName: z.string().min(1).max(128),
        accessToken: z.string().min(1),
        refreshToken: z.string().optional(),
        apiKey: z.string().optional(),
        apiSecret: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDbOrThrow();

      try {
        return await connectMarketplaceAccount(
          {
            userId: ctx.user.id,
            marketplace: input.marketplace,
            accountName: input.accountName,
            accessToken: input.accessToken,
            refreshToken: input.refreshToken,
            apiKey: input.apiKey,
            apiSecret: input.apiSecret,
          },
          {
            insertAccount: (payload) => insertMarketplaceAccount(db, payload),
          },
        );
      } catch (error) {
        console.error("[marketplacesRouter] Error connecting marketplace:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to connect marketplace account",
        });
      }
    }),

  disconnectMarketplace: protectedProcedure
    .input(z.object({ accountId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDbOrThrow();

      try {
        return await disconnectMarketplaceAccount(
          {
            userId: ctx.user.id,
            accountId: input.accountId,
          },
          {
            getAccountById: (accountId) => findMarketplaceAccountById(db, accountId),
            deactivateAccount: (accountId) => deactivateMarketplaceAccount(db, accountId),
          },
        );
      } catch (error) {
        if (error instanceof MarketplaceAccountAccessError) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Account not found",
          });
        }
        console.error("[marketplacesRouter] Error disconnecting marketplace:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to disconnect marketplace account",
        });
      }
    }),

  getMarketplaceAccounts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDbOrThrow();

    try {
      const accounts = await listMarketplaceAccountsByUserId(db, ctx.user.id);
      return listConnectedMarketplaceAccounts(accounts);
    } catch (error) {
      console.error("[marketplacesRouter] Error getting marketplace accounts:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get marketplace accounts",
      });
    }
  }),

  syncProducts: protectedProcedure
    .input(z.object({ accountId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDbOrThrow();

      try {
        return await queueMarketplaceSync(
          {
            userId: ctx.user.id,
            accountId: input.accountId,
          },
          {
            getAccountById: (accountId) => findMarketplaceAccountById(db, accountId),
            markSyncing: (accountId) => markMarketplaceAccountSyncing(db, accountId),
            enqueueSync: (job) => addMarketplaceSyncJob(job),
          },
        );
      } catch (error) {
        if (error instanceof MarketplaceAccountAccessError) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Account not found",
          });
        }
        console.error("[marketplacesRouter] Error syncing products:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to sync products",
        });
      }
    }),

  getTrendingProducts: protectedProcedure
    .input(
      z.object({
        days: z.number().default(7),
        limit: z.number().default(20),
      }),
    )
    .query(async ({ input }) => {
      try {
        const products = await marketplaceHelpers.getTrendingProducts(input.days, input.limit);
        return getTrendingMarketplaceProducts(products);
      } catch (error) {
        console.error("[marketplacesRouter] Error getting trending products:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get trending products",
        });
      }
    }),

  getRecommendedProducts: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        minTrendingScore: z.number().default(60),
      }),
    )
    .query(async ({ input }) => {
      try {
        const products = await marketplaceHelpers.getRecommendedProducts(
          input.limit,
          input.minTrendingScore,
        );
        return getRecommendedMarketplaceProducts(products);
      } catch (error) {
        console.error("[marketplacesRouter] Error getting recommended products:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get recommended products",
        });
      }
    }),

  getProductsByCategory: protectedProcedure
    .input(
      z.object({
        category: z.string(),
        limit: z.number().default(50),
      }),
    )
    .query(async ({ input }) => {
      try {
        const products = await marketplaceHelpers.getProductsByCategory(
          input.category,
          input.limit,
        );
        return getMarketplaceProductsByCategory(products);
      } catch (error) {
        console.error("[marketplacesRouter] Error getting products by category:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get products by category",
        });
      }
    }),

  getProductsByMarketplace: protectedProcedure
    .input(
      z.object({
        marketplace: z.enum(["mercado_libre", "shopee", "hotmart"]),
        limit: z.number().default(50),
      }),
    )
    .query(async ({ input }) => {
      try {
        const products = await marketplaceHelpers.getProductsByMarketplace(
          input.marketplace,
          input.limit,
        );
        return getMarketplaceProductsByMarketplace(products);
      } catch (error) {
        console.error("[marketplacesRouter] Error getting products by marketplace:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get products by marketplace",
        });
      }
    }),

  getAffiliateMargins: protectedProcedure.query(async ({ ctx }) => {
    try {
      const earnings = await marketplaceHelpers.calculateAffiliateEarnings(ctx.user.id);
      return buildAffiliateMarginsResponse(earnings);
    } catch (error) {
      console.error("[marketplacesRouter] Error getting affiliate margins:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get affiliate margins",
      });
    }
  }),

  getProductAnalytics: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      try {
        const trends = await marketplaceHelpers.analyzeProductTrends(input.productId);
        return buildProductAnalyticsResponse(trends);
      } catch (error) {
        if (error instanceof MarketplaceProductAnalyticsNotFoundError) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product trends not found",
          });
        }
        console.error("[marketplacesRouter] Error getting product analytics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get product analytics",
        });
      }
    }),

  getProductsByRecommendation: protectedProcedure
    .input(
      z.object({
        recommendation: z.enum(["buy", "hold", "sell", "avoid"]),
        limit: z.number().default(20),
      }),
    )
    .query(async ({ input }) => {
      try {
        const products = await marketplaceHelpers.getProductsByRecommendation(
          input.recommendation,
          input.limit,
        );
        return getMarketplaceProductsByRecommendation(products);
      } catch (error) {
        console.error(
          "[marketplacesRouter] Error getting products by recommendation:",
          error,
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get products by recommendation",
        });
      }
    }),
});
