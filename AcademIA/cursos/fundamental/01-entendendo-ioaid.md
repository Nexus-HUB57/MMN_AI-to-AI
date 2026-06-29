---
title: "01 · Entendendo o IOAID"
level: fundamental
duration: 20min
prerequisites: ["00-boas-vindas"]
tags: [ioaid, infra, event-bus, agent-runtime, autenticacao]
last_updated: 2026-06-02
---

# 🧠 01 · Entendendo o IOAID

> **Tempo:** 20 min · **Nível:** Fundamental · **Pré-requisitos:** Nenhum

## O que é IOAID?

**IOAID = Infraestrutura Operacional de Inteligência Distribuída.**

É a camada que faz o Nexus funcionar. Pense no IOAID como o **"sistema nervoso"** do ecossistema — onde dados, decisões e ações fluem em tempo real.

```
                     ┌────────────────────┐
                     │     AFILIADO        │
                     │  (você, na ponta)   │
                     └─────────┬──────────┘
                               │ ação
                               ▼
   ┌─────────────────────────────────────────────────────┐
   │                    I O A I D                          │
   │                                                      │
   │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐      │
   │  │ Auth   │  │ MMN    │  │Marketpl│  │ Agents │      │
   │  │ & RBAC │  │ Engine │  │ Sync   │  │Runtime │      │
   │  └────────┘  └────────┘  └────────┘  └────────┘      │
   │       │            │           │           │         │
   │       └────────────┴─────┬─────┴───────────┘         │
   │                          │ eventos                    │
   │                          ▼                            │
   │                   ┌────────────┐                      │
   │                   │ Event Bus  │                      │
   │                   └────────────┘                      │
   └─────────────────────────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  SHO · Orquestração  │
                    │ (cérebro de decisão) │
                    └──────────────────────┘
```

## Os 5 módulos do IOAID

| # | Módulo | O que faz | Onde está no código |
|---|---|---|---|
| 1 | **Auth & RBAC** | Login, papéis, permissões | `backend/src/domains/auth` |
| 2 | **MMN Engine** | Comissões, rede, ciclos | `backend/src/domains/commissions` |
| 3 | **Marketplace Sync** | Integra Hotmart, Shopee, ML | `backend/src/domains/marketplace` |
| 4 | **Agents Runtime** | 27+ agentes IA autônomos | `backend/src/agentic` |
| 5 | **Event Bus** | Trilha de auditoria + pub/sub | `backend/src/_core/events` |

## Como o dado flui

**Exemplo real:** um afiliado dispara uma campanha de WhatsApp.

1. Afiliado aciona o **dispatcher whatsapp** (UI)
2. Dispatcher pede o agente de **copy** (`copywriter-persuasivo`) → gera 3 variações
3. **Judge Revisor** avalia e aprova com nota ≥ 0.75
4. Aprovação vira evento `agentRuntime.generate` no **Event Bus**
5. Mensagens são enfileiradas no **BullMQ**
6. Worker dispara via **WhatsApp Business Platform**
7. Eventos `whatsapp.delivered` e `whatsapp.read` voltam para o bus
8. Métricas alimentam o **Autonomy Score**

> **Tudo isso roda em < 2 segundos (SLA interno) na maioria dos casos.**

## Conceitos-chave

| Conceito | Definição rápida |
|---|---|
| **Skill** | Capacidade atômica do agente (ex: gerar copy, segmentar audiência) |
| **Agent** | Persona com bundle de skills + autonomia |
| **Tenant** | Workspace isolado de uma marca/cliente |
| **Saga** | Fluxo de múltiplos passos com compensação |
| **Judge** | LLM secundário que avalia a saída do LLM primário |
| **Autonomy Score** | 0–100 que mede o quanto o agente pode agir sozinho |

## 🎯 Exercício

Abra o seu painel e responda:

1. Qual o seu **Autonomy Score** atual?
2. Quantas **skills operacionais** você tem hoje?
3. Quais **dispatchers** estão ativos na sua conta?

> 💡 Se não souber responder, abra um ticket — a equipe Nexus te ajuda.

## ⏭️ Próximo passo

👉 [**02 · Sistema SHO: o que é**](02-sistema-sho.md)

---

**Versão 1.0** · Atualizado 2026-06-02 · Fonte: `docs/canonical/DOCUMENTACAO_CANONICA.md`
