/**
 * Nexus Partners Pack - Database Schema
 * Sistema de Gestão de Parceiros Estratégicos
 * Versão: 1.0.0 - 2026-06-01
 */

import { pgTable, serial, integer, varchar, text, timestamp, jsonb, boolean, index, numeric, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ============================================================================
// TABELAS DE PARCEIROS
// ============================================================================

/**
 * Tabela de parceiros estratégicos
 * Gerencia o cadastro e status dos parceiros MMN
 */
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  tier: varchar("tier", { length: 20 }).notNull().default("silver"),
  referralCode: varchar("referral_code", { length: 50 }).notNull().unique(),
  referralCount: integer("referral_count").notNull().default(0),
  totalVolume: numeric("total_volume", { precision: 15, scale: 2 }).notNull().default(0),
  commissionBalance: numeric("commission_balance", { precision: 15, scale: 2 }).notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  benefits: jsonb("benefits").$type<string[]>().default([]),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  tierIdx: index("partner_tier_idx").on(table.tier),
  statusIdx: index("partner_status_idx").on(table.status),
  userIdIdx: index("partner_user_id_idx").on(table.userId),
}));

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

/**
 * Tabela de parcerias
 * Gerencia os acordos de parceria entre parceiros
 */
export const partnerships = pgTable("partnerships", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  partnerName: varchar("partner_name", { length: 255 }).notNull(),
  partnerEmail: varchar("partner_email", { length: 320 }),
  partnerCompany: varchar("partner_company", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull().default(0.05),
  benefits: jsonb("benefits").$type<string[]>().default([]),
  notes: text("notes"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  approvedBy: integer("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  partnerIdIdx: index("partnership_partner_id_idx").on(table.partnerId),
  statusIdx: index("partnership_status_idx").on(table.status),
}));

export type Partnership = typeof partnerships.$inferSelect;
export type InsertPartnership = typeof partnerships.$inferInsert;

/**
 * Tabela de configurações de tiers de parceiros
 */
export const partnerTierConfigs = pgTable("partner_tier_configs", {
  id: serial("id").primaryKey(),
  tier: varchar("tier", { length: 20 }).notNull().unique(),
  minVolume: numeric("min_volume", { precision: 15, scale: 2 }).notNull().default(0),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull().default(0.05),
  maxReferrals: integer("max_referrals"),
  benefits: jsonb("benefits").$type<string[]>().default([]),
  features: jsonb("features").$type<string[]>().default([]),
  color: varchar("color", { length: 20 }),
  icon: varchar("icon", { length: 50 }),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type PartnerTierConfig = typeof partnerTierConfigs.$inferSelect;
export type InsertPartnerTierConfig = typeof partnerTierConfigs.$inferInsert;

/**
 * Tabela de métricas de parceiros
 */
export const partnerMetrics = pgTable("partner_metrics", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  period: varchar("period", { length: 20 }).notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  newReferrals: integer("new_referrals").notNull().default(0),
  totalSales: numeric("total_sales", { precision: 15, scale: 2 }).notNull().default(0),
  commissionEarned: numeric("commission_earned", { precision: 15, scale: 2 }).notNull().default(0),
  conversionRate: numeric("conversion_rate", { precision: 5, scale: 2 }).notNull().default(0),
  activePartners: integer("active_partners").notNull().default(0),
  nps: integer("nps"),
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  partnerIdIdx: index("partner_metrics_partner_id_idx").on(table.partnerId),
  periodIdx: index("partner_metrics_period_idx").on(table.period),
}));

export type PartnerMetric = typeof partnerMetrics.$inferSelect;
export type InsertPartnerMetric = typeof partnerMetrics.$inferInsert;

/**
 * Tabela de benefícios de parceiros
 */
export const partnerBenefits = pgTable("partner_benefits", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  benefitCode: varchar("benefit_code", { length: 100 }).notNull(),
  benefitName: varchar("benefit_name", { length: 255 }).notNull(),
  benefitType: varchar("benefit_type", { length: 50 }).notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").notNull().default(0),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  partnerIdIdx: index("partner_benefit_partner_id_idx").on(table.partnerId),
  benefitCodeIdx: index("partner_benefit_code_idx").on(table.benefitCode),
}));

export type PartnerBenefit = typeof partnerBenefits.$inferSelect;
export type InsertPartnerBenefit = typeof partnerBenefits.$inferInsert;

/**
 * Tabela de histórico de volume de parceiros
 */
