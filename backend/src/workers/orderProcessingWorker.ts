import { Worker, Job } from 'bullmq';
import { orderProcessingQueue, OrderProcessingJob } from '../config/queue';
import { logJobStart, logJobComplete, logJobFailed } from '../services/jobLogger';
import { notifyOwner } from '../_core/notification';
import { markCronHistoryCompleted, markCronHistoryFailed } from '../services/cronHistorySync';

/**
 * OrderProcessingWorker
 * Responsável por processar pedidos de dropshipping
 */
class OrderProcessingWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker('order_processing_queue', this.processJob.bind(this), {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
      },
      concurrency: 5,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.worker.on('completed', (job, result) => {
      console.log(`[OrderProcessingWorker] Job ${job.id} completed`);
      void markCronHistoryCompleted(job, result);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`[OrderProcessingWorker] Job ${job?.id} failed:`, err);
      void markCronHistoryFailed(job, err);
    });

    this.worker.on('error', (err) => {
      console.error('[OrderProcessingWorker] Worker error:', err);
    });
  }

  private async processJob(job: Job<OrderProcessingJob>) {
    const logId = await logJobStart(
      job.id || 'unknown',
      'order_processing_queue',
      `order_${job.data.status}`,
      job.data as unknown as Record<string, unknown>
    );

    try {
      console.log(`[OrderProcessingWorker] Processing job ${job.id}:`, job.data);

      const result = await this.processOrder(job.data);

      await logJobComplete(logId, job.id || 'unknown', result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await logJobFailed(logId, job.id || 'unknown', errorMessage);

      // Notificar proprietário sobre falha
      await notifyOwner({
        title: 'Falha em Processamento de Pedido',
        content: `Job ${job.id} falhou: ${errorMessage}`,
      });

      throw error;
    }
  }

  private async processOrder(data: OrderProcessingJob): Promise<Record<string, unknown>> {
    console.log('[OrderProcessingWorker] Processing order:', data);

    // Validar dados do pedido
    if (!data.orderId || !data.marketplace) {
      throw new Error('Invalid order data: missing orderId or marketplace');
    }

    // Simular processamento de pedido
    const result: Record<string, unknown> = {
      orderId: data.orderId,
      marketplace: data.marketplace,
      status: data.status,
      processed: true,
      timestamp: new Date().toISOString(),
    };

    // Se o status é "delivered", disparar processamento de comissão
    if (data.status === 'delivered') {
      console.log('[OrderProcessingWorker] Order delivered, commission processing triggered');
      result.commissionTriggered = true;
    }

    return result;
  }

  async start() {
    console.log('[OrderProcessingWorker] Starting...');
  }

  async stop() {
    console.log('[OrderProcessingWorker] Stopping...');
    await this.worker.close();
  }
}

// Inicializar e executar worker
const worker = new OrderProcessingWorker();
worker.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[OrderProcessingWorker] Received SIGTERM, shutting down gracefully');
  await worker.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[OrderProcessingWorker] Received SIGINT, shutting down gracefully');
  await worker.stop();
  process.exit(0);
});
