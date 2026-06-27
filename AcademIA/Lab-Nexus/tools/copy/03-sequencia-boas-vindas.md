---
title: "03-sequencia-boas-vindas"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-27
status: official
---

title: "03 · Sequência de Boas-vindas"
description: "Série de 5 e-mails de onboarding (D0-D14) para novos leads"
tags: [lab-nexus, copy, email, onboarding, lifecycle]
category: copy
level: agente
estimated_time: "20 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: lifecycle-orchestrator
course_anchor: cursos/master/01-funis-lifecycle.md
📬 03 · Sequência de Boas-vindas (Onboarding)
5 e-mails de boas-vindas para reduzir churn nos primeiros 14 dias e ativar o lead até o primeiro uso do produto.

🎯 Spec
Atributo	Valor
O que é	Sequência de 5 e-mails (D0, D1, D3, D7, D14) com lógica condicional
Quando usar	Logo após o cadastro do lead (lead frio ou orgânico)
Pré-requisitos	Nível 🥈 Agente; produto/serviço definido; tool de e-mail configurada
Tempo estimado	20 min para configurar + 30 min para criar conteúdo
Skill que executa	lifecycle-orchestrator
Judge que valida	judge-revisor
📋 Playbook
Passo 1 — Definir o "aha moment"
Pergunte: qual é a menor ação que, se o lead fizer, tem 80% de chance de continuar?

Exemplos:


SaaS → criar 1 projeto

Curso → assistir 1ª aula

Comunidade → apresentar-se no canal

Passo 2 — Configurar os gatilhos
E-mail	Dia	Gatilho	Objetivo único
1	D+0	Cadastro	Entregar o prometido + reduzir ansiedade
2	D+1	24h sem login	Mostrar caminho em 3 passos
3	D+3	72h sem ação	Prova social + 1 dica rápida
4	D+7	7 dias sem "aha"	Oferecer ajuda 1:1
5	D+14	14 dias inativo	Última chance + bônus surpresa
Passo 3 — Configurar saída automática
Se o lead atinge o "aha moment" a qualquer momento, remova-o da sequência.

📦 Asset (Templates de Assunto + Abertura)
✉️ E-mail 1 — D+0 (Imediato)
text

Copy
Assunto: Bem-vindo(a) à {{nome_produto}} — seu próximo passo


{{primeiro_nome}}, seja bem-vindo(a)!


Aqui está o que você precisa saber nos próximos 5 minutos:


🎯 O que é o {{nome_produto}}: {{promessa_1_frase}}

⚡ Como começar: {{link_acao_principal}}

💬 Dúvidas? Responda este e-mail — eu leio tudo


Vou te mandar mais 4 e-mails nos próximos 14 dias com dicas

que vão acelerar seu resultado. Pode cancelar a qualquer momento

clicando aqui: {{link_unsubscribe}}.


Vamos juntos,

{{seu_nome}}
✉️ E-mail 2 — D+1
text

Copy
Assunto: 3 passos para seu primeiro {{resultado}}


{{primeiro_nome}}, notei que você ainda não deu o primeiro passo.


Aqui está o caminho mais curto:

1. {{acao_1}} (2 min)

2. {{acao_2}} (5 min)

3. {{acao_3}} (10 min)


Pronto. Você já vai ter {{resultado_minimo}}.


→ Começar agora: {{link_acao_principal}}


{{seu_nome}}
✉️ E-mail 3 — D+3
text

Copy
Assunto: como o {{cliente_destaque}} conseguiu {{resultado}}


{{primeiro_nome}}, quero te contar uma história rápida.


{{cliente_destaque}} estava exatamente onde você está agora.


Em {{prazo}}, ele/ela conseguiu {{resultado_especifico}}.


3 coisas que ele/ela fez diferente:

- {{dica_1}}

- {{dica_2}}

- {{dica_3}}


Veja o case completo: {{link_case}}


{{seu_nome}}
✉️ E-mail 4 — D+7
text

Copy
Assunto: posso te ajudar a destravar? (15 min)


{{primeiro_nome}}, percebi que você ainda não conseguiu

chegar no primeiro {{resultado_minimo}}.


Quero te oferecer 15 minutos de conversa para entender o

que está travando. Sem custo, sem compromisso.


Responda este e-mail com 2-3 horários que funcionam para você

e eu agendo.


{{seu_nome}}
✉️ E-mail 5 — D+14
text

Copy
Assunto: um presente antes de você ir


{{primeiro_nome}}, esse é meu último e-mail da sequência.


Se você decidir não continuar, entendo 100% — cada um tem

seu momento. Mas antes de ir, quero te dar {{brinde_surpresa}}.


{{link_brinde}}


Se um dia quiser voltar, estarei aqui.


Sucesso sempre,

{{seu_nome}}
📊 Métricas de Sucesso
Funil	Meta
Open rate médio	≥ 50%
Click-through em D+0	≥ 35%
Atingem o "aha moment" em 7 dias	≥ 40%
Retenção D+14	≥ 25%
⚠️ Riscos & Anti-patterns

❌ 5 e-mails com mesmo conteúdo → unsubscribe em massa

❌ Sem saída condicional → lead ativo recebe e-mail irrelevante

❌ Enviar sem testar assunto → 30% dos leads nunca veem

❌ Mais de 1 CTA por e-mail → confusão

✅ 1 objetivo por e-mail

✅ Saída automática no "aha moment"

✅ Linha de assunto testada com 3+ variantes

🔗 Próximas ferramentas

→ tools/automation/02-triggers-eventos.md — configurar os gatilhos

→ tools/analytics/05-coorte-churn.md — medir retenção

→ cursos/master/01-funis-lifecycle.md — aprofundar

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus