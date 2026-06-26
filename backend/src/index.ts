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
    const body = (req.body ?? {}) as Record<string, any>;
    const query = req.query as Record<string, any>;
    // 1) Roda o processamento de assinatura existente (não rompe contrato anterior)
    let subscriptionResult: any = null;
    try {
      subscriptionResult = await processMercadoPagoSubscriptionWebhook({ body, query });
    } catch {}

    // 2) Detecta payment.approved (notificações tipo "payment")
    const topic = String(body?.type || body?.action || query?.topic || "").toLowerCase();
    const paymentId = body?.data?.id || body?.id || query?.id || null;
    let marketplaceResult: any = null;

    if ((topic.includes("payment") || topic === "payment.created" || topic === "payment.updated") && paymentId) {
      try {
        // Consulta MP para confirmar status real (se token disponível)
        const mpToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN || "";
        let mpPayment: any = null;
        if (mpToken) {
          const mpResp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: { Authorization: `Bearer ${mpToken}` }
          });
          if (mpResp.ok) mpPayment = await mpResp.json();
        }
        const status = String(mpPayment?.status || body?.status || "").toLowerCase();
        const externalRef = mpPayment?.external_reference || body?.external_reference || null;

        if (status === "approved" && externalRef) {
          // Atualiza pedido + entrega + envia email
          const client = await _balancePool.connect();
          try {
            await client.query("BEGIN");
            const o = await client.query(
              `SELECT id, user_id, status, payment_status, total_cents, metadata
               FROM marketplace_orders WHERE id=$1 OR external_reference=$1 LIMIT 1`,
              [externalRef]
            );
            if (o.rowCount === 0) {
              await client.query("ROLLBACK");
              marketplaceResult = { ok: false, reason: "order_not_found", externalRef };
            } else {
              const order = o.rows[0];
              if (order.payment_status !== "paid") {
                await client.query(
                  `UPDATE marketplace_orders
                   SET payment_status='paid', status='paid', payment_id=$2,
                       payment_method='mercado_pago', paid_at=NOW(), updated_at=NOW()
                   WHERE id=$1`,
                  [order.id, String(paymentId)]
                );
              }
              // Carrega itens e tenta entregar
              const items = await client.query(
                `SELECT item_slug, title, unit_price_cents FROM marketplace_order_items WHERE order_id=$1`,
                [order.id]
              );
              for (const it of items.rows) {
                await client.query(
                  `INSERT INTO marketplace_user_library (user_id, ebook_slug, source_order_id, source_type, delivered, acquired_at)
                   VALUES ($1, $2, $3, 'ebook', TRUE, NOW())
                   ON CONFLICT DO NOTHING`,
                  [order.user_id, it.item_slug, order.id]
                );
              }
              await client.query(
                `UPDATE marketplace_orders SET status='delivered', delivered_at=NOW(), updated_at=NOW() WHERE id=$1`,
                [order.id]
              );
              await client.query("COMMIT");
              // D17-bullmq-enqueue : enfileira processamento da comissão
              try {
                const { enqueueCommissionProcessing } = await import("./config/queue");
                const total = Number(order.total_cents || 0);
                if (total > 0 && enqueueCommissionProcessing) {
                  await enqueueCommissionProcessing({
                    commissionType: "marketplace_sale",
                    amount: total / 100,
                    userId: order.user_id,
                    orderId: order.id,
                  }).catch((e: any) => console.warn("[D17-bullmq-enqueue]", e?.message));
                }
              } catch (e: any) {
                console.warn("[D17-bullmq-enqueue init]", e?.message);
              }

              // Envia e-mail "Pagamento Confirmado"
              try {
                let customerEmail = "";
                let customerName = "";
                try {
                  const meta = order.metadata ? (typeof order.metadata === "string" ? JSON.parse(order.metadata) : order.metadata) : {};
                  customerEmail = meta?.email || meta?.customerEmail || "";
                  customerName = meta?.customerName || meta?.name || "";
                } catch {}
                if (!customerEmail) {
                  const u = await _balancePool.query(`SELECT email, name FROM users WHERE id=$1 LIMIT 1`, [order.user_id]);
                  customerEmail = u.rows?.[0]?.email || "";
                  customerName = customerName || u.rows?.[0]?.name || "";
                }
                if (customerEmail) {
                  const tpl = renderPaymentConfirmedEmail({
                    customerName, orderId: order.id, amountCents: Number(order.total_cents || 0),
                    paymentMethod: "Mercado Pago",
                    items: items.rows.map((r: any) => ({
                      slug: r.item_slug, title: r.title,
                      priceCents: Number(r.unit_price_cents || 0),
                    })),
                  });
                  await sendEmail({ to: customerEmail, subject: tpl.subject, html: tpl.html });
                  marketplaceResult = { ok: true, orderId: order.id, delivered: items.rows.length, emailedTo: customerEmail };
                } else {
                  marketplaceResult = { ok: true, orderId: order.id, delivered: items.rows.length, emailedTo: null };
                }
              } catch (mailErr: any) {
                console.error("[mp-webhook-email]", mailErr?.message);
                marketplaceResult = { ok: true, orderId: order.id, mailError: mailErr?.message };
              }
            }
          } catch (txErr: any) {
            try { await client.query("ROLLBACK"); } catch {}
            console.error("[mp-webhook-tx]", txErr?.message);
            marketplaceResult = { ok: false, error: txErr?.message };
          } finally {
            client.release();
          }
        }
      } catch (e: any) {
        console.error("[mp-webhook-payment]", e?.message);
      }
    }

    res.status(200).json({ ok: true, subscription: subscriptionResult, marketplace: marketplaceResult });
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

app.all("/webhooks/shopee", async (req, res) => {
  try {
    const body = (req.body && typeof req.body === "object") ? (req.body as Record<string, unknown>) : {};
    console.log("[Shopee Push] callback", {
      method: req.method,
      event: body?.code ?? body?.type ?? body?.push_type ?? null,
      keys: Object.keys(body).slice(0, 12),
      at: new Date().toISOString(),
    });
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({
      ok: true,
      provider: "shopee",
      received: true,
      callbackUrl: process.env.SHOPEE_PUSH_CALLBACK_URL || "https://oneverso.com.br/webhooks/shopee",
      timestamp: new Date().toISOString(),
    });
  } catch (_error) {
    return res.status(200).json({
      ok: true,
      provider: "shopee",
      received: false,
      timestamp: new Date().toISOString(),
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


// V15 LESSON PROGRESS BLOCK
// POST /api/academia/lesson-progress — atualizar progresso (autenticado)
app.post("/api/academia/lesson-progress", async (req, res) => {
  try {
    const body = (req.body || {}) as { lessonId?: string; watchedSeconds?: number; lastPosition?: number; durationS?: number; completed?: boolean; userId?: number };
    const lessonId = String(body.lessonId || "");
    if (!lessonId) return res.status(400).json({ error: "missing_lessonId" });
    const userId = (req as any).user?.id ? Number((req as any).user.id) : (body.userId ? Number(body.userId) : null);
    if (!userId) return res.status(401).json({ error: "unauthenticated" });

    const { isAcademiaLessonsAvailable } = await import("./services/academiaLessonsRepository");
    const { Pool } = await import("pg");
    if (!(await isAcademiaLessonsAvailable())) {
      return res.status(503).json({ error: "academia_repository_unavailable" });
    }
    const connStr = process.env.DATABASE_URL!;
    const pool = new Pool({ connectionString: connStr, max: 2 });
    const watched = Math.max(0, Math.floor(Number(body.watchedSeconds || 0)));
    const lastPos = Math.max(0, Math.floor(Number(body.lastPosition || 0)));
    const dur = body.durationS ? Math.max(0, Math.floor(Number(body.durationS))) : null;
    const completed = Boolean(body.completed) || (dur ? lastPos >= dur * 0.9 : false);
    const r = await pool.query(
      `INSERT INTO public.lesson_progress (user_id, lesson_id, watched_seconds, last_position, duration_s, completed, completed_at)
       VALUES ($1,$2,$3,$4,$5,$6, CASE WHEN $6 THEN now() ELSE NULL END)
       ON CONFLICT (user_id, lesson_id) DO UPDATE SET
         watched_seconds = GREATEST(public.lesson_progress.watched_seconds, EXCLUDED.watched_seconds),
         last_position   = GREATEST(public.lesson_progress.last_position, EXCLUDED.last_position),
         duration_s      = COALESCE(EXCLUDED.duration_s, public.lesson_progress.duration_s),
         completed       = public.lesson_progress.completed OR EXCLUDED.completed,
         completed_at    = COALESCE(public.lesson_progress.completed_at, EXCLUDED.completed_at),
         updated_at      = now()
       RETURNING *`,
      [userId, lessonId, watched, lastPos, dur, completed]
    );
    await pool.end();
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.json({ ok: true, progress: r.rows[0] });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "internal_error" });
  }
});

// GET /api/academia/lesson-progress/me?userId=N — retomada (próxima aula sugerida)
app.get("/api/academia/lesson-progress/me", async (req, res) => {
  try {
    const userId = (req as any).user?.id ? Number((req as any).user.id) : (req.query.userId ? Number(req.query.userId) : null);
    if (!userId) return res.status(401).json({ error: "unauthenticated" });
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL!, max: 2 });
    const r = await pool.query(
      `SELECT lp.lesson_id, lp.watched_seconds, lp.last_position, lp.duration_s, lp.completed, lp.updated_at,
              al.title, al.subtitle, al.cover_url, al.thumbnail_url, al.video_url, al.html_url, al.section_slug
       FROM public.lesson_progress lp
       JOIN public.academia_lessons al ON al.lesson_id = lp.lesson_id
       WHERE lp.user_id = $1
       ORDER BY lp.completed ASC, lp.updated_at DESC
       LIMIT 10`,
      [userId]
    );
    await pool.end();
    const items = r.rows.map((row) => ({
      lessonId: row.lesson_id,
      title: row.title,
      subtitle: row.subtitle,
      sectionSlug: row.section_slug,
      coverUrl: row.cover_url ?? row.thumbnail_url ?? null,
      videoUrl: row.video_url,
      htmlUrl: row.html_url,
      watchedSeconds: Number(row.watched_seconds || 0),
      lastPosition: Number(row.last_position || 0),
      durationS: row.duration_s ? Number(row.duration_s) : null,
      completed: Boolean(row.completed),
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
      progressPct: row.duration_s && Number(row.duration_s) > 0
        ? Math.min(100, Math.round((Number(row.last_position) / Number(row.duration_s)) * 100))
        : null,
    }));
    const resume = items.find((i) => !i.completed) || null;
    res.setHeader("Cache-Control", "private, no-cache");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.json({ total: items.length, resume, items, generatedAt: new Date().toISOString() });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "internal_error" });
  }
});

