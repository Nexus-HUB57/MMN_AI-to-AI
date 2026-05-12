import { Worker, Job } from 'bullmq';
import { marketplaceSyncQueue, MarketplaceSyncJob } from '../config/queue';
import { logJobStart, logJobComplete, logJobFailed } from '../services/jobLogger';
import { notifyOwner } from '../_core/notification';

/**
 * MarketplaceSyncWorker
 * Responsável por sincronizar produtos de marketplaces
 */
class MarketplaceSyncWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker('marketplace_sync_queue', this.processJob.bind(this), {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
      },
      concurrency: 2,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.worker.on('completed', (job) => {
      console.log(`[MarketplaceSyncWorker] Job ${job.id} completed`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`[MarketplaceSyncWorker] Job ${job?.id} failed:`, err);
    });

    this.worker.on('error', (err) => {
      console.error('[MarketplaceSyncWorker] Worker error:', err);
    });
  }

  private async processJob(job: Job<MarketplaceSyncJob>) {
    const logId = await logJobStart(
      job.id || 'unknown',
      'marketplace_sync_queue',
      `sync_${job.data.marketplace}`,
      job.data as unknown as Record<string, unknown>
    );

    try {
      console.log(`[MarketplaceSyncWorker] Processing job ${job.id}:`, job.data);

      let result: Record<string, unknown>;

      // Processar sincronização baseada no marketplace
      switch (job.data.marketplace) {
        case 'mercadolibre':
          result = await this.syncMercadoLibre(job.data);
          break;
        case 'shopee':
          result = await this.syncShopee(job.data);
          break;
        case 'hotmart':
          result = await this.syncHotmart(job.data);
          break;
        default:
          throw new Error(`Unknown marketplace: ${job.data.marketplace}`);
      }

      await logJobComplete(logId, job.id || 'unknown', result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await logJobFailed(logId, job.id || 'unknown', errorMessage);

      // Notificar proprietário sobre falha
      await notifyOwner({
        title: 'Falha em Sincronização de Marketplace',
        content: `Job ${job.id} falhou: ${errorMessage}`,
      });

      throw error;
    }
  }

  private async syncMercadoLibre(data: MarketplaceSyncJob): Promise<Record<string, unknown>> {
    console.log('[MarketplaceSyncWorker] Syncing Mercado Livre:', data);
    // Implementar lógica de sincronização com Mercado Livre
    return {
      marketplace: 'mercadolibre',
      syncType: data.syncType,
      productsSync: 42,
      timestamp: new Date().toISOString(),
    };
  }

  private async syncShopee(data: MarketplaceSyncJob): Promise<Record<string, unknown>> {
    console.log('[MarketplaceSyncWorker] Syncing Shopee:', data);
    // Implementar lógica de sincronização com Shopee
    return {
      marketplace: 'shopee',
      syncType: data.syncType,
      productsSync: 38,
      timestamp: new Date().toISOString(),
    };
  }

  private async syncHotmart(data: MarketplaceSyncJob): Promise<Record<string, unknown>> {
    console.log('[MarketplaceSyncWorker] Syncing Hotmart:', data);
    // Implementar lógica de sincronização com Hotmart
    return {
      marketplace: 'hotmart',
      syncType: data.syncType,
      productsSync: 15,
      timestamp: new Date().toISOString(),
    };
  }

  async start() {
    console.log('[MarketplaceSyncWorker] Starting...');
  }

  async stop() {
    console.log('[MarketplaceSyncWorker] Stopping...');
    await this.worker.close();
  }
}

// Inicializar e executar worker
const worker = new MarketplaceSyncWorker();
worker.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[MarketplaceSyncWorker] Received SIGTERM, shutting down gracefully');
  await worker.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[MarketplaceSyncWorker] Received SIGINT, shutting down gracefully');
  await worker.stop();
  process.exit(0);
});
