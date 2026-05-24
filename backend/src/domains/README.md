# Domains Layer — Fase Beta Continuation

Camada de **Domain-Oriented Architecture** introduzida na continuação da Fase Beta
(commit base `149cd73aa713cb8e840574fc59e23e317804afac`).

## Objetivo

Servir como **anti-corruption layer** entre o `appRouter` central e os routers
legados em `backend/src/routers/`, preparando o monorepo para a migração gradual
para uma arquitetura de domínios independentes (Prioridade 2 do roadmap Beta).

Atualmente cada subdiretório **reexporta** o router já implementado em
`backend/src/routers/` mais um arquivo `events.ts` que centraliza os
`DomainEvent` publicados/consumidos por aquele domínio. Nesta continuação,
o domínio `commissions` passou também a contar com `types.ts`, `repository.ts`
e `service.ts`, inaugurando a trilha de extração progressiva da lógica de
negócio para dentro da pasta de domínio. Isso permite:

- migração incremental sem quebrar contratos do `appRouter`;
- ownership explícito por domínio (router + events + types + tests);
- evolução futura para `service.ts` / `repository.ts` / `worker.ts` sem
  reescrita do backend.

## Domínios atuais

| Domínio        | Router base                                  | Eventos publicados |
|----------------|-----------------------------------------------|--------------------|
| `affiliate`    | `routers/mmnRouter.ts` + `networkRouter.ts`   | `AFFILIATE_*`      |
| `commissions`  | `routers/commissionsRouter.ts`                | `COMMISSION_*`     |
| `marketplace`  | `routers/marketplacesRouter.ts`               | `MARKETPLACE_*`    |
| `agent-runtime`| `routers/agentRuntimeRouter.ts`               | `AGENT_*`          |
| `billing`      | `routers/billingRouter.ts` + `paymentsRouter` | `INVOICE_*`, `PAYMENT_*` |
| `cron`         | `routers/cronRouter.ts`                       | `SLA_BREACH`, `SYSTEM_ALERT` |
| `xp`           | `routers/xpRouter.ts`                         | `XP_*`, `CAREER_*` |
| `auth`         | `routers/authRouter.ts`                       | (em planejamento)  |
| `shared`       | Tipos e helpers compartilhados                | —                  |

## Próximos passos sugeridos

1. Migrar a lógica de `backend/src/services/*` para `domains/<x>/service.ts`.
2. Adicionar `domains/<x>/repository.ts` para isolar acesso ao Drizzle.
3. Mover testes de `tests/unit/<x>.test.ts` para `domains/<x>/tests/`.
4. Substituir, no `appRouter`, os imports de `routers/` por `domains/`.
5. Replicar o padrão de `commissions` (`types.ts` + `repository.ts` + `service.ts`) nos demais domínios priorizados.
