import { router, protectedProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';
import { eq, like, or } from 'drizzle-orm';
import { cmsPages } from '../database/schema';

export const cmsRouter = router({
  // Get a page by slug (public)
  getPage: publicProcedure
    .input(z.object({
      slug: z.string()
    }))
    .query(async ({ input, ctx }) => {
      try {
        const result = await ctx.db
          .select()
          .from(cmsPages)
          .where(eq(cmsPages.slug, input.slug))
          .limit(1);

        return result.length > 0 ? result[0] : null;
      } catch (error) {
        console.error('CMS getPage error:', error);
        throw new Error('Falha ao buscar página');
      }
    }),

  // List all pages (admin only)
  list: protectedProcedure
    .input(z.object({
      category: z.string().optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),
      page: z.number().optional().default(1),
      limit: z.number().optional().default(50)
    }))
    .query(async ({ input, ctx }) => {
      try {
        let condition;

        if (input.category && input.status) {
          condition = and(
            eq(cmsPages.category, input.category),
            eq(cmsPages.status, input.status)
          );
        } else if (input.category) {
          condition = eq(cmsPages.category, input.category);
        } else if (input.status) {
          condition = eq(cmsPages.status, input.status);
        }

        const offset = (input.page - 1) * (input.limit || 50);

        const results = await ctx.db
          .select()
          .from(cmsPages)
          .where(condition)
          .limit(input.limit || 50)
          .offset(offset)
          .orderBy(cmsPages.order);

        return {
          pages: results,
          page: input.page,
          limit: input.limit || 50
        };
      } catch (error) {
        console.error('CMS list error:', error);
        throw new Error('Falha ao listar páginas');
      }
    }),

  // Create a new page (admin only)
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      content: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      category: z.string().default('general'),
      status: z.enum(['draft', 'published', 'archived']).default('draft'),
      order: z.number().optional().default(0)
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await ctx.db.insert(cmsPages).values({
          title: input.title,
          slug: input.slug,
          content: input.content || '',
          metaTitle: input.metaTitle || input.title,
          metaDescription: input.metaDescription || '',
          category: input.category,
          status: input.status,
          order: input.order || 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();

        return { success: true, page: result[0] };
      } catch (error) {
        console.error('CMS create error:', error);
        throw new Error('Falha ao criar página');
      }
    }),

  // Update a page (admin only)
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      slug: z.string().optional(),
      content: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      category: z.string().optional(),
      status: z.enum(['draft', 'published', 'archived']).optional(),
      order: z.number().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const { id, ...updates } = input;

        await ctx.db
          .update(cmsPages)
          .set({
            ...updates,
            updatedAt: new Date()
          })
          .where(eq(cmsPages.id, id));

        return { success: true };
      } catch (error) {
        console.error('CMS update error:', error);
        throw new Error('Falha ao atualizar página');
      }
    }),

  // Delete a page (admin only)
  delete: protectedProcedure
    .input(z.object({
      id: z.number()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db
          .delete(cmsPages)
          .where(eq(cmsPages.id, input.id));

        return { success: true };
      } catch (error) {
        console.error('CMS delete error:', error);
        throw new Error('Falha ao deletar página');
      }
    }),

  // Get all categories
  getCategories: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const results = await ctx.db
          .select({ category: cmsPages.category })
          .from(cmsPages)
          .groupBy(cmsPages.category);

        return results.map(r => r.category);
      } catch (error) {
        console.error('CMS getCategories error:', error);
        throw new Error('Falha ao buscar categorias');
      }
    })
});