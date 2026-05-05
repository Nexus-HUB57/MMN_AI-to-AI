import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, affiliates, commissions, network, agents, upgrades, agentUpgrades } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Affiliate queries
export async function getAffiliateByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(affiliates).where(eq(affiliates.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAffiliateByCode(affiliateCode: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(affiliates).where(eq(affiliates.affiliateCode, affiliateCode)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTotalCommissionsByAffiliate(affiliateId: number) {
  const db = await getDb();
  if (!db) return "0.00";
  const result = await db.select({ total: sql<string>`SUM(amount)` }).from(commissions).where(and(eq(commissions.affiliateId, affiliateId), eq(commissions.status, "paid")));
  return result[0]?.total || "0.00";
}

export async function getPendingCommissionsByAffiliate(affiliateId: number) {
  const db = await getDb();
  if (!db) return "0.00";
  const result = await db.select({ total: sql<string>`SUM(amount)` }).from(commissions).where(and(eq(commissions.affiliateId, affiliateId), eq(commissions.status, "pending")));
  return result[0]?.total || "0.00";
}

export async function getDirectReferrals(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(network).where(and(eq(network.sponsorId, affiliateId), eq(network.level, 1)));
}

export async function getNetworkByAffiliate(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(network).where(eq(network.sponsorId, affiliateId)).orderBy(desc(network.level));
}

export async function getCommissionHistory(affiliateId: number, limit = 12) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(commissions).where(eq(commissions.affiliateId, affiliateId)).orderBy(desc(commissions.createdAt)).limit(limit);
}

export async function getAgentByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(agents).where(eq(agents.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAvailableUpgrades() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(upgrades).where(eq(upgrades.status, "available"));
}

export async function getActiveUpgradesByAgent(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(agentUpgrades).where(eq(agentUpgrades.agentId, agentId)).innerJoin(upgrades, eq(agentUpgrades.upgradeId, upgrades.id));
}
