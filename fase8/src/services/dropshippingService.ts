/**
 * Dropshipping Service - Fase 8
 * Backend automatizado para dropshipping
 *
 * Autor: Nexus-HUB57
 * Versão: 1.0.0
 */

import { getDb } from "../../database/schemas/db";
import { orders, products, affiliates, commissions } from "../../database/schemas/schema-final";
import { eq, desc } from "drizzle-orm";
import { createNotification } from "../../database/schemas/db";

// Types
export interface DropshippingOrderInput {
  affiliateId: number;
  productId: number;
  externalOrderId: string;
  marketplace: string;
  customerName: string;
  customerEmail?: string;
  shippingAddress: string;
  amount: number;
}

export interface DropshippingOrderResult {
  success: boolean;
  orderId?: number;
  commissionAmount?: number;
  message?: string;
}

export interface OrderStatusUpdate {
  orderId: number;
  newStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
}

export interface UpdateOrderResult {
  success: boolean;
  orderId?: number;
  commissionCalculated?: number;
  message?: string;
}

export class DropshippingService {
  /**
   * Registra um novo pedido de dropshipping
   * - Cria o pedido no banco
   * - Calcula a comissão do afiliado
   * - Notifica o fornecedor (placeholder)
   * - Notifica o cliente
   */
  async registerDropshippingOrder(input: DropshippingOrderInput): Promise<DropshippingOrderResult> {
    try {
      const db = await getDb();
      if (!db) {
        return { success: false, message: "Database not available" };
      }

      // 1. Validar afiliado existe
      const affiliateData = await db.select().from(affiliates).where(eq(affiliates.id, input.affiliateId)).limit(1);
      if (affiliateData.length === 0) {
        return { success: false, message: "Afiliado não encontrado" };
      }

      // 2. Validar produto existe
      const productData = await db.select().from(products).where(eq(products.id, input.productId)).limit(1);
      if (productData.length === 0) {
        return { success: false, message: "Produto não encontrado" };
      }

      const product = productData[0];

      // 3. Calcular comissão do afiliado
      const commissionPercentage = affiliateData[0].commissionPercentage || product.commissionPercentage || 10;
      const commissionAmount = Math.floor(input.amount * (commissionPercentage / 100));

      // 4. Criar o pedido
      const now = new Date();
      const orderData = {
        affiliateId: input.affiliateId,
        productId: input.productId,
        externalOrderId: input.externalOrderId,
        marketplace: input.marketplace,
        amount: input.amount,
        commissionAmount: commissionAmount,
        status: "pending" as const,
        customerName: input.customerName,
        customerEmail: input.customerEmail || null,
        shippingAddress: input.shippingAddress,
        createdAt: now,
        updatedAt: now,
      };

      const insertedOrder = await db.insert(orders).values(orderData).returning();
      const order = insertedOrder[0];

      if (!order) {
        return { success: false, message: "Falha ao criar pedido" };
      }

      // 5. Notificar fornecedor (placeholder - userId: 1)
      // Em produção, implementar lógica robusta para identificar fornecedor
      await this.notifySupplier(order.id, input.marketplace);

      // 6. Notificar cliente
      await this.notifyCustomer(order.id, input.customerEmail, input.customerName);

      console.log(`[Dropshipping] Pedido registrado: ${order.id} | Comissão: ${commissionAmount}`);

      return {
        success: true,
        orderId: order.id,
        commissionAmount: commissionAmount,
        message: "Pedido registrado com sucesso",
      };
    } catch (error) {
      console.error("[Dropshipping] Erro ao registrar pedido:", error);
      return { success: false, message: `Erro interno: ${error}` };
    }
  }

  /**
   * Atualiza o status de um pedido de dropshipping
   * - Atualiza status do pedido
   * - Calcula comissão na entrega
   * - Notifica cliente e afiliado
   */
  async updateDropshippingOrderStatus(update: OrderStatusUpdate): Promise<UpdateOrderResult> {
    try {
      const db = await getDb();
      if (!db) {
        return { success: false, message: "Database not available" };
      }

      // 1. Buscar pedido atual
      const orderData = await db.select().from(orders).where(eq(orders.id, update.orderId)).limit(1);
      if (orderData.length === 0) {
        return { success: false, message: "Pedido não encontrado" };
      }

      const order = orderData[0];
      const previousStatus = order.status;

      // 2. Atualizar status do pedido
      const now = new Date();
      await db.update(orders).set({ status: update.newStatus, updatedAt: now }).where(eq(orders.id, update.orderId));

      // 3. Se status for "delivered", calcular comissão de consumo
      let commissionCalculated: number | undefined;
      if (update.newStatus === "delivered") {
        const commissionResult = await this.calculateConsumptionCommission(update.orderId);
        if (commissionResult.success) {
          commissionCalculated = commissionResult.commissionAmount;
        }
      }

      // 4. Notificar cliente sobre atualização
      await this.notifyCustomerStatusChange(order.id, order.customerEmail, previousStatus, update.newStatus);

      // 5. Notificar afiliado sobre atualização
      await this.notifyAffiliateStatusChange(order.id, order.affiliateId, previousStatus, update.newStatus);

      console.log(`[Dropshipping] Pedido ${update.orderId} atualizado: ${previousStatus} -> ${update.newStatus}`);

      return {
        success: true,
        orderId: update.orderId,
        commissionCalculated,
        message: `Status atualizado para ${update.newStatus}`,
      };
    } catch (error) {
      console.error("[Dropshipping] Erro ao atualizar status:", error);
      return { success: false, message: `Erro interno: ${error}` };
    }
  }

  /**
   * Calcula comissão de consumo quando pedido é entregue
   */
  async calculateConsumptionCommission(orderId: number): Promise<{ success: boolean; commissionAmount?: number; message?: string }> {
    try {
      const db = await getDb();
      if (!db) {
        return { success: false, message: "Database not available" };
      }

      // Buscar pedido
      const orderData = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (orderData.length === 0) {
        return { success: false, message: "Pedido não encontrado" };
      }

      const order = orderData[0];

      // Buscar afiliado para saber percentual de comissão
      const affiliateData = await db.select().from(affiliates).where(eq(affiliates.id, order.affiliateId)).limit(1);
      if (affiliateData.length === 0) {
        return { success: false, message: "Afiliado não encontrado" };
      }

      // Buscar produto para percentual base
      const productData = await db.select().from(products).where(eq(products.id, order.productId)).limit(1);
      if (productData.length === 0) {
        return { success: false, message: "Produto não encontrado" };
      }

      const affiliate = affiliateData[0];
      const product = productData[0];

      // Calcular comissão com percentual do afiliado ou do produto
      const commissionPercentage = affiliate.commissionPercentage || product.commissionPercentage || 10;
      const commissionAmount = Math.floor(order.amount * (commissionPercentage / 100));

      // Registrar comissão na tabela de comissões
      const now = new Date();
      await db.insert(commissions).values({
        affiliateId: order.affiliateId,
        amount: commissionAmount,
        level: 1, // Nível 1 = venda direta
        source: "dropshipping",
        sourceId: orderId,
        status: "pending", // Fica pendente até confirmação de pagamento
        createdAt: now,
        updatedAt: now,
      });

      // Atualizar comissões pendentes do afiliado
      const newPending = (affiliate.pendingCommissions || 0) + commissionAmount;
      await db.update(affiliates).set({ pendingCommissions: newPending, updatedAt: now }).where(eq(affiliates.id, order.affiliateId));

      console.log(`[Dropshipping] Comissão calculada para pedido ${orderId}: ${commissionAmount}`);

      return { success: true, commissionAmount };
    } catch (error) {
      console.error("[Dropshipping] Erro ao calcular comissão:", error);
      return { success: false, message: `Erro interno: ${error}` };
    }
  }

  /**
   * Notifica fornecedor sobre novo pedido (placeholder)
   * Em produção, implementar lógica para identificar fornecedor correto
   */
  private async notifySupplier(orderId: number, marketplace: string): Promise<void> {
    // Placeholder: userId 1 (em produção, implementar identificação real)
    const supplierUserId = 1;
    await createNotification({
      userId: supplierUserId,
      type: "dropshipping_new_order",
      title: "Novo pedido de dropshipping",
      content: `Pedido #${orderId} recebido do marketplace ${marketplace}`,
      read: 0,
    });
    console.log(`[Dropshipping] Fornecedor notificado sobre pedido ${orderId}`);
  }

  /**
   * Notifica cliente sobre novo pedido
   */
  private async notifyCustomer(orderId: number, customerEmail?: string | null, customerName?: string): Promise<void> {
    // Placeholder: notificações internas
    // Em produção, implementar envio de email real
    console.log(`[Dropshipping] Cliente ${customerName} (${customerEmail}) notificado sobre pedido ${orderId}`);
  }

  /**
   * Notifica cliente sobre mudança de status
   */
  private async notifyCustomerStatusChange(
    orderId: number,
    customerEmail?: string | null,
    previousStatus: string,
    newStatus: string
  ): Promise<void> {
    const statusMessages: Record<string, string> = {
      processing: "Seu pedido está sendo processado",
      shipped: "Seu pedido foi enviado!",
      delivered: "Seu pedido foi entregue",
      cancelled: "Seu pedido foi cancelado",
    };

    const message = statusMessages[newStatus] || `Status do pedido atualizado: ${newStatus}`;
    console.log(`[Dropshipping] Cliente notificado: Pedido ${orderId} - ${message}`);
  }

  /**
   * Notifica afiliado sobre mudança de status do pedido
   */
  private async notifyAffiliateStatusChange(
    orderId: number,
    affiliateId: number,
    previousStatus: string,
    newStatus: string
  ): Promise<void> {
    console.log(`[Dropshipping] Afiliado ${affiliateId} notificado: Pedido ${orderId} - ${previousStatus} -> ${newStatus}`);
  }

  /**
   * Lista pedidos de um afiliado
   */
  async getOrdersByAffiliate(affiliateId: number, limit: number = 50): Promise<any[]> {
    const db = await getDb();
    if (!db) return [];

    const ordersList = await db.select().from(orders).where(eq(orders.affiliateId, affiliateId)).limit(limit).orderBy(desc(orders.createdAt));
    return ordersList;
  }

  /**
   * Lista todos os pedidos (admin)
   */
  async getAllOrders(limit: number = 100): Promise<any[]> {
    const db = await getDb();
    if (!db) return [];

    return await db.select().from(orders).limit(limit).orderBy(desc(orders.createdAt));
  }

  /**
   * Busca pedido por ID
   */
  async getOrderById(orderId: number): Promise<any | null> {
    const db = await getDb();
    if (!db) return null;

    const result = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    return result.length > 0 ? result[0] : null;
  }
}

// Export singleton instance
export const dropshippingService = new DropshippingService();