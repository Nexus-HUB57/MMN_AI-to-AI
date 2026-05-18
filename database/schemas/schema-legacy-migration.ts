import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Newsletters - Sistema de cadastro e gerenciamento de newsletters
 */
export const newsletters = mysqlTable("newsletters", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  source: varchar("source", { length: 100 }).default("direct"),
  subscribed: mysqlEnum("subscribed", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  subscribedIdx: index("subscribed_idx").on(table.subscribed),
}));

export type Newsletter = typeof newsletters.$inferSelect;
export type InsertNewsletter = typeof newsletters.$inferInsert;

/**
 * CMS Pages - Sistema de páginas de conteúdo dinâmico
 */
export const cmsPages = mysqlTable("cms_pages", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content"),
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  category: varchar("category", { length: 100 }).default("general"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: index("slug_idx").on(table.slug),
  categoryIdx: index("category_idx").on(table.category),
  statusIdx: index("status_idx").on(table.status),
}));

export type CMSPage = typeof cmsPages.$inferSelect;
export type InsertCMSPage = typeof cmsPages.$inferInsert;

/**
 * Invoices - Sistema de faturas e cobrança
 */
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  amount: varchar("amount", { length: 20 }).notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "overdue", "cancelled"]).default("pending").notNull(),
  dueDate: timestamp("dueDate").notNull(),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
  dueDateIdx: index("due_date_idx").on(table.dueDate),
}));

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

/**
 * Invoice Items - Itens de cada fatura
 */
export const invoiceItems = mysqlTable("invoice_items", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  description: text("description").notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: varchar("unitPrice", { length: 20 }).notNull(),
  total: varchar("total", { length: 20 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  invoiceIdIdx: index("invoice_id_idx").on(table.invoiceId),
}));

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;

/**
 * Billing History - Histórico de ações no sistema de cobrança
 */
export const billingHistory = mysqlTable("billing_history", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  action: text("action").notNull(),
  performedBy: int("performedBy").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  invoiceIdIdx: index("invoice_id_idx").on(table.invoiceId),
}));

export type BillingHistory = typeof billingHistory.$inferSelect;
export type InsertBillingHistory = typeof billingHistory.$inferInsert;

/**
 * Relations
 */
export const newslettersRelations = relations(newsletters, () => ({}));

export const cmsPagesRelations = relations(cmsPages, () => ({}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  items: many(invoiceItems),
  history: many(billingHistory),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const billingHistoryRelations = relations(billingHistory, ({ one }) => ({
  invoice: one(invoices, {
    fields: [billingHistory.invoiceId],
    references: [invoices.id],
  }),
}));