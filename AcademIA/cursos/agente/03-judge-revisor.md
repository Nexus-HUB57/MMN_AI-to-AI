---
title: "03 · Lendo o Judge Revisor"
level: agente
duration: 20min
prerequisites: ["agente/02-disparo-whatsapp"]
tags: [judge, llm-as-judge, revisao, conar, lgpd, cdc, alinhamento]
last_updated: 2026-06-02
---

# ⚖️ 03 · Lendo o Judge Revisor

> **Tempo:** 20 min · **Nível:** Agente · **Pré-requisitos:** 02 - Disparando no WhatsApp

## O que é o Judge?

O **Judge Revisor** é um LLM secundário que avalia a saída do LLM primário **antes de qualquer ação ser tomada**. É a implementação prática de **LLM-as-a-Judge** no Nexus.

> **Arquivo:** `backend/src/agentic/skills/judgeRevisor.ts` + `judge/judgeRevisor.ts`

## Por que o Judge existe

LLMs primários são bons em **gerar**, fracos em **autocrítica**. O Judge existe para:

- ✅ Detectar claims publicitários sem prova
- ✅ Sinalizar tom inadequado (agressivo, promessas irreais)
- ✅ Avaliar clareza e persuasão
- ✅ Classificar risco regulatório (**CONAR, LGPD, CDC**)

## Como o Judge pontua

```typescript
interface JudgeVerdict {
  score: number;            // 0..1
  approved: boolean;        // score >= threshold
  risk_flags: string[];     // ex: ["claim_subjetivo"]
  suggestions: string[];    // ex: ["adicionar prova social"]
  category: "safe" | "review" | "block";
}
```

> **Threshold padrão:** `0.75` (configurável no SHO).

## As 4 categorias de veredito

| Categoria | Score | O que acontece |
|---|---|---|
| 🟢 **safe** | ≥ 0.85 | Auto-aprovado, segue para dispatcher |
| 🟡 **review** | 0.70 – 0.85 | Cai na fila, você decide |
| 🟠 **risk** | 0.55 – 0.70 | Cai na fila com alerta vermelho |
| 🔴 **block** | < 0.55 | Bloqueado automaticamente + notificação |

## Lendo a fila do Judge

**Admin Runtime → Fila de Aprovações**

Cada item mostra:

- 📝 Trecho da copy
- ⚠️ `risk_flags` (3-5 chips clicáveis)
- 💡 `suggestions` (1-3 melhorias sugeridas)
- ⏱️ Idade na fila (velho = prioridade)

**Atalhos de teclado:**

- `A` = aprovar como está
- `E` = editar (modal abre com a copy)
- `R` = rejeitar (pede motivo)
- `B` = bloquear skill por 1h (emergência)

## Quando aprovar mesmo com nota baixa

- Você conhece o segmento melhor que o Judge
- A campanha é de reativação (tom agressivo é OK)
- É um teste A/B explícito (você quer ver a resposta real)

## Quando bloquear (mesmo com nota alta)

- Detectou `claim_subjetivo` com número específico
- A copy promete resultado sem disclaimer
- Tom pode ser interpretado como spam
- Fere uma regra do **CONAR** para seu nicho

## 🎯 Exercício

1. Vá na **Fila de Aprovações** agora
2. Pegue **5 itens** com nota entre 0.70–0.80
3. Para cada um, anote:
   - `risk_flags` principais
   - Se você aprova ou rejeita
   - Por quê (1 frase)
4. Compare com o que o Judge sugeriu

> 💡 **Objetivo:** calibrar seu critério com o do Judge. Quando os 2 concordam, o sistema está maduro.

## 📈 Métrica-chave: alinhamento humano-Judge

```
Alinhamento = aprovações concordantes / total de aprovações
```

| Alinhamento | Interpretação |
|---|---|
| < 60% | Calibrar Judge ou ajustar prompt |
| 60–80% | Saudável |
| 80–95% | Ótimo |
| > 95% | Você está repetindo o Judge (perde valor) |

> **Meta Nexus:** **75–85% de alinhamento sustentado**.

## ⏭️ Próximo passo

👉 [`cursos/master/00-otimizacao-conversao.md`](../master/00-otimizacao-conversao.md)

---

**Versão 1.0** · Atualizado 2026-06-02 · Fonte: `backend/src/agentic/skills/judgeRevisor.ts`
