---
title: "06-mensageria-instagram"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

title: "06 · Mensageria Instagram (DM)"
description: "Setup de DM automation com ManyChat + integração com CRM + qualificação"
tags: [lab-nexus, automation, instagram, dm, manychat]
category: automation
level: agente
estimated_time: "30 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: auto-publisher
course_anchor: cursos/agente/01-skills-essenciais.md
💬 06 · Mensageria Instagram (DM Automation)
Setup completo de ManyChat + integração com CRM + fluxo de qualificação + LGPD compliance.

🎯 Spec
Atributo	Valor
O que é	Guia de setup ManyChat + fluxos prontos + integrações
Quando usar	Iniciar prospecção no Instagram, automatizar qualificação
Pré-requisitos	Nível 🥈 Agente; conta Instagram Business; ManyChat Pro
Tempo estimado	30 min setup + 2h para criar fluxos
Skill que executa	auto-publisher
Judge que valida	compliance-auditor + judge-revisor
⚠️ Limites do Instagram
yaml

Copy
limites_oficiais:

  - "Resposta 24h após última mensagem do lead (após isso, só com template aprovado)"

  - "Volume: sem limite oficial, mas..."

  - "Janela: 7 dias após interação, sem re-engajamento fácil"

  - "API oficial: requer aprovação de use case (não é aberta)"


restricoes:

  - "Não enviar conteúdo não solicitado (spam → bloqueio)"

  - "Não coletar dados sensíveis (CPF, senha, etc.) via DM"

  - "Não fingir ser humano se for bot (Meta exige disclosure)"
📋 Playbook — Os 3 Modelos de DM Automation
1. ManyChat (Mais Popular)
yaml

Copy
descricao: "Plataforma visual de automação de DMs, suporta Instagram e Messenger"

preco: "Free (até 1k contatos), Pro (R$ 90/mês para 5k+)"

integracoes: ["CRM", "Email", "Google Sheets", "Zapier", "n8n", "Make"]

vantagens:

  - "Interface visual (drag and drop)"

  - "Templates prontos"

  - "Compliance Meta (oficial)"

desvantagens:

  - "Custo por contato"

  - "Limite de mensagens no plano free"
2. Chatfuel
yaml

Copy
descricao: "Concorrente do ManyChat, focado em vendas"

preco: "Free limitado, Pro a partir de R$ 80/mês"

integracoes: ["Shopify", "WooCommerce", "CRM"]
3. Custom (via Meta Graph API)
yaml

Copy
descricao: "API oficial, requer aprovação de use case"

preco: "Custo de dev (alto)"

integracoes: "Qualquer"

vantagens: "Totalmente customizável"

desvantagens: "Complexo, requer aprovação Meta"
📦 Asset (Setup ManyChat — Passo a Passo)
yaml

Copy
1_criar_conta:

  - "Acesse manychat.com"

  - "Sign up com Facebook"

  - "Conecte página do Instagram Business"

  - "Autorize permissões (mensagens, comentários, stories)"


2_configurar_conta:

  - "Adicione logo Nexus"

  - "Configure nome do bot (ex: 'Nexus Assistant')"

  - "Adicione disclosure (ex: 'Respostas automáticas, mas pode chamar humano')"

  - "Configure horário de atendimento humano"


3_criar_fluxo_principal:

  - "Settings → Flows → Create Flow"

  - "Trigger: 'Instagram → Comment with keyword'"

  - "Ações: Send DM → Ask question → Tag → Notify team"


4_testar:

  - "Modo Preview (não envia de verdade)"

  - "Testar com seu próprio perfil secundário"

  - "Validar todos os ramos do fluxo"
📦 Asset (5 Fluxos Prontos)
📊 Fluxo 1 — Lead via Comentário (Palavra-chave)
yaml

Copy
trigger: "Comentário com keyword '{{KEYWORD}}' no post"

passos:

  - delay: "0-2 min"

  - acao: "Enviar DM: 'Oi {{nome}}! Vi seu comentário sobre {{tema}}.'"

  - acao: "Aguardar 1 resposta do lead"

  - acao: "Enviar: 'Quer receber o material completo?'"

  - condicao: "Se 'sim' → enviar link do lead magnet + tag 'lead-quente'"

  - condicao: "Se 'não' → 'tudo bem, posso te chamar mais tarde?'"

  - condicao: "Se 'SAIR' → tag 'descadastrado' + parar tudo"
📊 Fluxo 2 — Lead via Story Resposta
yaml

Copy
trigger: "Story com enquete → lead respondeu"

passos:

  - delay: "Imediato"

  - acao: "DM: 'Obrigada por responder! {{pergunta_custom}}'"

  - acao: "Aguardar resposta"

  - condicao: "Se respondeu → tag 'engajado'"

  - acao: "Enviar próximo passo (link, agendamento, etc.)"
📊 Fluxo 3 — Recuperação de Inativo (D+7 sem interação)
yaml

Copy
trigger: "Lead na base, sem interação há 7 dias"

