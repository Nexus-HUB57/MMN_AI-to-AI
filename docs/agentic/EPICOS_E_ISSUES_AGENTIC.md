# Épicos e Issues Detalhadas — Backlog Agentic do MMN_AI-to-AI

## Objetivo
Transformar a trilha documental agentic em um backlog executável para GitHub Issues/Projects, com granularidade suficiente para planejamento técnico, priorização e acompanhamento por sprint.

## Revisão do Conteúdo Publicado
A revisão dos documentos `ROADMAP_AGENTIC_EXECUCAO.md`, `ARQUITETURA_AGENTIC_ALVO.md` e `OPERACAO_AGENTIC_SRE_COMPLIANCE.md` confirma cinco linhas-mestras:

1. o core transacional deve ser preservado;
2. a camada agentic deve nascer em paralelo;
3. a evolução precisa ser progressiva e auditável;
4. observabilidade, budgets e policy gates são obrigatórios;
5. autonomia plena depende de validação operacional, não apenas de código escrito.

Como consequência, o backlog foi organizado em épicos que respeitam essa ordem natural: primeiro estabilização, depois fundação agentic, depois governança, integrações externas, memória, operação e rollout.

---

## Taxonomia de Labels Recomendada

### Labels de tipo
- `type:epic`
- `type:feature`
- `type:tech-debt`
- `type:security`
- `type:compliance`
- `type:observability`
- `type:docs`

### Labels de área
- `area:frontend`
- `area:backend`
- `area:database`
- `area:mobile`
- `area:agentic`
- `area:integrations`
- `area:security`
- `area:observability`
- `area:infra`

### Labels de prioridade
- `priority:P0`
- `priority:P1`
- `priority:P2`
- `priority:P3`

### Labels de status sugeridas
- `status:ready`
- `status:blocked`
- `status:in-progress`
- `status:needs-spec`
- `status:waiting-review`

---

## Visão Geral dos Épicos

| Epic ID | Título | Prioridade | Resultado esperado |
| --- | --- | --- | --- |
| EPIC-01 | Estabilização dos contratos e runtime | P0 | Base previsível para evolução agentic |
| EPIC-02 | Fundação do Control Plane Agentic | P0 | Primeiro fluxo agentic auditável |
| EPIC-03 | Policy Engine, Judge e Human-in-the-Loop | P0 | Governança de risco antes de autonomia |
| EPIC-04 | Integrações externas e Tools Layer | P1 | Ações reais em canais externos |
| EPIC-05 | Memória, contexto e personalização | P1 | Melhor coerência e reaproveitamento de contexto |
| EPIC-06 | Observabilidade, SRE e operação | P0 | Capacidade de operar e diagnosticar |
| EPIC-07 | Segurança, compliance e rollout produtivo | P0 | Autonomia controlada com governança |

---

# EPIC-01 — Estabilização dos contratos e runtime
**Tipo:** `type:epic`  
**Prioridade:** `priority:P0`  
**Labels:** `type:epic`, `area:frontend`, `area:backend`, `area:mobile`, `priority:P0`

## Descrição
Fechar inconsistências entre frontend, backend, mobile, tipos compartilhados e runtime mínimo. Este épico reduz o atrito estrutural antes da introdução de mais complexidade agentic.

## Critérios de aceite do épico
- build web/backend/mobile sem erros bloqueantes;
- rotas críticas tRPC com contrato coerente;
- remoção dos `any` críticos do cliente tRPC;
- health checks e workers básicos funcionando de forma previsível;
- documentação refletindo o estado real do runtime.

### ISSUE AG-01 — Fechar type-safety tRPC no frontend e mobile
**Tipo:** `type:tech-debt`  
**Prioridade:** `priority:P0`  
**Labels:** `type:tech-debt`, `area:frontend`, `area:mobile`, `area:backend`, `priority:P0`, `status:ready`

