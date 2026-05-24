# Fase 2 — Complemento Operacional

## Objetivo desta entrega

Registrar a continuação prática da Fase 2 do Backoffice Admin com foco em dois pontos que ainda geravam desalinhamento operacional: materiais administrativos e o domínio de inadimplência.

## Itens entregues

### 1. Módulo de materiais compatibilizado com o contrato real

A página `AdminMaterials` foi ajustada para operar de acordo com os contratos já expostos em `trpc.materials.*`.

A entrega inclui:

- filtros por busca, tipo e status
- paginação aderente ao contrato de listagem
- leitura de estatísticas via `materials.getStats`
- leitura de categorias via `materials.getCategories`
- criação de material com categorias e status válidos
- atualização de status via `materials.updateStatus`
- remoção administrativa via `materials.delete`

O principal ganho foi eliminar o descompasso entre o frontend administrativo e o shape real do router de materiais.

### 2. Tela de inadimplência reconectada ao domínio dedicado

Com a consolidação do namespace `trpc.delinquents.*`, a página `AdminDelinquents` foi reposicionada para operar sobre o domínio próprio de inadimplência.

A entrega inclui:

- filtros por status e dias mínimos em atraso
- leitura de estatísticas via `delinquents.getStats`
- atualização de status do inadimplente
- disparo operacional de lembretes
- tabela de acompanhamento com severidade por atraso

## Impacto esperado

Esta entrega reduz risco de quebra no painel administrativo e reforça a separação por domínio no Backoffice: materiais seguem sua trilha própria de catálogo e inadimplência passa a operar sobre um namespace administrativo especializado.

## Próximos passos recomendados

1. decidir se o namespace de materiais também será promovido para `adminRouter` ou mantido como domínio próprio
2. adicionar histórico de contatos e notas diretamente na interface de inadimplentes
3. introduzir auditoria das ações de criar, arquivar e remover materiais
4. consolidar componentes compartilhados de filtros e estados administrativos
