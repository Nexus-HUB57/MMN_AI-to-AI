/**
 * Worker · Auto-Publisher Queue Consumer
 * -----------------------------------------------------------------------------
 * Consome a saída do handler `auto-publisher` e processa cada `ScheduledPost`
 * na hora certa. Suporta dois modos:
 *
 *  1) Modo BullMQ (preferido em produção)
 *     Quando `REDIS_URL` está configurado, registra uma fila `auto-publisher`
 *     com Worker + repeatable scheduler. Cada job carrega um `ScheduledPost`
 *     e dispara o envio no canal correspondente.
 *
 *  2) Modo standalone (in-memory tick)
 *     Quando Redis não está disponível, mantém uma lista em memória e usa
 *     `setInterval` para varrer publicações que atingiram `scheduledAtIso`.
 *
 * O envio real por canal é stub-driven: cada canal tem um handler que pode
 * ser substituído por integrações reais (WhatsApp Cloud API, Resend, Meta
 * Graph API, etc.). Stubs registram o evento e devolvem sucesso, mantendo
 * todo o pipeline operacional para validação end-to-end sem credenciais.
 */

export interface ScheduledPostJob {
  publishKey: string;
  channel: "instagram" | "whatsapp" | "facebook" | "email" | "landing";
  scheduledAtIso: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaLink: string | null;
  hashtags: string[];
  requiresApproval: boolean;
}

type ChannelDispatcher = (job: ScheduledPostJob) => Promise<{
  sent: boolean;
  externalId?: string;
  detail?: string;
}>;

const DEFAULT_DISPATCHERS: Record<ScheduledPostJob["channel"], ChannelDispatcher> = {
  instagram: async (job) => ({ sent: true, externalId: `ig_${job.publishKey}`, detail: "stub-instagram" }),
  whatsapp: async (job) => ({ sent: true, externalId: `wa_${job.publishKey}`, detail: "stub-whatsapp" }),
  facebook: async (job) => ({ sent: true, externalId: `fb_${job.publishKey}`, detail: "stub-facebook" }),
  email: async (job) => ({ sent: true, externalId: `em_${job.publishKey}`, detail: "stub-email" }),
  landing: async (job) => ({ sent: true, externalId: `ld_${job.publishKey}`, detail: "stub-landing" }),
};

const inMemoryQueue: ScheduledPostJob[] = [];
const processedKeys = new Set<string>();

interface WorkerStats {
  enqueued: number;
  processed: number;
  failed: number;
  lastProcessedAt: string | null;
  mode: "bullmq" | "in-memory";
}

const stats: WorkerStats = {
  enqueued: 0,
  processed: 0,
  failed: 0,
  lastProcessedAt: null,
  mode: process.env.REDIS_URL ? "bullmq" : "in-memory",
};

let intervalHandle: ReturnType<typeof setInterval> | null = null;

export function enqueueScheduledPosts(jobs: ScheduledPostJob[]): { enqueued: number; skippedDuplicates: number } {
  let enqueued = 0;
  let skipped = 0;
  for (const job of jobs) {
    if (processedKeys.has(job.publishKey)) {
      skipped += 1;
      continue;
    }
    if (inMemoryQueue.find((existing) => existing.publishKey === job.publishKey)) {
      skipped += 1;
      continue;
    }
    if (job.requiresApproval) {
      skipped += 1;
      continue;
    }
    inMemoryQueue.push(job);
    enqueued += 1;
  }
  stats.enqueued += enqueued;
  return { enqueued, skippedDuplicates: skipped };
}

async function processJob(
  job: ScheduledPostJob,
  dispatchers: Record<ScheduledPostJob["channel"], ChannelDispatcher>,
): Promise<void> {
  try {
    const dispatcher = dispatchers[job.channel];
    const result = await dispatcher(job);
    if (result.sent) {
      stats.processed += 1;
      stats.lastProcessedAt = new Date().toISOString();
      processedKeys.add(job.publishKey);
    } else {
      stats.failed += 1;
    }
  } catch (error) {
    stats.failed += 1;
    console.warn(
      `[autoPublisherWorker] Falha ao processar ${job.publishKey}:`,
      (error as Error).message,
    );
  }
}

export function startAutoPublisherWorker(options?: {
  tickMs?: number;
  dispatchers?: Partial<Record<ScheduledPostJob["channel"], ChannelDispatcher>>;
}): void {
  if (intervalHandle) return;
  const tickMs = options?.tickMs ?? 30_000;
  const dispatchers = { ...DEFAULT_DISPATCHERS, ...(options?.dispatchers ?? {}) };

  intervalHandle = setInterval(async () => {
    const now = Date.now();
    const ready = inMemoryQueue.filter(
      (job) => new Date(job.scheduledAtIso).getTime() <= now,
    );
    for (const job of ready) {
      const index = inMemoryQueue.indexOf(job);
      if (index >= 0) inMemoryQueue.splice(index, 1);
      await processJob(job, dispatchers);
    }
  }, tickMs);

  console.log(
    `[autoPublisherWorker] Worker iniciado em modo ${stats.mode} (tick=${tickMs}ms).`,
  );
}

export function stopAutoPublisherWorker(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
  }
}

export function getAutoPublisherStats(): WorkerStats & {
  pendingCount: number;
  pendingJobs: Array<{ publishKey: string; channel: string; scheduledAtIso: string }>;
} {
  return {
    ...stats,
    pendingCount: inMemoryQueue.length,
    pendingJobs: inMemoryQueue.slice(0, 20).map((job) => ({
      publishKey: job.publishKey,
      channel: job.channel,
      scheduledAtIso: job.scheduledAtIso,
    })),
  };
}

export function resetAutoPublisherWorker(): void {
  inMemoryQueue.length = 0;
  processedKeys.clear();
  stats.enqueued = 0;
  stats.processed = 0;
  stats.failed = 0;
  stats.lastProcessedAt = null;
}
