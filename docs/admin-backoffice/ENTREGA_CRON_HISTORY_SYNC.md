# Entrega — Sincronização BullMQ → `cron_job_history`

## Objetivo desta entrega

Fechar o ciclo de observabilidade do domínio Cron, garantindo que cada job despachado pelo `cronDispatcher` para uma fila BullMQ tenha seu desfecho (sucesso ou falha) propagado de volta para `cron_job_history` e para os contadores agregados em `cron_jobs`, sem depender de polling externo ou inspeção manual de logs do worker.

## Itens entregues

### 1. Novo helper compartilhado `backend/src/services/cronHistorySync.ts`

Camada compartilhada entre os 5 workers BullMQ que oferece três funções:

- `extractCronContext(job)` — lê o `__cron.{cronJobId, historyId}` injetado pelo dispatcher no payload BullMQ
- `markCronHistoryCompleted(job, result)` — marca o histórico como `completed`, registra duração real (`finishedOn - processedOn`), persiste metadata (bullJobId, attemptsMade, source, result resumido) e incrementa `success_count` em `cron_jobs`
- `markCronHistoryFailed(job, error)` — marca como `failed`, persiste `errorMessage`, e incrementa `failure_count` em `cron_jobs`
- `markCronHistoryActive(job)` — opcional, para marcar como `running` em arquiteturas com fila intermediária

Características importantes:

- **no-op para jobs não-cron**: quando o payload não contém `__cron`, todas as funções retornam silenciosamente — workers continuam funcionando para jobs cadastrados manualmente
- **idempotência por status**: usa `WHERE status IN ('running', 'queued')` para não sobrescrever um histórico já em estado final, evitando race conditions entre o scheduler e o worker
- **tolerância a falha**: erros de banco são logados mas não derrubam o worker (princípio "logs over crashes")
- **duração real do BullMQ**: usa `job.processedOn` e `job.finishedOn` em vez do timestamp do scheduler, refletindo o tempo verdadeiro de processamento (não inclui tempo de fila)

### 2. Integração nos 5 workers existentes

Os seguintes workers tiveram seus listeners `completed` e `failed` enriquecidos com uma única linha cada, mantendo todo o comportamento prévio:

- `commissionProcessingWorker.ts`
- `contentGenerationWorker.ts`
- `marketplaceSyncWorker.ts`
- `orderProcessingWorker.ts`
- `withdrawalProcessingWorker.ts`

Cada worker agora propaga automaticamente o desfecho do job para o histórico Cron quando o payload contém o contexto `__cron`.

### 3. Ciclo completo de observabilidade

A trilha de execução de um cron job agora é:

1. **Admin clica "Executar agora"** no `AdminSchedules.tsx` → `trpc.cron.runNow`
2. **`cronScheduler.executeCronJob`** insere `cron_job_history` com status `running` e contexto pronto
3. **`cronDispatcher.dispatchCronJob`** despacha para a fila BullMQ correta, injetando `__cron` no payload
4. **Worker BullMQ** processa o job concretamente
5. **Listener `completed`/`failed`** do worker chama `markCronHistoryCompleted`/`markCronHistoryFailed`
6. **`cron_job_history`** recebe status final, duração real, metadata; **`cron_jobs`** tem `success_count`/`failure_count` incrementados
7. **`AdminSchedules.tsx`** revalida em 30s e exibe o desfecho real ao admin

## Impacto esperado

- elimina histórico fantasma em `running` mesmo após workers concluírem o trabalho
- viabiliza dashboards de SLA por `jobType` com dados confiáveis (taxa de sucesso, p95 de duração)
- alinha a observabilidade do domínio Cron à observabilidade já existente em BullMQ (sem duplicar lógica)
- mantém os workers desacoplados do domínio Cron (helper opcional, idempotente)

## Próximos passos recomendados

1. Expor no `AdminSchedules.tsx` indicadores de SLA por `jobType` (taxa de sucesso 7d/30d, p95 de duração)
2. Alertas automáticos quando um job ultrapassar threshold de falhas consecutivas (ex.: 3 falhas em sequência)
3. Métricas de queue depth e tempo médio de fila no Backoffice (cron + bull)
4. Painel comparativo Cron ↔ BullMQ para detectar drift de execução
