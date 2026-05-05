import { eq, sum, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, agents, commissions, network } from "../drizzle/schema";
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

// Dashboard queries
export async function getDashboardStats(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get dashboard stats: database not available");
    return null;
  }

  try {
    // Obter ganhos totais (comissoes confirmadas e pagas)
    const totalEarningsResult = await db
      .select({ total: sum(commissions.amount) })
      .from(commissions)
      .where(eq(commissions.userId, userId));

    // Obter comissoes pendentes
    const pendingCommissionsResult = await db
      .select({ total: sum(commissions.amount) })
      .from(commissions)
      .where(and(eq(commissions.userId, userId), eq(commissions.status, "pendente")));

    // Obter numero de indicados diretos (nivel 1)
    const directReferrals = await db
      .select()
      .from(network)
      .where(and(eq(network.sponsorId, userId), eq(network.level, 1)));

    // Obter status do agente
    const agentResult = await db
      .select()
      .from(agents)
      .where(eq(agents.userId, userId))
      .limit(1);

    const totalEarnings = totalEarningsResult[0]?.total ? Number(totalEarningsResult[0].total) / 100 : 0;
    const pendingCommissions = pendingCommissionsResult[0]?.total ? Number(pendingCommissionsResult[0].total) / 100 : 0;

    return {
      totalEarnings,
      pendingCommissions,
      directReferrals: directReferrals.length,
      agent: agentResult.length > 0 ? agentResult[0] : null,
    };
  } catch (error) {
    console.error("[Database] Failed to get dashboard stats:", error);
    return null;
  }
}

export async function getAgentByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get agent: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(agents)
    .where(eq(agents.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}
