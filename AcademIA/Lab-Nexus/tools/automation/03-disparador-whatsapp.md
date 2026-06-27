---
title: "03-disparador-whatsapp"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

title: "03 · Disparador de WhatsApp"
description: "Como configurar disparo em massa no WhatsApp Business com aquecimento e LGPD"
tags: [lab-nexus, automation, whatsapp, disparo, aquecimento]
category: automation
level: agente
estimated_time: "45 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: auto-publisher
course_anchor: cursos/agente/02-disparo-whatsapp.md
📱 03 · Disparador de WhatsApp
Setup completo de WhatsApp Business API (oficial) + UA APIs parceiras + estratégia de aquecimento (warm-up) e LGPD.

🎯 Spec
Atributo	Valor
O que é	Guia de setup + estratégia de aquecimento + templates de mensagem
Quando usar	Iniciar prospecção, escalar atendimento, suporte automatizado
Pré-requisitos	Nível 🥈 Agente; CNPJ; opt-in dos leads
Tempo estimado	45 min setup + 14-30 dias para aquecimento
Skill que executa	auto-publisher
Judge que valida	compliance-auditor + judge-revisor
⚠️ LGPD + Risco de Ban
yaml

Copy
obrigatorio:

  - "Opt-in EXPLÍCITO do lead (art. 7º, I)"

  - "Opção SAIR em toda mensagem"

  - "Não enviar entre 21h e 9h"

  - "Não enviar conteúdo não solicitado"


risco_ban:

  - "Volume inicial alto (>100/dia) → ban permanente"

  - "Muitos reports (5%+ da base) → restrição"

  - "Conteúdo igualitário copiado → spam"

  - "Usar WhatsApp pessoal para disparos → ban pessoal"
📋 Playbook — Os 3 Modelos de Disparo
1. WhatsApp Business API (Oficial Meta)
yaml

Copy
descricao: "API oficial, mais seguro, mas requer aprovação de templates"

provedores: ["Meta Cloud API", "Twilio", "Zenvia", "Take Blip"]

custo: "R$ 0.05-0.15 por mensagem + taxa mensal"

template_approval: "Templates precisam ser aprovados pela Meta (24-48h)"

limites: "1000 conversas gratuitas/mês (utility), depois pago"
2. UA (Unofficial API) — Não Recomendado
yaml

Copy
descricao: "Bypass da API oficial, mais barato mas com risco ALTO de ban"

provedores: ["Baileys", "whatsapp-web.js", "Venom"]

custo: "Baixo, mas..."

riscos: "Ban permanente (pessoal ou número), sem suporte, sem LGPD compliance"

veredito: "NÃO RECOMENDADO. Não usar para clientes Nexus."
3. Plataformas de Terceiros (UA Wrapped)
yaml

Copy
descricao: "UA com interface gráfica + aquecimento integrado"

provedores: ["WPPConnect", "Whaticket", "Chatwoot + UA"]

custo: "R$ 50-300/mês"

riscos: "Médio (depende do provedor)"

recomendado_para: "Pequenos volumes, baixo orçamento"
📦 Asset (Setup WhatsApp Business API)
📋 Passo a Passo (Meta Cloud API)
yaml

Copy
1_criar_app_meta:

  - "Acesse developers.facebook.com"

  - "Crie app tipo 'Business'"

  - "Adicione produto 'WhatsApp'"

  - "Anote: WABA ID, Phone Number ID, Business ID"


2_configurar_numero:

  - "Verifique seu número (SMS ou chamada)"

  - "Display name aprovado em 24h"

  - "Quality rating deve estar 'Medium' ou 'High'"


3_criar_templates:

  tipo: "Marketing (promoções) ou Utility (transacional)"

  revisao: "24-48h para aprovação"

  exemplo_utility: |

    {

      "name": "boas_vindas_nexus",

      "category": "UTILITY",

      "language": "pt_BR",

      "components": [

        {

          "type": "body",

          "text": "Olá {{1}}! Bem-vindo(a) ao Nexus. Seu acesso: {{2}}"

        }

      ]

    }


4_configurar_webhook:

  url: "https://api.nexus.com.br/webhooks/whatsapp"

  eventos: ["messages", "message_status"]


5_testar:

  - "Enviar template aprovado para seu próprio número"

  - "Verificar se webhook recebe status"

  - "Validar fluxo completo"
