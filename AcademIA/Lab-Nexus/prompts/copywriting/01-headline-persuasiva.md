---
title: "PAPEL"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

title: "Prompt — Headline Persuasiva (5 Variantes)"
description: "Prompt testado para gerar 5 headlines de alta conversão"
tags: [lab-nexus, prompt, copywriting, headline]
category: prompts/copywriting
level: fundamental
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
📣 Prompt — Headline Persuasiva
Prompt canônico para gerar 5 variantes de headline com ganchos psicológicos diferenciados.

🎯 Quando usar

Antes de criar um anúncio (Facebook, Google, LinkedIn)

Ao testar novo ângulo de copy

Em testes A/B de landing pages

Para e-mail subjects

📋 Variáveis de Entrada
yaml

Copy
produto: "Nome do produto/serviço"

publico: "Quem vai ler (persona resumida)"

promessa: "Benefício central em 1 frase"

objecao: "Maior dúvida antes de comprar"

tom: "urgente | inspirador | racional | storytelling"

canal: "facebook_ad | google_ad | email_subject | landing_h1 | youtube_hook"
📦 Prompt Pronto
text

Copy
# PAPEL

Você é um copywriter sênior especializado em headlines de alta conversão,

calibrado em 10.000+ peças para o mercado brasileiro de afiliados digitais.


# OBJETIVO

Gerar EXATAMENTE 5 variantes de headline para o contexto abaixo, cada uma

com um ângulo psicológico diferente.


# INPUTS

Produto: {{produto}}

Público: {{publico}}

Promessa: {{promessa}}

Objeção principal: {{objecao}}

Tom de voz: {{tom}}

Canal: {{canal}}


# ESTRUTURA DAS 5 VARIANTES

1. CURTA (≤ 8 palavras) — impacto imediato, gera curiosidade

2. MÉDIA (10-15 palavras) — promessa + especificidade

3. LONGA (16-25 palavras) — quebra de objeção + prova

4. COM NÚMERO (ex: "7 dias", "R$ 97", "3 passos") — curiosidade quantificada

5. PERGUNTA — engajamento direto, fala a dor do leitor


# REGRAS OBRIGATÓRIAS

- NUNCA use clickbait vazio ("Você não vai acreditar", "Impossível")

- SEMPRE inclua benefício concreto ou prova específica

- EVITE adjetivos vazios ("revolucionário", "incrível", "único")

- MÁXIMO 1 exclamação por headline

- LGPD-safe: nada de promessas absolutas ("cura", "100% garantido")

- Limite de caracteres: 60 para Ads, 100 para LP, 50 para e-mail subject


# FORMATO DE SAÍDA

Markdown com tabela:


| # | Variante | Gancho Psicológico | Nota CTR (0-10) | Uso Recomendado |

|---|----------|-------------------|-----------------|-----------------|

| 1 | {{headline}} | {{gancho}} | {{nota}} | {{quando usar}} |

| 2 | ... | ... | ... | ... |

| 3 | ... | ... | ... | ... |

| 4 | ... | ... | ... | ... |

| 5 | ... | ... | ... | ... |


# GUARDRAIL FINAL

- Se nenhuma variante atingiu nota ≥ 6, sugira ajuste nos inputs

- Indique a melhor variante (top 1) com justificativa
💡 Exemplo de Saída
Input:

text

Copy
Produto: Curso "Funil Lucrativo"

Público: Afiliada digital, 30 anos, fatura R$ 10k

Promessa: Escalar para R$ 50k/mês em 90 dias

Objeção: "Não tenho tempo"

Tom: Inspirador

Canal: facebook_ad
Output esperado:

#	Variante	Gancho	CTR	Uso
1	Escale seu affiliate em 90 dias	Autoridade + tempo	7	Frio + lead magnet
2	De R$ 10k para R$ 50k em 90 dias (sem trabalhar 14h)	Prova + quebra de objeção	8	Morno + LP direta
3	12 alunas já passaram de R$ 50k/mês com esse método	Prova social + número	7.5	Lead qualificado
4	3 passos para dobrar seu faturamento em 90 dias	Curiosidade + número	6.5	Primeira interação
5	Você também pode ter 6h/dia de trabalho?	Pergunta + desejo	7	Reengajamento
Recomendação: Variante 2 (maior CTR esperado, quebra objeção + prova).

📊 Métricas de Sucesso
Métrica	Meta
CTR Facebook/Google	≥ 1.5%
Open rate e-mail	≥ 25%
LP conversion	≥ 3%
Judge score	≥ 0.75
⚠️ Erros Comuns

❌ Headline genérica ("Transforme sua vida")

❌ Sem benefício claro

❌ Clickbait sem entrega

❌ Adjetivo sem prova ("melhor", "único")

🔗 Próximos Prompts

→ 02-subject-email.md — use a headline como subject

→ 03-cta-persuasivo.md — finalize com CTA

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus