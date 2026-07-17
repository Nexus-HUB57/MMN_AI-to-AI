---
title: "02 · Sistema SHO — Sistema Híbrido de Orquestração"
level: fundamental
duration: 15min
prerequisites: ["01-entendendo-ioaid"]
tags: [sho, orquestracao, autonomia, judge, risk-limit]
last_updated: 2026-06-02
---

# 🧬 02 · Sistema SHO — Sistema Híbrido de Orquestração

> **Tempo:** 15 min · **Nível:** Fundamental · **Pré-requisitos:** 01 - Entendendo o IOAID

## O que é SHO?

**SHO = Sistema Híbrido de Orquestração.**

É a camada que decide **quando o agente age sozinho** e **quando precisa de você**. É a ponte entre "autonomia total" e "aprovação humana".

O SHO opera com **3 bandas de autonomia**, refletidas no **Autonomy Score** (0–100):

```
  0 ───────────────── 50 ──────────────── 80 ────────────── 100
  │  APROVAÇÃO         │  OPACIONAL          │  AVANÇADA       │
  │  HUMANA            │                     │                 │
  │  obrigatória       │  Aprova só risco    │  Age sozinho    │
  │                    │  alto               │  audita depois  │
  ▼                    ▼                     ▼                 ▼
 Notif. push        Auto-aprova 80%+     Audit + rollback
```

## A regra de ouro do SHO

> **Se o risco for ≤ R_X OU a confiança ≥ 0.85, o agente age sozinho.**
> **Se o risco for > R_X OU a confiança < 0.7, o agente pede aprovação.**

Os limites são configuráveis por afiliado Elite em `backend/src/agentic/runtimeRbac.ts`.

## As 3 bandas na prática

### 🟢 Banda 1 — Operacional (0–80)
- Auto-aprova a maioria das Skills
- Te notifica em push apenas se o Judge reprovar
- Confiança: alta nas skills maduras
- **Exemplo:** o agente publica 8 de 10 mensagens sem te chamar

### 🟡 Banda 2 — Operacional+ (80–85)
- Auto-aprova com confiança ≥ 0.85
- Auditoria contínua, rollback se degradar
- Você entra se o Judge divergir do seu padrão histórico

### 🔵 Banda 3 — Avançada (85+)
- Auto-aprova quase tudo
- Você entra só em anomalias (Judge sinalizou, A/B test divergente)
- Acesso a skills de auto-otimização

## Como o SHO decide (resumo técnico)

```typescript
// Pseudo-código simplificado de SHO.evaluate
function evaluate(action, context) {
  const risk = calculateRisk(action, context);
  const confidence = judge.score(action);

  if (risk > AUTO_BLOCK_RISK) return { decision: "REQUIRE_APPROVAL" };
  if (confidence < 0.7)      return { decision: "REQUIRE_APPROVAL" };
  if (confidence >= 0.85)    return { decision: "AUTO_APPROVE" };

  return { decision: "AUTO_APPROVE" };  // banda operacional
}
```

> **Implementação real:** `backend/src/agentic/marketingOrchestrator.ts` + `judge/judgeRevisor.ts`

## O que está no seu controle

Mesmo na banda 3, você pode pausar a qualquer momento:

- ⏸️ **Pausar agente específico**
- 🚫 **Bloquear dispatcher** (ex: parar WhatsApp por 1h)
- 🔍 **Auditar todas as ações** das últimas 24h
- ↩️ **Reverter ação já executada** (rollback)

## 🎯 Exercício

1. Abra o painel → **Admin Runtime**
2. Veja a coluna **Banda atual** do seu agente principal
3. Mude um único parâmetro (ex: limiar de confiança de `0.75 → 0.80`)
4. Observe o impacto nas próximas 24h no **Autonomy Score**

> ⚠️ **Dica:** mude um parâmetro por vez. Vários ajustes simultâneos impedem você de saber o que causou o quê.

## ⏭️ Próximo passo

👉 [**03 · Primeiros passos no Painel**](03-painel-afiliado.md)

---

**Versão 1.0** · Atualizado 2026-06-02 · Fonte: `backend/src/agentic/autonomyScore.ts` + `marketingOrchestrator.ts`
