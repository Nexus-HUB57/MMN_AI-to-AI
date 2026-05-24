/**
 * AI Sync Router
 *
 * Router tRPC para sincronização de Agentes IA com Skills e Models.
 * Permite gestão centralizada da sincronização entre agentes e capacidades.
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../config/trpc";
import { agentSyncService, type AgentSyncProfile } from "../services/agentSyncService";
import { getAgentByUserId } from "./db";

export const aiSyncRouter = router({
  /**
   * Sincroniza as skills do agente atual
   */
  syncMyAgent: protectedProcedure.mutation(async ({ ctx }) => {
    const agent = await getAgentByUserId(ctx.user.id);
    if (!agent) {
      throw new Error("Agent not found for current user");
    }
    return agentSyncService.syncAgentSkills(agent.id);
  }),

  /**
   * Obtém o perfil de sincronização do agente atual
   */
  getMySyncProfile: protectedProcedure.query(async ({ ctx }) => {
    const agent = await getAgentByUserId(ctx.user.id);
    if (!agent) {
      return null;
    }
    return agentSyncService.getAgentSyncProfile(agent.id);
  }),

  /**
   * Sincroniza um agente específico (admin)
   */
  syncAgent: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .mutation(async ({ input }) => {
      return agentSyncService.syncAgentSkills(input.agentId);
    }),

  /**
   * Obtém o perfil de sincronização de um agente específico (admin)
   */
  getAgentSyncProfile: protectedProcedure
    .input(z.object({ agentId: z.number() }))
    .query(async ({ input }) => {
      return agentSyncService.getAgentSyncProfile(input.agentId);
    }),

  /**
   * Sincroniza todos os agentes ativos (admin - agendado)
   */
  syncAllAgents: protectedProcedure.mutation(async () => {
    return agentSyncService.syncAllAgents();
  }),

  /**
   * Verifica e atualiza skills expiradas (admin - agendado)
   */
  checkExpiredSkills: protectedProcedure.mutation(async () => {
    const expired = await agentSyncService.checkExpiredSkills();
    return { expiredSkills: expired };
  }),

  /**
   * Lista modelos recomendados por categoria
   */
  getRecommendedModels: publicProcedure
    .input(
      z.object({
        categories: z.array(z.string()).optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const MODEL_RECOMMENDATIONS: Record<string, string[]> = {
        copywriting: ["gemini-2.0-flash", "gpt-4o-mini"],
        social_media: ["gemini-2.0-flash", "gpt-4o-mini"],
        analytics: ["gemini-pro", "gpt-4o"],
        ads: ["gemini-2.0-flash", "gpt-4o"],
        ecommerce: ["gemini-2.0-flash", "gpt-4o-mini"],
        automation: ["gemini-pro", "gpt-4o"],
        sales: ["gemini-pro", "gpt-4o"],
        seo: ["gemini-2.0-flash", "gpt-4o-mini"],
        crm: ["gemini-2.0-flash", "gpt-4o-mini"],
        mmn: ["gemini-pro", "gpt-4o"],
      };

      if (input?.categories) {
        return input.categories.map((cat) => ({
          category: cat,
          models: MODEL_RECOMMENDATIONS[cat] || ["gemini-2.0-flash"],
        }));
      }

      return Object.entries(MODEL_RECOMMENDATIONS).map(([category, models]) => ({
        category,
        models,
      }));
    }),

  /**
   * Obtém capabilities por nível de skill
   */
  getLevelCapabilities: publicProcedure
    .input(z.object({ level: z.enum(["basic", "intermediate", "advanced"]) }))
    .query(async ({ input }) => {
      const LEVEL_CAPABILITIES: Record<string, string[]> = {
        basic: ["text_generation", "basic_analytics", "scheduling"],
        intermediate: ["text_generation", "image_generation", "analytics", "automation", "scheduling"],
        advanced: ["text_generation", "image_generation", "video_generation", "analytics", "automation", "scheduling", "advanced_seo", "multi_channel"],
      };

      return {
        level: input.level,
        capabilities: LEVEL_CAPABILITIES[input.level] || [],
      };
    }),
});