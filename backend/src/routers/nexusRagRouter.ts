/**
 * nexusRagRouter.ts
 * ==================
 * tRPC router para o serviço Nexus RAG (Retrieval-Augmented Generation).
 *
 * Endpoints:
 *  - stats   (público)    — totais de sources/chunks/runs + backend ativo
 *  - query   (protected)  — busca lexical (top-K)
 *  - answer  (protected)  — resposta extractiva com citações
 *  - ingest  (admin)      — adiciona/atualiza fonte canônica
 *  - reindex (admin)      — reprocessa embeddings de um scope
 *  - runs    (admin)      — auditoria das execuções
 *
 * Pareado com:
 *  - backend/src/services/nexusRagService.ts
 *  - backend/src/services/nexusRagPgRepository.ts (M9 Ravi)
 *
 * @module routers/nexusRagRouter
 */
import { z } from "zod";
import {
  adminProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "../config/trpc";
import {
  ingest,
  query,
  answer,
  reindex,
  stats,
  listRuns,
} from "../services/nexusRagService";

const sourceKindSchema = z.enum([
  "academia",
  "lab",
  "lib",
  "ebook",
  "doc",
  "custom",
]);

export const nexusRagRouter = router({
  /** Status público — exibido no /admin/governance e em tools */
  stats: publicProcedure.query(async () => stats()),

  /** Query semântica (protected) */
  query: protectedProcedure
    .input(
      z.object({
        question: z.string().min(2).max(2048),
        topK: z.number().int().min(1).max(20).default(5),
        scope: z.array(sourceKindSchema).optional(),
      }),
    )
    .query(async ({ input }) => query(input)),

  /** Answer composto com citações (protected) */
  answer: protectedProcedure
    .input(
      z.object({
        question: z.string().min(2).max(2048),
        topK: z.number().int().min(1).max(20).default(5),
        scope: z.array(sourceKindSchema).optional(),
      }),
    )
    .query(async ({ input }) => answer(input)),

  /** Ingest de fonte canônica (admin) */
  ingest: adminProcedure
    .input(
      z.object({
        kind: sourceKindSchema,
        ref: z.string().min(1).max(256),
        title: z.string().min(1).max(512),
        content: z.string().min(20).max(200_000),
      }),
    )
    .mutation(async ({ input }) => ingest(input)),

  /** Reindex de scope (admin) */
  reindex: adminProcedure
    .input(
      z
        .object({
          scope: z.union([sourceKindSchema, z.array(sourceKindSchema)]).optional(),
        })
        .default({}),
    )
    .mutation(async ({ input }) => reindex(input.scope)),

  /** Audit runs (admin) */
  runs: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(200).default(50) }).default({ limit: 50 }))
    .query(async ({ input }) => listRuns(input.limit)),
});
