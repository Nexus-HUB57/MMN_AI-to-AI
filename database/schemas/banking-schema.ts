import { pgTable, serial, integer, varchar, text, timestamp, index, numeric, jsonb, boolean, bigint } from "drizzle-orm/pg-core";

export const bankAccounts = pgTable("bank_accounts", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  bankCode: varchar("bankCode", { length: 10 }).notNull(),
  bankName: varchar("bankName", { length: 100 }).notNull(),
  accountType: varchar("accountType", { length: 20 }).notNull().default("checking"),
  agency: varchar("agency", { length: 10 }).notNull(),
  accountNumber: varchar("accountNumber", { length: 20 }).notNull(),
  accountDigit: varchar("accountDigit", { length: 5 }),
  pixKey: varchar("pixKey", { length: 255 }),
  pixKeyType: varchar("pixKeyType", { length: 20 }).default("cpf"),
  holderName: varchar("holderName", { length: 255 }),
  holderDocument: varchar("holderDocument", { length: 20 }),
  isPrimary: boolean("isPrimary").default(false).notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  verifiedAt: timestamp("verifiedAt"),
  status: varchar("status", { length: 30 }).default("pending_verification").notNull(),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("bank_accounts_affiliate_idx").on(table.affiliateId),
  pixKeyIdx: index("bank_accounts_pix_idx").on(table.pixKey),
  statusIdx: index("bank_accounts_status_idx").on(table.status),
}));

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = typeof bankAccounts.$inferInsert;

export const affiliateBalances = pgTable("affiliate_balances", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull().unique(),
  availableBalance: integer("availableBalance").notNull().default(0),
  pendingBalance: integer("pendingBalance").notNull().default(0),
  blockedBalance: integer("blockedBalance").notNull().default(0),
  totalEarned: integer("totalEarned").notNull().default(0),
  totalWithdrawn: integer("totalWithdrawn").notNull().default(0),
  lastWithdrawalAt: timestamp("lastWithdrawalAt"),
  lastUpdatedAt: timestamp("lastUpdatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("balance_affiliate_idx").on(table.affiliateId),
}));

export type AffiliateBalance = typeof affiliateBalances.$inferSelect;
export type InsertAffiliateBalance = typeof affiliateBalances.$inferInsert;

export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  bankAccountId: integer("bankAccountId").notNull(),
  amount: integer("amount").notNull(),
  fee: integer("fee").notNull().default(0),
  netAmount: integer("netAmount").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
  completedAt: timestamp("completedAt"),
  rejectedAt: timestamp("rejectedAt"),
  rejectionReason: text("rejectionReason"),
  approvedBy: integer("approvedBy"),
  processedBy: integer("processedBy"),
  transactionId: varchar("transactionId", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("withdrawal_affiliate_idx").on(table.affiliateId),
  statusIdx: index("withdrawal_status_idx").on(table.status),
  requestedAtIdx: index("withdrawal_date_idx").on(table.requestedAt),
}));

export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = typeof withdrawalRequests.$inferInsert;

export const transactionHistory = pgTable("transaction_history", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  amount: integer("amount").notNull(),
  balanceBefore: integer("balanceBefore").notNull(),
  balanceAfter: integer("balanceAfter").notNull(),
  status: varchar("status", { length: 20 }).default("completed").notNull(),
  source: varchar("source", { length: 64 }),
  sourceId: integer("sourceId"),
  description: text("description"),
  referenceCode: varchar("referenceCode", { length: 100 }),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("tx_history_affiliate_idx").on(table.affiliateId),
  typeIdx: index("tx_history_type_idx").on(table.type),
  createdAtIdx: index("tx_history_date_idx").on(table.createdAt),
  referenceIdx: index("tx_history_reference_idx").on(table.referenceCode),
}));

export type TransactionHistory = typeof transactionHistory.$inferSelect;
export type InsertTransactionHistory = typeof transactionHistory.$inferInsert;

export const monthlyReports = pgTable("monthly_reports", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  totalEarnings: integer("totalEarnings").notNull().default(0),
  totalCommissions: integer("totalCommissions").notNull().default(0),
  totalBonuses: integer("totalBonuses").notNull().default(0),
  totalWithdrawals: integer("totalWithdrawals").notNull().default(0),
  totalFees: integer("totalFees").notNull().default(0),
  balanceBroughtForward: integer("balanceBroughtForward").notNull().default(0),
  balanceCarriedForward: integer("balanceCarriedForward").notNull().default(0),
  networkSize: integer("networkSize").notNull().default(0),
  directReferrals: integer("directReferrals").notNull().default(0),
  totalSales: integer("totalSales").notNull().default(0),
  topPerformingLevel: integer("topPerformingLevel").notNull().default(0),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
  sentAt: timestamp("sentAt"),
  emailStatus: varchar("emailStatus", { length: 10 }).default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  affiliatePeriodIdx: index("report_affiliate_period_idx").on(table.affiliateId, table.year, table.month),
  yearMonthIdx: index("report_year_month_idx").on(table.year, table.month),
}));

export type MonthlyReport = typeof monthlyReports.$inferSelect;
export type InsertMonthlyReport = typeof monthlyReports.$inferInsert;

export const pixConfiguration = pgTable("pix_configuration", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  isEncrypted: boolean("isEncrypted").default(false).notNull(),
  updatedBy: integer("updatedBy"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PIXConfiguration = typeof pixConfiguration.$inferSelect;
export type InsertPIXConfiguration = typeof pixConfiguration.$inferInsert;

export const socialAccounts = pgTable("social_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  platform: varchar("platform", { length: 20 }).notNull(),
  accountId: varchar("accountId", { length: 255 }),
  accountName: varchar("accountName", { length: 255 }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  permissions: jsonb("permissions").$type<string[]>(),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userPlatformIdx: index("social_account_user_platform_idx").on(table.userId, table.platform),
  statusIdx: index("social_account_status_idx").on(table.status),
}));

export type SocialAccount = typeof socialAccounts.$inferSelect;
export type InsertSocialAccount = typeof socialAccounts.$inferInsert;

export const contentCalendar = pgTable("content_calendar", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  platforms: jsonb("platforms").$type<string[]>().notNull(),
  scheduledFor: timestamp("scheduledFor").notNull(),
  timezone: varchar("timezone", { length: 50 }).default("America/Sao_Paulo"),
  status: varchar("status", { length: 20 }).default("draft").notNull(),
  mediaUrls: jsonb("mediaUrls").$type<string[]>(),
  hashtags: jsonb("hashtags").$type<string[]>(),
  mentions: jsonb("mentions").$type<string[]>(),
  linkUrl: text("linkUrl"),
  publishedAt: timestamp("publishedAt"),
  errorMessage: text("errorMessage"),
  engagementMetrics: jsonb("engagementMetrics").$type<{ views: number; likes: number; shares: number; comments: number }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userStatusDateIdx: index("calendar_user_status_date_idx").on(table.userId, table.status, table.scheduledFor),
  scheduledForIdx: index("calendar_scheduled_idx").on(table.scheduledFor),
}));

export type ContentCalendar = typeof contentCalendar.$inferSelect;
export type InsertContentCalendar = typeof contentCalendar.$inferInsert;

export const trackingLinks = pgTable("tracking_links", {
  id: varchar("id", { length: 36 }).primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  linkType: varchar("linkType", { length: 20 }).notNull(),
  source: varchar("source", { length: 50 }),
  medium: varchar("medium", { length: 50 }),
  campaign: varchar("campaign", { length: 100 }),
  destinationUrl: text("destinationUrl").notNull(),
  shortCode: varchar("shortCode", { length: 20 }).unique(),
  clickCount: integer("clickCount").notNull().default(0),
  uniqueClickCount: integer("uniqueClickCount").notNull().default(0),
  conversionCount: integer("conversionCount").notNull().default(0),
  conversionRate: numeric("conversionRate", { precision: 5, scale: 2 }).default("0"),
  totalRevenue: integer("totalRevenue").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  affiliateIdx: index("tracking_affiliate_idx").on(table.affiliateId),
  shortCodeIdx: index("tracking_shortcode_idx").on(table.shortCode),
  campaignIdx: index("tracking_campaign_idx").on(table.campaign),
}));

export type TrackingLink = typeof trackingLinks.$inferSelect;
export type InsertTrackingLink = typeof trackingLinks.$inferInsert;

export const conversionEvents = pgTable("conversion_events", {
  id: varchar("id", { length: 36 }).primaryKey(),
  trackingLinkId: varchar("trackingLinkId", { length: 36 }).notNull(),
  affiliateId: integer("affiliateId").notNull(),
  eventType: varchar("eventType", { length: 20 }).notNull(),
  visitorId: varchar("visitorId", { length: 64 }),
  ipAddress: varchar("ipAddress", { length: 50 }),
  userAgent: text("userAgent"),
  referrer: text("referrer"),
  utmData: jsonb("utmData").$type<{ source?: string; medium?: string; campaign?: string; term?: string; content?: string }>(),
  device: varchar("device", { length: 20 }),
  browser: varchar("browser", { length: 50 }),
  country: varchar("country", { length: 10 }),
  city: varchar("city", { length: 100 }),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
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

export const affiliatePerformance = pgTable("affiliate_performance", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  period: varchar("period", { length: 10 }).notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  totalClicks: integer("totalClicks").notNull().default(0),
  uniqueClicks: integer("uniqueClicks").notNull().default(0),
  conversions: integer("conversions").notNull().default(0),
  conversionRate: numeric("conversionRate", { precision: 5, scale: 2 }).default("0"),
  totalRevenue: integer("totalRevenue").notNull().default(0),
  totalCommissions: integer("totalCommissions").notNull().default(0),
  topChannel: varchar("topChannel", { length: 50 }),
  topCampaign: varchar("topCampaign", { length: 100 }),
  engagementRate: numeric("engagementRate", { precision: 5, scale: 2 }).default("0"),
  avgOrderValue: integer("avgOrderValue").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  affiliatePeriodIdx: index("perf_affiliate_period_idx").on(table.affiliateId, table.period, table.periodStart),
}));

export type AffiliatePerformance = typeof affiliatePerformance.$inferSelect;
export type InsertAffiliatePerformance = typeof affiliatePerformance.$inferInsert;
