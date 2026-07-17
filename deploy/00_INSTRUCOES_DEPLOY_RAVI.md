# 🚀 Deploy Ravi-CTO · Execução em Uma Linha

> **Princípio de segurança**: nenhuma credencial neste pacote. Tudo entra via variável de ambiente injetada no momento do comando — não vai pra log, não vai pra disco, não vai pra histórico (se você usar o prefixo de espaço).

## 0. Pré-requisitos (faça isso UMA vez, no servidor)

Conecte ao servidor (sua máquina local → servidor) com as credenciais que você já tem; vou descrever os comandos que você roda **lá dentro** do servidor:

```bash
# === RODE DENTRO DO SERVIDOR ===

# 1. Instalar dependências mínimas se não tiver
apt-get update -y
apt-get install -y git curl jq postgresql-client redis-tools rsync unzip ca-certificates

# 2. Instalar Node 20 LTS via NodeSource (se não existir)
node --version 2>/dev/null || {
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
}

# 3. Instalar Python 3 e venv (para os seeds)
apt-get install -y python3 python3-pip python3-venv

# 4. Instalar pm2 globalmente (para o worker BullMQ)
npm install -g pm2

# 5. Garantir extensão pgvector no Postgres (se ainda não tiver)
#    Conecte ao Postgres como superuser e rode:
#    CREATE EXTENSION IF NOT EXISTS vector;
```

## 1. Variáveis de ambiente seguras (sessão única)

**No servidor**, exporte as credenciais APENAS NA SESSÃO atual. O espaço antes de `export` impede que o comando vá para `~/.bash_history` (se a opção `HISTCONTROL=ignorespace` estiver ativa — recomendado).

```bash
# === RODE DENTRO DO SERVIDOR ===
export HISTCONTROL=ignorespace:erasedups

# (com espaço inicial!) — credenciais só na memória da sessão:
 export GH_TOKEN='cole_aqui_o_PAT_GITHUB'
 export DATABASE_URL='postgresql://USUARIO:SENHA@HOST:5432/DBNAME'
 export REDIS_URL='redis://HOST:6379'
 export NEXUS_RAG_BACKEND='pgvector'

# (opcionais, para Genkit/OpenAI/Google):
 export OPENAI_API_KEY='cole_aqui'
 export GOOGLE_AI_API_KEY='cole_aqui'

# Verificar (sem expor o valor):
echo "GH_TOKEN length=${#GH_TOKEN}  DB length=${#DATABASE_URL}"
```

## 2. Execução em UMA linha

```bash
# === RODE DENTRO DO SERVIDOR ===
curl -fsSL https://www.genspark.ai/api/files/s/<BUNDLE_DEPLOY_SH_URL> -o /tmp/ravi_deploy.sh
chmod +x /tmp/ravi_deploy.sh
/tmp/ravi_deploy.sh
```

O script `ravi_deploy.sh` faz, em sequência:

1. Clona/atualiza o repo em `/opt/nexus-affiliate` usando `GH_TOKEN` da memória.
2. Cria branch `feature/hub-tecnologico-marketplace-academia` (ou troca para ela).
3. Aplica o bundle Ravi-CTO (mesmo conteúdo que já está em `ravi-bundle.zip`).
4. Aplica os 4 patches manuais via `patch` ou `python3` (idempotente).
5. Roda `npm install` e `npm run build` (backend + frontend).
6. Aplica migrations `0012` e `0013` no Postgres via `psql`.
7. Roda `publish_marketplace_ebooks.py` e `seed_marketplace_ebooks.py`.
8. Sobe/recarrega `ragIngestWorker` no PM2.
9. Faz os 5 healthchecks.
10. Commita e dá push na branch.
11. Abre o PR via API REST do GitHub (sem usar `gh` CLI).

Saída esperada (resumo no final):

```
[ravi-deploy] ✅ build backend OK
[ravi-deploy] ✅ build frontend OK
[ravi-deploy] ✅ migration 0012 OK
[ravi-deploy] ✅ migration 0013 OK
[ravi-deploy] ✅ 132 ebooks no marketplace_ebooks
[ravi-deploy] ✅ 169 lições academia_lessons (via overrides)
[ravi-deploy] ✅ pgvector OK · nexusRag.stats={"backend":"pgvector"...}
[ravi-deploy] ✅ pm2 nexus-rag-worker online
[ravi-deploy] ✅ git push origin feature/hub-tecnologico-marketplace-academia
[ravi-deploy] ✅ PR aberto: https://github.com/Nexus-HUB57/MMN_AI-to-AI/pull/N
```

## 3. Pós-deploy (rotação de credenciais OBRIGATÓRIA)

Logo após o `[ravi-deploy] ✅ PR aberto`, **antes de fazer qualquer outra coisa**:

```bash
# === Limpa as credenciais da sessão ===
unset GH_TOKEN DATABASE_URL REDIS_URL OPENAI_API_KEY GOOGLE_AI_API_KEY
history -c

# === No GitHub ===
# https://github.com/settings/tokens → Revoke o PAT usado
# Criar um novo PAT com escopo MÍNIMO (repo:status, public_repo se aplicável)
# e guardar em GitHub Actions Secrets, NÃO em chat.

# === No servidor ===
passwd                              # nova senha root forte
# Editar /etc/ssh/sshd_config:
#   PasswordAuthentication no
#   PermitRootLogin prohibit-password
systemctl restart sshd
```

## 4. Rollback (1 comando)

Se algo der errado:

```bash
/tmp/ravi_deploy.sh rollback
```

Isso:
- Reverte para a `main` no checkout.
- Faz `pm2 stop nexus-rag-worker`.
- Mantém as migrations (são idempotentes, sem `DROP`).
- Setar `NEXUS_RAG_BACKEND=in-memory` na env do backend volta o RAG para fallback sem precisar mexer no banco.
