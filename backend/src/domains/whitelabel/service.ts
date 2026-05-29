/**
 * White-Label Domain - Service
 *
 * Business logic for tenant management, branding, and white-label configuration.
 */

import { eq } from 'drizzle-orm';
import { db } from '../_core/db';
import {
  tenants,
  tenantBranding,
  tenantDomains,
  tenantFeatures,
  tenantApiKeys,
  tenantBilling,
  TenantSettings,
  ApiKeyPermissions,
  PlanType,
  PLAN_LIMITS,
} from './schema';

// Tenant Service
export class TenantService {
  async createTenant(data: {
    name: string;
    slug: string;
    plan?: PlanType;
    contactEmail?: string;
  }) {
    const id = crypto.randomUUID();

    const [tenant] = await db.insert(tenants).values({
      id,
      name: data.name,
      slug: data.slug,
      plan: data.plan || 'starter',
      contactEmail: data.contactEmail,
      status: 'active',
    }).returning();

    // Create default branding
    await this.createBranding(id);

    // Create default billing
    await this.createBilling(id, data.plan || 'starter');

    // Create default features
    await this.initializeFeatures(id, data.plan || 'starter');

    return tenant;
  }

  async getTenantById(id: string) {
    return db.select().from(tenants).where(eq(tenants.id, id)).get();
  }

  async getTenantBySlug(slug: string) {
    return db.select().from(tenants).where(eq(tenants.slug, slug)).get();
  }

  async updateTenant(id: string, data: Partial<{
    name: string;
    contactEmail: string;
    billingEmail: string;
    settings: TenantSettings;
  }>) {
    return db.update(tenants)
      .set(data)
      .where(eq(tenants.id, id))
      .returning();
  }

  async updateTenantPlan(id: string, plan: PlanType) {
    return db.update(tenants)
      .set({ plan })
      .where(eq(tenants.id, id))
      .returning();
  }

  // Branding Service
  async createBranding(tenantId: string) {
    const id = crypto.randomUUID();
    return db.insert(tenantBranding).values({
      id,
      tenantId,
    }).returning();
  }

  async getBranding(tenantId: string) {
    return db.select().from(tenantBranding)
      .where(eq(tenantBranding.tenantId, tenantId))
      .get();
  }

  async updateBranding(tenantId: string, data: {
    logoUrl?: string;
    logoAlt?: string;
    faviconUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    headingFontFamily?: string;
    customCss?: string;
    customHeadScripts?: string;
  }) {
    return db.update(tenantBranding)
      .set(data)
      .where(eq(tenantBranding.tenantId, tenantId))
      .returning();
  }

  // Domain Service
  async addDomain(tenantId: string, domain: string, isPrimary = false) {
    const id = crypto.randomUUID();
    const verificationCode = crypto.randomUUID();

    if (isPrimary) {
      // Remove primary flag from other domains
      await db.update(tenantDomains)
        .set({ isPrimary: false })
        .where(eq(tenantDomains.tenantId, tenantId));
    }

    return db.insert(tenantDomains).values({
      id,
      tenantId,
      domain,
      isPrimary,
      isVerified: false,
      verificationCode,
    }).returning();
  }

  async getDomains(tenantId: string) {
    return db.select().from(tenantDomains)
      .where(eq(tenantDomains.tenantId, tenantId));
  }

  async verifyDomain(domainId: string, code: string) {
    return db.update(tenantDomains)
      .set({ isVerified: true, verificationCode: null })
      .where(eq(tenantDomains.id, domainId))
      .returning();
  }

  async getPrimaryDomain(tenantId: string) {
    return db.select().from(tenantDomains)
      .where(eq(tenantDomains.tenantId, tenantId))
      .where(eq(tenantDomains.isPrimary, true))
      .get();
  }