// GET /api/academia/admin/cleanup-views?olderThan=180d (admin-only, X-Nexus-Public-Key OU sessão admin)
app.post("/api/academia/admin/cleanup-views", async (req, res) => {
  try {
    const expected = process.env.NEXUS_PUBLIC_API_KEY || "";
    const provided = (req.headers["x-nexus-public-key"] || req.query.key || "").toString();
    if (!expected || provided !== expected) {
      return res.status(401).json({ error: "invalid_public_key" });
    }
    const daysRaw = Number(req.query.olderThanDays || 180);
    const days = Number.isFinite(daysRaw) && daysRaw >= 30 ? Math.min(Math.floor(daysRaw), 730) : 180;
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL!, max: 2 });
    const r = await pool.query(
      `DELETE FROM public.lesson_views WHERE viewed_at < now() - ($1 * INTERVAL '1 day')`,
      [days]
    );
    await pool.end();
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.json({ ok: true, deleted: r.rowCount ?? 0, retentionDays: days, executedAt: new Date().toISOString() });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "internal_error" });
  }
});

// GET /api/academia/lesson/:lessonId/stats — completion + views (sem PII)
app.get("/api/academia/lesson/:lessonId/stats", async (req, res) => {
  try {
    const lessonId = String(req.params.lessonId);
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL!, max: 2 });
    const v = await pool.query(
      "SELECT count(*)::int AS views_30d FROM public.lesson_views WHERE lesson_id=$1 AND viewed_at >= now() - INTERVAL '30 days'",
      [lessonId]
    );
    const c = await pool.query(
      "SELECT * FROM public.lesson_completion_stats WHERE lesson_id=$1",
      [lessonId]
    );
    await pool.end();
    res.setHeader("Cache-Control", "public, max-age=120");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.json({
      lessonId,
      views30d: Number(v.rows[0]?.views_30d || 0),
      startedCount: Number(c.rows[0]?.started_count || 0),
      completedCount: Number(c.rows[0]?.completed_count || 0),
      avgWatchedS: Number(c.rows[0]?.avg_watched_s || 0),
      completionRate: c.rows[0]?.completion_rate !== null && c.rows[0]?.completion_rate !== undefined
        ? Number(c.rows[0].completion_rate) : null,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "internal_error" });
  }
});


// V16 NEXT-SUGGESTED BLOCK
// GET /api/academia/lesson/:lessonId/next-suggested — próxima aula natural
app.get("/api/academia/lesson/:lessonId/next-suggested", async (req, res) => {
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL!, max: 2 });
    const lessonId = String(req.params.lessonId);

    // 1) Pega seção + sort_order da aula atual
    const cur = await pool.query(
      "SELECT section_slug, sort_order, level FROM public.academia_lessons WHERE lesson_id = $1 LIMIT 1",
      [lessonId]
    );
    if (!cur.rowCount) { await pool.end(); return res.status(404).json({ error: "lesson_not_found" }); }
    const { section_slug, sort_order, level } = cur.rows[0];

    // 2) Próxima aula na MESMA seção e nível, com sort_order > atual
    let next = await pool.query(
      `SELECT lesson_id, section_slug, title, subtitle, level, cover_url, thumbnail_url, video_url, html_url, sort_order
       FROM public.academia_lessons
       WHERE is_published = TRUE
         AND section_slug = $1
         AND COALESCE(level, '') = COALESCE($2, '')
         AND sort_order > $3
       ORDER BY sort_order ASC, lesson_id ASC
       LIMIT 1`,
      [section_slug, level || null, sort_order]
    );

    // 3) Fallback: próxima da mesma seção (qualquer nível)
    if (!next.rowCount) {
      next = await pool.query(
        `SELECT lesson_id, section_slug, title, subtitle, level, cover_url, thumbnail_url, video_url, html_url, sort_order
         FROM public.academia_lessons
         WHERE is_published = TRUE
           AND section_slug = $1
           AND sort_order > $2
         ORDER BY sort_order ASC, lesson_id ASC
         LIMIT 1`,
        [section_slug, sort_order]
      );
    }

    // 4) Fallback: primeira aula da próxima seção (curso → lab → lib → ...)
    if (!next.rowCount) {
      const order = ["curso","lab","lib","playbook","webinar","treinamento"];
      const idx = order.indexOf(section_slug);
      const nextSec = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;
      if (nextSec) {
        next = await pool.query(
          `SELECT lesson_id, section_slug, title, subtitle, level, cover_url, thumbnail_url, video_url, html_url, sort_order
           FROM public.academia_lessons
           WHERE is_published = TRUE AND section_slug = $1
           ORDER BY sort_order ASC, lesson_id ASC LIMIT 1`,
          [nextSec]
        );
      }
    }

    await pool.end();
    if (!next.rowCount) {
      res.setHeader("Cache-Control", "public, max-age=60");
      return res.json({ next: null, currentLessonId: lessonId, message: "Você completou a trilha." });
    }
    const r = next.rows[0];
    res.setHeader("Cache-Control", "public, max-age=60");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.json({
      currentLessonId: lessonId,
      next: {
        lessonId: r.lesson_id,
        sectionSlug: r.section_slug,
        title: r.title,
        subtitle: r.subtitle,
        level: r.level,
        coverUrl: r.cover_url ?? r.thumbnail_url ?? null,
        videoUrl: r.video_url,
        htmlUrl: r.html_url,
        sortOrder: Number(r.sort_order ?? 1000),
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "internal_error" });
  }
});

