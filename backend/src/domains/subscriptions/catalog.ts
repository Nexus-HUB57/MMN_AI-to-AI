/**
 * Subscriptions domain — catálogo comercial.
 *
 * Catálogo oficial do Nexus Partners no Nexus Store / Nexus Marketplace.
 * O produto é apresentado como licença SaaS exclusivamente por assinatura.
 */

import type {
  SubscriptionPlan,
  SubscriptionPlanId,
  SubscriptionTermMonths,
} from "./types";

const LICENSE_TERMS: SubscriptionTermMonths[] = [6, 12, 24, 36, 48];

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, SubscriptionPlan> = {
  "pack-a2": {
    id: "pack-a2",
    shortName: "Nexus Partners Start",
    fullName: "Nexus Partners · Start License",
    tagline: "Entrada operacional para creators, parceiros e afiliados com licença SaaS recorrente",
    priceCents: 1000,
    currency: "BRL",
    billingCycle: "monthly",
    partnerTier: "silver",
    commissionRate: 0.05,
    features: [
      "Rastreamento ponta a ponta de parceiros e afiliados",
      "1 agente IA operacional ativado",
      "8 skills em runtime com replay consultável",
      "Dashboard comercial e trilha auditável",
    ],
    capacity: {
      aiAgents: 1,
      ebooks: 10,
      skills: 8,
      referralLevels: 2,
    },
    governance: {
      requiresApproval: false,
      requiresAdminContact: false,
      highValue: false,
    },
    storefront: {
      subscriptionOnly: true,
      defaultTermMonths: 12,
      availableTermsMonths: LICENSE_TERMS,
      licenseLabel: "Licença mensal com fidelização de 6 a 48 meses",
      ctaLabel: "Assinar Start",
    },
  },
  "pack-ag": {
    id: "pack-ag",
    shortName: "Nexus Partners Growth",
    fullName: "Nexus Partners · Growth License",
    tagline: "Escala comercial recorrente com governança, analytics e expansão multicanal",
    priceCents: 25000,
    currency: "BRL",
    billingCycle: "monthly",
    partnerTier: "gold",
    commissionRate: 0.08,
    features: [
      "Comissionamento dinâmico com atribuição customizável",
      "ROI por canal e LTV por parceiro em tempo real",
      "Mais níveis de rede e governança de aprovações",
      "250 e-books + operação assistida por IA",
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
    storefront: {
      subscriptionOnly: true,
      defaultTermMonths: 12,
      availableTermsMonths: LICENSE_TERMS,
      licenseLabel: "Licença mensal com planos de 6, 12, 24, 36 e 48 meses",
      ctaLabel: "Assinar Growth",
    },
  },
  "pack-aa": {
    id: "pack-aa",
    shortName: "Nexus Partners Enterprise",
    fullName: "Nexus Partners · Enterprise License",
    tagline: "Camada estratégica enterprise com governança high-value e desenho sob consulta",
    priceCents: null,
    currency: "BRL",
    billingCycle: "on_request",
    partnerTier: "platinum",
    commissionRate: 0.12,
    features: [
      "Governança comercial granular enterprise",
      "Participação em receitas especiais e desenho dedicado",
      "Acesso expandido à operação IA e integrações sob demanda",
      "Suporte estratégico para expansão de canais e parceiros",
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
    storefront: {
      subscriptionOnly: true,
      defaultTermMonths: 24,
      availableTermsMonths: LICENSE_TERMS,
      licenseLabel: "Contrato enterprise sob consulta com janela de 6 a 48 meses",
      ctaLabel: "Solicitar proposta",
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
