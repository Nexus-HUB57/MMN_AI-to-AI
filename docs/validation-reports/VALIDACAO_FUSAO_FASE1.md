# Validação de Fusão — Fase 1

**Data:** 2026-05-15  
**Branch de trabalho:** `fix/bootstrap-runtime`

## Objetivo
Validar a primeira etapa da fusão entre o **MMN AI-to-AI** e o **sistema legado PHP**, estabilizando o monorepo para permitir evolução incremental sem bloquear compilação, documentação e versionamento.

## Escopo implementado nesta fase
1. **Bootstrap mínimo do backend** com `Express + tRPC` em `backend/src/index.ts` e `backend/src/appRouter.ts`.
2. **Bootstrap mínimo do frontend** com `Vite + React + wouter` (`frontend/index.html`, `frontend/vite.config.ts`, `frontend/tsconfig.json`, `frontend/src/main.tsx`).
3. **Placeholder operacional do Genkit** em `backend/src/genkit/index.ts`.
4. **Ajuste do backend package** para remover dependência imediata do runner `genkit start` e manter `genkit:dev` executável no modo bootstrap.
5. **Compatibilidade do TypeScript do backend** com adição de `ignoreDeprecations: "6.0"` em `backend/tsconfig.json`, estabilizando o build com a toolchain atual.
6. **Correção documental da fusão** com atualização do roadmap e registro desta validação.
7. **Higiene de versionamento** com criação de `.gitignore` para evitar publicação acidental de `node_modules`, `dist`, logs e arquivos temporários.

## Evidências verificadas
### Build
- `npm run build` na raiz **concluiu com sucesso** no caminho bootstrap mínimo.
- O frontend foi empacotado pelo Vite e o backend compilou com TypeScript para `dist/`.

### Frontend
- `npm --workspace frontend run build` passou após os ajustes de bootstrap.
- `npm --workspace frontend run preview -- --port 4173` respondeu com a página **MMN AI-to-AI**.

### Backend
- O backend bootstrap foi criado e compilado com sucesso.
- A validação integrada anterior de runtime via `curl /health` **não ficou concluída de forma confiável** por timeout durante uma tentativa automatizada; portanto, esta fase considera o backend **compilável e pronto para nova validação de runtime**, mas ainda não homologado como produção.

## Conclusão da Fase 1
A Fase 1 **não conclui a fusão funcional completa**, mas entrega uma fundação executável para continuidade do processo:
- o repositório voltou a compilar;
- o frontend bootstrap tornou-se navegável;
- o backend voltou a ter ponto de entrada claro;
- o caminho crítico deixou de depender imediatamente dos módulos históricos com maior acoplamento.

## Pendências remanescentes
1. **Reintrodução gradual dos routers reais** com saneamento de contratos e tipos.
2. **Substituição de `AppRouter = any`** no frontend por tipagem compartilhada real do backend.
3. **Validação de runtime ponta a ponta** do backend (`/health`, `/trpc/system.health`, cookies, CORS e contexto autenticado).
4. **Reconciliação da camada de autenticação** entre bootstrap atual, contexto tRPC e futura ponte com legado.
5. **Mapeamento funcional do legado PHP** por domínio: login, afiliados, árvore MMN, comissões, pagamentos e upgrades.
6. **Estratégia de anti-corruption layer** para acesso ao legado sem expor o frontend diretamente ao PHP.

## Próximos passos recomendados
### Fase 2 — Reintrodução controlada
- religar routers por domínio, começando por `system`, `mmn`, `dashboard` e `payments`;
- criar testes de contrato para cada namespace tRPC reativado;
- padronizar contexto, autenticação e middlewares.

### Fase 3 — Compatibilidade de dados
- criar tabela de equivalência entre IDs do legado e IDs do novo sistema;
- validar usuários, afiliados, patrocinadores, pedidos e comissões;
- implementar jobs de reconciliação assíncrona.

### Fase 4 — Desligamento progressivo do legado
- definir ownership por módulo;
- operar em shadow mode antes do corte;
- desligar módulos PHP somente após reconciliação e monitoramento.

## Status executivo
**Situação:** Fase 1 validada como **fundação técnica / bootstrap operacional**, porém **não equivalente a produção plena**.
