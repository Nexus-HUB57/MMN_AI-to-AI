import { router, protectedProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';
import { eq, and, or } from 'drizzle-orm';
import { newsletters } from '../database/schema';

export const newsletterRouter = router({
  // Subscribe to newsletter
  subscribe: publicProcedure
    .input(z.object({
      email: z.string().email('Email inválido'),
      name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
      source: z.string().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if email already exists
        const existing = await ctx.db
          .select()
          .from(newsletters)
          .where(eq(newsletters.email, input.email))
          .limit(1);

        if (existing.length > 0) {
          // Update existing subscription
          await ctx.db
            .update(newsletters)
            .set({
              subscribed: true,
              updatedAt: new Date()
            })
            .where(eq(newsletters.email, input.email));

          return {
            success: true,
            message: 'Inscrição atualizada com sucesso!',
            alreadySubscribed: true
          };
        }

        // Create new subscription
        await ctx.db.insert(newsletters).values({
          email: input.email,
          name: input.name || null,
          source: input.source || 'direct',
          subscribed: true,
          createdAt: new Date(),
          updatedAt: new Date()
        });

        return {
          success: true,
          message: 'Inscrição realizada com sucesso!',
          alreadySubscribed: false
        };
      } catch (error) {
        console.error('Newsletter subscription error:', error);
        throw new Error('Falha ao processar inscrição');
      }
    }),

  // Unsubscribe from newsletter
  unsubscribe: publicProcedure
    .input(z.object({
      email: z.string().email('Email inválido')
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db
          .update(newsletters)
          .set({
            subscribed: false,
            updatedAt: new Date()
          })
          .where(eq(newsletters.email, input.email));

        return { success: true, message: 'Inscrição cancelada com sucesso!' };
      } catch (error) {
        console.error('Newsletter unsubscription error:', error);
        throw new Error('Falha ao processar cancelamento');
      }
    }),

  // List all subscribers (admin only)
  list: protectedProcedure
    .input(z.object({
      onlyActive: z.boolean().optional().default(false),
      page: z.number().optional().default(1),
      limit: z.number().optional().default(50)
    }))
    .query(async ({ input, ctx }) => {
      try {
        const condition = input.onlyActive
          ? eq(newsletters.subscribed, true)
          : undefined;

        const offset = (input.page - 1) * input.limit;

        const results = await ctx.db
          .select()
          .from(newsletters)
          .where(condition)
          .limit(input.limit)
          .offset(offset)
          .orderBy(newsletters.createdAt);

        return {
          subscribers: results,
          page: input.page,
          limit: input.limit
        };
      } catch (error) {
        console.error('Newsletter list error:', error);
        throw new Error('Falha ao buscar inscrições');
      }
    }),

  // Get subscriber by email
  getByEmail: protectedProcedure
    .input(z.object({
      email: z.string().email('Email inválido')
    }))
    .query(async ({ input, ctx }) => {
      try {
        const result = await ctx.db
          .select()
          .from(newsletters)
          .where(eq(newsletters.email, input.email))
          .limit(1);

        return result.length > 0 ? result[0] : null;
      } catch (error) {
        console.error('Newsletter getByEmail error:', error);
        throw new Error('Falha ao buscar inscrito');
      }
    }),

  // Count subscribers
  count: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const all = await ctx.db.select().from(newsletters);
        const active = all.filter(n => n.subscribed);

        return {
          total: all.length,
          active: active.length,
          inactive: all.length - active.length
        };
      } catch (error) {
        console.error('Newsletter count error:', error);
        throw new Error('Falha ao contar inscrições');
      }
    })
});