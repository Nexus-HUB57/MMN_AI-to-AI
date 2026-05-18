# Operação Agentic, SRE e Compliance — MMN_AI-to-AI

## Objetivo
Definir os controles operacionais mínimos para que a camada agentic seja segura, observável e defendável em ambiente real.

## Pilar 1 — Observabilidade
A camada agentic precisa de três tipos de telemetria:
- **métricas** para capacidade, custo e confiabilidade;
- **traces** para seguir a execução de cada ciclo;
- **logs estruturados** para auditoria e troubleshooting.

## Métricas Prioritárias

| Métrica | Objetivo |
| --- | --- |
| `langgraph_cycle_total` | volume de ciclos executados |
| `langgraph_cycle_duration_seconds` | latência dos ciclos |
| `agent_judge_score` | qualidade/risco médio das decisões |
| `agent_actions_blocked_total` | volume de bloqueios por policy |
| `agent_actions_executed_total` | ações realmente executadas |
| `llm_tokens_used_total` | consumo de tokens por agente/modelo |
| `tool_execution_duration_seconds` | latência por integração externa |
| `bullmq_job_failed_total` | saúde dos workers |

## Stack Recomendada de Observabilidade
- OpenTelemetry para instrumentação;
- Prometheus para coleta e regras;
- Grafana para dashboards e alertas;
- Loki para logs estruturados;
- Jaeger ou equivalente para traces.

## Dashboards Mínimos
1. **Visão Geral do Sistema**
   - uptime;
   - workers ativos;
   - ciclos/hora;
   - custo estimado.
2. **Camada Agentic**
   - judge score médio;
   - ações executadas vs bloqueadas;
   - latência por grafo/nó;
   - tokens por modelo.
3. **Integrações Externas**
   - falhas por provider;
   - retentativas;
   - throttling;
   - throughput por canal.
4. **Negócio**
   - afiliados ativos;
   - campanhas em execução;
   - conversão por canal;
   - impacto em vendas e comissões.

## Alertas Recomendados

| Alerta | Condição |
| --- | --- |
| Judge score baixo | média < limiar por janela definida |
| Ações bloqueadas em alta | pico anormal de bloqueios |
| Falha de workers | taxa de erro acima do baseline |
| Custo LLM alto | estouro de budget diário/hora |
| Latência alta de ciclo | p95 acima do tolerado |
| Falha em integração externa | erro persistente por provider |

## Pilar 2 — Segurança Operacional
Antes de permitir autonomia relevante, o sistema deve ter:
- MFA para administradores e operadores sensíveis;
- segredos geridos de forma centralizada;
- rotação de tokens de integrações externas;
- escopos mínimos por API;
- circuit breakers por canal;
- budget guard por tenant/agente;
- allowlist/denylist de ações e temas.

## Pilar 3 — Compliance e LGPD
O uso agentic no Brasil exige governança explícita.

### Requisitos mínimos
- registro de base legal/consentimento para contatos;
- opt-in e opt-out funcionais;
- suppress list para leads que não desejam contato;
- retenção de logs e histórico com política definida;
- rastreabilidade de quem executou cada ação (humano ou agente);
- transparência comercial em recrutamento e divulgação.

### Canais de Mensageria
Para WhatsApp Business e canais equivalentes:
- respeitar janela de atendimento;
- usar templates aprovados quando aplicável;
- impedir disparos livres fora das políticas do provedor;
- limitar cadência por lead, campanha e tenant.

## Pilar 4 — SRE e Gestão de Incidentes

### Runbooks mínimos
- fila travada ou crescendo acima do normal;
- provider externo indisponível;
- explosão de custo de LLM;
- excesso de bloqueios do judge;
- ciclo agentic preso em retry;
- incidente de compliance.

### Métricas operacionais sugeridas
- MTTR por classe de incidente;
- taxa de retry bem-sucedido;
- taxa de dead-letter;
- custo médio por ciclo;
- disponibilidade por provider.

## Rollout Recomendado

### Etapa 1 — Híbrido
O sistema sugere ações e aguarda aprovação humana.

### Etapa 2 — Supervisionado
Ações de baixo risco são automáticas; alto risco vai para revisão.

### Etapa 3 — Autônomo Controlado
Ações aprovadas por policy podem rodar sem intervenção, com budgets, rate limits e observabilidade completa.

## Critério para Produção Madura
A camada agentic só deve ser promovida para um discurso de autonomia plena quando houver:
- trilha auditável de 100% das ações;
- budgets ativos por tenant/agente;
- incidentes recuperáveis com runbooks;
- consentimento e opt-out aplicados nos canais relevantes;
- visibilidade em dashboards e alertas;
- beta real operando com estabilidade aceitável.
