type MarketplaceCheckoutSource = "estoque" | "minisite" | "packs" | "marketplaces" | "subscriptions" | "checkout-manual" | string;

type MarketplaceCheckoutType = "produto" | "pack" | "subscription" | string;

export interface MarketplaceCheckoutIntent {
  source?: MarketplaceCheckoutSource;
  type?: MarketplaceCheckoutType;
  slug?: string;
  name?: string;
  amountCents?: number;
  description?: string;
  subscriptionId?: string;
  termMonths?: number;
}

export const MARKETPLACE_CHECKOUT_STORAGE_KEY = "nexus-marketplace-checkout-intent";
export const MARKETPLACE_PIX_KEY = "19992691954";
export const MARKETPLACE_PIX_BANK_LABEL = "Nubank";

function toBase64(value: string) {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    return window.btoa(unescape(encodeURIComponent(value)));
  }
  return Buffer.from(value, "utf-8").toString("base64");
}

function fromBase64(value: string) {
  if (typeof window !== "undefined" && typeof window.atob === "function") {
    return decodeURIComponent(escape(window.atob(value)));
  }
  return Buffer.from(value, "base64").toString("utf-8");
}

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function normalizeIntent(intent: MarketplaceCheckoutIntent): MarketplaceCheckoutIntent {
  return {
    source: intent.source ?? "checkout-manual",
    type: intent.type ?? "produto",
    slug: intent.slug ?? "checkout-manual",
    name: intent.name ?? "Pagamento Nexus",
    amountCents: typeof intent.amountCents === "number" ? Math.max(0, Math.round(intent.amountCents)) : undefined,
    description: intent.description ?? undefined,
    subscriptionId: intent.subscriptionId ?? undefined,
    termMonths: typeof intent.termMonths === "number" ? intent.termMonths : undefined,
  };
}

function persistIntent(intent: MarketplaceCheckoutIntent) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(MARKETPLACE_CHECKOUT_STORAGE_KEY, JSON.stringify(intent));
  } catch {
    // noop
  }
}

export function clearMarketplaceCheckoutIntent() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(MARKETPLACE_CHECKOUT_STORAGE_KEY);
  } catch {
    // noop
  }
}

export function buildMarketplaceCheckoutUrl(intent: MarketplaceCheckoutIntent) {
  const normalized = normalizeIntent(intent);
  persistIntent(normalized);
  const encoded = encodeURIComponent(toBase64(JSON.stringify(normalized)));
  return `/pix/checkout?intent=${encoded}`;
}

export function readMarketplaceCheckoutIntent(): MarketplaceCheckoutIntent | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const encodedIntent = params.get("intent");
  if (encodedIntent) {
    try {
      const decoded = fromBase64(decodeURIComponent(encodedIntent));
      const parsed = safeJsonParse<MarketplaceCheckoutIntent>(decoded);
      if (parsed) {
        const normalized = normalizeIntent(parsed);
        persistIntent(normalized);
        return normalized;
      }
    } catch {
      // fallback para session storage
    }
  }

  const stored = safeJsonParse<MarketplaceCheckoutIntent>(window.sessionStorage.getItem(MARKETPLACE_CHECKOUT_STORAGE_KEY));
  return stored ? normalizeIntent(stored) : null;
}

export function getMarketplaceReturnUrl(source?: MarketplaceCheckoutSource) {
  switch (source) {
    case "estoque":
      return "/estoque";
    case "minisite":
      return "/minisite";
    case "packs":
      return "/packs";
    case "marketplaces":
      return "/marketplaces";
    case "subscriptions":
      return "/subscriptions";
    default:
      return "/dashboard";
  }
}

export function parseCurrencyTextToCents(value?: string | null) {
  if (!value) return null;
  const normalized = value
    .replace(/\s/g, "")
    .replace(/R\$/gi, "")
    .replace(/\./g, "")
    .replace(/,/g, ".")
    .replace(/[^0-9.-]/g, "");

  if (!normalized) return null;
  const amount = Number.parseFloat(normalized);
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount * 100);
}

export function formatCurrencyFromCents(amountCents?: number | null) {
  const safeAmount = typeof amountCents === "number" ? amountCents : 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(safeAmount / 100);
}

type PixKeyType = "cpf" | "cnpj" | "phone" | "email" | "evp";

function detectPixKeyType(key: string): PixKeyType {
  const clean = key.replace(/\D/g, "");
  if (/^\d{11}$/.test(clean) && !key.includes("@")) return "cpf";
  if (/^\d{14}$/.test(clean)) return "cnpj";
  if (/^\+55\d{10,11}$/.test(key) || /^\d{10,11}$/.test(clean)) return "phone";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key)) return "email";
  return "evp";
}

const PIX_KEY_TYPE_LABELS: Record<PixKeyType, string> = {
  cpf: "CPF",
  cnpj: "CNPJ",
  phone: "Celular",
  email: "E-mail",
  evp: "Chave aleatória",
};

export const MARKETPLACE_PIX_KEY_TYPE_LABEL = PIX_KEY_TYPE_LABELS[detectPixKeyType(MARKETPLACE_PIX_KEY)];

function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i += 1) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j += 1) {
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

function tlv(id: string, value: string): string {
  const len = String(value.length).padStart(2, "0");
  return `${id}${len}${value}`;
}

function sanitizePixText(value: string, maxLength: number) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .substring(0, maxLength)
    .toUpperCase()
    .trim();
}

export function generateMarketplacePixPayload({
  amountCents,
  description,
}: {
  amountCents: number;
  description?: string;
}) {
  const merchantName = sanitizePixText("ONEVERSO MMN AI", 25);
  const merchantCity = sanitizePixText("SAO PAULO", 15);
  const txid = "***";
  const amount = Math.max(0, amountCents) / 100;
  const descriptionPart = description ? tlv("02", description.substring(0, 72)) : "";
  const merchantAccountInfo = tlv(
    "26",
    tlv("00", "BR.GOV.BCB.PIX") + tlv("01", MARKETPLACE_PIX_KEY) + descriptionPart,
  );
  const amountPart = amount > 0 ? tlv("54", amount.toFixed(2)) : "";
  const additionalDataField = tlv("62", tlv("05", txid));
  const payloadWithoutCrc =
    tlv("00", "01") +
    merchantAccountInfo +
    tlv("52", "0000") +
    tlv("53", "986") +
    amountPart +
    tlv("58", "BR") +
    tlv("59", merchantName) +
    tlv("60", merchantCity) +
    additionalDataField +
    "6304";
  const crc = crc16(payloadWithoutCrc);

  return {
    qrCodePayload: payloadWithoutCrc + crc,
    amount,
    txid,
  };
}
