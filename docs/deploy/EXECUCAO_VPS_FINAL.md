# 🚀 Execução VPS — Roteiro Operacional Final

> **VPS São Paulo**: `143.95.213.237` · Ubuntu 22.04/24.04 LTS  
> **SSH**: porta `22022` · usuário inicial `root`, depois `deploy`  
> **Domínio**: `oneverso.com.br` + `www.oneverso.com.br`  
> **Stack**: Node 20 + tRPC + Drizzle + MySQL 8 + Redis 7 + PM2 + Nginx + Certbot  
> **Status do código**: Sprint 1+2+3 aplicadas, build validado, smoke test OK  
> **Tempo estimado total**: ~90–120 minutos

---

## ⏱️ Linha do tempo do go-live

| Bloco | Duração | Objetivo |
|-------|---------|----------|
| **Bloco 0** | 5 min | Pré-requisitos no operador |
| **Bloco 1** | 10 min | Upload do pacote ao VPS |
| **Bloco 2** | 15 min | Hardening (`01-hardening.sh`) |
| **Bloco 3** | 25 min | Runtime (`02-runtime.sh`) |
| **Bloco 4** | 10 min | Configuração `.env` produção |
| **Bloco 5** | 20 min | Deploy app (`03-deploy-app.sh`) |
| **Bloco 6** | 10 min | Nginx + TLS (`04-enable-nginx-tls.sh`) |
| **Bloco 7** | 15 min | Validação funcional |
| **Bloco 8** | 5 min | Smoke pós go-live |

---

## 🧰 Bloco 0 — Pré-requisitos do operador

Antes de iniciar, garanta na sua máquina local:

```bash
# 1) Acesso SSH ao VPS via chave (a chave pública já deve estar em /root/.ssh/authorized_keys do VPS)
ssh -p 22022 root@143.95.213.237 "echo ok"

# 2) Pacote final baixado:
#    - ZIP: mmn-ai-to-ai-ajustes-vps-v3.zip
#    - Patch (opcional, caso prefira git am):
#    - mmn-ai-to-ai-correcoes-completo-v3.patch

# 3) DNS A apontando para 143.95.213.237 (oneverso.com.br e www.oneverso.com.br)
dig +short oneverso.com.br A
dig +short www.oneverso.com.br A
```

**Critério de avanço**: SSH funcional + DNS apontando.

---

## 📤 Bloco 1 — Upload do pacote ao VPS

Na máquina local, dentro do diretório onde está o ZIP:

```bash
# Cria diretório no VPS
ssh -p 22022 root@143.95.213.237 "mkdir -p /opt/nexus-deploy"

# Envia o ZIP final v3
scp -P 22022 mmn-ai-to-ai-ajustes-vps-v3.zip root@143.95.213.237:/opt/nexus-deploy/

# Conecta e descompacta
ssh -p 22022 root@143.95.213.237
```

**Dentro do VPS** (como root):

```bash
cd /opt/nexus-deploy
apt-get update -qq && apt-get install -y -qq unzip
unzip -q mmn-ai-to-ai-ajustes-vps-v3.zip -d nexus-release
ls nexus-release/infra/
# Esperado: 01-hardening.sh, 02-runtime.sh, 03-deploy-app.sh, 04-enable-nginx-tls.sh, nginx/
```

**Critério de avanço**: pacote extraído com os 4 scripts visíveis em `infra/`.

---

## 🛡️ Bloco 2 — Hardening do VPS

```bash
cd /opt/nexus-deploy/nexus-release
chmod +x infra/*.sh

# Executa hardening (cria usuário deploy, SSH 22022, UFW, fail2ban, swap 2GB, timezone SP)
bash infra/01-hardening.sh
```

**O que esse script faz**:
- cria usuário `deploy` com sudo NOPASSWD
- copia `~/.ssh/authorized_keys` para o usuário deploy
- reconfigura SSH para porta `22022`, sem root, sem senha
- ativa UFW liberando 22022, 80, 443
- instala fail2ban (maxretry=3, bantime=1h)
- cria swap de 2GB em `/swapfile`
- ajusta `vm.swappiness=10`
- define timezone `America/Sao_Paulo`
- ativa `unattended-upgrades`

