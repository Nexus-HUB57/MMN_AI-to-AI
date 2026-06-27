---
title: "WS-05 · Oficina de Federação de Agentes (2.5h)"
description: "Material oficial Academ'IA · academia"
tags: [academia, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

# WS-05 · Oficina de Federação de Agentes (2.5h)

**Nível:** Master → Elite
**Pré-requisitos:** Conclusão de WS-04 e curso elite 02-federacao-agentes
**Formato:** Workshop hands-on multi-tenant (2.5 horas)
**Mentor:** Sir Nexus Alencar (lead) + Sra. Nexus Ive (estratégia)

---

## 🎯 Objetivos

1. Provisionar **2 nós federados** (white-label) com mTLS pinned
2. Configurar **reputação distribuída** entre nós
3. Implementar **roteamento de tarefas** por skill availability
4. Operar **handoff federado** entre agentes de nós diferentes
5. Auditar **ledger compartilhado** de transações cross-node

---

## 📋 Agenda (150 minutos)

### Bloco 1 — Teoria (35 min)
- Federação vs Multi-tenancy: diferenças arquiteturais
- mTLS pinned: como funciona, por que importa
- Identity Reputation System (IRS): scores por nó
- Tool Federation: roteamento dinâmico de capabilities
- Ledger distribuído: append-only, imutável, replicado

### Bloco 2 — Provisionamento (40 min)
**Hands-on #1:** Subir 2 instâncias Oneverso
- Nó A: `node-a.nexus-academy.io`
- Nó B: `node-b.nexus-academy.io`
- Certificados mTLS assinados pela CA Nexus
- DNS interno configurado
- Federation registry sincronizado

### Bloco 3 — Skill Routing (30 min)
**Hands-on #2:** Configurar roteamento federado
- Skill `lead-enricher` registrada no nó A
- Skill `pricing-optimizer` registrada no nó B
- Routing policy: "usar nó A se disponível, fallback para B"
- Teste de failover: desligar nó A e observar roteamento

### Bloco 4 — Reputation & Ledger (30 min)
**Hands-on #3:** Auditar comportamento cross-node
- Verificar reputation score de cada nó
- Inspecionar ledger compartilhado (transações 24h)
- Identificar padrão suspeito (se houver)
- Aprovar/rejeitar entradas manualmente

### Bloco 5 — Estratégia e fechamento (15 min)
- Quando escalar de multi-tenant para federado
- Custos e trade-offs
- Compliance e jurisdição
- Q&A

---

## 🧪 Materiais Necessários

- 2 servidores (ou 2 pods Kubernetes) com 4GB+ RAM cada
- Domínio com wildcard DNS configurado
- CA Nexus (certificados mTLS)
- Federation token ativo
- Acesso ao console `federation-admin`

## 📦 Entregáveis

- [ ] 2 nós federados operacionais
- [ ] mTLS pinned funcionando entre os nós
- [ ] Roteamento testado com failover
- [ ] Reputation scores documentados
- [ ] Ledger exportado e analisado

## 🎓 Critério de Conclusão

- Latência cross-node < 200ms p95
- Reputation score de ambos os nós ≥ 0.90
- Zero falhas de roteamento durante failover
- Audit trail completo e verificável

---

## ⚠️ Armadilhas Comuns

1. **mTLS expiry não monitorado** → nó fica órfão em 90 dias
2. **Reputation score baixo** por jobs mal comportados → roteamento degradado
3. **Ledger cheio** → custos crescentes, mitigação: compactação diária
4. **Skill conflicts** entre nós → sempre usar namespace versioning

---

*Acad. Nexus Affil'IA'te · WS-05 · 2026*
