import express, { type Request, type Response } from "express";
import { z } from "zod";
import {
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
  res.header("X-Nexus-Api-Stage", "sprint-1");
  next();
}

function belongsToTenant(metadata: Record<string, unknown> | undefined, tenantId: string | null | undefined) {
  if (!tenantId) return false;
  return metadata?.apiTenantId === tenantId;
}

export function createNexusOpenApiRouter() {
  const router = express.Router();

  router.use(withApiVersionHeaders);

  router.get("/", (_req, res) => {
    res.json({
      name: "Nexus Open API",
      product: "Nexus Partners Pack",
      version: "v1",
      stage: "sprint-1",
      authentication: "Bearer API key",
      endpoints: {
        catalog: "/api/v1/catalog/plans",
        subscriptions: "/api/v1/subscriptions",
        subscriptionDetail: "/api/v1/subscriptions/:id",
      },
    });
  });

  router.get("/catalog/plans", (_req, res) => {
    res.json(getCatalog());
  });

  router.use(requireNexusApiKey);

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

  router.post("/subscriptions", async (req, res) => {
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

      const result = await getSubscriptionDetails(subscriptionId);
      if (!result) {
        sendApiError(res, 404, "subscription_not_found", "Assinatura não encontrada.");
        return;
      }

      const apiContext = getNexusApiContext(res);
      const tenantId = apiContext?.tenantId ?? null;
      if (!belongsToTenant(result.subscription.metadata as Record<string, unknown> | undefined, tenantId)) {
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

  return router;
}
