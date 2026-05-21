import { Worker, Job } from 'bullmq';
import { withdrawalQueue, WithdrawalJob } from '../config/queue';
import { logJobStart, logJobComplete, logJobFailed } from '../services/jobLogger';
import { markCronHistoryCompleted, markCronHistoryFailed } from '../services/cronHistorySync';
import { notifyOwner, createNotification } from '../../../database/schemas/db';
import { getDb } from '../../../database/schemas/db';
import { withdrawalRequests, affiliateBalances, bankAccounts, transactionHistory } from '../../../database/schemas/banking-schema';
import { eq } from 'drizzle-orm';

/**
 * WithdrawalProcessingWorker
 * Responsável por processar saques PIX de forma assíncrona
 */
class WithdrawalProcessingWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker('withdrawal_processing_queue', this.processJob.bind(this), {
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
      console.log(`[WithdrawalProcessingWorker] Job ${job.id} completed`);
      void markCronHistoryCompleted(job, result);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`[WithdrawalProcessingWorker] Job ${job?.id} failed:`, err);
      void markCronHistoryFailed(job, err);
    });

    this.worker.on('error', (err) => {
      console.error('[WithdrawalProcessingWorker] Worker error:', err);
    });
  }

  private async processJob(job: Job<WithdrawalJob>) {
    const logId = await logJobStart(
      job.id || 'unknown',
      'withdrawal_processing_queue',
      'withdrawal_process',
      job.data as unknown as Record<string, unknown>
    );

    try {
      console.log(`[WithdrawalProcessingWorker] Processing withdrawal ${job.id}:`, job.data);

      const result = await this.processWithdrawal(job.data);

      await logJobComplete(logId, job.id || 'unknown', result);

      // Notificar afiliado sobre conclusão
      await createNotification({
        userId: job.data.userId,
        type: 'withdrawal_completed',
        title: 'Saque Concluído',
        content: `PIX de R$ ${(job.data.amount / 100).toFixed(2)} foi processado com sucesso.`,
        read: 0,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await logJobFailed(logId, job.id || 'unknown', errorMessage);

      // Notificar afiliado sobre falha
      await createNotification({
        userId: job.data.userId,
        type: 'withdrawal_failed',
        title: 'Saque Falhou',
        content: `Seu saque não pode ser processado: ${errorMessage}. Entre em contato com o suporte.`,
        read: 0,
      });

      // Reverter saldo bloqueado
      await this.revertBalance(job.data.withdrawalId, job.data.userId);

      throw error;
    }
  }

  private async processWithdrawal(data: WithdrawalJob): Promise<Record<string, unknown>> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    // Buscar dados do saque
    const withdrawal = await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.id, data.withdrawalId))
      .limit(1);

    if (withdrawal.length === 0) {
      throw new Error(`Withdrawal ${data.withdrawalId} not found`);
    }

    const withdrawalData = withdrawal[0];

    // Buscar dados da conta bancária
    const bankAccount = await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.id, withdrawalData.bankAccountId))
      .limit(1);

    if (bankAccount.length === 0) {
      throw new Error(`Bank account ${withdrawalData.bankAccountId} not found`);
    }

    const account = bankAccount[0];

    // Simular envio de PIX
    // Em produção, aqui seria a integração com a API do banco
    const transactionId = await this.sendPIX(
      account.pixKey || '',
      account.pixKeyType || 'cpf',
      withdrawalData.netAmount,
      account.holderName || 'Affiliate'
    );

    // Atualizar status do saque
    await db
      .update(withdrawalRequests)
      .set({
        status: 'completed',
        completedAt: new Date(),
        transactionId,
      })
      .where(eq(withdrawalRequests.id, data.withdrawalId));

    // Atualizar saldo: mover do pendente para baixa total
    const balance = await db
      .select()
      .from(affiliateBalances)
      .where(eq(affiliateBalances.affiliateId, data.affiliateId))
      .limit(1);

    if (balance.length > 0) {
      await db
        .update(affiliateBalances)
        .set({
          pendingBalance: balance[0].pendingBalance - data.amount,
          totalWithdrawn: balance[0].totalWithdrawn + withdrawalData.netAmount,
          lastWithdrawalAt: new Date(),
        })
        .where(eq(affiliateBalances.affiliateId, data.affiliateId));

      // Registrar transação final
      await db.insert(transactionHistory).values({
        affiliateId: data.affiliateId,
        type: 'withdrawal',
        amount: -withdrawalData.netAmount,
        balanceBefore: balance[0].availableBalance + balance[0].pendingBalance,
        balanceAfter: balance[0].availableBalance + balance[0].pendingBalance - data.amount,
        status: 'completed',
        source: 'withdrawal',
        sourceId: data.withdrawalId,
        description: `Saque PIX realizado: R$ ${(withdrawalData.netAmount / 100).toFixed(2)}`,
        referenceCode: transactionId,
      });
    }

    return {
      withdrawalId: data.withdrawalId,
      transactionId,
      status: 'completed',
      amount: withdrawalData.netAmount,
      processedAt: new Date().toISOString(),
    };
  }

  private async sendPIX(
    pixKey: string,
    pixKeyType: string,
    amount: number,
    holderName: string
  ): Promise<string> {
    // Simulação de envio PIX
    // Em produção, substituir por integração real com API bancária (ex: Nubank, Inter, etc.)

    console.log(`[PIX] Sending R$ ${(amount / 100).toFixed(2)} to ${pixKeyType}: ${pixKey} (${holderName})`);

    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Gerar ID de transação único
    const transactionId = `PIX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    console.log(`[PIX] Transaction ${transactionId} completed successfully`);

    return transactionId;
  }

  private async revertBalance(withdrawalId: number, userId: number): Promise<void> {
    const db = await getDb();
    if (!db) return;

    // Buscar dados do saque
    const withdrawal = await db
      .select()
      .from(withdrawalRequests)
      .where(eq(withdrawalRequests.id, withdrawalId))
      .limit(1);

    if (withdrawal.length === 0) return;

    const withdrawalData = withdrawal[0];

    // Reverter saldo bloqueado
    const balance = await db
      .select()
      .from(affiliateBalances)
      .where(eq(affiliateBalances.affiliateId, withdrawalData.affiliateId))
      .limit(1);

    if (balance.length > 0) {
      await db
        .update(affiliateBalances)
        .set({
          availableBalance: balance[0].availableBalance + withdrawalData.amount,
          pendingBalance: balance[0].pendingBalance - withdrawalData.amount,
        })
        .where(eq(affiliateBalances.affiliateId, withdrawalData.affiliateId));
    }
  }

  async start() {
    console.log('[WithdrawalProcessingWorker] Starting...');
  }

  async stop() {
    console.log('[WithdrawalProcessingWorker] Stopping...');
    await this.worker.close();
  }
}

// Inicializar e executar worker
const worker = new WithdrawalProcessingWorker();
worker.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('[WithdrawalProcessingWorker] Received SIGTERM, shutting down gracefully');
  await worker.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[WithdrawalProcessingWorker] Received SIGINT, shutting down gracefully');
  await worker.stop();
  process.exit(0);
});