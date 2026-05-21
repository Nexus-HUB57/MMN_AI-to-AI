import { Worker, Job } from 'bullmq';
import { commissionProcessingQueue, CommissionProcessingJob } from '../config/queue';
import { logJobStart, logJobComplete, logJobFailed } from '../services/jobLogger';
import { notifyOwner } from '../_core/notification';
import { markCronHistoryCompleted, markCronHistoryFailed } from '../services/cronHistorySync';
import {
  calculateCommissionsForPayment,
  confirmCommissions,
  updateAffiliateCommissionTotals,
} from "../services/commissions";
import { getDb } from "../../../database/schemas/db";
import { commissions as commissionsTable } from "../../../database/schemas/schema-final";
import { eq } from "drizzle-orm";

/**
 * CommissionProcessingWorker
 * Responsável por calcular e processar comissões
 */
class CommissionProcessingWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker('commission_processing_queue', this.processJob.bind(this), {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
      },
      concurrency: 3,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.worker.on('completed', (job, result) => {
      console.log(`[CommissionProcessingWorker] Job ${job.id} completed`);
      void markCronHistoryCompleted(job, result);
    });

    this.worker.on('failed', (job, err) => {
      void markCronHistoryFailed(job, err);
      console.error(`[CommissionProcessingWorker] Job ${job?.id} failed:`, err);
    });

    this.worker.on('error', (err) => {
      console.error('[CommissionProcessingWorker] Worker error:', err);
    });
  }

  private async processJob(job: Job<CommissionProcessingJob>) {
    const logId = await logJobStart(
      job.id || 'unknown',
      'commission_processing_queue',
      `commission_${job.data.commissionType}`,
      job.data as unknown as Record<string, unknown>
    );

    try {
      console.log(`[CommissionProcessingWorker] Processing job ${job.id}:`, job.data);

      const result = await this.processCommission(job.data);

      await logJobComplete(logId, job.id || 'unknown', result);

      // Notificar proprietário sobre comissão confirmada
      await notifyOwner({
        title: 'Comissão Processada',
        content: `Comissão de ${job.data.commissionType} no valor de R$ ${job.data.amount.toFixed(2)} foi processada para o usuário ${job.data.userId}`,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await logJobFailed(logId, job.id || 'unknown', errorMessage);

      // Notificar proprietário sobre falha
      await notifyOwner({
        title: 'Falha em Processamento de Comissão',
        content: `Job ${job.id} falhou: ${errorMessage}`,
      });

      throw error;
    }
  }

  private async processCommission(data: CommissionProcessingJob): Promise<Record<string, unknown>> {
    console.log('[CommissionProcessingWorker] Processing commission:', data);

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    if (data.commissionType === "payment") {
      const affiliateId = parseInt(data.userId);
      const paymentAmount = data.amount;

      // Calcular comissões em cascata
      const createdCommissions = await calculateCommissionsForPayment(
        affiliateId,
        paymentAmount
      );

      // Confirmar as comissões criadas
      const commissionIds = createdCommissions
        .map((c: any) => c.id)
        .filter(Boolean);
      if (commissionIds.length > 0) {
        await confirmCommissions(commissionIds);
      }

      // Atualizar totais de comissões para o afiliado
      await updateAffiliateCommissionTotals(affiliateId);

      return { status: "Comissões de pagamento processadas", createdCommissions };
    } else {
      // Lógica existente para outros tipos de comissão (direta, rede, bônus)
      // Validar dados de comissão
      if (!data.orderId || !data.userId || data.amount <= 0) {
        throw new Error('Invalid commission data');
      }

      // Calcular comissão baseada no tipo
      let commissionAmount = data.amount;
      let rate = 0;

      switch (data.commissionType) {
        case 'direct':
          rate = 0.10; // 10% para comissão direta
          break;
        case 'network':
          rate = 0.05; // 5% para comissão de rede
          break;
        case 'bonus':
          rate = 0.02; // 2% para bônus
          break;
      }

      commissionAmount = data.amount * rate;

      const result: Record<string, unknown> = {
        orderId: data.orderId,
        userId: data.userId,
        commissionType: data.commissionType,
        originalAmount: data.amount,
        commissionAmount,
        rate: `${(rate * 100).toFixed(1)}%`,
        status: 'processed',
        timestamp: new Date().toISOString(),
      };
      return result;
    }
  }

  async start() {
    console.log('[CommissionProcessingWorker] Starting...');
  }

  async stop() {
    console.log('[CommissionProcessingWorker] Stopping...');
    await this.worker.close();
  }
}

// Inicializar e executar worker
const worker = new CommissionProcessingWorker();
worker.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[CommissionProcessingWorker] Received SIGTERM, shutting down gracefully');
  await worker.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[CommissionProcessingWorker] Received SIGINT, shutting down gracefully');
  await worker.stop();
  process.exit(0);
});
