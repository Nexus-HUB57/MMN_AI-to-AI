---
title: "02-triggers-eventos"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-24
status: official
---

title: "02 · Triggers de Eventos"
description: "Como criar automações baseadas em eventos (gatilhos) com n8n e Make"
tags: [lab-nexus, automation, triggers, eventos, n8n, make]
category: automation
level: agente
estimated_time: "20 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: lifecycle-orchestrator
course_anchor: cursos/master/01-funis-lifecycle.md
⚡ 02 · Triggers de Eventos
20 triggers de eventos essenciais + templates n8n/Make + boas práticas de automação orientada a eventos.

🎯 Spec
Atributo	Valor
O que é	Catálogo de 20 triggers + templates prontos para n8n/Make
Quando usar	Configurar automações lifecycle, recovery, segmentação
Pré-requisitos	Nível 🥈 Agente; ferramenta de automação (n8n, Make, Zapier)
Tempo estimado	20 min para configurar 1 trigger
Skill que executa	lifecycle-orchestrator
Judge que valida	compliance-auditor
📋 Playbook — Anatomia de um Trigger
yaml

Copy
trigger:

  evento: "O que aconteceu (ex: 'compra aprovada')"

  filtro: "Condições adicionais (ex: 'valor > R$ 200')"

  acao: "O que fazer (ex: 'enviar e-mail, tag, slack')"

  delay: "Tempo de espera (ex: 'imediatamente, +1h, +24h')"

  condicao_saida: "Como sair do fluxo (ex: 'já comprou')"
📦 Asset (20 Triggers Essenciais)
🛒 E-commerce / Venda
yaml

Copy
1_compra_aprovada:

  evento: "Hotmart/Kiwify/Stripe: PURCHASE_APPROVED"

  acao: "Tag 'cliente', enviar e-mail boas-vindas, adicionar ao grupo WA"

  delay: "Imediato"

  saida: "Se já cliente, não enviar"


2_compra_recusada:

  evento: "Gateway: PAYMENT_REFUSED"

  acao: "Enviar e-mail 'problema no pagamento', tag 'recusado'"

  delay: "Imediato"

  saida: "—"


3_carrinho_abandonado:

  evento: "Carrinho: checkout_start sem purchase em 1h"

  acao: "Sequência 3 e-mails (1h, 24h, 72h)"

  delay: "1h, 24h, 72h"

  saida: "Se comprar, sair do fluxo"


4_assinatura_renewed:

  evento: "Stripe: invoice.payment_succeeded (recurring)"

  acao: "Tag 'cliente-ativo', e-mail de agradecimento, atualizar LTV"

  delay: "Imediato"

  saida: "—"


5_assinatura_canceled:

  evento: "Stripe: customer.subscription.deleted"

  acao: "Tag 'cancelou', e-mail feedback 1 pergunta, exit survey"

  delay: "Imediato + D+7 feedback"

  saida: "—"


6_charge_refunded:

  evento: "Stripe: charge.refunded"

  acao: "Tag 'reembolso', e-mail 'como podemos melhorar', remover acesso"

  delay: "Imediato"

  saida: "—"
📧 E-mail Marketing
yaml

Copy
7_email_aberto_3x:

  evento: "Lead abriu 3+ e-mails em 7 dias"

  acao: "Tag 'engajado', mover para lista VIP, oferta prioritária"

  delay: "Imediato após 3º open"

  saida: "—"


8_email_NAO_aberto_60d:

  evento: "Lead não abriu nenhum e-mail em 60 dias"

  acao: "Tag 'inativo', mover para lista hibernação, reativação leve"

  delay: "Após 60 dias"

  saida: "Se descadastrar, remover"


9_click_no_link:

  evento: "Lead clicou em link específico (ex: 'preço')"

  acao: "Tag 'alta-intencao', enviar e-mail closer 1:1"

  delay: "Imediato"

  saida: "Se converter, mover para 'cliente'"


10_unsubscribe:

  evento: "Lead clicou em unsubscribe"

  acao: "Tag 'descadastrado', mover para lista suprimida, parar tudo"

  delay: "Imediato"

  saida: "Não enviar NADA (risco LGPD)"
📱 WhatsApp / SMS
yaml

Copy
11_wa_recebido:

  evento: "Lead respondeu WhatsApp"

  acao: "Notificar vendedor, criar ticket, score +1"

  delay: "Imediato"

  saida: "—"


12_wa_optout:

  evento: "Lead respondeu 'SAIR' ou 'PARAR' no WhatsApp"

  acao: "Tag 'descadastrado-wa', remover do grupo, parar sequência"

  delay: "Imediato"

  saida: "Não enviar NADA"


13_wa_resposta_24h_sem_resposta:

  evento: "Mensagem WA enviada há 24h sem resposta"

  acao: "Follow-up 1: 'ainda tem interesse?'"

  delay: "24h"

  saida: "Se responder, sair"
🌐 Web / Comportamento
yaml

Copy
14_visitou_pagina_preco:

  evento: "Usuário visitou /pricing ou /comprar"

  acao: "Tag 'alta-intencao', e-mail closer, retargeting ad"

  delay: "Imediato"

  saida: "—"


15_inatividade_7d:

  evento: "Usuário logado não abriu em 7 dias"

  acao: "Push notification 'sentimos sua falta', e-mail 'volte'"

  delay: "D+7"

  saida: "Se voltar, sair"


16_visualizou_50_video:

  evento: "Usuário assistiu 50% do vídeo de vendas"

  acao: "Tag 'morno', e-mail 'ainda tem dúvida?', retargeting"

  delay: "Imediato"

  saida: "Se comprar, sair"
🎂 Datas Especiais
yaml

Copy
17_aniversario:

  evento: "Data de nascimento do lead (LeadLovers/CRM)"

  acao: "E-mail 'parabéns' + brinde ou cupom"

  delay: "No dia, 9h"

  saida: "—"


18_aniversario_compra:

  evento: "1 ano desde a 1ª compra do cliente"

  acao: "E-mail 'faz 1 ano!', oferta especial, pedido de indicação"

  delay: "Aniversário, 9h"

  saida: "—"
🏆 Comportamento Avançado
yaml

Copy
19_recomendou_3_amigos:

  evento: "Cliente indicou 3 amigos (com compra)"

  acao: "Brinde surpresa, tag 'evangelista', acesso VIP vitalício"

  delay: "Imediato após 3ª indicação"

  saida: "—"


20_alto_ltv:

  evento: "Cliente atingiu R$ X em LTV"

  acao: "Convidar para comunidade VIP, programa de afiliados, presente"

  delay: "Imediato"

  saida: "—"
📦 Asset (Template n8n — JSON)
json

Copy
{

  "nodes": [

    {

      "parameters": {

        "rule": {

          "value": 1,

          "conditions": {

            "conditions": [

              {

                "leftValue": "={{$json.event}}",

                "rightValue": "PURCHASE_APPROVED",

                "operator": {"type": "string", "operation": "equals"}

              }

            ]

          }

        }

      },

      "name": "Hotmart Webhook",

      "type": "n8n-nodes-base.webhook",

      "typeVersion": 1,

      "position": [250, 300]

    },

    {

      "parameters": {

        "functionCode": "const purchase = items[0].json.data.purchase;\nreturn [{ json: { email: purchase.buyer.email, product: purchase.product.ucode, affiliate: purchase.affiliate?.ucode } }];"

      },

      "name": "Extract Data",

      "type": "n8n-nodes-base.function",

      "position": [450, 300]

    },

    {

      "parameters": {

        "operation": "upsert",

        "email": "={{$json.email}}",

        "tags": ["cliente", "{{$json.product}}"]

      },

      "name": "Add to CRM",

      "type": "n8n-nodes-base.activeCampaign",

      "position": [650, 300]

    },

    {

      "parameters": {

        "fromEmail": "boas-vindas@nexus.com.br",

        "toEmail": "={{$json.email}}",

        "subject": "Bem-vindo(a) ao {{$json.product}}!",

        "html": "<h1>Oi!</h1><p>Seu acesso está liberado.</p>"

      },

      "name": "Send Welcome",

      "type": "n8n-nodes-base.emailSend",

      "position": [850, 300]

    }

  ],

  "connections": {

    "Hotmart Webhook": {"main": [[{"node": "Extract Data", "type": "main", "index": 0}]]},

    "Extract Data": {"main": [[{"node": "Add to CRM", "type": "main", "index": 0}]]},

    "Add to CRM": {"main": [[{"node": "Send Welcome", "type": "main", "index": 0}]]}

  }

}
📦 Asset (Template Make — Scenario JSON)
json

Copy
{

  "name": "Carrinho Abandonado",

  "flow": [

    {

      "module": "shopify:watchOrders",

      "filter": { "status": "abandoned" }

    },

    {

      "module": "builtin:basicRouter",

      "filter": { "if": "{{cart.total > 100}}" }

    },

    {

      "module": "mailchimp:sendEmail",

      "mapper": {

        "to": "{{customer.email}}",

        "subject": "Esqueceu algo?",

        "templateId": 123

      }

    },

    {

      "module": "builtin:sleep",

      "mapper": { "delay": 86400 }

    },

    {

      "module": "mailchimp:sendEmail",

      "mapper": {

        "to": "{{customer.email}}",

        "subject": "Volta por aqui...",

        "templateId": 124

      }

    }

  ]

}
📊 Métricas de Sucesso
Métrica	Meta
Triggers ativos	≥ 10
Conversão de carrinho abandonado	≥ 12%
Tempo de resposta pós-evento	≤ 1h
Taxa de erro de trigger	≤ 1%
ROI da automação	≥ 5x
⚠️ Riscos & Anti-patterns

❌ Trigger sem condição de saída → loop infinito

❌ Múltiplos triggers para mesmo evento → duplicação

❌ Trigger sem filtro → envia para todos

❌ Sem teste em sandbox → desastre em produção

❌ Logs sem rastreamento → impossível debugar

❌ Webhook de opt-out ignorado → LGPD + CONAR

✅ Sempre ter condição de saída

✅ Centralizar em 1 ferramenta (n8n OU Make)

✅ Logs estruturados

✅ Testar em ambiente de staging

🔗 Próximas ferramentas

→ tools/automation/01-webhooks-payload.md — integração

→ tools/automation/03-disparador-whatsapp.md — WhatsApp

→ tools/automation/04-pixel-eventos.md — tracking

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus