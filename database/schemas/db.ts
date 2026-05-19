import { eq, and, lte, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise"; // Importar o driver mysql2
import {
  InsertUser, users, agents, upgrades, agentUpgrades, payments, bonuses, materials,
  InsertAgent, Agent, Upgrade, AgentUpgrade, Payment, InsertPayment, Bonus, InsertBonus, Material, InsertMaterial,
  affiliates, network, orders, products, notifications,
  refreshTokens, sessionAudit, userConsents, consentHistory, userPreferences,
  RefreshToken, InsertRefreshToken, SessionAudit, InsertSessionAudit,
  UserConsent, InsertUserConsent, UserPreference, InsertUserPreference,
  ConsentHistory, InsertConsentHistory
} from "./schema-final";
import { ENV } from "../../backend/src/config/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null; // Declarar a variável para o pool

export async function getDb() {
  if (!_db) {
    const dbUrl = process.env.DATABASE_URL || ENV.DATABASE_URL;
    if (dbUrl) {
      try {
        if (!_pool) {
          // Criar um pool de conexões se ainda não existir
          _pool = mysql.createPool({
            uri: dbUrl,
            waitForConnections: true,
            connectionLimit: 10, // Ajuste este valor conforme a necessidade do seu ambiente
            queueLimit: 0
          });
        }
        _db = drizzle(_pool); // Usar o pool com Drizzle
      } catch (error) {
        console.warn("[Database] Falha ao conectar ou criar pool:", error);
        _db = null;
        _pool = null;
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

export async function getUserByLegacyEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateLegacyUserToModern(userId: number, openId: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ 
    openId, 
    loginMethod: "manus",
    updatedAt: new Date() 
  }).where(eq(users.id, userId));
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

// =============================================================================
// REFRESH TOKEN FUNCTIONS (AG-16)
// =============================================================================

export async function createRefreshToken(data: InsertRefreshToken): Promise<RefreshToken> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(refreshTokens).values(data);
  const created = await db.select().from(refreshTokens).where(eq(refreshTokens.id, data.id)).limit(1);
  if (!created[0]) throw new Error("Failed to create refresh token");
  return created[0];
}

export async function getRefreshTokenById(tokenId: string): Promise<RefreshToken | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(refreshTokens).where(eq(refreshTokens.id, tokenId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function revokeRefreshToken(tokenId: string, replacedByTokenId?: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(refreshTokens).set({
    revokedAt: new Date(),
    replacedByTokenId: replacedByTokenId || null,
  }).where(eq(refreshTokens.id, tokenId));
}

export async function revokeAllUserRefreshTokens(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(refreshTokens).set({ revokedAt: new Date() }).where(eq(refreshTokens.userId, userId));
}

export async function getActiveRefreshTokens(userId: number): Promise<RefreshToken[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(refreshTokens).where(
    and(
      eq(refreshTokens.userId, userId),
      eq(refreshTokens.revokedAt, null as any)
    )
  );
}

export async function deleteExpiredRefreshTokens(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const now = new Date();
  const result = await db.delete(refreshTokens).where(lte(refreshTokens.expiresAt, now));
  return result.rowCount || 0;
}

// =============================================================================
// SESSION AUDIT FUNCTIONS (AG-16)
// =============================================================================

export async function createSessionAudit(data: InsertSessionAudit): Promise<SessionAudit> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(sessionAudit).values(data);
  const created = await db.select().from(sessionAudit).where(eq(sessionAudit.id, data.id)).limit(1);
  if (!created[0]) throw new Error("Failed to create session audit");
  return created[0];
}

export async function getSessionAuditByUser(userId: number, limit: number = 50): Promise<SessionAudit[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(sessionAudit)
    .where(eq(sessionAudit.userId, userId))
    .limit(limit)
    .orderBy(desc(sessionAudit.createdAt));
}

export async function getRecentSessionAudit(action: string, minutes: number = 5): Promise<SessionAudit[]> {
  const db = await getDb();
  if (!db) return [];
  const since = new Date(Date.now() - minutes * 60 * 1000);
  return await db.select().from(sessionAudit)
    .where(and(eq(sessionAudit.action, action), lte(sessionAudit.createdAt, since)))
    .limit(100);
}

// =============================================================================
// GDPR CONSENT FUNCTIONS (AG-38)
// =============================================================================

export async function getUserConsents(userId: number): Promise<UserConsent[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(userConsents).where(eq(userConsents.userId, userId));
}

export async function getUserConsent(userId: number, consentType: string): Promise<UserConsent | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userConsents).where(
    and(eq(userConsents.userId, userId), eq(userConsents.consentType, consentType as any))
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setUserConsent(
  userId: number,
  consentType: string,
  granted: boolean,
  ipAddress?: string,
  userAgent?: string
): Promise<UserConsent> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getUserConsent(userId, consentType);
  const now = new Date();

  if (existing) {
    const previousValue = existing.granted;
    await db.update(userConsents).set({
      granted: granted ? "true" : "false",
      grantedAt: granted ? now : existing.grantedAt,
      revokedAt: granted ? existing.revokedAt : now,
      ipAddress: ipAddress || existing.ipAddress,
      userAgent: userAgent || existing.userAgent,
      updatedAt: now,
    }).where(eq(userConsents.id, existing.id));

    // Record history
    await db.insert(consentHistory).values({
      userId,
      consentType,
      action: granted ? "granted" : "revoked",
      previousValue: previousValue as any,
      newValue: granted ? "true" : "false",
      ipAddress,
      userAgent,
      createdAt: now,
    });

    const updated = await db.select().from(userConsents).where(eq(userConsents.id, existing.id)).limit(1);
    return updated[0];
  } else {
    await db.insert(userConsents).values({
      userId,
      consentType: consentType as any,
      granted: granted ? "true" : "false",
      grantedAt: granted ? now : null,
      ipAddress,
      userAgent,
      createdAt: now,
      updatedAt: now,
    });

    // Record history
    await db.insert(consentHistory).values({
      userId,
      consentType,
      action: granted ? "granted" : "revoked",
      previousValue: "null",
      newValue: granted ? "true" : "false",
      ipAddress,
      userAgent,
      createdAt: now,
    });

    const created = await db.select().from(userConsents).where(
      and(eq(userConsents.userId, userId), eq(userConsents.consentType, consentType as any))
    ).limit(1);
    return created[0];
  }
}

export async function getConsentHistory(userId: number, limit: number = 50): Promise<ConsentHistory[]> {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(consentHistory)
    .where(eq(consentHistory.userId, userId))
    .limit(limit)
    .orderBy(desc(consentHistory.createdAt));
}

export async function hasMarketingConsent(userId: number): Promise<boolean> {
  const consent = await getUserConsent(userId, "marketing_email");
  return consent?.granted === "true";
}

// =============================================================================
// USER PREFERENCES FUNCTIONS (AG-38)
// =============================================================================

export async function getUserPreferences(userId: number): Promise<UserPreference | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserPreferences(userId: number, data: Partial<InsertUserPreference>): Promise<UserPreference> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getUserPreferences(userId);
  const now = new Date();

  if (existing) {
    await db.update(userPreferences).set({ ...data, updatedAt: now }).where(eq(userPreferences.userId, userId));
    const updated = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
    return updated[0];
  } else {
    await db.insert(userPreferences).values({
      userId,
      language: data.language || "pt-BR",
      timezone: data.timezone || "America/Sao_Paulo",
      currency: data.currency || "BRL",
      emailNotifications: data.emailNotifications || "true",
      pushNotifications: data.pushNotifications || "false",
      theme: data.theme || "system",
      contentDensity: data.contentDensity || "comfortable",
      dashboardLayout: data.dashboardLayout || null,
      createdAt: now,
      updatedAt: now,
    });
    const created = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId)).limit(1);
    return created[0];
  }
}

export async function updateUserPreference(userId: number, key: string, value: any): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(userPreferences).set({ [key]: value, updatedAt: new Date() }).where(eq(userPreferences.userId, userId));
}
