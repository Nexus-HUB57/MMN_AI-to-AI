---
title: "02-segmentacao-rfm"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-24
status: official
---

title: "02 · Segmentação RFM"
description: "Análise RFM (Recência, Frequência, Monetário) para segmentar leads e clientes"
tags: [lab-nexus, marketing, segmentacao, rfm, ltv]
category: marketing
level: master
estimated_time: "30 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: audience-segmenter
course_anchor: cursos/master/01-funis-lifecycle.md
🎯 02 · Segmentação RFM
Modelo RFM (Recência, Frequência, Monetário) para classificar leads e clientes em 11 segmentos acionáveis.

🎯 Spec
Atributo	Valor
O que é	Planilha/script que calcula RFM e gera 11 segmentos com ações
Quando usar	Mensalmente, para personalizar comunicação e prever LTV
Pré-requisitos	Nível 🥇 Master; mínimo 100 leads com histórico de compra
Tempo estimado	30 min para rodar + 1h para criar campanhas
Skill que executa	audience-segmenter + roi-attributor
Judge que valida	judge-revisor
📋 Playbook — Os 11 Segmentos RFM
Definição dos Scores (1-5 cada eixo)
Score	Recência (dias)	Frequência (compras)	Monetário (R$)
5	0-30	5+	R$ 1.000+
4	31-60	3-4	R$ 500-999
3	61-90	2	R$ 200-499
2	91-180	1	R$ 50-199
1	180+	0	R$ 0-49
Os 11 Segmentos
Segmento	R-F-M	Ação Recomendada
🏆 Champions	5-5-5	Recompensar, pedir indicação, oferecer programa VIP
💎 Loyal Customers	4-5-4	Upsell, cross-sell, early access
🌟 Potential Loyalists	5-4-3	Onboarding avançado, educação
🆕 New Customers	5-1-2	Acompanhamento, garantir 1ª compra repetida
💤 At Risk	2-4-4	Reativar com oferta personalizada
⚠️ Cant Lose Them	1-5-5	Contato 1:1,调研, oferta agressiva
😴 Hibernating	1-1-1	Campanha de reativação leve
🛒 Promising	5-1-1	Nutrição, conteúdo educativo
😐 Need Attention	3-3-3	Oferta de reativação
⏰ About to Sleep	2-2-2	Push notification + bônus
📉 Lost	1-1-1	Email de despedida + opt-in low cost
📦 Asset (Script SQL + Python)
📊 SQL (PostgreSQL)
sql

Copy
WITH rfm AS (

  SELECT

    user_id,

    EXTRACT(DAY FROM NOW() - MAX(created_at)) AS recency_days,

    COUNT(DISTINCT order_id) AS frequency,

    SUM(amount) AS monetary

  FROM orders

  WHERE status = 'paid'

    AND created_at >= NOW() - INTERVAL '12 months'

  GROUP BY user_id

),

rfm_scores AS (

  SELECT

    user_id,

    recency_days,

    frequency,

    monetary,

    NTILE(5) OVER (ORDER BY recency_days ASC) AS r_score,

    NTILE(5) OVER (ORDER BY frequency DESC) AS f_score,

    NTILE(5) OVER (ORDER BY monetary DESC) AS m_score

  FROM rfm

)

SELECT

  user_id,

  r_score || '-' || f_score || '-' || m_score AS rfm_code,

  CASE

    WHEN r_score = 5 AND f_score >= 4 THEN 'Champions'

    WHEN r_score >= 4 AND f_score >= 4 THEN 'Loyal Customers'

    WHEN r_score >= 4 AND f_score >= 2 THEN 'Potential Loyalists'

    WHEN r_score >= 4 AND f_score = 1 THEN 'New Customers'

    WHEN r_score BETWEEN 2 AND 3 AND f_score >= 3 THEN 'At Risk'

    WHEN r_score = 1 AND f_score >= 4 THEN 'Cant Lose Them'

    WHEN r_score = 1 AND f_score = 1 AND m_score = 1 THEN 'Lost'

    WHEN r_score >= 4 AND f_score = 1 AND m_score = 1 THEN 'Promising'

    WHEN r_score = 3 AND f_score = 3 THEN 'Need Attention'

    WHEN r_score = 2 AND f_score = 2 THEN 'About to Sleep'

    ELSE 'Hibernating'

  END AS segment

FROM rfm_scores;
🐍 Python (Pandas)
python

Copy
import pandas as pd

import datetime as dt


def calculate_rfm(df: pd.DataFrame, snapshot_date=None):

    """df precisa ter colunas: user_id, order_id, created_at, amount"""

    if snapshot_date is None:

        snapshot_date = df['created_at'].max() + dt.timedelta(days=1)

    

    rfm = df.groupby('user_id').agg(

        recency=('created_at', lambda x: (snapshot_date - x.max()).days),

        frequency=('order_id', 'nunique'),

        monetary=('amount', 'sum')

    ).reset_index()

    

    rfm['r_score'] = pd.qcut(rfm['recency'], 5, labels=[5,4,3,2,1])

    rfm['f_score'] = pd.qcut(rfm['frequency'].rank(method='first'), 5, labels=[1,2,3,4,5])

    rfm['m_score'] = pd.qcut(rfm['monetary'], 5, labels=[1,2,3,4,5])

    rfm['rfm_code'] = rfm['r_score'].astype(str) + '-' + rfm['f_score'].astype(str) + '-' + rfm['m_score'].astype(str)

    

    def segment(row):

        if row['r_score'] == 5 and row['f_score'] >= 4: return 'Champions'

        if row['r_score'] >= 4 and row['f_score'] >= 4: return 'Loyal Customers'

        if row['r_score'] >= 4 and row['f_score'] >= 2: return 'Potential Loyalists'

        if row['r_score'] >= 4 and row['f_score'] == 1: return 'New Customers'

        if 2 <= row['r_score'] <= 3 and row['f_score'] >= 3: return 'At Risk'

        if row['r_score'] == 1 and row['f_score'] >= 4: return 'Cant Lose Them'

        if row['r_score'] == 1 and row['f_score'] == 1 and row['m_score'] == 1: return 'Lost'

        if row['r_score'] >= 4 and row['f_score'] == 1 and row['m_score'] == 1: return 'Promising'

        if row['r_score'] == 3 and row['f_score'] == 3: return 'Need Attention'

        if row['r_score'] == 2 and row['f_score'] == 2: return 'About to Sleep'

        return 'Hibernating'

    

    rfm['segment'] = rfm.apply(segment, axis=1)

    return rfm
📊 Métricas de Sucesso
Métrica	Meta
% de Champions	≥ 15%
% de Lost	≤ 10%
% de At Risk convertido	≥ 30%
LTV Champions	5x LTV médio
Receita por segmento	Champions: 40%+, Mid: 40%, Low: 20%
⚠️ Riscos & Anti-patterns

❌ Calcular só 1x e esquecer → dados desatualizados

❌ Tratar todos os segmentos igual → desperdiça potencial

❌ Enviar mesma campanha para 11 segmentos → 0 personalização

❌ Usar RFM sem cruzar com outras dimensões (canal origem, produto)

❌ Não anonimizar dados (PII exposta)

✅ Rodar mensalmente com janela de 12 meses

✅ 1 campanha por segmento com mensagem específica

✅ Testar oferta + copy por segmento

🔗 Próximas ferramentas

→ tools/analytics/05-coorte-churn.md — combine com cohort

→ tools/marketing/05-segmentacao-lista.md — segmentação simples

→ cursos/master/01-funis-lifecycle.md — lifecycle completo

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus