---
title: "02 · A/B Testing com Judge"
level: master
duration: 35min
prerequisites: ["master/01-funis-lifecycle"]
tags: [ab-test, judge, estatistica, hipotese, significancia, p-value]
last_updated: 2026-06-02
---

# 🧪 02 · A/B Testing com Judge

> **Tempo:** 35 min · **Nível:** Master · **Pré-requisitos:** 01 - Funis e lifecycle

## A/B test tradicional vs A/B test com Judge

| Tradicional | Com Judge |
|---|---|
| Você cria 2 versões e compara resultado | O Judge ranqueia **antes do envio** |
| Espera dias para saber resultado | Tem sinal estatístico em **horas** |
| Custo de teste = custo de envio | Custo de teste = chamadas LLM |

> A skill `ab-test-designer` orquestra as duas etapas: **pré-filtragem pelo Judge** + **validação em campo**.

## Como funciona

```
                ┌─────────────────┐
                │ Variação A      │
                │ Variação B      │   ← geradas por copywriter-persuasivo
                │ Variação C      │
                └────────┬────────┘
                         │
                         ▼
              ┌──────────────────┐
              │ Judge Revisor    │   ← ranqueia por score previsto
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Top 2 vão para   │   ← descarta o pior
              │ campo (A/B)      │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Resultado real   │   ← ROI Attributor mede
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │ Vencedor entra   │   ← aprende na memória
              │ na base          │
              └──────────────────┘
```

## Exemplo real: 3 hooks para WhatsApp

| Hook | Judge score | Decisão |
|---|---|---|
| A: "Em 90 dias, sua primeira renda extra com IA" | 0.78 | ✅ Vai para campo |
| B: "Você sabia que 73% dos brasileiros perdem R$ 1.500/mês" | 0.82 | ✅ Vai para campo |
| C: "Clique aqui agora e ganhe 50% off" | 0.42 | ❌ Descartado (agressivo) |

**Resultado em campo** (n=1.500/coorte):
- A: **8.2%** reply rate
- B: **11.4%** reply rate ← **vencedor**

> **Aprendizado:** hooks com estatística/prova superam hooks com promessa vaga.

## Configurando um A/B test no Nexus

### 1. Use a skill `ab-test-designer`

```typescript
{
  hypothesis: "Prova social (número específico) > promessa vaga",
  variations: [
    { id: "A", hook: "Em 90 dias, primeira renda", copy: "..." },
    { id: "B", hook: "73% perdem R$ 1.500/mês", copy: "..." }
  ],
  audience: { segment: "quentes_30d", size: 3000 },
  successMetric: "reply_rate",
  minSampleSize: 1500,        // por coorte
  confidenceLevel: 0.95,
  maxDurationDays: 14,
  stopOnSignificance: true
}
```

### 2. Acompanhe em tempo real

```
Admin Runtime → A/B Tests → [seu teste]

- Coorte A: 1.234 envios, 102 replies, **8.27%** (CI: 6.8–9.7)
- Coorte B: 1.245 envios, 142 replies, **11.41%** (CI: 9.7–13.1)
- p-value: 0.012 → SIGNIFICANTE
```

### 3. Promova o vencedor
Botão **"Promover para 100% do tráfego"** → a variação B vira padrão.

## Boas práticas

- ✅ 1 variável por vez (hook OU oferta OU CTA — não tudo junto)
- ✅ Volume suficiente (use a fórmula do curso 00)
- ✅ Randomização por hash (não sequencial)
- ✅ Pare cedo se `stopOnSignificance: true`
- ❌ Nunca pare "porque o resultado parece bom" antes do n mínimo
- ❌ Nunca use A/B com público < 100 (sem poder estatístico)

## Quando NÃO rodar A/B

- Lançamento pontual (use intuição + speed)
- Lista < 500 contatos
- Variável que você não consegue mudar de novo depois (ex: nome de marca)

## 🎯 Exercício

1. Escolha 1 hook seu atual
2. Crie 2 variações mudando **só o gancho** (primeira linha)
3. Configure A/B com `ab-test-designer`
4. n=1.000/coorte
5. Documente vencedor e promova para 100%

## ⏭️ Próximo passo

👉 [**03 · Análise de coortes e churn**](03-coortes-churn.md)

---

**Versão 1.0** · Atualizado 2026-06-02 · Fonte: `backend/src/agentic/skills/abTestDesigner.ts` + `judgeRevisor.ts`
