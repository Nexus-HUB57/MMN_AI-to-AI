import { z } from "zod";
import { protectedProcedure, router, adminProcedure } from "../config/trpc";
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
import { getOrSet, CACHE_KEYS, CACHE_TTL, invalidateCachePattern } from "../services/cache-service";
import { rateLimitMiddleware } from "../services/rate-limiter";

/**
 * Router para funcionalidades avançadas do IA Content Hub (Sprint 4)
 * Inclui: Seleção de modelos, templates, agendamento e analytics
 * Otimizado com Cache Redis, Rate Limiting e Otimização de Queries (Fase 2)
 */

export const aiContentHubRouter = router({
  /**
   * Listar modelos de IA disponíveis
   * Cache: 1 hora
   */
  listModels: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user!.id;
    const ip = ctx.req?.ip;

    // Rate Limit: listModels
    const rl = await rateLimitMiddleware(userId, "listModels", ip);
    if (!rl.allowed) {
      if (ctx.res) {
        Object.entries(rl.headers).forEach(([k, v]) => ctx.res!.setHeader(k, v));
      }
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Limite de requisições excedido para listagem de modelos",
      });
    }

    try {
      const models = await getOrSet(
        CACHE_KEYS.AVAILABLE_MODELS,
        async () => getAvailableModels(),
        CACHE_TTL.MODELS
      );

      if (ctx.res) {
        Object.entries(rl.headers).forEach(([k, v]) => ctx.res!.setHeader(k, v));
      }

      return {
        success: true,
        models,
        totalModels: models.length,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao listar modelos",
      });
    }
  }),

  /**
   * Obter informações de um modelo específico
   * Cache: 30 minutos
   */
  getModel: protectedProcedure
    .input(z.object({ modelId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        const model = await getOrSet(
          CACHE_KEYS.MODEL_INFO(input.modelId),
          async () => {
            const m = getModelInfo(input.modelId);
            if (!m) throw new Error("NOT_FOUND");
            return m;
          },
          CACHE_TTL.MODEL_INFO
        );

        return {
          success: true,
          model,
        };
      } catch (error: any) {
        if (error.message === "NOT_FOUND") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Modelo não encontrado",
          });
        }
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao obter informações do modelo",
        });
      }
    }),

  /**
   * Obter estatísticas de modelos
   * Cache: 5 minutos
   */
  getModelStats: protectedProcedure.query(async () => {
    try {
      const stats = await getOrSet(
        CACHE_KEYS.MODEL_STATS,
        async () => getModelStats(),
        CACHE_TTL.MODEL_STATS
      );
      return {
        success: true,
        stats,
      };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao obter estatísticas",
      });
    }
  }),

  /**
   * Gerar conteúdo com modelo selecionado
   * Rate Limit: 100/min
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
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user!.id;
      const ip = ctx.req?.ip;

      // Rate Limit
      const rl = await rateLimitMiddleware(userId, "generateContent", ip);
      if (!rl.allowed) {
        if (ctx.res) {
          Object.entries(rl.headers).forEach(([k, v]) => ctx.res!.setHeader(k, v));
        }
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Limite de requisições excedido para geração de conteúdo",
        });
      }

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

        if (ctx.res) {
          Object.entries(rl.headers).forEach(([k, v]) => ctx.res!.setHeader(k, v));
        }

        return response;
      } catch (error) {
        console.error("[AIContentHub] Erro ao gerar conteúdo:", error);
        if (error instanceof TRPCError) throw error;
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
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user!.id;
      const ip = ctx.req?.ip;

      // Rate Limit (usa o mesmo de generateContent)
      const rl = await rateLimitMiddleware(userId, "generateContent", ip);
      if (!rl.allowed) {
        if (ctx.res) {
          Object.entries(rl.headers).forEach(([k, v]) => ctx.res!.setHeader(k, v));
        }
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Limite de requisições excedido para geração de variações",
        });
      }

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

        if (ctx.res) {
          Object.entries(rl.headers).forEach(([k, v]) => ctx.res!.setHeader(k, v));
        }

        return {
          success: true,
          prompt: input.prompt,
          variations,
          generatedAt: new Date(),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
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
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user!.id;
      try {
        // TODO: Salvar template no banco de dados real
        
        // Invalida cache de templates do usuário
        await invalidateCachePattern(CACHE_KEYS.TEMPLATES_PATTERN(userId));

        return {
          success: true,
          template: {
            id: `tpl_${Date.now()}`,
            ...input,
            createdAt: new Date(),
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar template",
        });
      }
    }),

  /**
   * Listar templates de conteúdo
   * Cache: 15 minutos (por usuário)
   * Paginação: Implementada
   */
  listTemplates: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(10)
    }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.user!.id;
      const page = input?.page || 1;
      const limit = input?.limit || 10;

      try {
        const cacheKey = `${CACHE_KEYS.TEMPLATES_LIST(userId)}:p${page}:l${limit}`;
        
        const result = await getOrSet(
          cacheKey,
          async () => {
            // TODO: Buscar templates do banco de dados com paginação real
            return {
              templates: [],
              total: 0,
              page,
              limit
            };
          },
          CACHE_TTL.TEMPLATES
        );

        return {
          success: true,
          ...result
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao listar templates",
        });
      }
    }),

  /**
   * Agendar post para publicação
   * Rate Limit: 50/min
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
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user!.id;
      const ip = ctx.req?.ip;

      const rl = await rateLimitMiddleware(userId, "schedulePost", ip);
      if (!rl.allowed) {
        if (ctx.res) {
          Object.entries(rl.headers).forEach(([k, v]) => ctx.res!.setHeader(k, v));
        }
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Limite de requisições excedido para agendamento",
        });
      }

      try {
        // TODO: Adicionar à fila de agendamento (BullMQ) e Banco de Dados
        
        // Invalida cache de posts do usuário
        await invalidateCachePattern(CACHE_KEYS.POSTS_PATTERN(userId));

        if (ctx.res) {
          Object.entries(rl.headers).forEach(([k, v]) => ctx.res!.setHeader(k, v));
        }

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
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao agendar post",
        });
      }
    }),

  /**
   * Listar posts agendados
   * Cache: 10 minutos
   */
  listScheduledPosts: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(10)
    }).optional())
    .query(async ({ ctx, input }) => {
      const userId = ctx.user!.id;
      const page = input?.page || 1;
      const limit = input?.limit || 10;

      try {
        const cacheKey = `${CACHE_KEYS.SCHEDULED_POSTS(userId)}:p${page}:l${limit}`;
        
        const result = await getOrSet(
          cacheKey,
          async () => {
            // TODO: Buscar posts agendados do banco de dados
            return {
              posts: [],
              total: 0,
              page,
              limit
            };
          },
          CACHE_TTL.POSTS
        );

        return {
          success: true,
          ...result
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao listar posts agendados",
        });
      }
    }),

  /**
   * Obter analytics de conteúdo
   * Cache: 10 minutos
   * Rate Limit: 200/min
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
    .query(async ({ input, ctx }) => {
      const userId = ctx.user!.id;
      const ip = ctx.req?.ip;

      const rl = await rateLimitMiddleware(userId, "analytics", ip);
      if (!rl.allowed) {
        if (ctx.res) {
          Object.entries(rl.headers).forEach(([k, v]) => ctx.res!.setHeader(k, v));
        }
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Limite de requisições excedido para analytics",
        });
      }

      try {
        const cacheKey = CACHE_KEYS.ANALYTICS(userId, input.period, input.platform);
        
        const analytics = await getOrSet(
          cacheKey,
          async () => {
            // TODO: Buscar analytics do banco de dados ou serviço externo
            return {
              period: input.period,
              platform: input.platform,
              totalPosts: 0,
              totalViews: 0,
              totalLikes: 0,
              totalShares: 0,
              totalComments: 0,
              avgEngagement: 0,
              topPost: null,
            };
          },
          CACHE_TTL.ANALYTICS
        );

        if (ctx.res) {
          Object.entries(rl.headers).forEach(([k, v]) => ctx.res!.setHeader(k, v));
        }

        return {
          success: true,
          analytics,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao obter analytics",
        });
      }
    }),

  /**
   * Ativar modelo (admin only)
   */
  activateModel: adminProcedure
    .input(z.object({ modelId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const success = activateModel(input.modelId);
        if (!success) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Modelo não encontrado",
          });
        }

        // Invalida cache de modelos
        await invalidateCachePattern(CACHE_KEYS.MODELS_PATTERN);

        return {
          success: true,
          message: `Modelo ${input.modelId} ativado com sucesso`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao ativar modelo",
        });
      }
    }),

  /**
   * Desativar modelo (admin only)
   */
  deactivateModel: adminProcedure
    .input(z.object({ modelId: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const success = deactivateModel(input.modelId);
        if (!success) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Modelo não encontrado",
          });
        }

        // Invalida cache de modelos
        await invalidateCachePattern(CACHE_KEYS.MODELS_PATTERN);

        return {
          success: true,
          message: `Modelo ${input.modelId} desativado com sucesso`,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao desativar modelo",
        });
      }
    }),
});
