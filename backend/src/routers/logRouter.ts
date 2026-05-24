import { z } from 'zod';
import { publicProcedure, router } from '../config/trpc';
import { getDb } from '../database/schemas/db';
import { jobLogs } from '../database/schemas/schema';
import { desc, eq, like, and, or, sql } from 'drizzle-orm';

export const logRouter = router({
  /**
   * Obter todos os logs com filtros e paginação
   */
  getLogs: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
        queueName: z.string().optional(),
        jobType: z.string().optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { logs: [], total: 0 };

      const conditions = [];

      if (input.status) {
        conditions.push(eq(jobLogs.status, input.status));
      }
      if (input.queueName) {
        conditions.push(eq(jobLogs.queueName, input.queueName));
      }
      if (input.jobType) {
        conditions.push(eq(jobLogs.jobType, input.jobType));
      }
      if (input.search) {
        conditions.push(
          or(
            like(jobLogs.jobId, `%${input.search}%`),
            like(jobLogs.queueName, `%${input.search}%`),
            like(jobLogs.jobType, `%${input.search}%`)
          )
        );
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [logs, countResult] = await Promise.all([
        db.select().from(jobLogs).where(whereClause).limit(input.limit).offset(input.offset).orderBy(desc(jobLogs.createdAt)),
        db.select({ count: sql<number>`count(*)` }).from(jobLogs).where(whereClause),
      ]);

      return {
        logs,
        total: countResult[0]?.count ?? 0,
      };
    }),

  /**
   * Obter detalhes de um log específico
   */
  getLogDetails: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const results = await db.select().from(jobLogs).where(eq(jobLogs.id, input.id)).limit(1);
      return results[0] || null;
    }),
});
