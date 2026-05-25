import { promises as fs } from "node:fs";
import path from "node:path";
import { z } from "zod";

import { protectedProcedure, router } from "../config/trpc";

const careerLevelSchema = z.enum([
  "prospect",
  "affiliate_i",
  "affiliate_ii",
  "affiliate_iii",
  "predictive_i",
  "predictive_ii",
]);

const marketplaceProfileSchema = z.object({
  version: z.number().default(1),
  userId: z.number(),
  userName: z.string().optional(),
  userEmail: z.string().optional(),
  currentXp: z.number().int().nonnegative(),
  directReferrals: z.number().int().nonnegative(),
  currentLevel: careerLevelSchema,
  activePackSlugs: z.array(z.string()).default([]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const marketplaceProfileInputSchema = z.object({
  userName: z.string().optional(),
  userEmail: z.string().email().optional(),
  currentXp: z.number().int().nonnegative(),
  directReferrals: z.number().int().nonnegative(),
  currentLevel: careerLevelSchema,
  activePackSlugs: z.array(z.string()).default([]),
});

type MarketplaceProfileRecord = z.infer<typeof marketplaceProfileSchema>;

type MarketplaceProfileStore = Record<string, MarketplaceProfileRecord>;

function getStorePath() {
  return path.resolve(process.cwd(), "tmp", "marketplace-profiles.json");
}

async function readStore(): Promise<MarketplaceProfileStore> {
  const storePath = getStorePath();
  try {
    const raw = await fs.readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as MarketplaceProfileStore;
    return parsed ?? {};
  } catch {
    return {};
  }
}

async function writeStore(store: MarketplaceProfileStore) {
  const storePath = getStorePath();
  await fs.mkdir(path.dirname(storePath), { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
}

function buildDefaultProfile(userId: number) {
  const now = new Date().toISOString();
  return {
    version: 1,
    userId,
    currentXp: 0,
    directReferrals: 0,
    currentLevel: "prospect" as const,
    activePackSlugs: [],
    createdAt: now,
    updatedAt: now,
  };
}

export const marketplaceProfileRouter = router({
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const store = await readStore();
    const userId = String(ctx.user.id);
    const existing = store[userId] ?? buildDefaultProfile(ctx.user.id);
    const parsed = marketplaceProfileSchema.parse(existing);

    if (!store[userId]) {
      store[userId] = parsed;
      await writeStore(store);
    }

    return parsed;
  }),

  saveMyProfile: protectedProcedure
    .input(marketplaceProfileInputSchema)
    .mutation(async ({ ctx, input }) => {
      const store = await readStore();
      const userId = String(ctx.user.id);
      const current = store[userId] ?? buildDefaultProfile(ctx.user.id);
      const next: MarketplaceProfileRecord = marketplaceProfileSchema.parse({
        ...current,
        userId: ctx.user.id,
        userName: input.userName ?? current.userName,
        userEmail: input.userEmail ?? current.userEmail,
        currentXp: input.currentXp,
        directReferrals: input.directReferrals,
        currentLevel: input.currentLevel,
        activePackSlugs: Array.from(new Set(input.activePackSlugs)),
        updatedAt: new Date().toISOString(),
      });

      store[userId] = next;
      await writeStore(store);
      return next;
    }),

  resetMyProfile: protectedProcedure.mutation(async ({ ctx }) => {
    const store = await readStore();
    const userId = String(ctx.user.id);
    const next = buildDefaultProfile(ctx.user.id);
    store[userId] = next;
    await writeStore(store);
    return next;
  }),
});

export type MarketplaceProfileRouter = typeof marketplaceProfileRouter;
