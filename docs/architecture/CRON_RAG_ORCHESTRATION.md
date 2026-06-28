# Arquitetura Cron-Job + RAG · Camada de Orquestração Canônica

> **Autor:** CTO Nexus Affil'IA'te
> **Status:** Decisão de arquitetura (ADR-001) — *aprovada para implementação faseada*
> **Última revisão:** 2026-06-28

---

## 1. Por que Cron + RAG é a coluna vertebral do Nexus

O Nexus Affil'IA'te não é uma plataforma de marketing de afiliados convencional. É um **organismo de IA agêntica** que precisa simultaneamente:

1. **Aprender continuamente** — ingerir cursos da AcademIA, ebooks do Marketplace Nexus, telemetria dos agentes, comissões, eventos de rede e regulatório (LGPD, Hotmart, Mercado Pago, etc.).
2. **Executar autonomamente** — disparar campanhas WhatsApp/Email, sortear ebooks de packs, reconciliar comissões, sincronizar marketplaces, treinar skills, aprovar/julgar sugestões via SHO.
3. **Recuperar contexto** — responder com precisão a perguntas dos afiliados (Lab Chatbot), recomendar próxima aula, sugerir produto certo para o público, prever churn, calcular CAC por trilha.

Sem **Cron** o sistema vira reativo (depende de input humano). Sem **RAG** o sistema vira amnésico (responde sem fundamento). Juntos, eles transformam a Nexus em um **HUB tecnológico autônomo** capaz de operar 24×7 com fundamento em conhecimento canônico.

---

## 2. Decisão arquitetural (ADR-001)

**Decisão:** adotar uma camada **Cron-Job Orchestration Layer (CJOL)** que aciona pipelines RAG sobre todo o corpus conhecido do Nexus (AcademIA + Lib-Nexus + Lab-Nexus + Ebooks + telemetria), expondo APIs uniformes para os agentes (`marketingAgent`, `judgeRevisor`, `analyticsReporter`, etc.) e para o Lab Chatbot.

**Critérios atendidos:**

| Critério | Como é atendido |
|---|---|
| Idempotência | Todo cron-job grava `cron_runs` com `run_id` único; jobs reentrantes são no-op. |
| Observabilidade | `cronAlerts`/`cronSlaIndicators` já presentes — estendidos com métricas de RAG (hit_rate, recall@k, latência). |
| Reprodutibilidade | Embeddings versionados (`embedding_model_version`); reindexação completa em <30min. |
| Custo controlado | Embeddings em lote noturno; consultas em tempo real só pagam custo de retrieval (vetorial). |
| Multi-tenant | Namespace por `tenantId` no índice vetorial; isolamento garantido por nível de schema. |
| LGPD | PII nunca é embedding-ada — só conteúdo canônico (cursos, ebooks, docs públicos) e telemetria anonimizada. |

---

## 3. Topologia dos componentes

