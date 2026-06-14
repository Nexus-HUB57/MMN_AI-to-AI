---
title: "03 · Primeiros passos no Painel do Afiliado"
level: fundamental
duration: 20min
prerequisites: ["02-sistema-sho"]
tags: [painel, ui, runtime, skills, comissoes, analytics]
last_updated: 2026-06-14
version: "1.0.0"
pattern: "MMN_IA"
---

# 03 · Primeiros passos no Painel do Afiliado

## Slide 1: Título e Introdução

*   **Título:** Painel do Afiliado: Seu Centro de Comando
*   **Subtítulo:** Os Primeiros Passos para a Orquestração da Inteligência
*   **Imagem:** Capa — Primeiros passos no Painel do Afiliado (referência: `../../assets/ebook_covers/ACAD-apostila-05-sete-telas-essenciais.webp`)
*   **Texto:** "Olá, futuro orquestrador de inteligência. Após desvendarmos a arquitetura invisível do IOAID e a resiliência do SHO, é hora de trazer todo esse conhecimento para a prática. Hoje, daremos os primeiros passos no seu centro de comando: o Painel do Afiliado. É aqui que suas estratégias ganham vida e seus resultados são monitorados. Sir. Alencar, poderia nos guiar por essa interface crucial?"

## Slide 2: Acesso e Primeiro Login

*   **Título:** Entrando no Seu Painel
*   **Como Acessar:**
    *   URL: `https://oneverso.com.br/login`
    *   Selecione "Afiliado".
    *   Login: seu e-mail + senha.
    *   Destino pós-login: `/dashboard`.
*   **Primeiro Acesso:** Wizard de 4 passos para configuração inicial (perfil, produto, base, agente).

## Slide 3: As 7 Telas Essenciais

*   **Título:** Navegando pelo Painel: As 7 Telas Essenciais
*   **Tabela:**

| # | Tela | Caminho | Quando usar |
|---|---|---|---|
| 1 | **Dashboard Geral** | `/dashboard` | 1ª coisa toda manhã |
| 2 | **Disparos e Campanhas** | `/dashboard/dispatch` | Criar/gerenciar campanhas |
| 3 | **Base de Contatos** | `/dashboard/contacts` | Importar/segmentar |
| 4 | **Judge Revisor** | `/dashboard/judge` | Revisar mensagens flagadas |
| 5 | **Métricas de Negócio** | `/dashboard/metrics` | Avaliar conversão/CAC |
| 6 | **Skills e Agentes** | `/dashboard/skills` | Configurar agentes |
| 7 | **Autonomia e SHO** | `/dashboard/autonomy` | Ver % autonomia + logs SHO |

## Slide 4: Configurar Perfil de Afiliado

*   **Título:** Personalizando Seu Perfil
*   **Caminho:** `/dashboard/settings/profile`
*   **O que preencher:** Nome completo, CPF/CNPJ, dados bancários, foto (opcional), bio curta, nicho principal.
*   **Dica:** Preencha tudo no primeiro dia para evitar fricções futuras.

## Slide 5: Conectar Produto e Configurar Comissão

*   **Título:** Ativando Suas Vendas
*   **Caminho:** `/dashboard/products`
*   **Como Adicionar Produto:**
    *   **Opção A:** Marketplace integrado (Hotmart, Kiwify, etc.) - OAuth e seleção de produtos.
    *   **Opção B:** Link de afiliado externo - Adicionar manualmente URL e % de comissão.
*   **Comissão:** Sistema rastreia cliques e vendas, pagamento mensal.

## Slide 6: Importar Primeira Base de Contatos

*   **Título:** Construindo Sua Audiência
*   **Caminho:** `/dashboard/contacts/import`
*   **3 Formas de Importar:**
    *   **Upload CSV:** Baixe template, preencha e faça upload.
    *   **Webhook de CRM:** Integre com HubSpot, RD Station, etc.
    *   **Captura Direta:** Crie formulário de captura.
*   **Mínimo Recomendado:** 100 contatos para dados relevantes.

## Slide 7: Criar Primeiro Agente (Versão Rápida)

*   **Título:** Seu Primeiro Agente de IA em Ação
*   **Caminho:** `/dashboard/agents/new`
*   **Passo a Passo Resumido:**
    *   Nome: `agente_pessoal_<seu_nome>`.
    *   Objetivo: "Atender leads do nicho [X], qualificar, e direcionar para compra."
    *   Skills iniciais: copywriter, segmenter, judge (template "Conservador LGPD").
    *   Teste: crie 1 campanha com 50 contatos e aprove.

## Slide 8: Configurar Notificações e Alertas

*   **Título:** Mantendo-se Informado
*   **Caminho:** `/dashboard/settings/notifications`
*   **5 Tipos de Notificação:** Crítico SHO, Alerta SHO, Judge Reprovação, Venda confirmada, Resumo diário.
*   **Canais:** E-mail, dashboard, Slack, SMS (para críticos).
*   **Recomendação:** E-mail + dashboard para iniciantes.

## Slide 9: Onde Encontrar Ajuda

*   **Título:** Suporte Sempre à Mão
*   **Recursos no Painel:**
    *   Ícone `?`: busca global + FAQ.
    *   Botão "Ajuda": chat com suporte.
    *   Tooltips: explicações curtas.
    *   Atalho `Cmd/Ctrl + K`: busca global.
    *   Documentação inline: `/docs`.
*   **Suporte Humano:** `/dashboard/support/new` (cria ticket).

## Slide 10: Próximo Passo

*   **Título:** Sua Jornada Continua: Trilha Agente
*   **Próximo Curso:** `00 - Seu primeiro agente`
*   **Texto:** "Com estes primeiros passos no painel, você completou a Trilha Fundamental. Agora, você tem o conhecimento necessário para operar com confiança. O próximo passo é aprofundar na criação e gestão de seus agentes de IA. Convido vocês a iniciarem a Trilha Agente, com o curso: '00 - Seu primeiro agente'. Vamos juntos construir um futuro de sucesso!"
*   **Recursos Extras:** Apostila 05 (7 Telas Essenciais), Apostila 06 (Setup Completo do Agente Pessoal), Apostila 08 (Rotina de Disparo).
