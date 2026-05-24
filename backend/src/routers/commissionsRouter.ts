import { z } from "zod";

import { adminProcedure, protectedProcedure, publicProcedure, router } from "../config/trpc";
import {
  publishCommissionApproved,
  publishCommissionPaid,
  publishCommissionRejected,
} from "../domains/commissions/events";
import {
  calculatePendingCommissionSummary,
  createApproveBatchAudit,
  createUpdateStatusAudit,
  getAffiliateCommissions,
  getCommissionAmount,
  getCommissionDetails,
  getCommissionStats,
  listCommissions,
} from "../domains/commissions/service";

/**
 * Commissions Router - Gestão de comissões
 */
export const commissionsRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        limit: z.number().default(50),
        status: z.enum(["pending", "confirmed", "paid", "cancelled"]).optional(),
        affiliateId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
    )
    .query(async ({ input }) => listCommissions(input)),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => getCommissionDetails(input.id)),

  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "confirmed", "paid", "cancelled"]),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const audit = createUpdateStatusAudit({
        id: input.id,
        status: input.status,
        performedBy: ctx.user.email,
        notes: input.notes,
      });

      if (input.status === "confirmed") {
        await publishCommissionApproved(String(input.id), String(ctx.user.id), {
          source: "commissions.updateStatus",
          notes: input.notes,
        });
      } else if (input.status === "paid") {
        await publishCommissionPaid(
          String(input.id),
          `manual-${input.id}`,
          getCommissionAmount(input.id),
          {
            source: "commissions.updateStatus",
            notes: input.notes,
          },
        );
      } else if (input.status === "cancelled") {
        await publishCommissionRejected(String(input.id), input.notes || "cancelled", {
          source: "commissions.updateStatus",
        });
      }

      return {
        success: true,
        message: `Status da comissão atualizado para ${input.status}`,
        audit,
      };
    }),

  approveBatch: adminProcedure
    .input(
      z.object({
        ids: z.array(z.number()).min(1, "Pelo menos uma comissão é requerida"),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const audit = createApproveBatchAudit({
        ids: input.ids,
        performedBy: ctx.user.email,
        notes: input.notes,
      });

      await Promise.all(
        input.ids.map((id) =>
          publishCommissionApproved(String(id), String(ctx.user.id), {
            source: "commissions.approveBatch",
            notes: input.notes,
          }),
        ),
      );

      return {
        success: true,
        message: `${input.ids.length} comissões aprovadas com sucesso`,
        updatedIds: input.ids,
        audit,
      };
    }),

  getStats: publicProcedure.query(async () => getCommissionStats()),

  getByAffiliate: protectedProcedure
    .input(
      z.object({
        affiliateId: z.number(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }),
    )
    .query(async ({ input }) => getAffiliateCommissions(input)),

  calculatePending: protectedProcedure
    .input(z.object({ affiliateId: z.number() }))
    .query(async ({ input }) => calculatePendingCommissionSummary(input.affiliateId)),
});
