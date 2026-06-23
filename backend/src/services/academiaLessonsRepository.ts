/**
 * academiaLessonsRepository — acesso PostgreSQL à tabela `academia_lessons`.
 * v11: featured, sort_order, cover_url, published_at, title_en, subtitle_en, search.
 */
import { Pool } from "pg";

let _pool: Pool | null = null;

function getPool(): Pool | null {
  const connStr = process.env.DATABASE_URL;
  if (!connStr) return null;
  if (!_pool) _pool = new Pool({ connectionString: connStr, max: 5 });
  return _pool;
}

export type AcademiaLessonRow = {
  lessonId: string;
  sectionSlug: string;
  title: string | null;
  subtitle: string | null;
  titleEn: string | null;
  subtitleEn: string | null;
  level: string | null;
  requiredTier: string | null;
  durationS: number | null;
  videoUrl: string | null;
  mdUrl: string | null;
  htmlUrl: string | null;
  pdfUrl: string | null;
  thumbnailUrl: string | null;
  coverUrl: string | null;
  youtubeStatus: string | null;
  youtubeChannel: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;
  publishedAt: string | null;
  tags: string[];
  updatedAt: string;
  updatedBy: string | null;
  rank?: number;
};

function mapRow(r: any): AcademiaLessonRow {
  return {
    lessonId: r.lesson_id,
    sectionSlug: r.section_slug,
    title: r.title,
    subtitle: r.subtitle,
    titleEn: r.title_en ?? null,
    subtitleEn: r.subtitle_en ?? null,
    level: r.level,
    requiredTier: r.required_tier,
    durationS: r.duration_s !== null && r.duration_s !== undefined ? Number(r.duration_s) : null,
    videoUrl: r.video_url,
    mdUrl: r.md_url,
    htmlUrl: r.html_url,
    pdfUrl: r.pdf_url,
    thumbnailUrl: r.thumbnail_url,
    coverUrl: r.cover_url ?? r.thumbnail_url ?? null,
    youtubeStatus: r.youtube_status,
    youtubeChannel: r.youtube_channel,
    isPublished: r.is_published === null ? true : Boolean(r.is_published),
    isFeatured: Boolean(r.featured),
    sortOrder: Number(r.sort_order ?? 1000),
    publishedAt: r.published_at ? new Date(r.published_at).toISOString() : null,
    tags: Array.isArray(r.tags) ? r.tags.filter(Boolean) : [],
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    updatedBy: r.updated_by,
    ...(r.rank !== undefined ? { rank: Number(r.rank) } : {}),
  };
}

export async function isAcademiaLessonsAvailable(): Promise<boolean> {
  const pool = getPool();
  if (!pool) return false;
  try {
    const res = await pool.query(
      "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='academia_lessons' LIMIT 1",
    );
    return res.rowCount === 1;
  } catch {
    return false;
  }
}

