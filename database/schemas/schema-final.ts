import { pgTable, serial, integer, varchar, text, timestamp, jsonb, numeric, boolean, index, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  role: varchar("role", { length: 20 }).notNull().default("user"),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
  loginMethod: varchar("loginMethod", { length: 50 }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  legacyId: integer("legacyId"),
  legacyPassword: text("legacyPassword"),
  cpf: varchar("cpf", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
});

export const affiliates = pgTable("affiliates", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  affiliateCode: varchar("affiliateCode", { length: 32 }).notNull().unique(),
  sponsorId: integer("sponsorId"),
  commissionPercentage: integer("commissionPercentage").notNull().default(10),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  totalCommissions: integer("totalCommissions").notNull().default(0),
  pendingCommissions: integer("pendingCommissions").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  legacyStatus: varchar("legacyStatus", { length: 50 }),
  expirationDate: timestamp("expirationDate"),
  points: integer("points").default(0),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  externalId: varchar("externalId", { length: 128 }).notNull(),
  marketplace: varchar("marketplace", { length: 64 }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  commissionPercentage: integer("commissionPercentage").notNull(),
  category: varchar("category", { length: 128 }),
  imageUrl: text("imageUrl"),
  url: text("url").notNull(),
  trending: integer("trending").notNull().default(0),
  syncedAt: timestamp("syncedAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  productId: integer("productId").notNull(),
  externalOrderId: varchar("externalOrderId", { length: 128 }).notNull(),
  marketplace: varchar("marketplace", { length: 64 }).notNull(),
  amount: integer("amount").notNull(),
  commissionAmount: integer("commissionAmount").notNull(),
  status: varchar("status", { length: 30 }).notNull().default("pending"),
  customerName: varchar("customerName", { length: 128 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  shippingAddress: text("shippingAddress"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  amount: integer("amount").notNull(),
  level: integer("level").notNull(),
  source: varchar("source", { length: 64 }).notNull(),
  sourceId: integer("sourceId"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  amount: integer("amount").notNull(),
  method: varchar("method", { length: 64 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  bankCode: varchar("bankCode", { length: 10 }),
  bankNumber: varchar("bankNumber", { length: 20 }),
  agency: varchar("agency", { length: 10 }),
  account: varchar("account", { length: 20 }),
  paymentDate: timestamp("paymentDate"),
  confirmedAt: timestamp("confirmedAt"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  type: varchar("type", { length: 64 }).notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content"),
  read: integer("read").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const network = pgTable("network", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  sponsorId: integer("sponsorId").notNull(),
  level: integer("level").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  name: text("name").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("learning"),
  contentStrategy: text("contentStrategy"),
  performanceScore: integer("performanceScore").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const upgrades = pgTable("upgrades", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("available"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const agentUpgrades = pgTable("agent_upgrades", {
  id: serial("id").primaryKey(),
  agentId: integer("agentId").notNull(),
  upgradeId: integer("upgradeId").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  activatedAt: timestamp("activatedAt").notNull().defaultNow(),
  expiresAt: timestamp("expiresAt"),
});

export const bonuses = pgTable("bonuses", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  amount: integer("amount").notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId"),
  name: varchar("name", { length: 128 }).notNull(),
  type: varchar("type", { length: 64 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: text("fileKey").notNull(),
  description: text("description"),
  downloads: integer("downloads").notNull().default(0),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const orchestrationGoals = pgTable("orchestration_goals", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: varchar("priority", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  targetMetrics: text("targetMetrics"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const jobLogs = pgTable("job_logs", {
  id: varchar("id", { length: 64 }).primaryKey(),
  jobId: varchar("jobId", { length: 64 }).notNull(),
  queueName: varchar("queueName", { length: 64 }).notNull(),
  jobType: varchar("jobType", { length: 64 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  input: text("input"),
  output: text("output"),
  error: text("error"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  jobIdIdx: index("job_logs_job_id_idx").on(table.jobId),
  queueNameIdx: index("job_logs_queue_idx").on(table.queueName),
  statusIdx: index("job_logs_status_idx").on(table.status),
}));

export const orchestrationTasks = pgTable("orchestration_tasks", {
  id: varchar("id", { length: 64 }).primaryKey(),
  goalId: varchar("goalId", { length: 64 }).notNull(),
  taskId: varchar("taskId", { length: 64 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  description: text("description").notNull(),
  parameters: text("parameters"),
  status: varchar("status", { length: 20 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  dispatchedAt: timestamp("dispatchedAt"),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const performanceMetrics = pgTable("performance_metrics", {
  id: varchar("id", { length: 64 }).primaryKey(),
  queueName: varchar("queueName", { length: 64 }).notNull(),
  totalJobs: integer("totalJobs").default(0).notNull(),
  successfulJobs: integer("successfulJobs").default(0).notNull(),
  failedJobs: integer("failedJobs").default(0).notNull(),
  averageExecutionTime: integer("averageExecutionTime").default(0).notNull(),
  successRate: varchar("successRate", { length: 10 }).default("0%").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
}, (table) => ({
  queueNameIdx: index("perf_queue_idx").on(table.queueName),
  timestampIdx: index("perf_timestamp_idx").on(table.timestamp),
}));

export const contentTemplates = pgTable("content_templates", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  content: text("content").notNull(),
  variables: jsonb("variables").$type<string[]>(),
  platform: varchar("platform", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userPlatformIdx: index("user_platform_idx").on(table.userId, table.platform),
  categoryIdx: index("category_idx").on(table.category),
}));

export const scheduledPosts = pgTable("scheduled_posts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  platforms: jsonb("platforms").$type<string[]>().notNull(),
  scheduledFor: timestamp("scheduledFor").notNull(),
  status: varchar("status", { length: 20 }).default("scheduled").notNull(),
  mediaUrls: jsonb("mediaUrls").$type<string[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  publishedAt: timestamp("publishedAt"),
}, (table) => ({
  userStatusDateIdx: index("user_status_date_idx").on(table.userId, table.status, table.scheduledFor),
  scheduledForIdx: index("scheduled_for_idx").on(table.scheduledFor),
}));

export const contentAnalytics = pgTable("content_analytics", {
  id: varchar("id", { length: 36 }).primaryKey(),
  postId: varchar("postId", { length: 36 }).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  views: integer("views").default(0).notNull(),
  likes: integer("likes").default(0).notNull(),
  shares: integer("shares").default(0).notNull(),
  comments: integer("comments").default(0).notNull(),
  engagementRate: numeric("engagementRate", { precision: 5, scale: 2 }).default("0"),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
}, (table) => ({
  postPlatformDateIdx: index("post_platform_date_idx").on(table.postId, table.platform, table.recordedAt),
}));

export const generatedContent = pgTable("generated_content", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("userId").notNull(),
  prompt: text("prompt").notNull(),
  content: text("content").notNull(),
  modelId: varchar("modelId", { length: 100 }).notNull(),
  temperature: numeric("temperature", { precision: 3, scale: 2 }).default("0.7"),
  maxTokens: integer("maxTokens").default(1000),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userCreatedIdx: index("user_created_idx").on(table.userId, table.createdAt),
}));

export const aiModels = pgTable("ai_models", {
  id: varchar("id", { length: 100 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 50 }).notNull(),
  description: text("description"),
  costPer1kTokens: numeric("costPer1kTokens", { precision: 8, scale: 6 }).default("0"),
  maxTokens: integer("maxTokens").default(4096),
  isActive: varchar("isActive", { length: 10 }).default("true").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const careerLevels = pgTable("career_levels", {
  id: serial("id").primaryKey(),
  level: integer("level").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  tier: integer("tier").notNull(),
  minXp: integer("minXp").notNull().default(0),
  monthlyXpRequired: integer("monthlyXpRequired").notNull().default(0),
  commissionBonus: integer("commissionBonus").notNull().default(0),
  benefits: text("benefits"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  levelIdx: index("career_level_idx").on(table.level),
  categoryIdx: index("career_category_idx").on(table.category),
}));

export const affiliateXP = pgTable("affiliate_xp", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull().unique(),
  totalXp: integer("totalXp").notNull().default(0),
  currentLevel: integer("currentLevel").notNull().default(1),
  monthlyXp: integer("monthlyXp").notNull().default(0),
  monthlyXpResetAt: timestamp("monthlyXpResetAt"),
  xpHistory: jsonb("xpHistory").$type<Array<{ date: string; amount: number; source: string; description: string }>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("affiliate_xp_affiliate_idx").on(table.affiliateId),
  currentLevelIdx: index("affiliate_xp_level_idx").on(table.currentLevel),
}));

export const xpTransactions = pgTable("xp_transactions", {
  id: varchar("id", { length: 64 }).primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  amount: integer("amount").notNull(),
  source: varchar("source", { length: 30 }).notNull(),
  sourceId: varchar("sourceId", { length: 64 }),
  description: text("description").notNull(),
  xpBefore: integer("xpBefore").notNull(),
  xpAfter: integer("xpAfter").notNull(),
  levelBefore: integer("levelBefore").notNull(),
  levelAfter: integer("levelAfter").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("xp_trans_affiliate_idx").on(table.affiliateId),
  sourceIdx: index("xp_trans_source_idx").on(table.source),
  createdAtIdx: index("xp_trans_date_idx").on(table.createdAt),
}));

export const dashboardMetrics = pgTable("dashboard_metrics", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  totalEarnings: integer("totalEarnings").notNull().default(0),
  pendingCommissions: integer("pendingCommissions").notNull().default(0),
  directReferrals: integer("directReferrals").notNull().default(0),
  networkSize: integer("networkSize").notNull().default(0),
  currentRank: integer("currentRank").notNull().default(1),
  monthlySales: integer("monthlySales").notNull().default(0),
  monthlyRevenue: integer("monthlyRevenue").notNull().default(0),
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("dash_metrics_affiliate_idx").on(table.affiliateId),
}));

export const userConsents = pgTable("user_consents", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  consentType: varchar("consentType", { length: 50 }).notNull(),
  granted: varchar("granted", { length: 10 }).notNull().default("false"),
  grantedAt: timestamp("grantedAt"),
  revokedAt: timestamp("revokedAt"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userConsentTypeIdx: index("user_consent_type_idx").on(table.userId, table.consentType),
  consentTypeGrantedIdx: index("consent_type_granted_idx").on(table.consentType, table.granted),
}));

export const consentHistory = pgTable("consent_history", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  consentType: varchar("consentType", { length: 50 }).notNull(),
  action: varchar("action", { length: 20 }).notNull(),
  previousValue: varchar("previousValue", { length: 10 }),
  newValue: varchar("newValue", { length: 10 }).notNull(),
  reason: text("reason"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userConsentHistoryIdx: index("consent_history_user_idx").on(table.userId),
  consentHistoryDateIdx: index("consent_history_date_idx").on(table.createdAt),
}));

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  language: varchar("language", { length: 10 }).default("pt-BR"),
  timezone: varchar("timezone", { length: 50 }).default("America/Sao_Paulo"),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  emailNotifications: varchar("emailNotifications", { length: 10 }).default("true"),
  pushNotifications: varchar("pushNotifications", { length: 10 }).default("false"),
  theme: varchar("theme", { length: 10 }).default("system"),
  contentDensity: varchar("contentDensity", { length: 20 }).default("comfortable"),
  dashboardLayout: jsonb("dashboardLayout").$type<{ widgets: string[]; positions: Record<string, { x: number; y: number; w: number; h: number }> }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const refreshTokens = pgTable("refresh_tokens", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: integer("userId").notNull(),
  tokenHash: varchar("tokenHash", { length: 128 }).notNull(),
  deviceInfo: text("deviceInfo"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  revokedAt: timestamp("revokedAt"),
  replacedByTokenId: varchar("replacedByTokenId", { length: 64 }),
}, (table) => ({
  userIdIdx: index("refresh_token_user_idx").on(table.userId),
  tokenHashIdx: index("refresh_token_hash_idx").on(table.tokenHash),
  expiresAtIdx: index("refresh_token_expires_idx").on(table.expiresAt),
}));

export const sessionAudit = pgTable("session_audit", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: integer("userId").notNull(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  action: varchar("action", { length: 30 }).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userSessionIdx: index("session_audit_user_idx").on(table.userId),
  sessionActionIdx: index("session_audit_action_idx").on(table.action),
  sessionDateIdx: index("session_audit_date_idx").on(table.createdAt),
}));

// Types
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
export type OrchestrationGoal = typeof orchestrationGoals.$inferSelect;
export type InsertOrchestrationGoal = typeof orchestrationGoals.$inferInsert;
export type JobLog = typeof jobLogs.$inferSelect;
export type InsertJobLog = typeof jobLogs.$inferInsert;
export type OrchestrationTask = typeof orchestrationTasks.$inferSelect;
export type InsertOrchestrationTask = typeof orchestrationTasks.$inferInsert;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = typeof performanceMetrics.$inferInsert;
export type ContentTemplate = typeof contentTemplates.$inferSelect;
export type InsertContentTemplate = typeof contentTemplates.$inferInsert;
export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = typeof scheduledPosts.$inferInsert;
export type ContentAnalytic = typeof contentAnalytics.$inferSelect;
export type InsertContentAnalytic = typeof contentAnalytics.$inferInsert;
export type GeneratedContent = typeof generatedContent.$inferSelect;
export type InsertGeneratedContent = typeof generatedContent.$inferInsert;
export type AIModel = typeof aiModels.$inferSelect;
export type InsertAIModel = typeof aiModels.$inferInsert;
export type CareerLevel = typeof careerLevels.$inferSelect;
export type InsertCareerLevel = typeof careerLevels.$inferInsert;
export type AffiliateXP = typeof affiliateXP.$inferSelect;
export type InsertAffiliateXP = typeof affiliateXP.$inferInsert;
export type XPTransaction = typeof xpTransactions.$inferSelect;
export type InsertXPTransaction = typeof xpTransactions.$inferInsert;
export type DashboardMetric = typeof dashboardMetrics.$inferSelect;
export type InsertDashboardMetric = typeof dashboardMetrics.$inferInsert;
export type UserConsent = typeof userConsents.$inferSelect;
export type InsertUserConsent = typeof userConsents.$inferInsert;
export type ConsentHistory = typeof consentHistory.$inferSelect;
export type InsertConsentHistory = typeof consentHistory.$inferInsert;
export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type InsertRefreshToken = typeof refreshTokens.$inferInsert;
export type SessionAudit = typeof sessionAudit.$inferSelect;
export type InsertSessionAudit = typeof sessionAudit.$inferInsert;
