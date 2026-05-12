import { getDb } from '../database/schemas/db';
import { jobLogs, JobLog } from '../database/schemas/schema';
import { nanoid } from 'nanoid';
import { eq, desc } from 'drizzle-orm';

/**
 * Log de execução de um job
 */
export async function logJobStart(
  jobId: string,
  queueName: string,
  jobType: string,
  input: Record<string, unknown>
): Promise<string> {
  const logId = nanoid();
  const db = await getDb();
  
  if (db) {
    try {
      await db.insert(jobLogs).values({
        id: logId,
        jobId,
        queueName,
        jobType,
        status: 'processing',
        input: JSON.stringify(input),
        startedAt: new Date(),
      });
    } catch (error) {
      console.error(`[JobLog] Failed to persist start log:`, error);
    }
  }

  console.log(`[JobLog] START - ${logId}`, {
    jobId,
    queueName,
    jobType,
    input,
    timestamp: new Date().toISOString(),
  });
  
  return logId;
}

/**
 * Log de conclusão bem-sucedida de um job
 */
export async function logJobComplete(
  logId: string,
  jobId: string,
  output: Record<string, unknown>
): Promise<void> {
  const db = await getDb();
  
  if (db) {
    try {
      await db.update(jobLogs)
        .set({
          status: 'completed',
          output: JSON.stringify(output),
          completedAt: new Date(),
        })
        .where(eq(jobLogs.id, logId));
    } catch (error) {
      console.error(`[JobLog] Failed to persist completion log:`, error);
    }
  }

  console.log(`[JobLog] COMPLETE - ${logId}`, {
    jobId,
    output,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Log de falha de um job
 */
export async function logJobFailed(
  logId: string,
  jobId: string,
  error: string | Error
): Promise<void> {
  const db = await getDb();
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  if (db) {
    try {
      await db.update(jobLogs)
        .set({
          status: 'failed',
          error: errorMessage,
          completedAt: new Date(),
        })
        .where(eq(jobLogs.id, logId));
    } catch (error) {
      console.error(`[JobLog] Failed to persist failure log:`, error);
    }
  }

  console.log(`[JobLog] FAILED - ${logId}`, {
    jobId,
    error: errorMessage,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Obter histórico de logs de um job
 */
export async function getJobLogs(jobId: string): Promise<JobLog[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(jobLogs).where(eq(jobLogs.jobId, jobId)).orderBy(desc(jobLogs.createdAt));
  } catch (error) {
    console.error(`[JobLog] Failed to fetch logs for job ${jobId}:`, error);
    return [];
  }
}

/**
 * Obter logs de uma fila
 */
export async function getQueueLogs(queueName: string, limit: number = 100): Promise<JobLog[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    return await db.select().from(jobLogs).where(eq(jobLogs.queueName, queueName)).limit(limit).orderBy(desc(jobLogs.createdAt));
  } catch (error) {
    console.error(`[JobLog] Failed to fetch logs for queue ${queueName}:`, error);
    return [];
  }
}
