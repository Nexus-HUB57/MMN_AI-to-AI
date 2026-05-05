import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, agents, scheduledPosts, recommendedProducts, generatedContent, agentSkills, evolutionHistory, generatedImages } from "../drizzle/schema";
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

// Agent queries
export async function getAgentByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(agents).where(eq(agents.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAgentByAgentId(agentId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(agents).where(eq(agents.agentId, agentId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateAgent(agentId: string, data: Partial<typeof agents.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(agents).set(data).where(eq(agents.agentId, agentId));
  return getAgentByAgentId(agentId);
}

// Scheduled posts queries
export async function getScheduledPostsByAgentId(agentId: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(scheduledPosts).where(eq(scheduledPosts.agentId, agentId));
}

export async function createScheduledPost(data: typeof scheduledPosts.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(scheduledPosts).values(data);
  return data;
}

export async function updateScheduledPost(id: number, data: Partial<typeof scheduledPosts.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(scheduledPosts).set(data).where(eq(scheduledPosts.id, id));
  return db.select().from(scheduledPosts).where(eq(scheduledPosts.id, id)).limit(1);
}

// Recommended products queries
export async function getRecommendedProductsByAgentId(agentId: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(recommendedProducts).where(eq(recommendedProducts.agentId, agentId));
}

export async function createRecommendedProduct(data: typeof recommendedProducts.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(recommendedProducts).values(data);
  return data;
}

// Generated content queries
export async function getGeneratedContentByAgentId(agentId: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(generatedContent).where(eq(generatedContent.agentId, agentId));
}

export async function createGeneratedContent(data: typeof generatedContent.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(generatedContent).values(data);
  return data;
}

// Agent skills queries
export async function getAgentSkillsByAgentId(agentId: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(agentSkills).where(eq(agentSkills.agentId, agentId));
}

export async function createAgentSkill(data: typeof agentSkills.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(agentSkills).values(data);
  return data;
}

export async function updateAgentSkill(id: number, data: Partial<typeof agentSkills.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(agentSkills).set(data).where(eq(agentSkills.id, id));
  return db.select().from(agentSkills).where(eq(agentSkills.id, id)).limit(1);
}

// Evolution history queries
export async function getEvolutionHistoryByAgentId(agentId: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(evolutionHistory).where(eq(evolutionHistory.agentId, agentId));
}

export async function createEvolutionHistory(data: typeof evolutionHistory.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(evolutionHistory).values(data);
  return data;
}

// Generated images queries
export async function getGeneratedImagesByAgentId(agentId: string) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(generatedImages).where(eq(generatedImages.agentId, agentId));
}

export async function createGeneratedImage(data: typeof generatedImages.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(generatedImages).values(data);
  return data;
}

// Delete scheduled post
export async function deleteScheduledPost(id: number) {
  const db = await getDb();
  if (!db) return null;

  await db.delete(scheduledPosts).where(eq(scheduledPosts.id, id));
  return true;
}
