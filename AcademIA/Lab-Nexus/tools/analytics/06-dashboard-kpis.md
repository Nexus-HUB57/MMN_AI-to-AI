---
title: "06-dashboard-kpis"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-24
status: official
---

<!-- placeholders-doc -->

title: "06 · Dashboard de KPIs"
description: "Os 15 KPIs essenciais de marketing digital + 5 dashboards modelo + queries"
tags: [lab-nexus, analytics, kpi, dashboard, metricas]
category: analytics
level: agente
estimated_time: "30 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: analytics-reporter
course_anchor: cursos/fundamental/03-painel-afiliado.md
📊 06 · Dashboard de KPIs Essenciais
Os 15 KPIs que TODO afiliado precisa monitorar + 5 dashboards modelo + queries SQL + alertas.

🎯 Spec
Atributo	Valor
O que é	Lista canônica de 15 KPIs + 5 dashboards modelo + queries SQL
Quando usar	Configurar 1x, consultar diariamente
Pré-requisitos	Nível 🥈 Agente; acesso ao banco/analytics; eventos tracked
Tempo estimado	30 min para configurar + 5 min/dia para consultar
Skill que executa	analytics-reporter
Judge que valida	judge-revisor
📋 Playbook — Os 15 KPIs Essenciais
Aquisição (Topo de Funil)
yaml

Copy
1_visitas_unicas:

  definicao: "Visitantes únicos no site/LP no período"

  meta: "varia (depende do orçamento)"

  formula: "COUNT(DISTINCT user_id) WHERE event = 'page_view'"


2_cpl:

  definicao: "Custo por Lead"

  meta: "≤ R$ 25 (frio), ≤ R$ 10 (morno)"

  formula: "investimento_ads / leads_gerados"


3_ctr:

  definicao: "Click-through rate em anúncio"

  meta: "≥ 1.0% (feed), ≥ 0.5% (stories)"

  formula: "clicks / impressions"


4_cpc:

  definicao: "Custo por clique"

  meta: "≤ R$ 1.50"

  formula: "investimento_ads / clicks"
Engajamento (Meio de Funil)
yaml

Copy
5_visitante_para_lead:

  definicao: "% de visitantes que viram lead"

  meta: "≥ 20% (LP boa), ≥ 30% (LP otimizada)"

  formula: "leads / visitantes"


6_open_rate_email:

  definicao: "% de e-mails abertos"

  meta: "≥ 35%"

  formula: "opens / delivered"


7_ctr_email:

  definicao: "% de clicks no e-mail"

  meta: "≥ 4%"

  formula: "clicks / delivered"


8_tempo_medio_lp:

  definicao: "Tempo médio na landing page"

  meta: "≥ 90s (VSL) ou ≥ 45s (estática)"

  formula: "AVG(time_on_page)"
Conversão (Fundo de Funil)
yaml

Copy
9_cvr_checkout:

  definicao: "% de checkouts iniciados que viraram venda"

  meta: "≥ 25% (R$ 297), ≥ 15% (R$ 997+)"

  formula: "compras / checkouts_iniciados"


10_cpa:

  definicao: "Custo por Aquisição (cliente)"

  meta: "≤ 30% do AOV (ticket)"

  formula: "investimento_total_ads / clientes"


11_cac_payback:

  definicao: "Meses para recuperar CAC"

  meta: "≤ 12 meses"

  formula: "cac / (aov * margem / meses)"
Receita e LTV
yaml

Copy
12_aov:

  definicao: "Average Order Value (ticket médio)"

  meta: "crescente (upsell, cross-sell)"

  formula: "receita_total / numero_vendas"


13_ltv:

  definicao: "Lifetime Value"

  meta: "LTV/CAC ≥ 3"

  formula: "(ARPU * gross_margin) / churn_rate"


14_receita_recorrente:

  definicao: "MRR (Monthly Recurring Revenue)"

  meta: "crescimento ≥ 5% mês"

  formula: "SUM(valor_assinaturas_ativas)"
Qualidade
yaml

Copy
15_nps:

  definicao: "Net Promoter Score (-100 a +100)"

  meta: "≥ 50"

  formula: "% promotores - % detratores"
📦 Asset (Queries SQL para KPIs Diários)
📊 KPI 5 — Visitante → Lead
sql

