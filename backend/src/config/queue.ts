import { Queue, QueueEvents } from "bullmq";
import IORedis from "ioredis";

const redisAvailable = !!(process.env.REDIS_URL || process.env.REDIS_HOST);

export let redisClient: IORedis | null = null;

if (redisAvailable) {
  redisClient = new IORedis(
    process.env.REDIS_URL || {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      lazyConnect: true,
      enableOfflineQueue: false,
    } as any,
  );

  redisClient.on("error", (err) => {
    console.warn("[Redis] Connection error (filas desabilitadas):", err.message);
  });

  redisClient.on("connect", () => {
    console.log("[Redis] Conectado com sucesso");
  });
}

export async function connectRedis() {
  if (!redisClient) {
    console.warn("[Redis] Redis não configurado — filas desabilitadas");
    return;
  }
  try {
    if (redisClient.status === "wait") {
      await redisClient.connect();
    }
    console.log("[Redis] Conexão estabelecida");
  } catch (error) {
    console.warn("[Redis] Falha ao conectar — filas desabilitadas:", (error as Error).message);
  }
}

export async function disconnectRedis() {
  if (!redisClient) return;
  try {
    if (redisClient.status !== "end") {
      await redisClient.quit();
    }
    console.log("[Redis] Desconectado");
  } catch (error) {
    console.warn("[Redis] Falha ao desconectar:", (error as Error).message);
  }
}

const defaultQueueConfig = redisAvailable
  ? {
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
        lazyConnect: true,
        enableOfflineQueue: false,
      },
    }
  : null;

function makeQueue(name: string) {
  if (!defaultQueueConfig) return null;
  try {
    return new Queue(name, defaultQueueConfig);
  } catch {
    return null;
  }
}

function makeQueueEvents(name: string) {
  if (!defaultQueueConfig) return null;
  try {
    return new QueueEvents(name, defaultQueueConfig);
  } catch {
    return null;
  }
}

export const contentGenerationQueue = makeQueue("content_generation_queue");
export const marketplaceSyncQueue = makeQueue("marketplace_sync_queue");
export const orderProcessingQueue = makeQueue("order_processing_queue");
export const commissionProcessingQueue = makeQueue("commission_processing_queue");
export const withdrawalQueue = makeQueue("withdrawal_processing_queue");

export const contentGenerationQueueEvents = makeQueueEvents("content_generation_queue");
export const marketplaceSyncQueueEvents = makeQueueEvents("marketplace_sync_queue");
export const orderProcessingQueueEvents = makeQueueEvents("order_processing_queue");
export const commissionProcessingQueueEvents = makeQueueEvents("commission_processing_queue");
export const withdrawalQueueEvents = makeQueueEvents("withdrawal_processing_queue");

export interface ContentGenerationJob {
  type:
    | "generateText"
    | "generateVariations"
    | "generateHashtags"
    | "generateProductDescription"
    | "generateEmailSequence";
  productId?: string;
  platform?: string;
  tone?: string;
  context?: Record<string, unknown>;
}

export interface MarketplaceSyncJob {
  marketplace: "mercado_libre" | "shopee" | "hotmart";
  syncType: "full" | "incremental" | "price_update" | "inventory";
  sellerId?: string;
  accountId?: number;
  requestedByUserId?: number;
}

export interface OrderProcessingJob {
  orderId: string;
  marketplace: string;
  status: string;
  metadata?: Record<string, unknown>;
}

export interface CommissionProcessingJob {
  orderId: string;
  userId: string;
  amount: number;
  commissionType: "direct" | "network" | "bonus" | "payment";
  metadata?: Record<string, unknown>;
}

export interface WithdrawalJob {
  withdrawalId: number;
  affiliateId: number;
  userId: number;
  amount: number;
  pixKey: string;
  pixKeyType: string;
  holderName: string;
}

async function safeAdd(queue: Queue | null, jobName: string, job: unknown, options?: Record<string, unknown>) {
  if (!queue) {
    console.warn(`[Queue] Fila não disponível (Redis ausente) — job ${jobName} ignorado`);
    return null;
  }
  return queue.add(jobName, job, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: true,
    removeOnFail: false,
    ...options,
  });
}

export async function addContentGenerationJob(job: ContentGenerationJob, options?: Record<string, unknown>) {
  return safeAdd(contentGenerationQueue, "content-generation", job, options);
}

export async function addMarketplaceSyncJob(job: MarketplaceSyncJob, options?: Record<string, unknown>) {
  return safeAdd(marketplaceSyncQueue, "marketplace-sync", job, options);
}

export async function addOrderProcessingJob(job: OrderProcessingJob, options?: Record<string, unknown>) {
  return safeAdd(orderProcessingQueue, "order-processing", job, options);
}

export async function addCommissionProcessingJob(job: CommissionProcessingJob, options?: Record<string, unknown>) {
  return safeAdd(commissionProcessingQueue, "commission-processing", job, options);
}

export async function addWithdrawalJob(job: WithdrawalJob, options?: Record<string, unknown>) {
  return safeAdd(withdrawalQueue, "withdrawal-processing", job, options);
}
