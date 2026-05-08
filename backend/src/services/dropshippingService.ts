import { z } from "zod";
import { getDb, createNotification, getAffiliateByUserId, getUserByEmail } from "./db";
import {
  orders,
  products,
  affiliates,
  InsertOrder,
} from "./schema-final";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { calculateConsumptionCommission, confirmCommissions, updateAffiliateCommissionTotals } from "./commissions";

export const registerDropshippingOrder = async (input: {
  productId: number;
  affiliateId?: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  quantity: number;
}, userId: number) => {
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
    const affiliate = await getAffiliateByUserId(userId);
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
    shippingAddress: input.shippingAddress,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.insert(orders).values(newOrder);
  const orderId = (result as any).insertId;

  // Notificação ao fornecedor (ATENÇÃO: userId 1 é um placeholder para o admin/fornecedor. Em uma implementação real, a lógica para identificar o fornecedor seria mais complexa, possivelmente buscando o fornecedor associado ao `productId` ou `marketplace`, e enviando a notificação para um sistema externo ou um usuário específico do fornecedor.)
  await createNotification({
    userId: 1, // ATENÇÃO: userId 1 é um placeholder para o admin/fornecedor. Em uma implementação real, a lógica para identificar o fornecedor seria mais complexa, possivelmente buscando o fornecedor associado ao `productId` ou `marketplace`, e enviando a notificação para um sistema externo ou um usuário específico do fornecedor.
    type: "new_dropshipping_order",
    title: `Novo Pedido Dropshipping #${orderId}`,
    content: `Um novo pedido de dropshipping para o produto '${product.title}' (ID: ${product.id}) foi registrado. Cliente: ${input.customerName}, Email: ${input.customerEmail}, Endereço: ${input.shippingAddress}.`,
  });

  // Notificação ao cliente: Se o cliente for um usuário registrado, notifica-o internamente. Caso contrário, a notificação interna é direcionada ao afiliado que registrou o pedido.
  // Para notificação direta ao cliente via e-mail ou outro canal externo, seria necessária a integração com um serviço de envio de e-mails.
  const customerUser = await getUserByEmail(input.customerEmail);
  const notificationTargetUserId = customerUser ? customerUser.id : userId; // Notifica o cliente se ele for um usuário, senão notifica o afiliado que registrou o pedido
  
  await createNotification({
    userId: notificationTargetUserId,
    type: "order_confirmation",
    title: `Confirmação do Pedido #${orderId}`,
    content: `Seu pedido para '${product.title}' foi registrado com sucesso e está aguardando processamento.`,
  });

  return {
    id: orderId,
    ...newOrder,
  };
};

export const updateDropshippingOrderStatus = async (orderId: number, newStatus: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "refunded") => {
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
    .where(eq(orders.id, orderId))
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
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  // Se o status for 'delivered', calcular comissão
  if (newStatus === "delivered") {
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
          content: `Sua comissão de R$ ${(createdCommission.amount / 100).toFixed(2)} do pedido #${order.id} foi creditada.`,
        });
      }
    }
  }

  // Notificação ao cliente sobre atualização de status: Se o cliente for um usuário registrado, notifica-o internamente. Caso contrário, a notificação interna é direcionada ao afiliado que registrou o pedido.
  // Para notificação direta ao cliente via e-mail ou outro canal externo, seria necessária a integração com um serviço de envio de e-mails.
  const affiliateResult = await db.select().from(affiliates).where(eq(affiliates.id, order.affiliateId)).limit(1);
  if (affiliateResult.length > 0) {
    const affiliate = affiliateResult[0];
    const customerUser = await getUserByEmail(order.customerEmail);
    const notificationTargetUserId = customerUser ? customerUser.id : affiliate.userId; // Notifica o cliente se ele for um usuário, senão notifica o afiliado
    await createNotification({
      userId: notificationTargetUserId,
      type: "order_status_update",
      title: `Status do Pedido #${order.id} Atualizado`,
      content: `O status do pedido #${order.id} do cliente ${order.customerName} foi atualizado para '${newStatus}'.`,
    });
  }

  return { success: true };
};
