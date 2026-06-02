import { randomUUID, createHash } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
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
const auditBuffer: NexusOpenApiAuditRecord[] = [];

function readNumberHeader(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function pushAuditRecord(record: NexusOpenApiAuditRecord) {
  auditBuffer.unshift(record);
  if (auditBuffer.length > AUDIT_LIMIT) {
    auditBuffer.length = AUDIT_LIMIT;
  }
}

export function listRecentOpenApiAuditRecords(tenantId?: string | null, limit = 50) {
  return auditBuffer
    .filter((record) => (tenantId ? record.tenantId === tenantId : true))
    .slice(0, Math.max(1, Math.min(limit, 200)));
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

      pushAuditRecord(record);
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
