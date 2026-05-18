/**
 * XP Router - Rotas para XP e Progressão de Carreiras
 */

import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../trpc/trpc';
import {
  getXPDetails,
  getAllCareerLevels,
  seedCareerLevels,
  getLeaderboard,
  addXP,
} from '../services/xpService';

export const xpRouter = router({
  /**
   * Obter detalhes de XP do afiliado logado
   */
  getMyXP: protectedProcedure.query(async ({ ctx }) => {
    const affiliate = await ctx.db.query.affiliates.findFirst({
      where: (affiliates, { eq }) => eq(affiliates.userId, ctx.user.id),
    });

    if (!affiliate) {
      throw new Error('Afiliado não encontrado');
    }

    return getXPDetails(affiliate.id);
  }),

  /**
   * Obter detalhes de XP de um afiliado específico
   */
  getAffiliateXP: protectedProcedure
    .input(z.object({ affiliateId: z.number() }))
    .query(async ({ input }) => {
      return getXPDetails(input.affiliateId);
    }),

  /**
   * Obter todos os níveis de carreira
   */
  getCareerLevels: publicProcedure.query(async () => {
    return getAllCareerLevels();
  }),

  /**
   * Obter leaderboard
   */
  getLeaderboard: publicProcedure
    .input(z.object({ limit: z.number().default(10) }))
    .query(async ({ input }) => {
      return getLeaderboard(input.limit);
    }),

  /**
   * Inicializar níveis de carreira (admin)
   */
  seedLevels: protectedProcedure.mutation(async ({ ctx }) => {
    // Verificar se é admin
    if (ctx.user.role !== 'admin') {
      throw new Error('Apenas administradores podem inicializar níveis');
    }
    return seedCareerLevels();
  }),

  /**
   * Adicionar XP manualmente (admin)
   */
  addXPManual: protectedProcedure
    .input(z.object({
      affiliateId: z.number(),
      amount: z.number(),
      source: z.enum(['sale', 'commission', 'bonus', 'network', 'challenge', 'penalty']),
      description: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Apenas administradores podem adicionar XP manualmente');
      }
      return addXP(input.affiliateId, input.amount, input.source, input.description);
    }),

  /**
   * Obter histórico de transações de XP
   */
  getXPHistory: protectedProcedure
    .input(z.object({ affiliateId: z.number(), limit: z.number().default(50) }))
    .query(async ({ input, ctx }) => {
      // Verificar se o usuário é admin ou o próprio afiliado
      if (ctx.user.role !== 'admin' && ctx.user.id !== input.affiliateId) {
        throw new Error('Acesso não autorizado');
      }

      const transactions = await ctx.db.query.xpTransactions.findMany({
        where: (xpTransactions, { eq }) => eq(xpTransactions.affiliateId, input.affiliateId),
        orderBy: (xpTransactions, { desc }) => [desc(xpTransactions.createdAt)],
        limit: input.limit,
      });

      return transactions;
    }),
});

export type XPRouter = typeof xpRouter;