```
┌────────────────────────────────────────────────────────────────────────┐
│                       NEXUS ORCHESTRATION LAYER                         │
│                                                                         │
│  ┌──────────────────────┐        ┌───────────────────────────────────┐ │
│  │  Cron Dispatcher     │───────▶│  BullMQ Queues (Redis)            │ │
│  │  (cronScheduler.ts)  │        │   · rag-ingest                    │ │
│  │  · cronAlerts.ts     │        │   · rag-reindex                   │ │
│  │  · slaIndicators.ts  │        │   · rag-query-warm                │ │
│  └──────────┬───────────┘        │   · marketplace-sync              │ │
│             │ TRIGGERS           │   · commission-reconcile          │ │
│             ▼                    │   · content-publisher             │ │
│  ┌──────────────────────┐        │   · academia-sync                 │ │
│  │  CJOL Router         │        │   · drawing-replay (audit)        │ │
│  │  (cronRouter.ts)     │        └───────────────────────────────────┘ │
│  └──────────────────────┘                          │                    │
│             │ produces                              │ consumed by       │
│             ▼                                       ▼                    │
│  ┌──────────────────────────────────────────────────────────────┐      │
│  │              RAG SERVICE (nexusRagService.ts)                │      │
│  │                                                              │      │
│  │   ingest()  → chunker → embedder → vector store              │      │
│  │   query()   → retriever (hybrid: BM25 + dense) → reranker    │      │
│  │   answer()  → context window → LLM (Genkit/OpenAI)           │      │
│  └────────────┬───────────────────────────────┬─────────────────┘      │
│               │                               │                          │
│               ▼                               ▼                          │
│  ┌─────────────────────────┐     ┌─────────────────────────────┐       │
│  │  pgvector / Postgres    │     │  Object storage (S3-like)   │       │
│  │  · nexus_rag_chunks     │     │  · raw MDs / PDFs / HTMLs   │       │
│  │  · nexus_rag_indices    │     │  · transcrições de vídeos   │       │
│  │  · nexus_rag_runs       │     │  · snapshots de telemetria  │       │
│  └─────────────────────────┘     └─────────────────────────────┘       │
└────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                ┌───────────────────────────────┐
                │  CONSUMIDORES (lado superior) │
                │  · LabChatbot.tsx              │
                │  · marketingAgent              │
                │  · judgeRevisor                │
                │  · analyticsReporter           │
                │  · MarketplaceEbooks (recsys)  │
                │  · AcademiaHub (next lesson)   │
                └───────────────────────────────┘
```

---

## 4. Fontes (corpus canônico)

| Fonte | Tabela / Origem | Cadência ingestão | Reindexação |
|---|---|---|---|
| AcademIA (`AcademIA/**/*.md`) | filesystem → `academia_lessons` | event-driven (push) + nightly | full diário 03:30 BRT |
| Lab-Nexus tools / prompts | `AcademIA/Lab-Nexus/` | event-driven | full diário 03:35 BRT |
| Lib-Nexus knowledge base | `AcademIA/Lib-Nexus/` | event-driven | full diário 03:40 BRT |
| Ebooks Marketplace (132) | `marketplace_ebooks` + `docs/ebooks_markdown` | semanal (domingo 02:00 BRT) | full semanal |
| Skill manifest | `AcademIA/sync/skill-manifest.json` | event-driven (CI hook) | full a cada PR mergeada |
| Roteiros de produção | `AcademIA/producao/roteiros/` | event-driven | full diário 03:45 BRT |
| Telemetria agêntica | `agent_vitals`, `brain_pulses`, `network_telemetry` | streaming (5 min) | rolling window 30d |
| Comissões/pedidos | `orders`, `commissions`, `marketplace_orders` | streaming (1 min) | rolling window 90d |
| Auditoria de packs | `marketplace_pack_drawings` | streaming (event) | imutável |

---

## 5. Cadência canônica de Cron Jobs

```
03:00 BRT  · cron.nightly.health-check          (smoke /health, /trpc/*)
03:15 BRT  · cron.nightly.commission-reconcile  (legado ↔ novo)
03:30 BRT  · cron.nightly.rag-reindex.academia
03:35 BRT  · cron.nightly.rag-reindex.lab-nexus
03:40 BRT  · cron.nightly.rag-reindex.lib-nexus
03:45 BRT  · cron.nightly.rag-reindex.producao
04:00 BRT  · cron.nightly.marketplace-sync      (ML/Shopee/Hotmart)
04:30 BRT  · cron.nightly.skill-manifest-audit  (lint do manifesto)
05:00 BRT  · cron.nightly.kpi-snapshot          (dashboard daily)

Domingo 02:00  · cron.weekly.rag-reindex.ebooks
Domingo 06:00  · cron.weekly.cohort-analysis    (churn, LTV, CAC)

A cada 5 min  · cron.realtime.telemetry-rag.append
A cada 15 min · cron.realtime.youtube-sync
A cada 1 min  · cron.realtime.order-stream
A cada 30s   · cron.realtime.alerts-evaluator
```

---

## 6. Modelo de dados RAG (pgvector — recomendado)

Recomendação como CTO: **pgvector** (em vez de Qdrant/Weaviate) porque o sistema já roda em PostgreSQL e isso elimina uma stack inteira. Performance é mais que suficiente para o volume previsto (≤ 1M chunks em 1 ano).

