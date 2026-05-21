# Changelog MMN AI-to-AI

## 2026-05-21 — Dispatcher Cron ↔ BullMQ e execução real do `runNow`

### `feat(backend)` — Conexão do domínio Cron à infraestrutura BullMQ

**Novo serviço:**
- `backend/src/services/cronDispatcher.ts` com catálogo de bindings `jobType` → fila BullMQ + nome do job + transformação de payload
- handlers inline para operações curtas (`invoice_overdue_check`, `database_cleanup`, `xp_recalculation`, etc.)
- fallback genérico usando o `queueName` declarado pelo próprio cron job
- propagação do contexto `__cron` (cronJobId, historyId) dentro do payload BullMQ

**Refatorações:**
- `cronScheduler.executeJobByType` agora delega ao dispatcher e lança erro real em caso de falha de despacho
- `cron_job_history.jobId` e `cron_job_history.metadata` agora são populados com dados reais do BullMQ
- `parsePayload` tolerante a payloads em string ou objeto, evitando exceções em `JSON.parse(null)`
- `cron.runNow` migrado para chamar `executeCronJob`, executando o job de verdade em vez de criar registro órfão

**Nova procedure:**
- `trpc.cron.getSupportedJobTypes` expõe a lista de tipos suportados nativamente pelo dispatcher

**Documentação:**
- nova entrega `docs/admin-backoffice/ENTREGA_CRON_DISPATCHER_BULLMQ.md`
- README raiz, `docs/admin-backoffice/README.md` e índices sincronizados

**Build:**
- `npm run build` validado (backend 499 KB / frontend Vite OK)

## 2026-05-21 — CRUD e Configurações Globais do Domínio Cron no Backoffice

### `feat(backoffice)` — Central administrativa completa do domínio Cron

**Frontend Admin:**
- `AdminSchedules.tsx` agora oferece CRUD completo de jobs cron (criar, editar, executar agora, pausar/ativar, remover)
- aplicação de templates pré-definidos via `cron.getTemplates`, hidratando nome, tipo, fila e frequência
- novo painel lateral de configurações globais (timezone, canal de alertas, janela de manutenção) com persistência via `cron.updateSettings`
- editor de payload JSON com validação local antes do envio ao backend
- visualização do payload e do último erro registrado no detalhamento do job selecionado

**Backend / contratos:**
- `cronRouter.ts` consolidado com nova procedure `getTemplates` derivada de `CRON_JOB_CONFIGS`
- normalização do retorno via `normalizeCronJob`, garantindo payload tipado para o frontend
- serialização robusta do `jobPayload` (string ↔ objeto JSON) em criação e atualização
- recálculo automático de `nextRunAt` quando frequência ou expressão cron mudam, lendo o estado atual do job
- `updateSettings` migrado para `onDuplicateKeyUpdate({ set: ... })` alinhado ao Drizzle ORM

**Documentação:**
- `docs/admin-backoffice/ENTREGA_AGENDAMENTOS_CRON_ADMIN.md` atualizado com CRUD, templates e configurações globais
- `README.md`, `docs/README.md` e `docs/admin-backoffice/README.md` sincronizados com a nova frente

**Build:**
- monorepo revalidado com sucesso via `npm run build` (frontend Vite + backend esbuild)

## 2026-05-20 — Backoffice Admin para Agendamentos Cron

### `feat(backoffice)` — Rota administrativa de agendamentos conectada ao domínio Cron

**Frontend Admin:**
- `AdminSchedules.tsx` evoluído de página descritiva para painel operacional ligado ao `trpc.cron.*`
- adicionadas listagem de jobs, estatísticas, próximas execuções, histórico do job selecionado e ações de execução manual/pausa
- reforçada a integração entre Backoffice, logs e automação recorrente

**Documentação:**
- adicionada a entrega `docs/admin-backoffice/ENTREGA_AGENDAMENTOS_CRON_ADMIN.md`
- índices administrativos e README sincronizados com a nova frente operacional de cron

## 2026-05-20 — Saneamento do Backend e Build do Monorepo

### `fix(backend)` — Observabilidade e imports estabilizados

