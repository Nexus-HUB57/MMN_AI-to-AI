---
title: "QA + Acceptance Matrix · Chat Bot Lab Nexus"
description: "Material oficial Academ'IA · lab-nexus"
tags: [lab-nexus, academia]
version: 1.0.0
last_updated: 2026-06-24
status: official
---

# QA + Acceptance Matrix · Chat Bot Lab Nexus

## Patches P0 sincronizados

1. **Persistência de workspace local**
   - Histórico, provedor, modelo e último metadata são persistidos por afiliado/tier no navegador.
   - Objetivo: evitar perda de contexto entre reloads da rota `/lab/chatbot`.

2. **Usage ledger diário por afiliado/tier**
   - Backend contabiliza requests, tokens estimados de entrada e tokens de saída.
   - Objetivo: controle de custo, proteção contra abuso e base para billing futuro.

3. **REST chat protegido por shared key**
   - `POST /api/v1/lab-nexus/chat` passa a exigir `LAB_NEXUS_PUBLIC_API_KEY` no backend.
   - Objetivo: impedir uso anônimo da rota pública de integração.

4. **Telemetria de quota no frontend**
   - UI exibe requests usados/restantes e data do último uso.
   - Objetivo: transparência operacional para o afiliado.

---

## Acceptance matrix de go-live

| Área | Critério | Aceite |
|---|---|---|
| Auth | Usuário Iniciante não acessa o chat | obrigatório |
| Auth | Operador/Estrategista/Elite acessam o chat | obrigatório |
| Persistência | Recarregar `/lab/chatbot` mantém histórico e modelo | obrigatório |
| Provedores | Lista de providers carrega via tRPC ou fallback | obrigatório |
| Quota | UI mostra consumo do dia | obrigatório |
| Quota | Backend bloqueia uso acima do limite diário | obrigatório |
| Segurança REST | `/api/v1/lab-nexus/chat` sem shared key retorna erro | obrigatório |
| Segurança REST | `/api/v1/lab-nexus/providers` continua público | obrigatório |
| UX | Reset limpa workspace persistido | obrigatório |
| Deploy | Frontend rota `/lab/chatbot` publicada | obrigatório |
| Deploy | Backend `/api/v1/lab-nexus/providers` e tRPC `labNexus.*` ativos | obrigatório |

---

## Matriz de QA visual logado

| Perfil | Rotas | Resultado esperado |
|---|---|---|
| Iniciante | `/dashboard`, `/academia`, `/lab/chatbot` | banner de bloqueio no chat |
| Operador | `/dashboard`, `/academia`, `/subscriptions`, `/lab/chatbot` | chat liberado + quota de 50/dia |
| Estrategista | `/dashboard`, `/academia`, `/subscriptions`, `/partners`, `/lab/chatbot` | chat liberado + quota de 500/dia |
| Elite | todas as rotas acima | chat liberado + quota de 5000/dia |

## Variáveis de ambiente necessárias

- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_GEMINI_API_KEY`
- `DEEPSEEK_API_KEY`
- `MINIMAX_API_KEY`
- `LAB_NEXUS_PUBLIC_API_KEY`  ← shared key para integrações REST externas

## Verificações pós-deploy

1. `GET /api/health`
2. `GET /api/v1/`
3. `GET /api/v1/lab-nexus/providers`
4. `POST /api/v1/lab-nexus/chat` com shared key válida
5. Login e validação manual em `/lab/chatbot`
