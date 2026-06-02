---
title: "00 · Seu primeiro agente"
level: agente
duration: 30min
prerequisites: ["fundamental"]
tags: [agentes, baseAgent, marketingAgent, setup, runtime]
last_updated: 2026-06-02
---

# 🤖 00 · Seu primeiro agente

> **Tempo:** 30 min · **Nível:** Agente · **Pré-requisitos:** Nível Fundamental completo

## O que é um agente (no Nexus)

Um agente no Nexus é uma **persona com bundle de skills + autonomia**. Ele é uma entidade de software que:

- Tem **objetivo** (ex: "converter leads em clientes do produto X")
- Tem **skills atribuídas** (ex: copywriter + audience-segmenter)
- Tem **autonomia configurada** (limiares do SHO)
- Tem **identidade visível** no painel (nome, avatar, score)

> Diferente de um script, o agente decide **quais skills usar e em que ordem** com base no contexto.

## Os 2 agentes base do Nexus

A base atual (`backend/src/agentic/agents/`) tem:

| Agente | Função | Bundle padrão |
|---|---|---|
| `marketingAgent.ts` | Operação de marketing ponta a ponta | copywriter, auto-publisher, follow-up, judge |
| `baseAgent.ts` | Classe base para criar novos | (vazio, é a fundação) |

## Anatomia de um agente

```typescript
// Pseudo-código — baseAgent.ts
class Agent {
  id: number;
  name: string;
  goal: string;
  skills: SkillSlug[];     // skills atribuídas
  autonomy: {
    autoApprove: boolean;
    riskLimit: number;     // em R$
    confidenceThreshold: number;  // 0..1
  };
  memory: AgentMemory;     // episodic + semantic
  judge: JudgeClient;      // avaliação secundária
}
```

## Seu primeiro agente: setup

### Passo 1 — Acesse o painel
**Admin Runtime → "Criar Agente"**

### Passo 2 — Preencha
- **Nome:** `Meu Agente de WhatsApp`
- **Objetivo:** `Converter leads do produto X em compradores via WhatsApp`
- **Avatar:** escolha um dos disponíveis

### Passo 3 — Escolha as skills
Para um agente de WhatsApp conservador, comece com:

- ✅ `audience-segmenter` (segmenta antes de disparar)
- ✅ `copywriter-persuasivo` (gera 3 variações de copy)
- ✅ `judge-revisor` (avalia antes de enviar)
- ✅ `auto-publisher` (whatsapp dispatcher)

### Passo 4 — Configure autonomia (SHO)
Para começar, **operação segura**:

```yaml
autoApprove:         true
riskLimit:           R$ 50   # limite de gasto por batch
confidenceThreshold: 0.75
dispatcher:          whatsapp
```

### Passo 5 — Salve e ative
O agente aparece em **Admin Runtime** com o status 🟢 ativo.

## Como rodar o primeiro ciclo

```
1. Vá em "Admin Runtime"
2. Selecione seu agente
3. Clique "Gerar"
4. Escolha audiência: 50 contatos do segmento "lead frio"
5. Clique "Executar"
6. Acompanhe a fila de aprovações em tempo real
7. Aprove ou rejeite cada sugestão do Judge
8. Veja o relatório 1h depois
```

## O que esperar

- **80%** das mensagens serão auto-aprovadas
- **20%** cairão na fila para sua revisão (normal)
- Judge reprova **~5%** (média do sistema)
- Latência média: **1.2s** por mensagem

## 🚨 Troubleshooting

| Sintoma | Causa provável | Solução |
|---|---|---|
| Nada é auto-aprovado | `confidenceThreshold` muito alto | Abaixe para `0.70` |
| Judge reprova tudo | Prompt de copy genérico | Use o template do Lab Nexus |
| Fila lotada | Volume muito alto para 1 agente | Divida em 2 agentes por segmento |
| Latência > 5s | Cache Redis frio | Espere 5 min ou reinicie o dispatcher |

## 🎯 Exercício

Crie **1 agente** com as 4 skills listadas acima e rode **1 ciclo real** com 30 contatos.

Documente:

- **Auto-aprovação:** ___% (meta: > 75%)
- **Judge reprovação:** ___% (meta: < 10%)
- **Latência média:** ___s (meta: < 2s)
- **CTR inicial:** ___% (referência para A/B futuro)

## ⏭️ Próximo passo

👉 [**01 · Skills essenciais**](01-skills-essenciais.md)

---

**Versão 1.0** · Atualizado 2026-06-02 · Fonte: `backend/src/agentic/agents/baseAgent.ts` + `marketingAgent.ts`
