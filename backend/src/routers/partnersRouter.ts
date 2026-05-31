/**
 * Nexus Partners Pack - Partners Router
 * API tRPC para gerenciamento de parceiros estratégicos
 * Com algoritmos de crescimento exponencial
 */

import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "@/config/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/database";
import {
  partners,
  partnerships,
  partnerTierConfigs,
  partnerMetrics,
  partnerBenefits,
  partnerVolumeHistory,
  TIER_CONFIG,
  TIER_BENEFITS,
  type PartnerTier,
  type PartnershipStatus
} from "@/database/schemas/schema-partners";
import { eq, and, gte, lte, desc, asc, sql, or, like } from "drizzle-orm";

/**
 * Schemas de validação
 */
const createPartnerSchema = z.object({
  userId: z.number(),
  tier: z.enum(['silver', 'gold', 'platinum', 'diamond']).default('silver'),
  referralCode: z.string().optional(),
});

const updatePartnerSchema = z.object({
  id: z.number(),
  tier: z.enum(['silver', 'gold', 'platinum', 'diamond']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  benefits: z.array(z.string()).optional(),
});

const createPartnershipSchema = z.object({
  partnerId: z.number(),
  partnerName: z.string().min(1),
  partnerEmail: z.string().email().optional(),
  partnerCompany: z.string().optional(),
  commissionRate: z.number().min(0).max(1).default(0.05),
  benefits: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const updatePartnershipSchema = z.object({
  id: z.number(),
  status: z.enum(['pending', 'active', 'suspended', 'terminated']).optional(),
  commissionRate: z.number().min(0).max(1).optional(),
  benefits: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const partnerFiltersSchema = z.object({
  tier: z.enum(['silver', 'gold', 'platinum', 'diamond']).optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

const partnershipFiltersSchema = z.object({
  partnerId: z.number().optional(),
  status: z.enum(['pending', 'active', 'suspended', 'terminated']).optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

/**
 * Algoritmos de Crescimento Exponencial
 */
export class GrowthAlgorithmEngine {
  /**
   * Calcula multiplicador de volume baseado no tier atual
   */
  static calculateVolumeMultiplier(tier: PartnerTier, totalVolume: number): number {
    const config = TIER_CONFIG[tier];
    const baseMultiplier = config.commissionRate;

    // Fator exponencial: a cada R$ 10k acima do mínimo, multiplicador aumenta 5%
    const minVolume = config.minVolume;
    const excessVolume = Math.max(0, totalVolume - minVolume);
    const exponentialFactor = 1 + (excessVolume / 10000) * 0.05;

    return Math.min(exponentialFactor * baseMultiplier, config.commissionRate * 2);
  }

  /**
   * Calcula bônus de rede baseado no número de indicados
   */
  static calculateNetworkBonus(referralCount: number, tier: PartnerTier): number {
    const config = TIER_CONFIG[tier];
    if (!config.maxReferrals) {
      // Diamond: bônus progressivo sem limite
      return referralCount * 0.002;
    }

    // Progressão: 0.2% por indicação acima de 50% da capacidade
    const threshold = config.maxReferrals * 0.5;
    const excessReferrals = Math.max(0, referralCount - threshold);

    return excessReferrals * 0.002;
  }

  /**
   * Calcula score de retenção baseado no histórico
   */
  static calculateRetentionScore(metrics: { activeMonths: number; totalVolume: number; referralRate: number }): number {
    // Score baseado em: tempo na rede, volume gerado, taxa de indicação
    const timeScore = Math.min(metrics.activeMonths / 12, 1) * 0.3;
    const volumeScore = Math.min(metrics.totalVolume / 50000, 1) * 0.4;
    const referralScore = Math.min(metrics.referralRate, 1) * 0.3;

    return (timeScore + volumeScore + referralScore) * 100;
  }

  /**
   * Calcula potencial de crescimento (predictive scoring)
   */
  static calculateGrowthPotential(
    currentTier: PartnerTier,
    currentVolume: number,
    monthlyGrowth: number,
    referralRate: number
  ): { potentialTier: PartnerTier; monthsToPromote: number; confidence: number } {
    const tiers: PartnerTier[] = ['silver', 'gold', 'platinum', 'diamond'];
    const currentIndex = tiers.indexOf(currentTier);

    for (let i = currentIndex + 1; i < tiers.length; i++) {
      const nextTier = tiers[i];
      const requiredVolume = TIER_CONFIG[nextTier].minVolume;

      if (currentVolume >= requiredVolume) {
        continue;
      }

      const volumeNeeded = requiredVolume - currentVolume;
      const monthsToPromote = monthlyGrowth > 0 ? volumeNeeded / monthlyGrowth : Infinity;
      const confidence = Math.min(1, monthlyGrowth / 1000) * Math.min(1, referralRate * 2);

      return {
        potentialTier: nextTier,
        monthsToPromote: Math.round(monthsToPromote),
        confidence: Math.round(confidence * 100) / 100,
      };
    }

    return {
      potentialTier: 'diamond',
      monthsToPromote: 0,
      confidence: 1,
    };
  }

  /**
   * Calcula bônus de indicação escalonado
   */
  static calculateTieredReferralBonus(referralCount: number): { bonus: number; tier: string } {
    if (referralCount >= 100) {
      return { bonus: 0.15, tier: 'master' };
    } else if (referralCount >= 50) {
      return { bonus: 0.12, tier: 'expert' };
    } else if (referralCount >= 20) {
      return { bonus: 0.10, tier: 'advanced' };
    } else if (referralCount >= 5) {
      return { bonus: 0.08, tier: 'standard' };
    }
    return { bonus: 0.05, tier: 'basic' };
  }
}

export const partnersRouter = router({
  /**
   * Listar parceiros com filtros e paginação
   */
  list: protectedProcedure
    .input(partnerFiltersSchema)
    .query(async ({ input }) => {
      try {
        const { tier, status, search, page, limit } = input;
        const offset = (page - 1) * limit;

        // Construir condições de filtro
        const conditions = [];
        if (tier) conditions.push(eq(partners.tier, tier));
        if (status) conditions.push(eq(partners.status, status));
        if (search) {
          conditions.push(
            or(
              like(partners.referralCode, `%${search}%`),
              like(partners.id, `%${search}%`)
            )
          );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Buscar parceiros
        const [partnersList, total] = await Promise.all([
          db.select().from(partners)
            .where(whereClause)
            .orderBy(desc(partners.totalVolume))
            .limit(limit)
            .offset(offset),
          db.select({ count: sql<number>`count(*)` }).from(partners).where(whereClause),
        ]);

        return {
          partners: partnersList,
          total: Number(total[0]?.count || 0),
          page,
          limit,
          totalPages: Math.ceil(Number(total[0]?.count || 0) / limit),
        };
      } catch (error) {
        console.error("Erro ao listar parceiros:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao listar parceiros",
        });
      }
    }),

  /**
   * Obter detalhes de um parceiro específico
   */
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const partner = await db.select().from(partners).where(eq(partners.id, input.id)).limit(1);

        if (!partner[0]) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parceiro não encontrado",
          });
        }

        // Buscar métricas recentes
        const recentMetrics = await db.select().from(partnerMetrics)
          .where(eq(partnerMetrics.partnerId, input.id))
          .orderBy(desc(partnerMetrics.periodEnd))
          .limit(6);

        // Calcular potential de crescimento
        const growthAnalysis = GrowthAlgorithmEngine.calculateGrowthPotential(
          partner[0].tier as PartnerTier,
          Number(partner[0].totalVolume),
          recentMetrics.reduce((sum, m) => sum + Number(m.totalSales), 0) / Math.max(recentMetrics.length, 1),
          partner[0].referralCount / Math.max(1, new Date().getTime() - partner[0].createdAt.getTime() / 86400000)
        );

        return {
          ...partner[0],
          metrics: recentMetrics,
          growthPotential: growthAnalysis,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Erro ao obter parceiro:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao obter parceiro",
        });
      }
    }),

  /**
   * Criar novo parceiro
   */
  create: adminProcedure
    .input(createPartnerSchema)
    .mutation(async ({ input }) => {
      try {
        const referralCode = input.referralCode || `NEXUS-${input.tier.toUpperCase()}-${Date.now()}`;
        const benefits = TIER_BENEFITS[input.tier as PartnerTier] || [];

        const [newPartner] = await db.insert(partners).values({
          userId: input.userId,
          tier: input.tier,
          referralCode,
          referralCount: 0,
          totalVolume: 0,
          commissionBalance: 0,
          status: 'active',
          benefits,
        }).returning();

        return newPartner;
      } catch (error) {
        console.error("Erro ao criar parceiro:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar parceiro",
        });
      }
    }),

  /**
   * Atualizar dados do parceiro
   */
  update: adminProcedure
    .input(updatePartnerSchema)
    .mutation(async ({ input }) => {
      try {
        const updateData: any = { updatedAt: new Date() };
        if (input.tier) updateData.tier = input.tier;
        if (input.status) updateData.status = input.status;
        if (input.benefits) updateData.benefits = input.benefits;

        const [updatedPartner] = await db.update(partners)
          .set(updateData)
          .where(eq(partners.id, input.id))
          .returning();

        if (!updatedPartner) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parceiro não encontrado",
          });
        }

        return updatedPartner;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Erro ao atualizar parceiro:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar parceiro",
        });
      }
    }),

  /**
   * Deletar parceiro (soft delete)
   */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      try {
        await db.update(partners)
          .set({ status: 'inactive', updatedAt: new Date() })
          .where(eq(partners.id, input.id));

        return { success: true, id: input.id };
      } catch (error) {
        console.error("Erro ao deletar parceiro:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao deletar parceiro",
        });
      }
    }),

  /**
   * Obter estatísticas consolidadas
   */
  stats: protectedProcedure.query(async () => {
    try {
      const [partnersList, totalPartners] = await Promise.all([
        db.select().from(partners),
        db.select({ count: sql<number>`count(*)` }).from(partners),
      ]);

      const activeCount = partnersList.filter(p => p.status === 'active').length;
      const totalVolume = partnersList.reduce((sum, p) => sum + Number(p.totalVolume), 0);
      const totalCommissions = partnersList.reduce((sum, p) => sum + Number(p.commissionBalance), 0);

      // Contagem por tier
      const tierCounts = {
        silver: partnersList.filter(p => p.tier === 'silver').length,
        gold: partnersList.filter(p => p.tier === 'gold').length,
        platinum: partnersList.filter(p => p.tier === 'platinum').length,
        diamond: partnersList.filter(p => p.tier === 'diamond').length,
      };

      // Top performers
      const topPerformers = partnersList
        .sort((a, b) => Number(b.totalVolume) - Number(a.totalVolume))
        .slice(0, 10)
        .map(p => ({
          id: p.id,
          tier: p.tier,
          volume: Number(p.totalVolume),
          referralCount: p.referralCount,
        }));

      // Métricas de crescimento
      const growthRate = totalVolume > 0
        ? ((totalVolume - partnersList.length * 1000) / (partnersList.length * 1000)) * 100
        : 0;

      return {
        totalPartners: Number(totalPartners[0]?.count || 0),
        activePartners: activeCount,
        inactivePartners: partnersList.length - activeCount,
        totalVolume,
        totalCommissions,
        averageTier: Object.entries(tierCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'silver',
        tierDistribution: tierCounts,
        topPerformers,
        growthRate: Math.round(growthRate * 100) / 100,
        averageVolumePerPartner: partnersList.length > 0 ? totalVolume / partnersList.length : 0,
      };
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao obter estatísticas",
      });
    }
  }),

  /**
   * Listar parcerias
   */
  listPartnerships: protectedProcedure
    .input(partnershipFiltersSchema)
    .query(async ({ input }) => {
      try {
        const { partnerId, status, search, page, limit } = input;
        const offset = (page - 1) * limit;

        const conditions = [];
        if (partnerId) conditions.push(eq(partnerships.partnerId, partnerId));
        if (status) conditions.push(eq(partnerships.status, status));
        if (search) {
          conditions.push(
            or(
              like(partnerships.partnerName, `%${search}%`),
              like(partnerships.partnerEmail, `%${search}%`)
            )
          );
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [partnershipsList, total] = await Promise.all([
          db.select().from(partnerships)
            .where(whereClause)
            .orderBy(desc(partnerships.createdAt))
            .limit(limit)
            .offset(offset),
          db.select({ count: sql<number>`count(*)` }).from(partnerships).where(whereClause),
        ]);

        return {
          partnerships: partnershipsList,
          total: Number(total[0]?.count || 0),
          page,
          limit,
          totalPages: Math.ceil(Number(total[0]?.count || 0) / limit),
        };
      } catch (error) {
        console.error("Erro ao listar parcerias:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao listar parcerias",
        });
      }
    }),

  /**
   * Criar nova parceria
   */
  createPartnership: protectedProcedure
    .input(createPartnershipSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const [newPartnership] = await db.insert(partnerships).values({
          partnerId: input.partnerId,
          partnerName: input.partnerName,
          partnerEmail: input.partnerEmail,
          partnerCompany: input.partnerCompany,
          status: 'pending',
          commissionRate: input.commissionRate,
          benefits: input.benefits || [],
          notes: input.notes,
          startedAt: new Date(),
        }).returning();

        return newPartnership;
      } catch (error) {
        console.error("Erro ao criar parceria:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar parceria",
        });
      }
    }),

  /**
   * Atualizar parceria
   */
  updatePartnership: adminProcedure
    .input(updatePartnershipSchema)
    .mutation(async ({ input }) => {
      try {
        const updateData: any = { updatedAt: new Date() };
        if (input.status) updateData.status = input.status;
        if (input.commissionRate) updateData.commissionRate = input.commissionRate;
        if (input.benefits) updateData.benefits = input.benefits;
        if (input.notes) updateData.notes = input.notes;

        const [updated] = await db.update(partnerships)
          .set(updateData)
          .where(eq(partnerships.id, input.id))
          .returning();

        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parceria não encontrada",
          });
        }

        return updated;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Erro ao atualizar parceria:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar parceria",
        });
      }
    }),

  /**
   * Aprovar parceria
   */
  approvePartnership: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const [approved] = await db.update(partnerships)
          .set({
            status: 'active',
            approvedBy: ctx.user?.id,
            approvedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(partnerships.id, input.id))
          .returning();

        if (!approved) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parceria não encontrada",
          });
        }

        return approved;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Erro ao aprovar parceria:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao aprovar parceria",
        });
      }
    }),

  /**
   * Rejeitar parceria
   */
  rejectPartnership: adminProcedure
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      try {
        const [rejected] = await db.update(partnerships)
          .set({
            status: 'terminated',
            rejectionReason: input.reason,
            endedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(partnerships.id, input.id))
          .returning();

        if (!rejected) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parceria não encontrada",
          });
        }

        return rejected;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Erro ao rejeitar parceria:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao rejeitar parceria",
        });
      }
    }),

  /**
   * Encerrar parceria
   */
  terminatePartnership: adminProcedure
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      try {
        const [terminated] = await db.update(partnerships)
          .set({
            status: 'terminated',
            notes: input.reason ? `Encerrada: ${input.reason}` : undefined,
            endedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(partnerships.id, input.id))
          .returning();

        if (!terminated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parceria não encontrada",
          });
        }

        return terminated;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Erro ao encerrar parceria:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao encerrar parceria",
        });
      }
    }),

  /**
   * Calcular benefícios e bônus de um parceiro
   */
  calculatePartnerBenefits: protectedProcedure
    .input(z.object({ partnerId: z.number() }))
    .query(async ({ input }) => {
      try {
        const partner = await db.select().from(partners).where(eq(partners.id, input.partnerId)).limit(1);

        if (!partner[0]) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Parceiro não encontrado",
          });
        }

        const tier = partner[0].tier as PartnerTier;
        const totalVolume = Number(partner[0].totalVolume);
        const referralCount = partner[0].referralCount;

        // Calcular multiplicador de volume
        const volumeMultiplier = GrowthAlgorithmEngine.calculateVolumeMultiplier(tier, totalVolume);

        // Calcular bônus de rede
        const networkBonus = GrowthAlgorithmEngine.calculateNetworkBonus(referralCount, tier);

        // Calcular bônus de indicação escalonado
        const referralBonus = GrowthAlgorithmEngine.calculateTieredReferralBonus(referralCount);

        // Benefícios base do tier
        const tierBenefits = TIER_BENEFITS[tier] || [];

        // Benefícios ativos do parceiro
        const activeBenefits = await db.select().from(partnerBenefits)
          .where(and(
            eq(partnerBenefits.partnerId, input.partnerId),
            eq(partnerBenefits.isEnabled, true)
          ));

        return {
          partnerId: input.partnerId,
          tier,
          currentBenefits: [...tierBenefits, ...activeBenefits.map(b => b.benefitCode)],
          volumeMultiplier,
          networkBonus,
          referralBonus: referralBonus.bonus,
          referralTier: referralBonus.tier,
          totalCommissionRate: (TIER_CONFIG[tier].commissionRate + networkBonus + referralBonus.bonus) * volumeMultiplier,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Erro ao calcular benefícios:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao calcular benefícios",
        });
      }
    }),

  /**
   * Registrar volume para um parceiro (para tracking de crescimento)
   */
  registerVolume: protectedProcedure
    .input(z.object({
      partnerId: z.number(),
      volume: z.number(),
      volumeType: z.enum(['sale', 'commission', 'referral', 'bonus']),
      source: z.string().optional(),
      sourceId: z.number().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const [historyEntry] = await db.insert(partnerVolumeHistory).values({
          partnerId: input.partnerId,
          volume: input.volume,
          volumeType: input.volumeType,
          source: input.source,
          sourceId: input.sourceId,
          description: input.description,
        }).returning();

        // Atualizar totalVolume do parceiro
        await db.update(partners)
          .set({
            totalVolume: sql`total_volume + ${input.volume}`,
            updatedAt: new Date(),
          })
          .where(eq(partners.id, input.partnerId));

        // Verificar promoção de tier
        const partner = await db.select().from(partners).where(eq(partners.id, input.partnerId)).limit(1);
        if (partner[0]) {
          const newTotalVolume = Number(partner[0].totalVolume);

          // Verificar promoção para próximo tier
          const tiers: PartnerTier[] = ['silver', 'gold', 'platinum', 'diamond'];
          const currentIndex = tiers.indexOf(partner[0].tier as PartnerTier);

          for (let i = tiers.length - 1; i > currentIndex; i--) {
            if (newTotalVolume >= TIER_CONFIG[tiers[i]].minVolume) {
              await db.update(partners)
                .set({
                  tier: tiers[i],
                  benefits: TIER_BENEFITS[tiers[i]],
                  updatedAt: new Date(),
                })
                .where(eq(partners.id, input.partnerId));
              break;
            }
          }
        }

        return historyEntry;
      } catch (error) {
        console.error("Erro ao registrar volume:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao registrar volume",
        });
      }
    }),

  /**
   * Obter histórico de volume de um parceiro
   */
  getVolumeHistory: protectedProcedure
    .input(z.object({
      partnerId: z.number(),
      period: z.enum(['week', 'month', 'quarter', 'year']).optional(),
      limit: z.number().min(1).max(100).default(30),
    }))
    .query(async ({ input }) => {
      try {
        const { partnerId, period, limit } = input;

        // Calcular data de início baseado no período
        const now = new Date();
        let startDate = new Date();

        switch (period) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          default:
            startDate.setMonth(now.getMonth() - 1);
        }

        const history = await db.select().from(partnerVolumeHistory)
          .where(and(
            eq(partnerVolumeHistory.partnerId, partnerId),
            gte(partnerVolumeHistory.createdAt, startDate)
          ))
          .orderBy(desc(partnerVolumeHistory.createdAt))
          .limit(limit);

        // Agregar por tipo
        const aggregated = history.reduce((acc, entry) => {
          if (!acc[entry.volumeType]) {
            acc[entry.volumeType] = { total: 0, count: 0 };
          }
          acc[entry.volumeType].total += Number(entry.volume);
          acc[entry.volumeType].count++;
          return acc;
        }, {} as Record<string, { total: number; count: number }>);

        return {
          history,
          aggregated,
          period,
          startDate,
          endDate: now,
        };
      } catch (error) {
        console.error("Erro ao obter histórico de volume:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao obter histórico de volume",
        });
      }
    }),

  /**
   * Listar configurações de tiers (para admins)
   */
  listTierConfigs: protectedProcedure.query(async () => {
    try {
      const configs = await db.select().from(partnerTierConfigs)
        .where(eq(partnerTierConfigs.isActive, true))
        .orderBy(asc(partnerTierConfigs.sortOrder));

      return configs;
    } catch (error) {
      console.error("Erro ao listar configurações de tiers:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao listar configurações de tiers",
      });
    }
  }),

  /**
   * Atualizar configuração de tier (admin)
   */
  updateTierConfig: adminProcedure
    .input(z.object({
      tier: z.enum(['silver', 'gold', 'platinum', 'diamond']),
      minVolume: z.number().optional(),
      commissionRate: z.number().min(0).max(1).optional(),
      maxReferrals: z.number().nullable().optional(),
      benefits: z.array(z.string()).optional(),
      features: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const updateData: any = { updatedAt: new Date() };
        if (input.minVolume !== undefined) updateData.minVolume = input.minVolume;
        if (input.commissionRate !== undefined) updateData.commissionRate = input.commissionRate;
        if (input.maxReferrals !== undefined) updateData.maxReferrals = input.maxReferrals;
        if (input.benefits !== undefined) updateData.benefits = input.benefits;
        if (input.features !== undefined) updateData.features = input.features;

        const [updated] = await db.update(partnerTierConfigs)
          .set(updateData)
          .where(eq(partnerTierConfigs.tier, input.tier))
          .returning();

        if (!updated) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Configuração de tier não encontrada",
          });
        }

        return updated;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("Erro ao atualizar configuração de tier:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao atualizar configuração de tier",
        });
      }
    }),
});

export default partnersRouter;