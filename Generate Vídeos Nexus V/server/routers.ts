import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { generateScriptWithLLM } from "./llmService";
import { createScript, updateVideoProject, getScriptByProjectId, deleteVideoProject, getVideoProjectById, getUserVideoProjects, createVideoProject, updateScript } from "./db";
import { ltx2Generator } from "./ltx2Service";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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

  video: router({
    create: protectedProcedure
      .input((input: any) => ({
        title: input.title as string,
        description: input.description as string,
        persona: input.persona as string,
        level: input.level as string,
        module: input.module as string,
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await createVideoProject({
          userId: ctx.user!.id,
          title: input.title,
          description: input.description,
          persona: input.persona as any,
          level: input.level as any,
          module: input.module,
          status: 'draft',
        });
        return project;
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserVideoProjects(ctx.user!.id);
    }),

    getById: protectedProcedure
      .input((input: any) => ({ projectId: input.projectId as number }))
      .query(async ({ ctx, input }) => {
        const project = await getVideoProjectById(input.projectId);
        if (!project || project.userId !== ctx.user!.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Project not found' });
        }
        return project;
      }),

    delete: protectedProcedure
      .input((input: any) => ({ projectId: input.projectId as number }))
      .mutation(async ({ ctx, input }) => {
        const project = await getVideoProjectById(input.projectId);
        if (!project || project.userId !== ctx.user!.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Project not found' });
        }
        await deleteVideoProject(input.projectId);
        return { success: true };
      }),

    // NEW: Generate script using LLM
    generateScript: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        moduleContent: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getVideoProjectById(input.projectId);
        
        // Verify project ownership
        if (!project || project.userId !== ctx.user!.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Project not found' });
        }
        
        try {
          // Generate script using LLM
          const scriptContent = await generateScriptWithLLM(
            project.persona as any,
            project.level as any,
            project.module,
            input.moduleContent
          );
          
          // Save script to database
          const script = await createScript({
            projectId: input.projectId,
            content: scriptContent,
            isEdited: 'false',
          });
          
          // Update project status
          await updateVideoProject(input.projectId, {
            status: 'script_generated',
          });
          
          return {
            success: true,
            script,
            message: 'Script generated successfully',
          };
        } catch (error) {
          console.error('[Video Router] Error generating script:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to generate script: ${(error as Error).message}`,
          });
        }
      }),
    
    // NEW: Update script content
    updateScript: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        scriptContent: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getVideoProjectById(input.projectId);
        
        // Verify project ownership
        if (!project || project.userId !== ctx.user!.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Project not found' });
        }
        
        try {
          const script = await getScriptByProjectId(input.projectId);
          if (!script) {
            throw new Error('Script not found');
          }
          
          // Update script
          await updateScript(script.id, {
            content: input.scriptContent,
            isEdited: 'true',
          });
          
          // Update project status
          await updateVideoProject(input.projectId, {
            status: 'script_edited',
          });
          
          return {
            success: true,
            message: 'Script updated successfully',
          };
        } catch (error) {
          console.error('[Video Router] Error updating script:', error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to update script: ${(error as Error).message}`,
          });
        }
      }),
    
    // NEW: Get script for a project
    getScript: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getVideoProjectById(input.projectId);
        
        // Verify project ownership
        if (!project || project.userId !== ctx.user!.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Project not found' });
        }
        
        const script = await getScriptByProjectId(input.projectId);
        return script || null;
      }),

    // NEW: Generate video using LTX-2
    generateVideo: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        pipeline: z.enum([
          "TI2VidTwoStagesPipeline",
          "TI2VidTwoStagesHQPipeline",
          "TI2VidOneStagePipeline",
          "DistilledPipeline",
          "ICLoraPipeline",
          "KeyframeInterpolationPipeline",
          "A2VidPipelineTwoStage",
          "RetakePipeline",
          "HDRICLoraPipeline",
          "LipDubPipeline",
        ]),
        prompt: z.string().min(10).max(200),
        duration: z.number().min(1).max(60).optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        fps: z.number().optional(),
        quantization: z.enum(["fp8-cast", "fp8-scaled-mm", "none"]).optional(),
        enhancePrompt: z.boolean().optional().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await getVideoProjectById(input.projectId);
        if (!project || project.userId !== ctx.user!.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Project not found' });
        }

        try {
          const result = await ltx2Generator.generateVideo({
            pipeline: input.pipeline,
            prompt: input.prompt,
            duration: input.duration,
            width: input.width,
            height: input.height,
            fps: input.fps,
            quantization: input.quantization,
            enhancePrompt: input.enhancePrompt,
          });

          // TODO: Update generation_history with video result
          await updateVideoProject(input.projectId, {
            status: 'video_generated',
            thumbnailUrl: result.videoPath, // For now, use videoPath as thumbnail
          });

          return {
            success: true,
            videoPath: result.videoPath,
            duration: result.duration,
            resolution: result.resolution,
            fps: result.fps,
            fileSize: result.fileSize,
            generatedAt: result.generatedAt,
          };
        } catch (error) {
          console.error("[Video Generation] Error:", error);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to generate video: ${(error as Error).message}`,
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