// GET /api/academia/whats-new/has-recent — sinal "tem aula nova nas últimas 24h?"
app.get("/api/academia/whats-new/has-recent", async (req, res) => {
  try {
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL!, max: 2 });
    const hoursRaw = Number(req.query.hours);
    const hours = Number.isFinite(hoursRaw) && hoursRaw > 0 ? Math.min(Math.floor(hoursRaw), 24 * 30) : 24;
    const r = await pool.query(
      `SELECT count(*)::int AS recent_count, max(published_at) AS last_published
       FROM public.academia_lessons
       WHERE is_published = TRUE AND published_at >= now() - ($1 * INTERVAL '1 hour')`,
      [hours]
    );
    await pool.end();
    res.setHeader("Cache-Control", "public, max-age=300");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.json({
      hasRecent: Number(r.rows[0].recent_count) > 0,
      recentCount: Number(r.rows[0].recent_count),
      lastPublishedAt: r.rows[0].last_published ? new Date(r.rows[0].last_published).toISOString() : null,
      windowHours: hours,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "internal_error" });
  }
});


// V17 PROGRESS BY-SECTION + TRANSLATE-BULK
// GET /api/academia/lesson-progress/by-section?section=curso&userId=N
//   Retorna map { lessonId: progressPct } para todas as aulas da seção
app.get("/api/academia/lesson-progress/by-section", async (req, res) => {
  try {
    const section = String(req.query.section || "").trim();
    const userId = (req as any).user?.id ? Number((req as any).user.id) : (req.query.userId ? Number(req.query.userId) : null);
    if (!section || !userId) return res.status(400).json({ error: "missing_section_or_userId" });
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL!, max: 2 });
    const r = await pool.query(
      `SELECT lp.lesson_id, lp.watched_seconds, lp.last_position, lp.duration_s, lp.completed
       FROM public.lesson_progress lp
       JOIN public.academia_lessons al ON al.lesson_id = lp.lesson_id
       WHERE lp.user_id = $1 AND al.section_slug = $2`,
      [userId, section]
    );
    await pool.end();
    const byLesson: Record<string, { progressPct: number; completed: boolean; watched: number; duration: number | null }> = {};
    for (const row of r.rows) {
      const dur = row.duration_s ? Number(row.duration_s) : null;
      const pct = dur && dur > 0 ? Math.min(100, Math.round((Number(row.last_position) / dur) * 100)) : 0;
      byLesson[row.lesson_id] = {
        progressPct: row.completed ? 100 : pct,
        completed: Boolean(row.completed),
        watched: Number(row.watched_seconds || 0),
        duration: dur,
      };
    }
    res.setHeader("Cache-Control", "private, max-age=10");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.json({ section, userId, total: Object.keys(byLesson).length, byLesson, generatedAt: new Date().toISOString() });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "internal_error" });
  }
});

