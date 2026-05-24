import { getDb } from "../db";
import {
  marketplaceAccounts,
  marketplaceProducts,
  marketplaceSyncHistory,
} from "../../drizzle/schema";
import { and, eq } from "drizzle-orm";
import * as mercadoLibre from "../integrations/mercadoLibre";
import * as shopee from "../integrations/shopee";
import * as hotmart from "../integrations/hotmart";
import * as marketplaceHelpers from "./marketplace-helpers";

type SupportedMarketplace = "mercado_libre" | "shopee" | "hotmart";

export interface MarketplaceSyncOptions {
  marketplace?: SupportedMarketplace;
  accountId?: number;
}

export interface MarketplaceAccountSyncResult {
  accountId: number;
  marketplace: SupportedMarketplace;
  accountName: string;
  productsAdded: number;
  productsUpdated: number;
  productsFailed: number;
  status: "completed" | "failed";
  errorMessage?: string;
}

export interface MarketplaceSyncSummary {
  processedAccounts: number;
  totalProductsAdded: number;
  totalProductsUpdated: number;
  totalProductsFailed: number;
  accounts: MarketplaceAccountSyncResult[];
}

/**
 * Job de sincronização de produtos dos marketplaces.
 * Pode sincronizar todas as contas ativas, um marketplace específico ou uma conta específica.
 */
export async function syncMarketplaceProducts(
  options: MarketplaceSyncOptions = {},
): Promise<MarketplaceSyncSummary> {
  const label = options.accountId
    ? `account ${options.accountId}`
    : options.marketplace
      ? `marketplace ${options.marketplace}`
      : "all active accounts";

  console.log(
    `[SyncJob] Starting marketplace product synchronization for ${label}...`,
  );

  const db = await getDb();
  if (!db) {
    console.error("[SyncJob] Database not available");
    return {
      processedAccounts: 0,
      totalProductsAdded: 0,
      totalProductsUpdated: 0,
      totalProductsFailed: 0,
      accounts: [],
    };
  }

  try {
    const whereConditions = [eq(marketplaceAccounts.isActive, 1)];

    if (options.marketplace) {
      whereConditions.push(
        eq(marketplaceAccounts.marketplace, options.marketplace),
      );
    }

    if (typeof options.accountId === "number") {
      whereConditions.push(eq(marketplaceAccounts.id, options.accountId));
    }

    const accounts = await db
      .select()
      .from(marketplaceAccounts)
      .where(and(...whereConditions));

    console.log(
      `[SyncJob] Found ${accounts.length} active marketplace account(s)`,
    );

    const summary: MarketplaceSyncSummary = {
      processedAccounts: 0,
      totalProductsAdded: 0,
      totalProductsUpdated: 0,
      totalProductsFailed: 0,
      accounts: [],
    };

    for (const account of accounts) {
      const result = await syncMarketplaceAccount(account, db);
      summary.processedAccounts += 1;
      summary.totalProductsAdded += result.productsAdded;
      summary.totalProductsUpdated += result.productsUpdated;
      summary.totalProductsFailed += result.productsFailed;
      summary.accounts.push(result);
    }

    console.log(
      "[SyncJob] Marketplace product synchronization completed",
      summary,
    );
    return summary;
  } catch (error) {
    console.error("[SyncJob] Error during synchronization:", error);
    return {
      processedAccounts: 0,
      totalProductsAdded: 0,
      totalProductsUpdated: 0,
      totalProductsFailed: 0,
      accounts: [],
    };
  }
}

export async function syncAllMarketplaceProducts(): Promise<MarketplaceSyncSummary> {
  return syncMarketplaceProducts();
}

export async function syncMarketplaceAccountById(
  accountId: number,
): Promise<MarketplaceSyncSummary> {
  return syncMarketplaceProducts({ accountId });
}

/**
 * Sincroniza produtos de uma conta específica.
 */
