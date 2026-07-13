---
title: "Modelo SHO · Sistema de Higiene Operacional"
description: "Modelo canônico do sistema imunológico operacional da plataforma Nexus"
tags: [lib-nexus, knowledge-base, sho, sistema-imunologico, modelo, canonico]
category: knowledge-base
version: "1.0"
last_review: "2026-06-28"
status: canonico
---

# 🛡️ Modelo SHO · Sistema de Higiene Operacional

> **Source of truth** sobre o **SHO — Sistema de Higiene Operacional**, a camada que mantém o ecossistema Nexus saudável em escala. Este documento define arquitetura, sensores, decisões, ações, e o ciclo de aprendizado do SHO.

---

## 🎯 Definição Canônica

**SHO** é o **sistema imunológico operacional** do ecossistema Nexus. Sua função primária é **detectar, decidir, agir, comunicar e aprender** sobre ameaças à saúde do sistema — em tempo real, sem intervenção humana na maioria dos casos.

**Princípio de design:**

```
Fail Loud · Recover Fast · Learn Continuously
```

---

## 🏛️ Arquitetura em 5 Camadas

O SHO opera como uma pilha de **5 camadas funcionais** que se executam continuamente em ciclo:

```
┌──────────────────────────────────────────┐
│ 5. Aprendizado (L5)                      │   SHO evolui com cada incidente
├──────────────────────────────────────────┤
│ 4. Comunicação (L4)                      │   Alertas, dashboards, postmortem
├──────────────────────────────────────────┤
│ 3. Ação (L3)                             │   Quarantine, rollback, kill switch
├──────────────────────────────────────────┤
│ 2. Decisão (L2)                          │   Playbooks automáticos + IA
├──────────────────────────────────────────┤
│ 1. Detecção (L1)                         │   27 sensores em 9 sinais
└──────────────────────────────────────────┘
```

### L1 — Detecção

Monitora **9 sinais** com **27 sensores**:

| Sinal | Sensores | Threshold típico |
|-------|----------|------------------|
| **Latência** | p50, p95, p99, p99.9 | p99 > 5s |
| **Erro** | 4xx rate, 5xx rate, exception rate | 5xx > 1% |
| **Tráfego** | QPS, bandwidth, unique IPs | QPS > 5x baseline |
| **Recurso** | CPU, RAM, GPU, disk | CPU > 80% sustained |
| **Custo** | USD/hora, USD/request, USD/tenant | USD/hora > 1.5x forecast |
| **Comportamento** | Loop detector, retry storm, anomaly score | Anomaly > 0.85 |
| **Conteúdo** | PII scanner, toxicity, jailbreak rate | Qualquer PII detectado |
| **Negócio** | Conversion drop, refund spike, churn | Conversion -30% em 24h |
| **Federado** | Skill votes, agent reputation, gateway load | Reputation < 0.4 |

**Princípio:** *redundância > sensibilidade*. **3 sinais disparando** em paralelo = evento. **1 sinal sozinho** = ruído provável.

### L2 — Decisão

Quando L1 detecta, L2 classifica em **5 níveis de severidade**:

- **SEV-0** — Info, log apenas.
- **SEV-1** — Warning, alerta amarelo.
- **SEV-2** — Alert, alerta laranja.
- **SEV-3** — Incident, alerta vermelho.
- **SEV-4** — Outage, página imediato.

Para SEV-1 e SEV-2, L2 aciona **playbooks automáticos** (predefinidos pelo time Nexus). Para SEV-3 e SEV-4, **humano entra no loop**.

### L3 — Ação

Três ações crescentes:

**a) Quarantine** (isolamento suave):
- Skill indisponível para novos tenants.
- Tenants atuais continuam usando, com monitoring dobrado.
- Reversível em minutos com aprovação de 2 humanos.

**b) Rollback** (reversão cirúrgica):
- Versão anterior da skill é reativada.
- Estado do agente é preservado.
- Reversível em horas, com postmortem obrigatório.

**c) Kill Switch** (parada total):
- Skill, agente ou tenant é desligado imediatamente.
- Toda a rede vê em <5s.
- **Irreversível sem aprovação do Conselho**.

### L4 — Comunicação

Quatro canais, conforme severidade:

- **In-app banner** — todos os usuários afetados.
- **Email/Slack para operadores** — equipe Nexus em <2min.
- **Status page público** — para SEV-3 e SEV-4.
- **Audit log interno** — tudo registrado, retido por 7 anos.

### L5 — Aprendizado

Após cada incidente:

1. **Postmortem** gerado automaticamente.
2. **Playbook** atualizado se houver gap.
3. **Sensor** recalibrado se houve FN/FP.
4. **Threshold** ajustado se necessário.
5. **Knowledge base** atualizada com caso.

---

## 🔄 Ciclo Operacional

O SHO opera como um **loop contínuo** de 5 fases:

```
[Percepção] → [Deliberação] → [Ação] → [Comunicação] → [Reflexão]
       ↑                                                      │
       └──────────────────────────────────────────────────────┘
```

**Frequência do loop:**

- **Detecção**: a cada 1s.
- **Decisão**: a cada evento detectado.
- **Ação**: <30s para SEV-2, <90s para SEV-3.
- **Comunicação**: <2min para operadores.
- **Reflexão**: <24h após incidente.

---

## 📊 SLAs Canônicos

| Componente | SLA |
|-----------|-----|
| Detecção de SEV-3 | <90 segundos |
| Ação automática SEV-2 | <30 segundos |
| Comunicação a operadores | <2 minutos |
| Postmortem automático | <24 horas |
| Disponibilidade do SHO | 99.99% |

**O SHO tem SLA mais rígido que a plataforma principal** — porque se o SHO cai, a plataforma fica sem proteção.

---

## 🤝 Integração com o Ecossistema

### Com IOAID
- **L2 (Orquestrador)**: SHO monitora agentes em execução.
- **L3 (Modelos)**: SHO detecta drift de comportamento de modelos.
- **L4 (Federação)**: SHO monitora saúde de nós federados.

### Com Marketplace
- Toda **skill publicada** entra automaticamente sob monitoramento do SHO.
- **Reviews** com queda brusca disparam análise.
- **Autor** com histórico de violação é flagged.

### Com White-Label
- Cada tenant tem **perfil de saúde** monitorado.
- **Tenant-level alerts** configuráveis.
- **SHO Shared** para white-labels com SLA dedicado.

---

## 🔐 Limites do SHO

**O SHO não:**

- Decide sobre decisões de **negócio** (preço, produto, parceria).
- Modifica **constituição** da plataforma (regra humana).
- Publica comunicados **externos** (PR humano).
- Treina novos modelos (responsabilidade da academia/research).

**O SHO é operacional. Não é estratégico. Não é político. Não é criativo.**

---

## 📚 Documentos Relacionados

- [Apostila 11 — SHO em Produção](../AcademIA/apostilas/11-sho-em-producao.md)
- [Playbook `PB-CRISES-gestao-crise-*`](../AcademIA/playbooks/)
- [Best-practice: Error Handling](../best-practices/01-error-handling.md)
- [Knowledge-base: `01-modelo-ioaid.md`](01-modelo-ioaid.md)

## 👥 Ownership

- **Owner:** DPO + Head de Operações
- **Reviewers:** Tech Lead, Alencar (Persona)
- **Reviewers externos:** Auditores contratados anualmente

---

*Nexus Affil'IA'te · Lib-Nexus · knowledge-base/04-modelo-sho.md · v1.0 · Junho 2026*