⚠️ **Antes de fechar a sessão root**: abra outra janela SSH e teste o login com o novo usuário:

```bash
ssh -p 22022 deploy@143.95.213.237 "sudo whoami"
# Esperado: root
```

Só depois disso, encerre a sessão antiga.

**Critério de avanço**: SSH com `deploy@` funciona via sudo, UFW ativo, fail2ban rodando.

---

## ⚙️ Bloco 3 — Runtime stack

Reconecte como `deploy`:

```bash
ssh -p 22022 deploy@143.95.213.237
cd /opt/nexus-deploy/nexus-release

# Define senhas seguras (substituir os placeholders)
export MYSQL_NEXUS_PASS='COLOQUE_SENHA_MYSQL_FORTE_AQUI'
export REDIS_PASS='COLOQUE_SENHA_REDIS_FORTE_AQUI'

bash infra/02-runtime.sh
```

**O que esse script faz**:
- instala Node 20 LTS via nvm
- instala PM2 globalmente
- configura `pm2 startup systemd -u deploy`
- instala Nginx 1.24
- instala MySQL 8 e cria banco `nexus_prod` + usuário `nexus_app`
- instala Redis 7 com `requirepass` e `bind 127.0.0.1`, max 512MB
- instala Certbot via snap
- cria `/var/www/oneverso/{public,logs}`
- habilita pnpm via corepack

**Validações intermediárias**:

```bash
node --version            # v20.x
pm2 --version             # >= 5
nginx -v                  # 1.24+
mysql --version           # 8.x
redis-cli -a "$REDIS_PASS" ping   # PONG
```

**Critério de avanço**: as 5 verificações acima respondem corretamente.

---

## 🔐 Bloco 4 — `.env` de produção

Mova o release para o destino final e crie os arquivos `.env`:

```bash
sudo mkdir -p /var/www/oneverso
sudo chown -R deploy:deploy /var/www/oneverso
cp -R /opt/nexus-deploy/nexus-release /var/www/oneverso/current
cd /var/www/oneverso/current

# Backend .env de produção
cp backend/.env.production.example backend/.env.production
nano backend/.env.production
```

Preencha os placeholders no `backend/.env.production`:

```env
NODE_ENV=production
PORT=3001
FRONTEND_ORIGIN=https://oneverso.com.br
ALLOWED_ORIGINS=https://oneverso.com.br,https://www.oneverso.com.br

# Gere com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ADMIN_SESSION_SECRET=<32_bytes_hex>

# SHA256 do email autorizado lucasmpthomaz@gmail.com já está no AuthContext;
# para o backend, gere com:
# node -e "console.log(require('crypto').createHash('sha256').update('lucasmpthomaz@gmail.com').digest('hex'))"
ADMIN_EMAIL_SHA256=7d67005172b41a8cf0abe1b5de9a5f1605821ff22d0207e9bd0f2cfcb91384b2
# Substitua pelo SHA256 da NOVA senha admin escolhida (NÃO use a anterior comprometida)
ADMIN_PASSWORD_SHA256=<sha256_da_nova_senha>

DATABASE_URL=mysql://nexus_app:<MYSQL_NEXUS_PASS>@127.0.0.1:3306/nexus_prod
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=<REDIS_PASS>
REDIS_URL=redis://:<REDIS_PASS>@127.0.0.1:6379

# Opcionais — preencher conforme integrações ativas:
OPENAI_API_KEY=
HOTMART_CLIENT_ID=
HOTMART_CLIENT_SECRET=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

Agora o frontend:

```bash
cp frontend/.env.production.vps.example frontend/.env.production
nano frontend/.env.production
```

Conteúdo:

```env
VITE_TRPC_URL=/api/trpc
VITE_API_URL=https://oneverso.com.br
VITE_ORCHESTRATOR_STATUS=live

