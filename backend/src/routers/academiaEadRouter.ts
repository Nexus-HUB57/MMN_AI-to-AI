import { promises as fs } from "fs";
import path from "path";
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../config/trpc";
import {
  isAcademiaLessonsAvailable,
  listLessons,
  getLesson,
  upsertLesson,
  deleteLesson,
  lessonsStats,
  type AcademiaLessonRow,
} from "../services/academiaLessonsRepository";


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

function normalizeYoutubeHandle(handle?: string) {
  const clean = (handle || "@NexusAffilIAte-w9p").trim();
  return clean.startsWith("@") ? clean : `@${clean}`;
}

function buildYoutubeChannelUrl(handle?: string, fallbackUrl?: string) {
  if (fallbackUrl?.startsWith("https://www.youtube.com/")) return fallbackUrl;
  return `https://www.youtube.com/${normalizeYoutubeHandle(handle)}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`youtube_http_${response.status}`);
  }

  return (await response.json()) as T;
}

async function fetchYoutubePageFallback(
  channelUrl: string,
  handle: string,
  contentPillars: Array<{ slug: string; title: string; description: string }>,
  notePrefix?: string,
) {
  try {
    const response = await fetch(channelUrl, {
      headers: {
        Accept: "text/html,application/xhtml+xml",
        "User-Agent": "Mozilla/5.0 (compatible; NexusAffilIAteSync/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`youtube_page_http_${response.status}`);
    }

    const html = await response.text();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const ogTitleMatch = html.match(/property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const title = (ogTitleMatch?.[1] || titleMatch?.[1] || `${handle} - YouTube`).trim();
    const noContent = /This channel doesn't have any content/i.test(html);

    return {
      configured: true,
      connected: true,
      channelHandle: handle,
      channelUrl,
      contentPillars,
      latestVideos: [],
      syncedAt: new Date().toISOString(),
      note: noContent
        ? `${notePrefix ? `${notePrefix} · ` : ""}canal público validado, porém ainda sem vídeos publicados.`
        : `${notePrefix ? `${notePrefix} · ` : ""}canal público validado via página do YouTube.`,
      channel: {
        id: null,
        title,
        description: "",
        publishedAt: null,
        thumbnailUrl: "",
        customUrl: handle,
        subscriberCount: 0,
        videoCount: 0,
        viewCount: 0,
      },
      publicPageReachable: true,
      hasPublishedContent: !noContent,
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      channelHandle: handle,
      channelUrl,
      contentPillars,
      latestVideos: [],
      syncedAt: new Date().toISOString(),
      note: error instanceof Error ? error.message : "Falha ao validar a página pública do canal.",
    };
  }
}

async function fetchYoutubeChannelSnapshot() {
  const handle = normalizeYoutubeHandle(process.env.YOUTUBE_CHANNEL_HANDLE);
  const channelUrl = buildYoutubeChannelUrl(process.env.YOUTUBE_CHANNEL_HANDLE, process.env.YOUTUBE_CHANNEL_URL);
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  const contentPillars = [
    {
      slug: "video-aulas",
      title: "Vídeo Aulas",
      description: "Publicação das trilhas formativas da Academ'IA com vídeos curtos e progressivos por nível.",
    },
    {
      slug: "materiais-informativos",
      title: "Materiais Informativos",
      description: "Conteúdos editoriais e explicativos que apoiam o uso do ecossistema e das trilhas educacionais.",
    },
    {
      slug: "materiais-nexus",
      title: "Materiais Nexus Affil'IA'te",
      description: "Demais vídeos e recursos relacionados à plataforma oneverso.com.br e ao runtime comercial do Nexus.",
    },
  ];

  if (!apiKey) {
    return {
      configured: false,
      connected: false,
      channelHandle: handle,
      channelUrl,
      contentPillars,
      latestVideos: [],
      syncedAt: new Date().toISOString(),
      note: "Chave de API do YouTube não configurada no servidor.",
    };
  }

  try {
    const handleValue = handle.replace(/^@/, "");
    type YoutubeChannelItem = {
      id: string;
      snippet?: {
        title?: string;
        description?: string;
        customUrl?: string;
        publishedAt?: string;
        thumbnails?: Record<string, { url?: string }>;
      };
      contentDetails?: {
        relatedPlaylists?: {
          uploads?: string;
        };
      };
      statistics?: {
        subscriberCount?: string;
        videoCount?: string;
        viewCount?: string;
      };
    };

    let channel: YoutubeChannelItem | undefined;

    try {
      const byHandle = await fetchJson<{ items?: YoutubeChannelItem[] }>(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&forHandle=${encodeURIComponent(handleValue)}&key=${encodeURIComponent(apiKey)}`);
      channel = byHandle.items?.[0];
    } catch {
      channel = undefined;
    }

    if (!channel?.id) {
      const searchResponse = await fetchJson<{
        items?: Array<{
          id?: { channelId?: string };
        }>;
      }>(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(handleValue)}&key=${encodeURIComponent(apiKey)}`);

      const channelId = searchResponse.items?.[0]?.id?.channelId;
      if (channelId) {
        const byId = await fetchJson<{ items?: YoutubeChannelItem[] }>(`https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&id=${encodeURIComponent(channelId)}&key=${encodeURIComponent(apiKey)}`);
        channel = byId.items?.[0];
      }
    }

    if (!channel?.id) {
      return fetchYoutubePageFallback(channelUrl, handle, contentPillars, "API do YouTube sem resolução do canal");
    }

    const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;
    let latestVideos: Array<{
      videoId: string;
      title: string;
      description: string;
      publishedAt: string | null;
      thumbnailUrl: string;
      url: string;
    }> = [];

    if (uploadsPlaylistId) {
      const uploadsResponse = await fetchJson<{
        items?: Array<{
          snippet?: {
            title?: string;
            description?: string;
            publishedAt?: string;
            resourceId?: { videoId?: string };
            thumbnails?: Record<string, { url?: string }>;
          };
          contentDetails?: { videoId?: string };
        }>;
      }>(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${encodeURIComponent(uploadsPlaylistId)}&maxResults=8&key=${encodeURIComponent(apiKey)}`);

      latestVideos = (uploadsResponse.items || [])
        .map((item) => {
          const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId || "";
          return {
            videoId,
            title: item.snippet?.title || "Vídeo sem título",
            description: item.snippet?.description || "",
            publishedAt: item.snippet?.publishedAt || null,
            thumbnailUrl:
              item.snippet?.thumbnails?.maxres?.url ||
              item.snippet?.thumbnails?.high?.url ||
              item.snippet?.thumbnails?.medium?.url ||
              item.snippet?.thumbnails?.default?.url ||
              "",
            url: videoId ? `https://www.youtube.com/watch?v=${videoId}` : channelUrl,
          };
        })
        .filter((item) => Boolean(item.videoId));
    }

    return {
      configured: true,
      connected: true,
      channelHandle: handle,
      channelUrl,
      uploadsPlaylistId: uploadsPlaylistId || null,
      contentPillars,
      latestVideos,
      syncedAt: new Date().toISOString(),
      channel: {
        id: channel.id,
        title: channel.snippet?.title || "Nexus Affil'IA'te",
        description: channel.snippet?.description || "",
        publishedAt: channel.snippet?.publishedAt || null,
        thumbnailUrl:
          channel.snippet?.thumbnails?.high?.url ||
          channel.snippet?.thumbnails?.medium?.url ||
          channel.snippet?.thumbnails?.default?.url ||
          "",
        customUrl: channel.snippet?.customUrl || handle,
        subscriberCount: Number(channel.statistics?.subscriberCount || 0),
        videoCount: Number(channel.statistics?.videoCount || 0),
        viewCount: Number(channel.statistics?.viewCount || 0),
      },
    };
  } catch (error) {
    return fetchYoutubePageFallback(
      channelUrl,
      handle,
      contentPillars,
      error instanceof Error ? error.message : "Falha ao consultar a API do YouTube",
    );
  }
}


