/**
 * Subscriptions domain — repository.
 *
 * Estratégia híbrida:
 *  - Postgres/Drizzle quando DATABASE_URL estiver disponível.
 *  - fallback determinístico in-memory para testes e ambientes locais mínimos.
 */

import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../../database/schemas/db";
import {
  subscriptionEvents as subscriptionEventsTable,
  subscriptions as subscriptionsTable,
} from "../../../../database/schemas/schema-subscriptions";
import { getSubscriptionPlan } from "./catalog";
import type {
  BillingCycle,
  Subscription,
  SubscriptionEventLog,
  SubscriptionPlanId,
  SubscriptionStatus,
  SubscriptionTermMonths,
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
  const id = `sub_${Date.now().toString(36)}_${state.nextSubscriptionSeq.toString(36).padStart(3, "0")}`;
  state.nextSubscriptionSeq++;
  return id;
}

function nextEventId(): string {
  const id = `subev_${Date.now().toString(36)}_${state.nextEventSeq.toString(36).padStart(3, "0")}`;
  state.nextEventSeq++;
  return id;
}

function normalizeMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function fromDbSubscription(row: typeof subscriptionsTable.$inferSelect): Subscription {
  return {
    id: row.id,
    userId: row.userId,
    planId: row.planId as SubscriptionPlanId,
    status: row.status as SubscriptionStatus,
    termMonths: row.termMonths as SubscriptionTermMonths,
    startedAt: row.startedAt,
    activatedAt: row.activatedAt ?? null,
    renewsAt: row.renewsAt ?? null,
    cancelledAt: row.cancelledAt ?? null,
    pricePaidCents: row.pricePaidCents ?? null,
    metadata: normalizeMetadata(row.metadata),
  };
}

function fromDbEvent(row: typeof subscriptionEventsTable.$inferSelect): SubscriptionEventLog {
  return {
    id: row.id,
    subscriptionId: row.subscriptionId,
    type: row.type as SubscriptionEventLog["type"],
    fromPlanId: (row.fromPlanId as SubscriptionPlanId | null) ?? null,
    toPlanId: (row.toPlanId as SubscriptionPlanId | null) ?? null,
    triggeredBy: row.triggeredBy as SubscriptionEventLog["triggeredBy"],
    occurredAt: row.occurredAt,
    notes: row.notes ?? undefined,
    payload: normalizeMetadata(row.payload),
  };
}

export interface CreateSubscriptionInput {
  userId: number;
  planId: SubscriptionPlanId;
  billingCycle: BillingCycle;
  termMonths: SubscriptionTermMonths;
  pricePaidCents: number | null;
  metadata?: Record<string, unknown>;
}

export async function createSubscription(input: CreateSubscriptionInput): Promise<Subscription> {
  const id = nextSubscriptionId();
  const now = new Date();
  const subscription: Subscription = {
    id,
    userId: input.userId,
    planId: input.planId,
    status: "pending_activation",
    termMonths: input.termMonths,
    startedAt: now,
    activatedAt: null,
    renewsAt: null,
    cancelledAt: null,
    pricePaidCents: input.pricePaidCents,
    metadata: input.metadata ?? {},
  };

  state.subscriptions.set(id, subscription);

  const db = await getDb();
  if (db) {
    await db.insert(subscriptionsTable).values({
      id: subscription.id,
      userId: subscription.userId,
      planId: subscription.planId,
      status: subscription.status,
      billingCycle: input.billingCycle,
      termMonths: subscription.termMonths,
      startedAt: subscription.startedAt,
      activatedAt: subscription.activatedAt,
      renewsAt: subscription.renewsAt,
      cancelledAt: subscription.cancelledAt,
      pricePaidCents: subscription.pricePaidCents,
      metadata: subscription.metadata,
      createdAt: now,
      updatedAt: now,
    });
  }

  return subscription;
}

export async function getSubscription(id: string): Promise<Subscription | undefined> {
  const db = await getDb();
  if (db) {
    const [row] = await db.select().from(subscriptionsTable).where(eq(subscriptionsTable.id, id)).limit(1);
    if (row) return fromDbSubscription(row);
  }
  return state.subscriptions.get(id);
}

export async function updateSubscriptionStatus(
  id: string,
  status: SubscriptionStatus,
  patch: Partial<Pick<Subscription, "activatedAt" | "renewsAt" | "cancelledAt" | "metadata">> = {},
): Promise<Subscription | undefined> {
  const current = await getSubscription(id);
  if (!current) return undefined;

  const next: Subscription = {
    ...current,
    status,
    ...patch,
    metadata: { ...current.metadata, ...(patch.metadata ?? {}) },
  };

  state.subscriptions.set(id, next);

  const db = await getDb();
  if (db) {
    await db
      .update(subscriptionsTable)
      .set({
        status: next.status,
        activatedAt: next.activatedAt,
        renewsAt: next.renewsAt,
        cancelledAt: next.cancelledAt,
        metadata: next.metadata,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionsTable.id, id));
  }

  return next;
}

export async function updateSubscriptionPlan(
  id: string,
  planId: SubscriptionPlanId,
  pricePaidCents: number | null,
): Promise<Subscription | undefined> {
  const current = await getSubscription(id);
  if (!current) return undefined;

  const next: Subscription = {
    ...current,
    planId,
    pricePaidCents,
  };

  state.subscriptions.set(id, next);

  const db = await getDb();
  if (db) {
    await db
      .update(subscriptionsTable)
      .set({
        planId: next.planId,
        pricePaidCents: next.pricePaidCents,
        billingCycle: getSubscriptionPlan(next.planId).billingCycle,
        updatedAt: new Date(),
      })
      .where(eq(subscriptionsTable.id, id));
  }

  return next;
}

export interface ListSubscriptionsFilter {
  userId?: number;
  status?: SubscriptionStatus;
  planId?: SubscriptionPlanId;
  limit: number;
  offset: number;
}

export async function listSubscriptions(filter: ListSubscriptionsFilter): Promise<{
  items: Subscription[];
  total: number;
}> {
  const db = await getDb();
  const source = db
    ? (await db.select().from(subscriptionsTable).orderBy(desc(subscriptionsTable.startedAt))).map(fromDbSubscription)
    : Array.from(state.subscriptions.values()).sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

  const all = source
    .filter((sub) => (filter.userId ? sub.userId === filter.userId : true))
    .filter((sub) => (filter.status ? sub.status === filter.status : true))
    .filter((sub) => (filter.planId ? sub.planId === filter.planId : true));

  return {
    items: all.slice(filter.offset, filter.offset + filter.limit),
    total: all.length,
  };
}

export async function appendSubscriptionEvent(
  event: Omit<SubscriptionEventLog, "id">,
): Promise<SubscriptionEventLog> {
  const stored: SubscriptionEventLog = { id: nextEventId(), ...event };
  state.events.push(stored);

  const db = await getDb();
  if (db) {
    await db.insert(subscriptionEventsTable).values({
      id: stored.id,
      subscriptionId: stored.subscriptionId,
      type: stored.type,
      fromPlanId: stored.fromPlanId,
      toPlanId: stored.toPlanId,
      triggeredBy: stored.triggeredBy,
      occurredAt: stored.occurredAt,
      notes: stored.notes,
      payload: stored.payload ?? {},
    });
  }

  return stored;
}

export async function listSubscriptionEvents(subscriptionId: string): Promise<SubscriptionEventLog[]> {
  const db = await getDb();
  if (db) {
    const rows = await db
      .select()
      .from(subscriptionEventsTable)
      .where(eq(subscriptionEventsTable.subscriptionId, subscriptionId))
      .orderBy(desc(subscriptionEventsTable.occurredAt));
    return rows.map(fromDbEvent);
  }

  return state.events
    .filter((event) => event.subscriptionId === subscriptionId)
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
}

export interface SubscriptionMetricsSnapshot {
  totalSubscriptions: number;
  byStatus: Record<SubscriptionStatus, number>;
  byPlan: Record<SubscriptionPlanId, number>;
  activeMRRCents: number;
}

export async function computeSubscriptionMetrics(): Promise<SubscriptionMetricsSnapshot> {
  const subs = (await listSubscriptions({ limit: 10000, offset: 0 })).items;
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
    const plan = getSubscriptionPlan(sub.planId);
    if (sub.status === "active" && sub.pricePaidCents && plan.billingCycle === "monthly") {
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

export function __resetSubscriptionsForTests(): void {
  state.subscriptions = new Map();
  state.events = [];
  state.nextSubscriptionSeq = 1;
  state.nextEventSeq = 1;
}
