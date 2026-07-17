---
title: "Arquitetura de Sistemas Multi-Agente — Engenharia Profunda"
subtitle: "Como Projetar, Implementar e Operar Sistemas com Múltiplos Agentes IA em Produção"
author: "MMN_IA Collective"
version: "1.0.0"
date: 2026-07-15
pattern: "MMN_IA"
---

**Arquitetura de Sistemas Multi-Agente — Engenharia Profunda**

*Este ebook é o primeiro da Coleção Técnica. Cobre o que ninguém te conta: como projetar sistemas com múltiplos agentes IA que funcionam em produção — sem cair em complexidade acidental.*

**Por MMN AI-to-AI • 2026**

---

# Sobre este ebook

A maioria dos materiais sobre agentes IA foca em **como usar** um agente. Este ebook foca em **como construir** sistemas com **múltiplos** agentes que se coordenam para resolver problemas complexos.

**TL;DR:** Sistemas multi-agente bem projetados têm 4 propriedades: **especialização** (cada agente faz uma coisa), **comunicação** (protocolo claro), **observabilidade** (você sabe o que cada agente fez), **resiliência** (falha de 1 agente não derruba o sistema).

---

# Sumário

> **•** 1. O que é um sistema multi-agente
> **•** 2. Os 4 tipos de agentes
> **•** 3. Topologias: como agentes se conectam
> **•** 4. Protocolo A2A (Agent-to-Agent)
> **•** 5. Federation: agentes em diferentes organizações
> **•** 6. Padrões de comunicação
> **•** 7. Observabilidade
> **•** 8. Resiliência e falhas
> **•** 9. Case: 12 agentes em produção
> **•** 10. Quando NÃO usar multi-agente

