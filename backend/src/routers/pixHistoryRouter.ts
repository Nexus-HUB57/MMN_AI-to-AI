/**
 * PIX History Router - Histórico de cobranças PIX
 *
 * Endpoints para visualização de histórico de transações PIX
 * Admin e Afiliados
 *
 * @version 1.0.0 - Sprint 10.3 - Nexus Partners SaaS
 */

import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "@/trpc/trpc";
import { getOpenPixService } from "@/services/openPixService";
import { cacheService, CACHE_KEYS, CACHE_TTL } from "@/services/cache-service";

const t = initTRPC.create();

/**
 * Schema de validação para histórico PIX
 */
const PixHistoryOrderBySchema = z.enum([
  "createdAt_desc",
  "createdAt_asc",
  "amount_desc",
  "amount_asc",
  "status_asc",
]);

const PixHistoryFiltersSchema = z.object({
  status: z.enum(["all", "pending", "paid", "expired"]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minAmount: z.number().int().positive().optional(),
  maxAmount: z.number().int().positive().optional(),
  search: z.string().max(100).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  orderBy: PixHistoryOrderBySchema.default("createdAt_desc"),
});

type PixHistoryFilters = z.infer<typeof PixHistoryFiltersSchema>;

/**
 * Schema para detalhes de uma cobrança PIX
 */
const PixChargeDetailSchema = z.object({
  id: z.string(),
  status: z.enum(["open", "used", "expired", "deleted"]),
  valor: z.number(),
  comentario: z.string().nullable(),
  transactionId: z.string(),
  qrCode: z.object({
    copyPaste: z.string(),
    base64: z.string().nullable(),
    imageUrl: z.string().nullable(),
  }),
  createdAt: z.string(),
  expiresAt: z.string().nullable(),
  destination: z.object({
    name: z.string(),
    taxId: z.string(),
  }).nullable(),
});

/**
 * Função auxiliar para validar acesso à transação
 */
function canAccessPixTransaction(
  txid: string,
  userId: number,
  userRole: string,
  associatedTxids: string[]
): boolean {
  // Admins podem ver todas
  if (userRole === "super_admin" || userRole === "admin" || userRole === "manager") {
    return true;
  }

  // Verifica se a transação pertence ao usuário
  return associatedTxids.includes(txid);
}

/**
 * Router PIX History
 */
export const pixHistoryRouter = router({
  /**
   * Lista histórico de transações PIX do usuário
   * GET /pix/history/list
   */
  list: protectedProcedure
    .input(PixHistoryFiltersSchema)
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      const openPix = getOpenPixService();

      // Verifica se está configurado
      if (!openPix.isConfigured()) {
        // Retorna dados do cache/sandbox
        const cacheKey = `${CACHE_KEYS.PIX_STATUS}:${user.id}`;
        const cached = cacheService.get<{
          items: Array<{
            id: string;
            txid: string;
            amount: number;
            description: string;
            status: "pending" | "paid" | "expired";
            createdAt: string;
            paidAt?: string;
          }>;
          total: number;
          page: number;
          totalPages: number;
        }>(cacheKey);

        if (cached) {
          return cached;
        }

        return {
          items: [],
          total: 0,
          page: input.page,
          totalPages: 0,
        };
      }

      try {
        // Busca cobranças do OpenPix
        const charges = await openPix.listCharges({
          page: input.page,
          limit: input.limit,
          startsAt: input.startDate,
          endsAt: input.endDate,
          status: input.status === "all" ? undefined : input.status === "paid" ? "used" : input.status === "pending" ? "open" : input.status,
        });

        // Filtra por usuário (via TXID ou dados do cliente)
        let items = charges.charges.map((charge) => ({
          id: charge.id,
          txid: charge.transactionId,
          amount: charge.valor,
          description: charge.comentario ?? "Cobrança PIX",
          status: charge.status === "used" ? "paid" as const : charge.status === "expired" ? "expired" as const : "pending" as const,
          createdAt: charge.createdAt,
          paidAt: charge.status === "used" ? charge.createdAt : undefined,
        }));

        // Filtros adicionais em memória
        if (input.minAmount) {
          items = items.filter(i => i.amount >= input.minAmount!);
        }
        if (input.maxAmount) {
          items = items.filter(i => i.amount <= input.maxAmount!);
        }
        if (input.search) {
          const search = input.search.toLowerCase();
          items = items.filter(i =>
            i.txid.toLowerCase().includes(search) ||
            i.description.toLowerCase().includes(search)
          );
        }

        // Ordenação
        items.sort((a, b) => {
          switch (input.orderBy) {
            case "createdAt_desc":
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            case "createdAt_asc":
              return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            case "amount_desc":
              return b.amount - a.amount;
            case "amount_asc":
              return a.amount - b.amount;
            default:
              return 0;
          }
        });

        const total = charges.pageInfo.totalCount;
        const totalPages = charges.pageInfo.totalPages;

        return {
          items,
          total,
          page: input.page,
          totalPages,
        };
      } catch (error) {
        console.error("Erro ao buscar histórico PIX:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar histórico de transações PIX",
        });
      }
    }),

  /**
   * Detalhes de uma cobrança PIX específica
   * GET /pix/history/:txid
   */
  getDetails: protectedProcedure
    .input(z.object({ txid: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      const openPix = getOpenPixService();

      // Primeiro tenta buscar diretamente
      if (!openPix.isConfigured()) {
        // Tenta buscar do cache
        const cacheKey = `${CACHE_KEYS.PIX_STATUS}:${input.txid}`;
        const cached = cacheService.get<{
          id: string;
          txid: string;
          amount: number;
          description: string;
          status: "pending" | "paid" | "expired";
          qrCode?: {
            copyPaste: string;
            base64: string | null;
            imageUrl: string | null;
          };
          createdAt: string;
          expiresAt: string;
          destination?: {
            name: string;
            taxId: string;
          };
        }>(cacheKey);

        if (cached) {
          return cached;
        }
      }

      try {
        // Busca todas as cobranças e filtra pela TXID
        const charges = await openPix.listCharges({ limit: 100 });
        const charge = charges.charges.find(c => c.transactionId === input.txid);

        if (!charge) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cobrança PIX não encontrada",
          });
        }

        return {
          id: charge.id,
          txid: charge.transactionId,
          amount: charge.valor,
          description: charge.comentario ?? "Cobrança PIX",
          status: charge.status === "used" ? "paid" as const : charge.status === "expired" ? "expired" as const : "pending" as const,
          qrCode: {
            copyPaste: charge.qrCode.copyPaste,
            base64: null,
            imageUrl: charge.qrCode.imageUrl,
          },
          createdAt: charge.createdAt,
          expiresAt: charge.expiresAt,
          destination: charge.destination,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;

        console.error("Erro ao buscar detalhes PIX:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar detalhes da cobrança PIX",
        });
      }
    }),

  /**
   * Admin: Lista todas as transações PIX (dashboard admin)
   * GET /admin/pix/history
   */
  listAll: adminProcedure
    .input(PixHistoryFiltersSchema.extend({
      page: z.number().int().min(1).default(1),
      limit: z.number().int().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx;
      const openPix = getOpenPixService();

      // Verifica cache primeiro
      const cacheKey = `${CACHE_KEYS.PIX_STATUS}:admin:${input.page}:${input.limit}`;
      const cached = cacheService.get<{
        items: Array<{
          id: string;
          txid: string;
          amount: number;
          description: string;
          status: "pending" | "paid" | "expired";
          createdAt: string;
          paidAt?: string;
          endToEndId?: string;
        }>;
        total: number;
        page: number;
        totalPages: number;
        stats: {
          totalAmount: number;
          paidAmount: number;
          pendingAmount: number;
          paidCount: number;
          pendingCount: number;
          expiredCount: number;
        };
      }>(cacheKey);

      if (cached) {
        return cached;
      }

      if (!openPix.isConfigured()) {
        return {
          items: [],
          total: 0,
          page: input.page,
          totalPages: 0,
          stats: {
            totalAmount: 0,
            paidAmount: 0,
            pendingAmount: 0,
            paidCount: 0,
            pendingCount: 0,
            expiredCount: 0,
          },
        };
      }

      try {
        const charges = await openPix.listCharges({
          page: input.page,
          limit: input.limit,
          startsAt: input.startDate,
          endsAt: input.endDate,
          status: input.status === "all" ? undefined : input.status === "paid" ? "used" : input.status === "pending" ? "open" : input.status,
        });

        let items = charges.charges.map((charge) => ({
          id: charge.id,
          txid: charge.transactionId,
          amount: charge.valor,
          description: charge.comentario ?? "Cobrança PIX",
          status: charge.status === "used" ? "paid" as const : charge.status === "expired" ? "expired" as const : "pending" as const,
          createdAt: charge.createdAt,
          paidAt: charge.status === "used" ? charge.createdAt : undefined,
          endToEndId: undefined,
        }));

        // Estatísticas
        const stats = {
          totalAmount: items.reduce((sum, i) => sum + i.amount, 0),
          paidAmount: items.filter(i => i.status === "paid").reduce((sum, i) => sum + i.amount, 0),
          pendingAmount: items.filter(i => i.status === "pending").reduce((sum, i) => sum + i.amount, 0),
          paidCount: items.filter(i => i.status === "paid").length,
          pendingCount: items.filter(i => i.status === "pending").length,
          expiredCount: items.filter(i => i.status === "expired").length,
        };

        // Cache por 30 segundos
        cacheService.set(cacheKey, { items, total: charges.pageInfo.totalCount, page: input.page, totalPages: charges.pageInfo.totalPages, stats }, CACHE_TTL.X_SHORT);

        return {
          items,
          total: charges.pageInfo.totalCount,
          page: input.page,
          totalPages: charges.pageInfo.totalPages,
          stats,
        };
      } catch (error) {
        console.error("Erro ao buscar histórico admin PIX:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao buscar histórico de transações PIX",
        });
      }
    }),

  /**
   * Admin: Estatísticas consolidadas PIX
   * GET /admin/pix/stats
   */
  getStats: adminProcedure.query(async () => {
    const openPix = getOpenPixService();

    // Verifica cache
    const cacheKey = `${CACHE_KEYS.PIX_STATUS}:admin:stats`;
    const cached = cacheService.get<{
      totalTransactions: number;
      totalAmount: number;
      paidCount: number;
      paidAmount: number;
      pendingCount: number;
      pendingAmount: number;
      expiredCount: number;
      averageTicket: number;
      lastUpdated: string;
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    if (!openPix.isConfigured()) {
      return {
        totalTransactions: 0,
        totalAmount: 0,
        paidCount: 0,
        paidAmount: 0,
        pendingCount: 0,
        pendingAmount: 0,
        expiredCount: 0,
        averageTicket: 0,
        lastUpdated: new Date().toISOString(),
      };
    }

    try {
      // Busca cobranças dos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const charges = await openPix.listCharges({
        startsAt: thirtyDaysAgo.toISOString(),
        limit: 100,
      });

      const items = charges.charges;

      const paidItems = items.filter(c => c.status === "used");
      const pendingItems = items.filter(c => c.status === "open");
      const expiredItems = items.filter(c => c.status === "expired");

      const stats = {
        totalTransactions: items.length,
        totalAmount: items.reduce((sum, c) => sum + c.valor, 0),
        paidCount: paidItems.length,
        paidAmount: paidItems.reduce((sum, c) => sum + c.valor, 0),
        pendingCount: pendingItems.length,
        pendingAmount: pendingItems.reduce((sum, c) => sum + c.valor, 0),
        expiredCount: expiredItems.length,
        averageTicket: paidItems.length > 0
          ? paidItems.reduce((sum, c) => sum + c.valor, 0) / paidItems.length
          : 0,
        lastUpdated: new Date().toISOString(),
      };

      // Cache por 1 minuto
      cacheService.set(cacheKey, stats, CACHE_TTL.X_SHORT);

      return stats;
    } catch (error) {
      console.error("Erro ao buscar estatísticas PIX:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao buscar estatísticas PIX",
      });
    }
  }),

  /**
   * Solicita estorno de uma transação PIX (admin)
   * POST /admin/pix/refund
   */
  requestRefund: adminProcedure
    .input(z.object({
      txid: z.string().min(1),
      reason: z.string().min(1).max(200).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const openPix = getOpenPixService();

      if (!openPix.isConfigured()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Serviço PIX não configurado para estornos",
        });
      }

      try {
        const refund = await openPix.refundPix({
          transactionId: input.txid,
          reason: input.reason,
        });

        // Log da operação
        console.log(`[PIX REFUND] User ${user.id} solicitou estorno TXID=${input.txid} Reason=${input.reason}`);

        return {
          status: refund.status,
          value: refund.value,
          correlationId: refund.correlationId,
          reason: refund.reason,
          createdAt: refund.createdAt,
        };
      } catch (error) {
        console.error("Erro ao processar estorno PIX:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao processar estorno PIX",
        });
      }
    }),

  /**
   * Exporta histórico PIX em formato CSV (admin)
   * GET /admin/pix/export
   */
  export: adminProcedure
    .input(z.object({
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      status: z.enum(["all", "pending", "paid", "expired"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const openPix = getOpenPixService();

      if (!openPix.isConfigured()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Serviço PIX não configurado para exportação",
        });
      }

      try {
        const charges = await openPix.listCharges({
          startsAt: input.startDate,
          endsAt: input.endDate,
          status: input.status === "all" ? undefined : input.status === "paid" ? "used" : input.status === "pending" ? "open" : input.status,
          limit: 1000,
        });

        // Gera CSV
        const headers = ["ID", "TXID", "Valor (R$)", "Status", "Descrição", "Criado em", "Vence em"];
        const rows = charges.charges.map(c => [
          c.id,
          c.transactionId,
          (c.valor / 100).toFixed(2),
          c.status,
          c.comentario ?? "",
          c.createdAt,
          c.expiresAt ?? "",
        ]);

        const csv = [headers, ...rows].map(row => row.join(",")).join("\n");

        return {
          filename: `pix_history_${new Date().toISOString().split("T")[0]}.csv`,
          content: csv,
          mimeType: "text/csv",
        };
      } catch (error) {
        console.error("Erro ao exportar histórico PIX:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao exportar histórico PIX",
        });
      }
    }),
});

export type PixHistoryRouter = typeof pixHistoryRouter;
