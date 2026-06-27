---
title: "Exemplo"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-24
status: official
---

title: "03 · Funis de Conversão (Funnel Analysis)"
description: "Análise completa de funil: identificar drop-off, gargalos e oportunidades"
tags: [lab-nexus, analytics, funil, drop-off, gargalo]
category: analytics
level: agente
estimated_time: "25 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: funnel-architect
course_anchor: cursos/master/00-otimizacao-conversao.md
🔻 03 · Análise de Funis de Conversão
Framework para mapear funil completo, calcular taxas por estágio, identificar drop-off e priorizar otimizações.

🎯 Spec
Atributo	Valor
O que é	Framework de análise + query SQL + dashboard modelo
Quando usar	Mensalmente, ao diagnosticar queda, antes de otimizar
Pré-requisitos	Nível 🥈 Agente; eventos tracked; dados históricos
Tempo estimado	25 min para gerar relatório
Skill que executa	funnel-architect
Judge que valida	judge-revisor
📋 Playbook — Os 5 Estágios Canônicos
Funil de Marketing Digital (Genérico)
yaml

Copy
estagio_1_visitante:

  definicao: "Pessoa acessou qualquer página tracked"

  evento: "page_view"

  meta: "100%"


estagio_2_lead:

  definicao: "Pessoa deixou contato (opt-in)"

  evento: "form_submit ou lead_capture"

  meta_para_1: "15-30% (morno 35-50%)"


estagio_3_mql:

  definicao: "Lead qualificado (engajou, abriu e-mail, etc.)"

  evento: "email_open_3x ou page_view_pricing"

  meta_para_2: "30-50%"


estagio_4_oportunidade:

  definicao: "Demonstrou intenção de compra (demo, checkout, call)"

  evento: "checkout_start ou demo_request"

  meta_para_3: "20-40%"


estagio_5_cliente:

  definicao: "Efetuou pagamento"

  evento: "purchase"

  meta_para_4: "20-50% (depende do ticket)"
📦 Asset (Query SQL de Funil Completo)
📊 Query 1 — Funil Agregado (Últimos 30 dias)
sql

Copy
WITH events AS (

  SELECT

    user_id,

    MAX(CASE WHEN event = 'page_view' THEN 1 ELSE 0 END) AS s1_visit,

    MAX(CASE WHEN event = 'form_submit' THEN 1 ELSE 0 END) AS s2_lead,

    MAX(CASE WHEN event = 'email_open_3x' THEN 1 ELSE 0 END) AS s3_mql,

    MAX(CASE WHEN event = 'checkout_start' THEN 1 ELSE 0 END) AS s4_opp,

    MAX(CASE WHEN event = 'purchase' THEN 1 ELSE 0 END) AS s5_client

  FROM events_log

  WHERE event_date >= CURRENT_DATE - INTERVAL '30 days'

  GROUP BY user_id

),

funnel AS (

  SELECT

    SUM(s1_visit) AS visitantes,

    SUM(s2_lead) AS leads,

    SUM(s3_mql) AS mqls,

    SUM(s4_opp) AS oportunidades,

    SUM(s5_client) AS clientes

  FROM events

)

SELECT

  'Visitantes' AS estagio, 1 AS ordem, visitantes AS quantidade,

  1.0 AS conversao_acumulada,

  NULL AS conversao_estagio

UNION ALL

SELECT

  'Leads', 2, leads,

  leads::float / NULLIF(visitantes, 0),

  leads::float / NULLIF(visitantes, 0)

UNION ALL

SELECT

  'MQLs', 3, mqls,

  mqls::float / NULLIF(visitantes, 0),

  mqls::float / NULLIF(leads, 0)

UNION ALL

SELECT

  'Oportunidades', 4, oportunidades,

  oportunidades::float / NULLIF(visitantes, 0),

  oportunidades::float / NULLIF(mqls, 0)

UNION ALL

SELECT

  'Clientes', 5, clientes,

  clientes::float / NULLIF(visitantes, 0),

  clientes::float / NULLIF(oportunidades, 0)

ORDER BY ordem;
📊 Query 2 — Funil por Canal
sql

Copy
WITH events AS (

  SELECT

    user_id,

    utm_source,

    MAX(CASE WHEN event = 'page_view' THEN 1 ELSE 0 END) AS s1,

    MAX(CASE WHEN event = 'form_submit' THEN 1 ELSE 0 END) AS s2,

    MAX(CASE WHEN event = 'purchase' THEN 1 ELSE 0 END) AS s3

  FROM events_log

  WHERE event_date >= CURRENT_DATE - INTERVAL '30 days'

  GROUP BY user_id, utm_source

)

SELECT

  utm_source,

  SUM(s1) AS visitantes,

  SUM(s2) AS leads,

  SUM(s3) AS clientes,

  SUM(s2)::float / NULLIF(SUM(s1), 0) AS taxa_visitante_lead,

  SUM(s3)::float / NULLIF(SUM(s2), 0) AS taxa_lead_cliente

