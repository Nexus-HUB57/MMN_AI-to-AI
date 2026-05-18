# Roadmap Agentic de Execução — MMN_AI-to-AI

## Objetivo
Este documento consolida o caminho de execução para levar o MMN_AI-to-AI do estado atual de plataforma funcional com componentes de IA para uma operação agentic madura, auditável e escalável.

A premissa central é simples: o sistema **ainda não deve ser tratado como 100% autônomo em produção**, mas já possui base suficiente para chegar a esse ponto com uma evolução disciplinada.

## Diagnóstico Executivo
O repositório apresenta quatro características positivas já consolidadas:

- monorepo full-stack com separação clara entre frontend, backend, mobile, banco e infraestrutura;
- core transacional de MMN, pedidos, pagamentos e comissões já modelado;
- uso de tRPC, TypeScript e Drizzle para contratos mais seguros;
- presença de filas BullMQ e roteador LLM, o que facilita a criação da camada agentic.

Ao mesmo tempo, ainda existem lacunas que impedem a afirmação de operação plena:

- inconsistências pontuais de contratos entre frontend e backend;
- lacunas de autenticação forte, budget control e circuit breakers;
- autonomia agentic ainda mais conceitual/assistida do que validada em produção;
- observabilidade e compliance ainda precisam ser endurecidos como disciplina operacional.

## Princípios de Evolução
1. **Preservar o core transacional**: comissões, pagamentos, orders, tracking e rede devem continuar sendo a fonte oficial da verdade.
2. **Adicionar a camada agentic em paralelo**: a autonomia não deve reescrever o coração do sistema.
3. **Começar pequeno e mensurável**: um fluxo agentic real vale mais do que vários fluxos conceituais.
4. **Auditoria antes de escala**: toda ação autônoma precisa ser rastreável.
5. **Autonomia progressiva**: híbrido -> supervisionado -> autônomo controlado.

## Fases Recomendadas

### Fase A — Estabilização do Produto Atual
Objetivo: reduzir atrito estrutural antes de adicionar mais complexidade.

Entregáveis:
- fechar type-safety tRPC ponta a ponta;
- remover `any` críticos do frontend/web e mobile;
- alinhar campos consumidos no frontend com o schema real;
- consolidar autenticação, sessão e tratamento de cookies;
- validar runtime mínimo de backend, workers e rotas críticas.

Critérios de saída:
- build limpo;
- endpoints críticos estáveis;
- zero import quebrado nos módulos essenciais;
- ambiente de staging reproduzível.

### Fase B — Fundação Agentic Mínima Viável
Objetivo: implementar um ciclo agentic real com auditoria.

Escopo sugerido:
- analisar tendência;
- gerar conteúdo;
- submeter ao policy/judge;
- aprovar, bloquear ou agendar.

Entregáveis:
- `agent_sessions`;
- `agent_action_audit`;
- `agent_policies`;
- `agentic_queue`;
- `marketing_orchestrator`;
- dashboard mínimo de execução.

Critérios de saída:
- um agente executa o ciclo completo ponta a ponta;
- retries e idempotência funcionam;
- toda execução gera trilha auditável;
- decisões do judge ficam visíveis para operação.

### Fase C — Ação no Mundo Real
Objetivo: integrar canais externos com segurança.

Ordem recomendada:
1. Instagram/Facebook Business;
2. WhatsApp Business Cloud API;
3. CRM / marketplaces / integrações comerciais.

Critérios de saída:
- postagem real controlada em ambiente business;
- envio de mensagens em conformidade com política do canal;
- rastreamento de sucesso/falha e retentativa;
- suppress lists, opt-out e cadência operacional ativos.

### Fase D — Memória e Personalização
Objetivo: aumentar contexto, coerência e performance dos agentes.

Entregáveis:
- memória por afiliado e por lead;
- base de conhecimento por tenant;
- perfil de marca e políticas por canal;
- recuperação semântica para contexto de campanhas.

Critérios de saída:
- agentes reutilizam contexto anterior com qualidade previsível;
- redução de repetição/contradição em campanhas;
- suporte a personalização por nicho ou afiliado.

### Fase E — Escala Operacional
Objetivo: tornar a autonomia defendável em produção.

Entregáveis:
- budgets por tenant/agente;
- rate limiting por ação/canal;
- circuit breakers;
- observabilidade unificada;
- feature flags;
- billing por uso;
- processo de incident response.

Critérios de saída:
- beta com usuários reais operando com baixa intervenção humana;
- custo médio por ciclo controlado;
- incidentes recuperáveis;
- autonomia acompanhada por KPIs objetivos.

## KPIs Recomendados

| KPI | Meta inicial | Meta madura |
| --- | ---: | ---: |
| % de ciclos concluídos sem intervenção | 60% | 85%+ |
| % de ações bloqueadas pelo judge | < 25% | < 10% |
| taxa de erro de tools externas | < 15% | < 5% |
| rastreabilidade de ações/autoria | 100% | 100% |
| leads com consentimento válido | 100% | 100% |
| MTTR de incidentes agentic | < 30 min | < 10 min |

## Definição Operacional de “100%”
O sistema só deve ser considerado alinhado a uma operação agentic plena quando houver evidência de que:

- agentes executam fluxos ponta a ponta com pouca intervenção;
- canais externos funcionam com governança e opt-out;
- falhas são recuperáveis;
- custos estão controlados por orçamento;
- ações são auditáveis;
- métricas de autonomia estão sendo acompanhadas em produção.

## Próximo Passo Recomendado
A prioridade correta não é “codar tudo de uma vez”. A prioridade é:

1. estabilizar contratos e runtime atual;
2. implementar um único fluxo agentic real;
3. medir, auditar e corrigir;
4. expandir gradualmente para marketing, vendas e multiagente.
