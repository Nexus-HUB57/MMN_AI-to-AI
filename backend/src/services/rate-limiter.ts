import Redis from "ioredis";

/**
 * Serviço de rate limit com fallback em memória.
 * Não abre conexão Redis no carregamento do módulo para não bloquear o runtime
 * bootstrap quando a infraestrutura ainda não está disponível.
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

type MemoryRateEntry = {
  count: number;
  expiresAt: number;
};

const memoryRateLimits = new Map<string, MemoryRateEntry>();
let redisPromise: Promise<Redis | null> | null = null;
let redisUnavailableLogged = false;

export const RATE_LIMIT_CONFIG = {
  generateContent: { maxRequests: 100, windowMs: 60 * 1000 },
  schedulePost: { maxRequests: 50, windowMs: 60 * 1000 },
  analytics: { maxRequests: 200, windowMs: 60 * 1000 },
  listModels: { maxRequests: 500, windowMs: 60 * 1000 },
  templates: { maxRequests: 100, windowMs: 60 * 1000 },
};

async function getRedis(): Promise<Redis | null> {
  const redisUrl = process.env.REDIS_URL;
  const redisHost = process.env.REDIS_HOST;

  if (!redisUrl && !redisHost) {
    return null;
  }

  if (!redisPromise) {
    redisPromise = (async () => {
      try {
        const client = redisUrl
          ? new Redis(redisUrl, {
              lazyConnect: true,
              maxRetriesPerRequest: 1,
              enableOfflineQueue: false,
            })
          : new Redis({
              host: redisHost,
              port: parseInt(process.env.REDIS_PORT || "6379", 10),
              lazyConnect: true,
              maxRetriesPerRequest: 1,
              enableOfflineQueue: false,
            });

        client.on("error", (err) => {
          if (!redisUnavailableLogged) {
            redisUnavailableLogged = true;
            console.warn("[RateLimit] Redis indisponível; usando fallback em memória.", err);
          }
        });

        await client.connect();
        return client;
      } catch (error) {
        if (!redisUnavailableLogged) {
          redisUnavailableLogged = true;
          console.warn("[RateLimit] Redis indisponível; usando fallback em memória.", error);
        }
        return null;
      }
    })();
  }

  return redisPromise;
}

function now() {
  return Date.now();
}

function cleanupMemory() {
  const timestamp = now();
  for (const [key, entry] of memoryRateLimits.entries()) {
    if (entry.expiresAt <= timestamp) {
      memoryRateLimits.delete(key);
    }
  }
}

async function checkRateLimitInMemory(
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  cleanupMemory();

  const timestamp = now();
  const existing = memoryRateLimits.get(key);

  if (!existing || existing.expiresAt <= timestamp) {
    memoryRateLimits.set(key, {
      count: 1,
      expiresAt: timestamp + config.windowMs,
    });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: new Date(timestamp + config.windowMs),
    };
  }

  if (existing.count >= config.maxRequests) {
    const retryAfterMs = existing.expiresAt - timestamp;
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(existing.expiresAt),
      retryAfter: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  existing.count += 1;
  memoryRateLimits.set(key, existing);

  return {
    allowed: true,
    remaining: config.maxRequests - existing.count,
    resetAt: new Date(existing.expiresAt),
  };
}

export async function checkRateLimit(
  userId: number,
  endpoint: string,
  config: RateLimitConfig = RATE_LIMIT_CONFIG.generateContent
): Promise<RateLimitResult> {
  const key = `ratelimit:user:${userId}:${endpoint}`;

  try {
    const redis = await getRedis();
    if (redis) {
      const current = await redis.get(key);
      const count = current ? parseInt(current, 10) : 0;

      if (count >= config.maxRequests) {
        const ttl = await redis.pttl(key);
        return {
          allowed: false,
          remaining: 0,
          resetAt: new Date(now() + ttl),
          retryAfter: Math.ceil(ttl / 1000),
        };
      }

      const newCount = count + 1;
      const pipeline = redis.pipeline();
      if (count === 0) {
        pipeline.setex(key, Math.ceil(config.windowMs / 1000), "1");
      } else {
        pipeline.incr(key);
      }
      await pipeline.exec();

      return {
        allowed: true,
        remaining: config.maxRequests - newCount,
        resetAt: new Date(now() + config.windowMs),
      };
    }
  } catch (error) {
    console.warn(`[RateLimit] Falha no Redis para ${key}; usando memória.`, error);
  }

  return checkRateLimitInMemory(key, config);
}

export async function checkRateLimitByIP(
  ip: string,
  endpoint: string,
  config: RateLimitConfig = RATE_LIMIT_CONFIG.generateContent
): Promise<RateLimitResult> {
  const key = `ratelimit:ip:${ip}:${endpoint}`;

  try {
    const redis = await getRedis();
    if (redis) {
      const current = await redis.get(key);
      const count = current ? parseInt(current, 10) : 0;

      if (count >= config.maxRequests) {
        const ttl = await redis.pttl(key);
        return {
          allowed: false,
          remaining: 0,
          resetAt: new Date(now() + ttl),
          retryAfter: Math.ceil(ttl / 1000),
        };
      }

      const newCount = count + 1;
      const pipeline = redis.pipeline();
      if (count === 0) {
        pipeline.setex(key, Math.ceil(config.windowMs / 1000), "1");
      } else {
        pipeline.incr(key);
      }
      await pipeline.exec();

      return {
        allowed: true,
        remaining: config.maxRequests - newCount,
        resetAt: new Date(now() + config.windowMs),
      };
    }
  } catch (error) {
    console.warn(`[RateLimit] Falha no Redis para IP ${ip}; usando memória.`, error);
  }

  return checkRateLimitInMemory(key, config);
}

export async function resetRateLimit(
  userId: number,
  endpoint: string
): Promise<boolean> {
  const key = `ratelimit:user:${userId}:${endpoint}`;
  memoryRateLimits.delete(key);

  try {
    const redis = await getRedis();
    if (redis) {
      await redis.del(key);
    }
    return true;
  } catch (error) {
    console.warn(`[RateLimit] Falha ao resetar ${key} no Redis.`, error);
    return true;
  }
}

export async function getRateLimitStats(
  userId: number,
  endpoint: string
): Promise<{
  current: number;
  limit: number;
  remaining: number;
  resetAt: Date;
}> {
  const key = `ratelimit:user:${userId}:${endpoint}`;
  const config =
    RATE_LIMIT_CONFIG[endpoint as keyof typeof RATE_LIMIT_CONFIG] ||
    RATE_LIMIT_CONFIG.generateContent;

  try {
    const redis = await getRedis();
    if (redis) {
      const current = await redis.get(key);
      const count = current ? parseInt(current, 10) : 0;
      const ttl = await redis.pttl(key);
      return {
        current: count,
        limit: config.maxRequests,
        remaining: Math.max(0, config.maxRequests - count),
        resetAt: new Date(now() + (ttl > 0 ? ttl : config.windowMs)),
      };
    }
  } catch (error) {
    console.warn(`[RateLimit] Falha ao obter stats de ${key} no Redis.`, error);
  }

  cleanupMemory();
  const memory = memoryRateLimits.get(key);
  const current = memory?.count || 0;
  const expiresAt = memory?.expiresAt || now() + config.windowMs;

  return {
    current,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - current),
    resetAt: new Date(expiresAt),
  };
}

export async function rateLimitMiddleware(
  userId: number,
  endpoint: string,
  ip?: string
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  const config =
    RATE_LIMIT_CONFIG[endpoint as keyof typeof RATE_LIMIT_CONFIG] ||
    RATE_LIMIT_CONFIG.generateContent;

  const userLimit = await checkRateLimit(userId, endpoint, config);
  if (!userLimit.allowed) {
    return {
      allowed: false,
      headers: {
        "X-RateLimit-Limit": config.maxRequests.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": userLimit.resetAt.toISOString(),
        "Retry-After": (userLimit.retryAfter || 60).toString(),
      },
    };
  }

  if (ip) {
    const ipLimit = await checkRateLimitByIP(ip, endpoint, config);
    if (!ipLimit.allowed) {
      return {
        allowed: false,
        headers: {
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": ipLimit.resetAt.toISOString(),
          "Retry-After": (ipLimit.retryAfter || 60).toString(),
        },
      };
    }
  }

  return {
    allowed: true,
    headers: {
      "X-RateLimit-Limit": config.maxRequests.toString(),
      "X-RateLimit-Remaining": userLimit.remaining.toString(),
      "X-RateLimit-Reset": userLimit.resetAt.toISOString(),
    },
  };
}

export default {
  RATE_LIMIT_CONFIG,
  checkRateLimit,
  checkRateLimitByIP,
  resetRateLimit,
  getRateLimitStats,
  rateLimitMiddleware,
};
