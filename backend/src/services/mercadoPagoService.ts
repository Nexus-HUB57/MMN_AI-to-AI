import { randomUUID } from "node:crypto";
import { request as httpsRequest } from "node:https";

const MERCADO_PAGO_API_BASE = "https://api.mercadopago.com";
const MERCADO_PAGO_ACCESS_TOKEN =
  process.env.MERCADO_PAGO_ACCESS_TOKEN?.trim() ||
  process.env.MP_ACCESS_TOKEN?.trim() ||
  "";
const MERCADO_PAGO_NOTIFICATION_URL = process.env.MERCADO_PAGO_NOTIFICATION_URL?.trim() || undefined;
const MERCADO_PAGO_STATEMENT_DESCRIPTOR = process.env.MERCADO_PAGO_STATEMENT_DESCRIPTOR?.trim() || undefined;
const MERCADO_PAGO_USE_SANDBOX = process.env.MERCADO_PAGO_USE_SANDBOX === "true";
const MERCADO_PAGO_TIMEOUT_MS = Number(process.env.MERCADO_PAGO_TIMEOUT_MS || 15000);

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

function safeJsonParse(value: string) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function mercadoPagoRequest<T>(path: string, init?: RequestInit): Promise<T> {
  requireAccessToken();

  const url = new URL(path, MERCADO_PAGO_API_BASE);
  const body = typeof init?.body === "string" ? init.body : undefined;
  const mergedHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
    "User-Agent": "oneverso-mmn-ai/1.0 mercado-pago",
    ...(init?.headers ?? {}),
  } as Record<string, string>;

  return new Promise<T>((resolve, reject) => {
    const req = httpsRequest(
      url,
      {
        method: init?.method ?? "GET",
        headers: mergedHeaders,
        family: 4,
        timeout: MERCADO_PAGO_TIMEOUT_MS,
      },
      (response) => {
        const chunks: Buffer[] = [];

        response.on("data", (chunk) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });

        response.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf-8");
          const data = safeJsonParse(text);
          const statusCode = response.statusCode ?? 500;

          if (statusCode < 200 || statusCode >= 300) {
            const message =
              (data as any)?.message ||
              (data as any)?.error ||
              (text ? `Mercado Pago retornou HTTP ${statusCode}: ${text}` : `Mercado Pago retornou HTTP ${statusCode}`);
            reject(new Error(message));
            return;
          }

          resolve((data ?? {}) as T);
        });
      },
    );

    req.on("timeout", () => {
      req.destroy(new Error(`Timeout ao conectar no Mercado Pago após ${MERCADO_PAGO_TIMEOUT_MS}ms.`));
    });

    req.on("error", (error) => {
      reject(new Error(`Falha de rede ao acessar o Mercado Pago: ${error.message}`));
    });

    if (body) {
      req.write(body);
    }

    req.end();
  });
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

export async function getMercadoPagoPayment(paymentId: string | number) {
  return mercadoPagoRequest<{
    id: number;
    status?: string;
    status_detail?: string;
    external_reference?: string;
    date_approved?: string;
    date_created?: string;
    metadata?: Record<string, unknown>;
    point_of_interaction?: {
      type?: string;
      transaction_data?: {
        qr_code?: string;
        qr_code_base64?: string;
        ticket_url?: string;
      };
    };
  }>(`/v1/payments/${paymentId}`);
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


// HOTFIX D18.8: Preferência MP com múltiplos métodos (pix + saldo + cartão)
export interface McPagoPreferenceInput {
  externalReference: string;
  title: string;
  description?: string;
  amountCents: number;
  payerEmail?: string;
  payerName?: string;
  notificationUrl?: string;
  backUrls?: { success?: string; failure?: string; pending?: string };
}

export async function createMercadoPagoPreference(input: McPagoPreferenceInput): Promise<any | null> {
  if (!MERCADO_PAGO_ACCESS_TOKEN) return null;
  try {
    const body: any = {
      external_reference: input.externalReference,
      items: [{
        id: input.externalReference.slice(0, 32),
        title: input.title.slice(0, 80),
        description: input.description?.slice(0, 240) || input.title,
        quantity: 1,
        currency_id: "BRL",
        unit_price: Number((input.amountCents / 100).toFixed(2)),
      }],
      payer: {
        email: input.payerEmail,
        name: input.payerName,
      },
      payment_methods: {
        // Habilita explicitamente pix, cartão, e conta MP (saldo)
        excluded_payment_types: [], // sem exclusões
        installments: 12,
      },
      notification_url: input.notificationUrl,
      back_urls: input.backUrls,
      auto_return: "approved",
      binary_mode: false,
      statement_descriptor: "OneVerso",
    };
    const resp = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      console.warn("[MP.preference] status", resp.status, await resp.text().catch(() => ""));
      return null;
    }
    return await resp.json();
  } catch (err) {
    console.error("[MP.preference] erro", err);
    return null;
  }
}
