import { randomUUID } from "node:crypto";

const MERCADO_PAGO_API_BASE = "https://api.mercadopago.com";
const MERCADO_PAGO_ACCESS_TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim() ?? "";
const MERCADO_PAGO_NOTIFICATION_URL = process.env.MERCADO_PAGO_NOTIFICATION_URL?.trim() || undefined;
const MERCADO_PAGO_STATEMENT_DESCRIPTOR = process.env.MERCADO_PAGO_STATEMENT_DESCRIPTOR?.trim() || undefined;
const MERCADO_PAGO_USE_SANDBOX = process.env.MERCADO_PAGO_USE_SANDBOX === "true";

export interface MercadoPagoCheckoutPreferenceInput {
  slug: string;
  title: string;
  description?: string;
  amount: number;
  externalReference: string;
  payerEmail?: string;
  payerName?: string;
  metadata?: Record<string, unknown>;
  notificationUrl?: string;
  backUrls?: {
    success?: string;
    pending?: string;
    failure?: string;
  };
}

export interface MercadoPagoPixPaymentInput {
  amount: number;
  description: string;
  payerEmail: string;
  payerFirstName?: string;
  payerLastName?: string;
  identification?: {
    type: "CPF" | "CNPJ";
    number: string;
  };
  externalReference: string;
  notificationUrl?: string;
  metadata?: Record<string, unknown>;
}

function requireAccessToken() {
  if (!MERCADO_PAGO_ACCESS_TOKEN) {
    throw new Error("Mercado Pago access token não configurado.");
  }
}

async function mercadoPagoRequest<T>(path: string, init?: RequestInit): Promise<T> {
  requireAccessToken();

  const response = await fetch(`${MERCADO_PAGO_API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.message || data?.error || `Mercado Pago retornou HTTP ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

function sanitizeDescription(value?: string, maxLength = 120) {
  return (value ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function isMercadoPagoConfigured() {
  return Boolean(MERCADO_PAGO_ACCESS_TOKEN);
}

export function resolveMercadoPagoCheckoutUrl(response: { init_point?: string; sandbox_init_point?: string }) {
  if (MERCADO_PAGO_USE_SANDBOX && response.sandbox_init_point) {
    return response.sandbox_init_point;
  }
  return response.init_point ?? response.sandbox_init_point ?? null;
}

export async function createMercadoPagoCheckoutPreference(input: MercadoPagoCheckoutPreferenceInput) {
  const payload = {
    items: [
      {
        id: input.slug,
        title: sanitizeDescription(input.title, 120) || "Produto Nexus",
        description: sanitizeDescription(input.description, 240) || undefined,
        quantity: 1,
        currency_id: "BRL",
        unit_price: Number(input.amount.toFixed(2)),
      },
    ],
    payer: input.payerEmail
      ? {
          name: input.payerName,
          email: input.payerEmail,
        }
      : undefined,
    back_urls: input.backUrls,
    auto_return: "approved",
    notification_url: input.notificationUrl ?? MERCADO_PAGO_NOTIFICATION_URL,
    external_reference: input.externalReference,
    statement_descriptor: MERCADO_PAGO_STATEMENT_DESCRIPTOR,
    metadata: input.metadata,
  };

  return mercadoPagoRequest<{
    id: string;
    init_point?: string;
    sandbox_init_point?: string;
    date_created?: string;
  }>("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createMercadoPagoPixPayment(input: MercadoPagoPixPaymentInput) {
  const payload = {
    transaction_amount: Number(input.amount.toFixed(2)),
    description: sanitizeDescription(input.description, 120) || "Pagamento Nexus",
    payment_method_id: "pix",
    external_reference: input.externalReference,
    notification_url: input.notificationUrl ?? MERCADO_PAGO_NOTIFICATION_URL,
    payer: {
      email: input.payerEmail,
      first_name: input.payerFirstName,
      last_name: input.payerLastName,
      identification: input.identification,
    },
    metadata: input.metadata,
  };

  return mercadoPagoRequest<{
    id: number;
    status?: string;
    status_detail?: string;
    date_of_expiration?: string;
    point_of_interaction?: {
      type?: string;
      transaction_data?: {
        qr_code?: string;
        qr_code_base64?: string;
        ticket_url?: string;
      };
    };
  }>("/v1/payments", {
    method: "POST",
    headers: {
      "X-Idempotency-Key": randomUUID(),
    },
    body: JSON.stringify(payload),
  });
}
