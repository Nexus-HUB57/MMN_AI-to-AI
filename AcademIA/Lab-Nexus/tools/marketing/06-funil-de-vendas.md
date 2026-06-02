title: "06 · Funil de Vendas Completo"
description: "Arquitetura de funil de alta conversão com 3 camadas (topo, meio, fundo)"
tags: [lab-nexus, marketing, funil, conversao, estrutura]
category: marketing
level: master
estimated_time: "60 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: funnel-architect
course_anchor: cursos/master/00-otimizacao-conversao.md
🔻 06 · Funil de Vendas Completo
Arquitetura completa de funil de 3 camadas + cálculo deUnit Economics + 3 exemplos de funis reais (infoproduto, SaaS, high-ticket).

🎯 Spec
Atributo	Valor
O que é	Framework de funil de 3 camadas + planilha de Unit Economics
Quando usar	Lançamento de produto, revisão de funil atual, expansão para novo canal
Pré-requisitos	Nível 🥇 Master; persona + oferta definidos; tráfego configurado
Tempo estimado	60 min para desenhar 1 funil completo
Skill que executa	funnel-architect
Judge que valida	judge-revisor
📋 Playbook — As 3 Camadas
1. 🏔️ TOPO (TOFU — Top of Funnel)
yaml

Copy
objetivo: "Geração de consciência + captura de lead"

canais: ["Facebook Ads", "Google Ads", "SEO", "YouTube", "TikTok Orgânico", "Indicação"]

conteudo_tipo: "Educativo, viral, baixo comprometimento"

exemplos: ["Posts", "Reels", "Vídeos YouTube", "Artigos SEO", "Lead magnets"]

metricas_chave: ["Alcance", "CTR", "CPL (custo por lead)", "Opt-in rate"]

meta_conversao: "15-30% visitante → lead"
2. 🏔️ MEIO (MOFU — Middle of Funnel)
yaml

Copy
objetivo: "Nutrição + qualificação + construção de autoridade"

canais: ["E-mail", "WhatsApp", "Webinar", "Comunidade", "Retargeting Ads"]

conteudo_tipo: "Autoridade, prova social, educação avançada"

exemplos: ["Sequência 5 e-mails", "Webinar", "Cases", "Calculadora", "Demo"]

metricas_chave: ["Open rate", "CTR e-mail", "Engajamento WhatsApp", "MQLs"]

meta_conversao: "10-20% lead → MQL (lead qualificado)"
3. 🏔️ FUNDO (BOFU — Bottom of Funnel)
yaml

Copy
objetivo: "Conversão + maximização de ticket"

canais: ["LP de vendas", "VSL", "1:1 call", "Carrinho otimizado", "Atendimento"]

conteudo_tipo: "Oferta, garantia, prova, urgência, escassez"

exemplos: ["VSL 18 min", "LP completa", "Calendly", "Carrinho", "WhatsApp closer"]

metricas_chave: ["LP conversion", "VSL completion", "Show-up rate", "CVR checkouts"]

meta_conversao: "2-5% MQL → cliente, 25-40% show-up → venda (high-ticket)"
📦 Asset (Planilha de Unit Economics)
📊 Template de Planilha
yaml

Copy
# INPUTS

aov: 497                  # Average Order Value

cac_pago: 80              # Custo de Aquisição pago (ads)

cac_total: 120            # Custo total (inclui ferramentas + equipe)

ltv_medio: 1200           # LTV em 12 meses

margem: 0.70              # 70% margem

churn_mensal: 0.05        # 5% ao mês

payback_meses: 1.5        # Em quantos meses recupera CAC


# SAÍDAS

ltv_cac_ratio: 10.0       # LTV/CAC — saudável > 3

cac_payback: 1.5          # Meses — saudável < 12

roi_12m: 8.5              # (LTV - CAC) / CAC — saudável > 3

