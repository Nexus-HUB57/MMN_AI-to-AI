-- Migration: featured/sort_order/search_vec for academia_lessons
-- Aplicado em 2026-06-22 (HEAD prod)

CREATE EXTENSION IF NOT EXISTS pg_trgm;

ALTER TABLE public.academia_lessons
  ADD COLUMN IF NOT EXISTS featured   BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 1000,
  ADD COLUMN IF NOT EXISTS search_vec tsvector;

CREATE OR REPLACE FUNCTION public.academia_lessons_search_update()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vec :=
    setweight(to_tsvector('simple', coalesce(NEW.title,'')),    'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.subtitle,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(NEW.tags,' '),'')), 'C');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS academia_lessons_search_trg ON public.academia_lessons;
CREATE TRIGGER academia_lessons_search_trg
BEFORE INSERT OR UPDATE OF title, subtitle, tags ON public.academia_lessons
FOR EACH ROW EXECUTE FUNCTION public.academia_lessons_search_update();

UPDATE public.academia_lessons SET search_vec =
  setweight(to_tsvector('simple', coalesce(title,'')),    'A') ||
  setweight(to_tsvector('simple', coalesce(subtitle,'')), 'B') ||
  setweight(to_tsvector('simple', coalesce(array_to_string(tags,' '),'')), 'C');

CREATE INDEX IF NOT EXISTS academia_lessons_featured_idx   ON public.academia_lessons (featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS academia_lessons_sort_order_idx ON public.academia_lessons (section_slug, sort_order, lesson_id);
CREATE INDEX IF NOT EXISTS academia_lessons_search_idx     ON public.academia_lessons USING GIN (search_vec);
CREATE INDEX IF NOT EXISTS academia_lessons_title_trgm_idx ON public.academia_lessons USING GIN (lower(coalesce(title,'')) gin_trgm_ops);
