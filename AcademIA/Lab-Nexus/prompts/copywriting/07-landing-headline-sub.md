---
title: "Prompt — Landing Page Completa (H1 + Sub + CTA)"
description: "Prompt para gerar a estrutura completa de uma landing page de alta conversão"
tags: [lab-nexus, prompt, copywriting, landing-page, lp]
category: prompts/copywriting
level: avancado
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-28"
---

# 🎯 Prompt — Landing Page Completa

Prompt canônico para gerar **a estrutura completa de uma LP de alta conversão** em 7 seções — da H1 ao rodapé LGPD. Usado em +500 LPs testadas em 2025-2026.

## 🎯 Quando usar

- Lançamento de produto digital.
- LP de captura (lead magnet).
- LP de vendas diretas.
- LP de evento (webinar, live).
- LP white-label para parceiros.

## 📋 Variáveis de Entrada

```yaml
produto: "Nome do produto"
publico: "Persona detalhada"
promessa: "Benefício central"
prova_social: "Cases, números, depoimentos"
objecoes_principais: "Top 3 dúvidas"
preco: "R$ X"
garantia: "Tipo + dias"
tom: "premium | popular | técnico | inspirador"
canal_trafego: "facebook_ads | google_ads | organico | email"
```

## 📦 Prompt Pronto

```text
# PAPEL
Você é copywriter sênior de LP, com benchmark em 500+ páginas de alta
conversão (top 5% do mercado). Use frameworks: StoryBrand, Cialdini,
Andre Schulz, e patterns específicos do mercado brasileiro.

# OBJETIVO
Gerar LP completa em 7 seções, pronta para implementação.

# INPUTS
Produto: {{produto}}
Público: {{publico}}
Promessa: {{promessa}}
Prova social: {{prova_social}}
Objeções: {{objecoes_principais}}
Preço: {{preco}}
Garantia: {{garantia}}
Tom: {{tom}}
Tráfego: {{canal_trafego}}

# ESTRUTURA — 7 SEÇÕES

## SEÇÃO 1 — HERO (acima da dobra)
- H1: promessa principal (≤ 12 palavras, com gancho)
- Sub-headline: especificidade + benefício (≤ 25 palavras)
- CTA primário: botão grande + texto curto
- CTA secundário: link "saiba mais" (opcional)
- Prova visual: número destacado ou logo de clientes

## SEÇÃO 2 — DOR (identificação)
- 3 bullets de dor do público (específicos, não genéricos)
- Termine com a frase que captura a frustração

## SEÇÃO 3 — SOLUÇÃO (introdução do produto)
- Nome do produto em destaque
- 3-5 benefícios concretos (não features)
- Como funciona (3 passos simples)

## SEÇÃO 4 — PROVA SOCIAL
- 3-5 cases com nome, número, contexto
- Depoimentos curtos (2-3 frases cada)
- Logos de clientes/parceiros
- Números agregados (X alunos, R$ Y gerado)

## SEÇÃO 5 — QUEBRA DE OBJEÇÕES
- Resposta às 3 objeções principais (vide 06-objection-handler.md)

## SEÇÃO 6 — OFERTA
- Preço destacado
- O que está incluso (bullets)
- Bônus (se houver)
- Garantia destacada
- CTA principal (repetido)
- Escassez/urgência (se real)

## SEÇÃO 7 — GARANTIA + FAQ + RODAPÉ
- Garantia explicada (15/30/60 dias)
- FAQ (5-7 perguntas)
- Rodapé LGPD com link de descadastro

# REGRAS OBRIGATÓRIAS
- Tom consistente com o tráfego (ads precisam de copy mais direta)
- LGPD-safe em todo lugar
- Sem promessas absolutas
- Provas SEMPRE específicas (nome + número + contexto)
- Mobile-first (50% do tráfego é mobile)
- Tempo de leitura total: 5-7min
- Score Judge ≥ 0.80

# FORMATO DE SAÍDA
Markdown estruturado por seção, com cada bloco pronto para HTML.
```

## 💡 Esqueleto de Saída

```markdown
# SEÇÃO 1 — HERO

## H1
[Promessa curta com gancho]

## Sub-headline
[Especificidade + benefício]

## CTA Principal
**[Botão Grande]**

## CTA Secundário (opcional)
[Link pequeno]

## Prova Visual
[Número ou logos]

---

# SEÇÃO 2 — DOR

Você está:
- [bullet de dor 1]
- [bullet de dor 2]
- [bullet de dor 3]

[Frase de frustração]

[CTA repetir]

---

# SEÇÃO 3 — SOLUÇÃO
...
```

## 📊 Métricas Esperadas

| Tipo LP | Conversão esperada |
|---------|-------------------|
| LP de venda (calor) | 5-12% |
| LP de captura | 25-45% |
| LP de webinar | 35-50% registro |

## ⚠️ Erros Comuns

- ❌ H1 genérica ("Transforme sua vida")
- ❌ Dor muito longa (>3 bullets)
- ❌ Solução sem clareza
- ❌ Prova social vaga ("muitos clientes")
- ❌ Oferta sem escassez real (urgência falsa converte 1x, depois queima)
- ❌ FAQ genérico ("Como funciona?" sem detalhe)

## 🔗 Próximos Prompts

- → `01-headline-persuasiva.md` — para testar 5 H1 diferentes
- → `06-objection-handler.md` — para a seção 5
- → `03-cta-persuasivo.md` — para testar 8 CTAs

---

*Versão 1.0 · Atualizado 2026-06-28 · Mantido pela Equipe Nexus*