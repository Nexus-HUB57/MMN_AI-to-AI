import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { generateScriptWithLLM } from "./llmService";
import { createScript, updateVideoProject } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
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
        const { createVideoProject } = await import('./db');
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
      const { getUserVideoProjects } = await import('./db');
      return await getUserVideoProjects(ctx.user!.id);
    }),
    
    getById: protectedProcedure
      .input((input: any) => ({ projectId: input.projectId as number }))
      .query(async ({ ctx, input }) => {
        const { getVideoProjectById } = await import('./db');
        const project = await getVideoProjectById(input.projectId);
        if (!project || project.userId !== ctx.user!.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Project not found' });
        }
        return project;
      }),
    
    delete: protectedProcedure
      .input((input: any) => ({ projectId: input.projectId as number }))
      .mutation(async ({ ctx, input }) => {
        const { getVideoProjectById, deleteVideoProject } = await import('./db');
        const project = await getVideoProjectById(input.projectId);
        if (!project || project.userId !== ctx.user!.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Project not found' });
        }
        await deleteVideoProject(input.projectId);
        return { success: true };
      }),
    
    // NEW: Generate script using LLM
    generateScript: protectedProcedure
      .input((input: any) => ({
        projectId: input.projectId as number,
        moduleContent: input.moduleContent as string,
      }))
      .mutation(async ({ ctx, input }) => {
        const { getVideoProjectById } = await import('./db');
        
        // Verify project ownership
        const project = await getVideoProjectById(input.projectId);
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
      .input((input: any) => ({
        projectId: input.projectId as number,
        scriptContent: input.scriptContent as string,
      }))
      .mutation(async ({ ctx, input }) => {
        const { getVideoProjectById, getScriptByProjectId, updateScript } = await import('./db');
        
        // Verify project ownership
        const project = await getVideoProjectById(input.projectId);
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
      .input((input: any) => ({ projectId: input.projectId as number }))
      .query(async ({ ctx, input }) => {
        const { getVideoProjectById, getScriptByProjectId } = await import('./db');
        
        // Verify project ownership
        const project = await getVideoProjectById(input.projectId);
        if (!project || project.userId !== ctx.user!.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Project not found' });
        }
        
        const script = await getScriptByProjectId(input.projectId);
        return script || null;
      }),
  }),
});

export type AppRouter = typeof appRouter;
