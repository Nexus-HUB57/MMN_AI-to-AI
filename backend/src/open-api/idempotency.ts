import { createHash } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
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

const idempotencyStore = new Map<string, PendingEntry>();
const IDEMPOTENCY_TTL_MS = Number(process.env.NEXUS_OPEN_API_IDEMPOTENCY_TTL_MS || 24 * 60 * 60 * 1000);

function cleanupExpiredEntries() {
  const timestamp = Date.now();
  for (const [key, entry] of idempotencyStore.entries()) {
    if (timestamp - entry.createdAt > IDEMPOTENCY_TTL_MS) {
      idempotencyStore.delete(key);
    }
  }
}

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

export function requireIdempotencyKey(req: Request, res: Response, next: NextFunction) {
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

  cleanupExpiredEntries();

  const tenantId = getNexusApiContext(res)?.tenantId ?? null;
  const scopedKey = `${tenantId ?? "public"}:${idempotencyKey}`;
  const fingerprint = buildFingerprint(req, tenantId);
  const existing = idempotencyStore.get(scopedKey);

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

  idempotencyStore.set(scopedKey, {
    fingerprint,
    createdAt: Date.now(),
    completed: false,
  });

  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    const current = idempotencyStore.get(scopedKey);
    if (current) {
      current.completed = true;
      current.response = {
        statusCode: res.statusCode,
        body,
        createdAt: Date.now(),
      };
      idempotencyStore.set(scopedKey, current);
    }
    res.setHeader("X-Idempotency-Status", "created");
    return originalJson(body);
  }) as Response["json"];

  next();
}