```sql
-- migration: 0011_nexus_rag.sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS nexus_rag_sources (
  id           SERIAL PRIMARY KEY,
  source_kind  VARCHAR(32) NOT NULL,  -- 'academia' | 'lab' | 'lib' | 'ebook' | 'telemetry'
  source_ref   VARCHAR(512) NOT NULL, -- ex.: 'AcademIA/cursos/agente/00-...'
  title        VARCHAR(512),
  metadata     JSONB DEFAULT '{}'::jsonb,
  checksum     VARCHAR(64) NOT NULL,
  embedding_model_version VARCHAR(64) NOT NULL,
  indexed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(source_kind, source_ref, embedding_model_version)
);

CREATE TABLE IF NOT EXISTS nexus_rag_chunks (
  id           BIGSERIAL PRIMARY KEY,
  source_id    INTEGER NOT NULL REFERENCES nexus_rag_sources(id) ON DELETE CASCADE,
  chunk_idx    INTEGER NOT NULL,
  content      TEXT NOT NULL,
  embedding    vector(1536),  -- text-embedding-3-small
  tokens       INTEGER,
  tags         TEXT[],
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX nexus_rag_chunks_source_idx ON nexus_rag_chunks(source_id);
CREATE INDEX nexus_rag_chunks_embedding_idx
  ON nexus_rag_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE TABLE IF NOT EXISTS nexus_rag_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type      VARCHAR(64) NOT NULL,  -- 'ingest', 'reindex', 'query-warm'
  scope         VARCHAR(64),           -- 'academia', 'ebooks', ...
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at   TIMESTAMPTZ,
  status        VARCHAR(20) NOT NULL DEFAULT 'running',
  stats         JSONB DEFAULT '{}'::jsonb,
  error         TEXT
);
CREATE INDEX nexus_rag_runs_job_idx ON nexus_rag_runs(job_type, started_at DESC);
```

---

## 7. Contratos de API

Os contratos abaixo serão expostos via tRPC sob o namespace `nexusRag.*`.

```ts
nexusRag.ingest(input: {
  sourceKind: 'academia' | 'lab' | 'lib' | 'ebook' | 'telemetry';
  sourceRef: string;                  // path ou ID
  content: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}) => { runId: string; chunks: number };

nexusRag.reindex(input: {
  scope: 'academia' | 'lab' | 'lib' | 'ebook' | 'all';
}) => { runId: string };

nexusRag.query(input: {
  question: string;
  topK?: number;                      // default 6
  scope?: Array<'academia' | 'lab' | 'lib' | 'ebook'>;
  tenantId?: string;
}) => {
  matches: Array<{
    sourceKind: string;
    sourceRef: string;
    title: string;
    score: number;
    content: string;
  }>;
  latencyMs: number;
};

nexusRag.answer(input: {
  question: string;
  scope?: Array<'academia' | 'lab' | 'lib' | 'ebook'>;
  tenantId?: string;
  modelHint?: 'gemini-2.0-flash' | 'gpt-4.1-mini';
}) => {
  answer: string;
  citations: Array<{ sourceRef: string; title: string; score: number }>;
  modelUsed: string;
  tokensUsed: number;
};

nexusRag.runs(input: { limit?: number }) => Array<{
  runId: string; jobType: string; scope: string;
  status: string; startedAt: string; finishedAt: string | null; stats: Record<string, unknown>;
}>;
```

---

## 8. Mapa de consumidores (quem usa o RAG)

| Consumidor | Tipo | Como chama |
|---|---|---|
| `LabChatbot.tsx` | UI | `nexusRag.answer({ scope: ['lab','lib','academia'] })` |
| `marketingAgent` | agente | `nexusRag.query({ scope: ['lab','lib'] })` antes de gerar plano de campanha |
| `judgeRevisor` | agente | `nexusRag.query({ scope: ['lib','academia'] })` para fundamentar veredito |
| `analyticsReporter` | agente | `nexusRag.query({ scope: ['telemetry'] })` para correlacionar métricas com explicações |
| `MarketplaceEbooks` (vitrine) | UI | `nexusRag.query({ scope: ['ebook'] })` para "ebooks que você ainda não leu sobre …" |
| `AcademiaHub` (next lesson) | UI | `nexusRag.answer({ scope: ['academia'] })` para sugestão personalizada |
| `AdminAcademiaAnalytics` | admin | `nexusRag.runs()` para auditar reindexações |