// POST /api/academia/admin/translate-bulk?dryRun=1
//   Gera title_en/subtitle_en para aulas que ainda não têm, via dicionário Nexus.
//   dryRun=1 não persiste, apenas retorna lista de sugestões.
app.post("/api/academia/admin/translate-bulk", async (req, res) => {
  try {
    const expected = process.env.NEXUS_PUBLIC_API_KEY || "";
    const provided = (req.headers["x-nexus-public-key"] || req.query.key || "").toString();
    if (!expected || provided !== expected) return res.status(401).json({ error: "invalid_public_key" });

    const dryRun = req.query.dryRun === "1" || req.query.dryRun === "true";
    const { Pool } = await import("pg");
    const pool = new Pool({ connectionString: process.env.DATABASE_URL!, max: 2 });
    const r = await pool.query(
      `SELECT lesson_id, title, subtitle FROM public.academia_lessons
       WHERE (title_en IS NULL OR title_en = '') AND title IS NOT NULL
       ORDER BY lesson_id LIMIT 200`
    );

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
      [/\bApresentação\b/gi, "Introduction"],
      [/\bem ação\b/gi, "in action"],
      [/\bModelo\b/gi, "Model"],
      [/\bCriando o\b/gi, "Creating the"],
      [/\bTreinamento\b/gi, "Training"],
      [/\bLançamento\b/gi, "Launch"],
      [/\bCrise\b/gi, "Crisis"],
      [/\bOperação\b/gi, "Operations"],
      [/\bAutonomia\b/gi, "Autonomy"],
      [/\bRevisão\b/gi, "Review"],
      [/\bFundamental\b/gi, "Fundamental"],
      [/\bAgente\b/gi, "Agent"],
      [/\bMaster\b/gi, "Master"],
      [/\bElite\b/gi, "Elite"],
      [/\bPersona\b/gi, "Persona"],
      [/\bAcadem'IA\b/gi, "Academ'IA"],
    ];
    const translate = (text?: string | null) => {
      if (!text) return null;
      let out = text;
      for (const [re, en] of dict) out = out.replace(re, en);
      return out;
    };

    const suggestions = r.rows.map((row) => ({
      lessonId: row.lesson_id,
      titlePt: row.title,
      subtitlePt: row.subtitle,
      titleEn: translate(row.title),
      subtitleEn: translate(row.subtitle),
    }));

    let updated = 0;
    if (!dryRun) {
      for (const sug of suggestions) {
        await pool.query(
          `UPDATE public.academia_lessons SET title_en = COALESCE(title_en, $2), subtitle_en = COALESCE(subtitle_en, $3), updated_at = now() WHERE lesson_id = $1`,
          [sug.lessonId, sug.titleEn, sug.subtitleEn]
        );
        updated++;
      }
    }
    await pool.end();
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.json({
      dryRun, totalCandidates: suggestions.length, updated,
      strategy: "dictionary-v1",
      suggestions: dryRun ? suggestions : suggestions.slice(0, 5),
      generatedAt: new Date().toISOString(),
    });
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


// === MARKETPLACE BALANCE CHECKOUT (D1 hardening) ===
import { Pool } from "pg";
import { sendEmail, renderMarketplaceDeliveryEmail, renderPackTicketCreatedEmailAdmin, renderPackApprovedEmail, renderPackRejectedEmail, renderPaymentConfirmedEmail } from "./services/emailService";
const _balancePool = new Pool({ connectionString: process.env.DATABASE_URL });

app.post("/api/marketplace/checkout-with-balance", async (req: any, res: any) => {
  try {
    const userId = (req as any).user?.id || (req as any).session?.userId;
    if (!userId) return res.status(401).json({ ok: false, error: "Autenticação requerida" });
    const body = req.body || {};
    const amountCents = Number(body.amountCents || 0);
    const customerEmail = String(body.customerEmail || "");
    if (!amountCents || amountCents <= 0) return res.status(400).json({ ok: false, error: "Valor inválido" });
    if (!customerEmail.includes("@")) return res.status(400).json({ ok: false, error: "Email obrigatório" });

    const client = await _balancePool.connect();
    try {
      await client.query("BEGIN");
      const balRow = await client.query(
        `SELECT id, "availableBalance" FROM affiliate_balances WHERE "affiliateId"=$1 FOR UPDATE`,
        [userId]
      );
      const available = Number(balRow.rows?.[0]?.availableBalance || 0);
      if (available < amountCents) {
        await client.query("ROLLBACK");
        return res.status(400).json({ ok: false, error: "Saldo insuficiente" });
      }
      // Debita saldo
      await client.query(
        `UPDATE affiliate_balances SET "availableBalance" = "availableBalance" - $1,
         "totalWithdrawn" = COALESCE("totalWithdrawn",0) + $1,
         "lastUpdatedAt" = NOW() WHERE "affiliateId"=$2`,
        [amountCents, userId]
      );
      // Cria pedido pago (uuid gerado via gen_random_uuid)
      const orderRow = await client.query(
        `INSERT INTO marketplace_orders (id, user_id, status, subtotal_cents, total_cents,
           payment_method, payment_status, external_reference, metadata, paid_at, created_at, updated_at)
         VALUES (gen_random_uuid(), $1, 'paid', $2, $2, 'balance', 'paid', $3, $4, NOW(), NOW(), NOW())
         RETURNING id`,
        [userId, amountCents, "marketplace-nexus", JSON.stringify({ email: customerEmail, items: body.items || [] })]
      );
      const orderId = orderRow.rows[0].id;
      // Insere itens
      for (const it of (body.items || [])) {
        await client.query(
          `INSERT INTO marketplace_order_items (order_id, item_type, item_slug, title, unit_price_cents, quantity, metadata, created_at)
           VALUES ($1, 'ebook', $2, $3, $4, 1, $5, NOW())`,
          [orderId, String(it.slug || ''), String(it.title || ''), Number(it.priceCents || 0), JSON.stringify({})]
        );
        // Entrega na biblioteca do usuário
        // D7: tenta resolver source_pack_slug a partir do catálogo de ebooks
        let resolvedPack: string | null = null;
        try {
          const eR = await client.query(`SELECT unlock_pack_slug FROM marketplace_ebooks WHERE slug=$1 LIMIT 1`, [String(it.slug || '')]);
          resolvedPack = eR.rows?.[0]?.unlock_pack_slug || null;
        } catch {}
        await client.query(
          `INSERT INTO marketplace_user_library (user_id, ebook_slug, source_order_id, source_type, source_pack_slug, delivered, acquired_at)
           VALUES ($1, $2, $3, 'ebook', $4, TRUE, NOW())
           ON CONFLICT DO NOTHING`,
          [userId, String(it.slug || ''), orderId, resolvedPack]
        );
      }
      await client.query(
        `UPDATE marketplace_orders SET status='delivered', delivered_at=NOW(), updated_at=NOW() WHERE id=$1`,
        [orderId]
      );
      await client.query("COMMIT");
      // Fila de email (best-effort: log apenas — integração real via worker)
      try {
        // D7: enriquece itens com PDF/HTML reais
        const enrichedItems = await Promise.all((body.items || []).map(async (i: any) => {
          let htmlUrl = i.htmlUrl, pdfUrl = i.pdfUrl, coverUrl = i.coverUrl;
          try {
            const eR = await _balancePool.query(`SELECT html_path, pdf_path, cover_path FROM marketplace_ebooks WHERE slug=$1 LIMIT 1`, [String(i.slug || '')]);
            const row = eR.rows?.[0];
            if (row) {
              const baseHtml = row.html_path || row.htmlPath;
              const basePdf = row.pdf_path || row.pdfPath;
              const baseCover = row.cover_path || row.coverPath;
              if (baseHtml) htmlUrl = baseHtml.startsWith("http") ? baseHtml : `https://oneverso.com.br${baseHtml.startsWith("/") ? "" : "/"}${baseHtml}`;
              if (basePdf) pdfUrl = basePdf.startsWith("http") ? basePdf : `https://oneverso.com.br${basePdf.startsWith("/") ? "" : "/"}${basePdf}`;
              if (baseCover) coverUrl = baseCover.startsWith("http") ? baseCover : `https://oneverso.com.br${baseCover.startsWith("/") ? "" : "/"}${baseCover}`;
            }
          } catch {}
          return {
            slug: String(i.slug || ""),
            title: String(i.title || ""),
            priceCents: Number(i.priceCents || 0),
            htmlUrl, pdfUrl, coverUrl,
          };
        }));
        const { subject, html } = renderMarketplaceDeliveryEmail({
          customerName: body.customerName,
          orderId,
          totalCents: amountCents,
          items: enrichedItems,
        });
        await sendEmail({ to: customerEmail, subject, html });
      } catch (mailErr: any) {
        console.error("[marketplace-email]", mailErr?.message || mailErr);
      }
      return res.json({ ok: true, orderId, status: "delivered", delivery: { channel: "email", to: customerEmail } });
    } catch (e: any) {
      await client.query("ROLLBACK");
      return res.status(500).json({ ok: false, error: e?.message || "Erro interno" });
    } finally {
      client.release();
    }
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "Erro interno" });
  }
});
// === END MARKETPLACE BALANCE CHECKOUT ===


// === PACK TICKETS (D2 hardening) ===
const _packPool = new Pool({ connectionString: process.env.DATABASE_URL });

// cria tabela on-boot (idempotente)
(async () => {
  try {
    await _packPool.query(`
      CREATE TABLE IF NOT EXISTS marketplace_pack_tickets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        user_name VARCHAR(160),
        user_email VARCHAR(180) NOT NULL,
        pack_slug VARCHAR(80) NOT NULL,
        pack_name VARCHAR(180) NOT NULL,
        amount_cents INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        payment_method VARCHAR(40),
        payment_proof_url TEXT,
        admin_notes TEXT,
        reviewed_by INTEGER,
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS pack_tickets_status_idx ON marketplace_pack_tickets(status);
      CREATE INDEX IF NOT EXISTS pack_tickets_user_idx ON marketplace_pack_tickets(user_id);
    `);
    console.log("[pack-tickets] table ready");
  } catch (e: any) {
    console.error("[pack-tickets] table init error", e?.message);
  }
})();

function isAdminReq(req: any) {
  const role = req?.user?.role || req?.session?.role;
  return role === "admin" || role === "owner";
}

// Cria ticket de aquisição de Pack
app.post("/api/marketplace/pack-ticket", async (req: any, res: any) => {
  try {
    const userId = req?.user?.id || req?.session?.userId;
    if (!userId) return res.status(401).json({ ok: false, error: "Autenticação requerida" });
    const { packSlug, packName, amountCents, paymentMethod } = req.body || {};
    const userName = req?.user?.name || req?.session?.userName || "";
    const userEmail = req?.user?.email || req?.session?.userEmail || "";
    if (!packSlug || !packName || !amountCents || !userEmail) {
      return res.status(400).json({ ok: false, error: "Campos obrigatórios faltando" });
    }
    const row = await _packPool.query(
      `INSERT INTO marketplace_pack_tickets
       (user_id, user_name, user_email, pack_slug, pack_name, amount_cents, payment_method, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending') RETURNING id`,
      [userId, userName, userEmail, packSlug, packName, Number(amountCents), paymentMethod || "pix"]
    );
    const ticketId = row.rows[0].id;
    // Email para admin
    try {
      const adminTo = process.env.ADMIN_NOTIFY_EMAIL || process.env.SMTP_USER || "";
      if (adminTo) {
        const tpl = renderPackTicketCreatedEmailAdmin({
          ticketId, userId, userName, userEmail, packSlug, packName, amountCents: Number(amountCents)
        });
        await sendEmail({ to: adminTo, subject: tpl.subject, html: tpl.html });
      }
    } catch {}
    return res.json({ ok: true, ticketId, status: "pending" });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message });
  }
});

