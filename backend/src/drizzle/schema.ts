import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export * from "../../../database/schemas/schema-final";
export * from "../../../database/schemas/agentic";

export const marketplaceAccounts = mysqlTable(
  "marketplace_accounts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    marketplace: mysqlEnum("marketplace", ["mercado_libre", "shopee", "hotmart"]).notNull(),
    accountName: varchar("accountName", { length: 128 }).notNull(),
    accessToken: text("accessToken").notNull(),
    refreshToken: text("refreshToken"),
    apiKey: text("apiKey"),
    apiSecret: text("apiSecret"),
    isActive: int("isActive").notNull().default(1),
    syncStatus: mysqlEnum("syncStatus", ["pending", "syncing", "completed", "failed"])
      .notNull()
      .default("pending"),
    lastSyncAt: timestamp("lastSyncAt"),
    createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
    updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
  },
  (table) => ({
    userMarketplaceIdx: index("marketplace_accounts_user_marketplace_idx").on(
      table.userId,
      table.marketplace
    ),
  })
);

export const marketplaceProducts = mysqlTable(
  "marketplace_products",
  {
    id: int("id").autoincrement().primaryKey(),
    marketplaceAccountId: int("marketplaceAccountId").notNull(),
    externalProductId: varchar("externalProductId", { length: 255 }).notNull(),
    marketplace: mysqlEnum("marketplace", ["mercado_libre", "shopee", "hotmart"]).notNull(),
    productName: varchar("productName", { length: 255 }).notNull(),
    productUrl: text("productUrl"),
    category: varchar("category", { length: 128 }),
    price: int("price").notNull(),
    originalPrice: int("originalPrice"),
    discount: int("discount").notNull().default(0),
    rating: int("rating").notNull().default(0),
    reviews: int("reviews").notNull().default(0),
    sales: int("sales").notNull().default(0),
    description: text("description"),
    imageUrl: text("imageUrl"),
    seller: varchar("seller", { length: 255 }),
    commissionPercentage: int("commissionPercentage").notNull().default(0),
    isActive: int("isActive").notNull().default(1),
    syncedAt: timestamp("syncedAt").notNull().default(sql`(now())`),
    createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
    updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
  },
  (table) => ({
    accountIdx: index("marketplace_products_account_idx").on(table.marketplaceAccountId),
    externalProductIdx: index("marketplace_products_external_idx").on(
      table.externalProductId,
      table.marketplace
    ),
    marketplaceSalesIdx: index("marketplace_products_marketplace_sales_idx").on(
      table.marketplace,
      table.sales
    ),
  })
);

export const productTrends = mysqlTable(
  "product_trends",
  {
    id: int("id").autoincrement().primaryKey(),
    marketplaceProductId: int("marketplaceProductId").notNull(),
    trendingScore: int("trendingScore").notNull().default(0),
    viewsChange: int("viewsChange"),
    salesChange: int("salesChange"),
    priceChange: int("priceChange"),
    seasonality: varchar("seasonality", { length: 64 }),
    demandLevel: varchar("demandLevel", { length: 64 }),
    competitionLevel: varchar("competitionLevel", { length: 64 }),
    profitabilityScore: int("profitabilityScore"),
    recommendation: mysqlEnum("recommendation", ["buy", "hold", "sell", "avoid"])
      .notNull()
      .default("hold"),
    analyzedAt: timestamp("analyzedAt").notNull().default(sql`(now())`),
    createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
    updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
  },
  (table) => ({
    productIdx: index("product_trends_product_idx").on(table.marketplaceProductId),
    scoreIdx: index("product_trends_score_idx").on(table.trendingScore),
    recommendationIdx: index("product_trends_recommendation_idx").on(table.recommendation),
  })
);

export const affiliateMargins = mysqlTable(
  "affiliate_margins",
  {
    id: int("id").autoincrement().primaryKey(),
    affiliateId: int("affiliateId").notNull(),
    marketplaceProductId: int("marketplaceProductId").notNull(),
    baseCommission: int("baseCommission").notNull().default(0),
    bonusCommission: int("bonusCommission").notNull().default(0),
    totalCommission: int("totalCommission").notNull().default(0),
    estimatedMonthlyEarnings: int("estimatedMonthlyEarnings").notNull().default(0),
    totalEarnings: int("totalEarnings").notNull().default(0),
    totalSales: int("totalSales").notNull().default(0),
    conversionRate: int("conversionRate").notNull().default(0),
    lastCalculatedAt: timestamp("lastCalculatedAt").notNull().default(sql`(now())`),
    createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
    updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
  },
  (table) => ({
    affiliateIdx: index("affiliate_margins_affiliate_idx").on(table.affiliateId),
    productIdx: index("affiliate_margins_product_idx").on(table.marketplaceProductId),
  })
);

export const marketplaceSyncHistory = mysqlTable(
  "marketplace_sync_history",
  {
    id: int("id").autoincrement().primaryKey(),
    marketplaceAccountId: int("marketplaceAccountId").notNull(),
    syncType: mysqlEnum("syncType", ["products", "orders", "full"]).notNull().default("products"),
    status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"])
      .notNull()
      .default("pending"),
    productsAdded: int("productsAdded").notNull().default(0),
    productsUpdated: int("productsUpdated").notNull().default(0),
    productsFailed: int("productsFailed").notNull().default(0),
    errorMessage: text("errorMessage"),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
    updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
  },
  (table) => ({
    accountIdx: index("marketplace_sync_history_account_idx").on(table.marketplaceAccountId),
    statusIdx: index("marketplace_sync_history_status_idx").on(table.status),
  })
);

export type MarketplaceAccount = typeof marketplaceAccounts.$inferSelect;
export type InsertMarketplaceAccount = typeof marketplaceAccounts.$inferInsert;
export type MarketplaceProduct = typeof marketplaceProducts.$inferSelect;
export type InsertMarketplaceProduct = typeof marketplaceProducts.$inferInsert;
export type ProductTrend = typeof productTrends.$inferSelect;
export type InsertProductTrend = typeof productTrends.$inferInsert;
export type AffiliateMargin = typeof affiliateMargins.$inferSelect;
export type InsertAffiliateMargin = typeof affiliateMargins.$inferInsert;
export type MarketplaceSyncHistory = typeof marketplaceSyncHistory.$inferSelect;
export type InsertMarketplaceSyncHistory = typeof marketplaceSyncHistory.$inferInsert;
