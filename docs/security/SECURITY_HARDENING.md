# 🔒 SECURITY HARDENING · Nexus Affil'IA'te

> Documento canônico do CTO Ravi para reduzir a superfície de ataque após o go-live. Cada item tem **estado alvo**, **comando**, e **verificação**.

## 1. SSH

### 1.1 Bloquear login por senha (root + qualquer user)
```bash
# /etc/ssh/sshd_config
PasswordAuthentication no
ChallengeResponseAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
PubkeyAuthentication yes
AuthenticationMethods publickey
```
Aplicar:
```bash
sshd -t && systemctl restart sshd
```
Verificar:
```bash
sshd -T | grep -E "^(passwordauth|permitroot|pubkeyauth)"
# esperado:
#   passwordauthentication no
#   permitrootlogin prohibit-password
#   pubkeyauthentication yes
```

### 1.2 Usuário dedicado de deploy
```bash
adduser --disabled-password nexusdeploy
install -d -m 700 -o nexusdeploy -g nexusdeploy /home/nexusdeploy/.ssh
# Cole a chave PÚBLICA do CI (do secret DEPLOY_SSH_PRIVATE_KEY) em:
nano /home/nexusdeploy/.ssh/authorized_keys
chown nexusdeploy:nexusdeploy /home/nexusdeploy/.ssh/authorized_keys
chmod 600 /home/nexusdeploy/.ssh/authorized_keys
```

### 1.3 Sudoers granular (sem root completo)
```bash
cat > /etc/sudoers.d/nexusdeploy <<'EOF'
nexusdeploy ALL=(ALL) NOPASSWD: /usr/bin/pm2, /usr/bin/psql, /bin/systemctl restart nexus-api, /bin/systemctl restart nginx
EOF
chmod 440 /etc/sudoers.d/nexusdeploy
visudo -c
```

### 1.4 Mudar porta (opcional, defesa em profundidade)
```bash
# /etc/ssh/sshd_config
Port 22022   # já está nessa porta
```

## 2. Firewall

### 2.1 UFW mínimo
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22022/tcp           # SSH
ufw allow 80/tcp              # HTTP (redirect to HTTPS via nginx)
ufw allow 443/tcp             # HTTPS
ufw enable
ufw status verbose
```

### 2.2 Postgres e Redis NUNCA expostos
```bash
# /etc/postgresql/14/main/postgresql.conf
listen_addresses = 'localhost'

# /etc/redis/redis.conf
bind 127.0.0.1 ::1
protected-mode yes
requirepass <senha-forte-no-secret>
```
Verificar:
```bash
ss -tlnp | grep -E ':5432|:6379'
# esperado: apenas 127.0.0.1
```

## 3. GitHub

### 3.1 Revogar tokens vazados (NOW)
- https://github.com/settings/tokens → revogar `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P`
- https://github.com/settings/security-log → revisar últimas 24 h.

### 3.2 PATs com escopo mínimo, vida curta
- Criar PAT novo com escopo SOMENTE `repo:status, public_repo, workflow` (sem `delete_repo`, sem `admin:org`).
- Validade ≤ 90 dias.
- Guardar em **GitHub Actions Secrets** (`DEPLOY_GH_TOKEN`), nunca em chat.

### 3.3 Branch protection na `main`
- https://github.com/Nexus-HUB57/MMN_AI-to-AI/settings/branches
- Require pull request reviews (≥1).
- Require status checks: `build-and-deploy`.
- Require linear history.
- Restrict who can push to matching branches.

### 3.4 Deploy Key dedicada para o servidor
- https://github.com/Nexus-HUB57/MMN_AI-to-AI/settings/keys
- Adicionar a chave PÚBLICA do servidor (gerada com `ssh-keygen -t ed25519 -C "nexusdeploy@prod"`).
- Marcar "Allow write access" só se necessário (preferível **somente leitura**, e push pelo CI).

## 4. Secrets em runtime

### 4.1 `.env` do backend com permissões trancadas
```bash
chown nexusdeploy:nexusdeploy /opt/nexus-affiliate/backend/.env
chmod 600 /opt/nexus-affiliate/backend/.env
```

### 4.2 Nunca logar segredos
- O serviço `nexusRagPgRepository.ts` usa `process.env.DATABASE_URL` mas **nunca** loga a URL completa.
- O script `ravi_deploy.sh` usa `mask()` para imprimir só o prefixo + tamanho.

## 5. Auditoria contínua

### 5.1 Logs de auth
```bash
# diário: rotação + retenção 90 dias
journalctl -u sshd --since "yesterday" | grep -E "Accepted|Failed"
last -n 50
```

### 5.2 Fail2ban
```bash
apt-get install -y fail2ban
cat > /etc/fail2ban/jail.local <<'EOF'
[sshd]
enabled = true
port = 22022
maxretry = 3
bantime = 1h
findtime = 10m
EOF
systemctl enable --now fail2ban
fail2ban-client status sshd
```

### 5.3 Monitoramento de integridade
```bash
apt-get install -y aide
aideinit
# crontab: aide --check diário, alertar mudanças em /etc, /opt/nexus-affiliate/backend
```

## 6. Checklist final pós-deploy

- [ ] `ssh root@host` falha (esperado).
- [ ] `ssh nexusdeploy@host` funciona com chave.
- [ ] `ufw status` mostra só 22022/80/443.
- [ ] `ss -tlnp` mostra Postgres/Redis só em `127.0.0.1`.
- [ ] Branch protection ativa em `main`.
- [ ] Token velho revogado, novo no Actions Secrets.
- [ ] `fail2ban-client status sshd` em `jail.local`.
- [ ] `.env` com 600/owner correto.
- [ ] `aide` baseline gerado.

---
**Princípio Ravi-CTO**: o sistema deve ser seguro mesmo se o CTO sair amanhã. Nada de credencial em pessoa, tudo em secret manager.
