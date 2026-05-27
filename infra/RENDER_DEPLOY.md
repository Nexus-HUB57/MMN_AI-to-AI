# 🚀 Deploy do Backend Nexus SaaS no Render

Guia operacional para colocar o backend tRPC do **Nexus SaaS (IOAID)** rodando
em produção no [Render](https://render.com) com o subdomínio
`api.oneverso.com.br`.

---

## 1. Visão geral

- **Provedor**: Render (Web Service · Docker · região Oregon)
- **Domínio final**: `https://api.oneverso.com.br`
- **Healthcheck**: `GET /api/health`
- **Stack**: Node 22 + Express + tRPC v11 + Drizzle ORM
- **Build**: multi-stage via `infra/Dockerfile` (publica frontend estático + backend tRPC)
- **Repositório**: <https://github.com/Nexus-HUB57/MMN_AI-to-AI>
- **Blueprint**: [`render.yaml`](../render.yaml) na raiz

> ⚠️ As credenciais Hotmart/Shopee/JWT NÃO ficam no repositório. Elas são
> configuradas pelo painel do Render (Environment → Add Environment Variable).

---

## 2. Pré-requisitos

1. Conta no Render: <https://dashboard.render.com>
2. Acesso ao DNS de `oneverso.com.br` no cPanel da HostGator
3. Acesso ao repo GitHub `Nexus-HUB57/MMN_AI-to-AI`

---

## 3. Criar o serviço (uma vez só)

### 3.1 Via Blueprint (recomendado)

1. No Render: **New → Blueprint**
2. Conectar o repositório `Nexus-HUB57/MMN_AI-to-AI`
3. Branch: `main`
4. O Render detecta automaticamente o arquivo `render.yaml` e cria o serviço
   **`nexus-saas-backend`**
5. Aceitar a criação. O primeiro build pode levar 5-10 minutos.

### 3.2 Manualmente (alternativa)

Se preferir não usar o Blueprint:

1. **New → Web Service**
2. Conectar o repositório
3. Configurar:
   - **Name**: `nexus-saas-backend`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./infra/Dockerfile`
   - **Docker Context**: `.` (raiz)
   - **Plan**: Starter ($7/mês) ou Free (com cold start)
   - **Health Check Path**: `/api/health`

---

## 4. Configurar variáveis de ambiente

No painel do serviço: **Environment → Environment Variables**.

### 4.1 Variáveis públicas (já no `render.yaml`)

| Chave | Valor |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `FRONTEND_ORIGIN` | `https://oneverso.com.br` |
| `ALLOWED_ORIGINS` | `https://oneverso.com.br,https://www.oneverso.com.br,https://api.oneverso.com.br` |
| `PUBLIC_DIR` | `/app/public` |
| `HOTMART_TOKEN_URL` | `https://api-sec-vlc.hotmart.com/security/oauth/token` |
| `HOTMART_API_BASE` | `https://developers.hotmart.com` |
| `SHOPEE_AFFILIATE_PROFILE_NAME` | `Nexus SaaS` |
| `SHOPEE_AFFILIATE_USERNAME` | `lucasthomaz2` |
| `SHOPEE_AFFILIATE_ID` | `18325891080` |

### 4.2 Segredos (adicionar manualmente)

| Chave | Conteúdo |
|---|---|
| `HOTMART_CLIENT_ID` | `a1680cf3-3595-4a5c-a5a9-e2168a20f6d7` |
| `HOTMART_CLIENT_SECRET` | `643a5db2-8238-4e16-8936-e528915e1710` |
| `HOTMART_BASIC_AUTH` | `Basic YTE2ODBjZjMtMzU5NS00YTVjLWE1YTktZTIxNjhhMjBmNmQ3OjY0M2E1ZGIyLTgyMzgtNGUxNi04OTM2LWU1Mjg5MTVlMTcxMA==` |
| `SHOPEE_LOGIN_EMAIL` | `lucasmpthomaz@gmail.com` |
| `SHOPEE_LOGIN_PASSWORD` | `Alberto1$` |
| `JWT_SECRET` | (gerado automaticamente pelo Render) |

> 💡 Cole cada valor individualmente em **Add Environment Variable** e
> marque a opção **Secret** para os campos sensíveis. Após salvar,
> o Render fará um redeploy automático.

### 4.3 Banco e Redis (opcionais agora)

O backend roda em **modo standalone** sem MySQL/Redis (rotas marketplace,
auth e domains públicos usam fallback in-memory). Para ativar persistência:

1. Criar `New → PostgreSQL` (free) no Render
2. Copiar `Internal Database URL` para `DATABASE_URL`
3. Criar `New → Redis` (free) para `REDIS_URL`
4. Rodar `npm run db:push` localmente apontando para `DATABASE_URL` antes do
   primeiro uso

---

## 5. Configurar o domínio `api.oneverso.com.br`

### 5.1 No Render

1. Painel do serviço → **Settings → Custom Domains → Add Custom Domain**
2. Digitar `api.oneverso.com.br`
3. O Render mostra um valor `CNAME` (algo como `nexus-saas-backend.onrender.com`)

### 5.2 No cPanel HostGator

1. cPanel → **Zone Editor** (Editor de Zona DNS) → `oneverso.com.br`
2. Adicionar registro:
   - **Type**: `CNAME`
   - **Name**: `api`
   - **TTL**: `14400`
   - **Record**: o valor `*.onrender.com` mostrado pelo Render
3. Salvar

Propagação DNS leva entre 5 minutos e 2 horas. Verificar com:

```bash
dig api.oneverso.com.br CNAME +short
curl -I https://api.oneverso.com.br/api/health
```

O Render emite certificado TLS automaticamente (Let's Encrypt) assim que o
DNS resolver.

---

## 6. Validação

Após o deploy estar **Live**:

```bash
# Health check
curl https://api.oneverso.com.br/api/health
# → {"ok":true,"service":"mmn-ai-to-ai-backend",...}

# Lista pública de parceiros (Nexus SaaS)
curl 'https://api.oneverso.com.br/api/trpc/partners.list?batch=1&input=%7B%220%22%3Anull%7D'

# Produtos em alta (com fallback curado + Hotmart live se credenciais válidas)
curl 'https://api.oneverso.com.br/api/trpc/partners.trending?batch=1&input=%7B%220%22%3A%7B%22limit%22%3A6%7D%7D'

# Saúde da integração Hotmart (deve retornar configured:true, ok:true)
curl 'https://api.oneverso.com.br/api/trpc/partners.hotmartHealth?batch=1&input=%7B%220%22%3Anull%7D'
```

---

## 7. Conectar o frontend ao backend ao vivo

O frontend hospedado em `https://oneverso.com.br` (HostGator) detecta o
backend automaticamente via `VITE_TRPC_URL`. Para apontar para o Render:

1. Definir variável de build no `frontend/.env.production` (ou no pipeline
   de deploy estático):

   ```env
   VITE_TRPC_URL=https://api.oneverso.com.br/api/trpc
   VITE_API_URL=https://api.oneverso.com.br
   ```

2. Refazer `npm --workspace frontend run build`
3. Subir via `lftp` para o `public_html` da HostGator

Sem esta etapa, o frontend continua usando o feed local curado da Nexus SaaS
(fallback inteligente embutido em `/estoque`).

---

## 8. Manutenção e troubleshooting

| Sintoma | Causa provável | Ação |
|---|---|---|
| `503 Service Unavailable` | Cold start no plano Free | Migrar para Starter ($7/mês) |
| `CORS error` no browser | Origem não listada | Adicionar em `ALLOWED_ORIGINS` |
| Hotmart retorna `401` | Credenciais expiraram | Regerar Client Secret no painel Hotmart |
| Build falha em `expo-local-authentication` | npm install entrou no workspace mobile | O Dockerfile usa `--workspaces=false` no stage final + `--legacy-peer-deps`, mas se o stage 1 falhar, basta excluir o workspace mobile temporariamente |
| `Module not found: drizzle-orm` | Lockfile desatualizado | Já corrigido — drizzle-orm está em `backend/package.json`. Forçar **Manual Deploy → Clear build cache** |

Logs em tempo real: **Service → Logs** no painel Render.

---

## 9. CI/CD

O repositório já possui workflow GitHub Actions
`.github/workflows/backend-container.yml` que constrói e publica a imagem
em `ghcr.io/nexus-hub57/mmn-ai-to-ai:latest` a cada push em `main`.

O Render também faz **auto-deploy** a cada push graças a
`autoDeploy: true` no `render.yaml`. Não é necessária ação manual após
mudanças no código.

---

## 10. Próximos passos sugeridos

1. ✅ Provisionar Postgres no Render e rodar `db:push`
2. ✅ Provisionar Redis para fila BullMQ (workers de comissões/marketplace)
3. ✅ Configurar `OPENAI_API_KEY` para liberar o módulo Content Hub
4. ✅ Reativar `npm install --workspace mobile` quando publicar o app Expo

---

Documentação atualizada em 2026-05-27.
