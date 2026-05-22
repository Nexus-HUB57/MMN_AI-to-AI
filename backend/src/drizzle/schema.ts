import {
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import {
  activationPacks,
  packActivations,
  type InsertPackActivation,
} from "../../../database/schemas/schema-packs";

export * from "../../../database/schemas/schema-final";
export * from "../../../database/schemas/agentic";
export * from "../../../database/schemas/schema-packs";

export const marketplaceAccounts = pgTable(
  "marketplace_accounts",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    marketplace: varchar("marketplace", { length: 30 }).notNull(),
    accountName: varchar("accountName", { length: 128 }).notNull(),
    accessToken: text("accessToken").notNull(),
    refreshToken: text("refreshToken"),
    apiKey: text("apiKey"),
    apiSecret: text("apiSecret"),
    isActive: integer("isActive").notNull().default(1),
    syncStatus: varchar("syncStatus", { length: 20 })
      .notNull()
      .default("pending"),
    lastSyncAt: timestamp("lastSyncAt"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    userMarketplaceIdx: index("marketplace_accounts_user_marketplace_idx").on(
      table.userId,
      table.marketplace,
    ),
  }),
);

export const marketplaceProductsExt = pgTable(
  "marketplace_products_ext",
  {
    id: serial("id").primaryKey(),
    marketplaceAccountId: integer("marketplaceAccountId").notNull(),
    externalProductId: varchar("externalProductId", { length: 255 }).notNull(),
    marketplace: varchar("marketplace", { length: 30 }).notNull(),
    productName: varchar("productName", { length: 255 }).notNull(),
    productUrl: text("productUrl"),
    category: varchar("category", { length: 128 }),
    price: integer("price").notNull(),
    originalPrice: integer("originalPrice"),
    discount: integer("discount").notNull().default(0),
    rating: integer("rating").notNull().default(0),
    reviews: integer("reviews").notNull().default(0),
    sales: integer("sales").notNull().default(0),
    description: text("description"),
    imageUrl: text("imageUrl"),
    seller: varchar("seller", { length: 255 }),
    commissionPercentage: integer("commissionPercentage").notNull().default(0),
    isActive: integer("isActive").notNull().default(1),
    syncedAt: timestamp("syncedAt").notNull().defaultNow(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    accountIdx: index("marketplace_products_account_idx").on(
      table.marketplaceAccountId,
    ),
    externalProductIdx: index("marketplace_products_external_idx").on(
      table.externalProductId,
      table.marketplace,
    ),
    marketplaceSalesIdx: index("marketplace_products_marketplace_sales_idx").on(
      table.marketplace,
      table.sales,
    ),
  }),
);

export const productTrends = pgTable(
  "product_trends",
  {
    id: serial("id").primaryKey(),
    marketplaceProductId: integer("marketplaceProductId").notNull(),
    trendingScore: integer("trendingScore").notNull().default(0),
    viewsChange: integer("viewsChange"),
    salesChange: integer("salesChange"),
    priceChange: integer("priceChange"),
    seasonality: varchar("seasonality", { length: 64 }),
    demandLevel: varchar("demandLevel", { length: 64 }),
    competitionLevel: varchar("competitionLevel", { length: 64 }),
    profitabilityScore: integer("profitabilityScore"),
    recommendation: varchar("recommendation", { length: 10 })
      .notNull()
      .default("hold"),
    analyzedAt: timestamp("analyzedAt").notNull().defaultNow(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    productIdx: index("product_trends_product_idx").on(
      table.marketplaceProductId,
    ),
    scoreIdx: index("product_trends_score_idx").on(table.trendingScore),
    recommendationIdx: index("product_trends_recommendation_idx").on(
      table.recommendation,
    ),
  }),
);

export const affiliateMargins = pgTable(
  "affiliate_margins",
  {
    id: serial("id").primaryKey(),
    affiliateId: integer("affiliateId").notNull(),
    marketplaceProductId: integer("marketplaceProductId").notNull(),
    baseCommission: integer("baseCommission").notNull().default(0),
    bonusCommission: integer("bonusCommission").notNull().default(0),
    totalCommission: integer("totalCommission").notNull().default(0),
    estimatedMonthlyEarnings: integer("estimatedMonthlyEarnings")
      .notNull()
      .default(0),
    totalEarnings: integer("totalEarnings").notNull().default(0),
    totalSales: integer("totalSales").notNull().default(0),
    conversionRate: integer("conversionRate").notNull().default(0),
    lastCalculatedAt: timestamp("lastCalculatedAt").notNull().defaultNow(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    affiliateIdx: index("affiliate_margins_affiliate_idx").on(
      table.affiliateId,
    ),
    productIdx: index("affiliate_margins_product_idx").on(
      table.marketplaceProductId,
    ),
  }),
);

export const marketplaceSyncHistory = pgTable(
  "marketplace_sync_history",
  {
    id: serial("id").primaryKey(),
    marketplaceAccountId: integer("marketplaceAccountId").notNull(),
    syncType: varchar("syncType", { length: 20 }).notNull().default("products"),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    productsAdded: integer("productsAdded").notNull().default(0),
    productsUpdated: integer("productsUpdated").notNull().default(0),
    productsFailed: integer("productsFailed").notNull().default(0),
    errorMessage: text("errorMessage"),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    accountIdx: index("marketplace_sync_history_account_idx").on(
      table.marketplaceAccountId,
    ),
    statusIdx: index("marketplace_sync_history_status_idx").on(table.status),
  }),
);

export const marketplaceProducts = marketplaceProductsExt;
export const packs = activationPacks;
export const agentPacks = packActivations;

export type MarketplaceAccount = typeof marketplaceAccounts.$inferSelect;
export type InsertMarketplaceAccount = typeof marketplaceAccounts.$inferInsert;
export type MarketplaceProductExt = typeof marketplaceProductsExt.$inferSelect;
export type InsertMarketplaceProductExt =
  typeof marketplaceProductsExt.$inferInsert;
export type ProductTrend = typeof productTrends.$inferSelect;
export type InsertProductTrend = typeof productTrends.$inferInsert;
export type AffiliateMargin = typeof affiliateMargins.$inferSelect;
export type InsertAffiliateMargin = typeof affiliateMargins.$inferInsert;
export type MarketplaceSyncHistory = typeof marketplaceSyncHistory.$inferSelect;
export type InsertMarketplaceSyncHistory =
  typeof marketplaceSyncHistory.$inferInsert;
export type InsertAgentPack = InsertPackActivation;
