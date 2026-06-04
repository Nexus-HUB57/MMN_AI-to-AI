# Lab Nexus · Provedores e Status de Cota

> Última atualização: 2026-06-04 · ciclo de ativação de credenciais.

Este documento descreve como as chaves de API são lidas pelo backend e o
status operacional de cada provedor em produção (`api.oneverso.com.br`).

## Como o backend escolhe a chave

1. Lê `process.env[provider.envKey]` (chave primária).
2. Se a chamada falhar (HTTP ≥ 400, `base_resp.status_code` ≠ 0 no caso da
   MiniMax, timeouts, etc.), faz nova tentativa usando
   `process.env[provider.envKeyFallback]` quando disponível.
3. Se ambas falharem, devolve resposta em **modo demo** com o detalhamento
   das mensagens de erro de cada credencial (sem expor a chave em si).

Variáveis usadas:

| Provedor | Primária | Fallback |
|----------|----------|----------|
| OpenAI    | `OPENAI_API_KEY`            | `OPENAI_API_KEY_FALLBACK` |
| Anthropic | `ANTHROPIC_API_KEY`         | `ANTHROPIC_API_KEY_FALLBACK` |
| Google    | `GOOGLE_GEMINI_API_KEY`     | `GOOGLE_GEMINI_API_KEY_FALLBACK` |
| DeepSeek  | `DEEPSEEK_API_KEY`          | `DEEPSEEK_API_KEY_FALLBACK` |
| MiniMax   | `MINIMAX_API_KEY`           | `MINIMAX_API_KEY_FALLBACK` |

Endpoint REST público compartilhado: `LAB_NEXUS_PUBLIC_API_KEY`.

## Endpoints utilizados

| Provedor  | Endpoint |
|-----------|----------|
| OpenAI    | `https://api.openai.com/v1/chat/completions` |
| Anthropic | `https://api.anthropic.com/v1/messages` |
| Google    | `https://generativelanguage.googleapis.com/v1beta` |
| DeepSeek  | `https://api.deepseek.com/v1/chat/completions` |
| MiniMax   | `https://api.minimaxi.chat/v1/text/chatcompletion_v2` (endpoint global, fora da China) |

## Status observado no smoke test (2026-06-04)

| Provedor  | configured | Resposta `POST /chat` | Diagnóstico |
|-----------|------------|-----------------------|-------------|
| OpenAI    | ✅ true | HTTP 429 (quota) | Chave válida, conta sem créditos. Reabastecer billing OpenAI ou cadastrar uma chave com saldo em `OPENAI_API_KEY` / fallback. |
| Anthropic | ✅ true | HTTP 400 "credit balance is too low" | Chave válida, conta sem créditos. Recarregar console Anthropic ou rotacionar para chave com saldo. |
| Google    | ✅ true | HTTP 429 (free tier) | Quota gratuita do Gemini esgotada. Habilitar billing no projeto ou trocar para chave com Pay-as-you-go. |
| DeepSeek  | ✅ true | HTTP 402 "Insufficient Balance" (primária **e** fallback) | Ambas as chaves estão sem saldo. Adicionar créditos no painel DeepSeek. |
| MiniMax   | ✅ true | base_resp 2061 / 2056 (modelos do plano) | Plano associado à chave não habilita `MiniMax-Text-01` nem `MiniMax-M1`; `MiniMax-M2` está com `usage limit exceeded`. Selecionar plano que libere os modelos ou aguardar reset diário. |

> **Observação importante:** o sistema de fallback está funcionando — verificado
> empiricamente para DeepSeek, onde o backend tentou a chave primária, recebeu
> 402, tentou a fallback e também recebeu 402 antes de retornar em modo demo.

## Recomendações de operação

- Mantenha saldo positivo em pelo menos uma chave por provedor para que o
  Lab Nexus opere em **modo live**. Sem saldo, o backend ainda devolve uma
  resposta segura (modo demo) mas sem usar IA real.
- A `LAB_NEXUS_PUBLIC_API_KEY` é a credencial compartilhada exigida pelo
  endpoint REST público (`POST /api/v1/lab-nexus/chat`). Para rotacionar:
  1. Gere uma nova chave (`openssl rand -hex 32`).
  2. Atualize `LAB_NEXUS_PUBLIC_API_KEY` no Render (Environment).
  3. Atualize o cliente (`x-lab-nexus-key` no header ou `Authorization: Bearer`).
- O ledger de uso (`requestsToday`, `tokensOut`) é exposto no campo `trace`
  da resposta de cada chamada — útil para o frontend exibir o consumo em
  tempo real.

## Próximos passos sugeridos

1. Adicionar leitura por mais de uma chave por slot (multi-fallback) caso
   nenhuma chave única atenda à cota.
2. Em vez de `modo demo`, marcar erros de cota com `mode: "rate-limited"`
   para o frontend exibir um aviso específico.
3. Implementar healthcheck por provedor (`GET /api/v1/lab-nexus/providers/health`)
   que faz um ping mínimo (`max_tokens: 1`) e expõe se a cota está OK.
