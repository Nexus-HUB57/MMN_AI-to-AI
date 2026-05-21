# Entrega — Alertas operacionais automáticos para jobs Cron

## Objetivo desta entrega

Transformar os indicadores de SLA do domínio Cron em **ação operacional automática**, emitindo alertas para administradores quando jobs entrarem em estado crítico (travados, com falhas consecutivas ou taxa de sucesso degradada), e oferecer no Backoffice Admin uma trilha de incidentes ativos com possibilidade de reconhecimento manual.

## Itens entregues

### 1. Novo serviço `backend/src/services/cronAlerts.ts`

Camada de avaliação e dedup de alertas operacionais com três tipos:

- **`cron_critical_failures`** — falhas consecutivas acima do threshold
- **`cron_stuck_job`** — job em `running` há mais que o threshold
- **`cron_degraded_success_rate`** — taxa de sucesso 7d abaixo do mínimo configurado

Funções exportadas:

- `evaluateCronAlerts(options)` — calcula snapshot SLA, gera alertas, aplica dedup e dispara notificações persistidas
- `listActiveCronAlerts()` — retorna alertas ativos da última avaliação (avalia uma vez se nunca rodou)
- `acknowledgeCronAlert(alertId)` — marca alerta como reconhecido (silencia novas notificações enquanto permanecer ativo)
- `clearAcknowledgement(alertId)` — reabre o incidente
- `resetCronAlertsState()` — utilitário para testes

Garantias:

- **Dedup por janela de cooldown** (padrão 30 min) — evita spam de notificações
- **Bucketização** de métricas (faixas estáveis) — evita gerar alerta novo a cada delta pequeno
- **Idempotência** por chave `{alertType, jobType, bucket}`
- **Notificações persistidas** via `createNotification` para todos os admins ativos (até 50)
- **Tolerância a falha** — erros de banco são logados, nunca derrubam o caller
- **Esta entrega foi posteriormente evoluída** para persistência dedicada em `cron_alerts`, detalhada em `ENTREGA_ALERTAS_CRON_PERSISTENCIA.md`

### 2. Reavaliação automática integrada ao scheduler

O `cronScheduler.startCronScheduler()` agora dispara `evaluateCronAlerts()` a cada **5 minutos**, sem necessidade de cron job dedicado. Os intervalos são limpos no `stopCronScheduler()` para shutdown gracioso. Registro centralizado em `schedulerIntervals` evita leak de timers.

### 3. Novas procedures no `cronRouter`

- `trpc.cron.getActiveAlerts` (public) — lista alertas ativos com timestamp da última avaliação
- `trpc.cron.evaluateAlerts` (admin) — força reavaliação manual e retorna `newAlerts`, `activeAlerts`, `acknowledgedAlerts` e resumo do snapshot
- `trpc.cron.acknowledgeAlert` (admin) — reconhece um alerta específico por `alertId`

### 4. Painel visual de alertas no `AdminSchedules.tsx`

Nova seção dedicada **acima** do painel de SLA com:

- card verde quando não há alertas ativos
- grid responsivo com cards por alerta, agrupando severidade (`critical` em vermelho, `warning` em âmbar)
- badge de tipo de alerta (`Falhas consecutivas`, `Job travado`, `Sucesso degradado`)
- badge `Reconhecido` quando o admin já acusou o incidente
- timestamp de detecção e de reconhecimento
- botão **"Avaliar agora"** que dispara `cron.evaluateAlerts` e mostra toast com número de alertas novos
- botão **"Reconhecer"** por alerta, com estado desabilitado após confirmação

## Ciclo completo agora ativo

```
cronScheduler (a cada 5 min)
  → evaluateCronAlerts
    → computeCronSlaSnapshot
      → buildAlertsForJob (por job, gera 0..3 alertas)
        → dedup por cooldown + bucketize
          → createNotification para todos os admins
            → AdminSchedules.tsx (revalida em 60s e exibe)
              → Admin reconhece via acknowledgeCronAlert
                → silencia novas notificações enquanto ativo
                  → quando o alerta sai da lista ativa, acknowledgement é removido
```

## Impacto esperado

- transforma o domínio Cron em **operação observada por padrão**, sem depender de inspeção manual
- reduz tempo de detecção de incidentes para **no máximo 5 minutos** (intervalo de reavaliação)
- evita fadiga de alertas com **dedup + bucketize + cooldown**
- mantém histórico de incidentes diretamente nas notificações dos admins (auditável)
- abre caminho para integração futura com webhooks externos (Slack, email, PagerDuty)

## Próximos passos recomendados

1. integração com webhooks (Slack, Discord, email) para alertas `critical`
2. página de histórico de alertas resolvidos
3. configuração de thresholds por `jobType` no `cron_settings`
4. métricas de MTTR (mean time to recovery) por tipo de alerta
5. correlação entre alertas Cron e central administrativa de logs
