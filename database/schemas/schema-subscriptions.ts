import { index, integer, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    userId: integer("user_id").notNull(),
    planId: varchar("plan_id", { length: 32 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    billingCycle: varchar("billing_cycle", { length: 20 }).notNull(),
    termMonths: integer("term_months").notNull().default(12),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    activatedAt: timestamp("activated_at"),
    renewsAt: timestamp("renews_at"),
    cancelledAt: timestamp("cancelled_at"),
    pricePaidCents: integer("price_paid_cents"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("subscriptions_user_idx").on(table.userId),
    statusIdx: index("subscriptions_status_idx").on(table.status),
    planIdx: index("subscriptions_plan_idx").on(table.planId),
    renewIdx: index("subscriptions_renew_idx").on(table.renewsAt),
  }),
);

export const subscriptionEvents = pgTable(
  "subscription_events",
  {
    id: varchar("id", { length: 64 }).primaryKey(),
    subscriptionId: varchar("subscription_id", { length: 64 }).notNull(),
    type: varchar("type", { length: 40 }).notNull(),
    fromPlanId: varchar("from_plan_id", { length: 32 }),
    toPlanId: varchar("to_plan_id", { length: 32 }),
    triggeredBy: varchar("triggered_by", { length: 32 }).notNull(),
    occurredAt: timestamp("occurred_at").notNull().defaultNow(),
    notes: text("notes"),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
  },
  (table) => ({
    subscriptionIdx: index("subscription_events_subscription_idx").on(table.subscriptionId),
    typeIdx: index("subscription_events_type_idx").on(table.type),
    occurredIdx: index("subscription_events_occurred_idx").on(table.occurredAt),
  }),
);

export type SubscriptionRow = typeof subscriptions.$inferSelect;
export type InsertSubscriptionRow = typeof subscriptions.$inferInsert;
export type SubscriptionEventRow = typeof subscriptionEvents.$inferSelect;
export type InsertSubscriptionEventRow = typeof subscriptionEvents.$inferInsert;
