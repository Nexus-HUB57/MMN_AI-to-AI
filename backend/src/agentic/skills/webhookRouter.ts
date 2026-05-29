/**
 * Handler operacional · Webhook Router
 * -----------------------------------------------------------------------------
 * Routes events from Hotmart/Shopee/ML to appropriate skills.
 */

import { randomUUID } from "node:crypto";
import { z } from "zod";

import type {
  SkillExecutionContext,
  SkillExecutionResult,
  SkillHandler,
} from "./types";

const WebhookRouterInputSchema = z.object({
  source: z.enum(["hotmart", "shopee", "mercadolivre", "stripe"]),
  eventType: z.string().min(1).max(80),
  payload: z.record(z.any()),
  rawHeaders: z.record(z.string()).optional(),
});

export type WebhookRouterInput = z.infer<typeof WebhookRouterInputSchema>;

export interface RoutedEvent {
  skillToTrigger: string;
  processedPayload: Record<string, any>;
  priority: "low" | "normal" | "high" | "critical";
  notes: string[];
}

export interface WebhookRouterOutput {
  source: string;
  eventType: string;
  eventId: string;
  routed: RoutedEvent[];
  processingTime: number;
  errors: string[];
}

const HOTMART_EVENTS: Record<string, { skill: string; priority: string }> = {
  PURCHASE: { skill: "commission-calculator", priority: "high" },
  CANCEL: { skill: "commission-calculator", priority: "high" },
  REFUND: { skill: "commission-calculator", priority: "critical" },
  SUBSCRIPTION_CREATED: { skill: "lifecycle-orchestrator", priority: "normal" },
  SUBSCRIPTION_CANCELLED: { skill: "lifecycle-orchestrator", priority: "high" },
  AFFILIATE_SIGNUP: { skill: "lifecycle-orchestrator", priority: "normal" },
};

const SHOPEE_EVENTS: Record<string, { skill: string; priority: string }> = {
  ORDER_PLACED: { skill: "commission-calculator", priority: "high" },
  ORDER_CANCELLED: { skill: "analytics-reporter", priority: "normal" },
  AFFILIATE_SIGNUP: { skill: "lifecycle-orchestrator", priority: "low" },
};

const STRIPE_EVENTS: Record<string, { skill: string; priority: string }> = {
  checkout_session_completed: { skill: "commission-calculator", priority: "high" },
  customer_subscription_created: { skill: "lifecycle-orchestrator", priority: "normal" },
  customer_subscription_deleted: { skill: "lifecycle-orchestrator", priority: "high" },
  invoice_payment_failed: { skill: "analytics-reporter", priority: "normal" },
};

function getEventMapping(source: string): Record<string, { skill: string; priority: string }> {
  switch (source) {
    case "hotmart":
      return HOTMART_EVENTS;
    case "shopee":
      return SHOPEE_EVENTS;
    case "stripe":
      return STRIPE_EVENTS;
    default:
      return {};
  }
}

function processPayload(source: string, eventType: string, payload: Record<string, any>): Record<string, any> {
  switch (source) {
    case "hotmart":
      return {
        transactionId: payload.hotmart?.transaction_id ?? payload.id,
        productId: payload.product?.id ?? payload.offer_id,
        affiliateId: payload.affiliate?.id,
        customerEmail: payload.customer?.email,
        amount: payload.amount?.value ?? payload.price,
        currency: payload.amount?.currency ?? "BRL",
        status: payload.status?.toLowerCase(),
        eventDate: payload.event?.timestamp ?? payload.creation_date,
      };
    case "stripe":
      return {
        transactionId: payload.id,
        customerId: payload.customer,
        amount: (payload.amount_paid ?? payload.amount) / 100,
        currency: payload.currency?.toUpperCase(),
        status: payload.status,
        subscriptionId: payload.subscription,
      };
    case "shopee":
      return {
        orderId: payload.order_id,
        affiliateId: payload.affiliate_id,
        amount: payload.order_amount,
        status: payload.order_status,
      };
    default:
      return payload;
  }
}

export const webhookRouterHandler: SkillHandler<
  WebhookRouterInput,
  WebhookRouterOutput
> = {
  slug: "webhook-router",
  title: "Roteador de Webhooks",
  category: "integration",
  version: "1.0.0",
  supportsAutonomous: true,
  parseInput: (raw: unknown): WebhookRouterInput => WebhookRouterInputSchema.parse(raw),
  execute: async (
    input: WebhookRouterInput,
    _context: SkillExecutionContext,
  ): Promise<SkillExecutionResult<WebhookRouterOutput>> => {
    const startedAt = Date.now();
    const routed: RoutedEvent[] = [];
    const errors: string[] = [];

    try {
      const mapping = getEventMapping(input.source);
      const eventConfig = mapping[input.eventType];

      if (eventConfig) {
        routed.push({
          skillToTrigger: eventConfig.skill,
          processedPayload: processPayload(input.source, input.eventType, input.payload),
          priority: eventConfig.priority as RoutedEvent["priority"],
          notes: [
            `Evento ${input.eventType} de ${input.source}`,
            `Skill destino: ${eventConfig.skill}`,
          ],
        });
      } else {
        errors.push(`Evento ${input.eventType} não mapeado para ${input.source}`);
        routed.push({
          skillToTrigger: "analytics-reporter",
          processedPayload: processPayload(input.source, input.eventType, input.payload),
          priority: "low",
          notes: ["Evento não riconhecido - registrado para análise"],
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      errors.push(msg);
    }

    return {
      executionId: randomUUID(),
      skill: "webhook-router",
      success: errors.length === 0,
      decision: "auto",
      latencyMs: Date.now() - startedAt,
      output: {
        source: input.source,
        eventType: input.eventType,
        eventId: input.payload.id?.toString() ?? randomUUID(),
        routed,
        processingTime: Date.now() - startedAt,
        errors,
      },
      message: `Webhook ${input.source}/${input.eventType} processado - ${routed.length} evento(s) roteado(s)`,
    };
  },
};