export async function listLessons(filter?: {
  sectionSlug?: string;
  publishedOnly?: boolean;
  featuredOnly?: boolean;
  search?: string;
  limit?: number;
}): Promise<AcademiaLessonRow[]> {
  const pool = getPool();
  if (!pool) return [];
  const where: string[] = [];
  const params: any[] = [];
  let rankSelect = "";
  let orderSql = "section_slug ASC, sort_order ASC, lesson_id ASC";

  if (filter?.sectionSlug) {
    params.push(filter.sectionSlug);
    where.push(`section_slug = $${params.length}`);
  }
  if (filter?.publishedOnly) where.push("is_published = true");
  if (filter?.featuredOnly) where.push("featured = true");

  const q = filter?.search?.trim();
  if (q) {
    params.push(q);
    const tsq = `plainto_tsquery('simple', $${params.length})`;
    params.push(q.toLowerCase());
    const trgm = `lower(coalesce(title,'')) % $${params.length}`;
    where.push(`(search_vec @@ ${tsq} OR ${trgm})`);
    rankSelect = `, GREATEST(ts_rank(search_vec, ${tsq}), similarity(lower(coalesce(title,'')), $${params.length})) AS rank`;
    orderSql = "rank DESC NULLS LAST, sort_order ASC, lesson_id ASC";
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const limitSql = filter?.limit && filter.limit > 0 ? `LIMIT ${Math.min(filter.limit, 200)}` : "";
  const sql = `SELECT *${rankSelect} FROM public.academia_lessons ${whereSql} ORDER BY ${orderSql} ${limitSql}`;
  const res = await pool.query(sql, params);
  return res.rows.map(mapRow);
}

export async function getLesson(lessonId: string): Promise<AcademiaLessonRow | null> {
  const pool = getPool();
  if (!pool) return null;
  const res = await pool.query(
    "SELECT * FROM public.academia_lessons WHERE lesson_id = $1 LIMIT 1",
    [lessonId],
  );
  return res.rowCount && res.rowCount > 0 ? mapRow(res.rows[0]) : null;
}

export async function upsertLesson(
  input: Partial<AcademiaLessonRow> & { lessonId: string; sectionSlug: string },
  updatedBy: string,
): Promise<AcademiaLessonRow> {
  const pool = getPool();
  if (!pool) throw new Error("DATABASE_URL not configured");
  const sql = `
    INSERT INTO public.academia_lessons (
      lesson_id, section_slug, title, subtitle, level, required_tier, duration_s,
      video_url, md_url, html_url, pdf_url, thumbnail_url, cover_url,
      title_en, subtitle_en, published_at,
      youtube_status, youtube_channel, is_published, tags,
      featured, sort_order, updated_at, updated_by
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,
      $8,$9,$10,$11,$12,$13,
      $14,$15,$16,
      $17,$18,COALESCE($19,true),$20,
      COALESCE($21,false),COALESCE($22,1000), now(),$23
    )
    ON CONFLICT (lesson_id) DO UPDATE SET
      section_slug    = EXCLUDED.section_slug,
      title           = COALESCE(EXCLUDED.title, public.academia_lessons.title),
      subtitle        = COALESCE(EXCLUDED.subtitle, public.academia_lessons.subtitle),
      title_en        = COALESCE(EXCLUDED.title_en, public.academia_lessons.title_en),
      subtitle_en     = COALESCE(EXCLUDED.subtitle_en, public.academia_lessons.subtitle_en),
      level           = COALESCE(EXCLUDED.level, public.academia_lessons.level),
      required_tier   = COALESCE(EXCLUDED.required_tier, public.academia_lessons.required_tier),
      duration_s      = COALESCE(EXCLUDED.duration_s, public.academia_lessons.duration_s),
      video_url       = COALESCE(EXCLUDED.video_url, public.academia_lessons.video_url),
      md_url          = COALESCE(EXCLUDED.md_url, public.academia_lessons.md_url),
      html_url        = COALESCE(EXCLUDED.html_url, public.academia_lessons.html_url),
      pdf_url         = COALESCE(EXCLUDED.pdf_url, public.academia_lessons.pdf_url),
      thumbnail_url   = COALESCE(EXCLUDED.thumbnail_url, public.academia_lessons.thumbnail_url),
      cover_url       = COALESCE(EXCLUDED.cover_url, public.academia_lessons.cover_url),
      published_at    = COALESCE(EXCLUDED.published_at, public.academia_lessons.published_at),
      youtube_status  = COALESCE(EXCLUDED.youtube_status, public.academia_lessons.youtube_status),
      youtube_channel = COALESCE(EXCLUDED.youtube_channel, public.academia_lessons.youtube_channel),
      is_published    = COALESCE(EXCLUDED.is_published, public.academia_lessons.is_published),
      tags            = COALESCE(EXCLUDED.tags, public.academia_lessons.tags),
      featured        = COALESCE(EXCLUDED.featured, public.academia_lessons.featured),
      sort_order      = COALESCE(EXCLUDED.sort_order, public.academia_lessons.sort_order),
      updated_at      = now(),
      updated_by      = $23
    RETURNING *`;
  const params = [
    input.lessonId,
    input.sectionSlug,
    input.title ?? null,
    input.subtitle ?? null,
    input.level ?? null,
    input.requiredTier ?? null,
    input.durationS ?? null,
    input.videoUrl ?? null,
    input.mdUrl ?? null,
    input.htmlUrl ?? null,
    input.pdfUrl ?? null,
    input.thumbnailUrl ?? null,
    input.coverUrl ?? null,
    input.titleEn ?? null,
    input.subtitleEn ?? null,
    input.publishedAt ?? null,
    input.youtubeStatus ?? null,
    input.youtubeChannel ?? null,
    input.isPublished ?? null,
    input.tags ?? null,
    input.isFeatured ?? null,
    input.sortOrder ?? null,
    updatedBy,
  ];
  const res = await pool.query(sql, params);
  return mapRow(res.rows[0]);
}

export async function deleteLesson(lessonId: string): Promise<boolean> {
  const pool = getPool();
  if (!pool) return false;
  const res = await pool.query("DELETE FROM public.academia_lessons WHERE lesson_id = $1", [
    lessonId,
  ]);
  return (res.rowCount ?? 0) > 0;
}

export async function lessonsStats(): Promise<{
  total: number;
  published: number;
  featured: number;
  withVideo: number;
  withMd: number;
  withHtml: number;
  withPdf: number;
  withThumb: number;
  withCover: number;
  withPublishedAt: number;
  bySection: Record<string, number>;
  byLevel: Record<string, number>;
  updatedAt: string;
}> {
  const pool = getPool();
  if (!pool) {
    return {
      total: 0, published: 0, featured: 0, withVideo: 0, withMd: 0, withHtml: 0,
      withPdf: 0, withThumb: 0, withCover: 0, withPublishedAt: 0,
      bySection: {}, byLevel: {}, updatedAt: new Date().toISOString(),
    };
  }
  const totals = await pool.query(`
    SELECT
      count(*)::int AS total,
      count(*) FILTER (WHERE is_published)::int AS published,
      count(*) FILTER (WHERE featured)::int     AS featured,
      count(*) FILTER (WHERE video_url     IS NOT NULL AND video_url     <> '')::int AS with_video,
      count(*) FILTER (WHERE md_url        IS NOT NULL AND md_url        <> '')::int AS with_md,
      count(*) FILTER (WHERE html_url      IS NOT NULL AND html_url      <> '')::int AS with_html,
      count(*) FILTER (WHERE pdf_url       IS NOT NULL AND pdf_url       <> '')::int AS with_pdf,
      count(*) FILTER (WHERE thumbnail_url IS NOT NULL AND thumbnail_url <> '')::int AS with_thumb,
      count(*) FILTER (WHERE cover_url     IS NOT NULL AND cover_url     <> '')::int AS with_cover,
      count(*) FILTER (WHERE published_at  IS NOT NULL)::int AS with_published_at,
      max(updated_at) AS updated_at
    FROM public.academia_lessons
  `);
  const bySection = await pool.query(
    "SELECT section_slug, count(*)::int AS c FROM public.academia_lessons GROUP BY section_slug",
  );
  const byLevel = await pool.query(
    "SELECT COALESCE(level,'sem_nivel') AS level, count(*)::int AS c FROM public.academia_lessons GROUP BY 1",
  );
  const t = totals.rows[0];
  const secObj: Record<string, number> = {};
  for (const r of bySection.rows) secObj[r.section_slug] = Number(r.c);
  const lvlObj: Record<string, number> = {};
  for (const r of byLevel.rows) lvlObj[r.level] = Number(r.c);
  return {
    total: Number(t.total || 0),
    published: Number(t.published || 0),
    featured: Number(t.featured || 0),
    withVideo: Number(t.with_video || 0),
    withMd: Number(t.with_md || 0),
    withHtml: Number(t.with_html || 0),
    withPdf: Number(t.with_pdf || 0),
    withThumb: Number(t.with_thumb || 0),
    withCover: Number(t.with_cover || 0),
    withPublishedAt: Number(t.with_published_at || 0),
    bySection: secObj,
    byLevel: lvlObj,
    updatedAt: t.updated_at ? new Date(t.updated_at).toISOString() : new Date().toISOString(),
  };
}