function rowToOverride(row: AcademiaLessonRow) {
  return {
    lessonId: row.lessonId,
    sectionSlug: row.sectionSlug as any,
    title: row.title || undefined,
    subtitle: row.subtitle || undefined,
    level: (row.level as any) || undefined,
    requiredTier: (row.requiredTier as any) || undefined,
    duration: row.durationS ? `${row.durationS}s` : undefined,
    videoUrl: row.videoUrl || undefined,
    pdfUrl: row.pdfUrl || undefined,
    mdPath: row.mdUrl || undefined,
    htmlUrl: row.htmlUrl || undefined,
    thumbnailUrl: row.thumbnailUrl || undefined,
    coverUrl: row.coverUrl || undefined,
    publishedAt: row.publishedAt || undefined,
    titleEn: row.titleEn || undefined,
    subtitleEn: row.subtitleEn || undefined,
    youtubeStatus: row.youtubeStatus || undefined,
    youtubeChannel: row.youtubeChannel || undefined,
    tags: row.tags && row.tags.length ? row.tags : undefined,
    isPublished: row.isPublished,
    isFeatured: row.isFeatured,
    sortOrder: row.sortOrder,
    rank: row.rank,
    updatedAt: row.updatedAt,
    updatedBy: row.updatedBy || undefined,
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
          search: z.string().min(1).max(200).optional(),
          limit: z.number().int().positive().max(200).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      try {
        if (await isAcademiaLessonsAvailable()) {
          const rows = await listLessons({
            sectionSlug: input?.sectionSlug,
            publishedOnly: input?.publishedOnly,
            featuredOnly: input?.featuredOnly,
            search: input?.search,
            limit: input?.limit,
          });
          const items = rows.map(rowToOverride);
          return {
            items,
            total: items.length,
            updatedAt: rows.length ? rows[0].updatedAt : new Date().toISOString(),
            source: "postgres" as const,
          };
        }
      } catch (err) {
        console.warn("[academiaEad] PG listOverrides falhou, usando JSON:", err);
      }
      const storage = await readStorage();
      let items = [...storage.items];
      if (input?.sectionSlug) items = items.filter((item) => item.sectionSlug === input.sectionSlug);
      if (input?.publishedOnly) items = items.filter((item) => item.isPublished !== false);
      if (input?.featuredOnly)  items = items.filter((item) => item.isFeatured === true);
      if (input?.search) {
        const q = input.search.toLowerCase();
        items = items.filter((item) =>
          (item.title || "").toLowerCase().includes(q) ||
          (item.subtitle || "").toLowerCase().includes(q) ||
          (item.tags || []).some((t) => t.toLowerCase().includes(q)),
        );
      }
      items.sort((a, b) => {
        const orderA = a.sortOrder ?? 9999;
        const orderB = b.sortOrder ?? 9999;
        return orderA - orderB || a.lessonId.localeCompare(b.lessonId);
      });
      return { items, total: items.length, updatedAt: storage.updatedAt, source: "json" as const };
    }),

  getOverride: publicProcedure
    .input(z.object({ lessonId: z.string().min(1) }))
    .query(async ({ input }) => {
      try {
        if (await isAcademiaLessonsAvailable()) {
          const row = await getLesson(input.lessonId);
          if (row) {
            return { item: rowToOverride(row), updatedAt: row.updatedAt, source: "postgres" as const };
          }
        }
      } catch (err) {
        console.warn("[academiaEad] PG getOverride falhou, usando JSON:", err);
      }
      const storage = await readStorage();
      const item = storage.items.find((entry) => entry.lessonId === input.lessonId) ?? null;
      return { item, updatedAt: storage.updatedAt, source: "json" as const };
    }),

  youtubeSyncStatus: publicProcedure.query(async () => {
    return fetchYoutubeChannelSnapshot();
  }),

  getStats: adminProcedure.query(async () => {
    try {
      if (await isAcademiaLessonsAvailable()) {
        const s = await lessonsStats();
        return {
          total: s.total,
          published: s.published,
          withVideo: s.withVideo,
          withPdf: s.withPdf,
          withMd: s.withMd,
          withHtml: s.withHtml,
          withThumbnail: s.withThumb,
          featured: 0,
          bySection: s.bySection,
          byLevel: s.byLevel,
          updatedAt: s.updatedAt,
          source: "postgres" as const,
        };
      }
    } catch (err) {
      console.warn("[academiaEad] PG getStats falhou, usando JSON:", err);
    }
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
      source: "json" as const,
    };
  }),

  upsertOverride: adminProcedure
    .input(lessonOverrideSchema)
    .mutation(async ({ input, ctx }) => {
      const updatedBy = ctx.user?.id ? `user:${ctx.user.id}` : "admin:unknown";

      // Primário: Postgres
      try {
        if (await isAcademiaLessonsAvailable()) {
          const row = await upsertLesson(
            {
              lessonId: input.lessonId,
              sectionSlug: input.sectionSlug || "curso",
              title: input.title,
              subtitle: input.subtitle,
              level: input.level,
              requiredTier: input.requiredTier,
              durationS: input.duration ? Number(String(input.duration).replace(/[^0-9]/g, "")) || null : null,
              videoUrl: input.videoUrl,
              mdUrl: input.mdPath,
              pdfUrl: input.pdfUrl,
              thumbnailUrl: input.thumbnailUrl,
              tags: input.tags,
              isPublished: input.isPublished,
            },
            updatedBy,
          );
          return { ok: true, item: rowToOverride(row), source: "postgres" as const };
        }
      } catch (err) {
        console.warn("[academiaEad] PG upsertOverride falhou, usando JSON:", err);
      }

      // Fallback: JSON
      const storage = await readStorage();
      const normalized = normalizeOverride(input, updatedBy);
      const existingIndex = storage.items.findIndex((item) => item.lessonId === input.lessonId);
      if (existingIndex >= 0) {
        storage.items[existingIndex] = { ...storage.items[existingIndex], ...normalized };
      } else {
        storage.items.push(normalized);
      }
      await writeStorage(storage);
      return {
        ok: true,
        item: storage.items.find((item) => item.lessonId === input.lessonId) ?? normalized,
        source: "json" as const,
      };
    }),

  deleteOverride: adminProcedure
    .input(z.object({ lessonId: z.string().min(1) }))
    .mutation(async ({ input }) => {
      try {
        if (await isAcademiaLessonsAvailable()) {
          const removed = await deleteLesson(input.lessonId);
          return { ok: true, removed, source: "postgres" as const };
        }
      } catch (err) {
        console.warn("[academiaEad] PG deleteOverride falhou, usando JSON:", err);
      }
      const storage = await readStorage();
      const before = storage.items.length;
      storage.items = storage.items.filter((item) => item.lessonId !== input.lessonId);
      await writeStorage(storage);
      return { ok: true, removed: before !== storage.items.length, source: "json" as const };
    }),

  setFeatured: adminProcedure
    .input(z.object({ lessonId: z.string().min(1), featured: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      if (!(await isAcademiaLessonsAvailable())) {
        throw new Error("Postgres indisponível");
      }
      const updatedBy = ctx.user?.id ? `user:${ctx.user.id}` : "admin:unknown";
      const existing = await getLesson(input.lessonId);
      if (!existing) throw new Error(`lesson_not_found:${input.lessonId}`);
      const row = await upsertLesson(
        { ...existing, isFeatured: input.featured } as any,
        updatedBy,
      );
      return { ok: true, item: rowToOverride(row), source: "postgres" as const };
    }),

  setSortOrder: adminProcedure
    .input(z.object({ lessonId: z.string().min(1), sortOrder: z.number().int() }))
    .mutation(async ({ input, ctx }) => {
      if (!(await isAcademiaLessonsAvailable())) {
        throw new Error("Postgres indisponível");
      }
      const updatedBy = ctx.user?.id ? `user:${ctx.user.id}` : "admin:unknown";
      const existing = await getLesson(input.lessonId);
      if (!existing) throw new Error(`lesson_not_found:${input.lessonId}`);
      const row = await upsertLesson(
        { ...existing, sortOrder: input.sortOrder } as any,
        updatedBy,
      );
      return { ok: true, item: rowToOverride(row), source: "postgres" as const };
    }),

  setCover: adminProcedure
    .input(z.object({ lessonId: z.string().min(1), coverUrl: z.string().url() }))
    .mutation(async ({ input, ctx }) => {
      if (!(await isAcademiaLessonsAvailable())) {
        throw new Error("Postgres indisponível");
      }
      const updatedBy = ctx.user?.id ? `user:${ctx.user.id}` : "admin:unknown";
      const existing = await getLesson(input.lessonId);
      if (!existing) throw new Error(`lesson_not_found:${input.lessonId}`);
      const row = await upsertLesson(
        { ...existing, coverUrl: input.coverUrl } as any,
        updatedBy,
      );
      return { ok: true, item: rowToOverride(row), source: "postgres" as const };
    }),

  setLessonI18n: adminProcedure
    .input(z.object({
      lessonId: z.string().min(1),
      titleEn: z.string().max(500).optional(),
      subtitleEn: z.string().max(1000).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!(await isAcademiaLessonsAvailable())) {
        throw new Error("Postgres indisponível");
      }
      const updatedBy = ctx.user?.id ? `user:${ctx.user.id}` : "admin:unknown";
      const existing = await getLesson(input.lessonId);
      if (!existing) throw new Error(`lesson_not_found:${input.lessonId}`);
      const row = await upsertLesson(
        { ...existing, titleEn: input.titleEn ?? existing.titleEn, subtitleEn: input.subtitleEn ?? existing.subtitleEn } as any,
        updatedBy,
      );
      return { ok: true, item: rowToOverride(row), source: "postgres" as const };
    }),

});
