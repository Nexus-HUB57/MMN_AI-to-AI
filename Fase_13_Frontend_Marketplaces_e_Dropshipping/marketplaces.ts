import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { 
  getRecommendedProducts, 
  getTrendingProducts, 
  getProductsByMarketplace,
  getProductById 
} from "./db";

/**
 * Marketplaces Router - Gestão de produtos e tendências
 */
export const marketplacesRouter = router({
  /**
   * Obter produtos recomendados com filtros
   */
  getRecommendedProducts: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        minScore: z.number().min(0).max(100).default(0),
        marketplace: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const products = await getRecommendedProducts(input.limit, input.minScore);
      
      return products.map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price / 100, // Convert from cents to reais
        commissionPercentage: parseFloat(product.commissionPercentage.toString()),
        marketplace: product.marketplace,
        imageUrl: product.imageUrl,
        url: product.url,
        trendingScore: product.trendingScore,
        rating: parseFloat(product.rating?.toString() || "0"),
        sales: product.sales || 0,
        category: product.category,
      }));
    }),

  /**
   * Obter produtos em tendência por marketplace
   */
  getTrendingProducts: protectedProcedure
    .input(
      z.object({
        marketplace: z.enum(["Mercado Livre", "Shopee", "Hotmart"]).optional(),
        limit: z.number().min(1).max(50).default(10),
      })
    )
    .query(async ({ input }) => {
      const products = await getTrendingProducts(input.marketplace, input.limit);
      
      return products.map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price / 100,
        commissionPercentage: parseFloat(product.commissionPercentage.toString()),
        marketplace: product.marketplace,
        imageUrl: product.imageUrl,
        url: product.url,
        trendingScore: product.trendingScore,
        demandLevel: product.demandLevel,
        competitionLevel: product.competitionLevel,
        rating: parseFloat(product.rating?.toString() || "0"),
        sales: product.sales || 0,
      }));
    }),

  /**
   * Obter produtos por marketplace
   */
  getProductsByMarketplace: protectedProcedure
    .input(
      z.object({
        marketplace: z.enum(["Mercado Livre", "Shopee", "Hotmart"]),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const products = await getProductsByMarketplace(input.marketplace, input.limit);
      
      return products.map(product => ({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price / 100,
        commissionPercentage: parseFloat(product.commissionPercentage.toString()),
        marketplace: product.marketplace,
        imageUrl: product.imageUrl,
        url: product.url,
        category: product.category,
        rating: parseFloat(product.rating?.toString() || "0"),
        sales: product.sales || 0,
      }));
    }),

  /**
   * Obter detalhes de um produto específico
   */
  getProductById: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .query(async ({ input }) => {
      const product = await getProductById(input.productId);
      
      if (!product) {
        return null;
      }

      return {
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price / 100,
        commissionPercentage: parseFloat(product.commissionPercentage.toString()),
        marketplace: product.marketplace,
        imageUrl: product.imageUrl,
        url: product.url,
        category: product.category,
        trendingScore: product.trendingScore,
        demandLevel: product.demandLevel,
        competitionLevel: product.competitionLevel,
        rating: parseFloat(product.rating?.toString() || "0"),
        sales: product.sales || 0,
      };
    }),
});
