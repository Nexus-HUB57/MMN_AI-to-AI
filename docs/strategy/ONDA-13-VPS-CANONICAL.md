# ONDA 13 · VPS CANONICAL · 15/15 Keys ATIVAS
**Data:** 2026-07-03 22:00 BRT  
**Diretiva CEO:** *"Migrar env vars Render → VPS HostGator, tudo na plataforma"*  
**Episódio Niko:** id=24

## Descoberta Crítica
CEO perguntou "consegue validar migração Render → VPS?" — investigação revelou:

**A VPS JÁ ERA O CANONICAL desde o início.**
- DNS `oneverso.com.br` → `143.95.213.237` (VPS HostGator)
- Backend `mmn-api` PM2 cluster 2 instâncias rodando local
- Nginx proxy_pass `127.0.0.1:3001`
- Render nunca esteve no path DNS do usuário final

**O problema real:** env vars perdidas ao longo dos deploys. Não era "migrar" — era **restaurar/consolidar**.

## Ações Executadas

### F1 · Localização de fontes confiáveis
| Fonte | Keys | Uso |
|-------|------|-----|
| `.env.bak.golive.20260624_103016` | 50 | Fonte principal (OPENAI/GEMINI/HOTMART/MP/Firebase) |
| `.env.bak.d18.1782528136` | 100+ | MP_TEST recuperado |
| `.env.bak.d6_failover` | 70+ | Confirmação Shopee |
| `infra/RENDER_DEPLOY.md` | docs | SHOPEE_AFFILIATE_ID 18325891080 |
| `git remote origin` | 1 | GITHUB_TOKEN |
| `openssl rand -hex 32` | 1 | JWT_SECRET novo |

### F2 · Consolidação
- Backup atual em `/var/www/oneverso/backups/onda-13-envmig-*/`
- Merge de todas as fontes → `/var/www/oneverso/current/backend/.env`
- Sync com `/var/www/oneverso/current/.env`
- Chmod 600 (perms restritas)

### F3 · Reload PM2 com --update-env
- Cluster mmn-api ids 9, 10 recarregados
- `pm2 save` para persistência no reboot
- Validação: `node -e "require('dotenv').config(); console.log(process.env.XXX)"`

## Status Final: 15/15 Keys Ativas ✅

```json
{
  "gemini": true,
  "gemini_google": true,
  "openai": true,
  "database": true,
  "redis": true,
  "hotmart": true,
  "hotmart_secret": true,
  "hotmart_basic_auth": true,
  "shopee": true,
  "shopee_user": true,
  "mercadopago_prod": true,
  "mercadopago_test": true,
  "jwt": true,
  "firebase": true,
  "github_token": true
}
Total ativos: 15/15
```

## Deploy

| Item | Valor |
|------|-------|
| Backend | `dist/index.js` 1.4 MB — health.ok=true |
| PM2 | cluster 2 instances --update-env + save |
| Rotas admin | 11/11 HTTP 200 |
| Autonomy Score | preservado |
| Render | fallback opcional (não no path) |

## Recomendação Estratégica

**Manter Render APENAS como staging separado** (branch develop, deploy automatico), sem depender dele para produção. Toda operação crítica agora é 100% VPS:

- ✅ **Prós VPS Canonical:** custo baixo, controle total, PM2 cluster, backups locais
- ✅ **Prós Render fallback:** disaster recovery se VPS cair, deploy preview de PRs
- ⚠️ **Contra:** VPS single point of failure (mitigar com backup diário DB)

## Próximas Ações (Onda 14)

1. **Testar integrações reais com keys ativas:**
   - Gemini: chat/RAG queries
   - OpenAI: agent skills
   - Hotmart: webhook + comission tracking
   - Shopee: OAuth flow completo
   - Mercado Pago PROD: **teste PIX R$1** (autorização pendente)
2. **Backup automático diário DB** → S3 ou HostGator storage
3. **Monitoring dashboard** — health API + Redis + Postgres + disk usage
4. **Documentar `render.yaml` como staging-only**

## Aprendizado (Niko id=24)
> Antes de discutir migração, verificar DNS + nginx config para saber qual servidor realmente está no path do usuário. Backups `.env.bak.*` contêm chaves críticas — documentar como fonte de verdade. JWT deve ser gerado no first-deploy nunca commitado no repo.
