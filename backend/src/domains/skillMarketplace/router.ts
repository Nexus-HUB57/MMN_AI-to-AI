/**
 * Nexus Affil'IA'te · Skill Marketplace · tRPC Router
 *
 * Vitrine pública + operações autenticadas de publicação/compra.
 *
 * @module domains/skillMarketplace/router
 * @author Niko Nexus · CEO/AI
 */
import { z } from "zod";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "../../config/trpc";
import { skillMarketplaceRepository } from "./repository";
import { listFiltersSchema, skillListingSchema } from "./types";

const publishInputSchema = skillListingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  totalCalls: true,
  totalRevenueCents: true,
  rating: true,
  ratingCount: true,
  publishedAt: true,
});

const updateInputSchema = z.object({
  id: z.string().min(1),
  patch: skillListingSchema
    .partial()
    .omit({ id: true, createdAt: true, totalCalls: true, totalRevenueCents: true }),
});

const purchaseInputSchema = z.object({
  listingSlug: z.string().min(1),
  callsAllowed: z.number().int().min(1).max(10_000).default(1),
});

export const skillMarketplaceRouter = router({
  // ── vitrine pública ────────────────────────────────────────────────────
  list: publicProcedure
    .input(listFiltersSchema.partial().default({}))
    .query(async ({ input }) => {
      const filters = listFiltersSchema.parse({
        page: 1,
        limit: 20,
        sortBy: "recent",
        status: "published",
        ...input,
      });
      const { items, total } = await skillMarketplaceRepository.list(filters);
      return {
        ok: true,
        items,
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      };
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const listing = await skillMarketplaceRepository.getBySlug(input.slug);
      return { ok: true, listing };
    }),

  stats: publicProcedure.query(async () => {
    const stats = await skillMarketplaceRepository.stats();
    return { ok: true, stats };
  }),

  // ── operações autenticadas ─────────────────────────────────────────────
  publish: protectedProcedure
    .input(publishInputSchema)
    .mutation(async ({ ctx, input }) => {
      const listing = await skillMarketplaceRepository.publish({
        ...input,
        publisherId: String(ctx.user.id ?? input.publisherId ?? "user"),
        status: "pending-review",
      });
      return { ok: true, listing };
    }),

  myListings: protectedProcedure.query(async ({ ctx }) => {
    const { items, total } = await skillMarketplaceRepository.list({
      publisherId: String(ctx.user.id),
      page: 1,
      limit: 100,
      sortBy: "recent",
      status: "draft",
    } as any);
    return { ok: true, items, total };
  }),

  purchase: protectedProcedure
    .input(purchaseInputSchema)
    .mutation(async ({ ctx, input }) => {
      const listing = await skillMarketplaceRepository.getBySlug(input.listingSlug);
      if (!listing) throw new Error("Listing não encontrado");
      if (listing.status !== "published")
        throw new Error("Listing não está publicado");

      const amountCents = listing.pricing.amountCents * input.callsAllowed;
      const purchase = await skillMarketplaceRepository.createPurchase({
        listingId: listing.id,
        buyerId: String(ctx.user.id),
        buyerName: String(ctx.user.id),
        amountCents,
        currency: listing.pricing.currency,
        callsAllowed: input.callsAllowed,
        judgeOutcome: "n/a",
      });

      await skillMarketplaceRepository.incrementUsage(
        listing.id,
        input.callsAllowed,
        amountCents,
      );

      return {
        ok: true,
        purchase,
        listing: {
          id: listing.id,
          slug: listing.slug,
          title: listing.title,
          invokeEndpoint: listing.invokeEndpoint,
        },
      };
    }),

  myPurchases: protectedProcedure.query(async ({ ctx }) => {
    const items = await skillMarketplaceRepository.listPurchasesByBuyer(
      String(ctx.user.id),
    );
    return { ok: true, items, total: items.length };
  }),

  // ── admin ──────────────────────────────────────────────────────────────
  approve: adminProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const listing = await skillMarketplaceRepository.update(input.id, {
        status: "published",
      });
      return { ok: true, listing };
    }),

  update: adminProcedure.input(updateInputSchema).mutation(async ({ input }) => {
    const listing = await skillMarketplaceRepository.update(input.id, input.patch);
    return { ok: true, listing };
  }),
});
