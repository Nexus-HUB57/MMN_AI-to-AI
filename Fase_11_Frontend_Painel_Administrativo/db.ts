import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { users, affiliates, commissions, network, payments, commissionConfigs, materials, delinquents, adminLogs } from "./schema";
import { ENV } from '../../env';

let _db: ReturnType<typeof drizzle> | null = null;

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

// Dashboard helpers
export async function getDashboardMetrics() {
  const db = await getDb();
  if (!db) return null;

  try {
    const totalUsers = await db.select({ count: sql<number>`COUNT(*)` }).from(users);
    const totalAffiliates = await db.select({ count: sql<number>`COUNT(*)` }).from(affiliates);
    const totalCommissions = await db.select({ 
      sum: sql<number>`SUM(CAST(amount AS DECIMAL(15,2)))`
    }).from(commissions).where(eq(commissions.status, "paid"));
    const pendingCommissions = await db.select({ 
      sum: sql<number>`SUM(CAST(amount AS DECIMAL(15,2)))`
    }).from(commissions).where(eq(commissions.status, "pending"));

    return {
      totalUsers: totalUsers[0]?.count || 0,
      totalAffiliates: totalAffiliates[0]?.count || 0,
      totalCommissionsPaid: parseFloat(totalCommissions[0]?.sum?.toString() || "0"),
      pendingCommissions: parseFloat(pendingCommissions[0]?.sum?.toString() || "0"),
    };
  } catch (error) {
    console.error("[Database] Failed to get dashboard metrics:", error);
    return null;
  }
}

// User helpers
export async function getAllUsers(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(users).limit(limit).offset(offset);
  } catch (error) {
    console.error("[Database] Failed to get users:", error);
    return [];
  }
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get user:", error);
    return null;
  }
}

// Affiliate helpers
export async function getAffiliateByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(affiliates).where(eq(affiliates.userId, userId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get affiliate:", error);
    return null;
  }
}

export async function getAllAffiliates(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(affiliates).limit(limit).offset(offset);
  } catch (error) {
    console.error("[Database] Failed to get affiliates:", error);
    return [];
  }
}

// Commission config helpers
export async function getCommissionConfigs() {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(commissionConfigs).where(eq(commissionConfigs.active, 1));
  } catch (error) {
    console.error("[Database] Failed to get commission configs:", error);
    return [];
  }
}

export async function getCommissionConfigByLevel(level: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(commissionConfigs).where(eq(commissionConfigs.level, level)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get commission config:", error);
    return null;
  }
}

// Network helpers
export async function getNetworkByAffiliate(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(network).where(eq(network.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get network:", error);
    return [];
  }
}

export async function getDirectReferrals(sponsorId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(network).where(and(eq(network.sponsorId, sponsorId), eq(network.level, 1)));
  } catch (error) {
    console.error("[Database] Failed to get direct referrals:", error);
    return [];
  }
}

// Payment helpers
export async function getPayments(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(payments).orderBy(desc(payments.createdAt)).limit(limit).offset(offset);
  } catch (error) {
    console.error("[Database] Failed to get payments:", error);
    return [];
  }
}

export async function getPaymentsByAffiliate(affiliateId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(payments).where(eq(payments.affiliateId, affiliateId)).orderBy(desc(payments.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get affiliate payments:", error);
    return [];
  }
}

// Delinquent helpers
export async function getDelinquents(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(delinquents).where(eq(delinquents.status, "active")).orderBy(desc(delinquents.daysOverdue)).limit(limit).offset(offset);
  } catch (error) {
    console.error("[Database] Failed to get delinquents:", error);
    return [];
  }
}

export async function getDelinquentsByAffiliate(affiliateId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(delinquents).where(eq(delinquents.affiliateId, affiliateId)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get affiliate delinquent:", error);
    return null;
  }
}

// Material helpers
export async function getMaterials(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(materials).where(eq(materials.status, "active")).orderBy(desc(materials.createdAt)).limit(limit).offset(offset);
  } catch (error) {
    console.error("[Database] Failed to get materials:", error);
    return [];
  }
}

export async function getMaterialsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(materials).where(and(eq(materials.category, category), eq(materials.status, "active")));
  } catch (error) {
    console.error("[Database] Failed to get materials by category:", error);
    return [];
  }
}

// Admin log helpers
export async function logAdminAction(adminId: number, action: string, entityType?: string, entityId?: number, details?: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(adminLogs).values({
      adminId,
      action,
      entityType,
      entityId,
      details,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to log admin action:", error);
    return null;
  }
}
