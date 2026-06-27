---
title: "04-atribuicao-multitouch"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

title: "04 · Atribuição Multi-touch"
description: "Modelos de atribuição (first-touch, last-touch, linear, time-decay, data-driven) e como escolher"
tags: [lab-nexus, analytics, atribuicao, multi-touch, mta]
category: analytics
level: master
estimated_time: "30 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: roi-attributor
course_anchor: cursos/master/00-otimizacao-conversao.md
🎯 04 · Atribuição Multi-touch (MTA)
5 modelos de atribuição (last, first, linear, time-decay, data-driven) + implementação SQL + quando usar cada.

🎯 Spec
Atributo	Valor
O que é	5 modelos de atribuição + SQL para cada + guia de escolha
Quando usar	Decidir budget entre canais, entender jornada real do cliente
Pré-requisitos	Nível 🥇 Master; tracking UTM completo; mínimo 1k conversões/mês
Tempo estimado	30 min para implementar e validar
Skill que executa	roi-attributor
Judge que valida	judge-revisor
📋 Playbook — Os 5 Modelos
1. Last-Touch (Atribuição ao Último Clique)
yaml

Copy
descricao: "100% do crédito vai para o último canal antes da conversão"

vantagem: "Simples, fácil de implementar"

desvantagem: "Ignora canais de awareness"

uso_recomendado: "Performance pura (CPA baixo)"

exemplo: |

  Jornada: FB Ad → Google → Direct → Compra

  Atribuição: 100% para Direct
2. First-Touch (Atribuição ao Primeiro Clique)
yaml

Copy
descricao: "100% do crédito vai para o primeiro canal"

vantagem: "Valoriza canais de topo de funil"

desvantagem: "Ignora canais de conversão"

uso_recomendado: "Brand awareness, expansão de base"

exemplo: |

  Jornada: FB Ad → Google → Direct → Compra

  Atribuição: 100% para FB Ad
3. Linear (Distribuição Igual)
yaml

Copy
descricao: "Cada touchpoint recebe peso igual"

formula: "peso = 1 / número de touchpoints"

vantagem: "Justo, simples, sem viés"

desvantagem: "Trata awareness igual a conversão"

uso_recomendado: "Visão geral da jornada"

exemplo: |

  Jornada: FB Ad → Google → Direct → Compra (3 touchpoints)

  Atribuição: 33% cada
4. Time-Decay (Decaimento Temporal)
yaml

Copy
descricao: "Mais peso para touchpoints recentes"

formula: "peso = 2^(dias_antes / half_life)"

vantagem: "Valoriza canais próximos da decisão"

desvantagem: "Subestima canais de awareness"

uso_recomendado: "Vendas com ciclo longo (B2B)"

exemplo: |

  Jornada: FB Ad (D-30) → Google (D-15) → Direct (D-0) → Compra

  Atribuição: ~10% FB, ~30% Google, ~60% Direct
5. Data-Driven (Algorítmico)
yaml

Copy
descricao: "Machine learning calcula contribuição real de cada canal"

algoritmo: "Shapley Value, Markov Chain ou Regressão"

vantagem: "Mais preciso, considera interações"

desvantagem: "Complexo, exige volume + tempo"

uso_recomendado: "Volume > 10k conversões/mês, time técnico"

ferramentas: ["Google Analytics 4", "Adobe Analytics", "Singular", "Northbeam"]
📦 Asset (Queries SQL para Cada Modelo)
📊 Last-Touch
sql

Copy
WITH last_touch AS (

  SELECT

    user_id,

    ARG_MAX(utm_source, event_timestamp) AS last_source

  FROM events_log

  WHERE event = 'page_view'

  GROUP BY user_id

),

conversions AS (

  SELECT DISTINCT user_id

  FROM events_log

  WHERE event = 'purchase'

)

SELECT

  last_source,

  COUNT(*) AS conversions

FROM last_touch

WHERE user_id IN (SELECT user_id FROM conversions)

GROUP BY last_source

ORDER BY conversions DESC;
📊 First-Touch
sql

Copy
WITH first_touch AS (

  SELECT

    user_id,

    ARG_MIN(utm_source, event_timestamp) AS first_source

  FROM events_log

  WHERE event = 'page_view'

  GROUP BY user_id

)

SELECT

  first_source,

  COUNT(*) AS conversions

FROM first_touch f

