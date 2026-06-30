# Marketplace Nexus — Go Live Hotfix

## Resumo
Hotfix aplicado para restaurar a exposição do router `marketplaceNexus` no `appRouter`, eliminando o erro 404 em produção e reativando as rotas públicas do catálogo.

## Causa raiz
- O arquivo `backend/src/routers/marketplaceNexusRouter.ts` existia.
- O serviço `backend/src/domains/marketplace/userLibraryService.ts` existia.
- O router não estava montado no `backend/src/appRouter.ts` em produção.
- Resultado: `marketplaceNexus.listEbooks` e rotas irmãs ficavam órfãs e respondiam 404.

## Correção aplicada
- Import de `marketplaceNexusRouter` adicionado ao `appRouter`.
- Mount `marketplaceNexus: marketplaceNexusRouter` adicionado ao root router.
- Flag `marketplaceNexus: true` confirmada no `bootstrap.status`.
- Rebuild backend + reload PM2 concluídos com sucesso.

## Validação pós-deploy
- `system.health` OK.
- `bootstrap.status` com `marketplaceNexus=true`.
- `marketplaceNexus.listEbooks` respondeu com sucesso em 8/8 chamadas consecutivas.
- Catálogo público retornando 164 itens.
- `marketplaceNexus.listPacks` retornando 15 packs.

## Observação de sincronização
O endpoint voltou a funcionar, porém a origem de dados está divergente:
- Manifest estático: 132 ebooks.
- API atual: 164 ebooks ativos.
- Arquivos-fonte disponíveis ainda não justificam um catálogo acima de 200 de forma consistente.

## Guardrails para não reincidir
1. Router montado explicitamente no `appRouter`.
2. Verificação no `bootstrap.status`.
3. Smoke test pós-deploy obrigatório em `marketplaceNexus.listEbooks`.
4. Backup pré-hotfix criado no VPS antes da extração.
5. Validação repetida em múltiplas chamadas após reload.

## Próximo passo
Abrir Sprint de sincronização do catálogo para reconciliar:
- banco `marketplace_ebooks`
- manifesto `_marketplace_nexus_release`
- PDFs/capas/markdowns publicados
