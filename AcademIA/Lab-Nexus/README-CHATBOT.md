---
title: "Chat Bot Lab Nexus · Hub Agregador Multi-IA"
description: "Painel único do Lab Nexus para conversar com OpenAI, Anthropic, Google e DeepSeek usando APIs oficiais."
tags: [lab-nexus, chatbot, multi-ia, hub-agregador, openai, anthropic, gemini, deepseek]
version: 1.0.0
last_updated: 2026-06-03
status: production
---

# 🤖 Chat Bot Lab Nexus

Hub agregador de Inteligência Artificial dentro do **Lab Nexus**. Inspirado em
[Adapta](https://adapta.org/) e [MyHub IA](https://lp.myhub.ia.br/), ele unifica
os principais modelos do mercado em uma única interface conectada às **APIs oficiais**.

## 🧩 Engenharia (3 frentes)

1. **Integração de APIs** — conexão direta aos servidores dos criadores de cada IA
   por meio de chaves de API; envia os prompts dos usuários e exibe as respostas.
2. **Interface de Gerenciamento Unificada** — painel único permitindo alternar
   entre GPT, Claude, Gemini e DeepSeek na mesma tela.
3. **Ambiente Multimodais e Agentes** — histórico de conversas, templates de
   prompts, assistentes automatizados e geração de imagens.

## 🔌 Provedores conectados

| Provedor | Modelo padrão | Variável de ambiente |
|---|---|---|
| OpenAI (GPT) | `gpt-4o-mini` | `OPENAI_API_KEY` |
| Anthropic (Claude) | `claude-3-5-sonnet-latest` | `ANTHROPIC_API_KEY` |
| Google (Gemini) | `gemini-2.0-flash` | `GOOGLE_GEMINI_API_KEY` |
| DeepSeek | `deepseek-chat` | `DEEPSEEK_API_KEY` |
| MiniMax (opcional) | `MiniMax-Text-01` | `MINIMAX_API_KEY` |

> Quando nenhuma chave estiver configurada, o Chat Bot opera em **modo demo local**
> com respostas roteirizadas, sem sair do navegador.

## 🗂️ Acesso por tier PD/SCC

| Tier | Acesso | Mensagens/dia | Tokens máx |
|---|---|---|---|
| 🥉 Iniciante | bloqueado | — | — |
| 🥈 Operador | habilitado | 50 | 2.000 |
| 🥇 Estrategista | habilitado | 500 | 8.000 |
| 💎 Elite | habilitado | 5.000 | 32.000 |

## 📚 Repositórios de referência (curadoria)

A engenharia do Chat Bot Lab Nexus foi modelada a partir destes 13 repositórios:

- [`chopratejas/headroom`](https://github.com/chopratejas/headroom) — UI agregadora multi-modelo
- [`pewdiepie-archdaemon/odysseus`](https://github.com/pewdiepie-archdaemon/odysseus) — orquestração autônoma
- [`anthropics/claude-code`](https://github.com/anthropics/claude-code) — SDK/CLI oficial Claude
- [`ComposioHQ/awesome-claude-skills`](https://github.com/ComposioHQ/awesome-claude-skills) — catálogo de skills
- [`langchain-ai/langchain`](https://github.com/langchain-ai/langchain) — chains/agents/memória
- [`TheoLeeCJ/llama4-computer-use`](https://github.com/TheoLeeCJ/llama4-computer-use) — Computer Use sobre Llama 4
- [`open-webui/open-webui`](https://github.com/open-webui/open-webui) — UI self-hosted multi-modelo
- [`google-gemini/gemini-cli`](https://github.com/google-gemini/gemini-cli) — CLI oficial Gemini
- [`PlexPt/awesome-chatgpt-prompts-zh`](https://github.com/PlexPt/awesome-chatgpt-prompts-zh) — biblioteca de prompts
- [`microsoft/JARVIS`](https://github.com/microsoft/JARVIS) — router HuggingGPT
- [`MiniMax-AI/MiniMax-01`](https://github.com/MiniMax-AI/MiniMax-01) — pesos abertos MiniMax
- [`hexdocom/lemonai`](https://github.com/hexdocom/lemonai) — hub de agentes
- [`affaan-m/ECC`](https://github.com/affaan-m/ECC) — controle experimental / Judge Revisor

A lista completa, com papel de cada repositório e racional de adoção, vive em
[`lib/ia-aggregators-references.json`](./lib/ia-aggregators-references.json).

## 🔄 Pontos de integração no monorepo

| Camada | Arquivo |
|---|---|
| Provider registry (multi-IA) | `backend/src/services/lab-nexus/providerRegistry.ts` |
| Service unificado | `backend/src/services/lab-nexus/chatService.ts` |
| Router tRPC | `backend/src/routers/labNexusRouter.ts` |
| Endpoint REST | `backend/src/index.ts → /api/v1/lab-nexus/chat` |
| Página front-end | `frontend/src/pages/LabChatbot.tsx` (rota `/lab/chatbot`) |
| Tipos compartilhados | `frontend/src/lib/lab-nexus-types.ts` |

## 🛡️ Segurança e LGPD

- Chaves de API ficam **apenas no backend** (variáveis de ambiente do Render),
  nunca expostas ao navegador.
- Cada chamada é registrada com `affiliateId`, `tier`, `modelo`, `tokens`,
  `latency_ms` para auditoria.
- O hub respeita `getAcademiaTier(profile)` (frontend) e o middleware
  `requireAcademiaTier('operador')` (backend) — bloqueando uso por afiliados
  ainda em tier Iniciante.
- O endpoint REST externo de chat usa `LAB_NEXUS_PUBLIC_API_KEY` como shared key,
  reduzindo risco de uso anônimo fora do painel autenticado.
- O frontend persiste o workspace por afiliado/tier e exibe a quota diária
  devolvida pelo ledger do backend.

## ✅ QA e aceite

A matriz operacional completa está em
[`QA-ACCEPTANCE-MATRIX.md`](./QA-ACCEPTANCE-MATRIX.md).

---

**Versão 1.0.0** · Atualizado em 2026-06-03 · Equipe Nexus Affil'IA'te
