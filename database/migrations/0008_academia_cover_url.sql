-- Migration: cover_url separado de thumbnail_url para banner do hub
ALTER TABLE public.academia_lessons
  ADD COLUMN IF NOT EXISTS cover_url TEXT;

UPDATE public.academia_lessons SET cover_url = thumbnail_url
WHERE cover_url IS NULL AND thumbnail_url IS NOT NULL;

CREATE INDEX IF NOT EXISTS academia_lessons_cover_idx ON public.academia_lessons (cover_url) WHERE cover_url IS NOT NULL;
