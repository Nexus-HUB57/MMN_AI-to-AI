/**
 * Nexus Affil'IA'te · CEO/AI tRPC Router
 *
 * Expoe ao painel admin a operacao do orquestrador autonomo + RAG.
 *
 * @module agentic/ceo-ai/router
 */
import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../../config/trpc";
import {
  CEOOrchestrator,
  ceoSignalSchema,
  decide,
  plan,
  type ExecutionResult,
} from "./orchestrator";
import { CEORAGRetriever, ragQuerySchema } from "./ragRetriever";

// ----------------------------------------------------------------------------
// Adapters minimo viaveis (in-memory MVP).
// Em producao serao trocados por BullMQ + drizzle + Redis reais.
// ----------------------------------------------------------------------------

const inMemoryQueue: Array<{ queue: string; payload: unknown; id: string }> = [];
const inMemoryCrons: Array<{ id: string; data: Record<string, unknown> }> = [];
const inMemoryNotifications: Array<{ channel: string; message: unknown; at: string }> =
  [];
const inMemoryAgents: Array<{ kind: string; payload: unknown; id: string }> = [];
const inMemoryMemoryLog: Array<{ sessionId: string; content: string; tags: string[] }> =
  [];

let counter = 0;
const nextId = (p: string) => `${p}-${Date.now()}-${++counter}`;

const adapters = {
  async enqueueJob(queue: string, payload: unknown) {
    const id = nextId("job");
    inMemoryQueue.push({ queue, payload, id });
    return id;
  },
  async createCron(input: Record<string, unknown>) {
    const id = nextId("cron");
    inMemoryCrons.push({ id, data: input });
    return id;
  },
  async updateCron(id: string, patch: Record<string, unknown>) {
    const idx = inMemoryCrons.findIndex((c) => c.id === id);
    if (idx >= 0) inMemoryCrons[idx].data = { ...inMemoryCrons[idx].data, ...patch };
  },
  async publishContent(target: string, content: unknown) {
    const id = nextId("content");
    inMemoryQueue.push({ queue: target, payload: content, id });
    return id;
  },
  async notifyOperator(channel: string, message: unknown) {
    inMemoryNotifications.push({
      channel,
      message,
      at: new Date().toISOString(),
    });
  },
  async spawnAgent(kind: string, payload: unknown) {
    const id = nextId("agent");
    inMemoryAgents.push({ kind, payload, id });
    return id;
  },
};

const memory = {
  remember(e: { sessionId: string; memoryType: string; content: string; tags?: string[]; importance?: number }) {
    inMemoryMemoryLog.push({
      sessionId: e.sessionId,
      content: e.content,
      tags: e.tags ?? [],
    });
  },
};

// ----------------------------------------------------------------------------
// RAG store minimo (in-memory, vetor por hashing tokenizado)
// ----------------------------------------------------------------------------

class TinyInMemoryVectorStore {
  private docs = new Map<string, { content: string; metadata: Record<string, unknown> }>();
  private nextDocId = 1;

  async addDocuments(
    docs: Array<{ id?: string; content: string; metadata?: Record<string, unknown> }>,
  ) {
    const ids: string[] = [];
    for (const d of docs) {
      const id = d.id ?? `doc-${this.nextDocId++}`;
      this.docs.set(id, { content: d.content, metadata: d.metadata ?? {} });
      ids.push(id);
    }
    return ids;
  }

  async similaritySearchWithScore(query: string, k = 5) {
    const qTokens = this.tokenize(query);
    const out: Array<{ id: string; content: string; metadata: Record<string, unknown>; score: number }> =
      [];
    for (const [id, doc] of this.docs.entries()) {
      const dTokens = this.tokenize(doc.content);
      const score = this.jaccard(qTokens, dTokens);
      if (score > 0) {
        out.push({ id, content: doc.content, metadata: doc.metadata, score });
      }
    }
    out.sort((a, b) => b.score - a.score);
    return out.slice(0, k);
  }

  private tokenize(s: string) {
    return new Set(
      s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(/[^a-z0-9]+/i)
        .filter((t) => t.length > 2),
    );
  }
  private jaccard(a: Set<string>, b: Set<string>) {
    const inter = [...a].filter((x) => b.has(x)).length;
    const uni = new Set([...a, ...b]).size;
    return uni === 0 ? 0 : inter / uni;
  }
}