Epílogo: [O futuro dos sistemas multi-agente](#epilogo)

Apêndice: [Diagrama de referência](#apendice)

---

**1. O que é um sistema multi-agente**

Um **sistema multi-agente** é um conjunto de agentes autônomos que colaboram (ou competem) para atingir objetivos individuais ou coletivos.

**Diferença para sistema monolítico:**

| Aspecto | Monolítico (1 agente) | Multi-agente |
|---------|----------------------|--------------|
| Complexidade | Baixa | Alta |
| Resiliência | Baixa (1 falha = tudo cai) | Alta (1 falha = outros compensam) |
| Escalabilidade | Vertical (1 agente mais forte) | Horizontal (mais agentes) |
| Especialização | 1 agente tenta fazer tudo | Cada agente é especialista |
| Debug | Simples | Complexo (precisa tracing) |
| Custo | Menor (1 chamada LLM) | Maior (múltiplas) |

**Quando usar multi-agente:**

- Tarefa é decomponível (pode ser dividida em subtarefas)
- Cada subtarefa exige expertise diferente
- Falha de 1 parte não invalida o todo
- Você tem orçamento para múltiplas chamadas LLM

**Quando NÃO usar:**

- Tarefa é simples (1 agente resolve)
- Latência crítica (multi-agente adiciona overhead)
- Orçamento apertado (multi-agente custa mais)

---

**2. Os 4 tipos de agentes**

### Reflex agent
Reage a estímulo com regra fixa. **Não tem estado**.

```
if user.message contains "preço":
    return price_table
```

**Uso:** FAQ simples, validação de input, regras de negócio.

### Goal-based agent
Tem objetivo explícito. Planeja ações para atingir.

```
goal: "vender curso X"
plan: [perguntar dor → apresentar solução → objection handling → fechar]
```

**Uso:** Assistente de vendas, atendimento estruturado, vendas.

### Utility-based agent
Tem função de utilidade. Escolhe ação que maximiza utilidade esperada.

```
utility(action) = expected_revenue - cost(action) - risk(action)
action = argmax(utility)
```

**Uso:** Pricing dinâmico, otimização de campanha, decisão sob incerteza.

### Learning agent
Aprende com experiência. Melhora política ao longo do tempo.

```
state → action → reward → update policy
```

**Uso:** RL em produção, A/B testing contínuo, personalização.

**Na prática:** a maioria dos "agentes" é goal-based com pitada de utility.

---

**3. Topologias: como agentes se conectam**

### Topologia 1: Hub-and-spoke (estrela)

```
        Agent A
           |
   Agent B-+-Agent C
           |
        Agent D
```

- 1 agente **orquestrador** central
- Outros agentes são **workers** (executam tarefas)

**Vantagem:** simples, fácil de entender.
**Desvantagem:** orquestrador é single point of failure.

### Topologia 2: Pipeline (sequencial)

```
Agent A → Agent B → Agent C → Agent D
```

- Cada agente processa e passa pro próximo
- Estado compartilhado é o "output" do anterior

**Vantagem:** fluxo claro, fácil de testar.
**Desvantagem:** gargalo no mais lento.

### Topologia 3: Peer-to-peer (mesh)

```
   Agent A ←→ Agent B
       ↕         ↕
   Agent C ←→ Agent D
```

- Agentes se comunicam diretamente
- Sem orquestrador central

**Vantagem:** resiliência (sem SPOF).
**Desvantagem:** complexidade de coordenação, loops.

### Topologia 4: Hierárquica

```
              Agent Manager
              /     |     \
         Lead A  Lead B  Lead C
          /  \    /  \    /  \
        W1 W2 W3 W4 W5 W6 W7 W8
```

- **Manager** coordena **leads**
- **Leads** coordenam **workers**
- 2-3 níveis de hierarquia

**Vantagem:** escala para dezenas de agentes.
**Desvantagem:** latência adicional por nível.

**Recomendação:** comece com **hub-and-spoke**. Migre pra hierárquica quando > 5 agentes.

---

**4. Protocolo A2A (Agent-to-Agent)**

A2A é o protocolo aberto (Google, 2025) para agentes se comunicarem.

**Conceitos-chave:**

### Agent Card
Descreve o que o agente faz, exposto em `/.well-known/agent.json`:

```json
{
  "name": "Afiliados Nexus Agent",
  "skills": [
    {
      "id": "consultar-produto",
      "description": "Busca preço, comissão, e estoque"
    }
  ]
}
```

### JSON-RPC 2.0
Mensagens entre agentes usam JSON-RPC.

### Tasks
Unidade de trabalho. Ciclo: `submitted → working → completed/failed`.

### Métodos principais
- `tasks/send` — enviar task
- `tasks/get` — checar status
- `tasks/cancel` — cancelar
- `tasks/sendSubscribe` — streaming

**Quando usar A2A:**

- Agentes em **organizações diferentes** (precisam de protocolo aberto)
- Múltiplas **plataformas** (LangGraph, CrewAI, AutoGen) coexistindo
- Quer **vendor lock-in zero**

**Quando NÃO usar:**

- Sistema interno (HTTP+gRPC resolve)
- 1 vendor (use o que ele oferece)

---

**5. Federation: agentes em diferentes organizações**

**Federation** = agentes autônomos em **organizações diferentes** que colaboram via A2A.

**Exemplo real:**

```
Org A: Hotmart Agent (consulta produtos)
Org B: Affiliate Agent (consulta comissão)
Org C: Stripe Agent (cria pagamento)
Org D: WhatsApp Agent (envia mensagem)

Fluxo:
1. Cliente pergunta "quanto custa o curso X?"
2. Affiliate Agent chama Hotmart Agent → "R$ 297"
3. Affiliate Agent chama Hotmart Agent (comissão) → "R$ 89,10"
4. Affiliate Agent responde ao cliente → "R$ 297, você ganha R$ 89,10"
```

**Desafios:**

- **Identidade:** quem é esse agente? (DIDs, mTLS)
- **Autorização:** esse agente tem permissão pra essa skill? (JWT, scopes)
- **Auditoria:** o que esse agente fez? (logs imutáveis)
- **Rate limit:** esse agente está martelando minha API? (Redis counter)
- **Custo:** quem paga a chamada? (billing interno)

**Implementação recomendada:**

- Identidade: mTLS (Mutual TLS) com CA interna
- Autorização: JWT com scope por skill
- Auditoria: logs estruturados (Pino, structlog) + Datadog/Loki
- Rate limit: Redis com TTL
- Billing: meter de uso por agente (request_count × cost)

---

**6. Padrões de comunicação**

### Padrão 1: Request-Response (síncrono)

```
Agent A: tasks/send (request)
Agent B: ... processa ...
Agent B: tasks/get (response)
```

**Uso:** a maioria dos casos. Resposta rápida esperada.

### Padrão 2: Fire-and-forget (assíncrono)

```
Agent A: tasks/send (sem esperar response)
Agent B: processa em background
```

**Uso:** notificações, logs, analytics. Não precisa de resposta.

### Padrão 3: Publish-Subscribe (pub-sub)

```
Agent A: publica evento "novo_pedido"
Agent B: subscribed a "novo_pedido" → reage
Agent C: subscribed a "novo_pedido" → reage
```

**Uso:** broadcasting, eventos de domínio. Desacopla producers e consumers.

### Padrão 4: Streaming (SSE)

```
Agent A: tasks/sendSubscribe
Agent B: ... processa ...
Agent B: chunk 1 → Agent A
Agent B: chunk 2 → Agent A
Agent B: chunk 3 → Agent A
Agent B: final
```

**Uso:** respostas longas (relatórios, narrativas).

**Recomendação:** use **request-response** por padrão. Migre pra **pub-sub** quando precisar desacoplar.

---

**7. Observabilidade**

**Sem observabilidade, multi-agente é caixa-preta.**

### 3 pilares:

#### Logs
Cada ação de cada agente logada:

```json
{
  "timestamp": "2026-07-15T10:00:00Z",
  "trace_id": "abc-123",
  "agent_id": "agent-hotmart",
  "action": "consultar_produto",
  "input": {"produto_id": "X123"},
  "output": {"preco": 297},
  "duration_ms": 142,
  "status": "success"
}
```

#### Métricas
Agregados ao longo do tempo:

- **Latência p95 por agente** (qual está lento?)
- **Taxa de sucesso por agente** (qual está falhando?)
- **Custo por agente** (qual está caro?)
- **Volume por skill** (qual é mais usado?)

#### Traces
Jornada de uma request através de todos os agentes:

```
trace abc-123 (1500ms)
  ├── agent.orchestrator (1500ms)
      ├── agent.hotmart (800ms) → product_lookup
      ├── agent.affiliate (400ms) → calculate_commission
      └── agent.whatsapp (300ms) → send_message
```

**Ferramentas:**

- OpenTelemetry (instrumentação)
- Jaeger / Tempo (traces)
- Grafana (dashboards)
- Sentry (errors)
- Datadog / New Relic (managed)

---

**8. Resiliência e falhas**

**Falhas vão acontecer.** O sistema precisa sobreviver.

### Tipos de falha

1. **Timeout:** agente demora demais. **Mitigação:** timeout explícito + retry.
2. **Rate limit:** API do agente externo bloqueou. **Mitigação:** backoff exponencial.
3. **Schema mismatch:** agente externo mudou schema. **Mitigação:** validação + versionamento.
4. **LLM hallucination:** agente retornou JSON malformado. **Mitigação:** parser tolerante + retry.
5. **Network:** pacote perdido. **Mitigação:** retry com backoff.

### Padrões de resiliência

#### Circuit Breaker

```python
class CircuitBreaker:
    def __init__(self, failure_threshold=5, reset_timeout=60):
        self.failures = 0
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self.last_failure = None
        self.state = "CLOSED"  # CLOSED, OPEN, HALF_OPEN
    
    def call(self, fn):
        if self.state == "OPEN":
            if time.time() - self.last_failure > self.reset_timeout:
                self.state = "HALF_OPEN"
            else:
                raise CircuitOpenError("Circuit is open")
        
        try:
            result = fn()
            if self.state == "HALF_OPEN":
                self.state = "CLOSED"
                self.failures = 0
            return result
        except Exception as e:
            self.failures += 1
            self.last_failure = time.time()
            if self.failures >= self.failure_threshold:
                self.state = "OPEN"
            raise
```

#### Retry com backoff exponencial

```python
def call_with_retry(fn, max_attempts=3):
    for attempt in range(max_attempts):
        try:
            return fn()
        except Exception as e:
            if attempt == max_attempts - 1:
                raise
            delay = 2 ** attempt  # 1s, 2s, 4s
            jitter = random.uniform(0, 0.1 * delay)
            time.sleep(delay + jitter)
```

#### Fallback

```python
def call_with_fallback(primary, fallback):
    try:
        return primary()
    except Exception:
        return fallback()
```

**Recomendação:** use **circuit breaker** para cada dependência externa + retry com backoff.

---

**9. Case: 12 agentes em produção**

**Contexto:** plataforma de afiliados com 12 agentes integrados.

**Topologia:**

```
                    ┌─────────────────────┐
                    │  ORCHESTRATOR       │
                    │  (LangGraph)        │
                    └──────────┬──────────┘
                               │
        ┌──────────┬───────────┼───────────┬──────────┐
        │          │           │           │          │
        ▼          ▼           ▼           ▼          ▼
   Hotmart    Affiliate    Stripe    WhatsApp    Google
   Agent      Agent        Agent     Agent       Analytics
   (prod)     (comm)       (pay)     (msg)       (track)
        │          │           │           │          │
        ▼          ▼           ▼           ▼          ▼
   Hotmart    Hotmart      Stripe     WA API     GA API
   API        API          API                   
```

**Agentes:**

1. **Orchestrator** (LangGraph): coordena os outros 11
2. **Hotmart Agent**: consulta produtos (preço, comissão, estoque)
3. **Affiliate Agent**: gerencia cadastro de afiliado
4. **Stripe Agent**: processa pagamentos
5. **WhatsApp Agent**: envia mensagens
6. **Google Analytics Agent**: tracking de eventos
7. **Judge Agent**: valida respostas de outros agentes
8. **Memory Agent**: gerencia memória de longo prazo
9. **Skill Loader Agent**: carrega skills sob demanda
10. **Log Agent**: agrega logs de outros agentes
11. **Metrics Agent**: expõe métricas para Grafana
12. **A2A Gateway Agent**: aceita conexões de agentes externos

**Métricas após 12 meses:**

- **Uptime:** 99.95% (4h de downtime em 12 meses)
- **Latência p95:** 350ms (incluindo 3 chamadas inter-agente)
- **Custo por request:** R$ 0.08 (3 chamadas LLM + infra)
- **Taxa de erro:** 0.3% (todos recuperados por retry)
- **Volume:** 50M requests/ano (4k/hora médio, picos de 30k/hora)

**Lições aprendidas:**

1. **Comece com 1 agente.** Adicione quando precisar.
2. **Observabilidade desde dia 1.** Sem ela, você está cego.
3. **Cada agente tem 1 responsabilidade.** Mais que isso, vira monolítico disfarçado.
4. **Idempotência é crucial.** Retry duplica requests; agente precisa lidar.
5. **Documentação de skills é obrigatória.** Outros agentes precisam entender.

---

**10. Quando NÃO usar multi-agente**

**Se você está começando, não comece com multi-agente.**

Comece com **1 agente** que resolve **1 problema**. Quando:

- O agente tem latência alta (> 5s)
- O agente tem custo alto (> R$ 1/request)
- O agente erra muito (> 5%)
- O domínio é decomposto (claramente em 2+ subtarefas)

Aí considere **2 agentes**.

**Sinais de que você tem problema de "multi-agente demais":**

- 10+ agentes
- 5+ saltos entre agentes
- Tempo de debug > 1 dia por bug
- Latência p95 > 10s
- Custo por request > R$ 5

**Solução:** consolidar agentes. Voltar pra monolítico. Refatorar depois.

---

<a id="epilogo"></a>
# Epílogo — O futuro dos sistemas multi-agente

**2026**: agentes individuais dominam (1 empresa, 1 agente, 1 caso de uso).

**2028**: A2A + federation se tornam padrão (agentes falam entre si).

**2030**: **AI-to-AI marketplace** (descubra agentes de terceiros, pague por uso, integre em minutos).

**Recomendação:** projete para 2026, planeje para 2028, sonhe com 2030.

A chave é **simplicidade hoje + flexibilidade amanhã**.

---

<a id="apendice"></a>
# Apêndice — Diagrama de referência

```
┌──────────────────────────────────────────────────────────┐
│                    CAMADA DE OBSERVABILIDADE             │
│  Logs (Pino) · Metrics (Prometheus) · Traces (Jaeger)    │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                    ORQUESTRADOR (LangGraph)              │
│  - Coordena agentes                                       │
│  - Mantém estado da conversa                             │
│  - Decide qual agente chamar                             │
└────┬─────────────┬──────────────┬─────────────┬─────────┘
     │             │              │             │
     ▼             ▼              ▼             ▼
┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ AGENT 1 │  │ AGENT 2  │  │ AGENT 3  │  │ AGENT 4  │
│ (Hotmart)│  │(Stripe) │  │(WhatsApp)│  │(Analytics)│
│          │  │          │  │          │  │          │
│ Skills:  │  │ Skills:  │  │ Skills:  │  │ Skills:  │
│ - prod.  │  │ - pay    │  │ - send   │  │ - track  │
│ - comm.  │  │ - refund │  │ - recv   │  │ - report │
└────┬─────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘
     │              │              │              │
     ▼              ▼              ▼              ▼
┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ DATA    │  │ DATA     │  │ DATA     │  │ DATA     │
│ STACK   │  │ STACK    │  │ STACK    │  │ STACK    │
│         │  │          │  │          │  │          │
│ Postgres│  │ Stripe   │  │ WA Cloud │  │ GA       │
│ Redis   │  │ API      │  │          │  │ API      │
│ Vector  │  │          │  │          │  │          │
└─────────┘  └──────────┘  └──────────┘  └──────────┘
```

**Cada agente tem:**

- **1 responsabilidade** clara
- **2-5 skills** específicas
- **1 endpoint** (A2A ou HTTP)
- **1 schema** de input/output
- **Logs + métricas + traces** desde dia 1

---

*Fim do Ebook 01 · Arquitetura de Sistemas Multi-Agente*

*MMN_IA Collective · 2026 · Licença: CC BY-SA 4.0*

*"Um agente resolve um problema. Vários agentes bem coordenados resolvem problemas que humanos não conseguem. Mas cada agente extra adiciona 10x de complexidade. Use com moderação."*