// Lista tickets (admin)
app.get("/api/admin/pack-tickets", async (req: any, res: any) => {
  try {
    if (!isAdminReq(req)) return res.status(401).json({ ok: false, error: "Admin requerido" });
    const status = req.query.status || "pending";
    const r = await _packPool.query(
      `SELECT * FROM marketplace_pack_tickets WHERE status=$1 ORDER BY created_at DESC LIMIT 200`,
      [status]
    );
    return res.json({ ok: true, tickets: r.rows });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message });
  }
});

// Aprova ticket (admin)
app.post("/api/admin/pack-tickets/:id/approve", async (req: any, res: any) => {
  try {
    if (!isAdminReq(req)) return res.status(401).json({ ok: false, error: "Admin requerido" });
    const id = parseInt(req.params.id, 10);
    const reviewer = req?.user?.id || 0;
    const adminNotes = req.body?.notes || null;
    const r = await _packPool.query(
      `UPDATE marketplace_pack_tickets SET status='approved', reviewed_by=$1, reviewed_at=NOW(),
       updated_at=NOW(), admin_notes=COALESCE($3, admin_notes)
       WHERE id=$2 AND status='pending' RETURNING *`,
      [reviewer, id, adminNotes]
    );
    if (r.rowCount === 0) return res.status(404).json({ ok: false, error: "Ticket não encontrado ou já processado" });
    const t = r.rows[0];
    // Ativa pack
    try {
      // pack_id resolution: tenta achar via slug; se não houver, registra metadata
      const pack = await _packPool.query(`SELECT id FROM packs WHERE slug=$1 LIMIT 1`, [t.pack_slug]).catch(() => ({ rows: [] } as any));
      const packId = pack?.rows?.[0]?.id || 0;
      await _packPool.query(
        `INSERT INTO pack_activations (affiliate_id, pack_id, status, payment_method, amount_paid, activated_at, metadata, created_at, updated_at)
         VALUES ($1,$2,'active',$3,$4,NOW(),$5,NOW(),NOW())`,
        [t.user_id, packId, t.payment_method || 'manual', t.amount_cents, JSON.stringify({ ticketId: t.id, packSlug: t.pack_slug })]
      );
    } catch (actErr: any) {
      console.error("[pack-tickets] activate err", actErr?.message);
    }
    // Email confirmação
    try {
      const tpl = renderPackApprovedEmail({ userName: t.user_name || "afiliado", packName: t.pack_name, packSlug: t.pack_slug });
      await sendEmail({ to: t.user_email, subject: tpl.subject, html: tpl.html });
    } catch {}
    return res.json({ ok: true, ticket: r.rows[0] });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message });
  }
});

// Rejeita ticket (admin)
app.post("/api/admin/pack-tickets/:id/reject", async (req: any, res: any) => {
  try {
    if (!isAdminReq(req)) return res.status(401).json({ ok: false, error: "Admin requerido" });
    const id = parseInt(req.params.id, 10);
    const reviewer = req?.user?.id || 0;
    const reason = req.body?.reason || null;
    const r = await _packPool.query(
      `UPDATE marketplace_pack_tickets SET status='rejected', reviewed_by=$1, reviewed_at=NOW(),
       updated_at=NOW(), admin_notes=$3
       WHERE id=$2 AND status='pending' RETURNING *`,
      [reviewer, id, reason]
    );
    if (r.rowCount === 0) return res.status(404).json({ ok: false, error: "Ticket não encontrado ou já processado" });
    const t = r.rows[0];
    try {
      const tpl = renderPackRejectedEmail({ userName: t.user_name || "afiliado", packName: t.pack_name, reason });
      await sendEmail({ to: t.user_email, subject: tpl.subject, html: tpl.html });
    } catch {}
    return res.json({ ok: true, ticket: r.rows[0] });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message });
  }
});
// === END PACK TICKETS ===


// === ADMIN MANUAL MARK PAID (D3) ===
app.post("/api/admin/marketplace/orders/:id/mark-paid", async (req: any, res: any) => {
  try {
    if (!isAdminReq(req)) return res.status(401).json({ ok: false, error: "Admin requerido" });
    const orderId = req.params.id;
    const paymentId = req.body?.paymentId || ("manual-" + Date.now());
    const client = await _balancePool.connect();
    try {
      await client.query("BEGIN");
      const o = await client.query(`SELECT * FROM marketplace_orders WHERE id=$1`, [orderId]);
      if (o.rowCount === 0) { await client.query("ROLLBACK"); return res.status(404).json({ ok: false, error: "Pedido não encontrado" }); }
      const order = o.rows[0];
      await client.query(
        `UPDATE marketplace_orders SET status='paid', payment_status='paid', payment_id=$2,
           payment_method='manual', paid_at=NOW(), updated_at=NOW() WHERE id=$1`,
        [orderId, paymentId]
      );
      const items = await client.query(
        `SELECT item_slug, title, unit_price_cents FROM marketplace_order_items WHERE order_id=$1`,
        [orderId]
      );
      for (const it of items.rows) {
        await client.query(
          `INSERT INTO marketplace_user_library (user_id, ebook_slug, source_order_id, source_type, delivered, acquired_at)
           VALUES ($1, $2, $3, 'ebook', TRUE, NOW()) ON CONFLICT DO NOTHING`,
          [order.user_id, it.item_slug, orderId]
        );
      }
      await client.query(`UPDATE marketplace_orders SET status='delivered', delivered_at=NOW() WHERE id=$1`, [orderId]);
      await client.query("COMMIT");
      // Email
      try {
        const u = await _balancePool.query(`SELECT email, name FROM users WHERE id=$1`, [order.user_id]);
        const customerEmail = u.rows?.[0]?.email;
        const customerName = u.rows?.[0]?.name;
        if (customerEmail) {
          const tpl = renderPaymentConfirmedEmail({
            customerName, orderId, amountCents: Number(order.total_cents || 0),
            paymentMethod: "Confirmação Manual (Admin)",
            items: items.rows.map((r: any) => ({ slug: r.item_slug, title: r.title, priceCents: Number(r.unit_price_cents || 0) })),
          });
          await sendEmail({ to: customerEmail, subject: tpl.subject, html: tpl.html });
        }
      } catch {}
      res.json({ ok: true, orderId, delivered: items.rows.length });
    } catch (e: any) {
      try { await client.query("ROLLBACK"); } catch {}
      res.status(500).json({ ok: false, error: e?.message });
    } finally {
      client.release();
    }
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message });
  }
});
// === END ADMIN MANUAL MARK PAID ===

