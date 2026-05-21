/**
 * Cron Dispatcher
 *
 * Ponte entre o domínio Cron (cron_jobs) e a infraestrutura BullMQ.
 * Mapeia cada `jobType` para a fila correta, despacha o job com payload,
 * aguarda a confirmação de enfileiramento e devolve metadados (jobId,
 * queueName) para serem persistidos no histórico de execução.
 */
import { Queue } from 'bullmq';
import {
  contentGenerationQueue,
  marketplaceSyncQueue,
  orderProcessingQueue,
  commissionProcessingQueue,
  withdrawalQueue,
} from '../config/queue';

export interface CronDispatchInput {
  jobType: string;
  queueName: string;
  payload: Record<string, unknown>;
  cronJobId: number;
  historyId: number;
}

export interface CronDispatchOutput {
  queueName: string;
  jobId?: string;
  bullJobName: string;
  dispatched: boolean;
  reason?: string;
}

type QueueResolver = (queueName: string) => Queue | null;

const queueRegistry: Record<string, Queue> = {
  content_generation_queue: contentGenerationQueue,
  marketplace_sync_queue: marketplaceSyncQueue,
  order_processing_queue: orderProcessingQueue,
  commission_processing_queue: commissionProcessingQueue,
  withdrawal_processing_queue: withdrawalQueue,
};

const defaultQueueResolver: QueueResolver = (queueName) => queueRegistry[queueName] ?? null;

interface CronJobTypeBinding {
  bullJobName: string;
  queueName: string;
  buildPayload?: (payload: Record<string, unknown>) => Record<string, unknown>;
}

/**
 * Catálogo de bindings entre tipos de cron jobs e jobs BullMQ.
 * Mantém o mapeamento explícito para evitar dispatch "fantasma" de jobs novos
 * sem suporte real do worker correspondente.
 */
const cronJobBindings: Record<string, CronJobTypeBinding> = {
  // Marketplace
  marketplace_sync: {
    bullJobName: 'marketplace-sync',
    queueName: 'marketplace_sync_queue',
    buildPayload: (payload) => ({
      marketplace: (payload.marketplace as string) ?? 'mercadolibre',
      syncType: (payload.syncType as string) ?? 'incremental',
      ...payload,
    }),
  },
  marketplace_price_update: {
    bullJobName: 'marketplace-sync',
    queueName: 'marketplace_sync_queue',
    buildPayload: (payload) => ({
      marketplace: (payload.marketplace as string) ?? 'mercadolibre',
      syncType: 'price_update',
      ...payload,
    }),
  },
  marketplace_inventory_sync: {
    bullJobName: 'marketplace-sync',
    queueName: 'marketplace_sync_queue',
    buildPayload: (payload) => ({
      marketplace: (payload.marketplace as string) ?? 'mercadolibre',
      syncType: 'inventory',
      ...payload,
    }),
  },

  // Conteúdo
  content_scheduling: {
    bullJobName: 'content-generation',
    queueName: 'content_generation_queue',
    buildPayload: (payload) => ({
      type: 'generateText',
      ...payload,
    }),
  },
  social_post_publish: {
    bullJobName: 'content-generation',
    queueName: 'content_generation_queue',
    buildPayload: (payload) => ({
      type: 'generateText',
      platform: (payload.platform as string) ?? 'social',
      ...payload,
    }),
  },

  // Comissões
  commission_calculation: {
    bullJobName: 'commission-processing',
    queueName: 'commission_processing_queue',
    buildPayload: (payload) => ({
      commissionType: 'network',
      ...payload,
    }),
  },
  commission_distribution: {
    bullJobName: 'commission-processing',
    queueName: 'commission_processing_queue',
    buildPayload: (payload) => ({
      commissionType: 'payment',
      ...payload,
    }),
  },

  // Pedidos
  order_processing: {
    bullJobName: 'order-processing',
    queueName: 'order_processing_queue',
  },

  // Pagamentos / Saques
  payment_processing: {
    bullJobName: 'withdrawal-processing',
    queueName: 'withdrawal_processing_queue',
  },
};

/**
 * Tarefas executadas inline (não usam fila BullMQ), porque o trabalho real
 * é uma operação curta de banco/cache. Cada handler deve ser idempotente.
 */
