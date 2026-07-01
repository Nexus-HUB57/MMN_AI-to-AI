/**
 * nexusRagRouter.ts
 * =================
 * Expõe a camada RAG (Retrieval-Augmented Generation) do Nexus Affil'IA'te
 * sob `/api/trpc/nexusRag.*`.
 *
 * Procedures:
 *   - publicProcedure  · stats              — diagnóstico do backend (in-memory|pgvector)
 *   - protectedProcedure · query            — busca canônica em todo o corpus
 *   - protectedProcedure · answer           — query + composição com citações
 *   - adminProcedure    · ingest            — adiciona/atualiza fonte canônica
 *   - adminProcedure    · reindex           — força reindexação por scope
 *   - adminProcedure    · runs              — auditoria de execuções
 *
 * Consumidores típicos:
 *   - frontend/src/pages/LabChatbot.tsx           (answer)
 *   - frontend/src/components/AcademiaNextSuggested.tsx (query scope=academia)
 *   - backend/src/agentic/skills/judgeRevisor.ts  (query scope=lib,academia)
 *   - backend/src/workers/ragIngestWorker.ts      (ingest)
 */

import { z } from "zod";
import {
  router,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "../config/trpc";
import {
  ingest,
  query,
  answer,
  reindex,
  listRuns,
  stats,
} from "../services/nexusRagService";

const sourceKindSchema = z.enum([
  "academia",
  "lab",
  "lib",
  "ebook",
  "telemetry",
  "skill-manifest",
]);

const reindexScopeSchema = z.enum([
  "academia",
  "lab",
  "lib",
  "ebook",
  "telemetry",
  "skill-manifest",
  "all",
]);

export const nexusRagRouter = router({
  /**
   * Diagnóstico básico do backend RAG (público para health checks).
   */
  stats: publicProcedure.query(() => stats()),

  /**
   * Busca canônica.
   */
  query: protectedProcedure
    .input(
      z.object({
        question: z.string().min(3).max(2000),
        topK: z.number().int().min(1).max(20).optional(),
        scope: z.array(sourceKindSchema).optional(),
        tenantId: z.string().optional(),
      }),
    )
    .query(async ({ input }) => query(input)),

  /**
   * Query + composição.
   */
  answer: protectedProcedure
    .input(
      z.object({
        question: z.string().min(3).max(2000),
        topK: z.number().int().min(1).max(20).optional(),
        scope: z.array(sourceKindSchema).optional(),
        tenantId: z.string().optional(),
        modelHint: z.enum(["gemini-2.0-flash", "gpt-4.1-mini"]).optional(),
      }),
    )
    .query(async ({ input }) => answer(input)),

  /**
   * Ingestão de fonte canônica.
   */
  ingest: adminProcedure
    .input(
      z.object({
        sourceKind: sourceKindSchema,
        sourceRef: z.string().min(1).max(512),
        title: z.string().max(512).optional(),
        content: z.string().min(1),
        tags: z.array(z.string()).optional(),
        tenantId: z.string().optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .mutation(async ({ input }) => ingest(input)),

  /**
   * Reindexação manual (também é chamada por cron noturno).
   */
  reindex: adminProcedure
    .input(z.object({ scope: reindexScopeSchema }))
    .mutation(async ({ input }) => reindex(input.scope)),

  /**
   * Auditoria das execuções RAG.
   */
  runs: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(200).optional() }).optional())
    .query(async ({ input }) => listRuns(input?.limit ?? 20)),
});

export type NexusRagRouter = typeof nexusRagRouter;
