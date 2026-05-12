import { z } from 'zod';
import { publicProcedure, router } from '../config/trpc';
import { orchestrator, HighLevelGoal } from '../services/orchestrator';
import { scheduler } from '../services/scheduler';
import {
  contentGenerationQueue,
  marketplaceSyncQueue,
  orderProcessingQueue,
  commissionProcessingQueue,
} from '../config/queue';
import { nanoid } from 'nanoid';

export const orchestrationRouter = router({
  /**
   * Criar uma nova meta de alto nível
   */
  createGoal: publicProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        priority: z.enum(['low', 'medium', 'high']),
        targetMetrics: z.record(z.string(), z.unknown()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const goal: HighLevelGoal = {
        id: nanoid(),
        title: input.title,
        description: input.description,
        priority: input.priority,
        targetMetrics: input.targetMetrics,
        createdAt: new Date(),
        status: 'pending',
      };

      await orchestrator.orchestrateGoal(goal);

      return {
        success: true,
        goalId: goal.id,
        message: 'Goal created and orchestration started',
      };
    }),

  /**
   * Obter progresso de uma meta
   */
  getGoalProgress: publicProcedure
    .input(z.object({ goalId: z.string() }))
    .query(async ({ input }) => {
      return orchestrator.monitorGoalProgress(input.goalId);
    }),

  /**
   * Obter histórico de metas
   */
  getGoalHistory: publicProcedure.query(async () => {
    return orchestrator.getGoalHistory();
  }),

  /**
   * Obter histórico de tarefas
   */
  getTaskHistory: publicProcedure.query(async () => {
    return orchestrator.getTaskHistory();
  }),

  /**
   * Obter status de todas as filas
   */
  getQueueStatus: publicProcedure.query(async () => {
    const [contentCount, marketplaceCount, orderCount, commissionCount] = await Promise.all([
      contentGenerationQueue.count(),
      marketplaceSyncQueue.count(),
      orderProcessingQueue.count(),
      commissionProcessingQueue.count(),
    ]);

    const [contentActive, marketplaceActive, orderActive, commissionActive] = await Promise.all([
      contentGenerationQueue.getActiveCount(),
      marketplaceSyncQueue.getActiveCount(),
      orderProcessingQueue.getActiveCount(),
      commissionProcessingQueue.getActiveCount(),
    ]);

    const [contentCompleted, marketplaceCompleted, orderCompleted, commissionCompleted] = await Promise.all([
      contentGenerationQueue.getCompletedCount(),
      marketplaceSyncQueue.getCompletedCount(),
      orderProcessingQueue.getCompletedCount(),
      commissionProcessingQueue.getCompletedCount(),
    ]);

    const [contentFailed, marketplaceFailed, orderFailed, commissionFailed] = await Promise.all([
      contentGenerationQueue.getFailedCount(),
      marketplaceSyncQueue.getFailedCount(),
      orderProcessingQueue.getFailedCount(),
      commissionProcessingQueue.getFailedCount(),
    ]);

    return {
      queues: {
        content_generation: {
          pending: contentCount,
          active: contentActive,
          completed: contentCompleted,
          failed: contentFailed,
        },
        marketplace_sync: {
          pending: marketplaceCount,
          active: marketplaceActive,
          completed: marketplaceCompleted,
          failed: marketplaceFailed,
        },
        order_processing: {
          pending: orderCount,
          active: orderActive,
          completed: orderCompleted,
          failed: orderFailed,
        },
        commission_processing: {
          pending: commissionCount,
          active: commissionActive,
          completed: commissionCompleted,
          failed: commissionFailed,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }),

  /**
   * Obter jobs de uma fila específica
   */
  getQueueJobs: publicProcedure
    .input(
      z.object({
        queueName: z.enum(['content_generation', 'marketplace_sync', 'order_processing', 'commission_processing']),
        status: z.enum(['pending', 'active', 'completed', 'failed']).optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      let queue;

      switch (input.queueName) {
        case 'content_generation':
          queue = contentGenerationQueue;
          break;
        case 'marketplace_sync':
          queue = marketplaceSyncQueue;
          break;
        case 'order_processing':
          queue = orderProcessingQueue;
          break;
        case 'commission_processing':
          queue = commissionProcessingQueue;
          break;
      }

      let jobs: unknown[] = [];

      if (input.status === 'pending' || !input.status) {
        jobs = await queue.getWaiting(0, input.limit);
      } else if (input.status === 'active') {
        jobs = await queue.getActive(0, input.limit);
      } else if (input.status === 'completed') {
        jobs = await queue.getCompleted(0, input.limit);
      } else if (input.status === 'failed') {
        jobs = await queue.getFailed(0, input.limit);
      }

      return (jobs as Array<Record<string, unknown>>).map((job: Record<string, unknown>) => ({
        id: job.id,
        name: job.name,
        data: job.data,
        progress: typeof job.progress === 'function' ? (job.progress as () => unknown)() : job.progress,
        attempts: job.attemptsMade,
        failedReason: job.failedReason,
        stacktrace: job.stacktrace,
        timestamp: job.timestamp,
      }));
    }),

  /**
   * Obter lista de tarefas agendadas
   */
  getScheduledTasks: publicProcedure.query(async () => {
    return {
      tasks: scheduler.getScheduledTasks(),
      timestamp: new Date().toISOString(),
    };
  }),

  /**
   * Obter detalhes de um job específico
   */
  getJobDetails: publicProcedure
    .input(
      z.object({
        queueName: z.enum(['content_generation', 'marketplace_sync', 'order_processing', 'commission_processing']),
        jobId: z.string(),
      })
    )
    .query(async ({ input }) => {
      let queue;

      switch (input.queueName) {
        case 'content_generation':
          queue = contentGenerationQueue;
          break;
        case 'marketplace_sync':
          queue = marketplaceSyncQueue;
          break;
        case 'order_processing':
          queue = orderProcessingQueue;
          break;
        case 'commission_processing':
          queue = commissionProcessingQueue;
          break;
      }

      const job = await queue.getJob(input.jobId);

      if (!job) {
        throw new Error(`Job ${input.jobId} not found`);
      }

      const jobData = job as unknown as Record<string, unknown>;

      return {
        id: jobData.id,
        name: jobData.name,
        data: jobData.data,
        progress: typeof jobData.progress === 'function' ? (jobData.progress as () => unknown)() : jobData.progress,
        attempts: jobData.attemptsMade,
        failedReason: jobData.failedReason,
        stacktrace: jobData.stacktrace,
        timestamp: jobData.timestamp,
        returnvalue: jobData.returnvalue,
      };
    }),

  /**
   * Limpar fila completada
   */
  clearQueue: publicProcedure
    .input(
      z.object({
        queueName: z.enum(['content_generation', 'marketplace_sync', 'order_processing', 'commission_processing']),
      })
    )
    .mutation(async ({ input }) => {
      let queue;

      switch (input.queueName) {
        case 'content_generation':
          queue = contentGenerationQueue;
          break;
        case 'marketplace_sync':
          queue = marketplaceSyncQueue;
          break;
        case 'order_processing':
          queue = orderProcessingQueue;
          break;
        case 'commission_processing':
          queue = commissionProcessingQueue;
          break;
      }

      await queue.clean(0, 100, 'completed');

      return {
        success: true,
        message: `Queue ${input.queueName} cleaned`,
      };
    }),
});
