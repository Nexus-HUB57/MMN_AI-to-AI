---
title: "05-segmentacao-lista"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

title: "05 · Segmentação de Lista"
description: "Como segmentar lista de e-mail/WhatsApp para campanhas eficazes"
tags: [lab-nexus, marketing, segmentacao, lista, email, whatsapp]
category: marketing
level: fundamental
estimated_time: "20 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: audience-segmenter
course_anchor: cursos/agente/01-skills-essenciais.md
📋 05 · Segmentação de Lista
7 critérios de segmentação + scripts SQL para criar audiências personalizadas. Aumenta open rate em 30-60%.

🎯 Spec
Atributo	Valor
O que é	Framework de segmentação por 7 critérios + queries SQL prontas
Quando usar	Antes de cada campanha, para evitar "tiro de chumbo"
Pré-requisitos	Nível 🥉 Fundamental; CRM/pop-up com dados
Tempo estimado	20 min para criar 1 segmento
Skill que executa	audience-segmenter
Judge que valida	judge-revisor
📋 Playbook — Os 7 Critérios de Segmentação
1. Demográfico
yaml

Copy
variaveis: ["idade", "genero", "localizacao", "estado_civil", "escolaridade", "renda"]

uso: "Customizar copy + canal + oferta"

exemplo: "Mulheres, 25-35, SP/RJ, solteiras → copy com tom de conquista"
2. Comportamental (no produto)
yaml

Copy
variaveis: ["ultimo_login", "paginais_visitadas", "tempo_no_site", "features_usadas"]

uso: "Reativar inativos, upsell, onboarding"

exemplo: "Não loga há 30 dias + usou feature X → e-mail de reativação"
3. Por Origem (UTM/Canal)
yaml

Copy
variaveis: ["utm_source", "utm_campaign", "referrer", "primeira_interacao"]

uso: "Mensagem por canal de aquisição"

exemplo: "Veio do YouTube → copy com prova do criador; veio do Facebook → copy com prova social"
4. Por Estágio do Funil
yaml

Copy
variaveis: ["lead_magnet_baixado", "demo_agendada", "carrinho_abandonado", "comprou"]

uso: "Mover para próximo estágio com mensagem certa"

exemplo: "Baixou lead magnet → sequência de nutrição 5 e-mails"
5. Por Valor Monetário (RFM lite)
yaml

Copy
variaveis: ["ltv", "ultima_compra_valor", "ticket_medio", "frequencia_compra"]

uso: "Priorizar e personalizar oferta"

exemplo: "LTV > R$ 500 → early access; LTV < R$ 100 → reativação"
6. Por Engajamento (Score próprio)
yaml

Copy
variaveis: ["open_rate_historico", "click_rate_historico", "respostas", "compartilhamentos"]

uso: "Limpar lista inativa, recompensar engajados"

exemplo: "Open rate < 10% nos últimos 90 dias → remoção da lista principal"
7. Por Preferência Declarada
yaml

Copy
variaveis: ["interesses_marcados", "preferencias_no_onboarding", "respostas_pesquisa"]

uso: "Conteúdo + produto certo para a pessoa"

exemplo: "Marcou interesse em 'infoproduto' → segmentar para funil específico"
📦 Asset (SQL Queries Prontas)
📊 Segmento 1: Inativos (limpar lista)
sql

Copy
SELECT user_id, email

FROM users

WHERE last_open_at < NOW() - INTERVAL '90 days'

   OR last_open_at IS NULL;

-- Resultado: mover para campanha de reativação
📊 Segmento 2: Engajados (early access)
sql

Copy
SELECT user_id, email

FROM users

WHERE last_open_at > NOW() - INTERVAL '14 days'

  AND open_count_30d >= 3;

-- Resultado: enviar oferta VIP antes da abertura oficial
📊 Segmento 3: Carrinho Abandonado
sql

Copy
SELECT DISTINCT u.user_id, u.email, c.cart_total

FROM users u

JOIN cart_events c ON c.user_id = u.user_id

WHERE c.event = 'abandoned'

  AND c.created_at > NOW() - INTERVAL '24 hours'

  AND NOT EXISTS (

    SELECT 1 FROM orders o

    WHERE o.user_id = u.user_id

      AND o.created_at > c.created_at

  );

-- Resultado: enviar sequência de recuperação
📊 Segmento 4: LTV Alto
sql

Copy
SELECT user_id, email, SUM(amount) AS ltv

FROM orders

WHERE status = 'paid'

  AND created_at > NOW() - INTERVAL '12 months'

GROUP BY user_id, email

HAVING SUM(amount) >= 1000;

-- Resultado: programa VIP + early access + convites eventos
📊 Segmento 5: Origem YouTube
sql

Copy
SELECT user_id, email

FROM users

WHERE first_touch_source = 'youtube'

  AND status = 'subscribed';

-- Resultado: copy referenciando o vídeo, prova do criador
📦 Asset (Planilha Modelo)
csv

Copy
Segmento,Critério,Canal,Mensagem Principal,Oferta,Frequência

"Inativos 90d","Último open > 90d",E-mail,"Sentimos sua falta",Bônus reativação,1x

"VIP","LTV > R$ 1k",E-mail + WhatsApp,"Você é VIP",Early access,2x/mês

"Carrinho","Cart ativo 24h",E-mail → WhatsApp,"Esqueceu algo?","Bônus de volta",3 toques

"YT subscriber","Origem YouTube",E-mail,"Como prometi no vídeo","Conteúdo exclusivo",1x/semana

"Lead frio novo","Último 7d, opt-in",E-mail nutrição,"Vamos começar?","Sequência 5 e-mails",automático
📊 Métricas de Sucesso
Métrica	Lista única	Lista segmentada
Open rate	15-20%	35-50%
CTR	1-2%	4-8%
Conversão	0.5%	2-5%
Unsub rate	1%+	< 0.3%
Spam report	0.1%+	< 0.05%
⚠️ Riscos & Anti-patterns

❌ 1 lista só ("todos os leads") → 90% ignora

❌ Segmentar demais (50 micro-segmentos) → inviável

❌ Atualizar segmentos manualmente → dados ficam velhos

❌ Segmentar só por demografia (não comportamental) → superficial

❌ Enviar para inativos sem critério → prejudica deliverability

✅ 3-7 segmentos principais + específicos sob demanda

✅ Atualizar automaticamente (diário ou semanal)

✅ Combinar 2-3 critérios (ex: inativo + alto LTV)

✅ Limpar lista a cada 90 dias

🔗 Próximas ferramentas

→ tools/marketing/02-segmentacao-rfm.md — RFM completo

→ tools/analytics/05-coorte-churn.md — combine com coorte

→ tools/automation/02-triggers-eventos.md — automação

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus