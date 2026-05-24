import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "../config/trpc";
import { registerDropshippingOrder, updateDropshippingOrderStatus } from "../services/dropshippingService";
import { TRPCError } from "@trpc/server";

/**
 * Dropshipping Router - Gestão de pedidos de dropshipping
 * Implementa a Fase 8: Backend - Dropshipping Automatizado
 */

export const dropshippingRouter = router({
  /**
   * Registrar um novo pedido de dropshipping
   */
  registerOrder: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        affiliateId: z.number().optional(), // Opcional, se não fornecido, usa o ID do afiliado do usuário logado
        customerName: z.string().min(1, "Nome do cliente é obrigatório"),
        customerEmail: z.string().email("Email do cliente inválido"),
        shippingAddress: z.string().min(1, "Endereço de entrega é obrigatório"),
        quantity: z.number().min(1, "Quantidade deve ser no mínimo 1").default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const newOrder = await registerDropshippingOrder(input, ctx.user.id);
        return newOrder;
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
        const result = await updateDropshippingOrderStatus(input.orderId, input.newStatus);
        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Falha ao atualizar status do pedido de dropshipping",
        });
      }
    }),
});
