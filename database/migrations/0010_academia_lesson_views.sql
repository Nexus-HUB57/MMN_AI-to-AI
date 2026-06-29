-- Migration 0010: lesson_views (tracking de visualizações por aula)
CREATE TABLE IF NOT EXISTS public.lesson_views (
  id           BIGSERIAL PRIMARY KEY,
  lesson_id    TEXT NOT NULL REFERENCES public.academia_lessons(lesson_id) ON DELETE CASCADE,
  user_id      INTEGER,
  ip_hash      TEXT,
  user_agent   TEXT,
  referrer     TEXT,
  viewed_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lesson_views_lesson_idx ON public.lesson_views (lesson_id, viewed_at DESC);
CREATE INDEX IF NOT EXISTS lesson_views_viewed_at_idx ON public.lesson_views (viewed_at DESC);
