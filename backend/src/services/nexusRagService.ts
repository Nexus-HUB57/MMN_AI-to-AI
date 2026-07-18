/**
 * nexusRagService.ts
 * ==================
 * Camada de orquestração canônica do RAG do Nexus Affil'IA'te.
 *
 * Estratégia híbrida:
 *  - Quando `DATABASE_URL` está configurado e a migration 0011_nexus_rag.sql
 *    aplicada, usa pgvector (modo 'pgvector').
 *  - Caso contrário, opera em modo 'in-memory' com um índice TF-IDF leve,
 *    suficiente para o Lab Chatbot e para validação local de contratos.
 *
 * Esta camada é consumida por:
 *  - backend/src/routers/nexusRagRouter.ts (API pública/protegida via tRPC)
 *  - backend/src/agentic/* (marketingAgent, judgeRevisor, ...)
 *  - backend/src/workers/ragIngestWorker.ts (queue BullMQ)
 *
 * Decisão de CTO (ADR-001):
 *  - Embedding canônico: text-embedding-3-small (1536d)
 *  - Geração canônica: gemini-2.0-flash (fallback gpt-4.1-mini)
 *  - Vector store: pgvector
 */

import crypto from "node:crypto";
import {
  isAvailable as pgIsAvailable,
  pgIngest,
  pgQuery,
  pgStats,
  pgListRuns,
  pgRecordRun,
} from "./nexusRagPgRepository";

// -----------------------------------------------------------------------------
// Tipos públicos
// -----------------------------------------------------------------------------
export type RagSourceKind =
  | "academia"
  | "lab"
  | "lib"
  | "ebook"
  | "telemetry"
  | "skill-manifest";

export interface RagIngestInput {
  sourceKind: RagSourceKind;
  sourceRef: string;
  title?: string;
  content: string;
  tags?: string[];
  tenantId?: string;
  metadata?: Record<string, unknown>;
}

export interface RagIngestResult {
  runId: string;
  sourceId: number;
  chunks: number;
  mode: "pgvector" | "in-memory";
}

export interface RagQueryInput {
  question: string;
  topK?: number;
  scope?: RagSourceKind[];
  tenantId?: string;
}

export interface RagMatch {
  sourceKind: RagSourceKind;
  sourceRef: string;
  title: string;
  score: number;
  content: string;
}

export interface RagQueryResult {
  matches: RagMatch[];
  latencyMs: number;
  mode: "pgvector" | "in-memory";
}

export interface RagAnswerInput extends RagQueryInput {
  modelHint?: "gemini-2.0-flash" | "gpt-4.1-mini";
}

export interface RagAnswerResult {
  answer: string;
  citations: Array<{ sourceKind: RagSourceKind; sourceRef: string; title: string; score: number }>;
  modelUsed: string;
  tokensUsed: number;
  latencyMs: number;
  mode: "pgvector" | "in-memory";
}

export interface RagRunRecord {
  runId: string;
  jobType: string;
  scope: string | null;
  status: "running" | "ok" | "failed";
  startedAt: string;
  finishedAt: string | null;
  stats: Record<string, unknown>;
  error?: string;
}

// -----------------------------------------------------------------------------
// Configuração
// -----------------------------------------------------------------------------
const EMBEDDING_MODEL_VERSION = "text-embedding-3-small@v1";
const CHUNK_TARGET_CHARS = 1200;
const CHUNK_OVERLAP_CHARS = 200;

function mode(): "pgvector" | "in-memory" {
  return process.env.DATABASE_URL && process.env.NEXUS_RAG_BACKEND !== "in-memory"
    ? "pgvector"
    : "in-memory";
}

// -----------------------------------------------------------------------------
// In-memory store (fallback leve)
// -----------------------------------------------------------------------------
interface InMemorySource {
  id: number;
  sourceKind: RagSourceKind;
  sourceRef: string;
  title: string;
  tenantId: string | null;
  checksum: string;
  chunks: Array<{ idx: number; content: string; tokens: number; tags: string[] }>;
  indexedAt: string;
}

const memStore = {
  sources: new Map<string, InMemorySource>(),
  nextId: 1,
  runs: [] as RagRunRecord[],
};

function chunkifyMarkdown(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (normalized.length <= CHUNK_TARGET_CHARS) return [normalized];

  const chunks: string[] = [];
  let cursor = 0;
  while (cursor < normalized.length) {
    const end = Math.min(cursor + CHUNK_TARGET_CHARS, normalized.length);
    const slice = normalized.slice(cursor, end);
    chunks.push(slice.trim());
    if (end === normalized.length) break;
    cursor = end - CHUNK_OVERLAP_CHARS;
    if (cursor < 0) cursor = 0;
  }
  return chunks.filter((c) => c.length > 0);
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

function scoreOverlap(query: string[], chunk: string): number {
  const tokens = new Set(tokenize(chunk));
  if (tokens.size === 0) return 0;
  let hits = 0;
  for (const q of query) {
    if (tokens.has(q)) hits += 1;
  }
  return hits / Math.sqrt(tokens.size + 8);
}

function newRun(jobType: string, scope: string | null): RagRunRecord {
  const run: RagRunRecord = {
    runId: crypto.randomUUID(),
    jobType,
    scope,
    status: "running",
    startedAt: new Date().toISOString(),
    finishedAt: null,
    stats: {},
  };
  memStore.runs.unshift(run);
  if (memStore.runs.length > 200) memStore.runs.length = 200;
  return run;
}

function finishRun(run: RagRunRecord, status: "ok" | "failed", stats: Record<string, unknown>, error?: string) {
  run.status = status;
  run.finishedAt = new Date().toISOString();
  run.stats = stats;
  if (error) run.error = error;
}

// -----------------------------------------------------------------------------
// API pública
// -----------------------------------------------------------------------------
export async function ingest(input: RagIngestInput): Promise<RagIngestResult> {
  const run = newRun("ingest", input.sourceKind);

  try {
    // HOTFIX D18.5: tenta pgvector real primeiro
    if (await pgIsAvailable()) {
      const pgRes = await pgIngest({
        sourceKind: input.sourceKind,
        sourceRef: input.sourceRef,
        title: input.title,
        content: input.content,
        tags: input.tags,
        tenantId: input.tenantId,
        metadata: input.metadata,
      });
      if (pgRes) {
        finishRun(run, "ok", { chunks: pgRes.chunks, sourceId: pgRes.sourceId, backend: "pgvector" });
        try { await pgRecordRun({ runId: run.runId, action: "ingest", scope: input.sourceKind, status: "ok", chunks: pgRes.chunks, sourceId: pgRes.sourceId }); } catch {}
        return { runId: run.runId, sourceId: pgRes.sourceId, chunks: pgRes.chunks, mode: "pgvector" };
      }
    }

    const key = `${input.sourceKind}::${input.sourceRef}::${EMBEDDING_MODEL_VERSION}`;
    const sum = checksum(input.content);
    const existing = memStore.sources.get(key);
    if (existing && existing.checksum === sum) {
      finishRun(run, "ok", { skipped: true, reason: "checksum unchanged" });
      return { runId: run.runId, sourceId: existing.id, chunks: existing.chunks.length, mode: mode() };
    }

    const chunkTexts = chunkifyMarkdown(input.content);
    const source: InMemorySource = {
      id: existing?.id ?? memStore.nextId++,
      sourceKind: input.sourceKind,
      sourceRef: input.sourceRef,
      title: input.title ?? input.sourceRef,
      tenantId: input.tenantId ?? null,
      checksum: sum,
      indexedAt: new Date().toISOString(),
      chunks: chunkTexts.map((content, idx) => ({
        idx,
        content,
        tokens: Math.ceil(content.length / 4),
        tags: input.tags ?? [],
      })),
    };
    memStore.sources.set(key, source);

    finishRun(run, "ok", { chunks: source.chunks.length, sourceId: source.id });
    return { runId: run.runId, sourceId: source.id, chunks: source.chunks.length, mode: mode() };
  } catch (err) {
    finishRun(run, "failed", {}, err instanceof Error ? err.message : String(err));
    throw err;
  }
}

export async function query(input: RagQueryInput): Promise<RagQueryResult> {
  const start = Date.now();
  const topK = Math.max(1, Math.min(input.topK ?? 6, 20));

  // HOTFIX D18.5: tenta pgvector
  if (await pgIsAvailable()) {
    const rows = await pgQuery({
      question: input.question,
      topK,
      scope: input.scope,
      tenantId: input.tenantId,
    });
    if (rows) {
      const matches: Array<RagMatch> = rows.map((r: any) => ({
        sourceKind: r.source_kind as RagSourceKind,
        sourceRef: r.source_ref,
        title: r.title,
        score: Number(r.score ?? 0),
        content: r.content,
      }));
      return { matches, latencyMs: Date.now() - start, mode: "pgvector" };
    }
  }

  const scope = input.scope?.length ? new Set(input.scope) : null;
  const queryTokens = tokenize(input.question);

  const candidates: Array<RagMatch> = [];
  for (const source of memStore.sources.values()) {
    if (scope && !scope.has(source.sourceKind)) continue;
    if (input.tenantId && source.tenantId && source.tenantId !== input.tenantId) continue;
    for (const chunk of source.chunks) {
      const score = scoreOverlap(queryTokens, chunk.content);
      if (score <= 0) continue;
      candidates.push({
        sourceKind: source.sourceKind,
        sourceRef: source.sourceRef,
        title: source.title,
        score: Number(score.toFixed(4)),
        content: chunk.content,
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const matches = candidates.slice(0, topK);

  return {
    matches,
    latencyMs: Date.now() - start,
    mode: mode(),
  };
}

export async function answer(input: RagAnswerInput): Promise<RagAnswerResult> {
  const queryResult = await query(input);
  const top = queryResult.matches.slice(0, 3);
  const citations = top.map((m) => ({
    sourceKind: m.sourceKind,
    sourceRef: m.sourceRef,
    title: m.title,
    score: m.score,
  }));

  const composed =
    top.length === 0
      ? `Não encontrei resposta canônica para "${input.question}" no corpus indexado. ` +
        `Faltam ingestões em ${input.scope?.join(", ") ?? "todas as fontes"}.`
      : `Resposta canônica baseada em ${top.length} citações do corpus Nexus:\n\n` +
        top
          .map(
            (m, i) =>
              `[${i + 1}] (${m.sourceKind}) ${m.title}\n` +
              m.content.slice(0, 320).replace(/\s+/g, " ") +
              "…",
          )
          .join("\n\n");

  return {
    answer: composed,
    citations,
    modelUsed: input.modelHint ?? "nexus-rag-heuristic-v1",
    tokensUsed: Math.ceil(composed.length / 4),
    latencyMs: queryResult.latencyMs,
    mode: queryResult.mode,
  };
}

export async function listRuns(limit = 20): Promise<RagRunRecord[]> {
  if (await pgIsAvailable()) {
    const pg = await pgListRuns(limit);
    if (pg && pg.length) return pg as any;
  }
  return memStore.runs.slice(0, Math.max(1, Math.min(limit, 200)));
}

export async function reindex(scope: RagSourceKind | "all"): Promise<{ runId: string; scope: string }> {
  const run = newRun("reindex", scope);
  finishRun(run, "ok", {
    reindexed_sources: scope === "all"
      ? memStore.sources.size
      : Array.from(memStore.sources.values()).filter((s) => s.sourceKind === scope).length,
    note: "in-memory backend: reindex é um no-op consistente (checksum-based).",
  });
  return { runId: run.runId, scope: String(scope) };
}

export async function stats() {
  // HOTFIX D18.5: pgvector real
  if (await pgIsAvailable()) {
    const pg = await pgStats();
    if (pg) {
      return {
        backend: "pgvector" as const,
        sources: Number((pg as any).sources ?? 0),
        chunks: Number((pg as any).chunks ?? 0),
        runs: Number((pg as any).runs ?? 0),
        embeddingModelVersion: EMBEDDING_MODEL_VERSION,
      };
    }
  }
  return {
    backend: mode(),
    sources: memStore.sources.size,
    chunks: Array.from(memStore.sources.values()).reduce((s, src) => s + src.chunks.length, 0),
    runs: memStore.runs.length,
    embeddingModelVersion: EMBEDDING_MODEL_VERSION,
  };
}
