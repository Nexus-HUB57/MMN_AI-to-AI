import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getAgentByUserId, createAgent, updateAgent as updateAgentDb } from "./db";

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
});
