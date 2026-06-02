title: "07 · Recuperador de Carrinho"
description: "Sistema automatizado de recuperação de carrinho abandonado (e-mail + WhatsApp + ads)"
tags: [lab-nexus, automation, carrinho, recuperacao, abandoned-cart]
category: automation
level: master
estimated_time: "60 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: lifecycle-orchestrator
course_anchor: cursos/master/01-funis-lifecycle.md
🛒 07 · Recuperador de Carrinho Abandonado
Sistema completo de recuperação (3 canais: e-mail + WhatsApp + retargeting) com taxa de recuperação média de 12-18%.

🎯 Spec
Atributo	Valor
O que é	Sistema de 3 canais (e-mail, WhatsApp, retargeting) + templates + automação
Quando usar	E-commerce, infoproduto, SaaS com checkout
Pré-requisitos	Nível 🥇 Master; pixel instalado; gateway integrado; base de leads
Tempo estimado	60 min setup + monitoramento semanal
Skill que executa	lifecycle-orchestrator
Judge que valida	judge-revisor
📋 Playbook — A Jornada de Recuperação
Os 4 Estágios + Janela de Tempo
yaml

Copy
carrinho_criado:

  gatilho: "Lead adicionou produto ao carrinho"

  acao: "Tag 'carrinho-ativo', iniciar timer"

  sem_delay: true


checkout_iniciado:

  gatilho: "Lead preencheu dados de checkout"

  acao: "Tag 'checkout-iniciado'"

  sem_delay: true


carrinho_abandonado:

  gatilho: "checkout_iniciado SEM purchase em 1h"

  acao: "Iniciar fluxo de recuperação"

  delay: "1h após abandono"

  

recuperado:

  gatilho: "purchase APÓS carrinho abandonado"

  acao: "Sair do fluxo de recuperação"
📦 Asset (Fluxo de 3 Canais)
📊 Toque 1 — E-mail 1h (Lembrete)
yaml

Copy
delay: "1h após abandono"

canal: "E-mail"

template: "01-carrinho-lembrete"

copy: |

  Assunto: "{{nome}}, esqueceu algo no carrinho?"

  

  Oi {{primeiro_nome}},

  

  Notei que você iniciou a compra de {{produto}} mas não finalizou.

  

  O produto está reservado por mais 24h.

  

  👉 Continuar: {{link_carrinho}}

  

  {{seu_nome}}

saida: "Se comprar, sair"
📊 Toque 2 — WhatsApp 4h (Pessoal)
yaml

Copy
delay: "4h após abandono"

canal: "WhatsApp"

template: "02-carrinho-whatsapp"

copy: |

  Oi {{primeiro_nome}}! 👋

  

  Vi que você estava de olho em {{produto}}.

  

  Posso te fazer uma rápida pergunta?

  Tá com alguma dúvida?

  

  Se quiser, posso te mandar um cupom exclusivo: VOLTAI10

  

  — Responde "QUERO" e mando o link com desconto.

  

  Ou SAIR se não for o momento. 🙂

saida: "Se comprar, sair"
📊 Toque 3 — E-mail 24h (Prova Social)
yaml

Copy
delay: "24h após abandono"

canal: "E-mail"

template: "03-carrinho-prova"

copy: |

  Assunto: "{{X}} pessoas compraram {{produto}} hoje"

  

  {{primeiro_nome}},

  

  Nos últimos 7 dias, {{X}} pessoas garantiram {{produto}}.

  

  ({{link_depoimentos}})

  

  Bônus de volta (válido por 24h):

  🎁 {{brinde_surpresa}}

  

  👉 {{link_carrinho_com_bonus}}

saida: "Se comprar, sair"
📊 Toque 4 — Retargeting Ad (D+1)
yaml

Copy
delay: "D+1 (24h após abandono)"

canal: "Meta/Google Retargeting"

tipo: "Audience custom"

copy: |

  "{{primeiro_nome}}, sua oferta exclusiva está esperando.

  10% OFF só pra você voltar: {{link_carrinho_com_desconto}}"

budget: "R$ 50-200/dia (depende do volume)"

saida: "Se comprar OU após 7 dias, sair"
📊 Toque 5 — E-mail 72h (Última Chamada)
yaml

Copy
delay: "72h após abandono"

canal: "E-mail"

template: "05-carrinho-ultimo"

copy: |

  Assunto: "Última chance, {{primeiro_nome}}"

  

  Esse é meu último e-mail sobre {{produto}}.

  

  Se decidir não comprar, seu lugar vai ser liberado.

  

  Mas se ainda quiser:

  ✅ Acesso vitalício

  🎁 {{brinde}}

  

  👉 {{link_final}}

saida: "Se comprar, sair (definitivo)"
📦 Asset (Implementação — n8n Workflow)
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

                "rightValue": "checkout_start",

                "operator": {"type": "string", "operation": "equals"}

              }

            ]

          }

        }

      },

      "name": "Webhook: Checkout Start",

      "type": "n8n-nodes-base.webhook",

      "position": [250, 300]

    },

    {

      "parameters": {

        "operation": "upsert",

        "email": "={{$json.email}}",

        "tags": ["carrinho-ativo", "produto-{{$json.product_id}}"]

      },

      "name": "Tag Carrinho",

      "type": "n8n-nodes-base.activeCampaign",

      "position": [450, 300]

    },

    {

      "parameters": {

        "amount": 1,

        "unit": "hours"

      },

      "name": "Wait 1h",

      "type": "n8n-nodes-base.wait",

      "position": [650, 300],

      "webhookId": "wait-1h"

    },

    {

      "parameters": {

        "conditions": {

          "conditions": [

            {

              "leftValue": "={{$json.event}}",

              "rightValue": "purchase",

              "operator": {"type": "string", "operation": "notEqual"}

            }

          ]

        }

      },

      "name": "Comprou?",

      "type": "n8n-nodes-base.if",

      "position": [850, 300]

    },

    {

      "parameters": {

        "fromEmail": "noreply@nexus.com.br",

        "toEmail": "={{$json.email}}",

        "subject": "{{primeiro_nome}}, esqueceu algo?",

        "html": "..."

      },

      "name": "E-mail Toque 1",

      "type": "n8n-nodes-base.emailSend",

      "position": [1050, 200]

    }

  ]

}
📦 Asset (Segmentação para Retargeting)
📊 Custom Audience — Meta
yaml

Copy
nome: "Carrinho Abandonado 7d"

regra: |

  Incluir pessoas que:

  - Dispararam evento 'InitiateCheckout' nos últimos 7 dias

  - NÃO dispararam evento 'Purchase' desde o InitiateCheckout

  

tamanho_estimado: "5-15% dos checkouts iniciados"

exclusao: "Pessoas que compraram (evento Purchase)"

lookalike: "Criar LAL 1% deste segmento para escalar"
📊 Custom Audience — Google
yaml

Copy
nome: "Cart Abandoners"

regra: |

  Página: /checkout

  Incluir se: visitou nos últimos 7 dias

  Excluir: páginas /obrigado, /confirmacao
📦 Asset (Cálculo de ROI do Recuperador)
python

Copy
def recovery_roi(recovered_orders, avg_ticket, total_cost_recovery):

    revenue = recovered_orders * avg_ticket

    roi = (revenue - total_cost_recovery) / total_cost_recovery

    return {

        'recovered_orders': recovered_orders,

        'revenue': revenue,

        'total_cost': total_cost_recovery,

        'roi': roi

    }


# Exemplo

result = recovery_roi(

    recovered_orders=15,    # 15 vendas recuperadas

    avg_ticket=497,          # R$ 497

    total_cost_recovery=200  # Custo de e-mail + ads + WhatsApp

)

print(f"Receita recuperada: R$ {result['revenue']}")

print(f"ROI: {result['roi'] * 100:.0f}%")

# Receita: R$ 7455

# ROI: 3627%
📊 Métricas de Sucesso
Métrica	Meta
Taxa de recuperação (e-mail)	≥ 8%
Taxa de recuperação (WhatsApp)	≥ 15%
Taxa de recuperação (ads)	≥ 5%
Taxa global (todos canais)	≥ 12%
Receita recuperada / mês	≥ 15% da receita direta
ROI do sistema	≥ 10x
⚠️ Riscos & Anti-patterns

❌ Mais de 5 toques → spam

❌ Sem saída condicional (compra = ainda recebe) → irritação

❌ E-mail com link quebrado → perdido

❌ Bônus falso (aumenta preço antes) → quebra confiança

❌ WhatsApp sem opt-in → ban

❌ Retargeting sem excluir compradores → gasto desperdiçado

✅ 3-5 toques é o sweet spot

✅ Saída imediata na compra

✅ Testar todos os links antes

✅ WhatsApp com opt-in duplo

✅ Custom audience exclui compradores

🔗 Próximas ferramentas

→ tools/automation/01-webhooks-payload.md — integração

→ tools/automation/02-triggers-eventos.md — eventos

→ tools/copy/08-msg-carrinho-abandonado.md — copy

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus

7 automation tools prontas. Agora design/ — 5 ferramentas.


Edited 5 file(s), Used 1 tool(s)

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
      "status": "completed",
      "priority": "high"
    },
    {
      "content": "Lab-Nexus/tools/design/ — 5 ferramentas",
      "status": "in_progress",
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
  ]...
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
    "status": "completed",
    "priority": "high"
  },
  {
    "content": "Lab-Nexus/tools/design/ — 5 ferramentas",
    "status": "in_progress",
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