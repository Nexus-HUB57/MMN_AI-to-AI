/**
 * XP Service - Lógica de XP e Progressão de Carreiras
 * Sistema PD/SCC com 27 níveis de carreira
 */

import { db } from '../db';
import { affiliateXP, xpTransactions, careerLevels, affiliates, commissions } from '../../database/schemas';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// XP multipliers based on source
const XP_MULTIPLIERS = {
  sale: 10, // 10 XP per BRL of sale
  commission: 5, // 5 XP per BRL of commission
  bonus: 15, // 15 XP per BRL of bonus
  network: 3, // 3 XP per BRL from network sales
  challenge: 20, // Challenge completion multiplier
  penalty: -1, // Penalty multiplier (negative)
};

/**
 * Get or create XP record for an affiliate
 */
export async function getOrCreateAffiliateXP(affiliateId: number) {
  const [record] = await db
    .select()
    .from(affiliateXP)
    .where(eq(affiliateXP.affiliateId, affiliateId))
    .limit(1);

  if (record) {
    return record;
  }

  // Create new XP record
  const [newRecord] = await db
    .insert(affiliateXP)
    .values({
      affiliateId,
      totalXp: 0,
      currentLevel: 1,
      monthlyXp: 0,
      monthlyXpResetAt: new Date(),
      xpHistory: [],
    })
    .returning();

  return newRecord;
}

/**
 * Calculate level from total XP
 */
export async function calculateLevelFromXP(totalXp: number): Promise<number> {
  // Get all career levels ordered by XP requirement
  const levels = await db
    .select()
    .from(careerLevels)
    .orderBy(desc(careerLevels.minXp));

  // Find the highest level the user qualifies for
  let currentLevel = 1;
  for (const level of levels) {
    if (totalXp >= level.minXp) {
      currentLevel = level.level;
    } else {
      break;
    }
  }

  return currentLevel;
}

/**
 * Add XP to an affiliate
 */
export async function addXP(
  affiliateId: number,
  amount: number,
  source: 'sale' | 'commission' | 'bonus' | 'network' | 'challenge' | 'penalty',
  description: string,
  sourceId?: string
): Promise<{ xpRecord: typeof affiliateXP.$inferSelect; transaction: typeof xpTransactions.$inferSelect }> {
  const currentXP = await getOrCreateAffiliateXP(affiliateId);

  // Calculate XP amount based on source
  const xpAmount = Math.floor(amount * (XP_MULTIPLIERS[source] || 1));
  const newTotalXp = Math.max(0, currentXP.totalXp + xpAmount);
  const newMonthlyXp = currentXP.monthlyXp + xpAmount;

  // Calculate new level
  const newLevel = await calculateLevelFromXP(newTotalXp);
  const levelChanged = newLevel !== currentXP.currentLevel;

  // Create XP transaction record
  const transactionId = nanoid();
  const [transaction] = await db
    .insert(xpTransactions)
    .values({
      id: transactionId,
      affiliateId,
      amount: xpAmount,
      source,
      sourceId,
      description,
      xpBefore: currentXP.totalXp,
      xpAfter: newTotalXp,
      levelBefore: currentXP.currentLevel,
      levelAfter: newLevel,
    })
    .returning();

  // Update XP record
  const historyEntry = {
    date: new Date().toISOString(),
    amount: xpAmount,
    source,
    description,
  };

  const [updatedXP] = await db
    .update(affiliateXP)
    .set({
      totalXp: newTotalXp,
      currentLevel: newLevel,
      monthlyXp: newMonthlyXp,
      xpHistory: [...(currentXP.xpHistory || []), historyEntry].slice(-100), // Keep last 100 entries
      updatedAt: new Date(),
    })
    .where(eq(affiliateXP.affiliateId, affiliateId))
    .returning();

  // Update affiliate rank in affiliates table
  if (levelChanged) {
    await db
      .update(affiliates)
      .set({ updatedAt: new Date() })
      .where(eq(affiliates.id, affiliateId));
  }

  return { xpRecord: updatedXP, transaction };
}

/**
 * Get XP details for an affiliate
 */
export async function getXPDetails(affiliateId: number) {
  const xpRecord = await getOrCreateAffiliateXP(affiliateId);

  // Get current level info
  const [levelInfo] = await db
    .select()
    .from(careerLevels)
    .where(eq(careerLevels.level, xpRecord.currentLevel))
    .limit(1);

  // Get next level info
  const [nextLevel] = await db
    .select()
    .from(careerLevels)
    .where(eq(careerLevels.level, xpRecord.currentLevel + 1))
    .limit(1);

  // Get recent transactions
  const recentTransactions = await db
    .select()
    .from(xpTransactions)
    .where(eq(xpTransactions.affiliateId, affiliateId))
    .orderBy(desc(xpTransactions.createdAt))
    .limit(20);

  // Calculate progress to next level
  let progressToNextLevel = 100;
  let xpNeededForNextLevel = 0;

  if (nextLevel && levelInfo) {
    const xpInCurrentLevel = xpRecord.totalXp - levelInfo.minXp;
    const xpRequiredForLevel = nextLevel.minXp - levelInfo.minXp;
    progressToNextLevel = Math.min(100, Math.floor((xpInCurrentLevel / xpRequiredForLevel) * 100));
    xpNeededForNextLevel = nextLevel.minXp - xpRecord.totalXp;
  }

  return {
    xp: xpRecord,
    level: levelInfo,
    nextLevel,
    progressToNextLevel,
    xpNeededForNextLevel,
    monthlyXpRequired: levelInfo?.monthlyXpRequired || 0,
    monthlyProgress: levelInfo ? Math.min(100, Math.floor((xpRecord.monthlyXp / levelInfo.monthlyXpRequired) * 100)) : 0,
    recentTransactions,
  };
}

/**
 * Get all career levels
 */
export async function getAllCareerLevels() {
  return db.select().from(careerLevels).orderBy(careerLevels.level);
}

/**
 * Seed career levels if not exists
 */
