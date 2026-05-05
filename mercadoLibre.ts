import { invokeLLM } from "../_core/llm";

/**
 * Mercado Libre API Integration
 * Handles authentication, product search, and data synchronization
 */

const ML_API_BASE = "https://api.mercadolibre.com";
const ML_AUTH_URL = "https://auth.mercadolibre.com.br/authorization";

export interface MLProduct {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  currency_id: string;
  available_quantity: number;
  sold_quantity: number;
  permalink: string;
  thumbnail: string;
  category_id: string;
  seller: {
    id: number;
    nickname: string;
    reputation: {
      power_seller_status: string;
      level_id: string;
    };
  };
  ratings?: {
    negative_percentage: number;
    positive_percentage: number;
    neutral_percentage: number;
  };
}

export interface MLSearchResult {
  results: MLProduct[];
  paging: {
    total: number;
    offset: number;
    limit: number;
  };
}

/**
 * Gera URL de autenticação OAuth para Mercado Libre
 */
export function getMercadoLibreAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
  });
  return `${ML_AUTH_URL}?${params.toString()}`;
}

/**
 * Troca código de autorização por access token
 */
export async function exchangeMercadoLibreCode(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user_id: number;
}> {
  const response = await fetch(`${ML_API_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
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
 * Busca produtos no Mercado Libre por categoria
 */
export async function searchMercadoLibreProducts(
  query: string,
  category?: string,
  limit: number = 50
): Promise<MLSearchResult> {
  const params = new URLSearchParams({
    q: query,
    limit: limit.toString(),
    offset: "0",
    sort: "price_asc",
  });

  if (category) {
    params.append("category", category);
  }

  const response = await fetch(`${ML_API_BASE}/sites/MLB/search?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to search products: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Obtém detalhes completos de um produto
 */
export async function getMercadoLibreProductDetails(productId: string): Promise<MLProduct> {
  const response = await fetch(`${ML_API_BASE}/items/${productId}`);

  if (!response.ok) {
    throw new Error(`Failed to get product details: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Busca produtos por categoria com análise de tendências
 */
export async function searchMercadoLibreTrendingProducts(
  categoryId: string,
  limit: number = 20
): Promise<MLProduct[]> {
  try {
    const params = new URLSearchParams({
      category: categoryId,
      limit: limit.toString(),
      offset: "0",
      sort: "price_asc",
    });

    const response = await fetch(`${ML_API_BASE}/sites/MLB/search?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to search trending products: ${response.statusText}`);
    }

    const data = (await response.json()) as MLSearchResult;
    return data.results;
  } catch (error) {
    console.error("[MercadoLibre] Error searching trending products:", error);
    throw error;
  }
}

/**
 * Analisa tendências de um produto usando IA
 */
export async function analyzeMercadoLibreProductTrends(product: MLProduct): Promise<{
  trendingScore: number;
  demandLevel: "high" | "medium" | "low";
  competitionLevel: "high" | "medium" | "low";
  recommendation: "buy" | "hold" | "sell" | "avoid";
  profitabilityScore: number;
}> {
  try {
    const prompt = `Analise este produto do Mercado Libre e forneça uma análise de tendências em JSON:
    
    Produto: ${product.title}
    Preço: R$ ${product.price / 100}
    Quantidade Disponível: ${product.available_quantity}
    Quantidade Vendida: ${product.sold_quantity}
    Categoria: ${product.category_id}
    Vendedor: ${product.seller.nickname}
    
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
    console.error("[MercadoLibre] Error analyzing product trends:", error);
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
export function calculateMercadoLibreCommission(
  productPrice: number,
  baseCommissionPercentage: number = 5
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
export async function syncMercadoLibreProducts(
  categoryId: string,
  limit: number = 50
): Promise<MLProduct[]> {
  try {
    const products = await searchMercadoLibreTrendingProducts(categoryId, limit);
    return products;
  } catch (error) {
    console.error("[MercadoLibre] Error syncing products:", error);
    throw error;
  }
}
