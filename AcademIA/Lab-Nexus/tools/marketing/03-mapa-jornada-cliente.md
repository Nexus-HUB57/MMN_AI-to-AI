---
title: "Contexto"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-24
status: official
---

title: "03 · Mapa de Jornada do Cliente"
description: "Customer Journey Map completo com touchpoints, emoções e oportunidades"
tags: [lab-nexus, marketing, jornada, customer-journey, cjm]
category: marketing
level: agente
estimated_time: "40 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: funnel-architect
course_anchor: cursos/master/00-otimizacao-conversao.md
🗺️ 03 · Mapa de Jornada do Cliente (CJM)
Customer Journey Map visual com 5 estágios, touchpoints, emoções, pontos de dor e oportunidades. Aumenta conversão em 25-40%.

🎯 Spec
Atributo	Valor
O que é	Template de CJM em 5 estágios + prompt gerador + exemplos
Quando usar	Antes de criar funil, ao revisar estratégia, ao diagnosticar queda de conversão
Pré-requisitos	Nível 🥈 Agente; persona definida; dados de funil atual
Tempo estimado	40 min para mapear 1 jornada
Skill que executa	funnel-architect
Judge que valida	judge-revisor
📋 Playbook — Estrutura Canônica
Os 5 Estágios
yaml

Copy
consciencia:  # Awareness

  objetivo: "Lead descobre que tem um problema ou oportunidade"

  emocoes: "Confuso, curioso, indiferente"

  touchpoints: ["Anúncios", "SEO", "Indicação", "Redes sociais"]

  perguntas: ["O que é isso?", "Como funciona?", "É pra mim?"]


consideracao:  # Consideration

  objetivo: "Lead busca entender soluções"

  emocoes: "Interessado, cético, comparando"

  touchpoints: ["Blog", "E-mail", "Webinar", "Grupo"]

  perguntas: ["Quanto custa?", "Funciona pra mim?", "Quem usa?"]


decisao:  # Decision

  objetivo: "Lead compara opções específicas"

  emocoes: "Ansioso, animado, avaliando risco"

  touchpoints: ["LP", "VSL", "Demo", "Atendimento"]

  perguntas: ["E se não funcionar?", "Tem garantia?", "Como começo?"]


compra:  # Purchase

  objetivo: "Lead efetua a compra"

  emocoes: "Empolgado, receoso, aliviado"

  touchpoints: ["Checkout", "Confirmação", "Onboarding"]

  perguntas: ["Recebi tudo?", "Como acesso?", "E agora?"]


retencao:  # Retention

  objetivo: "Cliente tem sucesso e permanece"

  emocoes: "Satisfeito, engajado, parte da comunidade"

  touchpoints: ["E-mail", "Comunidade", "Suporte", "Novidades"]

  perguntas: ["Como faço mais?", "Tem nível avançado?", "Posso indicar?"]
📦 Asset (Template Visual)
📊 Formato de Planilha
Estágio	Touchpoint	Ação do Lead	Pensamento	Emoção (1-5)	Dor	Oportunidade
Consciência	Anúncio Facebook	Vê o ad	"Hmm, interessante"	2	Não entende benefício	Copy mais clara
Consideração	Blog post	Lê 3 artigos	"Será que funciona?"	3	Sem prova social	Adicionar cases
Decisão	LP + VSL	Assiste 12 min	"Quanto custa?"	2	Preço sem ancoragem	Mostrar valor primeiro
Compra	Checkout	Abandona	"Vou pensar"	1	Fricção no pagamento	Simplificar checkout
Retenção	Onboarding	Não usa	"Tô perdido"	1	Sem próximo passo claro	Sequência de ativação
📦 Asset (Template de Apresentação)
yaml

Copy
slide_1: "Persona + objetivo da jornada"

slide_2: "Estágio 1 — Consciência (touchpoints + emoções)"

slide_3: "Estágio 2 — Consideração"

slide_4: "Estágio 3 — Decisão"

slide_5: "Estágio 4 — Compra"

slide_6: "Estágio 5 — Retenção"

slide_7: "Mapa emocional (gráfico de linha)"

slide_8: "Top 5 pontos de dor"

slide_9: "Top 5 oportunidades"

slide_10: "Plano de ação 30/60/90"
📦 Asset (Prompt Gerador de CJM)
text

Copy
# Contexto

Você é um estrategista de CX com experiência em SaaS e infoprodutos.


# Objetivo

Criar um Customer Journey Map para o produto {{produto}} e

persona {{persona}}, identificando:

1. 5 estágios (consciência → retenção)

2. Touchpoints em cada estágio

3. Emoções dominantes

4. Top 3 pontos de dor por estágio

5. Top 3 oportunidades por estágio

6. 5 quick wins (ações de 1-2 semanas)


# Estilo

Visual, prescritivo, baseado em dados quando possível.


# Tom

Estratégico, com foco em ROI.


# Público

Time de marketing + produto.


# Formato

Markdown com 5 seções (uma por estágio) + quick wins no final.


# Guardrail

- Mínimo 2 touchpoints por estágio

- SEMPRE ligar emoção a ponto de dor ou oportunidade

- NUNCA inventar dados
📊 Métricas de Sucesso
Métrica	Antes	Depois (meta)
Conversão por estágio	variável	+25%
Drop-off total	variável	-30%
NPS (satisfação)	30	50+
Tempo até 1ª compra	variável	-40%
LTV	variável	+20%
⚠️ Riscos & Anti-patterns

❌ Mapear só a parte de aquisição → ignora retenção (80% do LTV)

❌ Confundir touchpoint com canal → 5 canais ≠ 5 touchpoints

❌ Não envolver o time de suporte → perde a voz do cliente real

❌ CJM virar "obra de arte" no mural → ninguém usa no dia-a-dia

✅ Envolver 3 áreas (marketing, vendas, suporte)

✅ Atualizar trimestralmente com dados reais

✅ Cruzar CJM com funil analytics

🔗 Próximas ferramentas

→ tools/analytics/03-funis-conversao.md — meça cada estágio

→ tools/marketing/04-mapa-persona.md — defina a persona

→ cursos/master/00-otimizacao-conversao.md — funil completo

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus