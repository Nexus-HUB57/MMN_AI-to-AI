import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  agents: router({
    // Get agent for current user
    getAgent: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return null;
      return db.getAgentByUserId(ctx.user.id);
    }),

    // Update agent configuration
    updateAgent: publicProcedure
      .input(z.object({
        name: z.string().optional(),
        specialization: z.string().optional(),
        systemPrompt: z.string().optional(),
        description: z.string().optional(),
        avatarUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Unauthorized');
        
        const agent = await db.getAgentByUserId(ctx.user.id);
        if (!agent) throw new Error('Agent not found');
        
        const { name, specialization, systemPrompt, description, avatarUrl } = input;
        return db.updateAgent(agent.agentId, {
          name,
          specialization,
          systemPrompt: systemPrompt || null,
          description: description || null,
          avatarUrl: avatarUrl || null,
        });
      }),

    // Get scheduled posts
    getScheduledPosts: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      
      const agent = await db.getAgentByUserId(ctx.user.id);
      if (!agent) return [];
      
      return db.getScheduledPostsByAgentId(agent.agentId);
    }),

    // Create scheduled post
    createScheduledPost: publicProcedure
      .input(z.object({
        content: z.string(),
        platform: z.enum(['whatsapp', 'instagram', 'facebook', 'twitter', 'linkedin']),
        scheduledAt: z.date(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Unauthorized');
        
        const agent = await db.getAgentByUserId(ctx.user.id);
        if (!agent) throw new Error('Agent not found');
        
        const { content, platform, scheduledAt, imageUrl } = input;
        return db.createScheduledPost({
          agentId: agent.agentId,
          content,
          platform,
          scheduledAt,
          imageUrl: imageUrl || null,
        });
      }),

    // Update scheduled post status
    updateScheduledPost: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['agendado', 'publicado', 'falhou']).optional(),
        failureReason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Unauthorized');
        
        const agent = await db.getAgentByUserId(ctx.user.id);
        if (!agent) throw new Error('Agent not found');
        
        const { status, failureReason } = input;
        return db.updateScheduledPost(input.id, {
          status,
          failureReason: failureReason || null,
          publishedAt: status === 'publicado' ? new Date() : undefined,
        });
      }),

    // Delete scheduled post
    deleteScheduledPost: publicProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Unauthorized');
        
        const agent = await db.getAgentByUserId(ctx.user.id);
        if (!agent) throw new Error('Agent not found');
        
        return db.deleteScheduledPost(input.id);
      }),

    // Get recommended products
    getRecommendedProducts: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      
      const agent = await db.getAgentByUserId(ctx.user.id);
      if (!agent) return [];
      
      return db.getRecommendedProductsByAgentId(agent.agentId);
    }),

    // Create recommended product
    createRecommendedProduct: publicProcedure
      .input(z.object({
        productName: z.string(),
        productUrl: z.string(),
        affiliateLink: z.string(),
        relevanceScore: z.number(),
        marketplace: z.string(),
        price: z.number().optional(),
        commission: z.number().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Unauthorized');
        
        const agent = await db.getAgentByUserId(ctx.user.id);
        if (!agent) throw new Error('Agent not found');
        
        const { productName, productUrl, affiliateLink, relevanceScore, marketplace, price, commission, description, imageUrl } = input;
        return db.createRecommendedProduct({
          agentId: agent.agentId,
          productName,
          productUrl,
          affiliateLink,
          relevanceScore: relevanceScore.toString() as any,
          marketplace,
          price: price ? price.toString() : undefined,
          commission: commission ? commission.toString() : undefined,
          description: description || null,
          imageUrl: imageUrl || null,
        });
      }),

    // Get agent skills
    getAgentSkills: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      
      const agent = await db.getAgentByUserId(ctx.user.id);
      if (!agent) return [];
      
      return db.getAgentSkillsByAgentId(agent.agentId);
    }),

    // Create agent skill
    createAgentSkill: publicProcedure
      .input(z.object({
        skillName: z.string(),
        description: z.string().optional(),
        level: z.number().optional(),
        cost: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Unauthorized');
        
        const agent = await db.getAgentByUserId(ctx.user.id);
        if (!agent) throw new Error('Agent not found');
        
        const { skillName, description, level, cost } = input;
        return db.createAgentSkill({
          agentId: agent.agentId,
          skillName,
          description: description || null,
          level: level || 1,
          cost: cost ? cost.toString() : undefined,
        });
      }),

    // Update agent skill
    updateAgentSkill: publicProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['locked', 'unlocked', 'active']).optional(),
        proficiency: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Unauthorized');
        
        const { status, proficiency } = input;
        return db.updateAgentSkill(input.id, {
          status,
          proficiency: proficiency ? (proficiency.toString() as any) : undefined,
          acquiredAt: status === 'active' ? new Date() : undefined,
        });
      }),

    // Get evolution history
    getEvolutionHistory: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      
      const agent = await db.getAgentByUserId(ctx.user.id);
      if (!agent) return [];
      
      return db.getEvolutionHistoryByAgentId(agent.agentId);
    }),

    // Create evolution history entry
    createEvolutionHistory: publicProcedure
      .input(z.object({
        eventType: z.string(),
        description: z.string().optional(),
        sencienceGain: z.string().optional(),
        healthChange: z.number().optional(),
        energyChange: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Unauthorized');
        
        const agent = await db.getAgentByUserId(ctx.user.id);
        if (!agent) throw new Error('Agent not found');
        
        return db.createEvolutionHistory({
          ...input,
          agentId: agent.agentId,
        });
      }),

    // Get generated images
    getGeneratedImages: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      
      const agent = await db.getAgentByUserId(ctx.user.id);
      if (!agent) return [];
      
      return db.getGeneratedImagesByAgentId(agent.agentId);
    }),

    // Create generated image
    createGeneratedImage: publicProcedure
      .input(z.object({
        prompt: z.string(),
        imageUrl: z.string(),
        storageKey: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Unauthorized');
        
        const agent = await db.getAgentByUserId(ctx.user.id);
        if (!agent) throw new Error('Agent not found');
        
        const { prompt, imageUrl, storageKey } = input;
        return db.createGeneratedImage({
          agentId: agent.agentId,
          prompt,
          imageUrl,
          storageKey: storageKey || null,
        });
      }),

    // Get generated content
    getGeneratedContent: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) return [];
      
      const agent = await db.getAgentByUserId(ctx.user.id);
      if (!agent) return [];
      
      return db.getGeneratedContentByAgentId(agent.agentId);
    }),

    // Create generated content
    createGeneratedContent: publicProcedure
      .input(z.object({
        contentType: z.enum(['text', 'image', 'video']),
        prompt: z.string(),
        content: z.string().optional(),
        imageUrl: z.string().optional(),
        platform: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error('Unauthorized');
        
        const agent = await db.getAgentByUserId(ctx.user.id);
        if (!agent) throw new Error('Agent not found');
        
        const { contentType, prompt, content, imageUrl, platform } = input;
        return db.createGeneratedContent({
          agentId: agent.agentId,
          contentType,
          prompt,
          content: content || null,
          imageUrl: imageUrl || null,
          platform: platform || null,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
