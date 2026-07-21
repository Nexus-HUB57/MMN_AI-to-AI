import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../config/trpc";
import { getDb } from "../../../database/schemas/db";
import { sql } from "drizzle-orm";

// D22 — RAG Router (FTS pt + trigram fuzzy)
// Busca semântica sobre nexus_rag.chunks via tsvector português + pg_trgm.

const SearchInput = z.object({
  query: z.string().min(2).max(500),
  topK: z.number().int().min(1).max(20).default(5),
  sourceTypes: z.array(z.enum(["release_note","manual","migration","code","db_snapshot"])).optional(),
  caller: z.string().default("api"),
});

export const ragRouter = router({
  // 1) Busca semântica (FTS) — uso público para CMO/AI orquestrar
  search: publicProcedure
    .input(SearchInput)
    .query(async ({ input }) => {
      const db = getDb();
      const start = Date.now();
      const sourceFilter = input.sourceTypes && input.sourceTypes.length > 0
        ? sql`AND d.source_type = ANY(${input.sourceTypes}::text[])`
        : sql``;
      const result = await db.execute(sql`
        WITH q AS (SELECT plainto_tsquery('portuguese', ${input.query}) AS query)
        SELECT
          c.id AS chunk_id,
          c.content,
          c.chunk_index,
          d.id AS document_id,
          d.title,
          d.source_type,
          d.source_path,
          ROUND(ts_rank(c.content_tsv, q.query)::numeric, 4) AS rank,
          ROUND(similarity(c.content, ${input.query})::numeric, 4) AS fuzzy_sim
        FROM nexus_rag.chunks c
        JOIN nexus_rag.documents d ON d.id = c.document_id
        CROSS JOIN q
        WHERE c.content_tsv @@ q.query
        ${sourceFilter}
        ORDER BY rank DESC, fuzzy_sim DESC
        LIMIT ${input.topK};
      `);
      const latencyMs = Date.now() - start;
      const rows: any[] = (result as any).rows || result;
      const chunkIds = rows.map((r:any) => r.chunk_id);
      // Audit log
      try {
        await db.execute(sql`
          INSERT INTO nexus_rag.queries (query_text, results_count, top_chunk_ids, caller, latency_ms)
          VALUES (${input.query}, ${rows.length}, ${chunkIds}::bigint[], ${input.caller}, ${latencyMs})
        `);
      } catch (e) {/*non-blocking*/}
      return { query: input.query, latencyMs, count: rows.length, results: rows };
    }),

  // 2) Estatísticas do índice (transparência)
  stats: publicProcedure.query(async () => {
    const db = getDb();
    const r = await db.execute(sql`
      SELECT
        (SELECT count(*) FROM nexus_rag.documents) AS total_documents,
        (SELECT count(*) FROM nexus_rag.chunks) AS total_chunks,
        (SELECT ROUND(AVG(LENGTH(content)))::int FROM nexus_rag.chunks) AS avg_chunk_chars,
        (SELECT count(*) FROM nexus_rag.queries WHERE created_at > NOW() - INTERVAL '24 hours') AS queries_24h,
        (SELECT COALESCE(ROUND(AVG(latency_ms))::int, 0) FROM nexus_rag.queries WHERE created_at > NOW() - INTERVAL '24 hours') AS avg_latency_ms_24h
    `);
    const row = ((r as any).rows || r)[0];
    return row;
  }),

  // 3) Documentos indexados
  listDocuments: publicProcedure.query(async () => {
    const db = getDb();
    const r = await db.execute(sql`
      SELECT id, source_type, title, source_path, total_chunks, ingested_at, updated_at
      FROM nexus_rag.documents
      ORDER BY updated_at DESC
    `);
    return (r as any).rows || r;
  }),

  // 4) Reindexação (admin)
  reindexAll: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Trigger externo: marca todos hashes como vazios pra forçar re-ingest no próximo run
      const db = getDb();
      await db.execute(sql`UPDATE nexus_rag.documents SET content_hash = ''`);
      return { ok: true, msg: 'Hashes resetados. Rode bash /root/d20/d22_rag_v3.sh para reingerir.' };
    }),
});

export type RagRouter = typeof ragRouter;
