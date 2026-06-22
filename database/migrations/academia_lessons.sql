-- Schema oficial Academ'IA · Nexus Affil'IA'te
CREATE TABLE IF NOT EXISTS academia_lessons (
  lesson_id      TEXT PRIMARY KEY,
  section_slug   TEXT NOT NULL,
  title          TEXT,
  subtitle       TEXT,
  level          TEXT,
  required_tier  TEXT,
  duration_s     INT,
  video_url      TEXT,
  md_url         TEXT,
  html_url       TEXT,
  pdf_url        TEXT,
  thumbnail_url  TEXT,
  youtube_status TEXT,
  youtube_channel TEXT,
  is_published   BOOLEAN DEFAULT TRUE,
  tags           TEXT[],
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_by     TEXT
);
CREATE INDEX IF NOT EXISTS academia_lessons_level_idx ON academia_lessons(level);
CREATE INDEX IF NOT EXISTS academia_lessons_published_idx ON academia_lessons(is_published);
