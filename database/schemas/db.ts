import { eq, and, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, agents, upgrades, agentUpgrades, payments, bonuses, materials,
  InsertAgent, Agent, Upgrade, AgentUpgrade, Payment, InsertPayment, Bonus, InsertBonus, Material, InsertMaterial,
  affiliates, network, orders, products, notifications
} from "./schema-final";
import { ENV } from "../../backend/src/config/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    const dbUrl = process.env.DATABASE_URL || ENV.DATABASE_URL;
    if (dbUrl) {
      try {
        _db = drizzle(dbUrl);
      } catch (error) {
        console.warn("[Database] Failed to connect:", error);
        _db = null;
      }
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
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAgentByUserId(userId: number): Promise<Agent | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(agents).where(eq(agents.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createAgent(data: InsertAgent): Promise<Agent> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(agents).values(data);
  const createdAgent = await db.select().from(agents).where(eq(agents.userId, data.userId)).limit(1);
  if (!createdAgent[0]) throw new Error("Failed to create agent");
  return createdAgent[0];
}

export async function updateAgent(agentId: number, data: any): Promise<Agent | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(agents).set(data).where(eq(agents.id, agentId));
  const result = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUpgradeById(upgradeId: number): Promise<Upgrade | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(upgrades).where(eq(upgrades.id, upgradeId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAvailableUpgrades(): Promise<Upgrade[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(upgrades).where(eq(upgrades.status, "available"));
}

export async function getActiveUpgrades(agentId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
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
}

export async function activateUpgrade(agentId: number, upgradeId: number): Promise<AgentUpgrade> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(agentUpgrades).values({ agentId, upgradeId, status: "active", activatedAt: new Date() });
  const created = await db.select().from(agentUpgrades).where(and(eq(agentUpgrades.agentId, agentId), eq(agentUpgrades.upgradeId, upgradeId))).limit(1);
  if (!created[0]) throw new Error("Failed to activate upgrade");
  return created[0];
}

export async function deactivateUpgrade(agentUpgradeId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(agentUpgrades).set({ status: "inactive" }).where(eq(agentUpgrades.id, agentUpgradeId));
}

export async function getAgentUpgradeById(agentUpgradeId: number): Promise<AgentUpgrade | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(agentUpgrades).where(eq(agentUpgrades.id, agentUpgradeId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createNotification(data: {
  userId: number;
  type: string;
  title: string;
  content?: string;
  read?: number;
}) {
  const db = await getDb();
  if (!db) return;
  try {
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

export async function getAffiliateByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(affiliates).where(eq(affiliates.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAffiliateByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(affiliates).where(eq(affiliates.affiliateCode, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDirectReferrals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(network).where(and(eq(network.sponsorId, userId), eq(network.level, 1)));
}

export async function getNetworkTree(userId: number, maxDepth: number = 3) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(network).where(and(eq(network.sponsorId, userId), lte(network.level, maxDepth)));
}

export async function getTotalCommissions(affiliateId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ total: affiliates.totalCommissions }).from(affiliates).where(eq(affiliates.id, affiliateId)).limit(1);
  return result.length > 0 ? result[0].total : 0;
}

export async function getPendingCommissions(affiliateId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ pending: affiliates.pendingCommissions }).from(affiliates).where(eq(affiliates.id, affiliateId)).limit(1);
  return result.length > 0 ? result[0].pending : 0;
}

export async function getOrdersByAffiliate(affiliateId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).where(eq(orders.affiliateId, affiliateId)).limit(limit).orderBy(desc(orders.createdAt));
}

export async function getTrendingProducts(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).where(eq(products.trending, 1)).limit(limit);
}
