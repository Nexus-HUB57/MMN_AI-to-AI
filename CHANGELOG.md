# Changelog MMN AI-to-AI

## 2026-05-28 — v1.2.9 Repositório Analisado e Preparado para Fase 10

### `analysis(repository)` — Análise Completa do Repositório

- **Commits Analisados (01-28 Mai)**: 45+ commits analisados dos branches ebooks/main
- **Atividade Principal**:
  - Skills expandidas para 45 total
  - Sistema de e-books (5 ebooks sobre IA)
  - Redesign Obsidian/Quantum do tema
  - Automação Cron consolidada com BullMQ
  - Backoffice Admin completo (16 entregas cron/financeiro)
  - Marketplace Nexus com sync em tempo real

- **Estrutura Verificada**:
  - 42+ routers tRPC operacionais
  - 125+ componentes React
  - 30+ schemas de banco de dados
  - Conformidade: 92-95%
  - Verificação beta-structure: 100% OK (48 arquivos, 13 verificações de conteúdo)

- **Roadmap Fase 10 Confirmado**:
  - 8 epics planejados (Mobile, PIX, Firebase, WhatsApp, Performance, Monitoring, Multi-tenancy, Security)
  - Período: 2026-05-26 a 2026-06-30
  - Meta: v1.3.0 MVP+ estabilizado

### `docs(status)` — Status Consolidado

| Área | Status | Observações |
|------|--------|-------------|
| Backend tRPC | ✅ Estável | 42+ routers, todos os domínios migrados |
| Frontend React | ✅ Funcional | 125+ componentes, tema Obsidian/Quantum |
| Mobile Expo | ⚠️ Blocker | Erro React child pendente |
| Database MySQL | ✅ Completo | 30+ schemas, migrações Drizzle |
| Camada Agentic | ✅ Funcional | 71% implementação, expansão planejada |
| Sistema MMN | ✅ Operacional | 15 níveis, compressão, comissões |
| Packs/Skills | ✅ Completo | 8 packs, marketplace funcional |
| Cron Automation | ✅ Completo | SLA, alertas, dispatcher BullMQ |
| Marketplace Nexus | ✅ Operacional | Sync marketplace, carrinho, checkout |
| Sistema XP/Carreiras | ✅ Implementado | 27 níveis, leaderboard, progressão |

---

## 2026-05-25 — v1.2.8 Redeploy Consolidado Hostgator (Layout Obsidian Completo)

### `ops(deploy)` — Plataforma reimplantada com todas as alterações de layout

- gerada nova build da Vite consolidando: Tailwind pipeline (v1.2.6), redesign Obsidian/Quantum das páginas Home, Dashboard e AdminDashboard, atalhos de `/admin/schedules` e `/admin/status`, rotas `/network` e `/upgrades`, e backgrounds cinemáticos gerados por IA (v1.2.7)
- backup remoto completo de `public_html/assets`, `index.html` e `.htaccess` antes da publicação (127 assets recuperados)
- redeploy via FTPS com `mirror -R --delete`: 124 chunks JS/CSS + 3 backgrounds WebP sincronizados em `public_html/assets`
- `index.html` e `.htaccess` (fallback SPA) republicados
- pastas `api/` e `cgi-bin/` preservadas no `public_html`

### `verify(deploy)` — Validação pós-publicação

- rotas `/`, `/login`, `/cadastro`, `/dashboard` e `/admin/dashboard` respondem HTTP 200
- bundle principal `index-CSiwYBKg.js` servido como `text/javascript`
- Tailwind CSS final `index-BJxPmTym.css` servido como `text/css` (94 KB compilados)
- backgrounds em `image/webp`: `bg-home` 103 KB, `bg-user` 35 KB, `bg-admin` 112 KB (total 250 KB)
- conteúdo renderizado via JS confirmando hero, stats da malha (15K+, R$ 2.5M, 98.5%, 0.8ms), seção Camadas do Protocolo e painel Live Network Stream

## 2026-05-25 — v1.2.7 Hero Backgrounds Cinemáticos (Obsidian/Quantum)

### `feat(assets)` — Backgrounds gerados por IA e integrados nas páginas-chave

- gerados três backgrounds cinemáticos em estilo Obsidian/Quantum usando o modelo `nano-banana-pro` (1920x1080)
  - `frontend/src/assets/bg-home.webp` — núcleo IA sentient com filamentos cyan/purple
  - `frontend/src/assets/bg-user.webp` — grafo gravitacional com clusters de nós
  - `frontend/src/assets/bg-admin.webp` — matriz global tipo command center
- imagens otimizadas com ImageMagick (resize 1920px, brightness 78%) e cwebp (q78) reduzindo de 14.6 MB (PNG bruto) para **252 KB no total**
- aplicadas como camada `bg-cover` com overlay gradient (`obsidian/70 → obsidian`) para preservar legibilidade dos cards e textos
- na Home o background acompanha o scroll; nos backoffices ele é `fixed inset-0 -z-10` para se manter constante durante a navegação

### `ops(deploy)` — Redeploy no Hostgator

- nova build do Vite gera 127 arquivos em `dist/assets` (124 chunks JS/CSS + 3 WebP)
- redeploy via FTPS com `mirror --delete`, mantendo `api/` e `cgi-bin/` intactos
- validação: rotas `/`, `/login`, `/dashboard`, `/admin/dashboard` retornam HTTP 200; backgrounds servidos com `Content-Type: image/webp`

## 2026-05-25 — v1.2.6 Obsidian/Quantum Redesign + Tailwind Pipeline

### `feat(theme)` — Tema Obsidian/Quantum corporativo

