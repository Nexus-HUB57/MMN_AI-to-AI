/**
 * Rate limiter em memória para endpoints PIX (Epic 10.11.1 — Sprint 10.7)
 *
 * Não requer dependências externas — usa Map<ip, WindowEntry>.
 * Configurado para bloquear abuso em webhooks e geração de QR Code.
 */
import type { Request, Response, NextFunction } from "express";

interface WindowEntry {
  count: number;
  resetAt: number;
}

const windows = new Map<string, WindowEntry>();

function resolveIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress ?? "unknown";
}

function cleanupStale() {
  const now = Date.now();
  for (const [key, entry] of windows) {
    if (entry.resetAt <= now) windows.delete(key);
  }
}

let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 60_000;

/**
 * Cria um middleware de rate limiting em memória por IP.
 *
 * @param windowMs  — Janela em milissegundos (padrão: 60 s)
 * @param maxRequests — Máximo de requisições por janela (padrão: 30)
 * @param namespace — Prefixo de namespace para evitar colisões entre rotas (padrão: "default")
 */
export function createPixRateLimiter(options?: {
  windowMs?: number;
  maxRequests?: number;
  namespace?: string;
}) {
  const windowMs = options?.windowMs ?? 60_000;
  const maxRequests = options?.maxRequests ?? 30;
  const namespace = options?.namespace ?? "default";

  return function pixRateLimiterMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const now = Date.now();

    // Limpeza periódica de entradas expiradas
    if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
      cleanupStale();
      lastCleanup = now;
    }

    const ip = resolveIp(req);
    const key = `${namespace}:${ip}`;
    const entry = windows.get(key);

    if (!entry || entry.resetAt <= now) {
      windows.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    entry.count += 1;

    if (entry.count > maxRequests) {
      const retryAfterSecs = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSecs));
      res.setHeader("X-RateLimit-Limit", String(maxRequests));
      res.setHeader("X-RateLimit-Remaining", "0");
      res.setHeader("X-RateLimit-Reset", String(Math.floor(entry.resetAt / 1000)));
      res.status(429).json({
        error: "Too Many Requests",
        message: `Rate limit excedido. Tente novamente em ${retryAfterSecs}s.`,
        retryAfter: retryAfterSecs,
      });
      return;
    }

    res.setHeader("X-RateLimit-Limit", String(maxRequests));
    res.setHeader("X-RateLimit-Remaining", String(maxRequests - entry.count));
    res.setHeader("X-RateLimit-Reset", String(Math.floor(entry.resetAt / 1000)));
    next();
  };
}

/** Pré-configurados: webhook PIX (estrito) e geração de QR (moderado) */
export const pixWebhookRateLimiter = createPixRateLimiter({
  windowMs: 60_000,
  maxRequests: 100,
  namespace: "pix-webhook",
});

export const pixQrRateLimiter = createPixRateLimiter({
  windowMs: 60_000,
  maxRequests: 20,
  namespace: "pix-qr",
});
