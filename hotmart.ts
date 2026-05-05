import { invokeLLM } from "../_core/llm";

/**
 * Hotmart API Integration
 * Handles authentication, product search, and data synchronization
 */

const HOTMART_API_BASE = "https://api.hotmart.com/v1";
const HOTMART_AUTH_URL = "https://api.hotmart.com/v1/oauth/authorize";

export interface HotmartProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  producer: {
    id: string;
    name: string;
    email: string;
  };
  sales: number;
  rating: number;
  reviews: number;
  thumbnail: string;
  url: string;
  commission_percentage: number;
  status: string;
}

export interface HotmartSearchResult {
  items: HotmartProduct[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * Gera URL de autenticação OAuth para Hotmart
 */
export function getHotmartAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "read:products read:sales",
  });
  return `${HOTMART_AUTH_URL}?${params.toString()}`;
}

/**
 * Troca código de autorização por access token
 */
export async function exchangeHotmartCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}> {
  const response = await fetch(`${HOTMART_API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange code: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Busca produtos na Hotmart por categoria
 */
export async function searchHotmartProducts(
  query: string,
  category?: string,
  limit: number = 50,
  accessToken?: string
): Promise<HotmartSearchResult> {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
    page: "1",
    sort: "sales_desc",
  });

  if (category) {
    params.append("category", category);
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${HOTMART_API_BASE}/products/search?${params.toString()}`, {
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
export async function getHotmartProductDetails(
  productId: string,
  accessToken?: string
): Promise<HotmartProduct> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${HOTMART_API_BASE}/products/${productId}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to get product details: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Busca produtos digitais em alta na Hotmart
 */
export async function searchHotmartTrendingProducts(
  category: string,
  limit: number = 20,
  accessToken?: string
): Promise<HotmartProduct[]> {
  try {
    const params = new URLSearchParams({
      category,
      limit: limit.toString(),
      page: "1",
      sort: "sales_desc",
    });

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${HOTMART_API_BASE}/products/search?${params.toString()}`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to search trending products: ${response.statusText}`);
    }

    const data = (await response.json()) as HotmartSearchResult;
    return data.items;
  } catch (error) {
    console.error("[Hotmart] Error searching trending products:", error);
    throw error;
  }
}

/**
 * Obtém comissões disponíveis para um produto
 */
export async function getHotmartProductCommissions(
  productId: string,
  accessToken?: string
): Promise<{
  baseCommission: number;
  maxCommission: number;
  commissionType: string;
}> {
  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const response = await fetch(`${HOTMART_API_BASE}/products/${productId}/commissions`, {
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to get commissions: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error("[Hotmart] Error getting commissions:", error);
    return {
      baseCommission: 30,
      maxCommission: 50,
      commissionType: "percentage",
    };
  }
}

/**
 * Analisa tendências de um produto usando IA
 */
export async function analyzeHotmartProductTrends(product: HotmartProduct): Promise<{
  trendingScore: number;
  demandLevel: "high" | "medium" | "low";
  competitionLevel: "high" | "medium" | "low";
  recommendation: "buy" | "hold" | "sell" | "avoid";
  profitabilityScore: number;
}> {
  try {
    const prompt = `Analise este produto digital da Hotmart e forneça uma análise de tendências em JSON:
    
    Produto: ${product.name}
    Preço: R$ ${product.price / 100}
    Vendas: ${product.sales}
    Avaliação: ${product.rating}/5
    Avaliações: ${product.reviews}
    Comissão: ${product.commission_percentage}%
    Categoria: ${product.category}
    
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
          content: "Você é um especialista em análise de produtos digitais e tendências de infoprodutos.",
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
    console.error("[Hotmart] Error analyzing product trends:", error);
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
export function calculateHotmartCommission(
  productPrice: number,
  commissionPercentage: number = 30
): {
  baseCommission: number;
  estimatedEarnings: number;
} {
  const baseCommission = (productPrice * commissionPercentage) / 100;

  return {
    baseCommission: Math.round(baseCommission),
    estimatedEarnings: Math.round(baseCommission),
  };
}

/**
 * Sincroniza produtos de uma categoria
 */
export async function syncHotmartProducts(
  category: string,
  limit: number = 50,
  accessToken?: string
): Promise<HotmartProduct[]> {
  try {
    const products = await searchHotmartTrendingProducts(category, limit, accessToken);
    return products;
  } catch (error) {
    console.error("[Hotmart] Error syncing products:", error);
    throw error;
  }
}