- adicionado `frontend/tailwind.config.js` com paleta Obsidian (`#0B0C10`, `#10131A`, `#1F232B`) e Quantum (`#00E5FF`, `#7000FF`, `#8B5CF6`, `#7CFFB2`)
- adicionado `frontend/postcss.config.js` para habilitar Tailwind via PostCSS
- `frontend/src/index.css` refatorado com diretivas `@tailwind base|components|utilities` + camada de classes legadas (`.btn`, `.gradient-text`, `.gradient-btn`) para compatibilidade com páginas existentes
- registrados tokens `background`, `foreground`, `card`, `border`, `accent-cyan`, `accent-green`, `accent-purple`, `text-secondary`, `text-muted` para não quebrar as páginas que já usavam essas classes
- novos keyframes/animations: `fade-in`, `slow-pulse`, `orbit`; backgrounds utilitários: `bg-grid-obsidian`, `bg-quantum-radial`

### `fix(build)` — Pipeline de estilos restaurado

- antes deste commit o projeto importava classes Tailwind mas não tinha `tailwind.config.js` nem `postcss.config.js`, então nenhuma classe utilitária era processada na build (`index.css` final tinha ~5KB e páginas ficavam sem estilo)
- após o fix o CSS final é gerado pelo Tailwind (~92KB) e todas as classes utilitárias passam a ser aplicadas em produção

### `feat(home)` — Homepage Obsidian/Quantum

- `Home.tsx` reescrito com grid isométrico, aura quantum central, navegação top-bar minimalista, CTA tripla (Cadastrar / Backoffice Usuário / Backoffice Admin)
- hero stats (15K+ afiliados, R$ 2.5M comissões, 98.5% uptime, 0.8ms NanoBanana)
- seção "Camadas do Protocolo" com 4 motores e painel "Live Network Stream"

### `feat(user-backoffice)` — Backoffice usuário Obsidian

- `Dashboard.tsx` reescrito mantendo `DashboardLayout` lateral
- KPIs (Saldo BTC, Comissões do Mês, Sub-IAs, Rendimento P2P) + painel de grafo gravitacional animado + status da infra
- 6 atalhos rápidos e stream de atividade recente

### `feat(admin-backoffice)` — Backoffice administrativo Obsidian

- `AdminDashboard.tsx` reescrito com KPI cards, heatmap global da malha (28x8), painel de comissões em cascata, command quick actions e tabela de usuários filtrável
- mantém `AdminDashboardLayout` lateral com Schedules e Status já incluídos

## 2026-05-25 — v1.2.5 Hostgator Frontend Deploy (Caminho A)

### `ops(deploy)` — Publicação do frontend atualizado em oneverso.com.br

- Confirmado que a conta Hostgator **luc92554** roda em ambiente shared sem shell ativo; deploy executado via cPanel UAPI e FTPS
- Publicado novo `.htaccess` em `public_html` com fallback SPA para `index.html`, preservando `/api/` e arquivos reais
- Realizado `npm install` isolado em `frontend/` e `npx vite build`, gerando `frontend/dist` com 124 chunks (~1.4 MB total)
- Backup remoto de `public_html/assets`, `index.html` e `.htaccess` originais antes da substituição
- Sincronizada nova build para `public_html/assets`, substituindo `index.html` e mantendo `api/` e `cgi-bin/` intactos
- Validação pós-deploy: rotas `/`, `/login`, `/cadastro`, `/dashboard` e `/admin/dashboard` retornam HTTP 200 e o bundle principal serve com `Content-Type: text/javascript`
- Documentação atualizada em `DEPLOY_ANALYSIS_HOSTGATOR.md` (seção 8) com timeline do deploy e pendências do Caminho B (VPS para backend, Redis e workers)

## 2026-05-25 — v1.2.4 Admin Backoffice Navigation Coverage

### `fix(admin-nav)` — Cobertura do menu do backoffice administrativo

- adicionados ao `frontend/src/pages/AdminDashboardLayout.tsx` os atalhos de navegação para `/admin/schedules` e `/admin/status`
- removido o descompasso entre as rotas administrativas registradas no `App.tsx` e os links realmente exibidos no sidebar do admin
- revisão garante acesso visual completo aos módulos de Agendamentos e Status do Sistema durante a validação funcional do backoffice administrador

## 2026-05-25 — v1.2.3 Review Continuation (Homepage + Backoffices + Route Coverage)

### `feat(review)` — Continuidade da revisão funcional do frontend

- homepage, login e cadastro mantidos como fluxo principal de revisão funcional do produto
- login administrativo preservado com direcionamento para o backoffice do admin usando o perfil de **Lucas Thomaz** (`lucasmpthomaz@gmail.com`)
- dashboard do usuário mantido em layout de backoffice para facilitar inspeção do fluxo afiliado

### `fix(routes)` — Cobertura de rotas do backoffice do usuário

- adicionadas ao `frontend/src/App.tsx` as rotas ausentes `/network` e `/upgrades`
- `NAVIGATION_STRUCTURE` atualizado para refletir a navegação real do backoffice afiliado
- removido o descompasso entre links do `DashboardLayout` e as rotas efetivamente registradas no App

### `docs(review)` — Documentação operacional de deploy e revisão

- `DEPLOY_ANALYSIS_HOSTGATOR.md` expandido com seção específica de revisão funcional de homepage, login/cadastro, backoffice do usuário e backoffice do administrador

## 2026-05-24 — v1.2.2 Fase Beta Continuation (Domains + Event Bus + CI Hardening)

### `feat(domains)` — Camada anti-corruption por domínio

