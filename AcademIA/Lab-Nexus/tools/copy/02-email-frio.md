---
title: "02-email-frio"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

title: "02 · E-mail Frio B2B"
description: "Templates de e-mail frio para prospecção B2B de alto ticket"
tags: [lab-nexus, copy, email, b2b, outbound]
category: copy
level: agente
estimated_time: "15 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: cold-emailer
course_anchor: cursos/agente/01-skills-essenciais.md
📧 02 · E-mail Frio B2B
3 sequências de e-mail frio B2B testadas, com taxa de resposta média de 12-18% no nicho high-ticket.

🎯 Spec
Atributo	Valor
O que é	Kit com 3 templates de e-mail frio (abordagem, follow-up, quebra de objeção)
Quando usar	Prospecção de empresas para vender serviços high-ticket (R$ 5k-50k)
Pré-requisitos	Nível 🥈 Agente; lista segmentada
Tempo estimado	15 min para personalizar + enviar
Skill que executa	cold-emailer (planejada)
Judge que valida	judge-revisor
📋 Playbook
Passo 1 — Preparar a lista

Mínimo 50 leads qualificados

Nome, empresa, cargo, problema específico

Use tools/marketing/02-segmentacao-rfm.md para o scoring

Passo 2 — Personalizar o template
Substitua as variáveis {{}} por dados reais. Nunca envie genérico.

Passo 3 — Agendar 3 toques
Dia	E-mail	Objetivo
D+0	Abordagem inicial	Gerar curiosidade
D+3	Follow-up valor	Entregar algo gratuito
D+7	Quebra de objeção	Última tentativa com CTA claro
📦 Asset (Templates)
📩 E-mail 1 — Abordagem Curta (D+0)
text

Copy
Assunto: {{nome_da_empresa}} + {{resultado_específico}}


Oi {{primeiro_nome}},


Vi que a {{nome_da_empresa}} está com {{problema_observável}}

(você postou sobre isso em {{fonte_observação}}).


Na semana passada ajudei a {{empresa_similar}} a sair de

{{antes}} para {{depois}} em {{prazo}} — sem {{custo_ou_sacrificio}}.


Curioso se faz sentido trocar 2 ideias sobre como replicar isso na

{{nome_da_empresa}}?


Posso enviar um case de 1 página?


{{seu_nome}}

{{cargo}} · {{empresa}}

{{calendly_link}}
📩 E-mail 2 — Follow-up Valor (D+3)
text

Copy
Assunto: ideia rápida para {{problema_principal}}


{{primeiro_nome}}, prometi um case — segue.


{{case_em_pdf_link}} (1 página, 3 min de leitura)


3 takeaways que podem te interessar:

1. {{insight_1}}

2. {{insight_2}}

3. {{insight_3}}


Se algum fizer sentido, me responde com "quero conversar" e

mando 3 horários disponíveis essa semana.


{{seu_nome}}
📩 E-mail 3 — Quebra de Objeção (D+7)
text

Copy
Assunto: "não é prioridade agora"


{{primeiro_nome}}, entendo — provavelmente não é o momento.


Só pra te deixar com a informação guardada: atendi 4 empresas do

{{segmento}} esse mês e o padrão que apareceu foi {{padrao_comum}}.


Se em algum momento quiser explorar, esse link fica ativo por 30 dias:

{{calendly_link_30d}}


Sem pressão, sem sequência automática depois.


Abraço,

{{seu_nome}}
📊 Métricas de Sucesso
Métrica	Meta fria	Meta morna
Open rate	≥ 45%	≥ 60%
Reply rate	≥ 8%	≥ 18%
Positiva (interesse)	≥ 1.5%	≥ 4%
Agendamentos/leads	≥ 0.5%	≥ 2%
⚠️ Riscos & Anti-patterns

❌ E-mail genérico ("Prezados") → vai direto pro spam

❌ Assunto clickbait → prejudica deliverability

❌ Mais de 1 CTA → confusão → zero reply

❌ Enviar em massa sem warm-up → domínio queimado

✅ Personalizar primeira linha (case study ou observação)

✅ 1 CTA claro por e-mail

✅ Domínio dedicado + SPF + DKIM + DMARC configurados

🔗 Próximas ferramentas

→ tools/automation/01-webhooks-payload.md — automatize a sequência

→ tools/marketing/02-segmentacao-rfm.md — score de leads

→ tools/analytics/01-experimento-ab.md — teste assuntos

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus