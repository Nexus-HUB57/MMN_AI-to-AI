-- Migration 0009: published_at + title_en/subtitle_en
ALTER TABLE public.academia_lessons
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS title_en     TEXT,
  ADD COLUMN IF NOT EXISTS subtitle_en  TEXT;

UPDATE public.academia_lessons
SET published_at = COALESCE(published_at, updated_at)
WHERE published_at IS NULL AND is_published = TRUE;

CREATE INDEX IF NOT EXISTS academia_lessons_published_at_idx
  ON public.academia_lessons (published_at DESC NULLS LAST)
  WHERE is_published = TRUE;