async function syncMarketplaceAccount(
  account: typeof marketplaceAccounts.$inferSelect,
  db: Awaited<ReturnType<typeof getDb>>,
): Promise<MarketplaceAccountSyncResult> {
  if (!db) {
    return {
      accountId: account.id,
      marketplace: account.marketplace as SupportedMarketplace,
      accountName: account.accountName,
      productsAdded: 0,
      productsUpdated: 0,
      productsFailed: 0,
      status: "failed",
      errorMessage: "Database not available",
    };
  }

  const syncHistoryId = await createSyncHistory(db, account.id, "in_progress");

  try {
    console.log(
      `[SyncJob] Syncing ${account.marketplace} account: ${account.accountName}`,
    );

    let products: any[] = [];
    let productsAdded = 0;
    let productsUpdated = 0;
    let productsFailed = 0;

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

    for (const product of products) {
      try {
        const existingProduct = await db
          .select()
          .from(marketplaceProducts)
          .where(
            eq(
              marketplaceProducts.externalProductId,
              product.externalProductId,
            ),
          )
          .limit(1);

        let marketplaceProductId: number;

        if (existingProduct.length > 0) {
          await db
            .update(marketplaceProducts)
            .set({
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
              syncedAt: new Date(),
            })
            .where(eq(marketplaceProducts.id, existingProduct[0].id));

          marketplaceProductId = existingProduct[0].id;
          productsUpdated++;
        } else {
          const result = await db.insert(marketplaceProducts).values({
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

          marketplaceProductId = (result as any).insertId;
          productsAdded++;
        }

        if (marketplaceProductId) {
          await marketplaceHelpers.upsertProductTrends(marketplaceProductId, {
            trendingScore: product.trendingScore,
            demandLevel: product.demandLevel,
            competitionLevel: product.competitionLevel,
            profitabilityScore: product.profitabilityScore,
            recommendation: product.recommendation,
          });

          const totalEarnings = Math.round(
            (product.sales ?? 0) *
              (product.price ?? 0) *
              ((product.commissionPercentage ?? 0) / 100),
          );

          await marketplaceHelpers.upsertAffiliateMargin(
            account.userId,
            marketplaceProductId,
            {
              baseCommission: product.commissionPercentage ?? 0,
              bonusCommission: 0,
              totalSales: product.sales ?? 0,
              totalEarnings,
              estimatedMonthlyEarnings: Math.round(totalEarnings / 3),
              conversionRate: product.rating ?? 0,
            },
          );
        }
      } catch (productError) {
        productsFailed++;
        console.error(
          `[SyncJob] Error persisting product ${product.externalProductId} from ${account.marketplace}:`,
          productError,
        );
      }
    }

    await updateSyncHistory(
      db,
      syncHistoryId,
      "completed",
      productsAdded,
      productsUpdated,
      productsFailed,
    );

    await db
      .update(marketplaceAccounts)
      .set({
        lastSyncAt: new Date(),
        syncStatus: productsFailed > 0 ? "completed_with_errors" : "completed",
      })
      .where(eq(marketplaceAccounts.id, account.id));

    const result: MarketplaceAccountSyncResult = {
      accountId: account.id,
      marketplace: account.marketplace as SupportedMarketplace,
      accountName: account.accountName,
      productsAdded,
      productsUpdated,
      productsFailed,
      status: "completed",
    };

    console.log(`[SyncJob] Synced ${account.marketplace}:`, result);
    return result;
  } catch (error) {
    console.error(`[SyncJob] Error syncing ${account.marketplace}:`, error);

    await updateSyncHistory(
      db,
      syncHistoryId,
      "failed",
      0,
      0,
      0,
      error instanceof Error ? error.message : "Unknown error",
    );

    await db
      .update(marketplaceAccounts)
      .set({
        syncStatus: "failed",
      })
      .where(eq(marketplaceAccounts.id, account.id));

    return {
      accountId: account.id,
      marketplace: account.marketplace as SupportedMarketplace,
      accountName: account.accountName,
      productsAdded: 0,
      productsUpdated: 0,
      productsFailed: 0,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Sincroniza produtos do Mercado Libre
 */
async function syncMercadoLibreProducts(
  account: typeof marketplaceAccounts.$inferSelect,
): Promise<any[]> {
  const categories = ["MLM1144", "MLM1143", "MLM1142"];
  const allProducts: any[] = [];

  for (const categoryId of categories) {
    try {
      const products = await mercadoLibre.searchMercadoLibreTrendingProducts(
        categoryId,
        20,
      );

      for (const product of products) {
        const trends =
          await mercadoLibre.analyzeMercadoLibreProductTrends(product);

        allProducts.push({
          externalProductId: product.id,
          productName: product.title,
          productUrl: product.permalink,
          category: product.category_id,
          price: Math.round(product.price * 100),
          originalPrice: product.original_price
            ? Math.round(product.original_price * 100)
            : null,
          discount: product.original_price
            ? Math.round(
                ((product.original_price - product.price) /
                  product.original_price) *
                  100,
              )
            : 0,
          rating: Math.round((product.ratings?.positive_percentage || 0) * 100),
          reviews: 0,
          sales: product.sold_quantity,
          description: product.title,
          imageUrl: product.thumbnail,
          seller: product.seller.nickname,
          commissionPercentage: mercadoLibre.calculateMercadoLibreCommission(
            product.price,
          ),
          trendingScore: trends.trendingScore,
          demandLevel: trends.demandLevel,
          competitionLevel: trends.competitionLevel,
          recommendation: trends.recommendation,
          profitabilityScore: trends.profitabilityScore,
        });
      }
    } catch (error) {
      console.error(
        `[SyncJob] Error syncing Mercado Libre category ${categoryId}:`,
        error,
      );
    }
  }

  return allProducts;
}

/**
 * Sincroniza produtos da Shopee
 */
async function syncShopeeProducts(
  account: typeof marketplaceAccounts.$inferSelect,
): Promise<any[]> {
  const categories = [100001, 100002, 100003];
  const allProducts: any[] = [];

  for (const categoryId of categories) {
    try {
      const products = await shopee.searchShopeeHotProducts(
        categoryId,
        20,
        account.accessToken,
      );

      for (const product of products) {
        const trends = await shopee.analyzeShopeeProductTrends(product);

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
          commissionPercentage: shopee.calculateShopeeCommission(product.price),
          trendingScore: trends.trendingScore,
          demandLevel: trends.demandLevel,
          competitionLevel: trends.competitionLevel,
          recommendation: trends.recommendation,
          profitabilityScore: trends.profitabilityScore,
        });
      }
    } catch (error) {
      console.error(
        `[SyncJob] Error syncing Shopee category ${categoryId}:`,
        error,
      );
    }
  }

  return allProducts;
}

/**
 * Sincroniza produtos do Hotmart
 */
async function syncHotmartProducts(
  account: typeof marketplaceAccounts.$inferSelect,
): Promise<any[]> {
  const categories = ["cursos", "ebooks", "softwares"];
  const allProducts: any[] = [];

  for (const category of categories) {
    try {
      const products = await hotmart.searchHotmartTrendingProducts(
        category,
        20,
        account.accessToken,
      );

      for (const product of products) {
        const trends = await hotmart.analyzeHotmartProductTrends(product);

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
          commissionPercentage: hotmart.calculateHotmartCommission(
            product.price,
            product.commission_percentage,
          ),
          trendingScore: trends.trendingScore,
          demandLevel: trends.demandLevel,
          competitionLevel: trends.competitionLevel,
          recommendation: trends.recommendation,
          profitabilityScore: trends.profitabilityScore,
        });
      }
    } catch (error) {
      console.error(
        `[SyncJob] Error syncing Hotmart category ${category}:`,
        error,
      );
    }
  }

  return allProducts;
}

async function createSyncHistory(
  db: Awaited<ReturnType<typeof getDb>>,
  accountId: number,
  status: "pending" | "in_progress" | "completed" | "failed",
): Promise<number> {
  if (!db) throw new Error("Database not available");

  const result = await db.insert(marketplaceSyncHistory).values({
    marketplaceAccountId: accountId,
    syncType: "products",
    status,
  });

  return (result as any).insertId || 0;
}

async function updateSyncHistory(
  db: Awaited<ReturnType<typeof getDb>>,
  syncHistoryId: number,
  status: "pending" | "in_progress" | "completed" | "failed",
  productsAdded: number,
  productsUpdated: number,
  productsFailed: number,
  errorMessage?: string,
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

export default syncAllMarketplaceProducts;
