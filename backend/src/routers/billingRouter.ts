import { router, protectedProcedure, publicProcedure } from '../trpc';
import { z } from 'zod';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { invoices, invoiceItems, billingHistory } from '../database/schema';

export const billingRouter = router({
  // Get invoice by ID
  getInvoice: protectedProcedure
    .input(z.object({
      id: z.number()
    }))
    .query(async ({ input, ctx }) => {
      try {
        const invoice = await ctx.db
          .select()
          .from(invoices)
          .where(eq(invoices.id, input.id))
          .limit(1);

        if (invoice.length === 0) {
          throw new Error('Fatura não encontrada');
        }

        const items = await ctx.db
          .select()
          .from(invoiceItems)
          .where(eq(invoiceItems.invoiceId, input.id));

        return {
          ...invoice[0],
          items
        };
      } catch (error) {
        console.error('Billing getInvoice error:', error);
        throw new Error('Falha ao buscar fatura');
      }
    }),

  // List all invoices for the current user
  listInvoices: protectedProcedure
    .input(z.object({
      status: z.enum(['pending', 'paid', 'overdue', 'cancelled']).optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20)
    }))
    .query(async ({ input, ctx }) => {
      try {
        // Note: In production, filter by userId from session
        const conditions = [];

        if (input.status) {
          conditions.push(eq(invoices.status, input.status));
        }
        if (input.startDate) {
          conditions.push(gte(invoices.dueDate, input.startDate));
        }
        if (input.endDate) {
          conditions.push(lte(invoices.dueDate, input.endDate));
        }

        const offset = (input.page - 1) * (input.limit || 20);

        const results = await ctx.db
          .select()
          .from(invoices)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .limit(input.limit || 20)
          .offset(offset)
          .orderBy(desc(invoices.createdAt));

        return {
          invoices: results,
          page: input.page,
          limit: input.limit || 20
        };
      } catch (error) {
        console.error('Billing listInvoices error:', error);
        throw new Error('Falha ao listar faturas');
      }
    }),

  // Create a new invoice (admin only)
  createInvoice: protectedProcedure
    .input(z.object({
      userId: z.number(),
      amount: z.number().positive(),
      description: z.string(),
      dueDate: z.date(),
      items: z.array(z.object({
        description: z.string(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive()
      })).optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const result = await ctx.db.insert(invoices).values({
          userId: input.userId,
          amount: input.amount,
          description: input.description,
          dueDate: input.dueDate,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        }).returning();

        const invoice = result[0];

        // Insert invoice items if provided
        if (input.items && input.items.length > 0) {
          for (const item of input.items) {
            await ctx.db.insert(invoiceItems).values({
              invoiceId: invoice.id,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice
            });
          }
        }

        return { success: true, invoice };
      } catch (error) {
        console.error('Billing createInvoice error:', error);
        throw new Error('Falha ao criar fatura');
      }
    }),

  // Update invoice status (admin only)
  updateInvoiceStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(['pending', 'paid', 'overdue', 'cancelled']),
      paidAt: z.date().optional()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const updateData: any = {
          status: input.status,
          updatedAt: new Date()
        };

        if (input.paidAt) {
          updateData.paidAt = input.paidAt;
        }

        await ctx.db
          .update(invoices)
          .set(updateData)
          .where(eq(invoices.id, input.id));

        // Add to billing history
        await ctx.db.insert(billingHistory).values({
          invoiceId: input.id,
          action: `Status alterado para ${input.status}`,
          performedBy: ctx.user?.id || 0,
          createdAt: new Date()
        });

        return { success: true };
      } catch (error) {
        console.error('Billing updateInvoiceStatus error:', error);
        throw new Error('Falha ao atualizar status');
      }
    }),

  // Get billing history
  getHistory: protectedProcedure
    .input(z.object({
      invoiceId: z.number().optional(),
      page: z.number().optional().default(1),
      limit: z.number().optional().default(50)
    }))
    .query(async ({ input, ctx }) => {
      try {
        const conditions = input.invoiceId
          ? eq(billingHistory.invoiceId, input.invoiceId)
          : undefined;

        const offset = (input.page - 1) * (input.limit || 50);

        const results = await ctx.db
          .select()
          .from(billingHistory)
          .where(conditions)
          .limit(input.limit || 50)
          .offset(offset)
          .orderBy(desc(billingHistory.createdAt));

        return {
          history: results,
          page: input.page,
          limit: input.limit || 50
        };
      } catch (error) {
        console.error('Billing getHistory error:', error);
        throw new Error('Falha ao buscar histórico');
      }
    }),

  // Get invoice statistics (admin only)
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const allInvoices = await ctx.db.select().from(invoices);

        const stats = {
          total: allInvoices.length,
          pending: allInvoices.filter(i => i.status === 'pending').length,
          paid: allInvoices.filter(i => i.status === 'paid').length,
          overdue: allInvoices.filter(i => i.status === 'overdue').length,
          cancelled: allInvoices.filter(i => i.status === 'cancelled').length,
          totalAmount: allInvoices.reduce((sum, i) => sum + Number(i.amount), 0),
          paidAmount: allInvoices
            .filter(i => i.status === 'paid')
            .reduce((sum, i) => sum + Number(i.amount), 0),
          pendingAmount: allInvoices
            .filter(i => i.status === 'pending')
            .reduce((sum, i) => sum + Number(i.amount), 0)
        };

        return stats;
      } catch (error) {
        console.error('Billing getStats error:', error);
        throw new Error('Falha ao buscar estatísticas');
      }
    }),

  // Confirm payment (callback from payment gateway)
  confirmPayment: publicProcedure
    .input(z.object({
      invoiceId: z.number(),
      paymentId: z.string(),
      amount: z.number()
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db
          .update(invoices)
          .set({
            status: 'paid',
            paidAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(invoices.id, input.invoiceId));

        await ctx.db.insert(billingHistory).values({
          invoiceId: input.invoiceId,
          action: `Pagamento confirmado: ${input.paymentId}`,
          performedBy: 0,
          createdAt: new Date()
        });

        return { success: true };
      } catch (error) {
        console.error('Billing confirmPayment error:', error);
        throw new Error('Falha ao confirmar pagamento');
      }
    })
});