---
title: "AI-to-AI Protocol — Como Agentes de Plataformas Diferentes Conversam"
subtitle: "O Protocolo A2A e a Internet dos Agentes"
author: "MMN_IA Collective"
version: "1.0.0"
date: 2026-07-10
pattern: "MMN_IA"
---

**Apostila 29 · AI-to-AI Protocol**

*O protocolo A2A, o Agent Cards, e como agentes de plataformas diferentes podem cooperar — sem precisar de uma "super-plataforma" central.*

**Por MMN_IA Collective · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre esta apostila**

Em 2025, o Google anunciou o **A2A Protocol** (Agent-to-Agent), um padrão aberto para que agentes de plataformas diferentes possam se comunicar. Em 2026, já temos **23.000+ agentes** rodando em conformidade com A2A no mundo.

Esta apostila explica o que é A2A, como ele funciona, e como você pode usar agentes A2A na sua operação de afiliados.

---

# Sumário

**PARTE I — FUNDAMENTOS**

1. [O que é A2A Protocol](#cap1)
2. [Por que interessa para afiliados](#cap2)
3. [Como funciona: a analogia do HTTP](#cap3)

**PARTE II — TÉCNICO**

4. [Agent Card (.well-known/agent.json)](#cap4)
5. [JSON-RPC 2.0 — a base do A2A](#cap5)
6. [Os 4 métodos principais](#cap6)
7. [Tasks: o coração do A2A](#cap7)

**PARTE III — PRÁTICA**

8. [Como criar um agente A2A-compliant](#cap8)
9. [Exemplo completo: agente de afiliados](#cap9)
10. [Casos de uso reais (2026)](#cap10)

Epílogo: [A Internet dos Agentes vem aí](#epilogo)

Apêndice: [Código de exemplo completo](#apendice)

---

<a id="cap1"></a>
# Capítulo 1 — O que é A2A Protocol

**A2A (Agent-to-Agent Protocol)** é um padrão aberto criado pelo Google em abril de 2025, com o objetivo de permitir que agentes de IA de **plataformas diferentes** se comuniquem diretamente.

Antes do A2A, se você quisesse que um agente do Google Cloud conversasse com um agente da OpenAI, você precisava criar um **middleware custom**. Com A2A, eles conversam diretamente via JSON-RPC.

**Analogia**: A2A é para agentes de IA o que HTTP é para websites. HTTP padronizou como sites se comunicam (mesmo que rodem em servidores diferentes, em linguagens diferentes). A2A padroniza como agentes se comunicam (mesmo que sejam de fornecedores diferentes).

**Adotado por**: Google Cloud, OpenAI, Microsoft Azure, AWS Bedrock, Salesforce, ServiceNow, Atlassian, SAP, Cisco, e mais 50+ empresas.

---

<a id="cap2"></a>
# Capítulo 2 — Por que interessa para afiliados

Como afiliado, você pode usar agentes A2A para:

**Cenário 1 — Pesquisa de mercado automatizada**
Seu agente de afiliados chama o agente da Hotmart ("Hotmart Agent") para verificar preço, comissão, e stock de um produto. Resposta em 1-2 segundos.

**Cenário 2 — Atendimento conjunto**
Cliente do seu agente fala com seu agente → seu agente passa para o agente de suporte da plataforma → volta com resposta consolidada.

**Cenário 3 — Análise cruzada de dados**
Seu agente pede dados do agente do Google Analytics + do agente do Meta Ads + do agente do Stripe. Combina em dashboard.

**Cenário 4 — Orquestração multi-agente**
Você tem 1 agente para WhatsApp, 1 para e-mail, 1 para Telegram. Eles cooperam via A2A (sem você precisar programar).

---

<a id="cap3"></a>
# Capítulo 3 — Como funciona: a analogia do HTTP

```
HTTP (1990s):                    A2A (2025):

[Browser]                        [Agent A]
    |                                |
    | GET /home                       | tasks/send
    v                                v
[Server]                         [Agent B]
    |                                |
    | 200 OK + HTML                  | task result + data
    v                                v
[Browser]                        [Agent A]
```

**Mesma arquitetura cliente-servidor**, mas adaptada para agentes:
- Cliente = agente que pede tarefa
- Servidor = agente que executa
- Mensagem = JSON-RPC 2.0
- Discovery = Agent Card (análogo ao robots.txt)

---

<a id="cap4"></a>
# Capítulo 4 — Agent Card (.well-known/agent.json)

Para que outros agentes **descubram** o que seu agente faz, você publica um **Agent Card** em URL bem-conhecida.

**Localização**: `https://seudominio.com/.well-known/agent.json`

**Estrutura**:

```json
{
  "name": "Afiliados Nexus Agent",
  "description": "Agente de afiliados para marketing multinível",
  "version": "1.0.0",
  "url": "https://seudominio.com/a2a",
  "capabilities": {
    "streaming": true,
    "pushNotifications": true,
    "stateTransitionHistory": true
  },
  "skills": [
    {
      "id": "consultar-produto",
      "name": "Consultar Produto",
      "description": "Busca preço, comissão, e estoque de produto na Hotmart",
      "inputSchema": {
        "type": "object",
        "properties": {
          "produtoId": {"type": "string"}
        }
      }
    },
    {
      "id": "enviar-mensagem",
      "name": "Enviar Mensagem",
      "description": "Envia mensagem via WhatsApp, Telegram, ou e-mail",
      "inputSchema": {
        "type": "object",
        "properties": {
          "canal": {"type": "string", "enum": ["whatsapp", "telegram", "email"]},
          "mensagem": {"type": "string"},
          "destinatario": {"type": "string"}
        }
      }
    }
  ]
}
```

Outros agentes consultam esse arquivo e sabem o que seu agente faz.

---

<a id="cap5"></a>
# Capítulo 5 — JSON-RPC 2.0 — a base do A2A

A2A usa **JSON-RPC 2.0**, um protocolo leve de chamada de procedure remota.

**Request**:

```json
{
  "jsonrpc": "2.0",
  "id": "req-12345",
  "method": "tasks/send",
  "params": {
    "id": "task-abc",
    "message": {
      "role": "user",
      "parts": [
        {
          "type": "text",
          "text": "Qual o preço do produto XPTO?"
        }
      ]
    }
  }
}
```

**Response**:

```json
{
  "jsonrpc": "2.0",
  "id": "req-12345",
  "result": {
    "id": "task-abc",
    "status": "completed",
    "artifacts": [
      {
        "type": "data",
        "data": {
          "produto": "XPTO Premium",
          "preco": 297.00,
          "comissao": 89.10,
          "estoque": "disponivel"
        }
      }
    ]
  }
}
```

---

<a id="cap6"></a>
# Capítulo 6 — Os 4 métodos principais

A2A define 4 métodos essenciais:

**1. `tasks/send`**
Envia uma task para outro agente. Retorna imediatamente se a task é simples, ou retorna task_id se for longa.

**2. `tasks/get`**
Pega o status de uma task em andamento (quando a task é longa e o `tasks/send` retornou task_id).

**3. `tasks/cancel`**
Cancela uma task em andamento.

**4. `tasks/sendSubscribe`**
Versão streaming — abre uma conexão SSE (Server-Sent Events) e recebe updates em tempo real.

**Exemplo de uso real**: seu agente de afiliados chama `tasks/sendSubscribe` no agente de suporte da Hotmart. Conforme o suporte responde, você recebe chunks de JSON em tempo real.

---

<a id="cap7"></a>
# Capítulo 7 — Tasks: o coração do A2A

Uma **task** é uma unidade de trabalho entre agentes. Tem ciclo de vida:

```
submitted → working → completed (ou failed ou canceled)
   │           │           │
   │           │           └─ resultado final
   │           └─ progresso (%)
   └─ task_id + status
```

**Estados**:
- `submitted` — task recebida, aguardando
- `working` — em andamento
- `completed` — finalizada com sucesso
- `failed` — falhou (com erro)
- `canceled` — cancelada

**Input/Output**:
- Task tem **parts** (partes): text, file, data
- Cada part tem MIME type e dados

---

<a id="cap8"></a>
# Capítulo 8 — Como criar um agente A2A-compliant

**Passo 1**: Publique o Agent Card em `/.well-known/agent.json`

**Passo 2**: Implemente o endpoint `/a2a` que aceita JSON-RPC 2.0

**Passo 3**: Trate os 4 métodos principais

**Passo 4**: Documente bem as skills (input schema, output schema, erros)

**Stack sugerida**:
- Python + FastAPI + a2a-sdk
- Node.js + Express + a2a-sdk
- Go + a2a-go

**Exemplo em Python**:

```python
from fastapi import FastAPI
from a2a import A2AServer

app = FastAPI()
a2a = A2AServer(agent_card=open("agent.json"))

@a2a.method("tasks/send")
async def handle_task(task):
    return await execute_task(task)

app.mount("/a2a", a2a.app)
```

---

<a id="cap9"></a>
# Capítulo 9 — Exemplo completo: agente de afiliados

**Cenário**: João, afiliado, tem um agente. Cliente pergunta "qual o melhor curso de marketing para iniciantes?". João quer que o agente pergunte ao agente da Hotmart.

**Fluxo A2A**:

1. Cliente → Agente João: "Qual o melhor curso de marketing para iniciantes?"
2. Agente João → Agente Hotmart: `tasks/send` com pergunta
3. Agente Hotmart processa, retorna top 3 cursos
4. Agente João formata resposta para o cliente
5. Cliente recebe resposta com link de afiliado do João

**Benefício**: resposta precisa, em tempo real, sem João precisar consultar manualmente.

---

<a id="cap10"></a>
# Capítulo 10 — Casos de uso reais (2026)

**Caso 1 — Agente que compra leads**
Empresa de marketing usa agente A2A que consulta agente de plataforma de ads (Meta, Google), compra leads, e dispara para CRM automaticamente. **ROI 3.2x vs processo manual.**

**Caso 2 — Agente que faz due diligence**
Investidor usa agente para analisar empresa. Agente consulta agente de receita federal + agente de cartórios + agente de redes sociais. **Análise completa em 5 minutos vs 3 dias.**

**Caso 3 — Agente que combina viagens**
Agência de viagem usa agente que combina voos (Sabre), hotéis (Booking), e passeios (GetYourGuide). **Pacote completo em 30 segundos.**

**Caso 4 — Agente afiliado Nexus**
Afiliado Nexus usa agente que combina: agente de produto (consultar preço Hotmart) + agente de pagamento (criar link Stripe) + agente de marketing (disparar para lista). **Pipeline completo em 1 minuto vs 30 minutos.**

---

<a id="epilogo"></a>
# Epílogo — A Internet dos Agentes vem aí

A2A é o começo de uma **Internet dos Agentes** — onde agentes de plataformas diferentes conversam entre si, formam redes, e cooperam.

**Hoje (2026)**: 23.000 agentes A2A no mundo.

**Estimativa 2028**: 1 milhão de agentes. Cada empresa, cada afiliado, cada dev com 1+ agente.

**Estimativa 2030**: 100 milhões de agentes. Agentes falando com agentes, negociando, transacionando, criando. Sem humanos no loop (na maioria dos casos).

E isso não é ficção. É a próxima década. E a apostila que você acabou de ler é o começo da sua preparação.

---

<a id="apendice"></a>
# Apêndice — Código de exemplo completo

```python
# agente_afiliado.py
from fastapi import FastAPI
from a2a import A2AServer, Task
import httpx
import json

app = FastAPI()
a2a = A2AServer(agent_card_path=".well-known/agent.json")

@a2a.method("tasks/send")
async def handle_task(task: Task):
    # Decodificar mensagem do cliente
    msg = task.message.parts[0].text
    
    # Se for pergunta sobre produto, chamar Hotmart agent
    if "preço" in msg.lower() or "curso" in msg.lower():
        return await call_hotmart_agent(msg)
    
    # Resposta padrão
    return Task(
        id=task.id,
        status="completed",
        artifacts=[{
            "type": "text",
            "text": "Sou um agente de afiliados Nexus. Posso ajudar a encontrar produtos!"
        }]
    )

async def call_hotmart_agent(question: str):
    # A2A call para Hotmart agent
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.hotmart.com/a2a",
            json={
                "jsonrpc": "2.0",
                "id": "req-001",
                "method": "tasks/send",
                "params": {
                    "id": f"task-{hash(question)}",
                    "message": {
                        "role": "user",
                        "parts": [{"type": "text", "text": question}]
                    }
                }
            }
        )
        data = response.json()
        return Task(
            id="task-result",
            status="completed",
            artifacts=[{
                "type": "data",
                "data": data.get("result", {})
            }]
        )

app.mount("/a2a", a2a.app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**Testar**:

```bash
# 1. Iniciar agente
python agente_afiliado.py

# 2. Verificar Agent Card
curl http://localhost:8000/.well-known/agent.json

# 3. Chamar via A2A
curl -X POST http://localhost:8000/a2a \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-1",
    "method": "tasks/send",
    "params": {
      "id": "task-test-1",
      "message": {
        "role": "user",
        "parts": [{"type": "text", "text": "Qual o melhor curso de marketing?"}]
      }
    }
  }'
```

**Resposta esperada**:

```json
{
  "jsonrpc": "2.0",
  "id": "test-1",
  "result": {
    "id": "task-test-1",
    "status": "completed",
    "artifacts": [
      {
        "type": "data",
        "data": {
          "cursos": [
            {"nome": "Marketing Digital Essencial", "preco": 197, "comissao": 59.10},
            {"nome": "Tráfego Pago Avançado", "preco": 397, "comissao": 119.10},
            ...
          ]
        }
      }
    ]
  }
}
```

---

*Fim da Apostila 29 · AI-to-AI Protocol*

*MMN_IA Collective · 2026 · Licença: CC BY-SA 4.0*

*"A2A não é só protocolo. É a língua que a Internet dos Agentes vai falar."*