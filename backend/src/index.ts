import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./appRouter";
import { createLabNexusRestRouter } from "./routes/labNexusRestRouter";
import type { Context } from "./trpc/context";
import {
  startCronScheduler,
  initializeDefaultJobs,
  getSchedulerStatus,
} from "./services/cronScheduler";
import { registerAuditSubscribers } from "./_core/events/auditSubscribers";
import { registerPartnersEventHandlers } from "./domains/partners/subscribers";
import {
  processHotmartSubscriptionWebhook,
  processMercadoPagoSubscriptionWebhook,
} from "./domains/subscriptions/billingWebhook";
import { getDb } from "../../database/schemas/db";
import { metricsCollector, metricsHandler } from "./middlewares/prometheusMetrics";
import { pixWebhookRateLimiter, pixQrRateLimiter } from "./middlewares/pixRateLimiter";
import { createNexusOpenApiRouter } from "./open-api/routes";

const PORT = Number(process.env.PORT || 3000);
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || FRONTEND_ORIGIN)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const PUBLIC_DIR = process.env.PUBLIC_DIR || path.resolve(__dirname, "../../public");
const HAS_PUBLIC_BUNDLE = fs.existsSync(path.join(PUBLIC_DIR, "index.html"));
const APP_VERSION = process.env.APP_VERSION || process.env.npm_package_version || "1.0.0";
const APP_COMMIT_SHA =
  process.env.RENDER_GIT_COMMIT ||
  process.env.GITHUB_SHA ||
  process.env.COMMIT_SHA ||
  process.env.SOURCE_VERSION ||
  null;

function resolveOrigin(origin?: string) {
  if (!origin) return ALLOWED_ORIGINS[0] || FRONTEND_ORIGIN;
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0] || FRONTEND_ORIGIN;
}

async function createContext(opts: { req: express.Request; res: express.Response }): Promise<Context> {
  const userId = opts.req.header("x-user-id");
  const userRole = opts.req.header("x-user-role") || "user";
  const db = await getDb();

  return {
    req: opts.req,
    res: opts.res,
    db,
    user: userId
      ? {
          id: Number(userId),
          role: userRole,
        }
      : undefined,
  };
}

const app = express();
const nexusOpenApiRouter = createNexusOpenApiRouter();
const trpcMiddleware = createExpressMiddleware({
  router: appRouter,
  createContext,
});

app.use(express.json({ limit: "2mb" }));
app.use(metricsCollector);

// Rate limiting para endpoints PIX (proteção contra abuso / flood)
app.use(["/trpc/pix.webhook", "/api/trpc/pix.webhook"], pixWebhookRateLimiter);
app.use(["/trpc/pix.generateDynamicQr", "/api/trpc/pix.generateDynamicQr"], pixQrRateLimiter);
app.use((req, res, next) => {
  const origin = resolveOrigin(req.header("origin") || undefined);
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Vary", "Origin");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Idempotency-Key, x-user-id, x-user-role",
  );
  res.header(
    "Access-Control-Expose-Headers",
    "X-Request-Id, X-RateLimit-Key, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-Idempotency-Status, Retry-After",
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});

app.get("/api", (_req, res) => {
  res.json({
    name: "MMN AI-to-AI",
    service: "backend",
    mode: "full",
    trpc: "/api/trpc",
    openApi: "/api/v1",
    health: "/api/health",
    publicBundle: HAS_PUBLIC_BUNDLE,
  });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "mmn-ai-to-ai-backend",
    mode: "full",
    version: APP_VERSION,
    commit: APP_COMMIT_SHA,
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "mmn-ai-to-ai-backend",
    mode: "full",
    version: APP_VERSION,
    commit: APP_COMMIT_SHA,
    timestamp: new Date().toISOString(),
  });
});

app.get("/cron/status", (_req, res) => {
  res.json(getSchedulerStatus());
});

app.get("/metrics", metricsHandler);

