import { decimal, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
export * from "./agentic";

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
 * Content Templates - Templates de conteúdo reutilizáveis com variáveis dinâmicas
 */
export const contentTemplates = mysqlTable("content_templates", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  content: text("content").notNull(),
  variables: json("variables").$type<string[]>(),
  platform: varchar("platform", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userPlatformIdx: index("user_platform_idx").on(table.userId, table.platform),
}));

export type ContentTemplate = typeof contentTemplates.$inferSelect;
export type InsertContentTemplate = typeof contentTemplates.$inferInsert;

/**
 * Scheduled Posts - Posts agendados para publicação automática
 */
export const scheduledPosts = mysqlTable("scheduled_posts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  platforms: json("platforms").$type<string[]>().notNull(),
  scheduledFor: timestamp("scheduledFor").notNull(),
  status: mysqlEnum("status", ["scheduled", "published", "failed", "cancelled"]).default("scheduled").notNull(),
  mediaUrls: json("mediaUrls").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  publishedAt: timestamp("publishedAt"),
}, (table) => ({
  userStatusDateIdx: index("user_status_date_idx").on(table.userId, table.status, table.scheduledFor),
}));

export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = typeof scheduledPosts.$inferInsert;

/**
 * Content Analytics - Métricas de engajamento dos posts
 */
export const contentAnalytics = mysqlTable("content_analytics", {
  id: varchar("id", { length: 36 }).primaryKey(),
  postId: varchar("postId", { length: 36 }).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  views: int("views").default(0).notNull(),
  likes: int("likes").default(0).notNull(),
  shares: int("shares").default(0).notNull(),
  comments: int("comments").default(0).notNull(),
  engagementRate: decimal("engagementRate", { precision: 5, scale: 2 }).default("0"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
}, (table) => ({
  postPlatformDateIdx: index("post_platform_date_idx").on(table.postId, table.platform, table.recordedAt),
}));

export type ContentAnalytic = typeof contentAnalytics.$inferSelect;
export type InsertContentAnalytic = typeof contentAnalytics.$inferInsert;

/**
 * Generated Content History - Histórico de conteúdos gerados
 */
export const generatedContent = mysqlTable("generated_content", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  prompt: text("prompt").notNull(),
  content: text("content").notNull(),
  modelId: varchar("modelId", { length: 100 }).notNull(),
  temperature: decimal("temperature", { precision: 3, scale: 2 }).default("0.7"),
  maxTokens: int("maxTokens").default(1000),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userCreatedIdx: index("user_created_idx").on(table.userId, table.createdAt),
}));

export type GeneratedContent = typeof generatedContent.$inferSelect;
export type InsertGeneratedContent = typeof generatedContent.$inferInsert;

/**
 * AI Models Configuration - Modelos de IA disponíveis
 */
export const aiModels = mysqlTable("ai_models", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  description: text("description"),
  costPer1kTokens: decimal("costPer1kTokens", { precision: 8, scale: 6 }).default("0"),
  maxTokens: int("maxTokens").default(4096),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AIModel = typeof aiModels.$inferSelect;
export type InsertAIModel = typeof aiModels.$inferInsert;

/**
 * Relations
 */
export const usersRelations = relations(users, ({ many }) => ({
  contentTemplates: many(contentTemplates),
  scheduledPosts: many(scheduledPosts),
  generatedContent: many(generatedContent),
}));

export const contentTemplatesRelations = relations(contentTemplates, ({ one }) => ({
  user: one(users, {
    fields: [contentTemplates.userId],
    references: [users.id],
  }),
}));

export const scheduledPostsRelations = relations(scheduledPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [scheduledPosts.userId],
    references: [users.id],
  }),
  analytics: many(contentAnalytics),
}));

export const generatedContentRelations = relations(generatedContent, ({ one }) => ({
  user: one(users, {
    fields: [generatedContent.userId],
    references: [users.id],
  }),
}));