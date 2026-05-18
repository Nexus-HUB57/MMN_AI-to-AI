import { mysqlTable, int, varchar, text, mysqlEnum, timestamp, index, decimal, json, boolean, bigint } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// =============================================================================
// BEYOUR BANKER - Sistema Financeiro Completo
// =============================================================================

/**
 * Bank Accounts - Contas bancárias cadastradas para PIX e saques
 */
export const bankAccounts = mysqlTable('bank_accounts', {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId").notNull(),
  bankCode: varchar("bankCode", { length: 10 }).notNull(), // Código do banco (ex: 001, 341)
  bankName: varchar("bankName", { length: 100 }).notNull(), // Nome do banco
  accountType: mysqlEnum("accountType", ["checking", "savings"]).notNull().default("checking"),
  agency: varchar("agency", { length: 10 }).notNull(),
  accountNumber: varchar("accountNumber", { length: 20 }).notNull(),
  accountDigit: varchar("accountDigit", { length: 5 }),
  pixKey: varchar("pixKey", { length: 255 }), // Email, CPF, telefone ou chave aleatória
  pixKeyType: mysqlEnum("pixKeyType", ["email", "cpf", "phone", "random"]).default("cpf"),
  holderName: varchar("holderName", { length: 255 }),
  holderDocument: varchar("holderDocument", { length: 20 }), // CPF/CNPJ
  isPrimary: boolean("isPrimary").default(false).notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  verifiedAt: timestamp("verifiedAt"),
  status: mysqlEnum("status", ["active", "inactive", "pending_verification", "rejected"]).default("pending_verification").notNull(),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("bank_accounts_affiliate_idx").on(table.affiliateId),
  pixKeyIdx: index("bank_accounts_pix_idx").on(table.pixKey),
  statusIdx: index("bank_accounts_status_idx").on(table.status),
}));

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = typeof bankAccounts.$inferInsert;

/**
 * Affiliate Balance - Saldo dos afiliados
 */
export const affiliateBalances = mysqlTable('affiliate_balances', {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId").notNull().unique(),
  availableBalance: int("availableBalance").notNull().default(0), // Saldo disponível em centavos
  pendingBalance: int("pendingBalance").notNull().default(0), // Saldo em processamento
  blockedBalance: int("blockedBalance").notNull().default(0), // Saldo bloqueado
  totalEarned: int("totalEarned").notNull().default(0), // Total ganho histórico
  totalWithdrawn: int("totalWithdrawn").notNull().default(0), // Total sacado
  lastWithdrawalAt: timestamp("lastWithdrawalAt"),
  lastUpdatedAt: timestamp("lastUpdatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("balance_affiliate_idx").on(table.affiliateId),
}));

export type AffiliateBalance = typeof affiliateBalances.$inferSelect;
export type InsertAffiliateBalance = typeof affiliateBalances.$inferInsert;

/**
 * Withdrawal Requests - Solicitações de saque
 */
export const withdrawalRequests = mysqlTable('withdrawal_requests', {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId").notNull(),
  bankAccountId: int("bankAccountId").notNull(),
  amount: int("amount").notNull(), // Valor em centavos
  fee: int("fee").notNull().default(0), // Taxa cobrada
  netAmount: int("netAmount").notNull(), // Valor líquido
  status: mysqlEnum("status", ["pending", "approved", "processing", "completed", "rejected", "cancelled"]).default("pending").notNull(),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
  completedAt: timestamp("completedAt"),
  rejectedAt: timestamp("rejectedAt"),
  rejectionReason: text("rejectionReason"),
  approvedBy: int("approvedBy"), // Admin que aprovou
  processedBy: int("processedBy"), // Admin que processou
  transactionId: varchar("transactionId", { length: 100 }), // ID da transação PIX
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("withdrawal_affiliate_idx").on(table.affiliateId),
  statusIdx: index("withdrawal_status_idx").on(table.status),
  requestedAtIdx: index("withdrawal_date_idx").on(table.requestedAt),
}));

export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = typeof withdrawalRequests.$inferInsert;

/**
 * Transaction History - Histórico completo de transações financeiras
 */