app.post("/webhooks/mercadopago", async (req, res) => {
  try {
    const result = await processMercadoPagoSubscriptionWebhook({
      body: (req.body ?? {}) as Record<string, unknown>,
      query: req.query as Record<string, unknown>,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      provider: "mercado_pago",
      action: "ignored",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

app.post("/webhooks/hotmart", async (req, res) => {
  try {
    const result = await processHotmartSubscriptionWebhook((req.body ?? {}) as Record<string, unknown>);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      ok: false,
      provider: "hotmart",
      action: "ignored",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

app.use("/api/v1/lab-nexus", createLabNexusRestRouter());
// REST público de busca da Academ'IA (alias REST do tRPC listOverrides)

// GET /api/academia/lesson/:lessonId — REST público alias do getOverride
app.get("/api/academia/lesson/:lessonId", async (req, res) => {
  try {
    const { getLesson, isAcademiaLessonsAvailable } = await import("./services/academiaLessonsRepository");
    if (!(await isAcademiaLessonsAvailable())) {
      return res.status(503).json({ error: "academia_repository_unavailable" });
    }
    const row = await getLesson(String(req.params.lessonId));
    if (!row) return res.status(404).json({ error: "lesson_not_found", lessonId: req.params.lessonId });
    res.setHeader("Cache-Control", "public, max-age=60");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.json({ item: row, generatedAt: new Date().toISOString() });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "internal_error" });
  }
});

// GET /api/academia/whats-new — últimas aulas publicadas por published_at DESC
app.get("/api/academia/whats-new", async (req, res) => {
  try {
    const { isAcademiaLessonsAvailable } = await import("./services/academiaLessonsRepository");
    const { Pool } = await import("pg");
    if (!(await isAcademiaLessonsAvailable())) {
      return res.status(503).json({ error: "academia_repository_unavailable" });
    }
    const connStr = process.env.DATABASE_URL!;
    const pool = new Pool({ connectionString: connStr, max: 2 });
    const limitRaw = Number(req.query.limit);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(Math.floor(limitRaw), 50) : 5;
    const after = typeof req.query.after === "string" ? req.query.after : undefined;

    let sql = `SELECT lesson_id, section_slug, title, subtitle, level, required_tier,
              video_url, md_url, html_url, pdf_url, cover_url, thumbnail_url,
              featured, sort_order, published_at, updated_at
       FROM public.academia_lessons
       WHERE is_published = TRUE`;
    const params: any[] = [];
    if (after) {
      // cursor: { publishedAt, lessonId }
      try {
        const [pAt, lid] = Buffer.from(after, "base64url").toString("utf8").split("|");
        params.push(pAt); params.push(lid);
        sql += ` AND (published_at, lesson_id) < ($${params.length-1}::timestamptz, $${params.length})`;
      } catch {/* cursor inválido — ignora */}
    }
    sql += ` ORDER BY published_at DESC NULLS LAST, lesson_id DESC LIMIT $${params.length+1}`;
    params.push(limit);
    const r = await pool.query(sql, params);
    await pool.end();
    const items = r.rows.map((row) => ({
      lessonId: row.lesson_id,
      sectionSlug: row.section_slug,
      title: row.title,
      subtitle: row.subtitle,
      level: row.level,
      requiredTier: row.required_tier,
      videoUrl: row.video_url,
      mdUrl: row.md_url,
      htmlUrl: row.html_url,
      pdfUrl: row.pdf_url,
      coverUrl: row.cover_url ?? row.thumbnail_url ?? null,
      isFeatured: Boolean(row.featured),
      sortOrder: Number(row.sort_order ?? 1000),
      publishedAt: row.published_at ? new Date(row.published_at).toISOString() : null,
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
    }));
    const last = items[items.length - 1];
    const nextCursor = items.length === limit && last?.publishedAt
      ? Buffer.from(`${last.publishedAt}|${last.lessonId}`, "utf8").toString("base64url")
      : null;
    res.setHeader("Cache-Control", "public, max-age=60");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.json({ total: items.length, items, nextCursor, generatedAt: new Date().toISOString() });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "internal_error" });
  }
});

// POST /api/academia/translate-suggest — sugestão PT->EN heurística (dicionário Nexus)
app.post("/api/academia/translate-suggest", async (req, res) => {
  try {
    const body = (req.body || {}) as { title?: string; subtitle?: string };
    const dict: Array<[RegExp, string]> = [
      [/\bBoas-vindas\b/gi, "Welcome"],
      [/\bao Nexus\b/gi, "to Nexus"],
      [/\bEntendendo o\b/gi, "Understanding"],
      [/\bSistema\b/gi, "System"],
      [/\bPainel do Afiliado\b/gi, "Affiliate Dashboard"],
      [/\bPrimeiro Agente\b/gi, "First Agent"],
      [/\bSkills Essenciais\b/gi, "Essential Skills"],
      [/\bDisparo\b/gi, "Broadcast"],
      [/\bJudge Revisor\b/gi, "Judge Reviewer"],
      [/\bAcadem'IA\b/gi, "Academ'IA"],
      [/\bApresentação\b/gi, "Introduction"],
      [/\bPersona\b/gi, "Persona"],
      [/\bem ação\b/gi, "in action"],
      [/\bModelo\b/gi, "Model"],
      [/\bCriando o\b/gi, "Creating the"],
      [/\bTreinamento\b/gi, "Training"],
      [/\bPlaybook\b/gi, "Playbook"],
      [/\bWebinar\b/gi, "Webinar"],
      [/\bLançamento\b/gi, "Launch"],
      [/\bCrise\b/gi, "Crisis"],
      [/\bOperação\b/gi, "Operations"],
      [/\bAutonomia\b/gi, "Autonomy"],
      [/\bRevisão\b/gi, "Review"],
      [/\bFundamental\b/gi, "Fundamental"],
      [/\bAgente\b/gi, "Agent"],
      [/\bMaster\b/gi, "Master"],
      [/\bElite\b/gi, "Elite"],
      [/\b·\b/g, "·"],
    ];
    const translate = (input?: string) => {
      if (!input) return null;
      let out = input;
      for (const [re, en] of dict) out = out.replace(re, en);
      return out;
    };
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.json({
      input: { title: body.title || null, subtitle: body.subtitle || null },
      suggestion: {
        titleEn: translate(body.title),
        subtitleEn: translate(body.subtitle),
      },
      strategy: "dictionary-v1",
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "internal_error" });
  }
});


// POST /api/academia/track-view — registra view de aula (anônimo ou autenticado)
app.post("/api/academia/track-view", async (req, res) => {
  try {
    const body = (req.body || {}) as { lessonId?: string };
    if (!body.lessonId || typeof body.lessonId !== "string") {
      return res.status(400).json({ error: "missing_lessonId" });
    }
    const { isAcademiaLessonsAvailable } = await import("./services/academiaLessonsRepository");
    const { Pool } = await import("pg");
    if (!(await isAcademiaLessonsAvailable())) {
      return res.status(503).json({ error: "academia_repository_unavailable" });
    }
    const connStr = process.env.DATABASE_URL!;
    const pool = new Pool({ connectionString: connStr, max: 2 });
    const fwd = (req.headers["x-forwarded-for"] || "").toString().split(",")[0].trim() || req.ip || "";
    const crypto = await import("crypto");
    const ipHash = fwd ? crypto.createHash("sha256").update(fwd).digest("hex").slice(0, 32) : null;
    const ua = (req.headers["user-agent"] || "").toString().slice(0, 500);
    const ref = (req.headers["referer"] || req.headers["referrer"] || "").toString().slice(0, 500);
    const userId = (req as any).user?.id ? Number((req as any).user.id) : null;
    await pool.query(
      "INSERT INTO public.lesson_views (lesson_id, user_id, ip_hash, user_agent, referrer) VALUES ($1,$2,$3,$4,$5)",
      [body.lessonId, userId, ipHash, ua || null, ref || null]
    );
    await pool.end();
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.json({ ok: true, lessonId: body.lessonId, trackedAt: new Date().toISOString() });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "internal_error" });
  }
});

// GET /api/academia/stats/popular — aulas mais vistas (últimos N dias)
app.get("/api/academia/stats/popular", async (req, res) => {
  try {
    const { isAcademiaLessonsAvailable } = await import("./services/academiaLessonsRepository");
    const { Pool } = await import("pg");
    if (!(await isAcademiaLessonsAvailable())) {
      return res.status(503).json({ error: "academia_repository_unavailable" });
    }
    const connStr = process.env.DATABASE_URL!;
    const pool = new Pool({ connectionString: connStr, max: 2 });
    const daysRaw = Number(req.query.days);
    const days = Number.isFinite(daysRaw) && daysRaw > 0 ? Math.min(Math.floor(daysRaw), 365) : 30;
    const limitRaw = Number(req.query.limit);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(Math.floor(limitRaw), 50) : 10;
    const r = await pool.query(
      `SELECT al.lesson_id, al.section_slug, al.title, al.subtitle, al.cover_url, al.thumbnail_url, al.video_url, al.html_url,
              count(lv.id)::int AS views, max(lv.viewed_at) AS last_viewed_at
       FROM public.academia_lessons al
       LEFT JOIN public.lesson_views lv ON lv.lesson_id = al.lesson_id AND lv.viewed_at >= now() - ($1 * INTERVAL '1 day')
       WHERE al.is_published = TRUE
       GROUP BY al.lesson_id, al.section_slug, al.title, al.subtitle, al.cover_url, al.thumbnail_url, al.video_url, al.html_url
       ORDER BY count(lv.id) DESC, al.lesson_id ASC
       LIMIT $2`,
      [days, limit]
    );
    await pool.end();
    const items = r.rows.map((row) => ({
      lessonId: row.lesson_id,
      sectionSlug: row.section_slug,
      title: row.title,
      subtitle: row.subtitle,
      coverUrl: row.cover_url ?? row.thumbnail_url ?? null,
      videoUrl: row.video_url,
      htmlUrl: row.html_url,
      views: Number(row.views || 0),
      lastViewedAt: row.last_viewed_at ? new Date(row.last_viewed_at).toISOString() : null,
    }));
    res.setHeader("Cache-Control", "public, max-age=120");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.json({ days, total: items.length, items, generatedAt: new Date().toISOString() });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "internal_error" });
  }
});

app.get("/api/academia/search", async (req, res) => {
  // /api/academia/search-v2-cursor-applied
  try {
    const { listLessons, isAcademiaLessonsAvailable } = await import("./services/academiaLessonsRepository");
    if (!(await isAcademiaLessonsAvailable())) {
      return res.status(503).json({ error: "academia_repository_unavailable" });
    }
    const q = typeof req.query.q === "string" ? req.query.q.trim() : undefined;
    const section = typeof req.query.section === "string" ? req.query.section : undefined;
    const featured = req.query.featured === "1" || req.query.featured === "true";
    const publishedOnly = req.query.publishedOnly !== "0" && req.query.publishedOnly !== "false";
    const limitRaw = Number(req.query.limit);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(Math.floor(limitRaw), 200) : 50;
    const after = typeof req.query.after === "string" ? req.query.after : undefined;
    // Sobre-busca: pegamos limit+1 e descartamos extra para detectar nextCursor
    const rows = await listLessons({ sectionSlug: section, publishedOnly, featuredOnly: featured, search: q, limit: limit + 1 });
    let sliced = rows;
    if (after) {
      const idx = rows.findIndex((r) => r.lessonId === after);
      if (idx >= 0) sliced = rows.slice(idx + 1);
    }
    const hasMore = sliced.length > limit;
    const finalItems = sliced.slice(0, limit);
    const nextCursor = hasMore ? finalItems[finalItems.length - 1]?.lessonId || null : null;
    res.setHeader("Cache-Control", "public, max-age=30");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.json({
      query: { q: q || null, section: section || null, featured, publishedOnly, limit, after: after || null },
      total: finalItems.length,
      nextCursor,
      items: finalItems.map((row) => ({
        lessonId: row.lessonId,
        sectionSlug: row.sectionSlug,
        title: row.title,
        subtitle: row.subtitle,
        level: row.level,
        requiredTier: row.requiredTier,
        durationS: row.durationS,
        videoUrl: row.videoUrl,
        mdUrl: row.mdUrl,
        htmlUrl: row.htmlUrl,
        pdfUrl: row.pdfUrl,
        thumbnailUrl: row.thumbnailUrl,
        coverUrl: row.coverUrl,
        publishedAt: row.publishedAt,
        titleEn: row.titleEn,
        subtitleEn: row.subtitleEn,
        youtubeStatus: row.youtubeStatus,
        youtubeChannel: row.youtubeChannel,
        isFeatured: row.isFeatured,
        sortOrder: row.sortOrder,
        tags: row.tags,
        rank: (row as any).rank,
        updatedAt: row.updatedAt,
      })),
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "internal_error" });
  }
});



// /api/v1/academia/* — alias OpenAPI público com NEXUS_PUBLIC_API_KEY (read-only)
function checkPublicKey(req: any, res: any) {
  const expected = process.env.NEXUS_PUBLIC_API_KEY || "";
  const provided = (req.headers["x-nexus-public-key"] || req.query.key || "").toString();
  if (!expected) { res.status(503).json({ error: "public_key_not_configured" }); return false; }
  if (provided !== expected) { res.status(401).json({ error: "invalid_public_key" }); return false; }
  return true;
}
app.get("/api/v1/academia/search", async (req, res) => {
  if (!checkPublicKey(req, res)) return;
  req.url = "/api/academia/search" + (req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : "");
  // Reuso da implementação principal: delegar via redirect interno
  return (app as any)._router.handle(req, res, () => {});
});
app.get("/api/v1/academia/lesson/:lessonId", async (req, res) => {
  if (!checkPublicKey(req, res)) return;
  req.url = `/api/academia/lesson/${req.params.lessonId}`;
  return (app as any)._router.handle(req, res, () => {});
});
app.get("/api/v1/academia/whats-new", async (req, res) => {
  if (!checkPublicKey(req, res)) return;
  req.url = "/api/academia/whats-new" + (req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : "");
  return (app as any)._router.handle(req, res, () => {});
});
app.get("/api/v1/academia/stats/popular", async (req, res) => {
  if (!checkPublicKey(req, res)) return;
  req.url = "/api/academia/stats/popular" + (req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : "");
  return (app as any)._router.handle(req, res, () => {});
});

app.use("/api/v1", nexusOpenApiRouter);
app.use("/trpc", trpcMiddleware);
app.use("/api/trpc", trpcMiddleware);

if (HAS_PUBLIC_BUNDLE) {
  app.use(express.static(PUBLIC_DIR));

  app.get("*", (req, res, next) => {
    if (
      req.path.startsWith("/trpc") ||
      req.path.startsWith("/api/") ||
      req.path === "/health" ||
      req.path === "/cron/status"
    ) {
      next();
      return;
    }

    res.sendFile(path.join(PUBLIC_DIR, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res.json({
      name: "MMN AI-to-AI",
      service: "backend",
      mode: "full",
      trpc: "/api/trpc",
      health: "/api/health",
    });
  });
}

async function initializeCron() {
  try {
    console.log("[CronScheduler] Inicializando...");
    await initializeDefaultJobs();
    await startCronScheduler();
    console.log("[CronScheduler] Inicializado com sucesso");
  } catch (error) {
    console.error("[CronScheduler] Erro na inicialização:", error);
  }
}

registerAuditSubscribers();
registerPartnersEventHandlers();
initializeCron();

app.listen(PORT, () => {
  console.log(`MMN AI-to-AI backend full ativo em http://localhost:${PORT}`);
  if (HAS_PUBLIC_BUNDLE) {
    console.log(`[HTTP] Frontend estático servindo de ${PUBLIC_DIR}`);
  }
});
