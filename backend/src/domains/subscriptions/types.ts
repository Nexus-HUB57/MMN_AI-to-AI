/**
 * Subscriptions domain — types.
 *
 * Modelo de Assinatura Comercial do Nexus Affil'IA'te (v1.4.0).
 *
 * Cada parceiro do Nexus Partners Pack assina um dos 3 packs comerciais:
 *  - Pack A²  (entrada gratuita / R$ 10,00) — ativa 1 Agente IA, 10 e-books, painel
 *  - Pack AG  (profissional / R$ 250,00)  — agente preditivo, 250 e-books, multinível
 *  - Pack AA  (elite / sob consulta)       — camada estratégica, participação especial
 *
 * Este módulo é a fonte de verdade da camada comercial que substitui o antigo
 * sistema de XP/níveis. Toda promoção de tier do domínio Partners passa a ser
 * resultado de upgrade de assinatura, não mais de progressão por XP.
 */

import { z } from "zod";

export const subscriptionPlanIds = ["pack-a2", "pack-ag", "pack-aa"] as const;
export type SubscriptionPlanId = (typeof subscriptionPlanIds)[number];

export const subscriptionStatuses = [
  "pending_activation",
  "active",
  "past_due",
  "cancelled",
  "suspended",
] as const;
export type SubscriptionStatus = (typeof subscriptionStatuses)[number];

export const billingCycles = ["monthly", "yearly", "one_time", "on_request"] as const;
export type BillingCycle = (typeof billingCycles)[number];

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  shortName: string;
  fullName: string;
  tagline: string;
  priceCents: number | null; // null = sob consulta
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
}

export interface Subscription {
  id: string;
  userId: number;
  planId: SubscriptionPlanId;
  status: SubscriptionStatus;
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
}

// ------------------------------------------------------------------
// Schemas Zod
// ------------------------------------------------------------------

export const subscriptionPlanIdSchema = z.enum(subscriptionPlanIds);
export const subscriptionStatusSchema = z.enum(subscriptionStatuses);
export const billingCycleSchema = z.enum(billingCycles);

export const startSubscriptionInputSchema = z.object({
  userId: z.number().int().positive(),
  planId: subscriptionPlanIdSchema,
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