**Backend / Build:**
- adicionados helpers esperados pela observabilidade em `database/schemas/db.ts` (`listAgents`, `getAgentById`, `getAgentActions`)
- corrigidos imports relativos de schemas compartilhados em módulos de cron, upgrades e worker de saque
- ajustado `database/schemas/schema-cron.ts` para eliminar erro de import inválido
- build completo do monorepo revalidado com sucesso via `npm run build`

**Impacto:**
- remove fragilidades de compilação no backend
- reduz inconsistências entre módulos administrativos, cron e observabilidade
- garante uma trilha de build mais confiável para continuidade do desenvolvimento

## 2026-05-20 — Auditoria e Consolidação Financeira do Backoffice

### `feat(backoffice)` — Auditoria operacional visível entre aprovações, comissões e pagamentos

**Backoffice Admin:**
- `AdminApprovals.tsx` evoluído com rastreabilidade visível, histórico detalhado e resumo de auditoria
- `AdminCommissions.tsx` ampliado com revisão detalhada, histórico operacional e resumo financeiro
- `AdminPayments.tsx` reorganizado para evidenciar atenção operacional e fila financeira

**Routers / contratos:**
- `approvalsRouter.ts` reforçado com metadados de auditoria nas mutações principais
- `commissionsRouter.ts` reforçado com eventos de auditoria, histórico operacional e resumo financeiro

**Documentação:**
- adicionada a entrega `docs/admin-backoffice/ENTREGA_AUDITORIA_E_CONSOLIDACAO_FINANCEIRA.md`
- índices e README sincronizados com a nova trilha do Backoffice Admin

## 2026-05-20 — Expansão dos Routers Admin

### `feat(routers)` — Routers Delinquents, Commissions e Approvals

**Backend - Novos routers:**
- `delinquentsRouter.ts` - Gestão de inadimplentes: list, getById, updateStatus, addContactAttempt, addNote, getStats, sendReminder
- `commissionsRouter.ts` - Gestão de comissões: list, getById, updateStatus, approveBatch, getStats, getByAffiliate, calculatePending
- `approvalsRouter.ts` - Gestão de aprovações: listPending, listProcessed, getById, approve, reject, requestInfo, getStats, approveBatch

**appRouter.ts atualizado:**
- Novos routers registrados: `delinquents`, `commissions`, `approvals`
- Status bootstrap atualizado com 3 novos routers

**Endpoints tRPC para páginas admin:**
- `trpc.delinquents.list` → AdminDelinquents
- `trpc.delinquents.updateStatus` → AdminDelinquents
- `trpc.commissions.list` → AdminCommissions
- `trpc.commissions.updateStatus` → AdminCommissions
- `trpc.approvals.listPending` → AdminApprovals
- `trpc.approvals.approve/reject` → AdminApprovals

**Frontend pages admin integradas:**
- AdminDelinquents.tsx - Gerenciamento de inadimplentes
- AdminCommissions.tsx - Visualização e gestão de comissões
- AdminApprovals.tsx - Fluxo de aprovações administrativas

## 2026-05-20 — Routers Admin + BackOffice Integration

### `feat(routers)` — Novos Routers para Backoffice Admin

**Backend - Novos routers:**
- `usersRouter.ts` - Gestão de usuários: list, getById, updateRole, updateStatus, getStats
- `materialsRouter.ts` - Gestão de materiais: list, getById, create, update, delete, getCategories, getStats
- `networkRouter.ts` - Gestão de rede MMN: getTree, getDirectReferrals, getStats, getByAffiliate, getTopSponsors, getUpline

**appRouter.ts atualizado:**
- Novos routers registrados: `users`, `materials`, `network`
- Status bootstrap atualizado com novos routers

**Endpoints tRPC para páginas admin:**
- `trpc.users.list` → AdminUsers
- `trpc.materials.list` → AdminMaterials
- `trpc.network.getByAffiliate` → AdminNetwork
- `trpc.network.getDirectReferrals` → AdminNetwork
- `trpc.payments.list` → AdminPayments

**Frontend pages admin:**
- AdminUsers.tsx - Usa trpc.users.list e trpc.users.updateRole
- AdminMaterials.tsx - Usa trpc.materials.list, create, updateStatus
- AdminNetwork.tsx - Usa trpc.network.getByAffiliate e getDirectReferrals
- AdminPayments.tsx - Usa trpc.payments.list e updateStatus

