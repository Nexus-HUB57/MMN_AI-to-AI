-- Migration 0011: lesson_progress + LGPD cleanup view
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id              BIGSERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL,
  lesson_id       TEXT NOT NULL REFERENCES public.academia_lessons(lesson_id) ON DELETE CASCADE,
  watched_seconds INTEGER NOT NULL DEFAULT 0,
  duration_s      INTEGER,
  completed       BOOLEAN NOT NULL DEFAULT FALSE,
  last_position   INTEGER NOT NULL DEFAULT 0,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  UNIQUE (user_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS lesson_progress_user_idx ON public.lesson_progress (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS lesson_progress_completed_idx ON public.lesson_progress (lesson_id, completed);

CREATE OR REPLACE VIEW public.lesson_completion_stats AS
SELECT
  lesson_id,
  count(*) FILTER (WHERE completed)::int AS completed_count,
  count(*)::int AS started_count,
  ROUND(avg(watched_seconds))::int AS avg_watched_s,
  ROUND(100.0 * count(*) FILTER (WHERE completed) / NULLIF(count(*), 0), 1) AS completion_rate
FROM public.lesson_progress
GROUP BY lesson_id;
