/**
 * nexusRagPgRepository.ts
 * =======================
 * Adaptador PostgreSQL/pgvector para a camada Nexus RAG.
 *
 * Estratégia:
 *  - require("pg") sob demanda → não quebra bootstrap quando o pacote não está instalado.
 *  - Persiste fontes, chunks e runs nas tabelas da migration 0013_nexus_rag.sql.
 *  - Embedding determinístico no MVP (sha256 → vetor 1536d) — substituir por OpenAI
 *    text-embedding-3-small quando a chave estiver disponível em produção.
 *  - Score lexical em pós-processo, equivalente ao modo in-memory.
 *
 * Pareado com:
 *  - backend/src/services/nexusRagService.ts   (orquestrador híbrido)
 *  - backend/src/routers/nexusRagRouter.ts     (tRPC público/protegido)
 *  - backend/src/workers/ragIngestWorker.ts    (BullMQ)
 *  - database/migrations/0013_nexus_rag.sql    (schema)
 */

import crypto from "node:crypto";

type RagSourceKind =
  | "academia"
  | "lab"
  | "lib"
  | "ebook"
  | "telemetry"
  | "skill-manifest";

type PgClient = {
  query: (sql: string, params?: unknown[]) => Promise<{ rows: any[] }>;
  release: () => void;
};

type PgPool = {
  connect: () => Promise<PgClient>;
  query: (sql: string, params?: unknown[]) => Promise<{ rows: any[] }>;
  end?: () => Promise<void>;
};

interface PgIngestInput {
  sourceKind: RagSourceKind;
  sourceRef: string;
  title?: string;
  content: string;
  tags?: string[];
  tenantId?: string;
  metadata?: Record<string, unknown>;
}

interface PgIngestResult {
  sourceId: number;
  chunks: number;
  embedded: number;
  skipped: boolean;
}

interface PgQueryInput {
  question: string;
  topK?: number;
  scope?: RagSourceKind[];
  tenantId?: string;
}

interface PgQueryRow {
  sourceKind: string;
  sourceRef: string;
  title: string;
  score: number;
  content: string;
}

const EMBEDDING_MODEL_VERSION = "text-embedding-3-small@v1";
const CHUNK_TARGET_CHARS = 1200;
const CHUNK_OVERLAP_CHARS = 200;

let cachedPool: PgPool | null = null;
let availabilityCache: { ok: boolean; checkedAt: number } | null = null;

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

function getPool(): PgPool | null {
  if (!hasDatabaseUrl()) return null;
  if (cachedPool) return cachedPool;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Pool } = require("pg");
    cachedPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 3000,
      ssl:
        process.env.PGSSLMODE === "require"
          ? { rejectUnauthorized: false }
          : undefined,
    }) as PgPool;
    return cachedPool;
  } catch {
    console.warn(
      "[nexusRagPgRepository] pacote 'pg' indisponível; fallback para in-memory."
    );
    return null;
  }
}

function chunkifyMarkdown(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];
  if (normalized.length <= CHUNK_TARGET_CHARS) return [normalized];
  const chunks: string[] = [];
  let cursor = 0;
  while (cursor < normalized.length) {
    const end = Math.min(cursor + CHUNK_TARGET_CHARS, normalized.length);
    chunks.push(normalized.slice(cursor, end).trim());
    if (end >= normalized.length) break;
    cursor = Math.max(0, end - CHUNK_OVERLAP_CHARS);
  }
  return chunks.filter(Boolean);
}

function checksum(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex").slice(0, 32);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9áéíóúñç\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3);
}

function scoreOverlap(queryTokens: string[], content: string): number {
  const tokens = new Set(tokenize(content));
  if (!tokens.size) return 0;
  let hits = 0;
  for (const t of queryTokens) if (tokens.has(t)) hits += 1;
  return hits / Math.sqrt(tokens.size + 8);
}

