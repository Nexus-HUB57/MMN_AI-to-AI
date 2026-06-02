title: "01 · Headline Persuasiva"
description: "Geração de headlines de alta conversão para anúncios, e-mails e landing pages"
tags: [lab-nexus, copy, headline, conversao]
category: copy
level: fundamental
estimated_time: "10 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: copywriter-persuasivo
course_anchor: cursos/fundamental/03-painel-afiliado.md
📣 01 · Headline Persuasiva
Gere headlines de alta conversão em 30 segundos, calibradas pelo SHO e validadas pelo Judge Revisor.

🎯 Spec
Atributo	Valor
O que é	Ferramenta para gerar 5 variantes de headline persuasiva (curta, média, longa, número, pergunta)
Quando usar	Antes de criar um anúncio, e-mail, landing page ou post
Pré-requisitos	Nível 🥉 Fundamental; conhecer o público-alvo
Tempo estimado	10 min
Skill que executa	copywriter-persuasivo
Judge que valida	judge-revisor
📋 Playbook
Passo 1 — Coletar inputs mínimos
Antes de chamar o prompt, você precisa de:

yaml

Copy
produto: "<nome do produto ou oferta>"

publico: "<quem vai ler, com dor específica>"

promessa_principal: "<1 frase do benefício central>"

objecao_principal: "<maior dúvida antes de comprar>"

tom_de_voz: "urgente | inspirador | racional | storytelling"

canal: "facebook_ad | google_ad | email_subject | landing_h1 | youtube_hook"
Passo 2 — Executar o prompt
Cole o bloco abaixo no chat do agente ou na skill copywriter-persuasivo.

Passo 3 — Escolher e testar
1.
Selecione 1 das 5 variantes
2.
Submeta ao Judge Revisor (auto-aprovado para Fundamental)
3.
Faça A/B test com 2 variantes (veja tools/analytics/01-experimento-ab.md)
📦 Asset (Prompt Pronto)
text

Copy
# PAPEL

Você é um copywriter sênior especializado em headlines de alta conversão,

calibrado em 10.000+ peças para o mercado brasileiro de afiliados digitais.


# INPUTS

Produto: {{produto}}

Público: {{publico}}

Promessa: {{promessa_principal}}

Objeção: {{objecao_principal}}

Tom: {{tom_de_voz}}

Canal: {{canal}}


# TAREFA

Gere EXATAMENTE 5 variantes de headline, cada uma com um ângulo diferente:


1. CURTA (até 8 palavras) — impacto imediato

2. MÉDIA (10-15 palavras) — promessa + especificidade

3. LONGA (16-25 palavras) — quebra de objeção + prova

4. COM NÚMERO (ex: "7 dias", "R$ 97", "3 passos") — curiosidade

5. PERGUNTA — engajamento direto


Para cada variante, forneça:

- A headline

- O gancho psicológico usado (curiosidade / escassez / prova / medo / pertencimento)

- Uma nota de 0-10 sobre provável CTR


# REGRAS

- NUNCA use clickbait vazio ("Você não vai acreditar")

- SEMPRE inclua benefício concreto ou prova

- EVITE adjetivos vazios ("revolucionário", "incrível", "único")

- MÁXIMO 1 exclamação por headline

- LGPD-safe: nada de promessas absolutas ("cura", "garantido em 100%")


# OUTPUT

Markdown com tabela contendo as 5 variantes + metadados.
📊 Métricas de Sucesso
Métrica	Meta
CTR (Facebook/Google)	≥ 1.5%
Open rate (e-mail)	≥ 25%
Tempo médio na LP	≥ 45s
Judge score	≥ 0.75
⚠️ Riscos & Anti-patterns

❌ Clickbait vazio → Judge reprova + Meta penaliza

❌ Adjetivo sem prova ("melhor do Brasil") → desconfiança

❌ Promessa absoluta ("100% garantido") → CONAR + LGPD

✅ Headline específica com número + benefício claro

✅ Headline que quebra objeção ("Sem precisar cartão")

🔗 Próximas ferramentas

→ 02-email-frio.md — use esta headline como subject

→ tools/analytics/01-experimento-ab.md — teste 2 variantes

→ tools/design/03-thumb-youtube.md — adapte para thumbnail

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus