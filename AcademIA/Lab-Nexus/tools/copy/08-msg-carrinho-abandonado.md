---
title: "08-msg-carrinho-abandonado"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-24
status: official
---

title: "08 · Mensagem de Carrinho Abandonado"
description: "Sequência de 3 mensagens (e-mail + WhatsApp) para recuperar vendas perdidas"
tags: [lab-nexus, copy, carrinho, abandoned-cart, recuperacao]
category: copy
level: agente
estimated_time: "15 min"
author: "Equipe Nexus"
version: "1.0"
last_review: "2026-06-02"
linked_skill: follow-up-strategist
course_anchor: cursos/agente/02-disparo-whatsapp.md
🛒 08 · Mensagem de Carrinho Abandonado
Sequência de 3 toques (e-mail + WhatsApp) com taxa média de recuperação de 8-15% das vendas perdidas.

🎯 Spec
Atributo	Valor
O que é	3 mensagens (1h, 24h, 72h) para recuperar carrinho abandonado
Quando usar	Lead colocou produto no carrinho, iniciou checkout, mas não finalizou pagamento
Pré-requisitos	Nível 🥈 Agente; pixel configurado; gateway com webhook
Tempo estimado	15 min para configurar + 30 min para copy
Skill que executa	follow-up-strategist + auto-publisher
Judge que valida	judge-revisor
📋 Playbook
Janelas de envio (validadas)
Toque	Tempo	Canal	Objetivo
1	1h após abandono	E-mail	Lembrete + reduzir fricção
2	24h	E-mail + WhatsApp	Prova social + urgência
3	72h	E-mail	Última chamada + bônus
Regra de saída

Se o lead conclui a compra → remover da sequência IMEDIATAMENTE

Se o lead responde "SAIR" → descadastro total

Se o lead abre 3 e-mails sem clicar → parar (pode estar insatisfeito)

📦 Asset (3 Templates)
✉️ Toque 1 — E-mail 1h (Lembrete Simples)
Assunto: "{{primeiro_nome}}, esqueceu algo no carrinho?"

text

Copy
Oi {{primeiro_nome}},


Notei que você iniciou a compra de {{produto}} mas não finalizou.


Não se preocupe — pode ser que tenha surgido algo mais urgente.

Resolvi separar tudo pra você terminar em 2 cliques:


👉 Continuar compra: {{link_carrinho}}


O produto fica reservado por mais 24h.


{{seu_nome}}
✉️ + 📱 Toque 2 — E-mail + WhatsApp 24h
E-mail — Assunto: "{{X}} pessoas compraram {{produto}} hoje"

text

Copy
{{primeiro_nome}},


Nos últimos 7 dias, {{numero}} pessoas garantiram acesso a

{{produto}}. ({{link_para_depoimentos}})


Seu lugar ainda está reservado, mas por pouco tempo.


🎁 BÔNUS DE VOLTA: finalize nas próximas {{horas}}h e ganhe

{{brinde_surpresa}}.


👉 {{link_carrinho_com_bonus}}


{{seu_nome}}
WhatsApp (concise):

text

Copy
Oi {{primeiro_nome}}! Vi que ficou com {{produto}} no carrinho.


Fiz uma condição especial pra você voltar:

✅ Acesso a {{produto}}

🎁 + {{brinde}} (só hoje)


Quer que eu te mande o link? É só responder "QUERO".


— Se não for o momento, responde SAIR e não mando mais nada. 🙂

{{seu_nome}}
✉️ Toque 3 — E-mail 72h (Última Chamada)
Assunto: "Última chance, {{primeiro_nome}}"

text

Copy
{{primeiro_nome}},


Esse é meu último e-mail sobre {{produto}}.


Se você decidir não comprar agora, tudo bem — seu lugar vai

ser liberado para a próxima pessoa da lista de espera.


Mas se ainda estiver em dúvida, posso te oferecer:


✅ {{beneficio_1}}

✅ {{beneficio_2}}

🎁 {{brinde_surpresa}} (só válido por {{horas}}h)


👉 {{link_carrinho_final}}


Depois disso, a condição volta ao preço normal.


{{seu_nome}}
📊 Métricas de Sucesso
Funil	Benchmark
E-mails entregues	≥ 95%
Open rate	≥ 40% (Toque 1), 50% (Toque 2), 35% (Toque 3)
Click-through (CTR)	≥ 12%
Recuperação (conversão)	8-15%
Receita recuperada	R$ variável — depende do ticket médio
⚠️ Riscos & Anti-patterns

❌ Enviar e-mail de carrinho sem opt-in → LGPD art. 7º

❌ Mais de 3 toques → reportado como spam

❌ Pressão excessiva ("VOCÊ ESTÁ PERDENDO!") → efeito reverso

❌ Bônus falso (aumenta preço antes) → quebra confiança

❌ Sem saída fácil → unsubscribe + reclamação

✅ 3 toques é o sweet spot (4 já gera fadiga)

✅ WhatsApp só a partir do 2º (1º pode ser intrusivo)

✅ Escassez real (não "última chance" se repete toda semana)

✅ Bônus autêntico (não compense com aumento de preço)

🔗 Próximas ferramentas

→ tools/automation/07-recuperador-carrinho.md — automatize

→ tools/analytics/02-comparador-taxas-conversao.md — meça

→ tools/marketing/05-segmentacao-lista.md — score de recuperação

Versão 1.0 · Atualizado 2026-06-02 · Mantido pela Equipe Nexus