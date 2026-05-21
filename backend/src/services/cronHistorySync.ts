/**
 * Cron History Sync
 *
 * Helper compartilhado entre os workers BullMQ para fechar o ciclo
 * de observabilidade do domínio Cron. Cada worker, ao concluir ou
 * falhar um job, repassa o `Job` BullMQ para os hooks abaixo, que
 * extraem o contexto `__cron` do payload (injetado pelo
 * cronDispatcher) e atualizam `cron_job_history` + estatísticas
 * agregadas em `cron_jobs`.
 *
 * Garantias:
 * - operação no-op (silenciosa) quando o job NÃO veio do Cron
 * - tolerante a falhas de banco (loga mas não derruba o worker)
 * - idempotente: nunca sobrescreve um histórico já em estado final
 */
import type { Job } from 'bullmq';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { getDb } from '../../../database/schemas/db';
import { cronJobs, cronJobHistory } from '../../../database/schemas/schema-cron';

interface CronContext {
  cronJobId: number;
  historyId: number;
}

/**
 * Extrai o contexto __cron do payload do job BullMQ. Retorna null se
 * o job não foi originado pelo cronDispatcher.
 */
export function extractCronContext(job: Job | undefined | null): CronContext | null {
  if (!job?.data) return null;
  const ctx = (job.data as Record<string, unknown>).__cron as
    | { cronJobId?: number; historyId?: number }
    | undefined;

  if (!ctx || typeof ctx.cronJobId !== 'number' || typeof ctx.historyId !== 'number') {
    return null;
  }

  return {
    cronJobId: ctx.cronJobId,
    historyId: ctx.historyId,
  };
}

/**
 * Marca o histórico como concluído com sucesso e incrementa contadores.
 * Chamar do listener `completed` do worker.
 */
export async function markCronHistoryCompleted(
  job: Job | undefined | null,
  result?: unknown
): Promise<void> {
  const ctx = extractCronContext(job);
  if (!ctx) return;

  try {
    const db = await getDb();
    if (!db) return;

    const now = new Date();
    const startedAt = job?.processedOn ? new Date(job.processedOn) : null;
    const finishedAt = job?.finishedOn ? new Date(job.finishedOn) : now;
    const durationFromBull =
      job?.processedOn && job?.finishedOn ? job.finishedOn - job.processedOn : null;

    // Idempotência: só atualiza se ainda estiver em estado não-final
    const updated = await db
      .update(cronJobHistory)
      .set({
        status: 'completed',
        completedAt: finishedAt,
        duration: durationFromBull ?? undefined,
        errorMessage: null,
        metadata: safeStringify({
          bullJobId: job?.id?.toString(),
          bullJobName: job?.name,
          attemptsMade: job?.attemptsMade,
          source: 'bullmq-worker',
          result: summarizeResult(result),
        }),
      })
      .where(and(eq(cronJobHistory.id, ctx.historyId), inArray(cronJobHistory.status, ['running', 'queued'])));

    // Atualiza stats agregadas no cron_jobs
    await db
      .update(cronJobs)
      .set({
        lastRunAt: finishedAt,
        lastRunDuration: durationFromBull ?? undefined,
        lastRunStatus: 'completed',
        lastRunError: null,
        successCount: sql`success_count + 1`,
      })
      .where(eq(cronJobs.id, ctx.cronJobId));

    console.log(
      `[CronHistorySync] Histórico ${ctx.historyId} (cronJob ${ctx.cronJobId}) marcado como completed via BullMQ`
    );
  } catch (error) {
    console.error(
      `[CronHistorySync] Falha ao marcar histórico ${ctx.historyId} como completed:`,
      error
    );
  }
}

/**
 * Marca o histórico como falho e incrementa contadores. Chamar do
 * listener `failed` do worker.
 */
export async function markCronHistoryFailed(
  job: Job | undefined | null,
  error: Error | unknown
): Promise<void> {
  const ctx = extractCronContext(job);
  if (!ctx) return;

  try {
    const db = await getDb();
    if (!db) return;

    const now = new Date();
    const startedAt = job?.processedOn ? new Date(job.processedOn) : null;
    const finishedAt = job?.finishedOn ? new Date(job.finishedOn) : now;
    const durationFromBull =
      job?.processedOn && job?.finishedOn ? job.finishedOn - job.processedOn : null;
    const errorMessage = extractErrorMessage(error);

    await db
      .update(cronJobHistory)
      .set({
        status: 'failed',
        completedAt: finishedAt,
        duration: durationFromBull ?? undefined,
        errorMessage,
        metadata: safeStringify({
          bullJobId: job?.id?.toString(),
          bullJobName: job?.name,
          attemptsMade: job?.attemptsMade,
          source: 'bullmq-worker',
        }),
      })
      .where(and(eq(cronJobHistory.id, ctx.historyId), inArray(cronJobHistory.status, ['running', 'queued'])));

    await db
      .update(cronJobs)
      .set({
        lastRunAt: finishedAt,
        lastRunDuration: durationFromBull ?? undefined,
        lastRunStatus: 'failed',
        lastRunError: errorMessage,
        failureCount: sql`failure_count + 1`,
      })
      .where(eq(cronJobs.id, ctx.cronJobId));

    console.warn(
      `[CronHistorySync] Histórico ${ctx.historyId} (cronJob ${ctx.cronJobId}) marcado como failed via BullMQ: ${errorMessage}`
    );
  } catch (dbError) {
    console.error(
      `[CronHistorySync] Falha ao marcar histórico ${ctx.historyId} como failed:`,
      dbError
    );
  }
}

/**
 * Marca como `running` o histórico assim que o worker inicia o job
 * (ponto de partida real). Chamar do listener `active` se necessário —
 * é opcional, porque o cronScheduler já cria o registro em `running`.
 */
export async function markCronHistoryActive(job: Job | undefined | null): Promise<void> {
  const ctx = extractCronContext(job);
  if (!ctx) return;

  try {
    const db = await getDb();
    if (!db) return;

    await db
      .update(cronJobHistory)
      .set({
        status: 'running',
        startedAt: new Date(),
      })
      .where(and(eq(cronJobHistory.id, ctx.historyId), eq(cronJobHistory.status, 'queued')));
  } catch (error) {
    console.error(
      `[CronHistorySync] Falha ao marcar histórico ${ctx.historyId} como running:`,
      error
    );
  }
}

function extractErrorMessage(error: unknown): string {
  if (!error) return 'Erro desconhecido';
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify({ error: 'metadata-stringify-failed' });
  }
}

function summarizeResult(result: unknown): unknown {
  if (result === undefined || result === null) return null;
  if (typeof result === 'string') return result.slice(0, 500);
  if (typeof result === 'number' || typeof result === 'boolean') return result;
  try {
    const serialized = JSON.stringify(result);
    return serialized.length > 1000 ? `${serialized.slice(0, 1000)}…` : JSON.parse(serialized);
  } catch {
    return '[unserializable]';
  }
}
