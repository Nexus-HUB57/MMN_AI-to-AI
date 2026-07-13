---
title: "Prompt — Objection Handler (6 Objeções Canônicas)"
description: "Prompt para responder às 6 objeções mais comuns de leads em copywriting de alta conversão"
tags: [lab-nexus, prompt, copywriting, objecoes, handler]
category: prompts/copywriting
level: intermediario
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-28"
---

# 🛡️ Prompt — Objection Handler (6 Objeções Canônicas)

Prompt para responder, **uma a uma**, às **6 objeções canônicas** que aparecem em 95% das vendas online. Cada resposta combina **lógica racional + prova social + quebra emocional**.

## 🎯 Quando usar

- Seção "FAQ" ou "Tira-dúvidas" de LP.
- Objeções em e-mail follow-up.
- Resposta a comentários em ads.
- Conteúdo de carrossel educativo.
- Webinar, antes da oferta.

## 🛡️ As 6 Objeções Canônicas

1. **"É caro"** — objeção de **preço**.
2. **"Não tenho tempo"** — objeção de **esforço**.
3. **"Não funciona pra mim"** — objeção de **especificidade**.
4. **"Vou pensar"** — objeção de **postergação**.
5. **"Já tentei de tudo"** — objeção de **desesperança**.
6. **"Confio, mas não agora"** — objeção de **timing**.

## 📋 Variáveis de Entrada

```yaml
produto: "Nome do produto"
valor: "R$ X"
publico: "Persona"
promessa: "Benefício principal"
casos_reais: "Cases com nome, número e transformação"
garantia: "Tipo de garantia oferecida"
tom: "consultivo | direto | empático | provocador"
canal: "lp | email | ads | webinar"
```

## 📦 Prompt Pronto

```text
# PAPEL
Você é especialista em vendas consultivas, treinado em突破 objeções com
framework "Acknowledge → Reframe → Proof → Invite".

# OBJETIVO
Para cada uma das 6 objeções, gerar resposta de 80-120 palavras
com estrutura: A → R → P → I.

# INPUTS
Produto: {{produto}}
Valor: {{valor}}
Público: {{publico}}
Promessa: {{promessa}}
Cases reais: {{casos_reais}}
Garantia: {{garantia}}
Tom: {{tom}}
Canal: {{canal}}

# ESTRUTURA POR OBJEÇÃO
A — Acknowledge: valide a objeção ("Justo. Faz sentido.")
R — Reframe: mude o ângulo ("Mas pense no custo de não resolver.")
P — Proof: traga prova concreta (case + número)
I — Invite: leve ao próximo passo (CTA suave)

# REGRAS OBRIGATÓRIAS
- Tom: nunca defensivo. Sempre curioso.
- Zero desconto agressivo (a objeção de preço raramente é sobre preço)
- Prova SEMPRE específica (nome, número, contexto)
- LGPD-safe
- Resposta entre 80-120 palavras por objeção
- Sempre termine com convite, não com pressão

# FORMATO DE SAÍDA
Markdown, uma seção por objeção com header "## Objeção X — Y"
```

## 💡 Exemplo (Objeção 1 — "É caro")

**Input:**
```
Produto: Curso "Funil Lucrativo"
Valor: R$ 1.997
Público: afiliada iniciante
Promessa: Escalar para R$ 20k/mês
Cases: 12 alunas acima de R$ 30k/mês em 6 meses
Garantia: 15 dias
Tom: empático
Canal: lp
```

**Output:**

```markdown
## Objeção 1 — "É caro"

"Eu entendo. R$ 1.997 não é pouco — é o que muita gente gasta num celular
que troca a cada 2 anos.

Mas me responde: quanto você já gastou em cursos que não deram resultado?
Quanto tempo perdeu testando sozinha? Quanto dinheiro deixou de ganhar
nos últimos 6 meses por estar parada?

A Maria gastou R$ 4.800 em 4 cursos diferentes antes de entrar no Funil
Lucrativo. Em 90 dias, ela recuperou o investimento dos 4 cursos anteriores
e ainda sobrou. Hoje fatura R$ 32 mil por mês.

E você tem 15 dias de garantia. Se não gostar, devolvemos seu dinheiro.
Sem perguntas. Sem burocracia.

A pergunta não é se R$ 1.997 é caro. É se ficar parada é mais barato."
```

## 📊 Métricas de Sucesso

| Métrica | Target |
|---------|--------|
| Redução de drop-off LP | >30% |
| Aumento de conversion | >15% |
| Engajamento em ads (comentários) | +50% |
| Judge score | >0.80 |

## ⚠️ Erros Comuns

- ❌ Defender preço ("mas é barato!")
- ❌ Oferecer desconto (queima margem, atrai comprador errado)
- ❌ Resposta genérica ("confie no processo")
- ❌ CTA agressivo ("Compre agora senão perde!")
- ❌ Não validar a objeção (pular direto para refutação)

## 🔗 Próximos Prompts

- → `04-sequence-boas-vindas.md` — para usar essas respostas em sequência
- → `05-storytelling-virada.md` — para casos onde objeção é emoção

---

*Versão 1.0 · Atualizado 2026-06-28 · Mantido pela Equipe Nexus*