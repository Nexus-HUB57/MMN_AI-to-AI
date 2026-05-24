import { Job, Worker } from "bullmq";
import { MarketplaceSyncJob } from "../config/queue";
import { notifyOwner } from "../_core/notification";
import {
  markCronHistoryCompleted,
  markCronHistoryFailed,
} from "../services/cronHistorySync";
import {
  logJobComplete,
  logJobFailed,
  logJobStart,
} from "../services/jobLogger";
import { syncMarketplaceProducts } from "../services/syncMarketplaceProducts";
import { publishMarketplaceSyncCompleted } from "../domains/marketplace/events";

/**
 * MarketplaceSyncWorker
 * Responsável por sincronizar produtos de marketplaces.
 */
class MarketplaceSyncWorker {
  private worker: Worker;

  constructor() {
    this.worker = new Worker(
      "marketplace_sync_queue",
      this.processJob.bind(this),
      {
        connection: {
          host: process.env.REDIS_HOST || "localhost",
          port: parseInt(process.env.REDIS_PORT || "6379"),
          password: process.env.REDIS_PASSWORD || undefined,
          maxRetriesPerRequest: null,
        },
        concurrency: 2,
      },
    );

    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.worker.on("completed", (job, result) => {
      console.log(`[MarketplaceSyncWorker] Job ${job.id} completed`);
      void markCronHistoryCompleted(job, result);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`[MarketplaceSyncWorker] Job ${job?.id} failed:`, err);
      void markCronHistoryFailed(job, err);
    });

    this.worker.on("error", (err) => {
      console.error("[MarketplaceSyncWorker] Worker error:", err);
    });
  }

  private async processJob(job: Job<MarketplaceSyncJob>) {
    const logId = await logJobStart(
      job.id || "unknown",
      "marketplace_sync_queue",
      `sync_${job.data.marketplace}`,
      job.data as unknown as Record<string, unknown>,
    );

    try {
      console.log(
        `[MarketplaceSyncWorker] Processing job ${job.id}:`,
        job.data,
      );

      const result = await syncMarketplaceProducts({
        marketplace: job.data.marketplace,
        accountId: job.data.accountId,
      });

      const response = {
        marketplace: job.data.marketplace,
        syncType: job.data.syncType,
        accountId: job.data.accountId ?? null,
        processedAccounts: result.processedAccounts,
        productsAdded: result.totalProductsAdded,
        productsUpdated: result.totalProductsUpdated,
        productsFailed: result.totalProductsFailed,
        timestamp: new Date().toISOString(),
      };

      await publishMarketplaceSyncCompleted(
        {
          marketplace: job.data.marketplace,
          accountId: job.data.accountId,
          itemsSynced: result.totalProductsAdded + result.totalProductsUpdated,
          durationMs: 0,
          jobId: String(job.id ?? "unknown"),
        },
        {
          source: "marketplaceSyncWorker.processJob",
          syncType: job.data.syncType,
          requestedByUserId: job.data.requestedByUserId,
          processedAccounts: result.processedAccounts,
          productsFailed: result.totalProductsFailed,
        },
      );

      await logJobComplete(logId, job.id || "unknown", response);
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      await logJobFailed(logId, job.id || "unknown", errorMessage);

      await notifyOwner({
        title: "Falha em Sincronização de Marketplace",
        content: `Job ${job.id} falhou: ${errorMessage}`,
      });

      throw error;
    }
  }

  async start() {
    console.log("[MarketplaceSyncWorker] Starting...");
  }

  async stop() {
    console.log("[MarketplaceSyncWorker] Stopping...");
    await this.worker.close();
  }
}

const worker = new MarketplaceSyncWorker();
worker.start();

process.on("SIGTERM", async () => {
  console.log(
    "[MarketplaceSyncWorker] Received SIGTERM, shutting down gracefully",
  );
  await worker.stop();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log(
    "[MarketplaceSyncWorker] Received SIGINT, shutting down gracefully",
  );
  await worker.stop();
  process.exit(0);
});
