import { getDb } from "./db";
import { payments, InsertPayment, commissions } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { calculateCommissionsForPayment, confirmCommissions, updateAffiliateCommissionTotals } from "./commissions";
import { createNotification } from "./db";

/**
 * Insere um novo pagamento no sistema
 */
export async function insertPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(payments).values(data);
  return (result as any).insertId;
}

/**
 * Confirma um pagamento e calcula comissões automaticamente
 */
export async function confirmPayment(paymentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar o pagamento
  const paymentResult = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (paymentResult.length === 0) {
    throw new Error("Payment not found");
  }

  const payment = paymentResult[0];

  // Atualizar status do pagamento para confirmed
  await db
    .update(payments)
    .set({
      status: "confirmed",
      confirmedAt: new Date(),
    })
    .where(eq(payments.id, paymentId));

  // Calcular comissões em cascata
  const createdCommissions = await calculateCommissionsForPayment(
    payment.affiliateId,
    payment.amount
  );

  // Confirmar as comissões criadas
  const commissionIds = createdCommissions.map((c: any) => c.id).filter(Boolean);
  if (commissionIds.length > 0) {
    await confirmCommissions(commissionIds);
  }

  // Atualizar totais de comissões para o afiliado
  await updateAffiliateCommissionTotals(payment.affiliateId);

  // Criar notificação
  await createNotification({
    userId: payment.affiliateId,
    type: "payment_confirmed",
    title: "Pagamento Confirmado",
    content: `Seu pagamento de R$ ${(payment.amount / 100).toFixed(2)} foi confirmado e as comissões foram calculadas.`,
    read: 0,
  });

  return payment;
}

/**
 * Gera extrato de remuneração para um afiliado
 */
export async function generateRemunerationStatement(affiliateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const commissionsData = await db
    .select()
    .from(commissions)
    .where(eq(commissions.affiliateId, affiliateId));

  const totalConfirmed = commissionsData
    .filter((c) => c.status === "confirmed")
    .reduce((sum, c) => sum + c.amount, 0);

  const totalPending = commissionsData
    .filter((c) => c.status === "pending")
    .reduce((sum, c) => sum + c.amount, 0);

  const totalPaid = commissionsData
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + c.amount, 0);

  return {
    affiliateId,
    totalConfirmed,
    totalPending,
    totalPaid,
    commissions: commissionsData,
    generatedAt: new Date(),
  };
}

/**
 * Identifica afiliados com pagamentos pendentes vencidos
 */
export async function getDelinquentAffiliates(daysOverdue: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOverdue);

  const delinquent = await db
    .select()
    .from(payments)
    .where(
      and(
        eq(payments.status, "pending")
      )
    );

  return delinquent.filter((p) => p.createdAt < cutoffDate);
}

/**
 * Cancela um pagamento e reverte comissões associadas
 */
export async function cancelPayment(paymentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar o pagamento
  const paymentResult = await db
    .select()
    .from(payments)
    .where(eq(payments.id, paymentId))
    .limit(1);

  if (paymentResult.length === 0) {
    throw new Error("Payment not found");
  }

  const payment = paymentResult[0];

  // Atualizar status do pagamento para cancelled
  await db
    .update(payments)
    .set({ status: "cancelled" })
    .where(eq(payments.id, paymentId));

  // Cancelar comissões associadas
  await db
    .update(commissions)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(commissions.source, "payment"),
        eq(commissions.sourceId, payment.affiliateId)
      )
    );

  // Atualizar totais de comissões
  await updateAffiliateCommissionTotals(payment.affiliateId);

  return payment;
}
