---
title: "Contexto"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-24
status: official
---

title: "01 · Planejador Editorial"
description: "Calendário editorial mensal para redes sociais e blog"
tags: [lab-nexus, marketing, editorial, calendario, planejamento]
category: marketing
level: fundamental
estimated_time: "20 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: auto-publisher
course_anchor: cursos/fundamental/03-painel-afiliado.md
📅 01 · Planejador Editorial
Calendário editorial mensal com 4 pilares de conteúdo + IA geradora de pauta. Reduz tempo de planejamento em 70%.

🎯 Spec
Atributo	Valor
O que é	Planilha/calendário mensal + prompt para gerar 30 dias de pauta
Quando usar	Todo início de mês, para o mês seguinte
Pré-requisitos	Nível 🥉 Fundamental; persona definida; objetivos de marketing
Tempo estimado	20 min para gerar 1 mês de pauta
Skill que executa	auto-publisher
Judge que valida	judge-revisor
📋 Playbook — Os 4 Pilares de Conteúdo
Distribuição recomendada (regra 4-3-2-1)
Pilar	%	Função
🎓 Educar	40%	Mostrar expertise, ajudar
💬 Inspirar	30%	Histórias, bastidores, depoimentos
🛒 Vender	20%	Ofertas, cases, comparação
🔥 Engajar	10%	Enquetes, trends, memes
📦 Asset (Template Mensal + Prompt)
📊 Planilha Modelo (CSV/Sheets)
csv

Copy
Data,Hora,Canal,Pilar,Tipo,Tema,Copy,CTA,Hashtags,Status

01/07,19h,IG,Educar,Carrossel,"5 erros de funil","...",Salvar,#funil,Rascunho

03/07,12h,IG,Inspirar,Story,"Bastidores do lançamento","...",Resposta,...

05/07,19h,IG,Vender,Reels,"Como usar o {{produto}}","...",Link bio,...

08/07,20h,YT,Educar,Vídeo,"Tutorial completo","...",Inscrição,...

10/07,8h,Blog,Educar,Artigo,"SEO: como aparecer no Google","...",Comentário,...

12/07,19h,IG,Engajar,Enquete,"Qual sua maior dor?","...",Voto,...

...
🤖 Prompt Gerador de Pauta Mensal
text

Copy
# Contexto

Você é um estrategista de conteúdo com 10 anos de experiência.


# Objetivo

Gerar um calendário editorial de 30 dias (4 posts/semana = 16 posts)

para o nicho {{nicho}} e persona {{persona}}.


# Estilo

Variado: educativo, inspiracional, vendas, engajamento.


# Tom

Autêntico, com sua voz. Evite corporativo demais.


# Público

{{persona}} - {{dor_principal}}.


# Formato

Tabela markdown com colunas:

- Data (1-30)

- Dia da semana

- Canal (Instagram, YouTube, Blog, LinkedIn, TikTok)

- Pilar (Educar/Inspirar/Vender/Engajar)

- Tipo (Reels, Carrossel, Story, Post estático, Artigo, Vídeo longo)

- Tema (1 frase)

- Gancho (1ª linha)

- CTA (1 ação)


# Guardrail

- Distribuição 4-3-2-1 (40% educa, 30% inspira, 20% vende, 10% engaja)

- Mínimo 1 conteúdo por pilar por semana

- NUNCA prometa resultado absoluto

- Respeitar LGPD nos exemplos
📊 Métricas de Sucesso
KPI	Meta
Frequência	4-5 posts/semana (rede principal)
Alcance orgânico	Crescimento ≥ 10% ao mês
Engajamento médio	≥ 3% (likes + comments + saves)
Leads via conteúdo	≥ 5% da audiência engajada
Conversão conteúdo → venda	≥ 1%
⚠️ Riscos & Anti-patterns

❌ Postar sem calendário (improviso) → conteúdo sem linha editorial

❌ Só vender (80% vendas) → audiência ignora

❌ Copiar calendário de concorrente → sem diferenciação

❌ Não medir resultado → repete o que não funciona

✅ Calçar sapatos da persona (resolver o que ela precisa)

✅ Reaproveitar 1 ideia em 3 formatos (carrossel → reels → story)

✅ Revisar performance a cada 30 dias

🔗 Próximas ferramentas

→ tools/analytics/01-experimento-ab.md — teste temas

→ tools/design/01-briefing-criativo.md — peça o visual

→ tools/automation/02-triggers-eventos.md — agende

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus