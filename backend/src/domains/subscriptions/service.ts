/**
 * Subscriptions domain — service.
 *
 * Casos de uso comerciais do modelo de Assinatura (v1.4.0).
 *
 * Regras de negócio principais:
 *  - Pack A² ativa automaticamente após confirmação de pagamento (R$ 10).
 *  - Pack AG entra como pending_activation até o billing webhook confirmar.
 *  - Pack AA exige aprovação de admin (governança highValue).
 *  - Upgrade entre packs gera evento dedicado e ajusta o tier do parceiro
 *    via publishPartnerTierPromoted (lá quem reage é o subscriber Partners).
 */

import {
  compareSubscriptionPlans,
  getSubscriptionPlan,
  listSubscriptionPlans,
} from "./catalog";
import {
  appendSubscriptionEvent,
  computeSubscriptionMetrics,
  createSubscription,
  getSubscription,
  listSubscriptionEvents,
  listSubscriptions,
  updateSubscriptionPlan,
  updateSubscriptionStatus,
  type ListSubscriptionsFilter,
  type SubscriptionMetricsSnapshot,
} from "./repository";
import { publishPartnerTierPromoted } from "../partners/events";
import type {
  Subscription,
  SubscriptionEventLog,
  SubscriptionPlanId,
} from "./types";

// ------------------------------------------------------------------
// Catálogo
// ------------------------------------------------------------------

export function getCatalog() {
  return {
    plans: listSubscriptionPlans(),
    version: "1.4.0",
    pivot: "subscription-commercial",
  };
}

// ------------------------------------------------------------------
// Início e ativação
// ------------------------------------------------------------------

export interface StartSubscriptionResult {
  subscription: Subscription;
  requiresPayment: boolean;
  requiresAdminApproval: boolean;
  paymentInstructions?: {
    method: "pix" | "card" | "on_request";
    amountCents: number | null;
  };
}

export async function startSubscription(input: {
  userId: number;
  planId: SubscriptionPlanId;
  metadata?: Record<string, unknown>;
}): Promise<StartSubscriptionResult> {
  const plan = getSubscriptionPlan(input.planId);

  const subscription = createSubscription({
    userId: input.userId,
    planId: plan.id,
    pricePaidCents: plan.priceCents,
    metadata: input.metadata,
  });

  appendSubscriptionEvent({
    subscriptionId: subscription.id,
    type: "subscription_started",
    fromPlanId: null,
    toPlanId: plan.id,
    triggeredBy: "user",
    occurredAt: new Date(),
  });

  if (plan.governance.requiresAdminContact) {
    return {
      subscription,
      requiresPayment: false,
      requiresAdminApproval: true,
      paymentInstructions: { method: "on_request", amountCents: null },
    };
  }

  return {
    subscription,
    requiresPayment: true,
    requiresAdminApproval: false,
    paymentInstructions: {
      method: plan.priceCents && plan.priceCents > 0 ? "pix" : "card",
      amountCents: plan.priceCents,
    },
  };
}

export async function confirmSubscriptionPayment(
  subscriptionId: string,
  triggeredBy: "user" | "admin" | "system" | "billing_webhook" = "billing_webhook",
): Promise<Subscription | null> {
  const current = getSubscription(subscriptionId);
  if (!current) return null;

  const now = new Date();
  const renewsAt = computeNextRenewal(current.planId, now);

  const updated = updateSubscriptionStatus(subscriptionId, "active", {
    activatedAt: now,
    renewsAt,
  });
  if (!updated) return null;

  appendSubscriptionEvent({
    subscriptionId,
    type: "subscription_activated",
    fromPlanId: null,
    toPlanId: updated.planId,
    triggeredBy,
    occurredAt: now,
  });

  return updated;
}

function computeNextRenewal(planId: SubscriptionPlanId, anchor: Date): Date | null {
  const plan = getSubscriptionPlan(planId);
  if (plan.billingCycle === "one_time" || plan.billingCycle === "on_request") {
    return null;
  }
  const next = new Date(anchor);
  if (plan.billingCycle === "monthly") next.setMonth(next.getMonth() + 1);
  if (plan.billingCycle === "yearly") next.setFullYear(next.getFullYear() + 1);
  return next;
}

// ------------------------------------------------------------------
// Upgrade / downgrade
// ------------------------------------------------------------------

export interface ChangeSubscriptionResult {
  subscription: Subscription;
  movement: "upgrade" | "downgrade" | "lateral";
}

export async function changeSubscriptionPlan(input: {
  subscriptionId: string;
  toPlanId: SubscriptionPlanId;
  triggeredBy: "user" | "admin" | "system" | "billing_webhook";
  notes?: string;
}): Promise<ChangeSubscriptionResult | null> {
  const current = getSubscription(input.subscriptionId);
  if (!current) return null;

  const fromPlan = getSubscriptionPlan(current.planId);
  const toPlan = getSubscriptionPlan(input.toPlanId);
  const movement = compareSubscriptionPlans(fromPlan.id, toPlan.id);
  const now = new Date();

  const updated = updateSubscriptionPlan(input.subscriptionId, toPlan.id, toPlan.priceCents);
  if (!updated) return null;

  appendSubscriptionEvent({
    subscriptionId: input.subscriptionId,
    type: "subscription_upgraded",
    fromPlanId: fromPlan.id,
    toPlanId: toPlan.id,
    triggeredBy: input.triggeredBy,
    occurredAt: now,
    notes: input.notes,
  });

  if (movement === "upgrade") {
    // Dispara evento de promoção do parceiro associado.
    // O subscriber Partners é responsável por:
    //   - enviar notificação multi-canal (notifyTierPromotion);
    //   - emitir PARTNER_HIGH_VALUE_PROMOTION quando aplicável.
    await publishPartnerTierPromoted({
      partnerId: String(updated.userId),
      previousTier: fromPlan.partnerTier,
      newTier: toPlan.partnerTier,
      totalVolume: 0,
      newCommissionRate: toPlan.commissionRate,
      triggeredBy: "subscription_upgrade",
    });
  }

  return { subscription: updated, movement };
}

// ------------------------------------------------------------------
// Cancelamento / suspensão
// ------------------------------------------------------------------

export async function cancelSubscription(input: {
  subscriptionId: string;
  reason?: string;
  triggeredBy?: "user" | "admin" | "system" | "billing_webhook";
}): Promise<Subscription | null> {
  const current = getSubscription(input.subscriptionId);
  if (!current) return null;
  const now = new Date();
  const updated = updateSubscriptionStatus(input.subscriptionId, "cancelled", {
    cancelledAt: now,
  });
  if (!updated) return null;

  appendSubscriptionEvent({
    subscriptionId: input.subscriptionId,
    type: "subscription_cancelled",
    fromPlanId: current.planId,
    toPlanId: null,
    triggeredBy: input.triggeredBy ?? "user",
    occurredAt: now,
    notes: input.reason,
  });

  return updated;
}

export async function markSubscriptionPastDue(subscriptionId: string): Promise<Subscription | null> {
  const current = getSubscription(subscriptionId);
  if (!current) return null;
  const now = new Date();
  const updated = updateSubscriptionStatus(subscriptionId, "past_due");
  if (!updated) return null;
  appendSubscriptionEvent({
    subscriptionId,
    type: "subscription_past_due",
    fromPlanId: current.planId,
    toPlanId: current.planId,
    triggeredBy: "billing_webhook",
    occurredAt: now,
  });
  return updated;
}

// ------------------------------------------------------------------
// Queries
// ------------------------------------------------------------------

export interface SubscriptionOverview {
  metrics: SubscriptionMetricsSnapshot;
  catalogVersion: string;
  plans: ReturnType<typeof listSubscriptionPlans>;
}

export function getSubscriptionsOverview(): SubscriptionOverview {
  return {
    metrics: computeSubscriptionMetrics(),
    catalogVersion: "1.4.0",
    plans: listSubscriptionPlans(),
  };
}

export function getSubscriptionDetails(id: string): {
  subscription: Subscription;
  plan: ReturnType<typeof getSubscriptionPlan>;
  events: SubscriptionEventLog[];
} | null {
  const subscription = getSubscription(id);
  if (!subscription) return null;
  return {
    subscription,
    plan: getSubscriptionPlan(subscription.planId),
    events: listSubscriptionEvents(id),
  };
}

export function listSubscriptionsForUser(userId: number) {
  return listSubscriptions({ userId, limit: 100, offset: 0 });
}

export function searchSubscriptions(filter: ListSubscriptionsFilter) {
  return listSubscriptions(filter);
}
