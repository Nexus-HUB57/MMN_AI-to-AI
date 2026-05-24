import { getDb } from "../../../database/schemas/db";
import { commissions, InsertCommission, network, affiliates } from "../../../database/schemas/schema-final";
import { eq, and } from "drizzle-orm";

/**
 * Calcula e registra comissões em cascata para toda a rede de um novo pagamento
 * Suporta até 15 níveis de profundidade
 */
export async function calculateCommissionsForPayment(
  affiliateId: number,
  paymentAmount: number,
  maxLevels: number = 15
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar todos os patrocinadores do afiliado (rede acima)
  const networkPath = await db
    .select({
      userId: network.userId,
      sponsorId: network.sponsorId,
      level: network.level,
    })
    .from(network)
    .where(eq(network.userId, affiliateId));

  if (networkPath.length === 0) {
    // Afiliado não tem patrocinador, sem comissões em cascata
    return [];
  }

  const commissionsCreated: any[] = [];

  // Para cada nível na rede
  for (const record of networkPath) {
    if (record.level > maxLevels) break;

    // Buscar afiliado do patrocinador
    const sponsorAffiliate = await db
      .select()
      .from(affiliates)
      .where(eq(affiliates.userId, record.sponsorId))
      .limit(1);

    if (sponsorAffiliate.length === 0) continue;

    const sponsor = sponsorAffiliate[0];
    const commissionPercentage = sponsor.commissionPercentage || 10;
    const commissionAmount = Math.floor((paymentAmount * commissionPercentage) / 100);

    // Registrar comissão
    const commission: InsertCommission = {
      affiliateId: sponsor.id,
      amount: commissionAmount,
      level: record.level,
      source: "payment",
      sourceId: affiliateId,
      status: "pending",
    };

    await db.insert(commissions).values(commission);
    commissionsCreated.push(commission);
  }

  return commissionsCreated;
}

/**
 * Calcula comissão por largura (bônus por número de indicados diretos)
 */
export async function calculateWidthCommission(
  affiliateId: number,
  minimumDirectReferrals: number = 5
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Contar indicados diretos
  const directReferrals = await db
    .select()
    .from(network)
    .where(and(eq(network.sponsorId, affiliateId), eq(network.level, 1)));

  if (directReferrals.length < minimumDirectReferrals) {
    return null; // Não atende o mínimo
  }

  // Buscar afiliado
  const affiliate = await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.id, affiliateId))
    .limit(1);

  if (affiliate.length === 0) return null;

  // Calcular bônus por largura (exemplo: 5% do total de vendas dos diretos)
  const widthBonus = Math.floor(directReferrals.length * 10); // 10 por referido direto

  const commission: InsertCommission = {
    affiliateId,
    amount: widthBonus,
    level: 0, // Nível 0 para bônus de largura
    source: "bonus",
    status: "pending",
  };

  await db.insert(commissions).values(commission);
  return commission;
}

/**
 * Confirma comissões pendentes (muda status para confirmed)
 */
export async function confirmCommissions(commissionIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  for (const id of commissionIds) {
    await db
      .update(commissions)
      .set({ status: "confirmed" })
      .where(eq(commissions.id, id));
  }
}

/**
 * Marca comissões como pagas
 */
export async function markCommissionsAsPaid(commissionIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  for (const id of commissionIds) {
    await db
      .update(commissions)
      .set({ status: "paid" })
      .where(eq(commissions.id, id));
  }
}

/**
 * Calcula comissão por consumo (baseado em vendas/conversões)
 */
export async function calculateConsumptionCommission(
  affiliateId: number,
  salesAmount: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar afiliado
  const affiliate = await db
    .select()
    .from(affiliates)
    .where(eq(affiliates.id, affiliateId))
    .limit(1);

  if (affiliate.length === 0) return null;

  const commissionPercentage = affiliate[0].commissionPercentage || 10;
  const commissionAmount = Math.floor((salesAmount * commissionPercentage) / 100);

  const commission: InsertCommission = {
    affiliateId,
    amount: commissionAmount,
    level: 0,
    source: "order",
    status: "pending",
  };

  await db.insert(commissions).values(commission);
  return commission;
}

/**
 * Atualiza o total de comissões do afiliado
 */
export async function updateAffiliateCommissionTotals(affiliateId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Somar comissões confirmadas
  const confirmedResult = await db
    .select({ total: commissions.amount })
    .from(commissions)
    .where(
      and(
        eq(commissions.affiliateId, affiliateId),
        eq(commissions.status, "confirmed")
      )
    );

  const totalConfirmed = confirmedResult.reduce((sum, row) => sum + (row.total || 0), 0);

  // Somar comissões pendentes
  const pendingResult = await db
    .select({ total: commissions.amount })
    .from(commissions)
    .where(
      and(
        eq(commissions.affiliateId, affiliateId),
        eq(commissions.status, "pending")
      )
    );

  const totalPending = pendingResult.reduce((sum, row) => sum + (row.total || 0), 0);

  // Atualizar afiliado
  await db
    .update(affiliates)
    .set({
      totalCommissions: totalConfirmed,
      pendingCommissions: totalPending,
    })
    .where(eq(affiliates.id, affiliateId));
}
