/**
 * White-Label Domain - tRPC Router
 *
 * API endpoints for tenant management, branding, and white-label operations.
 */

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../_core/trpc';
import { tenantService } from './service';

export const whitelabelRouter = router({
  // Tenant endpoints
  createTenant: protectedProcedure
    .input(z.object({
      name: z.string().min(2).max(255),
      slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
      plan: z.enum(['starter', 'pro', 'enterprise']).default('starter'),
      contactEmail: z.string().email().optional(),
    }))
    .mutation(async ({ input }) => {
      return tenantService.createTenant(input);
    }),

  getTenant: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return tenantService.getTenantById(input.id);
    }),

  getTenantBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return tenantService.getTenantBySlug(input.slug);
    }),

  updateTenant: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(2).max(255).optional(),
      contactEmail: z.string().email().optional(),
      billingEmail: z.string().email().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return tenantService.updateTenant(id, data);
    }),

  updateTenantPlan: protectedProcedure
    .input(z.object({
      id: z.string(),
      plan: z.enum(['starter', 'pro', 'enterprise']),
    }))
    .mutation(async ({ input }) => {
      return tenantService.updateTenantPlan(input.id, input.plan);
    }),

  // Branding endpoints
  getBranding: protectedProcedure
    .input(z.object({ tenantId: z.string() }))
    .query(async ({ input }) => {
      return tenantService.getBranding(input.tenantId);
    }),

  updateBranding: protectedProcedure
    .input(z.object({
      tenantId: z.string(),
      logoUrl: z.string().url().optional(),
      logoAlt: z.string().max(255).optional(),
      faviconUrl: z.string().url().optional(),
      primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      fontFamily: z.string().max(255).optional(),
      headingFontFamily: z.string().max(255).optional(),
      customCss: z.string().optional(),
      customHeadScripts: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { tenantId, ...data } = input;
      return tenantService.updateBranding(tenantId, data);
    }),

  // Domain endpoints
  addDomain: protectedProcedure
    .input(z.object({
      tenantId: z.string(),
      domain: z.string().regex(/^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/),
      isPrimary: z.boolean().default(false),
    }))
    .mutation(async ({ input }) => {
      return tenantService.addDomain(input.tenantId, input.domain, input.isPrimary);
    }),

  getDomains: protectedProcedure
    .input(z.object({ tenantId: z.string() }))
    .query(async ({ input }) => {
      return tenantService.getDomains(input.tenantId);
    }),

  verifyDomain: protectedProcedure
    .input(z.object({
      domainId: z.string(),
      code: z.string(),
    }))
    .mutation(async ({ input }) => {
      return tenantService.verifyDomain(input.domainId, input.code);
    }),

  // Features endpoints
  getFeatures: protectedProcedure
    .input(z.object({ tenantId: z.string() }))
    .query(async ({ input }) => {
      return tenantService.getFeatures(input.tenantId);
    }),

  isFeatureEnabled: protectedProcedure
    .input(z.object({
      tenantId: z.string(),
      feature: z.string(),
    }))
    .query(async ({ input }) => {
      return tenantService.isFeatureEnabled(input.tenantId, input.feature);
    }),

  // API Keys endpoints
  createApiKey: protectedProcedure
    .input(z.object({
      tenantId: z.string(),
      name: z.string().min(2).max(255),
      permissions: z.object({
        read: z.boolean().optional(),
        write: z.boolean().optional(),
        admin: z.boolean().optional(),
        modules: z.array(z.string()).optional(),
      }).optional(),
    }))
    .mutation(async ({ input }) => {
      return tenantService.createApiKey(input.tenantId, input.name, input.permissions);
    }),

  getApiKeys: protectedProcedure
    .input(z.object({ tenantId: z.string() }))
    .query(async ({ input }) => {
      return tenantService.getApiKeys(input.tenantId);
    }),

  // Billing endpoints
  getBilling: protectedProcedure
    .input(z.object({ tenantId: z.string() }))
    .query(async ({ input }) => {
      return tenantService.getBilling(input.tenantId);
    }),

  checkUsageLimits: protectedProcedure
    .input(z.object({ tenantId: z.string() }))
    .query(async ({ input }) => {
      return tenantService.checkUsageLimits(input.tenantId);
    }),

  // Public branding endpoint (for dynamic theme loading)
  getPublicBranding: publicProcedure
    .input(z.object({ tenantSlug: z.string() }))
    .query(async ({ input }) => {
      const tenant = await tenantService.getTenantBySlug(input.tenantSlug);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const branding = await tenantService.getBranding(tenant.id);
      const primaryDomain = await tenantService.getPrimaryDomain(tenant.id);

      return {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
        },
        branding: branding ? {
          logoUrl: branding.logoUrl,
          logoAlt: branding.logoAlt,
          faviconUrl: branding.faviconUrl,
          primaryColor: branding.primaryColor,
          secondaryColor: branding.secondaryColor,
          accentColor: branding.accentColor,
          backgroundColor: branding.backgroundColor,
          textColor: branding.textColor,
          fontFamily: branding.fontFamily,
          headingFontFamily: branding.headingFontFamily,
        } : null,
        domain: primaryDomain?.domain || null,
      };
    }),
});