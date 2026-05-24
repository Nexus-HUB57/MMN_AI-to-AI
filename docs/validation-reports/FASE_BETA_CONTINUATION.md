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
- `AgentContentGenerated`

Isso melhora a trilha operacional do runtime agentic sem alterar o contrato público do router.

### 4. Subscribers de auditoria adicionados ao bootstrap do backend
Foi criado `backend/src/_core/events/auditSubscribers.ts` e o backend passou a registrar subscribers padrão no startup (`backend/src/index.ts`).

Resultado:

- todos os `DomainEvent` publicados passam a gerar trilha estruturada mínima de auditoria;
- o sistema ganha um caminho simples para futura integração com Sentry / OpenTelemetry / pipelines de observabilidade.

### 5. Cobertura de testes ampliada
Foram adicionados testes unitários para os pontos mais importantes desta continuação:

- `tests/unit/eventBus.test.ts`
- `tests/unit/healthRouter.test.ts`

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
