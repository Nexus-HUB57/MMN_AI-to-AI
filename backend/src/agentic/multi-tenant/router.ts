/**
 * Nexus Affil'IA'te · M8 · Multi-Tenant tRPC Router
 *
 * Endpoints para auto-registro de whitelabel, monitoramento SLA
 * e promoção de trust level via Governance Loop.
 *
 * @module agentic/multi-tenant/router
 * @author Niko Nexus · CEO/AI
 */
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../../config/trpc";
import { tenantRepository } from "./repository";
import { evaluateTenant, evaluateAllTenants } from "./slaEvaluator";
import { tenantTrustSchema } from "./types";

export const multiTenantRouter = router({
  /** Saúde + stats da federação multi-tenant */
  status: publicProcedure.query(async () => {
    const stats = await tenantRepository.stats();
    return {
      ok: true,
      service: "multi-tenant-federation",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      stats,
    };
  }),

  /** Lista de tenants (público, sem apiKey) */
  list: publicProcedure.query(async () => {
    const tenants = await tenantRepository.list();
    return { ok: true, total: tenants.length, tenants };
  }),

  /** Detalhe de tenant por id (público) */
  get: publicProcedure
    .input(z.object({ tenantId: z.string().min(1) }))
    .query(async ({ input }) => {
      const tenant = await tenantRepository.getById(input.tenantId);
      if (!tenant) return { ok: false, tenant: null };
      return {
        ok: true,
        tenant: { ...tenant, apiKey: tenant.apiKey ? "***" : undefined },
      };
    }),

  /** Auto-registro de whitelabel (público, mas requer chave ed25519) */
  register: publicProcedure
    .input(
      z.object({
        tenantId: z.string().min(3).max(64),
        name: z.string().min(1).max(120),
        operator: z.string().min(1).max(120),
        contactEmail: z.string().email(),
        endpoint: z.string().url(),
        publicKeyPem: z.string().min(40),
        apiKey: z.string().optional(),
        metadata: z.record(z.any()).default({}),
      }),
    )
    .mutation(async ({ input }) => {
      const tenant = await tenantRepository.register({
        ...input,
        trustLevel: "sandbox",
        active: true,
      });
      return {
        ok: true,
        tenant,
        message: `Tenant ${tenant.tenantId} registrado como sandbox. Trust escalation automática conforme SLA.`,
      };
    }),

  /** Promoção manual (admin) — auditada via Governance Loop */
  promote: adminProcedure
    .input(
      z.object({
        tenantId: z.string().min(1),
        newTrust: tenantTrustSchema,
        reason: z.string().min(10).max(512),
      }),
    )
    .mutation(async ({ input }) => {
      const tenant = await tenantRepository.promote(input.tenantId, input.newTrust);
      return { ok: tenant !== null, tenant };
    }),

  /** Ativar/desativar tenant (admin) */
  setActive: adminProcedure
    .input(z.object({ tenantId: z.string(), active: z.boolean() }))
    .mutation(async ({ input }) => {
      const tenant = await tenantRepository.setActive(input.tenantId, input.active);
      return { ok: tenant !== null, tenant };
    }),

  /** Avaliação SLA de um tenant específico (público) */
  evaluate: publicProcedure
    .input(z.object({ tenantId: z.string().min(1) }))
    .query(async ({ input }) => {
      const evaluation = await evaluateTenant(input.tenantId);
      return { ok: evaluation !== null, evaluation };
    }),

  /** Avaliação SLA de todos os tenants (público) */
  evaluateAll: publicProcedure.query(async () => {
    const evaluations = await evaluateAllTenants();
    const eligible = evaluations.filter((e) => e.promotionEligible);
    return {
      ok: true,
      total: evaluations.length,
      eligibleForPromotion: eligible.length,
      evaluations,
    };
  }),

  /** Registrar evento de ping (admin/internal — usado pelo cron de health) */
  recordPing: adminProcedure
    .input(
      z.object({
        tenantId: z.string(),
        success: z.boolean(),
        latencyMs: z.number().min(0),
      }),
    )
    .mutation(async ({ input }) => {
      await tenantRepository.recordPing(input.tenantId, input.success, input.latencyMs);
      return { ok: true };
    }),
});