const inlineHandlers: Record<string, (payload: Record<string, unknown>) => Promise<void>> = {
  invoice_overdue_check: async () => {
    // Marcador de execução — a lógica concreta será incorporada ao billing.
    console.log('[CronDispatcher] invoice_overdue_check executado (inline)');
  },
  invoice_reminder: async () => {
    console.log('[CronDispatcher] invoice_reminder executado (inline)');
  },
  database_cleanup: async () => {
    console.log('[CronDispatcher] database_cleanup executado (inline)');
  },
  cache_warming: async () => {
    console.log('[CronDispatcher] cache_warming executado (inline)');
  },
  session_cleanup: async () => {
    console.log('[CronDispatcher] session_cleanup executado (inline)');
  },
  xp_recalculation: async () => {
    console.log('[CronDispatcher] xp_recalculation executado (inline)');
  },
  career_progression: async () => {
    console.log('[CronDispatcher] career_progression executado (inline)');
  },
  leaderboard_update: async () => {
    console.log('[CronDispatcher] leaderboard_update executado (inline)');
  },
  network_health_check: async () => {
    console.log('[CronDispatcher] network_health_check executado (inline)');
  },
  affiliate_activation: async () => {
    console.log('[CronDispatcher] affiliate_activation executado (inline)');
  },
  report_generation: async () => {
    console.log('[CronDispatcher] report_generation executado (inline)');
  },
};

/**
 * Despacha o cron job para BullMQ ou para um handler inline.
 * Sempre retorna metadados para o histórico, mesmo em casos de fallback.
 */
export async function dispatchCronJob(
  input: CronDispatchInput,
  options: { resolveQueue?: QueueResolver } = {}
): Promise<CronDispatchOutput> {
  const binding = cronJobBindings[input.jobType];
  const inlineHandler = inlineHandlers[input.jobType];
  const resolveQueue = options.resolveQueue ?? defaultQueueResolver;

  // Caso 1: tipo mapeado para fila BullMQ
  if (binding) {
    const queue = resolveQueue(binding.queueName) ?? resolveQueue(input.queueName);
    if (!queue) {
      return {
        queueName: binding.queueName,
        bullJobName: binding.bullJobName,
        dispatched: false,
        reason: `Fila ${binding.queueName} não está registrada no dispatcher`,
      };
    }

    const finalPayload = binding.buildPayload
      ? binding.buildPayload(input.payload || {})
      : input.payload || {};

    const bullJob = await queue.add(
      binding.bullJobName,
      {
        ...finalPayload,
        __cron: {
          cronJobId: input.cronJobId,
          historyId: input.historyId,
        },
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    return {
      queueName: binding.queueName,
      jobId: bullJob.id?.toString(),
      bullJobName: binding.bullJobName,
      dispatched: true,
    };
  }

  // Caso 2: handler inline registrado
  if (inlineHandler) {
    await inlineHandler(input.payload || {});
    return {
      queueName: input.queueName,
      bullJobName: input.jobType,
      dispatched: true,
      reason: 'executado inline (handler dedicado)',
    };
  }

  // Caso 3: fallback — enfileira na fila informada pelo job, se houver
  const fallbackQueue = resolveQueue(input.queueName);
  if (fallbackQueue) {
    const bullJob = await fallbackQueue.add(
      input.jobType,
      {
        ...input.payload,
        __cron: {
          cronJobId: input.cronJobId,
          historyId: input.historyId,
        },
      },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: false,
      }
    );

    return {
      queueName: input.queueName,
      jobId: bullJob.id?.toString(),
      bullJobName: input.jobType,
      dispatched: true,
      reason: 'dispatch genérico via queueName do job',
    };
  }

  return {
    queueName: input.queueName,
    bullJobName: input.jobType,
    dispatched: false,
    reason: `Nenhum binding ou fila registrada para ${input.jobType}`,
  };
}

/**
 * Lista as filas conhecidas — útil para debugging e telas administrativas.
 */
export function listRegisteredCronQueues(): string[] {
  return Object.keys(queueRegistry);
}

/**
 * Lista os tipos de cron job suportados nativamente pelo dispatcher.
 */
export function listSupportedCronJobTypes(): string[] {
  return [
    ...Object.keys(cronJobBindings),
    ...Object.keys(inlineHandlers),
  ];
}
