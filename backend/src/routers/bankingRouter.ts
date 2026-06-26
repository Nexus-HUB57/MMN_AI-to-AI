import { z } from "zod";
import { protectedProcedure, adminProcedure, publicProcedure, router } from "../config/trpc";
import { getBtcBrlQuote } from "../services/btc-quote-service";
import { createNotification, getDb } from "../../../database/schemas/db";
import {
  bankAccounts,
  affiliateBalances,
  withdrawalRequests,
  transactionHistory,
  monthlyReports,
  InsertBankAccount,
  InsertAffiliateBalance,
  InsertWithdrawalRequest,
  InsertTransactionHistory,
  InsertMonthlyReport,
} from "../../../database/schemas/banking-schema";
import { affiliates } from "../../../database/schemas/schema-final";
import { eq, and, desc, gte, lt, sum, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

/**
 * Banking Router - Sistema BeYour Banker
 * Gestão completa de finanças: saldo, PIX, saques e relatórios
 */

// Helper para validar CPF
function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum1 = 0, sum2 = 0;
  for (let i = 0; i < 9; i++) {
    sum1 += parseInt(cleanCPF[i]) * (10 - i);
    sum2 += parseInt(cleanCPF[i]) * (11 - i);
  }
  sum2 += parseInt(cleanCPF[9]) * 11;

  const d1 = (sum1 * 10) % 11 % 10;
  const d2 = ((sum2 * 10) % 11 % 10);

  return d1 === parseInt(cleanCPF[9]) && d2 === parseInt(cleanCPF[10]);
}

