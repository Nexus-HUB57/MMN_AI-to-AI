# Deploy HostGator — Guia Operacional

> Frontend estático servido pela HostGator em `oneverso.com.br`.
> Backend tRPC roda no Render em `api.oneverso.com.br`.

---

## 1. Arquitetura

```
┌─────────────────────────────────────┐
│  Browser (cliente)                  │
│  https://oneverso.com.br            │
└────────────┬────────────────────────┘
             │  HTML/JS/CSS estáticos
             ▼
┌─────────────────────────────────────┐
│  HostGator (Apache/Nginx)           │
│  /home/USER/public_html/            │
│  → conteúdo de frontend/dist        │
└────────────┬────────────────────────┘
             │ XHR/tRPC
             ▼
┌─────────────────────────────────────┐
│  Render / VPS                       │
│  https://api.oneverso.com.br        │
│  Node 20 · Backend tRPC · PM2       │
└────────────┬────────────────────────┘
             ▼
        Postgres + Redis
```

---

## 2. Pré-requisitos

- [x] Build limpo do frontend (`npm run build:frontend`)
- [x] Variáveis `VITE_*` em `frontend/.env.production`
- [x] Acesso FTP/cPanel (`ftp.oneverso.com.br`) ou SSH ao host
- [x] Backup do `public_html` atual antes de sobrescrever

---

## 3. Deploy passo a passo

### 3.1 Build local

```bash
cd /caminho/MMN_AI-to-AI

# Garante .env.production com URLs corretas
cat frontend/.env.production | grep VITE_TRPC_URL  # deve apontar para https://api.oneverso.com.br/api/trpc

# Build de produção
npm run build:frontend

# Verificar output
ls -lh frontend/dist | head -20
du -sh frontend/dist
```

### 3.2 Upload para HostGator

#### Opção A — Script automatizado (recomendado)

```bash
# Configurar credenciais via variáveis de ambiente
export HOSTGATOR_HOST="ftp.oneverso.com.br"
export HOSTGATOR_USER="usuario_cpanel"
export HOSTGATOR_PASS="senha"           # ou use HOSTGATOR_SSH_KEY para SSH
export HOSTGATOR_REMOTE_PATH="/public_html"

./scripts/deploy-hostgator-frontend.sh
```

O script:
1. Roda `npm run build:frontend` se a flag `--build` for usada.
2. Sincroniza `frontend/dist/` ↔ `public_html` via `lftp mirror`.
3. Pode ser executado primeiro com `--dry-run`.
4. Publica o `.htaccess` versionado em `frontend/public/.htaccess` para garantir SPA fallback.

### 3.2.1 Deploy automatizado via GitHub Actions

Crie os seguintes secrets no repositório:

- `HOSTGATOR_USER`
- `HOSTGATOR_PASS`
- `HOSTGATOR_HOST` (opcional, default `ftp.oneverso.com.br`)
- `HOSTGATOR_REMOTE_PATH` (opcional, default `/public_html`)

Depois disso, o workflow **Deploy Frontend to HostGator** poderá publicar automaticamente o frontend após o CI passar em `main`.

#### Opção B — cPanel File Manager (manual)

1. Logar em `https://oneverso.com.br:2083`.
2. Abrir **File Manager → public_html**.
3. Renomear pasta antiga: `mv public_html public_html.bkp-YYYY-MM-DD`.
4. Recriar `public_html` vazia.
5. Fazer upload do ZIP de `frontend/dist`.
6. Extrair o ZIP.
7. Garantir que `index.html` esteja na raiz.

### 3.3 Configurar `.htaccess` para SPA + HTTPS

Conteúdo recomendado em `public_html/.htaccess`:

```apache
# Forçar HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule (.*) https://%{HTTP_HOST}%{REQUEST_URI} [R=301,L]

# SPA fallback — todas as rotas client-side caem no index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Cache agressivo dos assets versionados pelo Vite
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/css                "access plus 1 year"
  ExpiresByType application/javascript  "access plus 1 year"
  ExpiresByType image/svg+xml           "access plus 1 month"
  ExpiresDefault                        "access plus 1 hour"
</IfModule>

# Compressão
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>
```

### 3.4 Validar pós-deploy

```bash
# 1. Status HTTP
curl -I https://oneverso.com.br        # 200
curl -I https://oneverso.com.br/login  # 200 (SPA fallback)

# 2. Verificar bundle correto
curl -s https://oneverso.com.br/ | grep -oE 'index-[A-Za-z0-9_-]+\.js'

# 3. Smoke test do backend
curl -I https://api.oneverso.com.br/health
```

---

## 4. Backend (Render) — checklist

Embora o backend não esteja na HostGator, é parte do mesmo deploy:

- [ ] Migration `0003_agent_extras.sql` aplicada (ver `docs/MIGRATION_0003_GUIDE.md`).
- [ ] Variáveis de ambiente revisadas:
  - `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `ALLOWED_ORIGIN=https://oneverso.com.br`
- [ ] Deploy automático do frontend: configurar os secrets `HOSTGATOR_*` para habilitar o workflow `.github/workflows/deploy-hostgator-frontend.yml`.
- [ ] Smoke tests pós-deploy: o workflow `.github/workflows/smoke-tests.yml` valida portal, SPA fallback e `/health` da API.
- [ ] Testes de contrato/persistência: `tests/unit/agents.persistence.test.ts` validam o domínio de agentes antes da publicação.

---

## 5. Rollback

```bash
# Pelo cPanel
mv public_html.bkp-YYYY-MM-DD public_html.broken
mv public_html.bkp-YYYY-MM-DD-anterior public_html

# Pelo script (próxima versão)
./scripts/deploy-hostgator-frontend.sh --rollback
```

---

## 6. Troubleshooting

| Sintoma | Provável causa | Ação |
|---|---|---|
| 404 em rotas profundas | `.htaccess` sem SPA fallback | Restaurar `.htaccess` do § 3.3 |
| Mixed content | `VITE_TRPC_URL` em http | Refazer build com https |
| CORS bloqueado | `ALLOWED_ORIGIN` no backend não bate com o domínio | Atualizar var no Render |
| Bundle antigo persistindo | Cache do navegador / CDN | Hard refresh + ajustar `Cache-Control` no `.htaccess` |
