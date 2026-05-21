# Entrega — Persistência dedicada para alertas do domínio Cron

## Objetivo desta entrega

Eliminar a volatilidade do estado de alertas Cron, substituindo o controle em memória por uma trilha persistida em banco. Com isso, reconhecimento manual, deduplicação por cooldown e resolução de incidentes passam a sobreviver a restart, recycle de sandbox e cenários multi-instância.

## Itens entregues

### 1. Nova tabela `cron_alerts` em `database/schemas/schema-cron.ts`

Estrutura dedicada para incidentes do domínio Cron, com:

- `alert_key` — chave idempotente por `{alertType, jobType, bucket}`
- `alert_type` e `severity`
- `job_type` e `job_name`
- `bucket` — faixa estável da métrica que originou o alerta
- `title`, `message` e `metadata`
- `detected_at`, `last_seen_at`, `notified_at`
- `acknowledged_at`, `acknowledged_by`
- `resolved_at`
- `active`

Índices adicionados:

- unicidade por `alert_key`
- consulta rápida por ativos/severidade
- consulta por `job_type` + `alert_type`

### 2. Refatoração de `backend/src/services/cronAlerts.ts`

O serviço deixou de depender de `Map` em memória para governança do ciclo de vida dos alertas.

Agora ele:

- calcula os candidatos a alerta a partir do snapshot SLA
- reusa a mesma linha quando o incidente continua ativo
- reabre um alerta previamente resolvido quando a condição volta a ocorrer
- atualiza `lastSeenAt` a cada nova avaliação
- resolve automaticamente alertas que sumiram do snapshot atual
- usa `notifiedAt` como base do cooldown de notificação
- preserva `acknowledgedAt` e `acknowledgedBy` entre reinícios do processo

### 3. Reconhecimento manual persistido

`acknowledgeCronAlert()` agora grava:

- `acknowledgedAt`
- `acknowledgedBy`

Isso impede que o estado de reconhecimento seja perdido após deploy/restart e prepara o domínio para auditoria operacional mais forte.

### 4. Compatibilidade preservada no Backoffice

A API do Backoffice continua funcional sem mudanças de fluxo para o usuário:

- `trpc.cron.getActiveAlerts`
- `trpc.cron.evaluateAlerts`
- `trpc.cron.acknowledgeAlert`

O painel `AdminSchedules.tsx` continua exibindo os incidentes ativos e o botão de reconhecimento, mas agora sobre uma base persistida.

## Resultado operacional

Antes:

- reconhecimento manual perdido em restart
- dedup perdido em recycle
- comportamento inconsistente em múltiplas instâncias

Agora:

- incidentes ativos e reconhecimentos sobrevivem a reinicializações
- dedup por cooldown é estável por persistência de `notifiedAt`
- resolução e reabertura ficam explícitas no banco
- base pronta para histórico de alertas resolvidos, MTTR e integrações externas

## Evolução posterior

Esta base foi posteriormente conectada a uma visualização histórica no Backoffice, com MTTA/MTTR e backlog paginado, documentada em `ENTREGA_HISTORICO_ALERTAS_CRON_BACKOFFICE.md`.

## Próximos passos recomendados

1. adicionar filtros por tipo e `jobType` diretamente na UI
2. integrar alertas críticos com Slack/email/webhooks
3. cruzar incidentes com `cron_job_history` e logs administrativos
4. permitir thresholds por `jobType` via `cron_settings`
5. consolidar MTTA/MTTR por domínio operacional
