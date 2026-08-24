import { getDb } from "./db";
import { marketplaceProducts, productTrends, affiliateMargins } from "../drizzle/schema";
import { eq, desc, gte, and, sql } from "drizzle-orm";

/**
 * Marketplace Database Helpers
 * Funções auxiliares para operações de marketplace
 */

/**
 * Busca produtos em tendência
 */
export async function getTrendingProducts(
  days: number = 7,
  limit: number = 20
): Promise<(typeof marketplaceProducts.$inferSelect & { trend?: typeof productTrends.$inferSelect })[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const products = await db
    .select()
    .from(marketplaceProducts)
    .where(and(gte(marketplaceProducts.syncedAt, cutoffDate), eq(marketplaceProducts.isActive, 1)))
    .orderBy(desc(marketplaceProducts.sales))
    .limit(limit);

  return products;
}

/**
 * Busca produtos por categoria
 */
export async function getProductsByCategory(
  category: string,
  limit: number = 50
): Promise<typeof marketplaceProducts.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(marketplaceProducts)
    .where(and(eq(marketplaceProducts.category, category), eq(marketplaceProducts.isActive, 1)))
    .orderBy(desc(marketplaceProducts.sales))
    .limit(limit);
}

/**
 * Busca produtos por marketplace
 */
export async function getProductsByMarketplace(
  marketplace: "mercado_libre" | "shopee" | "hotmart",
  limit: number = 50
): Promise<typeof marketplaceProducts.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(marketplaceProducts)
    .where(and(eq(marketplaceProducts.marketplace, marketplace), eq(marketplaceProducts.isActive, 1)))
    .orderBy(desc(marketplaceProducts.sales))
    .limit(limit);
}

/**
 * Busca produtos com melhor avaliação
 */
export async function getTopRatedProducts(limit: number = 20): Promise<typeof marketplaceProducts.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(marketplaceProducts)
    .where(eq(marketplaceProducts.isActive, 1))
    .orderBy(desc(marketplaceProducts.rating))
    .limit(limit);
}

/**
 * Busca produtos com melhor potencial de lucro
 */
export async function getMostProfitableProducts(limit: number = 20): Promise<typeof marketplaceProducts.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select()
    .from(marketplaceProducts)
    .where(eq(marketplaceProducts.isActive, 1))
    .orderBy(desc(marketplaceProducts.commissionPercentage))
    .limit(limit);
}

/**
 * Analisa tendências de um produto
 */
export async function analyzeProductTrends(productId: number): Promise<typeof productTrends.$inferSelect | null> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const trends = await db
    .select()
    .from(productTrends)
    .where(eq(productTrends.marketplaceProductId, productId))
    .orderBy(desc(productTrends.analyzedAt))
    .limit(1);

  return trends.length > 0 ? trends[0] : null;
}

/**
 * Cria ou atualiza análise de tendências
 */
export async function upsertProductTrends(
  productId: number,
  trends: {
    trendingScore: number;
    viewsChange?: number;
    salesChange?: number;
    priceChange?: number;
    seasonality?: string;
    demandLevel?: string;
    competitionLevel?: string;
    profitabilityScore?: number;
    recommendation?: string;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existingTrend = await db
    .select()
    .from(productTrends)
    .where(eq(productTrends.marketplaceProductId, productId))
    .limit(1);

  if (existingTrend.length > 0) {
    await db
      .update(productTrends)
      .set({
        ...trends,
        analyzedAt: new Date(),
      })
      .where(eq(productTrends.id, existingTrend[0].id));
  } else {
    await db.insert(productTrends).values({
      marketplaceProductId: productId,
      ...trends,
    });
  }
}

/**
 * Busca margens de afiliado para um produto
 */
export async function getAffiliateMargins(
  affiliateId: number,
  productId?: number
): Promise<typeof affiliateMargins.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (productId) {
    return db
      .select()
      .from(affiliateMargins)
      .where(and(eq(affiliateMargins.affiliateId, affiliateId), eq(affiliateMargins.marketplaceProductId, productId)));
  }

  return db.select().from(affiliateMargins).where(eq(affiliateMargins.affiliateId, affiliateId));
}

/**
 * Cria ou atualiza margem de afiliado
 */
export async function upsertAffiliateMargin(
  affiliateId: number,
  productId: number,
  margin: {
    baseCommission?: number;
    bonusCommission?: number;
    totalCommission?: number;
    estimatedMonthlyEarnings?: number;
    totalEarnings?: number;
    totalSales?: number;
    conversionRate?: number;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existingMargin = await db
    .select()
    .from(affiliateMargins)
    .where(and(eq(affiliateMargins.affiliateId, affiliateId), eq(affiliateMargins.marketplaceProductId, productId)))
    .limit(1);

  const totalCommission = (margin.baseCommission || 0) + (margin.bonusCommission || 0);

  if (existingMargin.length > 0) {
    await db
      .update(affiliateMargins)
      .set({
        ...margin,
        totalCommission,
        lastCalculatedAt: new Date(),
      })
      .where(eq(affiliateMargins.id, existingMargin[0].id));
  } else {
    await db.insert(affiliateMargins).values({
      affiliateId,
      marketplaceProductId: productId,
      ...margin,
      totalCommission,
    });
  }
}

/**
 * Calcula ganhos estimados de um afiliado
 */
export async function calculateAffiliateEarnings(affiliateId: number): Promise<{
  totalEarnings: number;
  estimatedMonthlyEarnings: number;
  totalSales: number;
  averageCommission: number;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const margins = await db
    .select({
      totalEarnings: affiliateMargins.totalEarnings,
      estimatedMonthlyEarnings: affiliateMargins.estimatedMonthlyEarnings,
      totalSales: affiliateMargins.totalSales,
      totalCommission: affiliateMargins.totalCommission,
    })
    .from(affiliateMargins)
    .where(eq(affiliateMargins.affiliateId, affiliateId));

  const totals = margins.reduce(
    (acc, margin) => ({
      totalEarnings: (acc.totalEarnings ?? 0) + (margin.totalEarnings ?? 0),
      estimatedMonthlyEarnings: (acc.estimatedMonthlyEarnings ?? 0) + (margin.estimatedMonthlyEarnings ?? 0),
      totalSales: (acc.totalSales ?? 0) + (margin.totalSales ?? 0),
      totalCommission: (acc.totalCommission ?? 0) + (margin.totalCommission ?? 0),
    }),
    { totalEarnings: 0, estimatedMonthlyEarnings: 0, totalSales: 0, totalCommission: 0 }
  );

  const averageCommission = margins.length > 0 ? Math.round((totals.totalCommission ?? 0) / margins.length) : 0;

  return {
    totalEarnings: totals.totalEarnings ?? 0,
    estimatedMonthlyEarnings: totals.estimatedMonthlyEarnings ?? 0,
    totalSales: totals.totalSales ?? 0,
    averageCommission,
  };
}

/**
 * Busca produtos recomendados por tendência
 */
export async function getRecommendedProducts(
  limit: number = 20,
  minTrendingScore: number = 60
): Promise<typeof marketplaceProducts.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar produtos com boas tendências
  const trendingProducts = await db
    .select()
    .from(productTrends)
    .where(gte(productTrends.trendingScore, minTrendingScore))
    .orderBy(desc(productTrends.trendingScore))
    .limit(limit);

  const productIds = trendingProducts.map((t) => t.marketplaceProductId);

  if (productIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(marketplaceProducts)
    .where(
      and(
        sql`${marketplaceProducts.id} IN (${sql.raw(productIds.join(","))})`,
        eq(marketplaceProducts.isActive, 1)
      )
    )
    .orderBy(desc(marketplaceProducts.sales));
}

/**
 * Busca produtos por recomendação
 */
export async function getProductsByRecommendation(
  recommendation: "buy" | "hold" | "sell" | "avoid",
  limit: number = 20
): Promise<typeof marketplaceProducts.$inferSelect[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const trendingProducts = await db
    .select()
    .from(productTrends)
    .where(eq(productTrends.recommendation, recommendation))
    .orderBy(desc(productTrends.trendingScore))
    .limit(limit);

  const productIds = trendingProducts.map((t) => t.marketplaceProductId);

  if (productIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(marketplaceProducts)
    .where(
      and(
        sql`${marketplaceProducts.id} IN (${sql.raw(productIds.join(","))})`,
        eq(marketplaceProducts.isActive, 1)
      )
    );
}