Copy
SELECT

  DATE(event_timestamp) AS dia,

  COUNT(DISTINCT CASE WHEN event = 'page_view' THEN user_id END) AS visitantes,

  COUNT(DISTINCT CASE WHEN event = 'form_submit' THEN user_id END) AS leads,

  COUNT(DISTINCT CASE WHEN event = 'form_submit' THEN user_id END)::float / 

    NULLIF(COUNT(DISTINCT CASE WHEN event = 'page_view' THEN user_id END), 0) AS cvr

FROM events_log

WHERE event_timestamp >= CURRENT_DATE - INTERVAL '30 days'

GROUP BY DATE(event_timestamp)

ORDER BY dia;
📊 KPI 9 — CVR Checkout
sql

Copy
SELECT

  DATE(event_timestamp) AS dia,

  COUNT(DISTINCT CASE WHEN event = 'checkout_start' THEN user_id END) AS checkouts,

  COUNT(DISTINCT CASE WHEN event = 'purchase' THEN user_id END) AS compras,

  COUNT(DISTINCT CASE WHEN event = 'purchase' THEN user_id END)::float / 

    NULLIF(COUNT(DISTINCT CASE WHEN event = 'checkout_start' THEN user_id END), 0) AS cvr_checkout

FROM events_log

WHERE event_timestamp >= CURRENT_DATE - INTERVAL '30 days'

GROUP BY DATE(event_timestamp)

ORDER BY dia;
📊 KPI 13 — LTV por Coorte
sql

Copy
WITH cohort AS (

  SELECT

    user_id,

    DATE_TRUNC('month', MIN(event_timestamp)) AS cohort_month

  FROM orders

  WHERE status = 'paid'

  GROUP BY user_id

)

SELECT

  c.cohort_month,

  COUNT(DISTINCT c.user_id) AS users,

  SUM(o.amount) AS receita_total,

  SUM(o.amount) / COUNT(DISTINCT c.user_id) AS ltv_per_user

FROM cohort c

JOIN orders o ON c.user_id = o.user_id AND o.status = 'paid'

WHERE o.created_at >= c.cohort_month

GROUP BY c.cohort_month

ORDER BY c.cohort_month DESC;
📦 Asset (5 Dashboards Modelo)
📊 Dashboard 1 — Visão Geral Diária
yaml

Copy
frequencia: "Diária"

widgets:

  - "KPI 1: Visitas únicas (vs D-7)"

  - "KPI 2: Leads (vs D-7)"

  - "KPI 5: CVR visitante→lead (vs D-7)"

  - "KPI 9: CVR checkout (vs D-7)"

  - "KPI 10: CPA (vs D-7)"

  - "Gráfico: receita últimos 30 dias"

  - "Tabela: top 5 anúncios por ROAS"
📊 Dashboard 2 — Funil Semanal
yaml

Copy
frequencia: "Semanal"

widgets:

  - "Funil agregado (5 estágios)"

  - "Funil por canal (FB, Google, Orgânico, Direto)"

  - "Taxa por estágio (variação vs semana anterior)"

  - "Lista de drop-offs principais"
📊 Dashboard 3 — Receita Mensal
yaml

Copy
frequencia: "Mensal"

widgets:

  - "KPI 12: AOV (variação MoM)"

  - "KPI 13: LTV (variação MoM)"

  - "KPI 14: MRR (variação MoM)"

  - "Receita por produto"

  - "Receita por canal"

  - "Top 10 clientes (anonimizados)"
📊 Dashboard 4 — Qualidade Mensal
yaml

Copy
frequencia: "Mensal"

widgets:

  - "KPI 15: NPS (variação MoM)"

  - "Churn rate (gráfico 12 meses)"

  - "Tabela de coorte (últimos 6 meses)"

  - "Heatmap de retenção"

  - "Tickets de suporte (categorizados)"
📊 Dashboard 5 — Campanhas Ativas
yaml

Copy
frequencia: "Tempo real"

widgets:

  - "Campanhas rodando (nome, status, budget)"

  - "ROAS por campanha (tempo real)"

  - "Pacing de budget (gasto vs planejado)"

  - "Alertas: campanhas com ROAS < 1.5"
📦 Asset (Sistema de Alertas)
yaml

Copy
alertas_criticos:

  - "CPA 50% acima da meta → notificar time"

  - "CVR checkout < 10% → investigar checkout"

  - "Open rate email < 20% → problema de deliverability"

  - "Site offline (>5min) → SMS + ligar"


alertas_warning:

  - "Frequência de ad > 3 → fadiga, renovar criativo"

  - "CPL subindo 20% semana vs semana → revisar"

  - "Churn mensal > 8% → acionar CS"

  - "MRR caindo 2 semanas seguidas → escalar"


frequencia:

  criticos: "Imediato (push, SMS)"

  warning: "Diário (e-mail matinal)"
📊 Métricas de Sucesso
Métrica	Meta
Decisões tomadas com dado	80%+
Tempo de detecção de problema	≤ 24h
Tempo de ação pós-detecção	≤ 72h
KPIs revisados	diariamente
ROI da análise	≥ 10x
⚠️ Riscos & Anti-patterns

❌ Muitos KPIs (50+ no dashboard) → paralisia

❌ KPI de vaidade (curtidas, impressões) → ignora receita

❌ Não definir meta → sem balizamento

❌ Olhar sem agir (dashboard decorativo)

❌ Métricas conflitantes (crescimento vs margem)

✅ 5-10 KPIs por dashboard

✅ Metas SMART (específicas, mensuráveis)

✅ Alertas automatizados (não esperar relatório)

✅ Revisão semanal (5-10 min) + ação

🔗 Próximas ferramentas

→ tools/analytics/03-funis-conversao.md — funil completo

→ tools/analytics/05-coorte-churn.md — retenção

→ tools/automation/04-pixel-eventos.md — tracking

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus

Analytics 6/6 prontas. Agora automation/ — 7 ferramentas.


Edited 7 file(s), Used 1 tool(s)

todowrite
todowrite
Input
{
  "todos": [
    {
      "content": "Clonar repositório e revisar contexto (sincronizado da execução anterior)",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/tools/copy/ — 12 ferramentas (lab-quality-standard)",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/tools/marketing/ — 8 ferramentas",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/tools/analytics/ — 6 ferramentas",
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/tools/automation/ — 7 ferramentas",
      "status": "in_progress",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/tools/design/ — 5 ferramentas",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/prompts/ — 3 categorias (copywriting, analise, estrategia)",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Lab-Nexus/templates/ — 3 categorias (email, landing, social)",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Lab-Nexus/workflows/ — n8n + make",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Lib-Nexus/knowledge-base/ — glossário, IOAID, taxonomia, LGPD",
      "status": "pending",
      "priority": "high"
    },
    {
      "content": "Lib-Nexus/agents-specs/ — base, marketing, judge, federation-gate",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Lib-Nexus/api-docs/ — tRPC, webhooks, REST",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Lib-Nexus/best-practices/ — prompt-engineering, error-handling, performance",
      "status": "pending",
      "priority": "medium"
    },
    {
      "content": "Commit final e push para Nexus-HUB57/MMN_AI-to-AI",
      "status": "pending",
      "priority": "high"
    }
  ]
}
Result
[
  {
    "content": "Clonar repositório e revisar contexto (sincronizado da execução anterior)",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/tools/copy/ — 12 ferramentas (lab-quality-standard)",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/tools/marketing/ — 8 ferramentas",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/tools/analytics/ — 6 ferramentas",
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/tools/automation/ — 7 ferramentas",
    "status": "in_progress",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/tools/design/ — 5 ferramentas",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/prompts/ — 3 categorias (copywriting, analise, estrategia)",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Lab-Nexus/templates/ — 3 categorias (email, landing, social)",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Lab-Nexus/workflows/ — n8n + make",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Lib-Nexus/knowledge-base/ — glossário, IOAID, taxonomia, LGPD",
    "status": "pending",
    "priority": "high"
  },
  {
    "content": "Lib-Nexus/agents-specs/ — base, marketing, judge, federation-gate",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Lib-Nexus/api-docs/ — tRPC, webhooks, REST",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Lib-Nexus/best-practices/ — prompt-engineering, error-handling, performance",
    "status": "pending",
    "priority": "medium"
  },
  {
    "content": "Commit final e push para Nexus-HUB57/MMN_AI-to-AI",
    "status": "pending",
    "priority": "high"
  }
]
