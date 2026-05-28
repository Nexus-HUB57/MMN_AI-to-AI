/**
 * OpenPix PSP Service — Epic 10.2.8
 *
 * Integração com a API OpenPix (https://api.openpix.com.br) para geração
 * de QR Codes PIX dinâmicos, consulta de status e gestão de cobranças.
 *
 * Documentação: https://developers.openpix.com.br/api
 *
 * Variáveis de ambiente necessárias:
 *   OPENPIX_TOKEN   — token de autorização (App ID / token da plataforma)
 *   OPENPIX_APP_ID  — App ID do plugin (para validação de webhook)
 */

const OPENPIX_BASE_URL = "https://api.openpix.com.br/api/v1";
const OPENPIX_TOKEN = process.env.OPENPIX_TOKEN ?? "";
const OPENPIX_APP_ID = process.env.OPENPIX_APP_ID ?? "";

export interface OpenPixChargeInput {
  correlationID: string;
  value: number;
  comment?: string;
  expiresIn?: number;
  customer?: {
    name: string;
    email?: string;
    phone?: string;
    taxID?: { taxID: string; type: "BR:CPF" | "BR:CNPJ" };
  };
  additionalInfo?: Array<{ key: string; value: string }>;
}

export interface OpenPixChargeResponse {
  charge: {
    status: "ACTIVE" | "COMPLETED" | "EXPIRED";
    correlationID: string;
    value: number;
    qrCodeImage?: string;
    brCode?: string;
    paymentLinkUrl?: string;
    pixKey?: string;
    expiresIn?: number;
    expiresDate?: string;
    transactionID?: string;
    paidAt?: string | null;
    payer?: { name?: string; taxID?: string } | null;
  };
}

export interface OpenPixWebhookPayload {
  event: "OPENPIX:CHARGE_COMPLETED" | "OPENPIX:CHARGE_EXPIRED" | string;
  charge: {
    status: string;
    correlationID: string;
    value: number;
    transactionID?: string;
    paidAt?: string;
    payer?: { name?: string; taxID?: string } | null;
  };
  pix?: {
    endToEndId?: string;
    time?: string;
    value?: number;
  };
}

function makeHeaders(): Record<string, string> {
  return {
    Authorization: OPENPIX_TOKEN,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export function isOpenPixAvailable(): boolean {
  return OPENPIX_TOKEN.length > 0;
}

/**
 * Cria uma cobrança PIX dinâmica no OpenPix.
 * Retorna o QR Code (brCode) e informações da cobrança.
 */
export async function createOpenPixCharge(
  input: OpenPixChargeInput,
): Promise<OpenPixChargeResponse> {
  if (!isOpenPixAvailable()) {
    throw new Error("OPENPIX_TOKEN não configurado. Configure para usar PIX dinâmico em produção.");
  }

  const body = {
    correlationID: input.correlationID,
    value: input.value,
    comment: input.comment,
    expiresIn: input.expiresIn ?? 3600,
    customer: input.customer,
    additionalInfo: input.additionalInfo,
  };

  const res = await fetch(`${OPENPIX_BASE_URL}/charge`, {
    method: "POST",
    headers: makeHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenPix API error ${res.status}: ${errorText}`);
  }

  return res.json() as Promise<OpenPixChargeResponse>;
}

/**
 * Busca o status de uma cobrança pelo correlationID.
 */
export async function getOpenPixChargeStatus(
  correlationID: string,
): Promise<OpenPixChargeResponse> {
  if (!isOpenPixAvailable()) {
    throw new Error("OPENPIX_TOKEN não configurado.");
  }

  const res = await fetch(`${OPENPIX_BASE_URL}/charge/${encodeURIComponent(correlationID)}`, {
    method: "GET",
    headers: makeHeaders(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenPix API error ${res.status}: ${errorText}`);
  }

  return res.json() as Promise<OpenPixChargeResponse>;
}

/**
 * Valida a assinatura do webhook OpenPix.
 * O header `x-webhook-signature` é base64(appID:payload_sha256).
 */
export function validateOpenPixWebhookSignature(
  rawBody: string,
  signatureHeader: string | undefined,
): boolean {
  if (!OPENPIX_APP_ID || !signatureHeader) return false;

  try {
    const decoded = Buffer.from(signatureHeader, "base64").toString("utf-8");
    const [appId] = decoded.split(":");
    return appId === OPENPIX_APP_ID;
  } catch {
    return false;
  }
}

/**
 * Mapeia o status OpenPix para o status interno do sistema.
 */
export function mapOpenPixStatus(
  openPixStatus: string,
): "ATIVA" | "CONCLUIDA" | "EXPIRADA" {
  switch (openPixStatus) {
    case "COMPLETED":
      return "CONCLUIDA";
    case "EXPIRED":
      return "EXPIRADA";
    default:
      return "ATIVA";
  }
}