**Descrição:**
Substituir contratos frouxos por importação do `AppRouter` real e alinhar os clientes tRPC web/mobile ao contrato exportado pelo backend.

**Arquivos-alvo sugeridos:**
- `frontend/src/lib/trpc.ts`
- `frontend/src/components/trpc-provider.tsx`
- `mobile/` (client/provider equivalente)
- `backend/src/appRouter.ts`

**Critérios de aceite:**
- `AppRouter = any` inexistente no frontend;
- hooks tRPC tipados sem casts manuais nos fluxos principais;
- cliente mobile alinhado ao mesmo contrato;
- `npm run build` sem erro de tipo relacionado ao cliente tRPC.

### ISSUE AG-02 — Corrigir divergências de rotas e payloads entre frontend e backend
**Tipo:** `type:tech-debt`  
**Prioridade:** `priority:P0`  
**Labels:** `type:tech-debt`, `area:frontend`, `area:backend`, `priority:P0`, `status:ready`

**Descrição:**
Mapear e corrigir rotas consumidas pelo frontend que divergem dos routers efetivamente expostos pelo backend, incluindo nomes, paths e formatos de retorno.

**Arquivos-alvo sugeridos:**
- `frontend/src/pages/*`
- `backend/src/routers/mmnRouter.ts`
- `backend/src/routers/dashboardRouter.ts`
- `backend/src/appRouter.ts`

**Critérios de aceite:**
- documento de mapeamento contrato-atual vs contrato-correto anexado à issue;
- telas principais não dependem mais de rotas inexistentes;
- payloads retornados cobrem os campos realmente consumidos;
- smoke test das telas Home, Dashboard e conteúdo principal concluído.

### ISSUE AG-03 — Alinhar schema, queries e campos usados nas telas principais
**Tipo:** `type:feature`  
**Prioridade:** `priority:P0`  
**Labels:** `type:feature`, `area:database`, `area:frontend`, `area:backend`, `priority:P0`, `status:ready`

**Descrição:**
Revisar campos usados por dashboard, perfil de afiliado e minissites para garantir aderência ao schema real ou criar projeções/aggregates consistentes.

**Critérios de aceite:**
- campos como totais, métricas de rede e earnings têm origem clara;
- nenhuma tela principal depende de campo “fantasma”; 
- se necessário, novos endpoints agregados foram criados no backend;
- consultas documentadas no PR.

### ISSUE AG-04 — Endurecer autenticação e sessão para baseline operacional
**Tipo:** `type:security`  
**Prioridade:** `priority:P0`  
**Labels:** `type:security`, `area:backend`, `area:frontend`, `area:security`, `priority:P0`, `status:ready`

**Descrição:**
Consolidar a implementação atual de JWT/contexto tRPC, padronizando expiração, renovação, cookies, middleware e tratamento de sessão inválida.

**Arquivos-alvo sugeridos:**
- `backend/src/trpc/trpc.ts`
- `backend/src/trpc/context.ts`
- `frontend/src/contexts/AuthContext.tsx`
- `.env.example`

**Critérios de aceite:**
- login/logout e recuperação de sessão com comportamento previsível;
- middlewares protegem rotas privadas de forma consistente;
- cookies e headers documentados;
- erros de autenticação retornam códigos e mensagens coerentes.

### ISSUE AG-05 — Validar runtime mínimo e saúde dos workers atuais
**Tipo:** `type:feature`  
**Prioridade:** `priority:P1`  
**Labels:** `type:feature`, `area:backend`, `area:infra`, `priority:P1`, `status:ready`

**Descrição:**
Executar uma rodada de validação operacional do backend bootstrap, workers BullMQ e endpoints críticos, produzindo checklist de runtime.

**Arquivos-alvo sugeridos:**
- `backend/src/index.ts`
- `backend/src/config/queue.ts`
- `backend/src/workers/*`

**Critérios de aceite:**
- `/health` e rotas tRPC críticas validadas;
- workers sobem sem crash inicial;
- filas essenciais conseguem processar um job de teste;
- checklist anexado no PR ou issue.

---

# EPIC-02 — Fundação do Control Plane Agentic
**Tipo:** `type:epic`  
**Prioridade:** `priority:P0`  
**Labels:** `type:epic`, `area:agentic`, `area:backend`, `area:database`, `priority:P0`

## Descrição
Criar a fundação mínima da camada agentic com estado, auditoria, fila dedicada e um primeiro fluxo orquestrado.

## Critérios de aceite do épico
- tabelas básicas da camada agentic criadas;
- queue/worker agentic operando separadamente das filas existentes;
- primeiro orquestrador funcional com fluxo simples;
- toda execução persistida em auditoria;
- dashboard mínimo de status disponível.

### ISSUE AG-06 — Criar schema Drizzle da camada agentic
**Tipo:** `type:feature`  
**Prioridade:** `priority:P0`  
**Labels:** `type:feature`, `area:database`, `area:agentic`, `priority:P0`, `status:ready`

**Descrição:**
Adicionar schemas/migrações para `agent_sessions`, `agent_action_audit`, `agent_policies` e estrutura inicial de `agent_memories`.

**Critérios de aceite:**
- novas tabelas modeladas com chaves e índices mínimos;
- migrações geradas e aplicáveis;
- relacionamentos com `users` e `agents` definidos;
- documentação do schema incluída no PR.

### ISSUE AG-07 — Criar queue e worker dedicados para a camada agentic
**Tipo:** `type:feature`  
**Prioridade:** `priority:P0`  
**Labels:** `type:feature`, `area:backend`, `area:agentic`, `area:infra`, `priority:P0`, `status:ready`

**Descrição:**
Implementar uma fila BullMQ própria para ciclos agentic, com retries, backoff, DLQ e controle de concorrência.

**Arquivos-alvo sugeridos:**
- `backend/src/config/queue.ts`
- `backend/src/workers/`
- novo namespace `backend/src/agentic/queue/`

**Critérios de aceite:**
- queue agentic separada das filas de conteúdo/comissões;
- worker registra sucesso, retry e falha final;
- idempotência documentada;
- teste manual com job de exemplo executado com sucesso.

### ISSUE AG-08 — Implementar Marketing Orchestrator mínimo viável
**Tipo:** `type:feature`  
**Prioridade:** `priority:P0`  
**Labels:** `type:feature`, `area:agentic`, `area:backend`, `priority:P0`, `status:ready`

**Descrição:**
Criar o primeiro orquestrador com fluxo simples: análise -> geração -> avaliação -> decisão -> registro.

**Critérios de aceite:**
- orquestrador executa um fluxo mínimo ponta a ponta;
- estado da sessão é persistido;
- output do fluxo fica acessível para revisão operacional;
- erros não quebram o processo inteiro sem registro.

### ISSUE AG-09 — Registrar trilha auditável de todas as ações agentic
**Tipo:** `type:feature`  
**Prioridade:** `priority:P0`  
**Labels:** `type:feature`, `area:database`, `area:agentic`, `priority:P0`, `status:ready`

**Descrição:**
Garantir que cada ação tentada, aprovada, bloqueada ou executada gere um registro de auditoria com contexto mínimo.

**Critérios de aceite:**
- auditoria registra ação, payload resumido, resultado e decisão;
- vínculo com usuário/agente/sessão preservado;
- trilha pode ser consultada por endpoint interno ou tela administrativa;
- política de retenção inicial descrita.

### ISSUE AG-10 — Expor status agentic via tRPC e dashboard mínimo
**Tipo:** `type:feature`  
**Prioridade:** `priority:P1`  
**Labels:** `type:feature`, `area:frontend`, `area:backend`, `area:agentic`, `priority:P1`, `status:ready`

**Descrição:**
Criar endpoint(s) tRPC para listar sessões, últimas ações e estado do agente, com tela mínima de monitoramento.

**Critérios de aceite:**
- operador consegue ver última execução e status atual do agente;
- dashboard exibe ações recentes e resultado básico;
- estados bloqueado/falha/executado aparecem visualmente;
- consultas não exigem acesso direto ao banco.

---

# EPIC-03 — Policy Engine, Judge e Human-in-the-Loop
**Tipo:** `type:epic`  
**Prioridade:** `priority:P0`  
**Labels:** `type:epic`, `area:agentic`, `area:security`, `area:compliance`, `priority:P0`

## Descrição
Criar governança de risco antes de permitir ação externa relevante. O judge deve avaliar segurança, política, custo e necessidade de revisão humana.

## Critérios de aceite do épico
- decisão pré-ação implementada;
- política e budget gates funcionando;
- revisão humana para ações de maior risco;
- saída do judge persistida e observável.

### ISSUE AG-11 — Implementar Judge pré-ação com decisão estruturada
**Tipo:** `type:feature`  
**Prioridade:** `priority:P0`  
**Labels:** `type:feature`, `area:agentic`, `area:security`, `priority:P0`, `status:ready`

**Descrição:**
Criar serviço de judge pré-ação com saída estruturada: `decision`, `risk_level`, `policy_hits`, `estimated_cost`, `needs_human_review`, `safe_rewrite`.

**Critérios de aceite:**
- saída validada por schema;
- estados approve/revise/block/escalate suportados;
- decisões persistidas em auditoria;
- integração com o orquestrador mínima viável.

### ISSUE AG-12 — Implementar Policy Gate configurável por tenant/agente
**Tipo:** `type:feature`  
**Prioridade:** `priority:P0`  
**Labels:** `type:feature`, `area:agentic`, `area:database`, `area:compliance`, `priority:P0`, `status:ready`

**Descrição:**
Criar camada de políticas parametrizáveis para canais permitidos, quiet hours, temas bloqueados, revisão humana e limites de ação.

**Critérios de aceite:**
- políticas persistidas em banco;
- leitura aplicada em tempo de execução;
- bloqueios deixam rastro legível;
- configuração por tenant ou agente suportada.

### ISSUE AG-13 — Implementar Budget Gate para custo e volume diário
**Tipo:** `type:feature`  
**Prioridade:** `priority:P0`  
**Labels:** `type:feature`, `area:agentic`, `area:observability`, `priority:P0`, `status:ready`

**Descrição:**
Criar guardas para impedir estouro de orçamento ou excesso de ações por janela de tempo.

**Critérios de aceite:**
- limites por tenant/agente definidos;
- tentativa acima do orçamento resulta em bloqueio rastreável;
- counters de custo/volume são atualizados;
- mensagens operacionais explicam o motivo do bloqueio.

### ISSUE AG-14 — Criar Human-in-the-Loop para ações de risco médio/alto
**Tipo:** `type:feature`  
**Prioridade:** `priority:P1`  
**Labels:** `type:feature`, `area:frontend`, `area:agentic`, `area:security`, `priority:P1`, `status:ready`

**Descrição:**
Adicionar mecanismo de revisão humana para ações marcadas como `revise` ou `escalate`, com fila de aprovação e decisão final.

**Critérios de aceite:**
- ações pendentes ficam acessíveis para revisão;
- aprovador consegue aprovar, rejeitar ou solicitar ajuste;
- decisão humana atualiza a trilha auditável;
- fluxo não depende de edição manual no banco.

---

# EPIC-04 — Integrações externas e Tools Layer
**Tipo:** `type:epic`  
**Prioridade:** `priority:P1`  
**Labels:** `type:epic`, `area:integrations`, `area:agentic`, `priority:P1`

## Descrição
Estruturar uma camada de tools previsível e segura, começando por canais de maior retorno no contexto brasileiro.

