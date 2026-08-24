import { eq, and, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, agents, upgrades, agentUpgrades, InsertAgent, Agent, Upgrade, AgentUpgrade } from "../drizzle/schema";
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

/**
 * Get agent by user ID
 */
export async function getAgentByUserId(userId: number): Promise<Agent | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get agent: database not available");
    return undefined;
  }

  const result = await db.select().from(agents).where(eq(agents.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create agent for user
 */
export async function createAgent(data: InsertAgent): Promise<Agent> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.insert(agents).values(data);
    
    const createdAgent = await db.select().from(agents).where(eq(agents.userId, data.userId)).limit(1);
    if (!createdAgent[0]) {
      throw new Error("Failed to create agent");
    }

    return createdAgent[0];
  } catch (error) {
    console.error("[Database] Failed to create agent:", error);
    throw error;
  }
}

/**
 * Update agent - only allows updating configurable fields
 */
export async function updateAgent(agentId: number, data: { name?: string; status?: "learning" | "active" | "paused" | "inactive"; contentStrategy?: string | null; performanceScore?: number }): Promise<Agent | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update agent: database not available");
    return undefined;
  }

  try {
    await db.update(agents).set(data).where(eq(agents.id, agentId));
    
    const result = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Failed to update agent:", error);
    throw error;
  }
}

/**
 * Get upgrade by ID
 */
export async function getUpgradeById(upgradeId: number): Promise<Upgrade | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get upgrade: database not available");
    return undefined;
  }

  const result = await db.select().from(upgrades).where(eq(upgrades.id, upgradeId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all available upgrades
 */
export async function getAvailableUpgrades(): Promise<Upgrade[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get upgrades: database not available");
    return [];
  }

  return db.select().from(upgrades).where(eq(upgrades.status, "available"));
}

/**
 * Get active upgrades for an agent with upgrade details
 */
export async function getActiveUpgrades(agentId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get active upgrades: database not available");
    return [];
  }

  const result = await db
    .select({
      id: agentUpgrades.id,
      agentId: agentUpgrades.agentId,
      upgradeId: agentUpgrades.upgradeId,
      status: agentUpgrades.status,
      activatedAt: agentUpgrades.activatedAt,
      expiresAt: agentUpgrades.expiresAt,
      upgrade: {
        id: upgrades.id,
        name: upgrades.name,
        description: upgrades.description,
        price: upgrades.price,
        category: upgrades.category,
        status: upgrades.status,
        createdAt: upgrades.createdAt,
      },
    })
    .from(agentUpgrades)
    .innerJoin(upgrades, eq(agentUpgrades.upgradeId, upgrades.id))
    .where(and(eq(agentUpgrades.agentId, agentId), eq(agentUpgrades.status, "active")));

  return result;
}

/**
 * Activate upgrade for agent
 */
export async function activateUpgrade(agentId: number, upgradeId: number): Promise<AgentUpgrade> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.insert(agentUpgrades).values({
      agentId,
      upgradeId,
      status: "active",
      activatedAt: new Date(),
    });

    const created = await db.select().from(agentUpgrades).where(and(eq(agentUpgrades.agentId, agentId), eq(agentUpgrades.upgradeId, upgradeId))).limit(1);
    
    if (!created[0]) {
      throw new Error("Failed to activate upgrade");
    }

    return created[0];
  } catch (error) {
    console.error("[Database] Failed to activate upgrade:", error);
    throw error;
  }
}

/**
 * Deactivate upgrade for agent
 */
export async function deactivateUpgrade(agentUpgradeId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    await db.update(agentUpgrades).set({ status: "inactive" }).where(eq(agentUpgrades.id, agentUpgradeId));
  } catch (error) {
    console.error("[Database] Failed to deactivate upgrade:", error);
    throw error;
  }
}

/**
 * Get agent upgrade by ID
 */
export async function getAgentUpgradeById(agentUpgradeId: number): Promise<AgentUpgrade | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get agent upgrade: database not available");
    return undefined;
  }

  const result = await db.select().from(agentUpgrades).where(eq(agentUpgrades.id, agentUpgradeId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Create a new notification
 */
export async function createNotification(data: {
  userId: number;
  type: string;
  title: string;
  content?: string;
  read?: number;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create notification: database not available");
    return;
  }

  try {
    const { notifications } = await import("../drizzle/schema");
    await db.insert(notifications).values({
      userId: data.userId,
      type: data.type,
      title: data.title,
      content: data.content,
      read: data.read ?? 0,
    });
  } catch (error) {
    console.error("[Database] Failed to create notification:", error);
  }
}

/**
 * Get affiliate by user ID
 */
export async function getAffiliateByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const { affiliates } = await import("../drizzle/schema");
  const result = await db.select().from(affiliates).where(eq(affiliates.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get affiliate by code
 */
export async function getAffiliateByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const { affiliates } = await import("../drizzle/schema");
  const result = await db.select().from(affiliates).where(eq(affiliates.affiliateCode, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get direct referrals
 */
export async function getDirectReferrals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { network } = await import("../drizzle/schema");
  return await db.select().from(network).where(and(eq(network.sponsorId, userId), eq(network.level, 1)));
}

/**
 * Get network tree
 */
export async function getNetworkTree(userId: number, maxDepth: number = 3) {
  const db = await getDb();
  if (!db) return [];
  const { network } = await import("../drizzle/schema");
  return await db.select().from(network).where(and(eq(network.sponsorId, userId), lte(network.level, maxDepth)));
}

/**
 * Get total commissions
 */
export async function getTotalCommissions(affiliateId: number) {
  const db = await getDb();
  if (!db) return 0;
  const { affiliates } = await import("../drizzle/schema");
  const result = await db.select({ total: affiliates.totalCommissions }).from(affiliates).where(eq(affiliates.id, affiliateId)).limit(1);
  return result.length > 0 ? result[0].total : 0;
}

/**
 * Get pending commissions
 */
export async function getPendingCommissions(affiliateId: number) {
  const db = await getDb();
  if (!db) return 0;
  const { affiliates } = await import("../drizzle/schema");
  const result = await db.select({ pending: affiliates.pendingCommissions }).from(affiliates).where(eq(affiliates.id, affiliateId)).limit(1);
  return result.length > 0 ? result[0].pending : 0;
}

/**
 * Get orders by affiliate
 */
export async function getOrdersByAffiliate(affiliateId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  const { orders } = await import("../drizzle/schema");
  return await db.select().from(orders).where(eq(orders.affiliateId, affiliateId)).limit(limit).orderBy(desc(orders.createdAt));
}

/**
 * Get trending products
 */
export async function getTrendingProducts(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  const { products } = await import("../drizzle/schema");
  return await db.select().from(products).where(eq(products.trending, 1)).limit(limit);
}
