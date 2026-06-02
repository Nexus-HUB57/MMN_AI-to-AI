import { createHash } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { getCached, setCached, deleteCached } from "../services/cache-service";
import { getNexusApiContext } from "./auth";

interface CachedResponse {
  statusCode: number;
  body: unknown;
  createdAt: number;
}

interface PendingEntry {
  fingerprint: string;
  createdAt: number;
  completed: boolean;
  response?: CachedResponse;
}

const IDEMPOTENCY_TTL_MS = Number(process.env.NEXUS_OPEN_API_IDEMPOTENCY_TTL_MS || 24 * 60 * 60 * 1000);
const IDEMPOTENCY_TTL_SECONDS = Math.max(60, Math.ceil(IDEMPOTENCY_TTL_MS / 1000));

function buildFingerprint(req: Request, tenantId: string | null | undefined) {
  return createHash("sha256")
    .update(
      JSON.stringify({
        tenantId: tenantId ?? null,
        method: req.method,
        path: req.baseUrl + req.path,
        body: req.body ?? null,
      }),
    )
    .digest("hex");
}

function shouldRequireIdempotencyKey(req: Request) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(req.method.toUpperCase());
}

function buildStoreKey(tenantId: string | null | undefined, idempotencyKey: string) {
  return `nexus:openapi:idempotency:${tenantId ?? "public"}:${idempotencyKey}`;
}

export async function requireIdempotencyKey(req: Request, res: Response, next: NextFunction) {
  if (!shouldRequireIdempotencyKey(req)) {
    next();
    return;
  }

  const idempotencyKey = req.header("idempotency-key")?.trim();
  if (!idempotencyKey) {
    res.status(400).json({
      error: {
        code: "missing_idempotency_key",
        message: "Envie o header Idempotency-Key para operações de escrita na Nexus Open API.",
      },
    });
    return;
  }

  const tenantId = getNexusApiContext(res)?.tenantId ?? null;
  const storeKey = buildStoreKey(tenantId, idempotencyKey);
  const fingerprint = buildFingerprint(req, tenantId);
  const existing = await getCached<PendingEntry>(storeKey);

  if (existing) {
    if (existing.fingerprint !== fingerprint) {
      res.setHeader("X-Idempotency-Status", "conflict");
      res.status(409).json({
        error: {
          code: "idempotency_key_conflict",
          message: "A mesma Idempotency-Key já foi usada com um payload diferente.",
        },
      });
      return;
    }

    if (!existing.completed) {
      res.setHeader("X-Idempotency-Status", "in_progress");
      res.status(409).json({
        error: {
          code: "idempotency_key_in_progress",
          message: "Já existe uma requisição em processamento com esta Idempotency-Key.",
        },
      });
      return;
    }

    res.setHeader("X-Idempotency-Status", "replayed");
    res.status(existing.response?.statusCode || 200).json(existing.response?.body ?? null);
    return;
  }

  await setCached<PendingEntry>(
    storeKey,
    {
      fingerprint,
      createdAt: Date.now(),
      completed: false,
    },
    IDEMPOTENCY_TTL_SECONDS,
  );

  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    if (res.statusCode >= 500) {
      void deleteCached(storeKey);
      res.setHeader("X-Idempotency-Status", "released");
      return originalJson(body);
    }

    const entry: PendingEntry = {
      fingerprint,
      createdAt: Date.now(),
      completed: true,
      response: {
        statusCode: res.statusCode,
        body,
        createdAt: Date.now(),
      },
    };

    void setCached(storeKey, entry, IDEMPOTENCY_TTL_SECONDS);
    res.setHeader("X-Idempotency-Status", "created");
    return originalJson(body);
  }) as Response["json"];

  next();
}