  // Features Service
  async initializeFeatures(tenantId: string, plan: PlanType) {
    const planLimits = PLAN_LIMITS[plan];
    const defaultFeatures = [
      { feature: 'ai_agents', enabled: true },
      { feature: 'dropshipping', enabled: true },
      { feature: 'social_automation', enabled: true },
      { feature: 'marketplace', enabled: true },
      { feature: 'commissions', enabled: true },
      { feature: 'xp_system', enabled: true },
      { feature: 'sorteios', enabled: true },
    ];

    for (const feat of defaultFeatures) {
      await db.insert(tenantFeatures).values({
        id: crypto.randomUUID(),
        tenantId,
        feature: feat.feature,
        enabled: feat.enabled,
      });
    }

    return defaultFeatures;
  }

  async getFeatures(tenantId: string) {
    return db.select().from(tenantFeatures)
      .where(eq(tenantFeatures.tenantId, tenantId));
  }

  async isFeatureEnabled(tenantId: string, feature: string): Promise<boolean> {
    const result = await db.select().from(tenantFeatures)
      .where(eq(tenantFeatures.tenantId, tenantId))
      .where(eq(tenantFeatures.feature, feature))
      .get();

    return result?.enabled ?? false;
  }

  // API Keys Service
  async createApiKey(tenantId: string, name: string, permissions?: ApiKeyPermissions) {
    const id = crypto.randomUUID();
    const apiKey = `nxs_${crypto.randomUUID().replace(/-/g, '')}`;

    return db.insert(tenantApiKeys).values({
      id,
      tenantId,
      name,
      apiKey,
      permissions: permissions || { read: true, write: true },
      isActive: true,
    }).returning();
  }

  async getApiKeys(tenantId: string) {
    return db.select().from(tenantApiKeys)
      .where(eq(tenantApiKeys.tenantId, tenantId));
  }

  async validateApiKey(apiKey: string): Promise<{ valid: boolean; tenantId?: string }> {
    const result = await db.select().from(tenantApiKeys)
      .where(eq(tenantApiKeys.apiKey, apiKey))
      .where(eq(tenantApiKeys.isActive, true))
      .get();

    if (!result) {
      return { valid: false };
    }

    // Check expiration
    if (result.expiresAt && new Date(result.expiresAt) < new Date()) {
      return { valid: false };
    }

    // Update last used
    await db.update(tenantApiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(tenantApiKeys.id, result.id));

    return { valid: true, tenantId: result.tenantId };
  }

  // Billing Service
  async createBilling(tenantId: string, plan: PlanType) {
    const planLimits = PLAN_LIMITS[plan];
    const id = crypto.randomUUID();

    return db.insert(tenantBilling).values({
      id,
      tenantId,
      plan,
      status: 'active',
      userLimit: planLimits.userLimit,
      storageLimit: planLimits.storageLimit,
      apiCallsLimit: planLimits.apiCallsLimit,
      monthlyAmount: planLimits.price.toString(),
    }).returning();
  }

  async getBilling(tenantId: string) {
    return db.select().from(tenantBilling)
      .where(eq(tenantBilling.tenantId, tenantId))
      .get();
  }

  async checkUsageLimits(tenantId: string): Promise<{
    withinLimits: boolean;
    exceededLimits: string[];
  }> {
    const billing = await this.getBilling(tenantId);
    if (!billing) {
      return { withinLimits: true, exceededLimits: [] };
    }

    const exceededLimits: string[] = [];

    if (billing.userLimit > 0 && billing.userCount >= billing.userLimit) {
      exceededLimits.push('users');
    }

    if (billing.storageLimit > 0 && billing.storageUsed >= billing.storageLimit) {
      exceededLimits.push('storage');
    }

    if (billing.apiCallsLimit > 0 && billing.apiCallsUsed >= billing.apiCallsLimit) {
      exceededLimits.push('api_calls');
    }

    return {
      withinLimits: exceededLimits.length === 0,
      exceededLimits,
    };
  }
}

// Export singleton instance
export const tenantService = new TenantService();