## 2026-05-20 — Admin Dashboard + BackOffice Module

### `feat(admin)` — BackOffice Admin Module Completo

**Backend (`backend/src/routers/adminRouter.ts`):**
- CRUD completo para gestão de usuários: `listUsers`, `getUser`, `updateUser`, `deleteUser`
- Dashboard metrics: `getDashboardMetrics`, `getNetworkStats`, `getCommissionStats`, `getSalesStats`
- Affiliate management: `toggleAffiliateStatus`
- Platform settings: `getPlatformSettings`, `updatePlatformSettings`

**Frontend:**
- `AdminDashboard.tsx` - Dashboard com dados reais via tRPC
- `AdminSettings.tsx` - Página de configurações da plataforma
- `AdminDashboardLayout.tsx` - Layout com menu de navegação
- Rotas atualizadas em `App.tsx` para `/admin/dashboard` e `/admin/settings`

**UI Components (shadcn-style):**
- 17 componentes criados: button, card, input, select, dialog, tabs, pagination, badge, skeleton, textarea, label, progress, avatar, dropdown-menu, table
- Componentes de agentes placeholders: AgentConfiguration, AgentStatus, ContentGenerator, PostScheduler, etc.

**Configurações:**
- `@` alias adicionado ao `vite.config.ts`
- `useAuth` hook exportado do AuthContext
- Dependências instaladas: lucide-react, date-fns
- `const.ts` e `lib/utils.ts` com utilities auxiliares

### `feat(rbac)` — Sistema de Permissões RBAC Completo
- Schemas para roles, permissions, policies
- 8 roles padrão (super_admin, admin, manager, affiliate, etc)
- 45+ permissões granulares por recurso
- Custom permissions e resource policies por usuário

### `feat(circuit-breaker)` — Sistema de Circuit Breakers
- Implementação do padrão com estados CLOSED/OPEN/HALF_OPEN
- Middleware tRPC para proteção de procedures
- Pre-configurado para serviços críticos (Mercado Livre, Shopee, PIX)

### `feat(firebase)` — Firebase Auth Integration
- SDK Firebase Admin com autenticação
- Login social (Google, Facebook, Apple)
- JWT custom claims para roles

### `feat(raffle)` — Sistema de Sorteios com Grafo+IA
- Verificação de elegibilidade por nível de rede
- Algoritmo Fisher-Yates com seed para reprodutibilidade

### `feat(holdings)` — Sistema de Holdings e Dividendos
- Participações acionárias e dividendos
- Compra/venda de ações com cálculo de preço médio

### `docs` — Documentação Organizada
- `docs/README.md` atualizado com índice organizado
- Navegação por objetivo (Primeiro Acesso, Admins, Afiliados, Devs, Agentic)
- Conformidade atualizada para 85-90%

## 2026-05-19 — Workers BullMQ + Marketplace Nexus + PIX Middleware

### `feat(workers)` — Workers BullMQ para processamento de saques

**Backend:**
- **withdrawalProcessingWorker.ts**: Worker dedicado para processamento assíncrono de saques
  - ProcessaPixJob: Simula envio de PIX via API bancária
  - Atualiza status do saque para 'processing' → 'completed' ou 'failed'
  - Registra transação no histórico com todas as informações do PIX
  - Error handling robusto com exponential backoff
- **queue.ts atualizado**: Adicionados `withdrawalQueue`, `withdrawalQueueEvents`, `WithdrawalJob` interface e `addWithdrawalJob()` function

### `feat(marketplace)` — Marketplace Nexus (catálogo próprio)

**Database Schema (`database/schemas/marketplace-schema.ts`):**
- `marketplace_products` — Catálogo de produtos com pricing, estoque, variations
- `product_categories` — Categorias hierárquicas de produtos
- `product_variations` — Variações (tamanho, cor, etc)
- `marketplace_orders` — Pedidos do marketplace com fluxo completo
- `order_items` — Itens dos pedidos
- `product_reviews` — Avaliações e reviews de produtos
- `wishlists` / `wishlist_items` — Listas de desejos
- `coupons` — Sistema de cupons de desconto (percentage, fixed, free_shipping, buy_x_get_y)
- `affiliate_marketplace_settings` — Configurações por afiliado

