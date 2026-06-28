---
title: "Arquitetura Cron + RAG para Orquestração do Nexus Affil'IA'te"
description: "Análise técnica e implementação da camada Cron + RAG que sustenta a operação autônoma do CEO/AI"
tags: [cron, rag, orchestration, ceo-ai, nexus, ai-to-ai]
version: 1.0.0
last_updated: 2026-06-28
status: official
author: "CEO/AI Nexus"
---

# 🧠 Arquitetura Cron + RAG · Nexus Affil'IA'te

## 1. Problema

O ecossistema Nexus precisa de uma camada que:
1. dispare ações agendadas (saúde, indexação, snapshots);
2. lembre-se de decisões passadas e consulte conhecimento canônico (RAG);
3. tome decisões com SHO sem intervenção humana quando seguro;
4. mantenha tudo auditável e reversível.

## 2. Solução

Combinar três módulos já existentes mais um novo:

| Camada | Existente? | Função |
|---|---|---|
| **Cron** (`backend/src/domains/cron/`) | ✅ sim | agenda jobs com BullMQ; expõe tRPC |
| **Vector Memory** (`backend/src/agentic/memory/vectorMemory.ts`) | ✅ sim | memória episódica/semântica leve |
| **Retriever Adapter** (`backend/src/integrations/langchain/retriever-adapter.ts`) | ✅ sim | abstrai PGVector, Qdrant, Pinecone, Chroma |
| **CEO/AI Orchestrator** (`backend/src/agentic/ceo-ai/`) | 🆕 novo | une tudo numa API única |

## 3. Fluxo macro

```
sinal externo ─┐
cron-tick   ───┼──> CEOOrchestrator.handle(signal)
ad-hoc      ─┘
                 │
                 ├── plan()    ── escolhe ação a partir da source
                 ├── decide()  ── aplica SHO (confiança, risco)
                 ├── execute() ── enfileira em BullMQ / Cron / dispatchers
                 └── learn()   ── salva outcome no VectorStore (RAG)
```

## 4. Componentes do CEO/AI Orchestrator

### 4.1 `orchestrator.ts`
- **CEOSignal**: sinal tipado (8 sources).
- **CEOAction**: ação proposta (8 kinds, ex. enqueue-job, create-cron, publish-content).
- **CEODecision**: classificação SHO (auto-approved | needs-review | blocked).
- **plan(signal)** → ação proposta.
- **decide(action, opts)** → classificação SHO.
- **execute(decision, adapters)** → roteia para queues, cron, dispatchers.
- **learn(input, memory)** → escreve outcome em VectorMemory.

### 4.2 `ragRetriever.ts`
- **CEORAGRetriever**: índice + busca semântica.
- **index(docs)** → indexa documentos canônicos.
- **query(input)** → busca com scope (academia, ceo-decisions, marketplace, judge-history).
- **buildContext(query, k)** → bloco markdown para prompts downstream.

### 4.3 `router.ts` (tRPC)
- `ceoAi.status`
- `ceoAi.planSignal` (admin)
- `ceoAi.handleSignal` (admin)
- `ceoAi.ragQuery` (admin)
- `ceoAi.ragIndex` (admin)
- `ceoAi.ragContext` (admin)
- `ceoAi.recentLog` (admin)

## 5. Integração com Cron existente

O CEO/AI **não recria cron** — usa o `cronRouter` existente. Quando um signal vira ação `create-cron` ou `update-cron`, o adapter chama o router de cron já em produção.

| Cron já em PM2 | Workers downstream |
|---|---|
| `mmn-worker-content` | conteúdo |
| `mmn-worker-commissions` | comissões |
| `mmn-worker-marketplace` | sync marketplace |
| `mmn-worker-orders` | ordens |
| `mmn-worker-content` (agora também) | publicação CEO/AI |

## 6. Integração com RAG existente

`VectorMemoryStore` é a memória interna leve (em RAM, hash 12-dim).
`RetrieverAdapter` é a camada plugável para Postgres+PGVector / Qdrant / Pinecone / Chroma.
**Estratégia:**
- **Hoje (MVP):** `TinyInMemoryVectorStore` no router (Jaccard sobre tokens).
- **Próximo passo:** ligar ao `RetrieverAdapter` + Ollama embeddings + PGVector.
- **Estado-alvo:** PGVector multi-tenant + cache Redis L1.

## 7. Workflows manuais (Enable Workflows)

Foram criados 5 workflows configuráveis pelo painel "Enable Workflows":

| Workflow | Frequência | Função |
|---|---|---|
| Nexus · Health Sentinel | diário 06:00 UTC | health da plataforma + A2A |
| Nexus · Academia Validator | a cada 6h | gaps editoriais → signal CEO/AI |
| Nexus · A2A Marketplace Snapshot | semanal seg 08:00 UTC | snapshot agentic |
| Nexus · CEO/AI Signal Ingest | manual | ingest externo de sinais |
| Nexus · RAG Reindex | diário 03:00 UTC | reindexa conhecimento canônico |

> Os workflows ficam visíveis com botão **Enable** no painel. Nada é executado automaticamente até o operador clicar.

## 8. Governança e segurança

- **Audit trail**: `learn()` registra todo outcome em memory.
- **SHO**: `decide()` aplica confidenceThreshold=0.6, riskLimit=0.3, bloqueio em risk>0.8.
- **Reversibilidade**: ações `auto-approved` que não funcionarem são detectadas via signal `validator-error` ou `judge-block` no ciclo seguinte.
- **Manual override**: qualquer signal pode ser ingerido com `forceReview=true`.

## 9. Métricas-chave

| Métrica | Meta inicial |
|---|---|
| Latência de `handleSignal` p95 | < 250 ms |
| Acurácia da auto-aprovação | > 95% |
| Cobertura RAG por trilha | 100% das lessons |
| Reindexação diária OK | 100% dos ticks |
| Falhas em execução SHO | < 1% |

## 10. Roadmap de evolução

| Marco | Conteúdo |
|---|---|
| Q3 2026 | PGVector + Ollama embeddings + filtro multi-tenant |
| Q4 2026 | Federação RAG entre nós Nexus (Lib Nexus distribuída) |
| Q1 2027 | Aprendizado contínuo do SHO via fine-tuning de thresholds |
| Q2 2027 | Auto-criação de cron jobs baseada em padrões detectados |

## 11. Endpoints LIVE (após deploy)

- `GET  /api/trpc/ceoAi.status`
- `POST /api/trpc/ceoAi.handleSignal`
- `POST /api/trpc/ceoAi.planSignal`
- `GET  /api/trpc/ceoAi.ragQuery?input={...}`
- `POST /api/trpc/ceoAi.ragIndex`
- `GET  /api/trpc/ceoAi.ragContext?input={...}`
- `GET  /api/trpc/ceoAi.recentLog?input={...}`

---

**Documento oficial** · CEO/AI Nexus · Arquitetura técnica
