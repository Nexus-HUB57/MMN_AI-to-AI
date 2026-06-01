/**
 * Subscriptions domain — tRPC router.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "../../config/trpc";
import {
  cancelSubscription,
  changeSubscriptionPlan,
  confirmSubscriptionPayment,
  getCatalog,
  getSubscriptionDetails,
  getSubscriptionsOverview,
  handleSubscriptionInvoicePaid,
  listSubscriptionsForUser,
  markSubscriptionPastDue,
  searchSubscriptions,
  startSubscription,
} from "./service";
import {
  cancelSubscriptionInputSchema,
  startSubscriptionInputSchema,
  subscriptionListInputSchema,
  upgradeSubscriptionInputSchema,
} from "./types";

export const subscriptionsRouter = router({
  catalog: publicProcedure.query(() => getCatalog()),

  overview: adminProcedure.query(async () => getSubscriptionsOverview()),

  list: adminProcedure
    .input(subscriptionListInputSchema)
    .query(async ({ input }) => searchSubscriptions(input)),

  mine: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão necessária" });
    }
    return listSubscriptionsForUser(userId);
  }),

  detail: protectedProcedure
    .input(z.object({ subscriptionId: z.string().min(1) }))
    .query(async ({ input }) => {
      const result = await getSubscriptionDetails(input.subscriptionId);
      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assinatura não encontrada" });
      }
      return result;
    }),

  start: protectedProcedure
    .input(startSubscriptionInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id ?? input.userId;
      if (!userId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão necessária" });
      }
      return startSubscription({
        userId,
        planId: input.planId,
        termMonths: input.termMonths,
        metadata: input.metadata,
      });
    }),

  confirmPayment: adminProcedure
    .input(z.object({ subscriptionId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const updated = await confirmSubscriptionPayment(input.subscriptionId, "admin");
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assinatura não encontrada" });
      }
      return updated;
    }),

  invoicePaid: adminProcedure
    .input(
      z.object({
        subscriptionId: z.string().min(1),
        invoiceId: z.string().optional(),
        paidAt: z.string().optional(),
        provider: z.enum(["mercado_pago", "hotmart", "manual", "system"]),
        externalReference: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const updated = await handleSubscriptionInvoicePaid(input);
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assinatura não encontrada" });
      }
      return updated;
    }),

  changePlan: protectedProcedure
    .input(upgradeSubscriptionInputSchema)
    .mutation(async ({ input }) => {
      const result = await changeSubscriptionPlan(input);
      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assinatura não encontrada" });
      }
      return result;
    }),

  cancel: protectedProcedure
    .input(cancelSubscriptionInputSchema)
    .mutation(async ({ input }) => {
      const updated = await cancelSubscription({
        subscriptionId: input.subscriptionId,
        reason: input.reason,
      });
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assinatura não encontrada" });
      }
      return updated;
    }),

  markPastDue: adminProcedure
    .input(z.object({ subscriptionId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const updated = await markSubscriptionPastDue(input.subscriptionId);
      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Assinatura não encontrada" });
      }
      return updated;
    }),
});
