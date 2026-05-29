/**
 * Hotmart API Client
 * -----------------------------------------------------------------------------
 * Client for Hotmart API integration.
 * Handles authentication and API calls to Hotmart.
 */

export interface HotmartConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
  webhooksSecret: string;
}

export interface HotmartProduct {
  id: string;
  name: string;
  description: string;
  price: {
    value: number;
    currency: string;
  };
  status: "ACTIVE" | "INACTIVE" | "DELETED";
  createdAt: string;
}

export interface HotmartSale {
  id: string;
  transaction: string;
  productId: string;
  productName: string;
  affiliateId: string | null;
  affiliateEmail: string | null;
  buyerEmail: string;
  buyerName: string;
  amount: number;
  currency: string;
  commission: number;
  status: "COMPLETED" | "CANCELLED" | "REFUNDED" | "CHARGEBACK";
  createdAt: string;
  event: string;
}

export interface HotmartAffiliate {
  id: string;
  email: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface HotmartCommissionSplit {
  saleId: string;
  affiliateId: string;
  amount: number;
  percentage: number;
  status: "PENDING" | "PAID" | "CANCELLED";
}

const DEFAULT_CONFIG: HotmartConfig = {
  clientId: process.env.HOTMART_CLIENT_ID ?? "",
  clientSecret: process.env.HOTMART_CLIENT_SECRET ?? "",
  baseUrl: "https://api-hotmart-v2.hotmart.com",
  webhooksSecret: process.env.HOTMART_WEBHOOKS_SECRET ?? "",
};

export function getHotmartConfig(): HotmartConfig {
  return DEFAULT_CONFIG;
}

export function isHotmartConfigured(): boolean {
  const config = getHotmartConfig();
  return Boolean(config.clientId && config.clientSecret);
}

/**
 * Generate Hotmart OAuth token
 */
export async function getHotmartAccessToken(): Promise<string | null> {
  if (!isHotmartConfigured()) {
    console.warn("[Hotmart] API not configured");
    return null;
  }

  const config = getHotmartConfig();

  try {
    const response = await fetch(`${config.baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: config.clientId,
        client_secret: config.clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error(`Hotmart OAuth failed: ${response.status}`);
    }

    const data = await response.json() as { access_token?: string };
    return data.access_token ?? null;
  } catch (error) {
    console.error("[Hotmart] Failed to get access token:", error);
    return null;
  }
}

/**
 * Fetch Hotmart products
 */
export async function fetchHotmartProducts(): Promise<HotmartProduct[]> {
  const token = await getHotmartAccessToken();
  if (!token) return [];

  const config = getHotmartConfig();

  try {
    const response = await fetch(`${config.baseUrl}/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Hotmart API error: ${response.status}`);
    }

    return (await response.json()) as HotmartProduct[];
  } catch (error) {
    console.error("[Hotmart] Failed to fetch products:", error);
    return [];
  }
}

/**
 * Fetch Hotmart sales/orders
 */
export async function fetchHotmartSales(
  options: {
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
  } = {},
): Promise<HotmartSale[]> {
  const token = await getHotmartAccessToken();
  if (!token) return [];

  const config = getHotmartConfig();
  const params = new URLSearchParams();
  if (options.startDate) params.set("startDate", options.startDate);
  if (options.endDate) params.set("endDate", options.endDate);
  if (options.status) params.set("status", options.status);
  if (options.page) params.set("page", options.page.toString());

  try {
    const response = await fetch(
      `${config.baseUrl}/orders?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Hotmart API error: ${response.status}`);
    }

    return (await response.json()) as HotmartSale[];
  } catch (error) {
    console.error("[Hotmart] Failed to fetch sales:", error);
    return [];
  }
}

/**
 * Fetch Hotmart affiliates
 */
export async function fetchHotmartAffiliates(): Promise<HotmartAffiliate[]> {
  const token = await getHotmartAccessToken();
  if (!token) return [];

  const config = getHotmartConfig();

  try {
    const response = await fetch(`${config.baseUrl}/affiliates`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Hotmart API error: ${response.status}`);
    }

    return (await response.json()) as HotmartAffiliate[];
  } catch (error) {
    console.error("[Hotmart] Failed to fetch affiliates:", error);
    return [];
  }
}

/**
 * Verify Hotmart webhook signature
 */
export function verifyHotmartWebhook(
  payload: string,
  signature: string,
): boolean {
  if (!isHotmartConfigured()) return false;

  const config = getHotmartConfig();
  const crypto = require("node:crypto");

  const expectedSignature = crypto
    .createHmac("sha256", config.webhooksSecret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );
}
