# 🚀 Como Disparar o Deploy Automatizado (3 passos)

> Modelo definitivo: **zero credencial em chat, zero credencial em terminal local**. Tudo via GitHub Actions Secrets.

## Passo 1 · Configurar Secrets (uma única vez)

Siga **[`SETUP_SECRETS_GITHUB.md`](./SETUP_SECRETS_GITHUB.md)** para criar os 8 secrets obrigatórios (`SSH_GITHUB` + 7 outros).

⏱️ ~10 minutos.

## Passo 2 · Aplicar o bundle no repo

**Na sua máquina** (autenticada com `gh auth login` ou git+SSH):

```bash
# Clone seu fork ou o repo principal
git clone https://github.com/Nexus-HUB57/MMN_AI-to-AI.git
cd MMN_AI-to-AI

# Baixar e extrair o bundle Ravi-CTO v2
curl -fsSL https://www.genspark.ai/api/files/s/xB4dwveZ -o /tmp/ravi-bundle.zip
unzip -o /tmp/ravi-bundle.zip -d /tmp/

# Aplicar o bundle (sincroniza arquivos + cria a branch)
bash /tmp/ravi-bundle/scripts/apply_bundle.sh "$PWD"

# Copiar os workflows GitHub Actions
mkdir -p .github/workflows
cp /tmp/ravi-bundle/.github/workflows/ravi-deploy.yml   .github/workflows/
cp /tmp/ravi-bundle/.github/workflows/ravi-rollback.yml .github/workflows/

# Patches manuais nos 3 arquivos (instruções em /tmp/ravi-bundle/patches/*.md)
$EDITOR backend/src/services/nexusRagService.ts   # patch híbrido
$EDITOR backend/src/routers/nexusRagRouter.ts     # stats async
$EDITOR frontend/src/pages/LabChatbot.tsx         # toggle Contexto Nexus

# Commit + push
git add -A
git commit -m "feat(hub): Ravi-CTO bundle + GitHub Actions CI/CD seguro"
git push origin feature/hub-tecnologico-marketplace-academia
```

## Passo 3 · Acompanhar o deploy

O **push automaticamente dispara** o workflow `Ravi · Deploy Automatizado`. Acompanhe:

```bash
gh run list --workflow="Ravi · Deploy Automatizado" --limit 1
gh run watch
```

Ou na UI: https://github.com/Nexus-HUB57/MMN_AI-to-AI/actions

### Job timeline esperada (~10–15 minutos)

| Job | Tempo | O que faz |
|---|---|---|
| `validate` | 4–6 min | npm install + build backend + build frontend (no runner) |
| `deploy → Pull repo no servidor` | 30s | git clone/pull no `/opt/nexus-affiliate` |
| `deploy → Instalar deps + build` | 4–6 min | npm install + build no servidor |
| `deploy → Aplicar migrations Postgres` | 5–15s | `psql -f 0012… -f 0013…` |
| `deploy → Publicar ebooks + Seed` | 30–60s | 132 ebooks publicados + seed |
| `deploy → Subir worker BullMQ` | 5–10s | `pm2 reload nexus-rag-worker` |
| `deploy → Healthchecks` | 5s | 3 endpoints validados |

### Output esperado

```
✅ /api/health → 200
✅ /api/trpc/system.info → 200
✅ /api/trpc/nexusRag.stats → 200  {"backend":"pgvector",...}
```

## ⚠️ Se algo falhar

1. **Job `deploy → Sanity SSH` vermelho** → chave SSH não está autorizada no servidor. Verifique passo 2 do `SETUP_SECRETS_GITHUB.md`.
2. **`Aplicar migrations Postgres` vermelho** → `DATABASE_URL` errado ou pgvector não instalado. Conecte ao Postgres e rode `CREATE EXTENSION IF NOT EXISTS vector;`.
3. **`Healthchecks` ⚠️** → o backend Node ainda não está rodando. Subir o serviço principal (provavelmente já tem `pm2 start backend/dist/index.js` ou systemd unit). Verifique com `pm2 list` no servidor.

## 🛟 Rollback rápido

https://github.com/Nexus-HUB57/MMN_AI-to-AI/actions/workflows/ravi-rollback.yml → **Run workflow** → escolha:

- `rag_to_inmemory` (mais comum): RAG volta para fallback em 5s.
- `stop_worker`: para o BullMQ sem perder mensagens.
- `hard_revert_branch`: reset duro para `origin/main`.

## ✅ Critério de "Go-Live concluído"

Os 3 healthchecks 2xx **mais** estas duas verificações:

```bash
gh api /repos/Nexus-HUB57/MMN_AI-to-AI/actions/runs \
  --jq '.workflow_runs[0] | {name, status, conclusion}'
# → { name: "Ravi · Deploy Automatizado", status: "completed", conclusion: "success" }

curl -s https://nexus-affiliate.com.br/api/trpc/nexusRag.stats | jq .
# → { "result": { "data": { "backend": "pgvector", "sources": N, "chunks": M } } }
```

🚀 **Pronto. CI/CD blindado, zero senha em chat, deploy reproduzível a cada push.**
