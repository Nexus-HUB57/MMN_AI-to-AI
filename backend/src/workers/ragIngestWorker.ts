/**
 * ragIngestWorker.ts
 * ==================
 * Worker BullMQ que consome filas `rag_ingest_queue` e `rag_reindex_queue`,
 * delegando para `nexusRagService.ingest()` e `nexusRagService.reindex()`.
 *
 * Bootstrap-safe:
 *  - Se Redis não estiver disponível, o worker não inicia (apenas warn).
 *  - Se DATABASE_URL estiver vazio, o service cai automaticamente para in-memory.
 *
 * Como rodar isoladamente:
 *   npx tsx backend/src/workers/ragIngestWorker.ts
 *
 * Em produção, este worker é mantido vivo via PM2 / Docker / systemd.
 */
import { Worker, Job } from "bullmq";
import { logJobStart, logJobComplete, logJobFailed } from "../services/jobLogger";
import { ingest, reindex } from "../services/nexusRagService";

type RagIngestJobData = {
  sourceKind:
    | "academia"
    | "lab"
    | "lib"
    | "ebook"
    | "telemetry"
    | "skill-manifest";
  sourceRef: string;
  title?: string;
  content: string;
  tags?: string[];
  tenantId?: string;
  metadata?: Record<string, unknown>;
};

type RagReindexJobData = {
  scope:
    | "academia"
    | "lab"
    | "lib"
    | "ebook"
    | "telemetry"
    | "skill-manifest"
    | "all";
  triggeredBy?: string;
};

const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
  maxRetriesPerRequest: null as null,
};

function redisIsConfigured() {
  return !!(process.env.REDIS_URL || process.env.REDIS_HOST);
}

class RagIngestWorker {
  private ingestWorker: Worker | null = null;
  private reindexWorker: Worker | null = null;

  constructor() {
    if (!redisIsConfigured()) {
      console.warn(
        "[ragIngestWorker] Redis não configurado — workers desativados."
      );
      return;
    }

    this.ingestWorker = new Worker(
      "rag_ingest_queue",
      async (job: Job<RagIngestJobData>) => this.processIngest(job),
      { connection, concurrency: 4 }
    );

    this.reindexWorker = new Worker(
      "rag_reindex_queue",
      async (job: Job<RagReindexJobData>) => this.processReindex(job),
      { connection, concurrency: 1 }
    );

    this.attachLifecycle(this.ingestWorker, "ingest");
    this.attachLifecycle(this.reindexWorker, "reindex");

    console.log("[ragIngestWorker] iniciado (ingest + reindex).");
  }

  private attachLifecycle(worker: Worker, label: string) {
    worker.on("completed", (job: Job) => {
      console.log(`[ragIngestWorker:${label}] job ${job.id} completed`);
    });
    worker.on("failed", (job: Job | undefined, err: Error) => {
      console.error(
        `[ragIngestWorker:${label}] job ${job?.id} failed:`,
        err.message
      );
    });
    worker.on("error", (err: Error) => {
      console.error(`[ragIngestWorker:${label}] worker error:`, err.message);
    });
  }

  private async processIngest(job: Job<RagIngestJobData>) {
    const data = job.data;
    const logId = await logJobStart(
      String(job.id),
      "rag_ingest_queue",
      "rag.ingest",
      { sourceKind: data.sourceKind, sourceRef: data.sourceRef }
    );
    try {
      const result = await ingest(data);
      await logJobComplete(logId, String(job.id), {
        chunks: result.chunks,
        sourceId: result.sourceId,
        mode: result.mode,
      });
      return result;
    } catch (err) {
      await logJobFailed(logId, String(job.id), err as Error);
      throw err;
    }
  }

  private async processReindex(job: Job<RagReindexJobData>) {
    const data = job.data;
    const logId = await logJobStart(
      String(job.id),
      "rag_reindex_queue",
      "rag.reindex",
      { scope: data.scope, triggeredBy: data.triggeredBy ?? "cron" }
    );
    try {
      const result = await reindex(data.scope);
      await logJobComplete(logId, String(job.id), result);
      return result;
    } catch (err) {
      await logJobFailed(logId, String(job.id), err as Error);
      throw err;
    }
  }

  async close() {
    await this.ingestWorker?.close();
    await this.reindexWorker?.close();
  }
}

let _worker: RagIngestWorker | null = null;

export function startRagIngestWorker(): RagIngestWorker {
  if (!_worker) _worker = new RagIngestWorker();
  return _worker;
}

export async function stopRagIngestWorker() {
  if (_worker) {
    await _worker.close();
    _worker = null;
  }
}

if (typeof require !== "undefined" && require.main === module) {
  startRagIngestWorker();
  const shutdown = async () => {
    console.log("[ragIngestWorker] shutdown solicitado");
    await stopRagIngestWorker();
    process.exit(0);
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
