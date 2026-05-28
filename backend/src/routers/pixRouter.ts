/**
 * PIX Router — Epic 10.2
 *
 * Endpoints tRPC para geração de QR Code PIX, validação de chaves,
 * webhook de confirmação e simulação sandbox.
 */

import { z } from "zod";
import { router, protectedProcedure, publicProcedure, adminProcedure } from "../config/trpc";
import {
  generatePixStaticPayload,
  generatePixDynamicPayload,
  validatePixKey,
  detectPixKeyType,
  simulateSandboxConfirmation,
} from "../services/pixService";
import { getOrSet, CACHE_KEYS, setCached, getCached } from "../services/cache-service";
import { TRPCError } from "@trpc/server";
import { getDb } from "../../../database/schemas/db";
import { payments } from "../../../database/schemas/schema-final";
import type { InferInsertModel } from "drizzle-orm";

const PIX_RECEIVER_NAME = process.env.PIX_RECEIVER_NAME ?? "MMN AI-to-AI";
const PIX_RECEIVER_CITY = process.env.PIX_RECEIVER_CITY ?? "SAO PAULO";
const PIX_KEY = process.env.PIX_KEY ?? "";
const PIX_SANDBOX = process.env.PIX_SANDBOX === "true" || process.env.NODE_ENV !== "production";

