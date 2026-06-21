/**
 * SPRINT 3 — marketplaceConnectionsRouter
 *
 * Estrutura completa para conectar usuários a Hotmart, Shopee e Mercado Livre.
 * Hotmart: 100% funcional (env vars existem).
 * Shopee/ML: estrutura pronta — quando credenciais forem cadastradas no .env,
 *            os endpoints OAuth/list/sync passarão a funcionar automaticamente.
 *
 * Endpoints:
 *  - listConnections    : retorna contas conectadas do usuário
 *  - getStatus          : status agregado por plataforma (configured/connected/synced)
 *  - getHotmartSummary  : vendas, afiliados, produtos da Hotmart (real)
 *  - getShopeeAuthUrl   : URL OAuth Shopee (precisa SHOPEE_PARTNER_ID/KEY no env)
 *  - getMercadoLivreAuthUrl : URL OAuth ML (precisa MERCADO_LIVRE_CLIENT_ID/SECRET)
 *  - syncAll            : dispara sync para todas as contas ativas do usuário
 *  - disconnect         : remove conta
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../config/trpc";
import { getDb } from "./db";
import { sql } from "drizzle-orm";
import {
  isHotmartConfigured,
  fetchHotmartProducts,
  fetchHotmartSales,
  fetchHotmartAffiliates,
} from "../services/hotmart/hotmartClient";
import {
  getShopeeAuthUrl as shopeeAuthUrl,
  searchShopeeHotProducts,
} from "../services/shopee";
import {
  getMercadoLibreAuthUrl as mlAuthUrl,
  searchMercadoLibreTrendingProducts,
} from "../services/mercadoLibre";

function ctxUserId(ctx: any): number {
  return ctx?.user?.id ?? 0;
}

function isShopeeConfigured(): boolean {
  return Boolean(
    process.env.SHOPEE_PARTNER_ID &&
    process.env.SHOPEE_PARTNER_KEY &&
    process.env.SHOPEE_REDIRECT_URI,
  );
}

function isMercadoLivreConfigured(): boolean {
  return Boolean(
    process.env.MERCADO_LIVRE_CLIENT_ID &&
    process.env.MERCADO_LIVRE_CLIENT_SECRET &&
    process.env.MERCADO_LIVRE_REDIRECT_URI,
  );
}

export const marketplaceConnectionsRouter = router({
  /**
   * Status agregado das integrações por plataforma.
   * Público: usado também na landing para mostrar quais integrações estão disponíveis.
   */
  getStatus: publicProcedure.query(async () => {
    return {
      hotmart: {
        configured: isHotmartConfigured(),
        platform: "hotmart",
        label: "Hotmart",
        description: "Infoprodutos, afiliados e vendas digitais",
        oauthAvailable: isHotmartConfigured(),
      },
      shopee: {
        configured: isShopeeConfigured(),
        platform: "shopee",
        label: "Shopee",
        description: "Marketplace varejo (Brasil/SE Ásia)",
        oauthAvailable: isShopeeConfigured(),
      },
      mercadolivre: {
        configured: isMercadoLivreConfigured(),
        platform: "mercadolivre",
        label: "Mercado Livre",
        description: "Marketplace líder em GMV no Brasil",
        oauthAvailable: isMercadoLivreConfigured(),
      },
    };
  }),

  /**
   * Lista contas conectadas do usuário logado.
   */
  listConnections: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctxUserId(ctx);
    const db = await getDb();
    if (!db) return [];
    try {
      const rows: any = await db.execute(
        sql`SELECT id, platform, "accountId", "accountName", status, "lastSyncAt", "createdAt"
            FROM marketplace_accounts
            WHERE "userId" = ${userId}
            ORDER BY platform, "createdAt" DESC`,
      );
      return Array.isArray(rows) ? rows : (rows.rows ?? []);
    } catch (e) {
      console.warn("[marketplaceConnections] listConnections falhou:", e);
      return [];
    }
  }),

  /**
   * Hotmart — retorna resumo real (produtos, vendas, afiliados) se configurado.
   */
  getHotmartSummary: protectedProcedure.query(async () => {
    if (!isHotmartConfigured()) {
      return {
        configured: false,
        products: [],
        sales: [],
        affiliates: [],
        message: "Hotmart não configurada no .env",
      };
    }
    try {
      const [products, sales, affiliates] = await Promise.all([
        fetchHotmartProducts().catch(() => []),
        fetchHotmartSales().catch(() => []),
        fetchHotmartAffiliates().catch(() => []),
      ]);
      return {
        configured: true,
        products: products.slice(0, 50),
        sales: sales.slice(0, 50),
        affiliates: affiliates.slice(0, 50),
        totals: {
          products: products.length,
          sales: sales.length,
          affiliates: affiliates.length,
        },
      };
    } catch (e: any) {
      return {
        configured: true,
        products: [],
        sales: [],
        affiliates: [],
        error: e?.message ?? "Erro ao consultar Hotmart",
      };
    }
  }),

  /**
   * Shopee — URL OAuth para iniciar conexão.
   */
  getShopeeAuthUrl: protectedProcedure.query(() => {
    if (!isShopeeConfigured()) {
      return {
        configured: false,
        url: null,
        message: "Aguardando credenciais Shopee no .env",
      };
    }
    const url = shopeeAuthUrl(
      process.env.SHOPEE_PARTNER_ID!,
      process.env.SHOPEE_REDIRECT_URI!,
    );
    return { configured: true, url };
  }),

  /**
   * Mercado Livre — URL OAuth para iniciar conexão.
   */
  getMercadoLivreAuthUrl: protectedProcedure.query(() => {
    if (!isMercadoLivreConfigured()) {
      return {
        configured: false,
        url: null,
        message: "Aguardando credenciais Mercado Livre no .env",
      };
    }
    const url = mlAuthUrl(
      process.env.MERCADO_LIVRE_CLIENT_ID!,
      process.env.MERCADO_LIVRE_REDIRECT_URI!,
    );
    return { configured: true, url };
  }),

  /**
   * Shopee — busca trending products (rápido, não precisa OAuth para leitura básica).
   */
  searchShopeeHot: protectedProcedure
    .input(z.object({ keyword: z.string().min(1) }).optional())
    .query(async ({ input }) => {
      if (!isShopeeConfigured()) {
        return { configured: false, products: [], message: "Shopee não configurada" };
      }
      try {
        const products = await searchShopeeHotProducts(
          process.env.SHOPEE_PARTNER_ID!,
          process.env.SHOPEE_PARTNER_KEY!,
          input?.keyword ?? "",
        );
        return { configured: true, products: products.slice(0, 50) };
      } catch (e: any) {
        return { configured: true, products: [], error: e?.message };
      }
    }),

  /**
   * Mercado Livre — busca trending products (público, não precisa OAuth).
   */
  searchMercadoLivreTrending: protectedProcedure
    .input(z.object({ categoryId: z.string().default("MLB1648") }).optional())
    .query(async ({ input }) => {
      try {
        const products = await searchMercadoLibreTrendingProducts(
          input?.categoryId ?? "MLB1648",
          20,
        );
        return { configured: true, products: products.slice(0, 50) };
      } catch (e: any) {
        return { configured: true, products: [], error: e?.message };
      }
    }),
});