export const transactionHistory = mysqlTable('transaction_history', {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId").notNull(),
  type: mysqlEnum("type", [
    "commission",        // Comissão recebida
    "withdrawal",       // Saque realizado
    "deposit",          // Depósito
    "adjustment",       // Ajuste manual (admin)
    "fee",              // Taxa cobrada
    "bonus",            // Bônus
    "refund",           // Estorno
    "transfer_in",      // Transferência recebida
    "transfer_out",     // Transferência enviada
    "blocked",          // Valor bloqueado
    "unblocked"         // Valor desbloqueado
  ]).notNull(),
  amount: int("amount").notNull(), // Valor em centavos (positivo ou negativo)
  balanceBefore: int("balanceBefore").notNull(),
  balanceAfter: int("balanceAfter").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"]).default("completed").notNull(),
  source: varchar("source", { length: 64 }), // 'order', 'payment', 'admin', etc
  sourceId: int("sourceId"), // ID da transação relacionada
  description: text("description"),
  referenceCode: varchar("referenceCode", { length: 100 }), // Código para rastreamento
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("tx_history_affiliate_idx").on(table.affiliateId),
  typeIdx: index("tx_history_type_idx").on(table.type),
  createdAtIdx: index("tx_history_date_idx").on(table.createdAt),
  referenceIdx: index("tx_history_reference_idx").on(table.referenceCode),
}));

export type TransactionHistory = typeof transactionHistory.$inferSelect;
export type InsertTransactionHistory = typeof transactionHistory.$inferInsert;

/**
 * Monthly Reports - Relatórios mensais de earnings
 */
export const monthlyReports = mysqlTable('monthly_reports', {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId").notNull(),
  year: int("year").notNull(),
  month: int("month").notNull(), // 1-12
  totalEarnings: int("totalEarnings").notNull().default(0),
  totalCommissions: int("totalCommissions").notNull().default(0),
  totalBonuses: int("totalBonuses").notNull().default(0),
  totalWithdrawals: int("totalWithdrawals").notNull().default(0),
  totalFees: int("totalFees").notNull().default(0),
  balanceBroughtForward: int("balanceBroughtForward").notNull().default(0),
  balanceCarriedForward: int("balanceCarriedForward").notNull().default(0),
  networkSize: int("networkSize").notNull().default(0),
  directReferrals: int("directReferrals").notNull().default(0),
  totalSales: int("totalSales").notNull().default(0),
  topPerformingLevel: int("topPerformingLevel").notNull().default(0),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  sentAt: timestamp("sentAt"),
  emailStatus: mysqlEnum("emailStatus", ["pending", "sent", "failed"]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  affiliatePeriodIdx: index("report_affiliate_period_idx").on(table.affiliateId, table.year, table.month),
  yearMonthIdx: index("report_year_month_idx").on(table.year, table.month),
}));

export type MonthlyReport = typeof monthlyReports.$inferSelect;
export type InsertMonthlyReport = typeof monthlyReports.$inferInsert;

/**
 * PIX Configuration - Configurações PIX da plataforma
 */
