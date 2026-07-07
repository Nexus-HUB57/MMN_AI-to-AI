/**
 * Nexus Affil'IA'te · Skill Marketplace · Repositório
 *
 * Persistência em arquivo JSON (MVP). Migração para drizzle/Postgres
 * planejada para o marco M9 (Revenue Streaming).
 *
 * @module domains/skillMarketplace/repository
 * @author Niko Nexus · CEO/AI
 */
import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import {
  skillListingSchema,
  purchaseSchema,
  type SkillListing,
  type Purchase,
  type ListFilters,
} from "./types";

const STORAGE_DIR = path.resolve(process.cwd(), "data");
const LISTINGS_PATH = path.join(STORAGE_DIR, "skill-marketplace-listings.json");
const PURCHASES_PATH = path.join(STORAGE_DIR, "skill-marketplace-purchases.json");

const listingsFileSchema = z.object({
  version: z.number().default(1),
  listings: z.array(skillListingSchema).default([]),
  updatedAt: z.string().datetime().optional(),
});

const purchasesFileSchema = z.object({
  version: z.number().default(1),
  purchases: z.array(purchaseSchema).default([]),
  updatedAt: z.string().datetime().optional(),
});

type ListingsFile = z.infer<typeof listingsFileSchema>;
type PurchasesFile = z.infer<typeof purchasesFileSchema>;

// ─── Bootstrap ──────────────────────────────────────────────────────────────

async function ensureFiles() {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  for (const [p, def] of [
    [LISTINGS_PATH, { version: 1, listings: [], updatedAt: new Date().toISOString() }],
    [PURCHASES_PATH, { version: 1, purchases: [], updatedAt: new Date().toISOString() }],
  ] as const) {
    try {
      await fs.access(p);
    } catch {
      await fs.writeFile(p, JSON.stringify(def, null, 2), "utf8");
    }
  }
}

async function readListings(): Promise<ListingsFile> {
  await ensureFiles();
  const raw = await fs.readFile(LISTINGS_PATH, "utf8");
  return listingsFileSchema.parse(JSON.parse(raw));
}

async function writeListings(data: ListingsFile) {
  await ensureFiles();
  await fs.writeFile(
    LISTINGS_PATH,
    JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2),
    "utf8",
  );
}

async function readPurchases(): Promise<PurchasesFile> {
  await ensureFiles();
  const raw = await fs.readFile(PURCHASES_PATH, "utf8");
  return purchasesFileSchema.parse(JSON.parse(raw));
}

async function writePurchases(data: PurchasesFile) {
  await ensureFiles();
  await fs.writeFile(
    PURCHASES_PATH,
    JSON.stringify({ ...data, updatedAt: new Date().toISOString() }, null, 2),
    "utf8",
  );
}

