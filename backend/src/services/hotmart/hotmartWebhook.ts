/**
 * Hotmart Webhook Handler
 * -----------------------------------------------------------------------------
 * Processes incoming webhooks from Hotmart.
 * Triggers appropriate actions based on event type.
 */

import { randomUUID } from "node:crypto";

import {
  fetchHotmartSales,
  verifyHotmartWebhook,
  type HotmartSale,
} from "./hotmartClient";
import { webhookRouterHandler } from "../../agentic/skills/webhookRouter";

export interface HotmartWebhookEvent {
  event: HotmartWebhookEventType;
  data: HotmartWebhookData;
  timestamp: string;
}

export type HotmartWebhookEventType =
  | "PURCHASE"
  | "CANCEL"
  | "REFUND"
  | "SUBSCRIPTION_CREATED"
  | "SUBSCRIPTION_CANCELLED"
  | "AFFILIATE_SIGNUP";

export interface HotmartWebhookData {
  transaction?: string;
  product?: {
    id: string;
    name: string;
  };
  offer?: {
    id: string;
    name: string;
  };
  affiliate?: {
    id: string;
    name: string;
    email: string;
  };
  buyer?: {
    email: string;
    name: string;
  };
  amount?: {
    value: number;
    currency: string;
  };
  commission?: {
    value: number;
    currency: string;
  };
  payment?: {
    method: string;
    installment: number;
  };
  status?: string;
}

export interface WebhookProcessingResult {
  eventId: string;
  eventType: HotmartWebhookEventType;
  success: boolean;
  processedAt: string;
  skillTriggered: string | null;
  errors: string[];
}

/**
 * Process incoming Hotmart webhook
 */
export async function processHotmartWebhook(
  payload: string,
  signature: string,
  rawHeaders: Record<string, string> = {},
): Promise<WebhookProcessingResult> {
  const result: WebhookProcessingResult = {
    eventId: randomUUID(),
    eventType: "PURCHASE",
    success: false,
    processedAt: new Date().toISOString(),
    skillTriggered: null,
    errors: [],
  };

  try {
    // Verify signature
    if (!verifyHotmartWebhook(payload, signature)) {
      result.errors.push("Invalid webhook signature");
      return result;
    }

    // Parse payload
    const event = JSON.parse(payload) as HotmartWebhookEvent;
    result.eventType = event.event;

    // Map Hotmart event to internal skill
    const skillSlug = mapEventToSkill(event.event);
    result.skillTriggered = skillSlug;

    if (skillSlug) {
      // Process through webhook router skill
      const webhookPayload = normalizeHotmartPayload(event);
      const routerResult = await webhookRouterHandler.execute(
        {
          source: "hotmart",
          eventType: event.event,
          payload: webhookPayload,
          rawHeaders,
        },
        {
          agentId: 0,
          userId: 0,
          agentName: "system",
          performanceScore: 100,
          autonomyAllowed: true,
        },
      );

      result.success = routerResult.success;
      if (!routerResult.success) {
        result.errors.push(routerResult.message ?? "Webhook routing failed");
      }
    } else {
      result.errors.push(`Unknown event type: ${event.event}`);
      result.success = false;
    }
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : "Unknown error");
    result.success = false;
  }

  return result;
}

/**
 * Map Hotmart event type to internal skill slug
 */
function mapEventToSkill(event: HotmartWebhookEventType): string | null {
  const eventMapping: Record<HotmartWebhookEventType, string | null> = {
    PURCHASE: "commission-calculator",
    CANCEL: "commission-calculator",
    REFUND: "commission-calculator",
    SUBSCRIPTION_CREATED: "lifecycle-orchestrator",
    SUBSCRIPTION_CANCELLED: "lifecycle-orchestrator",
    AFFILIATE_SIGNUP: "lifecycle-orchestrator",
  };

  return eventMapping[event] ?? null;
}

/**
 * Normalize Hotmart webhook payload to internal format
 */
function normalizeHotmartPayload(event: HotmartWebhookEvent): Record<string, any> {
  return {
    hotmart: {
      transaction_id: event.data.transaction,
      product_id: event.data.product?.id,
      product_name: event.data.product?.name,
      offer_id: event.data.offer?.id,
      offer_name: event.data.offer?.name,
      affiliate_id: event.data.affiliate?.id,
      affiliate_name: event.data.affiliate?.name,
      affiliate_email: event.data.affiliate?.email,
      buyer_email: event.data.buyer?.email,
      buyer_name: event.data.buyer?.name,
      amount_value: event.data.amount?.value,
      amount_currency: event.data.amount?.currency ?? "BRL",
      commission_value: event.data.commission?.value,
      commission_currency: event.data.commission?.currency ?? "BRL",
      payment_method: event.data.payment?.method,
      payment_installment: event.data.payment?.installment,
      status: event.data.status,
    },
    event: event.event,
    timestamp: event.timestamp,
  };
}

/**
 * Sync sales from Hotmart (cron job)
 */
export async function syncHotmartSales(
  options: { daysBack?: number } = {},
): Promise<{ synced: number; errors: number }> {
  const daysBack = options.daysBack ?? 1;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);

  const summary = { synced: 0, errors: 0 };

  try {
    const sales = await fetchHotmartSales({
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      status: "COMPLETED",
    });

    for (const sale of sales) {
      try {
        await processHotmartSale(sale);
        summary.synced++;
      } catch {
        summary.errors++;
      }
    }
  } catch (error) {
    console.error("[Hotmart] Sync failed:", error);
  }

  return summary;
}

/**
 * Process individual Hotmart sale
 */
async function processHotmartSale(sale: HotmartSale): Promise<void> {
  // This would integrate with the commission calculator and billing system
  console.info(`[Hotmart] Processing sale: ${sale.transaction}`);

  // TODO: Integrate with database to record commission
  // TODO: Trigger affiliate notification
  // TODO: Update dashboard analytics
}