export const pixConfiguration = mysqlTable('pix_configuration', {
  id: int("id").primaryKey().autoincrement(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  isEncrypted: boolean("isEncrypted").default(false).notNull(),
  updatedBy: int("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PIXConfiguration = typeof pixConfiguration.$inferSelect;
export type InsertPIXConfiguration = typeof pixConfiguration.$inferInsert;

// =============================================================================
// POSTS AUTOMATIZADOS - Sistema de Automação Social
// =============================================================================

/**
 * Social Accounts - Contas sociais vinculadas
 */
export const socialAccounts = mysqlTable('social_accounts', {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  platform: mysqlEnum("platform", ["whatsapp", "instagram", "facebook", "telegram", "twitter"]).notNull(),
  accountId: varchar("accountId", { length: 255 }),
  accountName: varchar("accountName", { length: 255 }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  permissions: json("permissions").$type<string[]>(),
  status: mysqlEnum("status", ["active", "inactive", "expired", "error"]).default("active").notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userPlatformIdx: index("social_account_user_platform_idx").on(table.userId, table.platform),
  statusIdx: index("social_account_status_idx").on(table.status),
}));

export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = typeof socialAccounts.$inferInsert;

/**
 * Content Calendar - Calendário de conteúdo
 */
export const contentCalendar = mysqlTable('content_calendar', {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  platforms: json("platforms").$type<string[]>().notNull(),
  scheduledFor: timestamp("scheduledFor").notNull(),
  timezone: varchar("timezone", { length: 50 }).default("America/Sao_Paulo"),
  status: mysqlEnum("status", ["draft", "scheduled", "published", "failed", "cancelled"]).default("draft").notNull(),
  mediaUrls: json("mediaUrls").$type<string[]>(),
  hashtags: json("hashtags").$type<string[]>(),
  mentions: json("mentions").$type<string[]>(),
  linkUrl: text("linkUrl"),
  publishedAt: timestamp("publishedAt"),
  errorMessage: text("errorMessage"),
  engagementMetrics: json("engagementMetrics").$type<{
    views: number;
    likes: number;
    shares: number;
    comments: number;
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userStatusDateIdx: index("calendar_user_status_date_idx").on(table.userId, table.status, table.scheduledFor),
  scheduledForIdx: index("calendar_scheduled_idx").on(table.scheduledFor),
}));

export type ContentCalendar = typeof contentCalendar.$inferSelect;
export type InsertContentCalendar = typeof contentCalendar.$inferInsert;

// =============================================================================
// TRACKING NEURAL - Sistema de Rastreamento de Conversões
// =============================================================================

/**
 * Tracking Links - Links de rastreamento
 */
export const trackingLinks = mysqlTable('tracking_links', {
  id: varchar("id", { length: 36 }).primaryKey(),
  affiliateId: int("affiliateId").notNull(),
  linkType: mysqlEnum("linkType", ["affiliate", "product", "landing", "promo", "social"]).notNull(),
  source: varchar("source", { length: 50 }), // 'whatsapp', 'instagram', 'facebook', 'email', etc
  medium: varchar("medium", { length: 50 }), // 'post', 'story', 'dm', 'link'
  campaign: varchar("campaign", { length: 100 }),
  destinationUrl: text("destinationUrl").notNull(),
  shortCode: varchar("shortCode", { length: 20 }).unique(),
  clickCount: int("clickCount").notNull().default(0),
  uniqueClickCount: int("uniqueClickCount").notNull().default(0),
  conversionCount: int("conversionCount").notNull().default(0),
  conversionRate: decimal("conversionRate", { precision: 5, scale: 2 }).default("0"),
  totalRevenue: int("totalRevenue").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  affiliateIdx: index("tracking_affiliate_idx").on(table.affiliateId),
  shortCodeIdx: index("tracking_shortcode_idx").on(table.shortCode),
  campaignIdx: index("tracking_campaign_idx").on(table.campaign),
}));

export type TrackingLink = typeof trackingLinks.$inferSelect;
export type InsertTrackingLink = typeof trackingLinks.$inferInsert;

/**
 * Conversion Events - Eventos de conversão
 */
export const conversionEvents = mysqlTable('conversion_events', {
  id: varchar("id", { length: 36 }).primaryKey(),
  trackingLinkId: varchar("trackingLinkId", { length: 36 }).notNull(),
  affiliateId: int("affiliateId").notNull(),
  eventType: mysqlEnum("eventType", ["click", "view", "signup", "purchase", "lead"]).notNull(),
  visitorId: varchar("visitorId", { length: 64 }),
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: text("userAgent"),
  referrer: text("referrer"),
  utmData: json("utmData").$type<{
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  }>(),
  device: varchar("device", { length: 20 }), // 'desktop', 'mobile', 'tablet'
  browser: varchar("browser", { length: 50 }),
  country: varchar("country", { length: 10 }),
  city: varchar("city", { length: 100 }),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  trackingLinkIdx: index("conversion_tracking_idx").on(table.trackingLinkId),
  affiliateIdx: index("conversion_affiliate_idx").on(table.affiliateId),
  eventTypeIdx: index("conversion_event_type_idx").on(table.eventType),
  visitorIdx: index("conversion_visitor_idx").on(table.visitorId),
  createdAtIdx: index("conversion_date_idx").on(table.createdAt),
}));

export type ConversionEvent = typeof conversionEvents.$inferSelect;
export type InsertConversionEvent = typeof conversionEvents.$inferInsert;

/**
 * Affiliate Performance - Métricas de performance por afiliado
 */
export const affiliatePerformance = mysqlTable('affiliate_performance', {
  id: int("id").primaryKey().autoincrement(),
  affiliateId: int("affiliateId").notNull(),
  period: mysqlEnum("period", ["daily", "weekly", "monthly"]).notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  totalClicks: int("totalClicks").notNull().default(0),
  uniqueClicks: int("uniqueClicks").notNull().default(0),
  conversions: int("conversions").notNull().default(0),
  conversionRate: decimal("conversionRate", { precision: 5, scale: 2 }).default("0"),
  totalRevenue: int("totalRevenue").notNull().default(0),
  totalCommissions: int("totalCommissions").notNull().default(0),
  topChannel: varchar("topChannel", { length: 50 }),
  topCampaign: varchar("topCampaign", { length: 100 }),
  engagementRate: decimal("engagementRate", { precision: 5, scale: 2 }).default("0"),
  avgOrderValue: int("avgOrderValue").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  affiliatePeriodIdx: index("perf_affiliate_period_idx").on(table.affiliateId, table.period, table.periodStart),
}));

export type AffiliatePerformance = typeof affiliatePerformance.$inferSelect;
export type InsertAffiliatePerformance = typeof affiliatePerformance.$inferInsert;