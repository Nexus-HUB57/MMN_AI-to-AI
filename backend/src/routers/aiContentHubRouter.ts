import { z } from "zod";
import { protectedProcedure, router } from "../config/trpc";
import { TRPCError } from "@trpc/server";
import {
  generateContent,
  getAvailableModels,
  getModelInfo,
  activateModel,
  deactivateModel,
  getModelStats,
  ContentGenerationRequest,
} from "../services/genkit-integration";

/**
 * Router para funcionalidades avançadas do IA Content Hub (Sprint 4)
 * Inclui: Seleção de modelos, templates, agendamento e analytics
 */

export const aiContentHubRouter = router({
  /**
   * Listar modelos de IA disponíveis
   */
  listModels: protectedProcedure.query(async () => {
    try {
      const models = getAvailableModels();
      return {
        success: true,
        models,
        totalModels: models.length,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao listar modelos",
      });
    }
  }),

  /**
   * Obter informações de um modelo específico
   */
  getModel: protectedProcedure
    .input(z.object({ modelId: z.string() }))
    .query(async ({ input }) => {
      try {
        const model = getModelInfo(input.modelId);
        if (!model) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Modelo não encontrado",
          });
        }
        return {
          success: true,
          model,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao obter informações do modelo",
        });
      }
    }),

  /**
   * Obter estatísticas de modelos
   */
  getModelStats: protectedProcedure.query(async () => {
    try {
      const stats = getModelStats();
      return {
        success: true,
        stats,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao obter estatísticas",
      });
    }
  }),

  /**
   * Gerar conteúdo com modelo selecionado
   */
  generateContent: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(10),
        modelId: z.string(),
        platform: z
          .enum(["instagram", "tiktok", "twitter", "linkedin", "blog", "whatsapp"])
          .optional(),
        tone: z
          .enum(["professional", "casual", "persuasive", "humorous"])
          .optional(),
        maxLength: z.number().optional(),
        temperature: z.number().min(0).max(1).optional(),
        includeHashtags: z.boolean().optional(),
        includeEmojis: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const request: ContentGenerationRequest = {
          prompt: input.prompt,
          modelId: input.modelId,
          platform: input.platform,
          tone: input.tone,
          maxLength: input.maxLength,
          temperature: input.temperature,
          includeHashtags: input.includeHashtags,
          includeEmojis: input.includeEmojis,
        };

        const response = await generateContent(request);
        return response;
      } catch (error) {
        console.error("[AIContentHub] Erro ao gerar conteúdo:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Erro ao gerar conteúdo",
        });
      }
    }),

  /**
   * Gerar múltiplas variações de conteúdo
   */
  generateVariations: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(10),
        modelId: z.string(),
        count: z.number().min(2).max(5).default(3),
        platform: z
          .enum(["instagram", "tiktok", "twitter", "linkedin", "blog", "whatsapp"])
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const variations = [];

        for (let i = 0; i < input.count; i++) {
          const tones: Array<"professional" | "casual" | "persuasive" | "humorous"> = [
            "professional",
            "casual",
            "persuasive",
            "humorous",
          ];
          const tone = tones[i % tones.length];

          const response = await generateContent({
            prompt: input.prompt,
            modelId: input.modelId,
            platform: input.platform,
            tone,
          });

          variations.push({
            variation: i + 1,
            tone,
            content: response.content,
            modelUsed: response.modelUsed,
          });
        }

        return {
          success: true,
          prompt: input.prompt,
          variations,
          generatedAt: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao gerar variações",
        });
      }
    }),

  /**
   * Criar template de conteúdo
   */
  createTemplate: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        category: z.string(),
        content: z.string(),
        variables: z.array(z.string()).optional(),
        platform: z
          .enum(["instagram", "tiktok", "twitter", "linkedin", "blog", "whatsapp"])
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // TODO: Salvar template no banco de dados
        return {
          success: true,
          template: {
            id: `tpl_${Date.now()}`,
            ...input,
            createdAt: new Date(),
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar template",
        });
      }
    }),

  /**
   * Listar templates de conteúdo
   */
  listTemplates: protectedProcedure.query(async () => {
    try {
      // TODO: Buscar templates do banco de dados
      return {
        success: true,
        templates: [],
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao listar templates",
      });
    }
  }),

  /**
   * Agendar post para publicação
   */
  schedulePost: protectedProcedure
    .input(
      z.object({
        content: z.string(),
        platforms: z.array(
          z.enum(["instagram", "tiktok", "twitter", "linkedin", "blog", "whatsapp"])
        ),
        scheduledFor: z.date(),
        title: z.string().optional(),
        mediaUrls: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // TODO: Adicionar à fila de agendamento (BullMQ)
        return {
          success: true,
          post: {
            id: `post_${Date.now()}`,
            ...input,
            status: "scheduled",
            createdAt: new Date(),
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao agendar post",
        });
      }
    }),

  /**
   * Listar posts agendados
   */
  listScheduledPosts: protectedProcedure.query(async () => {
    try {
      // TODO: Buscar posts agendados do banco de dados
      return {
        success: true,
        posts: [],
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao listar posts agendados",
      });
    }
  }),

  /**
   * Obter analytics de conteúdo
   */
  getContentAnalytics: protectedProcedure
    .input(
      z.object({
        period: z.enum(["day", "week", "month"]).optional().default("week"),
        platform: z
          .enum(["instagram", "tiktok", "twitter", "linkedin", "blog", "whatsapp"])
          .optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        // TODO: Buscar analytics do banco de dados ou serviço externo
        return {
          success: true,
          analytics: {
            period: input.period,
            platform: input.platform,
            totalPosts: 0,
            totalViews: 0,
            totalLikes: 0,
            totalShares: 0,
            totalComments: 0,
            avgEngagement: 0,
            topPost: null,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao obter analytics",
        });
      }
    }),

  /**
   * Ativar modelo (admin only)
   */
  activateModel: protectedProcedure
    .input(z.object({ modelId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // TODO: Verificar se é admin
        const success = activateModel(input.modelId);
        if (!success) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Modelo não encontrado",
          });
        }
        return {
          success: true,
          message: `Modelo ${input.modelId} ativado com sucesso`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao ativar modelo",
        });
      }
    }),

  /**
   * Desativar modelo (admin only)
   */
  deactivateModel: protectedProcedure
    .input(z.object({ modelId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // TODO: Verificar se é admin
        const success = deactivateModel(input.modelId);
        if (!success) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Modelo não encontrado",
          });
        }
        return {
          success: true,
          message: `Modelo ${input.modelId} desativado com sucesso`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao desativar modelo",
        });
      }
    }),
});
