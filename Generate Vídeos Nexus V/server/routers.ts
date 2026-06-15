import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

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
  }),
});

export type AppRouter = typeof appRouter;
