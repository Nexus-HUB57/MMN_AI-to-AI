import express, { type Request, type Response } from "express";
import { z } from "zod";
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
  subscriptionPlanIdSchema,
  subscriptionStatusSchema,
  subscriptionTermMonthsSchema,
} from "../domains/subscriptions/types";
import { getNexusApiContext, requireNexusApiKey } from "./auth";
import { createOpenApiAuditMiddleware, listRecentOpenApiAuditRecords } from "./audit";
import { requireIdempotencyKey } from "./idempotency";
import { createPublicOpenApiRateLimiter, createTenantOpenApiRateLimiter } from "./rate-limit";

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

function sendApiError(res: Response, status: number, code: string, message: string, details?: unknown) {
  res.status(status).json({
    error: {
      code,
      message,
      details: details ?? null,
    },
  });
}

function withApiVersionHeaders(_req: Request, res: Response, next: express.NextFunction) {
  res.header("X-Nexus-Api-Version", "v1");
  res.header("X-Nexus-Api-Stage", "sprint-3");
  next();
}

function belongsToTenant(metadata: Record<string, unknown> | undefined, tenantId: string | null | undefined) {
  if (!tenantId) return false;
  return metadata?.apiTenantId === tenantId;
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
        "Gateway REST externo para catálogo e ciclo de vida de assinaturas do Nexus Partners Pack.",
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
    },
  };
}

export function createNexusOpenApiRouter() {
  const router = express.Router();

  router.use(withApiVersionHeaders);
  router.use(createOpenApiAuditMiddleware());
  router.use(createPublicOpenApiRateLimiter());

  router.get("/", (_req, res) => {
    res.json({
      name: "Nexus Open API",
      product: "Nexus Partners Pack",
      version: "v1",
      stage: "sprint-3",
      authentication: "Bearer API key",
      endpoints: {
        openApiSpec: "/api/v1/openapi.json",
        catalog: "/api/v1/catalog/plans",
        subscriptions: "/api/v1/subscriptions",
        subscriptionDetail: "/api/v1/subscriptions/:id",
        confirmPayment: "/api/v1/subscriptions/:id/confirm-payment",
        changePlan: "/api/v1/subscriptions/:id/change-plan",
        cancelSubscription: "/api/v1/subscriptions/:id/cancel",
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

  router.use(requireNexusApiKey);
  router.use(createTenantOpenApiRateLimiter());

  router.get("/audit/recent", async (req, res) => {
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

  router.get("/subscriptions", async (req, res) => {
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

  router.post("/subscriptions", requireIdempotencyKey, async (req, res) => {
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

  router.get("/subscriptions/:id", async (req, res) => {
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

  router.post("/subscriptions/:id/confirm-payment", requireIdempotencyKey, async (req, res) => {
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
  });

  router.post("/subscriptions/:id/change-plan", requireIdempotencyKey, async (req, res) => {
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
  });

  router.post("/subscriptions/:id/cancel", requireIdempotencyKey, async (req, res) => {
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
  });

  return router;
}