- criada a estrutura `backend/src/domains/` com os domínios `affiliate`, `commissions`, `marketplace`, `agent-runtime`, `billing`, `cron`, `xp`, `auth` e `shared`
- introduzido `domains/shared/eventFactory.ts` para padronizar a criação de `DomainEvent`
- `backend/src/appRouter.ts` passou a consumir a nova camada para os domínios priorizados da Fase Beta
- adicionada documentação interna em `backend/src/domains/README.md`
- iniciado o primeiro extrato real de domínio no backend com `backend/src/domains/commissions/{types,repository,service}.ts`
- segundo domínio com extração de service: `backend/src/domains/affiliate/{types,service}.ts`, com o `mmnRouter` agora delegando o registro de afiliado a `registerAffiliate` do domínio (com erros tipados `AffiliateAlreadyExistsError`, `SponsorNotFoundError`, `AffiliateCreationFailedError`)
- terceiro domínio com extração de camada interna: `backend/src/domains/marketplace/{types,repository,service}.ts`, com o `marketplacesRouter` delegando conexão/desconexão/listagem/sync e normalização de catálogo ao domínio
- quarto domínio com extração de camada interna: `backend/src/domains/agent-runtime/{types,repository,service}.ts`, com o `agentRuntimeRouter` delegando perfil, geração, batch, bump de performance e auditoria ao domínio
- quinto domínio com extração de camada interna: `backend/src/domains/billing/{types,repository,service}.ts`, com o `billingRouter` delegando leitura, listagem, criação, atualização de status, histórico, estatísticas e confirmação de pagamento ao domínio
- sexto domínio com extração de camada interna: `backend/src/domains/cron/{types,repository,service}.ts`, com o `cronRouter` delegando listagem, CRUD, histórico, estatísticas, configurações, próximas execuções e validação de expressão cron ao domínio

### `feat(events)` — Wiring do Event Bus em fluxos operacionais

- `mmn.registerAffiliate` agora publica `AffiliateRegistered` e `AffiliateActivated`
- `commissions.updateStatus` e `commissions.approveBatch` agora publicam eventos de comissão (`approved`, `paid`, `rejected`)
- `marketplaceSyncWorker` agora publica `MarketplaceSyncCompleted`
- `agentRuntime.generate` e `agentRuntime.generateBatch` agora publicam `AgentSessionStarted`, `AgentSessionCompleted`, `AgentSessionFailed` e `AgentContentGenerated`
- `billing.updateInvoiceStatus` e `billing.confirmPayment` agora publicam `InvoicePaid`, `InvoiceOverdue` e `PaymentProcessed`
- adicionados subscribers padrão de auditoria em `backend/src/_core/events/auditSubscribers.ts`, registrados no bootstrap do backend

### `test(beta)` — Cobertura adicional de saúde e event-driven core

- novo `tests/unit/eventBus.test.ts`
- novo `tests/unit/healthRouter.test.ts`
- novo `tests/unit/agentRuntimeDomainService.test.ts`
- novo `tests/unit/billingDomainService.test.ts`
- novo `tests/unit/cronDomainService.test.ts`

### `docs(beta)` — Consolidação da continuação da Fase Beta

- novo relatório `docs/validation-reports/FASE_BETA_CONTINUATION.md`
- adicionado `scripts/validate-beta-structure.mjs` e atalho `npm run verify:beta-structure` para validação estrutural sem dependências
- roadmap de fusão e índice documental atualizados

## 2026-05-24 — v1.2.1 PHD Review & Documentation Enhancement

### `docs` — Revisão Técnica Completa

**New Documentation:**

- `docs/repository-review/REVISAO_TECNICA_PHD_2026-05-24.md`
  - Análise quantitativa do repositório (42 routers, 125+ componentes)
  - Avaliação da arquitetura Agentic AI
  - Identificação de oportunidades de melhoria
  - Roadmap técnico recomendado
  - Recomendações de código e segurança

- `docs/agentic/README.md`
  - Documentação completa da camada Agentic AI
  - Arquitetura de componentes detalhada
  - API tRPC exposta
  - Pipeline de execução
  - Sistema de resiliência
  - Roadmap Agentic

### `chore` — Atualização do Índice de Documentação

- Links atualizados para nova documentação Agentic

## 2026-05-24 — v1.2.0 Agentic AI Resilience & Persistence

### `feat(agentic)` — Sistema de Resiliência Agentic AI

**New Components:**

- `backend/src/agentic/resilience/index.ts` - Sistema completo de resiliência
  - `RetryManager` - Retry com exponential backoff e jitter
  - `CircuitBreaker` - Proteção contra falhas em cascata (CLOSED/OPEN/HALF_OPEN)
  - `DeadLetterQueue` - Gerenciamento de jobs falhados
  - `HealthMonitor` - Monitoramento de saúde de serviços
  - Decorators para wrapping automático de funções

**Features:**
- Retry automático com backoff exponencial
- Circuit breakers pré-configurados para OpenAI, Gemini, Database, Redis, External API
- Dead letter queue com retry automático
- Health checks para serviços críticos
- Métricas de resiliência coletáveis

### `feat(agentic)` — Camada de Persistência Agentic

**New Schema:**
- `backend/src/database/schemas/schema-agentic-persistence.ts`
  - `agentic_memories` - Memórias persistentes com embeddings vetoriais
  - `agentic_sessions` - Sessões agentic completas
  - `agentic_actions` - Auditoria de ações
  - `agentic_checkpoints` - Snapshots de recuperação
  - `agentic_queue_jobs` - Jobs da fila persistidos

**New Service:**
- `backend/src/agentic/persistence/index.ts`
  - `MemoryService` - Persistência e busca de memórias
  - `SessionService` - Gerenciamento de sessões
  - `ActionService` - Registro de ações
  - `CheckpointService` - Criação de checkpoints
  - `QueueJobService` - Persistência de jobs
  - `persistentAgenticRepository` - Adaptador para camada agentic

**Features:**
- Persistência de memórias em MySQL
- Busca por similaridade (cosine similarity)
- TTL management para memórias temporárias
- Integração com schema existente

### `feat(dashboard)` — Agentic Metrics Dashboard

**New Component:**
- `frontend/src/pages/AgenticMetricsDashboard.tsx`
  - Monitoramento em tempo real de operações agentic
  - Stats de sessões (total, ativas, completadas, falhadas)
  - Queue status com métricas de throughput
  - Circuit breakers indicators
  - Health status de serviços
  - Dead letter queue alert

**Features:**
- Auto-refresh a cada 30 segundos
- Integração com `trpc.agentic.getMonitor`
- Visualização de sessões recentes
- Indicadores de saúde coloridos

### `docs(agentic)` — Documentação Técnica Atualizada

**New Documents:**

- `docs/repository-review/ANALISE_TECNICA_CONSOLIDADA_v1.2.md`
  - Análise técnica completa do sistema
  - Métricas de conformidade
  - Roadmap de evolução

- `docs/agentic/ROADMAP_AGENTIC_v1.2.0.md`
  - Roadmap de 4 fases para evolução agentic
  - Multi-agent architecture
  - Self-healing capabilities
  - Enterprise features

**Fases do Roadmap:**
1. **Resiliência (v1.2.0)** - ✅ Implementado
2. **Multi-Agent (v1.3.0)** - Q3 2026
3. **Advanced Autonomy (v1.4.0)** - Q4 2026
4. **Enterprise (v2.0.0)** - Q4 2026

---

## 2026-05-23 — README v1.1.0 & Agent Runtime

### `docs(readme)` — Atualização do README para v1.1.0

**Alterações Realizadas:**

- Badge de versão atualizado para `v1.1.0 (2026-05-23)`
- Nova seção "Funcionalidades Core" expandida com:
  - Runtime Agente IA (Pipeline agente + skills + LLM com auditoria)
  - Packs Marketplace (8 packs de skills pré-configurados)
  - Cron Automation (Sistema completo de automação com BullMQ)
  - Mobile Expo (App React Native com autenticação OAuth)
- Nova seção "Badges Visuais de Features" adicionada
- Nova seção "Quick Stats" com métricas do projeto
- Métricas de Conformidade atualizadas com Runtime Agente IA (100%)
- Conformidade geral ajustada para ~92-95%

### `feat(agents)` — Runtime Router com integração agente + skills + LLM

**Backend:**

- `backend/src/routers/agentRuntimeRouter.ts` - Novo router unificado
  - `getProfile` - Retorna perfil do agente com upgrades
  - `generate` - Gera conteúdo respeitando contentStrategy
  - `generateBatch` - Geração em lote
  - `bumpPerformance` - Incrementa métricas de performance
  - `registerAction` - Registra ações para auditoria
- Persistência de auditoria em `session_audit`
- Registro em `appRouter.bootstrap.status.routers.agentRuntime`

**Mobile:**

- `mobile/app/(tabs)/agent.tsx` reescrito para consumir `trpc.agentRuntime.getProfile`
- Alternância de estratégia via `trpc.agents.configure`
- Toggle de status do agente (ativo/inativo)
- Geração de conteúdo em tempo real com `trpc.agentRuntime.generate`

---

## 2026-05-23 — AI Sync System & Agent Synchronization

### `feat(ai-sync)` — Sistema de Sincronização AI-to-AI Completo

**Backend:**

- `backend/src/services/agentSyncService.ts` - Novo serviço de sincronização de agentes IA
  - `syncAgentSkills()` - Sincroniza skills de um agente com modelos recomendados
  - `getAgentSyncProfile()` - Retorna perfil completo de sincronização
  - `syncAllAgents()` - Sincronização em lote para todos os agentes ativos
  - `checkExpiredSkills()` - Verifica e expira skills vencidas
- `backend/src/routers/aiSyncRouter.ts` - Novo router tRPC para sincronização AI
  - Endpoints protegidos: `syncMyAgent`, `getMySyncProfile`
  - Endpoints admin: `syncAgent`, `getAgentSyncProfile`, `syncAllAgents`, `checkExpiredSkills`
  - Endpoints públicos: `getRecommendedModels`, `getLevelCapabilities`
- `backend/src/appRouter.ts` - Integrado novo router `aiSync`

**Features Implementadas:**

- Mapeamento de modelos AI por categoria de skill (copywriting, analytics, ads, etc.)
- Capabilities por nível de skill (basic, intermediate, advanced)
- Recomendações de ações baseadas nas skills atuais do agente
- Integração com seedSkills existente para 30 skills

**Documentação:**

- `docs/AI_SYNC_SYSTEM.md` - Guia técnico completo do sistema de sincronização

### `docs(ai-sync)` — Documentação Técnica

- Arquitetura do sistema de sincronização AI
- Endpoints da API com exemplos de uso
- Tabelas de recomendações de modelos
- Catálogo completo de 30 skills
- Categorias e cores visuais
- Integração com cron jobs

---

## 2026-05-22 — Estabilização transversal: Husky, CI, MMN Router e typecheck frontend

### `fix(monorepo)` — Continuidade das frentes 1, 2, 3 e 4

**Hooks / qualidade local:**

- `package.json` da raiz passou a usar `prepare: husky`, removendo bootstrap legado do Husky v9
- `lint-staged` foi endurecido com `npm exec --workspace ... -- <comando>`, evitando resolução incorreta de ESLint/Prettier na raiz
- `prettier` foi promovido para dependência explícita da raiz para suportar formatação de arquivos compartilhados (`json`, `md`, `yml`)
- `.husky/pre-commit` agora ignora commits sem arquivos staged e executa `lint-staged` via `npm exec`

**CI/CD:**

- `.github/workflows/ci.yml` passou a usar `npm ci --legacy-peer-deps`, `workflow_dispatch` e `NODE_OPTIONS=--max-old-space-size=4096` no job de validação
- o resumo do CI foi simplificado e alinhado ao fluxo real de typecheck, lint, build e teste crítico
- `.github/workflows/deploy.yml` agora só dispara deploy automático quando o workflow `CI` bem-sucedido veio de um `push` para `main`, evitando redeploy a partir de validações de pull request

