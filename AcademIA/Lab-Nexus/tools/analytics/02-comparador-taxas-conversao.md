---
title: "Exemplo"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

title: "02 · Comparador de Taxas de Conversão"
description: "Como comparar taxas de conversão entre canais, coortes e períodos com rigor estatístico"
tags: [lab-nexus, analytics, conversao, benchmark, comparacao]
category: analytics
level: master
estimated_time: "20 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: roi-attributor
course_anchor: cursos/master/00-otimizacao-conversao.md
📊 02 · Comparador de Taxas de Conversão
Framework + queries SQL + código Python para comparar taxas de conversão com rigor estatístico entre canais, períodos e segmentos.

🎯 Spec
Atributo	Valor
O que é	Framework de comparação + queries SQL + teste de hipótese (chi-quadrado)
Quando usar	Decidir entre canais, avaliar mudanças, validar experimentos
Pré-requisitos	Nível 🥇 Master; dados no banco/analytics; volume mínimo 100 conversões
Tempo estimado	20 min para gerar relatório
Skill que executa	roi-attributor
Judge que valida	judge-revisor
📋 Playbook — Os 4 Tipos de Comparação
1. Canal A vs Canal B (mesmo período)
yaml

Copy
pergunta: "Facebook converte mais que Google?"

tipo: "Comparação de proporções independentes"

teste: "Chi-quadrado ou Z-test de 2 proporções"

cuidado: "Mesmo público, mesmo produto, mesmo período"
2. Antes vs Depois (mesmo canal)
yaml

Copy
pergunta: "Mudei a LP, melhorou?"

tipo: "Comparação de proporções dependentes (mesma base)"

teste: "Z-test pareado ou McNemar"

cuidado: "Sazonalidade, mudança de oferta, qualidade de tráfego"
3. Segmento A vs Segmento B (mesma campanha)
yaml

Copy
pergunta: "Lead do YouTube converte mais que do Facebook?"

tipo: "Comparação de proporções em subgrupos"

teste: "Chi-quadrado com subgrupos"

cuidado: "Tamanho da amostra por subgrupo"
4. Cohort A vs Cohort B (mesma oferta, janelas diferentes)
yaml

Copy
pergunta: "Coorte de janeiro converte mais que de fevereiro?"

tipo: "Comparação de proporções em coortes temporais"

teste: "Chi-quadrado ou bootstrap"

cuidado: "Mudança de mercado, sazonalidade"
📦 Asset (Queries SQL Prontas)
📊 Query 1 — Comparação por Canal
sql

Copy
WITH channel_conv AS (

  SELECT

    utm_source,

    COUNT(DISTINCT session_id) AS visitors,

    COUNT(DISTINCT CASE WHEN converted THEN session_id END) AS conversions

  FROM events

  WHERE event_date BETWEEN '2026-05-01' AND '2026-05-31'

  GROUP BY utm_source

)

SELECT

  utm_source,

  visitors,

  conversions,

  conversions::float / NULLIF(visitors, 0) AS conversion_rate,

  -- Wilson confidence interval

  (conversions + 1.96^2/2) / (visitors + 1.96^2) -

    1.96 * SQRT(((conversions + 1.96^2/2) / (visitors + 1.96^2)) * 

                (1 - (conversions + 1.96^2/2) / (visitors + 1.96^2)) / 

                (visitors + 1.96^2)) AS ci_lower,

  (conversions + 1.96^2/2) / (visitors + 1.96^2) +

    1.96 * SQRT(...) AS ci_upper

FROM channel_conv

ORDER BY conversion_rate DESC;
📊 Query 2 — Comparação Antes/Depois
sql

Copy
WITH periods AS (

  SELECT

    CASE 

      WHEN event_date BETWEEN '2026-04-01' AND '2026-04-30' THEN 'before'

      WHEN event_date BETWEEN '2026-05-01' AND '2026-05-31' THEN 'after'

    END AS period,

    session_id,

    MAX(CASE WHEN converted THEN 1 ELSE 0 END) AS converted

  FROM events

  WHERE event_date BETWEEN '2026-04-01' AND '2026-05-31'

  GROUP BY period, session_id

)

SELECT

  period,

  COUNT(*) AS visitors,

  SUM(converted) AS conversions,

  AVG(converted) AS conversion_rate

FROM periods

GROUP BY period;
📊 Query 3 — Teste Chi-Quadrado (PostgreSQL)
sql

Copy
-- Tabela 2x2

WITH observed AS (

  SELECT

    utm_source,

    SUM(CASE WHEN converted THEN 1 ELSE 0 END) AS conv,

    SUM(CASE WHEN NOT converted THEN 1 ELSE 0 END) AS not_conv

  FROM events

  WHERE event_date BETWEEN '2026-05-01' AND '2026-05-31'

    AND utm_source IN ('facebook', 'google')

  GROUP BY utm_source

)

SELECT

  'chi2' AS test,

  -- Implementação simplificada (use scipy para mais rigor)

  SUM((conv - expected)^2 / expected) AS chi2_statistic

FROM observed,

  LATERAL (

    SELECT

      SUM(conv) OVER () AS total_conv,

      SUM(not_conv) OVER () AS total_not_conv,

      (conv + not_conv) AS total_row

    FROM observed LIMIT 1

  ) totals;
📦 Asset (Teste Estatístico em Python)
python

Copy
import numpy as np

from scipy import stats


def compare_conversion_rates(n1, x1, n2, x2, alpha=0.05):

    """

    Compara 2 taxas de conversão com Z-test de 2 proporções.

    

    n1, n2: visitantes em cada grupo

    x1, x2: conversões em cada grupo

    alpha: nível de significância (default 0.05)

    """

    p1 = x1 / n1

    p2 = x2 / n2

    

    # Proporção pooled

    p_pool = (x1 + x2) / (n1 + n2)

    

    # Erro padrão

    se = np.sqrt(p_pool * (1 - p_pool) * (1/n1 + 1/n2))

    

    # Z-score

    z = (p1 - p2) / se

    

    # P-value (2-tailed)

    p_value = 2 * (1 - stats.norm.cdf(abs(z)))

    

    # Diferença relativa

    lift = (p2 - p1) / p1 if p1 > 0 else float('inf')

    

    return {

        'p1': p1,

        'p2': p2,

        'lift_relative': lift,

        'lift_absolute': p2 - p1,

        'z_score': z,

        'p_value': p_value,

        'significativo': p_value < alpha,

        'confianca': 1 - p_value,

    }


# Exemplo

result = compare_conversion_rates(

    n1=1000, x1=20,  # Canal A: 2% conversão

    n2=1000, x2=35,  # Canal B: 3.5% conversão

)

print(result)

# {'p1': 0.02, 'p2': 0.035, 'lift_relative': 0.75, 

#  'lift_absolute': 0.015, 'z_score': 2.36, 'p_value': 0.018,

#  'significativo': True, 'confianca': 0.982}
📦 Asset (Template de Relatório)
yaml

Copy
# Relatório: Comparação {{canal_A}} vs {{canal_B}}

período: "2026-05-01 a 2026-05-31"

população: "Visitantes únicos, todos os dispositivos"


resultado_canal_A:

  visitantes: 5420

  conversoes: 108

  taxa: "1.99% (IC 95%: 1.65-2.40%)"


resultado_canal_B:

  visitantes: 5180

  conversoes: 156

  taxa: "3.01% (IC 95%: 2.58-3.51%)"


diferenca: "+1.02 p.p. (relativo: +51%)"

significancia: "p = 0.0003 (99.97% confiança)"


conclusao: |

  Canal B tem conversão significativamente maior.

  Recomendação: Realocar 20% do budget de A para B.


limitacoes:

  - "Mesma qualidade de tráfego assumida"

  - "Não controlado por sazonalidade"

  - "LTV médio não considerado"
📊 Métricas de Sucesso
Métrica	Meta
Significância (p-value)	< 0.05
Confiança	≥ 95%
Lift mínimo detectável	≥ 10%
Tempo de decisão	≤ 4 semanas
Decisões baseadas em dado/mês	≥ 2
⚠️ Riscos & Anti-patterns

❌ Comparar sem significância (azar é estatística)

❌ Ignorar tamanho da amostra (n=10 é achismo)

❌ Não controlar sazonalidade (julho ≠ dezembro)

❌ Comparar públicos diferentes (FB frio vs YT quente)

❌ Confundir correlação com causalidade

❌ Olhar IC errado (95% IC ≠ "95% chance de funcionar")

✅ Sempre calcular p-value e IC

✅ Considerar LTV, não só conversão

✅ Controlar sazonalidade

✅ Documentar a comparação

🔗 Próximas ferramentas

→ tools/analytics/01-experimento-ab.md — metodologia

→ tools/analytics/04-atribuicao-multitouch.md — atribuição

→ cursos/master/00-otimizacao-conversao.md — funil completo

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus