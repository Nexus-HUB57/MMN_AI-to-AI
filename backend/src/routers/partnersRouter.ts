/**
 * Partners Router · Nexus SaaS
 *
 * Endpoint público que expõe:
 *   - identificação de afiliado Nexus SaaS em cada plataforma parceira;
 *   - produtos em alta (trending) curados + enriquecidos com dados reais das
 *     APIs Hotmart (OAuth client credentials) e Shopee Afiliados.
 *
 * Estratégia:
 *   - Se HOTMART_CLIENT_ID/SECRET estiverem definidos, consulta o catálogo
 *     real da Hotmart (token cache em memória, TTL respeitando expires_in).
 *   - Caso contrário, retorna a curadoria estática Nexus SaaS, garantindo
 *     resposta consistente mesmo offline.
 *   - Shopee Afiliados não expõe API REST pública para search-by-keyword sem
 *     parceria; mantemos curadoria estática + link direto para o painel.
 */
import { z } from "zod";
import { publicProcedure, router } from "../config/trpc";

// -------------------------------------------------------------------------
// Tipos públicos
// -------------------------------------------------------------------------
export interface PartnerInfo {
  slug: "shopee" | "hotmart" | "mercado-livre";
  name: string;
  status: "ativo" | "em_breve" | "manutencao";
  affiliateProfile: string;
  username?: string;
  affiliateId?: string;
  dashboardUrl: string;
}

export interface TrendingProduct {
  id: string;
  title: string;
  platform: "Hotmart" | "Shopee" | "Mercado Livre";
  platformSlug: "hotmart" | "shopee" | "mercado-livre";
  category: string;
  commission: string;
  avgPrice: string;
  fulfillment: "Dropshipping" | "Pronta Entrega";
  productUrl?: string;
  thumbnail?: string;
  source: "live" | "curated";
}

// -------------------------------------------------------------------------
// Configuração e helpers
// -------------------------------------------------------------------------
const HOTMART_TOKEN_URL =
  process.env.HOTMART_TOKEN_URL ||
  "https://api-sec-vlc.hotmart.com/security/oauth/token";
const HOTMART_API_BASE =
  process.env.HOTMART_API_BASE || "https://developers.hotmart.com";

let cachedHotmartToken: { value: string; expiresAt: number } | null = null;

async function getHotmartAccessToken(): Promise<string | null> {
  const clientId = process.env.HOTMART_CLIENT_ID;
  const clientSecret = process.env.HOTMART_CLIENT_SECRET;
  const basic = process.env.HOTMART_BASIC_AUTH;
  if (!clientId || !clientSecret) return null;

  const now = Date.now();
  if (cachedHotmartToken && cachedHotmartToken.expiresAt > now + 5000) {
    return cachedHotmartToken.value;
  }

  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (basic) headers["Authorization"] = basic;

  try {
    const res = await fetch(`${HOTMART_TOKEN_URL}?${params.toString()}`, {
      method: "POST",
      headers,
    });
    if (!res.ok) {
      console.warn(
        `[partnersRouter] Hotmart token failed: ${res.status} ${res.statusText}`,
      );
      return null;
    }
    const body = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!body?.access_token) return null;
    cachedHotmartToken = {
      value: body.access_token,
      expiresAt: now + (body.expires_in ?? 3600) * 1000,
    };
    return body.access_token;
  } catch (error) {
    console.warn("[partnersRouter] Hotmart token network error:", error);
    return null;
  }
}

// -------------------------------------------------------------------------
// Curadoria oficial Nexus SaaS (fallback robusto)
// -------------------------------------------------------------------------
const CURATED_TRENDING: TrendingProduct[] = [
  {
    id: "trend-hotmart-1",
    title: "Curso Marketing IA · Lançamento Premium",
    platform: "Hotmart",
    platformSlug: "hotmart",
    category: "Infoproduto",
    commission: "60%",
    avgPrice: "R$ 997,00",
    fulfillment: "Dropshipping",
    productUrl: "https://app-vlc.hotmart.com",
    source: "curated",
  },
  {
    id: "trend-hotmart-2",
    title: "Mentoria Tráfego Pago para Afiliados",
    platform: "Hotmart",
    platformSlug: "hotmart",
    category: "Infoproduto",
    commission: "50%",
    avgPrice: "R$ 497,00",
    fulfillment: "Dropshipping",
    productUrl: "https://app-vlc.hotmart.com",
    source: "curated",
  },
  {
    id: "trend-shopee-1",
    title: "Kit Smart Home · Iluminação RGB Wi-Fi",
    platform: "Shopee",
    platformSlug: "shopee",
    category: "Eletrônico",
    commission: "12%",
    avgPrice: "R$ 189,90",
    fulfillment: "Dropshipping",
    productUrl: "https://affiliate.shopee.com.br",
    source: "curated",
  },
  {
    id: "trend-shopee-2",
    title: "Suplemento Beauty Collagen · Linha Premium",
    platform: "Shopee",
    platformSlug: "shopee",
    category: "Saúde & Bem-estar",
    commission: "15%",
    avgPrice: "R$ 89,90",
    fulfillment: "Dropshipping",
    productUrl: "https://affiliate.shopee.com.br",
    source: "curated",
  },
  {
    id: "trend-ml-1",
    title: "Cadeira Gamer Ergonômica Pro",
    platform: "Mercado Livre",
    platformSlug: "mercado-livre",
    category: "Móvel",
    commission: "8%",
    avgPrice: "R$ 1.299,00",
    fulfillment: "Dropshipping",
    productUrl: "https://www.mercadolivre.com.br",
    source: "curated",
  },
  {
    id: "trend-ml-2",
    title: "Câmera Action 4K com Estabilizador",
    platform: "Mercado Livre",
    platformSlug: "mercado-livre",
    category: "Eletrônico",
    commission: "9%",
    avgPrice: "R$ 689,00",
    fulfillment: "Dropshipping",
    productUrl: "https://www.mercadolivre.com.br",
    source: "curated",
  },
];

// -------------------------------------------------------------------------
// Hotmart live · catálogo público de produtos
// -------------------------------------------------------------------------
async function fetchHotmartTrending(limit: number): Promise<TrendingProduct[]> {
  const token = await getHotmartAccessToken();
  if (!token) return [];

  // Endpoint público Hotmart para catálogo do afiliado.
  // Estrutura conservadora: se a API mudar, caímos no fallback curated.
  const candidatePaths = [
    "/payments/api/v1/sales/products",
    "/marketplace/api/v1/products",
  ];

  for (const path of candidatePaths) {
    try {
      const res = await fetch(
        `${HOTMART_API_BASE}${path}?max_results=${Math.min(limit, 20)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );
      if (!res.ok) continue;
      const data: any = await res.json();
      const items: any[] = data?.items ?? data?.products ?? [];
      if (!Array.isArray(items) || items.length === 0) continue;

      return items.slice(0, limit).map((item, index) => {
        const id =
          item?.id?.toString() ??
          item?.product?.id?.toString() ??
          `live-hotmart-${index}`;
        const title =
          item?.name ?? item?.product?.name ?? `Produto Hotmart #${id}`;
        const priceValue: number =
          item?.price?.value ?? item?.product?.price?.value ?? 0;
        const commission: string =
          item?.commission?.percentage != null
            ? `${item.commission.percentage}%`
            : "—";
        return {
          id: `live-hotmart-${id}`,
          title,
          platform: "Hotmart",
          platformSlug: "hotmart",
          category: item?.category ?? "Infoproduto",
          commission,
          avgPrice: priceValue
            ? `R$ ${Number(priceValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
            : "—",
          fulfillment: "Dropshipping" as const,
          productUrl: item?.url ?? "https://app-vlc.hotmart.com",
          source: "live" as const,
        };
      });
    } catch (error) {
      console.warn(
        `[partnersRouter] Hotmart products endpoint ${path} fail:`,
        error,
      );
    }
  }
  return [];
}

// -------------------------------------------------------------------------
// Partners config (lido das ENVs com fallbacks oficiais Nexus SaaS)
// -------------------------------------------------------------------------
function getPartners(): PartnerInfo[] {
  return [
    {
      slug: "shopee",
      name: "Shopee Afiliados",
      status: "ativo",
      affiliateProfile:
        process.env.SHOPEE_AFFILIATE_PROFILE_NAME || "Nexus SaaS",
      username: process.env.SHOPEE_AFFILIATE_USERNAME || undefined,
      affiliateId: process.env.SHOPEE_AFFILIATE_ID || undefined,
      dashboardUrl: "https://affiliate.shopee.com.br",
    },
    {
      slug: "hotmart",
      name: "Hotmart",
      status: process.env.HOTMART_CLIENT_ID ? "ativo" : "em_breve",
      affiliateProfile: "Nexus SaaS",
      dashboardUrl: "https://app-vlc.hotmart.com",
    },
    {
      slug: "mercado-livre",
      name: "Mercado Livre",
      status: "em_breve",
      affiliateProfile: "Nexus SaaS",
      dashboardUrl: "https://www.mercadolivre.com.br",
    },
  ];
}

// -------------------------------------------------------------------------
// Router público — não exige autenticação para o feed de Produtos em Alta.
// -------------------------------------------------------------------------
export const partnersRouter = router({
  list: publicProcedure.query(() => ({
    partners: getPartners(),
    updatedAt: new Date().toISOString(),
  })),

  trending: publicProcedure
    .input(
      z
        .object({
          limit: z.number().int().min(1).max(50).optional(),
          platform: z
            .enum(["hotmart", "shopee", "mercado-livre"])
            .optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const limit = input?.limit ?? 12;
      const platform = input?.platform;

      let live: TrendingProduct[] = [];
      if (!platform || platform === "hotmart") {
        live = await fetchHotmartTrending(Math.min(limit, 6));
      }

      const curatedFiltered = platform
        ? CURATED_TRENDING.filter((p) => p.platformSlug === platform)
        : CURATED_TRENDING;

      const merged = [...live, ...curatedFiltered].slice(0, limit);
      return {
        products: merged,
        sources: {
          live: live.length,
          curated: merged.length - live.length,
        },
        partners: getPartners(),
        updatedAt: new Date().toISOString(),
      };
    }),

  hotmartHealth: publicProcedure.query(async () => {
    const hasClientId = Boolean(process.env.HOTMART_CLIENT_ID);
    if (!hasClientId) {
      return { configured: false, ok: false, message: "Hotmart não configurada" };
    }
    const token = await getHotmartAccessToken();
    return {
      configured: true,
      ok: Boolean(token),
      message: token
        ? "Conexão Hotmart OK"
        : "Falha ao obter token Hotmart (verifique client_id/secret)",
    };
  }),
});

export type PartnersRouter = typeof partnersRouter;
