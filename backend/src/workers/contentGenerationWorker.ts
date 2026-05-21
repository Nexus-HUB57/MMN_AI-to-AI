import { Worker, Job } from 'bullmq';
import { contentGenerationQueue, ContentGenerationJob } from '../config/queue';
import { logJobStart, logJobComplete, logJobFailed } from '../services/jobLogger';
import { notifyOwner } from '../_core/notification';
import { markCronHistoryCompleted, markCronHistoryFailed } from '../services/cronHistorySync';

/**
 * ContentGenerationWorker
 * Responsável por processar jobs de geração de conteúdo
 */
class ContentGenerationWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker('content_generation_queue', this.processJob.bind(this), {
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
      console.log(`[ContentGenerationWorker] Job ${job.id} completed`);
      void markCronHistoryCompleted(job, result);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`[ContentGenerationWorker] Job ${job?.id} failed:`, err);
      void markCronHistoryFailed(job, err);
    });

    this.worker.on('error', (err) => {
      console.error('[ContentGenerationWorker] Worker error:', err);
    });
  }

  private async processJob(job: Job<ContentGenerationJob>) {
    const logId = await logJobStart(
      job.id || 'unknown',
      'content_generation_queue',
      (job.data as ContentGenerationJob).type,
      job.data as unknown as Record<string, unknown>
    );

    try {
      console.log(`[ContentGenerationWorker] Processing job ${job.id}:`, job.data);

      let result: Record<string, unknown>;

      // Simular processamento baseado no tipo de job
      switch ((job.data as ContentGenerationJob).type) {
        case 'generateText':
          result = await this.generateText(job.data);
          break;
        case 'generateVariations':
          result = await this.generateVariations(job.data);
          break;
        case 'generateHashtags':
          result = await this.generateHashtags(job.data);
          break;
        case 'generateProductDescription':
          result = await this.generateProductDescription(job.data);
          break;
        case 'generateEmailSequence':
          result = await this.generateEmailSequence(job.data);
          break;
        default:
          throw new Error(`Unknown job type: ${job.data.type}`);
      }

      await logJobComplete(logId, job.id || 'unknown', result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await logJobFailed(logId, job.id || 'unknown', errorMessage);

      // Notificar proprietário sobre falha
      await notifyOwner({
        title: 'Falha em Job de Geração de Conteúdo',
        content: `Job ${job.id} falhou: ${errorMessage}`,
      });

      throw error;
    }
  }

  private async generateText(data: ContentGenerationJob): Promise<Record<string, unknown>> {
    // Implementar lógica de geração de texto
    console.log('[ContentGenerationWorker] Generating text for:', data);
    return {
      type: 'text',
      content: 'Generated text content',
      platform: data.platform,
    };
  }

  private async generateVariations(data: ContentGenerationJob): Promise<Record<string, unknown>> {
    // Implementar lógica de geração de variações
    console.log('[ContentGenerationWorker] Generating variations for:', data);
    return {
      type: 'variations',
      variations: ['Variation 1', 'Variation 2', 'Variation 3'],
    };
  }

  private async generateHashtags(data: ContentGenerationJob): Promise<Record<string, unknown>> {
    // Implementar lógica de geração de hashtags
    console.log('[ContentGenerationWorker] Generating hashtags for:', data);
    return {
      type: 'hashtags',
      hashtags: ['#tag1', '#tag2', '#tag3'],
    };
  }

  private async generateProductDescription(data: ContentGenerationJob): Promise<Record<string, unknown>> {
    // Implementar lógica de geração de descrição de produto
    console.log('[ContentGenerationWorker] Generating product description for:', data);
    return {
      type: 'productDescription',
      description: 'Generated product description',
    };
  }

  private async generateEmailSequence(data: ContentGenerationJob): Promise<Record<string, unknown>> {
    // Implementar lógica de geração de sequência de e-mail
    console.log('[ContentGenerationWorker] Generating email sequence for:', data);
    return {
      type: 'emailSequence',
      emails: [
        { subject: 'Email 1', body: 'Email body 1' },
        { subject: 'Email 2', body: 'Email body 2' },
      ],
    };
  }

  async start() {
    console.log('[ContentGenerationWorker] Starting...');
    // Worker já está ativo, apenas log
  }

  async stop() {
    console.log('[ContentGenerationWorker] Stopping...');
    await this.worker.close();
  }
}

// Inicializar e executar worker
const worker = new ContentGenerationWorker();
worker.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[ContentGenerationWorker] Received SIGTERM, shutting down gracefully');
  await worker.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[ContentGenerationWorker] Received SIGINT, shutting down gracefully');
  await worker.stop();
  process.exit(0);
});
