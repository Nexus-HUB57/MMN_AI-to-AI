# 🔐 SETUP · GitHub Actions Secrets (Modelo CI/CD Seguro Ravi-CTO)

> Configure UMA vez. A partir daí, todo deploy roda automaticamente sem nenhuma credencial passando por chat, terminal local, ou histórico.

## 1. Secrets do repositório

Acesse: https://github.com/Nexus-HUB57/MMN_AI-to-AI/settings/secrets/actions

Crie os seguintes secrets — **valores sensíveis ficam mascarados nos logs do Actions automaticamente**:

| Secret | Valor | Obrigatório |
|---|---|:---:|
| `SSH_GITHUB` | Chave SSH **privada** (PEM completo, com `BEGIN OPENSSH PRIVATE KEY`) | ✅ |
| `DEPLOY_HOST` | `143.95.213.237` (ou hostname público) | ✅ |
| `DEPLOY_PORT` | `22022` | ✅ |
| `DEPLOY_USER` | `root` (provisório) → trocar para `nexusdeploy` depois do hardening | ✅ |
| `DEPLOY_DIR`  | `/opt/nexus-affiliate` | ✅ |
| `DATABASE_URL` | `postgresql://user:senha@host:5432/dbname` | ✅ |
| `REDIS_URL` | `redis://host:6379` (ou `redis://:senha@host:6379`) | ✅ |
| `HEALTH_BASE_URL` | `https://nexus-affiliate.com.br` (URL pública de prod) | ✅ |
| `OPENAI_API_KEY` | chave OpenAI | ⏳ opcional |
| `GOOGLE_AI_API_KEY` | chave Google AI Studio | ⏳ opcional |

### 1.1 Como gerar e instalar a chave SSH (caso `SSH_GITHUB` ainda não exista)

**Na sua máquina local**:

```bash
# Gerar par de chaves dedicado para o CI
ssh-keygen -t ed25519 -C "ravi-cto-ci@nexus-affiliate" \
           -f ~/.ssh/ravi_cto_ci -N ""

# A chave PÚBLICA vai para o servidor; a PRIVADA para o GitHub Secret
cat ~/.ssh/ravi_cto_ci.pub        # cole no servidor (passo 2)
cat ~/.ssh/ravi_cto_ci            # cole inteiro no Secret SSH_GITHUB
```

> **IMPORTANTE**: o conteúdo do Secret `SSH_GITHUB` deve ser o arquivo PEM **completo**, incluindo as linhas `-----BEGIN OPENSSH PRIVATE KEY-----` e `-----END OPENSSH PRIVATE KEY-----`.

## 2. Liberar a chave pública no servidor (uma única vez)

Acesse o servidor com SEU acesso atual e cole a chave **pública** correspondente (`ravi_cto_ci.pub`):

```bash
# Como root, no servidor:
mkdir -p /root/.ssh
echo "ssh-ed25519 AAAA... ravi-cto-ci@nexus-affiliate" >> /root/.ssh/authorized_keys
chmod 700 /root/.ssh
chmod 600 /root/.ssh/authorized_keys
```

A partir daí o GitHub Actions consegue conectar via SSH agent sem expor nada.

## 3. Configurar Environment "production" no GitHub

https://github.com/Nexus-HUB57/MMN_AI-to-AI/settings/environments

- Criar Environment: `production`
- Required reviewers: 1 (você)
- Wait timer: 0 min (ajustável)
- Deployment branches: `main`, `feature/hub-tecnologico-marketplace-academia`

Isso adiciona um **gate de aprovação** antes do job `deploy` rodar.

## 4. Disparar o primeiro deploy

### 4.1 Automático (recomendado)

```bash
git checkout feature/hub-tecnologico-marketplace-academia
git push origin feature/hub-tecnologico-marketplace-academia
```

O workflow `Ravi · Deploy Automatizado` é disparado automaticamente.

### 4.2 Manual via UI

https://github.com/Nexus-HUB57/MMN_AI-to-AI/actions/workflows/ravi-deploy.yml

- Clicar em **Run workflow**
- Selecionar a branch
- (Opcional) Marcar `skip_seed` se quiser pular o seed de ebooks

### 4.3 Manual via gh CLI

```bash
gh workflow run "Ravi · Deploy Automatizado" \
  --ref feature/hub-tecnologico-marketplace-academia
gh run watch
```

## 5. Acompanhar logs em tempo real

```bash
gh run list --workflow="Ravi · Deploy Automatizado" --limit 5
gh run watch <RUN_ID>
```

Ou via UI: https://github.com/Nexus-HUB57/MMN_AI-to-AI/actions

## 6. Rollback manual

https://github.com/Nexus-HUB57/MMN_AI-to-AI/actions/workflows/ravi-rollback.yml

- Run workflow → escolher estratégia:
  - `rag_to_inmemory`: RAG volta para fallback instantâneo
  - `stop_worker`: para o BullMQ sem perder fila
  - `hard_revert_branch`: `git reset --hard origin/main` no servidor

## 7. Hardening obrigatório pós primeiro deploy

Quando o primeiro `Deploy Automatizado` rodar verde:

1. **Trocar `DEPLOY_USER` de `root` para `nexusdeploy`** (passos em `docs/security/SECURITY_HARDENING.md`).
2. Bloquear `PasswordAuthentication no` no SSH.
3. Revogar a senha root antiga (`passwd -l root`).
4. Adicionar branch protection na `main` exigindo o workflow verde.
5. Revogar quaisquer PATs vazados.

A partir desse ponto, **nenhum humano precisa mais tocar no servidor** — todo deploy é `git push` ou clique em workflow.

## 8. Verificação final

Após o deploy verde, confirmar:

- ✅ Job `validate` verde (build backend + frontend).
- ✅ Job `deploy` verde com healthchecks 2xx.
- ✅ `pm2 jlist` mostra `nexus-rag-worker` em `online`.
- ✅ `GET /api/trpc/nexusRag.stats` retorna `{ "backend": "pgvector" }`.
- ✅ `SELECT COUNT(*) FROM marketplace_ebooks WHERE status='active'` → 132.
- ✅ Nenhum secret aparece em log (procurar por `***` no output dos jobs).

🚀 Go-Live concluído com **zero exposição de credencial**.
