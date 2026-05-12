import { Queue, Worker, QueueEvents } from 'bullmq';
import { createClient } from 'redis';
import { ENV } from '../_core/env';

// Criar cliente Redis
export const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', (err) => {
  console.error('[Redis] Connection error:', err);
});

redisClient.on('connect', () => {
  console.log('[Redis] Connected successfully');
});

// Conectar ao Redis
export async function connectRedis() {
  try {
    await redisClient.connect();
    console.log('[Redis] Connection established');
  } catch (error) {
    console.error('[Redis] Failed to connect:', error);
    throw error;
  }
}

// Desconectar do Redis
export async function disconnectRedis() {
  try {
    await redisClient.quit();
    console.log('[Redis] Disconnected');
  } catch (error) {
    console.error('[Redis] Failed to disconnect:', error);
  }
}

// Configuração padrão para filas
const defaultQueueConfig = {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: null,
  },
};

// Criar filas
export const contentGenerationQueue = new Queue('content_generation_queue', defaultQueueConfig);
export const marketplaceSyncQueue = new Queue('marketplace_sync_queue', defaultQueueConfig);
export const orderProcessingQueue = new Queue('order_processing_queue', defaultQueueConfig);
export const commissionProcessingQueue = new Queue('commission_processing_queue', defaultQueueConfig);

// Criar eventos de fila para monitoramento
export const contentGenerationQueueEvents = new QueueEvents('content_generation_queue', defaultQueueConfig);
export const marketplaceSyncQueueEvents = new QueueEvents('marketplace_sync_queue', defaultQueueConfig);
export const orderProcessingQueueEvents = new QueueEvents('order_processing_queue', defaultQueueConfig);
export const commissionProcessingQueueEvents = new QueueEvents('commission_processing_queue', defaultQueueConfig);

// Tipos de jobs
export interface ContentGenerationJob {
  type: 'generateText' | 'generateVariations' | 'generateHashtags' | 'generateProductDescription' | 'generateEmailSequence';
  productId?: string;
  platform?: string;
  tone?: string;
  context?: Record<string, unknown>;
}

export interface MarketplaceSyncJob {
  marketplace: 'mercadolibre' | 'shopee' | 'hotmart';
  syncType: 'full' | 'incremental';
  sellerId?: string;
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
  commissionType: 'direct' | 'network' | 'bonus';
  metadata?: Record<string, unknown>;
}

// Função para adicionar job à fila
export async function addContentGenerationJob(job: ContentGenerationJob, options?: Record<string, unknown>) {
  return contentGenerationQueue.add('content-generation', job, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
    ...options,
  });
}

export async function addMarketplaceSyncJob(job: MarketplaceSyncJob, options?: Record<string, unknown>) {
  return marketplaceSyncQueue.add('marketplace-sync', job, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
    ...options,
  });
}

export async function addOrderProcessingJob(job: OrderProcessingJob, options?: Record<string, unknown>) {
  return orderProcessingQueue.add('order-processing', job, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
    ...options,
  });
}

export async function addCommissionProcessingJob(job: CommissionProcessingJob, options?: Record<string, unknown>) {
  return commissionProcessingQueue.add('commission-processing', job, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
    ...options,
  });
}
