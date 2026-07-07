/**
 * academiaPublicRouter · Onda 21 · AcademIA Public API
 * Endpoints REAIS para catálogo público, progresso do aluno e analytics.
 * Baseado em: academia_lessons, lesson_progress, lesson_views (Postgres real).
 */
import { z } from "zod";
import { Pool } from "pg";
import { router, publicProcedure, protectedProcedure, adminProcedure } from "../config/trpc";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const sectionSchema = z.enum([
  "curso", "treinamento", "webinar", "playbook", "lab", "lib",
]);

export const academiaPublicRouter = router({
  /**
   * catalog · lista todas as seções com contagem
   */
  catalog: publicProcedure.query(async () => {
    try {
      const q = await pool.query(`
        SELECT
          section_slug,
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE is_published)::int AS published,
          COUNT(*) FILTER (WHERE featured)::int AS featured,
          COUNT(DISTINCT level)::int AS levels
        FROM academia_lessons
        WHERE section_slug IS NOT NULL
        GROUP BY section_slug
        ORDER BY total DESC
      `);
      return {
        totalSections: q.rowCount,
        sections: q.rows,
        source: 'real',
      };
    } catch (err: any) {
      return { totalSections: 0, sections: [], source: 'error', error: err.message };
    }
  }),

  /**
   * listPublished · lista aulas publicadas por seção
   */
  listPublished: publicProcedure
    .input(z.object({
      sectionSlug: sectionSchema.optional(),
      level: z.enum(["fundamental", "agente", "master", "elite"]).optional(),
      limit: z.number().int().min(1).max(200).default(50),
      offset: z.number().int().min(0).default(0),
      featured: z.boolean().optional(),
    }))
    .query(async ({ input }) => {
      try {
        const params: any[] = [];
        let where = 'WHERE is_published = true';
        if (input.sectionSlug) { params.push(input.sectionSlug); where += ` AND section_slug = $${params.length}`; }
        if (input.level) { params.push(input.level); where += ` AND level = $${params.length}`; }
        if (input.featured !== undefined) { params.push(input.featured); where += ` AND featured = $${params.length}`; }
        params.push(input.limit); const limitP = params.length;
        params.push(input.offset); const offsetP = params.length;

        const q = await pool.query(`
          SELECT lesson_id, title, subtitle, section_slug, level, NULL::text AS duration,
                 tags, featured, sort_order, cover_url, thumbnail_url, NULL::text AS duration,
                 md_url, html_url, pdf_url, youtube_video_id, published_at
          FROM academia_lessons
          ${where}
          ORDER BY featured DESC, sort_order ASC, published_at DESC NULLS LAST
          LIMIT $${limitP} OFFSET $${offsetP}
        `, params);

        const countQ = await pool.query(
          `SELECT COUNT(*)::int AS total FROM academia_lessons ${where.replace(/LIMIT.*|OFFSET.*/g,'')}`,
          params.slice(0, params.length - 2)
        );

        return {
          items: q.rows,
          total: countQ.rows[0].total,
          hasMore: input.offset + q.rowCount < countQ.rows[0].total,
          source: 'real',
        };
      } catch (err: any) {
        return { items: [], total: 0, hasMore: false, source: 'error', error: err.message };
      }
    }),

  /**
   * getLesson · detalhes de uma aula
   */
  getLesson: publicProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(async ({ input }) => {
      try {
        const q = await pool.query(
          `SELECT * FROM academia_lessons WHERE lesson_id = $1 LIMIT 1`,
          [input.lessonId]
        );
        if (q.rowCount === 0) return { lesson: null, source: 'not_found' };
        return { lesson: q.rows[0], source: 'real' };
      } catch (err: any) {
        return { lesson: null, source: 'error', error: err.message };
      }
    }),

  /**
   * trackView · registra view (anônimo permitido)
   */
  trackView: publicProcedure
    .input(z.object({
      lessonId: z.string(),
      userId: z.number().int().optional(),
      referrer: z.string().optional(),
      userAgent: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const q = await pool.query(
          `INSERT INTO lesson_views (lesson_id, user_id, referrer, user_agent)
           VALUES ($1, $2, $3, $4) RETURNING id, viewed_at`,
          [input.lessonId, input.userId ?? null, input.referrer ?? null, input.userAgent ?? null]
        );
        return { ok: true, viewId: q.rows[0].id, viewedAt: q.rows[0].viewed_at, source: 'real' };
      } catch (err: any) {
        return { ok: false, source: 'error', error: err.message };
      }
    }),

  /**
   * updateProgress · autenticado. Upsert em lesson_progress
   */
  updateProgress: protectedProcedure
    .input(z.object({
      lessonId: z.string(),
      watchedSeconds: z.number().int().min(0),
      lastPosition: z.number().int().min(0).default(0),
      durationSeconds: z.number().int().min(0).optional(),
      completed: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = (ctx as any).user?.id;
        if (!userId) return { ok: false, source: 'no_user' };

        const completedFinal = input.completed ??
          (input.durationSeconds ? (input.watchedSeconds >= input.durationSeconds * 0.9) : false);

        const q = await pool.query(`
          INSERT INTO lesson_progress (user_id, lesson_id, watched_seconds, duration_s, last_position, completed, completed_at)
          VALUES ($1, $2, $3, $4, $5, $6, ${completedFinal ? 'NOW()' : 'NULL'})
          ON CONFLICT (user_id, lesson_id) DO UPDATE
          SET watched_seconds = GREATEST(lesson_progress.watched_seconds, EXCLUDED.watched_seconds),
              last_position = EXCLUDED.last_position,
              duration_s = COALESCE(EXCLUDED.duration_s, lesson_progress.duration_s),
              completed = lesson_progress.completed OR EXCLUDED.completed,
              completed_at = COALESCE(lesson_progress.completed_at, ${completedFinal ? 'NOW()' : 'NULL'}),
              updated_at = NOW()
          RETURNING id, completed, watched_seconds, last_position
        `, [userId, input.lessonId, input.watchedSeconds, input.durationSeconds ?? null, input.lastPosition, completedFinal]);

        return { ok: true, progress: q.rows[0], source: 'real' };
      } catch (err: any) {
        return { ok: false, source: 'error', error: err.message };
      }
    }),

  /**
   * myProgress · retorna progresso do aluno
   */
  myProgress: protectedProcedure.query(async ({ ctx }) => {
    try {
      const userId = (ctx as any).user?.id;
      if (!userId) return { total: 0, items: [], stats: null, source: 'no_user' };

      const q = await pool.query(`
        SELECT lp.lesson_id, lp.watched_seconds, lp.duration_s, lp.last_position,
               lp.completed, lp.completed_at, lp.updated_at,
               al.title, al.section_slug, al.cover_url, NULL::text AS duration
        FROM lesson_progress lp
        JOIN academia_lessons al ON al.lesson_id = lp.lesson_id
        WHERE lp.user_id = $1
        ORDER BY lp.updated_at DESC
      `, [userId]);

      const stats = await pool.query(`
        SELECT
          COUNT(*)::int AS total_lessons,
          COUNT(*) FILTER (WHERE completed)::int AS completed_lessons,
          COALESCE(SUM(watched_seconds), 0)::int AS total_watched_seconds
        FROM lesson_progress WHERE user_id = $1
      `, [userId]);

      return {
        total: q.rowCount,
        items: q.rows,
        stats: stats.rows[0],
        source: 'real',
      };
    } catch (err: any) {
      return { total: 0, items: [], stats: null, source: 'error', error: err.message };
    }
  }),

  /**
   * analytics · métricas gerais (público - agregado)
   */
  analytics: publicProcedure.query(async () => {
    try {
      const q = await pool.query(`
        SELECT
          (SELECT COUNT(*)::int FROM academia_lessons WHERE is_published) AS total_published,
          (SELECT COUNT(*)::int FROM academia_lessons) AS total_lessons,
          (SELECT COUNT(*)::int FROM lesson_views) AS total_views,
          (SELECT COUNT(*)::int FROM lesson_views WHERE viewed_at >= NOW() - INTERVAL '7 days') AS views_7d,
          (SELECT COUNT(*)::int FROM lesson_progress) AS total_progress_records,
          (SELECT COUNT(*)::int FROM lesson_progress WHERE completed) AS total_completions,
          (SELECT COUNT(DISTINCT user_id)::int FROM lesson_progress) AS active_students
      `);
      return { ...q.rows[0], source: 'real', timestamp: new Date().toISOString() };
    } catch (err: any) {
      return { source: 'error', error: err.message };
    }
  }),

  /**
   * topLessons · top aulas por views
   */
  topLessons: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ input }) => {
      try {
        const q = await pool.query(`
          SELECT al.lesson_id, al.title, al.section_slug, al.cover_url,
                 COUNT(lv.id)::int AS views,
                 COUNT(DISTINCT lp.user_id)::int AS students,
                 COUNT(lp.id) FILTER (WHERE lp.completed)::int AS completions
          FROM academia_lessons al
          LEFT JOIN lesson_views lv ON lv.lesson_id = al.lesson_id
          LEFT JOIN lesson_progress lp ON lp.lesson_id = al.lesson_id
          WHERE al.is_published
          GROUP BY al.lesson_id, al.title, al.section_slug, al.cover_url
          ORDER BY views DESC, completions DESC
          LIMIT $1
        `, [input.limit]);
        return { total: q.rowCount, items: q.rows, source: 'real' };
      } catch (err: any) {
        return { total: 0, items: [], source: 'error', error: err.message };
      }
    }),

  /**
   * adminUpsert · admin cria/atualiza aula direto no DB
   */
  adminUpsert: adminProcedure
    .input(z.object({
      lessonId: z.string().min(1),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      sectionSlug: sectionSchema,
      level: z.enum(["fundamental","agente","master","elite"]).optional(),
      duration: z.string().optional(),
      mdUrl: z.string().optional(),
      htmlUrl: z.string().optional(),
      pdfUrl: z.string().optional(),
      coverUrl: z.string().optional(),
      thumbnailUrl: z.string().optional(),
      youtubeVideoId: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isPublished: z.boolean().default(true),
      featured: z.boolean().default(false),
      sortOrder: z.number().int().default(1000),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const updatedBy = (ctx as any).user?.email ?? 'admin';
        const q = await pool.query(`
          INSERT INTO academia_lessons (
            lesson_id, title, subtitle, section_slug, level, NULL::text AS duration,
            md_url, html_url, pdf_url, cover_url, thumbnail_url, youtube_video_id,
            tags, is_published, featured, sort_order, updated_by, published_at
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
            CASE WHEN $14 THEN NOW() ELSE NULL END)
          ON CONFLICT (lesson_id) DO UPDATE SET
            title = EXCLUDED.title, subtitle = EXCLUDED.subtitle,
            section_slug = EXCLUDED.section_slug, level = EXCLUDED.level,
            duration = EXCLUDED.duration, md_url = EXCLUDED.md_url,
            html_url = EXCLUDED.html_url, pdf_url = EXCLUDED.pdf_url,
            cover_url = EXCLUDED.cover_url, thumbnail_url = EXCLUDED.thumbnail_url,
            youtube_video_id = EXCLUDED.youtube_video_id, tags = EXCLUDED.tags,
            is_published = EXCLUDED.is_published, featured = EXCLUDED.featured,
            sort_order = EXCLUDED.sort_order, updated_by = EXCLUDED.updated_by,
            updated_at = NOW(),
            published_at = CASE
              WHEN EXCLUDED.is_published AND academia_lessons.published_at IS NULL THEN NOW()
              ELSE academia_lessons.published_at END
          RETURNING lesson_id, title, is_published
        `, [
          input.lessonId, input.title, input.subtitle ?? null, input.sectionSlug,
          input.level ?? null, input.duration ?? null,
          input.mdUrl ?? null, input.htmlUrl ?? null, input.pdfUrl ?? null,
          input.coverUrl ?? null, input.thumbnailUrl ?? null, input.youtubeVideoId ?? null,
          input.tags ?? [], input.isPublished, input.featured, input.sortOrder, updatedBy,
        ]);
        return { ok: true, lesson: q.rows[0], source: 'real' };
      } catch (err: any) {
        return { ok: false, source: 'error', error: err.message };
      }
    }),
});
