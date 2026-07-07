/**
 * academiaLessonsRepository — Acesso PostgreSQL à tabela `academia_lessons`.
 *
 * Encapsula leitura e escrita das aulas/overrides da Academ'IA.
 * Usa Pool nativo do pg para evitar acoplamento com drizzle.
 */
import { Pool } from "pg";

let _pool: Pool | null = null;

function getPool(): Pool | null {
  const connStr = process.env.DATABASE_URL;
  if (!connStr) return null;
  if (!_pool) {
    _pool = new Pool({ connectionString: connStr, max: 5 });
  }
  return _pool;
}

export type AcademiaLessonRow = {
  lessonId: string;
  sectionSlug: string;
  title: string | null;
  subtitle: string | null;
  level: string | null;
  requiredTier: string | null;
  durationS: number | null;
  videoUrl: string | null;
  mdUrl: string | null;
  htmlUrl: string | null;
  pdfUrl: string | null;
  thumbnailUrl: string | null;
  youtubeStatus: string | null;
  youtubeChannel: string | null;
  isPublished: boolean;
  tags: string[];
  updatedAt: string;
  updatedBy: string | null;
};

function mapRow(r: any): AcademiaLessonRow {
  return {
    lessonId: r.lesson_id,
    sectionSlug: r.section_slug,
    title: r.title,
    subtitle: r.subtitle,
    level: r.level,
    requiredTier: r.required_tier,
    durationS: r.duration_s !== null ? Number(r.duration_s) : null,
    videoUrl: r.video_url,
    mdUrl: r.md_url,
    htmlUrl: r.html_url,
    pdfUrl: r.pdf_url,
    thumbnailUrl: r.thumbnail_url,
    youtubeStatus: r.youtube_status,
    youtubeChannel: r.youtube_channel,
    isPublished: r.is_published === null ? true : Boolean(r.is_published),
    tags: Array.isArray(r.tags) ? r.tags.filter(Boolean) : [],
    updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
    updatedBy: r.updated_by,
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
}): Promise<AcademiaLessonRow[]> {
  const pool = getPool();
  if (!pool) return [];
  const where: string[] = [];
  const params: any[] = [];
  if (filter?.sectionSlug) {
    params.push(filter.sectionSlug);
    where.push(`section_slug = $${params.length}`);
  }
  if (filter?.publishedOnly) {
    where.push(`is_published = true`);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const sql = `SELECT * FROM public.academia_lessons ${whereSql} ORDER BY level NULLS LAST, lesson_id`;
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
      video_url, md_url, html_url, pdf_url, thumbnail_url,
      youtube_status, youtube_channel, is_published, tags, updated_at, updated_by
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,COALESCE($15,true),$16,now(),$17
    )
    ON CONFLICT (lesson_id) DO UPDATE SET
      section_slug    = EXCLUDED.section_slug,
      title           = COALESCE(EXCLUDED.title, public.academia_lessons.title),
      subtitle        = COALESCE(EXCLUDED.subtitle, public.academia_lessons.subtitle),
      level           = COALESCE(EXCLUDED.level, public.academia_lessons.level),
      required_tier   = COALESCE(EXCLUDED.required_tier, public.academia_lessons.required_tier),
      duration_s      = COALESCE(EXCLUDED.duration_s, public.academia_lessons.duration_s),
      video_url       = COALESCE(EXCLUDED.video_url, public.academia_lessons.video_url),
      md_url          = COALESCE(EXCLUDED.md_url, public.academia_lessons.md_url),
      html_url        = COALESCE(EXCLUDED.html_url, public.academia_lessons.html_url),
      pdf_url         = COALESCE(EXCLUDED.pdf_url, public.academia_lessons.pdf_url),
      thumbnail_url   = COALESCE(EXCLUDED.thumbnail_url, public.academia_lessons.thumbnail_url),
      youtube_status  = COALESCE(EXCLUDED.youtube_status, public.academia_lessons.youtube_status),
      youtube_channel = COALESCE(EXCLUDED.youtube_channel, public.academia_lessons.youtube_channel),
      is_published    = COALESCE(EXCLUDED.is_published, public.academia_lessons.is_published),
      tags            = COALESCE(EXCLUDED.tags, public.academia_lessons.tags),
      updated_at      = now(),
      updated_by      = $17
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
    input.youtubeStatus ?? null,
    input.youtubeChannel ?? null,
    input.isPublished ?? null,
    input.tags ?? null,
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
  withVideo: number;
  withMd: number;
  withHtml: number;
  withPdf: number;
  withThumb: number;
  bySection: Record<string, number>;
  byLevel: Record<string, number>;
  updatedAt: string;
}> {
  const pool = getPool();
  if (!pool) {
    return {
      total: 0,
      published: 0,
      withVideo: 0,
      withMd: 0,
      withHtml: 0,
      withPdf: 0,
      withThumb: 0,
      bySection: {},
      byLevel: {},
      updatedAt: new Date().toISOString(),
    };
  }
  const totals = await pool.query(`
    SELECT
      count(*)::int AS total,
      count(*) FILTER (WHERE is_published)::int AS published,
      count(*) FILTER (WHERE video_url     IS NOT NULL AND video_url     <> '')::int AS with_video,
      count(*) FILTER (WHERE md_url        IS NOT NULL AND md_url        <> '')::int AS with_md,
      count(*) FILTER (WHERE html_url      IS NOT NULL AND html_url      <> '')::int AS with_html,
      count(*) FILTER (WHERE pdf_url       IS NOT NULL AND pdf_url       <> '')::int AS with_pdf,
      count(*) FILTER (WHERE thumbnail_url IS NOT NULL AND thumbnail_url <> '')::int AS with_thumb,
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
    withVideo: Number(t.with_video || 0),
    withMd: Number(t.with_md || 0),
    withHtml: Number(t.with_html || 0),
    withPdf: Number(t.with_pdf || 0),
    withThumb: Number(t.with_thumb || 0),
    bySection: secObj,
    byLevel: lvlObj,
    updatedAt: t.updated_at ? new Date(t.updated_at).toISOString() : new Date().toISOString(),
  };
}
