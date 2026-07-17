---
title: "00 · Otimização de Conversão"
level: master
duration: 45min
prerequisites: ["agente"]
tags: [conversao, ctr, cac, ltv, roi-attributor, ab-test, funil]
last_updated: 2026-06-02
---

# 📈 00 · Otimização de Conversão

> **Tempo:** 45 min · **Nível:** Master · **Pré-requisitos:** Nível Agente completo

## O funil Nexus (visão master)

```
        IMPRESSÕES           (Meta Ads / Orgânico)
             │
             ▼
        CLIQUES              (link de afiliado)
             │
             ▼
        VISITAS              (landing)
             │
             ▼
        LEADS                (captura: e-mail / WhatsApp)
             │
             ▼
        QUALIFICADOS         (audience-segmenter)
             │
             ▼
        CONVERSÕES           (compra confirmada)
             │
             ▼
        CLIENTES             (LTV, recompra, indicação)
```

> Cada elo tem perda esperada. Seu trabalho é mover **1–2 pontos percentuais** em cada elo por ciclo.

## As 5 alavancas

| # | Alavanca | Skill principal | Ganho típico |
|---|---|---|---|
| 1 | **Hook de copy** | `copywriter-persuasivo` | +15–30% CTR |
| 2 | **Segmentação** | `audience-segmenter` | +20% reply rate |
| 3 | **Timing de envio** | `auto-publisher` | +10% read rate |
| 4 | **Oferta/CTA** | `pricing-optimizer` | +5–15% conversão |
| 5 | **Reativação** | `lifecycle-orchestrator` | +30% LTV em inativos |

## O ciclo de otimização contínua

```
   ┌──────────┐
   │  Medir   │
   └────┬─────┘
        │
        ▼
   ┌──────────┐
   │  Hipótese│  (mudar 1 variável)
   └────┬─────┘
        │
        ▼
   ┌──────────┐
   │  Testar  │  (A/B com judge + coortes)
   └────┬─────┘
        │
        ▼
   ┌──────────┐
   │  Aprender│  (atualizar memória do agente)
   └────┬─────┘
        │
        └──────► (volta para "Medir")
```

> **Regra de ouro:** mude **1 variável por vez**. Caso contrário, você não sabe o que causou o quê.

## Onde olhar primeiro (diagnóstico em 5 min)

Abra **Analytics → Funil Completo** e responda:

| Pergunta | Se resposta for "ruim" |
|---|---|
| CTR da copy principal < 3%? | Testar 3 hooks novos (`copywriter-persuasivo`) |
| Read rate WhatsApp < 50%? | Trocar horário (regra: 9h, 12h, 19h) |
| Reply rate < 5%? | Segmentar melhor (`audience-segmenter`) |
| Conversão lead→cliente < 2%? | Revisar oferta (`pricing-optimizer`) |
| Recompra 30d < 10%? | Ativar `lifecycle-orchestrator` |

## Como rodar um A/B test sério

### Passo 1 — Defina a hipótese

```
"SE mudar o hook de 'Em 90 dias' PARA 'Em 30 dias',
 ENTÃO o reply rate vai subir pelo menos 20%."
```

### Passo 2 — Configure 2 coortes

- **Coorte A** (50%): copy original
- **Coorte B** (50%): copy com hook novo
- **Randomização:** por `contact_id` (determinística, hash)

### Passo 3 — Volume mínimo

```
n = (Z_α/2 + Z_β)² × 2p(1-p) / d²

Para detectar d=0.05 (5pp), α=0.05, β=0.80:
n ≈ 1.500 por coorte
```

> Se sua lista é menor, o teste **não tem poder estatístico**. Espere acumular.

### Passo 4 — Decida com `roi-attributor`

A skill `roi-attributor` faz **atribuição multi-touch** e responde: *"esse lead converteu por causa de qual campanha?"*. Use o output dela para tomar a decisão final.

## 🎯 Exercício (1 semana)

1. Escolha **1 elo do funil** com maior perda
2. Formule **1 hipótese clara**
3. Configure A/B test com 2 coortes
4. Aguarde volume mínimo
5. Documente: hipótese, resultado, aprendizado, próximo passo

> **Entrega:** postar no `#academy-master` do Discord Nexus com 1 print do funil antes/depois.

## ⏭️ Próximo passo

👉 [**01 · Funis e lifecycle**](01-funis-lifecycle.md)

---

**Versão 1.0** · Atualizado 2026-06-02 · Fonte: `backend/src/agentic/skills/roiAttributor.ts` + `abTestDesigner.ts`
