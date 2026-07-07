/**
 * Nexus Affil'IA'te · CEO/AI RAG Retriever
 *
 * Camada de Retrieval-Augmented Generation usada pelo CEO/AI para:
 *   - lembrar decisoes passadas (episodic memory)
 *   - consultar conhecimento canonico (Academia, Manual Editorial, Roadmap)
 *   - alimentar agentes downstream com contexto enxuto e tipado
 *
 * Atua sobre o `VectorStore` ja existente em
 * `backend/src/integrations/langchain/retriever-adapter.ts`.
 *
 * @module agentic/ceo-ai/ragRetriever
 */
import { z } from "zod";

// ----------------------------------------------------------------------------
// Schemas
// ----------------------------------------------------------------------------

export const ragQuerySchema = z.object({
  query: z.string().min(2).max(2000),
  scope: z
    .enum([
      "academia",
      "ceo-decisions",
      "marketplace",
      "judge-history",
      "all",
    ])
    .default("all"),
  topK: z.number().int().min(1).max(50).default(5),
  minScore: z.number().min(0).max(1).default(0.15),
  filters: z.record(z.string()).optional(),
});

export type RAGQuery = z.infer<typeof ragQuerySchema>;

export const ragResultSchema = z.object({
  id: z.string(),
  content: z.string(),
  score: z.number(),
  source: z.string(),
  metadata: z.record(z.unknown()).default({}),
});

export type RAGResult = z.infer<typeof ragResultSchema>;

// ----------------------------------------------------------------------------
// Adapter de Vector Store (compatibilidade com retriever-adapter)
// ----------------------------------------------------------------------------

export interface VectorStoreLite {
  addDocuments(
    docs: Array<{ id?: string; content: string; metadata?: Record<string, unknown> }>,
  ): Promise<string[]>;
  similaritySearchWithScore(
    query: string,
    k?: number,
  ): Promise<
    Array<{ id?: string; content: string; metadata?: Record<string, unknown>; score: number }>
  >;
}

// ----------------------------------------------------------------------------
// Retriever
// ----------------------------------------------------------------------------

export class CEORAGRetriever {
  constructor(private vector: VectorStoreLite) {}

  /**
   * Indexa documento canonico (texto + metadata) para uso futuro do CEO/AI.
   */
  async index(
    docs: Array<{
      id?: string;
      content: string;
      source: string;
      tags?: string[];
      metadata?: Record<string, unknown>;
    }>,
  ): Promise<string[]> {
    const normalized = docs.map((d) => ({
      id: d.id,
      content: d.content,
      metadata: {
        source: d.source,
        tags: d.tags ?? [],
        indexedAt: new Date().toISOString(),
        ...d.metadata,
      },
    }));
    return this.vector.addDocuments(normalized);
  }

  /**
   * Busca semantica com filtro de scope.
   */
  async query(input: RAGQuery): Promise<RAGResult[]> {
    const parsed = ragQuerySchema.parse(input);
    const raw = await this.vector.similaritySearchWithScore(
      parsed.query,
      parsed.topK * 2,
    );

    const filtered = raw
      .map((r, idx) => ({
        id: r.id ?? `rag-${idx}`,
        content: r.content,
        score: r.score,
        source: String(r.metadata?.source ?? "unknown"),
        metadata: r.metadata ?? {},
      }))
      .filter((r) => {
        if (r.score < parsed.minScore) return false;
        if (parsed.scope !== "all") {
          if (parsed.scope === "academia" && !r.source.startsWith("academia"))
            return false;
          if (parsed.scope === "ceo-decisions" && r.source !== "ceo-ai")
            return false;
          if (
            parsed.scope === "marketplace" &&
            !r.source.startsWith("marketplace")
          )
            return false;
          if (
            parsed.scope === "judge-history" &&
            !r.source.startsWith("judge")
          )
            return false;
        }
        if (parsed.filters) {
          for (const [k, v] of Object.entries(parsed.filters)) {
            if (String(r.metadata?.[k] ?? "") !== v) return false;
          }
        }
        return true;
      })
      .slice(0, parsed.topK);

    return filtered.map((r) => ragResultSchema.parse(r));
  }

  /**
   * Monta contexto compacto para prompts dos agentes.
   * Junta os top-K resultados em um bloco markdown enxuto.
   */
  async buildContext(query: string, topK = 5): Promise<string> {
    const results = await this.query({
      query,
      scope: "all",
      topK,
      minScore: 0.1,
    });
    if (!results.length) return "";
    const blocks = results.map(
      (r, i) =>
        `[#${i + 1}] (${r.source} · score ${r.score.toFixed(2)})\n${r.content}`,
    );
    return ["### Contexto recuperado pelo CEO/AI", ...blocks].join("\n\n");
  }
}