function deterministicEmbedding(text: string, dimensions = 1536): number[] {
  const out: number[] = [];
  let seed = crypto.createHash("sha256").update(text).digest();
  while (out.length < dimensions) {
    for (const byte of seed) {
      out.push(Number(((byte / 255) * 2 - 1).toFixed(6)));
      if (out.length >= dimensions) break;
    }
    seed = crypto.createHash("sha256").update(seed).digest();
  }
  return out;
}

function vectorLiteral(values: number[]): string {
  return `[${values.join(",")}]`;
}

async function withClient<T>(
  fn: (client: PgClient) => Promise<T>
): Promise<T | null> {
  const pool = getPool();
  if (!pool) return null;
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

export async function isAvailable(): Promise<boolean> {
  if (!hasDatabaseUrl()) return false;
  if (availabilityCache && Date.now() - availabilityCache.checkedAt < 15_000) {
    return availabilityCache.ok;
  }
  try {
    const pool = getPool();
    if (!pool) return false;
    await pool.query("select 1 as ok");
    await pool.query(
      "select to_regclass('public.nexus_rag_sources') as sources_table"
    );
    availabilityCache = { ok: true, checkedAt: Date.now() };
    return true;
  } catch {
    availabilityCache = { ok: false, checkedAt: Date.now() };
    return false;
  }
}


// HOTFIX D18.8: Embeddings OpenAI reais (fallback para determinístico se sem API key ou erro)
async function openaiEmbedding(text: string, dimensions = 1536): Promise<number[] | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const resp = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: text.slice(0, 8000), // OpenAI limit ~8191 tokens
        dimensions,
      }),
    });
    if (!resp.ok) return null;
    const json: any = await resp.json();
    const vec = json?.data?.[0]?.embedding;
    return Array.isArray(vec) && vec.length === dimensions ? vec : null;
  } catch { return null; }
}

async function getEmbedding(text: string): Promise<number[]> {
  const real = await openaiEmbedding(text);
  return real ?? deterministicEmbedding(text);
}

