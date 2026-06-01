/**
 * Subscriptions domain — tRPC router.
 *
 * Endpoints expostos:
 *  - subscriptions.catalog        : lista os 3 packs (público para frontend)
 *  - subscriptions.overview       : snapshot agregado (admin)
 *  - subscriptions.list           : busca paginada (admin)
 *  - subscriptions.start          : usuário inicia assinatura (auth)
 *  - subscriptions.confirmPayment : confirma pagamento (admin/webhook)
 *  - subscriptions.changePlan     : upgrade / downgrade (auth)
 *  - subscriptions.cancel         : cancela assinatura (auth)
 *  - subscriptions.markPastDue    : marca past_due (admin/webhook)
 *  - subscriptions.detail         : detalhes + event log (auth)
 *
 * Toda mutation registra evento no log interno e, quando relevante,
 * publica eventos de domínio Partners (tier promotion).
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

  overview: adminProcedure.query(() => getSubscriptionsOverview()),

  list: adminProcedure
    .input(subscriptionListInputSchema)
    .query(({ input }) => searchSubscriptions(input)),

  mine: protectedProcedure.query(({ ctx }) => {
    const userId = ctx.user?.id;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Sessão necessária" });
    }
    return listSubscriptionsForUser(userId);
  }),

  detail: protectedProcedure
    .input(z.object({ subscriptionId: z.string().min(1) }))
    .query(({ input }) => {
      const result = getSubscriptionDetails(input.subscriptionId);
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
