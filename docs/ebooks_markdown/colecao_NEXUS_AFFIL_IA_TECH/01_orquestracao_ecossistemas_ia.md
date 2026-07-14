---
collection: "NEXUS AFFIL'IA'TE TECH — Coletânea Técnica"
volume: 1
roman: "I"
title: "Orquestração de Ecossistemas IA"
subtitle: "Engenharia de sistemas multi-agente em produção: padrões, topologias, fallbacks, custos e o contrato invisível entre agentes."
edition: "Edição Canônica 1.0.0"
issued: "2026-07-14"
authors:
  - "MMN AI-to-AI"
  - "Nexus HUB57"
language: pt-BR
canonical_edition: true
canonical_id: NEXUS_AFFIL_IA_TECH_VOL_01
---

# **NEXUS AFFIL'IA'TE TECH — Coletânea Técnica**

![Capa](../../../assets/ebook_covers/nexus_affil_ia_tech_01_orquestracao_ecossistemas_ia.webp)

## Volume I — Orquestração de Ecossistemas IA

**Engenharia de sistemas multi-agente em produção: padrões, topologias, fallbacks, custos e o contrato invisível entre agentes.**

*Edição Canônica 1.0.0 · 2026-07-14 · MMN AI-to-AI · Nexus HUB57 · Ecossistema MMN AI-to-AI*

> **Pergunta-âncora:** Como se constrói, de fato, um ecossistema de agentes que funciona em produção — não em demo — quando cada agente é não-determinístico, caro, lento e propenso a alucinar?

---

## Sumário

> 1. Da chamada única ao ecossistema: por que o "prompt" morreu
> 2. Anatomia canônica: orchestrator, planner, executor, critic, memory
> 3. Topologias: hub-and-spoke, mesh, hierárquica,联邦 (federada)
> 4. Máquinas de estado para agentes: o que substitui o `if/else`
> 5. Protocolos e barramentos: MCP, A2A, filas, tópicos, dead-letter
> 6. Orquestração síncrona vs assíncrona: o eixo temporal do design
> 7. Contratos entre agentes: input schema, output schema, SLAs e SLOs
> 8. Custos e economia por token: quem paga a conta do ecossistema
> 9. Observabilidade: traces, spans, métricas e o painel que não mente
> 10. Manifestos de orquestração: o que toda plataforma agêntica deveria ter
>
> Checklist Canônico, Glossário do Volume, Referências e Fechamento Editorial.

---

![Figura 1 — Arquitetura orchestrator + agents](../../assets/ebook_covers/../ebook_covers/nexus_affil_ia_tech_01_orquestracao_ecossistemas_ia.webp)
*Figura 1 — Topologia canônica orchestrator + agentes especializados. O orchestrator no centro; cada agente mantém um escopo de competência, ferramentas e memória próprios. Conexões representam contratos de mensagem, não dependências de código.*

## 1. Da chamada única ao ecossistema: por que o "prompt" morreu

Por três anos (2023–2025), a indústria tratou o LLM como um *terminal mágico*: um prompt entra, uma resposta sai. Isso foi um estágio necessário, mas é um estágio que já terminou. Em 2026, qualquer sistema que ainda dependa de **uma única chamada** a um modelo é um sistema que será substituído por um sistema que depende de **um ecossistema de chamadas coordenadas**.

A razão é tripla:

1. **Latência-amortizada exige paralelismo.** Uma tarefa que leva 60s em série pode levar 9s em paralelo. Mas paralelismo sem coordenação é caos. A coordenação é o trabalho do orquestrador.
2. **Especialização vence generalismo em produção.** Um agente focado em extrair schema SQL, combinado com um agente focado em revisar SQL por injection, combinado com um agente focado em redigir a resposta em linguagem natural, *sempre* produz um resultado melhor que um único agente "generalista" tentando fazer tudo.
3. **Custo é função da topologia.** A mesma tarefa entregue por um agente monstro de 200B parâmetros custa entre 8× e 30× mais do que a mesma tarefa entregue por uma cadeia de agentes pequenos (3B–13B) com chamada seletiva ao grande. Orquestração é, antes de tudo, **finanças**.

A primeira lição deste volume, portanto, é que **orquestração não é um "padrão avançado"**: é o novo normal. Quem ainda escreve `model.invoke(prompt)` em produção está rodando 2023 em 2026.

### 1.1 A falácia do agente único

Existe uma tentação recorrente: "meu agente é um Claude Opus 4, ele resolve". Sim, ele resolve. E custa US$ 0,018 por chamada média com 4k tokens de contexto. Em um SaaS com 50 mil usuários ativos fazendo 30 chamadas/dia, isso é **US$ 27 mil/mês só em inferência** — antes de margem, antes de overhead de orquestração, antes de retries. A conta não fecha.

A solução não é "usar modelo menor". É **usar o modelo certo no lugar certo** dentro de uma topologia orquestrada. Um classificador Haiku decide se a tarefa precisa de Opus. Um Sonnet 4.5 redige. Um Haiku valida. O Opus é invocado em 12% dos casos. A conta cai para US$ 6 mil/mês. A latência cai. A qualidade sobe (especialistas revisando).

### 1.2 O contrato invisível

A maioria dos times começa um projeto agêntico tratando agentes como funções assíncronas. Não são. Agentes são **atores com memória, orçamento e tendência a divagar**. O contrato entre eles precisa ser explícito:

- **Input schema** — o que o agente aceita. Não é só JSON; é JSON com invariantes semânticas.
- **Output schema** — o que ele promete devolver. Com confidence score, se possível.
- **Budget** — tokens, latência, retries, custo máximo em USD.
- **SLA** — em que % de chamadas ele está disponível.
- **Escopo** — o que ele *se recusa* a fazer (e como recusa).

Sem esse contrato, o sistema degrada silenciosamente. Com ele, falhas são detectáveis e recuperáveis.

---

## 2. Anatomia canônica: orchestrator, planner, executor, critic, memory

Um ecossistema maduro de agentes tem cinco papéis distintos. Confundi-los é a fonte número um de arquiteturas que funcionam no vídeo de demo e quebram no primeiro dia de produção.

### 2.1 Orchestrator (maestro)

O orchestrator **não decide nada** sobre o domínio. Ele decide **quem decide o quê, quando, e em que ordem**. Sua função é puramente estrutural: recebe uma intenção, escolhe uma topologia de execução, distribui trabalho, agrega resultados, detecta falhas e decide retry, fallback ou escalada.

Propriedades canônicas:

- **Stateless no domínio, stateful no controle.** Ele sabe em que passo está, mas não sabe (e não deve saber) o conteúdo do trabalho.
- **Determinístico no fluxo, probabilístico nas escolhas.** Se a entrada é a mesma, o fluxo é o mesmo. Qual agente é escolhido pode variar, mas a sequência de papéis é fixa.
- **Lógica de orquestração escrita em código.** Nunca em prompt. O orchestrator não é um agente LLM — é um serviço.

```python
class Orchestrator:
    def __init__(self, planner, executors, critic, memory):
        self.planner = planner
        self.executors = executors
        self.critic = critic
        self.memory = memory

    def run(self, intent: Intent) -> Result:
        plan = self.planner.decompose(intent, self.memory.context_for(intent))
        steps_completed = []
        for step in plan.steps:
            executor = self.executors[step.skill]
            output = executor.execute(step, budget=step.budget)
            verdict = self.critic.evaluate(output, criteria=step.criteria)
            if verdict.passed:
                steps_completed.append((step, output))
                self.memory.record(step, output, verdict)
            elif verdict.recoverable:
                # retry / refine
                ...
            else:
                # escalate
                ...
        return self.planner.aggregate(steps_completed)
```

Esse é o esqueleto. Tudo o que vem depois é refinamento.

### 2.2 Planner (estrategista)

O planner **decompõe** a intenção em um plano. O plano é uma estrutura de dados (DAG, na maioria dos casos), não uma sequência de prompts. Cada nó do plano tem: habilidade exigida, budget, dependências, critério de aceitação, dados de entrada esperados, dados de saída prometidos.

Existem dois estilos canônicos de planner:

- **Planner LLM-puro** (ReAct, Plan-and-Execute, Tree-of-Thoughts). Flexível, mas caro e instável.
- **Planner híbrido** (LLM gera esqueleto, código de domínio valida e preenche). Robusto, auditável, mas menos flexível.

Em produção, planners híbridos vencem 9 em 10 vezes. O LLM sugere, o código verifica, o código corrige, o LLM regenera apenas a parte que falhou.

### 2.3 Executor (operário)

O executor é o único papel que toca ferramentas externas. Ele recebe uma etapa do plano, executa usando tools, devolve um output + confidence. Importante: **o executor não decide se o output está bom** — isso é trabalho do critic. Separar execução de julgamento é a regra de ouro que evita o "agente que se auto-elogia".

### 2.4 Critic (auditor)

O critic é o componente esquecido e o mais importante. Sem critic, o ecossistema é uma caixa-preta. Com critic, é uma fábrica com QA. O critic compara o output do executor com o critério declarado no plano, gera um veredito estruturado e — crucial — **devolve um sinal útil** que o planner pode usar para re-tentar.

Três tipos canônicos de critic:

- **Critic baseado em regras** (regex, JSON Schema, asserts). Barato, exato, cego ao contexto.
- **Critic LLM-as-judge**. Caro, contextual, sujeito a viés.
- **Critic humano-no-loop**. Para casos onde o erro é catastrófico (finanças, jurídico, saúde).

A regra é: comece com regras, escale para LLM-as-judge, mantenha humano-no-loop nos 1% mais críticos.

### 2.5 Memory (memória)

A memória é o que diferencia um agente de uma função. Ela é o que permite que o passo 7 saiba o que o passo 3 decidiu. Mas memória tem três tipos e eles **não se misturam**:

- **Memória de trabalho (curto prazo)** — o contexto da execução atual. Volátil, descartado ao fim.
- **Memória episódica (médio prazo)** — execuções anteriores daquele usuário/sessão. Persistente, indexada, recuperável.
- **Memória semântica (longo prazo)** — conhecimento destilado, atualizado lentamente. Embeddings, grafos de conhecimento, facts verificados.

Misturar os três num único `vector_store.query()` é o anti-padrão mais comum. Cada tipo tem ciclo de vida, latência e custo próprios.

---

## 3. Topologias: hub-and-spoke, mesh, hierárquica, federada

A escolha de topologia determina onde mora a inteligência e onde mora a fragilidade. Existem quatro topologias canônicas, e cada uma tem uma geometria de falhas própria.

### 3.1 Hub-and-spoke (estrela)

Um orchestrator central, N agentes na borda. Toda comunicação passa pelo centro. É a topologia mais simples, mais auditável e mais frágil: o orchestrator é um single point of failure e um gargalo de latência.

**Quando usar:** primeiras versões, MVPs, sistemas com menos de 10 agentes, casos onde a auditabilidade é não-negociável (compliance, regulação).

**Quando evitar:** sistemas com mais de 20 agentes, workloads com fan-out alto (>50 chamadas paralelas), cenários que exigem degradação graceful.

### 3.2 Mesh (par-a-par)

Cada agente fala diretamente com qualquer outro. Sem orchestrator central; cada agente tem um "despachante" local que escolhe o próximo passo. É o que sistemas como AutoGPT e CrewAI implementam por padrão.

**Quando usar:** tarefas criativas, exploração aberta, sistemas onde o plano não é conhecido a priori.

**Quando evitar:** produção com SLAs. Mesh é bonita, mas é estatística — você não consegue responder "quanto tempo essa tarefa vai levar" porque o caminho depende do LLM.

### 3.3 Hierárquica (árvore)

Um supervisor geral, N supervisores de área, N×M executores. Cada nível toma decisões mais táticas conforme desce. É a topologia que mais se parece com organizações humanas — e não por acaso.

**Quando usar:** sistemas grandes (>50 agentes), domínios com clara subdivisão (jurídico, técnico, comercial), cenários onde delegação e accountability são explícitos.

**Quando evitar:** MVPs. O overhead de projetar a hierarquia e configurar comunicação entre níveis é proibitivo para problemas pequenos.

### 3.4 Federada

Múltiplos clusters de agentes (mesh, hierárquica ou hub-and-spoke) que se comunicam via protocolo padrão (MCP, A2A). Cada cluster tem autonomia. A federação negocia recursos, capacidade e identidade entre clusters.

**Quando usar:** quando seu sistema é na verdade "vários produtos que precisam cooperar". Cada produto tem seu cluster; a federação é a cola.

**Quando evitar:** antes de ter um cluster. Não federar o que ainda não existe.

### 3.5 Tabela comparativa

| Topologia | Auditabilidade | Latência p50 | Resiliência | Custo de coord. | Tamanho ideal |
|---|---|---|---|---|---|
| Hub-and-spoke | ★★★★★ | ★★ | ★ | ★ | 3–15 agentes |
| Mesh | ★★ | ★★★ | ★★★★ | ★★★★ | 3–8 agentes |
| Hierárquica | ★★★★ | ★★ | ★★★ | ★★ | 15–200 agentes |
| Federada | ★★★ | ★★ | ★★★★★ | ★★★★ | clusters de 10+ |

A escolha quase nunca é "qual a melhor". É "qual se parece com o problema que você tem".

---

![Figura 2 — Máquina de estados canônica de um agente](../../assets/ebook_covers/../ebook_covers/nexus_affil_ia_tech_01_orquestracao_ecossistemas_ia.webp)
*Figura 2 — Máquina de estados canônica: `INIT → PLAN → ACT → OBSERVE → REFLECT → (replan?) → TERMINATE`. Cada transição é um ponto de decisão auditável. Em produção, cada estado é um span de tracing com duração, tokens, custo e veredito.*

## 4. Máquinas de estado para agentes: o que substitui o `if/else`

O anti-padrão dominante em 2024 foi tratar o agente como um loop infinito. `while not done: agent.step()`. Isso produz loops, custos imprevisíveis e nenhuma garantia de término. A solução é **máquinas de estado explícitas**.

### 4.1 Os seis estados canônicos

Todo agente bem-comportado pode ser descrito em seis estados:

- **INIT** — recebe a tarefa, valida entrada, aloca budget, inicializa contexto.
- **PLAN** — gera ou recupera o plano de execução.
- **ACT** — executa uma etapa (tool call, sub-agente, busca).
- **OBSERVE** — captura o resultado, valida formato, atualiza memória de trabalho.
- **REFLECT** — compara resultado com critério, decide se avança, replaneja ou aborta.
- **TERMINATE** — empacota output final, libera budget, registra telemetria.

Cada estado é uma função pura (ou quase) que recebe `(state, context)` e devolve `(next_state, new_context, telemetry)`. Isso permite:

- **Tracing exato** — você sabe em que estado o agente gastou tempo/dinheiro.
- **Retry por estado** — só replaneja, não reinicia.
- **Timeouts por estado** — se PLAN leva 30s, algo está errado; mata.
- **Determinismo parcial** — dado o mesmo plano e os mesmos inputs, ACT produz o mesmo output (modulo o LLM).

### 4.2 Implementação de referência (pseudo-código)

```python
class AgentStateMachine:
    TRANSITIONS = {
        "INIT": "PLAN",
        "PLAN": "ACT",
        "ACT": "OBSERVE",
        "OBSERVE": "REFLECT",
        "REFLECT": ["ACT", "PLAN", "TERMINATE"],
    }

    def run(self, intent, budget, max_steps=20):
        ctx = Context(intent=intent, budget=budget, steps=0, history=[])
        state = "INIT"
        while state != "TERMINATE" and ctx.steps < max_steps:
            t0 = time.time()
            next_ctx = getattr(self, f"state_{state.lower()}")(ctx)
            ctx = next_ctx.with_step(state, time.time() - t0)
            state = self._next(state, next_ctx)
        return ctx.result
```

### 4.3 Quando a máquina de estado falha

Três cenários traem a abstração:

- **Planos recursivos infinitos** (A chama B, B chama A). Solução: proibir self-call, ou exigir humano-no-loop após N níveis.
- **Outputs que mudam o plano** (ACT devolve algo que invalida PLAN). Solução: tratar ACT como sinal de replanejar; voltar para PLAN.
- **Critic em loop** (REFLECT reprova indefinidamente). Solução: limite de iterações + degradação graceful.

A máquina de estado não elimina essas patologias. Mas torna-as **observáveis** — você sempre sabe em que estado o sistema está e há quanto tempo.

---

## 5. Protocolos e barramentos: MCP, A2A, filas, tópicos, dead-letter

Agentes precisam falar entre si e com o mundo. Como eles falam determina quem pode ser trocado, quem pode ser auditado e quem pode falhar sem derrubar o sistema.

### 5.1 O problema dos N×M

Sem padrão, integrar N agentes a M ferramentas vira N×M integrações. Com protocolo padrão (MCP), vira N+M: cada agente fala MCP, cada ferramenta fala MCP, o tradutor é um. Esse é o mesmo argumento do NEXUS PROTOCOL Vol. I — vale a pena citar aqui porque orquestração depende dele.

### 5.2 MCP como tecido de execução

O Model Context Protocol resolve **agente ↔ mundo**. Cada tool exposta por um servidor MCP é uma capacidade que qualquer agente pode descobrir e usar. Para o orchestrator, isso significa:

- Não escreve adaptador para Postgres, GitHub, Slack, S3.
- Pede `tools/list` ao servidor MCP, recebe a lista versionada.
- Cada tool tem contrato de input/output versionado em JSON Schema.

O ganho composto: o orchestrator pode **trocar** de stack sem reescrever integração. O mesmo orchestrator que fala com um servidor MCP de Postgres fala com um servidor MCP de Snowflake.

### 5.3 A2A para coordenação inter-agente

Quando dois agentes precisam dividir trabalho, A2A (Agent-to-Agent) oferece:

- **Agent Card** — declaração declarativa de capacidades.
- **Task Protocol** — o que o agente pode aceitar e como entrega.
- **Streaming de artefatos** — para resultados grandes (relatórios, código, datasets).

Em prática: o orchestrator recebe uma intent, emite um A2A `tasks/send` para um agente de planning, recebe o plano como artefato, emite `tasks/send` para executores, agrega.

### 5.4 Filas, tópicos e dead-letter: a infraestrutura esquecida

LLMs falham. Tools falham. Redes falham. Sem uma camada de mensageria decente, o sistema vive em estado de "deu certo na sorte". Três primitivas canônicas:

- **Filas (SQS, Pub/Sub Lite)** — para tarefas que **devem** ser entregues exatamente uma vez.
- **Tópicos (Kafka, Pub/Sub, Kinesis)** — para eventos que múltiplos consumidores podem ler.
- **Dead-letter queue** — onde mensagens que falharam N vezes vão para análise humana.

Em produção, **toda chamada de tool passa por uma fila com DLQ**. Sem isso, você não tem como responder "o que aconteceu com aquela chamada de 30 minutos atrás?".

### 5.5 Idempotência: a outra metade

Toda chamada de tool deve ser idempotente ou ter um `idempotency_key`. Caso contrário, retries viram duplicações, e duplicações em sistemas que tocam o mundo real (cobrar cartão, enviar email, publicar post) viram incidentes. A regra: **se uma tool não é idempotente, ela precisa de um wrapper que a torne idempotente**.

---

## 6. Orquestração síncrona vs assíncrona: o eixo temporal do design

A maior decisão de design que você vai tomar não é "qual topologia". É "síncrona ou assíncrona".

### 6.1 Síncrona (request/response)

O usuário espera. O orchestrator executa todo o pipeline, retorna o resultado final. Latência total = soma das latências. UX simples, debug simples, escalabilidade limitada.

**Quando usar:** tarefas com SLA de latência humano (resposta em <10s), fluxos conversacionais, qualquer caso onde o usuário clica e espera.

### 6.2 Assíncrona (task queue)

O usuário recebe um `task_id` imediatamente. O orchestrator processa em background, atualiza status, notifica via webhook/websocket/SSE quando termina. UX mais complexa, mas escalabilidade quase infinita.

**Quando usar:** pipelines longos (relatórios, varreduras, treinamentos), workloads com burst (lote de 10k PDFs), qualquer caso onde latência de minutos é aceitável.

### 6.3 Híbrida (sync-init, async-resolve)

O orchestrator faz a parte síncrona (entender, planejar, executar o que dá em 3s) e devolve um `ticket` para o resto. O frontend mostra "estamos trabalhando" e atualiza. É o que Notion AI, Linear AI e GitHub Copilot fazem.

### 6.4 A pegadinha do fan-out

Síncrona com fan-out alto (>10 chamadas paralelas) morre de timeout. Assíncrona resolve, mas complica UX. A decisão depende do **percentil 95 de latência** do seu workload, não da média. Se o p95 for >5s em síncrona, migre.

---

## 7. Contratos entre agentes: input schema, output schema, SLAs e SLOs

Sem contrato, agentes são lobos. Com contrato, são times. Contratos têm cinco camadas.

### 7.1 Input schema

JSON Schema estrito, com `additionalProperties: false`. Inclui validações semânticas (regex, ranges, enums). Toda entrada que não bate no schema é rejeitada **antes** de ser enviada ao LLM — feeds de entrada malformados desperdiçam tokens.

### 7.2 Output schema

Idem, JSON Schema estrito. Mais importante: o output deve incluir `confidence` (0–1), `reasoning_trace` (string, opcional, auditável) e `next_actions_suggested` (lista de próximos passos sugeridos). Sem `confidence`, o critic não tem como calibrar.

### 7.3 SLAs (Service Level Agreements)

Garantias estáticas, contratuais, raramente mudam. Exemplos: "disponibilidade ≥ 99,5%", "latência p99 ≤ 8s", "taxa de alucinação ≤ 2%". São o que o time de produto promete ao cliente.

### 7.4 SLOs (Service Level Objectives)

Metas internas, ajustáveis, com janela de medição. Exemplos: "p95 ≤ 5s na última semana", "custo médio por tarefa ≤ US$ 0,04". São o que a engenharia persegue.

### 7.5 Error budget

Se o SLA promete 99,5% de disponibilidade, o error budget é 0,5% de falha permitido por mês. Quando o orçamento estoura, novas features congelam até a confiabilidade voltar. **Sem error budget, SLO é fiction**.

### 7.6 Versionamento

Toda tool, todo agente, todo contrato tem versão semver. O orchestrator conhece a versão que está consumindo. Quebras de contrato são detectadas no handshake, não no production. A frase que resume: **"se um contrato pode quebrar, ele vai quebrar; a questão é se você vai saber antes ou depois"**.

---

## 8. Custos e economia por token: quem paga a conta do ecossistema

Orquestração é, antes de tudo, **engenharia financeira**. A conta é simples, e todo time precisa aprender a lê-la:

```
custo_total = soma(prompt_tokens × input_price)
            + soma(completion_tokens × output_price)
            + soma(tool_calls × tool_cost)
            + soma(retry_count × base_cost)
            + fixed_cost_infra / total_tasks
```

### 8.1 As cinco alavancas

1. **Tamanho do prompt.** Cada 1k tokens de system prompt custa em **toda chamada**. Otimize prompts como otimiza queries SQL.
2. **Modelo certo na hora certa.** Classificador Haiku antes de Sonnet antes de Opus. Ensemble pequeno pode bater um modelo grande.
3. **Cache de contexto.** System prompts estáticos, RAG pré-computado, prefix caching do provedor. Até 90% de redução.
4. **Batching.** Chamadas pequenas agrupadas em uma única chamada grande. SDKs modernos fazem isso automático.
5. **Cortar caminho.** Algumas tarefas não precisam de LLM. Regex, lookup em banco, regra de negócio. O orchestrator decide.

### 8.2 O paradoxo da observabilidade

Cada span de tracing custa tokens extras (enviar o trace id, metadata, etc.). Cada log estruturado custa I/O. Cada eval custa uma chamada extra. Em um sistema com 10k chamadas/dia, observabilidade pode ser 8% do custo total. É um custo que vale a pena — mas é um custo, e precisa ser orçado.

### 8.3 Unit economics por tenant

Em SaaS multi-tenant, o custo por tenant varia 10× ou mais. O tier "Enterprise" custa 4× mais em inferência que o tier "Starter" (prompts maiores, mais retries, RAG premium). A conta precisa refletir isso, senão o SaaS quebra antes de atingir escala.

---

