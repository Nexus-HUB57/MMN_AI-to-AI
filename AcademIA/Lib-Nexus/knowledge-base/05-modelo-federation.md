---
title: "Modelo Federation · Multi-Nó Interconectado"
description: "Modelo canônico de federation de nós Nexus, A2A protocol, PII-gating e contratos"
tags: [lib-nexus, knowledge-base, federation, multi-tenant, a2a, modelo, canonico]
category: knowledge-base
version: "1.0"
last_review: "2026-06-28"
status: canonico
---

# 🌐 Modelo Federation · Multi-Nó Interconectado

> **Source of truth** sobre **federation**: como múltiplas instâncias da Nexus se comunicam, coordenam, e colaboram — com compliance, latência, e soberania de dados preservados. Este documento define os 4 níveis de federation, o A2A protocol, e os contratos entre nós.

---

## 🎯 Definição Canônica

**Federation** é a capacidade de múltiplas **instâncias Nexus** (chamadas **nós**) operarem como uma **rede distribuída** onde cada nó mantém autonomia local, mas delega tarefas, compartilha skills, e troca contexto com outros sob **contratos formais**.

**Diferença crucial:**

- **Multi-agente local**: múltiplos agentes num único orquestrador.
- **Federation**: múltiplos nós (instâncias), cada um com seus agentes.

```
Multi-agente:                       Federation:
┌─────────────────────┐             ┌────────┐    ┌────────┐    ┌────────┐
│   Orquestrador      │             │ Nó BR  │ ←→ │ Nó EU  │ ←→ │ Nó AS  │
│   ├── Researcher    │             │ Agentes│    │ Agentes│    │ Agentes│
│   ├── Writer        │             │  ↑     │    │  ↑     │    │  ↑     │
│   └── Reviewer      │             │ Gateway│ ←→ │ Gateway│ ←→ │ Gateway│
└─────────────────────┘             └────────┘    └────────┘    └────────┘
```

**Por que federation importa:**

1. **Compliance multi-jurisdicional**: dados ficam em casa, lógica viaja.
2. **Latência local**: edge nodes atendem com p99 < 200ms por região.
3. **Resiliência sistêmica**: outage regional ≠ outage global.
4. **Soberania**: cada tenant controla onde seus dados residem.

---

## 🏛️ 4 Níveis de Federation

### Nível 1 — Skill Sharing (simples)

- Nós compartilham **catálogo de skills**.
- Cada nó roda suas próprias skills **localmente**.
- Sem comunicação inter-agente.
- **Quando usar:** marketplace unificado, sem dependência operacional.

### Nível 2 — Agent Marketplace (intermediário)

- Nós publicam **agentes inteiros**.
- Outros nós podem **invocar** agentes remotos.
- Sem compartilhamento de dados por default.
- **Quando usar:** acesso a capacidades específicas (ex: modelo hospedado em uma região).

### Nível 3 — Task Delegation (avançado) ← **Nexus opera aqui em 2026**

- Nó A **delega parte de tarefa** a nó B.
- Nó B executa e **retorna resultado**.
- Compartilhamento de dados sob **contrato explícito**.
- **Quando usar:** análise cross-region com PII-gating.

### Nível 4 — Shared Context (total) ← **Nexus planeja para 2027**

- Nós **compartilham estado de execução**.
- Memória distribuída via **CRDT**.
- Federação quase-simetrica.
- **Quando usar:** colaboração profunda com coherência de contexto.

---

## 🏛️ Arquitetura: Federation Gateway

O coração técnico da federation é o **Federation Gateway** — componente de cada nó Nexus que:

```
┌──────────────────────────────────────────┐
│ Federation Gateway (Rust)                │
├──────────────────────────────────────────┤
│ ├── Registry (lista de nós, capabilities)│
│ ├── Router (decide qual nó para cada req)│
│ ├── Translator (formato, schema, locale) │
│ ├── Trust manager (auth, certs, mTLS)    │
│ ├── Audit logger (cross-node logs)       │
│ ├── Cost tracker (custo por delegação)   │
│ └── Circuit breaker (proteção de cascade)│
└──────────────────────────────────────────┘
```

**Características-chave:**

- **Stateless** (estado em Redis distribuído).
- **Idempotência** total (replay-safe).
- **Assíncrono** por default.
- **Versionado** por contrato (`/v1/`, `/v2/`).

---

## 🤝 Protocolo A2A (Agent-to-Agent)

O **A2A protocol** define a mensagem entre nós:

```yaml
message_id: uuid
timestamp: iso-8601
sender_node: nexus://br.sao/instance-42
receiver_node: nexus://eu.frankfurt/instance-7
performative: REQUEST | INFORM | QUERY | PROPOSE | ACCEPT | REJECT
content:
  action: "analyze_cohort"
  args:
    cohort_id: "abc-123"
    preserve_pii: true
  constraints:
    max_latency_ms: 5000
    data_residency: EU
    min_confidence: 0.8
context_ref: "conv_xyz"
signature: ed25519
trace_id: uuid
```

**Garantias:**

- **Assinatura digital**: cada mensagem é assinada (Ed25519).
- **Replay-safe**: id de mensagem previne duplicações.
- **Tracing distribuído**: cada hop tem trace_id correlato.
- **Contract-driven**: cada nó declara o que aceita.

---

## 🔐 PII-Gating e Soberania de Dados

**Regra de ouro:** **dados PII nunca atravessam fronteira sem consentimento explícito.**

### Padrão de Implementação

```python
def federated_analyze(cohort_id: str, target_node: Node) -> Result:
    data = load_cohort(cohort_id)              # local
    safe_data = strip_pii(data)                # local — anonimiza
    result = target_node.analyze(safe_data)    # remote — só não-PII
    enriched_result = attach_local_context(result, data)  # local — re-agrega
    return enriched_result
```

**Três camadas de proteção:**

1. **Anonimização local** antes do hop.
2. **PII scanner** no Gateway (defesa em profundidade).
3. **Audit trail** de cada PII que cruza fronteira (com consent).

### Casos de Transferência Internacional

**Quando é permitido:**

- Dados **anonimizados** (k-anonimity ≥ 5).
- Dados **agregados** (médias, coortes, sem indivíduos).
- **Consentimento explícito** do titular.
- **Cláusula contratual** (controller-to-controller).

**Quando NÃO é permitido:**

- PII sem consentimento.
- Dados sensíveis (saúde, biométricos) sem base legal explícita.
- Transferência para país sem adequacy decision (sem safeguards).

---

## 📊 Latência, Custo e Resiliência

### Latência

| Hop | Latência típica |
|-----|-----------------|
| Local (intra-nó) | 50-200ms |
| Federation (inter-nó) | +200-500ms |
| Com cache hit | <100ms |

### Custo

- **Cada hop federation**: $0.001-0.01.
- **Tracking granular** por tenant.
- **Budget alert** se > 2x forecast.

### Resiliência

- **Fallback chain**: se nó UE indisponível, fallback para BR.
- **Circuit breaker**: se 5 erros em 60s, abre circuito.
- **Graceful degradation**: latency sobe, mas funciona.
- **SHO monitora federation health** com 4 sensores específicos.

---

## 🗺️ Mapa de Federação Ativa

Em junho de 2026, Nexus opera federation em **5 regiões**:

| Região | Latency hub | Data residency |
|--------|-------------|----------------|
| **BR-São Paulo** | 8ms | BR (LGPD) |
| **EU-Frankfurt** | 12ms | EU (GDPR) |
| **US-East** | 15ms | US (CCPA) |
| **Asia-Singapore** | 18ms | SG (PDPA) |
| **Asia-Tokyo** | 22ms | JP (APPI) |

**Roadmap Q3 2026:** +3 regiões (Dubai, Sydney, Toronto).

---

## 🛡️ Segurança entre Nós

### Autenticação mútua

- Cada nó tem **certificado X.509** emitido pelo Federation CA.
- mTLS em **toda comunicação**.
- Rotação de certificados a cada 90 dias.

### Trust Hierarchy

- **Tier 1**: Nós oficiais Nexus (controlados pela plataforma).
- **Tier 2**: White-labels operando sob contrato.
- **Tier 3**: Parceiros federados (read-only).
- **Tier 4**: Próprios tenants com nó próprio (futuro).

### Auditoria

- **Cada hop federado** gera log imutável.
- Logs retidos por **7 anos** (compliance Brasil + GDPR).
- **Cross-node trace correlation** via trace_id distribuído.

---

## 🧪 Casos de Uso Reais

### Caso 1 — Análise cross-region com PII-gating

```
1. Afiliado BR pede análise de cohort de 5000 contatos.
2. Orchestrator BR identifica que precisa de modelo Opus (UE).
3. Delega para nó UE com PII anonimizado.
4. Nó UE processa em <2s, retorna resultado.
5. Nó BR re-contextualiza com PII local.
6. Afiliado recebe análise completa.

Tempo: ~3.5s. Custo: $0.08. Compliance: 100%.
```

### Caso 2 — Multi-jurisdictional compliance

```
1. Cliente do BancoX (8 países) dispara campanha.
2. Dados do Brasil ficam no nó BR.
3. Dados do México ficam no nó MX.
4. Lógica de campanha roda em orchestrator centralizado.
5. Cada nó executa localmente, reporta central.

Resultado: zero dados cruzam fronteira, 100% compliance.
```

### Caso 3 — Resiliência em outage

```
1. Nó US-East cai (15min outage AWS).
2. SHO detecta em <30s.
3. Tráfego rerroteado para US-West + EU.
4. Latência sobe 300ms, mas uptime preservado.
5. Pós-incidente: postmortem + ajuste de circuit breaker.
```

---

## 📚 Documentos Relacionados

- [Apostila 12 — IOAID Arquitetura Profunda](../AcademIA/apostilas/12-ioaid-arquitetura-profunda.md)
- [Apostila 14 — Multi-Tenant & White-Label](../AcademIA/apostilas/14-multi-tenant-whitelabel.md)
- [Webinar WB-2026-04 — IA-to-IA Federation](../AcademIA/webinars/WB-2026-04-ia-to-ia-federation.md)
- [Knowledge-base: `01-modelo-ioaid.md`](01-modelo-ioaid.md)
- [Knowledge-base: `04-modelo-sho.md`](04-modelo-sho.md)

## 👥 Ownership

- **Owner:** Head de Arquitetura
- **Reviewers:** DPO, Tech Lead SRE
- **Slack:** `#federation-core`

---

*Nexus Affil'IA'te · Lib-Nexus · knowledge-base/05-modelo-federation.md · v1.0 · Junho 2026*
