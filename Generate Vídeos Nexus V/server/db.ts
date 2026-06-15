import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, videoProjects, VideoProject, InsertVideoProject, scripts, Script, generationHistory, GenerationHistory, InsertScript, InsertGenerationHistory } from "../drizzle/schema";
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

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Video Projects
export async function createVideoProject(data: InsertVideoProject): Promise<VideoProject | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(videoProjects).values(data);
  const projectId = result[0].insertId;
  return await db.select().from(videoProjects).where(eq(videoProjects.id, Number(projectId))).limit(1).then(r => r[0]);
}

export async function getUserVideoProjects(userId: number): Promise<VideoProject[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(videoProjects).where(eq(videoProjects.userId, userId)).orderBy(videoProjects.createdAt);
}

export async function getVideoProjectById(projectId: number): Promise<VideoProject | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(videoProjects).where(eq(videoProjects.id, projectId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateVideoProject(projectId: number, data: Partial<VideoProject>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(videoProjects).set(data).where(eq(videoProjects.id, projectId));
}

export async function deleteVideoProject(projectId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(videoProjects).where(eq(videoProjects.id, projectId));
}

// Scripts
export async function createScript(data: InsertScript): Promise<Script | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(scripts).values(data);
  const scriptId = result[0].insertId;
  return await db.select().from(scripts).where(eq(scripts.id, Number(scriptId))).limit(1).then(r => r[0]);
}

export async function getScriptByProjectId(projectId: number): Promise<Script | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(scripts).where(eq(scripts.projectId, projectId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateScript(scriptId: number, data: Partial<Script>): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(scripts).set(data).where(eq(scripts.id, scriptId));
}

// Generation History
export async function createGenerationHistory(data: InsertGenerationHistory): Promise<GenerationHistory | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(generationHistory).values(data);
  const historyId = result[0].insertId;
  return await db.select().from(generationHistory).where(eq(generationHistory.id, Number(historyId))).limit(1).then(r => r[0]);
}

export async function getGenerationHistoryByProjectId(projectId: number): Promise<GenerationHistory[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(generationHistory).where(eq(generationHistory.projectId, projectId)).orderBy(generationHistory.createdAt);
}
