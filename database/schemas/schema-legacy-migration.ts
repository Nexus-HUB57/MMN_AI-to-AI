import { pgTable, serial, integer, varchar, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  source: varchar("source", { length: 100 }).default("direct"),
  subscribed: varchar("subscribed", { length: 10 }).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  subscribedIdx: index("subscribed_idx").on(table.subscribed),
}));

export type Newsletter = typeof newsletters.$inferSelect;
export type InsertNewsletter = typeof newsletters.$inferInsert;

export const cmsPages = pgTable("cms_pages", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content"),
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  category: varchar("category", { length: 100 }).default("general"),
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  order: integer("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  slugIdx: index("slug_idx").on(table.slug),
  categoryIdx: index("cms_category_idx").on(table.category),
  statusIdx: index("cms_status_idx").on(table.status),
}));

export type CMSPage = typeof cmsPages.$inferSelect;
export type InsertCMSPage = typeof cmsPages.$inferInsert;

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  amount: varchar("amount", { length: 20 }).notNull(),
  description: text("description").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  dueDate: timestamp("dueDate").notNull(),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("invoice_user_id_idx").on(table.userId),
  statusIdx: index("invoice_status_idx").on(table.status),
  dueDateIdx: index("due_date_idx").on(table.dueDate),
}));

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoiceId").notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: varchar("unitPrice", { length: 20 }).notNull(),
  total: varchar("total", { length: 20 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  invoiceIdIdx: index("invoice_id_idx").on(table.invoiceId),
}));

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = typeof invoiceItems.$inferInsert;

export const billingHistory = pgTable("billing_history", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoiceId").notNull(),
  action: text("action").notNull(),
  performedBy: integer("performedBy").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  invoiceIdIdx: index("billing_invoice_id_idx").on(table.invoiceId),
}));

export type BillingHistory = typeof billingHistory.$inferSelect;
export type InsertBillingHistory = typeof billingHistory.$inferInsert;

export const newslettersRelations = relations(newsletters, () => ({}));
export const cmsPagesRelations = relations(cmsPages, () => ({}));
export const invoicesRelations = relations(invoices, ({ many }) => ({
  items: many(invoiceItems),
  history: many(billingHistory),
}));
export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceItems.invoiceId], references: [invoices.id] }),
}));
export const billingHistoryRelations = relations(billingHistory, ({ one }) => ({
  invoice: one(invoices, { fields: [billingHistory.invoiceId], references: [invoices.id] }),
}));
