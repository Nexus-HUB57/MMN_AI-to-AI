/**
 * PIX Service — Epic 10.2
 *
 * Geração de QR Code estático e dinâmico seguindo a especificação
 * EMV QR Code do Banco Central do Brasil (Resolução BCB n.º 1/2020).
 *
 * Referência: https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix-versao3.pdf
 */

// ============================================================================
// CRC-16/CCITT-FALSE
// ============================================================================

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

// ============================================================================
// TLV helpers
// ============================================================================

function tlv(id: string, value: string): string {
  const len = String(value.length).padStart(2, "0");
  return `${id}${len}${value}`;
}

// ============================================================================
// Tipos públicos
// ============================================================================

export interface PixStaticPayload {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  txid?: string;
  description?: string;
}

export interface PixDynamicPayload {
  url: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  txid?: string;
}

export interface PixQrCodeResult {
  payload: string;
  crc: string;
  fullPayload: string;
  amount?: number;
  txid: string;
  type: "static" | "dynamic";
}

// ============================================================================
// Geração de payload estático (chave PIX direta)
// ============================================================================

export function generatePixStaticPayload(params: PixStaticPayload): PixQrCodeResult {
  const txid = params.txid ?? "***";
  const sanitizedName = params.merchantName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .substring(0, 25)
    .toUpperCase()
    .trim();

  const sanitizedCity = params.merchantCity
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .substring(0, 15)
    .toUpperCase()
    .trim();

  // CEO-013: Description removed from tag 26 (Merchant Account Info).
  // Per EMV PIX spec, tag 26 must ONLY contain sub-tags 00 (GUI) and 01 (PIX key).
  // Placing description (sub-tag 02) inside tag 26 causes bank parser rejection.
  // Description is omitted for maximum compatibility; txid in tag 62.05 serves as identifier.
  const merchantAccountInfo = tlv(
    "26",
    tlv("00", "BR.GOV.BCB.PIX") + tlv("01", params.pixKey),
  );

  const amountPart =
    params.amount !== undefined && params.amount > 0
      ? tlv("54", params.amount.toFixed(2))
      : "";

  const additionalDataField = tlv("62", tlv("05", txid));

  const payloadWithoutCrc =
    tlv("00", "01") +
    merchantAccountInfo +
    tlv("52", "0000") +
    tlv("53", "986") +
    amountPart +
    tlv("58", "BR") +
    tlv("59", sanitizedName) +
    tlv("60", sanitizedCity) +
    additionalDataField +
    "6304";

  const crc = crc16(payloadWithoutCrc);
  const fullPayload = payloadWithoutCrc + crc;

  return {
    payload: payloadWithoutCrc,
    crc,
    fullPayload,
    amount: params.amount,
    txid,
    type: "static",
  };
}

// ============================================================================
// Geração de payload dinâmico (URL de cobrança)
// ============================================================================

export function generatePixDynamicPayload(params: PixDynamicPayload): PixQrCodeResult {
  const txid = params.txid ?? crypto.randomUUID().replace(/-/g, "").substring(0, 25);
  const sanitizedName = params.merchantName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .substring(0, 25)
    .toUpperCase()
    .trim();

  const sanitizedCity = params.merchantCity
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .substring(0, 15)
    .toUpperCase()
    .trim();

  const cleanUrl = params.url.replace(/^https?:\/\//i, "");
  const merchantAccountInfo = tlv("26", tlv("00", "BR.GOV.BCB.PIX") + tlv("25", cleanUrl));

  const amountPart =
    params.amount !== undefined && params.amount > 0
      ? tlv("54", params.amount.toFixed(2))
      : "";

  const additionalDataField = tlv("62", tlv("05", txid));

  const payloadWithoutCrc =
    tlv("00", "01") +
    merchantAccountInfo +
    tlv("52", "0000") +
    tlv("53", "986") +
    amountPart +
    tlv("58", "BR") +
    tlv("59", sanitizedName) +
    tlv("60", sanitizedCity) +
    additionalDataField +
    "6304";

  const crc = crc16(payloadWithoutCrc);
  const fullPayload = payloadWithoutCrc + crc;

  return {
    payload: payloadWithoutCrc,
    crc,
    fullPayload,
    amount: params.amount,
    txid,
    type: "dynamic",
  };
}

// ============================================================================
// Validação de chave PIX
// ============================================================================

export type PixKeyType = "cpf" | "cnpj" | "phone" | "email" | "evp";

export function detectPixKeyType(key: string): PixKeyType {
  const clean = key.replace(/\D/g, "");

  if (/^\d{11}$/.test(clean) && !key.includes("@")) return "cpf";
  if (/^\d{14}$/.test(clean)) return "cnpj";
  if (/^\+55\d{10,11}$/.test(key) || /^\d{10,11}$/.test(clean)) return "phone";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) return "email";
  return "evp";
}

export function validatePixKey(key: string): { valid: boolean; type: PixKeyType; message?: string } {
  const type = detectPixKeyType(key);

  switch (type) {
    case "cpf": {
      const d = key.replace(/\D/g, "");
      if (d.length !== 11) return { valid: false, type, message: "CPF deve ter 11 dígitos" };
      return { valid: true, type };
    }
    case "cnpj": {
      const d = key.replace(/\D/g, "");
      if (d.length !== 14) return { valid: false, type, message: "CNPJ deve ter 14 dígitos" };
      return { valid: true, type };
    }
    case "phone": {
      const d = key.replace(/\D/g, "");
      if (d.length < 10 || d.length > 11) return { valid: false, type, message: "Telefone inválido" };
      return { valid: true, type };
    }
    case "email": {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) return { valid: false, type, message: "Email inválido" };
      return { valid: true, type };
    }
    case "evp": {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(key)) return { valid: false, type, message: "Chave aleatória (EVP) inválida" };
      return { valid: true, type };
    }
    default:
      return { valid: false, type: "evp", message: "Tipo de chave não reconhecido" };
  }
}

// ============================================================================
// Sandbox: simula confirmação de pagamento para testes
// ============================================================================

export interface PixSandboxConfirmation {
  txid: string;
  status: "CONCLUIDA" | "ATIVA" | "DEVOLVIDA";
  valor: { original: string };
  horario: { liquidacao: string };
  payer?: { nome: string; cpf?: string };
  endToEndId: string;
}

export function simulateSandboxConfirmation(
  txid: string,
  amount: number,
  payerName = "Pagador Teste",
): PixSandboxConfirmation {
  return {
    txid,
    status: "CONCLUIDA",
    valor: { original: amount.toFixed(2) },
    horario: { liquidacao: new Date().toISOString() },
    payer: { nome: payerName },
    endToEndId: `E${Date.now()}`,
  };
}