📦 Exemplo TypeScript — Envio de Mensagem
typescript

Copy
// /backend/src/integrations/whatsapp/sendMessage.ts

import axios from 'axios';


const META_API_URL = `https://graph.facebook.com/v18.0/${process.env.WA_PHONE_ID}/messages`;

const META_TOKEN = process.env.WA_TOKEN!;


export async function sendWhatsAppTemplate(

  to: string,

  templateName: string,

  params: string[]

) {

  const response = await axios.post(

    META_API_URL,

    {

      messaging_product: 'whatsapp',

      to,

      type: 'template',

      template: {

        name: templateName,

        language: { code: 'pt_BR' },

        components: [

          {

            type: 'body',

            parameters: params.map(text => ({ type: 'text', text }))

          }

        ]

      }

    },

    {

      headers: { Authorization: `Bearer ${META_TOKEN}` }

    }

  );

  return response.data;

}
📦 Asset (Estratégia de Aquecimento — 30 dias)
🔥 Plano de Warm-up
yaml

Copy
dia_1_7:

  volume: "20-50 msgs/dia"

  acoes:

    - "Atender 1:1 (responder leads reais)"

    - "Pedir feedback de quem já comprou"

    - "NÃO fazer disparo em massa"

  meta: "Quality rating 'High'"


dia_8_14:

  volume: "100-200 msgs/dia"

  acoes:

    - "Disparar para leads com opt-in recente (últimos 30 dias)"

    - "Templates transacionais (utility)"

    - "Monitorar taxa de resposta"

  meta: "Manter Quality 'High'"


dia_15_21:

  volume: "300-500 msgs/dia"

  acoes:

    - "Disparar para base inteira (com opt-in)"

    - "Testar templates de marketing"

    - "Acompanhar bloqueios"

  meta: "Quality 'Medium' ou 'High'"


dia_22_30:

  volume: "500-1000 msgs/dia"

  acoes:

    - "Escalar para 1000+ (limite gratuito)"

    - "Segmentar por engagement"

    - "Reativar leads inativos"

  meta: "Sistema estável, ROI positivo"


regra_geral: |

  - "Nunca dobrar volume de um dia para o outro"

  - "Monitorar bloqueio (>0.5% é alerta vermelho)"

  - "Se Quality cair para 'Low', pausar e investigar"
📦 Asset (Templates de Mensagem Validados)
✅ Template 1 — Boas-vindas (UTILITY)
text

Copy
Olá {{1}}! 👋


Bem-vindo(a) ao {{2}}.


Seu acesso está liberado:

🔗 {{3}}


Qualquer dúvida, é só responder aqui.


— Equipe Nexus
✅ Template 2 — Lembrete de Compra (UTILITY)
text

Copy
Oi {{1}}!


Notamos que você deixou {{2}} no carrinho há {{3}} horas.


👉 Concluir compra: {{4}}


A oferta é válida por mais 24h.


— Nexus
✅ Template 3 — Promoção (MARKETING — aprovação mais rigorosa)
text

Copy
{{1}}, oferta exclusiva pra você! 🎁


{{2}} com {{3}}% OFF até {{4}}.


👉 {{5}}


Responda SAIR para não receber mais ofertas.
📊 Métricas de Sucesso
Métrica	Meta
Quality rating	'High'
Taxa de entrega	≥ 95%
Taxa de abertura (24h)	≥ 80%
Resposta	≥ 25%
Bloqueios/ban	0
ROI (receita gerada / custo WA)	≥ 5x
⚠️ Riscos & Anti-patterns

❌ Disparar sem opt-in → LGPD + ban

❌ Aquecer muito rápido → ban permanente

❌ UA API (Baileys, etc.) → ban pessoal

❌ Enviar à noite/fim de semana → 5x mais report

❌ Muitos links na mesma mensagem → filtro Meta

❌ Não ter opção SAIR → LGPD + report

✅ Opt-in duplo (confirmação antes de adicionar à base)

✅ Aquecimento gradual (30 dias)

✅ Usar templates aprovados

✅ Monitorar quality rating diariamente

🔗 Próximas ferramentas

→ tools/automation/01-webhooks-payload.md — receber eventos

→ tools/copy/04-whatsapp-persuasivo.md — scripts

→ playbooks/PB-WHATSAPP-operacao-diaria.md — operação

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus