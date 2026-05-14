import { decimal, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Extensão do Schema para Fase 3: Recursos Adicionais
 * Inclui: Mídia, Análise de Sentimento, Recomendações, Integração Social
 */

/**
 * Media Files - Arquivos de mídia (imagens e vídeos)
 */
export const mediaFiles = mysqlTable("media_files", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: mysqlEnum("fileType", ["image", "video"]).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  s3Key: varchar("s3Key", { length: 500 }).notNull(),
  s3Url: varchar("s3Url", { length: 500 }).notNull(),
  fileSize: int("fileSize").notNull(),
  width: int("width"),
  height: int("height"),
  duration: int("duration"), // segundos, para vídeos
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("media_user_idx").on(table.userId),
  fileTypeIdx: index("media_type_idx").on(table.fileType),
}));

export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = typeof mediaFiles.$inferInsert;

/**
 * Content Sentiment Analysis - Análise de sentimento de conteúdo
 */
export const contentSentimentAnalysis = mysqlTable("content_sentiment_analysis", {
  id: varchar("id", { length: 36 }).primaryKey(),
  contentId: varchar("contentId", { length: 36 }).notNull(),
  userId: int("userId").notNull(),
  score: decimal("score", { precision: 5, scale: 2 }).notNull(), // 0-100
  classification: mysqlEnum("classification", ["positive", "neutral", "negative"]).notNull(),
  explanation: text("explanation"),
  keywords: json("keywords").$type<string[]>(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(), // 0-1
  analyzedAt: timestamp("analyzedAt").defaultNow().notNull(),
}, (table) => ({
  contentIdIdx: index("sentiment_content_idx").on(table.contentId),
  userIdIdx: index("sentiment_user_idx").on(table.userId),
  classificationIdx: index("sentiment_class_idx").on(table.classification),
}));

export type ContentSentimentAnalysis = typeof contentSentimentAnalysis.$inferSelect;
export type InsertContentSentimentAnalysis = typeof contentSentimentAnalysis.$inferInsert;

/**
 * Content Recommendations - Recomendações personalizadas
 */
export const contentRecommendations = mysqlTable("content_recommendations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 255 }).notNull(),
  format: varchar("format", { length: 100 }).notNull(),
  tone: varchar("tone", { length: 100 }).notNull(),
  platform: varchar("platform", { length: 100 }).notNull(),
  bestTimeToPost: varchar("bestTimeToPost", { length: 100 }),
  reasoning: text("reasoning"),
  examples: json("examples").$type<string[]>(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "implemented"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  acceptedAt: timestamp("acceptedAt"),
}, (table) => ({
  userIdIdx: index("rec_user_idx").on(table.userId),
  statusIdx: index("rec_status_idx").on(table.status),
  platformIdx: index("rec_platform_idx").on(table.platform),
}));

export type ContentRecommendation = typeof contentRecommendations.$inferSelect;
export type InsertContentRecommendation = typeof contentRecommendations.$inferInsert;

/**
 * Social Media Accounts - Contas de redes sociais conectadas
 */
export const socialMediaAccounts = mysqlTable("social_media_accounts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  platform: mysqlEnum("platform", ["instagram", "twitter", "linkedin", "tiktok"]).notNull(),
  accountId: varchar("accountId", { length: 255 }).notNull(),
  accountName: varchar("accountName", { length: 255 }).notNull(),
  accessToken: text("accessToken").notNull(), // Criptografado em produção
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  followers: int("followers").default(0),
  lastSyncedAt: timestamp("lastSyncedAt"),
  connectedAt: timestamp("connectedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userPlatformIdx: index("social_user_platform_idx").on(table.userId, table.platform),
  platformIdx: index("social_platform_idx").on(table.platform),
}));

export type SocialMediaAccount = typeof socialMediaAccounts.$inferSelect;
export type InsertSocialMediaAccount = typeof socialMediaAccounts.$inferInsert;

/**
 * Social Media Posts - Posts publicados em redes sociais
 */
export const socialMediaPosts = mysqlTable("social_media_posts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  socialAccountId: varchar("socialAccountId", { length: 36 }).notNull(),
  platform: mysqlEnum("platform", ["instagram", "twitter", "linkedin", "tiktok"]).notNull(),
  platformPostId: varchar("platformPostId", { length: 255 }).notNull(),
  content: text("content").notNull(),
  mediaUrls: json("mediaUrls").$type<string[]>(),
  hashtags: json("hashtags").$type<string[]>(),
  mentions: json("mentions").$type<string[]>(),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "failed"]).default("draft").notNull(),
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

/**
 * Social Media Analytics - Métricas de posts em redes sociais
 */
export const socialMediaAnalytics = mysqlTable("social_media_analytics", {
  id: varchar("id", { length: 36 }).primaryKey(),
  socialPostId: varchar("socialPostId", { length: 36 }).notNull(),
  platform: mysqlEnum("platform", ["instagram", "twitter", "linkedin", "tiktok"]).notNull(),
  views: int("views").default(0).notNull(),
  likes: int("likes").default(0).notNull(),
  shares: int("shares").default(0).notNull(),
  comments: int("comments").default(0).notNull(),
  reach: int("reach").default(0),
  impressions: int("impressions").default(0),
  engagementRate: decimal("engagementRate", { precision: 5, scale: 2 }).default("0"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
}, (table) => ({
  socialPostIdIdx: index("sma_post_idx").on(table.socialPostId),
  platformIdx: index("sma_platform_idx").on(table.platform),
  recordedAtIdx: index("sma_recorded_idx").on(table.recordedAt),
}));

export type SocialMediaAnalytic = typeof socialMediaAnalytics.$inferSelect;
export type InsertSocialMediaAnalytic = typeof socialMediaAnalytics.$inferInsert;

/**
 * User Content Profile - Perfil de conteúdo do usuário
 */
export const userContentProfiles = mysqlTable("user_content_profiles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull().unique(),
  totalPosts: int("totalPosts").default(0),
  averageEngagement: decimal("averageEngagement", { precision: 5, scale: 2 }).default("0"),
  topTopics: json("topTopics").$type<string[]>(),
  preferredTones: json("preferredTones").$type<string[]>(),
  preferredPlatforms: json("preferredPlatforms").$type<string[]>(),
  bestPerformingFormat: varchar("bestPerformingFormat", { length: 100 }),
  lastAnalyzedAt: timestamp("lastAnalyzedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("profile_user_idx").on(table.userId),
}));

export type UserContentProfile = typeof userContentProfiles.$inferSelect;
export type InsertUserContentProfile = typeof userContentProfiles.$inferInsert;

/**
 * Relations
 */
export const mediaFilesRelations = relations(mediaFiles, ({ one }) => ({
  // Pode ser relacionado a usuários
}));

export const contentSentimentAnalysisRelations = relations(
  contentSentimentAnalysis,
  ({ one }) => ({
    // Pode ser relacionado a conteúdo gerado
  })
);

export const contentRecommendationsRelations = relations(
  contentRecommendations,
  ({ one }) => ({
    // Pode ser relacionado a usuários
  })
);

export const socialMediaAccountsRelations = relations(
  socialMediaAccounts,
  ({ one, many }) => ({
    posts: many(socialMediaPosts),
  })
);

export const socialMediaPostsRelations = relations(
  socialMediaPosts,
  ({ one, many }) => ({
    account: one(socialMediaAccounts, {
      fields: [socialMediaPosts.socialAccountId],
      references: [socialMediaAccounts.id],
    }),
    analytics: many(socialMediaAnalytics),
  })
);

export const socialMediaAnalyticsRelations = relations(
  socialMediaAnalytics,
  ({ one }) => ({
    post: one(socialMediaPosts, {
      fields: [socialMediaAnalytics.socialPostId],
      references: [socialMediaPosts.id],
    }),
  })
);

export const userContentProfilesRelations = relations(
  userContentProfiles,
  ({ one }) => ({
    // Pode ser relacionado a usuários
  })
);