WHERE EXISTS (

  SELECT 1 FROM events_log e

  WHERE e.user_id = f.user_id AND e.event = 'purchase'

)

GROUP BY first_source

ORDER BY conversions DESC;
📊 Linear (Distribuição Igual)
sql

Copy
WITH user_paths AS (

  SELECT

    user_id,

    ARRAY_AGG(utm_source ORDER BY event_timestamp) AS path

  FROM events_log

  WHERE event = 'page_view'

  GROUP BY user_id

),

conversions AS (

  SELECT DISTINCT user_id FROM events_log WHERE event = 'purchase'

),

channel_credit AS (

  SELECT

    UNNEST(up.path) AS channel,

    1.0 / ARRAY_LENGTH(up.path, 1) AS credit

  FROM user_paths up

  WHERE up.user_id IN (SELECT user_id FROM conversions)

)

SELECT

  channel,

  SUM(credit) AS conversions

FROM channel_credit

GROUP BY channel

ORDER BY conversions DESC;
📊 Time-Decay (com half-life de 7 dias)
sql

Copy
WITH user_paths AS (

  SELECT

    user_id,

    utm_source,

    event_timestamp,

    EXTRACT(DAY FROM (MAX(event_timestamp) OVER (PARTITION BY user_id) - event_timestamp)) AS days_before

  FROM events_log

  WHERE event = 'page_view'

),

conversions AS (

  SELECT DISTINCT user_id FROM events_log WHERE event = 'purchase'

),

channel_credit AS (

  SELECT

    up.utm_source AS channel,

    POWER(2, -up.days_before / 7.0) / 

    SUM(POWER(2, -up.days_before / 7.0)) OVER (PARTITION BY up.user_id) AS credit

  FROM user_paths up

  WHERE up.user_id IN (SELECT user_id FROM conversions)

)

SELECT

  channel,

  SUM(credit) AS conversions

FROM channel_credit

GROUP BY channel

ORDER BY conversions DESC;
📦 Asset (Tabela Comparativa)
yaml

Copy
modelo:               "Last | First | Linear | Time-Decay | Data-Driven"

complexidade:         "Baixa | Baixa | Baixa | Média | Alta"

precisao:             "Baixa | Baixa | Média | Média-Alta | Alta"

valoriza_awareness:   "Não | Sim | Sim | Parcial | Sim"

valoriza_conversao:   "Sim | Não | Sim | Sim | Sim"

volume_minimo:        "100 | 100 | 100 | 1k | 10k"

caso_uso_ideal:       "CPA | Brand | Geral | B2B | E-commerce maduro"
📦 Asset (Framework de Escolha)
yaml

Copy
pergunta_1: "Você está focado em performance direta (CPA)?"

  sim: "Last-Touch"


pergunta_2: "Você está expandindo base de leads?"

  sim: "First-Touch"


pergunta_3: "Você quer visão geral sem viés?"

  sim: "Linear"


pergunta_4: "Seu ciclo de venda é longo (> 7 dias)?"

  sim: "Time-Decay"


pergunta_5: "Você tem volume + time técnico?"

  sim: "Data-Driven"


regra_pratica: |

  Para afiliado Nexus (volume médio):

  - Aquisição: Linear ou Time-Decay

  - Conversão direta: Last-Touch

  - Análise estratégica: Data-Driven (se possível)
📊 Métricas de Sucesso
Métrica	Meta
Decisões budget baseadas em atribuição	100% das decisões
Confiança no modelo	≥ 80%
Reavaliação do modelo	Trimestral
Lift por rebalanceamento	≥ 10%
Redução de CAC	≥ 15%
⚠️ Riscos & Anti-patterns

❌ Usar só Last-Touch sempre → superestima canais de fundo

❌ Mudar modelo sem critério → decisão inconsistente

❌ Não validar com holdout (10% tráfego sem atribuição)

❌ Ignorar view-through (vídeo visto, não clicado)

❌ Confundir attribution com incrementality (≠!)

✅ Definir 1 modelo canônico por objetivo

✅ Comparar modelos mensalmente (delta)

✅ Validar com incrementality test (geo-holdout)

✅ Documentar premissas

🔗 Próximas ferramentas

→ tools/analytics/02-comparador-taxas-conversao.md — análise complementar

→ tools/analytics/03-funis-conversao.md — funil completo

→ cursos/master/00-otimizacao-conversao.md — funil estratégico

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus