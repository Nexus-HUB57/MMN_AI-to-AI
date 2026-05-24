/**
 * Rate Limiting Middleware
 *
 * Implementação de rate limiting para proteção contra ataques DoS/DDoS
 * e controle de consumo de API.
 */

import { Request, Response, NextFunction } from 'express';

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

interface RateLimitOptions {
  windowMs: number;      // Janela de tempo em ms
  maxRequests: number;    // Máximo de requests por janela
  skipSuccessful?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: Request) => string;
  handler?: (req: Request, res: Response, next: NextFunction, options: RateLimitOptions) => void;
  skip?: (req: Request) => boolean;
  limit?: (req: Request, res: Response) => number;
  message?: string | ((req: Request) => string);
  statusCode?: number;
  draftHeaders?: boolean;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
  totalHits: number;
}

interface Store {
  increment(key: string, cb: (err: Error | null, record: RateLimitRecord) => void): void;
  decrement(key: string): void;
  resetKey(key: string): void;
  get(key: string): RateLimitRecord | undefined;
  resetAll(): void;
}

// ============================================================================
// IN-MEMORY STORE
// ============================================================================

export class MemoryStore implements Store {
  private storage = new Map<string, RateLimitRecord>();
  private intervalId: NodeJS.Timeout | null = null;

  constructor(private cleanupIntervalMs: number = 60000) {
    this.startCleanup();
  }

  private startCleanup(): void {
    this.intervalId = setInterval(() => {
      const now = Date.now();
      for (const [key, record] of this.storage.entries()) {
        if (record.resetTime < now) {
          this.storage.delete(key);
        }
      }
    }, this.cleanupIntervalMs);
  }

  increment(key: string, cb: (err: Error | null, record: RateLimitRecord) => void): void {
    const now = Date.now();
    let record = this.storage.get(key);

    if (!record || record.resetTime < now) {
      record = {
        count: 0,
        resetTime: now + this.getWindowMs(),
        totalHits: 0
      };
    }

    record.count++;
    record.totalHits++;
    this.storage.set(key, record);

    cb(null, record);
  }

  decrement(key: string): void {
    const record = this.storage.get(key);
    if (record && record.count > 0) {
      record.count--;
    }
  }

  resetKey(key: string): void {
    this.storage.delete(key);
  }

  get(key: string): RateLimitRecord | undefined {
    const record = this.storage.get(key);
    if (record && record.resetTime < Date.now()) {
      this.storage.delete(key);
      return undefined;
    }
    return record;
  }

  resetAll(): void {
    this.storage.clear();
  }

  private getWindowMs(): number {
    // Default window of 1 minute (can be overridden via options)
    return 60000;
  }

  setWindowMs(windowMs: number): void {
    this.getWindowMs = () => windowMs;
  }

  close(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// ============================================================================
// RATE LIMITER
// ============================================================================

export class RateLimiter {
  private store: Store;
  private options: Required<RateLimitOptions>;

  constructor(options: RateLimitOptions) {
    this.options = {
      windowMs: options.windowMs ?? 60000,
      maxRequests: options.maxRequests ?? 100,
      skipSuccessful: options.skipSuccessful ?? false,
      skipFailedRequests: options.skipFailedRequests ?? false,
      keyGenerator: options.keyGenerator ?? ((req: Request) => {
        return req.ip ?? req.socket.remoteAddress ?? 'unknown';
      }),
      handler: options.handler ?? ((req: Request, res: Response) => {
        res.status(429).json({
          error: 'Too Many Requests',
          message: typeof options.message === 'function' ? options.message(req) : (options.message ?? 'Rate limit exceeded'),
          retryAfter: Math.ceil(options.windowMs / 1000)
        });
      }),
      skip: options.skip ?? (() => false),
      limit: options.limit ?? (() => options.maxRequests ?? 100),
      message: options.message ?? 'Rate limit exceeded',
      statusCode: options.statusCode ?? 429,
      draftHeaders: options.draftHeaders ?? false,
      standardHeaders: options.standardHeaders ?? true,
      legacyHeaders: options.legacyHeaders ?? false
    };

    this.store = new MemoryStore();
    if (this.store instanceof MemoryStore) {
      this.store.setWindowMs(this.options.windowMs);
    }
  }

  middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (this.options.skip(req)) {
        next();
        return;
      }

      const key = this.options.keyGenerator(req);
      const max = this.options.limit(req, res);

      this.store.increment(key, (err, record) => {
        if (err) {
          console.error('Rate limiter error:', err);
          next();
          return;
        }

        const remaining = Math.max(0, max - record.count);
        const resetTime = new Date(record.resetTime);
        const isLimited = record.count > max;

        // Set headers
        if (this.options.standardHeaders) {
          res.setHeader('X-RateLimit-Limit', max);
          res.setHeader('X-RateLimit-Remaining', remaining);
          res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));
        }

        if (this.options.draftHeaders) {
          res.setHeader('RateLimit-Limit', max);
          res.setHeader('RateLimit-Remaining', remaining);
          res.setHeader('RateLimit-Reset', Math.ceil(record.resetTime / 1000));
        }

        if (isLimited) {
          if (this.options.legacyHeaders) {
            res.setHeader('Retry-After', Math.ceil((record.resetTime - Date.now()) / 1000));
          }
          this.options.handler(req, res, next, this.options);
          return;
        }

        next();
      });
    };
  }

  resetKey(key: string): void {
    this.store.resetKey(key);
  }

  resetAll(): void {
    this.store.resetAll();
  }

  getUsage(key: string): RateLimitRecord | undefined {
    return this.store.get(key);
  }
}

// ============================================================================
// PRESET CONFIGURAÇÕES
// ============================================================================

export const PRESETS = {
  // API geral - 100 requests por minuto
  api: {
    windowMs: 60000,
    maxRequests: 100,
    message: 'Too many API requests, please try again later'
  },

  // API estrita - 30 requests por minuto
  apiStrict: {
    windowMs: 60000,
    maxRequests: 30,
    message: 'API rate limit exceeded'
  },

  // Login - 5 attempts por minuto
  login: {
    windowMs: 60000,
    maxRequests: 5,
    message: 'Too many login attempts, please try again later'
  },

  // Payments - 10 requests por minuto
  payments: {
    windowMs: 60000,
    maxRequests: 10,
    message: 'Payment rate limit exceeded'
  },

  // AI Generation - 20 requests por minuto
  aiGeneration: {
    windowMs: 60000,
    maxRequests: 20,
    message: 'AI generation rate limit exceeded'
  },

  // Webhook - 200 requests por minuto
  webhook: {
    windowMs: 60000,
    maxRequests: 200,
    message: 'Webhook rate limit exceeded'
  },

  // Burst - 50 requests por 10 segundos
  burst: {
    windowMs: 10000,
    maxRequests: 50,
    message: 'Burst rate limit exceeded'
  }
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function createRateLimiter(preset: keyof typeof PRESETS): RateLimiter {
  return new RateLimiter(PRESETS[preset]);
}

export function createCustomRateLimiter(options: RateLimitOptions): RateLimiter {
  return new RateLimiter(options);
}

// IP-based key generator (consider X-Forwarded-For for proxies)
export function ipKeyGenerator(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

// User-based key generator (requires authentication middleware before this)
export function userKeyGenerator(req: Request): string {
  const user = (req as any).user;
  if (user?.id) {
    return `user:${user.id}`;
  }
  return ipKeyGenerator(req);
}

export default RateLimiter;