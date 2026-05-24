import { eq } from "drizzle-orm";

import { getDb } from "../../routers/db";
import { marketplaceAccounts } from "../../drizzle/schema";
import type { ConnectMarketplaceInput } from "./types";

export type MarketplaceDbClient = NonNullable<Awaited<ReturnType<typeof getDb>>>;

export async function insertMarketplaceAccount(
  db: MarketplaceDbClient,
  input: ConnectMarketplaceInput,
): Promise<number> {
  const result = await db.insert(marketplaceAccounts).values({
    userId: input.userId,
    marketplace: input.marketplace,
    accountName: input.accountName,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    apiKey: input.apiKey,
    apiSecret: input.apiSecret,
    isActive: 1,
    syncStatus: "pending",
  });

  return Number((result as any).insertId);
}

export async function findMarketplaceAccountById(
  db: MarketplaceDbClient,
  accountId: number,
) {
  const rows = await db
    .select()
    .from(marketplaceAccounts)
    .where(eq(marketplaceAccounts.id, accountId))
    .limit(1);

  return rows[0] ?? null;
}

export async function listMarketplaceAccountsByUserId(
  db: MarketplaceDbClient,
  userId: number,
) {
  return db
    .select()
    .from(marketplaceAccounts)
    .where(eq(marketplaceAccounts.userId, userId));
}

export async function deactivateMarketplaceAccount(
  db: MarketplaceDbClient,
  accountId: number,
): Promise<void> {
  await db
    .update(marketplaceAccounts)
    .set({ isActive: 0 })
    .where(eq(marketplaceAccounts.id, accountId));
}

export async function markMarketplaceAccountSyncing(
  db: MarketplaceDbClient,
  accountId: number,
): Promise<void> {
  await db
    .update(marketplaceAccounts)
    .set({ syncStatus: "syncing" })
    .where(eq(marketplaceAccounts.id, accountId));
}
