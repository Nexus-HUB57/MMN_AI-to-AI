import Redis from "ioredis";

/**
 * Serviço de Rate Limiting
 * Implementa controle de taxa de requisições por usuário e IP
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // em milissegundos
}

// Inicializar cliente Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
});

/**
 * Configurações de rate limit por endpoint
 */
export const RATE_LIMIT_CONFIG = {
  // Geração de conteúdo: 100 requisições por minuto
  generateContent: {
    maxRequests: 100,
    windowMs: 60 * 1000,
  },
  // Agendamento de posts: 50 requisições por minuto
  schedulePost: {
    maxRequests: 50,
    windowMs: 60 * 1000,
  },
  // Analytics: 200 requisições por minuto
  analytics: {
    maxRequests: 200,
    windowMs: 60 * 1000,
  },
  // Listar modelos: 500 requisições por minuto
  listModels: {
    maxRequests: 500,
    windowMs: 60 * 1000,
  },
  // Templates: 100 requisições por minuto
  templates: {
    maxRequests: 100,
    windowMs: 60 * 1000,
  },
};

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

/**
 * Verificar rate limit por usuário
 */
export async function checkRateLimit(
  userId: number,
  endpoint: string,
  config: RateLimitConfig = RATE_LIMIT_CONFIG.generateContent
): Promise<RateLimitResult> {
  const key = `ratelimit:user:${userId}:${endpoint}`;
  const now = Date.now();
  const windowStart = now - config.windowMs;

  try {
    // Obter contador atual
    const current = await redis.get(key);
    const count = current ? parseInt(current) : 0;

    if (count >= config.maxRequests) {
      // Limite excedido
      const ttl = await redis.pttl(key);
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(now + ttl),
        retryAfter: Math.ceil(ttl / 1000),
      };
    }

    // Incrementar contador
    const newCount = count + 1;
    const pipeline = redis.pipeline();

    if (count === 0) {
      // Primeira requisição na janela
      pipeline.setex(key, Math.ceil(config.windowMs / 1000), "1");
    } else {
      // Incrementar
      pipeline.incr(key);
    }

    await pipeline.exec();

    return {
      allowed: true,
      remaining: config.maxRequests - newCount,
      resetAt: new Date(now + config.windowMs),
    };
  } catch (error) {
    console.error(`[RateLimit] Error checking rate limit for ${key}:`, error);
    // Em caso de erro, permitir a requisição
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(Date.now() + config.windowMs),
    };
  }
}

/**
 * Verificar rate limit por IP
 */
export async function checkRateLimitByIP(
  ip: string,
  endpoint: string,
  config: RateLimitConfig = RATE_LIMIT_CONFIG.generateContent
): Promise<RateLimitResult> {
  const key = `ratelimit:ip:${ip}:${endpoint}`;

  try {
    const current = await redis.get(key);
    const count = current ? parseInt(current) : 0;

    if (count >= config.maxRequests) {
      const ttl = await redis.pttl(key);
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(Date.now() + ttl),
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
      resetAt: new Date(Date.now() + config.windowMs),
    };
  } catch (error) {
    console.error(`[RateLimit] Error checking rate limit for IP ${ip}:`, error);
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(Date.now() + config.windowMs),
    };
  }
}

/**
 * Resetar rate limit para um usuário
 */
export async function resetRateLimit(
  userId: number,
  endpoint: string
): Promise<boolean> {
  const key = `ratelimit:user:${userId}:${endpoint}`;
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`[RateLimit] Error resetting rate limit for ${key}:`, error);
    return false;
  }
}

/**
 * Obter estatísticas de rate limit
 */
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
    const current = await redis.get(key);
    const count = current ? parseInt(current) : 0;
    const ttl = await redis.pttl(key);

    return {
      current: count,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - count),
      resetAt: new Date(Date.now() + (ttl > 0 ? ttl : config.windowMs)),
    };
  } catch (error) {
    console.error(
      `[RateLimit] Error getting rate limit stats for ${key}:`,
      error
    );
    return {
      current: 0,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      resetAt: new Date(Date.now() + config.windowMs),
    };
  }
}

/**
 * Middleware para tRPC - Verificar rate limit
 */
export async function rateLimitMiddleware(
  userId: number,
  endpoint: string,
  ip?: string
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  const config =
    RATE_LIMIT_CONFIG[endpoint as keyof typeof RATE_LIMIT_CONFIG] ||
    RATE_LIMIT_CONFIG.generateContent;

  // Verificar rate limit por usuário
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

  // Se IP foi fornecido, também verificar rate limit por IP
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

export default redis;
