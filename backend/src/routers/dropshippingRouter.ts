import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "../config/trpc";
import { registerDropshippingOrder, updateDropshippingOrderStatus } from "../services/dropshippingService";
import { TRPCError } from "@trpc/server";
import { getAffiliateByUserId, getDb } from "../../../database/schemas/db";
import { orders, products } from "../../../database/schemas/schema-final";
import { and, desc, eq } from "drizzle-orm";

/**
 * Dropshipping Router - Gestão de pedidos de dropshipping
 * Implementa a Fase 8: Backend - Dropshipping Automatizado
 */

export const dropshippingRouter = router({
  /**
   * Listar pedidos do afiliado logado
   */
  getMyOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"]).optional(),
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

      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate) return [];

      const conditions = [eq(orders.affiliateId, affiliate.id)];
      if (input.status) {
        conditions.push(eq(orders.status, input.status));
      }

      return await db
        .select()
        .from(orders)
        .where(and(...conditions))
        .orderBy(desc(orders.createdAt))
        .limit(input.limit);
    }),

  /**
   * Obter detalhes de um pedido do afiliado logado
   */
  getOrderDetails: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Affiliate profile not found",
        });
      }

      const result = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, input.orderId), eq(orders.affiliateId, affiliate.id)))
        .limit(1);

      if (result.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pedido não encontrado",
        });
      }

      const order = result[0];
      const productResult = await db
        .select()
        .from(products)
        .where(eq(products.id, order.productId))
        .limit(1);

      return {
        ...order,
        product: productResult[0]
          ? {
              id: productResult[0].id,
              title: productResult[0].title,
              price: productResult[0].price,
              imageUrl: productResult[0].imageUrl,
              marketplace: productResult[0].marketplace,
            }
          : null,
      };
    }),

  /**
   * Registrar um novo pedido de dropshipping
   */
  registerOrder: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        affiliateId: z.number().optional(),
        customerName: z.string().min(1, "Nome do cliente é obrigatório"),
        customerEmail: z.string().email("Email do cliente inválido"),
        shippingAddress: z.string().min(1, "Endereço de entrega é obrigatório"),
        quantity: z.number().min(1, "Quantidade deve ser no mínimo 1").default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        return await registerDropshippingOrder(input, ctx.user.id);
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao registrar pedido de dropshipping",
        });
      }
    }),

  /**
   * Atualizar status de um pedido de dropshipping
   */
  updateOrderStatus: adminProcedure
    .input(
      z.object({
        orderId: z.number(),
        newStatus: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        return await updateDropshippingOrderStatus(input.orderId, input.newStatus);
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao atualizar status do pedido",
        });
      }
    }),
});
