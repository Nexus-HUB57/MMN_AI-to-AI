# GO-LIVE CHECKLIST · Nexus Affil'IA'te

> Sequência aprovada pelo CTO (Ravi) para colocar Marketplace Nexus + AcademIA + Cron + RAG em produção sem regressão.

## 0. Pré-requisitos

- [ ] `DATABASE_URL` aponta para um PostgreSQL ≥13 com extensão `vector` instalada.
- [ ] `REDIS_URL` (ou `REDIS_HOST`/`REDIS_PORT`) configurado.
- [ ] Variáveis de provedores LLM (`OPENAI_API_KEY`, `GOOGLE_AI_API_KEY`) presentes no `.env` do backend.
- [ ] Acesso `gh` autenticado para fazer PR/merge na `main`.

## 1. Aplicar bundle no clone local

```bash
cd $(mktemp -d) && git clone https://github.com/Nexus-HUB57/MMN_AI-to-AI.git nexus && cd nexus
git checkout -b feature/hub-tecnologico-marketplace-academia

# Copiar o bundle Ravi-CTO em cima da árvore:
rsync -av /caminho/para/ravi-bundle/backend/   ./backend/
rsync -av /caminho/para/ravi-bundle/database/  ./database/
rsync -av /caminho/para/ravi-bundle/docs/      ./docs/

# Patch manual obrigatório:
#   - .gitignore                              (ver patches/gitignore.patch.md)
#   - backend/src/services/nexusRagService.ts (ver patches/nexusRagService.patch.md)
#   - backend/src/routers/nexusRagRouter.ts   (envolver stats em async)
#   - frontend/src/pages/LabChatbot.tsx       (ver patches/LabChatbot.patch.md)
#   - backend/src/appRouter.ts                (garantir: import + namespace nexusRag)
```

## 2. Validar build

```bash
npm install --workspace backend --workspace frontend --legacy-peer-deps --no-audit --no-fund
npm --workspace backend run build      # esbuild → dist/index.js
npm --workspace frontend run build     # vite build
```

## 3. Aplicar migrations

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f database/migrations/0012_marketplace_user_library.sql \
  -f database/migrations/0013_nexus_rag.sql

# Conferir tabelas:
psql "$DATABASE_URL" -c "\dt nexus_rag_*"
psql "$DATABASE_URL" -c "\dt marketplace_*"
```

## 4. Publicar catálogo + biblioteca

```bash
# Gera HTML/PDF/SVG para 132 ebooks (idempotente).
python3 scripts/publish_marketplace_ebooks.py

# Seed do catálogo no banco (idempotente):
python3 scripts/seed_marketplace_ebooks.py
```

Conferência rápida:

```bash
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM marketplace_ebooks WHERE status='active';"
# Esperado: 132
```

## 5. Subir workers

```bash
pm2 start backend/src/workers/ragIngestWorker.ts \
  --name nexus-rag-worker \
  --interpreter ./node_modules/.bin/tsx
pm2 save
```

## 6. Healthchecks pós-deploy

```bash
curl -fsS https://<host>/api/health
curl -fsS https://<host>/api/trpc/system.info
curl -fsS https://<host>/api/trpc/nexusRag.stats
curl -fsS https://<host>/api/trpc/marketplaceNexus.listEbooks
curl -fsS https://<host>/api/trpc/academiaEad.listOverrides
```

Esperado:
- `nexusRag.stats` retorna `backend: "pgvector"`.
- `marketplaceNexus.listEbooks` retorna 132 itens.
- `academiaEad.listOverrides` retorna 169 lições.

## 7. Habilitar workflows (Genspark)

Cliques manuais (botão "Enable"):
- Nexus · RAG Nightly Reindex
- Nexus · AcademIA Content Ingest
- Nexus · Marketplace Catalog Sync
- Nexus · Commission Reconciliation
- Nexus · Health Smoke Tests
- Nexus · Daily KPI Snapshot

## 8. Commit + PR + Merge

```bash
git add -A
git commit -m "feat(hub): orquestração RAG pgvector + worker BullMQ + Lab Chatbot Nexus Context"
git push origin feature/hub-tecnologico-marketplace-academia
gh pr create \
  --title "feat(hub): Nexus RAG pgvector + Lab Chatbot context + workers" \
  --body  "Implementa ADR-001 (Cron+RAG), migrations 0012/0013, worker BullMQ e UI Contexto Nexus."
```

Após CI verde:

```bash
gh pr merge --merge --delete-branch
```

## 9. Rollback rápido

- Backend RAG quebrando? Setar `NEXUS_RAG_BACKEND=in-memory` → service volta para fallback em segundos.
- Worker travado? `pm2 stop nexus-rag-worker`. As filas continuam aceitando jobs, sem perda.
- Migration ruim? `BEGIN; DROP TABLE nexus_rag_chunks, nexus_rag_sources, nexus_rag_runs; COMMIT;`
  (estrutura totalmente isolada de tabelas existentes).