FROM events

GROUP BY utm_source

ORDER BY clientes DESC;
📦 Asset (Cálculo de Drop-off e Oportunidade)
python

Copy
def funnel_analysis(stages):

    """

    stages: lista ordenada de tuplas (nome, quantidade)

    Retorna dicionário com drop-off e oportunidade.

    """

    results = []

    for i, (name, count) in enumerate(stages):

        if i == 0:

            results.append({

                'estagio': name,

                'quantidade': count,

                'taxa_conversao_anterior': None,

                'taxa_conversao_acumulada': 1.0,

                'drop_off': 0,

                'oportunidade_reais': 0  # depende do ticket

            })

        else:

            prev = stages[i-1][1]

            conv = count / prev if prev > 0 else 0

            drop = prev - count

            results.append({

                'estagio': name,

                'quantidade': count,

                'taxa_conversao_anterior': conv,

                'taxa_conversao_acumulada': count / stages[0][1],

                'drop_off': drop,

                'oportunidade_reais': 0  # calcular depois

            })

    return results


# Exemplo

funnel = funnel_analysis([

    ('Visitantes', 10000),

    ('Leads', 2000),

    ('MQLs', 800),

    ('Oportunidades', 200),

    ('Clientes', 40),

])
📦 Asset (Template de Relatório)
yaml

Copy
# Análise de Funil — {{período}}


## Visão Geral

- Período: 2026-05-01 a 2026-05-31

- Visitantes: 10.000

- Clientes: 40

- Conversão global: 0.40%


## Funil por Estágio


| Estágio | Quantidade | CVR do Anterior | Drop-off | Oportunidade* |

|---|---|---|---|---|

| Visitantes | 10.000 | — | — | — |

| Leads | 2.000 | 20.0% | 8.000 | R$ X |

| MQLs | 800 | 40.0% | 1.200 | R$ Y |

| Oportunidades | 200 | 25.0% | 600 | R$ Z |

| Clientes | 40 | 20.0% | 160 | — |


*Oportunidade = drop-off × CVR do próximo estágio × ticket médio


## Gargalos Identificados


1. **Visitante → Lead (20%)** — abaixo da meta (30%)

   - Causa provável: formulário longo (8 campos)

   - Ação: reduzir para 3 campos

   

2. **MQL → Oportunidade (25%)** — abaixo da meta (40%)

   - Causa provável: sem CTA de checkout

   - Ação: adicionar exit-intent com oferta


## Top 3 Otimizações Priorizadas (ICE score)


1. **Reduzir formulário** — Impacto: 8, Confiança: 9, Facilidade: 10 = 720

2. **Exit intent com oferta** — Impacto: 8, Confiança: 7, Facilidade: 8 = 448

3. **Email follow-up D+1** — Impacto: 6, Confiança: 8, Facilidade: 9 = 432
📦 Asset (Frameworks de Priorização)
📊 RICE Score
yaml

Copy
RICE:

  R_reach: "Quantas pessoas impacta por mês?"

  I_impact: "0.25 (mínimo) a 3 (massivo)"

  C_confidence: "0.5 (baixa) a 1 (alta)"

  E_effort: "Pessoa-semanas (1-8)"

  score: "(R * I * C) / E"


exemplo:

  Reduzir_formulario:

    R: 8000  # visitantes/mês

    I: 2.0   # conversão +50%

    C: 0.9   # bem testado

    E: 0.5   # 1 dev, 1 semana

    score: 28800
📊 ICE Score (Mais Simples)
yaml

Copy
ICE:

  I_impact: "1-10 (quanto muda o resultado)"

  C_confidence: "1-10 (quão certo estou)"

  E_ease: "1-10 (quão fácil de implementar)"

  score: "I * C * E"


exemplo:

  Reduzir_formulario:

    I: 8

    C: 9

    E: 10

    score: 720
📊 Métricas de Sucesso
Métrica	Meta
Conversão global	≥ 0.5% (infoproduto)
Drop-off máximo entre estágios	≤ 60%
Identificação de gargalo (1x/mês)	sempre
Otimizações implementadas	≥ 3/mês
Lift médio das otimizações	≥ 15%
⚠️ Riscos & Anti-patterns

❌ Analisar funil só 1x → mercado muda

❌ Otimizar o estágio errado (alto volume, baixo impacto)

❌ Não definir metas por estágio → sem balizamento

❌ Ignorar tempo entre estágios (D+0 a D+30)

❌ Confundir funil de aquisição com funil de receita

✅ Revisar mensalmente com dados atualizados

✅ Priorizar com ICE/RICE

✅ Definir meta por estágio baseado em benchmark

✅ Documentar toda otimização (mesmo perdedor)

🔗 Próximas ferramentas

→ tools/analytics/04-atribuicao-multitouch.md — atribuição

→ tools/analytics/05-coorte-churn.md — combine com cohort

→ tools/marketing/06-funil-de-vendas.md — desenhe o funil

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus