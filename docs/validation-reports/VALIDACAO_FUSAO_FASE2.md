# Validação de Fusão — Fase 2

**Data:** 2026-05-15  
**Branch de trabalho:** `fix/bootstrap-runtime`

## Objetivo
Avançar da fundação técnica da Fase 1 para uma **integração bootstrap real entre frontend e backend via tRPC**, reduzindo stubs de comunicação e preparando a reintrodução gradual dos módulos originais.

## Escopo implementado nesta fase
1. **Frontend religado ao tRPC** com `TRPCProvider` ativo em `frontend/src/App.tsx`.
2. **Tipagem compartilhada do router bootstrap** em `frontend/src/lib/trpc.ts`, substituindo o `AppRouter = any` por importação do tipo real exportado em `backend/src/appRouter.ts`.
3. **Páginas bootstrap migradas de `fetch` manual para hooks tRPC**:
   - `Home.tsx`
   - `Dashboard.tsx`
   - `ContentHub.tsx`
4. **Validação de runtime do backend bootstrap** com resposta positiva dos endpoints:
   - `GET /health`
   - `GET /trpc/system.info`
5. **Preparação para Fase 3** com base tipada e observável para evolução incremental.

## Evidências verificadas
### Build
- `npm run build` na raiz executou com sucesso.
- Frontend compilou com Vite consumindo o tipo do backend no cliente tRPC.
- Backend compilou com TypeScript sem regressão no bootstrap.

### Runtime validado
- `GET /health` respondeu com `ok: true`.
- `GET /trpc/system.info` respondeu com dados do runtime bootstrap (`Node.js + Express + tRPC`, status de banco e redis, e notas operacionais).

## Resultado técnico
A Fase 2 estabeleceu uma **ponte real entre frontend e backend** no monorepo:
- o frontend deixou de apenas simular chamadas HTTP manuais;
- o cliente passou a conhecer o contrato do router bootstrap;
- a UI bootstrap passou a funcionar como prova de integração do caminho tRPC.

## Limites atuais
1. O contrato compartilhado ainda cobre apenas o **router bootstrap**, não os routers históricos completos.
2. Os módulos de domínio (`mmn`, `dashboard`, `payments`, `marketplaces`, etc.) continuam fora do caminho crítico principal de runtime.
3. A autenticação permanece em modo transitório; `auth.me` só reflete o contexto bootstrap, sem ponte completa com o legado.
4. Ainda não houve reconciliação funcional com o sistema PHP legado.

## Próximos passos recomendados
### Fase 3 — Reintrodução de domínios reais
- religar `systemRouter`, `mmnRouter`, `dashboardRouter` e `paymentsRouter` por contrato;
- corrigir imports e dependências cruzadas herdadas da estrutura antiga;
- expandir a tipagem compartilhada além do bootstrap.

### Fase 4 — Compatibilidade com legado
- definir tabela de equivalência entre identidades do legado e do novo sistema;
- validar rede MMN, pagamentos, comissões e upgrades;
- implementar reconciliação assíncrona com BullMQ.

## Status executivo
**Situação:** Fase 2 validada como **integração tRPC operacional do bootstrap**, ainda sem equivaler a uma operação completa de produção ou à fusão funcional total com o legado.
