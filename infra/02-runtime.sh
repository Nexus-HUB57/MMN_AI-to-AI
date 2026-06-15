#!/usr/bin/env bash
# =============================================================================
# 02-runtime.sh — Runtime Stack · VPS São Paulo · Nexus AfilIAte-AI
# Executa como usuário deploy (ou root). Instala Node 20 LTS, PM2, Nginx,
# MySQL 8, Redis 7, Certbot. Ubuntu 24.04 LTS.
# =============================================================================
set -euo pipefail

DEPLOY_DIR="/var/www/oneverso"
MYSQL_NEXUS_DB="nexus_prod"
MYSQL_NEXUS_USER="nexus_app"
MYSQL_NEXUS_PASS="${MYSQL_NEXUS_PASS:-TROCAR_SENHA_SEGURA}"  # export antes de rodar

echo ">>> [1/8] Node 20 LTS via nvm"
if ! command -v nvm &>/dev/null; then
  curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  # shellcheck source=/dev/null
  source "$NVM_DIR/nvm.sh"
fi
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
source "$NVM_DIR/nvm.sh"
nvm install 20
nvm alias default 20
nvm use 20
node --version
echo "  ✓ Node $(node --version)"

echo ">>> [2/8] PM2"
npm install -g pm2 --silent
pm2 startup systemd -u deploy --hp /home/deploy | tail -1 | bash || true
echo "  ✓ PM2 $(pm2 --version)"

echo ">>> [3/8] Nginx 1.24"
sudo apt-get install -y -qq nginx
sudo systemctl enable nginx --quiet
sudo systemctl start nginx
echo "  ✓ Nginx instalado"

echo ">>> [4/8] MySQL 8"
# Usar repositório oficial MySQL
if ! command -v mysql &>/dev/null; then
  wget -qO /tmp/mysql-apt.deb https://dev.mysql.com/get/mysql-apt-config_0.8.32-1_all.deb
  sudo DEBIAN_FRONTEND=noninteractive dpkg -i /tmp/mysql-apt.deb
  sudo apt-get update -qq
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq mysql-server
fi
sudo systemctl enable mysql --quiet
sudo systemctl start mysql

# Criar banco e usuário
sudo mysql -e "CREATE DATABASE IF NOT EXISTS \`$MYSQL_NEXUS_DB\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER IF NOT EXISTS '$MYSQL_NEXUS_USER'@'127.0.0.1' IDENTIFIED BY '$MYSQL_NEXUS_PASS';"
sudo mysql -e "GRANT ALL PRIVILEGES ON \`$MYSQL_NEXUS_DB\`.* TO '$MYSQL_NEXUS_USER'@'127.0.0.1';"
sudo mysql -e "FLUSH PRIVILEGES;"
echo "  ✓ MySQL 8: banco '$MYSQL_NEXUS_DB', usuário '$MYSQL_NEXUS_USER'"

echo ">>> [5/8] Redis 7"
sudo apt-get install -y -qq redis-server
REDIS_PASS="${REDIS_PASS:-TROCAR_REDIS_SENHA}"
sudo sed -i "s|^# requirepass .*|requirepass $REDIS_PASS|" /etc/redis/redis.conf
sudo sed -i "s|^bind .*|bind 127.0.0.1|" /etc/redis/redis.conf
sudo sed -i "s|^# maxmemory .*|maxmemory 512mb|" /etc/redis/redis.conf
sudo sed -i "s|^# maxmemory-policy .*|maxmemory-policy allkeys-lru|" /etc/redis/redis.conf
sudo systemctl enable redis-server --quiet
sudo systemctl restart redis-server
echo "  ✓ Redis 7 (bind 127.0.0.1, requirepass, maxmemory 512MB)"

echo ">>> [6/8] Certbot (TLS Let's Encrypt)"
sudo snap install --classic certbot 2>/dev/null || true
sudo ln -sf /snap/bin/certbot /usr/bin/certbot 2>/dev/null || true
echo "  ✓ Certbot instalado"

echo ">>> [7/8] Diretórios da aplicação"
sudo mkdir -p "$DEPLOY_DIR/public" "$DEPLOY_DIR/logs"
sudo chown -R deploy:deploy "$DEPLOY_DIR"
echo "  ✓ $DEPLOY_DIR pronto"

echo ">>> [8/8] pnpm (opcional)"
corepack enable 2>/dev/null || npm install -g pnpm --silent
echo "  ✓ pnpm $(pnpm --version 2>/dev/null || echo 'via corepack')"

echo
echo "============================================================"
echo "  ✅ Runtime instalado"
echo "  Próximos passos:"
echo "  1. Configurar Nginx: copiar config oneverso.com.br"
echo "  2. Clonar repo: cd $DEPLOY_DIR && git clone ..."
echo "  3. Criar backend/.env com DATABASE_URL, REDIS_URL, etc."
echo "  4. npm run build && pm2 start ecosystem.config.js"
echo "  5. certbot --nginx -d oneverso.com.br -d www.oneverso.com.br"
echo "============================================================"
