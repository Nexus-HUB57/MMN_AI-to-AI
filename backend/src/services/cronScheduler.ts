import { getDb } from '../../../database/schemas/db';
import { cronJobs, cronJobHistory, type ICronJob, type ICronJobHistory } from '../../../database/schemas/schema-cron';
import { eq, lte, sql, and } from 'drizzle-orm';
import cron from 'node-cron';
import { dispatchCronJob } from './cronDispatcher';
import { evaluateCronAlerts } from './cronAlerts';

/**
 * Cron Scheduler Service
 * Gerencia a execução automática de cron jobs
 */

interface ScheduledTask {
  id: number;
  task: NodeJS.Timeout;
}

// Armazém de tarefas agendadas
const scheduledTasks = new Map<number, ScheduledTask>();

// Guard de concorrência: evita execuções simultâneas do mesmo job
const runningJobs = new Set<number>();

// Intervalos globais do scheduler (poll de pendentes + reavaliação de alertas)
const schedulerIntervals: NodeJS.Timeout[] = [];

// Flag para controlar o scheduler
let isRunning = false;

/**
 * Inicializa o scheduler de cron jobs
 */
export async function startCronScheduler(): Promise<void> {
  if (isRunning) {
    console.log('[CronScheduler] Já está em execução');
    return;
  }

  console.log('[CronScheduler] Iniciando...');
  isRunning = true;

  // Carregar e agendar todos os jobs habilitados
  await reloadAllJobs();

  // Verificar jobs pendentes a cada minuto
  const intervalId = setInterval(async () => {
    await checkAndRunPendingJobs();
  }, 60000); // 1 minuto

  // Reavaliar alertas operacionais a cada 5 minutos
  const alertsIntervalId = setInterval(async () => {
    try {
      const result = await evaluateCronAlerts();
      if (result.newAlerts.length > 0) {
        console.warn(
          `[CronScheduler] ${result.newAlerts.length} novo(s) alerta(s) cron emitidos (total ativo: ${result.totalAlerts})`
        );
      }
    } catch (error) {
      console.error('[CronScheduler] Falha ao avaliar alertas cron:', error);
    }
  }, 5 * 60 * 1000); // 5 minutos

  // Mantém referências acessíveis para shutdown limpo
  schedulerIntervals.push(intervalId, alertsIntervalId);

  console.log('[CronScheduler] Scheduler iniciado com sucesso');
}

/**
 * Para o scheduler de cron jobs
 */
export async function stopCronScheduler(): Promise<void> {
  console.log('[CronScheduler] Parando...');

  // Limpar todos os timers de jobs agendados
  for (const [jobId, task] of scheduledTasks.entries()) {
    clearInterval(task.task);
    scheduledTasks.delete(jobId);
  }

  // Limpar intervalos globais
  while (schedulerIntervals.length > 0) {
    const interval = schedulerIntervals.pop();
    if (interval) clearInterval(interval);
  }

  isRunning = false;
  console.log('[CronScheduler] Scheduler parado');
}

/**
 * Recarrega todos os cron jobs
 */
export async function reloadAllJobs(): Promise<void> {
  console.log('[CronScheduler] Recarregando todos os jobs...');

  const db = await getDb();
  if (!db) {
    console.error('[CronScheduler] Banco de dados não disponível');
    return;
  }

  // Cancelar tarefas existentes
  for (const [jobId, task] of scheduledTasks.entries()) {
    clearInterval(task.task);
    scheduledTasks.delete(jobId);
  }

  // Carregar jobs habilitados
  const enabledJobs = await db.select().from(cronJobs).where(eq(cronJobs.enabled, true));

  for (const job of enabledJobs) {
    await scheduleJob(job);
  }

  console.log(`[CronScheduler] ${enabledJobs.length} jobs agendados`);
}

/**
 * Agenda um cron job específico
 */
export async function scheduleJob(job: ICronJob): Promise<void> {
  if (scheduledTasks.has(job.id)) {
    // Já está agendado, remover primeiro
    const existing = scheduledTasks.get(job.id);
    if (existing) {
      clearInterval(existing.task);
      scheduledTasks.delete(job.id);
    }
  }

  if (!job.enabled) {
    return;
  }

  // Calcular intervalo em milissegundos
  const intervalMs = getIntervalMs(job.frequency);

  // Agendar execução
  const taskId = setInterval(async () => {
    await executeCronJob(job.id);
  }, intervalMs);

  scheduledTasks.set(job.id, { id: job.id, task: taskId });

  console.log(`[CronScheduler] Job ${job.id} (${job.name}) agendado - executar a cada ${intervalMs}ms`);
}

/**
 * Remove um cron job do scheduler
 */
export function unscheduleJob(jobId: number): void {
  const task = scheduledTasks.get(jobId);
  if (task) {
    clearInterval(task.task);
    scheduledTasks.delete(jobId);
    console.log(`[CronScheduler] Job ${jobId} removido do scheduler`);
  }
}

/**
 * Verifica e executa jobs pendentes
 */
async function checkAndRunPendingJobs(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const now = new Date();

  // Buscar jobs que devem ser executados
  const pendingJobs = await db.select().from(cronJobs)
    .where(and(
      eq(cronJobs.enabled, true),
      lte(cronJobs.nextRunAt, now)
    ));

  for (const job of pendingJobs) {
    await executeCronJob(job.id);
  }
}

/**
 * Executa um cron job específico
 */
export async function executeCronJob(jobId: number): Promise<ICronJobHistory | null> {
  if (runningJobs.has(jobId)) {
    console.log(`[CronScheduler] Job ${jobId} já está em execução, ignorando chamada duplicada`);
    return null;
  }

  const db = await getDb();
  if (!db) {
    console.error(`[CronScheduler] Banco de dados não disponível para executar job ${jobId}`);
    return null;
  }

  // Buscar job
  const jobs = await db.select().from(cronJobs).where(eq(cronJobs.id, jobId));
  const job = jobs[0];

  if (!job) {
    console.error(`[CronScheduler] Job ${jobId} não encontrado`);
    return null;
  }

  if (!job.enabled) {
    console.log(`[CronScheduler] Job ${jobId} está desabilitado`);
    return null;
  }

  runningJobs.add(jobId);

  const startTime = Date.now();

  // Criar registro de histórico
  const [historyEntry] = await db.insert(cronJobHistory).values({
    cronJobId: jobId,
    startedAt: new Date(),
    status: 'running',
  }).returning();

  try {
    console.log(`[CronScheduler] Executando job ${jobId} (${job.name})...`);

    // Despachar o job para BullMQ ou handler inline
    const dispatchResult = await executeJobByType(job as unknown as ICronJob, historyEntry.id);

    const duration = Date.now() - startTime;

    // Atualizar histórico
    await db.update(cronJobHistory)
      .set({
        completedAt: new Date(),
        duration,
        status: 'completed',
        jobId: dispatchResult.jobId,
        metadata: JSON.stringify({
          queueName: dispatchResult.queueName,
          bullJobName: dispatchResult.bullJobName,
          reason: dispatchResult.reason,
        }),
      })
      .where(eq(cronJobHistory.id, historyEntry.id));

    // Atualizar stats do job
    await db.update(cronJobs)
      .set({
        lastRunAt: new Date(),
        lastRunDuration: duration,
        lastRunStatus: 'completed',
        lastRunError: null,
        nextRunAt: calculateNextRun(job.frequency, job.cronExpression),
        runCount: sql`run_count + 1`,
        successCount: sql`success_count + 1`,
      })
      .where(eq(cronJobs.id, jobId));

    console.log(`[CronScheduler] Job ${jobId} completado em ${duration}ms`);

    return historyEntry;

  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`[CronScheduler] Job ${jobId} falhou:`, errorMessage);

    // Atualizar histórico com erro
    await db.update(cronJobHistory)
      .set({
        completedAt: new Date(),
        duration,
        status: 'failed',
        errorMessage,
      })
      .where(eq(cronJobHistory.id, historyEntry.id));

    // Atualizar stats do job
    await db.update(cronJobs)
      .set({
        lastRunAt: new Date(),
        lastRunDuration: duration,
        lastRunStatus: 'failed',
        lastRunError: errorMessage,
        nextRunAt: calculateNextRun(job.frequency, job.cronExpression),
        runCount: sql`run_count + 1`,
        failureCount: sql`failure_count + 1`,
      })
      .where(eq(cronJobs.id, jobId));

    return historyEntry;
  } finally {
    runningJobs.delete(jobId);
  }
}

/**
 * Executa o job baseado no seu tipo, delegando ao dispatcher central.
 * O dispatcher decide entre BullMQ e handler inline e devolve metadados.
 */
async function executeJobByType(
  job: ICronJob,
  historyId: number
): Promise<{ queueName: string; bullJobName: string; jobId?: string; dispatched: boolean; reason?: string }> {
  const payload = parsePayload(job.jobPayload);

  const result = await dispatchCronJob({
    jobType: job.jobType,
    queueName: job.queueName,
    payload,
    cronJobId: job.id,
    historyId,
  });

  if (!result.dispatched) {
    throw new Error(`[CronScheduler] Job ${job.id} (${job.jobType}) não despachado: ${result.reason ?? 'motivo não informado'}`);
  }

  return result;
}

function parsePayload(rawPayload: unknown): Record<string, unknown> {
  if (!rawPayload) return {};
  if (typeof rawPayload === 'object') return rawPayload as Record<string, unknown>;
  if (typeof rawPayload === 'string') {
    try {
      const parsed = JSON.parse(rawPayload);
      return typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, unknown>) : {};
    } catch {
      return {};
    }
  }
  return {};
}

// Limite máximo seguro para setInterval (2^31 - 1 ms ≈ 24.8 dias)
const MAX_INTERVAL_MS = 2147483647;

/**
 * Calcula o intervalo em milissegundos baseado na frequência.
 * Limitado ao máximo seguro do setInterval do JavaScript.
 */
function getIntervalMs(frequency: string): number {
  const intervals: Record<string, number> = {
    minute: 60 * 1000,
    hourly: 60 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    monthly: 7 * 24 * 60 * 60 * 1000, // poll semanal; checkAndRunPendingJobs cuida do disparo real
  };
  const ms = intervals[frequency] ?? 24 * 60 * 60 * 1000;
  return Math.min(ms, MAX_INTERVAL_MS);
}

/**
 * Calcula a próxima data de execução
 */
function calculateNextRun(frequency: string, cronExpression?: string): Date {
  const now = new Date();

  if (cronExpression && cron.validate(cronExpression)) {
    try {
      return cron.sendAt(cronExpression);
    } catch {
      // Se falhar, calcular baseado na frequência
    }
  }

  const next = new Date(now);
  next.setMilliseconds(0);

  switch (frequency) {
    case 'minute':
      next.setMinutes(next.getMinutes() + 1);
      break;
    case 'hourly':
      next.setHours(next.getHours() + 1, 0, 0, 0);
      break;
    case 'daily':
      next.setDate(next.getDate() + 1);
      next.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      next.setHours(0, 0, 0, 0);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      next.setHours(0, 0, 0, 0);
      break;
  }

  return next;
}

/**
 * Inicializa jobs padrão no banco de dados
 */
export async function initializeDefaultJobs(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Verificar se já existem jobs
  const existingJobs = await db.select({ count: sql<number>`count(*)` }).from(cronJobs);

  if (existingJobs[0]?.count > 0) {
    console.log('[CronScheduler] Jobs já inicializados');
    return;
  }

  console.log('[CronScheduler] Inicializando jobs padrão...');

  // Jobs padrão para o sistema MMN
  const defaultJobs = [
    {
      name: 'Verificação de Faturas Vencidas',
      description: 'Verifica e atualiza status de faturas vencidas automaticamente',
      jobType: 'invoice_overdue_check',
      queueName: 'billing_queue',
      frequency: 'hourly',
      enabled: true,
    },
    {
      name: 'Sincronização de Marketplace',
      description: 'Sincroniza produtos com Mercado Livre, Shopee e Hotmart',
      jobType: 'marketplace_sync',
      queueName: 'marketplace_sync_queue',
      frequency: 'hourly',
      enabled: true,
    },
    {
      name: 'Cálculo de Comissões',
      description: 'Calcula comissões da rede MMN',
      jobType: 'commission_calculation',
      queueName: 'commission_processing_queue',
      frequency: 'daily',
      enabled: true,
    },
    {
      name: 'Atualização de Leaderboard',
      description: 'Atualiza rankings do leaderboard de XP',
      jobType: 'leaderboard_update',
      queueName: 'xp_queue',
      frequency: 'hourly',
      enabled: true,
    },
    {
      name: 'Recalculação de XP',
      description: 'Recalcula XP dos afiliados mensalmente',
      jobType: 'xp_recalculation',
      queueName: 'xp_queue',
      frequency: 'monthly',
      enabled: true,
    },
    {
      name: 'Progressão de Carreira',
      description: 'Atualiza níveis de carreira baseados em XP',
      jobType: 'career_progression',
      queueName: 'xp_queue',
      frequency: 'daily',
      enabled: true,
    },
    {
      name: 'Publicação de Posts Sociais',
      description: 'Publica posts agendados nas redes sociais',
      jobType: 'social_post_publish',
      queueName: 'social_queue',
      frequency: 'hourly',
      enabled: true,
    },
    {
      name: 'Limpeza de Banco de Dados',
      description: 'Remove dados temporários e logs antigos',
      jobType: 'database_cleanup',
      queueName: 'maintenance_queue',
      frequency: 'weekly',
      enabled: true,
    },
  ];

  for (const job of defaultJobs) {
    await db.insert(cronJobs).values({
      ...job,
      nextRunAt: calculateNextRun(job.frequency),
      runCount: 0,
      successCount: 0,
      failureCount: 0,
    });
  }

  console.log(`[CronScheduler] ${defaultJobs.length} jobs padrão inicializados`);
}

/**
 * Verifica o status do scheduler
 */
export function getSchedulerStatus(): {
  isRunning: boolean;
  activeJobs: number;
  scheduledTasks: number[];
} {
  return {
    isRunning,
    activeJobs: scheduledTasks.size,
    scheduledTasks: Array.from(scheduledTasks.keys()),
  };
}