export const partnerVolumeHistory = pgTable("partner_volume_history", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").notNull(),
  volume: numeric("volume", { precision: 15, scale: 2 }).notNull(),
  volumeType: varchar("volume_type", { length: 50 }).notNull(),
  source: varchar("source", { length: 100 }),
  sourceId: integer("source_id"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  partnerIdIdx: index("partner_volume_partner_id_idx").on(table.partnerId),
  createdAtIdx: index("partner_volume_created_idx").on(table.createdAt),
}));

export type PartnerVolumeHistory = typeof partnerVolumeHistory.$inferSelect;
export type InsertPartnerVolumeHistory = typeof partnerVolumeHistory.$inferInsert;

// ============================================================================
// ALGORITMOS DE CRESCIMENTO EXPONENCIAL
// ============================================================================

/**
 * Configurações de algoritmos de crescimento
 */
export const growthAlgorithms = pgTable("growth_algorithms", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  type: varchar("type", { length: 50 }).notNull(),
  baseMultiplier: numeric("base_multiplier", { precision: 10, scale: 4 }).notNull().default(1.0),
  exponentialFactor: numeric("exponential_factor", { precision: 10, scale: 4 }).notNull().default(1.0),
  maxMultiplier: numeric("max_multiplier", { precision: 10, scale: 4 }).notNull().default(10.0),
  conditions: jsonb("conditions").$type<{
    minVolume: number;
    minReferrals: number;
    tierRequirements: string[];
  }>(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type GrowthAlgorithm = typeof growthAlgorithms.$inferSelect;
export type InsertGrowthAlgorithm = typeof growthAlgorithms.$inferInsert;

/**
 * Histórico de execuções de algoritmos
 */
export const algorithmExecutions = pgTable("algorithm_executions", {
  id: serial("id").primaryKey(),
  algorithmId: integer("algorithm_id").notNull(),
  partnerId: integer("partner_id"),
  inputData: jsonb("input_data").$type<Record<string, any>>(),
  outputData: jsonb("output_data").$type<Record<string, any>>(),
  executionTime: integer("execution_time_ms"),
  status: varchar("status", { length: 20 }).notNull().default("success"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  algorithmIdIdx: index("algo_exec_algorithm_idx").on(table.algorithmId),
  partnerIdIdx: index("algo_exec_partner_idx").on(table.partnerId),
}));

export type AlgorithmExecution = typeof algorithmExecutions.$inferSelect;
export type InsertAlgorithmExecution = typeof algorithmExecutions.$inferInsert;

// ============================================================================
// TIPOS E INTERFACES AUXILIARES
// ============================================================================

export type PartnerTier = 'silver' | 'gold' | 'platinum' | 'diamond';
export type PartnershipStatus = 'pending' | 'active' | 'suspended' | 'terminated';
export type GrowthAlgorithmType = 'referral' | 'volume' | 'network' | 'retention';

export interface PartnerWithMetrics extends Partner {
  monthlyVolume: number;
  monthlyReferrals: number;
  conversionRate: number;
  lastActivity: Date;
  tierProgress: number;
}

export interface PartnershipWithDetails extends Partnership {
  partner?: Partner;
  metrics?: PartnerMetric;
}

/**
 * Constantes de configuração de tiers
 */
export const TIER_CONFIG = {
  silver: {
    minVolume: 0,
    commissionRate: 0.05,
    maxReferrals: 50,
    color: '#C0C0C0',
    icon: 'shield',
  },
  gold: {
    minVolume: 5000,
    commissionRate: 0.08,
    maxReferrals: 200,
    color: '#FFD700',
    icon: 'star',
  },
  platinum: {
    minVolume: 20000,
    commissionRate: 0.12,
    maxReferrals: 500,
    color: '#E5E4E2',
    icon: 'crown',
  },
  diamond: {
    minVolume: 100000,
    commissionRate: 0.15,
    maxReferrals: null,
    color: '#B9F2FF',
    icon: 'diamond',
  },
} as const;

/**
 * Benefícios por tier
 */
export const TIER_BENEFITS = {
  silver: [
    'dashboard_basic',
    'reports_weekly',
    'email_support',
  ],
  gold: [
    'dashboard_advanced',
    'reports_daily',
    'priority_support',
    'marketing_materials',
  ],
  platinum: [
    'dashboard_advanced',
    'reports_realtime',
    'priority_support',
    'marketing_materials',
    'api_access',
    'custom_integrations',
  ],
  diamond: [
    'all_features',
    'dedicated_account_manager',
    'custom_reporting',
    'early_access',
    'beta_features',
    'volume_discounts',
  ],
} as const;