lucro_por_cliente: 810    # LTV * margem - CAC
📊 Regra de ouro
Métrica	Insuficiente	Saudável	Excelente
LTV/CAC	< 2	3-5	> 5
CAC Payback	> 12 meses	6-12 meses	< 6 meses
Margem contribuição	< 30%	50-70%	> 70%
ROI 12 meses	< 100%	200-500%	> 500%
📦 Asset (3 Funis Reais)
🎯 Funil 1 — Infoproduto R$ 497
yaml

Copy
topo:

  canal: "Facebook Ads + Reels Orgânico"

  investimento: "R$ 5k/mês"

  leads: 1000

  cpl: 5

  optin: "E-book '7 erros de funil'"


meio:

  canal: "E-mail + WhatsApp"

  ferramenta: "LeadLovers + WhatsApp Business"

  mqls: 200

  taxa: "20% lead → MQL"

  copy: "Sequência 5 e-mails + 1 grupo WA"


fundo:

  canal: "VSL 18 min + LP"

  vendas: 50

  taxa: "25% MQL → venda"

  receita: 24850

  roi: "497%"


unit_economics:

  aov: 497

  cac_total: 100

  ltv: 1500

  ltv_cac: 15

  payback: 1.2
🎯 Funil 2 — SaaS R$ 97/mês
yaml

Copy
topo:

  canal: "SEO + Google Ads"

  investimento: "R$ 8k/mês"

  leads: 800

  cpl: 10

  optin: "Trial gratuito 14 dias"


meio:

  canal: "E-mail onboarding + in-app"

  ferramenta: "Customer.io + Intercom"

  trials_ativados: 400

  taxa: "50% lead → trial ativado"

  copy: "Sequência 7 e-mails + 3 in-app messages"


fundo:

  canal: "Trial + onboarding + exit popup"

  conversoes: 80

  taxa_pago: "10% lead → pago"

  mrr: 7760

  churn: "5%/mês"

  receita_12m: 93120


unit_economics:

  aov: 97

  cac_total: 100

  ltv: 1940   # 97 / 0.05

  ltv_cac: 19.4

  payback: 1.0
🎯 Funil 3 — Mentoria R$ 12k (High-Ticket)
yaml

Copy
topo:

  canal: "Webinar semanal (orgânico + ads)"

  investimento: "R$ 3k/mês"

  leads: 200

  cpl: 15

  optin: "Inscrição no webinar '5 passos para R$ 100k'"


meio:

  canal: "E-mail + WhatsApp + grupo VIP"

  ferramenta: "RD + WhatsApp + Skool"

  mqls: 80

  taxa: "40% lead → MQL"

  copy: "Sequência 5 e-mails + 5 mensagens WA + grupo"


fundo:

  canal: "Aplicação + 1:1 call"

  vendas: 8

  taxa: "10% MQL → venda"

  show_up_rate: "70%"

  receita: 96000

  roi: "3200%"


unit_economics:

  aov: 12000

  cac_total: 1500

  ltv: 36000   # 3 indicações

  ltv_cac: 24

  payback: 1.5
📊 Métricas de Sucesso
Métrica	Funil frio	Funil morno	Funil quente
Visitante → Lead	15-30%	35-50%	60-80%
Lead → MQL	10-20%	25-40%	50-70%
MQL → Cliente	2-5%	5-12%	15-30%
LTV/CAC	≥ 3	≥ 5	≥ 8
⚠️ Riscos & Anti-patterns

❌ Funil só de aquisição (sem retenção) → CAC sobe

❌ Tráfego frio direto para página de venda (sem nutrição) → CAC explode

❌ Copiar funil de concorrente → 1 ajuste de contexto pode quebrar

❌ Não medir por estágio → não sabe onde otimizar

❌ CAC > LTV → prejuízo estrutural

✅ Calcular Unit Economics ANTES de investir pesado

✅ Funil tem 3 camadas + retenção (4ª camada)

✅ Renovar copy por estágio mensalmente

✅ Testar 1 variável por vez (A/B rigoroso)

🔗 Próximas ferramentas

→ tools/analytics/03-funis-conversao.md — meça cada estágio

→ tools/marketing/03-mapa-jornada-cliente.md — combine com CJM

→ cursos/master/00-otimizacao-conversao.md — aprofunde

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus