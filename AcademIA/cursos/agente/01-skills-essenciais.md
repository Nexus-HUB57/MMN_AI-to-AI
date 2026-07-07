---
title: "01 · Skills essenciais: copywriter + audience-segmenter"
level: agente
duration: 25min
prerequisites: ["agente/00-primeiro-agente"]
tags: [skills, copywriter, audience-segmenter, prompt, segmentacao]
last_updated: 2026-06-02
---

# ⚙️ 01 · Skills essenciais: copywriter + audience-segmenter

> **Tempo:** 25 min · **Nível:** Agente · **Pré-requisitos:** 00 - Seu primeiro agente

## O que é uma Skill?

Uma **Skill** é uma capacidade atômica do agente. Cada skill é um arquivo TypeScript em `backend/src/agentic/skills/` que implementa o contrato `SkillHandler`:

```typescript
interface SkillHandler<TInput, TOutput> {
  slug: SkillSlug;
  category: SkillCategory;
  run(ctx: SkillExecutionContext, input: TInput): Promise<SkillExecutionResult<TOutput>>;
}
```

> Hoje o sistema tem **27 skills operacionais** + **18 planejadas** (roadmap) = **45 totais**.

## As 2 skills que você vai usar TODO dia

### ✍️ `copywriter-persuasivo`

**O que faz:** gera copy pronto para publicação (headline, sub, 3 hooks A/B, CTA + flags de risco).

**Input mínimo:**

```typescript
{
  productName: "Curso X",
  productType: "curso",
  audience: "empreendedores iniciantes, 25-45 anos",
  pain: "não consegue gerar renda extra",
  outcome: "faturar R$ 5k/mês em 90 dias",
  tone: "persuasive",
  channel: "whatsapp"
}
```

**Output típico:**

```json
{
  "headline": "Em 90 dias, sua primeira renda extra com IA.",
  "subheadline": "Mesmo que você nunca tenha vendido nada na vida.",
  "hooks": [
    "Você sabia que 73% dos brasileiros perdem R$ 1.500/mês por não saber...",
    "Eu era CLT, hoje faturei R$ 12k no primeiro mês com...",
    "O método que 3.847 alunos usaram para sair do zero..."
  ],
  "cta": "Quero começar agora → [link]",
  "risk_flags": ["claim_subjetivo", "numero_nao_verificado"]
}
```

> 📂 Onde usar: [`Lab-Nexus/tools/copy/`](../../Lab-Nexus/tools/copy/) tem 12 templates prontos.

### 🎯 `audience-segmenter`

**O que faz:** divide uma lista de contatos em **segmentos acionáveis** (ex: lead frio, lead quente, cliente ativo, inativo 30d+).

**Input:**

```typescript
{
  contacts: Contact[],   // até 10k
  criteria: ["last_purchase_days", "engagement_score", "ltv_bucket"]
}
```

**Output:**

```json
{
  "segments": [
    { "name": "quentes_30d", "count": 142, "ids": [...] },
    { "name": "frios_60d", "count": 487, "ids": [...] },
    { "name": "inativos_90d", "count": 98, "ids": [...] }
  ]
}
```

## Como as 2 se conectam

```
Lista de contatos (5.000)
        │
        ▼
┌─────────────────────┐
│ audience-segmenter  │  → 3 segmentos
└─────────┬───────────┘
          │
          ├── "quentes_30d" ─→ copywriter (urgência) ─→ whatsapp
          ├── "frios_60d"   ─→ copywriter (reativação) ─→ email
          └── "inativos"    ─→ copywriter (reativação) ─→ facebook
```

## Padrão recomendado (use sempre)

1. **Segmentar primeiro** — nunca disparar para a lista cheia.
2. **Escolher o segmento mais quente** — começa por quem tem maior propensão.
3. **Gerar copy com 3 hooks A/B** — o Judge vai ranquear.
4. **Disparar e medir** — 24h depois, ver CTR por hook.

## 🎯 Exercício

1. Pegue sua lista de **1.000 contatos**
2. Rode `audience-segmenter` com critério `engagement_score`
3. Identifique o **top 20%** (segmento quente)
4. Rode `copywriter-persuasivo` com 3 hooks diferentes para esse segmento
5. Compare CTR dos 3 hooks após 48h

## ⏭️ Próximo passo

👉 [**02 · Disparando no WhatsApp**](02-disparo-whatsapp.md)

---

**Versão 1.0** · Atualizado 2026-06-02 · Fonte: `backend/src/agentic/skills/copywriterPersuasivo.ts` + `audienceSegmenter.ts`