const tinyVector = new TinyInMemoryVectorStore();
const rag = new CEORAGRetriever(tinyVector);

// Seed inicial de conhecimento canonico (poderia vir do filesystem em prod)
void rag.index([
  {
    content:
      "CEO/AI Nexus tem autonomia plena delegada pelo socio fundador. Direcionamento do socio prevalece sempre. Padrao: pt-BR, profissional, revolucionario.",
    source: "ceo-ai",
    tags: ["mandato", "governanca"],
  },
  {
    content:
      "Roadmap revolucionario: M1 A2A Handshake, M2 Skill Marketplace, M3 Judge Federado, M4 AI Auction, M5 Live Mesh, M6 Academia Viva.",
    source: "ceo-ai",
    tags: ["roadmap"],
  },
  {
    content:
      "Academia da Nexus tem 4 trilhas: Fundamental, Agente, Master, Elite. 54 lessons no catalogo, 100% com apostila MD+PDF.",
    source: "academia",
    tags: ["catalogo", "trilhas"],
  },
  {
    content:
      "Personas oficiais: Ive Nexus (host estrategico, abertura+CTA) e Nexus Alencar (co-host tecnico, demo+checklist).",
    source: "academia",
    tags: ["personas"],
  },
  {
    content:
      "SHO governa decisoes: autoaprovacao quando confianca>=0.7 e risco<=0.3. Judge bloqueia quando risco>0.8.",
    source: "judge",
    tags: ["sho", "governanca"],
  },
]);

// ----------------------------------------------------------------------------
// Orchestrator + Router
// ----------------------------------------------------------------------------

const orchestrator = new CEOOrchestrator(adapters as any, memory as any, {
  confidenceThreshold: 0.6,
  riskLimit: 0.3,
});

export const ceoAiRouter = router({
  // status do CEO/AI
  status: publicProcedure.query(() => ({
    ok: true,
    service: "ceo-ai-orchestrator",
    timestamp: new Date().toISOString(),
    counters: {
      queueJobs: inMemoryQueue.length,
      crons: inMemoryCrons.length,
      notifications: inMemoryNotifications.length,
      agents: inMemoryAgents.length,
      memories: inMemoryMemoryLog.length,
      indexedDocs: 5,
    },
    mandate: {
      ceoAi: "Nexus Root Orchestrator",
      autonomyScope: "full",
      decisionsMode: "auto-with-human-override",
    },
  })),

  // simulacao: plan + decide sem executar
  planSignal: adminProcedure
    .input(ceoSignalSchema)
    .mutation(({ input }) => {
      const action = plan(input);
      const decision = decide(action, {
        confidenceThreshold: 0.6,
        riskLimit: 0.3,
      });
      return { ok: true, action, decision };
    }),

  // pipeline completo: plan -> decide -> execute -> learn
  handleSignal: adminProcedure
    .input(ceoSignalSchema)
    .mutation(async ({ input }): Promise<{ ok: true; result: ExecutionResult }> => {
      const result = await orchestrator.handle(input);
      return { ok: true, result };
    }),

  // RAG: busca semantica
  ragQuery: adminProcedure.input(ragQuerySchema).query(async ({ input }) => {
    const results = await rag.query(input);
    return { ok: true, count: results.length, results };
  }),

  // RAG: indexar novo documento
  ragIndex: adminProcedure
    .input(
      z.object({
        content: z.string().min(2),
        source: z.string().min(1),
        tags: z.array(z.string()).optional(),
        metadata: z.record(z.unknown()).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const ids = await rag.index([input]);
      return { ok: true, ids };
    }),

  // contexto compacto para downstream
  ragContext: adminProcedure
    .input(z.object({ query: z.string().min(2), topK: z.number().int().min(1).max(20).default(5) }))
    .query(async ({ input }) => {
      const ctx = await rag.buildContext(input.query, input.topK);
      return { ok: true, context: ctx };
    }),

  // logs recentes do orquestrador
  recentLog: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(200).default(20) }))
    .query(({ input }) => ({
      ok: true,
      memories: inMemoryMemoryLog.slice(-input.limit),
      queue: inMemoryQueue.slice(-input.limit),
      notifications: inMemoryNotifications.slice(-input.limit),
    })),
});
