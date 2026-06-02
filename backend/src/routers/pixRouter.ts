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
import { getOrSet, CACHE_KEYS, setCached, getCached, invalidateCachePattern } from "../services/cache-service";
import { isOpenPixAvailable, createOpenPixCharge, getOpenPixChargeStatus, mapOpenPixStatus } from "../services/openPixService";
import {
  createMercadoPagoCheckoutPreference,
  createMercadoPagoPixPayment,
  isMercadoPagoConfigured,
  resolveMercadoPagoCheckoutUrl,
} from "../services/mercadoPagoService";
import { TRPCError } from "@trpc/server";
import { getDb } from "../../../database/schemas/db";
import { payments } from "../../../database/schemas/schema-final";
import type { InferInsertModel } from "drizzle-orm";
import { eq, desc, and, gte, lte } from "drizzle-orm";

const PIX_RECEIVER_NAME = process.env.PIX_RECEIVER_NAME ?? "MMN AI-to-AI";
const PIX_RECEIVER_CITY = process.env.PIX_RECEIVER_CITY ?? "SAO PAULO";
const PIX_KEY = process.env.PIX_KEY ?? "";
const PIX_SANDBOX = process.env.PIX_SANDBOX === "true" || process.env.NODE_ENV !== "production";
const MARKETPLACE_PIX_KEY = process.env.MARKETPLACE_PIX_KEY?.trim() || PIX_KEY || "19992691954";
const MARKETPLACE_PIX_RECEIVER_NAME = process.env.MARKETPLACE_PIX_RECEIVER_NAME?.trim() || PIX_RECEIVER_NAME || "ONEVERSO MMN AI";
const MARKETPLACE_PIX_RECEIVER_CITY = process.env.MARKETPLACE_PIX_RECEIVER_CITY?.trim() || PIX_RECEIVER_CITY || "SAO PAULO";
const MARKETPLACE_PIX_BANK_LABEL = process.env.MARKETPLACE_PIX_BANK_LABEL?.trim() || "Nubank";

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
        cobUrl: z.string().url("URL de cobrança inválida").optional(),
        txid: z.string().max(35).optional(),
        description: z.string().max(140).optional(),
        payerName: z.string().optional(),
        payerEmail: z.string().email().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      // Produção com OpenPix: gerar cobrança dinâmica real
      if (!PIX_SANDBOX && isOpenPixAvailable()) {
        const correlationID =
          input.txid ?? `mmn-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

        const charge = await createOpenPixCharge({
          correlationID,
          value: Math.round(input.amount * 100),
          comment: input.description ?? `MMN AI-to-AI — R$ ${input.amount.toFixed(2)}`,
          expiresIn: 1800,
          customer: input.payerName
            ? {
                name: input.payerName,
                email: input.payerEmail,
              }
            : undefined,
          additionalInfo: [{ key: "Plataforma", value: "MMN AI-to-AI" }],
        });

        return {
          qrCodePayload: charge.charge.brCode ?? "",
          qrCodeImageUrl: charge.charge.qrCodeImage,
          paymentLinkUrl: charge.charge.paymentLinkUrl,
          txid: correlationID,
          amount: input.amount,
          type: "dynamic" as const,
          sandbox: false,
          expiresAt: charge.charge.expiresDate ?? expiresAt,
          openPixStatus: charge.charge.status,
        };
      }

      // Sandbox ou sem OpenPix: usar payload dinâmico local
      const cobUrl =
        input.cobUrl ?? `https://api.openpix.com.br/openpix/charge/brcode/${Date.now()}`;

      const result = generatePixDynamicPayload({
        url: cobUrl,
        merchantName: PIX_RECEIVER_NAME,
        merchantCity: PIX_RECEIVER_CITY,
        amount: input.amount,
        txid: input.txid,
      });

      return {
        qrCodePayload: result.fullPayload,
        qrCodeImageUrl: undefined,
        paymentLinkUrl: undefined,
        txid: result.txid,
        amount: result.amount,
        type: result.type,
        sandbox: PIX_SANDBOX,
        expiresAt,
        openPixStatus: undefined,
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
      const cacheKey = CACHE_KEYS.PIX_STATUS(input.txid);
      const cached = await getCached<{ status: string; paidAt?: string }>(cacheKey);
      if (cached) {
        return { ...cached, txid: input.txid, fromCache: true, sandbox: PIX_SANDBOX };
      }

      // Produção com OpenPix: consultar status real via API
      if (!PIX_SANDBOX && isOpenPixAvailable()) {
        try {
          const resp = await getOpenPixChargeStatus(input.txid);
          const status = mapOpenPixStatus(resp.charge.status);
          const result = {
            txid: input.txid,
            status,
            paidAt: resp.charge.paidAt ?? undefined,
            sandbox: false,
            fromCache: false,
          };
          if (status === "CONCLUIDA") {
            await setCached(cacheKey, result, 3600 * 24);
          }
          return result;
        } catch {
          // continua para fallback via DB
        }
      }

      // Fallback: consultar banco de dados
      const dbConn = await getDb();
      if (dbConn) {
        const [row] = await dbConn
          .select()
          .from(payments)
          .where(and(eq(payments.method, "pix"), eq(payments.bankNumber, input.txid.substring(0, 20))))
          .limit(1);
        if (row?.status === "confirmed") {
          return {
            txid: input.txid,
            status: "CONCLUIDA" as const,
            paidAt: row.paymentDate?.toISOString(),
            sandbox: PIX_SANDBOX,
            fromCache: false,
          };
        }
      }

      return {
        txid: input.txid,
        status: "ATIVA" as const,
        paidAt: undefined,
        sandbox: PIX_SANDBOX,
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

      // Invalidar cache do dashboard para forçar dados frescos no próximo load
      if (processed.length > 0) {
        await invalidateCachePattern(CACHE_KEYS.DASHBOARD_PATTERN).catch(() => undefined);
      }

      return { ok: true, processed };
    }),

  createMarketplaceCheckout: protectedProcedure
    .input(
      z.object({
        source: z.string().max(40).optional(),
        type: z.enum(["pack", "produto", "ebook", "skill", "subscription"]),
        slug: z.string().min(1).max(120),
        name: z.string().min(1).max(140),
        description: z.string().max(240).optional(),
        amountCents: z.number().int().min(1),
        returnUrl: z.string().url().optional(),
        payerEmail: z.string().email().optional(),
        payerName: z.string().max(120).optional(),
        payerDocument: z.string().max(18).optional(),
        subscriptionId: z.string().min(1).optional(),
        termMonths: z.union([
          z.literal(6),
          z.literal(12),
          z.literal(18),
          z.literal(24),
          z.literal(30),
          z.literal(36),
          z.literal(48),
        ]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const warnings: string[] = [];
      const amount = Number((input.amountCents / 100).toFixed(2));
      const runtimeUser = ctx.user as { id: number; role: string; email?: string; name?: string };
      const payerEmail = input.payerEmail?.trim() || runtimeUser.email?.trim() || undefined;
      const payerName = input.payerName?.trim() || runtimeUser.name?.trim() || undefined;
      const payerDocument = input.payerDocument?.replace(/\D/g, "") || undefined;
      const identification = payerDocument
        ? payerDocument.length === 11
          ? { type: "CPF" as const, number: payerDocument }
          : payerDocument.length === 14
            ? { type: "CNPJ" as const, number: payerDocument }
            : undefined
        : undefined;

      if (payerDocument && !identification) {
        warnings.push("Documento do pagador inválido para o Mercado Pago. O checkout continuará com fallback PIX manual.");
      }

      const externalReference = input.subscriptionId
        ? `subscription:${input.subscriptionId}:${runtimeUser.id}:${Date.now()}`
        : `${input.type}:${input.slug}:${runtimeUser.id}:${Date.now()}`;
      const fallbackPix = {
        pixKey: MARKETPLACE_PIX_KEY,
        keyType: detectPixKeyType(MARKETPLACE_PIX_KEY),
        receiverName: MARKETPLACE_PIX_RECEIVER_NAME,
        receiverCity: MARKETPLACE_PIX_RECEIVER_CITY,
        bankLabel: MARKETPLACE_PIX_BANK_LABEL,
      };

      const result = {
        amount,
        amountCents: input.amountCents,
        externalReference,
        mercadoPago: {
          configured: isMercadoPagoConfigured(),
          preferenceId: null as string | null,
          initPoint: null as string | null,
          sandboxInitPoint: null as string | null,
        },
        pix: {
          provider: "manual_key" as "manual_key" | "mercado_pago",
          paymentId: null as string | null,
          status: null as string | null,
          qrCode: null as string | null,
          qrCodeBase64: null as string | null,
          ticketUrl: null as string | null,
          expiresAt: null as string | null,
          fallback: fallbackPix,
        },
        warnings,
      };

      if (!isMercadoPagoConfigured()) {
        warnings.push("MERCADO_PAGO_ACCESS_TOKEN não configurado no servidor. O checkout manterá apenas o PIX manual com a chave definida.");
        return result;
      }

      try {
        const preference = await createMercadoPagoCheckoutPreference({
          slug: input.slug,
          title: input.name,
          description: input.description,
          amount,
          externalReference,
          payerEmail,
          payerName,
          backUrls: input.returnUrl
            ? {
                success: input.returnUrl,
                pending: input.returnUrl,
                failure: input.returnUrl,
              }
            : undefined,
          metadata: {
            source: input.source ?? "marketplace",
            type: input.type,
            slug: input.slug,
            userId: runtimeUser.id,
            subscriptionId: input.subscriptionId,
            termMonths: input.termMonths,
          },
        });

        result.mercadoPago = {
          configured: true,
          preferenceId: preference.id ?? null,
          initPoint: resolveMercadoPagoCheckoutUrl(preference),
          sandboxInitPoint: preference.sandbox_init_point ?? null,
        };
      } catch (error) {
        warnings.push(`Não foi possível criar o link do Mercado Pago: ${error instanceof Error ? error.message : "erro desconhecido"}.`);
      }

      if (!payerEmail) {
        warnings.push("O e-mail do comprador não está disponível na sessão atual. O QR PIX do Mercado Pago pode depender desse dado; o fallback com chave PIX manual permanece ativo.");
        return result;
      }

      try {
        const payment = await createMercadoPagoPixPayment({
          amount,
          description: input.description || input.name,
          payerEmail,
          payerFirstName: payerName,
          identification,
          externalReference,
          metadata: {
            source: input.source ?? "marketplace",
            type: input.type,
            slug: input.slug,
            userId: runtimeUser.id,
            subscriptionId: input.subscriptionId,
            termMonths: input.termMonths,
          },
        });

        const transactionData = payment.point_of_interaction?.transaction_data;
        if (transactionData?.qr_code || transactionData?.qr_code_base64 || transactionData?.ticket_url) {
          result.pix = {
            provider: "mercado_pago",
            paymentId: String(payment.id),
            status: payment.status ?? null,
            qrCode: transactionData.qr_code ?? null,
            qrCodeBase64: transactionData.qr_code_base64 ?? null,
            ticketUrl: transactionData.ticket_url ?? null,
            expiresAt: payment.date_of_expiration ?? null,
            fallback: fallbackPix,
          };
        } else {
          warnings.push("O Mercado Pago não retornou QR PIX nesta tentativa. O checkout exibirá a chave PIX manual como fallback.");
        }
      } catch (error) {
        warnings.push(`Não foi possível gerar o PIX dinâmico do Mercado Pago: ${error instanceof Error ? error.message : "erro desconhecido"}. O fluxo seguirá com a chave PIX manual.`);
      }

      return result;
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
      marketplaceFallback: {
        configured: !!MARKETPLACE_PIX_KEY,
        keyType: detectPixKeyType(MARKETPLACE_PIX_KEY),
        receiverName: MARKETPLACE_PIX_RECEIVER_NAME,
        receiverCity: MARKETPLACE_PIX_RECEIVER_CITY,
        bankLabel: MARKETPLACE_PIX_BANK_LABEL,
      },
    };
  }),

  /**
   * Lista o histórico de pagamentos PIX confirmados.
   * Admin vê todos; afiliado vê apenas os próprios.
   */
  listHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return { items: [], total: 0, sandbox: PIX_SANDBOX };
      }

      const conditions = [eq(payments.method, "pix")];
      if (input.startDate) {
        conditions.push(gte(payments.createdAt, new Date(input.startDate)));
      }
      if (input.endDate) {
        conditions.push(lte(payments.createdAt, new Date(input.endDate)));
      }

      const items = await db
        .select()
        .from(payments)
        .where(and(...conditions))
        .orderBy(desc(payments.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return {
        items: items.map((p) => ({
          id: p.id,
          amount: p.amount,
          status: p.status,
          txid: p.bankNumber ?? "",
          endToEndId: p.account ?? "",
          paymentDate: p.paymentDate?.toISOString() ?? null,
          confirmedAt: p.confirmedAt?.toISOString() ?? null,
          createdAt: p.createdAt.toISOString(),
        })),
        total: items.length,
        sandbox: PIX_SANDBOX,
      };
    }),

  /**
   * Solicita devolução (estorno) de um pagamento PIX.
   * Em produção: chama API OpenPix /api/v1/refund.
   * Em sandbox: simula a devolução.
   */
  refund: protectedProcedure
    .input(
      z.object({
        txid: z.string().min(1, "txid obrigatório"),
        correlationID: z.string().optional(),
        amount: z.number().min(0.01).optional(),
        reason: z.string().max(140).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const refundCorrelationID =
        input.correlationID ??
        `refund-${input.txid}-${Date.now().toString(36)}`;

      if (PIX_SANDBOX) {
        return {
          ok: true,
          refundCorrelationID,
          txid: input.txid,
          amount: input.amount ?? null,
          status: "REFUNDED_SIMULATED",
          sandbox: true,
          message: "Devolução simulada (sandbox). Em produção exige OPENPIX_TOKEN.",
        };
      }

      if (!isOpenPixAvailable()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Devolução PIX requer OPENPIX_TOKEN configurado em produção.",
        });
      }

      const OPENPIX_BASE_URL = "https://api.openpix.com.br/api/v1";
      const OPENPIX_TOKEN = process.env.OPENPIX_TOKEN ?? "";

      const body: Record<string, unknown> = {
        correlationID: refundCorrelationID,
        chargeCorrelationID: input.txid,
        comment: input.reason ?? "Devolução solicitada via MMN AI-to-AI",
      };
      if (input.amount !== undefined) {
        body.value = Math.round(input.amount * 100);
      }

      const res = await fetch(`${OPENPIX_BASE_URL}/refund`, {
        method: "POST",
        headers: {
          Authorization: OPENPIX_TOKEN,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `OpenPix refund error ${res.status}: ${errText}`,
        });
      }

      const data = await res.json();

      return {
        ok: true,
        refundCorrelationID,
        txid: input.txid,
        amount: input.amount ?? null,
        status: (data as { refund?: { status?: string } })?.refund?.status ?? "PENDING",
        sandbox: false,
        message: "Solicitação de devolução enviada ao OpenPix.",
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
