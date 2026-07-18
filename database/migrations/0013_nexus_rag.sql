-- =============================================================================
-- Migration 0013 · Nexus RAG (pgvector)
-- =============================================================================
-- Engine: PostgreSQL >= 13 + extensão pgvector.
-- Idempotente: usa IF NOT EXISTS / ON CONFLICT.
-- Pareado a backend/src/services/nexusRagService.ts e nexusRagRouter.ts.
--
-- Tabelas:
--   - nexus_rag_sources : metadados das fontes (academia, lab, lib, ebook, ...)
--   - nexus_rag_chunks  : chunks de texto + embeddings vetoriais (1536d)
--   - nexus_rag_runs    : auditoria de execuções (ingest / reindex / query)
-- =============================================================================

BEGIN;

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1) Fontes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nexus_rag_sources (
  id                       SERIAL PRIMARY KEY,
  source_kind              VARCHAR(32)  NOT NULL,
  source_ref               VARCHAR(512) NOT NULL,
  title                    VARCHAR(512),
  tenant_id                VARCHAR(64),
  metadata                 JSONB NOT NULL DEFAULT '{}'::jsonb,
  checksum                 VARCHAR(64)  NOT NULL,
  embedding_model_version  VARCHAR(64)  NOT NULL,
  indexed_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (source_kind, source_ref, embedding_model_version)
);

CREATE INDEX IF NOT EXISTS nexus_rag_sources_kind_idx
  ON nexus_rag_sources(source_kind);
CREATE INDEX IF NOT EXISTS nexus_rag_sources_tenant_idx
  ON nexus_rag_sources(tenant_id);

-- ---------------------------------------------------------------------------
-- 2) Chunks vetorizados
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nexus_rag_chunks (
  id          BIGSERIAL PRIMARY KEY,
  source_id   INTEGER NOT NULL REFERENCES nexus_rag_sources(id) ON DELETE CASCADE,
  chunk_idx   INTEGER NOT NULL,
  content     TEXT    NOT NULL,
  embedding   vector(1536),
  tokens      INTEGER,
  tags        TEXT[],
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (source_id, chunk_idx)
);

CREATE INDEX IF NOT EXISTS nexus_rag_chunks_source_idx
  ON nexus_rag_chunks(source_id);
CREATE INDEX IF NOT EXISTS nexus_rag_chunks_embedding_ivfflat
  ON nexus_rag_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ---------------------------------------------------------------------------
-- 3) Auditoria
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS nexus_rag_runs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_type      VARCHAR(64) NOT NULL,
  scope         VARCHAR(64),
  tenant_id     VARCHAR(64),
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at   TIMESTAMPTZ,
  status        VARCHAR(20) NOT NULL DEFAULT 'running',
  stats         JSONB NOT NULL DEFAULT '{}'::jsonb,
  error         TEXT
);

CREATE INDEX IF NOT EXISTS nexus_rag_runs_job_idx
  ON nexus_rag_runs(job_type, started_at DESC);
CREATE INDEX IF NOT EXISTS nexus_rag_runs_scope_idx
  ON nexus_rag_runs(scope, started_at DESC);

COMMIT;
