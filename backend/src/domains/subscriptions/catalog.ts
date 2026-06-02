/**
 * Subscriptions domain — catálogo comercial.
 *
 * Catálogo oficial do Nexus Partners no Nexus Store / Nexus Marketplace.
 * O produto é apresentado como software SaaS independente da jornada do Nexus Affil'IA'te
 * e comercializado exclusivamente por assinatura.
 */

import type {
  SubscriptionPlan,
  SubscriptionPlanId,
  SubscriptionTermMonths,
} from "./types";

const LICENSE_TERMS: SubscriptionTermMonths[] = [6, 12, 24, 36, 48];

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, SubscriptionPlan> = {
  "nexus-start": {
    id: "nexus-start",
    shortName: "Nexus Partners Start",
    fullName: "Nexus Partners · Start",
    tagline: "Plano inicial do Nexus Partners Pack, contratado por assinatura como produto independente",
    priceCents: 1000,
    currency: "BRL",
    billingCycle: "monthly",
    partnerTier: "silver",
    commissionRate: 0.05,
    features: [
      "Rastreamento ponta a ponta de parceiros, creators e afiliados",
      "1 agente IA operacional ativado",
      "8 skills comerciais com replay consultável",
      "Dashboard comercial com trilha auditável",
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
      licenseLabel: "Assinatura mensal com contratação de 6 a 48 meses",
      ctaLabel: "Assinar Start",
    },
  },
  "nexus-growth": {
    id: "nexus-growth",
    shortName: "Nexus Partners Growth",
    fullName: "Nexus Partners · Growth",
    tagline: "Plano de escala operacional com analytics, governança e expansão multicanal",
    priceCents: 25000,
    currency: "BRL",
    billingCycle: "monthly",
    partnerTier: "gold",
    commissionRate: 0.08,
    features: [
      "Comissionamento dinâmico com regras customizáveis",
      "ROI por canal e LTV por parceiro em tempo real",
      "Governança de aprovações e operação assistida por IA",
      "Biblioteca operacional ampliada para acelerar implantação",
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
      licenseLabel: "Assinatura mensal disponível em 6, 12, 24, 36 e 48 meses",
      ctaLabel: "Assinar Growth",
    },
  },
  "nexus-enterprise": {
    id: "nexus-enterprise",
    shortName: "Nexus Partners Enterprise",
    fullName: "Nexus Partners · Enterprise",
    tagline: "Plano enterprise sob consulta para desenho dedicado, governança ampliada e integração sob demanda",
    priceCents: null,
    currency: "BRL",
    billingCycle: "on_request",
    partnerTier: "platinum",
    commissionRate: 0.12,
    features: [
      "Governança comercial granular enterprise",
      "Desenho dedicado da operação e onboarding consultivo",
      "Acesso expandido à operação IA e integrações sob demanda",
      "Suporte estratégico para expansão de canais, parceiros e squads",
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
      licenseLabel: "Contrato enterprise sob consulta com janela contratual de 6 a 48 meses",
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
  const order: SubscriptionPlanId[] = ["nexus-start", "nexus-growth", "nexus-enterprise"];
  const fromIdx = order.indexOf(from);
  const toIdx = order.indexOf(to);
  if (toIdx > fromIdx) return "upgrade";
  if (toIdx < fromIdx) return "downgrade";
  return "lateral";
}