export async function seedCareerLevels() {
  const existingLevels = await db.select().from(careerLevels).limit(1);
  if (existingLevels.length > 0) {
    return { message: 'Career levels already seeded' };
  }

  const careerLevelsData = [
    // Afiliado (levels 1-3)
    { level: 1, name: 'Iniciante', category: 'affiliado', tier: 1, minXp: 0, monthlyXpRequired: 0, commissionBonus: 0, benefits: 'Acesso básico ao sistema', icon: 'star', color: '#9CA3AF' },
    { level: 2, name: 'Afiliado Bronze', category: 'affiliado', tier: 2, minXp: 100, monthlyXpRequired: 50, commissionBonus: 1, benefits: '+1% em comissões', icon: 'star', color: '#CD7F32' },
    { level: 3, name: 'Afiliado Prata', category: 'affiliado', tier: 3, minXp: 300, monthlyXpRequired: 100, commissionBonus: 2, benefits: '+2% em comissões', icon: 'star', color: '#C0C0C0' },

    // Preditivo (levels 4-6)
    { level: 4, name: 'Analista Jr', category: 'preditivo', tier: 1, minXp: 600, monthlyXpRequired: 150, commissionBonus: 3, benefits: '+3% em comissões, acesso a analytics', icon: 'trending-up', color: '#10B981' },
    { level: 5, name: 'Analista Pl', category: 'preditivo', tier: 2, minXp: 1200, monthlyXpRequired: 250, commissionBonus: 4, benefits: '+4% em comissões', icon: 'trending-up', color: '#059669' },
    { level: 6, name: 'Analista Sr', category: 'preditivo', tier: 3, minXp: 2500, monthlyXpRequired: 400, commissionBonus: 5, benefits: '+5% em comissões', icon: 'trending-up', color: '#047857' },

    // Generativo (levels 7-9)
    { level: 7, name: 'Creator Jr', category: 'generativo', tier: 1, minXp: 5000, monthlyXpRequired: 600, commissionBonus: 6, benefits: '+6% em comissões, acesso a AI content', icon: 'zap', color: '#8B5CF6' },
    { level: 8, name: 'Creator Pl', category: 'generativo', tier: 2, minXp: 10000, monthlyXpRequired: 1000, commissionBonus: 8, benefits: '+8% em comissões', icon: 'zap', color: '#7C3AED' },
    { level: 9, name: 'Creator Sr', category: 'generativo', tier: 3, minXp: 20000, monthlyXpRequired: 1500, commissionBonus: 10, benefits: '+10% em comissões', icon: 'zap', color: '#6D28D9' },

    // Orquestrador (levels 10-12)
    { level: 10, name: 'Orquestrador Jr', category: 'orquestrador', tier: 1, minXp: 40000, monthlyXpRequired: 2500, commissionBonus: 12, benefits: '+12% em comissões, team management', icon: 'users', color: '#F59E0B' },
    { level: 11, name: 'Orquestrador Pl', category: 'orquestrador', tier: 2, minXp: 80000, monthlyXpRequired: 4000, commissionBonus: 15, benefits: '+15% em comissões', icon: 'users', color: '#D97706' },
    { level: 12, name: 'Orquestrador Sr', category: 'orquestrador', tier: 3, minXp: 160000, monthlyXpRequired: 6000, commissionBonus: 18, benefits: '+18% em comissões', icon: 'users', color: '#B45309' },

    // IA Agêntica (levels 13-15)
    { level: 13, name: 'Agente Jr', category: 'ia_agentica', tier: 1, minXp: 320000, monthlyXpRequired: 10000, commissionBonus: 20, benefits: '+20% em comissões, AI agent access', icon: 'bot', color: '#EC4899' },
    { level: 14, name: 'Agente Pl', category: 'ia_agentica', tier: 2, minXp: 640000, monthlyXpRequired: 15000, commissionBonus: 25, benefits: '+25% em comissões', icon: 'bot', color: '#DB2777' },
    { level: 15, name: 'Agente Sr', category: 'ia_agentica', tier: 3, minXp: 1280000, monthlyXpRequired: 20000, commissionBonus: 30, benefits: '+30% em comissões', icon: 'bot', color: '#BE185D' },

    // CEO Levels (16-18)
    { level: 16, name: 'Diretor Jr', category: 'ia_agentica', tier: 1, minXp: 2500000, monthlyXpRequired: 30000, commissionBonus: 35, benefits: '+35% em comissões', icon: 'crown', color: '#6366F1' },
    { level: 17, name: 'Diretor Pl', category: 'ia_agentica', tier: 2, minXp: 5000000, monthlyXpRequired: 40000, commissionBonus: 40, benefits: '+40% em comissões', icon: 'crown', color: '#4F46E5' },
    { level: 18, name: 'Diretor Sr', category: 'ia_agentica', tier: 3, minXp: 10000000, monthlyXpRequired: 50000, commissionBonus: 45, benefits: '+45% em comissões', icon: 'crown', color: '#4338CA' },

    // Executive Levels (19-21)
    { level: 19, name: 'VP Jr', category: 'ia_agentica', tier: 1, minXp: 20000000, monthlyXpRequired: 75000, commissionBonus: 50, benefits: '+50% em comissões', icon: 'award', color: '#0EA5E9' },
    { level: 20, name: 'VP Pl', category: 'ia_agentica', tier: 2, minXp: 40000000, monthlyXpRequired: 100000, commissionBonus: 55, benefits: '+55% em comissões', icon: 'award', color: '#0284C7' },
    { level: 21, name: 'VP Sr', category: 'ia_agentica', tier: 3, minXp: 80000000, monthlyXpRequired: 125000, commissionBonus: 60, benefits: '+60% em comissões', icon: 'award', color: '#0369A1' },

    // Founder Levels (22-24)
    { level: 22, name: 'Partner Jr', category: 'ia_agentica', tier: 1, minXp: 160000000, monthlyXpRequired: 175000, commissionBonus: 65, benefits: '+65% em comissões', icon: 'gem', color: '#14B8A6' },
    { level: 23, name: 'Partner Pl', category: 'ia_agentica', tier: 2, minXp: 320000000, monthlyXpRequired: 250000, commissionBonus: 70, benefits: '+70% em comissões', icon: 'gem', color: '#0D9488' },
    { level: 24, name: 'Partner Sr', category: 'ia_agentica', tier: 3, minXp: 640000000, monthlyXpRequired: 350000, commissionBonus: 75, benefits: '+75% em comissões', icon: 'gem', color: '#0F766E' },

    // Supreme Levels (25-27)
    { level: 25, name: 'Chairman Jr', category: 'ia_agentica', tier: 1, minXp: 1280000000, monthlyXpRequired: 500000, commissionBonus: 80, benefits: '+80% em comissões', icon: 'shield', color: '#F97316' },
    { level: 26, name: 'Chairman Pl', category: 'ia_agentica', tier: 2, minXp: 2560000000, monthlyXpRequired: 750000, commissionBonus: 85, benefits: '+85% em comissões', icon: 'shield', color: '#EA580C' },
    { level: 27, name: 'Chairman Sr', category: 'ia_agentica', tier: 3, minXp: 5120000000, monthlyXpRequired: 1000000, commissionBonus: 90, benefits: '+90% em comissões, status máximo', icon: 'shield', color: '#C2410C' },
  ];

  await db.insert(careerLevels).values(careerLevelsData);

  return { message: `Seeded ${careerLevelsData.length} career levels` };
}

