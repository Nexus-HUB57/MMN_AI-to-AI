import { invokeLLM } from "../_core/llm";

/**
 * Shopee API Integration
 * Handles authentication, product search, and data synchronization
 */

const SHOPEE_API_BASE = "https://open-api.shopee.com/v2";
const SHOPEE_AUTH_URL = "https://partner.shopeemobile.com/api/v2/shop/auth_partner";

export interface ShopeeProduct {
  item_id: number;
  item_name: string;
  item_sku: string;
  price: number;
  stock: number;
  sold: number;
  shop_id: number;
  image: {
    image_url: string;
  };
  category_id: number;
  rating_star: number;
  cmt_count: number;
  description: string;
  item_status: string;
}

export interface ShopeeSearchResult {
  items: ShopeeProduct[];
  total_count: number;
}

/**
 * Gera URL de autenticação OAuth para Shopee
 */
export function getShopeeAuthUrl(partnerId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    partner_id: partnerId,
    redirect_uri: redirectUri,
    response_type: "code",
  });
  return `${SHOPEE_AUTH_URL}?${params.toString()}`;
}

/**
 * Troca código de autorização por access token
 */
export async function exchangeShopeeCode(
  code: string,
  partnerId: string,
  partnerKey: string,
  redirectUri: string
): Promise<{
  access_token: string;
  refresh_token: string;
  expire_in: number;
  shop_id: number;
}> {
  const timestamp = Math.floor(Date.now() / 1000);
  const body = JSON.stringify({
    code,
    partner_id: parseInt(partnerId),
    redirect_uri: redirectUri,
  });

  // Signature calculation (simplified - implement proper HMAC-SHA256 in production)
  const signature = Buffer.from(`${partnerId}${timestamp}${partnerKey}`).toString("base64");

  const response = await fetch(`${SHOPEE_API_BASE}/auth/token/get`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Partner-Id": partnerId,
      "X-Timestamp": timestamp.toString(),
      "X-Signature": signature,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange code: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Busca produtos na Shopee por categoria
 */
export async function searchShopeeProducts(
  query: string,
  categoryId?: number,
  limit: number = 50,
  accessToken?: string
): Promise<ShopeeSearchResult> {
  const params = new URLSearchParams({
    keyword: query,
    limit: limit.toString(),
    offset: "0",
    sort_type: "sales",
  });

  if (categoryId) {
    params.append("category_id", categoryId.toString());
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${SHOPEE_API_BASE}/product/search?${params.toString()}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to search products: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtém detalhes completos de um produto
 */
export async function getShopeeProductDetails(
  itemId: number,
  shopId: number,
  accessToken?: string
): Promise<ShopeeProduct> {
  const params = new URLSearchParams({
    item_id: itemId.toString(),
    shop_id: shopId.toString(),
  });

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${SHOPEE_API_BASE}/product/get_item_detail?${params.toString()}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to get product details: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Busca produtos em alta na Shopee
 */
export async function searchShopeeHotProducts(
  categoryId: number,
  limit: number = 20,
  accessToken?: string
): Promise<ShopeeProduct[]> {
  try {
    const params = new URLSearchParams({
      category_id: categoryId.toString(),
      limit: limit.toString(),
      offset: "0",
      sort_type: "sales",
    });

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${SHOPEE_API_BASE}/product/search?${params.toString()}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to search hot products: ${response.statusText}`);
    }

    const data = (await response.json()) as ShopeeSearchResult;
    return data.items;
  } catch (error) {
    console.error("[Shopee] Error searching hot products:", error);
    throw error;
  }
}

/**
 * Analisa tendências de um produto usando IA
 */
export async function analyzeShopeeProductTrends(product: ShopeeProduct): Promise<{
  trendingScore: number;
  demandLevel: "high" | "medium" | "low";
  competitionLevel: "high" | "medium" | "low";
  recommendation: "buy" | "hold" | "sell" | "avoid";
  profitabilityScore: number;
}> {
  try {
    const prompt = `Analise este produto da Shopee e forneça uma análise de tendências em JSON:
    
    Produto: ${product.item_name}
    Preço: R$ ${product.price / 100}
    Estoque: ${product.stock}
    Vendido: ${product.sold}
    Avaliação: ${product.rating_star}/5
    Comentários: ${product.cmt_count}
    
    Retorne um JSON com:
    - trendingScore (0-100): Quão em tendência está o produto
    - demandLevel: "high", "medium" ou "low"
    - competitionLevel: "high", "medium" ou "low"
    - recommendation: "buy", "hold", "sell" ou "avoid"
    - profitabilityScore (0-100): Potencial de lucro`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um especialista em análise de produtos e tendências de e-commerce.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "trend_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              trendingScore: { type: "number", description: "Score de tendência 0-100" },
              demandLevel: {
                type: "string",
                enum: ["high", "medium", "low"],
                description: "Nível de demanda",
              },
              competitionLevel: {
                type: "string",
                enum: ["high", "medium", "low"],
                description: "Nível de competição",
              },
              recommendation: {
                type: "string",
                enum: ["buy", "hold", "sell", "avoid"],
                description: "Recomendação de ação",
              },
              profitabilityScore: { type: "number", description: "Score de lucratividade 0-100" },
            },
            required: ["trendingScore", "demandLevel", "competitionLevel", "recommendation", "profitabilityScore"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }

    return {
      trendingScore: 50,
      demandLevel: "medium",
      competitionLevel: "medium",
      recommendation: "hold",
      profitabilityScore: 50,
    };
  } catch (error) {
    console.error("[Shopee] Error analyzing product trends:", error);
    return {
      trendingScore: 50,
      demandLevel: "medium",
      competitionLevel: "medium",
      recommendation: "hold",
      profitabilityScore: 50,
    };
  }
}

/**
 * Calcula margem de comissão para afiliado
 */
export function calculateShopeeCommission(
  productPrice: number,
  baseCommissionPercentage: number = 3
): {
  baseCommission: number;
  estimatedEarnings: number;
} {
  const baseCommission = (productPrice * baseCommissionPercentage) / 100;

  return {
    baseCommission: Math.round(baseCommission),
    estimatedEarnings: Math.round(baseCommission),
  };
}

/**
 * Sincroniza produtos de uma categoria
 */
export async function syncShopeeProducts(
  categoryId: number,
  limit: number = 50,
  accessToken?: string
): Promise<ShopeeProduct[]> {
  try {
    const products = await searchShopeeHotProducts(categoryId, limit, accessToken);
    return products;
  } catch (error) {
    console.error("[Shopee] Error syncing products:", error);
    throw error;
  }
}
