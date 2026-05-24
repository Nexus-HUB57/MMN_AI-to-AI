import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  findInvoiceById,
  insertBillingHistoryRecord,
  insertInvoiceItemRecords,
  insertInvoiceRecord,
  listAllInvoices,
  listBillingHistoryRecords,
  listInvoiceItemsByInvoiceId,
  listInvoicesWithFilters,
  updateInvoiceRecord,
} from "../domains/billing/repository";
import {
  InvoiceNotFoundError,
  confirmInvoicePayment,
  createInvoice,
  getBillingHistory,
  getBillingStats,
  getInvoiceDetails,
  listInvoices,
  updateInvoiceStatus,
} from "../domains/billing/service";

function buildBillingDeps(db: unknown) {
  return {
    findInvoiceById: (id: number) => findInvoiceById(db, id),
    listInvoiceItemsByInvoiceId: (invoiceId: number) =>
      listInvoiceItemsByInvoiceId(db, invoiceId),
    listInvoicesWithFilters: (filters: {
      status?: "pending" | "paid" | "overdue" | "cancelled";
      startDate?: Date;
      endDate?: Date;
      page: number;
      limit: number;
    }) => listInvoicesWithFilters(db, filters),
    insertInvoiceRecord: (input: {
      userId: number;
      amount: number;
      description: string;
      dueDate: Date;
      items?: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
      }>;
    }) => insertInvoiceRecord(db, input),
    insertInvoiceItemRecords: (invoiceId: number, items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }>) => insertInvoiceItemRecords(db, invoiceId, items),
    updateInvoiceRecord: (id: number, data: Record<string, unknown>) =>
      updateInvoiceRecord(db, id, data),
    insertBillingHistoryRecord: (input: {
      invoiceId: number;
      action: string;
      performedBy: number;
    }) => insertBillingHistoryRecord(db, input),
    listBillingHistoryRecords: (query: {
      invoiceId?: number;
      page: number;
      limit: number;
    }) => listBillingHistoryRecords(db, query),
    listAllInvoices: () => listAllInvoices(db),
  };
}

function handleBillingError(
  error: unknown,
  options: {
    operation: string;
    internalMessage: string;
  },
): never {
  if (error instanceof InvoiceNotFoundError) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: error.message,
    });
  }

  console.error(`[billingRouter] ${options.operation}:`, error);
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: options.internalMessage,
  });
}

export const billingRouter = router({
  getInvoice: protectedProcedure
    .input(
      z.object({
        id: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        return await getInvoiceDetails(input.id, buildBillingDeps(ctx.db));
      } catch (error) {
        handleBillingError(error, {
          operation: "Error getting invoice",
          internalMessage: "Falha ao buscar fatura",
        });
      }
    }),

  listInvoices: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "paid", "overdue", "cancelled"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(20),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        return await listInvoices(
          {
            status: input.status,
            startDate: input.startDate,
            endDate: input.endDate,
            page: input.page,
            limit: input.limit,
          },
          buildBillingDeps(ctx.db),
        );
      } catch (error) {
        handleBillingError(error, {
          operation: "Error listing invoices",
          internalMessage: "Falha ao listar faturas",
        });
      }
    }),

  createInvoice: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        amount: z.number().positive(),
        description: z.string(),
        dueDate: z.date(),
        items: z
          .array(
            z.object({
              description: z.string(),
              quantity: z.number().int().positive(),
              unitPrice: z.number().positive(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        return await createInvoice(input, buildBillingDeps(ctx.db));
      } catch (error) {
        handleBillingError(error, {
          operation: "Error creating invoice",
          internalMessage: "Falha ao criar fatura",
        });
      }
    }),

  updateInvoiceStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "paid", "overdue", "cancelled"]),
        paidAt: z.date().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        return await updateInvoiceStatus(
          {
            ...input,
            performedBy: ctx.user?.id || 0,
          },
          buildBillingDeps(ctx.db),
        );
      } catch (error) {
        handleBillingError(error, {
          operation: "Error updating invoice status",
          internalMessage: "Falha ao atualizar status",
        });
      }
    }),

  getHistory: protectedProcedure
    .input(
      z.object({
        invoiceId: z.number().optional(),
        page: z.number().optional().default(1),
        limit: z.number().optional().default(50),
      }),
    )
    .query(async ({ input, ctx }) => {
      try {
        return await getBillingHistory(
          {
            invoiceId: input.invoiceId,
            page: input.page,
            limit: input.limit,
          },
          buildBillingDeps(ctx.db),
        );
      } catch (error) {
        handleBillingError(error, {
          operation: "Error getting billing history",
          internalMessage: "Falha ao buscar histórico",
        });
      }
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      return await getBillingStats(buildBillingDeps(ctx.db));
    } catch (error) {
      handleBillingError(error, {
        operation: "Error getting billing stats",
        internalMessage: "Falha ao buscar estatísticas",
      });
    }
  }),

  confirmPayment: publicProcedure
    .input(
      z.object({
        invoiceId: z.number(),
        paymentId: z.string(),
        amount: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        return await confirmInvoicePayment(input, buildBillingDeps(ctx.db));
      } catch (error) {
        handleBillingError(error, {
          operation: "Error confirming payment",
          internalMessage: "Falha ao confirmar pagamento",
        });
      }
    }),
});
