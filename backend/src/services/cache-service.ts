import Redis from "ioredis";

/**
 * Serviço de Cache com Redis
 * Implementa cache para respostas de APIs e queries
 */

interface CacheConfig {
  ttl: number; // Time to live em segundos
  key: string;
}

// Inicializar cliente Redis
const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("error", (err) => {
  console.error("[Cache] Redis connection error:", err);
});

redis.on("connect", () => {
  console.log("[Cache] Redis connected successfully");
});

/**
 * Obter valor do cache
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await redis.get(key);
    if (!cached) return null;

    return JSON.parse(cached) as T;
  } catch (error) {
    console.error(`[Cache] Error getting cache for key ${key}:`, error);
    return null;
  }
}

/**
 * Salvar valor no cache
 */
export async function setCached<T>(
  key: string,
  value: T,
  ttl: number = 3600
): Promise<boolean> {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[Cache] Error setting cache for key ${key}:`, error);
    return false;
  }
}

/**
 * Deletar valor do cache
 */
export async function deleteCached(key: string): Promise<boolean> {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`[Cache] Error deleting cache for key ${key}:`, error);
    return false;
  }
}

/**
 * Invalidar cache por padrão (ex: "models:*")
 */
export async function invalidateCachePattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length === 0) return 0;

    const deleted = await redis.del(...keys);
    console.log(`[Cache] Invalidated ${deleted} keys matching pattern ${pattern}`);
    return deleted;
  } catch (error) {
    console.error(
      `[Cache] Error invalidating cache pattern ${pattern}:`,
      error
    );
    return 0;
  }
}

/**
 * Obter ou gerar valor (com fallback)
 */
export async function getOrSet<T>(
  key: string,
  generator: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  try {
    // Tentar obter do cache
    const cached = await getCached<T>(key);
    if (cached) {
      console.log(`[Cache] Cache hit for key ${key}`);
      return cached;
    }

    // Gerar novo valor
    console.log(`[Cache] Cache miss for key ${key}, generating new value`);
    const value = await generator();

    // Salvar no cache
    await setCached(key, value, ttl);

    return value;
  } catch (error) {
    console.error(`[Cache] Error in getOrSet for key ${key}:`, error);
    // Fallback: gerar sem cache
    return generator();
  }
}

/**
 * Cache Keys - Constantes para chaves de cache
 */
export const CACHE_KEYS = {
  // Modelos de IA
  AVAILABLE_MODELS: "models:available",
  MODEL_INFO: (modelId: string) => `models:info:${modelId}`,
  MODEL_STATS: "models:stats",

  // Templates
  TEMPLATES_LIST: (userId: number) => `templates:list:${userId}`,
  TEMPLATE_DETAIL: (templateId: string) => `templates:detail:${templateId}`,

  // Posts agendados
  SCHEDULED_POSTS: (userId: number) => `posts:scheduled:${userId}`,
  SCHEDULED_POST_DETAIL: (postId: string) => `posts:detail:${postId}`,

  // Analytics
  ANALYTICS: (userId: number, period: string, platform?: string) =>
    `analytics:${userId}:${period}${platform ? `:${platform}` : ""}`,

  // Conteúdo gerado
  GENERATED_CONTENT: (userId: number) => `content:generated:${userId}`,

  // Padrões para invalidação
  MODELS_PATTERN: "models:*",
  TEMPLATES_PATTERN: (userId: number) => `templates:list:${userId}:*`,
  POSTS_PATTERN: (userId: number) => `posts:*:${userId}:*`,
  ANALYTICS_PATTERN: (userId: number) => `analytics:${userId}:*`,
};

/**
 * TTL Defaults - Tempos de expiração padrão
 */
export const CACHE_TTL = {
  MODELS: 3600, // 1 hora
  MODEL_INFO: 1800, // 30 minutos
  MODEL_STATS: 300, // 5 minutos
  TEMPLATES: 900, // 15 minutos
  POSTS: 600, // 10 minutos
  ANALYTICS: 600, // 10 minutos
  CONTENT: 1800, // 30 minutos
};

/**
 * Limpar todo o cache (apenas para desenvolvimento)
 */
export async function clearAllCache(): Promise<boolean> {
  try {
    await redis.flushdb();
    console.log("[Cache] All cache cleared");
    return true;
  } catch (error) {
    console.error("[Cache] Error clearing all cache:", error);
    return false;
  }
}

/**
 * Obter estatísticas de cache
 */
export async function getCacheStats(): Promise<{
  dbSize: number;
  memoryUsage: string;
  connectedClients: number;
}> {
  try {
    const info = await redis.info("stats");
    const dbSize = await redis.dbsize();

    return {
      dbSize,
      memoryUsage: info || "N/A",
      connectedClients: 1,
    };
  } catch (error) {
    console.error("[Cache] Error getting cache stats:", error);
    return {
      dbSize: 0,
      memoryUsage: "Error",
      connectedClients: 0,
    };
  }
}

/**
 * Fechar conexão com Redis
 */
export async function closeRedis(): Promise<void> {
  try {
    await redis.quit();
    console.log("[Cache] Redis connection closed");
  } catch (error) {
    console.error("[Cache] Error closing Redis connection:", error);
  }
}

export default redis;