## Critérios de aceite do épico
- contrato padronizado para tools;
- pelo menos um canal social e um canal de mensageria integrados em modo controlado;
- retries e falhas classificadas por provider;
- suppress list e conformidade mínima aplicadas onde necessário.

### ISSUE AG-15 — Padronizar contrato da Tools Layer
**Tipo:** `type:feature`  
**Prioridade:** `priority:P1`  
**Labels:** `type:feature`, `area:agentic`, `area:integrations`, `priority:P1`, `status:ready`

**Descrição:**
Criar contrato único de retorno para tools externas e adaptadores para providers futuros.

**Critérios de aceite:**
- interface `ToolExecutionResult` definida e aplicada;
- tools retornam status consistente;
- erros retriáveis e não-retriáveis distinguidos;
- documentação de integração criada.

### ISSUE AG-16 — Integrar Instagram/Facebook Business em modo controlado
**Tipo:** `type:feature`  
**Prioridade:** `priority:P1`  
**Labels:** `type:feature`, `area:integrations`, `area:agentic`, `priority:P1`, `status:ready`

**Descrição:**
Implementar publicação controlada para Meta Business, incluindo criação/publicação, tratamento de erro e rastreabilidade.

**Critérios de aceite:**
- publicação de teste em conta business/sandbox;
- falhas de mídia/token/status são tratadas;
- ação é bloqueável pelo judge/policy gate;
- resultado é persistido em auditoria.

### ISSUE AG-17 — Integrar WhatsApp Business Cloud API com governança de janela e template
**Tipo:** `type:feature`  
**Prioridade:** `priority:P1`  
**Labels:** `type:feature`, `area:integrations`, `area:compliance`, `priority:P1`, `status:ready`

**Descrição:**
Criar tool de mensageria para WhatsApp Business respeitando template policy, janela de atendimento, opt-in e suppress list.

**Critérios de aceite:**
- envio bloqueado fora das regras configuradas;
- templates aprovados suportados quando exigidos;
- opt-out impede novas mensagens;
- logs/auditoria incluem status por mensagem.

### ISSUE AG-18 — Conectar Tools Layer a marketplace/CRM internos
**Tipo:** `type:feature`  
**Prioridade:** `priority:P2`  
**Labels:** `type:feature`, `area:integrations`, `area:backend`, `priority:P2`, `status:ready`

**Descrição:**
Criar adaptadores internos para que o orquestrador possa acionar dados/ações ligadas a pedidos, leads e catálogo sem furar o core.

**Critérios de aceite:**
- tools internas invocam services oficiais, não acessos ad hoc;
- rastreamento de chamada interna disponível;
- documentação de dependências criada;
- pelo menos um fluxo de consulta e um de ação interna implementados.

---

# EPIC-05 — Memória, contexto e personalização
**Tipo:** `type:epic`  
**Prioridade:** `priority:P1`  
**Labels:** `type:epic`, `area:agentic`, `area:database`, `priority:P1`

## Descrição
Dar contexto persistente e reutilizável aos agentes para evitar repetição, melhorar coerência e permitir personalização por afiliado, lead ou tenant.

## Critérios de aceite do épico
- memória episódica básica funcionando;
- estratégia de recuperação definida;
- personalização por contexto suportada;
- integração com orquestrador mínima viável.

### ISSUE AG-19 — Implementar memória episódica operacional
**Tipo:** `type:feature`  
**Prioridade:** `priority:P1`  
**Labels:** `type:feature`, `area:agentic`, `area:database`, `priority:P1`, `status:ready`

**Descrição:**
Persistir fatos úteis de execuções anteriores, decisões, campanhas e interações relevantes para reuso posterior.

**Critérios de aceite:**
- registro de memórias por tipo/contexto;
- memória recuperável por agente/usuário;
- política mínima de expiração/limpeza documentada;
- uso prático em pelo menos um nó do orquestrador.

### ISSUE AG-20 — Integrar vector store para recuperação semântica
**Tipo:** `type:feature`  
**Prioridade:** `priority:P2`  
**Labels:** `type:feature`, `area:agentic`, `area:infra`, `priority:P2`, `status:ready`

**Descrição:**
Adicionar mecanismo dedicado de busca vetorial para memória semântica, evitando depender apenas de JSON em MySQL.

**Critérios de aceite:**
- provider vetorial escolhido e documentado;
- pipeline de ingestão/consulta implementado;
- busca por similaridade funcional;
- fallback seguro caso o provider esteja indisponível.

### ISSUE AG-21 — Implementar personalização por afiliado, tenant e lead
**Tipo:** `type:feature`  
**Prioridade:** `priority:P2`  
**Labels:** `type:feature`, `area:agentic`, `area:backend`, `priority:P2`, `status:ready`

**Descrição:**
Permitir que campanhas e decisões considerem nicho, histórico, tom de marca, restrições e estágio do lead.

**Critérios de aceite:**
- contexto de tenant/agente/lead consolidado em objeto consumível;
- prompts/decisões usam esse contexto;
- diferenças de comportamento entre perfis ficam demonstráveis;
- documentação de precedência de contexto criada.

---

# EPIC-06 — Observabilidade, SRE e operação
**Tipo:** `type:epic`  
**Prioridade:** `priority:P0`  
**Labels:** `type:epic`, `area:observability`, `area:infra`, `priority:P0`

## Descrição
Dar visibilidade operacional ao sistema para que a camada agentic possa ser medida, operada e corrigida em produção.

## Critérios de aceite do épico
- métricas essenciais emitidas;
- dashboards mínimos publicados;
- alertas básicos funcionando;
- runbooks iniciais documentados.

### ISSUE AG-22 — Instrumentar métricas da camada agentic com OpenTelemetry/Prometheus
**Tipo:** `type:observability`  
**Prioridade:** `priority:P0`  
**Labels:** `type:observability`, `area:observability`, `area:agentic`, `priority:P0`, `status:ready`

**Descrição:**
Emitir counters, histograms e gauges para ciclos, judge, tools, tokens, falhas e workers.

**Critérios de aceite:**
- métricas prioritárias do documento de operação emitidas;
- labels mínimas padronizadas;
- custo e latência por ciclo observáveis;
- documentação de nomes e semântica publicada.

### ISSUE AG-23 — Publicar dashboards mínimos de operação agentic
**Tipo:** `type:observability`  
**Prioridade:** `priority:P1`  
**Labels:** `type:observability`, `area:observability`, `area:infra`, `priority:P1`, `status:ready`

**Descrição:**
Criar dashboards de visão geral, camada agentic, integrações externas e negócio.

**Critérios de aceite:**
- dashboards versionados no repositório;
- painéis principais alimentados por dados reais;
- time de operação consegue identificar falhas sem consultar banco diretamente;
- screenshots ou evidências anexadas no PR.

### ISSUE AG-24 — Configurar alertas operacionais mínimos
**Tipo:** `type:observability`  
**Prioridade:** `priority:P1`  
**Labels:** `type:observability`, `area:observability`, `priority:P1`, `status:ready`

**Descrição:**
Configurar alertas para judge score baixo, bloqueios em alta, falha de worker, latência alta e estouro de orçamento.

**Critérios de aceite:**
- alertas disparam em cenário de teste;
- limiares documentados;
- severidade e roteamento definidos;
- runbook vinculado aos alertas principais.

### ISSUE AG-25 — Criar runbooks e playbooks de incidentes agentic
**Tipo:** `type:docs`  
**Prioridade:** `priority:P1`  
**Labels:** `type:docs`, `area:observability`, `area:security`, `priority:P1`, `status:ready`

**Descrição:**
Documentar resposta para fila travada, custo alto, provider indisponível, excesso de bloqueio do judge e incidente de compliance.

