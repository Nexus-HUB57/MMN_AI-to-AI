import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../config/trpc";

const contentTypeSchema = z.enum([
  "curso",
  "treinamento",
  "webinar",
  "playbook",
  "lab",
  "lib",
]);

const levelSchema = z.enum(["fundamental", "agente", "master", "elite"]);
const tierSchema = z.enum(["iniciante", "operador", "estrategista", "elite"]);

const lessonOverrideSchema = z.object({
  lessonId: z.string().min(1),
  sectionSlug: contentTypeSchema.optional(),
  title: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  duration: z.string().optional(),
  description: z.string().optional(),
  level: levelSchema.optional(),
  requiredTier: tierSchema.optional(),
  videoUrl: z.string().url().or(z.literal("")).optional(),
  pdfUrl: z.string().url().or(z.literal("")).optional(),
  mdPath: z.string().optional(),
  thumbnailUrl: z.string().url().or(z.literal("")).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  notes: z.string().optional(),
  updatedAt: z.string().datetime().optional(),
  updatedBy: z.string().optional(),
});

type LessonOverride = z.infer<typeof lessonOverrideSchema>;

const storageSchema = z.object({
  version: z.number().default(1),
  items: z.array(lessonOverrideSchema).default([]),
  updatedAt: z.string().datetime().optional(),
});

type OverridesFile = z.infer<typeof storageSchema>;

const STORAGE_PATH = path.resolve(process.cwd(), "data", "academia-ead-overrides.json");

async function ensureStorage() {
  await fs.mkdir(path.dirname(STORAGE_PATH), { recursive: true });

  try {
    await fs.access(STORAGE_PATH);
  } catch {
    const initial: OverridesFile = {
      version: 1,
      items: [],
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(STORAGE_PATH, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readStorage(): Promise<OverridesFile> {
  await ensureStorage();
  const raw = await fs.readFile(STORAGE_PATH, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  return storageSchema.parse(parsed);
}

async function writeStorage(data: OverridesFile) {
  await ensureStorage();
  await fs.writeFile(
    STORAGE_PATH,
    JSON.stringify(
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      null,
      2,
    ),
    "utf8",
  );
}

function normalizeOverride(input: LessonOverride, updatedBy: string): LessonOverride {
  const normalizedTags = Array.isArray(input.tags)
    ? input.tags.map((tag) => tag.trim()).filter(Boolean)
    : undefined;

  return {
    ...input,
    tags: normalizedTags,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };
}

export const academiaEadRouter = router({
  listOverrides: publicProcedure
    .input(
      z
        .object({
          sectionSlug: contentTypeSchema.optional(),
          publishedOnly: z.boolean().optional().default(false),
          featuredOnly: z.boolean().optional().default(false),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const storage = await readStorage();
      let items = [...storage.items];

      if (input?.sectionSlug) {
        items = items.filter((item) => item.sectionSlug === input.sectionSlug);
      }

      if (input?.publishedOnly) {
        items = items.filter((item) => item.isPublished !== false);
      }

      if (input?.featuredOnly) {
        items = items.filter((item) => item.isFeatured === true);
      }

      items.sort((a, b) => {
        const orderA = a.sortOrder ?? 9999;
        const orderB = b.sortOrder ?? 9999;
        return orderA - orderB || a.lessonId.localeCompare(b.lessonId);
      });

      return {
        items,
        total: items.length,
        updatedAt: storage.updatedAt,
      };
    }),

  getOverride: publicProcedure
    .input(z.object({ lessonId: z.string().min(1) }))
    .query(async ({ input }) => {
      const storage = await readStorage();
      const item = storage.items.find((entry) => entry.lessonId === input.lessonId) ?? null;
      return {
        item,
        updatedAt: storage.updatedAt,
      };
    }),

  getStats: adminProcedure.query(async () => {
    const storage = await readStorage();
    const total = storage.items.length;
    const published = storage.items.filter((item) => item.isPublished !== false).length;
    const withVideo = storage.items.filter((item) => Boolean(item.videoUrl)).length;
    const withPdf = storage.items.filter((item) => Boolean(item.pdfUrl)).length;
    const featured = storage.items.filter((item) => item.isFeatured).length;

    const bySection = storage.items.reduce<Record<string, number>>((acc, item) => {
      const key = item.sectionSlug || "sem_secao";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      published,
      withVideo,
      withPdf,
      featured,
      bySection,
      updatedAt: storage.updatedAt,
    };
  }),

  upsertOverride: adminProcedure
    .input(lessonOverrideSchema)
    .mutation(async ({ input, ctx }) => {
      const storage = await readStorage();
      const updatedBy = ctx.user?.id ? `user:${ctx.user.id}` : "admin:unknown";
      const normalized = normalizeOverride(input, updatedBy);
      const existingIndex = storage.items.findIndex((item) => item.lessonId === input.lessonId);

      if (existingIndex >= 0) {
        storage.items[existingIndex] = {
          ...storage.items[existingIndex],
          ...normalized,
        };
      } else {
        storage.items.push(normalized);
      }

      await writeStorage(storage);

      return {
        ok: true,
        item: storage.items.find((item) => item.lessonId === input.lessonId) ?? normalized,
      };
    }),

  deleteOverride: adminProcedure
    .input(z.object({ lessonId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const storage = await readStorage();
      const before = storage.items.length;
      storage.items = storage.items.filter((item) => item.lessonId !== input.lessonId);
      await writeStorage(storage);

      return {
        ok: true,
        removed: before !== storage.items.length,
      };
    }),
});