passos:

  - delay: "D+7, 19h"

  - acao: "DM: 'Oi {{nome}}, sumiu! Tá tudo bem?'"

  - condicao: "Se respondeu → tag 'reativado'"

  - condicao: "Se 'SAIR' → descadastrar"

  - condicao: "Se não respondeu em 24h → tag 'inativo-confirmado'"
📊 Fluxo 4 — Qualificação (3 perguntas)
yaml

Copy
trigger: "Lead aceitou material"

passos:

  - acao: "DM: 'Show! Pra eu te enviar o conteúdo certo, 3 perguntas rápidas:'"

  - pergunta_1: "Qual seu maior desafio com {{tema}}?"

  - pergunta_2: "Há quanto tempo você busca solução?"

  - pergunta_3: "Tem budget para investir?"

  - acao: "Salvar respostas como custom fields"

  - acao: "Calcular score (alto/médio/baixo)"

  - acao: "Roteamento: alto → notificar closer; médio → sequência nutrição; baixo → conteúdo gratuito"
📊 Fluxo 5 — Pós-compra (Obrigado + Onboarding)
yaml

Copy
trigger: "Compra aprovada (via webhook Hotmart/Kiwify)"

passos:

  - delay: "Imediato"

  - acao: "DM: 'Parabéns, {{nome}}! 🎉'"

  - acao: "Enviar acesso: link + tutorial"

  - acao: "Adicionar ao grupo de WhatsApp exclusivo"

  - delay: "D+3"

  - acao: "DM: 'Conseguiu acessar? Tem alguma dúvida?'"

  - condicao: "Se 'sim' → conectar com suporte humano"

  - condicao: "Se 'não' → tag 'engajado-compra'"
📦 Asset (Integração com CRM via Webhook)
typescript

Copy
// /backend/src/integrations/manychat/webhook.ts

import axios from 'axios';


const MANYCHAT_API_KEY = process.env.MANYCHAT_API_KEY!;


export async function sendManyChatDM(

  subscriberId: string,

  message: string,

  buttons?: { text: string; url?: string; action?: string }[]

) {

  const response = await axios.post(

    'https://api.manychat.com/fb/sending/sendContent',

    {

      subscriber_id: subscriberId,

      data: {

        version: 'v2',

        content: {

          messages: [

            {

              type: 'text',

              text: message,

              buttons: buttons?.map(b => ({

                type: b.url ? 'url' : 'flow',

                text: b.text,

                url: b.url,

                action: b.action

              }))

            }

          ]

        }

      }

    },

    {

      headers: { Authorization: `Bearer ${MANYCHAT_API_KEY}` }

    }

  );

  return response.data;

}


export async function addTag(subscriberId: string, tagId: string) {

  await axios.post(

    'https://api.manychat.com/fb/sending/addTag',

    { subscriber_id: subscriberId, tag_id: tagId },

    { headers: { Authorization: `Bearer ${MANYCHAT_API_KEY}` } }

  );

}
📦 Asset (Compliance LGPD)
yaml

Copy
obrigatorio:

  banner_optin: "Story fixado + bio com 'Respostas podem ser automatizadas'"

  opcao_sair: "Toda mensagem termina com 'Responda SAIR para parar'"

  retencao: "90 dias para leads frios, 24 meses para leads quentes (com consent)"

  descadastro: "Imediato, sem perguntas"


template_disclosure: "Mensagem inicial: 'Oi! Sou o {{bot_name}}, assistente virtual da {{empresa}}. Posso te ajudar com {{tema}}?'"


politica_privacidade: "Link na bio + link em cada DM (a cada 30 dias)"


consent_explicito: "Lead responde a uma keyword = opt-in. Sem isso, não enviar DMs."
📊 Métricas de Sucesso
Métrica	Meta
Open rate DM	≥ 90% (lido em 1h)
Reply rate	≥ 30%
Conversão lead qualificado	≥ 15%
Tempo de resposta	≤ 5 min (1ª mensagem)
Opt-out rate	≤ 2%
Bloqueio/reports	0
⚠️ Riscos & Anti-patterns

❌ DM em massa sem opt-in → bloqueio da conta

❌ Bot fingindo ser humano → Meta ban + LGPD

❌ Sem opção SAIR → LGPD + reclamação

❌ Coletar dados sensíveis via DM (CPF, senha) → bloqueio Meta

❌ Volume alto sem aquecimento → restrição

❌ Comentário automático que responde a qualquer coisa → spam

✅ **Opt-in SEMPRE explícito (keyword, story response, form)"

✅ **Disclosure claro: 'Sou um bot, posso chamar humano?'"

✅ **Opção SAIR em toda mensagem"

✅ **Volume progressivo (50 → 200 → 500 → 1000/dia)"

✅ **Monitorar opt-out (se > 5%, parar e revisar copy)"

🔗 Próximas ferramentas

→ tools/automation/03-disparador-whatsapp.md — WhatsApp

→ tools/copy/09-mensagem-instagram-dm.md — scripts

→ tools/automation/02-triggers-eventos.md — eventos

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus