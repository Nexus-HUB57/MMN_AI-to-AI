# Plano de Execução por Sprint — Camada Agentic do MMN_AI-to-AI

## Objetivo
Traduzir o backlog agentic em uma sequência pragmática de sprints, respeitando dependências técnicas, redução de risco e necessidade de validação operacional progressiva.

## Premissas de Planejamento
- duração sugerida: **2 semanas por sprint**;
- equipe-base sugerida: **1 backend/agentic + 1 full-stack + 1 apoio infra/QA**;
- definição de pronto sempre exige código, evidência operacional e documentação mínima;
- nenhuma sprint deve introduzir autonomia externa sem trilha auditável e política mínima.

## Visão Resumida

| Sprint | Foco | Issues principais | Saída esperada |
| --- | --- | --- | --- |
| Sprint 1 | Contratos e runtime | AG-01, AG-02, AG-03 | Base tipada e rotas coerentes |
| Sprint 2 | Auth, runtime e schema agentic | AG-04, AG-05, AG-06 | Base segura e tabelas agentic prontas |
| Sprint 3 | Queue, orchestrator e auditoria | AG-07, AG-08, AG-09, AG-10 | Primeiro ciclo agentic visível |
| Sprint 4 | Judge, policy e budget | AG-11, AG-12, AG-13, AG-14 | Governança pré-ação e revisão humana |
| Sprint 5 | Observabilidade e operação | AG-22, AG-23, AG-24, AG-25 | Operação mensurável e alertável |
| Sprint 6 | Meta/WhatsApp e rollout inicial | AG-15, AG-16, AG-17, AG-28 | Autonomia externa controlada |
| Sprint 7 | Compliance, beta e segurança | AG-26, AG-27, AG-29 | Beta governado com consentimento |
| Sprint 8 | Memória e personalização | AG-18, AG-19, AG-20, AG-21 | Contexto persistente e personalização |

---

## Sprint 1 — Estabilização dos contratos e runtime
**Objetivo:** fechar o atrito estrutural que hoje impede previsibilidade técnica.

### Issues incluídas
- AG-01 — Fechar type-safety tRPC no frontend e mobile
- AG-02 — Corrigir divergências de rotas e payloads entre frontend e backend
- AG-03 — Alinhar schema, queries e campos usados nas telas principais

### Entregáveis
- frontend e mobile consumindo contrato real do backend;
- rotas críticas mapeadas e corrigidas;
- payloads consistentes para Home, Dashboard e fluxos principais.

### Critérios de aceite da sprint
- build sem erros de tipo nos fluxos principais;
- telas-chave renderizam sem depender de campos inexistentes;
- contrato tRPC documentado para os domínios estabilizados.

### Riscos
- divergências ocultas entre telas menos usadas e rotas históricas;
- necessidade de criar endpoints agregados no backend.

### Dependências
Nenhuma externa. Sprint de fundação.

---

## Sprint 2 — Auth, runtime e schema agentic
**Objetivo:** preparar a base operacional e de dados para a camada agentic.

### Issues incluídas
- AG-04 — Endurecer autenticação e sessão para baseline operacional
- AG-05 — Validar runtime mínimo e saúde dos workers atuais
- AG-06 — Criar schema Drizzle da camada agentic

### Entregáveis
- sessão/auth mais previsíveis;
- checklist de runtime e workers concluído;
- tabelas agentic prontas para uso.

### Critérios de aceite da sprint
- login/logout e sessão estáveis nos fluxos críticos;
- workers atuais validados;
- migração agentic criada e aplicável.

### Riscos
- ajustes de auth podem impactar telas legadas;
- schema pode exigir alinhamento com tabelas `agents` e `users`.

### Dependências
Sprint 1 concluída ou suficientemente estável.

---

## Sprint 3 — Queue, orchestrator e auditoria
**Objetivo:** colocar de pé o primeiro fluxo agentic de forma auditável.

### Issues incluídas
- AG-07 — Criar queue e worker dedicados para a camada agentic
- AG-08 — Implementar Marketing Orchestrator mínimo viável
- AG-09 — Registrar trilha auditável de todas as ações agentic
- AG-10 — Expor status agentic via tRPC e dashboard mínimo

### Entregáveis
- fila dedicada agentic;
- worker agentic funcionando;
- fluxo mínimo análise -> geração -> decisão -> auditoria;
- dashboard simples para inspeção.

### Critérios de aceite da sprint
- um ciclo agentic executa ponta a ponta em staging/local;
- auditoria mostra cada etapa essencial;
- dashboard exibe sessões recentes e status.

### Riscos
- orquestrador crescer cedo demais;
- acoplamento indevido com o core transacional.

### Dependências
Sprint 2 concluída.

---

## Sprint 4 — Judge, policy e budget gates
**Objetivo:** criar governança antes de qualquer autonomia externa séria.

### Issues incluídas
- AG-11 — Implementar Judge pré-ação com decisão estruturada
- AG-12 — Implementar Policy Gate configurável por tenant/agente
- AG-13 — Implementar Budget Gate para custo e volume diário
- AG-14 — Criar Human-in-the-Loop para ações de risco médio/alto

### Entregáveis
- decisão pré-ação estruturada;
- políticas configuráveis;
- bloqueio por orçamento/volume;
- revisão humana integrada.

### Critérios de aceite da sprint
- ações podem ser aprovadas, revisadas, bloqueadas ou escaladas;
- modo híbrido já é operacional;
- bloqueios e revisões aparecem em auditoria e dashboard.

### Riscos
- thresholds mal calibrados gerarem bloqueio excessivo;
- dificuldade de UX na fila de revisão humana.

### Dependências
Sprint 3 concluída.

---

## Sprint 5 — Observabilidade e operação
**Objetivo:** garantir que a camada agentic possa ser medida e operada.

### Issues incluídas
- AG-22 — Instrumentar métricas da camada agentic com OpenTelemetry/Prometheus
- AG-23 — Publicar dashboards mínimos de operação agentic
- AG-24 — Configurar alertas operacionais mínimos
- AG-25 — Criar runbooks e playbooks de incidentes agentic

### Entregáveis
- métricas e traces básicos;
- dashboards versionados;
- alertas principais ativos;
- runbooks iniciais publicados.

### Critérios de aceite da sprint
- time consegue identificar ciclo, falha, custo e bloqueio sem consultar banco;
- alertas principais testados;
- runbooks vinculados às falhas críticas.

### Riscos
- dashboards sem dados por falta de instrumentação suficiente;
- thresholds de alerta mal ajustados.

### Dependências
Sprint 4 preferencialmente concluída.

---

## Sprint 6 — Tools Layer e canais externos iniciais
**Objetivo:** conectar a camada agentic ao mundo real com governança.

### Issues incluídas
- AG-15 — Padronizar contrato da Tools Layer
- AG-16 — Integrar Instagram/Facebook Business em modo controlado
- AG-17 — Integrar WhatsApp Business Cloud API com governança de janela e template
- AG-28 — Estruturar rollout híbrido -> supervisionado -> autônomo controlado

### Entregáveis
- contrato único para tools;
- publicação controlada na Meta;
- mensageria governada em WhatsApp;
- modos de execução configuráveis.

### Critérios de aceite da sprint
- pelo menos uma ação real em canal externo é executada com auditoria;
- bloqueios por policy/budget funcionam;
- rollout por modo está operacional.

### Riscos
- credenciais e aprovação de contas business;
- política de templates e janela do WhatsApp.

### Dependências
Sprint 4 e Sprint 5 concluídas.

---

## Sprint 7 — Compliance, segurança e beta operacional
**Objetivo:** colocar a operação agentic em beta com governança real.

### Issues incluídas
- AG-26 — Implementar consentimento, opt-in, opt-out e suppress list
- AG-27 — Endurecer secrets management, escopos e MFA para operadores críticos
- AG-29 — Definir beta operacional e governança de KPIs

### Entregáveis
- consentimento e suppress list incorporados;
- segurança operacional reforçada;
- coorte beta e KPIs publicados.

### Critérios de aceite da sprint
- nenhuma ação outbound relevante ocorre sem validação de consentimento;
- acessos sensíveis estão endurecidos;
- rotina de acompanhamento do beta definida.

### Riscos
- dependência de processos organizacionais além de código;
- necessidade de alinhamento jurídico/comercial.

### Dependências
Sprint 6 concluída.

---

## Sprint 8 — Memória, contexto e personalização
**Objetivo:** aumentar qualidade contextual e reduzir repetição dos agentes.

### Issues incluídas
- AG-18 — Conectar Tools Layer a marketplace/CRM internos
- AG-19 — Implementar memória episódica operacional
- AG-20 — Integrar vector store para recuperação semântica
- AG-21 — Implementar personalização por afiliado, tenant e lead

### Entregáveis
- contexto persistente por agente/lead;
- recuperação semântica;
- personalização por tenant e afiliado;
- integração com dados internos relevantes.

### Critérios de aceite da sprint
- agentes recuperam contexto anterior com utilidade prática;
- campanhas demonstram diferença por perfil/tenant;
- fallback seguro definido para indisponibilidade do vector store.

### Riscos
- aumento de custo e latência;
- qualidade de recuperação sem curadoria de memória.

### Dependências
Sprints 3 a 7 já estabilizadas.

---

## Ritos Recomendados por Sprint
- **Planejamento:** definição de escopo fechado e riscos;
- **Mid-sprint review:** validação técnica e remoção de impedimentos;
- **Demo:** prova operacional, não só código;
- **Retro:** medir o que atrasou autonomia segura.

## Métricas de Acompanhamento do Plano
- issues concluídas por sprint;
- % de bloqueios removidos do caminho crítico;
- tempo médio de ciclo agentic em staging;
- % de ações com auditoria completa;
- taxa de falha por integração externa;
- custo médio por ciclo e por tenant.

## Regra de Ouro
A próxima sprint só deve aumentar autonomia quando a sprint anterior tiver entregue **rastreabilidade, previsibilidade e governança**. Se isso não estiver presente, a expansão deve ser adiada.
