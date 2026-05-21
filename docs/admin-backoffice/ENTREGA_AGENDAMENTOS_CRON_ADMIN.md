# Entrega — Agendamentos Cron no Backoffice Admin

## Objetivo desta entrega

Elevar a rota administrativa de agendamentos a uma central operacional completa para o domínio Cron, cobrindo supervisão, ciclo de vida dos jobs (CRUD) e parametrização global, sem depender de scripts manuais ou de inspeção indireta por logs.

## Itens entregues

### 1. Página `AdminSchedules` conectada ao `trpc.cron.*`

A página administrativa de agendamentos consome dados reais do módulo Cron e expõe:

- listagem de jobs cadastrados com filtros por status (ativo/pausado)
- estatísticas agregadas de execução (total, sucesso, falha, duração média)
- próximas execuções programadas em uma trilha dedicada
- histórico do job selecionado com filtros por status (concluído, falha, em execução)
- atualização manual sob demanda e revalidação automática a cada 30 segundos

### 2. CRUD completo de jobs cron no Backoffice

A experiência administrativa agora cobre o ciclo de vida operacional dos jobs cron:

- criação de novos jobs com nome, tipo, fila, frequência, expressão cron, payload JSON e status inicial
- aplicação de templates pré-definidos via `cron.getTemplates`, baseados em `CRON_JOB_CONFIGS`
- edição de jobs existentes preservando payload, frequência e cronograma recalculados
- remoção de jobs, com limpeza encadeada do histórico em `cron_job_history`
- execução manual via `cron.runNow`
- pausa e reativação via `cron.update`

### 3. Configurações globais do domínio Cron

O Backoffice agora expõe um painel lateral dedicado às configurações operacionais:

- timezone padrão das rotinas
- canal de alertas operacionais
- janela de manutenção planejada
- persistência via `cron.updateSettings`, com leitura por `cron.getSettings`

### 4. Reforço de contratos e normalização

O `cronRouter` foi consolidado para suportar a frente administrativa de forma confiável:

- nova procedure `getTemplates` baseada em `CRON_JOB_CONFIGS`
- serialização e desserialização segura de `jobPayload` (string ↔ objeto JSON)
- recálculo automático de `nextRunAt` em atualizações de frequência ou expressão cron
- normalização de retorno (`normalizeCronJob`) garantindo payload tipado para o frontend
- `updateSettings` migrado para `onDuplicateKeyUpdate` com `set`, alinhado ao Drizzle ORM

## Impacto esperado

A entrega transforma o `/admin/schedules` em uma central operacional completa para automação recorrente, eliminando dependência de scripts manuais para administrar cron jobs e ampliando a governança administrativa sobre cadência, payload e parâmetros globais do domínio Cron.

## Próximos passos recomendados

1. persistir histórico de execução real conectado aos workers BullMQ
2. integrar logs detalhados de execução com a central administrativa de logs
3. relacionar jobs a métricas SLA por domínio (financeiro, conteúdo, marketplace, comissões)
4. expor alertas automáticos quando um job ultrapassar threshold de falhas consecutivas
