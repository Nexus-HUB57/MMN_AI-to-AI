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
  // Campos Legados para Migração
  legacyId: int("legacyId"),
  legacyPassword: text("legacyPassword"), // Senha hash MD5 do PHP
  cpf: varchar("cpf", { length: 100 }),
  phone: varchar("phone", { length: 50 }),
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
  // Campos Legados para Migração
  legacyStatus: varchar("legacyStatus", { length: 50 }),
  expirationDate: timestamp("expirationDate"),
  points: int("points").default(0),
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

export const packs = mysqlTable("packs", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 128 }).notNull(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 256 }),
  price: int("price").notNull(),
  originalPrice: int("originalPrice"),
  category: varchar("category", { length: 64 }).notNull(),
  features: text("features"),
  badge: varchar("badge", { length: 64 }),
  iconEmoji: varchar("iconEmoji", { length: 8 }),
  status: mysqlEnum("status", ["active", "inactive", "coming_soon"]).notNull().default("active"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").notNull().default(sql`(now())`),
  updatedAt: timestamp("updatedAt").notNull().default(sql`(now())`).onUpdateNow(),
});

export const agentPacks = mysqlTable("agent_packs", {
  id: int("id").primaryKey().autoincrement(),
  agentId: int("agentId").notNull(),
  packId: int("packId").notNull(),
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
export type InsertUpgrade = typeof upgrades.$inferInsert;
export type AgentUpgrade = typeof agentUpgrades.$inferSelect;
export type InsertAgentUpgrade = typeof agentUpgrades.$inferInsert;
export type Pack = typeof packs.$inferSelect;
export type InsertPack = typeof packs.$inferInsert;
export type AgentPack = typeof agentPacks.$inferSelect;
export type InsertAgentPack = typeof agentPacks.$inferInsert;
export type Bonus = typeof bonuses.$inferSelect;
export type InsertBonus = typeof bonuses.$inferInsert;
export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;

// Tabela para histórico de metas de orquestração
export const orchestrationGoals = mysqlTable('orchestration_goals', {
  id: varchar('id', { length: 64 }).primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  priority: mysqlEnum('priority', ['low', 'medium', 'high']).notNull(),
  status: mysqlEnum('status', ['pending', 'executing', 'completed', 'failed']).notNull(),
  targetMetrics: text('targetMetrics'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type OrchestrationGoal = typeof orchestrationGoals.$inferSelect;
export type InsertOrchestrationGoal = typeof orchestrationGoals.$inferInsert;

// Tabela para logs de execução de jobs
export const jobLogs = mysqlTable('job_logs', {
  id: varchar('id', { length: 64 }).primaryKey(),
  jobId: varchar('jobId', { length: 64 }).notNull(),
  queueName: varchar('queueName', { length: 64 }).notNull(),
  jobType: varchar('jobType', { length: 64 }).notNull(),
  status: mysqlEnum('status', ['pending', 'processing', 'completed', 'failed']).notNull(),
  input: text('input'),
  output: text('output'),
  error: text('error'),
  startedAt: timestamp('startedAt'),
  completedAt: timestamp('completedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type JobLog = typeof jobLogs.$inferSelect;
export type InsertJobLog = typeof jobLogs.$inferInsert;

// Tabela para tarefas de orquestração
export const orchestrationTasks = mysqlTable('orchestration_tasks', {
  id: varchar('id', { length: 64 }).primaryKey(),
  goalId: varchar('goalId', { length: 64 }).notNull(),
  taskId: varchar('taskId', { length: 64 }).notNull(),
  type: mysqlEnum('type', ['content_generation', 'marketplace_sync', 'order_processing', 'commission_processing']).notNull(),
  description: text('description').notNull(),
  parameters: text('parameters'),
  status: mysqlEnum('status', ['pending', 'dispatched', 'completed', 'failed']).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  dispatchedAt: timestamp('dispatchedAt'),
  completedAt: timestamp('completedAt'),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type OrchestrationTask = typeof orchestrationTasks.$inferSelect;
export type InsertOrchestrationTask = typeof orchestrationTasks.$inferInsert;

// Tabela para métricas de desempenho
export const performanceMetrics = mysqlTable('performance_metrics', {
  id: varchar('id', { length: 64 }).primaryKey(),
  queueName: varchar('queueName', { length: 64 }).notNull(),
  totalJobs: int('totalJobs').default(0).notNull(),
  successfulJobs: int('successfulJobs').default(0).notNull(),
  failedJobs: int('failedJobs').default(0).notNull(),
  averageExecutionTime: int('averageExecutionTime').default(0).notNull(),
          successRate: varchar('successRate', { length: 10 }).default('0%').notNull(),
          timestamp: timestamp('timestamp').defaultNow().notNull(),
        });

export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type InsertPerformanceMetric = typeof performanceMetrics.$inferInsert;

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
  categoryIdx: index("category_idx").on(table.category), // Novo índice para busca por categoria
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
  scheduledForIdx: index("scheduled_for_idx").on(table.scheduledFor), // Novo índice para o worker de publicação
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

// =============================================================================
// XP E CARREIRAS (PD/SCC)
// =============================================================================

/**
 * Career Levels - Níveis de carreira do sistema PD/SCC
 * 27 níveis organizados em 5 categorias
 */
export const careerLevels = mysqlTable('career_levels', {
  id: int("id").primaryKey().autoincrement(),
  level: int("level").notNull(), // 1-27
  name: varchar("name", { length: 100 }).notNull(),
  category: mysqlEnum("category", ["affiliado", "preditivo", "generativo", "orquestrador", "ia_agentica"]).notNull(),
  tier: int("tier").notNull(), // 1, 2 ou 3 dentro da categoria
  minXp: int("minXp").notNull().default(0), // XP mínimo para atingir
  monthlyXpRequired: int("monthlyXpRequired").notNull().default(0), // XP mensal necessário
  commissionBonus: int("commissionBonus").notNull().default(0), // Bônus percentual
  benefits: text("benefits"), // Benefícios do nível
  icon: varchar("icon", { length: 50 }), // Ícone do nível
  color: varchar("color", { length: 20 }), // Cor do badge
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  levelIdx: index("career_level_idx").on(table.level),
  categoryIdx: index("career_category_idx").on(table.category),
}));

export type CareerLevel = typeof careerLevels.$inferSelect;
export type InsertCareerLevel = typeof careerLevels.$inferInsert;

/**
 * Affiliate XP - Pontos de experiência dos afiliados
 */
export const affiliateXP = mysqlTable('affiliate_xp', {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId").notNull().unique(),
  totalXp: int("totalXp").notNull().default(0), // XP total acumulado
  currentLevel: int("currentLevel").notNull().default(1), // Nível atual
  monthlyXp: int("monthlyXp").notNull().default(0), // XP do mês atual
  monthlyXpResetAt: timestamp("monthlyXpResetAt"), // Data do último reset mensal
  xpHistory: json("xpHistory").$type<Array<{
    date: string;
    amount: number;
    source: string;
    description: string;
  }>>(), // Histórico de XP
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("affiliate_xp_affiliate_idx").on(table.affiliateId),
  currentLevelIdx: index("affiliate_xp_level_idx").on(table.currentLevel),
}));

export type AffiliateXP = typeof affiliateXP.$inferSelect;
export type InsertAffiliateXP = typeof affiliateXP.$inferInsert;

/**
 * XP Transactions - Transações de XP (ganhos e perdas)
 */
export const xpTransactions = mysqlTable('xp_transactions', {
  id: varchar("id", { length: 64 }).primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  amount: int("amount").notNull(), // Positivo ou negativo
  source: mysqlEnum("source", ["sale", "commission", "bonus", "network", "challenge", "penalty"]).notNull(),
  sourceId: varchar("sourceId", { length: 64 }), // ID da transação relacionada
  description: text("description").notNull(),
  xpBefore: int("xpBefore").notNull(), // XP antes da transação
  xpAfter: int("xpAfter").notNull(), // XP depois da transação
  levelBefore: int("levelBefore").notNull(), // Nível antes
  levelAfter: int("levelAfter").notNull(), // Nível depois
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("xp_trans_affiliate_idx").on(table.affiliateId),
  sourceIdx: index("xp_trans_source_idx").on(table.source),
  createdAtIdx: index("xp_trans_date_idx").on(table.createdAt),
}));

export type XPTransaction = typeof xpTransactions.$inferSelect;
export type InsertXPTransaction = typeof xpTransactions.$inferInsert;

/**
 * Dashboard Metrics - Métricas do dashboard
 */
export const dashboardMetrics = mysqlTable('dashboard_metrics', {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId").notNull(),
  totalEarnings: int("totalEarnings").notNull().default(0),
  pendingCommissions: int("pendingCommissions").notNull().default(0),
  directReferrals: int("directReferrals").notNull().default(0),
  networkSize: int("networkSize").notNull().default(0),
  currentRank: int("currentRank").notNull().default(1),
  monthlySales: int("monthlySales").notNull().default(0),
  monthlyRevenue: int("monthlyRevenue").notNull().default(0),
  lastUpdated: timestamp("lastUpdated").defaultNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("dash_metrics_affiliate_idx").on(table.affiliateId),
}));

export type DashboardMetric = typeof dashboardMetrics.$inferSelect;
export type InsertDashboardMetric = typeof dashboardMetrics.$inferInsert;

// =============================================================================
// GDPR CONSENT & USER PREFERENCES (AG-38)
// =============================================================================

/**
 * User Consents - Armazena consentimentos GDPR dos usuários
 * Implementação para AG-38: Sistema de consentimento opt-in/opt-out
 */
export const userConsents = mysqlTable('user_consents', {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  consentType: mysqlEnum("consentType", [
    "marketing_email",      // Emails de marketing
    "marketing_sms",         // SMS de marketing
    "marketing_whatsapp",    // WhatsApp marketing
    "analytics",             // Analytics e rastreamento
    "personalization",       // Personalização de conteúdo
    "third_party_sharing",   // Compartilhamento com terceiros
    "data_processing",       // Processamento de dados gerais
    "ai_processing"          // Processamento por IA/ML
  ]).notNull(),
  granted: mysqlEnum("granted", ["true", "false"]).notNull().default("false"),
  grantedAt: timestamp("grantedAt"),
  revokedAt: timestamp("revokedAt"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userConsentTypeIdx: index("user_consent_type_idx").on(table.userId, table.consentType),
  consentTypeGrantedIdx: index("consent_type_granted_idx").on(table.consentType, table.granted),
}));

export type UserConsent = typeof userConsents.$inferSelect;
export type InsertUserConsent = typeof userConsents.$inferInsert;

/**
 * Consent History - Histórico de alterações de consentimento
 */
export const consentHistory = mysqlTable('consent_history', {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  consentType: varchar("consentType", { length: 50 }).notNull(),
  action: mysqlEnum("action", ["granted", "revoked", "updated"]).notNull(),
  previousValue: mysqlEnum("previousValue", ["true", "false", "null"]),
  newValue: mysqlEnum("newValue", ["true", "false"]).notNull(),
  reason: text("reason"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userConsentHistoryIdx: index("consent_history_user_idx").on(table.userId),
  consentHistoryDateIdx: index("consent_history_date_idx").on(table.createdAt),
}));

export type ConsentHistory = typeof consentHistory.$inferSelect;
export type InsertConsentHistory = typeof consentHistory.$inferInsert;

/**
 * User Preferences - Preferências gerais do usuário
 */
export const userPreferences = mysqlTable('user_preferences', {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull().unique(),
  language: varchar("language", { length: 10 }).default("pt-BR"),
  timezone: varchar("timezone", { length: 50 }).default("America/Sao_Paulo"),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  emailNotifications: mysqlEnum("emailNotifications", ["true", "false"]).default("true"),
  pushNotifications: mysqlEnum("pushNotifications", ["true", "false"]).default("false"),
  theme: mysqlEnum("theme", ["light", "dark", "system"]).default("system"),
  contentDensity: mysqlEnum("contentDensity", ["compact", "comfortable", "spacious"]).default("comfortable"),
  dashboardLayout: json("dashboardLayout").$type<{
    widgets: string[];
    positions: Record<string, { x: number; y: number; w: number; h: number }>;
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Refresh Tokens - Tokens de atualização para autenticação (AG-16)
 */
export const refreshTokens = mysqlTable('refresh_tokens', {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
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

export type RefreshToken = typeof refreshTokens.$inferSelect;
export type InsertRefreshToken = typeof refreshTokens.$inferInsert;

/**
 * Session Audit - Auditoria de sessões de usuário
 */
export const sessionAudit = mysqlTable('session_audit', {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: int("userId").notNull(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  action: mysqlEnum("action", [
    "login", "logout", "token_refresh", "password_change",
    "mfa_enabled", "mfa_disabled", "session_revoked", "suspicious_activity"
  ]).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userSessionIdx: index("session_audit_user_idx").on(table.userId),
  sessionActionIdx: index("session_audit_action_idx").on(table.action),
  sessionDateIdx: index("session_audit_date_idx").on(table.createdAt),
}));

export type SessionAudit = typeof sessionAudit.$inferSelect;
export type InsertSessionAudit = typeof sessionAudit.$inferInsert;
