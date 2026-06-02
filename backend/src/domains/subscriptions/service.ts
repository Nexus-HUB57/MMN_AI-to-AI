/**
 * Subscriptions domain — service.
 *
 * Casos de uso comerciais do modelo de assinatura do Nexus Partners.
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
  SubscriptionTermMonths,
} from "./types";

export function getCatalog() {
  return {
    plans: listSubscriptionPlans(),
    version: "1.6.0",
    pivot: "subscription-commercial",
    storefront: {
      productName: "Nexus Partners Pack",
      presentation: "subscription-only",
      termOptionsMonths: [6, 12, 24, 36, 48],
    },
  };
}

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
  termMonths: SubscriptionTermMonths;
  metadata?: Record<string, unknown>;
}): Promise<StartSubscriptionResult> {
  const plan = getSubscriptionPlan(input.planId);

  const subscription = await createSubscription({
    userId: input.userId,
    planId: plan.id,
    billingCycle: plan.billingCycle,
    termMonths: input.termMonths,
    pricePaidCents: plan.priceCents,
    metadata: {
      ...input.metadata,
      commercialModel: "subscription-only",
      termMonths: input.termMonths,
    },
  });

  await appendSubscriptionEvent({
    subscriptionId: subscription.id,
    type: "subscription_started",
    fromPlanId: null,
    toPlanId: plan.id,
    triggeredBy: "user",
    occurredAt: new Date(),
    payload: {
      termMonths: input.termMonths,
      commercialModel: "subscription-only",
    },
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
  const current = await getSubscription(subscriptionId);
  if (!current) return null;
  if (current.status === "active") return current;

  const now = new Date();
  const renewsAt = computeNextRenewal(current.planId, now);

  const updated = await updateSubscriptionStatus(subscriptionId, "active", {
    activatedAt: current.activatedAt ?? now,
    renewsAt,
    metadata: {
      lastPaymentConfirmedAt: now.toISOString(),
      activatedBy: triggeredBy,
    },
  });
  if (!updated) return null;

  await appendSubscriptionEvent({
    subscriptionId,
    type: "subscription_activated",
    fromPlanId: null,
    toPlanId: updated.planId,
    triggeredBy,
    occurredAt: now,
    payload: {
      renewsAt: renewsAt?.toISOString() ?? null,
    },
  });

  return updated;
}

function computeNextRenewal(planId: SubscriptionPlanId, anchor: Date): Date | null {
  const plan = getSubscriptionPlan(planId);
  if (plan.billingCycle === "on_request") return null;
  const next = new Date(anchor);
  if (plan.billingCycle === "monthly") next.setMonth(next.getMonth() + 1);
  if (plan.billingCycle === "yearly") next.setFullYear(next.getFullYear() + 1);
  return next;
}

export async function handleSubscriptionInvoicePaid(input: {
  subscriptionId: string;
  invoiceId?: string | null;
  paidAt?: string | Date | null;
  provider: "mercado_pago" | "hotmart" | "manual" | "system";
  externalReference?: string | null;
}): Promise<Subscription | null> {
  const current = await getSubscription(input.subscriptionId);
  if (!current) return null;

  const paidAt = input.paidAt ? new Date(input.paidAt) : new Date();
  if (Number.isNaN(paidAt.getTime())) {
    throw new Error("Data de pagamento inválida para a assinatura.");
  }

  if (current.status === "pending_activation") {
    return confirmSubscriptionPayment(current.id, "billing_webhook");
  }

  const renewalAnchor = current.renewsAt && current.renewsAt > paidAt ? current.renewsAt : paidAt;
  const renewsAt = computeNextRenewal(current.planId, renewalAnchor);

  const updated = await updateSubscriptionStatus(current.id, "active", {
    renewsAt,
    metadata: {
      lastInvoiceId: input.invoiceId ?? undefined,
      lastInvoicePaidAt: paidAt.toISOString(),
      lastPaymentProvider: input.provider,
      lastExternalReference: input.externalReference ?? undefined,
    },
  });
  if (!updated) return null;

  await appendSubscriptionEvent({
    subscriptionId: current.id,
    type: "subscription_renewed",
    fromPlanId: current.planId,
    toPlanId: current.planId,
    triggeredBy: "billing_webhook",
    occurredAt: paidAt,
    notes: input.invoiceId ? `Fatura ${input.invoiceId} paga` : "Fatura paga",
    payload: {
      provider: input.provider,
      externalReference: input.externalReference ?? null,
      renewsAt: renewsAt?.toISOString() ?? null,
    },
  });

  return updated;
}

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
  const current = await getSubscription(input.subscriptionId);
  if (!current) return null;

  const fromPlan = getSubscriptionPlan(current.planId);
  const toPlan = getSubscriptionPlan(input.toPlanId);
  const movement = compareSubscriptionPlans(fromPlan.id, toPlan.id);
  const now = new Date();

  const updated = await updateSubscriptionPlan(input.subscriptionId, toPlan.id, toPlan.priceCents);
  if (!updated) return null;

  await appendSubscriptionEvent({
    subscriptionId: input.subscriptionId,
    type: "subscription_upgraded",
    fromPlanId: fromPlan.id,
    toPlanId: toPlan.id,
    triggeredBy: input.triggeredBy,
    occurredAt: now,
    notes: input.notes,
    payload: { movement },
  });

  if (movement === "upgrade") {
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

export async function cancelSubscription(input: {
  subscriptionId: string;
  reason?: string;
  triggeredBy?: "user" | "admin" | "system" | "billing_webhook";
}): Promise<Subscription | null> {
  const current = await getSubscription(input.subscriptionId);
  if (!current) return null;
  const now = new Date();

  const updated = await updateSubscriptionStatus(input.subscriptionId, "cancelled", {
    cancelledAt: now,
    metadata: {
      cancellationReason: input.reason ?? undefined,
    },
  });
  if (!updated) return null;

  await appendSubscriptionEvent({
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
  const current = await getSubscription(subscriptionId);
  if (!current) return null;
  const now = new Date();

  const updated = await updateSubscriptionStatus(subscriptionId, "past_due", {
    metadata: {
      lastPastDueAt: now.toISOString(),
    },
  });
  if (!updated) return null;

  await appendSubscriptionEvent({
    subscriptionId,
    type: "subscription_past_due",
    fromPlanId: current.planId,
    toPlanId: current.planId,
    triggeredBy: "billing_webhook",
    occurredAt: now,
  });

  return updated;
}

export interface SubscriptionOverview {
  metrics: SubscriptionMetricsSnapshot;
  catalogVersion: string;
  plans: ReturnType<typeof listSubscriptionPlans>;
}

export async function getSubscriptionsOverview(): Promise<SubscriptionOverview> {
  return {
    metrics: await computeSubscriptionMetrics(),
    catalogVersion: "1.5.0",
    plans: listSubscriptionPlans(),
  };
}

export async function getSubscriptionDetails(id: string): Promise<{
  subscription: Subscription;
  plan: ReturnType<typeof getSubscriptionPlan>;
  events: SubscriptionEventLog[];
} | null> {
  const subscription = await getSubscription(id);
  if (!subscription) return null;
  return {
    subscription,
    plan: getSubscriptionPlan(subscription.planId),
    events: await listSubscriptionEvents(id),
  };
}

export async function listSubscriptionsForUser(userId: number) {
  return listSubscriptions({ userId, limit: 100, offset: 0 });
}

export async function searchSubscriptions(filter: ListSubscriptionsFilter) {
  return listSubscriptions(filter);
}
