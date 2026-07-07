---
title: "03 · Análise de Coortes e Churn"
level: master
duration: 40min
prerequisites: ["master/02-ab-test-judge"]
tags: [coorte, churn, ltv, retencao, cohort-analyzer, ltv-cac]
last_updated: 2026-06-02
---

# 📊 03 · Análise de Coortes e Churn

> **Tempo:** 40 min · **Nível:** Master · **Pré-requisitos:** 02 - A/B testing com judge

## O que é coorte?

Uma **coorte** é um grupo de usuários que compartilham uma característica de entrada no tempo.

**Exemplos de coortes no Nexus:**

- **Coorte "Janeiro 2026"** — todos os afiliados cadastrados em Jan/26
- **Coorte "Campanha Lançamento X"** — leads que vieram da campanha X
- **Coorte "Black Friday"** — clientes que compraram na BF

> A skill `cohort-analyzer` (planejada, em `Lib-Nexus/agents-specs/`) cruza comportamento ao longo do tempo dentro de cada coorte.

## Por que coortes > médias

```
Média:  "meu LTV é R$ 120"
Coorte: "LTV da coorte Jan/26 é R$ 180
         LTV da coorte Mar/26 é R$ 90
         → algo mudou em Fev"
```

> A média esconde a verdade. **Coortes revelam.**

## Como ler uma tabela de coorte

```
                  Mês 0    Mês 1    Mês 2    Mês 3    Mês 4
Coorte Jan/26:   100%     72%      58%      51%      48%
Coorte Fev/26:   100%     68%      52%      44%      ?
Coorte Mar/26:   100%     65%      49%      ?        ?
```

Cada célula = **% da coorte que ainda está ativa** no mês.

**Sinais:**

- Linha caindo devagar = ✅ boa retenção
- Linha caindo rápido = ❌ churn alto
- Comparar coortes: coortes mais novas caindo mais rápido = **degradação**

## Churn — como calcular

```
Churn rate (mês) = lost_customers_month / customers_start_month

Exemplo:
- Comecei o mês com 200 clientes
- Perdi 30
- Churn = 30/200 = 15% ao mês
```

> A skill `churn-predictor` (planejada) vai ranquear clientes por risco de churn e alimentar o `lifecycle-orchestrator` para reativação proativa.

## LTV — como calcular

```
LTV = ARPU × (1 / churn_rate)

Exemplo:
- ARPU = R$ 50/mês
- Churn = 10% ao mês
- LTV = 50 / 0.10 = R$ 500
```

> **Meta Nexus:** **LTV/CAC > 3**.

## Ferramenta: `cohort-analyzer` (preview)

```typescript
// Pseudocódigo de cohort-analyzer
{
  cohorts: ["2026-01", "2026-02", "2026-03", "2026-04"],
  metric: "retention",          // retention | ltv | revenue
  window: 4,                    // meses
  groupBy: "acquisition_source" // orgânico / ads / indicação
}
```

**Output típico:**

```json
{
  "2026-01": [1.0, 0.72, 0.58, 0.51, 0.48],
  "2026-02": [1.0, 0.68, 0.52, 0.44, null],
  "best_source": "indicacao",
  "worst_source": "ads_pago",
  "trend": "decaindo"
}
```

## Ações quando a coorte está caindo

| Sinal | Ação |
|---|---|
| Mês 1 cai < 60% | Onboarding fraco → ativar `lifecycle-orchestrator` D+1, D+3 |
| Mês 2 cai < 40% | Falta de valor nos primeiros 60d → rever `pricing-optimizer` |
| Mês 3+ estabiliza < 30% | Coorte não é boa → parar de trazer mais desse canal |
| Receita/coorte decresce | Mix de clientes piorando → rever targeting |

## 🎯 Exercício

1. Pegue seus **6 últimos meses** de cadastros
2. Monte a tabela de coorte (retenção mensal)
3. Identifique:
   - Melhor mês de aquisição
   - Pior mês
   - Tendência geral (subindo, estável, caindo)
4. Tire **1 ação** baseada no que descobriu

## ⏭️ Próximo passo

👉 [`cursos/elite/00-blueprints-elite.md`](../elite/00-blueprints-elite.md)

---

**Versão 1.0** · Atualizado 2026-06-02 · Fonte: `Lib-Nexus/agents-specs/cohort-analyzer.md` (em construção) + `backend/src/agentic/skills/lifecycleOrchestrator.ts`
