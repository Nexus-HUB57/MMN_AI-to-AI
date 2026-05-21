# Entrega — Histórico de alertas Cron com MTTA/MTTR no Backoffice

## Objetivo desta entrega

Expandir a observabilidade operacional do domínio Cron além dos incidentes ativos, oferecendo uma visão histórica persistida no Backoffice com filtros, paginação e métricas executivas de resposta e recuperação.

## Itens entregues

### 1. Novo serviço `backend/src/services/cronAlertHistory.ts`

Camada dedicada para leitura histórica da tabela `cron_alerts`, sem misturar a lógica de avaliação em tempo real do `cronAlerts.ts`.

Funções exportadas:

- `listCronAlertHistory(options)` — lista incidentes com filtros por estado, severidade, reconhecimento, tipo e `jobType`, com paginação
- `getCronAlertInsightSnapshot(days)` — consolida métricas operacionais da janela analisada

### 2. Novas procedures no `cronRouter`

- `trpc.cron.getAlertHistory` — histórico paginado de incidentes Cron persistidos
- `trpc.cron.getAlertInsights` — snapshot executivo com backlog e tempos médios

### 3. Métricas executivas entregues

Na janela configurada (atualmente 30 dias), o snapshot expõe:

- quantidade total de alertas rastreados
- quantidade de incidentes ativos
- críticos ativos
- alertas de atenção ativos
- ativos ainda não reconhecidos
- incidentes resolvidos na janela
- incidentes reconhecidos na janela
- **MTTA** médio (`acknowledgedAt - detectedAt`)
- **MTTR** médio (`resolvedAt - detectedAt`)

### 4. Evolução do `AdminSchedules.tsx`

A página administrativa ganhou uma nova seção dedicada ao histórico de incidentes Cron com:

- cards-resumo para backlog, criticidade ativa, MTTA e MTTR
- filtros por estado, severidade e reconhecimento
- listagem histórica paginada
- badges para severidade, estado e reconhecimento
- timestamps de detecção, última observação, reconhecimento e resolução
- visualização individual de MTTA, MTTR e tempo em aberto por incidente

## Resultado operacional

Antes:

- o Backoffice mostrava somente incidentes ativos e o snapshot SLA agregado
- faltava trilha temporal para analisar recuperação operacional
- não havia leitura explícita de MTTA/MTTR

Agora:

- existe visão unificada de **alerta ativo + histórico + tempos médios**
- o time administrativo consegue medir rapidez de reconhecimento e de recuperação
- a tabela `cron_alerts` passa a servir tanto para incidente corrente quanto para retrospectiva operacional

## Próximos passos recomendados

1. adicionar drilldown por `jobType` no histórico
2. cruzar alertas com `cron_job_history` e logs administrativos
3. destacar reincidência por job no Backoffice
4. exportar incidentes resolvidos para CSV/relatórios executivos
5. integrar MTTA/MTTR por domínio (financeiro, conteúdo, marketplace, comissões)
