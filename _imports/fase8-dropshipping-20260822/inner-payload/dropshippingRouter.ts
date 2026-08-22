import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { getDb, createNotification, getAffiliateByUserId } from "./db";
import {
  orders,
  products,
  affiliates,
  InsertOrder,
} from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { calculateConsumptionCommission, confirmCommissions, updateAffiliateCommissionTotals } from "./commissions";

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
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Obter informações do produto
      const productResult = await db
        .select()
        .from(products)
        .where(eq(products.id, input.productId))
        .limit(1);

      if (productResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Produto não encontrado",
        });
      }
      const product = productResult[0];

      // Determinar o affiliateId
      let actualAffiliateId = input.affiliateId;
      if (!actualAffiliateId) {
        const affiliate = await getAffiliateByUserId(ctx.user.id);
        if (!affiliate) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Perfil de afiliado não encontrado para o usuário logado",
          });
        }
        actualAffiliateId = affiliate.id;
      }

      const amount = product.price * input.quantity;
      const commissionAmount = Math.floor((amount * product.commissionPercentage) / 100);

      const newOrder: InsertOrder = {
        affiliateId: actualAffiliateId,
        productId: input.productId,
        externalOrderId: `DROPSHIP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        marketplace: product.marketplace, // Usar o marketplace do produto
        amount: amount,
        commissionAmount: commissionAmount,
        status: "pending",
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        shippingAddress: input.shippingAddress, // Adicionar campo de endereço de entrega
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.insert(orders).values(newOrder);
      const orderId = (result as any).insertId;

      // Notificação ao fornecedor (placeholder)
      await createNotification({
        userId: 1, // Assumindo que o userId 1 é o admin/fornecedor
        type: "new_dropshipping_order",
        title: `Novo Pedido Dropshipping #${orderId}`,
        content: `Um novo pedido de dropshipping para o produto '${product.title}' (ID: ${product.id}) foi registrado. Cliente: ${input.customerName}, Email: ${input.customerEmail}, Endereço: ${input.shippingAddress}.`,
      });

      // Notificação ao cliente
      await createNotification({
        userId: ctx.user.id, // Notificar o usuário que fez o pedido (afiliado)
        type: "order_confirmation",
        title: `Confirmação do Pedido #${orderId}`,
        content: `Seu pedido para '${product.title}' foi registrado com sucesso e está aguardando processamento.`, // Conteúdo mais amigável para o cliente
      });

      return {
        id: orderId,
        ...newOrder,
      };
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
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const orderResult = await db
        .select()
        .from(orders)
        .where(eq(orders.id, input.orderId))
        .limit(1);

      if (orderResult.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pedido não encontrado",
        });
      }
      const order = orderResult[0];

      await db
        .update(orders)
        .set({
          status: input.newStatus,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, input.orderId));

      // Se o status for 'delivered', calcular comissão
      if (input.newStatus === "delivered") {
        const createdCommission = await calculateConsumptionCommission(
          order.affiliateId,
          order.amount
        );
        if (createdCommission) {
          await confirmCommissions([createdCommission.id]);
          await updateAffiliateCommissionTotals(order.affiliateId);

          // Notificação ao afiliado sobre comissão
          const affiliate = await db.select().from(affiliates).where(eq(affiliates.id, order.affiliateId)).limit(1);
          if (affiliate.length > 0) {
            await createNotification({
              userId: affiliate[0].userId,
              type: "commission_credited",
              title: `Comissão Creditada - Pedido #${order.id}`,
              content: `Sua comissão de R$ ${(createdCommission.amount / 100).toFixed(2)} do pedido #${order.id} foi creditada.`, // Conteúdo mais amigável para o afiliado
            });
          }
        }
      }

      // Notificação ao cliente sobre atualização de status
      // TODO: Buscar o userId do cliente, ou enviar por email diretamente
      // Por enquanto, vamos notificar o afiliado que o pedido do cliente foi atualizado
      const affiliate = await db.select().from(affiliates).where(eq(affiliates.id, order.affiliateId)).limit(1);
      if (affiliate.length > 0) {
        await createNotification({
          userId: affiliate[0].userId,
          type: "order_status_update",
          title: `Status do Pedido #${order.id} Atualizado`,
          content: `O status do pedido #${order.id} do cliente ${order.customerName} foi atualizado para '${input.newStatus}'.`,
        });
      }

      return { success: true };
    }),
});