**Backend Router (`marketplaceRouter.ts`):**
- CRUD completo de produtos, categorias e variações
- Sistema de pedidos com cupons e validações
- Reviews com moderação (approved/rejected/flagged)
- Dashboard de estatísticas admin
- Validação e aplicação de cupons

### `feat(pix)` — Middleware de integração PIX

**Backend (`backend/src/middleware/pixMiddleware.ts`):**
- `createPixPayment()` — Gera QR Code PIX com EMV válido
- `handlePixWebhook()` — Processa webhooks de confirmação
- `getPixPaymentStatus()` — Consulta status do pagamento
- `requestPixWithdrawal()` — Solicita saque via PIX
- `cancelPixPayment()` — Cancela pagamento pendente
- `generateStaticPixQRCode()` — Gera QR Code para valores fixos
- `pixWebhookMiddleware()` — Middleware Express para webhooks
- CRC16 calculation para EMV compliance
- Geração de TXID (transaction ID de 25 caracteres)

### `feat(frontend)` — Páginas de Calendário e Tracking

**ContentCalendar.tsx:**
- Visualização semanal e mensal do calendário
- CRUD completo de posts agendados
- Filtros por plataforma e status
- Preview de posts por dia
- Lista de próximas postagens
- Dialog para criação/edição de posts
- Integração com socialRouter

**TrackingDashboard.tsx:**
- Dashboard completo de Tracking Neural
- Criação de links rastreáveis com UTM
- Métricas: cliques, cliques únicos, conversões, receita
- Análise por plataforma (WhatsApp, Instagram, Facebook, etc)
- Histórico de conversões
- Gráficos de performance
- Estatísticas de conversion rate
- Links com melhor desempenho

### `chore(routers)` — Registro de novos routers

- `appRouter.ts` atualizado com:
  - Import de `marketplaceRouter`
  - Registro de `marketplace: marketplaceRouter`
- `database/schemas/index.ts` atualizado com export de `banking-schema`, `marketplace-schema`

## 2026-05-19 — BeYour Banker + Posts Automatizados + Tracking Neural

### `feat(banking)` — Sistema BeYour Banker implementado

**Backend:**
- **Novo schema**: `database/schemas/banking-schema.ts` com tabelas:
  - `bank_accounts` — Contas bancárias com PIX
  - `affiliate_balances` — Saldo disponível, pendente e bloqueado
  - `withdrawal_requests` — Solicitações de saque com workflow completo
  - `transaction_history` — Histórico completo de transações financeiras
  - `monthly_reports` — Relatórios mensais de earnings
  - `social_accounts` — Contas sociais vinculadas (WhatsApp, Instagram, Facebook)
  - `content_calendar` — Calendário de posts automatizados
  - `tracking_links` — Links de rastreamento com UTM
  - `conversion_events` — Eventos de conversão por tracking
  - `affiliate_performance` — Métricas de performance por afiliado
- **Novo router**: `backend/src/routers/bankingRouter.ts` com endpoints:
  - `listBankAccounts`, `addBankAccount`, `setPrimaryBankAccount`, `deleteBankAccount`
  - `getBalance`, `requestWithdrawal`, `listWithdrawals`, `getWithdrawalDetails`
  - `getTransactionHistory`, `getMonthlyReport`, `listMonthlyReports`
  - Admin: `adminListPendingWithdrawals`, `adminApproveWithdrawal`, `adminRejectWithdrawal`, `adminProcessWithdrawal`
- **Validação de CPF** implementada no backend
- **Cálculo de taxa de 2%** em saques

**Frontend:**
- **Payments.tsx atualizado**: Interface completa do BeYour Banker com:
  - Abas: Saldo, Contas, Sacar, Histórico
  - Cards de saldo (disponível, pendente, total)
  - Formulário de cadastro de conta bancária
  - Solicitação de saque com cálculo de taxa em tempo real
  - Lista de saques com badges de status
  - Histórico de transações com ícones por tipo

### `feat(social)` — Sistema de Posts Automatizados

