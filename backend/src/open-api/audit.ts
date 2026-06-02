import { randomUUID, createHash } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { getCached, setCached } from "../services/cache-service";
import { getNexusApiContext } from "./auth";

export interface NexusOpenApiAuditRecord {
  id: string;
  requestId: string;
  tenantId: string | null;
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  timestamp: string;
  ip: string | null;
  userAgent: string | null;
  idempotencyKey: string | null;
  idempotencyStatus: string | null;
  rateLimitKey: string | null;
  rateLimitLimit: number | null;
  rateLimitRemaining: number | null;
}

const AUDIT_LIMIT = Number(process.env.NEXUS_OPEN_API_AUDIT_BUFFER_SIZE || 500);
const AUDIT_TTL_SECONDS = Math.max(
  300,
  Math.ceil(Number(process.env.NEXUS_OPEN_API_AUDIT_TTL_MS || 7 * 24 * 60 * 60 * 1000) / 1000),
);

function readNumberHeader(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function buildAuditKey(tenantId?: string | null) {
  return tenantId ? `nexus:openapi:audit:tenant:${tenantId}` : "nexus:openapi:audit:global";
}

async function persistAuditRecord(record: NexusOpenApiAuditRecord) {
  const globalKey = buildAuditKey();
  const tenantKey = buildAuditKey(record.tenantId);

  const [globalRecords, tenantRecords] = await Promise.all([
    getCached<NexusOpenApiAuditRecord[]>(globalKey),
    record.tenantId ? getCached<NexusOpenApiAuditRecord[]>(tenantKey) : Promise.resolve(null),
  ]);

  const nextGlobal = [record, ...(globalRecords ?? [])].slice(0, AUDIT_LIMIT);
  const nextTenant = record.tenantId
    ? [record, ...((tenantRecords as NexusOpenApiAuditRecord[] | null) ?? [])].slice(0, AUDIT_LIMIT)
    : null;

  await Promise.all([
    setCached(globalKey, nextGlobal, AUDIT_TTL_SECONDS),
    record.tenantId && nextTenant ? setCached(tenantKey, nextTenant, AUDIT_TTL_SECONDS) : Promise.resolve(true),
  ]);
}

export async function listRecentOpenApiAuditRecords(tenantId?: string | null, limit = 50) {
  const records = (await getCached<NexusOpenApiAuditRecord[]>(buildAuditKey(tenantId))) ?? [];
  return records.slice(0, Math.max(1, Math.min(limit, 200)));
}

export function getOpenApiRequestId(res: Response): string | null {
  return (res.locals?.nexusOpenApiRequestId ?? null) as string | null;
}

export function createOpenApiAuditMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const startedAt = Date.now();
    const requestId = randomUUID();
    res.locals.nexusOpenApiRequestId = requestId;
    res.setHeader("X-Request-Id", requestId);

    res.on("finish", () => {
      const apiContext = getNexusApiContext(res);
      const record: NexusOpenApiAuditRecord = {
        id: createHash("sha1")
          .update(`${requestId}:${req.method}:${req.originalUrl}:${res.statusCode}:${startedAt}`)
          .digest("hex"),
        requestId,
        tenantId: apiContext?.tenantId ?? null,
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: res.statusCode,
        durationMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
        ip: req.ip || req.socket.remoteAddress || null,
        userAgent: req.header("user-agent") || null,
        idempotencyKey: req.header("idempotency-key") || null,
        idempotencyStatus: res.getHeader("X-Idempotency-Status")?.toString() || null,
        rateLimitKey: res.getHeader("X-RateLimit-Key")?.toString() || null,
        rateLimitLimit: readNumberHeader(res.getHeader("X-RateLimit-Limit")),
        rateLimitRemaining: readNumberHeader(res.getHeader("X-RateLimit-Remaining")),
      };

      void persistAuditRecord(record).catch((error) => {
        console.warn("[NexusOpenAPI] Falha ao persistir audit trail.", error);
      });

      console.log(
        JSON.stringify({
          level: "info",
          tag: "nexus-open-api-audit",
          ...record,
        }),
      );
    });

    next();
  };
}
