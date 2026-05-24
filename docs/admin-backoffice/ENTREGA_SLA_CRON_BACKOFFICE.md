# Entrega — Indicadores de SLA do domínio Cron no Backoffice

## Objetivo desta entrega

Adicionar uma camada de observabilidade operacional ao domínio Cron, permitindo que o Backoffice Admin deixe de mostrar apenas listagem e histórico bruto e passe a exibir indicadores de saúde por job, com foco em confiabilidade, tempo de execução e detecção rápida de anomalias.

## Itens entregues

### 1. Serviço dedicado de SLA no backend

Foi criado o serviço `backend/src/services/cronSlaIndicators.ts`, responsável por calcular um snapshot operacional a partir de `cron_jobs` e `cron_job_history`.

O serviço entrega, por job:

- taxa de sucesso em 7 dias e 30 dias
- quantidade de falhas em 7 dias e 30 dias
- p95 de duração em 7 dias e 30 dias
- duração média em 30 dias
- falhas consecutivas desde o último sucesso
- detecção de jobs travados (`running` acima do threshold configurado)
- classificação de saúde (`healthy`, `degraded`, `critical`, `idle`)
- motivo textual da classificação

Também entrega um resumo global com:

- total de jobs
- total de jobs ativos
- total de jobs travados
- total de jobs críticos, degradados e saudáveis
- volume total de execuções em 30 dias
- taxa global de falha em 30 dias
- taxa média de sucesso em 30 dias

### 2. Nova procedure `trpc.cron.getSlaSnapshot`

O `cronRouter` agora expõe a procedure `getSlaSnapshot`, permitindo ao frontend consultar os indicadores com parâmetros operacionais como:

- threshold de job travado em minutos
- threshold de alertas por falhas consecutivas
- janela curta (7 dias)
- janela longa (30 dias)
- limite de eventos por job para cálculo de percentis

### 3. Painel visual de SLA no `AdminSchedules`

A página `frontend/src/pages/AdminSchedules.tsx` passou a exibir:

- cards globais de SLA (execuções 30d, taxa média de sucesso, jobs degradados, jobs críticos)
- tabela ordenada por severidade operacional
- badge de saúde por job
- explicação textual do motivo de criticidade/degradação
- visualização de sucesso 7d/30d, falhas 7d/30d, p95 7d/30d e falhas consecutivas
- indicação explícita quando um job está travado

## Impacto esperado

Esta entrega aproxima o Backoffice Admin de uma central de SRE operacional para o domínio Cron, reduzindo o tempo de detecção de incidentes e tornando possível priorizar rapidamente jobs críticos, degradados ou travados.

## Próximos passos recomendados

1. adicionar alertas automáticos quando `healthStatus = critical`
2. expor histórico temporal de SLA por jobType
3. incluir métricas de tempo em fila para complementar o p95 de processamento
4. criar filtros visuais por severidade (`critical`, `degraded`, `healthy`, `idle`)
