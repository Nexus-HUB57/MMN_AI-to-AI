import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, index } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Affiliates table - Dados específicos de afiliados
 */
export const affiliates = mysqlTable("affiliates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  affiliateCode: varchar("affiliateCode", { length: 32 }).notNull().unique(),
  sponsorId: int("sponsorId"),
  commissionPercentage: int("commissionPercentage").notNull().default(10),
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).notNull().default("active"),
  totalCommissions: int("totalCommissions").notNull().default(0),
  pendingCommissions: int("pendingCommissions").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

/**
 * Products table - Catálogo de produtos de marketplaces
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  externalId: varchar("externalId", { length: 128 }).notNull(),
  marketplace: varchar("marketplace", { length: 64 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  price: int("price").notNull(), // Stored in cents
  commissionPercentage: decimal("commissionPercentage", { precision: 5, scale: 2 }).notNull(),
  category: varchar("category", { length: 128 }),
  imageUrl: text("imageUrl"),
  url: text("url").notNull(),
  trending: int("trending").notNull().default(0), // 1 = trending, 0 = not trending
  trendingScore: int("trendingScore").notNull().default(0), // 0-100 score
  demandLevel: varchar("demandLevel", { length: 32 }).default("medium"), // low, medium, high
  competitionLevel: varchar("competitionLevel", { length: 32 }).default("medium"), // low, medium, high
  rating: decimal("rating", { precision: 3, scale: 1 }).default("0"),
  sales: int("sales").default(0),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  marketplaceIdx: index("marketplace_idx").on(table.marketplace),
  trendingIdx: index("trending_idx").on(table.trending),
}));

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Orders table - Histórico de pedidos de dropshipping
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  productId: int("productId").notNull(),
  externalOrderId: varchar("externalOrderId", { length: 128 }).notNull(),
  marketplace: varchar("marketplace", { length: 64 }).notNull(),
  amount: int("amount").notNull(), // Stored in cents
  commissionAmount: int("commissionAmount").notNull(), // Stored in cents
  status: mysqlEnum("status", ["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"]).notNull().default("pending"),
  customerName: varchar("customerName", { length: 128 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  shippingAddress: text("shippingAddress"),
  trackingNumber: varchar("trackingNumber", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  affiliateIdx: index("affiliate_idx").on(table.affiliateId),
  statusIdx: index("status_idx").on(table.status),
}));

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order Status History table - Rastreamento de mudanças de status
 */
export const orderStatusHistory = mysqlTable("order_status_history", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  previousStatus: varchar("previousStatus", { length: 32 }),
  newStatus: varchar("newStatus", { length: 32 }).notNull(),
  changedAt: timestamp("changedAt").defaultNow().notNull(),
}, (table) => ({
  orderIdx: index("order_history_idx").on(table.orderId),
}));

export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type InsertOrderStatusHistory = typeof orderStatusHistory.$inferInsert;

/**
 * Notifications table - Alertas do sistema
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: varchar("type", { length: 64 }).notNull(), // new_order, status_update, commission_credited, etc
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content"),
  relatedOrderId: int("relatedOrderId"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("user_notifications_idx").on(table.userId),
  typeIdx: index("notification_type_idx").on(table.type),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Commissions table - Histórico de comissões
 */
export const commissions = mysqlTable("commissions", {
  id: int("id").autoincrement().primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  amount: int("amount").notNull(), // Stored in cents
  level: int("level").notNull().default(1),
  source: varchar("source", { length: 64 }).notNull(), // 'order', 'bonus', etc
  sourceId: int("sourceId"),
  status: mysqlEnum("status", ["pending", "confirmed", "paid", "cancelled"]).notNull().default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  affiliateIdx: index("commission_affiliate_idx").on(table.affiliateId),
}));

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;
