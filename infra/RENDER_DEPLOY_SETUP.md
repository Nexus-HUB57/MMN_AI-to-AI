# 🔌 Configuração de Deploy do Backend (Render) – Operação Nexus

Este documento explica **como sincronizar o backend em `https://api.oneverso.com.br`**
toda vez que houver merge em `main`, sem precisar abrir o painel da Render manualmente.

> Hoje, o backend de produção ainda aponta para um commit antigo
> (`ce3673e5d35107c2100e8c2fdba1d6535472b382`) porque o GitHub Actions não tem
> credencial para acionar o redeploy. Os workflows do repositório já estão prontos
> para usar **qualquer uma** das três opções abaixo — basta cadastrar os segredos.

## 🚀 Opção 1 — Render Deploy Hook (recomendado, mais simples)

1. Acesse o painel: <https://dashboard.render.com>
2. Abra o serviço **`nexus-saas-backend`**.
3. Vá em **Settings → Deploy Hook**.
4. Copie a URL no formato `https://api.render.com/deploy/srv-XXXXXXXXXXX?key=YYYYYY`.
5. No GitHub, abra:
   <https://github.com/Nexus-HUB57/MMN_AI-to-AI/settings/secrets/actions>
6. Clique em **New repository secret** e cadastre **uma** das duas chaves abaixo:
   - `BACKEND_DEPLOY_HOOK_URL` (preferida – nome neutro)
   - `RENDER_DEPLOY_HOOK_URL` (alias)
7. Cole a URL como valor e salve.

Pronto. Próximo push em `main` chamará o hook automaticamente
(`.github/workflows/deploy.yml` e `.github/workflows/ci-cd-pipeline.yml`).

## 🔐 Opção 2 — Render REST API (mais controle)

1. Acesse: <https://dashboard.render.com/u/settings#api-keys>
2. Gere uma **API Key** com permissão de redeploy.
3. Pegue o **Service ID** do serviço backend (formato `srv-XXXXXXXXXXXX`,
   visível na URL do painel do serviço).
4. No GitHub Secrets, cadastre as duas chaves:
   - `RENDER_API_KEY` → a API key gerada acima
   - `RENDER_SERVICE_ID` → o ID `srv-…` do `nexus-saas-backend`

O workflow detecta automaticamente as duas chaves e dispara
`POST https://api.render.com/v1/services/{RENDER_SERVICE_ID}/deploys` com `Authorization: Bearer <RENDER_API_KEY>`.

## 🧪 Validação pós-configuração

Depois de cadastrar os segredos, rode o workflow manualmente:

```bash
gh workflow run "Trigger Backend Deploy Hook" --ref main
```

Ou, via UI: **Actions → Trigger Backend Deploy Hook → Run workflow**.

Verifique então:

```bash
curl https://api.oneverso.com.br/api/health | jq .commit
```

O campo `commit` deve passar a refletir o `HEAD` atual de `main`.

## 📋 Checklist de validação completa do Chatbot Lab Nexus

1. Frontend (já está OK em produção):
   - `https://oneverso.com.br/academia` deve mostrar a entrada **“Abrir Lab Nexus”** e
     **“Entrar no Chat Bot do Lab Nexus”** no painel da Academ'IA.
   - `https://oneverso.com.br/academia/lab-nexus/chatbot` é a rota canônica
     do Chat Bot.
   - `https://oneverso.com.br/lab/chatbot` continua respondendo como
     compatibilidade (mesma página).
2. Backend (depende do redeploy):
   - `GET /api/health` deve mostrar o commit mais recente de `main`.
   - `GET /api/v1/lab-nexus/providers` deve listar os 5 provedores
     (`openai`, `anthropic`, `google`, `deepseek`, `minimax`).
   - `POST /api/v1/lab-nexus/chat` com `Authorization: Bearer <LAB_NEXUS_PUBLIC_API_KEY>`
     deve responder respeitando a quota por tier.
3. Smoke test:
   - `Actions → Production Smoke Tests` precisa terminar **success** após o
     redeploy do frontend e do backend.

## 🛠️ Quando o pipeline CI estiver vermelho

Os jobs **CI** e **CI/CD Pipeline → Tests** estão hoje falhando em testes
legados (`payments.test.ts`, `subscriptionsDomain.test.ts`,
`genkit-integration.test.ts`, `service.test.ts` etc.). Esses testes **não
bloqueiam** o deploy manual do frontend nem o deploy via hook do backend,
mas precisam ser corrigidos para reativar a automação ponta-a-ponta no
workflow `Trigger Backend Deploy Hook` (que depende do CI verde).

Tracking sugerido:

- [ ] Atualizar `tests/unit/payments.test.ts` para usar fakes do `paymentsRouter` ou
      provisionar `DATABASE_URL` em CI.
- [ ] Atualizar `tests/unit/subscriptionsDomain.test.ts` para o novo modelo.
- [ ] Atualizar `tests/unit/security-performance.test.ts` (data masking esperado mudou).
- [ ] Atualizar `tests/integration/aiContentHub-integration.test.ts` removendo
      `facebook` do enum de plataformas.
- [ ] Atualizar `backend/tests/genkit-integration.test.ts` para aceitar
      `openai-fallback` quando faltar `OPENAI_API_KEY` no runner.
- [ ] Mover `fase8/tests/dropshipping.test.ts` para caminho correto ou criar
      o stub `../services/dropshippingService`.
