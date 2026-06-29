---
title: "02 · Federação de Agentes"
level: elite
duration: 75min
prerequisites: ["elite/01-multi-tenant-whitelabel"]
tags: [federacao, mtls, ed25519, pii-gating, trust-scoring, lgpd, gdpr]
last_updated: 2026-06-02
---

# 🌐 02 · Federação de Agentes

> **Tempo:** 75 min · **Nível:** Elite · **Pré-requisitos:** 01 - Multi-tenant

## O que é federação

**Federação** = agentes em máquinas diferentes (ou regiões diferentes) que se autenticam mutuamente, trocam tarefas e constroem confiança ao longo do tempo.

No Nexus, a federação herda o design do **Ruflo Agent Federation** (referência: docs da Ruflo/Claude-Flow):

```
Seu Agente --> [ Remove PII ] --> [ Assina mensagem ] --> [ Canal criptografado ]
                   │                    │                       │
                   ▼                    ▼                       ▼
              LGPD-safe         ed25519 / mTLS         WebSocket / WSS
                   │
                   ▼
Outro Agente <-- [ Bloqueia injection ] <-- [ Verifica identidade ]
                   │                            │
                   ▼                            ▼
              AIDefence                    Trust scoring
```

## Os 5 pilares da federação Nexus

| Pilar | Implementação |
|---|---|
| **Identidade** | mTLS + ed25519 challenge-response |
| **PII-gating** | 14 tipos de detecção (BLOCK, REDACT, HASH, PASS) |
| **Trust scoring** | 0.4×success + 0.2×uptime + 0.2×threat + 0.2×integrity |
| **Compliance** | HIPAA, SOC2, GDPR, LGPD — trilhas imutáveis |
| **Mesh opcional** | WireGuard entre nós confiáveis |

## Como iniciar uma federação

### Passo 1 — Inicializar

```bash
npx nexus federation init

# Gera ~/.nexus/federation/{keypair.pem, node-id, audit.log}
```

### Passo 2 — Conectar a outro nó

```bash
npx nexus federation join wss://partner.example.com:8443

# mTLS handshake → trust level: "untrusted" (início)
```

### Passo 3 — Enviar primeira tarefa

```bash
npx nexus federation send \
  --to partner \
  --type task-request \
  --message "Analyze este dataset de vendas — retorna coortes mensais"
```

## Trust levels (5 estágios)

```
  untrusted  ──►  low  ──►  standard  ──►  high  ──►  elite
       │              │           │            │           │
       │              │           │            │           └─► full access + audit
       │              │           │            └─► read memory + write tasks
       │              │           └─► execute tasks
       │              └─► read public discovery
       └─► só vê que você existe
```

> **Upgrade** requer histórico (mínimo 30 dias, success rate > 90%).
> **Downgrade** é instantâneo em caso de mau comportamento.

## PII-gating em ação

Quando você envia uma tarefa federada, antes de sair do seu nó:

```typescript
// Pseudocódigo federation-gate
const piiTypes = ["email", "phone", "cpf", "cnpj", "ssn", "address", "credit_card", ...];

for (const chunk of message.chunks) {
  for (const type of piiTypes) {
    const detected = detect(chunk, type);
    if (detected) {
      switch (policy[type]) {
        case "BLOCK": throw new PIIBlockedError(type);
        case "REDACT": chunk = redact(chunk, type);
        case "HASH": chunk = hash(chunk, type);
        case "PASS": /* noop */;
      }
    }
  }
}
```

**Configuração por trust level:**

| Trust | Política padrão |
|---|---|
| untrusted | BLOCK em todos os PIIs |
| low | REDACT para email/phone |
| standard | HASH para identificadores |
| high+ | PASS (com auditoria) |

## Auditoria

Toda mensagem federada gera um registro imutável:

```json
{
  "ts": "2026-06-02T08:22:07Z",
  "from_node": "node-abc",
  "to_node": "node-xyz",
  "trust_at_send": "standard",
  "pii_actions": ["REDACT:email", "HASH:phone"],
  "msg_hash": "sha256:...",
  "compliance_mode": "LGPD"
}
```

> A trilha é buscável via **HNSW** (RAG semântico).

## 🎯 Exercício

1. Levante **2 nós Nexus locais** (containers Docker)
2. `federation init` em cada um
3. Conecte um ao outro
4. Envie uma tarefa simples: "qual a data atual?"
5. Observe: PII-gating, trust score, audit log
6. Documente em `Lab-Nexus/workflows/federation/`

## 🎓 Você completou a trilha Elite!

Volte para a home da Academ'IA ou explore o Lab Nexus e a Lib Nexus para se aprofundar.

---

**Versão 1.0** · Atualizado 2026-06-02 · Fonte: `Lib-Nexus/agents-specs/federation.md` + Ruflo federation design
