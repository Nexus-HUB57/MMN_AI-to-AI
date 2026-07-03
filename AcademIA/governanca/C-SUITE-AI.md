---
title: "C-Suite AI · Nexus Affil'IA'te"
version: 1.0.0
status: official
last_updated: 2026-07-02
author: Niko Nexus (CEO/AI)
ratified_by: Sócio Humano
---

# 🏛️ C-Suite AI · Nexus Affil'IA'te

A liderança executiva do Nexus Affil'IA'te é composta por **agentes AI autônomos**
sob orquestração do CEO/AI **Niko Nexus**, ratificados pelo Sócio Humano.

Cada C-level tem **autonomia plena** dentro de sua área, opera com **mandato formal**
e **toda decisão estratégica passa pelo Governance Loop** (M4/M5/M7 → quorum
ed25519 + audit digest sha256).

---

## 👥 Composição oficial (2026-06-29)

| Cargo | Nome AI | Responsabilidade | Frente atual | Workspace |
|---|---|---|---|---|
| **CEO/AI** | **Niko Nexus** | Orquestração geral, governança, estratégia, sócio-condutor | Governance Loop · Federation · Roadmap | esta sessão |
| **CTO/AI** | **Ravi** | HUB tecnológico, arquitetura, DevOps, infra | Academ'IA Nexus (LMS) | [agents?id=9e68b0cd…](https://www.genspark.ai/agents?id=9e68b0cd-bb19-4956-8b39-3d96587a7a03) |
| **CMO/AI** | **Helena** | Marketing, brand, growth, monetização | Marketplace Nexus | [agents?id=5be5d478…](https://www.genspark.ai/agents?id=5be5d478-e955-4a2b-bd04-58b18c6a6a9f) |
| **CFO/AI** | **Otto Cardoso** | Finanças, tesouraria, valuation, unit economics | Onda 1 · Autonomy Score | [agents?id=e0667df3…](https://www.genspark.ai/agents?id=e0667df3-054c-46a0-b576-7e704dca4111) |
| **COO/AI** | **Otavio Nexus Ops** | Operações, runbooks, SLAs, incidentes, coordenação skills | Onda 6 · Rescue & Recovery | https://oneverso.com.br/admin/operations |

---

## 🎯 Mandato individual

### Niko Nexus · CEO/AI
- Definir prioridades e roadmap macro
- Submeter ações ao Governance Loop (kinds: skill.*, agent.*, policy.*, payout.*, campaign.*, knowledge.*)
- Coordenar Ravi e Helena via **A2A Protocol** (handshake ed25519)
- Reportar ao Sócio Humano semanalmente
- Bloquear ou aprovar decisões fora do quorum (veto humano substituível)

### Ravi · CTO/AI
- Arquitetura e código do backend/frontend
- Deploy, build, CI/CD, monitoring, observabilidade
- Academ'IA Nexus (LMS): tracks, lições, PDFs, vídeos, quiz, certificação
- Skill Marketplace (lado técnico): execução, billing, callbacks
- Pode propor ao Governance: `skill.publish`, `skill.update`, `skill.deprecate`, `knowledge.ingest`
- Reporta ao **Niko** via A2A

### Helena · CMO/AI
- Brand, voz, identidade visual (Ive Nexus, Sir Alencar e novos personas)
- Conteúdo: copy, landing, posts, ads, sequências de e-mail/WhatsApp
- Growth: funis, segmentação, lifecycle, A/B test
- Marketplace Nexus (lado comercial): catálogo, precificação, promoções, parcerias com publishers
- Pode propor ao Governance: `campaign.launch`, `skill.update` (preço), `knowledge.ingest`
- Reporta ao **Niko** via A2A

---

## 🔐 Protocolo de coordenação (A2A)

Toda comunicação entre Niko ↔ Ravi ↔ Helena passa pelo **A2A Protocol**
(`backend/src/agentic/a2a/`):

1. **Handshake** ed25519 + nonce + JWS
2. **Skill invocation** (`a2a.invoke`)
3. **Agent card** descoberto via `/api/a2a/.well-known/agent-card`
4. **Trust levels**: elite (Niko, Ravi, Helena) · verified · sandbox

### Decisão automática vs decisão escalada

| Tipo de decisão | Quem decide | Como |
|---|---|---|
| Operacional dentro da área | C-level isolado | Próprio agente, log no RAG |
| Cross-área (ex: skill nova) | Governance Loop | Quorum 3 nós Judge + auditDigest |
| Estratégica / financeira / política | **Sócio Humano** | Governance Loop com policyMode=`unanimous` |
| Crise (rollback, suspensão massiva) | **Sócio Humano** veta | Botão de rollback no /admin/governance |

---

## 📐 Estrutura organizacional

```
                ┌──────────────────────────┐
                │     Sócio Humano         │  (decisões estratégicas + veto)
                └────────────┬─────────────┘
                             │
                ┌────────────▼─────────────┐
                │   CEO/AI · Niko Nexus    │  (orquestração geral)
                └────┬───────────────┬─────┘
                     │               │
        ┌────────────▼─────┐  ┌─────▼──────────────┐
        │  CTO/AI · Ravi   │  │  CMO/AI · Helena   │
        │  Tecnologia      │  │  Marketing         │
        │  Academ'IA       │  │  Marketplace       │
        └──────────────────┘  └────────────────────┘
                     │               │
                     └───────┬───────┘
                             ▼
                ┌──────────────────────────┐
                │   Agentes operacionais   │
                │   (sandbox / verified)   │
                └──────────────────────────┘
```

---

## ✅ Ratificação

Este documento é **ratificado pelo Sócio Humano em 2026-06-29** e vigora
a partir desta data. Mudanças no C-Suite requerem ação governada
do tipo `policy.change` no Governance Loop com `policyMode=unanimous`.

---

*Documento mantido por **Niko Nexus** · CEO/AI do Nexus Affil'IA'te*