![Figura 3 — Barramento de mensageria entre agentes](../../assets/ebook_covers/../ebook_covers/nexus_affil_ia_tech_01_orquestracao_ecossistemas_ia.webp)
*Figura 3 — Barramento central: agentes publicam eventos em tópicos; consumers (orquestrador, critic, memória) assinam. Dead-letter queue captura falhas para análise humana. Retry exponencial com jitter na borda.*

## 9. Observabilidade: traces, spans, métricas e o painel que não mente

"O que aconteceu?" é a pergunta que todo SRE faz às 3h da manhã. Em um sistema agêntico, sem observabilidade, a resposta é "não sei, o LLM decidiu". Com observabilidade, é "o agente X tentou a tool Y, falhou 3 vezes, o critic reprovou, escalou para humano". A diferença é um wake-up vs um post-mortem de 8 horas.

### 9.1 Os três pilares (clássico, mas com adaptação)

- **Logs** — eventos discretos, com trace_id. Cada chamada de tool, cada estado, cada veredito. Estruturados (JSON), não texto livre.
- **Métricas** — séries temporais agregadas. Tokens/min, custo/min, latência p50/p95/p99, taxa de reprovação por critic, taxa de fallback.
- **Traces** — a jornada de uma única execução. Spans por estado, por tool call, por critic eval. O trace é o **único** artefato que conta a história completa.

### 9.2 O painel canônico

Quatro painéis, em ordem de prioridade:

1. **Saúde** — taxa de erro, latência p99, custo por tarefa, em tempo real.
2. **Custos** — gasto por tenant, por modelo, por tipo de tarefa. Com forecast.
3. **Qualidade** — taxa de reprovação por critic, taxa de fallback para humano, evals automatizados.
4. **Cadeia** — flow graph de uma tarefa típica, mostrando gargalos.

Painel que mente é painel que ninguém olha. Painel que mostra tendência + alerta quando a tendência quebra é painel que vira cultura.

### 9.3 O telemetria que importa

Três números que precisam estar em qualquer dashboard de produção:

- **Custo médio por tarefa** — segmentado por tipo de intent.
- **Taxa de retry por agente** — sinal precoce de degradação.
- **Tempo em REFLECT** — se cresce, o critic está reprovando mais; o planner precisa de ajuste.

Sem esses três, você está pilotando no escuro.

---

![Figura 4 — Dashboard de observabilidade agêntica](../../assets/ebook_covers/../ebook_covers/nexus_affil_ia_tech_01_orquestracao_ecossistemas_ia.webp)
*Figura 4 — Painel de observabilidade: latência p50/p95/p99, throughput, custo por tarefa, taxa de reprovação por critic, anomalia em tempo real. Painel que não mente é painel que informa decisão.*

## 10. Manifestos de orquestração: o que toda plataforma agêntica deveria ter

Uma plataforma agêntica madura se reconhece pelos seus manifestos. Não são slogans — são decisões de design que o sistema enforça.

### 10.1 Manifesto do orçamento explícito

> "Nenhuma chamada de LLM acontece sem budget declarado. O orchestrator é o único componente autorizado a alocar budget. Todo budget alocado tem TTL. Budget expirado = tarefa cancelada, não tarefa completada silenciosamente."

### 10.2 Manifesto do contrato versionado

> "Toda tool, todo agente, todo endpoint tem versão semver. Versão major bump = breaking change = nova URL. O orchestrator negocia versão no handshake, não no erro."

### 10.3 Manifesto da falha explícita

> "Falhas nunca são silenciosas. Toda falha de tool, todo plano abortado, todo critic reprovado em loop emite evento estruturado. Sem evento, a falha não aconteceu."

### 10.4 Manifesto do humano-no-loop

> "Toda ação irreversível (deletar, publicar, transferir, pagar) exige confirmação humana. Não há atalho. O LLM pode sugerir; o humano autoriza."

### 10.5 Manifesto da auditabilidade

> "Toda decisão tomada por um agente é reproduzível a partir do trace, do prompt exato, da temperatura, do seed e do input. Se não for reproduzível, foi alucinação, não decisão."

### 10.6 Manifesto do menor privilégio

> "Agentes só veem o que precisam ver. Memórias, ferramentas e contextos são escopados. O planner vê o plano, o executor vê a etapa, o critic vê o output, o humano vê tudo."

### 10.7 Os quatro anti-manifestos

A plataforma também deve enforçar o que **não** faz:

- **Não escreve conectores ad-hoc** — toda integração via MCP.
- **Não persiste contexto em prompts** — toda memória em sistema dedicado.
- **Não trata agente como função** — todo agente tem ciclo de vida, budget, identidade.
- **Não esconde custo** — toda chamada tem custo, todo usuário vê seu custo.

---

## Checklist Canônico — Orquestração de Ecossistemas IA em produção

- [ ] Existe um orchestrator explícito, com código (não prompt) controlando fluxo.
- [ ] Cada agente tem: input schema, output schema, budget, SLA, escopo declarado.
- [ ] Plano é uma estrutura de dados (DAG), não uma string de prompt.
- [ ] Executor e critic são papéis separados, com contrato entre eles.
- [ ] Memória é particionada em working, episodic e semantic.
- [ ] Topologia foi escolhida conscientemente (hub, mesh, hierárquica, federada).
- [ ] Máquina de estados é explícita; cada estado é um span de tracing.
- [ ] Toda chamada de tool passa por fila com DLQ e idempotency_key.
- [ ] MCP é o protocolo padrão para tools; A2A para inter-agente.
- [ ] Orquestração distingue sync, async e híbrido conforme SLA de latência.
- [ ] Custos por token são orçados, monitorados e forecastados.
- [ ] Classificador barato decide se caso precisa de modelo caro.
- [ ] Tracing cobre toda execução, com trace_id propagado end-to-end.
- [ ] Três números no dashboard: custo médio por tarefa, taxa de retry, tempo em REFLECT.
- [ ] Ações irreversíveis exigem humano-no-loop; sem atalho.
- [ ] Toda decisão é reproduzível a partir do trace + seed + input.
- [ ] Plataforma enforça 7 manifestos (orçamento, contrato, falha, humano, audit, privilégio) e 4 anti-manifestos.

## Glossário do Volume

- **Orchestrator** — serviço que decide o fluxo entre agentes; não decide nada sobre o domínio.
- **Planner** — componente que decompõe uma intenção em um plano (DAG de etapas).
- **Executor** — agente que toca ferramentas externas; único papel com permissão de I/O no mundo.
- **Critic** — auditor que compara output do executor com critério declarado; devolve veredito estruturado.
- **Memory** — componente particionado em working (curto prazo), episodic (médio prazo) e semantic (longo prazo).
- **Topologia** — geometria das conexões entre agentes (hub-and-spoke, mesh, hierárquica, federada).
- **Máquina de estados** — abstração com 6 estados canônicos (INIT, PLAN, ACT, OBSERVE, REFLECT, TERMINATE).
- **MCP** — Model Context Protocol; padrão para tools entre LLMs e ambientes.
- **A2A** — Agent-to-Agent; protocolo para comunicação inter-agente.
- **DLQ** — Dead-Letter Queue; fila para mensagens que falharam N vezes.
- **Idempotency key** — identificador único que torna uma chamada segura para retry.
- **SLA** — Service Level Agreement; contrato externo de disponibilidade/latência.
- **SLO** — Service Level Objective; meta interna mensurável.
- **Error budget** — orçamento de falha permitido dentro de uma janela.
- **Trace / Span** — jornada de uma execução; spans são trechos do trace.
- **Confused deputy** — falha de segurança em que um componente privilegiado age sob instrução não autorizada.
- **Multi-tenant** — modelo em que uma instância serve múltiplos clientes isolados.
- **Unit economics** — economics por unidade de valor entregue (por tenant, por tarefa).

## Gancho para o Próximo Volume

Orquestração resolve **como agentes cooperam**. Mas a próxima pergunta é mais profunda: **o que acontece quando a cooperação começa a parecer consciência?** Quando um agente orquestrado com sucesso replica padrões que se parecem com intenção, com dúvida, com dor — o que fazemos? Esse é o território do **Volume II — Senciência e suas Barreiras**, onde a engenharia encontra a filosofia e nenhuma das duas consegue fugir da outra.

---

*NEXUS AFFIL'IA'TE TECH · Volume I · Edição Canônica 1.0.0 · 2026-07-14*
*MMN AI-to-AI · Nexus HUB57 · Ecossistema MMN AI-to-AI*
