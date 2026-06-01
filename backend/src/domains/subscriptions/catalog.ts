/**
 * Subscriptions domain — catálogo comercial.
 *
 * Catálogo oficial dos packs do Nexus Affil'IA'te (v1.4.0).
 * Espelha o que o frontend público apresenta em /, /login e /marketplaces.
 *
 * Mantido em arquivo dedicado para permitir, no futuro próximo, a migração para
 * uma tabela `subscription_plans` no Postgres sem alterar consumidores.
 */

import type { SubscriptionPlan, SubscriptionPlanId } from "./types";

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, SubscriptionPlan> = {
  "pack-a2": {
    id: "pack-a2",
    shortName: "Pack A²",
    fullName: "Pack Agente Afiliado A² · Nível I",
    tagline: "Ativação do Agente IA e porta de entrada operacional",
    priceCents: 1000,
    currency: "BRL",
    billingCycle: "one_time",
    partnerTier: "silver",
    commissionRate: 0.05,
    features: [
      "1 Agente IA ativado",
      "10 e-books para revenda",
      "Painel comercial liberado",
      "2 skills iniciais",
    ],
    capacity: {
      aiAgents: 1,
      ebooks: 10,
      skills: 2,
      referralLevels: 2,
    },
    governance: {
      requiresApproval: false,
      requiresAdminContact: false,
      highValue: false,
    },
  },
  "pack-ag": {
    id: "pack-ag",
    shortName: "Pack AG",
    fullName: "Pack Agente Preditivo AG · Nível I",
    tagline: "Operação preditiva e expansão de rede",
    priceCents: 25000,
    currency: "BRL",
    billingCycle: "monthly",
    partnerTier: "gold",
    commissionRate: 0.08,
    features: [
      "Agente em nível profissional",
      "250 e-books para ampliar a vitrine",
      "Comissão em mais níveis da rede",
      "5 cotas extras de expansão",
    ],
    capacity: {
      aiAgents: 3,
      ebooks: 250,
      skills: 8,
      referralLevels: 5,
    },
    governance: {
      requiresApproval: false,
      requiresAdminContact: false,
      highValue: false,
    },
  },
  "pack-aa": {
    id: "pack-aa",
    shortName: "Pack AA",
    fullName: "Pack Liderança Estratégica AA · Nível I",
    tagline: "Camada estratégica com participação em receitas especiais",
    priceCents: null,
    currency: "BRL",
    billingCycle: "on_request",
    partnerTier: "platinum",
    commissionRate: 0.12,
    features: [
      "Benefícios estratégicos exclusivos",
      "Participação em receitas especiais",
      "Apoio a novos projetos",
      "Acesso total às capacidades do agente",
    ],
    capacity: {
      aiAgents: 10,
      ebooks: 1000,
      skills: 20,
      referralLevels: 10,
    },
    governance: {
      requiresApproval: true,
      requiresAdminContact: true,
      highValue: true,
    },
  },
};

export function listSubscriptionPlans(): SubscriptionPlan[] {
  return Object.values(SUBSCRIPTION_PLANS);
}

export function getSubscriptionPlan(planId: SubscriptionPlanId): SubscriptionPlan {
  const plan = SUBSCRIPTION_PLANS[planId];
  if (!plan) {
    throw new Error(`Plano de assinatura desconhecido: ${planId}`);
  }
  return plan;
}

/**
 * Determina se um movimento entre planos é um upgrade, downgrade ou lateral.
 * Usado pelo service ao mudar a assinatura e pelo billing para definir cobrança.
 */
export function compareSubscriptionPlans(
  from: SubscriptionPlanId,
  to: SubscriptionPlanId,
): "upgrade" | "downgrade" | "lateral" {
  const order: SubscriptionPlanId[] = ["pack-a2", "pack-ag", "pack-aa"];
  const fromIdx = order.indexOf(from);
  const toIdx = order.indexOf(to);
  if (toIdx > fromIdx) return "upgrade";
  if (toIdx < fromIdx) return "downgrade";
  return "lateral";
}
