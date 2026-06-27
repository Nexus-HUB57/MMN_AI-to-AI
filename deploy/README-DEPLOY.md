# Deploy manual da Academ'IA no VPS

## Pré-requisitos

- Acesso SSH ao VPS `143.95.213.237:22022` como `root` ou `deploy`
- Diretório da aplicação em `/var/www/oneverso/current`
- PM2 já configurado (mmn-api + workers)

## Passos

```bash
# 1. Transferir o pacote para o VPS
scp -P 22022 deploy/academia-update.tar.gz deploy/deploy-on-vps.sh \
    root@143.95.213.237:/tmp/

# 2. Conectar ao VPS
ssh -p 22022 root@143.95.213.237

# 3. Executar o deploy
chmod +x /tmp/deploy-on-vps.sh
bash /tmp/deploy-on-vps.sh /tmp/academia-update.tar.gz
```

## Rollback

```bash
cd /var/www/oneverso/current
tar xzf /var/www/oneverso/backups/pre-academia-<TIMESTAMP>.tar.gz
pm2 restart mmn-api
```

## Validação pós-deploy

- https://oneverso.com.br/api/health
- https://oneverso.com.br/academia
- https://oneverso.com.br/admin/academia
- https://oneverso.com.br/admin/meetings