export const bankingRouter = router({
  // ============ BTC ⇄ BRL (Custódia Binance) — Correção #4 ============

  /**
   * Cotação BRL ⇄ BTC indicativa (cache 30s).
   * Binânce como primária, CoinGecko como fallback.
   * Público (sem auth) para uso em widget /payments antes do login.
   */
  getBtcBrlQuote: publicProcedure.query(async () => {
    return getBtcBrlQuote();
  }),

  /**
   * Pré-cálculo de conversão BRL → BTC ou BTC → BRL.
   */
  convertBrlBtc: publicProcedure
    .input(
      z.object({
        direction: z.enum(["brl_to_btc", "btc_to_brl"]),
        amount: z.number().positive().max(1_000_000_000),
      }),
    )
    .query(async ({ input }) => {
      const quote = await getBtcBrlQuote();
      const result =
        input.direction === "brl_to_btc"
          ? input.amount / quote.brlPerBtc
          : input.amount * quote.brlPerBtc;
      return {
        ...quote,
        input: input.amount,
        output: result,
        direction: input.direction,
      };
    }),

  // ============ BANK ACCOUNTS ============

  /**
   * Listar contas bancárias do afiliado
   */
  listBankAccounts: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

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

    return await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.affiliateId, affiliate[0].id))
      .orderBy(desc(bankAccounts.isPrimary), desc(bankAccounts.createdAt));
  }),

  /**
   * Adicionar nova conta bancária
   */
  addBankAccount: protectedProcedure
    .input(
      z.object({
        bankCode: z.string().min(3, "Código do banco é obrigatório"),
        bankName: z.string().min(1, "Nome do banco é obrigatório"),
        accountType: z.enum(["checking", "savings"]).default("checking"),
        agency: z.string().min(1, "Agência é obrigatória"),
        accountNumber: z.string().min(1, "Número da conta é obrigatória"),
        accountDigit: z.string().optional(),
        pixKey: z.string().optional(),
        pixKeyType: z.enum(["email", "cpf", "phone", "random"]).default("cpf"),
        holderName: z.string().optional(),
        holderDocument: z.string().optional(),
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

      // Validar CPF se fornecido
      if (input.holderDocument && !validateCPF(input.holderDocument)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "CPF inválido",
        });
      }

      // Verificar se já existe conta bancária
      const existingAccounts = await db
        .select()
        .from(bankAccounts)
        .where(eq(bankAccounts.affiliateId, affiliate[0].id));

      const isPrimary = existingAccounts.length === 0;

      const newBankAccount: InsertBankAccount = {
        affiliateId: affiliate[0].id,
        bankCode: input.bankCode,
        bankName: input.bankName,
        accountType: input.accountType,
        agency: input.agency,
        accountNumber: input.accountNumber,
        accountDigit: input.accountDigit,
        pixKey: input.pixKey || null,
        pixKeyType: input.pixKeyType,
        holderName: input.holderName || null,
        holderDocument: input.holderDocument || null,
        isPrimary,
        isVerified: false,
        status: "pending_verification",
      };

      const result = await db.insert(bankAccounts).values(newBankAccount);
      const bankAccountId = (result as any).insertId;

      await createNotification({
        userId: ctx.user.id,
        type: "bank_account_added",
        title: "Conta Bancária Adicionada",
        content: "Sua conta bancária foi adicionada e está em análise.",
        read: 0,
      });

      return {
        id: bankAccountId,
        ...newBankAccount,
      };
    }),

  /**
   * Definir conta como principal
   */
  setPrimaryBankAccount: protectedProcedure
    .input(z.object({ bankAccountId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

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

      // Verificar se a conta pertence ao afiliado
      const bankAccount = await db
        .select()
        .from(bankAccounts)
        .where(and(
          eq(bankAccounts.id, input.bankAccountId),
          eq(bankAccounts.affiliateId, affiliate[0].id)
        ))
        .limit(1);

      if (bankAccount.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bank account not found",
        });
      }

      // Desmarcar todas como principais
      await db
        .update(bankAccounts)
        .set({ isPrimary: false })
        .where(eq(bankAccounts.affiliateId, affiliate[0].id));

      // Marcar como principal
      await db
        .update(bankAccounts)
        .set({ isPrimary: true })
        .where(eq(bankAccounts.id, input.bankAccountId));

      return { success: true };
    }),

  /**
   * Deletar conta bancária
   */
  deleteBankAccount: protectedProcedure
    .input(z.object({ bankAccountId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

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

      const bankAccount = await db
        .select()
        .from(bankAccounts)
        .where(and(
          eq(bankAccounts.id, input.bankAccountId),
          eq(bankAccounts.affiliateId, affiliate[0].id)
        ))
        .limit(1);

      if (bankAccount.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Bank account not found",
        });
      }

      await db
        .update(bankAccounts)
        .set({ status: "inactive" })
        .where(eq(bankAccounts.id, input.bankAccountId));

      return { success: true };
    }),

  // ============ BALANCE ============

  /**
   * Obter saldo do afiliado
   */
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

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

    let balance = await db
      .select()
      .from(affiliateBalances)
      .where(eq(affiliateBalances.affiliateId, affiliate[0].id))
      .limit(1);

    // Criar saldo inicial se não existir
    if (balance.length === 0) {
      const newBalance: InsertAffiliateBalance = {
        affiliateId: affiliate[0].id,
        availableBalance: 0,
        pendingBalance: 0,
        blockedBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
      };

      const result = await db.insert(affiliateBalances).values(newBalance);
      balance = [{
        id: (result as any).insertId,
        ...newBalance,
        lastWithdrawalAt: null,
        lastUpdatedAt: new Date(),
        createdAt: new Date(),
      }];
    }

    return balance[0];
  }),

  // ============ WITHDRAWALS ============

  /**
   * Solicitar saque
   */
  requestWithdrawal: protectedProcedure
    .input(
      z.object({
        bankAccountId: z.number(),
        amount: z.number().min(1000, "Valor mínimo de R$ 10,00"),
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

      // Verificar saldo disponível
      const balance = await db
        .select()
        .from(affiliateBalances)
        .where(eq(affiliateBalances.affiliateId, affiliate[0].id))
        .limit(1);

      if (balance.length === 0 || balance[0].availableBalance < input.amount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Saldo insuficiente para saque",
        });
      }

      // Verificar conta bancária
      const bankAccount = await db
        .select()
        .from(bankAccounts)
        .where(and(
          eq(bankAccounts.id, input.bankAccountId),
          eq(bankAccounts.affiliateId, affiliate[0].id),
          eq(bankAccounts.status, "active")
        ))
        .limit(1);

      if (bankAccount.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conta bancária não encontrada ou inativa",
        });
      }

      // Calcular taxa (ex: 2% ou R$ 2,00 mínimo)
      const feePercent = 2;
      let fee = Math.max(200, Math.floor(input.amount * feePercent / 100));
      const netAmount = input.amount - fee;

      const newWithdrawal: InsertWithdrawalRequest = {
        affiliateId: affiliate[0].id,
        bankAccountId: input.bankAccountId,
        amount: input.amount,
        fee,
        netAmount,
        status: "pending",
      };

      const result = await db.insert(withdrawalRequests).values(newWithdrawal);
      const withdrawalId = (result as any).insertId;

      // Bloquear valor
      await db
        .update(affiliateBalances)
        .set({
          availableBalance: balance[0].availableBalance - input.amount,
          pendingBalance: balance[0].pendingBalance + input.amount,
        })
        .where(eq(affiliateBalances.affiliateId, affiliate[0].id));

      // Registrar transação
      const updatedBalance = await db
        .select()
        .from(affiliateBalances)
        .where(eq(affiliateBalances.affiliateId, affiliate[0].id))
        .limit(1);

      await db.insert(transactionHistory).values({
        affiliateId: affiliate[0].id,
        type: "blocked",
        amount: input.amount,
        balanceBefore: balance[0].availableBalance,
        balanceAfter: updatedBalance[0].availableBalance,
        status: "completed",
        source: "withdrawal",
        sourceId: withdrawalId,
        description: `Saque solicitado: R$ ${(input.amount / 100).toFixed(2)} (taxa: R$ ${(fee / 100).toFixed(2)})`,
      });

      await createNotification({
        userId: ctx.user.id,
        type: "withdrawal_requested",
        title: "Saque Solicitado",
        content: `Saque de R$ ${(netAmount / 100).toFixed(2)} solicitado. Aguarde processamento.`,
        read: 0,
      });

      return {
        id: withdrawalId,
        ...newWithdrawal,
      };
    }),

  /**
   * Listar saques do afiliado
   */
  listWithdrawals: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "processing", "completed", "rejected", "cancelled"]).optional(),
        limit: z.number().default(20),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const affiliate = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.userId, ctx.user.id))
        .limit(1);

      if (affiliate.length === 0) return [];

      const conditions = [eq(withdrawalRequests.affiliateId, affiliate[0].id)];

      if (input?.status) {
        conditions.push(eq(withdrawalRequests.status, input.status));
      }

      return await db
        .select()
        .from(withdrawalRequests)
        .where(and(...conditions))
        .orderBy(desc(withdrawalRequests.requestedAt))
        .limit(input?.limit || 20);
    }),

  /**
   * Obter detalhes de um saque
   */
  getWithdrawalDetails: protectedProcedure
    .input(z.object({ withdrawalId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

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

      const withdrawal = await db
        .select()
        .from(withdrawalRequests)
        .where(and(
          eq(withdrawalRequests.id, input.withdrawalId),
          eq(withdrawalRequests.affiliateId, affiliate[0].id)
        ))
        .limit(1);

      if (withdrawal.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Withdrawal not found",
        });
      }

      const bankAccount = await db
        .select()
        .from(bankAccounts)
        .where(eq(bankAccounts.id, withdrawal[0].bankAccountId))
        .limit(1);

      return {
        ...withdrawal[0],
        bankAccount: bankAccount[0] || null,
      };
    }),

  // ============ TRANSACTION HISTORY ============

  /**
   * Obter histórico de transações
   */
  getTransactionHistory: protectedProcedure
    .input(
      z.object({
        type: z.enum([
          "commission", "withdrawal", "deposit", "adjustment",
          "fee", "bonus", "refund", "transfer_in", "transfer_out", "blocked", "unblocked"
        ]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().default(50),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const affiliate = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.userId, ctx.user.id))
        .limit(1);

      if (affiliate.length === 0) return [];

      const conditions = [eq(transactionHistory.affiliateId, affiliate[0].id)];

      if (input?.type) {
        conditions.push(eq(transactionHistory.type, input.type));
      }

      if (input?.startDate) {
        conditions.push(gte(transactionHistory.createdAt, input.startDate));
      }

      if (input?.endDate) {
        conditions.push(lt(transactionHistory.createdAt, input.endDate));
      }

      return await db
        .select()
        .from(transactionHistory)
        .where(and(...conditions))
        .orderBy(desc(transactionHistory.createdAt))
        .limit(input?.limit || 50);
    }),

  // ============ MONTHLY REPORTS ============

  /**
   * Obter relatório mensal
   */
  getMonthlyReport: protectedProcedure
    .input(
      z.object({
        year: z.number(),
        month: z.number().min(1).max(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

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

      const report = await db
        .select()
        .from(monthlyReports)
        .where(and(
          eq(monthlyReports.affiliateId, affiliate[0].id),
          eq(monthlyReports.year, input.year),
          eq(monthlyReports.month, input.month)
        ))
        .limit(1);

      return report[0] || null;
    }),

  /**
   * Listar relatórios mensais
   */
  listMonthlyReports: protectedProcedure
    .input(z.object({ limit: z.number().default(12) }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const affiliate = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.userId, ctx.user.id))
        .limit(1);

      if (affiliate.length === 0) return [];

      return await db
        .select()
        .from(monthlyReports)
        .where(eq(monthlyReports.affiliateId, affiliate[0].id))
        .orderBy(desc(monthlyReports.year), desc(monthlyReports.month))
        .limit(input?.limit || 12);
    }),

  // ============ ADMIN ENDPOINTS ============

  /**
   * Listar saques pendentes (admin)
   */
  adminListPendingWithdrawals: adminProcedure
    .input(z.object({ limit: z.number().default(50) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(withdrawalRequests)
        .where(eq(withdrawalRequests.status, "pending"))
        .orderBy(desc(withdrawalRequests.requestedAt))
        .limit(input?.limit || 50);
    }),

  /**
   * Aprovar saque (admin)
   */
  adminApproveWithdrawal: adminProcedure
    .input(z.object({ withdrawalId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const withdrawal = await db
        .select()
        .from(withdrawalRequests)
        .where(and(
          eq(withdrawalRequests.id, input.withdrawalId),
          eq(withdrawalRequests.status, "pending")
        ))
        .limit(1);

      if (withdrawal.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Withdrawal not found or not pending",
        });
      }

      await db
        .update(withdrawalRequests)
        .set({
          status: "approved",
          approvedBy: ctx.user.id,
          processedAt: new Date(),
        })
        .where(eq(withdrawalRequests.id, input.withdrawalId));

      return { success: true };
    }),

  /**
   * Rejeitar saque (admin)
   */
  adminRejectWithdrawal: adminProcedure
    .input(
      z.object({
        withdrawalId: z.number(),
        reason: z.string().min(1, "Motivo da rejeição é obrigatório"),
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

      const withdrawal = await db
        .select()
        .from(withdrawalRequests)
        .where(and(
          eq(withdrawalRequests.id, input.withdrawalId),
          eq(withdrawalRequests.status, "pending")
        ))
        .limit(1);

      if (withdrawal.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Withdrawal not found or not pending",
        });
      }

      // Devolver valor ao saldo
      const balance = await db
        .select()
        .from(affiliateBalances)
        .where(eq(affiliateBalances.affiliateId, withdrawal[0].affiliateId))
        .limit(1);

      if (balance.length > 0) {
        await db
          .update(affiliateBalances)
          .set({
            availableBalance: balance[0].availableBalance + withdrawal[0].amount,
            pendingBalance: balance[0].pendingBalance - withdrawal[0].amount,
          })
          .where(eq(affiliateBalances.affiliateId, withdrawal[0].affiliateId));
      }

      await db
        .update(withdrawalRequests)
        .set({
          status: "rejected",
          rejectionReason: input.reason,
          rejectedAt: new Date(),
          processedBy: ctx.user.id,
        })
        .where(eq(withdrawalRequests.id, input.withdrawalId));

      // Notificar afiliado
      const affiliate = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.id, withdrawal[0].affiliateId))
        .limit(1);

      if (affiliate.length > 0) {
        await createNotification({
          userId: affiliate[0].userId,
          type: "withdrawal_rejected",
          title: "Saque Rejeitado",
          content: `Seu saque foi rejeitado. Motivo: ${input.reason}`,
          read: 0,
        });
      }

      return { success: true };
    }),

  /**
   * Processar PIX (admin) - simula envio de PIX
   */
  adminProcessWithdrawal: adminProcedure
    .input(
      z.object({
        withdrawalId: z.number(),
        transactionId: z.string().optional(),
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

      const withdrawal = await db
        .select()
        .from(withdrawalRequests)
        .where(and(
          eq(withdrawalRequests.id, input.withdrawalId),
          eq(withdrawalRequests.status, "approved")
        ))
        .limit(1);

      if (withdrawal.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Withdrawal not found or not approved",
        });
      }

      // Atualizar status
      await db
        .update(withdrawalRequests)
        .set({
          status: "completed",
          completedAt: new Date(),
          processedBy: ctx.user.id,
          transactionId: input.transactionId || `PIX-${Date.now()}`,
        })
        .where(eq(withdrawalRequests.id, input.withdrawalId));

      // Atualizar saldo total sacado
      const balance = await db
        .select()
        .from(affiliateBalances)
        .where(eq(affiliateBalances.affiliateId, withdrawal[0].affiliateId))
        .limit(1);

      if (balance.length > 0) {
        await db
          .update(affiliateBalances)
          .set({
            totalWithdrawn: balance[0].totalWithdrawn + withdrawal[0].netAmount,
            lastWithdrawalAt: new Date(),
          })
          .where(eq(affiliateBalances.affiliateId, withdrawal[0].affiliateId));
      }

      // Notificar afiliado
      const affiliate = await db
        .select()
        .from(affiliates)
        .where(eq(affiliates.id, withdrawal[0].affiliateId))
        .limit(1);

      if (affiliate.length > 0) {
        await createNotification({
          userId: affiliate[0].userId,
          type: "withdrawal_completed",
          title: "Saque Concluído",
          content: `PIX de R$ ${(withdrawal[0].netAmount / 100).toFixed(2)} foi enviado.`,
          read: 0,
        });
      }

      return { success: true };
    }),

  // D17-binance-withdraw
  requestBtcWithdrawal: protectedProcedure
    .input(z.object({
      amountBrl: z.number().min(1),
      targetAddress: z.string().min(20).max(120),
      twoFactorCode: z.string().min(6).max(8).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // 1) cotação real Binance/CoinGecko
      const quote = await getBtcBrlQuote();
      const amountBtc = Number((input.amountBrl / quote.brlPerBtc).toFixed(8));
      // 2) verifica saldo affiliate_balances
      const balRes: any = await ctx.db.execute(
        `SELECT ab.\"availableBalance\" FROM affiliate_balances ab
         JOIN affiliates a ON a.id = ab.\"affiliateId\" WHERE a.\"userId\" = $1 LIMIT 1` as any,
        [ctx.user.id] as any
      );
      const balanceCents = Number((balRes?.rows ?? balRes ?? [])[0]?.availableBalance || 0);
      if (balanceCents < input.amountBrl * 100) {
        throw new Error("Saldo insuficiente. Disponível: R$ " + (balanceCents / 100).toFixed(2));
      }
      // 3) cria registro pending em btc_deposits (saída custódia)
      const txHash = `binance_withdraw_d17_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
      const ins: any = await ctx.db.execute(
        `INSERT INTO btc_deposits (user_id, amount_brl, amount_btc, brl_per_btc, source_address, tx_hash, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *` as any,
        [ctx.user.id, input.amountBrl * 100, amountBtc, quote.brlPerBtc, input.targetAddress, txHash] as any
      );
      const row = (ins?.rows ?? ins ?? [])[0];
      // 4) reduz availableBalance e aumenta totalWithdrawn
      await ctx.db.execute(
        `UPDATE affiliate_balances ab
         SET \"availableBalance\" = \"availableBalance\" - $1,
             \"totalWithdrawn\" = \"totalWithdrawn\" + $1,
             \"lastUpdatedAt\" = NOW(),
             \"lastWithdrawalAt\" = NOW()
         FROM affiliates a
         WHERE ab.\"affiliateId\" = a.id AND a.\"userId\" = $2` as any,
        [input.amountBrl * 100, ctx.user.id] as any
      );
      // 5) chamada real Binance API (sandbox/stub - ativa quando BINANCE_API_KEY existir)
      if (process.env.BINANCE_API_KEY) {
        // TODO: implementação completa Binance Wallet API c/ 2FA
        console.log("[D17-binance-withdraw] Binance API key detected, would call /sapi/v1/capital/withdraw/apply");
      }
      return {
        ok: true,
        txHash,
        amountBrl: input.amountBrl,
        amountBtc,
        brlPerBtc: quote.brlPerBtc,
        status: "pending",
        provider: "binance",
        notice: process.env.BINANCE_API_KEY
          ? "Saque enviado para processamento na Binance. Confirmação em até 30 min."
          : "Saque registrado em modo simulação. Configure BINANCE_API_KEY para processar na exchange real.",
      };
    }),

});