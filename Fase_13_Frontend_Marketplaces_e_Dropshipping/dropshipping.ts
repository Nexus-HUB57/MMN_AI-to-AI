import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { 
  getOrdersByAffiliate, 
  getOrderById, 
  getOrderStatusHistory,
  getAffiliateByUserId,
  getProductById,
  createNotification,
} from "./db";
import { getDb } from "./db";
import { orders, orderStatusHistory, InsertOrder, InsertOrderStatusHistory } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Dropshipping Router - Gestão de pedidos
 */
export const dropshippingRouter = router({
  /**
   * Registrar novo pedido de dropshipping
   */
  registerOrder: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        customerName: z.string().min(1, "Nome do cliente é obrigatório"),
        customerEmail: z.string().email("Email inválido"),
        shippingAddress: z.string().min(1, "Endereço de entrega é obrigatório"),
        quantity: z.number().min(1).default(1),
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

      // Get affiliate info
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Perfil de afiliado não encontrado",
        });
      }

      // Get product info
      const product = await getProductById(input.productId);
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Produto não encontrado",
        });
      }

      // Calculate amounts
      const amount = Math.floor(product.price * input.quantity);
      const commissionAmount = Math.floor(
        (amount * parseFloat(product.commissionPercentage.toString())) / 100
      );

      // Create order
      const newOrder: InsertOrder = {
        affiliateId: affiliate.id,
        productId: input.productId,
        externalOrderId: `DROPSHIP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        marketplace: product.marketplace,
        amount,
        commissionAmount,
        status: "pending",
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        shippingAddress: input.shippingAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await db.insert(orders).values(newOrder);
      const orderId = (result as any).insertId;

      // Create initial status history
      await db.insert(orderStatusHistory).values({
        orderId,
        previousStatus: null,
        newStatus: "pending",
        changedAt: new Date(),
      });

      // Create notification
      await createNotification(
        ctx.user.id,
        "new_dropshipping_order",
        `Novo Pedido #${orderId}`,
        `Pedido registrado para ${product.title}. Cliente: ${input.customerName}`,
        orderId
      );

      return {
        id: orderId,
        ...newOrder,
      };
    }),

  /**
   * Obter pedidos do afiliado
   */
  getMyOrders: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (!affiliate) {
        return [];
      }

      const allOrders = await getOrdersByAffiliate(affiliate.id, input.limit);
      
      const filtered = input.status 
        ? allOrders.filter(order => order.status === input.status)
        : allOrders;

      return filtered.map(order => ({
        id: order.id,
        externalOrderId: order.externalOrderId,
        productId: order.productId,
        marketplace: order.marketplace,
        amount: order.amount / 100,
        commissionAmount: order.commissionAmount / 100,
        status: order.status,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        shippingAddress: order.shippingAddress,
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      }));
    }),

  /**
   * Obter detalhes de um pedido específico
   */
  getOrderDetails: protectedProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ ctx, input }) => {
      const order = await getOrderById(input.orderId);
      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pedido não encontrado",
        });
      }

      // Verify ownership
      const affiliate = await getAffiliateByUserId(ctx.user.id);
      if (affiliate?.id !== order.affiliateId && ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Acesso negado",
        });
      }

      const product = await getProductById(order.productId);
      const history = await getOrderStatusHistory(order.id);

      return {
        id: order.id,
        externalOrderId: order.externalOrderId,
        marketplace: order.marketplace,
        amount: order.amount / 100,
        commissionAmount: order.commissionAmount / 100,
        status: order.status,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        shippingAddress: order.shippingAddress,
        trackingNumber: order.trackingNumber,
        product: product ? {
          id: product.id,
          title: product.title,
          price: product.price / 100,
          imageUrl: product.imageUrl,
        } : null,
        statusHistory: history.map(h => ({
          id: h.id,
          previousStatus: h.previousStatus,
          newStatus: h.newStatus,
          changedAt: h.changedAt,
        })),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };
    }),

  /**
   * Atualizar status de pedido (admin only)
   */
  updateOrderStatus: protectedProcedure
    .input(
      z.object({
        orderId: z.number(),
        newStatus: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled", "refunded"]),
        trackingNumber: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem atualizar status",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const order = await getOrderById(input.orderId);
      if (!order) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pedido não encontrado",
        });
      }

      // Update order status
      await db
        .update(orders)
        .set({
          status: input.newStatus,
          trackingNumber: input.trackingNumber,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, input.orderId));

      // Create status history
      const historyData: InsertOrderStatusHistory = {
        orderId: input.orderId,
        previousStatus: order.status,
        newStatus: input.newStatus,
        changedAt: new Date(),
      };

      await db.insert(orderStatusHistory).values(historyData);

      // Get affiliate to send notification
      const affiliate = await db
        .select()
        .from((await import("../drizzle/schema")).affiliates)
        .where(eq((await import("../drizzle/schema")).affiliates.id, order.affiliateId))
        .limit(1);

      if (affiliate.length > 0) {
        await createNotification(
          affiliate[0].userId,
          "order_status_update",
          `Pedido #${order.id} - Status: ${input.newStatus}`,
          `Seu pedido foi atualizado para: ${input.newStatus}`,
          input.orderId
        );
      }

      return { success: true };
    }),
});
