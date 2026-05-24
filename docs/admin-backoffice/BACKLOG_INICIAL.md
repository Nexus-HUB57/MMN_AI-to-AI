# Backlog Inicial — Backoffice Admin MMN AI-to-AI

## Bloco A — Fundação

- mapear telas `/admin/*` existentes
- classificar telas por status real
- validar `AdminDashboardLayout`
- definir convenção de rotas admin
- padronizar navegação lateral

## Bloco B — Dados e contratos

- mapear queries/mutations tRPC usadas em telas admin
- listar contratos faltantes no backend
- revisar paginação, filtros e estados de erro
- definir contratos mínimos para dashboard, users, network, commissions e payments

## Bloco C — Núcleo do admin

- consolidar dashboard admin oficial
- revisar gestão de usuários
- revisar gestão de rede
- revisar comissões
- revisar pagamentos
- revisar inadimplentes
- revisar materiais

## Bloco D — Governança

- definir RBAC mínimo por módulo
- identificar ações sensíveis com auditoria
- definir critérios de acesso por perfil admin
- documentar áreas de configuração do negócio

## Bloco E — Observabilidade

- inventariar logs administrativos existentes
- mapear indicadores de filas e workers
- integrar supervisão agentic quando aplicável
- criar checklist de monitoramento operacional

## Primeira entrega recomendada

A primeira entrega concreta deve ser:

1. shell admin oficial
2. rota `/admin` validada
3. dashboard admin consolidado
4. menu lateral com módulos reais
5. inventário de gaps backend/frontend por módulo
