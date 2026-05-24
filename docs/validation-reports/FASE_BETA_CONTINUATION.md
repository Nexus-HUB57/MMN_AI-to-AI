# Fase Beta — Continuação da Transição MMN

**Data:** 2026-05-24  
**Commit-base revisado:** `149cd73aa713cb8e840574fc59e23e317804afac`  
**Objetivo:** concluir a continuação da Fase Beta a partir do pacote iniciado no commit de CI/CD + Health Monitor, consolidando a transição MMN_IA → IA com foco em **estabilização**, **arquitetura por domínios** e **event-driven wiring**.

---

## Escopo concluído

### 1. Camada `domains/` introduzida no backend
Foi criada a estrutura `backend/src/domains/` como **anti-corruption layer** para permitir a migração gradual do backend para uma arquitetura orientada a domínios, sem quebrar o `appRouter` atual.

Domínios introduzidos nesta fase:

- `affiliate`
- `commissions`
- `marketplace`
- `agent-runtime`
- `billing`
- `cron`
- `xp`
- `auth`
- `shared`

Cada domínio recebeu, no mínimo:

- `router.ts` com **reexport** do router legado equivalente;
- `events.ts` com **publishers** padronizados de `DomainEvent`;
- `index.ts` para barrel export.

Também foi criado `backend/src/domains/shared/eventFactory.ts` para padronizar a criação de eventos.

### 1.1 Evolução incremental do domínio `commissions`
Na continuação seguinte da Fase Beta, o domínio `commissions` passou a ser o primeiro a receber extração explícita de lógica interna para dentro da pasta de domínio, com:

- `backend/src/domains/commissions/types.ts`
- `backend/src/domains/commissions/repository.ts`
- `backend/src/domains/commissions/service.ts`

Com isso, o `backend/src/routers/commissionsRouter.ts` deixou de concentrar mocks, histórico, auditoria e snapshot estatístico inline, passando a atuar mais claramente como camada de transporte/orquestração.

### 1.2 Extração do domínio `affiliate`
Logo em seguida, o domínio `affiliate` recebeu o mesmo padrão:

- `backend/src/domains/affiliate/types.ts`
- `backend/src/domains/affiliate/service.ts`

O `mmnRouter` foi reduzido para uma camada de transporte que apenas injeta as dependências de banco e adapta erros do domínio (`AffiliateAlreadyExistsError`, `SponsorNotFoundError`, `AffiliateCreationFailedError`) em `TRPCError`. Toda a regra de negócio do registro de afiliado e a publicação dos eventos `AffiliateRegistered` / `AffiliateActivated` agora vivem na pasta do domínio.

### 1.3 Extração do domínio `marketplace`
Na etapa seguinte, o domínio `marketplace` passou a contar com:

- `backend/src/domains/marketplace/types.ts`
- `backend/src/domains/marketplace/repository.ts`
- `backend/src/domains/marketplace/service.ts`

O `marketplacesRouter` deixou de concentrar as regras de ownership da conta, o enfileiramento do sync, a normalização da listagem de contas e a montagem das respostas de catálogo/analytics. Essas responsabilidades agora ficam no domínio, enquanto o router apenas adapta erros tipados (`MarketplaceAccountAccessError`, `MarketplaceProductAnalyticsNotFoundError`) para `TRPCError`.

### 1.4 Extração do domínio `agent-runtime`
Na continuação seguinte, o domínio `agent-runtime` passou a contar com:

- `backend/src/domains/agent-runtime/types.ts`
- `backend/src/domains/agent-runtime/repository.ts`
- `backend/src/domains/agent-runtime/service.ts`

O `agentRuntimeRouter` deixou de concentrar o parsing de strategy, a resolução de plataforma, o bump de performance, a auditoria e a publicação de eventos do runtime. Essas responsabilidades agora ficam no domínio, enquanto o router atua como camada de transporte e adaptação de erro (`AgentNotFoundError` → `TRPCError`).

### 1.5 Extração do domínio `billing`
Na continuação seguinte, o domínio `billing` passou a contar com:

- `backend/src/domains/billing/types.ts`
- `backend/src/domains/billing/repository.ts`
- `backend/src/domains/billing/service.ts`

O `billingRouter` deixou de concentrar a leitura de faturas, paginação, criação com itens, atualização de status, histórico, estatísticas agregadas e confirmação de pagamento. Essas responsabilidades agora ficam no domínio, enquanto o router atua como camada de transporte e adaptação de erro (`InvoiceNotFoundError` → `TRPCError`).

### 1.6 Extração do domínio `cron`
Na continuação seguinte, o domínio `cron` passou a contar com:

- `backend/src/domains/cron/types.ts`
- `backend/src/domains/cron/repository.ts`
- `backend/src/domains/cron/service.ts`

O `cronRouter` deixou de concentrar a listagem paginada de jobs, o CRUD completo (`create`, `update`, `delete`), a leitura de histórico, o cálculo de estatísticas, as configurações globais, a listagem de próximas execuções e a validação de expressão `cron`. Essas responsabilidades agora ficam no domínio, junto da normalização de `jobPayload` (`JSON` opcional) e do cálculo de `nextRunAt` por frequência/expressão, enquanto o router atua como camada de transporte e adaptação de erro (`CronJobNotFoundError` → `TRPCError`). Endpoints de SLA/alertas continuam apoiados pelos serviços legados de `services/cron*`, refletindo o ponto atual da migração.

### 2. `appRouter` parcialmente migrado para a nova camada
O `backend/src/appRouter.ts` passou a consumir a camada `domains/` para os domínios priorizados nesta fase Beta:

- `auth`
- `mmn` (via `affiliateRouter`)
- `marketplaces`
- `billing`
- `commissions`
- `cron`
- `xp`
- `agent-runtime`

Com isso, o `appRouter` deixa de depender exclusivamente de imports diretos em `routers/` para os fluxos mais sensíveis da transição.

### 3. Event Bus conectado aos fluxos operacionais Beta
A infraestrutura de eventos já existente passou a ser usada em pontos concretos do runtime:

#### Affiliate / MMN
No fluxo `mmn.registerAffiliate` agora são publicados:

- `AffiliateRegistered`
- `AffiliateActivated`

#### Commissions
No fluxo `commissions.updateStatus` agora são publicados, conforme o caso:

- `CommissionApproved`
- `CommissionPaid`
- `CommissionRejected`

No fluxo `commissions.approveBatch` agora são publicados eventos `CommissionApproved` para cada item aprovado.

#### Marketplace
No worker `marketplaceSyncWorker` agora é publicado:

- `MarketplaceSyncCompleted`

O evento é emitido após o término do processamento do job, com metadados do marketplace, conta e volume sincronizado.

#### Agent Runtime
Nos fluxos `agentRuntime.generate` e `agentRuntime.generateBatch` agora são publicados:

- `AgentSessionStarted`
- `AgentSessionCompleted`
- `AgentSessionFailed`
- `AgentContentGenerated`

Isso melhora a trilha operacional do runtime agentic sem alterar o contrato público do router e garante observabilidade explícita quando o LLM falha.

#### Billing
Nos fluxos `billing.updateInvoiceStatus` e `billing.confirmPayment` agora são publicados:

- `InvoicePaid`
- `InvoiceOverdue`
- `PaymentProcessed`

Isso aproxima o domínio financeiro do mesmo padrão event-driven já adotado nos demais domínios priorizados da Fase Beta.

### 4. Subscribers de auditoria adicionados ao bootstrap do backend
Foi criado `backend/src/_core/events/auditSubscribers.ts` e o backend passou a registrar subscribers padrão no startup (`backend/src/index.ts`).

Resultado:

- todos os `DomainEvent` publicados passam a gerar trilha estruturada mínima de auditoria;
- o sistema ganha um caminho simples para futura integração com Sentry / OpenTelemetry / pipelines de observabilidade.

### 5. Cobertura de testes ampliada
Foram adicionados testes unitários para os pontos mais importantes desta continuação:

- `tests/unit/eventBus.test.ts`
- `tests/unit/healthRouter.test.ts`
- `tests/unit/commissionsDomainService.test.ts`
- `tests/unit/affiliateDomainService.test.ts`
- `tests/unit/marketplaceDomainService.test.ts`
- `tests/unit/agentRuntimeDomainService.test.ts`
- `tests/unit/billingDomainService.test.ts`
- `tests/unit/cronDomainService.test.ts`

Coberturas incluídas:

- publicação de eventos e entrega a subscribers;
- histórico, filtros e unsubscribe do Event Bus;
- probes `live` e `ready` do `healthRouter`;
- métricas de event bus e circuit breakers.

### 6. CI/CD endurecido para o monorepo atual
Os workflows do GitHub foram ajustados para a realidade atual do repositório, priorizando:

- `lint`
- `typecheck`
- `tests`
- `build`

Também foram previstos:

- `workflow_dispatch`
- `concurrency` para evitar pipelines duplicados;
- `permissions` mínimas;
- instalação compatível com o estado atual do monorepo/workspaces.

### 7. Validação estrutural sem dependências adicionada
Foi introduzido o script `scripts/validate-beta-structure.mjs`, exposto via `npm run verify:beta-structure`, para validar rapidamente os artefatos críticos da continuação Beta mesmo em ambientes com bloqueio de `npm install`.

O verificador cobre:

- presença da camada `backend/src/domains/` e dos arquivos mínimos por domínio;
- presença do primeiro extrato completo de domínio em `commissions` (`types.ts`, `repository.ts`, `service.ts`);
- presença do extrato de service do domínio `affiliate` (`types.ts`, `service.ts`) e delegação do `mmnRouter` ao service;
- presença do extrato de domínio `marketplace` (`types.ts`, `repository.ts`, `service.ts`) e delegação do `marketplacesRouter` ao domínio;
- presença do extrato de domínio `agent-runtime` (`types.ts`, `repository.ts`, `service.ts`) e delegação do `agentRuntimeRouter` ao domínio;
- presença do extrato de domínio `billing` (`types.ts`, `repository.ts`, `service.ts`) e delegação do `billingRouter` ao domínio;
- presença do extrato de domínio `cron` (`types.ts`, `repository.ts`, `service.ts`) e delegação do `cronRouter` ao domínio;
- uso da camada `domains/` no `appRouter`;
- registro dos `auditSubscribers` no bootstrap do backend;
- wiring de eventos em `mmnRouter`, `commissionsRouter`, `agentRuntimeRouter` e `marketplaceSyncWorker`;
- existência dos testes de `eventBus`, `healthRouter` e `commissionsDomainService`;
- existência do relatório `FASE_BETA_CONTINUATION.md`.

Isso cria um checkpoint de hardening estrutural útil para sandbox, revisão manual e troubleshooting de CI.

---

## Resultado técnico da continuação da Fase Beta

A Fase Beta deixa de ser apenas uma etapa de reforço documental/infra e passa a entregar **sinais concretos de modularização e desacoplamento operacional**:

- o backend começa a migrar para **ownership por domínio**;
- eventos de negócio passam a existir em fluxos reais;
- a trilha de auditoria fica melhor preparada para observabilidade enterprise;
- o `appRouter` inicia a transição para uma camada menos monolítica;
- o repositório passa a ter cobertura dedicada para **saúde** e **event-driven core**.

---

## Limites ainda existentes

Esta continuação **não conclui** a transição completa para uma arquitetura enterprise definitiva. Ainda permanecem como próximos passos naturais:

1. mover `services/` para `domains/<domínio>/service.ts`;
2. introduzir `repository.ts` por domínio para isolar o Drizzle;
3. expandir a publicação de eventos para billing, cron, auth e XP em fluxos reais;
4. adicionar tracing distribuído e persistência de eventos/auditoria;
5. consolidar a validação de build/test em ambiente CI com lockfile estável do monorepo.

---

## Status executivo

**Situação:** Continuação da Fase Beta **concluída com progresso real**.  
**Efeito prático:** a transição MMN_IA → IA avança de uma base operacional para uma base **modular, event-driven e auditável**, pronta para a próxima etapa de endurecimento operacional.