VITE_FIREBASE_API_KEY=<valor_firebase>
VITE_FIREBASE_AUTH_DOMAIN=<valor_firebase>
VITE_FIREBASE_PROJECT_ID=<valor_firebase>
VITE_FIREBASE_APP_ID=<valor_firebase>
VITE_FIREBASE_STORAGE_BUCKET=<valor_firebase>
VITE_FIREBASE_MESSAGING_SENDER_ID=<valor_firebase>
```

**Critério de avanço**: ambos arquivos preenchidos sem placeholders `{{...}}` restantes.

---

## 🏗️ Bloco 5 — Deploy da aplicação

```bash
cd /var/www/oneverso/current
bash infra/03-deploy-app.sh
```

**O que esse script faz**:
- instala dependências via pnpm segmentado (frontend e backend separadamente)
- builda frontend (Vite) → `frontend/dist/`
- builda backend principal (esbuild) → `backend/dist/index.js`
- builda 4 workers (esbuild) → `backend/dist/workers/*.js`
- copia `frontend/dist/` para `/var/www/oneverso/public/`
- sobe/recarrega PM2 com 5 processos:
  - `mmn-api` (cluster x2)
  - `mmn-worker-content`
  - `mmn-worker-commissions`
  - `mmn-worker-marketplace`
  - `mmn-worker-orders`
- executa `pm2 save`
- health check local em `127.0.0.1:3001/api/health`

**Validações**:

```bash
pm2 status
# Esperado: 5 processos online (mmn-api online, 4 workers online)

curl -s http://127.0.0.1:3001/api/health | head
# Esperado: {"ok":true,"service":"mmn-ai-to-ai-backend",...}
```

**Critério de avanço**: 5 processos PM2 online + health 200.

---

## 🌐 Bloco 6 — Nginx + TLS

```bash
cd /var/www/oneverso/current
bash infra/04-enable-nginx-tls.sh
```

**O que esse script faz**:
- copia `infra/nginx/oneverso.com.br.conf` para `/etc/nginx/sites-available/`
- cria symlink em `sites-enabled`
- remove `default`
- valida `nginx -t`
- emite TLS via Certbot para `oneverso.com.br` e `www.oneverso.com.br`
- ativa redirect HTTP→HTTPS automático

**Pré-requisito**: DNS A já apontando para `143.95.213.237` antes desse bloco.

**Validação**:

```bash
sudo nginx -t
sudo systemctl status nginx
curl -I https://oneverso.com.br
curl -I https://oneverso.com.br/api/health
```

Resultados esperados:
- `nginx: configuration file ... test is successful`
- `HTTP/2 200` em ambos curl

**Critério de avanço**: HTTPS ativo no domínio com TLS válido.

---

## ✅ Bloco 7 — Validação funcional das 8 correções

Acesse `https://oneverso.com.br` no navegador e percorra:

| # | Rota | O que validar |
|---|------|---------------|
| 1 | `/dashboard` | menu lateral mostra **"Minha Loja"** (não mais "Mini-site") |
| 1 | `/minisite` | redireciona automaticamente para `/minha-loja` |
| 2 | `/upgrades` | mostra apenas packs da família do nível atual; próximos bloqueados |
| 3 | `/marketplaces` | expõe **apenas Pack Agente Afiliado A²** (slug `pack-a2`); ebooks visíveis |
| 4 | `/payments` aba Saldo | aparece widget **BRL ⇄ BTC** com selo "Custódia Binance" |
| 5 | `/orchestrator` | **sem** banner "API tRPC em standby"; dashboard limpo |
| 6 | `/academia/lab-nexus` | bloqueado para usuários abaixo de Orquestrador (tier estrategista+) |
| 7 | `/login` botão demo | leva direto a `/marketplaces`; login social Firebase funcional |
| 8 | login admin | usar `lucasmpthomaz@gmail.com` + nova senha definida no `.env` |

**Testes de API**:

```bash
# Health
curl -s https://oneverso.com.br/api/health

# Cotação BTC/BRL (público)
curl -s https://oneverso.com.br/api/trpc/banking.getBtcBrlQuote

# Status admin auth (deve retornar ready:true)
curl -s https://oneverso.com.br/api/trpc/adminAuth.status
```

**Critério de avanço**: 8 correções validadas visualmente + 3 endpoints respondendo.

---

## 🩺 Bloco 8 — Smoke pós go-live

```bash
# Logs PM2
pm2 logs --lines 50 --nostream

# Logs Nginx
sudo tail -n 100 /var/www/oneverso/logs/nginx-access.log
sudo tail -n 50 /var/www/oneverso/logs/nginx-error.log

# Persistência PM2 entre reboots
pm2 save
pm2 startup systemd -u deploy --hp /home/deploy
# Execute a linha sudo que o comando acima imprimir

# Teste de reboot (opcional, mas recomendado)
sudo reboot
# Aguardar ~30s e verificar:
ssh -p 22022 deploy@143.95.213.237 "pm2 status && curl -s http://127.0.0.1:3001/api/health"
```

**Critério de go-live finalizado**:
- ✅ HTTPS ativo
- ✅ PM2 com 5 processos online
- ✅ Health 200
- ✅ 8 correções validadas
- ✅ Persistência após reboot

---

## 🔄 Plano de rollback (gatilhos objetivos)

Acione rollback se **qualquer** condição abaixo for verdadeira nas primeiras 24h:

| Gatilho | Ação |
|---------|------|
| HTTP 5xx > 5% por 5 min consecutivos | `pm2 restart all` → se persistir, abaixo |
| `/api/health` retorna != 200 por 3 min | Reverter para `master` (baseline) |
| Login admin não funciona | Validar `ADMIN_*_SHA256` no `.env` |
| TLS não emite | Verificar DNS antes de re-rodar `04-enable-nginx-tls.sh` |
| MySQL/Redis indisponível | `sudo systemctl status mysql redis-server` |

**Rollback rápido (revert dos commits Sprint 1-3)**:

```bash
cd /var/www/oneverso/current
git fetch origin
git checkout master   # baseline antes das correções
bash infra/03-deploy-app.sh
```

---

## 🔐 Pós go-live — Itens de segurança

Rotacionar **imediatamente após estabilização**:

- [ ] GitHub PAT usado nesta sessão (revogar em https://github.com/settings/tokens)
- [ ] Senha do admin (gerar nova, atualizar `ADMIN_PASSWORD_SHA256` no `.env`)
- [ ] Senha MySQL (`MYSQL_NEXUS_PASS`)
- [ ] Senha Redis (`REDIS_PASS`)
- [ ] cPanel/FTP HostGator (luc92554 e Gens_rsa@oneverso.com.br)
- [ ] cPanel API Token Gens_Nexus
- [ ] Render API key (revogar `rnd_ERKVL...` em https://dashboard.render.com/u/settings)
- [ ] Chave SSH antiga (gerar novo par ed25519, remover a chave RSA exposta)

Armazenar novas credenciais em **gerenciador de senhas** (Bitwarden / 1Password) — nunca commitar no repositório.

---

## 📚 Referências de apoio

- PRD v2.0 — Correções da Plataforma
- Runbook v2.0 — HostGator → VPS
- Slides Executivos
- Diagrama de Arquitetura Final
- Patch cumulativo v3 — `mmn-ai-to-ai-correcoes-completo-v3.patch`
- ZIP final v3 — `mmn-ai-to-ai-ajustes-vps-v3.zip`

---

## ✅ Estado pós-execução esperado

Após percorrer todos os blocos:

- `https://oneverso.com.br` servindo SPA React buildada
- `https://oneverso.com.br/api/trpc/*` operacional via Nginx → PM2 cluster
- 4 workers BullMQ processando filas Redis
- MySQL `nexus_prod` populado via migrations Drizzle
- TLS Let's Encrypt com renovação automática
- Fail2ban + UFW protegendo o perímetro
- PM2 persistindo entre reboots
- Backup `pg_dump`/`mysqldump` cron pendente (Bloco 9 do Runbook)

**Status final**: plataforma operacional em produção no VPS São Paulo.