- **socialRouter.ts**: Router completo para automação social:
  - `listSocialAccounts`, `addSocialAccount`, `updateSocialAccountStatus`, `removeSocialAccount`
  - `listScheduledPosts`, `createScheduledPost`, `updateScheduledPost`, `cancelScheduledPost`
  - `getPostStats`, `getPeakHours`
- **Tracking Neural**:
  - `createTrackingLink`, `listTrackingLinks`, `getLinkMetrics`
  - `registerConversion` — Registra cliques, visualizações, cadastros e compras
  - `getPerformance` — Métricas de performance do afiliado
- Admin: `adminListAllPosts`, `adminGetGlobalStats`

## 2026-05-18 — Estabilização do build do monorepo

### `fix(build)` — build previsível sem estouro de memória no bootstrap atual
- **Corrigido** o build do frontend para usar `vite build` diretamente, evitando o acoplamento de typecheck com o backend durante a etapa de empacotamento.
- **Migrado** o build do backend de `tsc` para `esbuild`, gerando `backend/dist/index.js` com baixo consumo de memória e preservando o `start` em Node.js.
- **Adicionadas** dependências operacionais ausentes no backend (`aws-sdk`, `sharp`, `node-cron`) e a dependência de build `esbuild`.
- **Ajustado** `backend/src/services/orchestrator.ts` para consumir o contrato real retornado por `llm-v2` (`response.content`).
- **Resultado validado** com `npm run build` concluindo com sucesso na raiz do monorepo.

## 2026-05-18 — Backlog executável da camada agentic

### `docs(agentic-backlog)` — épicos, issues detalhadas e plano de sprint
- **Criados** `docs/agentic/EPICOS_E_ISSUES_AGENTIC.md` e `docs/agentic/PLANO_SPRINTS_AGENTIC.md` para transformar a trilha agentic em backlog acionável para GitHub Issues/Projects.
- **Estruturados** 7 épicos e 24+ issues com título, contexto, critérios de aceite, labels recomendadas, prioridade e ordem de execução.
- **Convertido** o roadmap em plano sequencial de 8 sprints, respeitando dependências entre estabilização, control plane, governança, observabilidade, integrações externas, compliance e memória.
- **Atualizado** o `README.md` com links para o backlog detalhado e o plano de execução por sprint.

## 2026-05-18 — Consolidação documental da camada agentic

### `docs(agentic)` — roadmap, arquitetura-alvo e operação segura
- **Criados** `docs/agentic/ROADMAP_AGENTIC_EXECUCAO.md`, `docs/agentic/ARQUITETURA_AGENTIC_ALVO.md` e `docs/agentic/OPERACAO_AGENTIC_SRE_COMPLIANCE.md` para consolidar a evolução da autonomia do sistema com uma visão mais executável e aderente ao estado real do repositório.
- **Esclarecido** que a visão de autonomia total depende de validação operacional progressiva, preservando o core transacional de MMN, orders, payments e commissions como fonte oficial de verdade.
- **Documentados** critérios de rollout híbrido -> supervisionado -> autônomo controlado, além de KPIs de autonomia, requisitos mínimos de auditoria, budgets, observabilidade e compliance.
- **Atualizado** o `README.md` com links para a nova trilha documental agentic.

## 2026-05-15 — Preparação da Fase 3 com shims de compatibilidade do backend

### `refactor(backend-compat)` — saneamento do grafo de imports para reintrodução dos routers reais
- **Normalizados** imports relativos de `authRouter`, `systemRouter`, `dashboardRouter`, `mmnRouter`, `notification` e `_core/notification`.
- **Criados shims de compatibilidade** para caminhos históricos de `trpc`, `db`, `drizzle/schema`, `database/schemas`, `integrations` e `env`, reduzindo atrito entre a estrutura antiga e o monorepo atual.
- **Criado** `backend/src/services/llm.ts` como adapter transitório para manter o `authRouter` histórico carregável sem reativar ainda a IA final.
- **Validado** que `backend/src/routers` ficou com **0 imports relativos quebrados** após a rodada de correções.
- **Confirmado** o carregamento com `tsx` de `systemRouter`, `dashboardRouter` e `mmnRouter`; o próximo bloqueador ficou isolado em `backend/src/routers/aiContentHubRouter.ts`.
- **Criado** `docs/VALIDACAO_FUSAO_FASE3_PREP.md` com escopo, evidências e próximos passos.

## 2026-05-15 — Integração tRPC do frontend bootstrap + validação da Fase 2

### `feat(bootstrap-trpc)` — frontend passa a consumir o contrato real do backend
- **Religado** o `TRPCProvider` em `frontend/src/App.tsx`, permitindo queries reais do bootstrap no frontend.
- **Substituído** o placeholder `AppRouter = any` em `frontend/src/lib/trpc.ts` por importação do tipo real exportado em `backend/src/appRouter.ts`.
- **Migradas** as páginas `Home`, `Dashboard` e `ContentHub` para consumo do backend via hooks tRPC (`system.info`, `system.health`, `bootstrap.status`, `auth.me`) em vez de `fetch` manual.
- **Validado** o runtime bootstrap com resposta positiva dos endpoints `/health` e `/trpc/system.info`.
- **Criado** `docs/VALIDACAO_FUSAO_FASE2.md` documentando escopo, evidências, limites e próximos passos da fase.

## 2026-05-15 — Validação da Fase 1 de fusão + higiene de repositório

### `docs(fusao)` — validação formal da fundação técnica
- **Criado** `docs/VALIDACAO_FUSAO_FASE1.md` com escopo da Fase 1, evidências de build/bootstrap, limites conhecidos e próximos passos da fusão entre o sistema novo e o legado.
- **Atualizados** `docs/roadmap_fusao_mmn.md` e `docs/roadmaps/roadmap_fusao_mmn.md` para refletir a stack real (**React + Vite + wouter**, backend **Express + tRPC**, **Drizzle + MySQL**, `legacy/`) e a estratégia de migração incremental.
- **Criado** `.gitignore` para impedir versionamento acidental de `node_modules`, `dist`, logs, caches e arquivos temporários gerados durante o bootstrap.
- **Ajustado** `backend/tsconfig.json` com `ignoreDeprecations: "6.0"` para compatibilidade com o TypeScript atual e manutenção do `npm run build` funcional.

## 2026-05-15 — Bootstrap executável do monorepo

### `fix(bootstrap)` — runtime mínimo validável para frontend e backend
- **Backend bootstrap criado**: adicionados `backend/src/index.ts` e `backend/src/appRouter.ts` com servidor **Express + tRPC** mínimo, rotas públicas `system.health`, `system.info`, `auth.me`, `auth.logout` e `bootstrap.status`.
- **Genkit placeholder criado**: `backend/src/genkit/index.ts` mantém o script `genkit:dev` operacional em modo placeholder enquanto os flows reais são religados.
- **TypeScript backend criado**: `backend/tsconfig.json` passa a compilar apenas o núcleo bootstrap (`index`, `appRouter`, `genkit`, `trpc`) para destravar `npm run build` e `npm run dev`.
- **Frontend bootstrap criado**: adicionados `frontend/index.html`, `frontend/vite.config.ts`, `frontend/tsconfig.json`, `frontend/src/main.tsx` e páginas bootstrap mínimas (`Home`, `Dashboard`, `ContentHub`, `NotFound`).
- **Cliente tRPC do frontend corrigido**: `frontend/src/lib/trpc.ts` foi reescrito, removendo artefatos corrompidos do arquivo anterior e apontando para `http://localhost:3000/trpc` por padrão.
- **CSS bootstrap**: `frontend/src/index.css` simplificado para CSS puro, removendo a dependência imediata de diretivas Tailwind v4 incompatíveis com a configuração atual.
- **Escopo intencional do bootstrap**: os módulos legados/originais (`authRouter.ts`, dashboards completos, componentes UI extensos e páginas históricas) **continuam presentes no repositório**, mas ficaram fora do caminho crítico de compilação para permitir saneamento incremental sem bloquear o boot.

### Estado após bootstrap
- `npm --workspace backend run dev` → deve subir o backend em `http://localhost:3000`
- `npm --workspace frontend run dev` → deve subir o frontend em `http://localhost:5173`
- `npm run build` → alvo desta etapa: compilar o caminho bootstrap mínimo

---

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
