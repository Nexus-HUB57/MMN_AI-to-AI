---
title: "Prompt — CTA Persuasivo (8 Variantes)"
description: "Prompt testado para gerar CTAs de alta conversão em 8 ângulos"
tags: [lab-nexus, prompt, copywriting, cta, call-to-action]
category: prompts/copywriting
level: fundamental
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-28"
---

# 🎯 Prompt — CTA Persuasivo

Prompt canônico para gerar **8 variantes de Call-to-Action** com ângulos psicológicos diferenciados. CTA é onde **60% da conversão** se decide — ter opções testáveis é fundamental.

## 🎯 Quando usar

- Ao finalizar copy de landing page.
- Em botões de e-mail ou WhatsApp.
- Em cards de produto.
- Em pop-ups e exit-intent.
- Em qualquer elemento conversor.

## 📋 Variáveis de Entrada

```yaml
acao: "Ver preço | Comprar | Inscrever | Baixar | Agendar | Saber mais"
beneficio: "O que o usuário ganha ao clicar"
urgencia: "baixa | média | alta"
tom: "direto | aspiracional | urgente | curioso"
canal: "landing_button | email_button | whatsapp_responder | popup"
```

## 📦 Prompt Pronto

```text
# PAPEL
Você é copywriter especializado em CTAs que convertem 2-4x acima da média,
calibrado em 100.000+ botões testados.

# OBJETIVO
Gerar EXATAMENTE 8 variantes de CTA, uma para cada ângulo psicológico
abaixo, todas mantendo LGPD-compliance.

# INPUTS
Ação: {{acao}}
Benefício: {{beneficio}}
Urgência: {{urgencia}}
Tom: {{tom}}
Canal: {{canal}}

# ÂNGULOS (um CTA por linha)
1. AÇÃO DIRETA — verbo de ação no imperativo
2. BENEFÍCIO EXPLÍCITO — o que o usuário ganha
3. URGÊNCIA — escassez de tempo
4. CURIOSIDADE — pergunta ou teaser
5. PROVA SOCIAL — "outros estão fazendo"
6. BAIXO RISCO — garantia ou teste gratuito
7. EXCLUSIVIDADE — "apenas para X"
8. URGÊNCIA + AÇÃO — combinação

# REGRAS OBRIGATÓRIAS
- Máximo 5 palavras por CTA
- Verbo sempre presente (exceto #4 e #8)
- Zero clickbait
- Zero promessa absoluta
- Tom consistente com o canal
- LGPD-safe

# FORMATO DE SAÍDA
Markdown com tabela:

| # | CTA | Ângulo | Uso recomendado |
|---|-----|--------|-----------------|
| 1 | {{cta}} | ação direta | LP principal |
| 2 | {{cta}} | benefício | LP explicação |
| ... | ... | ... | ... |

# GUARDRAIL
- Avalie cada CTA segundo: clareza (0-10), urgência (0-10), confiança (0-10).
- Marque o **top 1** por soma.
- Sugira ajuste se nenhuma atingir ≥ 24/30.
```

## 💡 Exemplo de Saída

**Input:**
```
Ação: Comprar
Benefício: Curso completo de funis
Urgência: alta
Tom: urgente
Canal: landing_button
```

**Output:**

| # | CTA | Ângulo | Uso recomendado |
|---|-----|--------|-----------------|
| 1 | **Comprar Agora** | ação direta | LP principal |
| 2 | **Quero o Curso Completo** | benefício | LP explicação |
| 3 | **Últimas Vagas — Comprar** | urgência | LP tráfego quente |
| 4 | **Como Funciona?** | curiosidade | LP fria / lead |
| 5 | **500+ Alunos Já Compraram** | prova social | LP tráfego frio |
| 6 | **Garantia de 7 Dias — Comprar** | baixo risco | pós-objeção |
| 7 | **Vagas Abertas — Reservar** | exclusividade | LP B2B |
| 8 | **Última Chance — Comprar** | urgência + ação | LP remarketing |

**Recomendação:** CTA **#6** — combina urgência com baixo risco; maior conversão esperada em tráfego frio/objetado.

## 📊 Métricas de Sucesso

| Métrica | Meta |
|---------|------|
| CTR (botão) | ≥ 8% |
| Conversão LP | ≥ 3% |
| CTR e-mail button | ≥ 5% |
| Judge score | ≥ 0.80 |

## ⚠️ Erros Comuns

- ❌ CTA genérico ("Saiba mais")
- ❌ CTA longo (mais de 5 palavras)
- ❌ Sem urgência quando relevante
- ❌ Tom inconsistente com canal

## 🔗 Próximos Prompts

- → `04-sequence-boas-vindas.md` — sequência D+1, D+3, D+7
- → `05-storytelling-virada.md` — narrativa de quebra de objeção

---

*Versão 1.0 · Atualizado 2026-06-28 · Mantido pela Equipe Nexus*
