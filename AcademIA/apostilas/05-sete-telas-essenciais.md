---
title: "As 7 Telas Essenciais do Dia a Dia"
subtitle: "O Guia Definitivo do Painel do Afiliado Nexus"
author: "MMN_IA Collective"
version: "1.0.0"
date: "2026-06-12"
tags: [academia, painel, afiliado, dia-a-dia, operacao]
pattern: "MMN_IA"
---

![Capa — As 7 Telas Essenciais do Dia a Dia](../../assets/ebook_covers/ACAD-apostila-05-sete-telas.webp)

**As 7 Telas Essenciais do Dia a Dia**

*O Guia Definitivo do Painel do Afiliado Nexus*

**Por MMN_IA Collective · Academ'IA**

Nexus Affil'IA'te · 2026

**Sobre este documento**

O Painel do Afiliado Nexus tem 27 telas no total, mas a maioria dos afiliados produtivos usa apenas 7 no dia a dia. Este documento é o mapa detalhado dessas 7 telas: o que cada uma mostra, o que cada botão faz, quais são as armadilhas comuns, e — principalmente — como interpretar os números que aparecem nelas. Se você usar este guia como referência diária, em 30 dias você vai operar com mais segurança que 80% dos afiliados da rede.

**Sumário**

> **•** 1. Tela 01 — Dashboard Geral
> **•** 2. Tela 02 — Disparos e Campanhas
> **•** 3. Tela 03 — Base de Contatos e Coortes
> **•** 4. Tela 04 — Judge Revisor
> **•** 5. Tela 05 — Métricas de Negócio
> **•** 6. Tela 06 — Skills e Agentes
> **•** 7. Tela 07 — Autonomia e SHO
> **•** 8. Rotina diária recomendada (15 minutos)
> **•** 9. Indicadores de que algo está errado
> **•** 10. Atalhos e dicas de power user

---

**1. Tela 01 — Dashboard Geral**

**Caminho:** `/dashboard`

**O que mostra:**
- Cards no topo: receita do dia, receita do mês, % de conversão média, latência média do agente.
- Gráfico central: receita dos últimos 30 dias (linha do tempo).
- Lista lateral: últimas 10 ações executadas pelo agente (com status de aprovação do Judge).
- Banner superior: alertas do SHO (se houver).

**Como interpretar:**
- **Receita do dia caindo 3 dias seguidos**: pode ser coorte fria, ou skill com problema.
- **Latência média > 5s**: problema de infraestrutura, abrir ticket.
- **Banner SHO vermelho**: skill em quarentena, ação humana necessária.

**Armadilha comum:** ignorar o banner SHO. Ele está ali por motivo.

**2. Tela 02 — Disparos e Campanhas**

**Caminho:** `/dashboard/dispatch`

**O que mostra:**
- Botão grande "Novo Disparo" no topo.
- Tabela com campanhas ativas: nome, base, status (rodando/pausada/agendada), conversão.
- Aba lateral "Histórico": últimos 50 disparos com taxa de resposta e Judge.

**Como usar:**
1. Clique "Novo Disparo".
2. Escolha a **coorte** (público) — pode usar as prontas ou criar nova.
3. Escolha o **template** de mensagem (pode ser gerado pela skill copywriter).
4. Defina **horário e frequência** (pode ser único ou recorrente).
5. Revise o preview com Judge.
6. Aprove.

**Armadilha comum:** disparar para coorte errada. Sempre confirme o tamanho da base antes de aprovar.

**3. Tela 03 — Base de Contatos e Coortes**

**Caminho:** `/dashboard/contacts`

**O que mostra:**
- Tabela com todos os contatos: nome, telefone, última interação, coorte, status (ativo/frio/banido).
- Filtros: por coorte, status, data de entrada, produto de interesse.
- Botão "Importar" (CSV, XLSX, integração direta).
- Botão "Criar Coorte" (regras: ex. "todos que compraram X nos últimos 90 dias").

**Coortes padrão criadas automaticamente:**
- **Novos**: entraram na base nos últimos 7 dias.
- **Ativos**: compraram nos últimos 30 dias.
- **Frios**: 30-90 dias sem comprar.
- **Recompra**: compraram, mas perfil sugere nova compra em 60-90 dias.

**Como criar uma coorte custom:**
1. Clique "Criar Coorte".
2. Defina nome e descrição.
3. Adicione regras (ex: "comprou produto X" + "estado = SP" + "data entrada > 2025-01-01").
4. Teste com preview (mostra quantos contatos qualificam).
5. Salve.

**Armadilha comum:** criar coorte com regra contraditória (ex: "comprou X" + "nunca comprou"). Resultado: base vazia.

**4. Tela 04 — Judge Revisor**

**Caminho:** `/dashboard/judge`

**O que mostra:**
- Lista das últimas mensagens bloqueadas pelo Judge, com motivo.
- Gráfico de pizza: % de mensagens aprovadas vs reprovadas, por motivo.
- Aba "Configurar Judge": regras de bloqueio (LGPD, spam, claims não suportados, tom).

**Como ler as reprovações:**
- 🟥 **Bloqueado** (alta gravidade): Judge impediu envio, ação humana necessária.
- 🟨 **Alerta** (média): Judge enviou, mas marcou como suspeita pra revisão.
- 🟩 **Aprovado**: Judge liberou, sem ressalvas.

**Como ajustar o Judge:**
- Se reprovações estão **muitas (> 20%)**: suas mensagens estão agressivas demais. Abaixe o tom.
- Se reprovações estão **poucas (< 3%)**: Judge pode estar calibrado frouxo. Revise as regras.

**Armadilha comum:** desativar o Judge. Não faça isso. O Judge é o que te protege de ban do WhatsApp.

**5. Tela 05 — Métricas de Negócio**

**Caminho:** `/dashboard/metrics`

**O que mostra:**
- **Receita por período** (dia, semana, mês, ano).
- **CAC** (custo de aquisição de cliente).
- **LTV** (lifetime value).
- **Taxa de conversão** por coorte e por produto.
- **Funil completo**: impressões → cliques → leads → vendas.
- **Comparativo** com mês anterior (verde = melhor, vermelho = pior).

**Como ler:**
- **CAC subindo e LTV caindo**: você está pagando para trazer clientes que compram menos. Reveja coortes.
- **Conversão por coorte X é 5x maior que Y**: pare de gastar com Y, escale X.
- **Funil com queda brusca em uma etapa**: investigue a copy ou a oferta.

**6. Tela 06 — Skills e Agentes**

**Caminho:** `/dashboard/skills`

**O que mostra:**
- Lista de skills instaladas, com descrição e custo por invocação.
- Lista de agentes configurados, com quais skills cada um usa.
- Botão "Adicionar Skill" (do marketplace).
- Botão "Criar Agente" (assistente guiado).

**Como adicionar uma skill:**
1. Clique "Adicionar Skill".
2. Navegue pelo marketplace (27+ skills).
3. Leia a descrição, custo, exemplos.
4. Clique "Instalar" e escolha em qual agente usar.

**Como criar um agente:**
1. Clique "Criar Agente".
2. Dê nome e objetivo.
3. Escolha skills (comece com 3).
4. Configure Judge (pode usar template).
5. Teste com base pequena (50 contatos).
6. Publique.

**Armadilha comum:** instalar 10 skills no primeiro agente. Comece com 3.

**7. Tela 07 — Autonomia e SHO**

**Caminho:** `/dashboard/autonomy`

**O que mostra:**
- **% de autonomia**: quanto das suas ações são executadas sem aprovação humana (meta: > 70%).
- **Timeline de incidentes do SHO**: anomalias detectadas, contenções aplicadas, quarentenas.
- **Botão "Modo Autonomia"**: aumenta ou diminui a autonomia do agente.
- **Log de decisões**: cada decisão tomada pelo SHO, com explicabilidade.

**Como ler:**
- **Autonomia < 50%**: você está aprovando tudo, o agente não está agregando valor.
- **Autonomia > 90%**: pode ser bom (confiança alta) ou ruim (Judge desativado). Confira.
- **SHO em contenção frequente**: skill com problema, avalie substituir.

**8. Rotina diária recomendada (15 minutos)**

A rotina ideal de um afiliado produtivo leva 15 minutos por dia:

1. **Minuto 0-3**: Abra o Dashboard Geral. Veja receita, latência, banner SHO.
2. **Minuto 3-6**: Vá em Disparos. Aprove ou pause campanhas do dia.
3. **Minuto 6-9**: Vá em Judge. Revise as mensagens marcadas com 🟨 alerta.
4. **Minuto 9-12**: Vá em Métricas. Olhe a taxa de conversão por coorte. Identifique a top.
5. **Minuto 12-15**: Vá em Autonomia. Veja se há contenção do SHO. Resolva se houver.

**9. Indicadores de que algo está errado**

- **Latência > 10s**: problema técnico, abrir ticket.
- **Receita do dia = 0 por 3 dias seguidos**: skill ou coorte parou de performar.
- **Judge reprovando > 30%**: copy está inadequada, revise antes de escalar.
- **SHO em contenção permanente**: skill com bug, substitua.
- **CAC dobrou em 7 dias**: tráfego ou copy com problema, investigar.

**10. Atalhos e dicas de power user**

- **Cmd/Ctrl + K**: busca global de contatos, skills, campanhas.
- **Cmd/Ctrl + D**: vai direto para Disparos.
- **Cmd/Ctrl + J**: vai para Judge.
- **Click direito em contato**: ações rápidas (mensagem, mover de coorte, banir).
- **Filtros salvos**: salve coortes customizadas para reuso.
- **Modo escuro**: disponível no canto superior direito.
- **Exportar tudo**: `/dashboard/export` baixa CSV com tudo do seu nó (auditoria).

**Truque de senior:** assine o feed RSS do Judge em `/dashboard/judge.rss` pra receber reprovações graves por e-mail em vez de checar manualmente.

---

**As 7 Telas Essenciais do Dia a Dia** --- Por MMN_IA Collective

*MMN AI-to-AI · 2026 · Todos os direitos reservados*
