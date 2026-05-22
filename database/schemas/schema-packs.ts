import { pgTable, serial, integer, varchar, text, timestamp, index, jsonb, boolean, numeric } from "drizzle-orm/pg-core";

export const activationPacks = pgTable("activation_packs", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 20 }).notNull(),
  price: integer("price").notNull().default(0),
  originalPrice: integer("originalPrice").notNull().default(0),
  activationType: varchar("activation_type", { length: 20 }).notNull().default("instant"),
  trialDays: integer("trial_days").default(0),
  status: varchar("status", { length: 20 }).notNull().default("available"),
  benefits: jsonb("benefits").$type<{
    xpBonus: number;
    commissionBonus: number;
    agentSlots: number;
    aiCredits: number;
    features: string[];
    maxNetworkDepth: number;
    accessLevel: string;
  }>(),
  requiresPackId: integer("requires_pack_id"),
  maxPurchases: integer("max_purchases").default(1),
  sortOrder: integer("sort_order").notNull().default(0),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  typeIdx: index("activation_pack_type_idx").on(table.type),
  statusIdx: index("activation_pack_status_idx").on(table.status),
  sortOrderIdx: index("activation_pack_sort_idx").on(table.sortOrder),
}));

export type ActivationPack = typeof activationPacks.$inferSelect;
export type InsertActivationPack = typeof activationPacks.$inferInsert;

export const packActivations = pgTable("pack_activations", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliate_id").notNull(),
  packId: integer("pack_id").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  paymentId: varchar("payment_id", { length: 64 }),
  paymentMethod: varchar("payment_method", { length: 50 }),
  transactionId: varchar("transaction_id", { length: 128 }),
  amountPaid: integer("amount_paid").notNull().default(0),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  activatedAt: timestamp("activated_at"),
  expiresAt: timestamp("expires_at"),
  isRecurring: boolean("is_recurring").default(false),
  billingCycle: varchar("billing_cycle", { length: 20 }).default("monthly"),
  nextBillingDate: timestamp("next_billing_date"),
  autoRenew: boolean("auto_renew").default(true),
  qualifiesForBonuses: boolean("qualifies_for_bonuses").default(false),
  bonusQualificationDate: timestamp("bonus_qualification_date"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("pack_activation_affiliate_idx").on(table.affiliateId),
  packIdIdx: index("pack_activation_pack_idx").on(table.packId),
  statusIdx: index("pack_activation_status_idx").on(table.status),
  expiresAtIdx: index("pack_activation_expires_idx").on(table.expiresAt),
}));

export type PackActivation = typeof packActivations.$inferSelect;
export type InsertPackActivation = typeof packActivations.$inferInsert;

export const packRenewals = pgTable("pack_renewals", {
  id: serial("id").primaryKey(),
  activationId: integer("activation_id").notNull(),
  affiliateId: integer("affiliate_id").notNull(),
  packId: integer("pack_id").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  amount: integer("amount").notNull(),
  paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("pending"),
  paymentDate: timestamp("payment_date"),
  transactionId: varchar("transaction_id", { length: 128 }),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  bonusGranted: boolean("bonus_granted").default(false),
  bonusAmount: integer("bonus_amount").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  activationIdIdx: index("pack_renewal_activation_idx").on(table.activationId),
  affiliateIdIdx: index("pack_renewal_affiliate_idx").on(table.affiliateId),
}));

export type PackRenewal = typeof packRenewals.$inferSelect;
export type InsertPackRenewal = typeof packRenewals.$inferInsert;

export const packFeatures = pgTable("pack_features", {
  id: serial("id").primaryKey(),
  activationId: integer("activation_id").notNull(),
  affiliateId: integer("affiliate_id").notNull(),
  packId: integer("pack_id").notNull(),
  featureCode: varchar("feature_code", { length: 100 }).notNull(),
  featureName: varchar("feature_name", { length: 255 }).notNull(),
  featureType: varchar("feature_type", { length: 20 }).notNull(),
  isEnabled: boolean("is_enabled").default(true),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  affiliateIdIdx: index("pack_feature_affiliate_idx").on(table.affiliateId),
  featureCodeIdx: index("pack_feature_code_idx").on(table.featureCode),
}));

export type PackFeature = typeof packFeatures.$inferSelect;
export type InsertPackFeature = typeof packFeatures.$inferInsert;
