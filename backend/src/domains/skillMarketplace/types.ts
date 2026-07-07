/**
 * Nexus Affil'IA'te · Skill Marketplace · Tipos canônicos
 *
 * O marketplace é o motor de monetização agentic. Cada afiliado pode publicar,
 * alugar e ganhar comissão por execução de skills entre agentes (A2A).
 *
 * Sustenta o pilar 3 do mandato: "MARKETPLACE DE AGENTES".
 *
 * @module domains/skillMarketplace/types
 * @author Niko Nexus · CEO/AI
 */
import { z } from "zod";

// ─── Pricing & Billing ──────────────────────────────────────────────────────

export const pricingModelSchema = z.enum(["free", "per-call", "subscription"]);
export type PricingModel = z.infer<typeof pricingModelSchema>;

export const currencySchema = z.enum(["BRL", "USD", "BTC"]);
export type Currency = z.infer<typeof currencySchema>;

export const pricingSchema = z.object({
  model: pricingModelSchema.default("per-call"),
  currency: currencySchema.default("BRL"),
  amountCents: z.number().int().min(0).default(0),
  burstPolicy: z
    .object({
      requestsPerMinute: z.number().int().min(1).default(60),
      burst: z.number().int().min(1).default(10),
    })
    .optional(),
});
export type Pricing = z.infer<typeof pricingSchema>;

// ─── Listagem ───────────────────────────────────────────────────────────────

export const listingStatusSchema = z.enum([
  "draft",
  "pending-review",
  "published",
  "paused",
  "archived",
]);
export type ListingStatus = z.infer<typeof listingStatusSchema>;

export const skillListingSchema = z.object({
  id: z.string().min(1),
  slug: z
    .string()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "slug deve ser kebab-case minúsculo"),
  version: z
    .string()
    .regex(/^\d+\.\d+\.\d+$/)
    .default("1.0.0"),
  title: z.string().min(3).max(120),
  description: z.string().min(20).max(1200),
  category: z.enum([
    "copy",
    "segmentation",
    "judging",
    "funnel",
    "follow-up",
    "analytics",
    "outreach",
    "ops",
    "other",
  ]),
  publisherId: z.string().min(1),
  publisherName: z.string().min(2).max(80),
  pricing: pricingSchema,
  status: listingStatusSchema.default("draft"),
  inputContentTypes: z.array(z.string()).default(["application/json"]),
  outputContentTypes: z.array(z.string()).default(["application/json"]),
  tags: z.array(z.string().max(40)).default([]),
  agentCardUrl: z.string().url().optional(),
  invokeEndpoint: z.string().url().optional(),
  trustLevel: z
    .enum(["sandbox", "verified", "elite"])
    .default("sandbox"),
  judgeRequired: z.boolean().default(true),
  totalCalls: z.number().int().min(0).default(0),
  totalRevenueCents: z.number().int().min(0).default(0),
  rating: z.number().min(0).max(5).default(0),
  ratingCount: z.number().int().min(0).default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  publishedAt: z.string().datetime().optional(),
});
export type SkillListing = z.infer<typeof skillListingSchema>;

// ─── Compras / Execuções ────────────────────────────────────────────────────

export const purchaseSchema = z.object({
  id: z.string().min(1),
  listingId: z.string().min(1),
  buyerId: z.string().min(1),
  buyerName: z.string().min(2).max(80),
  amountCents: z.number().int().min(0),
  currency: currencySchema,
  callsAllowed: z.number().int().min(1).default(1),
  callsConsumed: z.number().int().min(0).default(0),
  status: z.enum(["active", "exhausted", "refunded", "expired"]).default("active"),
  judgeOutcome: z.enum(["approved", "review", "blocked", "n/a"]).default("n/a"),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
});
export type Purchase = z.infer<typeof purchaseSchema>;

// ─── Filtros para listagem pública ──────────────────────────────────────────

export const listFiltersSchema = z.object({
  category: z
    .enum([
      "copy",
      "segmentation",
      "judging",
      "funnel",
      "follow-up",
      "analytics",
      "outreach",
      "ops",
      "other",
    ])
    .optional(),
  status: listingStatusSchema.optional().default("published"),
  pricingModel: pricingModelSchema.optional(),
  publisherId: z.string().optional(),
  search: z.string().max(120).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(["recent", "popular", "rating", "price-asc", "price-desc"])
    .default("recent"),
});
export type ListFilters = z.infer<typeof listFiltersSchema>;

// ─── Estatísticas ───────────────────────────────────────────────────────────

export const marketplaceStatsSchema = z.object({
  totalListings: z.number().int().min(0),
  publishedListings: z.number().int().min(0),
  totalPublishers: z.number().int().min(0),
  totalCalls: z.number().int().min(0),
  totalRevenueCents: z.number().int().min(0),
  topCategories: z
    .array(
      z.object({
        category: z.string(),
        count: z.number().int().min(0),
      }),
    )
    .default([]),
  topPublishers: z
    .array(
      z.object({
        publisherId: z.string(),
        publisherName: z.string(),
        revenueCents: z.number().int().min(0),
      }),
    )
    .default([]),
});
export type MarketplaceStats = z.infer<typeof marketplaceStatsSchema>;