// === ADMIN SIMULATE PAID (D7) ===
app.post("/api/admin/marketplace/orders/:id/simulate-paid", async (req: any, res: any) => {
  try {
    if (!isAdminReq(req)) return res.status(401).json({ ok: false, error: "Admin requerido" });
    const orderId = req.params.id;
    const fakePayId = "simulated-" + Date.now();
    const client = await _balancePool.connect();
    try {
      await client.query("BEGIN");
      const oR = await client.query(`SELECT * FROM marketplace_orders WHERE id=$1`, [orderId]);
      if (oR.rowCount === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ ok: false, error: "Pedido não encontrado" });
      }
      const order = oR.rows[0];
      await client.query(
        `UPDATE marketplace_orders SET status='paid', payment_status='paid', payment_id=$2,
          payment_method=COALESCE(payment_method,'mercado_pago'), paid_at=NOW(), updated_at=NOW() WHERE id=$1`,
        [orderId, fakePayId]
      );
      const itemsR = await client.query(
        `SELECT item_slug, title, unit_price_cents FROM marketplace_order_items WHERE order_id=$1`,
        [orderId]
      );
      for (const it of itemsR.rows) {
        let resolvedPack: string | null = null;
        try {
          const eR = await client.query(`SELECT unlock_pack_slug FROM marketplace_ebooks WHERE slug=$1 LIMIT 1`, [it.item_slug]);
          resolvedPack = eR.rows?.[0]?.unlock_pack_slug || null;
        } catch {}
        await client.query(
          `INSERT INTO marketplace_user_library (user_id, ebook_slug, source_order_id, source_type, source_pack_slug, delivered, acquired_at)
           VALUES ($1, $2, $3, 'ebook', $4, TRUE, NOW()) ON CONFLICT DO NOTHING`,
          [order.user_id, it.item_slug, orderId, resolvedPack]
        );
      }
      await client.query(`UPDATE marketplace_orders SET status='delivered', delivered_at=NOW() WHERE id=$1`, [orderId]);
      await client.query("COMMIT");
      // Resolve destinatário
      let customerEmail = "";
      let customerName = "";
      try {
        const meta = typeof order.metadata === "string" ? JSON.parse(order.metadata) : (order.metadata || {});
        customerEmail = meta?.email || meta?.customerEmail || "";
        customerName = meta?.customerName || "";
      } catch {}
      if (!customerEmail) {
        const u = await _balancePool.query(`SELECT email, name FROM users WHERE id=$1`, [order.user_id]);
        customerEmail = u.rows?.[0]?.email || "";
        customerName = customerName || u.rows?.[0]?.name || "";
      }
      let emailResult: any = null;
      if (customerEmail) {
        const enriched = await Promise.all(itemsR.rows.map(async (it: any) => {
          let htmlUrl, pdfUrl, coverUrl;
          try {
            const eR = await _balancePool.query(`SELECT html_path, pdf_path, cover_path FROM marketplace_ebooks WHERE slug=$1 LIMIT 1`, [it.item_slug]);
            const row = eR.rows?.[0];
            if (row) {
              if (row.html_path) htmlUrl = row.html_path.startsWith("http") ? row.html_path : `https://oneverso.com.br${row.html_path.startsWith("/") ? "" : "/"}${row.html_path}`;
              if (row.pdf_path) pdfUrl = row.pdf_path.startsWith("http") ? row.pdf_path : `https://oneverso.com.br${row.pdf_path.startsWith("/") ? "" : "/"}${row.pdf_path}`;
              if (row.cover_path) coverUrl = row.cover_path.startsWith("http") ? row.cover_path : `https://oneverso.com.br${row.cover_path.startsWith("/") ? "" : "/"}${row.cover_path}`;
            }
          } catch {}
          return { slug: it.item_slug, title: it.title, priceCents: Number(it.unit_price_cents || 0), htmlUrl, pdfUrl, coverUrl };
        }));
        const tpl = renderPaymentConfirmedEmail({
          customerName, orderId, amountCents: Number(order.total_cents || 0),
          paymentMethod: "Mercado Pago (simulado)",
          items: enriched,
        });
        emailResult = await sendEmail({ to: customerEmail, subject: tpl.subject, html: tpl.html });
      }
      return res.json({ ok: true, orderId, delivered: itemsR.rows.length, emailResult });
    } catch (txErr: any) {
      try { await client.query("ROLLBACK"); } catch {}
      return res.status(500).json({ ok: false, error: txErr?.message });
    } finally {
      client.release();
    }
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message });
  }
});
// === END ADMIN SIMULATE PAID ===
app.listen(PORT, () => {
  console.log(`MMN AI-to-AI backend full ativo em http://localhost:${PORT}`);
  if (HAS_PUBLIC_BUNDLE) {
    console.log(`[HTTP] Frontend estático servindo de ${PUBLIC_DIR}`);
  }
});
