import { pgTable, serial, integer, varchar, text, timestamp, index, numeric, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const mediaFiles = pgTable("media_files", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 10 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  s3Key: varchar("s3Key", { length: 500 }).notNull(),
  s3Url: varchar("s3Url", { length: 500 }).notNull(),
  fileSize: integer("fileSize").notNull(),
  width: integer("width"),
  height: integer("height"),
  duration: integer("duration"),
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("media_user_idx").on(table.userId),
  fileTypeIdx: index("media_type_idx").on(table.fileType),
}));

export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = typeof mediaFiles.$inferInsert;

export const contentSentimentAnalysis = pgTable("content_sentiment_analysis", {
  id: varchar("id", { length: 36 }).primaryKey(),
  contentId: varchar("contentId", { length: 36 }).notNull(),
  userId: integer("userId").notNull(),
  score: numeric("score", { precision: 5, scale: 2 }).notNull(),
  classification: varchar("classification", { length: 20 }).notNull(),
  explanation: text("explanation"),
  keywords: jsonb("keywords").$type<string[]>(),
  confidence: numeric("confidence", { precision: 3, scale: 2 }).notNull(),
  analyzedAt: timestamp("analyzedAt").defaultNow().notNull(),
}, (table) => ({
  contentIdIdx: index("sentiment_content_idx").on(table.contentId),
  userIdIdx: index("sentiment_user_idx").on(table.userId),
  classificationIdx: index("sentiment_class_idx").on(table.classification),
}));

export type ContentSentimentAnalysis = typeof contentSentimentAnalysis.$inferSelect;
export type InsertContentSentimentAnalysis = typeof contentSentimentAnalysis.$inferInsert;

export const contentRecommendations = pgTable("content_recommendations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("userId").notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  format: varchar("format", { length: 100 }).notNull(),
  tone: varchar("tone", { length: 100 }).notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  bestTimeToPost: varchar("bestTimeToPost", { length: 100 }),
  reasoning: text("reasoning"),
  examples: jsonb("examples").$type<string[]>(),
  confidence: numeric("confidence", { precision: 3, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  acceptedAt: timestamp("acceptedAt"),
}, (table) => ({
  userIdIdx: index("rec_user_idx").on(table.userId),
  statusIdx: index("rec_status_idx").on(table.status),
  platformIdx: index("rec_platform_idx").on(table.platform),
}));

export type ContentRecommendation = typeof contentRecommendations.$inferSelect;
export type InsertContentRecommendation = typeof contentRecommendations.$inferInsert;

export const socialMediaAccounts = pgTable("social_media_accounts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("userId").notNull(),
  platform: varchar("platform", { length: 20 }).notNull(),
  accountId: varchar("accountId", { length: 255 }).notNull(),
  accountName: varchar("accountName", { length: 255 }).notNull(),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  isActive: varchar("isActive", { length: 10 }).default("true").notNull(),
  followers: integer("followers").default(0),
  lastSyncedAt: timestamp("lastSyncedAt"),
  connectedAt: timestamp("connectedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userPlatformIdx: index("social_user_platform_idx").on(table.userId, table.platform),
  platformIdx: index("phase3_social_platform_idx").on(table.platform),
}));

export type SocialMediaAccount = typeof socialMediaAccounts.$inferSelect;
export type InsertSocialMediaAccount = typeof socialMediaAccounts.$inferInsert;

export const socialMediaPosts = pgTable("social_media_posts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("userId").notNull(),
  socialAccountId: varchar("socialAccountId", { length: 36 }).notNull(),
  platform: varchar("platform", { length: 20 }).notNull(),
  platformPostId: varchar("platformPostId", { length: 255 }).notNull(),
  content: text("content").notNull(),
  mediaUrls: jsonb("mediaUrls").$type<string[]>(),
  hashtags: jsonb("hashtags").$type<string[]>(),
  mentions: jsonb("mentions").$type<string[]>(),
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  publishedAt: timestamp("publishedAt"),
  scheduledFor: timestamp("scheduledFor"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userPlatformIdx: index("smp_user_platform_idx").on(table.userId, table.platform),
  statusIdx: index("smp_status_idx").on(table.status),
  publishedAtIdx: index("smp_published_idx").on(table.publishedAt),
}));

export type SocialMediaPost = typeof socialMediaPosts.$inferSelect;
export type InsertSocialMediaPost = typeof socialMediaPosts.$inferInsert;

export const socialMediaAnalytics = pgTable("social_media_analytics", {
  id: varchar("id", { length: 36 }).primaryKey(),
  socialPostId: varchar("socialPostId", { length: 36 }).notNull(),
  platform: varchar("platform", { length: 20 }).notNull(),
  views: integer("views").default(0).notNull(),
  likes: integer("likes").default(0).notNull(),
  shares: integer("shares").default(0).notNull(),
  comments: integer("comments").default(0).notNull(),
  reach: integer("reach").default(0),
  impressions: integer("impressions").default(0),
  engagementRate: numeric("engagementRate", { precision: 5, scale: 2 }).default("0"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
}, (table) => ({
  socialPostIdIdx: index("sma_post_idx").on(table.socialPostId),
  platformIdx: index("sma_platform_idx").on(table.platform),
  recordedAtIdx: index("sma_recorded_idx").on(table.recordedAt),
}));

export type SocialMediaAnalytic = typeof socialMediaAnalytics.$inferSelect;
export type InsertSocialMediaAnalytic = typeof socialMediaAnalytics.$inferInsert;

export const userContentProfiles = pgTable("user_content_profiles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("userId").notNull().unique(),
  totalPosts: integer("totalPosts").default(0),
  averageEngagement: numeric("averageEngagement", { precision: 5, scale: 2 }).default("0"),
  topTopics: jsonb("topTopics").$type<string[]>(),
  preferredTones: jsonb("preferredTones").$type<string[]>(),
  preferredPlatforms: jsonb("preferredPlatforms").$type<string[]>(),
  bestPerformingFormat: varchar("bestPerformingFormat", { length: 100 }),
  lastAnalyzedAt: timestamp("lastAnalyzedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("profile_user_idx").on(table.userId),
}));

export type UserContentProfile = typeof userContentProfiles.$inferSelect;
export type InsertUserContentProfile = typeof userContentProfiles.$inferInsert;

export const socialMediaAccountsRelations = relations(socialMediaAccounts, ({ many }) => ({
  posts: many(socialMediaPosts),
}));
export const socialMediaPostsRelations = relations(socialMediaPosts, ({ one, many }) => ({
  account: one(socialMediaAccounts, { fields: [socialMediaPosts.socialAccountId], references: [socialMediaAccounts.id] }),
  analytics: many(socialMediaAnalytics),
}));
export const socialMediaAnalyticsRelations = relations(socialMediaAnalytics, ({ one }) => ({
  post: one(socialMediaPosts, { fields: [socialMediaAnalytics.socialPostId], references: [socialMediaPosts.id] }),
}));