---

## 9. Faseamento da entrega (mapa do CTO)

### Fase 1 — Foundation (✅ já entregue na branch atual)
- Migration `0010_marketplace_user_library.sql`
- Catálogo Marketplace publicado (132 HTML + 132 capas + 132 PDFs placeholder)
- Ingestão MD → `data/academia-ead-overrides.json` (169 lições)
- Scripts canônicos em `scripts/`

### Fase 2 — RAG Foundation (próximo sprint)
- Migration `0011_nexus_rag.sql` (pgvector)
- Service `backend/src/services/nexusRagService.ts`
- Router `backend/src/routers/nexusRagRouter.ts` (5 procedures)
- Worker `backend/src/workers/ragIngestWorker.ts`
- Worker `backend/src/workers/ragReindexWorker.ts`

### Fase 3 — Wire-up
- Bind cron entries em `cronScheduler.ts` → emit BullMQ jobs
- Conectar `LabChatbot.tsx` ao `nexusRag.answer`
- Conectar `marketingAgent.ts` ao `nexusRag.query`

### Fase 4 — Reranking + Hybrid Search
- Adicionar BM25 (Postgres FTS já configurada em `academia_lessons.search_vec`)
- Reranker via cross-encoder leve (apenas para top-50 → top-6)

### Fase 5 — Multi-tenant + LGPD
- Namespace por `tenantId` em `nexus_rag_chunks.metadata`
- Filtro de PII na ingestão (regex de CPF, email, telefone)
- Retention policy: telemetria com TTL 30d

---

## 10. KPIs operacionais (CTO dashboard)

| KPI | Meta |
|---|---|
| `rag.query.p95_latency_ms` | ≤ 350 ms |
| `rag.answer.p95_latency_ms` | ≤ 1500 ms |
| `rag.recall_at_6` | ≥ 0.82 |
| `cron.success_rate` | ≥ 99.0% |
| `rag.cost_per_1k_queries` | ≤ US$ 0.05 |
| `rag.daily_ingest_lag_minutes` | ≤ 10 |
| `lab_chatbot.csat` | ≥ 4.5/5 |

---

## 11. Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Custo OpenAI/Gemini explodir | Média | Alto | Cache de embeddings + dedup por checksum |
| Drift entre AcademIA (MD) e DB | Média | Médio | Cron diário 03:30 + checksum em `nexus_rag_sources` |
| Vazamento de PII em chunks | Baixa | Crítico | Regex filter + revisão automática no worker de ingest |
| pgvector lento em alta carga | Baixa (≤ 1M chunks) | Médio | Index `ivfflat`; migrar para HNSW se >5M |
| Sobrecarga de cron noturno | Baixa | Médio | Janela escalonada (03:30→04:30) + concurrency=2 no worker |

---

## 12. Próxima decisão pendente do C-level

- ✅ Aprovado uso de **pgvector** (vs Qdrant) — decisão do CTO, validada pela economia de stack.
- ⏳ Pendente: aprovar **modelo de embedding canônico**.
  Recomendação CTO: `text-embedding-3-small` (1536d, US$ 0.02/1M tokens) — melhor custo-benefício para PT-BR.
- ⏳ Pendente: aprovar **modelo de geração canônico** para `nexusRag.answer`.
  Recomendação CTO: `gemini-2.0-flash` (default), com fallback `gpt-4.1-mini` quando `tokensUsed > 4k`.
- ⏳ Pendente: aprovar **multi-tenant strategy** — por `tenantId` em coluna ou por schema separado?
  Recomendação CTO: começar por coluna (`metadata->>'tenantId'`), migrar para schema separado quando >50 tenants.

---

**Assinatura:** *CTO Nexus Affil'IA'te — implementação faseada autorizada.*
