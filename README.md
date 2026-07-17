# Ravi-CTO · Bundle de Entrega (Nexus Affil'IA'te) · **v3 · CI/CD Blindado**

> Pacote operacional autônomo do CTO Ravi para o **Go-Live** do hub tecnológico Nexus Affil'IA'te: Marketplace 132 + AcademIA Ingest + Cron + RAG.
>
> **Modelo de deploy**: GitHub Actions Secrets. **Zero credencial** em chat, em terminal local ou em log. Tudo via push para a branch — o resto é automatizado.

---

## 🎯 Deploy em 3 passos

### 1️⃣ Configurar Secrets (uma única vez)

Em [`deploy/SETUP_SECRETS_GITHUB.md`](./deploy/SETUP_SECRETS_GITHUB.md), criar 8 secrets no repositório (https://github.com/Nexus-HUB57/MMN_AI-to-AI/settings/secrets/actions):

| Secret | Conteúdo |
|---|---|
| `SSH_GITHUB` | chave SSH privada (ed25519) |
| `DEPLOY_HOST` | `143.95.213.237` |
| `DEPLOY_PORT` | `22022` |
| `DEPLOY_USER` | `root` (provisório) → `nexusdeploy` (pós-hardening) |
| `DEPLOY_DIR` | `/opt/nexus-affiliate` |
| `DATABASE_URL` | URL Postgres |
| `REDIS_URL` | URL Redis |
| `HEALTH_BASE_URL` | URL pública (ex: `https://nexus-affiliate.com.br`) |

Mais (opcional): `OPENAI_API_KEY`, `GOOGLE_AI_API_KEY`.

### 2️⃣ Aplicar bundle no repositório

```bash
git clone https://github.com/Nexus-HUB57/MMN_AI-to-AI.git && cd MMN_AI-to-AI

curl -fsSL https://www.genspark.ai/api/files/s/xB4dwveZ -o /tmp/ravi-bundle.zip
unzip -o /tmp/ravi-bundle.zip -d /tmp/
bash /tmp/ravi-bundle/scripts/apply_bundle.sh "$PWD"

# Copiar os workflows
mkdir -p .github/workflows
cp /tmp/ravi-bundle/.github/workflows/*.yml .github/workflows/

# Patches manuais (instruções em /tmp/ravi-bundle/patches/)
git add -A && git commit -m "feat(hub): Ravi-CTO CI/CD blindado"
git push origin feature/hub-tecnologico-marketplace-academia
```

### 3️⃣ Acompanhar deploy automático

O push **dispara o workflow** `Ravi · Deploy Automatizado`. Acompanhe em:
- https://github.com/Nexus-HUB57/MMN_AI-to-AI/actions
- ou `gh run watch`

---

## 📦 Conteúdo

```
ravi-bundle/
├── README.md                                       ← você está aqui
├── deploy/
│   ├── 00_INSTRUCOES_DEPLOY_RAVI.md                ← v2 (sessão SSH manual, legado)
│   ├── ravi_deploy.sh                              ← v2 script idempotente (legado)
│   ├── SETUP_SECRETS_GITHUB.md                     ⭐ v3 GitHub Actions Secrets
│   └── COMO_DISPARAR.md                            ⭐ v3 guia 3 passos
├── .github/workflows/
│   ├── ravi-deploy.yml                             ⭐ workflow de deploy
│   ├── ravi-rollback.yml                           ⭐ workflow de rollback
│   └── deploy-production.yml                       ← v2 referência (legado)
├── backend/src/services/nexusRagPgRepository.ts    ← adapter pgvector
├── backend/src/workers/ragIngestWorker.ts          ← worker BullMQ
├── database/migrations/0012_marketplace_user_library.sql
├── database/migrations/0013_nexus_rag.sql
├── docs/
│   ├── architecture/CRON_RAG_ORCHESTRATION.md      ← ADR-001
│   ├── runbooks/GO_LIVE_CHECKLIST.md               ← runbook manual
│   └── security/
│       ├── SECURITY_HARDENING.md                   ← hardening pós-deploy
│       └── SECRETS_AUDIT_PROCEDURE.md              ⭐ auditoria mensal
├── patches/
│   ├── nexusRagService.patch.md
│   ├── LabChatbot.patch.md
│   └── gitignore.patch.md
└── scripts/apply_bundle.sh
```

---

## 🛡️ Modelo de segurança (resumido)

| Risco | Mitigação |
|---|---|
| Senha root colada em chat | **Eliminada**: deploy via SSH key no Actions Secret |
| PAT em terminal local | **Eliminada**: workflow usa SSH agent, não Git HTTPS |
| Segredos em log | Actions mascara automaticamente; arquivos `.env` 600 |
| Acesso humano contínuo ao servidor | **Eliminado** após hardening: deploy = `git push` |
| Vazamento histórico | Auditoria mensal em [`SECRETS_AUDIT_PROCEDURE.md`](./docs/security/SECRETS_AUDIT_PROCEDURE.md) |
| Falha de deploy | Rollback em 1 clique (`ravi-rollback.yml`) |

---

## 🏛️ Por que CI/CD-first

Como CTO, defino esta postura:

1. **Nenhum humano deve precisar tocar no servidor de produção**. O servidor é gado, não animal de estimação.
2. **Toda credencial vive em secret manager**, com rotação documentada. Nunca em chat, ticket, PR, ou arquivo.
3. **Auditoria nativa**: cada deploy é um run do Actions, rastreável, repetível, e revertível.
4. **Princípio do menor privilégio**: `DEPLOY_USER=nexusdeploy` (não root) após hardening, sudoers granular apenas para `pm2` e `psql`.
5. **Defesa em profundidade**: branch protection + required reviewers + environment gating + healthchecks bloqueadores.

---

## 📚 Referências do projeto

- **Marketplace Nexus**: 132 ebooks publicados (HTML/PDF/SVG), 7 tabelas operacionais.
- **AcademIA**: 169 lições ingeridas em `data/academia-ead-overrides.json`.
- **Cron + RAG (ADR-001)**: service híbrido in-memory ↔ pgvector, router `nexusRag.*`, worker BullMQ.
- **Lab Chatbot**: toggle "Contexto Nexus" + bloco de citações.

— Ravi, CTO. 🚀🔒
