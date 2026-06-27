---
title: "PAPEL"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

title: "Prompt — Planejamento de Lançamento"
description: "Criar plano completo de lançamento (7-30 dias) com timeline e assets"
tags: [lab-nexus, prompt, estrategia, lancamento, planejamento]
category: prompts/estrategia
level: master
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
🚀 Prompt — Planejamento de Lançamento
Cria plano detalhado de lançamento de 7-30 dias com timeline, assets, equipe e métricas.

🎯 Quando usar

Lançamento de novo produto/infoproduto

Re-lançamento com melhorias

Lançamento perpétuo (evergreen)

Pré-lançamento com lista de espera

📋 Variáveis de Entrada
yaml

Copy
produto: "Nome do produto"

data_lancamento: "DD/MM/AAAA"

tipo: "lancamento | relancamento | perpetuo | pre-lancamento"

duracao_dias: "7 | 14 | 21 | 30 | 60"

equipe_disponivel: "time | capacidade (horas/semana por área)"

orcamento_ads: "R$ X (opcional)"

meta_receita: "R$ Y (opcional)"

publico: "frio | morno | quente | misto"
📦 Prompt Pronto
text

Copy
# PAPEL

Você é um estrategista de lançamentos com 50+ produtos lançados,

especialista em pré-lançamento, lançamento interno e perpétuo.


# OBJETIVO

Criar plano completo de lançamento com:

1. Timeline detalhada (dia a dia)

2. Assets necessários (copy, criativo, e-mail, página)

3. Equipe e responsabilidades

4. Orçamento por canal

5. Métricas-alvo por fase

6. Plano de contingência

7. Cronograma de comunicação


# INPUTS

Produto: {{produto}}

Data de lançamento: {{data_lancamento}}

Tipo: {{tipo}}

Duração: {{duracao_dias}} dias

Equipe disponível: {{equipe_disponivel}}

Orçamento de ads: {{orcamento_ads}}

Meta de receita: {{meta_receita}}

Público: {{publico}}


# ESTRUTURA DO PLANO


## 1. Visão Geral

- Resumo executivo (3 parágrafos)

- Premissas e riscos

- KPIs principais (5-7)


## 2. Timeline Dia-a-Dia

Para cada dia:

- Ação principal

- Canal

- Owner (papel)

- Asset necessário

- Métrica-alvo


## 3. Fases do Lançamento

Detalhe de cada fase:

- Pré-lançamento (construção de lista)

- Aquecimento (gera curiosidade)

- Abertura (vendas abertas)

- Escalar (aumentar conversão)

- Fechamento (urgência + escassez)


## 4. Assets Necessários

Lista completa com:

- Tipo (LP, e-mail, criativo, VSL, etc.)

- Quantidade

- Prazo de produção

- Responsável

- Status (template, brief, finalizado)


## 5. Orçamento Detalhado

- Ads por canal (Meta, Google, YouTube, TikTok)

- Ferramentas (e-mail, hospedagem, etc.)

- Equipe (freelancers, VA, designers)

- Imprevistos (10% do total)


## 6. Plano de Conteúdo

Calendário editorial:

- Redes sociais (posts, stories, reels)

- E-mail (sequência)

- Lives/webinars

- Parcerias


## 7. Equipe e Responsabilidades

RACI por atividade:

- R (Responsible) — quem faz

- A (Accountable) — quem responde

- C (Consulted) — quem orienta

- I (Informed) — quem precisa saber


## 8. Métricas-Alvo

Por fase:

- Leads gerados

- CPL (custo por lead)

- Show-up rate

- Conversão por etapa

- Receita acumulada

- ROAS


## 9. Plano de Contingência

3 cenários:

- Pessimista (50% da meta)

- Base (100% da meta)

- Otimista (150% da meta)

- Ações corretivas para cada cenário


## 10. Cronograma de Comunicação

- Daily standup (5-15 min)

- Weekly review (1h)

- QBR (1h, mensal)

- Post-mortem (2h, após fechamento)


# REGRAS

- SEMPRE considerar LGPD (consent, opt-out)

- SEMPRE respeitar regras Meta/Google (política de ads)

- SEMPRE ter plano de contingência

- Indicar dependências críticas (o que bloqueia o quê)

- Se orçamento for apertado, sugerir alternativas orgânicas


# FORMATO

Markdown estruturado, com tabelas e listas.

Use emojis para indicar status: ✅ Feito | 🟡 Em andamento | 🔴 Pendente | ⚠️ Risco


# GUARDRAIL

- Se produto tem menos de 30 leads, alertar

- Se data de lançamento é < 14 dias, alertar sobre timing apertado

- Se orçamento é zero, sugerir estratégia orgânica
💡 Exemplo de Saída
Input:

text

Copy
Produto: Curso "Funil Lucrativo 2.0"

Data: 15/07/2026

Tipo: Lançamento interno

Duração: 14 dias

Equipe: 1 copywriter, 1 designer, 1 dev, 1 gestor de tráfego

Orçamento: R$ 30k em ads

Meta: R$ 200k de receita

Público: Morno (lista 5.000)
Output esperado (resumido):

1. Visão Geral

Lançamento interno (para lista existente) com 14 dias de execução

Estratégia: aquecimento (D-7 a D-1) + abertura (D+1 a D+5) + carrinho aberto (D+6 a D+10) + fechamento (D+11 a D+14)

KPI principal: R$ 200k em 14 dias (R$ 14,3k/dia)

Risco: baixa show-up (50%) se lista esfriou

2. Timeline (D-30 a D+14)
Pré-Lançamento (D-30 a D-7)
Dia	Ação	Canal	Owner	Asset
D-30	Briefing completo	interno	Gestor	doc
D-25	Gravação VSL	studio	Copywriter	vídeo 18min
D-20	LP finalizada	Hotmart	Dev	URL
D-15	E-mails escritos (sequência 7)	RD	Copywriter	7 e-mails
D-10	Criativos Meta (3 variantes)	FB	Designer	3 PNGs
D-7	Aquecimento lista	E-mail	Copywriter	2 e-mails teaser
Abertura (D+1 a D+5)
Dia	Ação	Canal	Owner
D+1	E-mail abertura	lista	Copywriter
D+1	Ligar ads	Meta+Google	Gestor
D+3	E-mail quebra de objeção	lista	Copywriter
D+5	Primeiro webinar	Zoom	Closer
Carrinho Aberto (D+6 a D+10)
Dia	Ação	Canal	Owner
D+6	E-mail cases	lista	Copywriter
D+8	E-mail FAQ	lista	Copywriter
D+10	E-mail "decida hoje"	lista	Copywriter
Fechamento (D+11 a D+14)
Dia	Ação	Canal	Owner
D+11	E-mail urgência 24h	lista	Copywriter
D+13	E-mail "última chance"	lista	Copywriter
D+14 21h	E-mail "fechou"	lista	Copywriter
3. Orçamento (R$ 30k)
Item	Valor
Meta Ads (2 semanas)	R$ 18k
Google Ads	R$ 6k
Ferramentas (RD, Hotmart)	R$ 2k
Designer freelancer	R$ 2k
Imprevistos (10%)	R$ 2k
Total	R$ 30k
4. Métricas-Alvo
Fase	Métrica	Target
Aquecimento	Open rate e-mail	≥ 40%
Abertura	CPL	≤ R$ 15
Carrinho	Conversão checkout	≥ 25%
Fechamento	ROAS	≥ 5x
Geral	Receita	R$ 200k
5. Plano de Contingência
Cenário Pessimista (-50%):


Ação: aumentar budget em carrinho aberto

Adicionar parcerias (afiliados)

Dia extra de venda

Cenário Otimista (+50%):


Aumentar budget ads no dia

Adicionar live extra

Carrinho estendido se houver demanda

📊 Métricas de Sucesso
Métrica	Meta
Receita atingida	≥ 100% da meta
ROAS	≥ 5x
CPL	≤ meta
Conversão global	≥ 1%
NPS pós-compra	≥ 50
LTV/CAC	≥ 3
⚠️ Erros Comuns

❌ Lançar sem aquecimento (lista fria não compra)

❌ Sem teste de checkout (vazamento na hora H)

❌ Budget subdimensionado

❌ Sem plano de contingência

❌ Equipe sem clareza de papéis

🔗 Próximos Prompts

→ 02-posicionamento-mercado.md — defina o ângulo

→ 03-benchmark-concorrencia.md — analise o mercado

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus