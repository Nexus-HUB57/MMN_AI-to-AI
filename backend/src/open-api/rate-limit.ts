import type { NextFunction, Request, Response } from "express";
import { createHash } from "node:crypto";
import { getNexusApiContext } from "./auth";

interface RateEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateEntry>();

function now() {
  return Date.now();
}

function cleanupExpiredEntries() {
  const timestamp = now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= timestamp) {
      rateLimitStore.delete(key);
    }
  }
}

function incrementRateLimit(key: string, windowMs: number) {
  cleanupExpiredEntries();
  const timestamp = now();
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= timestamp) {
    const fresh = { count: 1, resetAt: timestamp + windowMs };
    rateLimitStore.set(key, fresh);
    return fresh;
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return current;
}

function buildPublicRateLimitKey(req: Request) {
  return `public:${req.ip || req.socket.remoteAddress || "unknown"}`;
}

function buildTenantRateLimitKey(req: Request, res: Response) {
  const apiContext = getNexusApiContext(res);
  return `tenant:${apiContext?.tenantId || "unknown"}:${req.method}:${req.baseUrl || ""}${req.path}`;
}

function setRateHeaders(res: Response, key: string, limit: number, count: number, resetAt: number) {
  res.setHeader("X-RateLimit-Key", createHash("sha1").update(key).digest("hex").slice(0, 16));
  res.setHeader("X-RateLimit-Limit", String(limit));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, limit - count)));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(resetAt / 1000)));
}

function createRateLimitMiddleware(options: {
  windowMs: number;
  limit: number;
  keyBuilder: (req: Request, res: Response) => string;
  code: string;
  message: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = options.keyBuilder(req, res);
    const entry = incrementRateLimit(key, options.windowMs);
    setRateHeaders(res, key, options.limit, entry.count, entry.resetAt);

    if (entry.count > options.limit) {
      res.setHeader("Retry-After", String(Math.max(1, Math.ceil((entry.resetAt - now()) / 1000))));
      res.status(429).json({
        error: {
          code: options.code,
          message: options.message,
          details: {
            limit: options.limit,
            remaining: 0,
            resetAt: new Date(entry.resetAt).toISOString(),
          },
        },
      });
      return;
    }

    next();
  };
}

export function createPublicOpenApiRateLimiter() {
  const limit = Number(process.env.NEXUS_OPEN_API_PUBLIC_RATE_LIMIT || 120);
  const windowMs = Number(process.env.NEXUS_OPEN_API_PUBLIC_WINDOW_MS || 60_000);
  return createRateLimitMiddleware({
    windowMs,
    limit,
    keyBuilder: (req) => buildPublicRateLimitKey(req),
    code: "public_rate_limit_exceeded",
    message: "Muitas requisições públicas para a Nexus Open API. Tente novamente em instantes.",
  });
}

export function createTenantOpenApiRateLimiter() {
  const limit = Number(process.env.NEXUS_OPEN_API_TENANT_RATE_LIMIT || 60);
  const windowMs = Number(process.env.NEXUS_OPEN_API_TENANT_WINDOW_MS || 60_000);
  return createRateLimitMiddleware({
    windowMs,
    limit,
    keyBuilder: (req, res) => buildTenantRateLimitKey(req, res),
    code: "tenant_rate_limit_exceeded",
    message: "Limite de requisições da tenant excedido para a Nexus Open API.",
  });
}