/**
 * Process XP from commissions
 */
export async function processCommissionXP(affiliateId: number, commissionAmount: number, commissionId: number) {
  return addXP(
    affiliateId,
    commissionAmount,
    'commission',
    `XP de comissão #${commissionId}`,
    commissionId.toString()
  );
}

/**
 * Reset monthly XP (called by cron job)
 */
export async function resetMonthlyXP() {
  const now = new Date();

  await db
    .update(affiliateXP)
    .set({
      monthlyXp: 0,
      monthlyXpResetAt: now,
    });

  return { message: 'Monthly XP reset completed' };
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(limit: number = 10) {
  const topAffiliates = await db
    .select({
      affiliateId: affiliateXP.affiliateId,
      totalXp: affiliateXP.totalXp,
      currentLevel: affiliateXP.currentLevel,
      monthlyXp: affiliateXP.monthlyXp,
    })
    .from(affiliateXP)
    .orderBy(desc(affiliateXP.totalXp))
    .limit(limit);

  // Get affiliate details
  const leaderboard = await Promise.all(
    topAffiliates.map(async (item, index) => {
      const [affiliate] = await db
        .select({
          affiliateCode: affiliates.affiliateCode,
        })
        .from(affiliates)
        .where(eq(affiliates.id, item.affiliateId))
        .limit(1);

      const [level] = await db
        .select()
        .from(careerLevels)
        .where(eq(careerLevels.level, item.currentLevel))
        .limit(1);

      return {
        rank: index + 1,
        affiliateId: item.affiliateId,
        affiliateCode: affiliate?.affiliateCode || 'N/A',
        totalXp: item.totalXp,
        currentLevel: item.currentLevel,
        levelName: level?.name || 'Unknown',
        levelIcon: level?.icon || 'star',
        levelColor: level?.color || '#9CA3AF',
        monthlyXp: item.monthlyXp,
      };
    })
  );

  return leaderboard;
}