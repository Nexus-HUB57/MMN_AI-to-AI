/**
 * White-Label Domain - Schema
 *
 * Schema for multi-tenant white-label branding and configuration.
 * Supports custom themes, logos, colors, and domain configurations per tenant.
 */

import { mysqlTable, varchar, text, json, boolean, timestamp, int, decimal } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Tenants table - Core tenant configuration
export const tenants = mysqlTable('tenants', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('active'),

  // Plan and licensing
  plan: varchar('plan', { length: 50 }).notNull().default('starter'),
  licenseKey: varchar('license_key', { length: 255 }),
  licenseExpiresAt: timestamp('license_expires_at'),

  // Contact and billing
  contactEmail: varchar('contact_email', { length: 255 }),
  billingEmail: varchar('billing_email', { length: 255 }),
  billingAddress: text('billing_address'),

  // Settings
  settings: json('settings').$type<TenantSettings>(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Tenant branding configurations
export const tenantBranding = mysqlTable('tenant_branding', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 36 }).notNull(),

  // Logo configurations
  logoUrl: varchar('logo_url', { length: 500 }),
  logoAlt: varchar('logo_alt', { length: 255 }),
  faviconUrl: varchar('favicon_url', { length: 500 }),

  // Color scheme
  primaryColor: varchar('primary_color', { length: 7 }).default('#6366f1'),
  secondaryColor: varchar('secondary_color', { length: 7 }).default('#8b5cf6'),
  accentColor: varchar('accent_color', { length: 7 }).default('#06b6d4'),
  backgroundColor: varchar('background_color', { length: 7 }).default('#ffffff'),
  textColor: varchar('text_color', { length: 7 }).default('#1f2937'),

  // Typography
  fontFamily: varchar('font_family', { length: 255 }).default('Inter, sans-serif'),
  headingFontFamily: varchar('heading_font_family', { length: 255 }),

  // Custom CSS
  customCss: text('custom_css'),
  customHeadScripts: text('custom_head_scripts'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Custom domains per tenant
export const tenantDomains = mysqlTable('tenant_domains', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 36 }).notNull(),
  domain: varchar('domain', { length: 255 }).notNull().unique(),
  isPrimary: boolean('is_primary').default(false),
  isVerified: boolean('is_verified').default(false),
  verificationCode: varchar('verification_code', { length: 100 }),
  sslEnabled: boolean('ssl_enabled').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tenant features configuration
export const tenantFeatures = mysqlTable('tenant_features', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 36 }).notNull(),
  feature: varchar('feature', { length: 100 }).notNull(),
  enabled: boolean('enabled').default(true),
  limit: int('limit'),
  used: int('used').default(0),
  resetAt: timestamp('reset_at'),
});

// Tenant API keys
export const tenantApiKeys = mysqlTable('tenant_api_keys', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 36 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  apiKey: varchar('api_key', { length: 255 }).notNull().unique(),
  secretHash: varchar('secret_hash', { length: 255 }),
  permissions: json('permissions').$type<ApiKeyPermissions>(),
  isActive: boolean('is_active').default(true),
  lastUsedAt: timestamp('last_used_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Tenant billing
export const tenantBilling = mysqlTable('tenant_billing', {
  id: varchar('id', { length: 36 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 36 }).notNull().unique(),

  // Subscription
  subscriptionId: varchar('subscription_id', { length: 255 }),
  plan: varchar('plan', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('active'),

  // Usage
  userLimit: int('user_limit').default(10),
  userCount: int('user_count').default(0),
  storageLimit: int('storage_limit').default(1000), // MB
  storageUsed: int('storage_used').default(0),
  apiCallsLimit: int('api_calls_limit').default(10000),
  apiCallsUsed: int('api_calls_used').default(0),

  // Billing
  monthlyAmount: decimal('monthly_amount', { precision: 10, scale: 2 }),
  nextBillingAt: timestamp('next_billing_at'),
  paymentMethod: varchar('payment_method', { length: 50 }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// Relations
export const tenantsRelations = relations(tenants, ({ many }) => ({
  branding: many(tenantBranding),
  domains: many(tenantDomains),
  features: many(tenantFeatures),
  apiKeys: many(tenantApiKeys),
  billing: many(tenantBilling),
}));

export const tenantBrandingRelations = relations(tenantBranding, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantBranding.tenantId],
    references: [tenants.id],
  }),
});

export const tenantDomainsRelations = relations(tenantDomains, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantDomains.tenantId],
    references: [tenants.id],
  }),
}));

export const tenantFeaturesRelations = relations(tenantFeatures, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantFeatures.tenantId],
    references: [tenants.id],
  }),
}));

export const tenantApiKeysRelations = relations(tenantApiKeys, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantApiKeys.tenantId],
    references: [tenants.id],
  }),
}));

export const tenantBillingRelations = relations(tenantBilling, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantBilling.tenantId],
    references: [tenants.id],
  }),
}));

// Types
export interface TenantSettings {
  language?: string;
  timezone?: string;
  dateFormat?: string;
  currency?: string;
  features?: Record<string, boolean>;
  customFields?: Record<string, any>;
}

export interface ApiKeyPermissions {
  read?: boolean;
  write?: boolean;
  admin?: boolean;
  modules?: string[];
}

// Plan types
export type PlanType = 'starter' | 'pro' | 'enterprise';
export type TenantStatus = 'active' | 'suspended' | 'cancelled';

// Plan limits
export const PLAN_LIMITS: Record<PlanType, TenantSettings & {
  userLimit: number;
  storageLimit: number;
  apiCallsLimit: number;
  price: number;
}> = {
  starter: {
    userLimit: 10,
    storageLimit: 1000,
    apiCallsLimit: 10000,
    price: 97,
    language: 'pt-BR',
  },
  pro: {
    userLimit: 100,
    storageLimit: 10000,
    apiCallsLimit: 100000,
    price: 297,
    language: 'pt-BR',
  },
  enterprise: {
    userLimit: -1, // unlimited
    storageLimit: 100000,
    apiCallsLimit: -1,
    price: 1997,
    language: 'multi',
  },
};