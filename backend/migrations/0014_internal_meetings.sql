-- Onda 12 · Internal Meetings via Chatbot + Jivo
CREATE TABLE IF NOT EXISTS internal_meetings (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL,
  meeting_type text NOT NULL DEFAULT 'c-suite',
  scheduled_at timestamp with time zone NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  chatbot_room_id text NOT NULL UNIQUE,
  jivo_channel_id text,
  participants jsonb NOT NULL DEFAULT '[]',
  agenda jsonb NOT NULL DEFAULT '[]',
  transcript_url text,
  recording_url text,
  status text NOT NULL DEFAULT 'scheduled',
  created_by text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_internal_meetings_scheduled ON internal_meetings(scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_internal_meetings_type ON internal_meetings(meeting_type);
CREATE INDEX IF NOT EXISTS idx_internal_meetings_status ON internal_meetings(status);
