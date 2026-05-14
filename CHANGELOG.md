# Changelog MMN AI-to-AI

## 2026-05-14 — Auditoria & Correção de Divergências entre README/Docs e Código Real

Auditoria técnica fundamentalista confirmou 10 divergências entre o que o README/documentação prometiam e o que existia no repositório. Esta release aplica as correções:

### `chore(workspaces)` — Manifests npm criados/corrigidos
- **`package.json` (raiz)**: reescrito como **monorepo npm workspaces** (`frontend`, `backend`, `mobile`) com todos os scripts que o README promete e que antes **não existiam**:
  - `dev`, `dev:frontend`, `dev:backend`, `dev:mobile` (via `concurrently`)
  - `build`, `build:frontend`, `build:backend`, `start`
  - `infrastructure:up`, `infrastructure:down`, `infrastructure:logs`
  - `db:generate`, `db:migrate`, `db:push`, `db:studio` (Drizzle Kit apontando para `infra/drizzle.config.ts`)
  - `genkit:dev`
  - `test`, `test:phase8`, `test:watch`, `lint`
- **`frontend/package.json`**: **criado** (antes inexistente). Stack real declarada: **React 18 + Vite 5 + wouter + Tailwind + tRPC client + TanStack Query + Radix UI + sonner**.
- **`backend/package.json`**: **criado** (antes inexistente). Stack real: **Node + TypeScript + tRPC 11 + Drizzle ORM + mysql2 + BullMQ + ioredis + Genkit + OpenAI SDK + Express**. Inclui scripts `dev` (tsx watch), `build` (tsc), `worker:*` (4 workers BullMQ), `genkit:dev` e `db:*`.

### `fix(infra)` — Dockerfile e docker-compose alinhados à estrutura real
- `infra/Dockerfile` reescrito em **3 estágios** assumindo build a partir da **raiz do monorepo**:
  - Stage 1 (`frontend-builder`): copia `package.json` + `frontend/package.json`, instala workspace, builda Vite → `frontend/dist`.
  - Stage 2 (`backend-builder`): copia `backend/`, `database/`, `infra/`, builda TS → `backend/dist`.
  - Stage 3 (`runner`): copia artefatos, instala apenas prod deps, inclui `HEALTHCHECK` e `EXPOSE 3000`.
  - **Removida** a suposição quebrada `COPY frontend/package*.json ./` em diretório isolado (era impossível antes porque `frontend/package.json` não existia).
- `infra/docker-compose.yml` ajustado: `build.context: ..` e `build.dockerfile: infra/Dockerfile` (executar com `docker compose -f infra/docker-compose.yml up -d` a partir da raiz). Imagens atualizadas: `redis:7-alpine`, `mysql:8.0`. Removido `version: '3.8'` (deprecado).

### `docs(readme)` — README corrigido para refletir o código real
- **Frontend**: substituído **"Next.js 15 (App Router)"** por **"React 18 + Vite + wouter + TailwindCSS"** (o `frontend/src/App.tsx` real usa `wouter` + `Route/Switch`).
- Removida declaração de **"Firestore"** como backend (não há integração Firestore no código).
- **Auth**: descrita honestamente como **JWT/contexto tRPC** atualmente, com Firebase/Next-Auth marcadas como **placeholder/roadmap** (alinhado a `frontend/src/lib/auth.ts`).
- Diretório mobile corrigido de **`mobile-app/`** para **`mobile/`** (caminho real).
- Seção "Como Iniciar" reescrita com os scripts que **realmente existem** após esta release (incluindo workers BullMQ separados e build Docker).

### `refactor(backend)` — Unificação do `mmnRouter` (remoção de duplicação)
- Versão canônica: **`backend/src/routers/mmnRouter.ts`**.
- `backend/src/services/mmn.ts` reduzido a **shim de compatibilidade** (`export { mmnRouter } from "../routers/mmnRouter"`) marcado como `@deprecated`. Evita quebrar imports legados enquanto migram.
- `backend/src/routers/authRouter.ts` atualizado para importar de `./mmnRouter` (canônico) em vez de `../services/mmn`.

### `docs` — Documentação técnica realinhada (Drizzle/MySQL, não Prisma/PostgreSQL)
- `docs/technical-documentation.md`: substituídas todas as referências a **Prisma** por **Drizzle ORM** e a **MySQL/PostgreSQL** por **MySQL 8**. Link da documentação atualizado para `orm.drizzle.team`.
- `docs/final-project-report.md`: idem (tabela de tecnologias e referências).
- `docs/roadmaps/FASE_5_6_ROADMAP_DETALHADO.md`: linha de custo "Database (RDS) … PostgreSQL" → "MySQL 8".
- `docs/planning/pasted_content.txt`: adicionada **nota histórica** no topo esclarecendo que menções a Firebase/PostgreSQL são do planejamento original e a stack implementada é MySQL + Drizzle + Redis/BullMQ.

### Pontos conhecidos / ainda abertos (TODOs do código)
Os seguintes TODOs/placeholders **permanecem** no código e foram **explicitamente documentados** (não silenciados):
- `backend/src/routers/aiContentHubRouter.ts`: persistência de templates, posts agendados, analytics e OAuth callback ainda usam stubs (TODOs marcados nas linhas 299, 330, 378, 415, 468, 633, 665, 802).
- `backend/src/services/dropshippingService.ts`: `userId: 1` como placeholder para identificar o fornecedor na notificação (linha 80) — substituir por lookup real de fornecedor por `productId`/`marketplace`.
- `frontend/src/lib/trpc.ts`: tipo `AppRouter = any` — substituir pelo tipo real exportado do backend para garantir type-safety end-to-end.
- `frontend/src/lib/auth.ts`: integração Firebase Auth + Next-Auth ainda é **placeholder**.

---

## 2026-05-14 — (release anterior)

### Implementação de Cache Redis e Rate Limiting

*   **Cache Redis:** Integrado nos endpoints `listModels`, `getModel`, `getModelStats` e `getContentAnalytics` do `aiContentHubRouter.ts` para otimizar a performance e reduzir a carga no servidor. Utiliza `cache-service.ts` para gerenciar o cache com tempos de vida (TTL) configuráveis para diferentes tipos de dados.
*   **Rate Limiting:** Implementado nos endpoints `listModels`, `generateContent`, `schedulePost` e `getContentAnalytics` do `aiContentHubRouter.ts` usando `rate-limiter.ts`. Isso protege a API contra uso excessivo e ataques de negação de serviço, aplicando limites de requisições por usuário e por IP.

### Suporte a Imagens e Vídeos

*   **Módulo de Mídia:** Adicionados novos endpoints ao `aiContentHubRouter.ts` para `listMedia`, `deleteMedia` e `getUploadUrl`. Estes endpoints utilizam o `media-service.ts` para gerenciar o upload, listagem e exclusão de imagens e vídeos no AWS S3, além de gerar URLs pré-assinadas para uploads seguros.

### Configuração de Monitoramento com Prometheus e Grafana

*   **Prometheus:** Configurado para coletar métricas do backend da aplicação, Redis, MySQL, Node Exporter e cAdvisor, conforme `prometheus.yml`.
*   **Grafana:** Configurado para visualização de métricas, com volumes persistentes para dados.
*   **Alertmanager:** Configurado com um `alertmanager.yml` básico para gerenciamento de alertas.
*   **Loki e Promtail:** Adicionados para agregação de logs, com `loki-config.yml` e `promtail-config.yml` para coleta e armazenamento de logs de sistema e contêineres.
*   **Jaeger:** Incluído para rastreamento distribuído, facilitando a depuração de requisições complexas.

Essas implementações visam melhorar a performance, segurança, escalabilidade e observabilidade do sistema, preparando-o para futuras expansões e um ambiente de produção robusto.
