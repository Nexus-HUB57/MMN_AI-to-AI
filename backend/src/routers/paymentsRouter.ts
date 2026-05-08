import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "../config/trpc";
import { getDb } from "../../database/schemas/db";
import {
  payments,
  commissions,
  affiliates,
  InsertPayment,
  InsertCommission,
} from "../../database/schemas/schema-final";
import { eq, and, desc, gte, lt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  calculateCommissionsForPayment,
  confirmCommissions,
  updateAffiliateCommissionTotals,
} from "../services/commissions";
import { createNotification } from "../../database/schemas/db";

/**
 * Payments Router - Gestão de pagamentos e comissões
 * Implementa a Fase 5: Backend - Gestão de Pagamentos
 */

export const paymentsRouter = router({
  /**
   * Inserir novo pagamento (receita)
   * Admin: insere manualmente
   * Afiliado: pode confirmar pagamento realizado
   */
  insertPayment: protectedProcedure
    .input(
      z.object({
        affiliateId: z.number().optional(), // Se vazio, será identificado depois
        amount: z.number().min(1, "Valor deve ser maior que 0"),
        method: z.enum(["boleto", "cartao", "deposito", "transferencia", "pix"]),
        bankCode: z.string().optional(),
        bankNumber: z.string().optional(),
        agency: z.string().optional(),
        account: z.string().optional(),
        paymentDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Se não informou affiliateId, tenta usar o do usuário
      let affiliateId = input.affiliateId;
      if (!affiliateId) {
        const affiliate = await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.userId, ctx.user.id))
          .limit(1);

        if (affiliate.length === 0 && ctx.user.role !== "admin" && ctx.user.role !== "user") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Affiliate profile not found",
          });
        }

        affiliateId = affiliate[0]?.id;
      }

      if (!affiliateId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Affiliate ID is required",
        });
      }

      const newPayment: InsertPayment = {
        affiliateId,
        amount: input.amount,
        method: input.method,
        status: "pending",
        bankCode: input.bankCode,
        bankNumber: input.bankNumber,
        agency: input.agency,
        account: input.account,
        paymentDate: input.paymentDate || new Date(),
      };

      const result = await db.insert(payments).values(newPayment);
      const paymentId = (result as any).insertId;

      // Criar notificação
      await createNotification({
        userId: ctx.user.id,
        type: "payment_inserted",
        title: "Pagamento Registrado",
        content: `Pagamento de R$ ${(input.amount / 100).toFixed(2)} foi registrado e aguarda confirmação.`,
        read: 0,
      });

      return {
        id: paymentId,
        ...newPayment,
      };
    }),

  /**
   * Listar pagamentos pendentes (para identificação)
   */
  listPendingPayments: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(payments)
      .where(eq(payments.status, "pending"))
      .orderBy(desc(payments.createdAt));
  }),

  /**
   * Identificar pagamento (associar a afiliado)
   */
  identifyPayment: adminProcedure
    .input(
      z.object({
        paymentId: z.number(),
        affiliateId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Verificar se pagamento existe
      const paymentResult = await db
        .select()
        .from(payments)
        .where(eq(payments.id, input.paymentId))
        .limit(1);

      if (paymentResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment not found",
        });
      }

      // Verificar se afiliado existe
      const affiliateResult = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.id, input.affiliateId))
        .limit(1);

      if (affiliateResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Affiliate not found",
        });
      }

      // Atualizar pagamento com afiliado
      await db
        .update(payments)
        .set({ affiliateId: input.affiliateId })
        .where(eq(payments.id, input.paymentId));

      return { success: true };
    }),

  /**
   * Confirmar pagamento e calcular comissões
   */
  confirmPayment: adminProcedure
    .input(z.object({ paymentId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Buscar o pagamento
      const paymentResult = await db
        .select()
        .from(payments)
        .where(eq(payments.id, input.paymentId))
        .limit(1);

      if (paymentResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment not found",
        });
      }

      const payment = paymentResult[0];

      if (!payment.affiliateId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment must be identified before confirmation",
        });
      }

      // Atualizar status do pagamento para confirmed
      await db
        .update(payments)
        .set({
          status: "confirmed",
          confirmedAt: new Date(),
        })
        .where(eq(payments.id, input.paymentId));

      // Calcular comissões em cascata
      const createdCommissions = await calculateCommissionsForPayment(
        payment.affiliateId,
        payment.amount
      );

      // Confirmar as comissões criadas
      const commissionIds = createdCommissions
        .map((c: any) => c.id)
        .filter(Boolean);
      if (commissionIds.length > 0) {
        await confirmCommissions(commissionIds);
      }

      // Atualizar totais de comissões para o afiliado
      await updateAffiliateCommissionTotals(payment.affiliateId);

      // Buscar dados do afiliado para notificação
      const affiliateResult = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.id, payment.affiliateId))
        .limit(1);

      if (affiliateResult.length > 0) {
        const affiliate = affiliateResult[0];
        // Criar notificação para o afiliado
        await createNotification({
          userId: affiliate.userId,
          type: "payment_confirmed",
          title: "Pagamento Confirmado",
          content: `Seu pagamento de R$ ${(payment.amount / 100).toFixed(2)} foi confirmado e as comissões foram calculadas.`,
          read: 0,
        });
      }

      return payment;
    }),

  /**
   * Cancelar pagamento e reverter comissões
   */
  cancelPayment: adminProcedure
    .input(z.object({ paymentId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Buscar o pagamento
      const paymentResult = await db
        .select()
        .from(payments)
        .where(eq(payments.id, input.paymentId))
        .limit(1);

      if (paymentResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment not found",
        });
      }

      const payment = paymentResult[0];

      // Atualizar status do pagamento para cancelled
      await db
        .update(payments)
        .set({ status: "cancelled" })
        .where(eq(payments.id, input.paymentId));

      // Cancelar comissões associadas
      await db
        .update(commissions)
        .set({ status: "cancelled" })
        .where(
          and(
            eq(commissions.source, "payment"),
            eq(commissions.sourceId, payment.id)
          )
        );

      // Atualizar totais de comissões
      if (payment.affiliateId) {
        await updateAffiliateCommissionTotals(payment.affiliateId);
      }

      return { success: true };
    }),

  /**
   * Gerar extrato de remuneração para um afiliado
   */
  generateRemunerationStatement: protectedProcedure
    .input(z.object({ affiliateId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      let targetAffiliateId = input.affiliateId;

      // Se não informou affiliateId, usa o do usuário
      if (!targetAffiliateId) {
        const affiliate = await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.userId, ctx.user.id))
          .limit(1);

        if (affiliate.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Affiliate profile not found",
          });
        }

        targetAffiliateId = affiliate[0].id;
      }

      // Se é afiliado, só pode ver seu próprio extrato
      if (
        ctx.user.role === "user" && // Assuming 'user' role is equivalent to 'affiliate' for this context

        targetAffiliateId !== (await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.userId, ctx.user.id))
          .limit(1)
          .then((r) => r[0]?.id))
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view your own statement",
        });
      }

      // Buscar comissões do afiliado
      const commissionsData = await db
        .select()
        .from(commissions)
        .where(eq(commissions.affiliateId, targetAffiliateId));

      // Calcular totais por status
      const totalConfirmed = commissionsData
        .filter((c) => c.status === "confirmed")
        .reduce((sum, c) => sum + c.amount, 0);

      const totalPending = commissionsData
        .filter((c) => c.status === "pending")
        .reduce((sum, c) => sum + c.amount, 0);

      const totalPaid = commissionsData
        .filter((c) => c.status === "paid")
        .reduce((sum, c) => sum + c.amount, 0);

      // Buscar dados do afiliado
      const affiliateResult = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.id, targetAffiliateId))
        .limit(1);

      const affiliate = affiliateResult[0];

      return {
        affiliateId: targetAffiliateId,
        affiliateName: affiliate?.affiliateCode || "Unknown",
        totalConfirmed,
        totalPending,
        totalPaid,
        totalEarnings: totalConfirmed + totalPaid,
        commissions: commissionsData,
        generatedAt: new Date(),
      };
    }),

  /**
   * Listar afiliados inadimplentes (pagamentos pendentes vencidos)
   */
  getDelinquentAffiliates: adminProcedure
    .input(z.object({ daysOverdue: z.number().default(30) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - input.daysOverdue);

      // Buscar pagamentos pendentes vencidos
      const delinquentPayments = await db
        .select({
          id: payments.id,
          affiliateId: payments.affiliateId,
          amount: payments.amount,
          createdAt: payments.createdAt,
        })
        .from(payments)
        .where(
          and(
            eq(payments.status, "pending"),
            lt(payments.createdAt, cutoffDate)
          )
        )
        .orderBy(desc(payments.createdAt));

      // Agrupar por afiliado
      const delinquentByAffiliate = new Map<
        number,
        { amount: number; count: number; oldestDate: Date }
      >();

      for (const payment of delinquentPayments) {
        if (!payment.affiliateId) continue;

        const existing = delinquentByAffiliate.get(payment.affiliateId);
        if (existing) {
          existing.amount += payment.amount;
          existing.count += 1;
          if (payment.createdAt < existing.oldestDate) {
            existing.oldestDate = payment.createdAt;
          }
        } else {
          delinquentByAffiliate.set(payment.affiliateId, {
            amount: payment.amount,
            count: 1,
            oldestDate: payment.createdAt,
          });
        }
      }

      // Buscar dados dos afiliados
      const result = [];
      for (const [affiliateId, data] of delinquentByAffiliate) {
        const affiliateResult = await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.id, affiliateId))
          .limit(1);

        if (affiliateResult.length > 0) {
          result.push({
            affiliateId,
            affiliateCode: affiliateResult[0].affiliateCode,
            totalAmount: data.amount,
            pendingCount: data.count,
            oldestPaymentDate: data.oldestDate,
            daysOverdue: Math.floor(
              (Date.now() - data.oldestDate.getTime()) / (1000 * 60 * 60 * 24)
            ),
          });
        }
      }

      return result.sort((a, b) => b.totalAmount - a.totalAmount);
    }),

  /**
   * Listar histórico de pagamentos de um afiliado
   */
  getPaymentHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      // Buscar afiliado do usuário
      const affiliate = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.userId, ctx.user.id))
        .limit(1);

      if (affiliate.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Affiliate profile not found",
        });
      }

      // Buscar pagamentos do afiliado
      return await db
        .select()
        .from(payments)
        .where(eq(payments.affiliateId, affiliate[0].id))
        .orderBy(desc(payments.createdAt))
        .limit(input.limit);
    }),

  /**
   * Obter detalhes de um pagamento específico
   */
  getPaymentDetails: protectedProcedure
    .input(z.object({ paymentId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const paymentResult = await db
        .select()
        .from(payments)
        .where(eq(payments.id, input.paymentId))
        .limit(1);

      if (paymentResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Payment not found",
        });
      }

      const payment = paymentResult[0];

      // Verificar permissão (admin ou próprio afiliado)
      if (ctx.user.role !== "admin") {
        const userAffiliate = await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.userId, ctx.user.id))
          .limit(1);

        if (
          userAffiliate.length === 0 ||
          userAffiliate[0].id !== payment.affiliateId
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to view this payment",
          });
        }
      }

      // Buscar comissões relacionadas
      const relatedCommissions = await db
        .select()
        .from(commissions)
        .where(
          and(
            eq(commissions.source, "payment"),
            eq(commissions.sourceId, payment.id)
          )
        );

      return {
        ...payment,
        relatedCommissions,
      };
    }),
});
