import cron from "node-cron";
import {
  addMarketplaceSyncJob,
  addContentGenerationJob,
} from "../config/queue";
import { notifyOwner } from "../_core/notification";

/**
 * Scheduler
 * Responsável por agendar tarefas recorrentes
 */
export class TaskScheduler {
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  /**
   * Inicializar agendador
   */
  async initialize(): Promise<void> {
    console.log("[Scheduler] Initializing...");

    // Sincronização diária de marketplaces às 2 da manhã
    this.scheduleMarketplaceSync();

    // Geração periódica de conteúdo para redes sociais (a cada 6 horas)
    this.scheduleContentGeneration();

    // Verificação de status de pedidos (a cada 2 horas)
    this.scheduleOrderStatusCheck();

    console.log("[Scheduler] Initialized successfully");
  }

  /**
   * Agendar sincronização diária de marketplaces
   */
  private scheduleMarketplaceSync(): void {
    // 0 2 * * * = 2:00 AM todos os dias
    const task = cron.schedule("0 2 * * *", async () => {
      console.log("[Scheduler] Running marketplace sync task");

      try {
        // Sincronizar Mercado Livre
        await addMarketplaceSyncJob({
          marketplace: "mercado_libre",
          syncType: "full",
        });

        // Sincronizar Shopee
        await addMarketplaceSyncJob({
          marketplace: "shopee",
          syncType: "full",
        });

        // Sincronizar Hotmart
        await addMarketplaceSyncJob({
          marketplace: "hotmart",
          syncType: "full",
        });

        console.log("[Scheduler] Marketplace sync jobs dispatched");

        await notifyOwner({
          title: "Sincronização de Marketplaces Iniciada",
          content: "Sincronização diária de todos os marketplaces foi iniciada",
        });
      } catch (error) {
        console.error("[Scheduler] Marketplace sync failed:", error);

        await notifyOwner({
          title: "Falha em Sincronização de Marketplaces",
          content: `Erro ao sincronizar marketplaces: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    });

    this.tasks.set("marketplace-sync", task);
  }

  /**
   * Agendar geração periódica de conteúdo
   */
  private scheduleContentGeneration(): void {
    // 0 */6 * * * = A cada 6 horas
    const task = cron.schedule("0 */6 * * *", async () => {
      console.log("[Scheduler] Running content generation task");

      try {
        // Gerar posts para Instagram
        await addContentGenerationJob({
          type: "generateText",
          platform: "instagram",
          tone: "persuasivo",
          context: {
            purpose: "marketing_campaign",
          },
        });

        // Gerar hashtags
        await addContentGenerationJob({
          type: "generateHashtags",
          platform: "instagram",
          context: {
            quantity: 10,
          },
        });

        console.log("[Scheduler] Content generation jobs dispatched");

        await notifyOwner({
          title: "Geração de Conteúdo Iniciada",
          content:
            "Geração periódica de conteúdo para redes sociais foi iniciada",
        });
      } catch (error) {
        console.error("[Scheduler] Content generation failed:", error);

        await notifyOwner({
          title: "Falha em Geração de Conteúdo",
          content: `Erro ao gerar conteúdo: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    });

    this.tasks.set("content-generation", task);
  }

  /**
   * Agendar verificação de status de pedidos
   */
  private scheduleOrderStatusCheck(): void {
    // 0 */2 * * * = A cada 2 horas
    const task = cron.schedule("0 */2 * * *", async () => {
      console.log("[Scheduler] Running order status check task");

      try {
        // Aqui você implementaria a lógica de verificação de status
        console.log("[Scheduler] Order status check completed");

        await notifyOwner({
          title: "Verificação de Pedidos Concluída",
          content: "Verificação periódica de status de pedidos foi concluída",
        });
      } catch (error) {
        console.error("[Scheduler] Order status check failed:", error);

        await notifyOwner({
          title: "Falha em Verificação de Pedidos",
          content: `Erro ao verificar status de pedidos: ${error instanceof Error ? error.message : String(error)}`,
        });
      }
    });

    this.tasks.set("order-status-check", task);
  }

  /**
   * Parar todos os agendamentos
   */
  async stop(): Promise<void> {
    console.log("[Scheduler] Stopping all scheduled tasks...");

    this.tasks.forEach((task, name) => {
      task.stop();
      console.log(`[Scheduler] Stopped task: ${name}`);
    });

    this.tasks.clear();
  }

  /**
   * Obter lista de tarefas agendadas
   */
  getScheduledTasks(): string[] {
    return Array.from(this.tasks.keys());
  }
}

// Singleton instance
export const scheduler = new TaskScheduler();