**Critérios de aceite:**
- pelo menos cinco runbooks versionados;
- cada runbook contém detecção, triagem, contenção e rollback;
- links para dashboards/alertas incluídos;
- documento validado por responsável técnico.

---

# EPIC-07 — Segurança, compliance e rollout produtivo
**Tipo:** `type:epic`  
**Prioridade:** `priority:P0`  
**Labels:** `type:epic`, `area:security`, `area:compliance`, `area:infra`, `priority:P0`

## Descrição
Preparar a camada agentic para uso real com consentimento, limites de risco, segurança operacional e rollout progressivo.

## Critérios de aceite do épico
- consentimento e opt-out incorporados ao fluxo;
- segredos e acessos endurecidos;
- rollout híbrido/supervisionado/controlado modelado;
- KPIs de beta definidos e acompanháveis.

### ISSUE AG-26 — Implementar consentimento, opt-in, opt-out e suppress list
**Tipo:** `type:compliance`  
**Prioridade:** `priority:P0`  
**Labels:** `type:compliance`, `area:compliance`, `area:database`, `priority:P0`, `status:ready`

**Descrição:**
Criar base mínima para governança de contatos e impedir comunicações indevidas por agentes.

**Critérios de aceite:**
- opt-in e opt-out persistidos;
- suppress list consultada antes de ação outbound;
- ações impedidas ficam registradas;
- política mínima LGPD documentada junto ao fluxo.

### ISSUE AG-27 — Endurecer secrets management, escopos e MFA para operadores críticos
**Tipo:** `type:security`  
**Prioridade:** `priority:P0`  
**Labels:** `type:security`, `area:security`, `area:infra`, `priority:P0`, `status:ready`

**Descrição:**
Reforçar segurança operacional para integrações externas e perfis administrativos.

**Critérios de aceite:**
- segredos não ficam expostos em código ou envs inseguros;
- escopos mínimos por provider documentados;
- MFA ou plano equivalente implementado para usuários críticos;
- rotação e revogação de credenciais possuem procedimento claro.

### ISSUE AG-28 — Estruturar rollout híbrido -> supervisionado -> autônomo controlado
**Tipo:** `type:feature`  
**Prioridade:** `priority:P1`  
**Labels:** `type:feature`, `area:agentic`, `area:compliance`, `priority:P1`, `status:ready`

**Descrição:**
Modelar modos de execução da camada agentic, habilitando autonomia gradativa por tenant ou feature flag.

**Critérios de aceite:**
- modo de execução configurável por ambiente/tenant;
- ações de alto risco forçam revisão em modos iniciais;
- transição entre modos é auditável;
- documentação operacional do rollout publicada.

### ISSUE AG-29 — Definir beta operacional e governança de KPIs
**Tipo:** `type:feature`  
**Prioridade:** `priority:P1`  
**Labels:** `type:feature`, `area:agentic`, `area:observability`, `priority:P1`, `status:ready`

**Descrição:**
Criar o plano de beta produtivo com coorte inicial, KPIs, critérios de entrada/saída e rotina de revisão.

**Critérios de aceite:**
- coorte beta e responsáveis definidos;
- KPIs e baseline publicados;
- rituais de revisão semanal descritos;
- critérios para ampliar ou pausar rollout documentados.

---

## Ordem Recomendada de Execução
1. AG-01 a AG-05
2. AG-06 a AG-10
3. AG-11 a AG-14
4. AG-22 a AG-25
5. AG-15 a AG-18
6. AG-26 a AG-29
7. AG-19 a AG-21

## Observação Importante
Se o time quiser abrir as issues diretamente no GitHub, recomenda-se criar primeiro os **épicos** como issues-pai com label `type:epic`, e depois vincular as issues filhas via checklist ou project fields. Isso evita backlog solto e melhora o acompanhamento por fase.