export async function pgIngest(
  input: PgIngestInput
): Promise<PgIngestResult | null> {
  if (!(await isAvailable())) return null;
  const chunks = chunkifyMarkdown(input.content);
  const sum = checksum(input.content);

  return withClient(async (client) => {
    await client.query("BEGIN");
    try {
      const upsert = await client.query(
        `
          INSERT INTO nexus_rag_sources (
            source_kind, source_ref, title, tenant_id, metadata, checksum,
            embedding_model_version, indexed_at
          )
          VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, NOW())
          ON CONFLICT (source_kind, source_ref, embedding_model_version)
          DO UPDATE SET
            title = EXCLUDED.title,
            tenant_id = EXCLUDED.tenant_id,
            metadata = EXCLUDED.metadata,
            checksum = EXCLUDED.checksum,
            indexed_at = NOW()
          RETURNING id
        `,
        [
          input.sourceKind,
          input.sourceRef,
          input.title ?? input.sourceRef,
          input.tenantId ?? null,
          JSON.stringify(input.metadata ?? {}),
          sum,
          EMBEDDING_MODEL_VERSION,
        ]
      );

      const sourceId = Number(upsert.rows[0]?.id ?? 0);
      if (!sourceId) throw new Error("Falha ao obter source_id do RAG.");

      await client.query(
        `DELETE FROM nexus_rag_chunks WHERE source_id = $1`,
        [sourceId]
      );

      for (let i = 0; i < chunks.length; i++) {
        const content = chunks[i];
        const emb = vectorLiteral(
          await getEmbedding(
            `${input.sourceKind}:${input.sourceRef}:${i}:${content}`
          )
        );
        await client.query(
          `
            INSERT INTO nexus_rag_chunks (source_id, chunk_idx, content, embedding, tokens, tags)
            VALUES ($1, $2, $3, $4::vector, $5, $6::text[])
          `,
          [
            sourceId,
            i,
            content,
            emb,
            Math.ceil(content.length / 4),
            input.tags ?? [],
          ]
        );
      }

      await client.query("COMMIT");
      return {
        sourceId,
        chunks: chunks.length,
        embedded: chunks.length,
        skipped: false,
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
  });
}

export async function pgQuery(
  input: PgQueryInput
): Promise<PgQueryRow[] | null> {
  if (!(await isAvailable())) return null;
  const qt = tokenize(input.question);
  if (!qt.length) return [];

  return withClient(async (client) => {
    const where: string[] = [];
    const params: unknown[] = [];
    if (input.scope?.length) {
      params.push(input.scope);
      where.push(`s.source_kind = ANY($${params.length}::text[])`);
    }
    if (input.tenantId) {
      params.push(input.tenantId);
      where.push(`(s.tenant_id = $${params.length} OR s.tenant_id IS NULL)`);
    }
    const sql = `
      SELECT
        s.source_kind AS "sourceKind",
        s.source_ref  AS "sourceRef",
        COALESCE(s.title, s.source_ref) AS title,
        c.content AS content
      FROM nexus_rag_chunks c
      INNER JOIN nexus_rag_sources s ON s.id = c.source_id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY s.indexed_at DESC, c.chunk_idx ASC
      LIMIT 500
    `;
    const rows = await client.query(sql, params);
    return rows.rows
      .map((row) => ({
        sourceKind: String(row.sourceKind),
        sourceRef: String(row.sourceRef),
        title: String(row.title),
        content: String(row.content),
        score: Number(scoreOverlap(qt, String(row.content)).toFixed(4)),
      }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(1, Math.min(input.topK ?? 6, 20)));
  });
}

export async function pgStats(): Promise<Record<string, unknown> | null> {
  if (!(await isAvailable())) return null;
  return withClient(async (client) => {
    const [s, c, r] = await Promise.all([
      client.query(`SELECT COUNT(*)::int AS count FROM nexus_rag_sources`),
      client.query(`SELECT COUNT(*)::int AS count FROM nexus_rag_chunks`),
      client.query(`SELECT COUNT(*)::int AS count FROM nexus_rag_runs`),
    ]);
    return {
      sources: Number(s.rows[0]?.count ?? 0),
      chunks: Number(c.rows[0]?.count ?? 0),
      runs: Number(r.rows[0]?.count ?? 0),
      backend: "pgvector",
      embeddingModelVersion: EMBEDDING_MODEL_VERSION,
    };
  });
}

export async function pgRecordRun(
  jobType: string,
  scope: string | null,
  status: "ok" | "failed",
  stats: Record<string, unknown>,
  error?: string,
  tenantId?: string
): Promise<void> {
  if (!(await isAvailable())) return;
  await withClient(async (client) => {
    await client.query(
      `
        INSERT INTO nexus_rag_runs (
          job_type, scope, tenant_id, started_at, finished_at, status, stats, error
        )
        VALUES ($1, $2, $3, NOW(), NOW(), $4, $5::jsonb, $6)
      `,
      [
        jobType,
        scope,
        tenantId ?? null,
        status,
        JSON.stringify(stats ?? {}),
        error ?? null,
      ]
    );
  });
}

export async function pgListRuns(limit = 20): Promise<any[] | null> {
  if (!(await isAvailable())) return null;
  return withClient(async (client) => {
    const r = await client.query(
      `
        SELECT
          id AS "runId",
          job_type AS "jobType",
          scope,
          status,
          started_at AS "startedAt",
          finished_at AS "finishedAt",
          stats,
          error
        FROM nexus_rag_runs
        ORDER BY started_at DESC
        LIMIT $1
      `,
      [Math.max(1, Math.min(limit, 200))]
    );
    return r.rows.map((row) => ({
      ...row,
      startedAt:
        row.startedAt instanceof Date
          ? row.startedAt.toISOString()
          : String(row.startedAt),
      finishedAt:
        row.finishedAt instanceof Date
          ? row.finishedAt.toISOString()
          : row.finishedAt
            ? String(row.finishedAt)
            : null,
    }));
  });
}
