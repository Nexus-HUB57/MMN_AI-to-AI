title: "05 · Análise de Coorte e Churn"
description: "Como criar tabelas de coorte, calcular retenção e prever churn com dados"
tags: [lab-nexus, analytics, coorte, churn, retencao, ltv]
category: analytics
level: master
estimated_time: "45 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: cohort-analyzer
course_anchor: cursos/master/03-coortes-churn.md
📈 05 · Análise de Coorte e Churn
Framework completo de coorte (definição, tabela, leitura) + cálculo de churn + queries SQL + visualização.

🎯 Spec
Atributo	Valor
O que é	Framework de coorte + 5 queries SQL + leitura da tabela triangular
Quando usar	Mensalmente, para entender retenção, prever churn, tomar decisões
Pré-requisitos	Nível 🥇 Master; dados de transação; eventos tracked
Tempo estimado	45 min para setup + 1h para análise
Skill que executa	cohort-analyzer
Judge que valida	judge-revisor
📋 Playbook — Conceitos Fundamentais
O que é uma coorte?
yaml

Copy
definicao: "Grupo de usuários que compartilham um evento inicial em um período"

exemplos:

  - "Todos que assinaram em janeiro de 2026"

  - "Todos que compraram no Black Friday 2025"

  - "Todos que vieram do Facebook em maio"


identificador: "Período do evento inicial (semana, mês, trimestre)"
Métricas-chave de coorte
yaml

Copy
retencao: "% de usuários da coorte que ainda estão ativos no mês N"

churn: "% de usuários da coorte que abandonaram no mês N"

ltv_coorte: "Receita acumulada por usuário da coorte ao longo do tempo"

expansion: "Receita adicional de usuários existentes (upsell)"

contraction: "Receita perdida de downgrades"
📦 Asset (Query SQL — Tabela de Coorte de Retenção)
sql

Copy
WITH user_cohort AS (

  -- 1. Define coorte de cada usuário (mês do 1º evento)

  SELECT

    user_id,

    DATE_TRUNC('month', MIN(event_timestamp)) AS cohort_month

  FROM events_log

  WHERE event = 'signup'

  GROUP BY user_id

),

user_activity AS (

  -- 2. Marca em quais meses o usuário ficou ativo

  SELECT

    uc.user_id,

    uc.cohort_month,

    DATE_TRUNC('month', el.event_timestamp) AS active_month,

    EXTRACT(MONTH FROM AGE(DATE_TRUNC('month', el.event_timestamp), uc.cohort_month)) AS month_offset

  FROM user_cohort uc

  JOIN events_log el ON uc.user_id = el.user_id

  WHERE el.event = 'session_start'

    AND el.event_timestamp >= uc.cohort_month

  GROUP BY uc.user_id, uc.cohort_month, DATE_TRUNC('month', el.event_timestamp)

),

cohort_size AS (

  -- 3. Tamanho de cada coorte

  SELECT

    cohort_month,

    COUNT(DISTINCT user_id) AS cohort_users

  FROM user_cohort

  GROUP BY cohort_month

)

SELECT

  cs.cohort_month,

  cs.cohort_users,

  ua.month_offset,

  COUNT(DISTINCT ua.user_id) AS active_users,

  ROUND(COUNT(DISTINCT ua.user_id)::numeric / cs.cohort_users, 4) AS retention_rate

FROM cohort_size cs

LEFT JOIN user_activity ua ON cs.cohort_month = ua.cohort_month

GROUP BY cs.cohort_month, cs.cohort_users, ua.month_offset

ORDER BY cs.cohort_month, ua.month_offset;
📦 Asset (Tabela Triangular de Retenção)
yaml

Copy
formato: |

  Coorte     | M0     | M1     | M2     | M3     | M4     | M5     | M6

  2026-01    | 100%   | 65%    | 48%    | 41%    | 38%    | 36%    | 35%

  2026-02    | 100%   | 68%    | 52%    | 44%    | 41%    | 39%    |

  2026-03    | 100%   | 72%    | 55%    | 48%    | 45%    |        |

  2026-04    | 100%   | 70%    | 53%    | 47%    |        |        |

  2026-05    | 100%   | 75%    | 58%    |        |        |        |

  2026-06    | 100%   | 78%    |        |        |        |        |


leitura:

  - "Linha = coorte (mês de entrada)"

  - "Coluna = meses desde a entrada"

  - "Célula = % de usuários ainda ativos"

  - "Diagonal: dados parciais (coortes mais novas)"

  - "Comparação vertical: evolução da qualidade da coorte"

  - "Comparação horizontal: velocidade de churn"
📦 Asset (Cálculo de Churn)
📊 Churn Mensal (Brute Churn Rate)
sql

