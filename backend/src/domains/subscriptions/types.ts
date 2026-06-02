/**
 * Subscriptions domain — types.
 *
 * Modelo comercial do Nexus Partners Pack apresentado como produto
 * exclusivamente por assinatura dentro do Nexus Store / Nexus Marketplace.
 */

import { z } from "zod";

export const subscriptionPlanIds = ["nexus-start", "nexus-growth", "nexus-enterprise"] as const;
export type SubscriptionPlanId = (typeof subscriptionPlanIds)[number];

export const subscriptionStatuses = [
  "pending_activation",
  "active",
  "past_due",
  "cancelled",
  "suspended",
] as const;
export type SubscriptionStatus = (typeof subscriptionStatuses)[number];

export const billingCycles = ["monthly", "yearly", "on_request"] as const;
export type BillingCycle = (typeof billingCycles)[number];

export const subscriptionTermMonths = [6, 12, 24, 36, 48] as const;
export type SubscriptionTermMonths = (typeof subscriptionTermMonths)[number];

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  shortName: string;
  fullName: string;
  tagline: string;
  priceCents: number | null;
  currency: "BRL";
  billingCycle: BillingCycle;
  partnerTier: "silver" | "gold" | "platinum" | "diamond";
  commissionRate: number;
  features: string[];
  capacity: {
    aiAgents: number;
    ebooks: number;
    skills: number;
    referralLevels: number;
  };
  governance: {
    requiresApproval: boolean;
    requiresAdminContact: boolean;
    highValue: boolean;
  };
  storefront: {
    subscriptionOnly: true;
    defaultTermMonths: SubscriptionTermMonths;
    availableTermsMonths: SubscriptionTermMonths[];
    licenseLabel: string;
    ctaLabel: string;
  };
}

export interface Subscription {
  id: string;
  userId: number;
  planId: SubscriptionPlanId;
  status: SubscriptionStatus;
  termMonths: SubscriptionTermMonths;
  startedAt: Date;
  activatedAt: Date | null;
  renewsAt: Date | null;
  cancelledAt: Date | null;
  pricePaidCents: number | null;
  metadata: Record<string, unknown>;
}

export interface SubscriptionEventLog {
  id: string;
  subscriptionId: string;
  type:
    | "subscription_started"
    | "subscription_activated"
    | "subscription_upgraded"
    | "subscription_renewed"
    | "subscription_past_due"
    | "subscription_cancelled"
    | "subscription_suspended";
  fromPlanId: SubscriptionPlanId | null;
  toPlanId: SubscriptionPlanId | null;
  triggeredBy: "user" | "admin" | "system" | "billing_webhook";
  occurredAt: Date;
  notes?: string;
  payload?: Record<string, unknown>;
}

export const subscriptionPlanIdSchema = z.enum(subscriptionPlanIds);
export const subscriptionStatusSchema = z.enum(subscriptionStatuses);
export const billingCycleSchema = z.enum(billingCycles);
export const subscriptionTermMonthsSchema = z.union(
  subscriptionTermMonths.map((term) => z.literal(term)) as [
    z.ZodLiteral<6>,
    z.ZodLiteral<12>,
    z.ZodLiteral<24>,
    z.ZodLiteral<36>,
    z.ZodLiteral<48>,
  ],
);

export const startSubscriptionInputSchema = z.object({
  userId: z.number().int().positive(),
  planId: subscriptionPlanIdSchema,
  termMonths: subscriptionTermMonthsSchema.default(12),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const upgradeSubscriptionInputSchema = z.object({
  subscriptionId: z.string().min(1),
  toPlanId: subscriptionPlanIdSchema,
  triggeredBy: z.enum(["user", "admin", "system", "billing_webhook"]).default("user"),
  notes: z.string().max(500).optional(),
});

export const cancelSubscriptionInputSchema = z.object({
  subscriptionId: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export const subscriptionListInputSchema = z.object({
  userId: z.number().int().positive().optional(),
  status: subscriptionStatusSchema.optional(),
  planId: subscriptionPlanIdSchema.optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
});
