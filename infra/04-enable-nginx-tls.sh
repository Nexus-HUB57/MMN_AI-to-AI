#!/usr/bin/env bash
# =============================================================================
# 04-enable-nginx-tls.sh — instala server block e emite TLS via Certbot
# =============================================================================
set -euo pipefail

DOMAIN="${DOMAIN:-oneverso.com.br}"
WWW_DOMAIN="${WWW_DOMAIN:-www.oneverso.com.br}"
CONF_SRC="${CONF_SRC:-$(pwd)/infra/nginx/oneverso.com.br.conf}"
CONF_DST="/etc/nginx/sites-available/${DOMAIN}.conf"

sudo mkdir -p /var/www/oneverso/logs /var/www/oneverso/public
sudo cp "$CONF_SRC" "$CONF_DST"
sudo ln -sf "$CONF_DST" "/etc/nginx/sites-enabled/${DOMAIN}.conf"
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d "$DOMAIN" -d "$WWW_DOMAIN" --non-interactive --agree-tos -m "admin@${DOMAIN}" --redirect
sudo nginx -t
sudo systemctl reload nginx

echo "✅ Nginx e TLS ativos para ${DOMAIN}"
