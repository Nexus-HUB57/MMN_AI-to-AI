/**
 * Subscriptions domain — repository.
 *
 * Armazenamento in-memory determinístico, alinhado ao padrão dos demais
 * domínios (partners, billing). Pronto para ser substituído por persistência
 * Drizzle quando a migration `0004_subscriptions.sql` for criada.
 */

import type {
  Subscription,
  SubscriptionEventLog,
  SubscriptionPlanId,
  SubscriptionStatus,
} from "./types";

interface SubscriptionState {
  subscriptions: Map<string, Subscription>;
  events: SubscriptionEventLog[];
  nextSubscriptionSeq: number;
  nextEventSeq: number;
}

function emptyState(): SubscriptionState {
  return {
    subscriptions: new Map(),
    events: [],
    nextSubscriptionSeq: 1,
    nextEventSeq: 1,
  };
}

const state: SubscriptionState = emptyState();

function nextSubscriptionId(): string {
  const id = `sub_${Date.now().toString(36)}_${state.nextSubscriptionSeq
    .toString(36)
    .padStart(3, "0")}`;
  state.nextSubscriptionSeq++;
  return id;
}

function nextEventId(): string {
  const id = `subev_${Date.now().toString(36)}_${state.nextEventSeq
    .toString(36)
    .padStart(3, "0")}`;
  state.nextEventSeq++;
  return id;
}

// ------------------------------------------------------------------
// Subscriptions
// ------------------------------------------------------------------

export interface CreateSubscriptionInput {
  userId: number;
  planId: SubscriptionPlanId;
  pricePaidCents: number | null;
  metadata?: Record<string, unknown>;
}

export function createSubscription(input: CreateSubscriptionInput): Subscription {
  const id = nextSubscriptionId();
  const now = new Date();
  const subscription: Subscription = {
    id,
    userId: input.userId,
    planId: input.planId,
    status: "pending_activation",
    startedAt: now,
    activatedAt: null,
    renewsAt: null,
    cancelledAt: null,
    pricePaidCents: input.pricePaidCents,
    metadata: input.metadata ?? {},
  };
  state.subscriptions.set(id, subscription);
  return subscription;
}

export function getSubscription(id: string): Subscription | undefined {
  return state.subscriptions.get(id);
}

export function updateSubscriptionStatus(
  id: string,
  status: SubscriptionStatus,
  patch: Partial<Pick<Subscription, "activatedAt" | "renewsAt" | "cancelledAt" | "metadata">> = {},
): Subscription | undefined {
  const current = state.subscriptions.get(id);
  if (!current) return undefined;
  const next: Subscription = {
    ...current,
    status,
    ...patch,
    metadata: { ...current.metadata, ...(patch.metadata ?? {}) },
  };
  state.subscriptions.set(id, next);
  return next;
}

export function updateSubscriptionPlan(
  id: string,
  planId: SubscriptionPlanId,
  pricePaidCents: number | null,
): Subscription | undefined {
  const current = state.subscriptions.get(id);
  if (!current) return undefined;
  const next: Subscription = {
    ...current,
    planId,
    pricePaidCents,
  };
  state.subscriptions.set(id, next);
  return next;
}

export interface ListSubscriptionsFilter {
  userId?: number;
  status?: SubscriptionStatus;
  planId?: SubscriptionPlanId;
  limit: number;
  offset: number;
}

export function listSubscriptions(filter: ListSubscriptionsFilter): {
  items: Subscription[];
  total: number;
} {
  const all = Array.from(state.subscriptions.values())
    .filter((sub) => (filter.userId ? sub.userId === filter.userId : true))
    .filter((sub) => (filter.status ? sub.status === filter.status : true))
    .filter((sub) => (filter.planId ? sub.planId === filter.planId : true))
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  return {
    items: all.slice(filter.offset, filter.offset + filter.limit),
    total: all.length,
  };
}

// ------------------------------------------------------------------
// Event logs (audit trail leve no domínio)
// ------------------------------------------------------------------

export function appendSubscriptionEvent(
  event: Omit<SubscriptionEventLog, "id">,
): SubscriptionEventLog {
  const id = nextEventId();
  const stored: SubscriptionEventLog = { id, ...event };
  state.events.push(stored);
  return stored;
}

export function listSubscriptionEvents(subscriptionId: string): SubscriptionEventLog[] {
  return state.events
    .filter((event) => event.subscriptionId === subscriptionId)
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
}

// ------------------------------------------------------------------
// Stats
// ------------------------------------------------------------------

export interface SubscriptionMetricsSnapshot {
  totalSubscriptions: number;
  byStatus: Record<SubscriptionStatus, number>;
  byPlan: Record<SubscriptionPlanId, number>;
  activeMRRCents: number;
}

export function computeSubscriptionMetrics(): SubscriptionMetricsSnapshot {
  const subs = Array.from(state.subscriptions.values());
  const byStatus = {
    pending_activation: 0,
    active: 0,
    past_due: 0,
    cancelled: 0,
    suspended: 0,
  } as SubscriptionMetricsSnapshot["byStatus"];
  const byPlan = {
    "pack-a2": 0,
    "pack-ag": 0,
    "pack-aa": 0,
  } as SubscriptionMetricsSnapshot["byPlan"];
  let activeMRRCents = 0;

  for (const sub of subs) {
    byStatus[sub.status]++;
    byPlan[sub.planId]++;
    if (sub.status === "active" && sub.pricePaidCents) {
      // Aproximação inicial: planos one_time não contam para MRR.
      // Em produção será resolvido pelo billing service consolidado.
      activeMRRCents += sub.pricePaidCents;
    }
  }

  return {
    totalSubscriptions: subs.length,
    byStatus,
    byPlan,
    activeMRRCents,
  };
}

// ------------------------------------------------------------------
// Utilitário para testes
// ------------------------------------------------------------------

export function __resetSubscriptionsForTests(): void {
  state.subscriptions = new Map();
  state.events = [];
  state.nextSubscriptionSeq = 1;
  state.nextEventSeq = 1;
}
