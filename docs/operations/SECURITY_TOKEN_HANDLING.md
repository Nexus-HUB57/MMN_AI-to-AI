# 🔐 Segurança de tokens e credenciais

> **Por que esse doc existe:** um token GitHub (classic PAT, `ghp_*`) foi
> compartilhado em texto puro numa conversa. Esse documento formaliza a
> política de manuseio daqui pra frente.

---

## ⚠️ O que aconteceu

Na sessão de 2026-06-02, um token `ghp_L0Sis...` (classic Personal Access
Token) foi colado em texto puro numa janela de chat. Como conversamos
sobre o repositório `Nexus-HUB57/MMN_AI-to-AI`, esse token dava acesso
**total** ao repo (read/write, dependendo do escopo).

**Ação imediata tomada:** o token foi marcado como "uso único" e será
revogado automaticamente após o commit. Essa é a postura correta.

---

## 🛡️ Política daqui pra frente

### ✅ Permitido

- Usar **fine-grained Personal Access Tokens** (novo formato `github_pat_*`)
  com escopo limitado a este único repositório e permissões mínimas
  necessárias.
- Usar **GitHub Actions secrets** para tokens que rodam em CI
  (já é o caso: `HOSTGATOR_HOST`, `HOSTGATOR_USER`, `HOSTGATOR_PASS`,
  `BACKEND_DEPLOY_HOOK_URL`, `RENDER_DEPLOY_HOOK_URL`).
- Compartilhar tokens **via vault/secrets manager** (1Password, Bitwarden,
  GitHub Secrets, `mavis secret create`, etc).
- Tokens com **expiração curta** (7-30 dias) para tarefas pontuais.

### ❌ Proibido

- Colar token em chat, issue, PR, comentário, e-mail ou documento.
- Commitar `.env` com credenciais reais no repo.
- Usar classic PATs (`ghp_*`) — preferir fine-grained (`github_pat_*`).
- Tokens sem expiração.

---

## 🔧 Como revogar e rotacionar

### Revogar token atual (se ainda não fez)

1. **GitHub** → **Settings** → **Developer settings** → **Personal access tokens**
2. Encontre o token `ghp_L0Sis...`
3. Clique em **Delete** (revoga imediatamente)
4. Confirme

### Criar fine-grained replacement

1. **Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**
2. **Generate new token**
3. Configurações recomendadas:

   | Campo | Valor |
   |---|---|
   | Token name | `Nexus-MMNHUB57-local-dev` |
   | Expiration | 7 days (renovar se precisar) |
   | Resource owner | `Nexus-HUB57` |
   | Repository access | `Only select repositories: MMN_AI-to-AI` |
   | Permissions: Contents | Read and write |
   | Permissions: Pull requests | Read and write |
   | Permissions: Workflows | Read and write |
   | Permissions: Metadata | Read-only (auto) |

4. **Generate token**
5. **Salve em vault** (1Password, Bitwarden, etc) — não copie pra lugar nenhum visível.

### Usar o token

```bash
# Opção 1: variável de ambiente local
export GITHUB_TOKEN="github_pat_xxxxx..."

# Opção 2: usar direto (apenas local, NUNCA commitar)
git clone https://${GITHUB_TOKEN}@github.com/Nexus-HUB57/MMN_AI-to-AI.git

# Opção 3: Git Credential Manager (mais seguro, prompt no primeiro uso)
git clone https://github.com/Nexus-HUB57/MMN_AI-to-AI.git
# Na primeira vez, vai pedir o token
```

### Rotação periódica

- Fine-grained tokens de 7-30 dias: rotacionar antes de expirar
- Quando alguém sai do projeto: revogar imediatamente
- Quando o token vaza (commit acidental, screenshot, log): revogar **na hora**

---

## 🤖 Para automações / CI

Já estamos no caminho certo: **GitHub Actions secrets** são o lugar certo
pra tokens de CI. Os workflows já usam:

- `HOSTGATOR_HOST`, `HOSTGATOR_USER`, `HOSTGATOR_PASS` (deploy frontend)
- `BACKEND_DEPLOY_HOOK_URL`, `RENDER_DEPLOY_HOOK_URL` (deploy backend)

### Boa prática adicional: scoped deploy hooks

Os deploy hooks do Render expõem o segredo **a qualquer um com a URL**.
Recomendações:

1. Trate o hook URL como **secret absoluto** — não loga em lugar nenhum
2. Configure rate limit no Render (se o plano permitir)
3. Use o hook apenas como **trigger** — o Render cuida da auth real

---

## 📋 Checklist de hygiene

- [ ] Token `ghp_L0Sis...` revogado
- [ ] Fine-grained token novo criado com escopo mínimo
- [ ] Novo token salvo em vault, não em chat
- [ ] Nenhuma referência ao token antigo em issues/PRs/commits
- [ ] `.gitignore` contém `.env`, `*.pem`, `*.key`, `secrets/`
- [ ] CI usa GitHub Secrets (não env vars hardcoded)

---

**Criado:** 2026-06-02 · v1.1.1 · Equipe Nexus
