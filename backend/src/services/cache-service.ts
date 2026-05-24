import Redis from "ioredis";

/**
 * Serviço de cache com fallback em memória.
 * Evita que o bootstrap fique preso tentando conectar ao Redis quando a
 * infraestrutura ainda não está de pé.
 */

type CacheEntry = {
  value: string;
  expiresAt: number;
};

const memoryCache = new Map<string, CacheEntry>();
let redisPromise: Promise<Redis | null> | null = null;
let redisUnavailableLogged = false;

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
            console.warn("[Cache] Redis indisponível; usando fallback em memória.", err);
          }
        });

        await client.connect();
        return client;
      } catch (error) {
        if (!redisUnavailableLogged) {
          redisUnavailableLogged = true;
          console.warn("[Cache] Redis indisponível; usando fallback em memória.", error);
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

function purgeExpiredMemory() {
  const timestamp = now();
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt <= timestamp) {
      memoryCache.delete(key);
    }
  }
}

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function patternToRegex(pattern: string) {
  return new RegExp(`^${escapeRegex(pattern).replace(/\\\*/g, ".*")}$`);
}

export async function getCached<T>(key: string): Promise<T | null> {
  purgeExpiredMemory();

  try {
    const redis = await getRedis();
    if (redis) {
      const cached = await redis.get(key);
      return cached ? (JSON.parse(cached) as T) : null;
    }
  } catch (error) {
    console.warn(`[Cache] Falha no Redis para ${key}; usando memória.`, error);
  }

  const entry = memoryCache.get(key);
  if (!entry || entry.expiresAt <= now()) {
    memoryCache.delete(key);
    return null;
  }

  return JSON.parse(entry.value) as T;
}

export async function setCached<T>(
  key: string,
  value: T,
  ttl: number = 3600
): Promise<boolean> {
  const serialized = JSON.stringify(value);

  try {
    const redis = await getRedis();
    if (redis) {
      await redis.setex(key, ttl, serialized);
      return true;
    }
  } catch (error) {
    console.warn(`[Cache] Falha ao salvar ${key} no Redis; usando memória.`, error);
  }

  memoryCache.set(key, {
    value: serialized,
    expiresAt: now() + ttl * 1000,
  });
  return true;
}

export async function deleteCached(key: string): Promise<boolean> {
  let deleted = false;

  try {
    const redis = await getRedis();
    if (redis) {
      await redis.del(key);
      deleted = true;
    }
  } catch (error) {
    console.warn(`[Cache] Falha ao deletar ${key} no Redis; usando memória.`, error);
  }

  deleted = memoryCache.delete(key) || deleted;
  return deleted;
}

export async function invalidateCachePattern(pattern: string): Promise<number> {
  let deleted = 0;

  try {
    const redis = await getRedis();
    if (redis) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        deleted += await redis.del(...keys);
      }
    }
  } catch (error) {
    console.warn(`[Cache] Falha ao invalidar padrão ${pattern} no Redis; usando memória.`, error);
  }

  const regex = patternToRegex(pattern);
  for (const key of Array.from(memoryCache.keys())) {
    if (regex.test(key)) {
      memoryCache.delete(key);
      deleted += 1;
    }
  }

  return deleted;
}

export async function getOrSet<T>(
  key: string,
  generator: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  const cached = await getCached<T>(key);
  if (cached !== null) {
    return cached;
  }

  const value = await generator();
  await setCached(key, value, ttl);
  return value;
}

export const CACHE_KEYS = {
  AVAILABLE_MODELS: "models:available",
  MODEL_INFO: (modelId: string) => `models:info:${modelId}`,
  MODEL_STATS: "models:stats",
  TEMPLATES_LIST: (userId: number) => `templates:list:${userId}`,
  TEMPLATE_DETAIL: (templateId: string) => `templates:detail:${templateId}`,
  SCHEDULED_POSTS: (userId: number) => `posts:scheduled:${userId}`,
  SCHEDULED_POST_DETAIL: (postId: string) => `posts:detail:${postId}`,
  ANALYTICS: (userId: number, period: string, platform?: string) =>
    `analytics:${userId}:${period}${platform ? `:${platform}` : ""}`,
  GENERATED_CONTENT: (userId: number) => `content:generated:${userId}`,
  MODELS_PATTERN: "models:*",
  TEMPLATES_PATTERN: (userId: number) => `templates:list:${userId}:*`,
  POSTS_PATTERN: (userId: number) => `posts:*:${userId}:*`,
  ANALYTICS_PATTERN: (userId: number) => `analytics:${userId}:*`,
};

export const CACHE_TTL = {
  MODELS: 3600,
  MODEL_INFO: 1800,
  MODEL_STATS: 300,
  TEMPLATES: 900,
  POSTS: 600,
  ANALYTICS: 600,
  CONTENT: 1800,
};

export async function clearAllCache(): Promise<boolean> {
  memoryCache.clear();

  try {
    const redis = await getRedis();
    if (redis) {
      await redis.flushdb();
    }
    return true;
  } catch (error) {
    console.warn("[Cache] Falha ao limpar Redis; memória foi limpa.", error);
    return true;
  }
}

export async function getCacheStats(): Promise<{
  dbSize: number;
  memoryUsage: string;
  connectedClients: number;
}> {
  purgeExpiredMemory();

  try {
    const redis = await getRedis();
    if (redis) {
      const info = await redis.info("stats");
      const dbSize = await redis.dbsize();
      return {
        dbSize,
        memoryUsage: info || "N/A",
        connectedClients: 1,
      };
    }
  } catch (error) {
    console.warn("[Cache] Falha ao obter stats do Redis; usando memória.", error);
  }

  return {
    dbSize: memoryCache.size,
    memoryUsage: `memory-map:${memoryCache.size}`,
    connectedClients: 0,
  };
}

export async function closeRedis(): Promise<void> {
  try {
    const redis = await getRedis();
    if (redis) {
      await redis.quit();
    }
  } catch (error) {
    console.warn("[Cache] Falha ao fechar conexão Redis.", error);
  }
}

export default {
  getCached,
  setCached,
  deleteCached,
  invalidateCachePattern,
  getOrSet,
  clearAllCache,
  getCacheStats,
  closeRedis,
};