function generateId(prefix = "lst"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Seed inicial (skills root) ─────────────────────────────────────────────

async function maybeSeed() {
  const file = await readListings();
  if (file.listings.length > 0) return;

  const now = new Date().toISOString();
  const seed: SkillListing[] = [
    {
      id: "seed-copywriter-persuasivo",
      slug: "copywriter-persuasivo",
      version: "1.0.0",
      title: "Copywriter Persuasivo Nexus",
      description:
        "Gera copy persuasivo calibrado para afiliados em múltiplos canais (WhatsApp, e-mail, landing). Treinado em frameworks PAS, AIDA e BAB.",
      category: "copy",
      publisherId: "nexus-root",
      publisherName: "Nexus Affil'IA'te",
      pricing: { model: "per-call", currency: "BRL", amountCents: 5 },
      status: "published",
      inputContentTypes: ["application/json"],
      outputContentTypes: ["application/json"],
      tags: ["copy", "pas", "aida", "bab", "whatsapp", "email", "landing"],
      agentCardUrl: "https://oneverso.com.br/api/trpc/a2a.getAgentCard",
      invokeEndpoint: "https://oneverso.com.br/api/a2a/invoke",
      trustLevel: "verified",
      judgeRequired: true,
      totalCalls: 0,
      totalRevenueCents: 0,
      rating: 5,
      ratingCount: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    },
    {
      id: "seed-audience-segmenter",
      slug: "audience-segmenter",
      version: "1.0.0",
      title: "Audience Segmenter Nexus",
      description:
        "Segmenta audiência por intenção (frio, morno, quente) usando sinais comportamentais e tags semânticas.",
      category: "segmentation",
      publisherId: "nexus-root",
      publisherName: "Nexus Affil'IA'te",
      pricing: { model: "per-call", currency: "BRL", amountCents: 3 },
      status: "published",
      tags: ["segmentacao", "intencao", "rfm"],
      agentCardUrl: "https://oneverso.com.br/api/trpc/a2a.getAgentCard",
      invokeEndpoint: "https://oneverso.com.br/api/a2a/invoke",
      trustLevel: "verified",
      judgeRequired: false,
      totalCalls: 0,
      totalRevenueCents: 0,
      rating: 4.8,
      ratingCount: 0,
      inputContentTypes: ["application/json"],
      outputContentTypes: ["application/json"],
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    },
    {
      id: "seed-judge-revisor",
      slug: "judge-revisor",
      version: "1.0.0",
      title: "Judge Revisor Nexus",
      description:
        "Avalia qualidade e risco de outputs IA antes do envio, retornando score e decisão (aprovar, revisar, bloquear).",
      category: "judging",
      publisherId: "nexus-root",
      publisherName: "Nexus Affil'IA'te",
      pricing: { model: "free", currency: "BRL", amountCents: 0 },
      status: "published",
      tags: ["judge", "qualidade", "sho", "governanca"],
      agentCardUrl: "https://oneverso.com.br/api/trpc/a2a.getAgentCard",
      invokeEndpoint: "https://oneverso.com.br/api/a2a/invoke",
      trustLevel: "elite",
      judgeRequired: false,
      totalCalls: 0,
      totalRevenueCents: 0,
      rating: 4.9,
      ratingCount: 0,
      inputContentTypes: ["application/json"],
      outputContentTypes: ["application/json"],
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    },
    {
      id: "seed-funnel-architect",
      slug: "funnel-architect",
      version: "1.0.0",
      title: "Funnel Architect Nexus",
      description:
        "Constrói funil ponta a ponta (lead a conversão) integrando WhatsApp, e-mail e landing page com automação.",
      category: "funnel",
      publisherId: "nexus-root",
      publisherName: "Nexus Affil'IA'te",
      pricing: { model: "per-call", currency: "BRL", amountCents: 12 },
      status: "published",
      tags: ["funil", "lifecycle", "automacao"],
      agentCardUrl: "https://oneverso.com.br/api/trpc/a2a.getAgentCard",
      invokeEndpoint: "https://oneverso.com.br/api/a2a/invoke",
      trustLevel: "verified",
      judgeRequired: true,
      totalCalls: 0,
      totalRevenueCents: 0,
      rating: 4.7,
      ratingCount: 0,
      inputContentTypes: ["application/json"],
      outputContentTypes: ["application/json"],
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    },
    {
      id: "seed-follow-up",
      slug: "follow-up-strategist",
      version: "1.0.0",
      title: "Follow-up Strategist Nexus",
      description:
        "Orquestra sequências de follow-up personalizadas com timing otimizado por agente downstream.",
      category: "follow-up",
      publisherId: "nexus-root",
      publisherName: "Nexus Affil'IA'te",
      pricing: { model: "per-call", currency: "BRL", amountCents: 4 },
      status: "published",
      tags: ["follow-up", "lifecycle", "cadencia"],
      agentCardUrl: "https://oneverso.com.br/api/trpc/a2a.getAgentCard",
      invokeEndpoint: "https://oneverso.com.br/api/a2a/invoke",
      trustLevel: "verified",
      judgeRequired: true,
      totalCalls: 0,
      totalRevenueCents: 0,
      rating: 4.6,
      ratingCount: 0,
      inputContentTypes: ["application/json"],
      outputContentTypes: ["application/json"],
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    },
  ];

  file.listings = seed;
  await writeListings(file);
}

// ─── API pública ────────────────────────────────────────────────────────────

export const skillMarketplaceRepository = {
  async list(filters: ListFilters): Promise<{ items: SkillListing[]; total: number }> {
    await maybeSeed();
    const { listings } = await readListings();
    let items = [...listings];

    if (filters.status) items = items.filter((i) => i.status === filters.status);
    if (filters.category) items = items.filter((i) => i.category === filters.category);
    if (filters.pricingModel)
      items = items.filter((i) => i.pricing.model === filters.pricingModel);
    if (filters.publisherId)
      items = items.filter((i) => i.publisherId === filters.publisherId);
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    switch (filters.sortBy) {
      case "popular":
        items.sort((a, b) => b.totalCalls - a.totalCalls);
        break;
      case "rating":
        items.sort((a, b) => b.rating - a.rating);
        break;
      case "price-asc":
        items.sort((a, b) => a.pricing.amountCents - b.pricing.amountCents);
        break;
      case "price-desc":
        items.sort((a, b) => b.pricing.amountCents - a.pricing.amountCents);
        break;
      case "recent":
      default:
        items.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        );
    }

    const total = items.length;
    const offset = (filters.page - 1) * filters.limit;
    items = items.slice(offset, offset + filters.limit);

    return { items, total };
  },

  async getBySlug(slug: string): Promise<SkillListing | null> {
    await maybeSeed();
    const { listings } = await readListings();
    return listings.find((i) => i.slug === slug) ?? null;
  },

  async getById(id: string): Promise<SkillListing | null> {
    await maybeSeed();
    const { listings } = await readListings();
    return listings.find((i) => i.id === id) ?? null;
  },

  async publish(
    input: Omit<SkillListing, "id" | "createdAt" | "updatedAt" | "totalCalls" | "totalRevenueCents" | "rating" | "ratingCount">,
  ): Promise<SkillListing> {
    await maybeSeed();
    const file = await readListings();
    const exists = file.listings.find((i) => i.slug === input.slug);
    if (exists) {
      throw new Error(`Slug já em uso: ${input.slug}`);
    }
    const now = new Date().toISOString();
    const listing: SkillListing = skillListingSchema.parse({
      ...input,
      id: generateId("lst"),
      createdAt: now,
      updatedAt: now,
      publishedAt: input.status === "published" ? now : undefined,
      totalCalls: 0,
      totalRevenueCents: 0,
      rating: 0,
      ratingCount: 0,
    });
    file.listings.push(listing);
    await writeListings(file);
    return listing;
  },

  async update(
    id: string,
    patch: Partial<Omit<SkillListing, "id" | "createdAt">>,
  ): Promise<SkillListing> {
    const file = await readListings();
    const idx = file.listings.findIndex((i) => i.id === id);
    if (idx < 0) throw new Error("Listing não encontrado");
    const current = file.listings[idx];
    const updated = skillListingSchema.parse({
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
      publishedAt:
        patch.status === "published" && !current.publishedAt
          ? new Date().toISOString()
          : current.publishedAt,
    });
    file.listings[idx] = updated;
    await writeListings(file);
    return updated;
  },

  async incrementUsage(
    id: string,
    addCalls = 1,
    addRevenueCents = 0,
  ): Promise<void> {
    const file = await readListings();
    const idx = file.listings.findIndex((i) => i.id === id);
    if (idx < 0) return;
    file.listings[idx].totalCalls += addCalls;
    file.listings[idx].totalRevenueCents += addRevenueCents;
    file.listings[idx].updatedAt = new Date().toISOString();
    await writeListings(file);
  },

  async createPurchase(
    input: Omit<Purchase, "id" | "createdAt" | "callsConsumed" | "status">,
  ): Promise<Purchase> {
    const file = await readPurchases();
    const purchase: Purchase = purchaseSchema.parse({
      ...input,
      id: generateId("pur"),
      callsConsumed: 0,
      status: "active",
      createdAt: new Date().toISOString(),
    });
    file.purchases.push(purchase);
    await writePurchases(file);
    return purchase;
  },

  async listPurchasesByBuyer(buyerId: string): Promise<Purchase[]> {
    const file = await readPurchases();
    return file.purchases.filter((p) => p.buyerId === buyerId);
  },

  async stats(): Promise<{
    totalListings: number;
    publishedListings: number;
    totalPublishers: number;
    totalCalls: number;
    totalRevenueCents: number;
    topCategories: Array<{ category: string; count: number }>;
    topPublishers: Array<{
      publisherId: string;
      publisherName: string;
      revenueCents: number;
    }>;
  }> {
    await maybeSeed();
    const { listings } = await readListings();
    const totalListings = listings.length;
    const publishedListings = listings.filter((l) => l.status === "published").length;

    const publishersMap = new Map<
      string,
      { publisherName: string; revenueCents: number }
    >();
    const categoriesMap = new Map<string, number>();
    let totalCalls = 0;
    let totalRevenueCents = 0;

    for (const l of listings) {
      totalCalls += l.totalCalls;
      totalRevenueCents += l.totalRevenueCents;
      categoriesMap.set(l.category, (categoriesMap.get(l.category) ?? 0) + 1);
      const pub = publishersMap.get(l.publisherId) ?? {
        publisherName: l.publisherName,
        revenueCents: 0,
      };
      pub.revenueCents += l.totalRevenueCents;
      publishersMap.set(l.publisherId, pub);
    }

    const topCategories = [...categoriesMap.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topPublishers = [...publishersMap.entries()]
      .map(([publisherId, v]) => ({
        publisherId,
        publisherName: v.publisherName,
        revenueCents: v.revenueCents,
      }))
      .sort((a, b) => b.revenueCents - a.revenueCents)
      .slice(0, 5);

    return {
      totalListings,
      publishedListings,
      totalPublishers: publishersMap.size,
      totalCalls,
      totalRevenueCents,
      topCategories,
      topPublishers,
    };
  },
};
