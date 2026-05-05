import { getDb } from "../db";
import { marketplaceAccounts, marketplaceProducts, marketplaceSyncHistory } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import * as mercadoLibre from "../integrations/mercadoLibre";
import * as shopee from "../integrations/shopee";
import * as hotmart from "../integrations/hotmart";

/**
 * Job de sincronização diária de produtos dos marketplaces
 * Executa sincronização para todas as contas conectadas
 */

export async function syncAllMarketplaceProducts(): Promise<void> {
  console.log("[SyncJob] Starting marketplace product synchronization...");

  const db = await getDb();
  if (!db) {
    console.error("[SyncJob] Database not available");
    return;
  }

  try {
    // Buscar todas as contas ativas
    const accounts = await db
      .select()
      .from(marketplaceAccounts)
      .where(eq(marketplaceAccounts.isActive, 1));

    console.log(`[SyncJob] Found ${accounts.length} active marketplace accounts`);

    for (const account of accounts) {
      await syncMarketplaceAccount(account, db);
    }

    console.log("[SyncJob] Marketplace product synchronization completed");
  } catch (error) {
    console.error("[SyncJob] Error during synchronization:", error);
  }
}

/**
 * Sincroniza produtos de uma conta específica
 */
async function syncMarketplaceAccount(
  account: typeof marketplaceAccounts.$inferSelect,
  db: Awaited<ReturnType<typeof getDb>>
): Promise<void> {
  if (!db) return;

  const syncHistoryId = await createSyncHistory(db, account.id, "in_progress");

  try {
    console.log(`[SyncJob] Syncing ${account.marketplace} account: ${account.accountName}`);

    let products: any[] = [];
    let productsAdded = 0;
    let productsUpdated = 0;

    // Sincronizar baseado no marketplace
    switch (account.marketplace) {
      case "mercado_libre":
        products = await syncMercadoLibreProducts(account);
        break;
      case "shopee":
        products = await syncShopeeProducts(account);
        break;
      case "hotmart":
        products = await syncHotmartProducts(account);
        break;
    }

    // Salvar produtos no banco de dados
    for (const product of products) {
      const existingProduct = await db
        .select()
        .from(marketplaceProducts)
        .where(
          eq(marketplaceProducts.externalProductId, product.externalProductId)
        )
        .limit(1);

      if (existingProduct.length > 0) {
        // Atualizar produto existente
        await db
          .update(marketplaceProducts)
          .set({
            productName: product.productName,
            price: product.price,
            originalPrice: product.originalPrice,
            discount: product.discount,
            rating: product.rating,
            reviews: product.reviews,
            sales: product.sales,
            syncedAt: new Date(),
          })
          .where(eq(marketplaceProducts.id, existingProduct[0].id));

        productsUpdated++;
      } else {
        // Criar novo produto
        await db.insert(marketplaceProducts).values({
          marketplaceAccountId: account.id,
          externalProductId: product.externalProductId,
          marketplace: account.marketplace,
          productName: product.productName,
          productUrl: product.productUrl,
          category: product.category,
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.discount,
          rating: product.rating,
          reviews: product.reviews,
          sales: product.sales,
          description: product.description,
          imageUrl: product.imageUrl,
          seller: product.seller,
          commissionPercentage: product.commissionPercentage,
        });

        productsAdded++;
      }
    }

    // Atualizar histórico de sincronização
    await updateSyncHistory(db, syncHistoryId, "completed", productsAdded, productsUpdated, 0);

    // Atualizar lastSyncAt da conta
    await db
      .update(marketplaceAccounts)
      .set({
        lastSyncAt: new Date(),
        syncStatus: "completed",
      })
      .where(eq(marketplaceAccounts.id, account.id));

    console.log(
      `[SyncJob] Synced ${account.marketplace}: ${productsAdded} added, ${productsUpdated} updated`
    );
  } catch (error) {
    console.error(`[SyncJob] Error syncing ${account.marketplace}:`, error);

    // Atualizar histórico com erro
    await updateSyncHistory(
      db,
      syncHistoryId,
      "failed",
      0,
      0,
      0,
      error instanceof Error ? error.message : "Unknown error"
    );

    // Atualizar status da conta
    await db
      .update(marketplaceAccounts)
      .set({
        syncStatus: "failed",
      })
      .where(eq(marketplaceAccounts.id, account.id));
  }
}

/**
 * Sincroniza produtos do Mercado Libre
 */
async function syncMercadoLibreProducts(account: typeof marketplaceAccounts.$inferSelect): Promise<any[]> {
  const categories = ["MLM1144", "MLM1143", "MLM1142"]; // Exemplos de categorias
  const allProducts: any[] = [];

  for (const categoryId of categories) {
    try {
      const products = await mercadoLibre.searchMercadoLibreTrendingProducts(categoryId, 20);

      for (const product of products) {
        const trends = await mercadoLibre.analyzeMercadoLibreProductTrends(product);
        const commission = mercadoLibre.calculateMercadoLibreCommission(product.price);

        allProducts.push({
          externalProductId: product.id,
          productName: product.title,
          productUrl: product.permalink,
          category: product.category_id,
          price: Math.round(product.price * 100),
          originalPrice: product.original_price ? Math.round(product.original_price * 100) : null,
          discount: product.original_price
            ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
            : 0,
          rating: Math.round((product.ratings?.positive_percentage || 0) * 100),
          reviews: 0,
          sales: product.sold_quantity,
          description: product.title,
          imageUrl: product.thumbnail,
          seller: product.seller.nickname,
          commissionPercentage: 5,
          trendingScore: trends.trendingScore,
          demandLevel: trends.demandLevel,
          competitionLevel: trends.competitionLevel,
          recommendation: trends.recommendation,
          profitabilityScore: trends.profitabilityScore,
        });
      }
    } catch (error) {
      console.error(`[SyncJob] Error syncing Mercado Libre category ${categoryId}:`, error);
    }
  }

  return allProducts;
}

/**
 * Sincroniza produtos da Shopee
 */
async function syncShopeeProducts(account: typeof marketplaceAccounts.$inferSelect): Promise<any[]> {
  const categories = [100001, 100002, 100003]; // Exemplos de categorias
  const allProducts: any[] = [];

  for (const categoryId of categories) {
    try {
      const products = await shopee.searchShopeeHotProducts(categoryId, 20, account.accessToken);

      for (const product of products) {
        const trends = await shopee.analyzeShopeeProductTrends(product);
        const commission = shopee.calculateShopeeCommission(product.price);

        allProducts.push({
          externalProductId: product.item_id.toString(),
          productName: product.item_name,
          productUrl: `https://shopee.com.br/product/${product.shop_id}/${product.item_id}`,
          category: product.category_id.toString(),
          price: product.price,
          originalPrice: null,
          discount: 0,
          rating: Math.round(product.rating_star * 20),
          reviews: product.cmt_count,
          sales: product.sold,
          description: product.item_name,
          imageUrl: product.image.image_url,
          seller: `Shop ${product.shop_id}`,
          commissionPercentage: 3,
          trendingScore: trends.trendingScore,
          demandLevel: trends.demandLevel,
          competitionLevel: trends.competitionLevel,
          recommendation: trends.recommendation,
          profitabilityScore: trends.profitabilityScore,
        });
      }
    } catch (error) {
      console.error(`[SyncJob] Error syncing Shopee category ${categoryId}:`, error);
    }
  }

  return allProducts;
}

/**
 * Sincroniza produtos do Hotmart
 */
async function syncHotmartProducts(account: typeof marketplaceAccounts.$inferSelect): Promise<any[]> {
  const categories = ["cursos", "ebooks", "softwares"];
  const allProducts: any[] = [];

  for (const category of categories) {
    try {
      const products = await hotmart.searchHotmartTrendingProducts(category, 20, account.accessToken);

      for (const product of products) {
        const trends = await hotmart.analyzeHotmartProductTrends(product);
        const commission = hotmart.calculateHotmartCommission(product.price, product.commission_percentage);

        allProducts.push({
          externalProductId: product.id,
          productName: product.name,
          productUrl: product.url,
          category: product.category,
          price: Math.round(product.price * 100),
          originalPrice: null,
          discount: 0,
          rating: Math.round(product.rating * 20),
          reviews: product.reviews,
          sales: product.sales,
          description: product.description,
          imageUrl: product.thumbnail,
          seller: product.producer.name,
          commissionPercentage: product.commission_percentage,
          trendingScore: trends.trendingScore,
          demandLevel: trends.demandLevel,
          competitionLevel: trends.competitionLevel,
          recommendation: trends.recommendation,
          profitabilityScore: trends.profitabilityScore,
        });
      }
    } catch (error) {
      console.error(`[SyncJob] Error syncing Hotmart category ${category}:`, error);
    }
  }

  return allProducts;
}

/**
 * Cria registro de histórico de sincronização
 */
async function createSyncHistory(
  db: Awaited<ReturnType<typeof getDb>>,
  accountId: number,
  status: "pending" | "in_progress" | "completed" | "failed"
): Promise<number> {
  if (!db) throw new Error("Database not available");

  const result = await db.insert(marketplaceSyncHistory).values({
    marketplaceAccountId: accountId,
    syncType: "products",
    status,
  });

  return (result as any).insertId || 0;
}

/**
 * Atualiza registro de histórico de sincronização
 */
async function updateSyncHistory(
  db: Awaited<ReturnType<typeof getDb>>,
  syncHistoryId: number,
  status: "pending" | "in_progress" | "completed" | "failed",
  productsAdded: number,
  productsUpdated: number,
  productsFailed: number,
  errorMessage?: string
): Promise<void> {
  if (!db) return;

  await db
    .update(marketplaceSyncHistory)
    .set({
      status,
      productsAdded,
      productsUpdated,
      productsFailed,
      errorMessage,
      completedAt: new Date(),
    })
    .where(eq(marketplaceSyncHistory.id, syncHistoryId));
}

// Exportar função para ser chamada como job
export default syncAllMarketplaceProducts;
