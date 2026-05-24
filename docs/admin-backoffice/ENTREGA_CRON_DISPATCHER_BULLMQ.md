# Entrega — Dispatcher Cron ↔ BullMQ e execução real do `runNow`

## Objetivo desta entrega

Fechar o ciclo operacional do domínio Cron conectando os jobs cadastrados em `cron_jobs` à infraestrutura BullMQ existente, eliminando a lacuna em que `cron.runNow` apenas registrava um histórico em status `running` sem nunca concluí-lo. A partir desta entrega, executar um cron job pelo Backoffice Admin dispara de fato a fila correspondente e persiste duração, status final e metadados de despacho.

## Itens entregues

### 1. Novo serviço `backend/src/services/cronDispatcher.ts`

Camada central de despacho que isola o domínio Cron da infraestrutura BullMQ:

- **registro de filas conhecidas** (`content_generation_queue`, `marketplace_sync_queue`, `order_processing_queue`, `commission_processing_queue`, `withdrawal_processing_queue`)
- **catálogo `cronJobBindings`** mapeando `jobType` → fila + nome do job BullMQ + transformação opcional de payload
- **handlers inline** para tipos que executam operações curtas em banco/cache (`invoice_overdue_check`, `database_cleanup`, `xp_recalculation`, etc.)
- **fallback genérico** usando o `queueName` declarado no próprio cron job
- propagação do contexto Cron (`__cron.cronJobId`, `__cron.historyId`) dentro do payload BullMQ, viabilizando rastreabilidade ponta a ponta
- exportação de `listSupportedCronJobTypes()` e `listRegisteredCronQueues()` para usos administrativos

### 2. `cronScheduler.executeCronJob` delegando ao dispatcher

O `executeJobByType` foi reescrito para:

- chamar o `dispatchCronJob` em vez do `console.log` placeholder
- lançar erro real quando o dispatcher não conseguir despachar (motivo claro no `errorMessage` do histórico)
- persistir `jobId` BullMQ e `metadata` (queueName, bullJobName, motivo) na linha de `cron_job_history`
- continuar atualizando `lastRunAt`, `lastRunDuration`, `lastRunStatus`, `lastRunError`, contadores e `nextRunAt`

Também foi introduzida a função `parsePayload` que tolera payloads em string (formato persistido em MySQL) ou já em objeto, evitando `JSON.parse` que quebra em payload nulo.

### 3. `cron.runNow` agora executa de verdade

A mutation administrativa `trpc.cron.runNow`:

- delega ao `executeCronJob(jobId)` em vez de inserir um registro órfão
- aproveita toda a máquina do scheduler (despacho, atualização de stats, próxima execução)
- devolve o `historyId` real já com status final ao Backoffice
- mantém o contrato visível para o frontend (`AdminSchedules.tsx` não precisou ser alterado)

### 4. Nova procedure `cron.getSupportedJobTypes`

Expõe ao Backoffice a lista de tipos de cron job suportados nativamente pelo dispatcher, permitindo que telas futuras alertem o operador quando um job for criado com `jobType` sem binding nem handler inline.

## Impacto esperado

- elimina histórico fantasma de cron jobs presos em `running`
- conecta o Backoffice Admin à infraestrutura BullMQ real já existente
- viabiliza observabilidade unificada (cron history + bull queues) através do contexto `__cron` no payload
- abre caminho para indicadores de SLA por `jobType` (com base nos contadores `runCount`/`successCount`/`failureCount`)

## Próximos passos recomendados

1. Reaproveitar o contexto `__cron` nos workers existentes para fechar o ciclo BullMQ → `cron_job_history` (status final, duração real, erros)
2. Expor no Backoffice indicadores de SLA por `jobType` (taxa de sucesso, p95 de duração, jobs travados)
3. Adicionar alerta visual quando um cron job for cadastrado com `jobType` fora de `cron.getSupportedJobTypes`
4. Incluir métricas do dispatcher (filas registradas, jobs despachados, fallback usado) na rota de observabilidade administrativa
