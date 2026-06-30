/**
 * nexusRagService.ts
 * ===================
 * Serviço RAG canônico do Nexus Affil'IA'te.
 *
 * Versão base (MVP in-memory) que será transformada em híbrido
 * (in-memory ↔ pgvector) pelo patch do Ravi (M9 · nexusRagService.patch.md).
 *
 * Responsabilidades:
 *  - Ingest de fontes canônicas (academia, lab, lib, ebook, doc, custom)
 *  - Chunking determinístico (~ 800 chars, overlap 120)
 *  - Embedding determinístico via sha256 → vetor 1536d (MVP)
 *  - Query lexical com score combinado (BM25-like simplificado)
 *  - Answer composto (extractive) com citações
 *  - Reindex idempotente por scope
 *  - Auditoria das runs (ingest/reindex/query)
 *
 * Pareado com:
 *  - backend/src/routers/nexusRagRouter.ts (tRPC)
 *  - backend/src/services/nexusRagPgRepository.ts (adapter pgvector, M9 Ravi)
 *  - backend/src/workers/ragIngestWorker.ts (BullMQ, M9 Ravi)
 *  - database/migrations/0013_nexus_rag.sql (schema, M9 Ravi)
 *
 * @module services/nexusRagService
 * @author Niko Nexus (CEO/AI) + Ravi (CTO/AI)
 */
import crypto from "node:crypto";
import {
  pgIngest,
  pgQuery,
  pgStats,
  pgRecordRun,
  pgListRuns,
  isAvailable as pgIsAvailable,
} from "./nexusRagPgRepository";

// ─── Modo híbrido (M9 · patch Ravi) ─────────────────────────────────────────
function modeHint(): "pgvector" | "in-memory" {
  return process.env.DATABASE_URL && process.env.NEXUS_RAG_BACKEND !== "in-memory"
    ? "pgvector"
    : "in-memory";
}

async function activeMode(): Promise<"pgvector" | "in-memory"> {
  if (modeHint() === "pgvector" && (await pgIsAvailable())) return "pgvector";
  return "in-memory";
}

// ─── Constantes ────────────────────────────────────────────────────────────

export const EMBEDDING_MODEL_VERSION = "nexus-mvp-sha256-1536";
const CHUNK_SIZE = 800;
const CHUNK_OVERLAP = 120;

// ─── Tipos públicos ────────────────────────────────────────────────────────

export type RagSourceKind =
  | "academia"
  | "lab"
  | "lib"
  | "ebook"
  | "doc"
  | "custom";

export interface RagChunk {
  id: string;
  sourceId: string;
  position: number;
  text: string;
  embedding: number[];
}

export interface RagSource {
  id: string;
  kind: RagSourceKind;
  ref: string;          // ex: "academia/cursos/fund-00"
  title: string;
  content: string;
  chunks: RagChunk[];
  ingestedAt: string;
}

export interface RagRun {
  id: string;
  kind: "ingest" | "reindex" | "query";
  scope: string;
  status: "ok" | "error";
  stats: Record<string, unknown>;
  createdAt: string;
}

export interface RagMatch {
  chunkId: string;
  sourceId: string;
  sourceKind: RagSourceKind;
  sourceRef: string;
  title: string;
  snippet: string;
  score: number;
}

export interface RagAnswer {
  question: string;
  answer: string;
  citations: Array<{
    sourceKind: RagSourceKind;
    sourceRef: string;
    title: string;
    score: number;
  }>;
  latencyMs: number;
  mode: "pgvector" | "in-memory";
}

// ─── Store in-memory ───────────────────────────────────────────────────────

interface MemStore {
  sources: Map<string, RagSource>;
  runs: RagRun[];
}

export const memStore: MemStore = {
  sources: new Map(),
  runs: [],
};

// ─── Util ──────────────────────────────────────────────────────────────────

function sha256Hex(s: string): string {
  return crypto.createHash("sha256").update(s).digest("hex");
}

/**
 * Embedding determinístico MVP: sha256 → 1536 valores normalizados em [-1, 1].
 * Será substituído por OpenAI text-embedding-3-small quando KEY estiver disponível.
 */
function embedDeterministic(text: string): number[] {
  const buf = Buffer.alloc(0);
  const out = new Float32Array(1536);
  let h = crypto.createHash("sha256").update(text).digest();
  for (let i = 0; i < 1536; i++) {
    // 32 bytes por hash; refresh quando esgota
    if (i % 32 === 0 && i > 0) {
      h = crypto.createHash("sha256").update(h).digest();
    }
    const byte = h[i % 32];
    out[i] = (byte - 128) / 128; // -1..1
  }
  return Array.from(out);
}

function chunkText(text: string): string[] {
  if (!text || text.length <= CHUNK_SIZE) return [text];
  const chunks: string[] = [];
  let pos = 0;
  while (pos < text.length) {
    chunks.push(text.slice(pos, pos + CHUNK_SIZE));
    pos += CHUNK_SIZE - CHUNK_OVERLAP;
  }
  return chunks;
}

function newId(prefix: string): string {
  return `${prefix}_${crypto.randomBytes(6).toString("hex")}`;
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^\w\sáéíóúâêôãõçà]/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}

function lexicalScore(query: string, chunk: string): number {
  const qt = tokenize(query);
  if (qt.length === 0) return 0;
  const ct = new Set(tokenize(chunk));
  let hits = 0;
  for (const t of qt) if (ct.has(t)) hits++;
  return hits / qt.length; // 0..1
}

function recordRun(
  kind: RagRun["kind"],
  scope: string,
  status: "ok" | "error",
  stats: Record<string, unknown>,
) {
  const run: RagRun = {
    id: newId("run"),
    kind,
    scope,
    status,
    stats,
    createdAt: new Date().toISOString(),
  };
  memStore.runs.unshift(run);
  if (memStore.runs.length > 500) memStore.runs.length = 500;
  return run;
}

// ─── API pública ───────────────────────────────────────────────────────────

export interface IngestInput {
  // Aceita ambos os formatos para compatibilidade com worker do Ravi
  kind?: RagSourceKind;
  ref?: string;
  sourceKind?: string;
  sourceRef?: string;
  title?: string;
  content: string;
  tags?: string[];
  tenantId?: string;
  metadata?: Record<string, unknown>;
}

export interface IngestResult {
  sourceId: string;
  chunks: number;
  mode: "pgvector" | "in-memory";
}

export async function ingest(input: IngestInput): Promise<IngestResult> {
  const start = Date.now();
  const useMode = await activeMode();

  // Normaliza kind/sourceKind e ref/sourceRef
  const kindRaw = (input.kind ?? input.sourceKind ?? "custom") as string;
  const allowedKinds: RagSourceKind[] = [
    "academia", "lab", "lib", "ebook", "doc", "custom",
  ];
  const kind = (allowedKinds.includes(kindRaw as RagSourceKind)
    ? kindRaw
    : "custom") as RagSourceKind;
  const ref = input.ref ?? input.sourceRef ?? `unknown_${Date.now()}`;
  const title = input.title ?? ref;

  if (useMode === "pgvector") {
    try {
      const result = await pgIngest({
        sourceKind: kindRaw as any,
        sourceRef: ref,
        title,
        content: input.content,
        tags: input.tags,
        tenantId: input.tenantId,
        metadata: input.metadata,
      });
      if (result) {
        await pgRecordRun("ingest", `${kind}:${ref}`, "ok", {
          sourceId: result.sourceId,
          chunks: result.chunks,
          embedded: result.embedded,
          skipped: result.skipped,
          durationMs: Date.now() - start,
        });
        return {
          sourceId: String(result.sourceId),
          chunks: result.chunks,
          mode: "pgvector",
        };
      }
    } catch (err) {
      console.warn("[nexusRagService] pgIngest falhou, fallback in-memory:", err);
    }
  }

  // Caminho in-memory (default + fallback)
  const sourceId = `src_${sha256Hex(`${kind}|${ref}`).slice(0, 16)}`;
  const pieces = chunkText(input.content);
  const chunks: RagChunk[] = pieces.map((p, i) => ({
    id: newId("ck"),
    sourceId,
    position: i,
    text: p,
    embedding: embedDeterministic(p),
  }));

  const source: RagSource = {
    id: sourceId,
    kind,
    ref,
    title,
    content: input.content,
    chunks,
    ingestedAt: new Date().toISOString(),
  };

  memStore.sources.set(sourceId, source);

  recordRun("ingest", `${kind}:${ref}`, "ok", {
    sourceId,
    chunks: chunks.length,
    durationMs: Date.now() - start,
  });

  return { sourceId, chunks: chunks.length, mode: "in-memory" };
}

export interface QueryInput {
  question: string;
  topK?: number;
  scope?: RagSourceKind[];
}

export interface QueryResult {
  matches: RagMatch[];
  latencyMs: number;
  mode: "pgvector" | "in-memory";
}

export async function query(input: QueryInput): Promise<QueryResult> {
  const start = Date.now();
  const useMode = await activeMode();

  if (useMode === "pgvector") {
    try {
      const pgRows = await pgQuery({
        question: input.question,
        topK: input.topK ?? 5,
        scope: input.scope,
      });
      if (Array.isArray(pgRows)) {
        const matches: RagMatch[] = pgRows.map((row, idx) => ({
          chunkId: `pg_${idx}`,
          sourceId: `pg_${row.sourceRef}`,
          sourceKind: row.sourceKind as RagSourceKind,
          sourceRef: row.sourceRef,
          title: row.title,
          snippet: (row.content ?? "").slice(0, 240),
          score: row.score,
        }));
        return {
          matches,
          latencyMs: Date.now() - start,
          mode: "pgvector",
        };
      }
    } catch (err) {
      console.warn("[nexusRagService] pgQuery falhou, fallback in-memory:", err);
    }
  }

  const k = input.topK ?? 5;
  const scope = input.scope;

  const matches: RagMatch[] = [];
  for (const src of memStore.sources.values()) {
    if (scope && !scope.includes(src.kind)) continue;
    for (const ck of src.chunks) {
      const score = lexicalScore(input.question, ck.text);
      if (score > 0) {
        matches.push({
          chunkId: ck.id,
          sourceId: src.id,
          sourceKind: src.kind,
          sourceRef: src.ref,
          title: src.title,
          snippet: ck.text.slice(0, 240),
          score,
        });
      }
    }
  }
  matches.sort((a, b) => b.score - a.score);
  const top = matches.slice(0, k);

  const latencyMs = Date.now() - start;
  recordRun("query", input.scope?.join(",") ?? "all", "ok", {
    question: input.question.slice(0, 120),
    matches: top.length,
    latencyMs,
  });

  return { matches: top, latencyMs, mode: "in-memory" };
}

export async function answer(input: QueryInput): Promise<RagAnswer> {
  const start = Date.now();
  const qr = await query(input);
  const citations = qr.matches.map((m) => ({
    sourceKind: m.sourceKind,
    sourceRef: m.sourceRef,
    title: m.title,
    score: m.score,
  }));
  // Resposta extractiva simples: concatena os top snippets com índice
  const composed =
    qr.matches.length === 0
      ? "Sem contexto relevante no RAG do Nexus."
      : qr.matches
          .slice(0, Math.min(3, qr.matches.length))
          .map((m, i) => `[${i + 1}] ${m.snippet}`)
          .join("\n\n");
  return {
    question: input.question,
    answer: composed,
    citations,
    latencyMs: Date.now() - start,
    mode: qr.mode,
  };
}

export async function reindex(scope?: RagSourceKind | RagSourceKind[] | string) {
  const start = Date.now();
  const targetKinds = !scope || scope === "all"
    ? null
    : Array.isArray(scope)
      ? (scope as RagSourceKind[])
      : [scope as RagSourceKind];
  let touched = 0;
  for (const src of memStore.sources.values()) {
    if (targetKinds && !targetKinds.includes(src.kind)) continue;
    src.chunks = chunkText(src.content).map((p, i) => ({
      id: newId("ck"),
      sourceId: src.id,
      position: i,
      text: p,
      embedding: embedDeterministic(p),
    }));
    touched++;
  }
  const stats = {
    touched,
    durationMs: Date.now() - start,
    scope: targetKinds ?? "all",
  };
  recordRun("reindex", String(scope ?? "all"), "ok", stats);

  if ((await activeMode()) === "pgvector") {
    try {
      await pgRecordRun("reindex", String(scope ?? "all"), "ok", stats);
    } catch {
      // silent
    }
  }

  return stats;
}

export async function stats() {
  const useMode = await activeMode();
  let sources = memStore.sources.size;
  let chunks = Array.from(memStore.sources.values()).reduce(
    (s, src) => s + src.chunks.length,
    0,
  );

  let resolvedBackend: "pgvector" | "in-memory" = useMode;

  if (useMode === "pgvector") {
    try {
      const remote = await pgStats();
      if (remote) {
        sources = Number(remote.sources);
        chunks = Number(remote.chunks);
      } else {
        resolvedBackend = "in-memory";
      }
    } catch (err) {
      console.warn("[nexusRagService] pgStats falhou, fallback in-memory:", err);
      resolvedBackend = "in-memory";
    }
  }

  return {
    backend: resolvedBackend,
    sources,
    chunks,
    runs: memStore.runs.length,
    embeddingModelVersion: EMBEDDING_MODEL_VERSION,
  };
}

export async function listRuns(limit = 50) {
  if ((await activeMode()) === "pgvector") {
    const remote = await pgListRuns(limit);
    if (Array.isArray(remote)) return remote;
  }
  return memStore.runs.slice(0, Math.min(limit, memStore.runs.length));
}
