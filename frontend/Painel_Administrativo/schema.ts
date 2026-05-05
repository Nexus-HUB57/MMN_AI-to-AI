import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const affiliates = mysqlTable("affiliates", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull().unique(),
  affiliateCode: varchar("affiliateCode", { length: 32 }).notNull().unique(),
  sponsorId: int("sponsorId"),
  commissionPercentage: int("commissionPercentage").notNull().default(10),
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).notNull().default("active"),
  totalCommissions: decimal("totalCommissions", { precision: 15, scale: 2 }).notNull().default("0"),
  pendingCommissions: decimal("pendingCommissions", { precision: 15, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const network = mysqlTable("network", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  sponsorId: int("sponsorId").notNull(),
  level: int("level").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const agents = mysqlTable("agents", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull().unique(),
  name: text("name").notNull(),
  status: mysqlEnum("status", ["learning", "active", "paused", "inactive"]).notNull().default("learning"),
  contentStrategy: text("contentStrategy"),
  performanceScore: int("performanceScore").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const upgrades = mysqlTable("upgrades", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 15, scale: 2 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["available", "discontinued"]).notNull().default("available"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const agentUpgrades = mysqlTable("agent_upgrades", {
  id: int("id").primaryKey().autoincrement(),
  agentId: int("agentId").notNull(),
  upgradeId: int("upgradeId").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "expired"]).notNull().default("active"),
  activatedAt: timestamp("activatedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

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

export const orders = mysqlTable("orders", {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId").notNull(),
  externalOrderId: varchar("externalOrderId", { length: 128 }).notNull(),
  marketplace: varchar("marketplace", { length: 64 }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  commissionAmount: decimal("commissionAmount", { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"]).notNull().default("pending"),
  customerName: varchar("customerName", { length: 128 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  shippingAddress: text("shippingAddress"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const commissions = mysqlTable("commissions", {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  level: int("level").notNull(),
  source: varchar("source", { length: 64 }).notNull(),
  sourceId: int("sourceId"),
  status: mysqlEnum("status", ["pending", "confirmed", "paid", "cancelled"]).notNull().default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const commissionConfigs = mysqlTable("commission_configs", {
  id: int("id").primaryKey().autoincrement(),
  level: int("level").notNull().unique(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).notNull(),
  minAmount: decimal("minAmount", { precision: 15, scale: 2 }).default("0"),
  description: text("description"),
  active: int("active").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const payments = mysqlTable("payments", {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "approved", "paid", "rejected", "cancelled"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 64 }),
  transactionId: varchar("transactionId", { length: 128 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  paidAt: timestamp("paidAt"),
});

export const delinquents = mysqlTable("delinquents", {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId").notNull(),
  outstandingAmount: decimal("outstandingAmount", { precision: 15, scale: 2 }).notNull(),
  daysOverdue: int("daysOverdue").default(0),
  status: mysqlEnum("status", ["active", "resolved", "disputed"]).default("active").notNull(),
  reason: text("reason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export const materials = mysqlTable("materials", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 64 }).notNull(),
  type: mysqlEnum("type", ["banner", "text", "link", "video", "image", "document"]).notNull(),
  url: text("url"),
  fileKey: varchar("fileKey", { length: 256 }),
  downloadCount: int("downloadCount").default(0),
  status: mysqlEnum("status", ["active", "inactive", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const materialDownloads = mysqlTable("material_downloads", {
  id: int("id").primaryKey().autoincrement(),
  materialId: int("materialId").notNull(),
  affiliateId: int("affiliateId"),
  downloadedAt: timestamp("downloadedAt").defaultNow().notNull(),
});

export const adminLogs = mysqlTable("admin_logs", {
  id: int("id").primaryKey().autoincrement(),
  adminId: int("adminId").notNull(),
  action: varchar("action", { length: 128 }).notNull(),
  entityType: varchar("entityType", { length: 64 }),
  entityId: int("entityId"),
  details: text("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;
export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;
export type Network = typeof network.$inferSelect;
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;
export type Upgrade = typeof upgrades.$inferSelect;
export type InsertUpgrade = typeof upgrades.$inferInsert;
export type AgentUpgrade = typeof agentUpgrades.$inferSelect;
export type CommissionConfig = typeof commissionConfigs.$inferSelect;
export type InsertCommissionConfig = typeof commissionConfigs.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type Delinquent = typeof delinquents.$inferSelect;
export type InsertDelinquent = typeof delinquents.$inferInsert;
export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;
export type MaterialDownload = typeof materialDownloads.$inferSelect;
export type AdminLog = typeof adminLogs.$inferSelect;

// TODO: Add your tables here