# Backoffice Admin MMN AI-to-AI

Esta pasta reúne o plano inicial de execução para iniciar o **Backoffice Admin** do MMN AI-to-AI a partir do estado atual do monorepo.

## Documentos desta trilha

- [Plano de execução em fases](./PLANO_EXECUCAO_EM_FASES.md)
- [Backlog inicial do Backoffice Admin](./BACKLOG_INICIAL.md)
- [Inventário atual do Backoffice Admin](./INVENTARIO_ATUAL.md)
- [Fase 1 — entrega inicial](./FASE_1_ENTREGA_INICIAL.md)
- [Fase 2 — núcleo operacional](./FASE_2_NUCLEO_OPERACIONAL.md)
- [Fase 2 — complemento operacional](./FASE_2_COMPLEMENTO_OPERACIONAL.md)
- [Entrega — aprovações administrativas](./ENTREGA_APROVACOES_ADMINISTRATIVAS.md)
- [Entrega — comissões no namespace dedicado](./ENTREGA_COMISSOES_NAMESPACE_DEDICADO.md)
- [Entrega — auditoria e consolidação financeira](./ENTREGA_AUDITORIA_E_CONSOLIDACAO_FINANCEIRA.md)
- [Entrega — agendamentos Cron no Backoffice Admin](./ENTREGA_AGENDAMENTOS_CRON_ADMIN.md)

## Status atual da trilha

No snapshot atual do repositório, a trilha do Backoffice Admin já conta com entregas incrementais publicadas para:

- shell administrativo moderno e navegação consolidada
- módulo de aprovações administrativas com fila, revisão detalhada, aprovação em lote e indicadores de SLA
- módulo de comissões ligado ao namespace dedicado `trpc.commissions.*`
- reforço de auditoria operacional e consolidação visual do domínio financeiro entre aprovações, comissões e pagamentos
- integração administrativa do domínio Cron com listagem de jobs, próximas execuções, histórico e disparo manual

## Objetivo

Transformar a base administrativa já existente no frontend e no backend em um **Backoffice Admin unificado, navegável e orientado por domínio**, cobrindo rede, usuários, comissões, pagamentos, materiais, observabilidade e configuração operacional.

## Próximos passos recomendados

- persistir auditoria operacional em armazenamento dedicado
- padronizar componentes compartilhados de filtros, tabelas e paginação do Backoffice
- aprofundar a integração entre pagamentos, comissões, logs e rotinas cron
- evoluir observabilidade administrativa com indicadores operacionais mais próximos da produção

## Escopo inicial

O plano parte das evidências já presentes no repositório:

- páginas administrativas em `frontend/src/pages/`
- navegação administrativa já mapeada no `frontend/src/App.tsx`
- documentação canônica citando painel administrativo e RBAC
- trilha de fusão com legado já em andamento
