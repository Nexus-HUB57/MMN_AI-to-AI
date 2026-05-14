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
import {
  getOrSet,
  CACHE_KEYS,
  CACHE_TTL,
  invalidateCachePattern,
} from "../services/cache-service";
import {
  rateLimitMiddleware,
  RATE_LIMIT_CONFIG,
} from "../services/rate-limiter";
import mediaService from "../services/media-service";
import sentimentService from "../services/sentiment-analysis-service";

/**
 * Router para funcionalidades avançadas do IA Content Hub (Sprint 4)
 * Inclui: Seleção de modelos, templates, agendamento e analytics
 */

export const aiContentHubRouter = router({
  /**
   * Listar modelos de IA disponíveis
   */
  listModels: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Rate Limiting
      const rateLimit = await rateLimitMiddleware(
        ctx.user?.id || 0,
        "listModels"
      );
      if (!rateLimit.allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Limite de requisições excedido",
        });
      }

      // Cache
      return await getOrSet(
        CACHE_KEYS.AVAILABLE_MODELS,
        async () => {
          const models = getAvailableModels();
          return {
            success: true,
            models,
            totalModels: models.length,
          };
        },
        CACHE_TTL.MODELS
      );
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
   */
  getModel: protectedProcedure
    .input(z.object({ modelId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        // Rate Limiting
        const rateLimit = await rateLimitMiddleware(
          ctx.user?.id || 0,
          "listModels" // Usando o mesmo config de listModels
        );
        if (!rateLimit.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Limite de requisições excedido",
          });
        }

        // Cache
        return await getOrSet(
          CACHE_KEYS.MODEL_INFO(input.modelId),
          async () => {
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
          },
          CACHE_TTL.MODEL_INFO
        );
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao obter informações do modelo",
        });
      }
    }),

  /**
   * Obter estatísticas de modelos
   */
  getModelStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      // Rate Limiting
      const rateLimit = await rateLimitMiddleware(
        ctx.user?.id || 0,
        "listModels"
      );
      if (!rateLimit.allowed) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Limite de requisições excedido",
        });
      }

      // Cache
      return await getOrSet(
        CACHE_KEYS.MODEL_STATS,
        async () => {
          const stats = getModelStats();
          return {
            success: true,
            stats,
          };
        },
        CACHE_TTL.MODEL_STATS
      );
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
      try {
        // Rate Limiting
        const rateLimit = await rateLimitMiddleware(
          ctx.user?.id || 0,
          "generateContent"
        );
        if (!rateLimit.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Limite de requisições excedido",
          });
        }

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

        // Análise de sentimento automática para o conteúdo gerado
        const sentiment = await sentimentService.analyzeSentiment({
          content: response.content,
        });

        return {
          ...response,
          sentiment,
        };
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
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar template",
        });
      }
    }),

  /**
   * Listar templates de conteúdo com paginação
   */
  listTemplates: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
        category: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        // TODO: Buscar templates do banco de dados com paginação
        return {
          success: true,
          templates: [],
          pagination: {
            limit: input.limit,
            offset: input.offset,
            total: 0,
          },
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
      try {
        // Rate Limiting
        const rateLimit = await rateLimitMiddleware(
          ctx.user?.id || 0,
          "schedulePost"
        );
        if (!rateLimit.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Limite de requisições excedido",
          });
        }

        // TODO: Adicionar à fila de agendamento (BullMQ)
        // Invalidação de cache após agendamento
        await invalidateCachePattern(CACHE_KEYS.POSTS_PATTERN(ctx.user?.id || 0));

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
   * Listar posts agendados com paginação
   */
  listScheduledPosts: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
        status: z
          .enum(["scheduled", "published", "failed", "cancelled"])
          .optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        // TODO: Buscar posts agendados do banco de dados com paginação
        return {
          success: true,
          posts: [],
          pagination: {
            limit: input.limit,
            offset: input.offset,
            total: 0,
          },
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
      try {
        // Rate Limiting
        const rateLimit = await rateLimitMiddleware(
          ctx.user?.id || 0,
          "analytics"
        );
        if (!rateLimit.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Limite de requisições excedido",
          });
        }

        // Cache
        return await getOrSet(
          CACHE_KEYS.ANALYTICS(
            ctx.user?.id || 0,
            input.period,
            input.platform
          ),
          async () => {
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
          },
          CACHE_TTL.ANALYTICS
        );
      } catch (error) {
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
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao obter analytics",
        });
      }
    }),

  /**
   * Upload de mídia para o Content Hub
   */
  uploadMedia: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileSize: z.number(),
        mediaType: z.enum(["image", "video"]),
        contentType: z.string(),
        tempFilePath: z.string(), // Em produção, isso viria de um middleware de upload
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Rate Limiting
        const rateLimit = await rateLimitMiddleware(
          ctx.user?.id || 0,
          "uploadMedia"
        );
        if (!rateLimit.allowed) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Limite de requisições excedido",
          });
        }

        // Validar arquivo
        const validation = await mediaService.validateMediaFile(
          input.tempFilePath,
          input.fileSize,
          input.mediaType === "image"
        );

        if (!validation.valid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: validation.error,
          });
        }

        // Gerar chave S3
        const s3Key = mediaService.generateS3Key(
          ctx.user?.id || 0,
          input.mediaType,
          input.fileName
        );

        // Upload para S3
        const url = await mediaService.uploadToS3(
          input.tempFilePath,
          s3Key,
          input.contentType
        );

        return {
          success: true,
          media: {
            key: s3Key,
            url,
            type: input.mediaType,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao realizar upload de mídia",
        });
      }
    }),

  /**
   * Listar mídias do usuário
   */
  listMedia: protectedProcedure
    .input(z.object({ mediaType: z.enum(["image", "video"]) }))
    .query(async ({ input, ctx }) => {
      try {
        const mediaList = await mediaService.listUserMedia(
          ctx.user?.id || 0,
          input.mediaType
        );
        return {
          success: true,
          media: mediaList,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao listar mídias",
        });
      }
    }),

  /**
   * Analisar sentimento de um conteúdo existente
   */
  analyzeSentiment: protectedProcedure
    .input(z.object({ content: z.string() }))
    .query(async ({ input }) => {
      try {
        const sentiment = await sentimentService.analyzeSentiment({
          content: input.content,
        });
        return {
          success: true,
          sentiment,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao analisar sentimento",
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

        // Invalidação de cache
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

        // Invalidação de cache
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
  
  /**
   * Listar mídia do usuário
   */
  listMedia: protectedProcedure
    .input(z.object({ 
      mediaType: z.enum(["image", "video"]) 
    }))
    .query(async ({ input, ctx }) => {
      try {
        const media = await mediaService.listUserMedia(
          ctx.user?.id || 0,
          input.mediaType
        );
        return {
          success: true,
          media,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao listar mídia",
        });
      }
    }),

  /**
   * Deletar mídia
   */
  deleteMedia: protectedProcedure
    .input(z.object({ 
      key: z.string() 
    }))
    .mutation(async ({ input }) => {
      try {
        const success = await mediaService.deleteFromS3(input.key);
        return {
          success,
          message: success ? "Mídia deletada com sucesso" : "Erro ao deletar mídia",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao deletar mídia",
        });
      }
    }),

  /**
   * Gerar URL para upload (Presigned URL)
   */
  getUploadUrl: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      fileType: z.string(),
      mediaType: z.enum(["image", "video"])
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const key = mediaService.generateS3Key(
          ctx.user?.id || 0,
          input.mediaType,
          input.fileName
        );
        
        // Nota: Em um cenário real, usaríamos s3.getSignedUrl('putObject', ...)
        // Aqui estamos simulando a integração com o mediaService
        const uploadUrl = await mediaService.generatePresignedUrl(key, 3600);
        
        return {
          success: true,
          uploadUrl,
          key,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao gerar URL de upload",
        });
      }
    }),

  /**
   * Gerar URL de autorização OAuth para redes sociais
   */
  getSocialAuthUrl: protectedProcedure
    .input(z.object({ platform: z.enum(["instagram", "linkedin", "twitter", "tiktok"]) }))
    .query(async ({ input }) => {
      const mockUrls = {
        instagram: "https://api.instagram.com/oauth/authorize",
        linkedin: "https://www.linkedin.com/oauth/v2/authorization",
        twitter: "https://twitter.com/i/oauth2/authorize",
        tiktok: "https://www.tiktok.com/auth/authorize/",
      };

      return {
        success: true,
        url: `${mockUrls[input.platform]}?client_id=...&redirect_uri=...`,
      };
    }),

  /**
   * Conectar conta de rede social (Callback OAuth)
   */
  connectSocialAccount: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["instagram", "linkedin", "twitter", "tiktok"]),
        code: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // TODO: Trocar código por token e salvar no banco
        return {
          success: true,
          message: `Conta do ${input.platform} conectada com sucesso`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao conectar conta social",
        });
      }
    }),
});