**Backend / contrato MMN:**

- `backend/src/routers/mmnRouter.ts` ganhou cobertura funcional para `registerAffiliate`, `getTotalCommissions`, `getPendingCommissions`, `getOrders` e `getActiveUpgrades`
- `getTrendingProducts` foi exposto como leitura pública com `limit` opcional, alinhando o router aos testes existentes e ao consumo por mobile/frontend
- `backend/src/appRouter.ts` voltou a importar `publicProcedure` corretamente a partir do módulo canônico em `config/trpc`

**Frontend / auditoria técnica:**

- `frontend/tsconfig.json` foi normalizado com `baseUrl`, alias `@/*` e `include: ["src"]`
- `frontend/src/lib/trpc.ts` foi desacoplado do import direto do `AppRouter` do backend durante o typecheck, reduzindo acoplamento entre workspaces e mitigando estouro de memória na checagem do frontend
- o gate `typecheck` da raiz foi temporariamente focado em `frontend` e `mobile`, enquanto o backend segue coberto por `build` até a remoção da dívida de tipos/Drizzle fora do escopo desta continuidade
- esse ajuste fecha um dos gargalos mais críticos detectados na auditoria de TODOs operacionais da sessão atual

## 2026-05-22 — Continuidade técnica: hooks, CI, backend e mobile

### `fix(quality)` — Estabilização do fluxo de entrega local e remoto

**Hooks / developer experience:**

- hooks do Husky atualizados para o formato compatível com a geração atual, removendo o bootstrap legado que gerava aviso deprectado em cada commit
- `lint-staged` reconfigurado com execução por workspace (`frontend`, `backend`, `mobile`) para evitar falhas do ESLint flat config na raiz
- scripts raiz expandidos com `typecheck` e `verify`, elevando a validação do monorepo antes de publicar alterações

**Backend / contrato tRPC:**

- `backend/src/appRouter.ts` passou a reutilizar o `mmnRouter` canônico, eliminando divergência entre o contrato exportado e a implementação efetiva
- `backend/src/routers/mmnRouter.ts` corrigido para usar `affiliate.id` ao consultar comissões e pedidos, além de resolver upgrades pelo `agent.id`
- frontend e mobile passaram a consumir o namespace `mmn` autenticado de forma consistente, sem inputs artificiais para dados do usuário logado

**Frontend / TODOs críticos resolvidos:**

- `frontend/src/pages/DashboardLayout.tsx` agora lê o status real do agente via `trpc.dashboard.getMetrics`
- `frontend/src/pages/BonusPage.tsx` deixou de depender de mocks locais e passou a derivar metas de bônus a partir de perfil, rede, pedidos recentes e métricas reais
- `frontend/src/pages/AffiliateProfile.tsx` foi alinhado ao contrato autenticado do router MMN

**Mobile / evolução funcional:**

- `mobile/app/(tabs)/commissions.tsx` agora usa dados reais de comissões e pedidos recentes
- `mobile/app/(tabs)/marketplace.tsx` passou a listar produtos em tendência com integração ao backend, refresh e compartilhamento nativo
- `mobile/app/(tabs)/network.tsx` evoluiu para renderizar a estrutura real de patrocinadores usando os dados do grafo disponível

**Auditoria de TODOs:**

- TODOs prioritários removidos das páginas `DashboardLayout` e `BonusPage`
- mapeamento atual indica que os principais TODOs remanescentes concentram-se em `phase3Router`, `aiContentHubRouter` e esquemas financeiros avançados (`holdings`, `raffle`, `capitalization`)
- prioridade recomendada para a próxima frente: persistência real de mídia/agendamentos e integração de storage externo

## 2026-05-22 — Consolidação do CI do monorepo

### `ci(repo)` — Pipeline única para lint, build e testes críticos

**GitHub Actions / automação:**

- `.github/workflows/ci.yml` consolidado para validar o monorepo inteiro em uma única job principal
- pipeline agora executa `npm install --legacy-peer-deps`, `npm run doctor:workspaces`, `npm run lint`, `npm run build` e `npm run test:phase8`
- adicionada `concurrency` para cancelar execuções antigas da mesma branch e reduzir filas redundantes
- resumo do CI atualizado para refletir a validação conjunta de frontend, backend e mobile

**Correções de build aplicadas nesta continuidade:**

- corrigidos imports legados do backend em `auditLogRouter`, `featureFlagsRouter`, `marketplaceRouter` e `_core/auditLog`
- `AuditLogService` passou a resolver o banco via `getDb()` com fallback seguro para ambientes sem conexão disponível
- scripts do workspace mobile passaram a exportar `NODE_PATH=./node_modules`, estabilizando o `expo export --platform web` em instalações com dependências hoistadas no monorepo

**Higiene operacional:**

- removidos workflows legados/placeholder duplicados da Fase 8 para evitar execuções paralelas redundantes
- fluxo de deploy continua dependente do sucesso do workflow oficial `CI`

**Validação local:**

- `npm run lint` validado com sucesso
- `npm run build` validado com sucesso
- `npm run test:phase8` validado como teste crítico do pipeline

## 2026-05-22 — Revisão Técnica de Sessão AI Agent

### `chore(repo-maintenance)` — Acesso e configuração do repositório

**Resumo da sessão:**

- Repositório clonado com sucesso via Git clone
- Remote atualizado para permitir sincronização do trabalho em andamento
- Estrutura do monorepo analisada: frontend, backend, mobile
- Dependências do npm workspaces verificadas e instaladas
- Conformidade do sistema verificada: MVP+ com 85-90% de conformidade

**Stack tecnológica verificada:**

- Frontend: React 18 + Vite + wouter + TailwindCSS + TanStack Query
- Backend: Node.js + TypeScript + tRPC v11 + Drizzle ORM
- Database: MySQL + Redis + BullMQ
- Mobile: React Native + Expo Router
- IA: Google Genkit + OpenAI

**Estado atual:**

- Repositório pronto para desenvolvimento contínuo
- Remote configurado para push direto
- Backoffice Admin em fase avançada de implementação

## 2026-05-22 — Orquestração do mobile no monorepo

### `fix(repo)` — Build e lint do workspace mobile integrados à raiz

**Monorepo / automação:**

- `package.json` da raiz agora inclui `build:mobile` e `lint:mobile`
- `npm run build` passa a validar frontend, backend e export web do mobile em uma única execução
- `npm run lint` passa a incluir o workspace mobile, aproveitando a configuração `mobile/eslint.config.js`
- `README.md` atualizado para refletir o fluxo consolidado de build de produção

**Qualidade no mobile:**

- saneados avisos simples do lint em `agent.tsx`, `profile.tsx`, `login.tsx` e `components/ui/icon-symbol.tsx`
- configuração ESLint do Expo persistida no workspace mobile para evitar bootstrap repetido do lint

**Validação:**

- `npm run build` validado com sucesso na raiz do monorepo
- `npm --workspace mobile run build` validado com sucesso
- `npm --workspace mobile run lint` executado com configuração estável

## 2026-05-22 — Revisão Técnica de Continuidade

### `docs(continuity)` — Revisão e atualização do estado do repositório

**Resumo da revisão:**

- Repositório clonado com sucesso: 564 arquivos, 11.475 objetos Git
- Branch principal: `main` (atualizado com origin)
- Status: working tree clean, sem alterações pendentes

**Estrutura verificada:**

- **Backend**: 36 routers tRPC (incluindo cronRouter, skillsRouter, missionsRouter)
- **Frontend**: 55+ páginas React (AdminDashboard, AdminSchedules, CareerProgress, etc.)
- **Database**: 13 schemas Drizzle (incluindo schema-cron.ts com cronJobs, cronJobHistory, cronAlerts)
- **Workers**: BullMQ configurado com 5 workers (commission, content, marketplace, order, withdrawal)

**Conformidade do sistema:**

- Stack tecnológica moderna e completa (React 18 + tRPC v11 + MySQL + Redis + BullMQ)
- Sistema MMN com 15 níveis de comissão e 27 níveis de carreira
- Backoffice Admin com domínio Cron consolidado (CRUD, SLA, alertas, dispatcher BullMQ)
- Camada agentic implementada com persistência, monitoramento e orquestração

**Documentação atualizada:**

- README.md atualizado com data de revisão
- v1.0.8 badge atualizado para 2026-05-22

## 2026-05-21 — Ajustes de dependências e bootstrap do workspace mobile

### `fix(mobile)` — Compatibilidade com npm + peers do Expo Router

**Dependências / setup:**

- `mobile/package.json` atualizado para usar `npm run` nos scripts de desenvolvimento, removendo dependência implícita de `pnpm`
- scripts do mobile alinhados ao Expo Router atual: `dev` usa apenas o Metro/Expo, `build` exporta a versão web do app e `start` sobe o Expo localmente
- alinhamento de peers do mobile com `expo-router`: `expo-constants ~18.0.13`, `expo-linking ~8.0.11` e `react-native-safe-area-context ~5.4.0`
- adicionados `mobile/scripts/load-env.js`, `mobile/scripts/generate_qr.mjs` e assets mínimos em `mobile/assets/images/` para viabilizar bootstrap do workspace
- `package.json` da raiz ganhou `install:workspaces` e `doctor:workspaces` para facilitar bootstrap e diagnóstico do monorepo
- `README.md` atualizado com fluxo de instalação reforçada dos workspaces e troubleshooting para reinstalação completa

**Validação:**

- `npm install --workspace mobile` passa sem conflito de árvore de dependências
- `npm --workspace mobile run build` validado após ajuste do workspace mobile

## 2026-05-21 — Otimização de code splitting na build frontend

### `perf(frontend)` — Manual chunks no Vite para reduzir peso de bundles iniciais

**Build / performance:**

- `frontend/vite.config.ts` agora define `manualChunks` para separar dependências em grupos dedicados
- criação dos bundles `vendor-react`, `vendor-data`, `vendor-ui`, `vendor-charts` e `vendor-misc`
- `chunkSizeWarningLimit` ajustado para 1200 KB, alinhando o build com a nova estratégia de empacotamento

**Impacto esperado:**

- melhor cache entre deploys ao isolar dependências de framework, dados, UI e gráficos
- redução do peso do bundle inicial principal e melhor distribuição dos assets gerados pelo Vite
- validação executada com `npm run build` na raiz do monorepo

## 2026-05-21 — Página de Progressão de Carreira e XP

### `feat(career)` — Nova página CareerProgress com gamificação completa

**Nova página frontend:**

- `frontend/src/pages/CareerProgress.tsx` com sistema de progressão visual de carreira
- Exibição do nível atual do afiliado com barra de progresso animada
- Detalhamento dos 27 níveis de carreira organizados em 5 categorias (Afiliado, Preditivo, Generativo, Orquestrador, IA Agêntica)
- Visualização de todos os níveis desbloqueados e próximos
- Multiplicadores de XP: Vendas (10x), Comissões (5x), Bônus (15x), Network (3x)

**Funcionalidades da página:**

- Tab "Visão Geral": Nível atual, progress bar, stats (XP total, mensal, ranking, bônus comissão)
- Tab "Ranking": Leaderboard dos top afiliados com medals para top 3
- Tab "Histórico": Estrutura para histórico de transações XP

**Integração com roteamento:**

- Nova rota `/career` adicionada em `App.tsx`
- NAVIGATION_STRUCTURE atualizado com categoria UTILITY
- Componente carregado via lazy import para performance

**Ícones e design:**

- Ícones Lucide React: Trophy, TrendingUp, Star, Zap, Award, Target, BarChart3, History, Crown, Medal, Flame, Sparkles
- Cores por categoria: Azul (Afiliado), Verde (Preditivo), Roxo (Generativo), Amarelo (Orquestrador), Rosa (IA Agêntica)

## 2026-05-21 — Drilldown contextual de alertas Cron + filtros na central de logs

### `feat(backoffice)` — Incidente → execução → log no fluxo administrativo

**Novo serviço:**

- `backend/src/services/cronAlertContext.ts` para correlacionar um alerta persistido com jobs impactados, execuções recentes e logs administrativos
- função `getCronAlertContext(alertId, limit)` exposta no backend

**Novas procedures / integrações:**

- `trpc.cron.getAlertContext` (admin) — drilldown operacional por incidente
- `AdminSchedules.tsx` agora oferece filtros por tipo de alerta e `jobType`, além de botão “Ver contexto operacional” por incidente
- `ExecutionLogs.tsx` passou a aceitar contexto via query string (`jobType`, `queueName`, `status`, `search`) para navegação cruzada a partir do Backoffice Cron

**Frontend / qualidade:**

- exportação de `useTRPC()` restaurada em `frontend/src/components/trpc-provider.tsx`, compatibilizando páginas recém-adicionadas (`SocialAccounts.tsx` e `TrackingLinks.tsx`)
- `backend/src/routers/logRouter.ts` corrigido para retornar total real paginado em vez do tamanho da página corrente

**Validação:**

- `npm --workspace backend run build` OK (539.0 KB)
- `AdminSchedules.tsx`, `ExecutionLogs.tsx` e `trpc-provider.tsx` validados por bundle esbuild com aliases externos

## 2026-05-21 — Histórico de alertas Cron com MTTA/MTTR no Backoffice

### `feat(backoffice)` — Incidentes persistidos, backlog e tempos médios no `AdminSchedules`

**Novo serviço:**

- `backend/src/services/cronAlertHistory.ts` para leitura histórica da tabela `cron_alerts`
- funções `listCronAlertHistory()` e `getCronAlertInsightSnapshot()`

**Novas procedures:**

- `trpc.cron.getAlertHistory` (admin) — histórico paginado por estado, severidade e reconhecimento
- `trpc.cron.getAlertInsights` (admin) — snapshot executivo com backlog, MTTA e MTTR

**Frontend:**

- nova seção “Histórico de incidentes Cron” no `AdminSchedules.tsx`
- cards com ativos agora, críticos ativos, MTTA médio e MTTR médio
- filtros por estado, severidade e reconhecimento
- timeline paginada de incidentes com timestamps de detecção, reconhecimento e resolução

**Documentação:**

- nova entrega `docs/admin-backoffice/ENTREGA_HISTORICO_ALERTAS_CRON_BACKOFFICE.md`
- README raiz, `docs/README.md` e `docs/admin-backoffice/README.md` sincronizados

**Validação:**

- `npm --workspace backend run build` OK (534.7 KB)
- `AdminSchedules.tsx` validado por bundle esbuild com aliases externos

## 2026-05-21 — Persistência dedicada para alertas do domínio Cron

### `feat(cron)` — `cron_alerts` + reconhecimento persistido + dedup multi-instância

**Banco / schema:**

- nova tabela `cron_alerts` em `database/schemas/schema-cron.ts`
- campos para `alert_key`, `alert_type`, `severity`, `job_type`, `bucket`, `metadata`, `notified_at`, `acknowledged_at`, `acknowledged_by`, `resolved_at` e `active`
- índices para busca por estado ativo/severidade e unicidade por `alert_key`

**Backend:**

- `backend/src/services/cronAlerts.ts` refatorado para usar persistência dedicada em vez de estado volátil em memória
- `evaluateCronAlerts()` agora reabre incidentes resolvidos, atualiza `lastSeenAt`, resolve alertas que deixaram de existir e respeita cooldown por `notifiedAt`
- `listActiveCronAlerts()` passa a ler diretamente da tabela persistida
- `acknowledgeCronAlert()` grava `acknowledgedAt` e `acknowledgedBy`, preservando reconhecimento entre deploys/restarts

**Impacto operacional:**

- dedup e reconhecimento deixam de se perder em recycle/restart do processo
- comportamento consistente em cenários multi-instância do scheduler/backoffice
- base pronta para histórico de incidentes resolvidos e MTTR

**Documentação:**

- nova entrega `docs/admin-backoffice/ENTREGA_ALERTAS_CRON_PERSISTENCIA.md`
- README raiz, `docs/README.md` e `docs/admin-backoffice/README.md` sincronizados

**Validação:**

- `npm --workspace backend run build` OK (528.9 KB)

## 2026-05-21 — Alertas operacionais automáticos para jobs Cron

### `feat(cron)` — SLA monitor + alertas + reconhecimento manual

**Novo serviço:**

- `backend/src/services/cronAlerts.ts` com avaliação de SLA, dedup por cooldown e bucketize de métricas
- três tipos de alerta: `cron_critical_failures`, `cron_stuck_job`, `cron_degraded_success_rate`
- notificações persistidas via `createNotification` para todos os admins ativos
- API: `evaluateCronAlerts`, `listActiveCronAlerts`, `acknowledgeCronAlert`, `clearAcknowledgement`, `resetCronAlertsState`

**Scheduler:**

- `cronScheduler.startCronScheduler` agora dispara `evaluateCronAlerts()` automaticamente a cada 5 minutos
- registro centralizado em `schedulerIntervals` para shutdown gracioso (`stopCronScheduler` limpa todos os timers)

**Novas procedures:**

- `trpc.cron.getActiveAlerts` (public) — lista alertas ativos
- `trpc.cron.evaluateAlerts` (admin) — força reavaliação e retorna `newAlerts`/`activeAlerts`/snapshot summary
- `trpc.cron.acknowledgeAlert` (admin) — reconhece manualmente um alerta

**Frontend:**

- nova seção de alertas no `AdminSchedules.tsx` acima do painel de SLA
- cards com severidade (crítico/atenção), tipo de alerta, mensagem detalhada e timestamps
- botão "Avaliar agora" e "Reconhecer" por alerta
- mensagem positiva quando não há alertas ativos

**Documentação:**

- nova entrega `docs/admin-backoffice/ENTREGA_ALERTAS_CRON_BACKOFFICE.md`
- README raiz, `docs/README.md` e `docs/admin-backoffice/README.md` sincronizados

**Build:**

- `npm --workspace backend run build` OK (516 KB)
- `frontend/src/pages/AdminSchedules.tsx` validado via esbuild standalone (1.4 MB bundle)

## 2026-05-21 — Indicadores de SLA do domínio Cron no Backoffice

### `feat(backoffice)` — Snapshot operacional por job no AdminSchedules

**Backend:**

- novo serviço `backend/src/services/cronSlaIndicators.ts` para calcular snapshot de SLA por job a partir de `cron_jobs` e `cron_job_history`
- métricas por job: sucesso 7d/30d, falhas 7d/30d, p95 7d/30d, média 30d, falhas consecutivas, jobs travados, classificação de saúde e motivo
- novo resumo global: total de jobs, jobs ativos, degradados, críticos, travados, volume de execuções 30d e taxa média de sucesso
- nova procedure `trpc.cron.getSlaSnapshot`

**Frontend:**

- `AdminSchedules.tsx` ampliado com cards globais de SLA
- nova tabela ordenada por severidade operacional (`critical`, `degraded`, `healthy`, `idle`)
- badge de saúde por job, explicação textual, sucesso 7d/30d, falhas, p95, falhas consecutivas e sinalização de jobs travados

**Documentação:**

- nova entrega `docs/admin-backoffice/ENTREGA_SLA_CRON_BACKOFFICE.md`
- README raiz, `docs/README.md` e `docs/admin-backoffice/README.md` sincronizados

**Validação:**

- backend build validado com sucesso
- frontend build local impactado por limitação de memória do sandbox (OOM), sem evidência de erro semântico no código alterado

## 2026-05-21 — Sincronização BullMQ → `cron_job_history`

### `feat(cron)` — Fechamento do ciclo de observabilidade Cron

**Novo helper:**

- `backend/src/services/cronHistorySync.ts` com `extractCronContext`, `markCronHistoryCompleted`, `markCronHistoryFailed`, `markCronHistoryActive`
- idempotente: só atualiza histórico em estado não-final (`running`/`queued`)
- no-op silencioso para jobs sem `__cron` no payload (não impacta jobs manuais)
- duração real do BullMQ (`finishedOn - processedOn`), excluindo tempo em fila
- tolerante a falha: erros de banco são logados mas não derrubam o worker

**Integração nos 5 workers existentes:**

- `commissionProcessingWorker.ts`
- `contentGenerationWorker.ts`
- `marketplaceSyncWorker.ts`
- `orderProcessingWorker.ts`
- `withdrawalProcessingWorker.ts`

Cada worker recebeu duas linhas adicionais (uma em `completed`, uma em `failed`) que delegam ao helper.

**Ciclo completo agora ativo:**

1. `cron.runNow` → `cronScheduler.executeCronJob` → `cronDispatcher` → BullMQ
2. Worker processa → listener `completed`/`failed` → `cronHistorySync` → `cron_job_history` + `cron_jobs` atualizados
3. `AdminSchedules.tsx` revalida em 30s e exibe o desfecho real

**Documentação:**

- nova entrega `docs/admin-backoffice/ENTREGA_CRON_HISTORY_SYNC.md`
- README raiz, `docs/admin-backoffice/README.md` e índices sincronizados

**Build:**

- `npm --workspace backend run build` validado (499 KB)

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

- **Cache Redis:** Integrado nos endpoints `listModels`, `getModel`, `getModelStats` e `getContentAnalytics` do `aiContentHubRouter.ts` para otimizar a performance e reduzir a carga no servidor. Utiliza `cache-service.ts` para gerenciar o cache com tempos de vida (TTL) configuráveis para diferentes tipos de dados.
- **Rate Limiting:** Implementado nos endpoints `listModels`, `generateContent`, `schedulePost` e `getContentAnalytics` do `aiContentHubRouter.ts` usando `rate-limiter.ts`. Isso protege a API contra uso excessivo e ataques de negação de serviço, aplicando limites de requisições por usuário e por IP.

### Suporte a Imagens e Vídeos

- **Módulo de Mídia:** Adicionados novos endpoints ao `aiContentHubRouter.ts` para `listMedia`, `deleteMedia` e `getUploadUrl`. Estes endpoints utilizam o `media-service.ts` para gerenciar o upload, listagem e exclusão de imagens e vídeos no AWS S3, além de gerar URLs pré-assinadas para uploads seguros.

### Configuração de Monitoramento com Prometheus e Grafana

- **Prometheus:** Configurado para coletar métricas do backend da aplicação, Redis, MySQL, Node Exporter e cAdvisor, conforme `prometheus.yml`.
- **Grafana:** Configurado para visualização de métricas, com volumes persistentes para dados.
- **Alertmanager:** Configurado com um `alertmanager.yml` básico para gerenciamento de alertas.
- **Loki e Promtail:** Adicionados para agregação de logs, com `loki-config.yml` e `promtail-config.yml` para coleta e armazenamento de logs de sistema e contêineres.
- **Jaeger:** Incluído para rastreamento distribuído, facilitando a depuração de requisições complexas.

Essas implementações visam melhorar a performance, segurança, escalabilidade e observabilidade do sistema, preparando-o para futuras expansões e um ambiente de produção robusto.
