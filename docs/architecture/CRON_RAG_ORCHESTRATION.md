# ADR-001 · Cron + RAG · Orquestração canônica Nexus Affil'IA'te

**Status**: aprovado pelo CTO (Ravi)
**Data**: 2026-06-28
**Owners**: Ravi (CTO), time backend Nexus

## 1. Contexto

A plataforma Nexus Affil'IA'te precisa orquestrar três fluxos contínuos:
1. **Sincronização de fontes canônicas** (AcademIA, Lab Nexus, Lib Nexus, Marketplace, telemetria de skills).
2. **Recuperação contextual** para o Lab Chatbot e agentes (judgeRevisor, marketingAgent, etc.).
3. **Tarefas operacionais recorrentes** (reconciliação financeira, smoke tests, KPI snapshots).

Sem uma camada unificada, cada router faz seu próprio polling e cada UI pega texto cru por endpoints específicos — o que cria divergência semântica e custo de manutenção.

## 2. Decisão

Adotamos uma **camada Cron + RAG canônica** com três componentes:

### 2.1 Camada RAG (`nexusRag*`)

- **Service**: `backend/src/services/nexusRagService.ts` (orquestrador híbrido in-memory ↔ pgvector).
- **Repositório PG**: `backend/src/services/nexusRagPgRepository.ts` (`pg` carregado on-demand).
- **Router tRPC**: `backend/src/routers/nexusRagRouter.ts` exposto em `/api/trpc/nexusRag.*`.
- **Migration**: `database/migrations/0013_nexus_rag.sql` (3 tabelas + pgvector + ivfflat).
- **Embedding canônico**: `text-embedding-3-small` (1536d). MVP usa derivação determinística sha256 enquanto OPENAI_API_KEY de embeddings não estiver provisionada.
- **Modelo gerador canônico**: `gemini-2.0-flash` (fallback `gpt-4.1-mini`).

### 2.2 Camada Cron (`cronRouter` + workflows)

- **Router já existente**: `backend/src/routers/cronRouter.ts`.
- **Workflows externos** (Genspark Workflows com botão "Enable"):
  - Reindex RAG noturno (`nexusRag.reindex` 03:30 BRT).
  - Ingest AcademIA (detecção de MDs novos 03:30 BRT).
  - Sync catálogo Marketplace (semanal Dom 02:00 BRT, validação de 132 ebooks).
  - Reconciliação de comissões (diário 03:15 BRT).
  - Smoke tests críticos (a cada 15 minutos, 8 endpoints).
  - Snapshot de KPIs (diário 05:00 BRT).

### 2.3 Camada de workers (BullMQ)

- **`backend/src/workers/ragIngestWorker.ts`** consome `rag_ingest_queue` e `rag_reindex_queue`.
- Coexiste com workers existentes (commissions, marketplace sync, withdrawals, ...).
- Redis ausente → o worker faz warn e não trava o boot.

## 3. Diagrama

```
┌──────────────┐    cron tick    ┌────────────────────┐
│ Workflow ENG ├────────────────►│ /trpc/cron.run     │
└──────────────┘                 └─────────┬──────────┘
                                           │ enfileira
                                           ▼
                                ┌──────────────────────┐
                                │  rag_*_queue (Redis) │
                                └─────────┬────────────┘
                                          │
                                          ▼
                          ┌────────────────────────────┐
                          │ ragIngestWorker (BullMQ)   │
                          └────────────┬───────────────┘
                                       │
                                       ▼
                          ┌────────────────────────────┐
                          │ nexusRagService.ingest()   │
                          │   ├─► pgvector (prod)      │
                          │   └─► in-memory (fallback) │
                          └────────────────────────────┘

LabChatbot.tsx ─ query nexusRag.answer ─► nexusRagService.query()
```

## 4. Contratos tRPC `nexusRag`

| Procedure | Acesso | Entrada | Saída |
|---|---|---|---|
| `stats` | público | — | `{ backend, sources, chunks, runs, embeddingModelVersion }` |
| `query` | protegido | `{ question, topK?, scope?, tenantId? }` | `{ matches[], latencyMs, mode }` |
| `answer` | protegido | `query` + `modelHint?` | `{ answer, citations[], modelUsed, tokensUsed, latencyMs, mode }` |
| `ingest` | admin | `{ sourceKind, sourceRef, title?, content, tags?, tenantId?, metadata? }` | `{ runId, sourceId, chunks, mode }` |
| `reindex` | admin | `{ scope: "academia"\|"lab"\|"lib"\|"ebook"\|"telemetry"\|"skill-manifest"\|"all" }` | `{ runId, scope }` |
| `runs` | admin | `{ limit? }` | `RagRunRecord[]` |

## 5. Compatibilidade e fallback

- Sem `DATABASE_URL` → modo `in-memory` (TF-IDF leve).
- Sem `REDIS_URL` → workers ficam ociosos, ingest sob demanda via API ainda funciona.
- Sem `OPENAI_API_KEY` para embedding → embedding determinístico (qualidade semântica reduzida, mas funcional).
- Sem `OPENAI_API_KEY` / `GOOGLE_AI_API_KEY` para resposta → `answer()` devolve heurística canônica baseada em citações.

## 6. SLOs alvo

- `nexusRag.answer` p95 < 1.2s (mode pgvector) / < 250ms (mode in-memory).
- Reindex noturno scope=`all` < 12 min para corpus de 1.000 fontes.
- Smoke tests a cada 15min com SLA 99% verde.

## 7. Próximos passos pós-go-live

1. Plugar OpenAI Embeddings reais quando a chave estiver configurada.
2. Trocar score lexical do MVP por cosine similarity nativo do pgvector (`embedding <=> $query_embedding`).
3. Adicionar `tenant_id` real (multi-tenant por afiliado).
4. Re-rank com cross-encoder antes do generate.