Copy
WITH user_status AS (

  SELECT

    user_id,

    DATE_TRUNC('month', MAX(event_timestamp)) AS last_active_month,

    DATE_TRUNC('month', MIN(event_timestamp)) AS cohort_month

  FROM events_log

  WHERE event = 'session_start'

  GROUP BY user_id

),

monthly_churn AS (

  SELECT

    DATE_TRUNC('month', event_timestamp) AS month,

    COUNT(DISTINCT user_id) AS active_users,

    COUNT(DISTINCT CASE 

      WHEN DATE_TRUNC('month', event_timestamp) < DATE_TRUNC('month', MAX(event_timestamp) OVER (PARTITION BY user_id))

      THEN user_id 

    END) AS churned_users

  FROM events_log

  WHERE event = 'session_start'

    AND event_timestamp >= CURRENT_DATE - INTERVAL '12 months'

  GROUP BY DATE_TRUNC('month', event_timestamp)

)

SELECT

  month,

  active_users,

  churned_users,

  churned_users::float / NULLIF(active_users + churned_users, 0) AS churn_rate

FROM monthly_churn

ORDER BY month;
📊 Churn por Coorte (Retention vs Churn)
python

Copy
def cohort_churn_analysis(retention_table):

    """

    retention_table: dict {cohort: {month: retention_rate}}

    Retorna churn_rate e revenue_churn.

    """

    results = {}

    for cohort, months in retention_table.items():

        prev = 1.0

        churn_rates = []

        for m in sorted(months.keys()):

            ret = months[m]

            churn = prev - ret

            churn_rates.append(churn)

            prev = ret

        results[cohort] = {

            'monthly_churn_avg': sum(churn_rates) / len(churn_rates),

            'cumulative_churn_m3': sum(churn_rates[:3]),

            'cumulative_churn_m6': sum(churn_rates[:6])

        }

    return results
📦 Asset (Cálculo de LTV por Coorte)
sql

Copy
WITH cohort_revenue AS (

  SELECT

    DATE_TRUNC('month', MIN(event_timestamp)) AS cohort_month,

    user_id,

    SUM(amount) AS user_revenue

  FROM orders

  WHERE status = 'paid'

  GROUP BY user_id

),

cohort_size AS (

  SELECT

    DATE_TRUNC('month', MIN(event_timestamp)) AS cohort_month,

    COUNT(DISTINCT user_id) AS cohort_users

  FROM orders

  WHERE status = 'paid'

  GROUP BY DATE_TRUNC('month', MIN(event_timestamp))

)

SELECT

  cr.cohort_month,

  cs.cohort_users,

  SUM(cr.user_revenue) AS total_revenue,

  SUM(cr.user_revenue) / cs.cohort_users AS ltv_per_user

FROM cohort_revenue cr

JOIN cohort_size cs ON cr.cohort_month = cs.cohort_month

GROUP BY cr.cohort_month, cs.cohort_users

ORDER BY cr.cohort_month;
📦 Asset (Cálculo de LTV Preditivo)
python

Copy
def ltv_predictive(monthly_revenue, monthly_churn, gross_margin=0.7):

    """

    Fórmula: LTV = (ARPU × Gross Margin) / Churn Rate

    """

    return (monthly_revenue * gross_margin) / monthly_churn


# Exemplo

ltv = ltv_predictive(

    monthly_revenue=97,    # R$/mês por usuário

    monthly_churn=0.05,    # 5%

    gross_margin=0.7

)

print(f"LTV preditivo: R$ {ltv:.2f}")

# LTV preditivo: R$ 1358.00
📊 Métricas de Sucesso
Métrica	Meta
Retenção M1	≥ 50%
Retenção M3	≥ 30%
Retenção M6	≥ 20%
Churn mensal	≤ 5%
LTV/CAC	≥ 3
Análise feita mensalmente	100% das vezes
⚠️ Riscos & Anti-patterns

❌ Não definir evento de coorte (sempre "1º acesso")

❌ Misturar coortes de produtos diferentes

❌ Olhar churn agregado (média esconde padrão)

❌ Não diferenciar churn voluntário vs involuntário

❌ Confundir churn com non-usage (lead inativo ≠ churn)

❌ Não cruzar com cohort revenue (retém mas não paga)

✅ Definir evento de coorte claro (signup ou purchase)

✅ Tabela triangular para visualização

✅ Cruzar retenção com LTV

✅ Calcular churn em 3 horizontes (M1, M3, M6)

🔗 Próximas ferramentas

→ tools/analytics/04-atribuicao-multitouch.md — atribuição

→ tools/marketing/02-segmentacao-rfm.md — combine com RFM

→ cursos/master/03-coortes-churn.md — contexto completo

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus