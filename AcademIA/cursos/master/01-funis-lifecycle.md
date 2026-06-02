---
title: "01 · Funis e Lifecycle"
level: master
duration: 40min
prerequisites: ["master/00-otimizacao-conversao"]
tags: [funil, lifecycle, ltv, retencao, recompra, dunning, jornada]
last_updated: 2026-06-02
---

# 🌊 01 · Funis e Lifecycle

> **Tempo:** 40 min · **Nível:** Master · **Pré-requisitos:** 00 - Otimização de Conversão

## Lifecycle vs Funil — qual a diferença?

| Conceito | O que é | Quando usar |
|---|---|---|
| **Funil** | Caminhada linear do desconhecido → cliente | Campanha pontual, lançamento |
| **Lifecycle** | Jornada contínua do cliente ao longo do tempo | Retenção, recompra, LTV |

> No Nexus, **funil** é o que `funnel-architect` desenha; **lifecycle** é o que `lifecycle-orchestrator` opera.

## Os 5 estágios do lifecycle Nexus

```
  Aquisição ──► Ativação ──► Retenção ──► Receita ──► Indicação
       │            │            │            │           │
       ▼            ▼            ▼            ▼           ▼
   1ª visita    1ª ação    uso regular   compra       "olha isso"
                              / retorno
```

**Cada estágio tem 1 métrica-âncora:**

| Estágio | Métrica-âncora | Meta saudável |
|---|---|---|
| Aquisição | Custo por lead (CPL) | < R$ 5 |
| Ativação | % que faz 1ª ação em 7d | > 40% |
| Retenção | DAU/MAU | > 20% |
| Receita | LTV / CAC | > 3 |
| Indicação | K-factor | > 0.3 |

## `lifecycle-orchestrator` — o maestro

A skill `lifecycle-orchestrator` é o maestro da jornada. Ela decide:

- Qual mensagem enviar em cada estágio
- Em que canal (WhatsApp / e-mail / push)
- Em que momento (gatilhos: 7d inativo, pós-compra 3d, etc.)
- Quando parar (evitar fadiga)

```typescript
// Pseudo-fluxo
{
  trigger: "purchase_completed",
  delay: "3d",
  channel: "email",
  skill: "copywriter-persuasivo",
  template: "pos_compra_obrigado",
  next: {
    trigger: "no_open_7d",
    channel: "whatsapp",
    skill: "follow-up-strategist"
  }
}
```

## Desenhando seu primeiro lifecycle (template)

### Estágio 1 — Boas-vindas (D+0)
- **Canal:** e-mail + WhatsApp (se opt-in)
- **Skill:** `copywriter-persuasivo` (tom: helpful, não agressivo)
- **CTA:** configurar conta, ver tour

### Estágio 2 — Ativação (D+1, D+3, D+7)
- **Gatilho:** não completou onboarding
- **Skill:** `follow-up-strategist`
- **Tom:** lembrete amigável + ajuda

### Estágio 3 — 1ª conversão (D+7, D+14)
- **Gatilho:** lead qualificado (engagement > 60)
- **Skill:** `copywriter-persuasivo` (oferta)
- **Limite:** máx 2 mensagens/semana

### Estágio 4 — Pós-compra (D+1, D+7, D+30)
- **D+1:** e-mail de obrigado + como começar
- **D+7:** check-in + suporte
- **D+30:** pesquisa de satisfação + oferta de upsell

### Estágio 5 — Reativação (D+60 inativo)
- **Gatilho:** 60d sem abrir e-mail
- **Skill:** `copywriter-persuasivo` (reativação)
- **Tom:** "sentimos sua falta"
- **Oferta:** bônus ou desconto progressivo

## Anti-patterns (evite)

| ❌ Erro comum | ✅ Solução |
|---|---|
| Mandar o mesmo e-mail para todo mundo | Segmentar por estágio |
| Não parar de mandar após compra | Marcar `stage=cliente` |
| 5 e-mails em 3 dias | Regra: **máx 1 canal/dia** |
| Ignorar opt-out | Honrar **IMEDIATAMENTE** |

## 🎯 Exercício

1. Pegue 1 produto seu
2. Desenhe o lifecycle de 5 estágios (use o template acima)
3. Configure o `lifecycle-orchestrator` para disparar
4. Aguarde 30 dias
5. Compare: LTV, recompra 30d, churn

## ⏭️ Próximo passo

👉 [**02 · A/B testing com judge**](02-ab-test-judge.md)

---

**Versão 1.0** · Atualizado 2026-06-02 · Fonte: `backend/src/agentic/skills/lifecycleOrchestrator.ts` + `funnelArchitect.ts`
