import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "../config/trpc";
import { getDb } from "../../../database/schemas/db";
import {
  payments,
  commissions,
  affiliates,
  InsertPayment,
  InsertCommission,
} from "../../../database/schemas/schema-final";
import { eq, and, desc, gte, lt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { addCommissionProcessingJob } from "../config/queue";
import { updateAffiliateCommissionTotals } from "../services/commissions";
import { createNotification } from "../../../database/schemas/db";

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

      // Adicionar job para processamento assíncrono de comissões
      await addCommissionProcessingJob({
        orderId: payment.id.toString(), // Usar o ID do pagamento como orderId para rastreamento
        userId: payment.affiliateId.toString(),
        amount: payment.amount,
        commissionType: "payment", // Novo tipo para comissões de pagamento
        metadata: { paymentId: payment.id, affiliateId: payment.affiliateId, paymentAmount: payment.amount },
      });

      // Notificar que o processamento de comissões foi enfileirado
      await createNotification({
        userId: payment.affiliateId, // Assumindo que payment.affiliateId é o userId do afiliado para a notificação
        type: "commission_processing_queued",
        title: "Processamento de Comissão Enfileirado",
        content: `O processamento das comissões para o pagamento de R$ ${(payment.amount / 100).toFixed(2)} foi enfileirado.`, 
        read: 0,
      });

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
        targetAffiliateId !== ctx.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view your own remuneration statement",
        });
      }

      // Buscar todas as comissões do afiliado
      const affiliateCommissions = await db
        .select()
        .from(commissions)
        .where(eq(commissions.affiliateId, targetAffiliateId))
        .orderBy(desc(commissions.createdAt));

      // Calcular totais
      const totalConfirmed = affiliateCommissions
        .filter((c) => c.status === "confirmed")
        .reduce((sum, c) => sum + c.amount, 0);
      const totalPaid = affiliateCommissions
        .filter((c) => c.status === "paid")
        .reduce((sum, c) => sum + c.amount, 0);
      const totalPending = affiliateCommissions
        .filter((c) => c.status === "pending")
        .reduce((sum, c) => sum + c.amount, 0);

      return {
        affiliateId: targetAffiliateId,
        commissions: affiliateCommissions,
        totals: {
          confirmed: totalConfirmed,
          paid: totalPaid,
          pending: totalPending,
          availableForWithdrawal: totalConfirmed - totalPaid,
        },
      };
    }),

  /**
   * Listar todos os pagamentos (apenas admin)
   */
  listAllPayments: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(payments)
      .orderBy(desc(payments.createdAt));
  }),

  /**
   * Listar comissões de um afiliado
   */
  listAffiliateCommissions: protectedProcedure
    .input(z.object({ affiliateId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

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

      // Se é afiliado, só pode ver suas próprias comissões
      if (
        ctx.user.role === "user" &&
        targetAffiliateId !== ctx.user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only view your own commissions",
        });
      }

      return await db
        .select()
        .from(commissions)
        .where(eq(commissions.affiliateId, targetAffiliateId))
        .orderBy(desc(commissions.createdAt));
    }),

  /**
   * Listar todas as comissões (apenas admin)
   */
  listAllCommissions: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    return await db
      .select()
      .from(commissions)
      .orderBy(desc(commissions.createdAt));
  }),

  /**
   * Exportar comissões de um afiliado como CSV (Epic 10.9.1)
   * Admin pode exportar de qualquer afiliado; afiliado exporta apenas as próprias.
   */
  exportCommissionsCsv: protectedProcedure
    .input(
      z.object({
        affiliateId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.enum(["pending", "confirmed", "paid", "cancelled"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }

      let targetAffiliateId = input.affiliateId;

      if (!targetAffiliateId) {
        const affiliate = await db
          .select()
          .from(affiliates)
          .where(eq(affiliates.userId, ctx.user.id))
          .limit(1);
        if (affiliate.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Perfil de afiliado não encontrado." });
        }
        targetAffiliateId = affiliate[0].id;
      }

      if (ctx.user.role === "user" && targetAffiliateId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Você só pode exportar suas próprias comissões." });
      }

      const conditions: ReturnType<typeof eq>[] = [eq(commissions.affiliateId, targetAffiliateId)];
      if (input.status) conditions.push(eq(commissions.status, input.status));

      const rows = await db
        .select()
        .from(commissions)
        .where(and(...conditions))
        .orderBy(desc(commissions.createdAt));

      // Filtrar por data (em memória, já que datas podem ser strings ISO)
      const filtered = rows.filter((r) => {
        if (input.startDate && r.createdAt < new Date(input.startDate)) return false;
        if (input.endDate && r.createdAt > new Date(input.endDate)) return false;
        return true;
      });

      // Gerar CSV
      const csvLines: string[] = [
        "id,affiliateId,amount,status,source,sourceId,type,createdAt",
        ...filtered.map((r) =>
          [
            r.id,
            r.affiliateId,
            (r.amount / 100).toFixed(2),
            r.status,
            r.source ?? "",
            r.sourceId ?? "",
            r.commissionType ?? "payment",
            r.createdAt.toISOString(),
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(","),
        ),
      ];

      const csvContent = csvLines.join("\r\n");
      const csvBase64 = Buffer.from(csvContent, "utf-8").toString("base64");
      const filename = `comissoes_afiliado_${targetAffiliateId}_${new Date().toISOString().substring(0, 10)}.csv`;

      return {
        csvBase64,
        filename,
        totalRows: filtered.length,
        affiliateId: targetAffiliateId,
      };
    }),

  /**
   * Marcar comissões como pagas (apenas admin)
   */
  markCommissionsAsPaid: adminProcedure
    .input(z.object({ commissionIds: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      for (const id of input.commissionIds) {
        await db
          .update(commissions)
          .set({ status: "paid" })
          .where(eq(commissions.id, id));
      }

      // Atualizar totais de comissões para cada afiliado afetado
      const affectedAffiliateIds = await db
        .selectDistinct({ affiliateId: commissions.affiliateId })
        .from(commissions)
        .where(eq(commissions.id, input.commissionIds[0])); // Supondo que todas as comissões são do mesmo afiliado para simplificar

      for (const { affiliateId } of affectedAffiliateIds) {
        if (affiliateId) {
          await updateAffiliateCommissionTotals(affiliateId);
        }
      }

      return { success: true };
    }),
});
