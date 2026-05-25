# ============================================
# MMN AI-to-AI — Deploy Checklist
# Hostgator VPS - oneverso.com.br
# ============================================

## 📋 Pré-Deploy Checklist

### 1. Servidor VPS (Hostgator)
- [ ] VPS contratado com mínimo 4 vCPU, 8GB RAM, 200GB NVMe
- [ ] Acesso SSH configurado
- [ ] Ubuntu/Linux instalado
- [ ] Usuário sudo criado (não root para segurança)
- [ ] Firewall configurado (ufw allow 22, 80, 443)

### 2. Domínio DNS
- [ ] Domínio oneverso.com.br registrado
- [ ] DNS configurado para apontar para IP do VPS
- [ ] A record: oneverso.com.br -> IP_DO_VPS
- [ ] A record: www.oneverso.com.br -> IP_DO_VPS
- [ ] Propagação DNS verificada (24-48h)

### 3. Software do Servidor
- [ ] Node.js 20+ instalado (via nvm ou binary)
- [ ] npm 10+ instalado
- [ ] PM2 instalado globalmente (`npm install -g pm2`)
- [ ] MySQL instalado (`sudo apt install mysql-server`)
- [ ] Redis instalado (`sudo apt install redis-server`)
- [ ] Nginx instalado (`sudo apt install nginx`)
- [ ] Certbot instalado (`sudo apt install certbot python3-certbot-nginx`)

### 4. Banco de Dados MySQL
- [ ] MySQL service iniciado
- [ ] Database criada: `CREATE DATABASE mmn_ai;`
- [ ] Usuário criado: `CREATE USER 'mmn_user'@'localhost' IDENTIFIED BY 'password';`
- [ ] Permissões concedidas: `GRANT ALL PRIVILEGES ON mmn_ai.* TO 'mmn_user'@'localhost';`
- [ ] `FLUSH PRIVILEGES;`

### 5. Redis
- [ ] Redis service iniciado
- [ ] Testado: `redis-cli ping` (retorna PONG)

### 6. Certificado SSL
- [ ] Nginx configurado (mesmo que temporário)
- [ ] Certbot executado para gerar certificados
- [ ] Certificados em `/etc/letsencrypt/live/oneverso.com.br/`

### 7. Variáveis de Ambiente (.env.production)
- [ ] `DATABASE_URL` configurado corretamente
- [ ] `REDIS_URL` configurado corretamente
- [ ] `JWT_SECRET` com chave segura (32+ chars)
- [ ] `OPENAI_API_KEY` configurado
- [ ] `GEMINI_API_KEY` configurado
- [ ] `ALLOWED_ORIGIN` definido como https://oneverso.com.br

### 8. Estrutura de Diretórios
```
/var/www/oneverso.com.br/
├── frontend/dist/
├── backend/
├── logs/
├── backups/
├── .env.production
├── ecosystem.config.js
└── package.json
```

### 9. Build do Projeto
- [ ] Dependências instaladas (`npm install`)
- [ ] Frontend buildado (`npm run build:frontend`)
- [ ] Backend buildado (`npm run build:backend`)
- [ ] Workers compilados para dist/

### 10. Migrações do Banco
- [ ] `npm run db:generate`
- [ ] `npm run db:migrate`
- [ ] Verificado: tabelas criadas no MySQL

### 11. PM2 Configuration
- [ ] `ecosystem.config.js` criado
- [ ] `pm2 start ecosystem.config.js --env production`
- [ ] `pm2 save`
- [ ] `pm2 startup` (para auto-start no boot)

### 12. Nginx Configuration
- [ ] Configuração em `/etc/nginx/sites-available/oneverso.com.br`
- [ ] Link em `/etc/nginx/sites-enabled/`
- [ ] `nginx -t` passou sem erros
- [ ] `systemctl reload nginx`

### 13. Health Checks
- [ ] API: `curl http://localhost:3000/health` retorna 200
- [ ] Frontend: `curl https://oneverso.com.br` retorna 200
- [ ] PM2: `pm2 list` mostra todos os processos running

### 14. Monitoramento
- [ ] Logs configurados e rotacionados
- [ ] PM2 logs visíveis: `pm2 logs`
- [ ] Nginx logs acessíveis

### 15. Segurança
- [ ] Firewall configurado (somente 22, 80, 443)
- [ ] Fail2ban instalado e configurado
- [ ] .env.production não commitado ao git
- [ ] Permissões corretas nos arquivos

---

## 🚀 Deploy Commands (VPS)

```bash
# 1. Conectar ao VPS
ssh user@IP_DO_VPS

# 2. Clonar/Atualizar repositório
cd /var/www/oneverso.com.br
git pull origin main

# 3. Copiar .env.production (manualmente via scp ou editor)
nano .env.production

# 4. Instalar dependências
npm install

# 5. Build
npm run build

# 6. Migrar banco
npm run db:generate
npm run db:migrate

# 7. Deploy PM2
pm2 delete all || true
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# 8. Reiniciar Nginx
sudo systemctl restart nginx

# 9. Verificar
curl http://localhost:3000/health
```

---

## 🔧 Troubleshooting

### API não responde
```bash
pm2 logs mmn-api
tail -f logs/api-error.log
```

### Database connection failed
```bash
mysql -u mmn_user -p
SHOW DATABASES;
```

### Redis connection failed
```bash
redis-cli ping
sudo systemctl status redis
```

### Nginx 502 Bad Gateway
```bash
pm2 list
curl http://localhost:3000/health
sudo nginx -t
```

### SSL certificate expired
```bash
sudo certbot renew
sudo systemctl reload nginx
```

---

## 📊 Post-Deploy Metrics

| Métrica | Alvo | Atual |
|---------|------|-------|
| API Response Time | <200ms | |
| Frontend Load Time | <3s | |
| Error Rate | <1% | |
| Uptime | >99% | |

---

## 🔄 Rollback Procedure

```bash
# 1. Parar PM2
pm2 stop all

# 2. Restaurar backup
cd /var/www/oneverso.com.br
tar -xzf backups/backup_TIMESTAMP.tar.gz

# 3. Restaurar banco (se necessário)
mysql -u mmn_user -p mmn_ai < backup.sql

# 4. Reiniciar PM2
pm2 start ecosystem.config.js --env production

# 5. Verificar
curl http://localhost:3000/health
```

---

**Documento criado por:** MiniMax Agent
**Data:** 2026-05-25
**Versão:** 1.0