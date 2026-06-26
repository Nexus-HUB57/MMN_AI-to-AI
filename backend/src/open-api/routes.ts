import express, { type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import {
  calculatePendingCommissionSummary,
  getAffiliateCommissions,
  getCommissionDetails,
  getCommissionStats,
  listCommissions,
} from "../domains/commissions/service";
import {
  analyzePartnerGrowth,
  calculatePartnerBenefits,
  getPartnerById,
  getPartnerStatsSnapshot,
  getPartnerVolumeHistory,
  getPartnershipById,
  listPartnerTiersSorted,
  listPartners,
  listPartnerships,
  listTiers,
} from "../domains/partners/service";
import {
  cancelSubscription,
  changeSubscriptionPlan,
  confirmSubscriptionPayment,
  getCatalog,
  getSubscriptionDetails,
  searchSubscriptions,
  startSubscription,
} from "../domains/subscriptions/service";
import {
  partnerTierSchema,
  partnershipStatusSchema,
} from "../domains/partners/types";
import {
  subscriptionPlanIdSchema,
  subscriptionStatusSchema,
  subscriptionTermMonthsSchema,
} from "../domains/subscriptions/types";
import { getNexusApiContext, requireNexusApiKey } from "./auth";
import { createOpenApiAuditMiddleware, listRecentOpenApiAuditRecords } from "./audit";
import { requireIdempotencyKey } from "./idempotency";
import { createPublicOpenApiRateLimiter, createTenantOpenApiRateLimiter } from "./rate-limit";

const OPEN_API_STAGE = "sprint-5";
const commissionStatusSchema = z.enum(["pending", "confirmed", "paid", "cancelled"]);
const partnerRecordStatusSchema = z.enum(["active", "inactive", "suspended"]);

const createSubscriptionApiSchema = z.object({
  userId: z.coerce.number().int().positive(),
  planId: subscriptionPlanIdSchema,
  termMonths: z.coerce.number().pipe(subscriptionTermMonthsSchema).default(12),
  metadata: z.record(z.unknown()).optional(),
});

const listSubscriptionsApiSchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
  status: subscriptionStatusSchema.optional(),
  planId: subscriptionPlanIdSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const changePlanApiSchema = z.object({
  toPlanId: subscriptionPlanIdSchema,
  triggeredBy: z.enum(["user", "admin", "system", "billing_webhook"]).default("admin"),
  notes: z.string().max(500).optional(),
});

const confirmPaymentApiSchema = z.object({
  triggeredBy: z.enum(["user", "admin", "system", "billing_webhook"]).default("billing_webhook"),
});

const cancelSubscriptionApiSchema = z.object({
  reason: z.string().max(500).optional(),
  triggeredBy: z.enum(["user", "admin", "system", "billing_webhook"]).default("admin"),
});

const listCommissionsApiSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: commissionStatusSchema.optional(),
  affiliateId: z.coerce.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const listAffiliateCommissionsApiSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const listPartnersApiSchema = z.object({
  tier: partnerTierSchema.optional(),
  status: partnerRecordStatusSchema.optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const listPartnershipsApiSchema = z.object({
  partnerId: z.coerce.number().int().positive().optional(),
  status: partnershipStatusSchema.optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

function sendApiError(res: Response, status: number, code: string, message: string, details?: unknown) {
  res.status(status).json({
    error: {
      code,
      message,
      details: details ?? null,
    },
  });
}

function withApiVersionHeaders(_req: Request, res: Response, next: NextFunction) {
  res.header("X-Nexus-Api-Version", "v1");
  res.header("X-Nexus-Api-Stage", OPEN_API_STAGE);
  next();
}

function belongsToTenant(metadata: Record<string, unknown> | undefined, tenantId: string | null | undefined) {
  if (!tenantId) return false;
  return metadata?.apiTenantId === tenantId;
}

function normalizeModuleName(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function requireApiAccess(options: { moduleAliases?: string[]; capability: "read" | "write" }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const apiContext = getNexusApiContext(res);
    const permissions = apiContext?.permissions;

    if (!permissions) {
      next();
      return;
    }

    if (options.moduleAliases?.length) {
      const allowedModules = Array.isArray(permissions.modules)
        ? permissions.modules.map(normalizeModuleName)
        : [];
      if (allowedModules.length > 0) {
        const aliases = options.moduleAliases.map(normalizeModuleName);
        const hasModuleAccess = aliases.some((alias) => allowedModules.includes(alias));
        if (!hasModuleAccess && permissions.admin !== true) {
          sendApiError(
            res,
            403,
            "module_access_denied",
            `A API key não possui acesso ao módulo ${options.moduleAliases[0]}.`,
            {
              requiredModules: options.moduleAliases,
              grantedModules: permissions.modules ?? [],
            },
          );
          return;
        }
      }
    }

    if (options.capability === "read" && permissions.read === false && permissions.admin !== true) {
      sendApiError(res, 403, "insufficient_scope", "A API key não possui permissão de leitura.");
      return;
    }

    if (options.capability === "write" && permissions.write !== true && permissions.admin !== true) {
      sendApiError(res, 403, "insufficient_scope", "A API key não possui permissão de escrita.");
      return;
    }

    req;
    next();
  };
}

function paginateItems<T>(items: T[], page: number, limit: number) {
  const start = (page - 1) * limit;
  const pagedItems = items.slice(start, start + limit);
  return {
    items: pagedItems,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / limit)),
    },
  };
}

async function getTenantScopedSubscriptionDetails(subscriptionId: string, tenantId: string | null) {
  const details = await getSubscriptionDetails(subscriptionId);
  if (!details) return null;
  if (!belongsToTenant(details.subscription.metadata as Record<string, unknown> | undefined, tenantId)) {
    return null;
  }
  return details;
}

function createOpenApiSpec() {
  return {
    openapi: "3.1.0",
    info: {
      title: "Nexus Open API",
      version: "v1",
      summary: "Open API externa do Nexus Partners Pack",
      description:
        "Gateway REST externo para catálogo, assinaturas, comissões e parceiros do Nexus Partners Pack.",
    },
    servers: [
      { url: "/api/v1", description: "Current environment" },
      { url: "https://api.oneverso.com.br/api/v1", description: "Production" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "API Key",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                details: {},
              },
              required: ["code", "message"],
            },
          },
          required: ["error"],
        },
      },
    },
    paths: {
      "/": {
        get: {
          summary: "Discovery do gateway",
          responses: { 200: { description: "Gateway metadata" } },
        },
      },
      "/openapi.json": {
        get: {
          summary: "Especificação OpenAPI em JSON",
          responses: { 200: { description: "OpenAPI document" } },
        },
      },
      "/catalog/plans": {
        get: {
          summary: "Catálogo público de planos",
          responses: { 200: { description: "Plan catalog" } },
        },
      },
      "/sdk/javascript": {
        get: {
          summary: "Metadados do SDK JavaScript",
          responses: { 200: { description: "JavaScript SDK metadata" } },
        },
      },
      "/sdk/python": {
        get: {
          summary: "Metadados do SDK Python",
          responses: { 200: { description: "Python SDK metadata" } },
        },
      },
      "/webhooks/events": {
        get: {
          summary: "Catálogo público de eventos outbound",
          responses: { 200: { description: "Webhook events catalog" } },
        },
      },
      "/webhooks/examples": {
        get: {
          summary: "Exemplos de payloads de webhooks",
          responses: { 200: { description: "Webhook payload examples" } },
        },
      },
      "/audit/recent": {
        get: {
          summary: "Trilha recente da tenant autenticada",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Recent audit items" } },
        },
      },
      "/subscriptions": {
        get: {
          summary: "Lista assinaturas da tenant",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Subscriptions list" } },
        },
        post: {
          summary: "Cria uma assinatura",
          security: [{ bearerAuth: [] }],
          responses: {
            201: { description: "Subscription created" },
            400: { description: "Validation error" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/subscriptions/{id}": {
        get: {
          summary: "Detalha uma assinatura",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Subscription detail" }, 404: { description: "Not found" } },
        },
      },
      "/subscriptions/{id}/confirm-payment": {
        post: {
          summary: "Confirma o pagamento de uma assinatura",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Subscription activated" } },
        },
      },
      "/subscriptions/{id}/change-plan": {
        post: {
          summary: "Troca o plano de uma assinatura",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Subscription plan changed" } },
        },
      },
      "/subscriptions/{id}/cancel": {
        post: {
          summary: "Cancela uma assinatura",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Subscription cancelled" } },
        },
      },
      "/commissions": {
        get: {
          summary: "Lista comissões",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Commission list" } },
        },
      },
      "/commissions/stats": {
        get: {
          summary: "Snapshot agregado de comissões",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Commission stats" } },
        },
      },
      "/commissions/{id}": {
        get: {
          summary: "Detalhes de uma comissão",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Commission detail" }, 404: { description: "Not found" } },
        },
      },
      "/commissions/affiliates/{affiliateId}": {
        get: {
          summary: "Lista comissões de um afiliado",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "affiliateId", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Affiliate commissions" } },
        },
      },
      "/commissions/affiliates/{affiliateId}/pending-summary": {
        get: {
          summary: "Resumo pendente de um afiliado",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "affiliateId", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Pending summary" } },
        },
      },
      "/partners": {
        get: {
          summary: "Lista parceiros",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Partners list" } },
        },
      },
      "/partners/stats": {
        get: {
          summary: "Snapshot agregado de parceiros",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Partner stats" } },
        },
      },
      "/partners/tiers": {
        get: {
          summary: "Catálogo de tiers de parceiros",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Partner tier catalog" } },
        },
      },
      "/partners/partnerships": {
        get: {
          summary: "Lista parcerias estratégicas",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Partnership list" } },
        },
      },
      "/partners/{id}": {
        get: {
          summary: "Detalhes de um parceiro",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Partner detail" }, 404: { description: "Not found" } },
        },
      },
      "/partners/{id}/growth": {
        get: {
          summary: "Análise de crescimento de parceiro",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Growth analysis" }, 404: { description: "Not found" } },
        },
      },
      "/partners/{id}/benefits": {
        get: {
          summary: "Benefícios e comissão efetiva do parceiro",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Partner benefits" }, 404: { description: "Not found" } },
        },
      },
      "/partners/{id}/volume-history": {
        get: {
          summary: "Histórico de volume do parceiro",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: { 200: { description: "Volume history" }, 404: { description: "Not found" } },
        },
      },
    },
  };
}

export function createNexusOpenApiRouter() {
  const router = express.Router();
  const requireAuditReadAccess = requireApiAccess({ moduleAliases: ["audit", "open_api_audit"], capability: "read" });
  const requireSubscriptionsReadAccess = requireApiAccess({ moduleAliases: ["subscriptions", "billing"], capability: "read" });
  const requireSubscriptionsWriteAccess = requireApiAccess({ moduleAliases: ["subscriptions", "billing"], capability: "write" });
  const requireCommissionsReadAccess = requireApiAccess({ moduleAliases: ["commissions", "finance"], capability: "read" });
  const requirePartnersReadAccess = requireApiAccess({ moduleAliases: ["partners", "network"], capability: "read" });

  router.use(withApiVersionHeaders);
  router.use(createOpenApiAuditMiddleware());
  router.use(createPublicOpenApiRateLimiter());

  router.get("/", (_req, res) => {
    res.json({
      name: "Nexus Open API",
      product: "Nexus Partners Pack",
      version: "v1",
      stage: OPEN_API_STAGE,
      authentication: "Bearer API key",
      endpoints: {
        openApiSpec: "/api/v1/openapi.json",
        catalog: "/api/v1/catalog/plans",
        sdkJavascript: "/api/v1/sdk/javascript",
        sdkPython: "/api/v1/sdk/python",
        webhookEvents: "/api/v1/webhooks/events",
        webhookExamples: "/api/v1/webhooks/examples",
        subscriptions: "/api/v1/subscriptions",
        subscriptionDetail: "/api/v1/subscriptions/:id",
        confirmPayment: "/api/v1/subscriptions/:id/confirm-payment",
        changePlan: "/api/v1/subscriptions/:id/change-plan",
        cancelSubscription: "/api/v1/subscriptions/:id/cancel",
        commissions: "/api/v1/commissions",
        commissionStats: "/api/v1/commissions/stats",
        partners: "/api/v1/partners",
        partnerStats: "/api/v1/partners/stats",
        partnerPartnerships: "/api/v1/partners/partnerships",
        auditRecent: "/api/v1/audit/recent",
      },
    });
  });

  router.get("/openapi.json", (_req, res) => {
    res.json(createOpenApiSpec());
  });

  router.get("/catalog/plans", (_req, res) => {
    res.json(getCatalog());
  });

  router.get("/sdk/javascript", (_req, res) => {
    res.json({
      language: "javascript",
      packageName: "@nexus/open-api-sdk",
      status: "preview",
      stage: OPEN_API_STAGE,
      source: "/api/v1/openapi.json",
      installation: "npm install @nexus/open-api-sdk",
    });
  });

  router.get("/sdk/python", (_req, res) => {
    res.json({
      language: "python",
      packageName: "nexus-open-api-sdk",
      status: "preview",
      stage: OPEN_API_STAGE,
      source: "/api/v1/openapi.json",
      installation: "pip install nexus-open-api-sdk",
    });
  });

  router.get("/webhooks/events", (_req, res) => {
    res.json({
      stage: OPEN_API_STAGE,
      events: [
        "subscription.created",
        "subscription.activated",
        "subscription.plan_changed",
        "subscription.cancelled",
        "commission.created",
        "commission.confirmed",
        "partner.created",
        "partner.updated",
      ],
    });
  });

  router.get("/webhooks/examples", (_req, res) => {
    res.json({
      stage: OPEN_API_STAGE,
      examples: {
        subscription_activated: {
          event: "subscription.activated",
          occurredAt: new Date().toISOString(),
          data: {
            subscriptionId: "sub_123",
            userId: 101,
            planId: "partners-pro",
            status: "active",
          },
        },
        commission_confirmed: {
          event: "commission.confirmed",
          occurredAt: new Date().toISOString(),
          data: {
            commissionId: 501,
            affiliateId: 77,
            status: "confirmed",
            amount: 149.9,
          },
        },
      },
    });
  });

  router.use(requireNexusApiKey);
  router.use(createTenantOpenApiRateLimiter());

  router.get("/audit/recent", requireAuditReadAccess, async (req, res) => {
    const apiContext = getNexusApiContext(res);
    const tenantId = apiContext?.tenantId ?? null;
    const requestedLimit = Number(req.query.limit || 20);
    const items = await listRecentOpenApiAuditRecords(tenantId, requestedLimit);

    res.json({
      data: {
        items,
        total: items.length,
      },
      meta: {
        tenantId,
        limit: Math.max(1, Math.min(requestedLimit, 200)),
      },
    });
  });

  router.get("/subscriptions", requireSubscriptionsReadAccess, async (req, res) => {
    try {
      const filter = listSubscriptionsApiSchema.parse(req.query);
      const result = await searchSubscriptions(filter);
      const apiContext = getNexusApiContext(res);
      const tenantId = apiContext?.tenantId ?? null;
      const tenantScopedItems = result.items.filter((subscription) =>
        belongsToTenant(subscription.metadata as Record<string, unknown> | undefined, tenantId),
      );

      res.json({
        data: {
          items: tenantScopedItems,
          total: tenantScopedItems.length,
          upstreamTotal: result.total,
        },
        meta: {
          tenantId,
          filter,
          count: tenantScopedItems.length,
          scope: "tenant_metadata_filter",
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendApiError(res, 400, "invalid_query", "Parâmetros de consulta inválidos.", error.flatten());
        return;
      }
      sendApiError(
        res,
        500,
        "list_subscriptions_failed",
        error instanceof Error ? error.message : "Falha ao listar assinaturas.",
      );
    }
  });

  router.post("/subscriptions", requireSubscriptionsWriteAccess, requireIdempotencyKey, async (req, res) => {
    try {
      const input = createSubscriptionApiSchema.parse(req.body ?? {});
      const apiContext = getNexusApiContext(res);
      const tenantId = apiContext?.tenantId ?? null;
      const result = await startSubscription({
        ...input,
        metadata: {
          ...(input.metadata ?? {}),
          apiTenantId: tenantId,
          apiProvisionedBy: "nexus_open_api_v1",
          apiProvisionedAt: new Date().toISOString(),
        },
      });

      res.status(201).json({
        data: result,
        meta: {
          tenantId,
          request: {
            userId: input.userId,
            planId: input.planId,
            termMonths: input.termMonths,
          },
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendApiError(res, 400, "invalid_body", "Payload inválido para criar assinatura.", error.flatten());
        return;
      }
      sendApiError(
        res,
        500,
        "create_subscription_failed",
        error instanceof Error ? error.message : "Falha ao criar assinatura.",
      );
    }
  });

  router.get("/subscriptions/:id", requireSubscriptionsReadAccess, async (req, res) => {
    try {
      const subscriptionId = String(req.params.id || "").trim();
      if (!subscriptionId) {
        sendApiError(res, 400, "invalid_subscription_id", "subscriptionId é obrigatório.");
        return;
      }

      const apiContext = getNexusApiContext(res);
      const tenantId = apiContext?.tenantId ?? null;
      const result = await getTenantScopedSubscriptionDetails(subscriptionId, tenantId);
      if (!result) {
        sendApiError(res, 404, "subscription_not_found", "Assinatura não encontrada para esta tenant.");
        return;
      }

      res.json({
        data: result,
        meta: {
          tenantId,
        },
      });
    } catch (error) {
      sendApiError(
        res,
        500,
        "get_subscription_failed",
        error instanceof Error ? error.message : "Falha ao consultar assinatura.",
      );
    }
  });

  router.post(
    "/subscriptions/:id/confirm-payment",
    requireSubscriptionsWriteAccess,
    requireIdempotencyKey,
    async (req, res) => {
      try {
        const subscriptionId = String(req.params.id || "").trim();
        const input = confirmPaymentApiSchema.parse(req.body ?? {});
        if (!subscriptionId) {
          sendApiError(res, 400, "invalid_subscription_id", "subscriptionId é obrigatório.");
          return;
        }

        const apiContext = getNexusApiContext(res);
        const tenantId = apiContext?.tenantId ?? null;
        const current = await getTenantScopedSubscriptionDetails(subscriptionId, tenantId);
        if (!current) {
          sendApiError(res, 404, "subscription_not_found", "Assinatura não encontrada para esta tenant.");
          return;
        }

        const updated = await confirmSubscriptionPayment(subscriptionId, input.triggeredBy);
        if (!updated) {
          sendApiError(res, 404, "subscription_not_found", "Assinatura não encontrada.");
          return;
        }

        res.json({
          data: updated,
          meta: {
            tenantId,
            action: "confirm_payment",
            previousStatus: current.subscription.status,
            currentStatus: updated.status,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          sendApiError(res, 400, "invalid_body", "Payload inválido para confirmar pagamento.", error.flatten());
          return;
        }
        sendApiError(
          res,
          500,
          "confirm_payment_failed",
          error instanceof Error ? error.message : "Falha ao confirmar pagamento.",
        );
      }
    },
  );

  router.post(
    "/subscriptions/:id/change-plan",
    requireSubscriptionsWriteAccess,
    requireIdempotencyKey,
    async (req, res) => {
      try {
        const subscriptionId = String(req.params.id || "").trim();
        const input = changePlanApiSchema.parse(req.body ?? {});
        if (!subscriptionId) {
          sendApiError(res, 400, "invalid_subscription_id", "subscriptionId é obrigatório.");
          return;
        }

        const apiContext = getNexusApiContext(res);
        const tenantId = apiContext?.tenantId ?? null;
        const current = await getTenantScopedSubscriptionDetails(subscriptionId, tenantId);
        if (!current) {
          sendApiError(res, 404, "subscription_not_found", "Assinatura não encontrada para esta tenant.");
          return;
        }

        const changed = await changeSubscriptionPlan({
          subscriptionId,
          toPlanId: input.toPlanId,
          triggeredBy: input.triggeredBy,
          notes: input.notes,
        });
        if (!changed) {
          sendApiError(res, 404, "subscription_not_found", "Assinatura não encontrada.");
          return;
        }

        res.json({
          data: changed,
          meta: {
            tenantId,
            action: "change_plan",
            previousPlanId: current.subscription.planId,
            requestedPlanId: input.toPlanId,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          sendApiError(res, 400, "invalid_body", "Payload inválido para mudança de plano.", error.flatten());
          return;
        }
        sendApiError(
          res,
          500,
          "change_plan_failed",
          error instanceof Error ? error.message : "Falha ao alterar o plano da assinatura.",
        );
      }
    },
  );

  router.post(
    "/subscriptions/:id/cancel",
    requireSubscriptionsWriteAccess,
    requireIdempotencyKey,
    async (req, res) => {
      try {
        const subscriptionId = String(req.params.id || "").trim();
        const input = cancelSubscriptionApiSchema.parse(req.body ?? {});
        if (!subscriptionId) {
          sendApiError(res, 400, "invalid_subscription_id", "subscriptionId é obrigatório.");
          return;
        }

        const apiContext = getNexusApiContext(res);
        const tenantId = apiContext?.tenantId ?? null;
        const current = await getTenantScopedSubscriptionDetails(subscriptionId, tenantId);
        if (!current) {
          sendApiError(res, 404, "subscription_not_found", "Assinatura não encontrada para esta tenant.");
          return;
        }

        const cancelled = await cancelSubscription({
          subscriptionId,
          reason: input.reason,
          triggeredBy: input.triggeredBy,
        });
        if (!cancelled) {
          sendApiError(res, 404, "subscription_not_found", "Assinatura não encontrada.");
          return;
        }

        res.json({
          data: cancelled,
          meta: {
            tenantId,
            action: "cancel_subscription",
            previousStatus: current.subscription.status,
            reason: input.reason ?? null,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          sendApiError(res, 400, "invalid_body", "Payload inválido para cancelamento.", error.flatten());
          return;
        }
        sendApiError(
          res,
          500,
          "cancel_subscription_failed",
          error instanceof Error ? error.message : "Falha ao cancelar assinatura.",
        );
      }
    },
  );

  router.get("/commissions", requireCommissionsReadAccess, (req, res) => {
    try {
      const filter = listCommissionsApiSchema.parse(req.query);
      const result = listCommissions(filter);
      const paged = paginateItems(result.commissions, filter.page, filter.limit);
      res.json({
        data: {
          items: paged.items,
          pagination: paged.pagination,
          statsSnapshot: getCommissionStats(),
        },
        meta: {
          filter,
          scope: "commissions_catalog",
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendApiError(res, 400, "invalid_query", "Parâmetros de consulta inválidos para comissões.", error.flatten());
        return;
      }
      sendApiError(
        res,
        500,
        "list_commissions_failed",
        error instanceof Error ? error.message : "Falha ao listar comissões.",
      );
    }
  });

  router.get("/commissions/stats", requireCommissionsReadAccess, (_req, res) => {
    res.json({
      data: getCommissionStats(),
      meta: {
        scope: "commissions_snapshot",
      },
    });
  });

  router.get(
    "/commissions/affiliates/:affiliateId/pending-summary",
    requireCommissionsReadAccess,
    (req, res) => {
      const affiliateId = Number(req.params.affiliateId);
      if (!Number.isInteger(affiliateId) || affiliateId <= 0) {
        sendApiError(res, 400, "invalid_affiliate_id", "affiliateId é obrigatório e deve ser positivo.");
        return;
      }

      res.json({
        data: calculatePendingCommissionSummary(affiliateId),
        meta: {
          affiliateId,
          scope: "affiliate_pending_summary",
        },
      });
    },
  );

  router.get("/commissions/affiliates/:affiliateId", requireCommissionsReadAccess, (req, res) => {
    try {
      const affiliateId = Number(req.params.affiliateId);
      if (!Number.isInteger(affiliateId) || affiliateId <= 0) {
        sendApiError(res, 400, "invalid_affiliate_id", "affiliateId é obrigatório e deve ser positivo.");
        return;
      }

      const filter = listAffiliateCommissionsApiSchema.parse(req.query);
      const result = getAffiliateCommissions({
        affiliateId,
        page: filter.page,
        limit: filter.limit,
      });
      const paged = paginateItems(result.commissions, filter.page, filter.limit);

      res.json({
        data: {
          items: paged.items,
          pagination: paged.pagination,
          pendingSummary: calculatePendingCommissionSummary(affiliateId),
        },
        meta: {
          affiliateId,
          filter,
          scope: "affiliate_commissions",
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendApiError(res, 400, "invalid_query", "Parâmetros de consulta inválidos para afiliado.", error.flatten());
        return;
      }
      sendApiError(
        res,
        500,
        "affiliate_commissions_failed",
        error instanceof Error ? error.message : "Falha ao listar comissões do afiliado.",
      );
    }
  });

  router.get("/commissions/:id", requireCommissionsReadAccess, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      sendApiError(res, 400, "invalid_commission_id", "commissionId é obrigatório e deve ser positivo.");
      return;
    }

    const detail = getCommissionDetails(id);
    if (!detail) {
      sendApiError(res, 404, "commission_not_found", "Comissão não encontrada.");
      return;
    }

    res.json({
      data: detail,
      meta: {
        commissionId: id,
      },
    });
  });

  router.get("/partners", requirePartnersReadAccess, (req, res) => {
    try {
      const filter = listPartnersApiSchema.parse(req.query);
      let items = listPartners();

      if (filter.tier) {
        items = items.filter((partner) => partner.tier === filter.tier);
      }
      if (filter.status) {
        items = items.filter((partner) => partner.status === filter.status);
      }
      if (filter.search) {
        const search = filter.search.toLowerCase();
        items = items.filter(
          (partner) =>
            String(partner.id).includes(search) ||
            String(partner.userId).includes(search) ||
            partner.referralCode.toLowerCase().includes(search),
        );
      }

      const paged = paginateItems(items, filter.page, filter.limit);
      res.json({
        data: {
          items: paged.items,
          pagination: paged.pagination,
        },
        meta: {
          filter,
          availableTiers: listPartnerTiersSorted(),
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendApiError(res, 400, "invalid_query", "Parâmetros de consulta inválidos para parceiros.", error.flatten());
        return;
      }
      sendApiError(
        res,
        500,
        "list_partners_failed",
        error instanceof Error ? error.message : "Falha ao listar parceiros.",
      );
    }
  });

  router.get("/partners/stats", requirePartnersReadAccess, (_req, res) => {
    res.json({
      data: getPartnerStatsSnapshot(),
      meta: {
        scope: "partners_snapshot",
      },
    });
  });

  router.get("/partners/tiers", requirePartnersReadAccess, (_req, res) => {
    res.json({
      data: {
        items: listTiers(),
        order: listPartnerTiersSorted(),
      },
      meta: {
        total: listTiers().length,
      },
    });
  });

  router.get("/partners/partnerships", requirePartnersReadAccess, (req, res) => {
    try {
      const filter = listPartnershipsApiSchema.parse(req.query);
      let items = listPartnerships();

      if (filter.partnerId) {
        items = items.filter((partnership) => partnership.partnerId === filter.partnerId);
      }
      if (filter.status) {
        items = items.filter((partnership) => partnership.status === filter.status);
      }
      if (filter.search) {
        const search = filter.search.toLowerCase();
        items = items.filter(
          (partnership) =>
            String(partnership.id).includes(search) ||
            partnership.partnerName.toLowerCase().includes(search) ||
            (partnership.partnerCompany ?? "").toLowerCase().includes(search) ||
            (partnership.partnerEmail ?? "").toLowerCase().includes(search),
        );
      }

      const paged = paginateItems(items, filter.page, filter.limit);
      res.json({
        data: {
          items: paged.items,
          pagination: paged.pagination,
        },
        meta: {
          filter,
          scope: "partner_partnerships",
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        sendApiError(res, 400, "invalid_query", "Parâmetros de consulta inválidos para parcerias.", error.flatten());
        return;
      }
      sendApiError(
        res,
        500,
        "list_partnerships_failed",
        error instanceof Error ? error.message : "Falha ao listar parcerias.",
      );
    }
  });

  router.get("/partners/:id/growth", requirePartnersReadAccess, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      sendApiError(res, 400, "invalid_partner_id", "partnerId é obrigatório e deve ser positivo.");
      return;
    }

    const analysis = analyzePartnerGrowth(id);
    if (!analysis) {
      sendApiError(res, 404, "partner_not_found", "Parceiro não encontrado.");
      return;
    }

    res.json({
      data: analysis,
      meta: {
        partnerId: id,
        scope: "partner_growth_analysis",
      },
    });
  });

  router.get("/partners/:id/benefits", requirePartnersReadAccess, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      sendApiError(res, 400, "invalid_partner_id", "partnerId é obrigatório e deve ser positivo.");
      return;
    }

    const benefits = calculatePartnerBenefits(id);
    if (!benefits) {
      sendApiError(res, 404, "partner_not_found", "Parceiro não encontrado.");
      return;
    }

    res.json({
      data: benefits,
      meta: {
        partnerId: id,
        scope: "partner_benefits",
      },
    });
  });

  router.get("/partners/:id/volume-history", requirePartnersReadAccess, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      sendApiError(res, 400, "invalid_partner_id", "partnerId é obrigatório e deve ser positivo.");
      return;
    }

    const partner = getPartnerById(id);
    if (!partner) {
      sendApiError(res, 404, "partner_not_found", "Parceiro não encontrado.");
      return;
    }

    const items = getPartnerVolumeHistory(id);
    res.json({
      data: {
        items,
        total: items.length,
      },
      meta: {
        partnerId: id,
        scope: "partner_volume_history",
      },
    });
  });

  router.get("/partners/:id", requirePartnersReadAccess, (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      sendApiError(res, 400, "invalid_partner_id", "partnerId é obrigatório e deve ser positivo.");
      return;
    }

    const partner = getPartnerById(id);
    if (!partner) {
      sendApiError(res, 404, "partner_not_found", "Parceiro não encontrado.");
      return;
    }

    const growth = analyzePartnerGrowth(id);
    const benefits = calculatePartnerBenefits(id);
    const partnerships = listPartnerships().filter((item) => item.partnerId === id);
    const linkedPartnershipIds = partnerships.map((item) => item.id);
    const partnershipDetails = linkedPartnershipIds
      .map((partnershipId) => getPartnershipById(partnershipId))
      .filter(Boolean);
    const volumeHistory = getPartnerVolumeHistory(id);

    res.json({
      data: {
        partner,
        benefits,
        growth,
        volumeHistory,
        partnerships: partnershipDetails,
      },
      meta: {
        partnerId: id,
        scope: "partner_detail",
      },
    });
  });


  return router;
}
