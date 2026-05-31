import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getAgentByUserId, createAgent, updateAgent as updateAgentDb } from "./db";
import { getDb } from "../../../database/schemas/db";
import {
  generatedImages,
  recommendedProducts,
  agentSkillsRuntime,
  agentEvolutionHistory,
  generatedContent,
  scheduledPosts,
} from "../../../database/schemas";

/** Garante que o agente exista e devolve seu id. Usa cache leve por requisição. */
async function ensureAgent(userId: number): Promise<number> {
  const existing = await getAgentByUserId(userId);
  if (existing) return existing.id;
  const created = await createAgent({
    userId,
    name: `Agent - User ${userId}`,
    status: "learning",
    contentStrategy: JSON.stringify({
      platforms: ["instagram", "facebook", "whatsapp"],
      postingFrequency: "daily",
      tone: "professional",
      targetAudience: "general",
    }),
    performanceScore: 0,
  });
  return created.id;
}

/**
 * Agents Router
 * Handles AI agent initialization, configuration, and state management
 */

export const agentsRouter = router({
  /**
   * Initialize agent for current user (called on first login/signup)
   */
  initialize: protectedProcedure
    .mutation(async ({ ctx }) => {
      try {
        // Check if agent already exists
        const existingAgent = await getAgentByUserId(ctx.user.id);
        if (existingAgent) {
          return {
            success: true,
            agent: existingAgent,
            created: false,
          };
        }

        // Create new agent with default configuration
        const defaultContentStrategy = {
          platforms: ["instagram", "facebook", "whatsapp"],
          postingFrequency: "daily",
          tone: "professional",
          targetAudience: "general",
        };

        const newAgent = await createAgent({
          userId: ctx.user.id,
          name: `Agent - User ${ctx.user.id}`,
          status: "learning",
          contentStrategy: JSON.stringify(defaultContentStrategy),
          performanceScore: 0,
        });

        return {
          success: true,
          agent: newAgent,
          created: true,
        };
      } catch (error) {
        console.error("[agentsRouter] Failed to initialize agent:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to initialize agent",
        });
      }
    }),

  /**
   * Get current user's agent
   */
  get: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const agent = await getAgentByUserId(ctx.user.id);
        
        if (!agent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agent not found for this user",
          });
        }

        // Parse contentStrategy if it's a JSON string
        const parsedAgent = {
          ...agent,
          contentStrategy: agent.contentStrategy ? JSON.parse(agent.contentStrategy) : null,
        };

        return parsedAgent;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[agentsRouter] Failed to get agent:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve agent",
        });
      }
    }),

  /**
   * Update agent configuration
   */
  configure: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        status: z.enum(["learning", "active", "paused", "inactive"]).optional(),
        contentStrategy: z.record(z.any()).optional(),
        performanceScore: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const agent = await getAgentByUserId(ctx.user.id);
        
        if (!agent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agent not found for this user",
          });
        }

        // Prepare update data with proper typing
        const updateData: { name?: string; status?: "learning" | "active" | "paused" | "inactive"; contentStrategy?: string | null; performanceScore?: number } = {};
        
        if (input.name !== undefined) {
          updateData.name = input.name;
        }
        
        if (input.status !== undefined) {
          updateData.status = input.status;
        }
        
        if (input.contentStrategy !== undefined) {
          updateData.contentStrategy = JSON.stringify(input.contentStrategy);
        }
        
        if (input.performanceScore !== undefined) {
          updateData.performanceScore = input.performanceScore;
        }

        const updatedAgent = await updateAgentDb(agent.id, updateData as any);

        if (!updatedAgent) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update agent",
          });
        }

        // Parse contentStrategy for response
        const parsedAgent = {
          ...updatedAgent,
          contentStrategy: updatedAgent.contentStrategy ? JSON.parse(updatedAgent.contentStrategy) : null,
        };

        return {
          success: true,
          agent: parsedAgent,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[agentsRouter] Failed to update agent:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update agent",
        });
      }
    }),

  /**
   * Get agent state with full details
   */
  getState: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const agent = await getAgentByUserId(ctx.user.id);
        
        if (!agent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agent not found for this user",
          });
        }

        const parsedAgent = {
          ...agent,
          contentStrategy: agent.contentStrategy ? JSON.parse(agent.contentStrategy) : null,
        };

        return {
          id: parsedAgent.id,
          userId: parsedAgent.userId,
          name: parsedAgent.name,
          status: parsedAgent.status,
          performanceScore: parsedAgent.performanceScore,
          contentStrategy: parsedAgent.contentStrategy,
          createdAt: parsedAgent.createdAt,
          updatedAt: parsedAgent.updatedAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[agentsRouter] Failed to get agent state:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to retrieve agent state",
        });
      }
    }),

  /**
   * Update agent state (performance score and content strategy)
   */
  updateState: protectedProcedure
    .input(
      z.object({
        performanceScore: z.number().optional(),
        contentStrategy: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const agent = await getAgentByUserId(ctx.user.id);
        
        if (!agent) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Agent not found for this user",
          });
        }

        const updateData: { name?: string; status?: "learning" | "active" | "paused" | "inactive"; contentStrategy?: string | null; performanceScore?: number } = {};
        
        if (input.performanceScore !== undefined) {
          updateData.performanceScore = input.performanceScore;
        }
        
        if (input.contentStrategy !== undefined) {
          updateData.contentStrategy = JSON.stringify(input.contentStrategy);
        }

        const updatedAgent = await updateAgentDb(agent.id, updateData as any);

        if (!updatedAgent) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update agent state",
          });
        }

        const parsedAgent = {
          ...updatedAgent,
          contentStrategy: updatedAgent.contentStrategy ? JSON.parse(updatedAgent.contentStrategy) : null,
        };

        return {
          success: true,
          agent: parsedAgent,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        console.error("[agentsRouter] Failed to update agent state:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update agent state",
        });
      }
    }),

  // ========== IMAGENS GERADAS ==========
  getGeneratedImages: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];
      const agentId = await ensureAgent(ctx.user.id);
      const rows = await db
        .select()
        .from(generatedImages)
        .where(eq(generatedImages.agentId, agentId))
        .orderBy(desc(generatedImages.createdAt))
        .limit(50);
      return rows;
    } catch (error) {
      console.error("[agentsRouter] getGeneratedImages failed:", error);
      return [];
    }
  }),

  createGeneratedImage: protectedProcedure
    .input(z.object({ prompt: z.string().min(1), imageUrl: z.string().url(), storageKey: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
      const agentId = await ensureAgent(ctx.user.id);
      const [row] = await db
        .insert(generatedImages)
        .values({ agentId, prompt: input.prompt, imageUrl: input.imageUrl, storageKey: input.storageKey ?? null })
        .returning();
      return { success: true, image: row };
    }),

  // ========== SKILLS RUNTIME ==========
  getAgentSkills: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];
      const agentId = await ensureAgent(ctx.user.id);
      return await db
        .select()
        .from(agentSkillsRuntime)
        .where(eq(agentSkillsRuntime.agentId, agentId))
        .orderBy(desc(agentSkillsRuntime.createdAt));
    } catch (error) {
      console.error("[agentsRouter] getAgentSkills failed:", error);
      return [];
    }
  }),

  createAgentSkill: protectedProcedure
    .input(
      z.object({
        skillName: z.string().min(1),
        description: z.string().optional(),
        cost: z.coerce.number().nonnegative().optional(),
        level: z.coerce.number().int().min(0).max(100).default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
      const agentId = await ensureAgent(ctx.user.id);
      const [row] = await db
        .insert(agentSkillsRuntime)
        .values({
          agentId,
          skillName: input.skillName,
          description: input.description ?? null,
          cost: Math.round(input.cost ?? 0),
          proficiency: input.level,
          status: "locked",
        })
        .returning();
      await db.insert(agentEvolutionHistory).values({
        agentId,
        eventType: "skill_created",
        description: `Skill criada: ${input.skillName}`,
      });
      return { success: true, skill: row };
    }),

  updateAgentSkill: protectedProcedure
    .input(
      z.object({
        id: z.coerce.number().int().positive().optional(),
        skillId: z.coerce.number().int().positive().optional(),
        status: z.enum(["locked", "unlocked", "active", "inactive"]).optional(),
        proficiency: z.coerce.number().int().min(0).max(100).optional(),
      }).refine((data) => Boolean(data.id ?? data.skillId), {
        message: "Skill id is required",
        path: ["id"],
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
      const agentId = await ensureAgent(ctx.user.id);
      const skillId = input.skillId ?? input.id!;
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (input.status) {
        updates.status = input.status;
        if (input.status === "unlocked" || input.status === "active") {
          updates.acquiredAt = new Date();
        }
      }
      if (typeof input.proficiency === "number") updates.proficiency = input.proficiency;
      const [row] = await db
        .update(agentSkillsRuntime)
        .set(updates)
        .where(and(eq(agentSkillsRuntime.id, skillId), eq(agentSkillsRuntime.agentId, agentId)))
        .returning();
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Skill não encontrada" });
      if (input.status) {
        await db.insert(agentEvolutionHistory).values({
          agentId,
          eventType: `skill_${input.status}`,
          description: `Skill ${row.skillName} -> ${input.status}`,
        });
      }
      return { success: true, skill: row };
    }),

  getEvolutionHistory: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];
      const agentId = await ensureAgent(ctx.user.id);
      return await db
        .select()
        .from(agentEvolutionHistory)
        .where(eq(agentEvolutionHistory.agentId, agentId))
        .orderBy(desc(agentEvolutionHistory.createdAt))
        .limit(100);
    } catch (error) {
      console.error("[agentsRouter] getEvolutionHistory failed:", error);
      return [];
    }
  }),

  // ========== PRODUTOS RECOMENDADOS ==========
  getRecommendedProducts: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];
      const agentId = await ensureAgent(ctx.user.id);
      return await db
        .select()
        .from(recommendedProducts)
        .where(eq(recommendedProducts.agentId, agentId))
        .orderBy(desc(recommendedProducts.createdAt));
    } catch (error) {
      console.error("[agentsRouter] getRecommendedProducts failed:", error);
      return [];
    }
  }),

  createRecommendedProduct: protectedProcedure
    .input(
      z.object({
        productName: z.string().min(1),
        description: z.string().optional(),
        marketplace: z.string().min(1),
        relevanceScore: z.coerce.number().min(0).max(100).default(50),
        affiliateLink: z.string().url(),
        productUrl: z.union([z.string().url(), z.literal("")]).optional(),
        price: z.coerce.number().nonnegative().optional(),
        commission: z.coerce.number().nonnegative().optional(),
        imageUrl: z.union([z.string().url(), z.literal("")]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
      const agentId = await ensureAgent(ctx.user.id);
      const [row] = await db
        .insert(recommendedProducts)
        .values({
          agentId,
          productName: input.productName,
          description: input.description ?? null,
          marketplace: input.marketplace,
          relevanceScore: Math.round(input.relevanceScore),
          affiliateLink: input.affiliateLink,
          productUrl: input.productUrl || null,
          price: input.price?.toString() ?? null,
          commission: input.commission?.toString() ?? null,
          imageUrl: input.imageUrl || null,
        })
        .returning();
      return { success: true, product: row };
    }),

  // ========== CONTEÚDO GERADO ==========
  createGeneratedContent: protectedProcedure
    .input(
      z.object({
        prompt: z.string().min(1),
        content: z.string().min(1),
        contentType: z.string().optional(),
        platform: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
      const id = `gc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const [row] = await db
        .insert(generatedContent)
        .values({
          id,
          userId: ctx.user.id,
          prompt: input.prompt,
          content: input.content,
          modelId: input.platform ?? input.contentType ?? "default",
        })
        .returning();
      return { success: true, content: row };
    }),

  // ========== POSTS AGENDADOS ==========
  getScheduledPosts: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];
      const rows = await db
        .select()
        .from(scheduledPosts)
        .where(eq(scheduledPosts.userId, ctx.user.id))
        .orderBy(desc(scheduledPosts.scheduledFor))
        .limit(100);
      return rows.map((p) => ({
        id: p.id,
        content: p.content,
        platform: Array.isArray(p.platforms) ? p.platforms[0] ?? "instagram" : "instagram",
        scheduledAt: p.scheduledFor.toISOString(),
        status: p.status === "scheduled" ? "agendado"
          : p.status === "published" ? "publicado"
          : p.status === "failed" ? "falhou"
          : p.status,
        imageUrl: Array.isArray(p.mediaUrls) ? p.mediaUrls[0] ?? undefined : undefined,
      }));
    } catch (error) {
      console.error("[agentsRouter] getScheduledPosts failed:", error);
      return [];
    }
  }),

  createScheduledPost: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        platform: z.string().min(1),
        scheduledAt: z.coerce.date(),
        imageUrl: z.union([z.string().url(), z.literal("")]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
      const id = `sp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const [row] = await db
        .insert(scheduledPosts)
        .values({
          id,
          userId: ctx.user.id,
          content: input.content,
          platforms: [input.platform],
          scheduledFor: input.scheduledAt,
          status: "scheduled",
          mediaUrls: input.imageUrl ? [input.imageUrl] : null,
        })
        .returning();
      return { success: true, post: row };
    }),

  updateScheduledPost: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1).optional(),
        postId: z.string().min(1).optional(),
        status: z.enum(["scheduled", "agendado", "publicado", "falhou", "published", "failed", "cancelled"]).optional(),
        content: z.string().optional(),
        scheduledAt: z.coerce.date().optional(),
      }).refine((data) => Boolean(data.id ?? data.postId), {
        message: "Post id is required",
        path: ["id"],
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Database unavailable" });
      const postId = input.postId ?? input.id!;
      const updates: Record<string, unknown> = {};
      if (input.status) {
        const normalized = input.status === "agendado" ? "scheduled"
          : input.status === "publicado" ? "published"
          : input.status === "falhou" ? "failed"
          : input.status;
        updates.status = normalized;
        if (normalized === "published") updates.publishedAt = new Date();
      }
      if (input.content) updates.content = input.content;
      if (input.scheduledAt) updates.scheduledFor = input.scheduledAt;
      const [row] = await db
        .update(scheduledPosts)
        .set(updates)
        .where(and(eq(scheduledPosts.id, postId), eq(scheduledPosts.userId, ctx.user.id)))
        .returning();
      if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "Post não encontrado" });
      return { success: true, post: row };
    }),
});
