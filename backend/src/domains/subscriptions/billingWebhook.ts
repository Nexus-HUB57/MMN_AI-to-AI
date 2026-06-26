import {
  cancelSubscription,
  handleSubscriptionInvoicePaid,
  markSubscriptionPastDue,
} from "./service";
import { getMercadoPagoPayment } from "../../services/mercadoPagoService";

interface WebhookOutcome {
  ok: boolean;
  ignored?: boolean;
  provider: "mercado_pago" | "hotmart";
  action: "invoice_paid" | "past_due" | "cancelled" | "ignored";
  subscriptionId?: string | null;
  invoiceId?: string | null;
  reason?: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function readPath(source: Record<string, unknown>, path: string[]): unknown {
  let current: unknown = source;
  for (const key of path) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function parseSubscriptionId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("subscription:")) {
    return trimmed.split(":")[1] ?? null;
  }
  return trimmed.startsWith("sub_") ? trimmed : null;
}

export function resolveSubscriptionIdFromPayload(payload: Record<string, unknown>): string | null {
  const candidates = [
    readPath(payload, ["metadata", "subscriptionId"]),
    readPath(payload, ["data", "metadata", "subscriptionId"]),
    readPath(payload, ["data", "subscriptionId"]),
    readPath(payload, ["subscriptionId"]),
    readPath(payload, ["subscription_id"]),
    readPath(payload, ["external_reference"]),
    readPath(payload, ["data", "external_reference"]),
  ];

  for (const candidate of candidates) {
    const parsed = parseSubscriptionId(candidate);
    if (parsed) return parsed;
  }

  return null;
}

// Transição automática Partners Pack -> Ativação Mensal acionada via cron/billing.
export async function processMercadoPagoSubscriptionWebhook(input: {
  body: Record<string, unknown>;
  query?: Record<string, unknown>;
}): Promise<WebhookOutcome> {
  const paymentId =
    input.body?.data && typeof input.body.data === "object"
      ? (input.body.data as Record<string, unknown>).id
      : input.body.id ?? input.query?.["data.id"];

  if (!paymentId) {
    return {
      ok: true,
      ignored: true,
      provider: "mercado_pago",
      action: "ignored",
      reason: "Webhook sem paymentId.",
    };
  }

  const payment = await getMercadoPagoPayment(String(paymentId));
  const paymentRecord = asRecord(payment);
  const subscriptionId = resolveSubscriptionIdFromPayload(paymentRecord);

  if (!subscriptionId) {
    return {
      ok: true,
      ignored: true,
      provider: "mercado_pago",
      action: "ignored",
      reason: "Pagamento não vinculado a assinatura Nexus Partners.",
    };
  }

  const status = String(payment.status ?? "").toLowerCase();
  if (["approved", "authorized", "accredited"].includes(status)) {
    await handleSubscriptionInvoicePaid({
      subscriptionId,
      invoiceId: String(payment.id),
      paidAt: payment.date_approved ?? payment.date_created ?? null,
      provider: "mercado_pago",
      externalReference: typeof payment.external_reference === "string" ? payment.external_reference : null,
    });

    return {
      ok: true,
      provider: "mercado_pago",
      action: "invoice_paid",
      subscriptionId,
      invoiceId: String(payment.id),
    };
  }

  if (["pending", "in_process", "in_mediation"].includes(status)) {
    return {
      ok: true,
      ignored: true,
      provider: "mercado_pago",
      action: "ignored",
      subscriptionId,
      invoiceId: String(payment.id),
      reason: `Status ${status} ainda não liquida a assinatura.`,
    };
  }

  await markSubscriptionPastDue(subscriptionId);
  return {
    ok: true,
    provider: "mercado_pago",
    action: "past_due",
    subscriptionId,
    invoiceId: String(payment.id),
    reason: `Pagamento retornou status ${status}.`,
  };
}

export async function processHotmartSubscriptionWebhook(payload: Record<string, unknown>): Promise<WebhookOutcome> {
  const normalized = asRecord(payload);
  const eventName = String(
    normalized.event ?? normalized.eventName ?? normalized.type ?? readPath(normalized, ["data", "event"] ) ?? "",
  ).toUpperCase();
  const subscriptionId = resolveSubscriptionIdFromPayload(normalized);
  const invoiceId =
    typeof readPath(normalized, ["data", "transaction"]) === "string"
      ? String(readPath(normalized, ["data", "transaction"]))
      : typeof normalized.transaction === "string"
        ? normalized.transaction
        : null;

  if (!subscriptionId) {
    return {
      ok: true,
      ignored: true,
      provider: "hotmart",
      action: "ignored",
      reason: "Webhook Hotmart sem subscriptionId reconhecível.",
    };
  }

  if (
    eventName.includes("INVOICE_PAID") ||
    eventName.includes("PURCHASE_APPROVED") ||
    eventName === "APPROVED" ||
    eventName === "PURCHASE"
  ) {
    await handleSubscriptionInvoicePaid({
      subscriptionId,
      invoiceId,
      paidAt: (normalized.timestamp as string | undefined) ?? new Date().toISOString(),
      provider: "hotmart",
      externalReference: typeof normalized.external_reference === "string" ? normalized.external_reference : null,
    });

    return {
      ok: true,
      provider: "hotmart",
      action: "invoice_paid",
      subscriptionId,
      invoiceId,
    };
  }

  if (eventName.includes("SUBSCRIPTION_CANCELLED") || eventName.endsWith("CANCELLED")) {
    await cancelSubscription({
      subscriptionId,
      reason: `Cancelamento recebido do Hotmart (${eventName}).`,
      triggeredBy: "billing_webhook",
    });

    return {
      ok: true,
      provider: "hotmart",
      action: "cancelled",
      subscriptionId,
      invoiceId,
    };
  }

  if (eventName.includes("REFUND") || eventName.includes("CHARGEBACK") || eventName.includes("PAST_DUE")) {
    await markSubscriptionPastDue(subscriptionId);
    return {
      ok: true,
      provider: "hotmart",
      action: "past_due",
      subscriptionId,
      invoiceId,
    };
  }

  return {
    ok: true,
    ignored: true,
    provider: "hotmart",
    action: "ignored",
    subscriptionId,
    invoiceId,
    reason: `Evento ${eventName || "desconhecido"} não altera assinatura.`,
  };
}
