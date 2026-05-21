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
- [Entrega — dispatcher Cron ↔ BullMQ e execução real do `runNow`](./ENTREGA_CRON_DISPATCHER_BULLMQ.md)
- [Entrega — sincronização BullMQ → `cron_job_history`](./ENTREGA_CRON_HISTORY_SYNC.md)
- [Entrega — indicadores de SLA do domínio Cron no Backoffice](./ENTREGA_SLA_CRON_BACKOFFICE.md)
- [Entrega — alertas operacionais automáticos para jobs Cron](./ENTREGA_ALERTAS_CRON_BACKOFFICE.md)

## Status atual da trilha

No snapshot atual do repositório, a trilha do Backoffice Admin já conta com entregas incrementais publicadas para:

- shell administrativo moderno e navegação consolidada
- módulo de aprovações administrativas com fila, revisão detalhada, aprovação em lote e indicadores de SLA
- módulo de comissões ligado ao namespace dedicado `trpc.commissions.*`
- reforço de auditoria operacional e consolidação visual do domínio financeiro entre aprovações, comissões e pagamentos
- central administrativa completa do domínio Cron com CRUD de jobs, templates pré-definidos, configurações globais (timezone, alertas, manutenção), execução manual, histórico filtrado e revalidação automática
- dispatcher Cron ↔ BullMQ conectando os jobs administrativos à infraestrutura real de filas, com execução efetiva via `cron.runNow`
- sincronização automática BullMQ → `cron_job_history` nos 5 workers existentes, fechando o ciclo de observabilidade do domínio Cron
- indicadores de SLA por job com taxa de sucesso, p95 de duração, falhas consecutivas e detecção de jobs travados no `AdminSchedules`
- alertas operacionais automáticos com reavaliação a cada 5 min, dedup por cooldown, notificações para admins e painel de incidentes com reconhecimento manual

## Objetivo

Transformar a base administrativa já existente no frontend e no backend em um **Backoffice Admin unificado, navegável e orientado por domínio**, cobrindo rede, usuários, comissões, pagamentos, materiais, observabilidade e configuração operacional.

## Próximos passos recomendados

- persistir auditoria operacional em armazenamento dedicado
- padronizar componentes compartilhados de filtros, tabelas e paginação do Backoffice
- conectar o histórico de cron jobs aos workers BullMQ reais e à central de logs
- evoluir observabilidade administrativa com indicadores de SLA por domínio (financeiro, conteúdo, marketplace, comissões)
- expor alertas automáticos quando jobs cron ultrapassarem thresholds de falhas consecutivas

## Escopo inicial

O plano parte das evidências já presentes no repositório:

- páginas administrativas em `frontend/src/pages/`
- navegação administrativa já mapeada no `frontend/src/App.tsx`
- documentação canônica citando painel administrativo e RBAC
- trilha de fusão com legado já em andamento
