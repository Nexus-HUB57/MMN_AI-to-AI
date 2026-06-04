#!/usr/bin/env bash
# =============================================================================
# 01-hardening.sh — VPS São Paulo 143.95.213.237 · Nexus AfilIAte-AI
# Executa como root. Cria usuário deploy, configura SSH/UFW/Fail2ban/Swap.
# Testado em Ubuntu 24.04 LTS.
# =============================================================================
set -euo pipefail

DEPLOY_USER="deploy"
SSH_PORT="22022"
SWAP_SIZE_GB=2

echo ">>> [1/9] Atualização do sistema"
apt-get update -qq && apt-get upgrade -y -qq

echo ">>> [2/9] Criar usuário $DEPLOY_USER"
if ! id "$DEPLOY_USER" &>/dev/null; then
  adduser --disabled-password --gecos "" "$DEPLOY_USER"
fi
usermod -aG sudo "$DEPLOY_USER"
mkdir -p /home/$DEPLOY_USER/.ssh
cp /root/.ssh/authorized_keys /home/$DEPLOY_USER/.ssh/authorized_keys 2>/dev/null || true
chmod 700 /home/$DEPLOY_USER/.ssh
chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys
chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
echo "$DEPLOY_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$DEPLOY_USER
chmod 440 /etc/sudoers.d/$DEPLOY_USER
echo "  ✓ Usuário $DEPLOY_USER criado"

echo ">>> [3/9] Hardening SSH (porta $SSH_PORT)"
SSHD_CONF="/etc/ssh/sshd_config"
cp "$SSHD_CONF" "${SSHD_CONF}.bak.$(date +%Y%m%d%H%M%S)"
sed -i "s|^#*Port .*|Port $SSH_PORT|"                       "$SSHD_CONF"
sed -i "s|^#*PermitRootLogin .*|PermitRootLogin no|"        "$SSHD_CONF"
sed -i "s|^#*PasswordAuthentication .*|PasswordAuthentication no|" "$SSHD_CONF"
sed -i "s|^#*PubkeyAuthentication .*|PubkeyAuthentication yes|"    "$SSHD_CONF"
grep -q "^AllowUsers" "$SSHD_CONF" \
  && sed -i "s|^AllowUsers.*|AllowUsers $DEPLOY_USER|" "$SSHD_CONF" \
  || echo "AllowUsers $DEPLOY_USER" >> "$SSHD_CONF"
systemctl restart ssh
echo "  ✓ SSH reconfigurado na porta $SSH_PORT — ATENÇÃO: abra uma nova conexão antes de fechar esta!"

echo ">>> [4/9] UFW Firewall"
apt-get install -y -qq ufw
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow "$SSH_PORT/tcp" comment 'SSH Nexus'
ufw allow 80/tcp   comment 'HTTP'
ufw allow 443/tcp  comment 'HTTPS'
ufw --force enable
echo "  ✓ UFW ativo: SSH $SSH_PORT, 80, 443"

echo ">>> [5/9] Fail2ban"
apt-get install -y -qq fail2ban
cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime  = 3600
findtime = 600
maxretry = 3

[sshd]
enabled  = true
port     = $SSH_PORT
logpath  = %(sshd_log)s
backend  = %(sshd_backend)s
EOF
systemctl enable fail2ban --quiet
systemctl restart fail2ban
echo "  ✓ Fail2ban ativo (maxretry=3, bantime=1h)"

echo ">>> [6/9] Swap ${SWAP_SIZE_GB}GB"
if ! swapon --show | grep -q /swapfile; then
  fallocate -l "${SWAP_SIZE_GB}G" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
# Parâmetros de performance
echo "vm.swappiness=10" >> /etc/sysctl.conf
echo "vm.vfs_cache_pressure=50" >> /etc/sysctl.conf
sysctl -p &>/dev/null
echo "  ✓ Swap ${SWAP_SIZE_GB}GB ativo"

echo ">>> [7/9] Timezone São Paulo"
timedatectl set-timezone America/Sao_Paulo
echo "  ✓ Timezone: $(timedatectl show --property=Timezone --value)"

echo ">>> [8/9] Limites de arquivo para Node.js"
cat > /etc/security/limits.d/99-node.conf <<EOF
$DEPLOY_USER soft nofile 65536
$DEPLOY_USER hard nofile 65536
EOF
grep -q 'session required pam_limits.so' /etc/pam.d/common-session \
  || echo 'session required pam_limits.so' >> /etc/pam.d/common-session
echo "  ✓ nofile=65536 para $DEPLOY_USER"

echo ">>> [9/9] Unattended-upgrades (patches de segurança automáticos)"
apt-get install -y -qq unattended-upgrades
systemctl enable unattended-upgrades --quiet
echo "  ✓ Patches de segurança automáticos habilitados"

echo
echo "============================================================"
echo "  ✅ Hardening concluído — VPS 143.95.213.237"
echo "  ⚠️  Abra uma nova sessão SSH na porta $SSH_PORT com usuário $DEPLOY_USER"
echo "      antes de fechar esta conexão root."
echo "  Próximo passo: ./02-runtime.sh"
echo "============================================================"
