# Fase 1 — Entrega Inicial do Backoffice Admin

## Objetivo desta entrega

Registrar a primeira rodada prática da **Fase 1** do Backoffice Admin, focada em consolidar a navegação administrativa e reduzir áreas órfãs do frontend.

## Itens entregues

### 1. Shell administrativo consolidado

O `AdminDashboardLayout` foi fortalecido como shell oficial do Backoffice, com:

- menu lateral padronizado
- cabeçalho operacional com breadcrumb simples
- identificação da sessão administrativa
- estado visual unificado para as rotas do Backoffice
- alinhamento do dashboard como entrada principal administrativa

### 2. Rota administrativa oficial normalizada

A rota `/admin` passa a funcionar como entrada oficial do dashboard administrativo, mantendo `/admin/dashboard` como alias explícito.

Também foi preservada a antiga tela `AdminPanel` como referência em `/admin/legacy`, evitando perda de contexto histórico durante a transição.

### 3. Rotas órfãs resolvidas

Foram incorporadas ao frontend administrativo as rotas:

- `/admin/logs`
- `/admin/schedules`

Com isso, o menu do shell deixa de apontar para entradas sem cobertura direta na navegação principal.

### 4. Módulo de usuários alinhado ao domínio admin

A página `AdminUsers` foi ajustada para consumir o domínio `trpc.admin.*`, aproximando o frontend da linha oficial de contratos administrativos já existente no backend.

Melhorias aplicadas:

- listagem paginada
- filtro por papel
- busca textual
- atualização de papel via `admin.updateUser`
- resumo operacional básico

### 5. Entrada administrativa para agendamentos

A nova página `AdminSchedules` funciona como ponte operacional entre:

- supervisão do Backoffice
- filas do orquestrador
- logs administrativos
- calendário de conteúdo

Ela não encerra a fase de agendamentos, mas cria uma entrada consistente para a evolução do domínio.

## Impacto esperado

Esta entrega reduz a dispersão administrativa e cria uma base mais estável para as próximas etapas do Backoffice, especialmente:

- Fase 2 — núcleo operacional de usuários e rede
- Fase 3 — financeiro administrativo
- Fase 5 — observabilidade e auditoria

## Próximos passos recomendados

1. migrar `AdminNetwork` para contratos administrativos estáveis
2. alinhar `AdminPayments` e `AdminCommissions` ao domínio `trpc.admin.*`
3. consolidar estados vazios, loading e erro em componentes reutilizáveis do Backoffice
4. definir RBAC administrativo por subárea