export const pixRouter = router({
  /**
   * Gera um QR Code PIX estático para uma chave configurada no servidor.
   * Usado em checkout, página de pagamento etc.
   */
  generateStaticQr: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(0.01, "Valor mínimo é R$ 0,01"),
        description: z.string().max(72).optional(),
        txid: z.string().max(25).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!PIX_KEY) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Chave PIX não configurada no servidor (PIX_KEY).",
        });
      }

      const result = generatePixStaticPayload({
        pixKey: PIX_KEY,
        merchantName: PIX_RECEIVER_NAME,
        merchantCity: PIX_RECEIVER_CITY,
        amount: input.amount,
        description: input.description,
        txid: input.txid,
      });

      return {
        qrCodePayload: result.fullPayload,
        txid: result.txid,
        amount: result.amount,
        type: result.type,
        sandbox: PIX_SANDBOX,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      };
    }),

  /**
   * Gera um QR Code PIX dinâmico apontando para uma URL de cobrança.
   * Requer integração com PSP (ex. Celcoin, Sicoob) no ambiente de produção.
   */
  generateDynamicQr: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(0.01),
        cobUrl: z.string().url("URL de cobrança inválida"),
        txid: z.string().max(35).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const result = generatePixDynamicPayload({
        url: input.cobUrl,
        merchantName: PIX_RECEIVER_NAME,
        merchantCity: PIX_RECEIVER_CITY,
        amount: input.amount,
        txid: input.txid,
      });

      return {
        qrCodePayload: result.fullPayload,
        txid: result.txid,
        amount: result.amount,
        type: result.type,
        sandbox: PIX_SANDBOX,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      };
    }),

  /**
   * Valida uma chave PIX e retorna seu tipo.
   */
  validateKey: publicProcedure
    .input(z.object({ key: z.string().min(1) }))
    .query(async ({ input }) => {
      const validation = validatePixKey(input.key);
      return {
        key: input.key,
        valid: validation.valid,
        type: validation.type,
        message: validation.message,
      };
    }),

  /**
   * Verifica o status de um pagamento pelo txid.
   * Em produção: consulta API do PSP. Em sandbox: retorna confirmação simulada.
   */
  checkPaymentStatus: protectedProcedure
    .input(z.object({ txid: z.string() }))
    .query(async ({ input }) => {
      const cacheKey = `pix:status:${input.txid}`;
      const cached = await getCached<{ status: string; paidAt?: string }>(cacheKey);
      if (cached) {
        return { ...cached, fromCache: true, sandbox: PIX_SANDBOX };
      }

      if (PIX_SANDBOX) {
        const confirmation = simulateSandboxConfirmation(input.txid, 0);
        const result = {
          txid: input.txid,
          status: "ATIVA" as const,
          paidAt: undefined,
          sandbox: true,
          fromCache: false,
        };
        return result;
      }

      return {
        txid: input.txid,
        status: "ATIVA" as const,
        paidAt: undefined,
        sandbox: false,
        fromCache: false,
      };
    }),

  /**
   * Endpoint de webhook para confirmações de pagamento PIX (BCB / PSP).
   * Em produção: verificar assinatura e persistir no banco.
   */
  webhook: publicProcedure
    .input(
      z.object({
        pix: z.array(
          z.object({
            endToEndId: z.string(),
            txid: z.string().optional(),
            valor: z.string(),
            horario: z.string(),
            infoPagador: z.string().optional(),
            nomePagador: z.string().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ input }) => {
      const processed: string[] = [];
      const db = await getDb();

      for (const pix of input.pix) {
        const txid = pix.txid ?? pix.endToEndId;
        const cacheKey = `pix:status:${txid}`;
        const valorCents = Math.round(parseFloat(pix.valor) * 100);

        // 1. Atualizar cache (resposta imediata ao polling do frontend)
        await setCached(
          cacheKey,
          {
            status: "CONCLUIDA",
            paidAt: pix.horario,
            valor: pix.valor,
            endToEndId: pix.endToEndId,
          },
          3600 * 24,
        );

        // 2. Persistir no banco de pagamentos quando DB disponível
        if (db) {
          try {
            const newPayment = {
              affiliateId: 0,
              amount: valorCents,
              method: "pix" as const,
              status: "confirmed" as const,
              bankNumber: txid.substring(0, 20),
              account: pix.endToEndId.substring(0, 20),
              paymentDate: new Date(pix.horario),
              confirmedAt: new Date(),
            } satisfies Partial<InferInsertModel<typeof payments>>;

            await db.insert(payments).values(newPayment as InferInsertModel<typeof payments>);
          } catch (dbErr) {
            // não abortar o webhook por falha no DB — o cache já gravou
            process.stderr.write(
              JSON.stringify({
                level: "warn",
                tag: "pix-webhook-db",
                txid,
                error: String(dbErr),
              }) + "\n",
            );
          }
        }

        process.stdout.write(
          JSON.stringify({
            level: "info",
            tag: "pix-webhook",
            txid,
            endToEndId: pix.endToEndId,
            valor: pix.valor,
            horario: pix.horario,
          }) + "\n",
        );

        processed.push(txid);
      }

      return { ok: true, processed };
    }),

  /**
   * Retorna as configurações PIX públicas do servidor (sem expor a chave completa).
   */
  config: publicProcedure.query(() => {
    const keyType = PIX_KEY ? detectPixKeyType(PIX_KEY) : null;
    return {
      configured: !!PIX_KEY,
      keyType,
      receiverName: PIX_RECEIVER_NAME,
      receiverCity: PIX_RECEIVER_CITY,
      sandbox: PIX_SANDBOX,
    };
  }),

  /**
   * Admin: simula confirmação de pagamento (apenas sandbox).
   */
  sandboxConfirm: adminProcedure
    .input(
      z.object({
        txid: z.string(),
        amount: z.number().min(0.01),
        payerName: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!PIX_SANDBOX) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Simulação apenas disponível em modo sandbox.",
        });
      }

      const confirmation = simulateSandboxConfirmation(
        input.txid,
        input.amount,
        input.payerName,
      );

      const cacheKey = `pix:status:${input.txid}`;
      await setCached(
        cacheKey,
        {
          status: "CONCLUIDA",
          paidAt: confirmation.horario.liquidacao,
          valor: confirmation.valor.original,
          endToEndId: confirmation.endToEndId,
        },
        3600 * 24,
      );

      return { ok: true, confirmation };
    }),
});
