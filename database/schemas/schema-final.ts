import { mysqlTable, int, varchar, text, mysqlEnum, timestamp, index, unique, decimal, json, boolean, bigint } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  openId: varchar("openId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  lastSignedIn: timestamp("lastSignedIn").default(sql`(now())`),
  loginMethod: varchar("loginMethod", { length: 50 }),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
});

export const affiliates = mysqlTable("affiliates", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull().unique(),
  affiliateCode: varchar("affiliateCode", { length: 32 }).notNull().unique(),
  sponsorId: int("sponsorId"),
  commissionPercentage: int("commissionPercentage").notNull().default(10),
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).notNull().default("active"),
  totalCommissions: int("totalCommissions").notNull().default(0),
  pendingCommissions: int("pendingCommissions").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
});

export const products = mysqlTable("products", {
  id: int("id").primaryKey().autoincrement(),
  externalId: varchar("externalId", { length: 128 }).notNull(),
  marketplace: varchar("marketplace", { length: 64 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  price: int("price").notNull(),
  commissionPercentage: int("commissionPercentage").notNull(),
  category: varchar("category", { length: 128 }),
  imageUrl: text("imageUrl"),
  url: text("url").notNull(),
  trending: int("trending").notNull().default(0),
  syncedAt: timestamp("syncedAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
});

export const orders = mysqlTable("orders", {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId").notNull(),
  productId: int("productId").notNull(),
  externalOrderId: varchar("externalOrderId", { length: 128 }).notNull(),
  marketplace: varchar("marketplace", { length: 64 }).notNull(),
  amount: int("amount").notNull(),
  commissionAmount: int("commissionAmount").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"]).notNull().default("pending"),
  customerName: varchar("customerName", { length: 128 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  shippingAddress: text("shippingAddress"),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
});

export const commissions = mysqlTable("commissions", {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId").notNull(),
  amount: int("amount").notNull(),
  level: int("level").notNull(),
  source: varchar("source", { length: 64 }).notNull(), // 'payment', 'order', 'bonus'
  sourceId: int("sourceId"),
  status: mysqlEnum("status", ["pending", "confirmed", "paid", "cancelled"]).notNull().default("pending"),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
});

export const payments = mysqlTable("payments", {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId").notNull(),
  amount: int("amount").notNull(),
  method: varchar("method", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "failed", "cancelled"]).notNull().default("pending"),
  bankCode: varchar("bankCode", { length: 10 }),
  bankNumber: varchar("bankNumber", { length: 20 }),
  agency: varchar("agency", { length: 10 }),
  account: varchar("account", { length: 20 }),
  paymentDate: timestamp("paymentDate"),
  confirmedAt: timestamp("confirmedAt"),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId"),
  type: varchar("type", { length: 64 }).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content"),
  read: int("read").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
});

export const network = mysqlTable("network", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  sponsorId: int("sponsorId").notNull(),
  level: int("level").notNull(),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
});

export const agents = mysqlTable("agents", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull().unique(),
  name: text("name").notNull(),
  status: mysqlEnum("status", ["learning", "active", "paused", "inactive"]).notNull().default("learning"),
  contentStrategy: text("contentStrategy"),
  performanceScore: int("performanceScore").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
});

export const upgrades = mysqlTable("upgrades", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  price: int("price").notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["available", "discontinued"]).notNull().default("available"),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
});

export const agentUpgrades = mysqlTable("agent_upgrades", {
  id: int("id").primaryKey().autoincrement(),
  agentId: int("agentId").notNull(),
  upgradeId: int("upgradeId").notNull(),
  status: mysqlEnum("status", ["active", "inactive", "expired"]).notNull().default("active"),
  activatedAt: timestamp("activatedAt").notNull().default(sql`(now())`),
  expiresAt: timestamp("expiresAt"),
});

export const bonuses = mysqlTable("bonuses", {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId").notNull(),
  amount: int("amount").notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "confirmed", "paid", "cancelled"]).notNull().default("pending"),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
});

export const materials = mysqlTable("materials", {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId"),
  name: varchar("name", { length: 128 }).notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey").notNull(),
  description: text("description"),
  downloads: int("downloads").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
});

// Tipos exportados para compatibilidade
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;
export type Upgrade = typeof upgrades.$inferSelect;
export type AgentUpgrade = typeof agentUpgrades.$inferSelect;
export type Bonus = typeof bonuses.$inferSelect;
export type InsertBonus = typeof bonuses.$inferInsert;
export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;
