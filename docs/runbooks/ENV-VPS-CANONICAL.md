# Env Vars VPS Canonical · Runbook

## Contexto
A VPS HostGator (`143.95.213.237`) é a fonte canonical de todas as env vars.
Render é apenas staging opcional — NÃO está no path DNS do usuário.

## Localização
- **Fonte primária:** `/var/www/oneverso/current/backend/.env` (600 perms)
- **Sincronizado com:** `/var/www/oneverso/current/.env`
- **Carregado por:** `ecosystem.config.js` via loadEnvFile()
- **Executado por:** PM2 cluster `mmn-api` (2 instancias)

## Backups Confiáveis
1. `.env.bak.golive.20260624_103016` — 50 keys (fonte principal)
2. `.env.bak.d18.1782528136` — MP_TEST recuperado aqui
3. `.env.bak.d6_failover` — Shopee (ID 18325891080)
4. `infra/RENDER_DEPLOY.md` — documentação keys

## Keys Críticas (13/15 ativas)
| Key | Status | Origem |
|-----|--------|--------|
| OPENAI_API_KEY | ✅ | golive backup |
| GEMINI_API_KEY | ✅ | golive backup |
| GOOGLE_GEMINI_API_KEY | ✅ | golive backup |
| HOTMART_CLIENT_ID | ✅ | golive backup |
| HOTMART_CLIENT_SECRET | ✅ | golive backup |
| HOTMART_BASIC_AUTH | ✅ | golive backup |
| SHOPEE_AFFILIATE_ID | ✅ | infra/RENDER_DEPLOY.md |
| SHOPEE_AFFILIATE_USERNAME | ✅ | infra/RENDER_DEPLOY.md |
| MERCADO_PAGO_ACCESS_TOKEN | ✅ | golive backup |
| MERCADO_PAGO_TEST_ACCESS_TOKEN | ✅ | .env.bak.d18 |
| JWT_SECRET | ✅ | gerado openssl rand -hex 32 |
| FIREBASE_PRIVATE_KEY | ✅ | golive backup |
| GITHUB_TOKEN | ✅ | git remote origin |
| DATABASE_URL | ✅ | postgres local |
| REDIS_URL | ✅ | redis local |

## Como Adicionar Nova Env Var
```bash
echo "NEW_VAR=value" >> /var/www/oneverso/current/backend/.env
cp /var/www/oneverso/current/backend/.env /var/www/oneverso/current/.env
pm2 reload mmn-api --update-env
pm2 save
```

## Como Verificar (Node runtime)
```bash
cd /var/www/oneverso/current/backend
node -e "require('dotenv').config(); console.log('KEY:', !!process.env.KEY_NAME);"
```

## Rollback
```bash
cp /var/www/oneverso/backups/onda-13-envmig-*/env.atual /var/www/oneverso/current/backend/.env
pm2 reload mmn-api --update-env
```

## Render (fallback opcional)
- `render.yaml` presente mas NÃO no path DNS
- DNS `oneverso.com.br` → `143.95.213.237` (VPS)
- Render pode ser usado como staging separado
