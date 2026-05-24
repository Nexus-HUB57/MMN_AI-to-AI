# Validação de Fusão — Preparação da Fase 3

**Data:** 2026-05-15  
**Branch de trabalho:** `fix/bootstrap-runtime`

## Objetivo
Preparar a **reintrodução gradual dos routers históricos** do backend, reduzindo o acoplamento causado por imports relativos quebrados e criando uma camada de compatibilidade para o monorepo modernizado.

## Escopo implementado nesta etapa
1. **Normalização de imports dos routers principais**:
   - `authRouter.ts`
   - `systemRouter.ts`
   - `dashboardRouter.ts`
   - `mmnRouter.ts`
   - `notification.ts`
2. **Criação de shims de compatibilidade** para caminhos legados ainda referenciados por routers e services, incluindo:
   - `backend/src/routers/_core/trpc.ts`
   - `backend/src/routers/db.ts`
   - `backend/src/drizzle/schema.ts`
   - `backend/src/database/schemas/*`
   - `backend/src/services/db.ts`
   - `backend/src/db.ts`
   - `backend/src/integrations/*`
   - `backend/src/services/env.ts`
3. **Criação de `backend/src/services/llm.ts`** como shim transitório para manter o `authRouter` histórico carregável do ponto de vista de dependências, enquanto a IA definitiva é religada por fases.

## Evidências verificadas
### Estrutura de imports
- A auditoria dos arquivos em `backend/src/routers` passou a reportar **0 arquivos com imports relativos quebrados**.
- A auditoria do backend completo ainda aponta pendências remanescentes em:
  - `backend/src/services/upgrades.ts`
  - `backend/src/trpc/routers/aiContentHubRouter.ts`
  - `backend/src/trpc/routers/phase3Router.ts`

### Carregamento parcial dos routers
Carregamento validado com `tsx` para:
- `systemRouter`
- `dashboardRouter`
- `mmnRouter`

### Bloqueador atual para Fase 3
A importação de `authRouter.ts` ainda é interrompida por **erro de sintaxe em `backend/src/routers/aiContentHubRouter.ts`**, o que indica que a próxima correção deve focar no saneamento desse módulo antes da montagem do router histórico agregado.

### Build
- `npm run build` na raiz continua **aprovando** no caminho bootstrap.

## Resultado técnico
Esta etapa não religou o runtime histórico completo, mas criou a **infraestrutura de compatibilidade necessária** para avançar a fusão backend sem regressão no bootstrap já estabilizado.

## Próximos passos recomendados
1. Corrigir o erro sintático em `backend/src/routers/aiContentHubRouter.ts`.
2. Reduzir imports quebrados remanescentes em `services/upgrades.ts` e `trpc/routers/*`.
3. Revalidar `authRouter.ts` após o saneamento do Content Hub.
4. Só então iniciar a montagem controlada do router histórico agregado em namespace isolado.

## Status executivo
**Situação:** preparação da Fase 3 em andamento, com **import graph dos routers principais saneado**, mas ainda bloqueada por módulos históricos específicos com erro estrutural.
