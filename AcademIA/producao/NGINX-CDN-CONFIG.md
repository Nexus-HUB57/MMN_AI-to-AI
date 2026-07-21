---
title: "Nginx + CDN Config · AcademIA"
description: "Configuração completa de nginx e CDN para servir a AcademIA em produção"
tags: [nginx, cdn, deploy, configuracao, academIA, producao]
categoria: operacao
nivel: Elite
autor: "Ravi (CTO/AI)"
date: 2026-07-17
status: oficial
---

# 🌐 Nginx + CDN Config · AcademIA

> Configuração completa de nginx e CloudFlare CDN para servir a AcademIA em produção.

## 🎯 Visão Geral da Infraestrutura

```
                    ┌─────────────────┐
                    │   CloudFlare    │
                    │   CDN + WAF     │
                    │   (edge global) │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │     Nginx       │
                    │  (reverse proxy)│
                    │   + static      │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
     ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐
     │  Web App    │  │  Static     │  │  API        │
     │  (Node.js)  │  │  /academia  │  │  (tRPC)     │
     │  port 3000  │  │  port 8080  │  │  port 4000  │
     └─────────────┘  └─────────────┘  └─────────────┘
```

## 📁 Estrutura de Diretórios

```
/var/www/academia/
├── hubs/                    # Hubs HTML estáticos
│   ├── index.html          # Hub principal
│   ├── cursos.html
│   ├── trilhas.html
│   ├── player.html
│   ├── apostilas.html
│   ├── tutoriais.html
│   ├── playbooks.html
│   ├── webinars.html
│   ├── lib.html
│   ├── lab.html
│   └── landing.html
│
├── videos/                  # Vídeos MP4
│   ├── video-00-boas-vindas.mp4
│   ├── video-01-entendendo-ioaid.mp4
│   └── ...
│
├── pdfs/                    # PDFs de apostilas
│   └── 01-*.pdf
│
├── ebooks/                  # Ebooks coletânea
│   └── ...
│
├── assets/                  # Imagens, capas
│   ├── ebook_covers/
│   ├── thumbnails/
│   └── personas/
│
└── cgi-bin/                 # Scripts (opcional)
    └── publish.py
```

## ⚙️ Nginx Config Principal

### `/etc/nginx/sites-available/academia`

```nginx
# ============================================
# AcademIA · Nexus Affil'IA'te
# Reverse proxy + static files
# ============================================

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=academia_general:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=academia_strict:10m rate=2r/s;

# Cache zone
proxy_cache_path /var/cache/nginx/academia
    levels=1:2
    keys_zone=academia_cache:10m
    max_size=1g
    inactive=60m
    use_temp_path=off;

# Upstream
upstream academia_web {
    server 127.0.0.1:3000;
    keepalive 32;
}

upstream academia_api {
    server 127.0.0.1:4000;
    keepalive 32;
}

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name oneverso.com.br academia.oneverso.com.br;
    return 301 https://$server_name$request_uri;
}

# HTTPS principal
server {
    listen 443 ssl http2;
    server_name oneverso.com.br academia.oneverso.com.br;

    # SSL (gerenciado pelo CloudFlare, esse é origin cert)
    ssl_certificate /etc/ssl/cloudflare/origin.pem;
    ssl_certificate_key /etc/ssl/cloudflare/origin.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com" always;

    # Logs
    access_log /var/log/nginx/academia.access.log;
    error_log /var/log/nginx/academia.error.log;

    # Limite geral de body (10MB para uploads)
    client_max_body_size 10M;

    # ============================================
    # ACADEMIA · HUBS ESTÁTICOS
    # ============================================

    location ~ ^/academia/hubs/(.+\.html)$ {
        alias /var/www/academia/hubs/$1;
        expires 5m;
        add_header Cache-Control "public, max-age=300";
        add_header X-Content-Type-Options "nosniff";
        try_files $uri =404;
    }

    location = /academia/ {
        return 302 /academia/hubs/index.html;
    }

    location = /academia {
        return 302 /academia/hubs/index.html;
    }

    location = /academia/landing {
        return 302 /academia/hubs/landing.html;
    }

    # ============================================
    # ACADEMIA · VÍDEOS (MP4)
    # ============================================

    location ~ ^/academia/videos/(.+\.mp4)$ {
        alias /var/www/academia/videos/$1;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header Accept-Ranges "bytes";
        add_header X-Content-Type-Options "nosniff";
        # Suporte a byte-range (essencial para streaming)
        try_files $uri =404;
    }

    # ============================================
    # ACADEMIA · PDFs
    # ============================================

    location ~ ^/academia/pdfs/(.+\.pdf)$ {
        alias /var/www/academia/pdfs/$1;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        add_header Content-Disposition "inline";
        try_files $uri =404;
    }

    # ============================================
    # ACADEMIA · ASSETS ESTÁTICOS
    # ============================================

    location ~ ^/academia/assets/(.+)$ {
        alias /var/www/academia/assets/$1;
        expires 30d;
        add_header Cache-Control "public, max-age=2592000";
        try_files $uri =404;
    }

    # ============================================
    # ACADEMIA · API (progresso, lições)
    # ============================================

    location /api/academia/ {
        limit_req zone=academia_strict burst=20 nodelay;

        proxy_pass http://academia_api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";

        # Timeouts
        proxy_connect_timeout 10s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # ============================================
    # ACADEMIA · PLAYER (rota dinâmica)
    # ============================================

    location ~ ^/academia/lesson/(.+)$ {
        proxy_pass http://academia_web/lesson/$1;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
    }

    # ============================================
    # ACADEMIA · ADMIN (autenticado)
    # ============================================

    location /admin/academia {
        limit_req zone=academia_strict burst=10 nodelay;

        proxy_pass http://academia_web;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
    }

    # ============================================
    # HEALTH CHECK
    # ============================================

    location = /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }

    # ============================================
    # FALLBACK
    # ============================================

    location / {
        proxy_pass http://academia_web;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";
        proxy_cache academia_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_bypass $http_cache_control;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

## ☁️ CloudFlare Config

### DNS Records

```
Tipo    Nome                    Conteúdo                              Proxy
A       oneverso.com.br         203.0.113.10 (server IP)              Sim
A       academia.oneverso.com.br 203.0.113.10                          Sim
CNAME   www                     oneverso.com.br                       Sim
```

### Page Rules

```
URL: oneverso.com.br/academia/*
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 1 month
  - Browser Cache TTL: 4 hours
  - Always Online: ON
  - Brotli: ON
  - Minify: HTML, CSS, JS
  - Security Level: Medium
  - Bot Fight Mode: ON
  - Browser Integrity Check: ON
  - Email Obfuscation: OFF (forms precisam)
```

### Cache Rules (new dashboard)

```
Rule 1: Cache Hubs HTML
  URL: oneverso.com.br/academia/hubs/*
  Action: Cache eligible, TTL 5min, Browser TTL 5min

Rule 2: Cache Vídeos por longo tempo
  URL: oneverso.com.br/academia/videos/*
  Action: Cache eligible, TTL 1 year, Browser TTL 1 year

Rule 3: Bypass cache para API
  URL: oneverso.com.br/api/academia/*
  Action: Bypass cache

Rule 4: Force HTTPS
  URL: oneverso.com.br/*
  Action: Always Use HTTPS
```

### WAF Rules (Web Application Firewall)

```
Rule 1: Bloquear user agents maliciosos
  Field: User Agent
  Operator: contains
  Value: bot|spider|crawler (exceto Google, Bing)
  Action: Block

Rule 2: Rate limit por IP (login/auth)
  URL: oneverso.com.br/api/auth/*
  Rate: 10 requests / 10 seconds / IP
  Action: Challenge

Rule 3: Proteger admin
  URL: oneverso.com.br/admin/*
  Geo: bloquear países não-BR
  Action: Challenge
  Exception: whitelist IPs conhecidos

Rule 4: SQL Injection protection
  Field: URI Path, Query String, Body
  Action: Managed WAF rule (CloudFlare default)
```

## 🔒 Certificados SSL

```bash
# 1. Origin certificate (servidor → CloudFlare)
# CloudFlare dashboard → SSL/TLS → Origin Server → Create Certificate
# Salvar em /etc/ssl/cloudflare/origin.pem e origin.key
chmod 600 /etc/ssl/cloudflare/origin.key

# 2. Edge certificate (CloudFlare → Internet)
# Automático via CloudFlare Universal SSL
# Forçar Full (Strict) no dashboard SSL/TLS

# 3. Renovar a cada 15 anos
```

## 🚀 Deploy Script

### `/opt/scripts/deploy-academia.sh`

```bash
#!/bin/bash
# Deploy da AcademIA para produção
# Uso: ./deploy-academia.sh [tag]

set -e

TAG=${1:-latest}
REMOTE="https://nexus-deploy@github.com/Nexus-HUB57/MMN_AI-to-AI.git"
APP_DIR="/var/www/academia"
BACKUP_DIR="/var/backups/academia-$(date +%Y%m%d-%H%M%S)"

echo "🚀 Deploy AcademIA · Tag: $TAG"

# 1. Backup
echo "📦 Backup..."
mkdir -p "$BACKUP_DIR"
cp -r "$APP_DIR/hubs" "$BACKUP_DIR/"
cp -r "$APP_DIR/videos" "$BACKUP_DIR/" 2>/dev/null || true
cp -r "$APP_DIR/pdfs" "$BACKUP_DIR/" 2>/dev/null || true

# 2. Clone fresh
echo "📥 Clone fresh from git..."
cd /tmp
rm -rf academia-deploy
git clone --depth 1 --branch "$TAG" "$REMOTE" academia-deploy

# 3. Copiar assets
echo "📂 Copy assets..."
cp -r academia-deploy/AcademIA/hubs/* "$APP_DIR/hubs/"
[ -d academia-deploy/AcademIA/videos ] && cp -rn academia-deploy/AcademIA/videos/* "$APP_DIR/videos/" 2>/dev/null || true
[ -d academia-deploy/AcademIA/pdfs ] && cp -rn academia-deploy/AcademIA/pdfs/* "$APP_DIR/pdfs/" 2>/dev/null || true
[ -d academia-deploy/AcademIA/assets ] && cp -rn academia-deploy/AcademIA/assets/* "$APP_DIR/assets/" 2>/dev/null || true

# 4. Set permissions
echo "🔐 Permissions..."
chown -R www-data:www-data "$APP_DIR"
chmod -R 755 "$APP_DIR"
chmod 644 "$APP_DIR"/hubs/*.html
chmod 644 "$APP_DIR"/hubs/*/*.html 2>/dev/null || true

# 5. Reload nginx
echo "🔄 Reload nginx..."
nginx -t && systemctl reload nginx

# 6. Clear cache
echo "🧹 Clear cache..."
rm -rf /var/cache/nginx/academia/* 2>/dev/null || true

# 7. Smoke test
echo "🧪 Smoke test..."
bash /var/www/academia/producao/scripts/smoke-test-academia.sh --env=prod
if [ $? -ne 0 ]; then
  echo "❌ SMOKE TEST FALHOU - rollback!"
  cp -r "$BACKUP_DIR"/* "$APP_DIR/"
  nginx -t && systemctl reload nginx
  exit 1
fi

echo "✅ Deploy OK"
echo "📊 Diff: $(du -sh $BACKUP_DIR $APP_DIR | tail -1)"
```

## 📊 Monitoramento

### Health Check Endpoint

```nginx
location = /health {
    access_log off;
    return 200 "OK\n";
    add_header Content-Type text/plain;
}
```

### Métricas Prometheus (opcional)

```nginx
# Expor métricas para Prometheus
location /metrics {
    stub_status;
    access_log off;
    allow 10.0.0.0/8;  # apenas internal
    deny all;
}
```

## 🧪 Teste Pós-Deploy

```bash
# 1. Verificar se tudo responde
for path in academia academia/hubs/index.html academia/hubs/trilhas.html academia/hubs/player.html academia/hubs/landing.html academia/videos/video-00-boas-vindas.mp4; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -I "https://oneverso.com.br/$path")
  echo "$path: $code"
done

# 2. Verificar headers de segurança
curl -I https://oneverso.com.br/academia | grep -iE "x-frame|x-content|content-security|strict-transport"

# 3. Verificar compressão
curl -H "Accept-Encoding: gzip" -I https://oneverso.com.br/academia/hubs/index.html

# 4. Verificar range request (streaming)
curl -I -H "Range: bytes=0-1023" https://oneverso.com.br/academia/videos/video-00-boas-vindas.mp4

# 5. Benchmark
ab -n 1000 -c 50 https://oneverso.com.br/academia/hubs/index.html
```

## 🆘 Rollback

```bash
# Listar backups disponíveis
ls /var/backups/ | grep academia

# Rollback para backup específico
BACKUP="academia-20260717-120000"
rm -rf /var/www/academia
cp -r "/var/backups/$BACKUP" /var/www/academia
systemctl reload nginx

# Smoke test
bash /var/www/academia/producao/scripts/smoke-test-academia.sh --env=prod
```

## 📚 Materiais Relacionados

- `producao/GO-LIVE-CHECKLIST.md` — antes do go-live
- `producao/STATUS.md` — dashboard em tempo real
- `producao/INCIDENT-RESPONSE-RUNBOOK.md` — resposta a incidentes
- `producao/scripts/smoke-test-academia.sh` — smoke test
- `Lib-Nexus/best-practices/03-seguranca-agentes.md` — segurança

---

*AcademIA · Nginx + CDN Config · 2026*